# TubeCraft

3D printable tube and adapter generator with real-time 3D preview and STL/3MF export.

## Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **UI**: Material UI (MUI) v7 with dark theme — see `lib/theme.ts`
- **3D**: React Three Fiber + Three.js + @react-three/drei
- **Geometry**: Shared triangle mesh in `lib/geometry/` (single source for preview + export)
- **Validation**: `lib/validation/` — dimension checks before export
- **Tests**: Vitest — mesh generation, validation, config round-trips
- **Icons**: lucide-react + @mui/icons-material
- **Package manager**: pnpm

## Commands

- `pnpm dev` — start dev server (Turbopack)
- `pnpm build` — production build
- `pnpm lint` — ESLint
- `pnpm typecheck` — TypeScript
- `pnpm test` — Vitest unit tests
- `pnpm format:check` — Prettier

## Project Structure

```
app/
  layout.tsx              — Root layout (server component), MUI ThemeProvider
  page.tsx                — Main page with sidebar controls + 3D preview
  globals.css             — Minimal CSS reset
components/
  tube-controls.tsx       — Tube configuration panel
  tube-preview.tsx        — 3D tube preview (uses shared geometry)
  adapter-controls.tsx    — Adapter configuration panel
  adapter-preview.tsx     — 3D adapter preview
  preview-panel.tsx       — Lazy-loaded preview wrapper
  validation-banner.tsx   — Config validation alerts
lib/
  geometry/
    tube-mesh.ts          — Tube triangle generation
    adapter-mesh.ts       — Adapter triangle generation
    mesh-utils.ts         — Shared mesh helpers
    mesh-analysis.ts      — Mesh quality checks
  validation/             — Config validation rules
  export-model.ts         — Validated export entry point
  stl-generator.ts        — STL serialization (tubes)
  adapter-generator.ts    — STL serialization (adapters)
  3mf-generator.ts        — 3MF export
  preset-storage.ts       — Share URLs + localStorage presets
  tube-types.ts           — Tube TypeScript types + defaults
  adapter-types.ts        — Adapter types + defaults
```

## Conventions

- Use native MUI components — theme overrides live in `lib/theme.ts`
- Use `sx` prop for layout/spacing
- Path alias: `@/*` maps to project root
- Preview and export must use the same geometry functions (`generateTubeTriangles`, `generateAdapterTriangles`)
- All exports go through `lib/export-model.ts` (validation + mesh quality gate)
- Keep `layout.tsx` as a server component; client providers go in `ThemeProvider.tsx`

## Adding a geometry feature

1. Implement triangles in `lib/geometry/tube-mesh.ts` or `adapter-mesh.ts`
2. Add validation rules in `lib/validation/` if user-facing constraints apply
3. Add a Vitest case in `lib/geometry/*.test.ts`
4. Preview updates automatically via shared geometry
