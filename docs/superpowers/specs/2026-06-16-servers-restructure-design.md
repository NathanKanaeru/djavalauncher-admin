# Servers Restructure: Official + Featured

## Overview
Restructure the servers system: single Official server (milik sendiri) + multiple Featured/Partner servers. Both use sampquery auto-fetch: admin only inputs IP:port, backend queries SA-MP server details automatically.

## Data Model

### New `ServerEntry` type (`lib/types.ts`)
```typescript
interface ServerEntry {
  id?: string;              // only for featured
  ip: string;
  port: number;
  hostname: string;         // auto-fetched
  players: number;          // auto-fetched
  maxplayers: number;       // auto-fetched
  mode: string;             // auto-fetched
  language: string;         // auto-fetched
}
```

### AppData changes
- Add `officialServer: ServerEntry | null`
- Rename `hostedServers` → `featuredServers: ServerEntry[]`
- Remove `description`, `featuredBanner` from server model

### defaultAppData() updates
```typescript
{
  ...existing,
  officialServer: null,
  featuredServers: [],
}
```

## API Endpoints

### New: `POST /api/admin/server-query`
- Auth: JWT session (admin only)
- Body: `{ ip: string, port: number }`
- Action: Uses `samp-query` library to query SA-MP server via UDP
- Response: `{ hostname, players, maxplayers, mode, language }` or error
- Node.js runtime (UDP via `dgram`), not Edge

### New: `GET /api/servers/official`
- Auth: API key (same middleware + HOF pattern)
- Returns: `ServerEntry | null` (official server, no `id` field)
- Strips `id` field if present

### New: `GET /api/servers/featured` (replaces `/api/hosted`)
- Auth: API key
- Returns: `ServerEntry[]` (featured servers, sans `id`)
- Same location pattern as existing `/api/hosted`

### Remove: `app/api/hosted/route.ts`

## Admin UI (`/app/admin/servers/page.tsx`)

Single page with two sections:

### 1. Official Server Section
- If `officialServer` is null: show "Set Official Server" prompt
  - IP input + Port input
  - "Fetch Details" button → calls `POST /api/admin/server-query`
  - Preview card showing fetched details (hostname, players, mode, language)
  - "Save" button
- If `officialServer` exists:
  - Card showing server details with IP:Port, hostname, players, mode, language
  - "Edit" and "Remove" buttons
  - Edit opens the form pre-filled

### 2. Featured Servers Section
- Data table: IP:Port, Hostname, Players, Mode, Language, Actions (Delete)
- "Add Featured Server" button → modal with IP:Port input + auto-fetch
  - Modal: IP input, Port input, "Fetch & Add" queries server then adds to list
- Delete with inline confirmation

### Sampquery Integration
- `npm install samp-query` (or compatible)
- Wrapped in `POST /api/admin/server-query` route
- Returns 400 if server unreachable
- Timeout after 5s

## Middleware
- `middleware.ts` already excludes `/api/servers/*` from middleware auth? No — `/api/servers/*` needs API key check. Update middleware: public API routes include `/api/servers/` automatically since pattern is `/api/:path*` and only `/api/admin/*` + `/api/docs` are excluded.
- Actually, wait: `/api/servers/` is a `GET` public API endpoint. The middleware already checks for API key on all `/api/*` paths except `/api/admin/*` and `/api/docs`. So `/api/servers/*` is already covered and will require API key. Good.

## OpenAPI Docs
- Add `/api/servers/official` and `/api/servers/featured` paths to `app/api/docs/route.ts`
- Add `ServerEntry` and `ServerEntryPublic` schemas
- Remove deprecated `/api/hosted` from docs

## Migration
- Existing data in KV with `hostedServers` field: after deploy, admin needs to manually re-add servers
  - `loadData()` merge with defaults ensures no crash: `featuredServers: []` will be used if `hostedServers` missing
  - Old `hostedServers` data is effectively orphaned in KV
  - No automatic migration needed — admin re-enters via new UI
