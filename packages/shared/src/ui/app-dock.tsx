"use client";

import NextLink from "next/link";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import { tooltipClasses } from "@mui/material/Tooltip";
import { House, type LucideIcon } from "lucide-react";
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
          px: 1,
          py: 1,
          borderRadius: 3,
          bgcolor: "rgba(24, 26, 38, 0.55)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(24px) saturate(160%)",
          WebkitBackdropFilter: "blur(24px) saturate(160%)",
          boxShadow:
            "0 22px 60px -18px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.04)",
          maxWidth: "calc(100vw - 24px)",
          overflowX: "auto",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        <DockTile
          href="/"
          label="Home"
          icon={House}
          active={onHub}
          accent="#5a9a9d"
        />

        <DockSeparator />

        {generators.map((gen) => (
          <DockTile
            key={gen.id}
            href={`/generators/${gen.id}`}
            label={gen.meta.name}
            icon={gen.meta.icon}
            active={gen.id === currentId}
            accent={gen.meta.accent}
          />
        ))}
      </Box>
    </Box>
  );
}

interface DockTileProps {
  href: string;
  label: string;
  icon: LucideIcon;
  active?: boolean;
  accent: string;
}

function DockTile({
  href,
  label,
  icon: Icon,
  active = false,
  accent,
}: DockTileProps) {
  return (
    <Tooltip
      title={label}
      placement="top"
      arrow
      enterDelay={120}
      slotProps={{
        tooltip: {
          sx: {
            bgcolor: "rgba(24, 26, 38, 0.92)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            fontSize: "0.72rem",
            fontWeight: 600,
            letterSpacing: 0.2,
            px: 1.25,
            py: 0.5,
            [`& .${tooltipClasses.arrow}`]: {
              color: "rgba(24, 26, 38, 0.92)",
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
          width: 52,
          height: 52,
          textDecoration: "none",
          color: "inherit",
          borderRadius: 2,
          transition:
            "transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1), background-color 180ms ease",
          "&:hover": {
            transform: "translateY(-4px) scale(1.06)",
          },
          "&:hover .dock-tile-bg": {
            bgcolor: active ? `${accent}55` : `${accent}33`,
            borderColor: `${accent}80`,
            boxShadow: `0 14px 28px -10px ${accent}99`,
          },
        }}
        aria-label={label}
        aria-current={active ? "page" : undefined}
      >
        <Box
          className="dock-tile-bg"
          sx={{
            width: 44,
            height: 44,
            mt: 0.5,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            bgcolor: active ? `${accent}40` : "rgba(255, 255, 255, 0.04)",
            border: `1px solid ${active ? `${accent}66` : "rgba(255, 255, 255, 0.08)"}`,
            transition:
              "background-color 180ms ease, border-color 180ms ease, box-shadow 220ms ease",
            boxShadow: active
              ? `inset 0 0 0 1px ${accent}33, 0 6px 18px -6px ${accent}80`
              : "none",
          }}
        >
          <Icon size={20} />
        </Box>
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            bottom: -2,
            width: active ? 5 : 0,
            height: active ? 5 : 0,
            borderRadius: "50%",
            bgcolor: accent,
            boxShadow: active ? `0 0 8px ${accent}` : "none",
            transition: "width 180ms ease, height 180ms ease",
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
        height: 32,
        mx: 0.75,
        bgcolor: "rgba(255, 255, 255, 0.12)",
        flexShrink: 0,
      }}
    />
  );
}
