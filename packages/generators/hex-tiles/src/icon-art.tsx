export function HexTileIconArt({ size = 34 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 34 34"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M17 3.5 29 10.2v13.6L17 30.5 5 23.8V10.2L17 3.5Z"
        fill="#fde68a"
        stroke="#7c2d12"
        strokeWidth="1.3"
      />
      <path
        d="M17 7.2 25.9 12v9.9L17 26.8 8.1 21.9V12L17 7.2Z"
        fill="#92400e"
        opacity="0.75"
      />
      <path
        d="M17 9.8c4.3 0 7.1 2.4 7.1 5.4 0 4.2-3.2 8.4-7.1 8.4s-7.1-4.2-7.1-8.4c0-3 2.8-5.4 7.1-5.4Z"
        fill="#f59e0b"
      />
      <circle cx="5.8" cy="17" r="1.35" fill="#e5e7eb" />
      <circle cx="28.2" cy="17" r="1.35" fill="#e5e7eb" />
    </svg>
  );
}
