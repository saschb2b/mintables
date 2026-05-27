"use client";

import { useEffect, useState } from "react";
import NextLink from "next/link";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { OSTooltip } from "./os-tooltip";
import Typography from "@mui/material/Typography";
import { Search, Sparkles } from "lucide-react";
import type { AnyGenerator } from "../lib/generator";
import { useWindowManager } from "../lib/window-manager";
import { SPOTLIGHT_OPEN_EVENT } from "./spotlight";
import { SystemClock } from "./system-clock";

interface AppHeaderProps {
  generators: AnyGenerator[];
}

/**
 * Menu bar — macOS-style strip across the very top of the screen.
 *  · left: brand wordmark (system menu)
 *  · center-left: active app name (only when an app's window is focused)
 *  · right: status cluster — online indicator + live clock
 */
export function AppHeader({ generators }: AppHeaderProps) {
  const { focusedWindow } = useWindowManager();
  const focusedPayload = focusedWindow?.payload;
  const current =
    focusedPayload?.kind === "generator"
      ? generators.find((g) => g.id === focusedPayload.generatorId)
      : undefined;

  return (
    <Box
      component="header"
      sx={{
        flexShrink: 0,
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        gap: 2,
        px: 1.5,
        height: 30,
        borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
        bgcolor: "rgba(14, 16, 26, 0.65)",
        backdropFilter: "blur(22px) saturate(160%)",
        WebkitBackdropFilter: "blur(22px) saturate(160%)",
      }}
    >
      <Box
        component={NextLink}
        href="/"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.75,
          textDecoration: "none",
          color: "inherit",
        }}
      >
        <Sparkles size={13} style={{ color: "var(--mui-palette-primary-main)" }} />
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            fontSize: "0.78rem",
            letterSpacing: 0.1,
            lineHeight: 1
          }}>
          Mintables
        </Typography>
      </Box>
      {current && (
        <Stack direction="row" spacing={0.75} sx={{
          alignItems: "center"
        }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              fontSize: "0.74rem",
              color: "text.primary",
              lineHeight: 1,
            }}
          >
            {current.meta.name}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              display: { xs: "none", md: "inline" },
              color: "text.secondary",
              fontSize: "0.72rem",
              lineHeight: 1,
            }}
          >
            · {current.meta.tagline}
          </Typography>
        </Stack>
      )}
      <Stack
        direction="row"
        spacing={1.5}
        sx={{
          alignItems: "center",
          ml: "auto"
        }}>
        <SpotlightTrigger />
        <Stack direction="row" spacing={0.5} sx={{
          alignItems: "center"
        }}>
          <Box
            aria-hidden
            sx={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              bgcolor: "#22c55e",
              boxShadow: "0 0 6px rgba(34, 197, 94, 0.6)",
            }}
          />
          <Typography
            variant="caption"
            sx={{
              display: { xs: "none", sm: "inline" },
              color: "text.secondary",
              fontSize: "0.7rem",
              letterSpacing: 0.3,
              textTransform: "uppercase",
            }}
          >
            Local
          </Typography>
        </Stack>
        <SystemClock />
      </Stack>
    </Box>
  );
}

/**
 * Magnifying-glass icon in the menu bar (macOS-style). Click dispatches the
 * spotlight-open event; the keyboard shortcut (Cmd/Ctrl+K) continues to work
 * independently. Tooltip shows the platform-correct modifier so users learn
 * the shortcut by hovering.
 */
function SpotlightTrigger() {
  const isMac = useIsMac();
  const shortcut = isMac ? "⌘K" : "Ctrl+K";

  return (
    <OSTooltip
      title={`Search · ${shortcut}`}
      placement="bottom"
      slotProps={{
        tooltip: {
          sx: { mt: "6px !important" },
        },
      }}
    >
      <Box
        component="button"
        type="button"
        aria-label={`Search (${shortcut})`}
        onClick={() => {
          window.dispatchEvent(new CustomEvent(SPOTLIGHT_OPEN_EVENT));
        }}
        sx={{
          all: "unset",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 22,
          height: 22,
          borderRadius: 1,
          cursor: "pointer",
          color: "text.secondary",
          transition: "background-color 120ms ease, color 120ms ease",
          "&:hover": {
            bgcolor: "rgba(255, 255, 255, 0.10)",
            color: "text.primary",
          },
          "&:focus-visible": {
            outline: "none",
            bgcolor: "rgba(255, 255, 255, 0.10)",
            color: "text.primary",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.25)",
          },
        }}
      >
        <Search size={13} />
      </Box>
    </OSTooltip>
  );
}

function useIsMac(): boolean {
  const [isMac, setIsMac] = useState(false);
  useEffect(() => {
    const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
    setIsMac(/Mac|iPhone|iPad|iPod/i.test(ua));
  }, []);
  return isMac;
}
