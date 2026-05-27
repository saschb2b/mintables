"use client";

import NextLink from "next/link";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { FolderSvg } from "./folder-svg";

interface DesktopFolderProps {
  href: string;
  label: string;
  /** Accent color for the folder body tint (e.g. blue for Downloads, purple for Presets). */
  accent: string;
}

/**
 * Desktop folder shortcut: real folder-shaped icon (rounded body + tab on
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
        "& .folder-svg-wrap": {
          transition:
            "transform 180ms cubic-bezier(0.2, 0.8, 0.2, 1), filter 180ms ease",
        },
        "&:hover": {
          bgcolor: "rgba(120, 160, 220, 0.18)",
        },
        "&:hover .folder-svg-wrap": {
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
      <Box className="folder-svg-wrap">
        <FolderSvg accent={accent} width={60} shadow />
      </Box>
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
