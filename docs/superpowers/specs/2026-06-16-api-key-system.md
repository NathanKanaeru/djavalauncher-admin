# API Key Authentication System

## Problem
Public endpoints (`/api/version_control`, `/api/announcements`, `/api/hosted`, `/api/download_sources`, `/api/changelogs`) currently require no authentication. Anyone can access them. A complete API key system is needed so admin can generate, manage, revoke, and expire keys from the admin panel.

## Architecture

3-layer defense-in-depth:

| Layer | File | Runtime | Purpose |
|-------|------|---------|---------|
| 1 | `middleware.ts` | Edge | Pre-filter: reject requests without `Authorization: Bearer` header |
| 2 | `lib/api-key.ts` | Edge/Node | Core logic: key generation, SHA-256 hashing, validation |
| 3 | `lib/with-api-key.ts` | Node | HOF wrapper applied to each public route handler |

## Data Model

Add to `lib/types.ts`:

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

Add `apiKeys: ApiKey[]` to `AppData` interface and `defaultAppData()`.

## Key Format & Security

- Format: `dk_` + 40 random hex chars (crypto.getRandomValues) = 43 chars total
- Stored as SHA-256 hash using Web Crypto API (`crypto.subtle.digest`)
- Full key displayed **only once** at creation (mandatory copy dialog)
- `keyPrefix` stores first 8 chars of the key for admin identification

## API Key Validation Flow

```
Client → Authorization: Bearer dk_xxx...
  → 1. Edge middleware: header exists? No → 401
  → 2. Route handler wrapper (withApiKey):
       → Extract Bearer token
       → SHA-256 hash(token)
       → Find matching ApiKey in AppData.apiKeys
       → Check revoked? true → 401
       → Check expired? true → 401
       → Update lastUsedAt (fire-and-forget)
       → Call original handler
```

## Endpoints Protected

All 5 public endpoints get `withApiKey` wrapper:
- `GET /api/version_control`
- `GET /api/announcements`
- `GET /api/hosted`
- `GET /api/download_sources`
- `GET /api/changelogs`

Excluded (still use existing auth):
- `/api/admin/*` — JWT session cookie
- `/api/docs` — OpenAPI spec, intentionally open

## Files Created

| File | Responsibility |
|------|---------------|
| `lib/api-key.ts` | Key gen, hash, validation utilities |
| `lib/with-api-key.ts` | HOF wrapper for route handlers |
| `middleware.ts` | Edge middleware for early header check |
| `app/admin/api-keys/page.tsx` | Admin UI page |

## Files Modified

| File | Change |
|------|--------|
| `lib/types.ts` | Add `ApiKey` interface + `apiKeys` to `AppData` |
| `app/api/admin/data/route.ts` | Persist `apiKeys` field |
| `app/api/version_control/route.ts` | Wrap with `withApiKey` |
| `app/api/announcements/route.ts` | Wrap with `withApiKey` |
| `app/api/hosted/route.ts` | Wrap with `withApiKey` |
| `app/api/download_sources/route.ts` | Wrap with `withApiKey` |
| `app/api/changelogs/route.ts` | Wrap with `withApiKey` |
| `components/sidebar.tsx` | Add "API Keys" nav item |
| `components/bottom-nav.tsx` | Add "API Keys" nav item |
| `components/header.tsx` | Add breadcrumb entry |
| `app/api/docs/route.ts` | Update OpenAPI spec with apiKey security scheme |

## Admin UI — API Keys Page

Features:
- **Table**: Columns: Name, Key Prefix, Status, Created, Expires, Last Used, Actions
- **Status badges**: Active (green), Expired (yellow/amber), Revoked (red)
- **Create modal**: Name input + optional Expiry date picker
- **Full key dialog**: After creation, shows the full key with Copy button and warning
- **Revoke**: Toggle button with confirmation
- **Delete**: Permanent removal with confirmation dialog
- **Empty state**: "No API keys yet" illustration
- **Stats bar**: Total / Active / Expired counts at top

Responsive: table collapses to card stack on mobile (following existing pattern).

## Edge Middleware

`middleware.ts` at project root matches `/api/:path*` excluding `/api/admin/:path*` and `/api/docs`. Checks `authorization` header exists and starts with "Bearer ". If not, returns 401 JSON. If yes, passes through.

```typescript
// matches /api/ but not /api/admin/ or /api/docs
if (pathname.startsWith("/api/") && !pathname.startsWith("/api/admin/") && pathname !== "/api/docs") {
  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    return NextResponse.json({ error: "API key required" }, { status: 401 });
  }
}
```

## OpenAPI Docs

Add `apiKey` security scheme (type: apiKey, in: header, name: Authorization) to `app/api/docs/route.ts`. Add `security` requirement to all public endpoint definitions.

## Backward Compatibility

This is a breaking change — existing clients without API keys will get 401. The admin must create at least one key before the public endpoints become accessible.
