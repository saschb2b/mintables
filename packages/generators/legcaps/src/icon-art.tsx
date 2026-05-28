/**
 * Dock-icon artwork for the Leg Caps app. A small chair-leg foot capped
 * with a printed leg cap, seen from a slight 3/4 angle. The cap is the
 * subject — the leg is a thin gesture so the eye reads "cap, slipped onto
 * a leg." Drawn in a normalized 32-unit viewBox.
 */
export function LegCapIconArt({ size = 32 }: { size?: number }) {
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
        <linearGradient id="legcap-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.96" />
          <stop offset="55%" stopColor="#e9eef2" stopOpacity="0.92" />
          <stop offset="100%" stopColor="#bcc7d1" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id="legcap-leg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8b6c4a" />
          <stop offset="100%" stopColor="#5a4530" />
        </linearGradient>
        <radialGradient id="legcap-bore" cx="0.5" cy="0.4" r="0.6">
          <stop offset="0%" stopColor="rgba(0,0,0,0.55)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.85)" />
        </radialGradient>
      </defs>

      {/* Drop shadow on the ground */}
      <ellipse cx="16" cy="28.5" rx="10" ry="1.5" fill="rgba(0,0,0,0.32)" />

      {/* Wooden leg stub, descending into the cap */}
      <path
        d="M 11.5 4 L 11.5 14 Q 11.5 16 16 16 Q 20.5 16 20.5 14 L 20.5 4 Z"
        fill="url(#legcap-leg)"
      />
      {/* Top end-grain ellipse of the leg */}
      <ellipse cx="16" cy="4" rx="4.5" ry="1.2" fill="#a78661" />

      {/* Cap body — wider than the leg, slightly tapered outer flank */}
      <path
        d="M 6.5 15 L 7.5 26.5 Q 7.5 28 16 28 Q 24.5 28 24.5 26.5 L 25.5 15 Z"
        fill="url(#legcap-body)"
      />

      {/* Top rim ellipse of the cap (annular face around the socket) */}
      <ellipse
        cx="16"
        cy="15"
        rx="9.5"
        ry="2.8"
        fill="url(#legcap-body)"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth="0.35"
      />

      {/* Socket opening — the dark inner ellipse where the leg slips in */}
      <ellipse cx="16" cy="15" rx="5.2" ry="1.5" fill="url(#legcap-bore)" />

      {/* Faint inner-edge highlight on the socket */}
      <path
        d="M 11.2 14.6 Q 16 13.2 20.8 14.6"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="0.45"
        fill="none"
        strokeLinecap="round"
      />

      {/* Vertical specular streak on the cap body */}
      <rect
        x="9"
        y="16"
        width="1.4"
        height="10"
        rx="0.6"
        fill="rgba(255,255,255,0.55)"
      />
    </svg>
  );
}
