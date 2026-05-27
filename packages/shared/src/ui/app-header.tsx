"use client";

import NextLink from "next/link";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Sparkles } from "lucide-react";
import type { AnyGenerator } from "../lib/generator";
import { SystemClock } from "./system-clock";

interface AppHeaderProps {
  generators: AnyGenerator[];
  /** Current generator id (when on a generator route). */
  currentId?: string;
}

/**
 * Menu bar — macOS-style strip across the very top of the screen.
 *  · left: brand wordmark (system menu)
 *  · center-left: active app name (only when an app is open)
 *  · right: status cluster — online indicator + live clock
 */
export function AppHeader({ generators, currentId }: AppHeaderProps) {
  const current = generators.find((g) => g.id === currentId);

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
          fontWeight={700}
          sx={{ fontSize: "0.78rem", letterSpacing: 0.1, lineHeight: 1 }}
        >
          Mintables
        </Typography>
      </Box>

      {current && (
        <Stack direction="row" alignItems="center" spacing={0.75}>
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
        alignItems="center"
        sx={{ ml: "auto" }}
      >
        <Stack direction="row" spacing={0.5} alignItems="center">
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
