"use client";

import dynamic from "next/dynamic";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import type { Generator } from "../lib/generator";
import { ViewportProvider } from "./viewport-context";
import { ViewToolbar } from "./view-toolbar";

const PreviewCanvas = dynamic(
  () => import("./preview-canvas").then((m) => ({ default: m.PreviewCanvas })),
  { ssr: false, loading: () => <PreviewLoading /> },
);

function PreviewLoading() {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        minHeight: 240,
        background: "linear-gradient(180deg, #404040 0%, #2a2a2a 100%)",
      }}
    >
      <CircularProgress size={32} />
    </Box>
  );
}

interface PreviewPanelProps<C> {
  generator: Generator<C>;
  config: C;
}

export function PreviewPanel<C>({ generator, config }: PreviewPanelProps<C>) {
  const Scene = generator.Scene;
  return (
    <ViewportProvider>
      <Box
        sx={{
          flex: 1,
          position: "relative",
          minHeight: 0,
          minWidth: 0,
          width: "100%",
          height: "100%",
        }}
      >
        <ViewToolbar />
        <PreviewCanvas>
          <Scene config={config} />
        </PreviewCanvas>
      </Box>
    </ViewportProvider>
  );
}
