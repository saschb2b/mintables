# TubeCraft

<p align="center">
  <strong>A powerful 3D tube generator for makers and engineers</strong>
  <br />
  Design custom tubes, pipes, adapters, and connectors for 3D printing with real-time preview
</p>

<p align="center">
  <a href="https://github.com/saschb2b/tubecraft">
    <img src="https://img.shields.io/github/stars/saschb2b/tubecraft?style=social" alt="GitHub Stars" />
  </a>
  <a href="https://github.com/saschb2b/tubecraft/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License" />
  </a>
  <a href="https://buymeacoffee.com/qohreuukw">
    <img src="https://img.shields.io/badge/Buy%20me%20a%20coffee-FFDD00?style=flat&logo=buy-me-a-coffee&logoColor=black" alt="Buy Me A Coffee" />
  </a>
</p>

---

## Features

### Tube Generator

#### Multiple Tube Shapes
- **Round/Circular** - Standard pipe profiles
- **Square** - Perfect for downspouts and ducts  
- **Rectangular** - Custom aspect ratios for any application

#### Advanced End Operations
Control top and bottom ends independently:
- **Flat** - Standard straight cut
- **Miter** - Angled cuts (0-60°) for corner joints
- **Chamfer** - Beveled edges for easier insertion
- **Saddle** - Curved fish-mouth cuts for T-joints and branch connections

#### Professional Press-Fit System
- **Fit Type Presets** - Loose (0.3mm) / Snug (0.15mm) / Interference (-0.05mm)
- **Custom Clearance** - Fine-tune tolerances for your printer
- **Lead-in Chamfer** - Auto-generated tapers for easier assembly
- **Stop Shoulder** - Internal step for consistent seating depth
- **Anti-Rotation** - Add flats or keys to prevent spinning

---

### Adapter Generator

Build custom connectors like LEGO pieces to join any tubes together.

#### Shape Transitions
- **Round to Round** - Reducers and expanders
- **Round to Square** - Gutter to downspout connections
- **Square to Rectangular** - Downspout transitions
- **Any combination** - Mix and match as needed

#### Bend Angles
- **Straight adapters** (0°) - Simple transitions
- **Elbows** (up to 90°) - Corners and offsets
- Real-time bend preview

#### Press-Fit Ends
- **Male fitting** - Inserts into another tube
- **Female fitting** - Receives another tube
- **Configurable clearance** - Adjust for your printer
- Independent settings for each end

---

### Export & Sharing
- **STL and 3MF** export with millimeter units preserved in 3MF
- **Share links** — URL encodes your full configuration
- **Local presets** — save and reload designs in the browser
- **Validation** — invalid dimensions are caught before export

### Real-Time 3D Preview
- Professional CAD-style metallic rendering
- Preview matches export geometry (shared mesh pipeline)
- Interactive dimension indicators
- Grid floor with axis visualization
- Orbit controls (drag to rotate, scroll to zoom)

### Mesh Quality
- Watertight mesh generation (no open edges)
- Degenerate triangle checks before download
- Compatible with all major slicers

---

## Use Cases

- **Downspout Extensions** - Square/rectangular tubes for rain gutters
- **Pipe Adapters** - Connect different diameters with press-fit flares
- **T-Joint Connections** - Saddle cuts for branch fittings on half-round gutters
- **Custom Ducting** - Air flow, cable management, vacuum systems
- **Modular Assemblies** - Print multiple pieces that snap together
- **Shape Transitions** - Round to square, different sizes, angled connections

---

## Getting Started

### Installation

```bash
git clone https://github.com/saschb2b/tubecraft.git
cd tubecraft
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Usage

#### Tube Generator
1. **Select Shape** - Choose round, square, or rectangular
2. **Set Dimensions** - Configure inner/outer sizes, wall thickness, length
3. **Configure Ends** - Add miters, chamfers, or saddle cuts as needed
4. **Enable Press-Fit** - Toggle flare and adjust fit tolerance
5. **Preview** - Rotate and inspect your design in 3D
6. **Download STL or 3MF** — export when validation passes

#### Adapter Generator
1. **Switch to Adapters tab**
2. **Configure End A** - Set shape and dimensions for the bottom end
3. **Configure End B** - Set shape and dimensions for the top end
4. **Set Transition** - Adjust length and bend angle
5. **Add Press-Fit** - Optional male/female fittings on either end
6. **Download STL** - Export for printing

---

## Tech Stack

- **Next.js 16** — React framework with App Router
- **Material UI v7** — UI components and dark theme
- **React Three Fiber** — 3D rendering with Three.js
- **TypeScript** — Type-safe development
- **Vitest** — Unit tests for mesh generation and validation

---

## Development

```bash
pnpm install
pnpm dev          # development server
pnpm test         # unit tests
pnpm typecheck    # TypeScript
pnpm lint         # ESLint
pnpm build        # production build
```

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Run `pnpm test` before opening a PR — CI requires lint, format, typecheck, and tests to pass.

---

## Support

If you find TubeCraft useful, consider supporting the project:

<a href="https://buymeacoffee.com/qohreuukw">
  <img src="https://img.shields.io/badge/Buy%20me%20a%20coffee-Support-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black" alt="Buy Me A Coffee" />
</a>

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with care by the open source community
</p>
