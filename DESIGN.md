# Mintables Design System

The studio is presented as a browser-based desktop environment. The goal is for every surface to feel like it belongs to the same OS — not a mix of "marketing landing page" and "web app." This file is the source of truth for the visual direction. When in doubt, default to "what would macOS / iPadOS / Windows 11 do?" — not "what would a marketing site do?"

The runtime structure (routes, contracts, etc.) lives in `CLAUDE.md`. This file is just about **how things look and feel**.

---

## North star

- **The OS is the product.** The desktop, dock, windows, dialogs, and folders are not chrome around a webapp — they *are* the app. Don't compete with the OS metaphor.
- **Native over novel.** Match conventions from macOS / iPadOS / Windows 11. Familiarity is more valuable than flair here.
- **Material does the work.** Most "decoration" comes from frosted glass + light + shadow, not from gradients, borders, or illustrations.
- **Color signals identity, not mood.** Each app owns one accent. The wallpaper carries the mood.
- **Motion is short and physical.** ~200–420 ms. No bouncy springs. No looping idle animations on UI (the wallpaper is the only thing that lives).

---

## Color

### Brand palette (use sparingly, mostly in dock + brand surfaces)

| Token | Hex | Role |
| --- | --- | --- |
| `brand.teal` | `#5a9a9d` | Primary brand accent, Tubes generator accent |
| `brand.violet` | `#7c66f5` | Secondary brand accent, Welcome dialog |
| `brand.purple` | `#a855f7` | Adapters generator accent |
| `brand.pink` | `#ec4899` | Tertiary brand pop |
| `brand.blue` | `#3b82f6` | System-folder accent (Downloads) |

The **Mintables brand gradient** (`#5cb6b9 → #7c66f5 → #ec4899` at 140–155°) is used **only** on the hub Home dock tile, the Welcome dialog hero icon, and the desktop brand title. Don't sprinkle gradients elsewhere — they read as web marketing, not OS.

### Surface tokens (the dark glass system)

| Surface | Spec |
| --- | --- |
| Wallpaper fallback | `#0a0c1a` (under the photo) |
| Window paper | `rgba(20, 22, 32, 0.92)` + `blur(28px) saturate(160%)` |
| Title bar / dialog header | `rgba(30, 32, 42, 0.7)` + `blur(16px) saturate(150%)` |
| Dock | `rgba(24, 26, 38, 0.58)` + `blur(28px) saturate(170%)` |
| Menu bar | `rgba(14, 16, 26, 0.65)` + `blur(22px) saturate(160%)` |
| Context menu | `rgba(28, 30, 42, 0.96)` + `blur(20px) saturate(160%)` |
| Subtle dividers | `rgba(255, 255, 255, 0.06)` |
| Subtle borders | `rgba(255, 255, 255, 0.08–0.10)` |
| Selection highlight | `rgba(120, 160, 220, 0.22)` (rises to `0.28` when active/hovered) |

### Semantic colors

| Token | Hex | Role |
| --- | --- | --- |
| Success / online dot | `#22c55e` |
| Warning | `#f59e0b` |
| Danger / destructive action | `rgba(248, 113, 113, 0.95)` (text) / `#ff5f57` (traffic light) |
| Info dot | `#3b82f6` |

### Per-app accent

Every generator has a unique `meta.accent` hex. The accent drives:

- The dock tile gradient (lightened top → accent → darkened bottom)
- The AppWindow top-edge accent line (1px gradient `transparent → accent → transparent`)
- The active-app indicator dot in the menu bar
- The running-indicator dot under the active dock tile (always white at 85%)

Pick a new accent that's **visually distinct** from existing ones (no two tiles should read as the same color at a glance).

---

## Typography

- **Sans body:** Geist Sans (loaded in `apps/studio/app/layout.tsx`).
- **Mono accent:** Geist Mono (`var(--font-geist-mono)`) for code-flavored bits — version strings, file metadata, the "Formerly tubecraft.saschb2b.com" caption.

### Scale (what's used where)

| Use | Size | Weight | Notes |
| --- | --- | --- | --- |
| Window title | `0.74 rem` | 600 | In the title bar |
| Dialog body | `0.83 rem` | 400 | `lineHeight: 1.65`, `color: text.secondary` |
| Dialog headline | `1.05 rem` | 700 | `letterSpacing: -0.01em` |
| Section label | `0.62–0.68 rem` | 600 | `letterSpacing: 0.6`, `textTransform: uppercase`, `text.secondary` |
| File-explorer item name | `0.74 rem` | 500 |  |
| Status bar | `0.7 rem` | 400 | `text.secondary` |
| Menu items | `0.78 rem` | 400 |  |
| Keyboard hints | `0.72 rem` | 400 | `text.secondary`, right-aligned in menu rows |

**Text alignment rule:** UI copy (paragraphs, body text inside dialogs and panels) is **left-aligned**. Only one-line headlines, brand marks, and traffic-light/icon rows are centered. Body paragraphs *justified* or *center-aligned* read like a magazine, which fights the OS feel.

**Punctuation rule:** No em dashes in UI copy. Use periods, commas, or colons. Em dashes look literary; OS dialogs use simple punctuation.

**Gradient text:** Reserved for the brand mark only (the desktop "Mintables" title, the Welcome hero). Body copy, headlines inside dialogs, and item names are **flat color** (`text.primary`).

---

## Materials

### Frosted glass (the OS surface)

Every chrome surface uses this recipe:

```ts
bgcolor: "rgba(<dark-tint>, <0.55–0.95>)",
backdropFilter: "blur(<16–28>px) saturate(140–170%)",
WebkitBackdropFilter: "<same>",  // safari prefix is mandatory
border: "1px solid rgba(255, 255, 255, 0.06–0.10)",
```

Higher opacity (0.85+) for modal surfaces, lower (0.55–0.7) for non-blocking chrome (dock, menu bar, title bars).

### Shadows

We use stacked drop shadows, never neon glows:

| Surface | Recipe |
| --- | --- |
| Window | `0 36px 80px -22px rgba(0,0,0,0.65), 0 8px 24px -6px rgba(0,0,0,0.35)` |
| Dialog | `0 40px 90px -22px rgba(0,0,0,0.75), 0 10px 28px -8px rgba(0,0,0,0.4)` |
| Dock | `0 28px 60px -20px rgba(0,0,0,0.7), 0 4px 12px -4px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.07)` |
| Dock tile | `0 10px 22px -8px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.10), inset 0 -2px 4px rgba(0,0,0,0.18)` |

Inset 1px white highlights on tiles are fine; **never** add an outer glow ring to a window/dialog — it reads as a focus ring and breaks immersion.

### Corner radius

- AppWindow: `~24px` (`borderRadius: 3`) on `sm+`, smaller on mobile
- DialogWindow: `~20px` (`borderRadius: 2.5`)
- Dock pill: `28px` (`borderRadius: 3.5`)
- Dock tile: **squircle** via `borderRadius: 22%` (continuous-curvature feel)
- Desktop folder body: rounded path drawn in SVG
- File icons in explorer / dock tile glyphs: `8–12px` (`borderRadius: 0.75–1.25`)
- Inline UI controls (buttons, search box): `8px`

Squircle (`%` radius) is reserved for dock tiles and large brand-icon hero. Everything else uses standard rounded rect.

---

## Components

### AppWindow (`packages/shared/src/ui/app-window.tsx`)

The window chrome that wraps generator routes.

- Floats on the desktop with substantial margins (`mx: 24–48px`, `mt: 12px`, `mb: 88–104px` to clear the dock)
- Top edge: 2px gradient accent line (color = app accent)
- Title bar (34px): traffic lights left, centered icon + title + subtitle
- Traffic lights are **functional**: red = close → `/`, yellow = minimize-to-dock-tile (genie animation), green = maximize / restore (ESC restores)
- Hover any light to reveal × / − / ⤢ glyphs on **all three** at once (macOS group-hover)
- Open animation: `420ms cubic-bezier(0.2, 0.85, 0.25, 1)`, `translateY(8px) scale(0.985) → 0,1`

### DialogWindow (`packages/shared/src/ui/dialog-window.tsx`)

The OS-window-styled modal. Use this instead of a bare MUI Dialog for any dialog the user is going to see.

- Same chrome as AppWindow: title bar, traffic lights, accent edge, frosted paper, layered shadow
- Only the red traffic light is functional. Yellow and green are dimmed (`opacity: 0.55`) — mirrors "About This Mac"
- The paper's `outline` is explicitly suppressed so the autofocus doesn't surface a focus ring around the whole dialog
- Open animation: `360ms cubic-bezier(0.2, 0.85, 0.25, 1)`, gentler than AppWindow

### Dock + dock tiles (`packages/shared/src/ui/app-dock.tsx`)

- Apps only — Home + generators. External links / info live as desktop icons.
- Tile is a squircle (`borderRadius: 22%`), filled with the app's accent gradient (lightened top → accent → darkened bottom).
- Top sheen + bottom inner shadow pseudo-elements give the tile depth.
- Custom `iconArt` SVG per app (a real subject illustration, not a generic line icon).
- Active running indicator: small white dot (`5×5`) under the tile.
- Hover: lift `-6px` + scale `1.08` + colored glow.

### Desktop icons (`packages/shared/src/ui/desktop-icon.tsx`)

- Intentionally a **different visual species** from dock tiles — small frosted dark "document" tile with the icon drawn on it. Don't blur the line.
- Used for static links (README.md, LICENSE.txt, GitHub.url, Sponsor.url).
- External links get a small "shortcut arrow" badge overlay in the bottom-right corner.
- Strong layered text shadow on the label so it reads on any wallpaper region.

### Desktop folders (`packages/shared/src/ui/desktop-folder.tsx`)

- Real folder shape drawn as inline SVG (back sheet + tabbed front sheet, top sheen).
- Accent-tinted (blue for Downloads, purple for Presets).
- Distinctly *not* the same visual as a desktop icon, so files and folders read as different file-system citizens.

### Menu bar (`packages/shared/src/ui/app-header.tsx`)

- 30px slim strip at the top.
- Brand wordmark left, active-app indicator center-left, status cluster (green "Local" dot + live clock) right.
- Never embed page-specific actions here.

### FileExplorer (`packages/shared/src/ui/file-explorer.tsx`)

See `CLAUDE.md` § "FileExplorer interaction model" for the behavior contract. Visually:

- Toolbar uses subtle frosted-strip bg (`rgba(255,255,255,0.02)`)
- Status bar uses darkened bg (`rgba(0,0,0,0.18)`)
- Selected items show the selection highlight (`rgba(120, 160, 220, 0.22)`)
- Context menu uses the higher-opacity frosted material (`rgba(28, 30, 42, 0.96)`)

---

## Motion

Every animation in the OS is functional — it tells the user what just happened. We don't have ambient/idle motion on UI elements (the wallpaper is the only thing that drifts).

| Event | Curve | Duration |
| --- | --- | --- |
| Window open | `cubic-bezier(0.2, 0.85, 0.25, 1)` | 420 ms |
| Dialog open | `cubic-bezier(0.2, 0.85, 0.25, 1)` | 360 ms |
| Window close (fade) | `ease-in` | 220 ms |
| Window minimize (genie to dock) | `cubic-bezier(0.55, 0, 0.85, 0.1)` | 400 ms |
| Window maximize / restore | `cubic-bezier(0.2, 0.8, 0.2, 1)` on `margin` | 300 ms |
| Dock tile hover | `cubic-bezier(0.2, 0.8, 0.2, 1)` | 240 ms |
| Desktop icon appear | `cubic-bezier(0.2, 0.8, 0.2, 1)` | 700 ms (staggered) |
| File-explorer item hover/select | `ease` | 120 ms |
| Tooltip enter | `ease` | 120 ms after a 150–250 ms delay |
| Cursor parallax (wallpaper) | `cubic-bezier(0.2, 0.8, 0.2, 1)` | 700 ms |

Easing rule: prefer `cubic-bezier(0.2, 0.8–0.85, 0.2–0.25, 1)` for "land softly" feels (open / arrive). Use `ease-in` for "leave fast" (close). Skip bouncy/elastic curves entirely.

---

## Copy & tone

- **Plain prose, system tone.** Like a settings dialog, not a launch landing page.
- **No em dashes.** Use periods, commas, or colons.
- **No "Unlock", "Discover", "Get started" marketing verbs** in body copy.
- **Status text** in the status bar reads like a sentence fragment ("3 items · 2 selected"), not a label ("Items: 3 / Selected: 2").
- **Filenames as titles.** Dialogs and folder windows use filename-style titles where appropriate (`README.md`, `Welcome.txt`, `LICENSE.txt`) — leans into the OS metaphor.
- **Tooltips are nouns or short verbs.** "Close", "Minimize", "Open in app", "Re-download" — not "Click to close the window".

---

## Don't-do list

Things that look correct in a one-off mockup but break the OS feel across the product. If you find yourself reaching for one of these, stop and find another way.

- ❌ **Centered body paragraphs.** Marketing pattern. Left-align in any dialog or panel.
- ❌ **Gradient text on body content.** Brand gradient is for the brand mark *only*.
- ❌ **Em dashes (—) in UI copy.**
- ❌ **Outer glow rings** on windows or dialogs. Reads as a focus indicator; use proper drop shadows.
- ❌ **Browser focus ring on a Dialog Paper.** Suppress with `outline: none` on the paper — focus goes to interactive children instead.
- ❌ **Dot grid / graph paper** on the wallpaper. Real OS wallpapers are photographic or flowing color, never developer-tool aesthetics.
- ❌ **Looping idle animations on UI** (pulsing dots, bobbing icons, rotating accents). The wallpaper drifts; the UI stays still.
- ❌ **Sticky scrolling pages on the desktop or any "window."** Fixed viewport, no outer scroll. Only sidebar/list content scrolls internally.
- ❌ **Adding apps to the dock that aren't apps.** GitHub / license / sponsor / about belong on the desktop as files, not as dock tiles.
- ❌ **Throwing a Lucide icon on a colored circle** and calling it a dock tile. Each app earns a unique `iconArt` SVG with depth.
- ❌ **Multi-step modal tours.** One-screen welcome only. Use README.md / About for re-reading.
- ❌ **"Don't show again" checkboxes** on first-run dialogs. Modern pattern is implicit permanent dismissal; the user can re-trigger from the README.md ▸ "Take the tour again" link.
- ❌ **Toast-style notifications for non-events** (e.g. "viewing the dashboard"). Toasts confirm actions, not state.

---

## When in doubt

1. Open the relevant macOS/iPadOS/Windows 11 surface. Replicate the *feeling* (material, hierarchy, restraint) — adapt the specifics.
2. Read the relevant section in `CLAUDE.md` to confirm the architectural contract is preserved.
3. If you're adding a new surface, document its tokens here.
