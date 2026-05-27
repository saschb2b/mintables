"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import { AppDock, AppHeader, ThemeProvider } from "@mintables/shared/ui";
import { generators } from "@/lib/registry";
import { DesktopWallpaper } from "./desktop-wallpaper";
import { SHOW_WELCOME_EVENT, WelcomeDialog } from "./welcome-dialog";

const WELCOMED_KEY = "mintables.welcomed";

function currentGeneratorId(pathname: string): string | undefined {
  // Match `/generators/<id>` — the namespace prevents collisions with future
  // top-level routes (e.g. /about, /blog).
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] !== "generators") return undefined;
  const id = parts[1];
  return id && generators.some((g) => g.id === id) ? id : undefined;
}

export function Providers({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const currentId = currentGeneratorId(pathname);
  const [welcomeOpen, setWelcomeOpen] = useState(false);

  // First-visit welcome: open ~600ms after mount so the wallpaper + dock paint
  // first and the dialog appears *on* the desktop, not *instead* of it. The
  // localStorage flag is set on dismiss — never on open — so a hard refresh
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

  // Any component can re-open the welcome dialog by dispatching the event —
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
        <AppHeader generators={generators} currentId={currentId} />
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
        <AppDock generators={generators} currentId={currentId} />
      </Box>
      <WelcomeDialog open={welcomeOpen} onClose={handleCloseWelcome} />
    </ThemeProvider>
  );
}
