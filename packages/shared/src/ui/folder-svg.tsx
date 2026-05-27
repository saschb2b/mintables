"use client";

import Box from "@mui/material/Box";

interface FolderSvgProps {
  /** Body fill color (e.g. blue for Downloads, purple for Presets). */
  accent: string;
  /** Rendered width in px. Height follows the 64x52 viewBox aspect ratio. */
  width?: number;
  /** Whether to bake a soft drop-shadow into the SVG itself. Desktop icons
   *  want this (they float on a photo); dock tiles supply their own depth. */
  shadow?: boolean;
}

/**
 * macOS-style folder graphic: a back sheet peeking up with the tab, a front
 * sheet in front. Self-contained SVG so it stays sharp at any size. The
 * shadow is opt-in so the same shape can be used both on the desktop
 * (where it floats over the wallpaper and needs depth) and in the dock
 * (where the surrounding tile already provides depth).
 */
export function FolderSvg({ accent, width = 60, shadow = false }: FolderSvgProps) {
  const id = sanitize(accent);
  const height = (width * 52) / 64;
  return (
    <Box
      component="svg"
      viewBox="0 0 64 52"
      aria-hidden
      sx={{
        width: width,
        height: height,
        display: "block",

        filter: shadow
          ? "drop-shadow(0 6px 10px rgba(0,0,0,0.45))"
          : undefined
      }}>
      <defs>
        <linearGradient id={`fld-back-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lighten(accent, 0.55)} />
          <stop offset="100%" stopColor={accent} />
        </linearGradient>
        <linearGradient id={`fld-front-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lighten(accent, 0.25)} />
          <stop offset="60%" stopColor={accent} />
          <stop offset="100%" stopColor={darken(accent, 0.22)} />
        </linearGradient>
        <linearGradient id={`fld-sheen-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>
      {/* Back sheet peeking up at the top with the tab. */}
      <path
        d="M 4 14 Q 4 10 8 10 L 22 10 L 26 6 Q 27 5 28 5 L 56 5 Q 60 5 60 9 L 60 38 Q 60 42 56 42 L 8 42 Q 4 42 4 38 Z"
        fill={`url(#fld-back-${id})`}
      />
      {/* Front sheet, the main folder body. */}
      <path
        d="M 4 18 Q 4 14 8 14 L 56 14 Q 60 14 60 18 L 60 44 Q 60 48 56 48 L 8 48 Q 4 48 4 44 Z"
        fill={`url(#fld-front-${id})`}
      />
      {/* Top-edge specular highlight on the front. */}
      <path
        d="M 4 18 Q 4 14 8 14 L 56 14 Q 60 14 60 18 L 60 22 L 4 22 Z"
        fill={`url(#fld-sheen-${id})`}
      />
      {/* Hairline stroke along the top of the front for the seam between sheets. */}
      <line
        x1="4"
        y1="14"
        x2="60"
        y2="14"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="0.6"
      />
    </Box>
  );
}

function lighten(hex: string, t: number): string {
  return mix(hex, "#ffffff", t);
}

function darken(hex: string, t: number): string {
  return mix(hex, "#000000", t);
}

function mix(a: string, b: string, t: number): string {
  const ca = parseHex(a);
  const cb = parseHex(b);
  const r = Math.round(ca.r + (cb.r - ca.r) * t);
  const g = Math.round(ca.g + (cb.g - ca.g) * t);
  const bl = Math.round(ca.b + (cb.b - ca.b) * t);
  return `rgb(${String(r)}, ${String(g)}, ${String(bl)})`;
}

function parseHex(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  const n = parseInt(
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h,
    16,
  );
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

/** Make a stable SVG id suffix from the accent so multiple folders co-exist. */
function sanitize(s: string): string {
  return s.replace(/[^a-zA-Z0-9]/g, "");
}
