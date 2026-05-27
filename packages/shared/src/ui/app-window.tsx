"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { PointerEvent as ReactPointerEvent, ReactNode } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import { tooltipClasses } from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { Maximize2, Minimize2, Minus, X, type LucideIcon } from "lucide-react";

export interface AppWindowBounds {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface AppWindowWorkArea {
  top: number;
  left: number;
  right: number;
  bottom: number;
}

interface AppWindowProps {
  windowId: string;
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  /** Accent used for the window's top edge highlight. */
  accent: string;
  bounds: AppWindowBounds;
  state: "normal" | "minimized" | "maximized";
  focused: boolean;
  /** Logical z value from the WM (small integer). The window adds a base offset. */
  zIndex: number;
  workArea: AppWindowWorkArea;
  onClose: () => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  onFocus: () => void;
  /** Fired once on pointer-up at the end of a drag, with the final
   *  pixel-clamped position. Moves are NOT pushed to the parent during
   *  the drag itself; the window writes its own transform to the DOM
   *  to keep React out of the per-event hot path. */
  onMoveCommit: (x: number, y: number) => void;
  children: ReactNode;
}

type LifecyclePhase = "opening" | "open" | "closing" | "minimizing";

/** Windows paint above wallpaper (1) and below the header (10) and dock (1200). */
const Z_BASE = 50;
const Z_RANGE = 1000;
/** Minimum dimensions so the title bar + a sliver of content stay reachable. */
const MIN_W = 320;
const MIN_H = 200;

/**
 * Controlled, absolutely-positioned window chrome wrapping a payload (a
 * generator shell or a folder content). macOS-style traffic lights:
 *  · Red (close):     fade-out animation, then `onClose`.
 *  · Yellow (minimize): "genie" scale toward the app's dock tile.
 *  · Green (maximize):  toggle expand-to-fill-work-area; ESC restores.
 * Drag the title bar to move (clamped to the work area). Pointer down anywhere
 * inside the window dispatches `onFocus` so clicking a background window
 * raises it.
 */
export function AppWindow({
  windowId,
  icon: Icon,
  title,
  subtitle,
  accent,
  bounds,
  state,
  focused,
  zIndex,
  workArea,
  onClose,
  onMinimize,
  onToggleMaximize,
  onFocus,
  onMoveCommit,
  children,
}: AppWindowProps) {
  const winRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<LifecyclePhase>("opening");
  const dragRef = useRef<{
    pointerId: number;
    startClientX: number;
    startClientY: number;
    startX: number;
    startY: number;
    lastX: number;
    lastY: number;
  } | null>(null);
  const [dragging, setDragging] = useState(false);

  const maximized = state === "maximized";
  const minimized = state === "minimized";

  // Opening flicker: render once at opening transform, then flip to "open"
  // on the next paint so the transition animates from the start state.
  useEffect(() => {
    if (phase !== "opening") return;
    const t = window.setTimeout(() => {
      setPhase("open");
    }, 30);
    return () => {
      window.clearTimeout(t);
    };
  }, [phase]);

  // ESC restores from maximized (matches macOS fullscreen behavior). Only the
  // focused window listens, so background windows don't all flip at once.
  useEffect(() => {
    if (!maximized || !focused) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onToggleMaximize();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [maximized, focused, onToggleMaximize]);

  const handleClose = () => {
    if (phase !== "open") return;
    setPhase("closing");
    window.setTimeout(() => {
      onClose();
    }, 220);
  };

  const handleMinimize = () => {
    if (phase !== "open") return;
    // Aim the collapse at the dock tile for this app — produces the "genie"
    // effect of the window shrinking into its dock icon.
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
      onMinimize();
      // Reset so the next reopen plays the opening animation. The window
      // stays mounted while minimized so this isn't strictly required, but
      // we want it to restore back to "open" cleanly.
      setPhase("open");
    }, 380);
  };

  const handleMaximize = () => {
    if (phase !== "open") return;
    onToggleMaximize();
  };

  // ─── Dragging ──────────────────────────────────────────────────────────

  const clamp = useCallback(
    (x: number, y: number, w: number, h: number) => {
      // Keep the title bar reachable: the window's top must stay >= workArea.top
      // and the bottom can't go past workArea.bottom; sides similarly clamped
      // so at least most of the window is visible. We allow it to align flush
      // to any edge.
      const maxX = workArea.right - w;
      const maxY = workArea.bottom - h;
      return {
        x: Math.min(Math.max(x, workArea.left), Math.max(workArea.left, maxX)),
        y: Math.min(Math.max(y, workArea.top), Math.max(workArea.top, maxY)),
      };
    },
    [workArea],
  );

  const handleTitleBarPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (maximized || minimized) return;
    if (e.button !== 0) return;
    // Allow buttons (traffic lights) inside the title bar to handle their own
    // clicks without starting a drag.
    const target = e.target as HTMLElement;
    if (target.closest("button")) return;
    dragRef.current = {
      pointerId: e.pointerId,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startX: bounds.x,
      startY: bounds.y,
      lastX: bounds.x,
      lastY: bounds.y,
    };
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    setDragging(true);
    onFocus();
  };

  const handleTitleBarPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (drag?.pointerId !== e.pointerId) return;

    const targetX = drag.startX + (e.clientX - drag.startClientX);
    const targetY = drag.startY + (e.clientY - drag.startClientY);
    const clamped = clamp(targetX, targetY, bounds.w, bounds.h);
    drag.lastX = clamped.x;
    drag.lastY = clamped.y;

    // Write the new position straight to the DOM. No React state churn, no
    // reducer dispatch, no re-render of any other window or the dock - the
    // browser just retargets the GPU transform and paints the next frame.
    // The committed state catches up on pointer up via onMoveCommit.
    const el = winRef.current;
    if (el) {
      el.style.transform = `translate3d(${String(clamped.x)}px, ${String(clamped.y)}px, 0) ${phaseTransform[phase]}`;
    }
  };

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (drag?.pointerId !== e.pointerId) return;
    try {
      (e.currentTarget as Element).releasePointerCapture(e.pointerId);
    } catch {
      // Pointer may have already been released (e.g. lost capture).
    }
    onMoveCommit(drag.lastX, drag.lastY);
    dragRef.current = null;
    setDragging(false);
  };

  // After the drag commits and React renders the new bounds into the sx
  // transform, strip the inline transform we wrote during the drag so the
  // sx class can drive the window again. Runs before paint, so there's no
  // flicker between "old bounds + drag offset" and "new bounds clean".
  useLayoutEffect(() => {
    if (dragging) return;
    const el = winRef.current;
    if (!el) return;
    if (el.style.transform) el.style.transform = "";
  }, [dragging, bounds.x, bounds.y]);

  // ─── Layout / visuals ───────────────────────────────────────────────────

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    // Don't steal focus from interactive controls inside the body — but still
    // raise the window so the user sees their click land on top.
    if (!focused) onFocus();
    // Don't preventDefault — interactive children need their default behavior.
    void e;
  };

  const workW = Math.max(0, workArea.right - workArea.left);
  const workH = Math.max(0, workArea.bottom - workArea.top);

  // Compute the rendered rect. Maximized fills the work area exactly. Normal
  // uses the controlled bounds, clamped to minimum size.
  const renderedW = Math.max(MIN_W, bounds.w);
  const renderedH = Math.max(MIN_H, bounds.h);
  const rect = maximized
    ? { x: workArea.left, y: workArea.top, width: workW, height: workH }
    : { x: bounds.x, y: bounds.y, width: renderedW, height: renderedH };

  // Position the window via translate3d, not via top/left. That gives us:
  //  · a GPU-composited transform (no layout reflow on move)
  //  · only one CSS property to retarget during drag, and we write it
  //    directly to the DOM in the move handler (no React state churn)
  // Lifecycle effects (opening pop, minimize genie) are layered on top of
  // the position transform, so they translate / scale from wherever the
  // window currently sits.
  const positionTransform = `translate3d(${String(rect.x)}px, ${String(rect.y)}px, 0)`;
  const phaseTransform: Record<LifecyclePhase, string> = {
    opening: "translateY(8px) scale(0.985)",
    open: "scale(1)",
    closing: "translateY(-4px) scale(0.97)",
    minimizing:
      "translate3d(var(--min-dx, 0), var(--min-dy, 24vh), 0) scale(0.06)",
  };
  const phaseOpacity: Record<LifecyclePhase, number> = {
    opening: 0,
    open: 1,
    closing: 0,
    minimizing: 0,
  };
  const phaseTransition: Record<LifecyclePhase, string> = {
    opening:
      "transform 420ms cubic-bezier(0.2, 0.85, 0.25, 1), opacity 380ms ease",
    open: "transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 200ms ease, width 220ms cubic-bezier(0.2, 0.8, 0.2, 1), height 220ms cubic-bezier(0.2, 0.8, 0.2, 1), border-radius 220ms ease",
    closing: "transform 220ms ease-in, opacity 200ms ease",
    minimizing:
      "transform 400ms cubic-bezier(0.55, 0, 0.85, 0.1), opacity 360ms ease",
  };

  // During a drag we suppress the transform transition entirely so the
  // window tracks the pointer 1:1 instead of catching up via a 220ms
  // animation. Width/height transitions stay disabled too: maximize is
  // never triggered mid-drag.
  const transition = dragging
    ? "opacity 200ms ease, border-radius 220ms ease"
    : phaseTransition[phase];

  // Genie animation when minimized: render with opacity 0 + pointer events
  // disabled so the window stays mounted (preserves shell state) but is
  // visually gone. The dock tile indicator covers "still open". We keep
  // the position part of the transform so restore animates a scale-up
  // at the window's anchor, not from (0,0).
  const minimizedStyle = minimized
    ? {
        opacity: 0,
        pointerEvents: "none" as const,
        transform: `${positionTransform} scale(0.06)`,
        transition:
          "transform 280ms cubic-bezier(0.55, 0, 0.85, 0.1), opacity 240ms ease",
      }
    : null;

  const z = Z_BASE + (zIndex % Z_RANGE);

  return (
    <Box
      ref={winRef}
      component="section"
      aria-label={`${title} window`}
      onPointerDown={handlePointerDown}
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: rect.width,
        height: rect.height,
        zIndex: z,
        display: "flex",
        flexDirection: "column",
        borderRadius: maximized ? 0 : 2,
        overflow: "hidden",
        border: maximized
          ? "1px solid transparent"
          : focused
            ? "1px solid rgba(255, 255, 255, 0.14)"
            : "1px solid rgba(255, 255, 255, 0.08)",
        // `willChange: transform` hints the compositor to promote this
        // element to its own layer so the drag-time transform updates
        // don't trigger paints on neighboring pixels.
        willChange: "transform",
        bgcolor: "background.default",
        boxShadow: focused
          ? "0 40px 90px -22px rgba(0, 0, 0, 0.72), 0 10px 28px -8px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.04) inset"
          : "0 24px 60px -22px rgba(0, 0, 0, 0.55), 0 6px 18px -6px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.03) inset",
        transform: `${positionTransform} ${phaseTransform[phase]}`,
        opacity: phaseOpacity[phase],
        transition,
        ...(minimizedStyle ?? {}),
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: `linear-gradient(90deg, transparent 0%, ${accent} 50%, transparent 100%)`,
          opacity: focused ? 0.65 : 0.35,
          pointerEvents: "none",
          transition: "opacity 180ms ease",
        },
      }}
      data-window-id={windowId}
    >
      <Stack
        direction="row"
        alignItems="center"
        onPointerDown={handleTitleBarPointerDown}
        onPointerMove={handleTitleBarPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onDoubleClick={(e) => {
          // Double-click the title bar toggles maximize, like macOS.
          const target = e.target as HTMLElement;
          if (target.closest("button")) return;
          handleMaximize();
        }}
        sx={{
          flexShrink: 0,
          height: 34,
          px: 1.25,
          borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
          bgcolor: focused ? "rgba(30, 32, 42, 0.78)" : "rgba(22, 24, 32, 0.7)",
          backdropFilter: "blur(16px) saturate(150%)",
          WebkitBackdropFilter: "blur(16px) saturate(150%)",
          position: "relative",
          cursor: maximized ? "default" : dragging ? "grabbing" : "grab",
          touchAction: "none",
          userSelect: "none",
          transition: "background-color 180ms ease",
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
              opacity: focused ? 1 : 0.75,
              transition: "opacity 180ms ease",
            }}
          >
            <Icon size={11} />
          </Box>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              fontSize: "0.74rem",
              color: focused ? "text.primary" : "text.secondary",
              transition: "color 180ms ease",
            }}
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

      <Box sx={{ flex: 1, minHeight: 0, minWidth: 0, display: "flex" }}>
        {children}
      </Box>
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
        onClick={(e) => {
          // Don't bubble to the title bar's pointer handler / drag start.
          e.stopPropagation();
          onClick();
        }}
        onPointerDown={(e) => {
          // Prevent the title-bar drag from claiming this pointer.
          e.stopPropagation();
        }}
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
