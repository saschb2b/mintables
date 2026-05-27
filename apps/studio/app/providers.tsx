"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Box from "@mui/material/Box";
import { AppDock, AppHeader, Spotlight, ThemeProvider } from "@mintables/shared/ui";
import { PreviewStage } from "@mintables/shared/shell";
import { WindowManagerProvider } from "@mintables/shared/lib";
import { generators } from "@/lib/registry";
import { Desktop } from "./desktop";
import { DesktopWallpaper } from "./desktop-wallpaper";
import { SHOW_WELCOME_EVENT, WelcomeDialog } from "./welcome-dialog";
import { WindowLayer } from "./window-layer";
import { WindowShortcuts } from "./window-shortcuts";

const WELCOMED_KEY = "mintables.welcomed";

export function Providers({ children }: { children: ReactNode }) {
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  // Eventsource for the global PreviewStage canvas. Drei's <View> routes
  // pointer events from each view's tracked div into this parent, so
  // OrbitControls in any generator window picks up drags correctly.
  const stageContainerRef = useRef<HTMLDivElement>(null);

  // First-visit welcome: open ~600ms after mount so the wallpaper + dock paint
  // first and the dialog appears *on* the desktop, not *instead* of it. The
  // localStorage flag is set on dismiss, never on open, so a hard refresh
  // before clicking "Got it" still re-shows the welcome on the next visit.
  useEffect(() => {
    if (window.localStorage.getItem(WELCOMED_KEY) === "1") return;
    const t = window.setTimeout(() => {
      setWelcomeOpen(true);
    }, 600);
    return () => {
      window.clearTimeout(t);
    };
  }, []);

  // Any component can re-open the welcome dialog by dispatching the event,
  // currently used by the About dialog's "Take the tour again" link.
  useEffect(() => {
    const onShow = () => {
      setWelcomeOpen(true);
    };
    window.addEventListener(SHOW_WELCOME_EVENT, onShow);
    return () => {
      window.removeEventListener(SHOW_WELCOME_EVENT, onShow);
    };
  }, []);

  const handleCloseWelcome = () => {
    window.localStorage.setItem(WELCOMED_KEY, "1");
    setWelcomeOpen(false);
  };

  return (
    <ThemeProvider>
      <WindowManagerProvider>
        <Box
          ref={stageContainerRef}
          sx={{
            height: "100dvh",
            width: "100vw",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            position: "relative",
            // Fallback color under the wallpaper image (briefly visible while
            // the photo is still decoding).
            bgcolor: "#0a0c1a",
          }}
        >
          <DesktopWallpaper />
          <AppHeader generators={generators} />
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
              position: "relative",
              zIndex: 1,
            }}
          >
            <Desktop />
            {children}
          </Box>
          {/* Window layer paints over the desktop content but under the dock. */}
          <WindowLayer />
          {/* One global R3F canvas. Each generator window contributes a drei
            <View> in PreviewPanel; the canvas scissor-paints all views from
            a single WebGL context, so opening N windows can't hit the
            browser's per-page context cap. */}
          <PreviewStage containerRef={stageContainerRef} />
          <AppDock generators={generators} />
          <Spotlight generators={generators} />
          <WindowShortcuts generators={generators} />
        </Box>
        <WelcomeDialog open={welcomeOpen} onClose={handleCloseWelcome} />
      </WindowManagerProvider>
    </ThemeProvider>
  );
}
