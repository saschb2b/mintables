"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import { AppDock, AppHeader, ThemeProvider } from "@mintables/shared/ui";
import { generators } from "@/lib/registry";
import { DesktopWallpaper } from "./desktop-wallpaper";

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
    </ThemeProvider>
  );
}
