"use client";

import { useEffect, useState, type ReactNode } from "react";
import Box from "@mui/material/Box";
import { AppDock, AppHeader, Spotlight, ThemeProvider } from "@mintables/shared/ui";
import { WindowManagerProvider } from "@mintables/shared/lib";
import { generators } from "@/lib/registry";
import { DesktopWallpaper } from "./desktop-wallpaper";
import { SHOW_WELCOME_EVENT, WelcomeDialog } from "./welcome-dialog";
import { WindowLayer } from "./window-layer";
import { WindowShortcuts } from "./window-shortcuts";

const WELCOMED_KEY = "mintables.welcomed";

export function Providers({ children }: { children: ReactNode }) {
  const [welcomeOpen, setWelcomeOpen] = useState(false);

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
            {children}
          </Box>
          {/* Window layer paints over the desktop content but under the dock. */}
          <WindowLayer />
          <AppDock generators={generators} />
          <Spotlight generators={generators} />
          <WindowShortcuts generators={generators} />
        </Box>
        <WelcomeDialog open={welcomeOpen} onClose={handleCloseWelcome} />
      </WindowManagerProvider>
    </ThemeProvider>
  );
}
