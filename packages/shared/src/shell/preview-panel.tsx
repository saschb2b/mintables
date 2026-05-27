"use client";

import dynamic from "next/dynamic";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { Eye } from "lucide-react";
import type { Generator } from "../lib/generator";
import { ViewportProvider } from "./viewport-context";
import { ViewToolbar } from "./view-toolbar";

const PreviewCanvas = dynamic(
  () => import("./preview-canvas").then((m) => ({ default: m.PreviewCanvas })),
  { ssr: false, loading: () => <PreviewLoading /> },
);

/** Same gradient the live canvas paints, so the transition between paused
 *  and active states is just "3D content appears/disappears" rather than a
 *  full panel swap. */
const PREVIEW_BG = "linear-gradient(180deg, #404040 0%, #2a2a2a 100%)";

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
        background: PREVIEW_BG,
      }}
    >
      <CircularProgress size={32} />
    </Box>
  );
}

interface PreviewPanelProps<C> {
  generator: Generator<C>;
  config: C;
  /**
   * When false, the panel renders a static placeholder instead of mounting
   * the WebGL canvas. Two reasons we gate this:
   *  1. Multiple R3F Canvases on a page fight for WebGL contexts (especially
   *     with `powerPreference: high-performance` + drei's GizmoHelper), and
   *     can knock each other into a context-lost state where every preview
   *     vanishes. Keeping only the focused window's canvas alive avoids it.
   *  2. Continuous render loops eat real GPU/battery. Background windows
   *     don't need to be drawing.
   */
  active: boolean;
}

export function PreviewPanel<C>({ generator, config, active }: PreviewPanelProps<C>) {
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
        {active ? (
          <PreviewCanvas>
            <Scene config={config} />
          </PreviewCanvas>
        ) : (
          <PausedPreview />
        )}
      </Box>
    </ViewportProvider>
  );
}

/**
 * Shown in background windows in place of the live canvas. Matches the
 * canvas's gradient so the only thing that visibly disappears is the 3D
 * geometry. A small hint nudges the user to click the window to bring the
 * preview back.
 */
function PausedPreview() {
  return (
    <Box
      aria-hidden
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
        background: PREVIEW_BG,
        color: "rgba(255, 255, 255, 0.32)",
        userSelect: "none",
      }}
    >
      <Eye size={28} strokeWidth={1.4} />
      <Typography
        variant="caption"
        sx={{
          fontSize: "0.74rem",
          letterSpacing: 0.4,
          color: "inherit",
        }}
      >
        Focus this window to render the preview
      </Typography>
    </Box>
  );
}
