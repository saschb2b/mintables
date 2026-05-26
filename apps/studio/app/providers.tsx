"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import { AppHeader, ThemeProvider } from "@mintables/shared/ui";
import { generators } from "@/lib/registry";

function currentGeneratorId(pathname: string): string | undefined {
  const segment = pathname.split("/").find(Boolean);
  return segment && generators.some((g) => g.id === segment)
    ? segment
    : undefined;
}

export function Providers({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const currentId = currentGeneratorId(pathname);

  return (
    <ThemeProvider>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
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
