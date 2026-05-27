/**
 * Dock-icon artwork for the Adapters app. A horizontal "reducer" fitting:
 * one large socket on the left, one smaller socket on the right, joined by
 * a stepped body. The two visibly different openings + the step where the
 * diameters meet read as "this connects one size to another". Normalized
 * 32-unit viewBox so the art composes cleanly inside the dock squircle.
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
        <linearGradient id="ad-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.98" />
          <stop offset="55%" stopColor="#f0e9f7" stopOpacity="0.94" />
          <stop offset="100%" stopColor="#cebde0" stopOpacity="0.96" />
        </linearGradient>
        <radialGradient id="ad-bore" cx="0.5" cy="0.5" r="0.55">
          <stop offset="0%" stopColor="rgba(0,0,0,0.78)" />
          <stop offset="60%" stopColor="rgba(0,0,0,0.88)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.92)" />
        </radialGradient>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="16" cy="28.5" rx="12" ry="1.4" fill="rgba(0,0,0,0.3)" />

      {/* Stepped reducer body — wide pipe joined to narrow pipe at x = 17.
          The step itself is the conceptual centerpiece: one size becomes
          another at that seam. */}
      <path
        d="M 5 7 L 17 7 L 17 10.5 L 27 10.5 L 27 21.5 L 17 21.5 L 17 25 L 5 25 Z"
        fill="url(#ad-body)"
      />

      {/* Subtle inner shadow at the step's vertical seam — sells the
          "two diameters meeting" rather than a single tapered pipe. */}
      <line
        x1="17"
        y1="10.5"
        x2="17"
        y2="21.5"
        stroke="rgba(0,0,0,0.18)"
        strokeWidth="0.4"
      />

      {/* Big socket (left) — tall ellipse + clearly dark bore. The big
          opening is what makes this read as a "socket you stick a pipe
          into" instead of a closed cylinder. */}
      <ellipse
        cx="5"
        cy="16"
        rx="3.5"
        ry="9"
        fill="url(#ad-body)"
        stroke="rgba(255,255,255,0.6)"
        strokeWidth="0.4"
      />
      <ellipse cx="5" cy="16" rx="2.2" ry="6" fill="url(#ad-bore)" />
      {/* Inner-rim highlight inside the big bore (suggests the rounded lip) */}
      <path
        d="M 5 10.4 Q 7 16 5 21.6"
        stroke="rgba(255,255,255,0.45)"
        strokeWidth="0.4"
        fill="none"
        strokeLinecap="round"
      />

      {/* Small socket (right) */}
      <ellipse
        cx="27"
        cy="16"
        rx="2.2"
        ry="5.5"
        fill="url(#ad-body)"
        stroke="rgba(255,255,255,0.6)"
        strokeWidth="0.4"
      />
      <ellipse cx="27" cy="16" rx="1.3" ry="3.2" fill="url(#ad-bore)" />
      <path
        d="M 27 13.1 Q 28.1 16 27 18.9"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="0.3"
        fill="none"
        strokeLinecap="round"
      />

      {/* Top specular highlights — one on each section, so the eye reads
          the body as two distinct pipes that share a wall. */}
      <rect
        x="7"
        y="9"
        width="9"
        height="0.9"
        rx="0.45"
        fill="rgba(255,255,255,0.6)"
      />
      <rect
        x="19"
        y="12"
        width="7"
        height="0.7"
        rx="0.35"
        fill="rgba(255,255,255,0.55)"
      />
    </svg>
  );
}
