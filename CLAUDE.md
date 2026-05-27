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
        validation/                    # ValidationResult types + field helpers
        geometry/                      # Mesh helpers (utils, analysis, STL binary)
        export/                        # Generic exportModel<C>(generator, config, format)
      ui/                              # Stateless components.
        app-header.tsx                 #   Menu bar — brand left, active app, status + clock right
        app-dock.tsx                   #   Floating bottom dock — Home + per-generator tiles
        app-window.tsx                 #   Window chrome — traffic lights, title bar, animations
        desktop-icon.tsx               #   File-style desktop shortcut (README / LICENSE / .url)
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
- **Dock = apps only.** Home + per-generator tiles. External links and informational shortcuts (GitHub, sponsor, license, about) live as **desktop icons** in `apps/studio/app/page.tsx`, *not* in the dock.
- **Generators open as windows.** `apps/studio/app/generators/[generator]/generator-page-view.tsx` wraps `<GeneratorShell>` in `<AppWindow>`. The window has macOS-style traffic lights:
  - **Red (close)** — fade animation, then `router.push('/')`
  - **Yellow (minimize)** — "genie effect" scale toward the app's actual dock-tile rect, then home. Lookup uses `document.querySelector('nav[aria-label="App dock"] [aria-label="<app name>"]')`.
  - **Green (maximize / restore)** — toggle `mt + mx` to 0 (filling the work area while still respecting the dock via `mb`). **ESC** restores. Label and icon swap between Maximize / Restore.
  - Group-hover and `:focus-within` reveal the × / − / ⤢ glyphs on all three at once (macOS pattern).
- **Animation feel.** Windows open with a 420ms `translateY + scale` ease-out. Wallpaper has cursor parallax (~22×16 px shift) and a fade-in. Dock tiles lift on hover. Don't add competing motion or break these.

## Visual language

- **Wallpaper** sets the mood — photographic, calm. UI floats over it as **frosted glass**: `bgcolor: rgba(...)` + `backdrop-filter: blur(...) saturate(...)`. Menu bar, dock, About dialog, and window title bars all use this material.
- **App tiles** (the dock) use a per-app **accent gradient** (top color = accent lightened, bottom = darkened) with a top sheen pseudo-element and a bottom inner-shadow pseudo-element. Squircle radius (~22%). Each app ships its own `iconArt` SVG so it has a recognizable subject illustration (cylinder, elbow, etc.), not a generic line icon.
- **Desktop icons** intentionally use a *different* aesthetic — small frosted dark file-tiles with strong text-shadow on the label — so they read as "files on the desktop," not as apps. Don't blur the line between dock and desktop icons.
- **Accent color** drives multiple surfaces: the dock tile gradient, the window's top edge highlight line, the menu bar status dot when the app is open, and the running-indicator dot under the dock tile. Keep accents distinct between apps.

## Layout pitfalls to know

- **Flex + WebGL canvas: every ancestor needs `minWidth: 0`.** Three.js / R3F sets the `<canvas>` to its drawing buffer width, which becomes the flex item's intrinsic min-width. Without explicit `minWidth: 0` on each flex container above the canvas, the canvas anchors them and they can't shrink — e.g. after maximize → restore the shell overflows the window and the right edge gets clipped by the window's `overflow: hidden`. `GeneratorShell` sets `minWidth: 0` on both the outer row container and the `<main>` element for this reason. Preserve those.
- **The dock is `position: fixed`.** Windows respect it via `mb` (a buffer that keeps the bottom edge above the dock) — even when maximized. Don't set `mb: 0` on `AppWindow`.

## Conventions

- Use native MUI components — theme overrides live in `packages/shared/src/lib/theme.ts`
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
