"use client";

import type { CSSProperties } from "react";

interface CascadingTextProps {
  text: string;
  /** Initial delay before the first letter starts (ms). */
  delayMs?: number;
  /** Per-letter offset (ms). */
  staggerMs?: number;
  /** Per-letter duration (ms). */
  durationMs?: number;
  style?: CSSProperties;
}

/**
 * Splits `text` into per-letter spans that fade + rise into place with a
 * staggered delay. Keyframe is inlined once and deduplicated by React.
 */
export function CascadingText({
  text,
  delayMs = 0,
  staggerMs = 28,
  durationMs = 620,
  style,
}: CascadingTextProps) {
  return (
    <span style={{ display: "inline-block", ...style }}>
      <style>{`
        @keyframes cascade-in {
          from { opacity: 0; transform: translateY(0.45em); filter: blur(6px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
      `}</style>
      {text.split("").map((char, i) => (
        <span
          key={`${char}-${String(i)}`}
          style={{
            display: "inline-block",
            opacity: 0,
            whiteSpace: char === " " ? "pre" : "normal",
            animationName: "cascade-in",
            animationDuration: `${String(durationMs)}ms`,
            animationTimingFunction: "cubic-bezier(0.2, 0.8, 0.2, 1)",
            animationFillMode: "forwards",
            animationDelay: `${String(delayMs + i * staggerMs)}ms`,
          }}
        >
          {char}
        </span>
      ))}
    </span>
  );
}
