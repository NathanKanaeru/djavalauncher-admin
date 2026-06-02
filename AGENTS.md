# DjavaLauncher Admin

Next.js 15 (App Router) admin panel for a SA-MP mobile launcher. TypeScript strict, Tailwind CSS 3 with Material Design 3 dark theme, Vercel KV (Redis) persistence.

## Commands

```sh
npm run dev      # next dev
npm run build    # next build
npm run lint     # next lint
npx tsc --noEmit # typecheck (no script in package.json)
```

No tests exist in the project.

## Required env vars

| Var | Purpose |
|---|---|
| `ADMIN_PASSWORD` | Login password. If unset, **any password is accepted** (dev convenience, see `lib/auth.ts:25`). |
| `ADMIN_SECRET` | JWT signing secret (HS256). |
| `VERCEL_KV_URL` | Redis connection string. Only needed for persistent storage -- falls back to in-memory (lost on restart). |

Copy `.env.local.example` to `.env.local` to start.

## Architecture

- **Single monolithic data store** (`lib/store.ts`). All admin CRUD operations follow the same pattern: `GET /api/admin/data` → mutate the `AppData` object in JS → `PUT /api/admin/data`. No granular sub-resource endpoints exist.
- **Auth**: JWT via `jose` (HS256), 24h expiry, `session` httpOnly cookie. Admin layout (`app/admin/layout.tsx`) calls `GET /api/admin/verify` on mount as an auth guard.
- **Public API** (4 GET endpoints): `version_control`, `announcements`, `hosted`, `download_sources` — all strip internal `id` fields before responding.
- **Persistence**: `@vercel/kv` (Redis) when `VERCEL_KV_URL` is set; in-memory fallback locally. Data is lost on server restart without KV.
- Path alias `@/*` → root directory. Use `@/lib/auth`, `@/lib/store`, `@/lib/types`.

## Quirks

- Tailwind `content` glob in `tailwind.config.ts` references `./components/**/*` but **no `components/` directory exists**; all UI is inline in `app/` page files.
- `app/admin/*/page.tsx` are all client components (`"use client"`).
- No codegen, no migrations, no external services (beyond optional Redis).
- Deployed via Vercel (`vercel.json` with `next build` / `npm install`).
