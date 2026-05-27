"use client";

import type { ComponentType, ReactNode } from "react";
import NextLink from "next/link";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { House, Sparkles, type LucideIcon } from "lucide-react";
import { OSTooltip } from "./os-tooltip";
import type { AnyGenerator } from "../lib/generator";
import {
  useWindowManager,
  windowIdOf,
  type FolderId,
  type OpenWindow,
  type WindowPayload,
} from "../lib/window-manager";
import { FOLDER_META, folderPath } from "../lib/folders";
import { FolderSvg } from "./folder-svg";

interface AppDockProps {
  generators: AnyGenerator[];
}

/**
 * Floating macOS-style dock: persistent across the desktop and any open
 * windows.
 *
 * Two zones:
 *  · Left (pinned): Home + per-generator tiles. Always present.
 *  · Right (running): one folder tile per open folder window. Appears when
 *    the user opens Downloads or Presets, disappears when the folder closes.
 *
 * Indicator dots under tiles: solid bright when focused + visible, dim when
 * open but background or minimized, hidden when not open. Click cycles
 * open / focus + restore / minimize, the same way macOS dock tiles do.
 */
export function AppDock({ generators }: AppDockProps) {
  const openFolders = useOpenFolderWindows();

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
        <HomeDockTile />

        <DockSeparator />

        {generators.map((gen) => (
          <GeneratorDockTile key={gen.id} generator={gen} />
        ))}

        {openFolders.length > 0 && (
          <>
            <DockSeparator />
            {openFolders.map((win) => (
              <FolderDockTile key={win.id} window={win} />
            ))}
          </>
        )}
      </Box>
    </Box>
  );
}

/** All open folder windows in z-order (back to front), so newer folders sit to the right. */
function useOpenFolderWindows(): OpenWindow[] {
  const { windows } = useWindowManager();
  return windows
    .filter((w) => w.payload.kind === "folder")
    .sort((a, b) => a.z - b.z);
}

/* ─── Tile kinds ─────────────────────────────────────────────────────── */

/**
 * Home tile. Clicking it does "show desktop": minimizes every open window.
 * The NextLink still navigates the URL to `/` so direct bookmarks land
 * cleanly, and aria-current reflects whether nothing is focused.
 */
function HomeDockTile() {
  const { windows, focusedWindow, minimizeWindow } = useWindowManager();
  const onDesktop = focusedWindow === null;

  const handleClick = () => {
    for (const w of windows) {
      if (w.state !== "minimized") minimizeWindow(w.id);
    }
  };

  return (
    <DockTileShell
      href="/"
      onClick={handleClick}
      label="Mintables"
      accent="#7c66f5"
      indicator={onDesktop ? "focused" : "none"}
      ariaCurrent={onDesktop}
    >
      <AppTileFace
        accent="#7c66f5"
        gradient="linear-gradient(155deg, #5cb6b9 0%, #7c66f5 48%, #ec4899 100%)"
        icon={House}
        iconArt={HomeIconArt}
      />
    </DockTileShell>
  );
}

function GeneratorDockTile({ generator }: { generator: AnyGenerator }) {
  const {
    focusedWindow,
    windowById,
    openWindow,
    focusWindow,
    minimizeWindow,
    restoreWindow,
  } = useWindowManager();

  const payload: WindowPayload = { kind: "generator", generatorId: generator.id };
  const id = windowIdOf(payload);
  const win = windowById(id);
  const isFocused = focusedWindow?.id === id;
  const isOpen = Boolean(win);
  const isMinimized = win?.state === "minimized";

  const indicator: DockIndicator = !isOpen
    ? "none"
    : isFocused && !isMinimized
      ? "focused"
      : "background";

  const handleClick = () => {
    if (!win) {
      openWindow(payload);
      return;
    }
    if (isMinimized) {
      restoreWindow(id);
      return;
    }
    if (isFocused) {
      minimizeWindow(id);
      return;
    }
    focusWindow(id);
  };

  return (
    <DockTileShell
      href={`/generators/${generator.id}`}
      onClick={handleClick}
      label={generator.meta.name}
      accent={generator.meta.accent}
      indicator={indicator}
      ariaCurrent={isFocused && !isMinimized}
    >
      <AppTileFace
        accent={generator.meta.accent}
        icon={generator.meta.icon}
        iconArt={generator.meta.iconArt}
      />
    </DockTileShell>
  );
}

/**
 * Folder dock tile. Only rendered while the folder window is open, so it
 * doubles as a presence indicator (no tile, no folder open). Click matches
 * generator tiles: minimize when already focused, otherwise focus + restore.
 */
function FolderDockTile({ window: win }: { window: OpenWindow }) {
  const {
    focusedWindow,
    focusWindow,
    minimizeWindow,
    restoreWindow,
  } = useWindowManager();

  if (win.payload.kind !== "folder") return null;
  const folderId: FolderId = win.payload.folderId;
  const meta = FOLDER_META[folderId];

  const isFocused = focusedWindow?.id === win.id;
  const isMinimized = win.state === "minimized";

  const indicator: DockIndicator =
    isFocused && !isMinimized ? "focused" : "background";

  const handleClick = () => {
    if (isMinimized) {
      restoreWindow(win.id);
      return;
    }
    if (isFocused) {
      minimizeWindow(win.id);
      return;
    }
    focusWindow(win.id);
  };

  return (
    <DockTileShell
      href={folderPath(folderId)}
      onClick={handleClick}
      label={meta.title}
      accent={meta.accent}
      indicator={indicator}
      ariaCurrent={isFocused && !isMinimized}
    >
      <FolderTileFace accent={meta.accent} />
    </DockTileShell>
  );
}

/* ─── Shell + tile faces ─────────────────────────────────────────────── */

type DockIndicator = "none" | "background" | "focused";

interface DockTileShellProps {
  href: string;
  onClick: () => void;
  label: string;
  /** Drives the hover glow halo around any tile face. */
  accent: string;
  indicator: DockIndicator;
  ariaCurrent: boolean;
  children: ReactNode;
}

const ICON_BOX = 52;

/**
 * Outer chrome shared by every dock tile: tooltip, NextLink navigation, the
 * hover lift, the focus ring, and the indicator dot underneath. The visual
 * face (squircle for apps, folder graphic for folders) is supplied as
 * `children`, so each tile type renders distinctly while sharing motion.
 */
function DockTileShell({
  href,
  onClick,
  label,
  accent,
  indicator,
  ariaCurrent,
  children,
}: DockTileShellProps) {
  return (
    <OSTooltip
      title={label}
      placement="top"
      slotProps={{
        tooltip: {
          sx: { mb: "6px !important" },
        },
      }}
    >
      <Stack
        component={NextLink}
        href={href}
        onClick={(e) => {
          // The click handler drives WM state. We don't preventDefault, so
          // Next still navigates the URL (the WM and route shims are idempotent).
          onClick();
          void e;
        }}
        aria-label={label}
        aria-current={ariaCurrent ? "page" : undefined}
        sx={{
          alignItems: "center",
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

          "&:hover .dt-face": {
            filter: `drop-shadow(0 18px 22px ${accent}80) brightness(1.05)`,
          },

          "&:hover .dt-tile": {
            boxShadow: `0 18px 30px -10px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.18) inset, 0 18px 42px -14px ${accent}aa`,
          },

          "&:focus-visible": { outline: "none" },

          "&:focus-visible .dt-face": {
            filter: `drop-shadow(0 0 0 2px rgba(255,255,255,0.6)) drop-shadow(0 14px 18px ${accent}aa)`,
          },

          "&:focus-visible .dt-tile": {
            boxShadow: `0 0 0 2px rgba(255,255,255,0.6), 0 14px 28px -10px ${accent}aa`,
          }
        }}>
        <Box
          sx={{
            position: "relative",
            width: ICON_BOX,
            height: ICON_BOX,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {children}
        </Box>
        <DockIndicatorDot kind={indicator} />
      </Stack>
    </OSTooltip>
  );
}

interface AppTileFaceProps {
  /** Base color, drives hover glow + focus ring. When `gradient` is omitted,
   *  it also seeds the tile gradient (lightened top -> accent -> darkened). */
  accent: string;
  /** Optional explicit CSS gradient for the tile fill, used when a single
   *  accent doesn't tell the whole story (e.g. the multi-color Home tile). */
  gradient?: string;
  /** Lucide fallback when no `iconArt` is provided. */
  icon: LucideIcon;
  iconArt?: ComponentType<{ size?: number }>;
}

const ART_SIZE = 32;

/**
 * Squircle face used by Home and every generator. Per-app accent gradient
 * with a specular top sheen and grounded bottom shadow, hosting either a
 * generator-supplied `iconArt` SVG or the Lucide fallback.
 */
function AppTileFace({ accent, gradient, icon: Icon, iconArt: IconArt }: AppTileFaceProps) {
  const top = lighten(accent, 0.35);
  const bottom = darken(accent, 0.32);
  const tileGradient =
    gradient ?? `linear-gradient(155deg, ${top} 0%, ${accent} 50%, ${bottom} 100%)`;

  return (
    <Box
      className="dt-tile"
      sx={{
        position: "relative",
        width: ICON_BOX,
        height: ICON_BOX,
        // iOS-style squircle approximation via large border-radius
        // (~22% of the box) - softer corners than a stock rounded rect.
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
          // Specular top sheen, soft white highlight in the upper half
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
  );
}

/**
 * Folder face: the same FolderSvg used on the desktop, fit inside the tile
 * slot. No squircle background - it's intentionally a different visual
 * species from app tiles so folders read as files in the dock, not apps.
 * The depth comes from the shell's drop-shadow on hover.
 */
function FolderTileFace({ accent }: { accent: string }) {
  return (
    <Box
      className="dt-face"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.45))",
        transition: "filter 220ms ease",
      }}
    >
      <FolderSvg accent={accent} width={46} />
    </Box>
  );
}

function DockIndicatorDot({ kind }: { kind: DockIndicator }) {
  const visible = kind !== "none";
  const bright = kind === "focused";
  return (
    <Box
      aria-hidden
      sx={{
        position: "absolute",
        bottom: 0,
        width: visible ? (bright ? 5 : 4) : 0,
        height: visible ? (bright ? 5 : 4) : 0,
        borderRadius: "50%",
        bgcolor: "#fff",
        opacity: visible ? (bright ? 0.85 : 0.45) : 0,
        boxShadow: bright ? "0 0 6px rgba(255,255,255,0.7)" : "none",
        transition:
          "width 200ms ease, height 200ms ease, opacity 200ms ease",
      }}
    />
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

/** Brand "Finder-equivalent" home icon: sparkle inside a teal squircle. */
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
