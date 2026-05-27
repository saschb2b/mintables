"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Eye } from "lucide-react";
import { GizmoHelper, GizmoViewport, View } from "@react-three/drei";
import type { Generator } from "../lib/generator";
import { StudioLights } from "./studio-lights";
import { ViewportProvider } from "./viewport-context";

interface PreviewPanelProps<C> {
  generator: Generator<C>;
  config: C;
  /**
   * True when this generator's window is the focused WM window. Only the
   * active PreviewPanel mounts a drei <View> on the global canvas.
   *
   * The global canvas (PreviewStage in providers) stays mounted always -
   * we only flip the View on/off here, so there's no WebGL-context churn
   * on focus changes. Why one-View-at-a-time even with one shared
   * canvas:
   *
   *  · Multiple Views in the same canvas don't reliably scissor in
   *    practice. Bleed across rects shows up: a background window's
   *    geometry paints over the focused window's chrome.
   *  · OrbitControls in each View attach window-level pointer listeners
   *    and start fighting for drags once more than one View is live, so
   *    panning a focused window can stop registering.
   *
   * Trade-off: switching focus remounts the View, so camera angle
   * resets to ISO (the four view-preset buttons in the info bar cover
   * re-orienting). Camera-state preservation per window can come later.
   */
  active: boolean;
}

const PREVIEW_BG = "linear-gradient(180deg, #404040 0%, #2a2a2a 100%)";

export function PreviewPanel<C>({ generator, config, active }: PreviewPanelProps<C>) {
  const Scene = generator.Scene;
  return (
    <Box
      sx={{
        flex: 1,
        position: "relative",
        minHeight: 0,
        minWidth: 0,
        width: "100%",
        height: "100%",
        background: PREVIEW_BG,
        overflow: "hidden",
      }}
    >
      {active ? (
        <View
          style={{
            position: "absolute",
            inset: 0,
            background: "transparent",
          }}
        >
          {/* The provider lives inside the View so PreviewSceneRig (also
            inside the View) can consume it. Buttons in the info bar above
            publish view requests through a window event tagged with this
            generator id; cross-View React context can't bridge drei's
            portal, but events can. */}
          <ViewportProvider generatorId={generator.id}>
            <StudioLights />
            <Scene config={config} />
            <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
              <GizmoViewport labelColor="white" axisHeadScale={1} />
            </GizmoHelper>
          </ViewportProvider>
        </View>
      ) : (
        <PausedHint />
      )}
    </Box>
  );
}

/**
 * Shown when this window isn't focused. The wrapping Box already paints
 * the gradient backdrop, so this just adds a small hint that clicking
 * the window will start the preview again.
 */
function PausedHint() {
  return (
    <Box
      aria-hidden
      sx={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
        color: "rgba(255, 255, 255, 0.32)",
        userSelect: "none",
        pointerEvents: "none",
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
