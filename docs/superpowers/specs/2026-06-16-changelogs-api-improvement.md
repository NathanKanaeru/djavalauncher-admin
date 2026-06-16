# Changelogs API & Admin UI Improvement

## Problem
The public API only exposes the latest version's changelog (`GET /api/version_control`). Users cannot see changelogs for previous versions. The admin panel's Updates page shows version history in a minimal list without full changelog visibility.

## Scope
Single feature: add a public changelogs endpoint + improve the admin changelog display. No new nav items, no restructuring.

## Design

### 1. `GET /api/changelogs` (new public endpoint)

Returns all version changelogs (current latest + archived) as a flat array, sorted by versionCode descending. Internal `id` fields are stripped.

**Response shape:**
```jsonc
[
  {
    "versionCode": 131,
    "versionName": "1.1",
    "changeLog": "- New features\n- Bug fixes",
    "publishedAt": "2026-06-16T10:00:00.000Z"
  },
  {
    "versionCode": 130,
    "versionName": "1.0",
    "changeLog": "Initial release",
    "publishedAt": "2026-06-15T08:00:00.000Z"
  }
]
```

- Latest version is always the first entry in the response
- For the latest (unarchived) entry, `publishedAt` = `lastUpdatedAt` from AppData, or current time if unset
- For archived entries, `publishedAt` = `archivedAt`
- At minimum returns `[{ versionCode: 0, versionName: "", changeLog: "", publishedAt: "" }]` if no data exists

### 2. Admin UI — Updates Page Changelogs Section

Replace the compact version history list below the form with a **timeline-style changelog viewer**:

- "Changelogs" heading with count badge
- Each version is a card with:
  - Version name + code badge on the left
  - Published date on the right
  - **Full changelog text** rendered below (not truncated, using pre-wrap or whitespace-preserving div)
  - Visual separator between entries
- The latest (current) version is also shown as the first entry, with a "Current" badge
- If no changelogs exist (no history + no changelog), show an empty state

### 3. OpenAPI Docs

Add `/api/changelogs` to `/api/docs` route and `/admin/api-docs` page:

- Summary: "Changelogs"
- Description: "Returns changelogs for all versions, from latest to earliest"
- Response schema: array of `{ versionCode, versionName, changeLog, publishedAt }`

### 4. No Changes
- Sidebar/bottom-nav unchanged
- No new nav items
- `GET /api/version_control` remains unchanged (backward compatible)

## Data Flow

```
Admin saves version form
→ Auto-archives previous version to AppData.versionHistory[]
→ Sets AppData.lastUpdatedAt = now
→ AppData.version.changeLog holds the latest

GET /api/changelogs
→ Load AppData
→ Build changelog entries: [latest from version, ...archived from versionHistory]
→ Strip internal fields, sort desc by versionCode
→ Return JSON array
```

## Files Changed
- `app/api/changelogs/route.ts` — new file
- `app/api/docs/route.ts` — add /api/changelogs to OpenAPI spec
- `app/admin/api-docs/page.tsx` — add /api/changelogs to UI
- `app/admin/updates/page.tsx` — improve changelog display
