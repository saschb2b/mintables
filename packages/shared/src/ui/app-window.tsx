"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import { tooltipClasses } from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { Maximize2, Minimize2, Minus, X, type LucideIcon } from "lucide-react";

type WindowPhase = "opening" | "open" | "closing" | "minimizing";

interface AppWindowProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  /** Accent used for the window's top edge highlight. */
  accent: string;
  children: ReactNode;
}

/**
 * macOS-style window chrome wrapping the generator shell.
 *  · Red (close):     fade-out animation, then back to the desktop.
 *  · Yellow (minimize): "genie" scale toward the app's dock tile, then desktop.
 *  · Green (maximize): toggle expand-to-fill-work-area; ESC restores.
 * Hovering any traffic light reveals the × − ⤢ glyphs on all three (group
 * hover), the macOS pattern. Each light shows a tooltip on hover.
 */
export function AppWindow({
  icon: Icon,
  title,
  subtitle,
  accent,
  children,
}: AppWindowProps) {
  const router = useRouter();
  const winRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<WindowPhase>("opening");
  const [maximized, setMaximized] = useState(false);

  // Transition from "opening" to "open" on next paint so the open animation
  // runs from its starting transform/opacity.
  useEffect(() => {
    if (phase !== "opening") return;
    const t = window.setTimeout(() => {
      setPhase("open");
    }, 30);
    return () => {
      window.clearTimeout(t);
    };
  }, [phase]);

  // ESC restores from maximized (matches macOS fullscreen behavior).
  useEffect(() => {
    if (!maximized) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMaximized(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [maximized]);

  const handleClose = () => {
    if (phase !== "open") return;
    setPhase("closing");
    window.setTimeout(() => {
      router.push("/");
    }, 220);
  };

  const handleMinimize = () => {
    if (phase !== "open") return;
    // Aim the collapse at the dock tile for this app — produces the
    // "genie effect" of the window shrinking into its dock icon.
    const win = winRef.current;
    if (win) {
      const dockTile = document.querySelector(
        `nav[aria-label="App dock"] [aria-label="${title}"]`,
      );
      if (dockTile) {
        const dockRect = dockTile.getBoundingClientRect();
        const winRect = win.getBoundingClientRect();
        const dx =
          dockRect.left +
          dockRect.width / 2 -
          (winRect.left + winRect.width / 2);
        const dy =
          dockRect.top +
          dockRect.height / 2 -
          (winRect.top + winRect.height / 2);
        win.style.setProperty("--min-dx", `${dx.toFixed(0)}px`);
        win.style.setProperty("--min-dy", `${dy.toFixed(0)}px`);
      }
    }
    setPhase("minimizing");
    window.setTimeout(() => {
      router.push("/");
    }, 380);
  };

  const handleMaximize = () => {
    if (phase !== "open") return;
    setMaximized((m) => !m);
  };

  const transform: Record<WindowPhase, string> = {
    opening: "translateY(8px) scale(0.985)",
    open: "translate3d(0, 0, 0) scale(1)",
    closing: "translateY(-4px) scale(0.97)",
    minimizing:
      "translate3d(var(--min-dx, 0), var(--min-dy, 24vh), 0) scale(0.06)",
  };

  const opacity: Record<WindowPhase, number> = {
    opening: 0,
    open: 1,
    closing: 0,
    minimizing: 0,
  };

  const transition: Record<WindowPhase, string> = {
    opening:
      "transform 420ms cubic-bezier(0.2, 0.85, 0.25, 1), opacity 380ms ease, margin 300ms cubic-bezier(0.2, 0.8, 0.2, 1), border-radius 300ms ease",
    open: "transform 300ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 200ms ease, margin 300ms cubic-bezier(0.2, 0.8, 0.2, 1), border-radius 300ms ease",
    closing: "transform 220ms ease-in, opacity 200ms ease",
    minimizing:
      "transform 400ms cubic-bezier(0.55, 0, 0.85, 0.1), opacity 360ms ease",
  };

  return (
    <Box
      ref={winRef}
      component="section"
      aria-label={`${title} window`}
      sx={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        mt: maximized ? 0 : { xs: 0.5, sm: 1, md: 1.5 },
        mx: maximized ? 0 : { xs: 0.5, sm: 3, md: 5, lg: 6 },
        // Always leave room for the floating dock — even when maximized the
        // window respects the work area, the way Windows maximize does.
        mb: { xs: 11, sm: 13 },
        borderRadius: maximized ? 0 : { xs: 1.5, sm: 3 },
        overflow: "hidden",
        border: maximized
          ? "1px solid transparent"
          : "1px solid rgba(255, 255, 255, 0.10)",
        bgcolor: "background.default",
        boxShadow: maximized
          ? "0 8px 24px -10px rgba(0,0,0,0.4)"
          : "0 36px 80px -22px rgba(0, 0, 0, 0.65), 0 8px 24px -6px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.03) inset",
        transform: transform[phase],
        opacity: opacity[phase],
        transition: transition[phase],
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: `linear-gradient(90deg, transparent 0%, ${accent} 50%, transparent 100%)`,
          opacity: 0.6,
          pointerEvents: "none",
        },
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        sx={{
          flexShrink: 0,
          height: 34,
          px: 1.25,
          borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
          bgcolor: "rgba(30, 32, 42, 0.7)",
          backdropFilter: "blur(16px) saturate(150%)",
          WebkitBackdropFilter: "blur(16px) saturate(150%)",
          position: "relative",
        }}
      >
        <TrafficLights
          maximized={maximized}
          onClose={handleClose}
          onMinimize={handleMinimize}
          onMaximize={handleMaximize}
        />

        <Stack
          direction="row"
          alignItems="center"
          spacing={0.75}
          sx={{
            position: "absolute",
            left: "50%",
            top: 0,
            height: 34,
            transform: "translateX(-50%)",
            pointerEvents: "none",
          }}
        >
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
            }}
          >
            <Icon size={11} />
          </Box>
          <Typography
            variant="caption"
            sx={{ fontWeight: 600, fontSize: "0.74rem", color: "text.primary" }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="caption"
              sx={{
                display: { xs: "none", md: "inline" },
                color: "text.secondary",
                fontSize: "0.72rem",
              }}
            >
              · {subtitle}
            </Typography>
          )}
        </Stack>
      </Stack>

      <Box sx={{ flex: 1, minHeight: 0, display: "flex" }}>{children}</Box>
    </Box>
  );
}

interface TrafficLightsProps {
  maximized: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
}

function TrafficLights({
  maximized,
  onClose,
  onMinimize,
  onMaximize,
}: TrafficLightsProps) {
  return (
    <Stack
      direction="row"
      spacing={0.75}
      alignItems="center"
      sx={{
        // Hidden glyphs reveal on group hover / focus — macOS pattern.
        "& .tl-glyph": {
          opacity: 0,
          transition: "opacity 120ms ease",
          color: "rgba(0, 0, 0, 0.72)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
        "&:hover .tl-glyph": { opacity: 1 },
        "&:focus-within .tl-glyph": { opacity: 1 },
      }}
    >
      <TrafficLight color="#ff5f57" label="Close" onClick={onClose}>
        <X size={8} strokeWidth={2.6} />
      </TrafficLight>
      <TrafficLight color="#febc2e" label="Minimize" onClick={onMinimize}>
        <Minus size={9} strokeWidth={2.6} />
      </TrafficLight>
      <TrafficLight
        color="#28c840"
        label={maximized ? "Restore" : "Maximize"}
        onClick={onMaximize}
      >
        {maximized ? (
          <Minimize2 size={7} strokeWidth={2.6} />
        ) : (
          <Maximize2 size={7} strokeWidth={2.6} />
        )}
      </TrafficLight>
    </Stack>
  );
}

interface TrafficLightProps {
  color: string;
  label: string;
  onClick: () => void;
  children: ReactNode;
}

function TrafficLight({ color, label, onClick, children }: TrafficLightProps) {
  return (
    <Tooltip
      title={label}
      placement="bottom"
      arrow
      enterDelay={250}
      slotProps={{
        tooltip: {
          sx: {
            bgcolor: "rgba(24, 26, 38, 0.94)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            fontSize: "0.68rem",
            fontWeight: 600,
            letterSpacing: 0.1,
            px: 1,
            py: 0.5,
            mt: "4px !important",
            [`& .${tooltipClasses.arrow}`]: {
              color: "rgba(24, 26, 38, 0.94)",
            },
          },
        },
      }}
    >
      <Box
        component="button"
        type="button"
        aria-label={label}
        onClick={onClick}
        sx={{
          width: 12,
          height: 12,
          border: 0,
          borderRadius: "50%",
          padding: 0,
          cursor: "pointer",
          bgcolor: color,
          boxShadow:
            "inset 0 0 0 1px rgba(0, 0, 0, 0.22), 0 1px 1px rgba(0, 0, 0, 0.18)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "filter 120ms ease, transform 120ms ease",
          "&:hover": { filter: "brightness(0.92)" },
          "&:active": {
            filter: "brightness(0.76)",
            transform: "scale(0.92)",
          },
          "&:focus-visible": {
            outline: "2px solid rgba(255, 255, 255, 0.45)",
            outlineOffset: 1,
          },
        }}
      >
        <Box className="tl-glyph">{children}</Box>
      </Box>
    </Tooltip>
  );
}
