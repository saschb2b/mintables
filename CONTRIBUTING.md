# Contributing to TubeCraft

Thank you for your interest in contributing to TubeCraft! This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/tubecraft.git`
3. Install dependencies: `pnpm install`
4. Create a branch: `git checkout -b feature/your-feature-name`
5. Make your changes
6. Test your changes: `pnpm test` and `pnpm run dev`
7. Commit your changes: `git commit -m "Add your feature"`
8. Push to your fork: `git push origin feature/your-feature-name`
9. Open a Pull Request

## Development Setup

```bash
pnpm install
pnpm run dev
pnpm test
```

The app will be available at `http://localhost:3000`.

## Code Style

- Use TypeScript for all new code
- Follow the existing code style and patterns
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions focused and small

## Project Structure

```
tubecraft/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Main application page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── tube-controls.tsx  # Control panel UI
│   ├── tube-preview.tsx   # 3D preview component
│   └── adapter-preview.tsx
├── lib/                   # Core logic
│   ├── geometry/          # Shared triangle mesh generation
│   ├── validation/        # Config validation rules
│   ├── tube-types.ts     # TypeScript type definitions
│   └── export-model.ts   # Validated export entry point
└── public/               # Static assets
```

## Pull Request Guidelines

- Keep PRs focused on a single feature or bug fix
- Include a clear description of the changes
- Add screenshots for UI changes
- Update documentation if needed
- Ensure the app builds without errors: `pnpm run build`
- Run unit tests: `pnpm test`
- Test your changes thoroughly

## Feature Requests

Feature requests are welcome! Please open an issue to discuss your idea before implementing it.

## Bug Reports

When reporting bugs, please include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots if applicable
- Browser and OS information

## Questions?

Feel free to open an issue or reach out to the maintainers.

Thank you for contributing to TubeCraft!
