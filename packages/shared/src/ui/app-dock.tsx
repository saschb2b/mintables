"use client";

import type { ComponentType } from "react";
import NextLink from "next/link";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import { tooltipClasses } from "@mui/material/Tooltip";
import { House, Sparkles, type LucideIcon } from "lucide-react";
import type { AnyGenerator } from "../lib/generator";

interface AppDockProps {
  generators: AnyGenerator[];
  /** Current generator id (when on a generator route). Undefined on the hub. */
  currentId?: string;
}

/**
 * Floating macOS-style dock: persistent across hub + generator routes.
 * Apps only — Home returns to the desktop, each generator gets a tile with
 * a running-indicator dot when active. Secondary links (GitHub, sponsor,
 * about) live on the desktop as shortcut icons.
 */
export function AppDock({ generators, currentId }: AppDockProps) {
  const onHub = currentId === undefined;

  return (
    <Box
      component="nav"
      aria-label="App dock"
      sx={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: { xs: 12, sm: 18 },
        zIndex: 1200,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
        px: 2,
      }}
    >
      <Box
        sx={{
          pointerEvents: "auto",
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          px: 1.25,
          py: 1,
          borderRadius: 3.5,
          bgcolor: "rgba(24, 26, 38, 0.58)",
          border: "1px solid rgba(255, 255, 255, 0.10)",
          backdropFilter: "blur(28px) saturate(170%)",
          WebkitBackdropFilter: "blur(28px) saturate(170%)",
          boxShadow:
            "0 28px 60px -20px rgba(0, 0, 0, 0.7), 0 4px 12px -4px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.07)",
          maxWidth: "calc(100vw - 24px)",
          overflowX: "auto",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        <DockTile
          href="/"
          label="Mintables"
          // Accent (used for hover glow + focus ring) is the mid-tone of the
          // brand gradient. The gradient itself is supplied explicitly so
          // Home doesn't share a hue with any single generator.
          accent="#7c66f5"
          gradient="linear-gradient(155deg, #5cb6b9 0%, #7c66f5 48%, #ec4899 100%)"
          active={onHub}
          icon={House}
          iconArt={HomeIconArt}
        />

        <DockSeparator />

        {generators.map((gen) => (
          <DockTile
            key={gen.id}
            href={`/generators/${gen.id}`}
            label={gen.meta.name}
            accent={gen.meta.accent}
            active={gen.id === currentId}
            icon={gen.meta.icon}
            iconArt={gen.meta.iconArt}
          />
        ))}
      </Box>
    </Box>
  );
}

interface DockTileProps {
  href: string;
  label: string;
  /** Base color — drives hover glow + focus ring. When `gradient` is omitted,
   *  it also seeds the tile gradient (lightened top → accent → darkened). */
  accent: string;
  /** Optional explicit CSS gradient for the tile fill — used when a single
   *  accent doesn't tell the whole story (e.g. the multi-color Home tile). */
  gradient?: string;
  active?: boolean;
  /** Lucide fallback when no `iconArt` is provided. */
  icon: LucideIcon;
  iconArt?: ComponentType<{ size?: number }>;
}

const ICON_BOX = 52;
const ART_SIZE = 32;

function DockTile({
  href,
  label,
  accent,
  gradient,
  active = false,
  icon: Icon,
  iconArt: IconArt,
}: DockTileProps) {
  const top = lighten(accent, 0.35);
  const bottom = darken(accent, 0.32);
  const tileGradient =
    gradient ?? `linear-gradient(155deg, ${top} 0%, ${accent} 50%, ${bottom} 100%)`;

  return (
    <Tooltip
      title={label}
      placement="top"
      arrow
      enterDelay={150}
      slotProps={{
        tooltip: {
          sx: {
            bgcolor: "rgba(24, 26, 38, 0.94)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            fontSize: "0.72rem",
            fontWeight: 600,
            letterSpacing: 0.2,
            px: 1.25,
            py: 0.5,
            mb: "6px !important",
            [`& .${tooltipClasses.arrow}`]: {
              color: "rgba(24, 26, 38, 0.94)",
            },
          },
        },
      }}
    >
      <Stack
        component={NextLink}
        href={href}
        alignItems="center"
        sx={{
          position: "relative",
          width: ICON_BOX + 4,
          height: ICON_BOX + 8,
          textDecoration: "none",
          color: "inherit",
          transition:
            "transform 240ms cubic-bezier(0.2, 0.8, 0.2, 1), filter 240ms ease",
          "&:hover": {
            transform: "translateY(-6px) scale(1.08)",
          },
          "&:hover .dt-tile": {
            boxShadow: `0 18px 30px -10px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.18) inset, 0 18px 42px -14px ${accent}aa`,
          },
          "&:focus-visible": { outline: "none" },
          "&:focus-visible .dt-tile": {
            boxShadow: `0 0 0 2px rgba(255,255,255,0.6), 0 14px 28px -10px ${accent}aa`,
          },
        }}
        aria-label={label}
        aria-current={active ? "page" : undefined}
      >
        <Box
          className="dt-tile"
          sx={{
            position: "relative",
            width: ICON_BOX,
            height: ICON_BOX,
            // iOS-style squircle approximation via large border-radius
            // (~22% of the box) — softer corners than a stock rounded rect.
            borderRadius: "22%",
            background: tileGradient,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            boxShadow:
              "0 10px 22px -8px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.10) inset, 0 -2px 4px rgba(0,0,0,0.18) inset",
            transition: "box-shadow 220ms ease",
            overflow: "hidden",
            "&::before": {
              // Specular top sheen — a soft white highlight in the upper half
              // that gives the tile a glass / ceramic feel.
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "55%",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0.10) 50%, transparent 100%)",
              pointerEvents: "none",
            },
            "&::after": {
              // Bottom inner shadow for grounded depth.
              content: '""',
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: "40%",
              background:
                "linear-gradient(0deg, rgba(0,0,0,0.18) 0%, transparent 100%)",
              pointerEvents: "none",
            },
          }}
        >
          <Box sx={{ position: "relative", zIndex: 1, display: "flex" }}>
            {IconArt ? <IconArt size={ART_SIZE} /> : <Icon size={26} />}
          </Box>
        </Box>
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            bottom: 0,
            width: active ? 5 : 0,
            height: active ? 5 : 0,
            borderRadius: "50%",
            bgcolor: "#fff",
            opacity: active ? 0.85 : 0,
            boxShadow: active ? "0 0 6px rgba(255,255,255,0.7)" : "none",
            transition:
              "width 200ms ease, height 200ms ease, opacity 200ms ease",
          }}
        />
      </Stack>
    </Tooltip>
  );
}

function DockSeparator() {
  return (
    <Box
      aria-hidden
      sx={{
        width: "1px",
        height: 36,
        mx: 0.75,
        background:
          "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)",
        flexShrink: 0,
      }}
    />
  );
}

/** Brand "Finder-equivalent" home icon — sparkle inside a teal squircle. */
function HomeIconArt({ size = 32 }: { size?: number }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.35))",
      }}
    >
      <Sparkles size={Math.round(size * 0.7)} strokeWidth={2.2} />
    </Box>
  );
}

/* ─── color helpers ─────────────────────────────────────────────────── */

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
