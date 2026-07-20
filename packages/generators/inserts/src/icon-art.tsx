/** Dock artwork showing an uneven insert with cards, tokens, and a scoop well. */
export function InsertIconArt({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.4))" }}
    >
      <defs>
        <linearGradient id="insert-rim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.98" />
          <stop offset="100%" stopColor="#b8dce8" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id="insert-well" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#274b5c" />
          <stop offset="100%" stopColor="#112b37" />
        </linearGradient>
      </defs>
      <path d="M4 8.5 15 3l13 6.5v14L17 29 4 22.5z" fill="url(#insert-rim)" />
      <path d="m7 10 8-4 4 2-8 4z" fill="url(#insert-well)" />
      <path d="m12.5 13 7.5-3.8 5 2.5-7.5 3.8z" fill="url(#insert-well)" />
      <path d="m7 12.8 4 2v6.7l-4-2z" fill="#163747" />
      <path d="m12.5 15.5 5 2.5v7l-5-2.5z" fill="#163747" />
      <path d="m19 17.2 6-3v6.7l-6 3z" fill="#163747" />
      <path d="m8.2 10.1 1.2-.6 4 2-1.2.6z" fill="#f8fafc" />
      <path d="m8.2 9.1 1.2-.6 4 2-1.2.6z" fill="#dbeafe" />
      <circle cx="21.7" cy="13.3" r="1.1" fill="#fbbf24" />
      <circle cx="18.8" cy="14.7" r="1" fill="#fb7185" />
      <path
        d="M19 21.8c1.2-2.2 3.1-3.2 6-3.8v2.9l-6 3z"
        fill="#d8f3f8"
        opacity="0.8"
      />
      <path
        d="M4 8.5 15 3l13 6.5M4 8.5l13 6.5 11-5.5M17 15v14"
        stroke="#ffffff"
        strokeOpacity="0.5"
        strokeWidth="0.55"
        strokeLinejoin="round"
      />
    </svg>
  );
}
