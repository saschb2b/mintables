/**
 * Dock illustration: an arc handle standing on its two feet with a small
 * knob beside it. Foreground only; the dock paints the accent gradient
 * behind it.
 */
export function PullIconArt({ size = 34 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M 7 23 A 10.5 10.5 0 0 1 25 23"
        stroke="rgba(255,255,255,0.95)"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <rect
        x="5"
        y="23"
        width="4.4"
        height="2.6"
        rx="1.1"
        fill="rgba(255,255,255,0.8)"
      />
      <rect
        x="22.6"
        y="23"
        width="4.4"
        height="2.6"
        rx="1.1"
        fill="rgba(255,255,255,0.8)"
      />
      <circle cx="16" cy="24.4" r="2.6" fill="rgba(255,255,255,0.55)" />
    </svg>
  );
}
