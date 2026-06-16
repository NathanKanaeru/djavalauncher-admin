# Admin Redesign — Vercel-Inspired Dark Theme

Adapting `DESIGN.md` (Vercel design language) to the DjavaLauncher admin panel as a dark variant.

## 1. Color Palette

| Token | Hex | Usage |
|---|---|---|
| `page-bg` | `#0a0a0a` | Page body background (replaces `canvas-soft`) |
| `surface` | `#111111` | Cards, panels, content containers (replaces `canvas`) |
| `surface-raised` | `#1a1a1a` | Inset surfaces, hover states, dropdowns (replaces `canvas-soft-2`) |
| `sidebar-bg` | `#000000` | Sidebar background |
| `header-bg` | `#000000` | Top header bar |
| `ink` | `#ededed` | Primary text |
| `body` | `#888888` | Secondary text |
| `mute` | `#555555` | Disabled, placeholder, lowest priority |
| `accent` | `#0070f3` | Links, active states, focus rings |
| `accent-soft` | `#001a33` | Soft accent background (active nav item) |
| `accent-hover` | `#0761d1` | Link hover/pressed |
| `hairline` | `#222222` | Borders, dividers, card edges |
| `hairline-strong` | `#333333` | Stronger borders |
| `error` | `#ee0000` | Destructive actions, delete buttons |
| `error-soft` | `#2a0000` | Error state background |
| `warning` | `#f5a623` | Warning indicators |
| `warning-soft` | `#1a1400` | Warning background |
| `selection-bg` | `#ededed` | Text selection background |
| `selection-fg` | `#0a0a0a` | Text selection foreground |

## 2. Typography

Font stack: `Geist, Inter, system-ui, -apple-system, sans-serif`
Mono stack: `Geist Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, monospace`

| Token | Size | Weight | Line H | Tracking | Use |
|---|---|---|---|---|---|
| `display` | 28px | 600 | 36px | -1.12px | Page titles (h1) |
| `heading` | 20px | 600 | 28px | -0.6px | Card/section headings (h2) |
| `subheading` | 16px | 500 | 24px | 0 | Sub-headings, card titles |
| `body` | 14px | 400 | 20px | -0.28px | Body text, nav links |
| `body-strong` | 14px | 500 | 20px | -0.28px | Button labels, emphasis |
| `caption` | 12px | 400 | 16px | 0 | Metadata, timestamps |
| `caption-mono` | 12px | 400 | 16px | 0 | Technical labels, API text |
| `button-md` | 14px | 500 | 20px | 0 | Small/pill buttons |

All headings: sentence-case, no all-caps.

## 3. Spacing System

Base unit: 4px.

| Token | Value |
|---|---|
| `xxs` | 4px |
| `xs` | 8px |
| `sm` | 12px |
| `md` | 16px |
| `lg` | 24px |
| `xl` | 32px |
| `2xl` | 40px |
| `3xl` | 48px |
| `4xl` | 64px |

## 4. Elevation / Shadows

Stacked shadow approach (Vercel style — multiple small offsets, never one heavy drop).

| Level | Shadow | Use |
|---|---|---|
| Level 1 | `0px 1px 1px rgba(0,0,0,0.05), 0px 2px 2px rgba(0,0,0,0.1)` | Default cards |
| Level 2 | `0px 2px 2px rgba(0,0,0,0.1), 0px 8px 8px -8px rgba(0,0,0,0.1)` | Raised cards (hover), modals |
| Level 3 | `0px 1px 1px rgba(0,0,0,0.05), 0px 8px 16px -4px rgba(0,0,0,0.1), 0px 24px 32px -8px rgba(0,0,0,0.15)` | Modals, dropdown menus |

Inset hairline on all cards: `0 0 0 1px rgba(255,255,255,0.06)` (or `inset 0 0 0 1px #222`).

## 5. Shapes / Border Radius

| Token | Value | Use |
|---|---|---|
| `radius-xs` | 4px | — |
| `radius-sm` | 6px | Form inputs, nav buttons |
| `radius-md` | 8px | Cards, containers |
| `radius-lg` | 12px | Larger cards, modals |
| `radius-pill` | 100px | Primary/secondary action buttons |

## 6. Components

### 6.1 Sidebar
- Fixed left, width: 240px expanded / 64px collapsed
- Background: `#000000`, right border: `1px solid #222`
- Logo area at top (40px logo + app name when expanded, logo-only when collapsed)
- Nav items: `14px` body text, `#888` default, `#ededed` active, `8px` horizontal padding
- Active item: `#001a33` background, `3px` left accent border in `#0070f3`
- Hover: background `#111`
- Collapse toggle at bottom with smooth width transition

### 6.2 Top Header
- Fixed top, height: 64px
- Background: `#000000`, bottom border: `1px solid #222`
- Breadcrumb trail on left (caption-mono style, `#555` → `#888` → `#ededed` active)
- Logout button on right (secondary button style)
- Z-index above content but below modals

### 6.3 Buttons

| Variant | BG | Text | Border | Radius |
|---|---|---|---|---|
| Primary | `#ffffff` | `#171717` | None | 100px pill |
| Secondary | Transparent | `#ededed` | `1px solid #333` | 100px pill |
| Destructive | `#ee0000` | `#ffffff` | None | 100px pill |
| Ghost | Transparent | `#888` | None | 6px |
| Icon | Transparent | `#888` | `1px solid #222` | 9999px circle |

All buttons: font `button-md` (14px/500). Padding: vertical 6-8px, horizontal 16px.
Hover: slight brightness shift. Active/press: `scale(0.97)`.

### 6.4 Form Inputs
- Background: transparent (or `#0a0a0a`)
- Border: `1px solid #222` (default), `1px solid #0070f3` (focus)
- Radius: `6px` (radius-sm)
- Height: 40px (default), 48px (large), 32px (small)
- Font: `body` (14px)
- Focus ring: `0 0 0 2px rgba(0,112,243,0.15)` + border color change
- Textarea: same styling, min-height 80px, vertical resize

### 6.5 Cards
- Background: `#111`, radius: `8px`, padding: `24px`
- Border: `1px solid #222` (hairline)
- Shadow: Level 1 (stacked)
- Hover: Level 2 shadow + slight `translateY(-1px)`

### 6.6 Data Table (Servers page)
- Header row: mono uppercase style (`caption-mono`, `#555`)
- Body rows: `body` (14px, `#888`)
- Row hover: background `#1a1a1a`
- Row border: bottom `1px solid #222`
- Sortable column headers with click handler
- Action buttons (Edit/Delete) at end of each row

### 6.7 Modal / Confirmation Dialog
- Overlay: backdrop with `rgba(0,0,0,0.6)` + blur
- Dialog card: background `#111`, radius `12px`, padding `32px`
- Shadow: Level 3
- Animation: fade + scale(0.95→1) in 200ms
- Title + description + action buttons (Destructive + Secondary)

### 6.8 Toast Notifications
- Slide-in from top, 300ms
- Background: `#111`, border: `1px solid #222`
- Shadow: Level 2
- Icon + message + dismiss button
- Auto-dismiss after 3s

### 6.9 Breadcrumbs
- Mono style (`caption-mono`, 12px)
- Separator: `›` or chevron, `#555`
- Active (last) item: `#888`
- Clickable ancestors: `#555` hover → `#888`

### 6.10 Empty States
- Centered layout with large icon (Lucide) in `#333`
- Heading: `heading` (20px), `#888`
- Description: `body` (14px), `#555`
- CTA button below

### 6.11 Loading / Skeleton
- Pulse animation (opacity 0.3→1 cycle, 1.5s)
- Card skeleton: `#1a1a1a` rounded rectangle
- Text skeleton: shorter `#1a1a1a` rounded bars
- Table skeleton: repeating row placeholders

## 7. Icon Pack

**Lucide** installed via `lucide-react` (npm package).
Icons used per page:

| Page | Icon (Lucide) |
|---|---|
| Dashboard | `LayoutDashboard` |
| Updates | `RefreshCw` |
| Announcements | `Megaphone` |
| Servers | `Server` |
| Game Data | `Database` |
| Add action | `Plus` |
| Edit action | `Pencil` |
| Delete action | `Trash2` |
| Expand sidebar | `PanelLeftOpen` / `PanelLeftClose` |
| Empty state | `Inbox` |
| Logout | `LogOut` |

## 8. Animations

| Animation | Element | Duration | Timing |
|---|---|---|---|
| Page fade-in | Main content on route | 200ms | ease-out |
| Sidebar collapse | Sidebar width | 250ms | ease-in-out |
| Card hover lift | Cards, table rows | 150ms | ease-out |
| Button press | All buttons | 100ms | ease-in |
| Modal enter | Modal + overlay | 200ms | ease-out |
| Toast slide-in | Toast notification | 300ms | ease-out |
| List stagger | Cards/rows mount | 100ms each, 50ms delay | ease-out |
| Skeleton pulse | Loading state | 1.5s | ease-in-out infinite |
| Focus ring | Form inputs | 150ms | ease-out |

## 9. Responsive

| Breakpoint | Width | Changes |
|---|---|---|
| Mobile | < 768px | Sidebar → bottom nav bar (fixed, 5 icons). Cards → 1-up. Forms full-width. |
| Tablet | 768-1023px | Sidebar collapsed by default (icon mode). 2-up grid for stat cards. |
| Desktop | ≥ 1024px | Full sidebar (240px). 4-up stat grid. Data tables full width. |

Touch targets: minimum 44x44px on mobile.

## 10. File Changes

### Modified files (visual only, no logic changes):
- `tailwind.config.ts` — redesign with new palette, typography, spacing, shadows
- `app/globals.css` — remove MD3 variables, add Vercel token CSS variables, animations
- `app/layout.tsx` — add Geist/Inter font loading
- `app/admin/layout.tsx` — new header + collapsible sidebar with Lucide icons
- `app/admin/page.tsx` — Dashboard with skeletons, stat cards, Lucide icons
- `app/admin/updates/page.tsx` — form restyled, Lucide icons
- `app/admin/announcements/page.tsx` — card list restyled, Lucide icons, empty state
- `app/admin/servers/page.tsx` — data table replaces card list, search/filter, Lucide icons
- `app/admin/game-data/page.tsx` — form restyled, source badges, Lucide icons
- `app/login/page.tsx` — login card restyled to Vercel dark
- `app/page.tsx` — no change (still redirects to /login)
- `package.json` — add `lucide-react` dependency

### Unchanged files (zero logic modification):
- All API routes in `app/api/`
- All `lib/` files (types, store, auth)
- `next.config.js`, `postcss.config.js`, `tsconfig.json`, `vercel.json`

## 11. Implementation Order

1. Install `lucide-react`, update `tailwind.config.ts`, add CSS variables + animations to `globals.css`
2. Build shared components: sidebar, header, card, button, input, modal, toast, table, skeleton, empty-state, breadcrumb
3. Redesign login page
4. Redesign admin layout (sidebar + header)
5. Redesign dashboard page
6. Redesign updates page
7. Redesign announcements page
8. Redesign servers page (with data table)
9. Redesign game-data page
10. Verify: `npm run lint` + `npx tsc --noEmit`
