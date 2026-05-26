# Mintables

<p align="center">
  <strong>Parametric 3D generators for makers — designed in the browser, exported as STL or 3MF.</strong>
</p>

<p align="center">
  <a href="https://github.com/saschb2b/mintables/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License" />
  </a>
  <a href="https://buymeacoffee.com/qohreuukw">
    <img src="https://img.shields.io/badge/Buy%20me%20a%20coffee-FFDD00?style=flat&logo=buy-me-a-coffee&logoColor=black" alt="Buy Me A Coffee" />
  </a>
</p>

---

Mintables is a monorepo of browser-based, parametric design tools for 3D-printable parts. Each generator (tubes, adapters, …) plugs into a shared app shell that gives every tool the same sidebar + real-time 3D preview + validated export.

## Generators included

### Tubes
Round, square, and rectangular tubes with:
- Flat / miter / chamfer / saddle end cuts
- Press-fit flares (loose / snug / interference fit, with optional lead-in chamfer, stop shoulder, anti-rotation key)
- Clamshell split for printing long round tubes in two interlocking halves

### Adapters
Press-fit connectors that bridge any two tubes:
- Round / square / rectangular ends in any combination
- Socket (wraps the tube) or plug (slides inside the tube) fittings
- Straight couplings or up to 90° elbows with auto-calculated bend radius

---

## Shared platform

- **Real-time 3D preview** — professional CAD-style metallic rendering, dimension indicators, view presets (Iso / Front / Top / Right), orbit controls, ghost geometry where relevant
- **Validated export** — degenerate triangle check before download; clear error banner when dimensions can't print
- **Share links** — every generator's full configuration encodes into the URL
- **Local presets** — save and reload configurations from your browser
- **STL and 3MF** with millimeter units preserved in 3MF

---

## Repo layout

```
apps/studio/            Next.js shell — single app, /<generator> routes
packages/shared/        @mintables/shared — generator contract + app shell
packages/generators/    One package per generator (tubes, adapters, …)
```

See [`CLAUDE.md`](./CLAUDE.md) for the full architecture, the generator contract, and how to add a new generator.

---

## Getting started

```bash
git clone https://github.com/saschb2b/mintables.git
cd mintables
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — pick a generator from the hub, or jump straight to a route like `/tubes` or `/adapters`.

---

## Tech stack

- **Next.js 16** + **React 19** + **TypeScript** (App Router, Turbopack)
- **Material UI v7** — UI components + dark theme
- **React Three Fiber** + **Three.js** — 3D rendering
- **Turborepo** + **pnpm workspaces** — monorepo orchestration
- **Vitest** — per-package unit tests (mesh generation, validation, decode round-trips)

---

## Development

```bash
pnpm install
pnpm dev              # studio dev server
pnpm test             # vitest across all packages
pnpm typecheck        # tsc across all packages
pnpm lint
pnpm build            # production build
```

---

## License

MIT — see [LICENSE](./LICENSE).
