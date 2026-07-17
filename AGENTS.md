# Mintables

Monorepo of browser-based, parametric 3D generators for printable parts. Each generator (`tubes`, `adapters`, …) is its own package; they share a single Next.js shell that frames them inside an **OS-style desktop UI** — menu bar at the top, dock at the bottom, wallpaper behind, and each generator opens as a floating "window" on the desktop.

The desktop itself (wallpaper, menu bar, dock, windows, Spotlight, Settings, desktop icons, workspaces) comes from **react-ui-os** (`@react-ui-os/core` + `@react-ui-os/desktop` + `@react-ui-os/theme-macos`). Mintables registers its generators as apps and its folders as system windows; the library composes the system. The packages are not on npm yet, so built copies live in `vendor/react-ui-os/` (committed) and `apps/studio/package.json` consumes them via `file:` paths, which keeps installs and deploys self-contained. To pull in library changes from the sibling checkout at `../react-ui-os`, run `scripts/sync-react-ui-os.sh` and commit the vendor diff. Once the packages are published, replace the `file:` deps with version ranges and delete `vendor/`.

## Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **OS shell**: react-ui-os (window manager, dock, menu bar, Spotlight, FileExplorer, Settings)
- **UI**: Material UI v7 (dark theme — see `packages/shared/src/lib/theme.ts`) inside window content
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
      providers.tsx                    # Client OS shell: react-ui-os DesktopProvider + hand-composed
                                       #   surfaces (Wallpaper, MenuBar, WindowLayer, Dock, Launcher, ...)
                                       #   with the shared R3F PreviewStage slotted between WindowLayer
                                       #   and Dock. Renders client-only (mounted gate).
      desktop-companions.tsx           # Headless glue inside the provider: URL <-> focus sync,
                                       #   Spotlight sources (presets/downloads/links), storage poke
                                       #   bridge, menu-bar status item, preview invalidation
      page.tsx                         # The hub route: renders null ("no window focused")
      readme-content.tsx               # Body of the README.md system window (About + links + tour)
      welcome-dialog.tsx               # First-visit tour dialog (MUI DialogWindow)
      generators/[generator]/page.tsx  # Dynamic route → <GeneratorPageView>
      generators/[generator]/generator-page-view.tsx  # Route shim → openWindow({kind:"app"})
      folders/open-folder-window.tsx   # Shared route shim → openWindow({kind:"system"})
      folders/downloads/…              # page.tsx + shim + downloads-content.tsx (FileExplorer host)
      folders/presets/…                # page.tsx + shim + presets-content.tsx (FileExplorer host)
      folders/use-explorer-sidebar.tsx # Favorites rail shared by both folder windows
    public/
      wallpaper-mountains.jpg          # The desktop wallpaper image
    lib/
      registry.ts                      # Imports every generator and exposes bySlug
      os-apps.tsx                      # Maps each Generator to a react-ui-os App (dock/Spotlight/shortcuts)
      os-theme.ts                      # createMacosTheme(...) + Mintables overrides (dark, wallpaper, accent)
      os-system-windows.tsx            # registerSystemWindow: downloads / presets / readme
      window-content.tsx               # EdgeToEdge wrapper (cancels the window body's 16px padding)
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
      ui/                              # Stateless MUI components used inside window content:
                                       #   dialog-window, save-preset/share dialogs, thank-you drawer,
                                       #   validation-banner, number-field, collapsible-section, …
      shell/                           # GeneratorShell, PreviewPanel, PreviewStage, R3F infra
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

## OS-style desktop UI (react-ui-os)

The studio is presented as a desktop environment, not a webpage. Since the migration to react-ui-os, the window manager, chrome, and system surfaces are library code. Mintables contributes data (apps, system windows, theme) and a handful of glue components. Invariants:

- **The library owns the metaphor.** Windows (traffic lights, drag, resize, snap, maximize, genie minimize), the dock (magnification, running dots), the menu bar (brand menu, per-app menus, workspaces, status items, clock), Spotlight/Launcher, Settings, Mission Control, the app switcher, notifications, and desktop icons all come from `@react-ui-os/desktop`. Do not rebuild any of these locally; if a behavior needs to change, change it upstream in `../react-ui-os`.
- **Apps are data.** `apps/studio/lib/os-apps.tsx` maps every generator in the registry to a react-ui-os `App` (id, name, tagline, accent, icon, `iconArt`, `defaultBounds`, content). One entry lights up the dock, the menu bar, Spotlight, and Cmd/Ctrl+1..9 at once. The window body is `<GeneratorShell generator focused>`, wrapped in `<EdgeToEdge>`.
- **System windows are registered, not routed.** `apps/studio/lib/os-system-windows.tsx` calls `registerSystemWindow(...)` at module load for `downloads`, `presets`, and `readme`. Downloads/Presets use the "state-earned" desktop-icon pattern (`appearsAsDesktopIcon` predicate); README is always on the desktop.
- **providers.tsx hand-composes the Desktop.** It uses `DesktopProvider` plus the same surface list as the library's one-line `<Desktop>`, for exactly one reason: the shared R3F `<PreviewStage>` canvas must be a sibling of `WindowLayer` and `Dock` *inside* the library's fixed root div (a stacking context), so it can paint above windows (z 1150) but below the dock (1200) and Spotlight (1400). If you add or reorder surfaces, mirror the library's `Desktop.tsx`.
- **The desktop renders client-only.** `providers.tsx` gates the whole shell behind a mounted flag (`useSyncExternalStore` hydration detector) because the library reads localStorage-backed state during first render. Don't remove the gate.
- **WM state lives in `@react-ui-os/core`.** Consume via `useWindowManager()`. Stable ids come from `windowIdOf(payload)`; payloads are `{kind: "app", appId}` or `{kind: "system", systemId}`. Opening an existing id focuses and restores instead of duplicating.
- **Routes are thin shims.** `/generators/<id>` and `/folders/<kind>` render `null` and dispatch `openWindow(payload, pickInitialBounds(...))` on mount (see `generator-page-view.tsx` and `folders/open-folder-window.tsx`). Always pass `pickInitialBounds` for programmatic opens. The focused window's path is mirrored to the URL by `FocusUrlSync` in `desktop-companions.tsx`; when nothing is focused the URL points at `/`. `GeneratorShell` writes `?config=` to the generator's canonical path via `syncUrl(generatorId, config)`, never to `location.pathname`.
- **Keyboard shortcuts are library-owned** (`KeyboardShortcuts` + `keymap.ts` upstream): Cmd/Ctrl+W close, +M minimize, +K Spotlight, +1..9 apps, +Tab switcher, +, Settings, arrow-key snapping, F3 Mission Control. All bail when focus is in an input. Cmd/Ctrl+Z / Shift+Z undo/redo stays inside `GeneratorShell` (the library deliberately does not bind Z).
- **Spotlight extras** (saved presets, downloads, external links) are registered via `registerSpotlightSource` in `desktop-companions.tsx`. They return rows only for non-empty queries so the palette's resting state stays apps-only.
- **Preview canvas invalidation.** The library writes window drag/resize transforms straight to the DOM (no per-frame React state) and the R3F canvas renders on demand, so `PreviewInvalidateBridge` in `desktop-companions.tsx` nudges the canvas on buttons-down pointer moves and for ~700ms after every WM state change (open/genie/maximize animations). Without it the 3D preview freezes mid-drag.
- **Theme = data.** `apps/studio/lib/os-theme.ts` derives from `createMacosTheme(...)`: forced dark, mountain wallpaper with parallax + vignette, teal accent, `id: "mintables"` (namespaces Settings prefs). Restyle the OS by editing theme tokens, not components.
- **Known trade-off: minimized windows unmount.** The library's `Window` returns `null` while minimized, so in-window React state (e.g. un-synced config edits in a background window) does not survive minimize + restore. The focused window's config survives via the URL. Workspace-hidden windows keep their state (`display: none`).

## Desktop folders + FileExplorer

The desktop "earns" system folders as the user creates state:

- **Downloads** — appears once the first export has been recorded by `recordDownload(...)` in `GeneratorShell.handleDownload`. We don't store the binary file; we keep just enough metadata (generator id, filename, format, config, timestamp) to rebuild it via `exportModel(generator, gen.decode(config), format)`.
- **Presets** — appears once `savePreset(...)` has been called for any generator. Listing all presets across generators is `listAllPresets()`.

Both folders are react-ui-os **system windows** (registered in `apps/studio/lib/os-system-windows.tsx`) and also reachable as routes (`/folders/downloads`, `/folders/presets`) via the shared route shim.

Inside each window, the **FileExplorer from `@react-ui-os/desktop`** renders the Finder-style UI: toolbar (view toggle, sort, search, contextual actions), optional Favorites sidebar, icon grid or sortable list, right-click context menu, and a status bar. Hosts pass `items` (`ExplorerItem`: `id`, `name`, `kind`, `timestamp`, `subtitle?`, `meta?`, `icon?`/`iconSmall?` as ReactNodes), `onOpen`, optional `onRename`, `actions` (`onClick(items[])`, `singleOnly`, `danger`, `shortcut`; the action with `id: "delete"` binds Delete/Backspace), and `sidebar` sections. Selection, rename (F2), Cmd/Ctrl+A, Escape, and self-healing selection are library behavior; see react-ui-os for the full interaction contract.

Keep the hosts item-agnostic on the explorer side: generator-specific concerns (registry lookup, re-download, share-URL building) live in `downloads-content.tsx` / `presets-content.tsx`, and both share `use-explorer-sidebar.tsx` for the Favorites rail. Window content that should reach the window edges (both explorers, the generator shell) wraps itself in `<EdgeToEdge>` (`apps/studio/lib/window-content.tsx`) to cancel the library window body's 16px padding.

### Event-driven storage reactivity

`download-storage.ts` and `preset-storage.ts` both dispatch a `CustomEvent` (`mintables:downloads-changed`, `mintables:presets-changed`) after any write. Listeners across the app react to it; folder windows use it to refresh their lists.

The library's desktop icons re-evaluate their `appearsAsDesktopIcon` predicates only when the react-ui-os storage adapter fires a change, so `StorageEventBridge` in `desktop-companions.tsx` listens for the Mintables events and pokes the adapter (`storage.set("mintables-sync", ...)`). That is what makes the Downloads/Presets icons appear the instant the first item exists.

When you add new persisted state that should reflect on the desktop or in a window, follow this pattern:

1. Pick a storage key + a `CHANGE_EVENT` constant.
2. Have every mutation function dispatch `window.dispatchEvent(new CustomEvent(CHANGE_EVENT))` after the write.
3. Export the event name so consumers can subscribe.
4. Components subscribe via `useEffect` to both the custom event AND the native `storage` event (latter covers cross-tab updates).
5. If the state should drive a desktop icon, add the event to `StorageEventBridge`.

## Visual language

> Full visual direction lives in **`DESIGN.md`** at the repo root — color tokens, material recipes, typography, motion, the per-component catalog, and a Don't-do list. Read it before adding new surfaces or restyling existing ones. This section is just the headline rules.

- **Wallpaper** sets the mood — photographic, calm. UI floats over it as **frosted glass**. The OS chrome material now comes from the react-ui-os theme tokens (`apps/studio/lib/os-theme.ts`); MUI dialogs and in-window surfaces keep the local frosted recipes.
- **App tiles** (the dock) are painted by the library from each app's `accent` + `iconArt`. Each app ships its own `iconArt` SVG so it has a recognizable subject illustration (cylinder, elbow, etc.), not a generic line icon.
- **Desktop icons** read as "files on the desktop," not as apps: folders use the library default, README ships a custom document-page SVG (`os-system-windows.tsx`). Don't blur the line between dock and desktop icons.
- **Accent color** drives multiple surfaces: the dock tile gradient, the window's top edge highlight line, and Spotlight rows. Keep accents distinct between apps.

## Layout pitfalls to know

- **Flex + WebGL canvas: every ancestor needs `minWidth: 0`.** Three.js / R3F sets the `<canvas>` to its drawing buffer width, which becomes the flex item's intrinsic min-width. Without explicit `minWidth: 0` on each flex container above the canvas, the canvas anchors them and they can't shrink — e.g. after maximize → restore the shell overflows the window and the right edge gets clipped by the window's `overflow: hidden`. `GeneratorShell` sets `minWidth: 0` on both the outer row container and the `<main>` element for this reason. Preserve those.
- **Window body padding.** The library gives every window body 16px padding and its own scrollbar. Content that manages its own layout (GeneratorShell, FileExplorer hosts) must wrap in `<EdgeToEdge>` (margin -16 + `calc(100% + 32px)` height), or it gets a double scrollbar and inset chrome.
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
- SSR-safe time/date display: pattern is `useState<Date | null>(null)` + set on mount via `useEffect`. Never render `new Date()` directly during initial render.

## Adding a generator

1. Create `packages/generators/<name>/` with `package.json`, `tsconfig.json`, `vitest.config.ts` (copy from `tubes`)
2. Implement `types.ts`, `validation.ts`, `geometry.ts`, `controls.tsx`, `scene.tsx`, `print-tips.ts`
3. Build an `icon-art.tsx` — a small SVG component (32-unit viewBox) that depicts the subject. The dock renders it on the app's accent gradient; treat the SVG as the foreground only.
4. Export a `Generator<Config>` from `src/index.ts` with a unique `meta.accent` and `meta.iconArt` wired in
5. Add to `apps/studio/lib/registry.ts` (dock tile, Spotlight entry, and Cmd/Ctrl+N shortcut follow automatically via `lib/os-apps.tsx`)
6. Add the slug to `apps/studio/lib/generator-slugs.ts` so the route prerenders
7. Add the workspace to `apps/studio/next.config.ts`'s `transpilePackages`
8. `pnpm install` — turbo picks it up automatically

## Adding a feature to an existing generator

1. Update the generator's `types.ts` (and `defaults`)
2. Implement geometry in `geometry.ts`
3. Add validation rules in `validation.ts`
4. Add a Vitest case in `tests/`
5. Update `controls.tsx` for the UI
6. Preview updates automatically via shared geometry
