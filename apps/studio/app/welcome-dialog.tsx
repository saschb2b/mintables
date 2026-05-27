"use client";

import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {
  Folder,
  type LucideIcon,
  MousePointer2,
  Sparkles,
  Squircle,
} from "lucide-react";
import { DialogWindow } from "@mintables/shared/ui";

/** Dispatch this on `window` to (re-)open the welcome dialog from anywhere. */
export const SHOW_WELCOME_EVENT = "mintables:show-welcome";

interface WelcomeDialogProps {
  open: boolean;
  onClose: () => void;
}

/**
 * First-visit welcome — shown once after the desktop boots so anyone landing
 * here (especially folks following an old tubecraft.saschb2b.com link) gets
 * a quick "you're in the right place, here's how it works" beat. Dismissed
 * permanently via a localStorage flag; re-openable later via the "Take the
 * tour again" link in the README.md / About dialog.
 */
export function WelcomeDialog({ open, onClose }: WelcomeDialogProps) {
  return (
    <DialogWindow
      open={open}
      onClose={onClose}
      icon={Sparkles}
      title="Welcome.txt"
      subtitle="Quick tour"
      accent="#7c66f5"
      maxWidth="sm"
    >
      <Stack spacing={2.75} sx={{ p: 3 }}>
        {/* Hero — small icon + headline, like a doc title (not a marketing banner). */}
        <Stack direction="row" spacing={2} sx={{
          alignItems: "center"
        }}>
          <Box
            sx={{
              flexShrink: 0,
              width: 48,
              height: 48,
              borderRadius: 1.75,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "linear-gradient(140deg, #5cb6b9 0%, #7c66f5 48%, #ec4899 100%)",
              boxShadow:
                "0 10px 22px -8px rgba(124, 102, 245, 0.55), inset 0 1px 0 rgba(255,255,255,0.18)",
              color: "#fff",
              position: "relative",
              overflow: "hidden",
              "&::after": {
                content: '""',
                position: "absolute",
                inset: "0 0 50% 0",
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 100%)",
                pointerEvents: "none",
              },
            }}
          >
            <Sparkles size={22} />
          </Box>
          <Stack spacing={0.25}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                letterSpacing: "-0.01em",
                fontSize: "1.05rem",
                lineHeight: 1.2,
              }}
            >
              Welcome to Mintables
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                fontFamily: "var(--font-geist-mono), monospace",
                fontSize: "0.7rem",
                letterSpacing: 0.3,
              }}
            >
              Formerly tubecraft.saschb2b.com
            </Typography>
          </Stack>
        </Stack>

        {/* Body — left-aligned, plain prose, no em dashes or gradient text. */}
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            lineHeight: 1.65,
            fontSize: "0.83rem",
          }}
        >
          TubeCraft is now Mintables. The same tube generator is here,
          inside a desktop environment built to host a growing family of
          parametric tools. Everything still runs locally in your browser.
          No accounts, no uploads.
        </Typography>

        {/* Tips — three quick orientations. */}
        <Stack spacing={1.25}>
          <Tip
            icon={Squircle}
            color="#5a9a9d"
            title="The dock launches apps"
          >
            Generators live in the dock at the bottom. Click one to open it as
            a window.
          </Tip>
          <Tip icon={Folder} color="#3b82f6" title="Folders hold your stuff">
            After your first export or saved preset, a Downloads or Presets
            folder appears in the top-right of the desktop.
          </Tip>
          <Tip
            icon={MousePointer2}
            color="#a855f7"
            title="Right-click feels native"
          >
            Files support multi-select, rename (F2), bulk delete, and a full
            context menu.
          </Tip>
        </Stack>

        {/* CTA aligned to the right, the macOS dialog convention. */}
        <Stack
          direction="row"
          sx={{
            justifyContent: "flex-end",
            pt: 0.5
          }}>
          <Button
            onClick={onClose}
            variant="contained"
            sx={{
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              py: 0.75,
              borderRadius: 1.25,
              minWidth: 88,
              bgcolor: "#7c66f5",
              boxShadow: "none",
              "&:hover": {
                bgcolor: "#6c54e8",
                boxShadow: "0 6px 14px -6px rgba(124, 102, 245, 0.7)",
              },
            }}
          >
            Got it
          </Button>
        </Stack>
      </Stack>
    </DialogWindow>
  );
}

function Tip({
  icon: Icon,
  color,
  title,
  children,
}: {
  icon: LucideIcon;
  color: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <Stack direction="row" spacing={1.5} sx={{
      alignItems: "flex-start"
    }}>
      <Box
        sx={{
          flexShrink: 0,
          width: 22,
          height: 22,
          mt: 0.1,
          borderRadius: 0.75,
          bgcolor: `${color}22`,
          color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={13} />
      </Box>
      <Stack spacing={0.1} sx={{ minWidth: 0 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: "text.primary",
            fontSize: "0.82rem",
            lineHeight: 1.3,
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            fontSize: "0.76rem",
            lineHeight: 1.5,
          }}
        >
          {children}
        </Typography>
      </Stack>
    </Stack>
  );
}
