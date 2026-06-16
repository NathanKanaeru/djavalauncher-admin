# API Key Authentication System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a complete API key system: edge middleware pre-filter, key generation/validation library, HOF route wrapper, admin management UI, and full nav integration.

**Architecture:** 3-layer defense: edge middleware (header presence) → route HOF wrapper (hash verification + expiry/revocation checks). Keys stored SHA-256 hashed in AppData. Admin UI at `/admin/api-keys` for full lifecycle management.

**Tech Stack:** Next.js 15 App Router, Web Crypto API (SHA-256), TypeScript, Tailwind CSS, Lucide icons

---

### Task 1: Add ApiKey Type to AppData

**Files:**
- Modify: `lib/types.ts`
- Modify: `app/api/admin/data/route.ts`

- [ ] **Step 1: Add ApiKey interface + apiKeys to AppData**

In `lib/types.ts`, add before `AppData`:

```typescript
export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  keyHash: string;
  createdAt: string;
  expiresAt: string | null;
  revoked: boolean;
  lastUsedAt: string | null;
}
```

Add to `AppData`:
```typescript
  apiKeys: ApiKey[];
```

Add to `defaultAppData()`:
```typescript
    apiKeys: [],
```

- [ ] **Step 2: Persist apiKeys in PUT route**

In `app/api/admin/data/route.ts`, add to the `updated` object:
```typescript
      apiKeys: body.apiKeys ?? current.apiKeys ?? [],
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds

---

### Task 2: Create lib/api-key.ts (Core Utilities)

**Files:**
- Create: `lib/api-key.ts`

- [ ] **Step 1: Write the complete utility file**

```typescript
import { NextRequest } from "next/server";
import { ApiKey } from "./types";

export async function hashApiKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function generateApiKey(): { plaintext: string; prefix: string; hash: string } {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const plaintext = `dk_${hex}`;
  return {
    plaintext,
    prefix: plaintext.slice(0, 10),
    hash: "", // computed asynchronously below
  };
}

export async function createApiKey(name: string, expiresAt: string | null): Promise<{
  id: string;
  name: string;
  keyPrefix: string;
  keyHash: string;
  createdAt: string;
  expiresAt: string | null;
  revoked: boolean;
  lastUsedAt: null;
  plaintext: string;
}> {
  const { plaintext, prefix } = generateApiKey();
  const hash = await hashApiKey(plaintext);
  return {
    id: crypto.randomUUID(),
    name,
    keyPrefix: prefix,
    keyHash: hash,
    createdAt: new Date().toISOString(),
    expiresAt,
    revoked: false,
    lastUsedAt: null,
    plaintext,
  };
}

export async function validateApiKey(
  req: NextRequest,
  apiKeys: ApiKey[]
): Promise<boolean> {
  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) return false;

  const token = auth.slice(7).trim();
  if (!token || !token.startsWith("dk_")) return false;

  const hash = await hashApiKey(token);
  const key = apiKeys.find((k) => k.keyHash === hash);

  if (!key) return false;
  if (key.revoked) return false;
  if (key.expiresAt && new Date(key.expiresAt) <= new Date()) return false;

  return true;
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

---

### Task 3: Create lib/with-api-key.ts (HOF Wrapper)

**Files:**
- Create: `lib/with-api-key.ts`

- [ ] **Step 1: Write the HOF wrapper**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { loadData, saveData } from "./store";
import { validateApiKey } from "./api-key";

type RouteHandler = (req: NextRequest) => Promise<NextResponse>;

export function withApiKey(handler: RouteHandler): RouteHandler {
  return async (req: NextRequest) => {
    const data = await loadData();
    const valid = await validateApiKey(req, data.apiKeys ?? []);

    if (!valid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const auth = req.headers.get("authorization")!;
    const token = auth.slice(7).trim();
    const { hashApiKey } = await import("./api-key");
    const hash = await hashApiKey(token);
    const keyIndex = (data.apiKeys ?? []).findIndex((k) => k.keyHash === hash);
    if (keyIndex !== -1) {
      data.apiKeys![keyIndex].lastUsedAt = new Date().toISOString();
      saveData(data).catch(() => {});
    }

    return handler(req);
  };
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

---

### Task 4: Create Edge Middleware

**Files:**
- Create: `middleware.ts`

- [ ] **Step 1: Write the middleware**

```typescript
import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  const isPublicApi =
    pathname.startsWith("/api/") &&
    !pathname.startsWith("/api/admin/") &&
    pathname !== "/api/docs";

  if (isPublicApi) {
    const auth = req.headers.get("authorization");
    if (!auth || !auth.startsWith("Bearer ")) {
      return NextResponse.json({ error: "API key required" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

---

### Task 5: Apply withApiKey to All Public Endpoints

**Files:**
- Modify: `app/api/version_control/route.ts`
- Modify: `app/api/announcements/route.ts`
- Modify: `app/api/hosted/route.ts`
- Modify: `app/api/download_sources/route.ts`
- Modify: `app/api/changelogs/route.ts`

- [ ] **Step 1: Wrap version_control**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { loadData } from "@/lib/store";
import { withApiKey } from "@/lib/with-api-key";

async function handler(_req: NextRequest) {
  const data = await loadData();
  return NextResponse.json(data.version);
}

export const GET = withApiKey(handler);
```

- [ ] **Step 2: Wrap announcements**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { loadData } from "@/lib/store";
import { Announcement } from "@/lib/types";
import { withApiKey } from "@/lib/with-api-key";

async function handler(_req: NextRequest) {
  const data = await loadData();
  const announcements: Omit<Announcement, "id">[] = data.announcements.map(
    ({ id: _id, ...rest }) => rest
  );
  return NextResponse.json(announcements);
}

export const GET = withApiKey(handler);
```

- [ ] **Step 3: Wrap hosted**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { loadData } from "@/lib/store";
import { HostedServer } from "@/lib/types";
import { withApiKey } from "@/lib/with-api-key";

async function handler(_req: NextRequest) {
  const data = await loadData();
  const servers: Omit<HostedServer, "id">[] = data.hostedServers.map(
    ({ id: _id, ...rest }) => rest
  );
  return NextResponse.json(servers);
}

export const GET = withApiKey(handler);
```

- [ ] **Step 4: Wrap download_sources**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { loadData } from "@/lib/store";
import { withApiKey } from "@/lib/with-api-key";

async function handler(_req: NextRequest) {
  const data = await loadData();
  return NextResponse.json({
    sources: [
      { name: "GitHub Release", url: data.gameDataSources.github, tag: "Recommended" },
      { name: "Pixeldrain", url: data.gameDataSources.pixeldrain, tag: "Cepat" },
      { name: "Dropbox", url: data.gameDataSources.dropbox, tag: "Cepat" },
    ],
  });
}

export const GET = withApiKey(handler);
```

- [ ] **Step 5: Wrap changelogs**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { loadData } from "@/lib/store";
import { withApiKey } from "@/lib/with-api-key";

async function handler(_req: NextRequest) {
  const data = await loadData();

  const entries: { versionCode: number; versionName: string; changeLog: string; publishedAt: string }[] = [];

  if (data.version) {
    entries.push({
      versionCode: data.version.latestVersionCode,
      versionName: data.version.latestVersion,
      changeLog: data.version.changeLog,
      publishedAt: data.lastUpdatedAt ?? new Date().toISOString(),
    });
  }

  if (data.versionHistory) {
    for (const h of data.versionHistory) {
      entries.push({
        versionCode: h.versionCode,
        versionName: h.versionName,
        changeLog: h.changeLog,
        publishedAt: h.archivedAt,
      });
    }
  }

  entries.sort((a, b) => b.versionCode - a.versionCode);

  return NextResponse.json(entries);
}

export const GET = withApiKey(handler);
```

- [ ] **Step 6: Verify build**

Run: `npm run build`
Expected: Build succeeds

---

### Task 6: Create Admin API Keys Page

**Files:**
- Create: `app/admin/api-keys/page.tsx`

- [ ] **Step 1: Write the API Keys admin page**

Full page with: stats header, table of keys, create modal, post-create key reveal dialog, revoke/delete actions, empty state.

```typescript
"use client";

import { useEffect, useState, useCallback } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  Key,
  Plus,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  XCircle,
  ShieldCheck,
  ShieldX,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { ApiKey } from "@/lib/types";

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyExpiry, setNewKeyExpiry] = useState("");
  const [creating, setCreating] = useState(false);
  const [revealedKey, setRevealedKey] = useState<{ plaintext: string; name: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const loadKeys = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/data");
      const data = await res.json();
      setKeys(data.apiKeys || []);
    } catch {
      toast.error("Failed to load API keys");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadKeys(); }, [loadKeys]);

  async function saveKeys(updatedKeys: ApiKey[]) {
    try {
      const current = await fetch("/api/admin/data").then((r) => r.json());
      current.apiKeys = updatedKeys;
      const res = await fetch("/api/admin/data", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(current),
      });
      if (!res.ok) throw new Error("Save failed");
      setKeys(updatedKeys);
      return true;
    } catch {
      toast.error("Failed to save changes");
      return false;
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/admin/data");
      const current = await res.json();
      const keyRes = await fetch("/api/admin/api-keys/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newKeyName.trim(),
          expiresAt: newKeyExpiry || null,
        }),
      });
      const { key, plaintext } = await keyRes.json();
      current.apiKeys = [...(current.apiKeys || []), key];
      const saveRes = await fetch("/api/admin/data", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(current),
      });
      if (saveRes.ok) {
        setKeys(current.apiKeys);
        setRevealedKey({ plaintext, name: key.name });
        setNewKeyName("");
        setNewKeyExpiry("");
        setShowCreate(false);
      } else {
        toast.error("Failed to save key");
      }
    } catch {
      toast.error("Failed to create key");
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke(keyId: string) {
    const updated = keys.map((k) =>
      k.id === keyId ? { ...k, revoked: !k.revoked } : k
    );
    const ok = await saveKeys(updated);
    if (ok) toast.success("Key updated");
  }

  async function handleDelete(keyId: string) {
    const updated = keys.filter((k) => k.id !== keyId);
    const ok = await saveKeys(updated);
    if (ok) {
      toast.success("Key deleted");
      setConfirmDelete(null);
    }
  }

  function getStatus(key: ApiKey): { label: string; color: string } {
    if (key.revoked) return { label: "Revoked", color: "text-error bg-error-soft" };
    if (key.expiresAt && new Date(key.expiresAt) <= new Date()) return { label: "Expired", color: "text-warning bg-warning-soft" };
    return { label: "Active", color: "text-emerald-400 bg-emerald-400/10" };
  }

  const activeCount = keys.filter((k) => !k.revoked && (!k.expiresAt || new Date(k.expiresAt) > new Date())).length;
  const expiredCount = keys.filter((k) => !k.revoked && k.expiresAt && new Date(k.expiresAt) <= new Date()).length;
  const revokedCount = keys.filter((k) => k.revoked).length;

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="w-[200px] h-[16px] bg-surface-raised rounded-sm animate-skeleton mb-lg" />
        <div className="flex gap-md mb-lg">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-md flex-1">
              <div className="w-[60px] h-[24px] bg-surface-raised rounded-sm animate-skeleton mb-xs" />
              <div className="w-[30px] h-[28px] bg-surface-raised rounded-sm animate-skeleton" />
            </div>
          ))}
        </div>
        <div className="card p-lg">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-sm mb-md">
              <div className="flex-1 h-[40px] bg-surface-raised rounded-sm animate-skeleton" />
              <div className="w-[80px] h-[40px] bg-surface-raised rounded-sm animate-skeleton" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-[960px]">
      <Toaster position="top-center" toastOptions={{ style: { background: "#111", color: "#ededed", border: "1px solid #222" } }} />

      {/* Page Header */}
      <div className="flex items-center justify-between mb-lg">
        <div>
          <h1 className="text-display text-ink m-0 flex items-center gap-sm">
            <Key size={28} className="text-accent" />
            API Keys
          </h1>
          <p className="text-body text-mute mt-xxs">Manage API keys for accessing public endpoints</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-xs">
          <Plus size={16} />
          Create Key
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-md mb-lg">
        <div className="card p-md flex items-center gap-sm">
          <ShieldCheck size={20} className="text-emerald-400" />
          <div>
            <div className="text-display text-ink">{activeCount}</div>
            <div className="text-caption text-mute">Active</div>
          </div>
        </div>
        <div className="card p-md flex items-center gap-sm">
          <Clock size={20} className="text-warning" />
          <div>
            <div className="text-display text-ink">{expiredCount}</div>
            <div className="text-caption text-mute">Expired</div>
          </div>
        </div>
        <div className="card p-md flex items-center gap-sm">
          <ShieldX size={20} className="text-error" />
          <div>
            <div className="text-display text-ink">{revokedCount}</div>
            <div className="text-caption text-mute">Revoked</div>
          </div>
        </div>
      </div>

      {/* Key List */}
      {keys.length === 0 ? (
        <div className="card p-lg">
          <div className="flex flex-col items-center justify-center py-xl text-mute">
            <Key size={40} className="mb-sm opacity-40" />
            <p className="text-body-strong text-ink mb-xxs">No API keys yet</p>
            <p className="text-caption mb-md">Create your first API key to enable endpoint access</p>
            <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-xs">
              <Plus size={16} />
              Create Key
            </button>
          </div>
        </div>
      ) : (
        <div className="card overflow-hidden">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-[1fr_100px_100px_120px_120px_100px] gap-sm px-lg py-sm text-caption text-mute border-b border-hairline bg-surface-raised/30">
            <span>Name</span>
            <span>Key Prefix</span>
            <span>Status</span>
            <span>Created</span>
            <span>Expires</span>
            <span className="text-right">Actions</span>
          </div>

          {/* Table Rows */}
          {keys.map((key) => {
            const status = getStatus(key);
            return (
              <div key={key.id} className="grid grid-cols-1 md:grid-cols-[1fr_100px_100px_120px_120px_100px] gap-xxs md:gap-sm px-lg py-sm border-b border-hairline last:border-b-0 items-center hover:bg-surface-raised/30 transition-colors">
                <div>
                  <div className="text-body-strong text-ink">{key.name}</div>
                  <div className="md:hidden text-caption text-mute">ID: {key.id.slice(0, 8)}...</div>
                </div>
                <div>
                  <code className="text-caption-mono text-mute bg-surface-raised px-xs py-xxs rounded-xs">{key.keyPrefix}...</code>
                </div>
                <div>
                  <span className={`badge ${status.color}`}>{status.label}</span>
                </div>
                <div className="text-caption text-mute">
                  {new Date(key.createdAt).toLocaleDateString()}
                </div>
                <div className="text-caption text-mute">
                  {key.expiresAt ? new Date(key.expiresAt).toLocaleDateString() : "\u2014"}
                </div>
                <div className="flex items-center justify-end gap-xs">
                  <button
                    onClick={() => handleRevoke(key.id)}
                    className={`btn-ghost p-xs ${key.revoked ? "text-emerald-400" : "text-warning"}`}
                    title={key.revoked ? "Unrevoke" : "Revoke"}
                  >
                    {key.revoked ? <ShieldCheck size={16} /> : <ShieldX size={16} />}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(key.id)}
                    className="btn-ghost p-xs text-error"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Delete confirmation inline */}
                {confirmDelete === key.id && (
                  <div className="md:col-span-6 flex items-center gap-sm p-sm bg-error-soft/30 rounded-md border border-error/20">
                    <AlertTriangle size={16} className="text-error flex-shrink-0" />
                    <span className="text-caption text-body flex-1">Delete &ldquo;{key.name}&rdquo; permanently?</span>
                    <button onClick={() => handleDelete(key.id)} className="btn-primary bg-error hover:bg-red-700 text-caption py-xxs">
                      Delete
                    </button>
                    <button onClick={() => setConfirmDelete(null)} className="btn-ghost text-caption py-xxs">
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md" onClick={() => setShowCreate(false)}>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative card-accent p-lg w-full max-w-[440px] animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-heading text-ink m-0 mb-md">Create API Key</h2>
            <form onSubmit={handleCreate}>
              <div className="mb-md">
                <label className="label">Key Name</label>
                <input
                  type="text"
                  className="input w-full"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g. Production Mobile App"
                  required
                  autoFocus
                />
                <p className="text-caption text-mute mt-xxs">A descriptive name to identify this key</p>
              </div>
              <div className="mb-lg">
                <label className="label">Expiry Date (optional)</label>
                <input
                  type="date"
                  className="input w-full"
                  value={newKeyExpiry}
                  onChange={(e) => setNewKeyExpiry(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
                <p className="text-caption text-mute mt-xxs">Leave empty for no expiration</p>
              </div>
              <div className="flex items-center justify-end gap-sm">
                <button type="button" onClick={() => setShowCreate(false)} className="btn-ghost">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex items-center gap-xs" disabled={creating || !newKeyName.trim()}>
                  <Key size={16} />
                  {creating ? "Creating..." : "Generate Key"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Key Reveal Dialog */}
      {revealedKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md" onClick={() => setRevealedKey(null)}>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative card-accent p-lg w-full max-w-[520px] animate-scale-in border border-warning/30" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-sm mb-sm">
              <AlertTriangle size={20} className="text-warning" />
              <h2 className="text-heading text-ink m-0">Key Created</h2>
            </div>
            <p className="text-body text-mute mb-sm">
              Copy this key now. <strong className="text-warning">You won&rsquo;t be able to see it again.</strong>
            </p>
            <div className="p-md rounded-md bg-[#050505] border border-hairline mb-md">
              <div className="flex items-center justify-between mb-xs">
                <span className="text-caption text-mute">{revealedKey.name}</span>
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(revealedKey.plaintext);
                    setCopied(true);
                    toast.success("Key copied to clipboard");
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="btn-ghost flex items-center gap-xs text-caption"
                >
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <code className="text-caption-mono text-ink break-all select-all">{revealedKey.plaintext}</code>
            </div>
            <button
              onClick={() => setRevealedKey(null)}
              className="btn-primary w-full"
            >
              I&rsquo;ve saved the key
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

---

### Task 7: Add Key Generation API Endpoint

**Files:**
- Create: `app/api/admin/api-keys/generate/route.ts`

- [ ] **Step 1: Write the generate endpoint**

This endpoint creates the key server-side and returns both the stored key object and the plaintext. This avoids exposing the key generation logic or the plaintext key in the client code.

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createApiKey } from "@/lib/api-key";

export async function POST(req: NextRequest) {
  try {
    const { name, expiresAt } = await req.json();
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const result = await createApiKey(name.trim(), expiresAt || null);

    return NextResponse.json({
      key: {
        id: result.id,
        name: result.name,
        keyPrefix: result.keyPrefix,
        keyHash: result.keyHash,
        createdAt: result.createdAt,
        expiresAt: result.expiresAt,
        revoked: result.revoked,
        lastUsedAt: result.lastUsedAt,
      },
      plaintext: result.plaintext,
    });
  } catch {
    return NextResponse.json({ error: "Failed to generate key" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

---

### Task 8: Update Nav Components

**Files:**
- Modify: `components/sidebar.tsx`
- Modify: `components/bottom-nav.tsx`
- Modify: `components/header.tsx`

- [ ] **Step 1: Add API Keys to sidebar nav**

In `components/sidebar.tsx`, add `Key` to imports from lucide-react:

```typescript
import {
  LayoutDashboard,
  RefreshCw,
  Megaphone,
  Server,
  Database,
  BookOpen,
  PanelLeftClose,
  PanelLeftOpen,
  Key,
} from "lucide-react";
```

Add nav item after "API Docs":
```typescript
  { label: "API Keys", href: "/admin/api-keys", icon: Key },
```

- [ ] **Step 2: Add API Keys to bottom nav**

In `components/bottom-nav.tsx`, add `Key` to imports:

```typescript
import {
  LayoutDashboard,
  RefreshCw,
  Megaphone,
  Server,
  Database,
  BookOpen,
  Key,
} from "lucide-react";
```

Add nav item after "API Docs":
```typescript
  { label: "API Keys", href: "/admin/api-keys", icon: Key },
```

- [ ] **Step 3: Add API Keys to header breadcrumbs**

In `components/header.tsx`, add `Key` to imports:

```typescript
import {
  LayoutDashboard,
  RefreshCw,
  Megaphone,
  Server,
  Database,
  BookOpen,
  ChevronRight,
  LogOut,
  Key,
} from "lucide-react";
```

Add breadcrumb entry:
```typescript
  "/admin/api-keys": { label: "API Keys", icon: Key },
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: Build succeeds

---

### Task 9: Update OpenAPI Docs

**Files:**
- Modify: `app/api/docs/route.ts`

- [ ] **Step 1: Add apiKey security scheme to OpenAPI spec**

In the `components.securitySchemes` section, add (if not already there):

```typescript
      apiKey: {
        type: "apiKey",
        in: "header",
        name: "Authorization",
        description: "API key authentication. Prefix the key with 'Bearer '. Example: 'Bearer dk_...'",
      },
```

Add `security` to all public endpoint path definitions:

```typescript
        security: [{ apiKey: [] }],
```

For each: `/api/version_control`, `/api/changelogs`, `/api/announcements`, `/api/hosted`, `/api/download_sources`.

Add a note in the API description about API key auth.

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

---

### Task 10: Final Verification

- [ ] **Step 1: Run full build**

Run: `npm run build`
Expected: Build succeeds with no errors

- [ ] **Step 2: Verify all routes appear**

Check that `/api/admin/api-keys/generate` and `/admin/api-keys` appear in the build output.
