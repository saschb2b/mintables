"use client";

import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { X, type LucideIcon } from "lucide-react";
import { OSTooltip } from "./os-tooltip";

interface DialogWindowProps {
  open: boolean;
  onClose: () => void;
  /** Title-bar app icon — appears next to the title, color-filled with `accent`. */
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  /** Drives the title-bar app-icon background + the top accent line. */
  accent: string;
  /** MUI maxWidth (defaults to `sm`). */
  maxWidth?: "xs" | "sm" | "md";
  /** When false, hides the title bar entirely (e.g. for a sheet-style dialog). */
  showTitleBar?: boolean;
  children: ReactNode;
}

/**
 * Dialog with the same chrome as `AppWindow`: top accent line, frosted
 * title bar with traffic lights (only the red close is functional —
 * yellow/green mirror "About This Mac" by being visually present but
 * inert), centered icon+title, layered drop shadow. Makes modals feel
 * like miniature OS windows that belong on the desktop, not like
 * floating Material cards.
 */
export function DialogWindow({
  open,
  onClose,
  icon: Icon,
  title,
  subtitle,
  accent,
  maxWidth = "sm",
  showTitleBar = true,
  children,
}: DialogWindowProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: "blur(6px)",
            bgcolor: "rgba(0, 0, 0, 0.45)",
          },
        },
        paper: {
          sx: {
            position: "relative",
            overflow: "hidden",
            bgcolor: "rgba(20, 22, 32, 0.92)",
            backdropFilter: "blur(28px) saturate(160%)",
            WebkitBackdropFilter: "blur(28px) saturate(160%)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: 2.5,
            boxShadow:
              "0 40px 90px -22px rgba(0, 0, 0, 0.75), 0 10px 28px -8px rgba(0, 0, 0, 0.4)",
            margin: 2,
            // The Paper gets `tabIndex={-1}` + autoFocus from MUI Dialog and
            // would otherwise show the browser's default focus ring around
            // the whole dialog (looks like a glow). Suppress it explicitly.
            outline: "none",
            "&:focus, &:focus-visible": { outline: "none" },
            // Brief "open" animation matching the AppWindow feel.
            animation:
              "dialog-window-open 0.36s cubic-bezier(0.2, 0.85, 0.25, 1) forwards",
            "@keyframes dialog-window-open": {
              from: { opacity: 0, transform: "translateY(8px) scale(0.985)" },
              to: { opacity: 1, transform: "translateY(0) scale(1)" },
            },
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 2,
              background: `linear-gradient(90deg, transparent 0%, ${accent} 50%, transparent 100%)`,
              opacity: 0.65,
              pointerEvents: "none",
            },
          },
        },
      }}
    >
      {showTitleBar && (
        <Stack
          direction="row"
          sx={{
            alignItems: "center",
            flexShrink: 0,
            height: 34,
            px: 1.25,
            borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
            bgcolor: "rgba(30, 32, 42, 0.7)",
            backdropFilter: "blur(16px) saturate(150%)",
            WebkitBackdropFilter: "blur(16px) saturate(150%)",
            position: "relative"
          }}>
          <DialogTrafficLights onClose={onClose} />

          <Stack
            direction="row"
            spacing={0.75}
            sx={{
              alignItems: "center",
              position: "absolute",
              left: "50%",
              top: 0,
              height: 34,
              transform: "translateX(-50%)",
              pointerEvents: "none",
              maxWidth: "calc(100% - 80px)"
            }}>
            {Icon && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 18,
                  height: 18,
                  borderRadius: 0.75,
                  bgcolor: accent,
                  color: "#fff",
                  flexShrink: 0,
                }}
              >
                <Icon size={11} />
              </Box>
            )}
            <Typography
              variant="caption"
              noWrap
              sx={{
                fontWeight: 600,
                fontSize: "0.74rem",
                color: "text.primary",
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography
                variant="caption"
                noWrap
                sx={{
                  display: { xs: "none", sm: "inline" },
                  color: "text.secondary",
                  fontSize: "0.72rem",
                }}
              >
                · {subtitle}
              </Typography>
            )}
          </Stack>
        </Stack>
      )}
      <Box>{children}</Box>
    </Dialog>
  );
}

/**
 * Three traffic-light dots: only red (close) is functional. Yellow and green
 * are dimmed to mirror macOS dialogs like "About This Mac" where minimize +
 * zoom don't apply to the modal.
 */
function DialogTrafficLights({ onClose }: { onClose: () => void }) {
  return (
    <Stack
      direction="row"
      spacing={0.75}
      sx={{
        alignItems: "center",

        "& .tl-glyph": {
          opacity: 0,
          transition: "opacity 120ms ease",
          color: "rgba(0, 0, 0, 0.72)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },

        "&:hover .tl-glyph": { opacity: 1 }
      }}>
      <OSTooltip
        title="Close"
        placement="bottom"
        slotProps={{
          tooltip: {
            sx: { mt: "4px !important" },
          },
        }}
      >
        <Box
          component="button"
          type="button"
          aria-label="Close"
          onClick={onClose}
          sx={{
            width: 12,
            height: 12,
            border: 0,
            borderRadius: "50%",
            padding: 0,
            cursor: "pointer",
            bgcolor: "#ff5f57",
            boxShadow:
              "inset 0 0 0 1px rgba(0, 0, 0, 0.22), 0 1px 1px rgba(0, 0, 0, 0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "filter 120ms ease, transform 120ms ease",
            "&:hover": { filter: "brightness(0.92)" },
            "&:active": { filter: "brightness(0.76)", transform: "scale(0.92)" },
            "&:focus-visible": {
              outline: "2px solid rgba(255, 255, 255, 0.45)",
              outlineOffset: 1,
            },
          }}
        >
          <Box className="tl-glyph">
            <X size={8} strokeWidth={2.6} />
          </Box>
        </Box>
      </OSTooltip>
      <Box
        component="span"
        aria-hidden
        sx={{
          width: 12,
          height: 12,
          borderRadius: "50%",
          bgcolor: "#febc2e",
          opacity: 0.55,
          boxShadow: "inset 0 0 0 1px rgba(0, 0, 0, 0.22)",
        }}
      />
      <Box
        component="span"
        aria-hidden
        sx={{
          width: 12,
          height: 12,
          borderRadius: "50%",
          bgcolor: "#28c840",
          opacity: 0.55,
          boxShadow: "inset 0 0 0 1px rgba(0, 0, 0, 0.22)",
        }}
      />
    </Stack>
  );
}
