# Changelogs API & Admin UI Improvement — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add public `GET /api/changelogs` endpoint returning all version changelogs (latest + archived) and improve the admin Updates page with a timeline-style changelog viewer.

**Architecture:** New `app/api/changelogs/route.ts` fetches AppData, combines latest version.changeLog with versionHistory entries, strips internal IDs, sorts desc. Admin Updates page reuses existing versionHistory data to render a visual timeline. OpenAPI docs updated to include the new endpoint.

**Tech Stack:** Next.js 15 App Router, TypeScript, Tailwind CSS, Lucide icons

---

### Task 1: Create `GET /api/changelogs` Endpoint

**Files:**
- Create: `app/api/changelogs/route.ts`

- [ ] **Step 1: Write the endpoint**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { loadData } from "@/lib/store";

export async function GET(_req: NextRequest) {
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
```

- [ ] **Step 2: Verify endpoint compiles**

Run: `npm run build`
Expected: Build succeeds, new route `/api/changelogs` appears

---

### Task 2: Update OpenAPI Docs

**Files:**
- Modify: `app/api/docs/route.ts`

- [ ] **Step 1: Add changelogs schema + endpoint to OpenAPI spec**

Read the current file first:

```bash
type app\api\docs\route.ts
```

Then locate the `paths` object and add the new endpoint. Also add its response schema. Add `/api/changelogs` as an entry in the paths object with GET method, and add the response component.

```typescript
// Inside the paths object, after /api/version_control section:
"/api/changelogs": {
  get: {
    summary: "Changelogs",
    description: "Returns changelogs for all versions, from latest to earliest.",
    responses: {
      "200": {
        description: "Array of changelog entries",
        content: {
          "application/json": {
            schema: {
              type: "array",
              items: { $ref: "#/components/schemas/ChangelogEntry" },
            },
          },
        },
      },
    },
  },
},
```

And add `ChangelogEntry` to `components.schemas`:

```typescript
ChangelogEntry: {
  type: "object",
  properties: {
    versionCode: { type: "integer", description: "Integer version code for comparison" },
    versionName: { type: "string", description: "Human-readable version string" },
    changeLog: { type: "string", description: "Markdown changelog describing what's new in this version" },
    publishedAt: { type: "string", format: "date-time", description: "ISO date when this version was published" },
  },
  required: ["versionCode", "versionName", "changeLog", "publishedAt"],
},
```

- [ ] **Step 2: Verify build still passes**

Run: `npm run build`
Expected: Build succeeds

---

### Task 3: Update Admin API Docs Page

**Files:**
- Modify: `app/admin/api-docs/page.tsx`

- [ ] **Step 1: Add changelogs endpoint card**

Read the current file:

```bash
type app\admin\api-docs\page.tsx
```

Find the endpoints array and add a new entry for `/api/changelogs`:

```typescript
// In the endpoints array, add after the version_control entry:
{
  method: "GET",
  path: "/api/changelogs",
  desc: "Changelogs for all versions (latest + archived)",
  response: `[\n  { "versionCode": 131, "versionName": "1.1", "changeLog": "...", "publishedAt": "2026-06-16T..." }\n]`,
},
```

Also import the `ListOrdered` icon or reuse an existing one — use the `FileText` icon for changelogs.

- [ ] **Step 2: Verify build passes**

Run: `npm run build`
Expected: Build succeeds

---

### Task 4: Improve Admin Updates Page Changelog Display

**Files:**
- Modify: `app/admin/updates/page.tsx`

- [ ] **Step 1: Replace version history list with timeline-style changelog viewer**

Read the current file:

```bash
type app\admin\updates\page.tsx
```

Find the `{history.length > 0 && (...)}` section that renders the version history list. Replace it with an improved timeline-style changelog viewer that shows:

- **Full changelog text** (not truncated) using `whitespace-pre-wrap` to preserve markdown-style line breaks
- Current version shown as first entry with a `Current` badge
- Each entry as a card with version name, code badge, date, and changelog body
- Empty state if no changelogs exist

The replacement code for the changelogs section:

```typescript
{/* ── Changelogs ── */}
{(history.length > 0 || form.changeLog) && (
  <div className="card p-lg mt-lg">
    <div className="flex items-center gap-sm mb-md">
      <FileText size={18} className="text-accent" />
      <h2 className="text-subheading text-ink m-0">Changelogs</h2>
      <span className="badge text-mute bg-surface-raised ml-auto">
        {history.length + (form.changeLog ? 1 : 0)} versions
      </span>
    </div>
    <div className="flex flex-col gap-md">
      {/* Current version (latest, not archived) */}
      {form.changeLog && (
        <div className="card p-md border border-accent/30 bg-accent-soft/30">
          <div className="flex items-center justify-between mb-sm">
            <div className="flex items-center gap-xs">
              <span className="text-body-strong text-ink">
                v{form.latestVersion || "—"}
              </span>
              <span className="badge text-accent bg-accent-soft">Current</span>
              <span className="badge text-mute bg-surface">code {form.latestVersionCode}</span>
            </div>
            <span className="text-caption text-mute">Latest release</span>
          </div>
          <div className="text-body text-ink whitespace-pre-wrap">{form.changeLog}</div>
        </div>
      )}

      {/* Archived versions */}
      {[...history].reverse().map((entry, i) => (
        <div key={`${entry.versionCode}-${i}`} className="card p-md">
          <div className="flex items-center justify-between mb-sm">
            <div className="flex items-center gap-xs">
              <span className="text-body-strong text-ink">v{entry.versionName}</span>
              <span className="badge text-mute bg-surface">code {entry.versionCode}</span>
            </div>
            <span className="text-caption text-mute">
              {new Date(entry.archivedAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
          {entry.changeLog && (
            <div className="text-body text-ink whitespace-pre-wrap">{entry.changeLog}</div>
          )}
          {!entry.changeLog && (
            <p className="text-caption text-mute italic">No changelog recorded</p>
          )}
        </div>
      ))}
    </div>
  </div>
)}

{!history.length && !form.changeLog && (
  <div className="card p-lg mt-lg">
    <div className="flex flex-col items-center justify-center py-xl text-mute">
      <FileText size={32} className="mb-sm opacity-40" />
      <p className="text-body-strong text-ink mb-xxs">No changelogs yet</p>
      <p className="text-caption">Changelogs will appear here when you publish a version</p>
    </div>
  </div>
)}
```

Make sure `FileText` is imported from lucide-react at the top.

- [ ] **Step 2: Verify build passes**

Run: `npm run build`
Expected: Build succeeds

---

### Task 5: Final Verification

- [ ] **Step 1: Run full build**

Run: `npm run build`
Expected: Build succeeds with no errors, all routes listed including `/api/changelogs`
