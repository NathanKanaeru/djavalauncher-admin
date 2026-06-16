# Servers Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this task-by-task.

**Goal:** Restructure servers system: single Official server (auto-fetch via sampquery) + multiple Featured/Partner servers, with dedicated API endpoints.

**Architecture:** New `lib/server-query.ts` wraps `samp-query` library (callback → Promise). `POST /api/admin/server-query` accepts IP:port and returns SA-MP server details. Two new public API endpoints replace `/api/hosted`. Admin UI split into Official (single card) + Featured (data table) sections.

**Tech Stack:** Next.js 15 App Router, TypeScript, `samp-query` (UDP via Node.js `dgram`), Tailwind CSS

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `lib/types.ts` | Modify | Add `ServerEntry` type, update `AppData`, `defaultAppData()` |
| `lib/server-query.ts` | Create | Promisified wrapper around `samp-query` callback API |
| `lib/store.ts` | Modify | Update `defaultAppData()` import/usage (auto via types) |
| `app/api/admin/server-query/route.ts` | Create | POST endpoint — accepts `{ ip, port }`, returns server details |
| `app/api/admin/data/route.ts` | Modify | GET/PUT handle `officialServer` + `featuredServers` fields |
| `app/api/servers/official/route.ts` | Create | GET public endpoint for official server |
| `app/api/servers/featured/route.ts` | Create | GET public endpoint for featured list |
| `app/api/hosted/route.ts` | Delete | Replaced by `/api/servers/featured` |
| `app/admin/servers/page.tsx` | Rewrite | Official + Featured UI with sampquery auto-fetch |
| `app/admin/page.tsx` | Modify | Update stat card "Hosted Servers" → "Featured Servers", fix API endpoint list |
| `app/admin/api-docs/page.tsx` | Modify | Update mock response example |
| `app/api/docs/route.ts` | Modify | Add new endpoints, remove `/api/hosted` |

### Task 1: Install samp-query, Update Types, Create server-query lib

**Files:**
- Modify: `lib/types.ts`
- Create: `lib/server-query.ts`
- Modify: `package.json` (via npm install)

- [ ] **Step 1: Install samp-query**

```bash
npm install samp-query
```

- [ ] **Step 2: Update `lib/types.ts`**

Replace `HostedServer` interface with `ServerEntry`, update `AppData`:

```typescript
export interface ServerEntry {
  id?: string;
  ip: string;
  port: number;
  hostname: string;
  players: number;
  maxplayers: number;
  mode: string;
  language: string;
}
```

In `AppData`, replace `hostedServers: HostedServer[]` with:
```typescript
  officialServer: ServerEntry | null;
  featuredServers: ServerEntry[];
```

In `defaultAppData()`:
```typescript
  officialServer: null,
  featuredServers: [],
```

Remove the old `HostedServer` interface entirely.

- [ ] **Step 3: Create `lib/server-query.ts`**

```typescript
import { ServerEntry } from "./types";

interface QueryResult {
  address: string;
  hostname: string;
  gamemode: string;
  mapname: string;
  passworded: boolean;
  maxplayers: number;
  online: number;
  rules: Record<string, string | boolean | number>;
  players: Array<{ id: number; name: string; score: number; ping: number }>;
}

export async function queryServer(
  ip: string,
  port: number
): Promise<Omit<ServerEntry, "id">> {
  const sampQuery = require("samp-query");

  const result: QueryResult = await new Promise((resolve, reject) => {
    sampQuery(
      { host: ip, port, timeout: 5000 },
      (err: Error | null, data: QueryResult) => {
        if (err) reject(err);
        else resolve(data);
      }
    );
  });

  return {
    ip,
    port,
    hostname: result.hostname || "",
    players: result.online || 0,
    maxplayers: result.maxplayers || 0,
    mode: result.gamemode || "",
    language: "",
  };
}
```

### Task 2: Create Admin Server-Query Endpoint

**Files:**
- Create: `app/api/admin/server-query/route.ts`

- [ ] **Step 1: Create the POST endpoint**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { queryServer } from "@/lib/server-query";

async function checkAuth(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get("session")?.value;
  if (!token) return false;
  const payload = await verifyToken(token);
  return payload !== null;
}

export async function POST(req: NextRequest) {
  if (!(await checkAuth(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { ip, port } = await req.json();
    if (!ip || !port) {
      return NextResponse.json({ error: "IP and port required" }, { status: 400 });
    }

    const details = await queryServer(ip, port);
    return NextResponse.json(details);
  } catch {
    return NextResponse.json(
      { error: "Server unreachable or query timed out" },
      { status: 400 }
    );
  }
}
```

### Task 3: Create Public API Endpoints + Update Admin Data Route

**Files:**
- Create: `app/api/servers/official/route.ts`
- Create: `app/api/servers/featured/route.ts`
- Delete: `app/api/hosted/route.ts`
- Modify: `app/api/admin/data/route.ts`

- [ ] **Step 1: Create `app/api/servers/official/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { loadData } from "@/lib/store";
import { withApiKey } from "@/lib/with-api-key";

async function handler(_req: NextRequest) {
  const data = await loadData();
  if (!data.officialServer) {
    return NextResponse.json(null);
  }
  const { id: _id, ...rest } = data.officialServer;
  return NextResponse.json(rest);
}

export const GET = withApiKey(handler);
```

- [ ] **Step 2: Create `app/api/servers/featured/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { loadData } from "@/lib/store";
import { ServerEntry } from "@/lib/types";
import { withApiKey } from "@/lib/with-api-key";

async function handler(_req: NextRequest) {
  const data = await loadData();
  const servers: Omit<ServerEntry, "id">[] = (data.featuredServers || []).map(
    ({ id: _id, ...rest }) => rest
  );
  return NextResponse.json(servers);
}

export const GET = withApiKey(handler);
```

- [ ] **Step 3: Delete `app/api/hosted/route.ts`**

```bash
rm app/api/hosted/route.ts
```

- [ ] **Step 4: Update `app/api/admin/data/route.ts`**

In the GET handler, add defaults for new fields:
```typescript
  return NextResponse.json({
    ...data,
    versionHistory: data.versionHistory ?? [],
    apiKeys: data.apiKeys ?? [],
    lastUpdatedAt: data.lastUpdatedAt ?? undefined,
    officialServer: data.officialServer ?? null,
    featuredServers: data.featuredServers ?? [],
  });
```

In the PUT handler, add the new fields:
```typescript
    const updated: AppData = {
      version: body.version ?? current.version,
      announcements: body.announcements ?? current.announcements,
      featuredServers: body.featuredServers ?? current.featuredServers ?? [],
      gameDataSources: body.gameDataSources ?? current.gameDataSources,
      versionHistory: body.versionHistory ?? current.versionHistory ?? [],
      lastUpdatedAt: body.lastUpdatedAt ?? current.lastUpdatedAt,
      apiKeys: body.apiKeys ?? current.apiKeys ?? [],
      officialServer: body.officialServer ?? current.officialServer ?? null,
    };
```

Replace `hostedServers` references with `featuredServers`.

### Task 4: Rewrite Admin Servers UI

**Files:**
- Rewrite: `app/admin/servers/page.tsx`

- [ ] **Step 1: Rewrite the servers admin page**

Full client component with two sections:

**Official Server section:**
- State: `officialServer: ServerEntry | null`, `officialForm: { ip, port }`, `officialPreview: ServerEntry | null`, `queryLoading: boolean`
- If `officialServer` is null: show "Set Official Server" prompt with IP + Port inputs + "Fetch Details" button
  - Fetch calls `POST /api/admin/server-query` → shows preview card
  - Save persists to data
- If `officialServer` exists: show detail card with Edit and Remove buttons

**Featured Servers section:**
- State: `featuredServers: ServerEntry[]`, `form` modal state, `queryLoading: boolean`
- Data table with columns: IP:Port, Hostname, Players, Mode, Language, Actions (Delete)
- "Add Featured Server" button → modal with IP + Port + "Fetch & Add" button
- Delete with confirmation

Naming convention matches existing code: `"use client"`, lucide icons, same toast/skeleton patterns.

### Task 5: Update OpenAPI Docs

**Files:**
- Modify: `app/api/docs/route.ts`

- [ ] **Step 1: Add new paths and schemas**

In the `paths` object:
- Add `/api/servers/official` path (GET, returns ServerEntry or null)
- Add `/api/servers/featured` path (GET, returns array of ServerEntry)
- Remove `/api/hosted` path

In `components/schemas`:
- Add `ServerEntry` schema (same fields as old HostedServer but without description/featuredBanner)
- Add `ServerEntryPublic` schema
- Remove `HostedServer` and `HostedServerPublic` schemas

Update `AppData` schema: replace `hostedServers` with `officialServer` + `featuredServers`.

### Task 6: Update Dashboard + API Docs Example Page

**Files:**
- Modify: `app/admin/page.tsx`
- Modify: `app/admin/api-docs/page.tsx`

- [ ] **Step 1: Update dashboard page**

In `app/admin/page.tsx`:
- Line 49: Change `{ label: "Hosted Servers", value: data.hostedServers.length` → `{ label: "Servers", value: (data.officialServer ? 1 : 0) + data.featuredServers.length }`
- Line 116: Change `Hosted Servers` → `Featured Servers` and `data.hostedServers` → `data.featuredServers`
- Line 140: Change `path: "/api/hosted"` → `path: "/api/servers/featured"` and description "Server list" → "Featured/Official servers"

- [ ] **Step 2: Update api-docs example page**

In `app/admin/api-docs/page.tsx`:
- Line 123: Change `hostedServers: []` → `featuredServers: []` + `officialServer: null`

### Task 7: Build Verification

- [ ] **Step 1: Build the project**

```bash
npm run build
```

Expected output: `✓ Compiled successfully` or similar.

- [ ] **Step 2: Fix any type errors**

Run `npx tsc --noEmit` and fix any type issues.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: restructure servers - official + featured with sampquery auto-fetch"
```
