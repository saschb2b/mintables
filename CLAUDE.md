# Mintables

Monorepo of browser-based, parametric 3D generators for printable parts. Each generator (`tubes`, `adapters`, …) is its own package; they share a single Next.js shell that wires them into a sidebar + 3D preview UI.

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
      providers.tsx                    # Client: ThemeProvider + AppHeader + main slot
      page.tsx                         # Hub landing — GeneratorGrid
      generators/[generator]/page.tsx  # Dynamic route, uses registry → <GeneratorShell>
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
      ui/                              # Stateless components — AppHeader, GeneratorGrid, dialogs, primitives
      shell/                           # GeneratorShell, PreviewPanel, R3F infra
      hooks/
  generators/
    tubes/                             # @mintables/gen-tubes
      src/
        index.ts                       # exports tubeGenerator: Generator<TubeConfig>
        types.ts, geometry.ts, validation.ts, controls.tsx, scene.tsx, summary.tsx, print-tips.ts, spec.ts
      tests/
    adapters/                          # @mintables/gen-adapters (same shape)
```

## The Generator contract

Every generator package exports a single `Generator<Config>` value implementing `packages/shared/src/lib/generator.ts`. The shell consumes:

- `id` / `meta` — route slug, name, icon (`LucideIcon`), tagline, accent
- `defaults`, `decode(raw)` — for hydration from defaults / URL / preset
- `validate(c)` → `ValidationResult` — drives error banner + disables export
- `geometry(c)` → `TriangleMesh` — single source for preview AND export
- `axis: "z-up" | "y-up"` — passed to `trianglesToBufferGeometry` and the scene
- `filename(c)`, `describe(c)`, `printTips(c)`, `badges?(c)` — UI hooks
- `Controls`, `Scene`, `Summary?` — React components (per-generator UI)

The studio app only knows about the registry list. Nothing in `apps/studio` or `@mintables/shared` references a specific generator.

## Conventions

- Use native MUI components — theme overrides live in `packages/shared/src/lib/theme.ts`
- Use `sx` for layout/spacing
- Studio path alias: `@/*` → `apps/studio/*`
- Preview and export run the same `generator.geometry(config)` — never duplicate mesh generation
- All exports go through `exportModel(generator, config, format)` in `@mintables/shared/lib/export` (validation + mesh quality gate)
- Keep `apps/studio/app/layout.tsx` as a server component; client providers go in `providers.tsx`
- Per-generator: ship a `Controls` component (don't try to schema-drive it — generators have discriminated unions and conditional sections that a schema can't express cleanly)

## Adding a generator

1. Create `packages/generators/<name>/` with `package.json`, `tsconfig.json`, `vitest.config.ts` (copy from `tubes`)
2. Implement `types.ts`, `validation.ts`, `geometry.ts`, `controls.tsx`, `scene.tsx`, `print-tips.ts`
3. Export a `Generator<Config>` from `src/index.ts`
4. Add to `apps/studio/lib/registry.ts`
5. Add the workspace to `apps/studio/next.config.ts`'s `transpilePackages`
6. `pnpm install` — turbo picks it up automatically

## Adding a feature to an existing generator

1. Update the generator's `types.ts` (and `defaults`)
2. Implement geometry in `geometry.ts`
3. Add validation rules in `validation.ts`
4. Add a Vitest case in `tests/`
5. Update `controls.tsx` for the UI
6. Preview updates automatically via shared geometry
