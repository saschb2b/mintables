/**
 * Dock-icon artwork for the Tubes app. An isometric round tube with a
 * visible bore — instantly reads as "tube". Drawn at a normalized 32-unit
 * viewBox so it composes cleanly inside the dock's squircle tile.
 */
export function TubeIconArt({ size = 32 }: { size?: number }) {
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
      {/* Tube body — front face highlight, slightly tilted gradient */}
      <defs>
        <linearGradient id="tube-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.98" />
          <stop offset="55%" stopColor="#f1f5f5" stopOpacity="0.92" />
          <stop offset="100%" stopColor="#cfd9da" stopOpacity="0.95" />
        </linearGradient>
        <radialGradient id="tube-bore" cx="0.5" cy="0.45" r="0.55">
          <stop offset="0%" stopColor="rgba(0,0,0,0.55)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.85)" />
        </radialGradient>
      </defs>

      {/* Drop shadow on ground */}
      <ellipse cx="16" cy="28" rx="9" ry="1.6" fill="rgba(0,0,0,0.25)" />

      {/* Body cylinder side */}
      <path
        d="M 6.5 9.5 L 6.5 23 Q 6.5 26 16 26 Q 25.5 26 25.5 23 L 25.5 9.5 Z"
        fill="url(#tube-body)"
      />

      {/* Top ellipse — outer rim */}
      <ellipse
        cx="16"
        cy="9.5"
        rx="9.5"
        ry="3"
        fill="url(#tube-body)"
        stroke="rgba(255,255,255,0.6)"
        strokeWidth="0.4"
      />

      {/* Top ellipse — inner bore (the hole) */}
      <ellipse cx="16" cy="9.5" rx="5.5" ry="1.7" fill="url(#tube-bore)" />

      {/* Inner-edge highlight on the bore (subtle rim light) */}
      <path
        d="M 10.7 9 Q 16 7.2 21.3 9"
        stroke="rgba(255,255,255,0.45)"
        strokeWidth="0.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Vertical specular highlight on the body */}
      <rect
        x="9"
        y="10"
        width="1.5"
        height="14"
        rx="0.7"
        fill="rgba(255,255,255,0.6)"
      />
    </svg>
  );
}
