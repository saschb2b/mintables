# Mintables

Monorepo of browser-based, parametric 3D generators for printable parts. Each generator (`tubes`, `adapters`, …) is its own package; they share a single Next.js shell that frames them inside an **OS-style desktop UI** — menu bar at the top, dock at the bottom, wallpaper behind, and each generator opens as a floating "window" on the desktop.

## Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **UI**: Material UI v7 (dark theme — see `packages/shared/src/lib/theme.ts`)
- **3D**: React Three Fiber + Three.js + @react-three/drei
- **Geometry**: Shared triangle mesh — preview + STL/3MF export both run `generator.geometry(config)`
- **Tests**: Vitest (per-package)
- **Build orchestration**: Turborepo
- **Package manager**: pnpm workspaces

## Commands (from repo root)

- `pnpm dev` — start the studio dev server (Turbopack)
- `pnpm build` — build everything
- `pnpm typecheck` — TypeScript across all packages
- `pnpm test` — Vitest across all packages
- `pnpm lint` — ESLint across all packages
- `pnpm format:check` — Prettier

## Repo layout

```
apps/
  studio/                              # Next.js app — single deploy, /generators/<id> routes
    app/
      layout.tsx                       # Server layout: metadata, MUI cache provider, <Providers>
      providers.tsx                    # Client OS chrome: AppHeader (menu bar) + DesktopWallpaper
                                       #   + main slot + AppDock (bottom dock). Enforces 100dvh
                                       #   with overflow: hidden — no route scrolls outside.
      page.tsx                         # The desktop: wallpaper + right-column shortcut icons
                                       #   (README / LICENSE / GitHub / Sponsor). No marketing.
      about-dialog.tsx                 # README.md target — frosted glass About modal
      desktop-wallpaper.tsx            # Full-bleed wallpaper layer + vignette
      generators/[generator]/page.tsx  # Dynamic route → <GeneratorPageView>
      generators/[generator]/generator-page-view.tsx  # Wraps shell in <AppWindow>
      folders/downloads/page.tsx       # Downloads folder route
      folders/downloads/downloads-window.tsx  # AppWindow + FileExplorer over local download history
      folders/presets/page.tsx         # Presets folder route
      folders/presets/presets-window.tsx      # AppWindow + FileExplorer over all saved presets
    public/
      wallpaper-mountains.jpg          # The desktop wallpaper image
    lib/registry.ts                    # Imports every generator and exposes bySlug
packages/
  shared/                              # @mintables/shared — generator contract + app shell
    src/
      lib/
        generator.ts                   # Generator<C> contract — the central interface
        theme.ts, analytics.ts, …      # Cross-cutting helpers
        preset-storage.ts              # Generic share-URL + localStorage presets
        download-storage.ts            # Local export history (id, generator, config, format, ts)
        validation/                    # ValidationResult types + field helpers
        geometry/                      # Mesh helpers (utils, analysis, STL binary)
        export/                        # Generic exportModel<C>(generator, config, format)
      ui/                              # Stateless components.
        app-header.tsx                 #   Menu bar — brand left, active app, status + clock right
        app-dock.tsx                   #   Floating bottom dock — Home + per-generator tiles
        app-window.tsx                 #   Window chrome — traffic lights, title bar, animations
        desktop-icon.tsx               #   File-style desktop shortcut (README / LICENSE / .url)
        file-explorer.tsx              #   Finder-style explorer — toolbar, icon/list view, search,
                                       #   sort, multi-action toolbar, status bar. Item-agnostic.
        system-clock.tsx               #   Live menu-bar clock (SSR-safe)
        + generator-grid, dialogs, primitives, validation-banner, …
      shell/                           # GeneratorShell, PreviewPanel, R3F infra
      hooks/
  generators/
    tubes/                             # @mintables/gen-tubes
      src/
        index.ts                       # exports tubeGenerator: Generator<TubeConfig>
        icon-art.tsx                   # SVG dock illustration (isometric tube)
        types.ts, geometry.ts, validation.ts, controls.tsx, scene.tsx, summary.tsx, print-tips.ts, spec.ts
      tests/
    adapters/                          # @mintables/gen-adapters (same shape, icon-art is an elbow)
    dividers/                          # @mintables/gen-dividers (flat slab — thickness × width × height)
```

## The Generator contract

Every generator package exports a single `Generator<Config>` value implementing `packages/shared/src/lib/generator.ts`. The shell consumes:

- `id` / `meta` — route slug, name, icon (`LucideIcon`), tagline, accent, **optional `iconArt`** (per-app SVG subject illustration for the dock)
- `defaults`, `decode(raw)` — for hydration from defaults / URL / preset
- `validate(c)` → `ValidationResult` — drives error banner + disables export
- `geometry(c)` → `TriangleMesh` — single source for preview AND export
- `axis: "z-up" | "y-up"` — passed to `trianglesToBufferGeometry` and the scene
- `filename(c)`, `describe(c)`, `printTips(c)`, `badges?(c)` — UI hooks
- `Controls`, `Scene`, `Summary?` — React components (per-generator UI)

The studio app only knows about the registry list. Nothing in `apps/studio` or `@mintables/shared` references a specific generator.

## OS-style desktop UI

The studio is presented as a desktop environment, not a webpage. Anyone changing layout, navigation, or chrome should understand these invariants:

- **Fixed viewport, no scroll.** `apps/studio/app/providers.tsx` sets `height: 100dvh; overflow: hidden` on the outer container. Routes must fit the work area — never add an `overflow: auto` wrapper around the hub or the generator window. The only legitimately scrolling regions are *inside* a window (e.g. the sidebar controls list).
- **Layer order** (painting back→front): wallpaper (z=0) → app content (z=1, e.g. desktop icons or the generator window) → menu bar (z=10, sticky-translucent) → dock (z=1200, position: fixed). Tooltips and dialogs come above all of these via MUI defaults.
- **Wallpaper lives in providers**, not inside any page. It persists across hub + generator routes so generator windows visibly float on top of it. The image is in `apps/studio/public/`.
- **Menu bar = system chrome.** Brand on the left, active-app indicator + tagline center-right, status cluster on the far right (online dot + live `SystemClock`). Never embed page-specific actions here.
- **Dock = apps only.** Home + per-generator tiles. External links and informational shortcuts (GitHub, sponsor, license, about) live as **desktop icons** in `apps/studio/app/page.tsx`, *not* in the dock. System folders (Downloads, Presets) also live as desktop icons, conditionally rendered when their underlying storage is non-empty (see "Desktop folders + FileExplorer").
- **Multiple windows at once.** Generators and folders are real windows: any number can be open simultaneously, dragged around the desktop, focused independently, and minimized to their dock tile. The compositor is `apps/studio/app/window-layer.tsx`, which maps every WM-tracked window to an absolutely-positioned `<AppWindow>` over the wallpaper.
- **WM state lives in `@mintables/shared/lib/window-manager`** (provider mounted in `apps/studio/app/providers.tsx`). Consume it via `useWindowManager()`. Stable window ids come from `windowIdOf(payload)` so two opens with the same payload collapse to one window (focus + restore), matching macOS app-instance behavior.
- **Routes are thin shims.** `/generators/<id>` and `/folders/<kind>` each render `null` and dispatch `openWindow(...)` on mount. The route does not own the window's lifecycle, the WM does. The focused window's path is mirrored to the URL via `router.replace` (see `useFocusUrlSync` in `window-layer.tsx`); when nothing is focused the URL points at `/`.
- **Traffic lights** on every window (`packages/shared/src/ui/app-window.tsx`):
  - **Red (close)** calls `closeWindow(id)`. The window is removed from WM state.
  - **Yellow (minimize)** plays a genie-style scale toward the dock tile rect, then stays in WM as `state: "minimized"`. Restored by clicking its dock tile or via shortcut.
  - **Green (maximize / restore)** toggles the window's bounds to fill the work area. **ESC** restores the focused window from maximized (only the focused window listens).
  - Group-hover and `:focus-within` reveal the × / - / ⤢ glyphs on all three at once.
- **Title bar interactions.** Drag from the title bar to move the window (clamped to the work area). Double-click the title bar to toggle maximize. Clicking anywhere on a window focuses it and bumps its z-index.
- **Dock indicator dot** (`packages/shared/src/ui/app-dock.tsx`):
  - bright + solid for the focused window
  - dim for an open window that is unfocused or minimized
  - hidden when the app is not open
  Clicking a dock tile toggles: open if not running, otherwise focus + restore, otherwise (already focused and visible) minimize. The Home tile minimizes all windows ("Show Desktop").
- **Spotlight** (`packages/shared/src/ui/spotlight.tsx`) is triggered by Cmd/Ctrl+K. It fuzzy-finds generators, presets, and downloads, and activating a result calls `openWindow(...)` (or the equivalent URL push for presets/downloads).
- **Global shortcuts** live in `apps/studio/app/window-shortcuts.tsx`. The component renders `null` and binds a single keydown listener. The modifier is `Cmd` on macOS, `Ctrl` elsewhere (either is accepted). All bindings bail when the event target is an `<input>`, `<textarea>`, or contenteditable element.
  - **Cmd/Ctrl+W** close focused window
  - **Cmd/Ctrl+M** minimize focused window
  - **Cmd/Ctrl+1..9** open / focus / cycle-minimize generator N (1-indexed into `registry.ts`; out-of-range is a no-op)
  - **Cmd/Ctrl+K** Spotlight (handled in `spotlight.tsx`, not by this component)
  - **Cmd/Ctrl+Z / Cmd/Ctrl+Shift+Z** undo / redo of the focused generator's config (handled inside `GeneratorShell`, not by this component)
- **Animation feel.** Windows open with a translateY + scale ease-out. Minimize plays the genie effect toward the matching dock tile. Wallpaper has cursor parallax (~22x16 px shift) and a fade-in. Dock tiles lift on hover. Don't add competing motion or break these.

## Desktop folders + FileExplorer

The desktop "earns" system folders as the user creates state:

- **Downloads** — appears once the first export has been recorded by `recordDownload(...)` in `GeneratorShell.handleDownload`. We don't store the binary file; we keep just enough metadata (generator id, filename, format, config, timestamp) to rebuild it via `exportModel(generator, gen.decode(config), format)`.
- **Presets** — appears once `savePreset(...)` has been called for any generator. Listing all presets across generators is `listAllPresets()`.

Both folders open as routes (`/folders/downloads`, `/folders/presets`) wrapped in `<AppWindow>` so they get the same traffic-light chrome as generator windows. Close returns to the desktop.

Inside each window, the **FileExplorer** (`packages/shared/src/ui/file-explorer.tsx`) renders a Finder-style UI: a chunky toolbar (view toggle icon ↔ list, sort menu, search, contextual action buttons), an optional left **sidebar** (Finder "Favorites" — sibling folders + Home), an icon grid or table body with click-to-sort column headers, a native-feeling right-click context menu, and a footer status bar with a centered item count. Hosts pass in an `items` array of `ExplorerItem`s (`id`, `name`, `kind`, `timestamp`, `icon`, optional `iconSmall` for list view, `subtitle?`, `meta?`), `onOpen(item)`, optional `onRename(item, newName)`, an `actions` array of toolbar buttons, and an optional `sidebar` (sections of `ExplorerSidebarItem`s). Keep FileExplorer item-agnostic — generator-specific concerns (registry lookup, re-download, share-URL building) belong in the host window component. Both folder windows share `apps/studio/app/folders/use-explorer-sidebar.ts` to build the Favorites rail.

### FileExplorer interaction model

Match real OS file managers — drift from this only with a good reason.

- **Selection.** Single click replaces selection; **Cmd/Ctrl-click** toggles an item in/out; **Shift-click** range-selects from the last anchor. Click on empty space deselects. Right-click on a non-selected item promotes it to be the (single) selection before opening the menu.
- **Actions** receive the full selection: `onClick: (items: T[]) => void`. Mark actions that only make sense for a single item with `singleOnly: true` — they're hidden from both the toolbar and the context menu when `items.length > 1`. Mark destructive actions with `danger: true` — they sit below a Divider in the context menu and render in red.
- **Rename.** When the host passes `onRename`, items become renameable via **F2**, the context-menu Rename item, or by selecting "Rename" in the toolbar. The label flips to a focused, controlled `<InputBase>` with the filename *stem* (everything before the last `.`) pre-selected — Enter commits, Escape cancels, blur commits. Hosts decide what "rename" actually mutates (filename for downloads, display name for presets).
- **Context menu.** Right-click on an item shows item actions (Open ↵ / Rename F2 / [host actions] / [danger actions, Delete ⌫]). Right-click on empty space shows View as (Icons/List) and Sort by (Date/Name/Kind) + a direction toggle. Always `preventDefault` on the native event to suppress the browser menu.
- **Keyboard shortcuts** (active when the explorer has focus and no input is focused):
  - **Enter** — open the single selected item
  - **F2** — begin rename
  - **Delete / Backspace** — invoke the action with `id: "delete"` if present
  - **Cmd/Ctrl + A** — select all filtered items
  - **Escape** — deselect everything, close menus, cancel rename
- **Self-healing selection.** When `items` changes (e.g. after a delete), the explorer drops any selected ids that no longer exist. Hosts don't need to manage that.

### Event-driven storage reactivity

`download-storage.ts` and `preset-storage.ts` both dispatch a `CustomEvent` (`mintables:downloads-changed`, `mintables:presets-changed`) after any write. Listeners across the app react to it. The desktop hub uses a small `useStorageFlag(read, changeEvent)` hook to drive the conditional folder icons; folder windows use the same pattern to refresh their lists.

When you add new persisted state that should reflect on the desktop or in a window, follow this pattern:

1. Pick a storage key + a `CHANGE_EVENT` constant.
2. Have every mutation function dispatch `window.dispatchEvent(new CustomEvent(CHANGE_EVENT))` after the write.
3. Export the event name so consumers can subscribe.
4. Components subscribe via `useEffect` to both the custom event AND the native `storage` event (latter covers cross-tab updates).

## Visual language

> Full visual direction lives in **`DESIGN.md`** at the repo root — color tokens, material recipes, typography, motion, the per-component catalog, and a Don't-do list. Read it before adding new surfaces or restyling existing ones. This section is just the headline rules.

- **Wallpaper** sets the mood — photographic, calm. UI floats over it as **frosted glass**: `bgcolor: rgba(...)` + `backdrop-filter: blur(...) saturate(...)`. Menu bar, dock, About dialog, and window title bars all use this material.
- **App tiles** (the dock) use a per-app **accent gradient** (top color = accent lightened, bottom = darkened) with a top sheen pseudo-element and a bottom inner-shadow pseudo-element. Squircle radius (~22%). Each app ships its own `iconArt` SVG so it has a recognizable subject illustration (cylinder, elbow, etc.), not a generic line icon.
- **Desktop icons** intentionally use a *different* aesthetic — small frosted dark file-tiles with strong text-shadow on the label — so they read as "files on the desktop," not as apps. Don't blur the line between dock and desktop icons.
- **Accent color** drives multiple surfaces: the dock tile gradient, the window's top edge highlight line, the menu bar status dot when the app is open, and the running-indicator dot under the dock tile. Keep accents distinct between apps.

## Layout pitfalls to know

- **Flex + WebGL canvas: every ancestor needs `minWidth: 0`.** Three.js / R3F sets the `<canvas>` to its drawing buffer width, which becomes the flex item's intrinsic min-width. Without explicit `minWidth: 0` on each flex container above the canvas, the canvas anchors them and they can't shrink — e.g. after maximize → restore the shell overflows the window and the right edge gets clipped by the window's `overflow: hidden`. `GeneratorShell` sets `minWidth: 0` on both the outer row container and the `<main>` element for this reason. Preserve those.
- **The dock is `position: fixed`.** Windows respect it via `mb` (a buffer that keeps the bottom edge above the dock) — even when maximized. Don't set `mb: 0` on `AppWindow`.
- **Narrow-width split: Controls/Preview tab.** Below the `md` breakpoint (~900px), `GeneratorShell` swaps the side-by-side layout for a segmented Controls/Preview tab at the top, mirroring the iPad-design-app pattern (Figma, Affinity). At md+ the layout is 320px controls + flex preview, which comfortably fits even half-screen on most desktops. Each pane is toggled via `display: none/flex` (kept mounted, so state survives switches). The shell dispatches a `window` resize event 30ms after switching to Preview so R3F's `<Canvas>` re-fits — some browsers don't notify ResizeObserver when an ancestor flips from `display: none`. Don't replace this with an unmount/remount.

## Writing rules

- **No em dashes (—) anywhere.** Not in user-facing copy, not in docs, not in comments. Use a hyphen, a colon, a period, or parentheses instead. This applies to README, dialog text, code comments, commit messages, PR descriptions, and any other prose Claude generates. Pre-existing em dashes in the codebase are not in scope for cleanup, but don't add new ones.

## Conventions

- Use native MUI components. Theme overrides live in `packages/shared/src/lib/theme.ts`
- Use `sx` for layout/spacing
- Studio path alias: `@/*` → `apps/studio/*`
- Preview and export run the same `generator.geometry(config)` — never duplicate mesh generation
- All exports go through `exportModel(generator, config, format)` in `@mintables/shared/lib/export` (validation + mesh quality gate)
- Keep `apps/studio/app/layout.tsx` as a server component; client providers go in `providers.tsx`
- Per-generator: ship a `Controls` component (don't try to schema-drive it — generators have discriminated unions and conditional sections that a schema can't express cleanly)
- SSR-safe time/date display: pattern is `useState<Date | null>(null)` + set on mount via `useEffect`. See `SystemClock`. Never render `new Date()` directly during initial render.

## Adding a generator

1. Create `packages/generators/<name>/` with `package.json`, `tsconfig.json`, `vitest.config.ts` (copy from `tubes`)
2. Implement `types.ts`, `validation.ts`, `geometry.ts`, `controls.tsx`, `scene.tsx`, `print-tips.ts`
3. Build an `icon-art.tsx` — a small SVG component (32-unit viewBox) that depicts the subject. The dock renders it on the app's accent gradient; treat the SVG as the foreground only.
4. Export a `Generator<Config>` from `src/index.ts` with a unique `meta.accent` and `meta.iconArt` wired in
5. Add to `apps/studio/lib/registry.ts`
6. Add the workspace to `apps/studio/next.config.ts`'s `transpilePackages`
7. `pnpm install` — turbo picks it up automatically

## Adding a feature to an existing generator

1. Update the generator's `types.ts` (and `defaults`)
2. Implement geometry in `geometry.ts`
3. Add validation rules in `validation.ts`
4. Add a Vitest case in `tests/`
5. Update `controls.tsx` for the UI
6. Preview updates automatically via shared geometry
