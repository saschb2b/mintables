/**
 * Dock-icon artwork for the Dividers app. An isometric flat slab — reads as
 * "a thin panel lying on a surface". Drawn in a normalized 32-unit viewBox.
 */
export function DividerIconArt({ size = 32 }: { size?: number }) {
  const s = size;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.4))" }}
    >
      <defs>
        <linearGradient id="div-face" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.98" />
          <stop offset="55%" stopColor="#eef2f6" stopOpacity="0.94" />
          <stop offset="100%" stopColor="#c8d2dc" stopOpacity="0.96" />
        </linearGradient>
        <linearGradient id="div-edge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a8b2bd" />
          <stop offset="100%" stopColor="#6b7480" />
        </linearGradient>
      </defs>

      {/* Drop shadow on the print bed */}
      <ellipse cx="16" cy="24" rx="11" ry="1.5" fill="rgba(0,0,0,0.28)" />

      {/* Slab — isometric flat rectangle, viewed slightly from above */}
      {/* Bottom (front) edge — gives the slab thickness */}
      <path
        d="M 4 19.8 L 16 23.4 L 28 19.8 L 28 21.3 L 16 24.9 L 4 21.3 Z"
        fill="url(#div-edge)"
      />
      {/* Top face — the flat surface of the divider */}
      <path
        d="M 4 19.8 L 16 16.2 L 28 19.8 L 16 23.4 Z"
        fill="url(#div-face)"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth="0.35"
      />
      {/* Specular streak across the top face */}
      <path
        d="M 8 19 L 20 15.4"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth="0.55"
        strokeLinecap="round"
      />
    </svg>
  );
}
