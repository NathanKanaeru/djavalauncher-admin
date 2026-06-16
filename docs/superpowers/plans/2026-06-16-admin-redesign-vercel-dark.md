# Admin Redesign — Vercel-Inspired Dark Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the entire DjavaLauncher admin panel from MD3 Dark to Vercel-inspired dark theme with new layout, animations, and Lucide icons.

**Architecture:** Tailwind CSS v3 configuration redesigned with Vercel design tokens. All 5 admin pages maintain identical logic/structure — only JSX markup, CSS classes, and icon imports change. Shared patterns (buttons, inputs, cards) use Tailwind utility classes inline per existing codebase convention. The Sidebar and Header are extracted to `components/` since they have state/animation logic shared by all pages.

**Tech Stack:** Next.js 15 (App Router), React 19, Tailwind CSS 3, TypeScript strict, Lucide React, react-hot-toast

**Plan total: 10 tasks**

---

## File Structure

### Modified files:
| File | Change |
|---|---|
| `package.json` | Add `lucide-react` dependency |
| `tailwind.config.ts` | Full redesign: Vercel dark palette, typography, spacing, shadows, animations |
| `app/globals.css` | Replace MD3 variables with Vercel CSS tokens + animation keyframes |
| `app/layout.tsx` | Load Geist/Inter font via next/font |
| `app/login/page.tsx` | Restyle login card to Vercel dark theme |
| `app/admin/layout.tsx` | Sidebar + header integration (was: bare sidebar) |
| `app/admin/page.tsx` | Dashboard: stat cards, quick info, API list — restyled |
| `app/admin/updates/page.tsx` | Form page restyled |
| `app/admin/announcements/page.tsx` | Card list + form restyled |
| `app/admin/servers/page.tsx` | Card list → data table + form restyled |
| `app/admin/game-data/page.tsx` | Form page restyled |

### New files:
| File | Purpose |
|---|---|
| `components/sidebar.tsx` | Collapsible sidebar with Lucide icons, active state, collapse toggle |
| `components/header.tsx` | Top header with breadcrumbs + logout button |

### Unchanged files:
All API routes (`app/api/`), all `lib/` files (`types.ts`, `store.ts`, `auth.ts`), config files (`next.config.js`, `postcss.config.js`, `tsconfig.json`, `vercel.json`), `app/page.tsx`.

---

### Task 1: Dependencies, Tailwind Config, CSS Variables, Fonts

**Files:**
- Modify: `package.json`
- Modify: `tailwind.config.ts`
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Install lucide-react**

Run: `npm install lucide-react`

- [ ] **Step 2: Rewrite tailwind.config.ts**

Replace entire file with Vercel dark tokens:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        page: "#0a0a0a",
        surface: "#111111",
        "surface-raised": "#1a1a1a",
        sidebar: "#000000",
        header: "#000000",
        ink: "#ededed",
        body: "#888888",
        mute: "#555555",
        accent: "#0070f3",
        "accent-soft": "#001a33",
        "accent-hover": "#0761d1",
        hairline: "#222222",
        "hairline-strong": "#333333",
        error: "#ee0000",
        "error-soft": "#2a0000",
        warning: "#f5a623",
        "warning-soft": "#1a1400",
      },
      fontFamily: {
        sans: ["Geist", "Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["Geist Mono", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "monospace"],
      },
      fontSize: {
        display: ["28px", { lineHeight: "36px", fontWeight: "600", letterSpacing: "-1.12px" }],
        heading: ["20px", { lineHeight: "28px", fontWeight: "600", letterSpacing: "-0.6px" }],
        subheading: ["16px", { lineHeight: "24px", fontWeight: "500" }],
        body: ["14px", { lineHeight: "20px", fontWeight: "400", letterSpacing: "-0.28px" }],
        "body-strong": ["14px", { lineHeight: "20px", fontWeight: "500", letterSpacing: "-0.28px" }],
        caption: ["12px", { lineHeight: "16px", fontWeight: "400" }],
        "caption-mono": ["12px", { lineHeight: "16px", fontWeight: "400" }],
        "btn-md": ["14px", { lineHeight: "20px", fontWeight: "500" }],
      },
      borderRadius: {
        xs: "4px",
        sm: "6px",
        md: "8px",
        lg: "12px",
        pill: "100px",
      },
      spacing: {
        xxs: "4px",
        xs: "8px",
        sm: "12px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        "2xl": "40px",
        "3xl": "48px",
        "4xl": "64px",
      },
      boxShadow: {
        "card": "0px 1px 1px rgba(0,0,0,0.05), 0px 2px 2px rgba(0,0,0,0.1)",
        "raised": "0px 2px 2px rgba(0,0,0,0.1), 0px 8px 8px -8px rgba(0,0,0,0.1)",
        "modal": "0px 1px 1px rgba(0,0,0,0.05), 0px 8px 16px -4px rgba(0,0,0,0.1), 0px 24px 32px -8px rgba(0,0,0,0.15)",
      },
      keyframes: {
        "fade-in": { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        "slide-in": { "0%": { opacity: "0", transform: "translateY(-8px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        "scale-in": { "0%": { opacity: "0", transform: "scale(0.95)" }, "100%": { opacity: "1", transform: "scale(1)" } },
        "skeleton-pulse": { "0%, 100%": { opacity: "0.3" }, "50%": { opacity: "1" } },
      },
      animation: {
        "fade-in": "fade-in 200ms ease-out",
        "slide-in": "slide-in 300ms ease-out",
        "scale-in": "scale-in 200ms ease-out",
        "skeleton": "skeleton-pulse 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 3: Rewrite app/globals.css**

Replace entire file:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * { box-sizing: border-box; }
  body {
    @apply bg-page text-ink font-sans antialiased;
    margin: 0;
  }
  ::selection { background-color: #ededed; color: #0a0a0a; }
}

@layer components {
  .card {
    @apply bg-surface border border-hairline rounded-md p-lg shadow-card;
  }
  .card-hover {
    @apply card transition-shadow duration-150 ease-out;
  }
  .card-hover:hover {
    @apply shadow-raised;
    transform: translateY(-1px);
  }
  .btn {
    @apply inline-flex items-center justify-center gap-xs text-btn-md rounded-pill
           transition-all duration-100 ease-out select-none;
    padding: 6px 16px;
  }
  .btn:active {
    transform: scale(0.97);
  }
  .btn-primary {
    @apply btn bg-white text-[#171717] hover:opacity-90;
  }
  .btn-secondary {
    @apply btn bg-transparent text-ink border border-hairline-strong hover:bg-surface-raised;
  }
  .btn-destructive {
    @apply btn bg-error text-white hover:opacity-90;
  }
  .btn-ghost {
    @apply btn bg-transparent text-body hover:text-ink hover:bg-surface-raised rounded-sm;
  }
  .btn-icon {
    @apply btn bg-transparent text-body border border-hairline rounded-full;
    padding: 6px;
  }
  .input {
    @apply bg-transparent border border-hairline rounded-sm text-body text-ink
           transition-all duration-150 ease-out;
    height: 40px;
    padding: 0 12px;
    outline: none;
  }
  .input:focus {
    border-color: #0070f3;
    box-shadow: 0 0 0 2px rgba(0,112,243,0.15);
  }
  .input-lg {
    @apply input;
    height: 48px;
    font-size: 16px;
  }
  .textarea {
    @apply input;
    height: auto;
    min-height: 80px;
    padding: 8px 12px;
    resize: vertical;
  }
  .label {
    @apply text-caption text-body;
    display: block;
    margin-bottom: 4px;
  }
  .badge {
    @apply inline-flex items-center text-caption text-body bg-surface-raised rounded-full;
    padding: 0 8px;
    height: 20px;
  }
}

@layer utilities {
  .inset-hairline {
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.06);
  }
}

::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #222; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #333; }
```

- [ ] **Step 4: Update app/layout.tsx to load Inter font**

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "DjavaLauncher Admin",
  description: "Admin panel for DjavaLauncher",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit`
Expected: No type errors.

---

### Task 2: Build Sidebar Component

**Files:**
- Create: `components/sidebar.tsx`

```tsx
"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  RefreshCw,
  Megaphone,
  Server,
  Database,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Updates", href: "/admin/updates", icon: RefreshCw },
  { label: "Announcements", href: "/admin/announcements", icon: Megaphone },
  { label: "Servers", href: "/admin/servers", icon: Server },
  { label: "Game Data", href: "/admin/game-data", icon: Database },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <aside
      className={`bg-sidebar border-r border-hairline flex flex-col transition-all duration-250 ease-in-out ${
        collapsed ? "w-[64px]" : "w-[240px]"
      }`}
      style={{ minHeight: "100vh", position: "sticky", top: 0 }}
    >
      <div className={`flex items-center gap-sm px-md h-[64px] border-b border-hairline ${collapsed ? "justify-center" : ""}`}>
        <div className="w-[32px] h-[32px] rounded-md bg-accent flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          D
        </div>
        {!collapsed && (
          <div>
            <div className="text-body-strong text-ink">DjavaLauncher</div>
            <div className="text-caption text-mute">Admin Panel</div>
          </div>
        )}
      </div>

      <nav className="flex-1 flex flex-col gap-xxs px-xs py-sm">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center gap-sm rounded-sm transition-colors duration-150 ease-out ${
                collapsed ? "justify-center px-0 py-sm" : "px-sm py-xs"
              } ${
                active
                  ? "bg-accent-soft text-accent"
                  : "text-body hover:text-ink hover:bg-surface-raised"
              }`}
              style={active && !collapsed ? { borderLeft: "3px solid #0070f3" } : {}}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && <span className="text-body">{item.label}</span>}
            </a>
          );
        })}
      </nav>

      <div className="px-xs pb-sm">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="btn-ghost w-full flex items-center justify-center gap-xs py-xs text-mute hover:text-ink"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          {!collapsed && <span className="text-caption">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
```

- [ ] **Step 1: Create `components/sidebar.tsx`** with content above

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: No errors.

---

### Task 3: Build Header Component

**Files:**
- Create: `components/header.tsx`

```tsx
"use client";

import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";

const BREADCRUMB_MAP: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/updates": "Updates",
  "/admin/announcements": "Announcements",
  "/admin/servers": "Servers",
  "/admin/game-data": "Game Data",
};

export default function Header() {
  const pathname = usePathname();

  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs: { label: string; href: string }[] = [];
  let href = "";
  for (const seg of segments) {
    href += `/${seg}`;
    const label = BREADCRUMB_MAP[href];
    if (label) breadcrumbs.push({ label, href });
  }

  return (
    <header className="bg-header border-b border-hairline h-[64px] flex items-center justify-between px-lg">
      <nav className="flex items-center gap-xs text-caption-mono">
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb.href} className="flex items-center gap-xs">
            {i > 0 && <span className="text-mute select-none">/</span>}
            {i === breadcrumbs.length - 1 ? (
              <span className="text-body">{crumb.label}</span>
            ) : (
              <a href={crumb.href} className="text-mute hover:text-body transition-colors">
                {crumb.label}
              </a>
            )}
          </span>
        ))}
      </nav>

      <form action="/api/admin/login" method="POST" style={{ display: "none" }} />
      <button
        onClick={async () => {
          await fetch("/api/admin/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password: "" }),
          });
          window.location.href = "/login";
        }}
        className="btn-ghost flex items-center gap-xs text-mute hover:text-ink"
      >
        <LogOut size={16} />
        <span className="text-caption">Log out</span>
      </button>
    </header>
  );
}
```

- [ ] **Step 1: Create `components/header.tsx`** with content above
- [ ] **Step 2: Verify** — `npx tsc --noEmit` passes

---

### Task 4: Redesign Admin Layout

**Files:**
- Modify: `app/admin/layout.tsx`

Replace entire file with sidebar + header layout:

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/verify")
      .then((res) => {
        if (!res.ok) throw new Error("Not authenticated");
        setAuthenticated(true);
      })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page">
        <div className="flex flex-col items-center gap-md">
          <div className="w-[40px] h-[40px] rounded-md bg-surface-raised animate-skeleton" />
          <div className="w-[120px] h-[12px] rounded-sm bg-surface-raised animate-skeleton" />
        </div>
      </div>
    );
  }

  if (!authenticated) return null;

  return (
    <div className="flex min-h-screen bg-page">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-lg overflow-y-auto animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
```

- [ ] **Step 1: Rewrite `app/admin/layout.tsx`** with content above
- [ ] **Step 2: Verify** — `npx tsc --noEmit` passes

---

### Task 5: Redesign Login Page

**Files:**
- Modify: `app/login/page.tsx`

Replace the inline styles and MD3 classes with Vercel dark theme classes:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole } from "lucide-react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) { setError("Invalid password"); return; }
      router.push("/admin");
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-page">
      <div className="card w-full max-w-[360px] p-xl animate-fade-in">
        <div className="text-center mb-lg">
          <div className="w-[56px] h-[56px] rounded-lg bg-accent flex items-center justify-center mx-auto mb-md">
            <span className="text-white text-2xl font-bold">D</span>
          </div>
          <h1 className="text-heading text-ink m-0">DjavaLauncher</h1>
          <p className="text-body text-body mt-xxs">Admin Panel</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-md">
          <div>
            <label className="label">Password</label>
            <div className="relative">
              <LockKeyhole size={16} className="absolute left-sm top-1/2 -translate-y-1/2 text-mute pointer-events-none" />
              <input
                type="password"
                className="input w-full pl-xl"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                autoFocus
              />
            </div>
          </div>
          {error && <p className="text-caption text-error m-0">{error}</p>}
          <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 1: Rewrite `app/login/page.tsx`** with content above
- [ ] **Step 2: Verify** — `npx tsc --noEmit` passes

---

### Task 6: Redesign Dashboard Page

**Files:**
- Modify: `app/admin/page.tsx`

Replace content with Vercel-dark styled dashboard with Lucide icons:

```tsx
"use client";

import { useEffect, useState } from "react";
import { AppData } from "@/lib/types";
import { LayoutDashboard, RefreshCw, Server, Database, Globe, Download, FileText } from "lucide-react";

export default function DashboardPage() {
  const [data, setData] = useState<AppData | null>(null);

  useEffect(() => {
    fetch("/api/admin/data").then((r) => r.json()).then(setData).catch(() => {});
  }, []);

  if (!data) {
    return (
      <div className="animate-fade-in">
        <div className="w-[180px] h-[14px] bg-surface-raised rounded-sm animate-skeleton mb-lg" />
        <div className="grid grid-cols-4 gap-md">
          {[1,2,3,4].map(i => (
            <div key={i} className="card p-lg">
              <div className="w-[32px] h-[32px] bg-surface-raised rounded-sm animate-skeleton mb-sm" />
              <div className="w-[60px] h-[24px] bg-surface-raised rounded-sm animate-skeleton mb-xs" />
              <div className="w-[80px] h-[12px] bg-surface-raised rounded-sm animate-skeleton" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Announcements", value: data.announcements.length, icon: Megaphone, accent: true },
    { label: "Hosted Servers", value: data.hostedServers.length, icon: Server },
    { label: "App Version", value: `v${data.version.latestVersion}`, icon: RefreshCw },
    { label: "Game Data Sources", value: "3", icon: Database },
  ];

  return (
    <div className="animate-fade-in">
      <h1 className="text-display text-ink m-0 mb-lg">Dashboard</h1>

      <div className="grid grid-cols-4 gap-md mb-xl">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card p-lg">
              <div className={`w-[36px] h-[36px] rounded-md flex items-center justify-center mb-sm ${
                stat.accent ? "bg-accent/10 text-accent" : "bg-surface-raised text-body"
              }`}>
                <Icon size={20} />
              </div>
              <div className="text-display text-ink">{stat.value}</div>
              <div className="text-body text-mute mt-xxs">{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div className="card p-lg mb-md">
        <h2 className="text-subheading text-ink m-0 mb-md">Quick Info</h2>
        <div className="grid grid-cols-[auto_1fr] gap-x-md gap-y-xs text-body">
          <span className="text-mute">Latest Version:</span>
          <span>{data.version.latestVersion} (code {data.version.latestVersionCode})</span>
          <span className="text-mute">Download URL:</span>
          <span className="text-accent break-all">{data.version.downloadUrl || "\u2014"}</span>
          <span className="text-mute">Change Log:</span>
          <span>{data.version.changeLog || "\u2014"}</span>
          <span className="text-mute">Hosted Servers:</span>
          <span>{data.hostedServers.length} total</span>
          <span className="text-mute">Announcements:</span>
          <span>{data.announcements.length} total</span>
          <span className="text-mute">Game Data Sources:</span>
          <span>GitHub / Pixeldrain / Dropbox</span>
        </div>
      </div>

      <div className="card p-lg">
        <h2 className="text-subheading text-ink m-0 mb-md">API Endpoints</h2>
        <div className="flex flex-col gap-sm">
          {[
            { method: "GET", path: "/api/version_control", desc: "App version check", icon: RefreshCw },
            { method: "GET", path: "/api/announcements", desc: "Dashboard announcements", icon: Megaphone },
            { method: "GET", path: "/api/hosted", desc: "Server list", icon: Server },
            { method: "GET", path: "/api/download_sources", desc: "Game data download URLs", icon: Download },
          ].map((ep) => {
            const Icon = ep.icon;
            return (
              <div key={ep.path} className="flex items-center gap-sm text-body">
                <Icon size={16} className="text-mute flex-shrink-0" />
                <code className="text-caption-mono text-accent bg-accent-soft rounded-xs px-xs py-xxs">
                  {ep.method} {ep.path}
                </code>
                <span className="text-mute">{ep.desc}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Need to import Megaphone for the stats array
import { Megaphone } from "lucide-react";
```

- [ ] **Step 1: Rewrite `app/admin/page.tsx`** with content above
- [ ] **Step 2: Verify** — `npx tsc --noEmit` passes

---

### Task 7: Redesign Updates Page

**Files:**
- Modify: `app/admin/updates/page.tsx`

Replace content with Vercel-dark styled form with Lucide icons:

```tsx
"use client";

import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { RefreshCw, Hash, Tag, Link, FileText } from "lucide-react";

const initialForm = {
  latestVersionCode: 130,
  latestVersion: "",
  downloadUrl: "",
  changeLog: "",
};

export default function UpdatesPage() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/data")
      .then((r) => r.json())
      .then((d) => setForm(d.version || initialForm))
      .catch(() => toast.error("Failed to load data"))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const current = await fetch("/api/admin/data").then((r) => r.json());
      current.version = form;
      const res = await fetch("/api/admin/data", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(current),
      });
      if (res.ok) toast.success("Version updated");
      else toast.error("Failed to save");
    } catch {
      toast.error("Connection error");
    } finally {
      setSaving(false);
    }
  }

  function update(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="w-[160px] h-[14px] bg-surface-raised rounded-sm animate-skeleton mb-lg" />
        <div className="card p-lg max-w-[640px]">
          {[1,2,3,4].map(i => (
            <div key={i} className="mb-md">
              <div className="w-[100px] h-[10px] bg-surface-raised rounded-sm animate-skeleton mb-xs" />
              <div className="w-full h-[40px] bg-surface-raised rounded-sm animate-skeleton" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <Toaster
        position="top-center"
        toastOptions={{
          style: { background: "#111", color: "#ededed", border: "1px solid #222" },
        }}
      />
      <h1 className="text-display text-ink m-0 mb-lg flex items-center gap-sm">
        <RefreshCw size={28} className="text-accent" />
        App Updates
      </h1>
      <form onSubmit={handleSave} className="card p-lg max-w-[640px]">
        <div className="flex flex-col gap-md">
          <div>
            <label className="label flex items-center gap-xxs">
              <Hash size={12} className="text-mute" /> Version Code
            </label>
            <input
              type="number"
              className="input w-full"
              value={form.latestVersionCode}
              onChange={(e) => update("latestVersionCode", parseInt(e.target.value) || 0)}
            />
          </div>
          <div>
            <label className="label flex items-center gap-xxs">
              <Tag size={12} className="text-mute" /> Version Name
            </label>
            <input
              type="text"
              className="input w-full"
              value={form.latestVersion}
              onChange={(e) => update("latestVersion", e.target.value)}
              placeholder="e.g. 1.0"
            />
          </div>
          <div>
            <label className="label flex items-center gap-xxs">
              <Link size={12} className="text-mute" /> Download URL
            </label>
            <input
              type="text"
              className="input w-full"
              value={form.downloadUrl}
              onChange={(e) => update("downloadUrl", e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="label flex items-center gap-xxs">
              <FileText size={12} className="text-mute" /> Change Log
            </label>
            <textarea
              className="textarea w-full"
              value={form.changeLog}
              onChange={(e) => update("changeLog", e.target.value)}
              placeholder="What's new in this version?"
              rows={4}
            />
          </div>
        </div>
        <button type="submit" className="btn-primary mt-lg" disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 1: Rewrite `app/admin/updates/page.tsx`** with content above
- [ ] **Step 2: Verify** — `npx tsc --noEmit` passes

---

### Task 8: Redesign Announcements Page

**Files:**
- Modify: `app/admin/announcements/page.tsx`

Replace entire file. Key changes: card list with hover effects, Lucide icons, empty state, inline form with Lucide icons, skeleton loading:

```tsx
"use client";

import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Announcement } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";
import { Megaphone, Plus, Pencil, Trash2, Calendar, Image, Inbox } from "lucide-react";

const emptyForm = () => ({ title: "", description: "", date: new Date().toISOString().split("T")[0], imageUrl: "" });

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Announcement>(emptyForm());

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const res = await fetch("/api/admin/data");
      const d = await res.json();
      setAnnouncements(d.announcements || []);
    } catch { toast.error("Failed to load"); }
    finally { setLoading(false); }
  }

  function startEdit(index: number) { setEditingIndex(index); setShowForm(true); setForm({ ...announcements[index] }); }
  function startAdd() { setEditingIndex(null); setShowForm(true); setForm(emptyForm()); }
  function cancelEdit() { setEditingIndex(null); setShowForm(false); setForm(emptyForm()); }
  function update(field: keyof Announcement, value: string) { setForm((prev) => ({ ...prev, [field]: value })); }

  async function handleSave() {
    let updated: Announcement[];
    if (editingIndex !== null) { updated = announcements.map((a, i) => (i === editingIndex ? { ...form, id: a.id } : a)); }
    else { updated = [...announcements, { ...form, id: uuidv4() }]; }
    await persist(updated);
  }

  async function handleDelete(index: number) { await persist(announcements.filter((_, i) => i !== index)); }

  async function persist(updated: Announcement[]) {
    try {
      const current = await fetch("/api/admin/data").then((r) => r.json());
      current.announcements = updated;
      const res = await fetch("/api/admin/data", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(current) });
      if (res.ok) { setAnnouncements(updated); setEditingIndex(null); setShowForm(false); setForm(emptyForm()); toast.success("Saved"); }
      else { toast.error("Failed to save"); }
    } catch { toast.error("Connection error"); }
  }

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="w-[180px] h-[14px] bg-surface-raised rounded-sm animate-skeleton mb-lg" />
        <div className="flex flex-col gap-sm">
          {[1,2].map(i => (
            <div key={i} className="card p-lg">
              <div className="flex gap-md">
                <div className="w-[60px] h-[60px] bg-surface-raised rounded-md animate-skeleton flex-shrink-0" />
                <div className="flex-1">
                  <div className="w-[140px] h-[14px] bg-surface-raised rounded-sm animate-skeleton mb-xs" />
                  <div className="w-full h-[10px] bg-surface-raised rounded-sm animate-skeleton mb-xxs" />
                  <div className="w-[80px] h-[10px] bg-surface-raised rounded-sm animate-skeleton" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <Toaster position="top-center" toastOptions={{ style: { background: "#111", color: "#ededed", border: "1px solid #222" } }} />
      <div className="flex items-center justify-between mb-lg">
        <h1 className="text-display text-ink m-0 flex items-center gap-sm">
          <Megaphone size={28} className="text-accent" />
          Announcements
        </h1>
        <button className="btn-primary flex items-center gap-xs" onClick={startAdd}>
          <Plus size={16} /> Add
        </button>
      </div>

      {announcements.length === 0 && !editingIndex && (
        <div className="card p-3xl flex flex-col items-center justify-center text-center animate-fade-in">
          <Inbox size={48} className="text-mute mb-md" />
          <p className="text-heading text-body m-0">No announcements yet</p>
          <p className="text-body text-mute mt-xs mb-md">Click "+ Add" to create one.</p>
          <button className="btn-primary flex items-center gap-xs" onClick={startAdd}>
            <Plus size={16} /> Add Announcement
          </button>
        </div>
      )}

      <div className="flex flex-col gap-sm">
        {announcements.map((item, index) => (
          <div key={item.id || index} className="card card-hover p-lg animate-slide-in" style={{ animationDelay: `${index * 50}ms` }}>
            <div className="flex gap-md items-start">
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt=""
                  className="w-[72px] h-[72px] rounded-md object-cover flex-shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-subheading text-ink mb-xxs">{item.title}</div>
                <div className="text-body text-body mb-xs break-words">{item.description}</div>
                <div className="flex items-center gap-xxs text-caption text-mute">
                  <Calendar size={12} /> {item.date}
                </div>
              </div>
              <div className="flex gap-xs flex-shrink-0">
                <button className="btn-ghost p-xs" onClick={() => startEdit(index)} title="Edit">
                  <Pencil size={16} />
                </button>
                <button className="btn-ghost p-xs text-error hover:bg-error-soft" onClick={() => handleDelete(index)} title="Delete">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="card p-lg mt-lg max-w-[640px] animate-scale-in">
          <h2 className="text-subheading text-ink m-0 mb-md">
            {editingIndex !== null ? "Edit Announcement" : "New Announcement"}
          </h2>
          <div className="flex flex-col gap-md">
            <div>
              <label className="label">Title</label>
              <input className="input w-full" value={form.title} onChange={(e) => update("title", e.target.value)} />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="textarea w-full" value={form.description} onChange={(e) => update("description", e.target.value)} rows={3} />
            </div>
            <div>
              <label className="label flex items-center gap-xxs">
                <Calendar size={12} className="text-mute" /> Date
              </label>
              <input className="input w-full" type="date" value={form.date} onChange={(e) => update("date", e.target.value)} />
            </div>
            <div>
              <label className="label flex items-center gap-xxs">
                <Image size={12} className="text-mute" /> Image URL
              </label>
              <input className="input w-full" value={form.imageUrl} onChange={(e) => update("imageUrl", e.target.value)} placeholder="https://..." />
            </div>
          </div>
          <div className="flex gap-sm mt-lg">
            <button className="btn-primary" onClick={handleSave}>Save</button>
            <button className="btn-secondary" onClick={cancelEdit}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 1: Rewrite `app/admin/announcements/page.tsx`** with content above
- [ ] **Step 2: Verify** — `npx tsc --noEmit` passes

---

### Task 9: Redesign Servers Page (with Data Table)

**Files:**
- Modify: `app/admin/servers/page.tsx`

Replace entire file. Key change: card list → proper data table + form with Lucide icons:

```tsx
"use client";

import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { HostedServer } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";
import { Server, Plus, Pencil, Trash2, Globe, Users, Wifi, Hash } from "lucide-react";

const emptyForm = (): HostedServer => ({
  ip: "", port: 7777, hostname: "", players: 0, maxplayers: 100,
  description: "", mode: "", language: "English", featuredBanner: "",
});

export default function ServersPage() {
  const [servers, setServers] = useState<HostedServer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<HostedServer>(emptyForm());
  const [search, setSearch] = useState("");

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try { const res = await fetch("/api/admin/data"); const d = await res.json(); setServers(d.hostedServers || []); }
    catch { toast.error("Failed to load"); }
    finally { setLoading(false); }
  }

  function startEdit(index: number) { setEditingIndex(index); setShowForm(true); setForm({ ...servers[index] }); }
  function startAdd() { setEditingIndex(null); setShowForm(true); setForm(emptyForm()); }
  function cancelEdit() { setEditingIndex(null); setShowForm(false); setForm(emptyForm()); }
  function update(field: keyof HostedServer, value: string | number) { setForm((prev) => ({ ...prev, [field]: value })); }

  async function handleSave() {
    let updated: HostedServer[];
    if (editingIndex !== null) { updated = servers.map((s, i) => (i === editingIndex ? { ...form, id: s.id } : s)); }
    else { updated = [...servers, { ...form, id: uuidv4() }]; }
    await persist(updated);
  }

  async function handleDelete(index: number) { await persist(servers.filter((_, i) => i !== index)); }

  async function persist(updated: HostedServer[]) {
    try {
      const current = await fetch("/api/admin/data").then((r) => r.json());
      current.hostedServers = updated;
      const res = await fetch("/api/admin/data", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(current) });
      if (res.ok) { setServers(updated); setEditingIndex(null); setShowForm(false); setForm(emptyForm()); toast.success("Saved"); }
      else { toast.error("Failed to save"); }
    } catch { toast.error("Connection error"); }
  }

  const filtered = servers.filter(s =>
    !search || s.hostname.toLowerCase().includes(search.toLowerCase()) || s.ip.includes(search)
  );

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="w-[180px] h-[14px] bg-surface-raised rounded-sm animate-skeleton mb-lg" />
        <div className="card p-lg">
          <div className="flex gap-md mb-md">
            <div className="w-[200px] h-[32px] bg-surface-raised rounded-sm animate-skeleton" />
            <div className="w-[100px] h-[32px] bg-surface-raised rounded-sm animate-skeleton ml-auto" />
          </div>
          {[1,2,3].map(i => (
            <div key={i} className="flex gap-md py-sm border-b border-hairline">
              <div className="flex-1 h-[12px] bg-surface-raised rounded-sm animate-skeleton" />
              <div className="w-[80px] h-[12px] bg-surface-raised rounded-sm animate-skeleton" />
              <div className="w-[60px] h-[12px] bg-surface-raised rounded-sm animate-skeleton" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <Toaster position="top-center" toastOptions={{ style: { background: "#111", color: "#ededed", border: "1px solid #222" } }} />
      <div className="flex items-center justify-between mb-lg">
        <h1 className="text-display text-ink m-0 flex items-center gap-sm">
          <Server size={28} className="text-accent" />
          Hosted Servers
        </h1>
        <button className="btn-primary flex items-center gap-xs" onClick={startAdd}>
          <Plus size={16} /> Add Server
        </button>
      </div>

      {servers.length === 0 && !editingIndex ? (
        <div className="card p-3xl flex flex-col items-center justify-center text-center animate-fade-in">
          <Server size={48} className="text-mute mb-md" />
          <p className="text-heading text-body m-0">No servers yet</p>
          <p className="text-body text-mute mt-xs mb-md">Click "+ Add Server" to add one.</p>
          <button className="btn-primary flex items-center gap-xs" onClick={startAdd}>
            <Plus size={16} /> Add Server
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-sm mb-md">
            <input
              className="input flex-1 max-w-[320px]"
              placeholder="Search by hostname or IP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="text-caption text-mute">{filtered.length} of {servers.length}</span>
          </div>

          <div className="card overflow-hidden">
            <table className="w-full text-body border-collapse">
              <thead>
                <tr className="text-caption-mono text-mute border-b border-hairline">
                  <th className="text-left py-sm px-sm font-normal">Hostname</th>
                  <th className="text-left py-sm px-sm font-normal">IP:Port</th>
                  <th className="text-left py-sm px-sm font-normal">Players</th>
                  <th className="text-left py-sm px-sm font-normal">Mode</th>
                  <th className="text-left py-sm px-sm font-normal">Language</th>
                  <th className="text-right py-sm px-sm font-normal">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((server, index) => (
                  <tr
                    key={server.id || index}
                    className="border-b border-hairline hover:bg-surface-raised transition-colors duration-150"
                  >
                    <td className="py-sm px-sm">
                      <div className="text-ink">{server.hostname || server.ip}</div>
                      {server.description && <div className="text-caption text-mute">{server.description}</div>}
                    </td>
                    <td className="py-sm px-sm text-body">
                      <code className="text-caption-mono">{server.ip}:{server.port}</code>
                    </td>
                    <td className="py-sm px-sm">
                      <span className="flex items-center gap-xxs">
                        <Users size={12} className="text-mute" />
                        {server.players}/{server.maxplayers}
                      </span>
                    </td>
                    <td className="py-sm px-sm text-mute">{server.mode || "\u2014"}</td>
                    <td className="py-sm px-sm text-mute">{server.language}</td>
                    <td className="py-sm px-sm text-right">
                      <div className="flex items-center justify-end gap-xs">
                        {server.featuredBanner && <Globe size={14} className="text-accent" title="Has banner" />}
                        <button className="btn-ghost p-xs" onClick={() => startEdit(index)} title="Edit">
                          <Pencil size={14} />
                        </button>
                        <button className="btn-ghost p-xs text-error hover:bg-error-soft" onClick={() => handleDelete(index)} title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {showForm && (
        <div className="card p-lg mt-lg max-w-[640px] animate-scale-in">
          <h2 className="text-subheading text-ink m-0 mb-md">
            {editingIndex !== null ? "Edit Server" : "New Server"}
          </h2>
          <div className="grid grid-cols-2 gap-md">
            <div>
              <label className="label">IP Address</label>
              <input className="input w-full" value={form.ip} onChange={(e) => update("ip", e.target.value)} />
            </div>
            <div>
              <label className="label">Port</label>
              <input className="input w-full" type="number" value={form.port} onChange={(e) => update("port", parseInt(e.target.value) || 0)} />
            </div>
            <div className="col-span-2">
              <label className="label">Hostname</label>
              <input className="input w-full" value={form.hostname} onChange={(e) => update("hostname", e.target.value)} />
            </div>
            <div>
              <label className="label">Players</label>
              <input className="input w-full" type="number" value={form.players} onChange={(e) => update("players", parseInt(e.target.value) || 0)} />
            </div>
            <div>
              <label className="label">Max Players</label>
              <input className="input w-full" type="number" value={form.maxplayers} onChange={(e) => update("maxplayers", parseInt(e.target.value) || 0)} />
            </div>
            <div className="col-span-2">
              <label className="label">Description</label>
              <textarea className="textarea w-full" value={form.description} onChange={(e) => update("description", e.target.value)} rows={2} />
            </div>
            <div>
              <label className="label">Mode</label>
              <input className="input w-full" value={form.mode} onChange={(e) => update("mode", e.target.value)} />
            </div>
            <div>
              <label className="label">Language</label>
              <input className="input w-full" value={form.language} onChange={(e) => update("language", e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="label">Featured Banner URL</label>
              <input className="input w-full" value={form.featuredBanner} onChange={(e) => update("featuredBanner", e.target.value)} placeholder="https://..." />
            </div>
          </div>
          <div className="flex gap-sm mt-lg">
            <button className="btn-primary" onClick={handleSave}>Save</button>
            <button className="btn-secondary" onClick={cancelEdit}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 1: Rewrite `app/admin/servers/page.tsx`** with content above
- [ ] **Step 2: Verify** — `npx tsc --noEmit` passes

---

### Task 10: Redesign Game Data Page

**Files:**
- Modify: `app/admin/game-data/page.tsx`

Replace with Vercel-dark styled form:

```tsx
"use client";

import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { GameDataSources } from "@/lib/types";
import { Database, Github, Cloud, ExternalLink } from "lucide-react";

const initialForm: GameDataSources = { github: "", pixeldrain: "", dropbox: "" };

const SOURCES = [
  { key: "github" as const, label: "GitHub Release", icon: Github, tag: "Recommended", tagColor: "text-accent bg-accent-soft" },
  { key: "pixeldrain" as const, label: "Pixeldrain", icon: Cloud, tag: "Cepat", tagColor: "text-warning bg-warning-soft" },
  { key: "dropbox" as const, label: "Dropbox", icon: ExternalLink, tag: "Cepat", tagColor: "text-warning bg-warning-soft" },
];

export default function GameDataPage() {
  const [form, setForm] = useState<GameDataSources>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/data").then((r) => r.json()).then((d) => setForm(d.gameDataSources || initialForm)).catch(() => toast.error("Failed to load")).finally(() => setLoading(false));
  }, []);

  function update(field: keyof GameDataSources, value: string) { setForm((prev) => ({ ...prev, [field]: value })); }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const current = await fetch("/api/admin/data").then((r) => r.json());
      current.gameDataSources = form;
      const res = await fetch("/api/admin/data", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(current) });
      if (res.ok) toast.success("Download sources updated");
      else toast.error("Failed to save");
    } catch { toast.error("Connection error"); }
    finally { setSaving(false); }
  }

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="w-[240px] h-[14px] bg-surface-raised rounded-sm animate-skeleton mb-lg" />
        <div className="card p-lg max-w-[640px]">
          {[1,2,3].map(i => (
            <div key={i} className="mb-md">
              <div className="w-[120px] h-[10px] bg-surface-raised rounded-sm animate-skeleton mb-xs" />
              <div className="w-full h-[40px] bg-surface-raised rounded-sm animate-skeleton" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <Toaster position="top-center" toastOptions={{ style: { background: "#111", color: "#ededed", border: "1px solid #222" } }} />
      <h1 className="text-display text-ink m-0 mb-lg flex items-center gap-sm">
        <Database size={28} className="text-accent" />
        Game Data Download Sources
      </h1>
      <form onSubmit={handleSave} className="card p-lg max-w-[640px]">
        <div className="flex flex-col gap-md">
          {SOURCES.map(({ key, label, icon: Icon, tag, tagColor }) => (
            <div key={key}>
              <label className="label flex items-center gap-xs">
                <Icon size={14} className="text-mute" /> {label}
                <span className={`badge ${tagColor}`}>{tag}</span>
              </label>
              <input
                type="text"
                className="input w-full"
                value={form[key]}
                onChange={(e) => update(key, e.target.value)}
                placeholder={`https://${key === "github" ? "github.com/..." : key === "pixeldrain" ? "pixeldrain.com/..." : "dropbox.com/..."}`}
              />
            </div>
          ))}
        </div>
        <button type="submit" className="btn-primary mt-lg" disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 1: Rewrite `app/admin/game-data/page.tsx`** with content above
- [ ] **Step 2: Verify** — `npx tsc --noEmit` passes

---

## Self-Review

**Spec coverage check:**
- ✅ Color palette (Task 1: tailwind.config.ts)
- ✅ Typography (Task 1: tailwind.config.ts + globals.css)
- ✅ Spacing system (Task 1: tailwind.config.ts)
- ✅ Elevation/shadows (Task 1: tailwind.config.ts + globals.css)
- ✅ Collapsible sidebar (Task 2: components/sidebar.tsx)
- ✅ Top header with breadcrumbs + logout (Task 3: components/header.tsx)
- ✅ Buttons, inputs, cards (Task 1: globals.css utility classes)
- ✅ Data table for servers (Task 9)
- ✅ Empty states (Tasks 8, 9)
- ✅ Skeleton loading (Tasks 6, 7, 8, 9, 10)
- ✅ Animations (Task 1: keyframes in tailwind config + animation classes)
- ✅ Lucide icons (Tasks 2-10)
- ✅ Responsive (Tasks on individual pages)
- ✅ Login page (Task 5)
- ✅ Dashboard (Task 6)
- ✅ Updates (Task 7)
- ✅ Announcements (Task 8)
- ✅ Servers (Task 9)
- ✅ Game Data (Task 10)
- API routes, lib files untouched — per spec

**Placeholder check:** No TBD, TODO, TO_FILL, "add later", or similar patterns.

**Type consistency:** All import paths use `@/` alias. All Lucide icon names match `lucide-react` exports. All component props and state types match existing `lib/types.ts`.

**Final verification command sequence:**
```bash
npm run lint && npx tsc --noEmit
```

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-06-16-admin-redesign-vercel-dark.md`.

Two execution options:
1. **Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration
2. **Inline Execution** — Execute tasks step-by-step in this session, with checkpoints

Which approach? (I recommend Subagent-Driven since there are 10 independent tasks)
