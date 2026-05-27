/**
 * Dock-icon artwork for the Adapters app. A 90° elbow joint with two
 * differently sized ends — reads as "press-fit connector that bridges
 * shapes" at a glance. Normalized 32-unit viewBox.
 */
export function AdapterIconArt({ size = 32 }: { size?: number }) {
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
        <linearGradient id="ad-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.98" />
          <stop offset="60%" stopColor="#f0e9f7" stopOpacity="0.92" />
          <stop offset="100%" stopColor="#d6cbe2" stopOpacity="0.95" />
        </linearGradient>
        <radialGradient id="ad-bore" cx="0.5" cy="0.5" r="0.55">
          <stop offset="0%" stopColor="rgba(0,0,0,0.55)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.85)" />
        </radialGradient>
      </defs>

      {/* Drop shadow */}
      <ellipse cx="16" cy="28.5" rx="10" ry="1.4" fill="rgba(0,0,0,0.25)" />

      {/* Vertical leg (lower, wider socket end) */}
      <path
        d="M 9.5 14 L 9.5 25.5 Q 9.5 27.5 16 27.5 Q 22.5 27.5 22.5 25.5 L 22.5 14 Z"
        fill="url(#ad-body)"
      />

      {/* Vertical leg — bottom rim opening */}
      <ellipse
        cx="16"
        cy="25.6"
        rx="6.5"
        ry="2"
        fill="url(#ad-body)"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth="0.4"
      />
      <ellipse cx="16" cy="25.6" rx="4.2" ry="1.2" fill="url(#ad-bore)" />

      {/* Horizontal leg (upper, narrower socket end — angled out the side) */}
      <path
        d="M 18 6 L 28 6 Q 30 6 30 9 Q 30 12 28 12 L 18 12 Z"
        fill="url(#ad-body)"
      />

      {/* Right-side rim */}
      <ellipse
        cx="28.2"
        cy="9"
        rx="1.8"
        ry="3"
        fill="url(#ad-body)"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth="0.4"
      />
      <ellipse cx="28.2" cy="9" rx="0.95" ry="1.9" fill="url(#ad-bore)" />

      {/* Elbow knuckle — a soft fillet where the two legs meet */}
      <path
        d="M 9.5 14 Q 9.5 6 18 6 L 22.5 6 Q 22.5 14 14 14 Z"
        fill="url(#ad-body)"
      />

      {/* Specular highlight running down the vertical leg */}
      <rect
        x="11.5"
        y="9"
        width="1.4"
        height="15"
        rx="0.7"
        fill="rgba(255,255,255,0.55)"
      />
      {/* Highlight on horizontal leg */}
      <rect
        x="19"
        y="7.5"
        width="8"
        height="1.1"
        rx="0.55"
        fill="rgba(255,255,255,0.55)"
      />
    </svg>
  );
}
