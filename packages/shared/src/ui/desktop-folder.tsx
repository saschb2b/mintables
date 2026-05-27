"use client";

import NextLink from "next/link";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

interface DesktopFolderProps {
  href: string;
  label: string;
  /** Accent color for the folder body tint (e.g. blue for Downloads, purple for Presets). */
  accent: string;
}

/**
 * Desktop folder shortcut — a real folder-shaped icon (rounded body + tab on
 * top), drawn as inline SVG so it reads unambiguously as a folder at any
 * size. Single click navigates to the folder route; macOS-style hover lift.
 *
 * Intentionally a different visual species from `DesktopIcon` (which uses a
 * "document" tile) so folders and files are easy to tell apart.
 */
export function DesktopFolder({ href, label, accent }: DesktopFolderProps) {
  return (
    <Stack
      component={NextLink}
      href={href}
      alignItems="center"
      spacing={0.5}
      sx={{
        width: 84,
        py: 0.5,
        px: 0.5,
        borderRadius: 1.5,
        textDecoration: "none",
        color: "inherit",
        cursor: "pointer",
        userSelect: "none",
        transition: "background-color 120ms ease, transform 180ms ease",
        "& .folder-svg": {
          transition: "transform 180ms cubic-bezier(0.2, 0.8, 0.2, 1), filter 180ms ease",
        },
        "&:hover": {
          bgcolor: "rgba(120, 160, 220, 0.18)",
        },
        "&:hover .folder-svg": {
          transform: "translateY(-2px) scale(1.04)",
          filter: "brightness(1.08) drop-shadow(0 8px 12px rgba(0,0,0,0.5))",
        },
        "&:focus-visible": {
          outline: "none",
          bgcolor: "rgba(120, 160, 220, 0.26)",
        },
      }}
      aria-label={label}
    >
      <FolderSvg accent={accent} />
      <Typography
        sx={{
          fontSize: "0.74rem",
          fontWeight: 600,
          color: "#fff",
          textAlign: "center",
          lineHeight: 1.2,
          textShadow:
            "0 1px 1px rgba(0,0,0,0.95), 0 0 8px rgba(0,0,0,0.85), 0 2px 6px rgba(0,0,0,0.7)",
          maxWidth: "100%",
          wordBreak: "break-word",
        }}
      >
        {label}
      </Typography>
    </Stack>
  );
}

/**
 * macOS-style folder graphic — back sheet behind, tabbed front sheet in
 * front. Uses the supplied accent for the body fill so different folders
 * (Downloads, Presets, …) can be color-coded.
 */
function FolderSvg({ accent }: { accent: string }) {
  const id = sanitize(accent);
  return (
    <Box
      className="folder-svg"
      component="svg"
      viewBox="0 0 64 52"
      width={60}
      height={48}
      sx={{
        display: "block",
        filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.45))",
      }}
      aria-hidden
    >
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

      {/* Back sheet — peeking up at the top with the tab */}
      <path
        d="M 4 14 Q 4 10 8 10 L 22 10 L 26 6 Q 27 5 28 5 L 56 5 Q 60 5 60 9 L 60 38 Q 60 42 56 42 L 8 42 Q 4 42 4 38 Z"
        fill={`url(#fld-back-${id})`}
      />

      {/* Front sheet — the main folder body */}
      <path
        d="M 4 18 Q 4 14 8 14 L 56 14 Q 60 14 60 18 L 60 44 Q 60 48 56 48 L 8 48 Q 4 48 4 44 Z"
        fill={`url(#fld-front-${id})`}
      />

      {/* Top-edge specular highlight on the front */}
      <path
        d="M 4 18 Q 4 14 8 14 L 56 14 Q 60 14 60 18 L 60 22 L 4 22 Z"
        fill={`url(#fld-sheen-${id})`}
      />

      {/* Hairline stroke along the top of the front for the seam between sheets */}
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

/* ─── color helpers (inline to keep this component self-contained) ─── */

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

/** Make a stable SVG id suffix from the accent (so multiple folders co-exist). */
function sanitize(s: string): string {
  return s.replace(/[^a-zA-Z0-9]/g, "");
}
