"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import { AppHeader, ThemeProvider } from "@mintables/shared/ui";
import { generators } from "@/lib/registry";

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
  const isHub = currentId === undefined;

  return (
    <ThemeProvider>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          // Hub routes get the dark-blue base so the frosted header sits on the
          // landing's color, not on the editor's muted grey.
          bgcolor: isHub ? "#0f1322" : "background.default",
        }}
      >
        <AppHeader generators={generators} currentId={currentId} />
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          {children}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
