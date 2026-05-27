"use client";

import type { ReactNode } from "react";
import NextLink from "next/link";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { LucideIcon } from "lucide-react";

/** Render-prop icon — accepts any component that takes a size prop. */
type IconComponent =
  | LucideIcon
  | ((props: { size?: number }) => ReactNode);

interface DesktopIconBaseProps {
  icon: IconComponent;
  label: string;
  /** Small badge overlay in the lower-right corner (e.g. a shortcut arrow). */
  badge?: IconComponent;
}

interface DesktopIconLinkProps extends DesktopIconBaseProps {
  href: string;
  external?: boolean;
  onClick?: never;
}

interface DesktopIconButtonProps extends DesktopIconBaseProps {
  onClick: () => void;
  href?: never;
  external?: never;
}

type DesktopIconProps = DesktopIconLinkProps | DesktopIconButtonProps;

/**
 * A single desktop shortcut — drawn like a small document icon with the
 * filename underneath. Single-click activates (opens a URL or runs the
 * handler) the way iPadOS / phone home screens behave; macOS/Windows users
 * are forgiving of this for one-click web shortcuts.
 */
export function DesktopIcon(props: DesktopIconProps) {
  const { icon: Icon, label, badge: Badge } = props;

  const inner = (
    <Stack
      spacing={0.5}
      sx={{
        alignItems: "center",
        width: 78,
        py: 0.75,
        px: 0.5,
        borderRadius: 1.5,
        textDecoration: "none",
        color: "inherit",
        cursor: "pointer",
        userSelect: "none",
        transition: "background-color 120ms ease, transform 160ms ease",

        "& .di-tile": {
          transition: "filter 160ms ease, box-shadow 160ms ease",
        },

        "&:hover": {
          bgcolor: "rgba(120, 160, 220, 0.18)",
        },

        "&:hover .di-tile": {
          filter: "brightness(1.1)",
          boxShadow:
            "0 8px 18px -6px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.16)",
        },

        "&:focus-visible": {
          outline: "none",
          bgcolor: "rgba(120, 160, 220, 0.26)",
        }
      }}>
      <Box
        className="di-tile"
        sx={{
          position: "relative",
          width: 50,
          height: 58,
          borderRadius: 1.25,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          background:
            "linear-gradient(180deg, rgba(35, 38, 52, 0.55) 0%, rgba(20, 22, 32, 0.45) 100%)",
          backdropFilter: "blur(14px) saturate(140%)",
          WebkitBackdropFilter: "blur(14px) saturate(140%)",
          border: "1px solid rgba(255, 255, 255, 0.18)",
          boxShadow:
            "0 8px 18px -6px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.14)",
        }}
      >
        <Icon size={24} />
        {Badge && (
          <Box
            sx={{
              position: "absolute",
              right: -4,
              bottom: -4,
              width: 18,
              height: 18,
              borderRadius: 0.75,
              bgcolor: "rgba(28, 30, 42, 0.95)",
              border: "1px solid rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255,255,255,0.85)",
              boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
            }}
          >
            <Badge size={10} />
          </Box>
        )}
      </Box>
      <Typography
        sx={{
          fontSize: "0.74rem",
          fontWeight: 600,
          color: "#fff",
          textAlign: "center",
          lineHeight: 1.2,
          textShadow:
            "0 1px 1px rgba(0, 0, 0, 0.95), 0 0 8px rgba(0, 0, 0, 0.85), 0 2px 6px rgba(0, 0, 0, 0.7)",
          maxWidth: "100%",
          wordBreak: "break-word",
        }}
      >
        {label}
      </Typography>
    </Stack>
  );

  if ("onClick" in props && props.onClick) {
    return (
      <Box
        component="button"
        type="button"
        onClick={props.onClick}
        aria-label={label}
        sx={{
          all: "unset",
          display: "block",
          "&:focus-visible": { outline: "none" },
        }}
      >
        {inner}
      </Box>
    );
  }

  const isExternal = "external" in props ? props.external : false;
  if (isExternal) {
    return (
      <Box
        component="a"
        href={props.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        sx={{ textDecoration: "none", color: "inherit", display: "block" }}
      >
        {inner}
      </Box>
    );
  }
  return (
    <Box
      component={NextLink}
      href={props.href}
      aria-label={label}
      sx={{ textDecoration: "none", color: "inherit", display: "block" }}
    >
      {inner}
    </Box>
  );
}
