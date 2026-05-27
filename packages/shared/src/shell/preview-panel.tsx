"use client";

import Box from "@mui/material/Box";
import { View } from "@react-three/drei";
import type { Generator } from "../lib/generator";
import { StudioLights } from "./studio-lights";

interface PreviewPanelProps<C> {
  generator: Generator<C>;
  config: C;
}

/**
 * The preview area of a generator window. There's no per-window `<Canvas>`
 * anymore - one global Canvas (mounted by `<PreviewStage>` in providers)
 * handles all rendering, and each window contributes a drei `<View>`
 * whose tracked rect tells the canvas where to scissor-paint this scene.
 *
 * The backdrop gradient lives on the wrapping Box (not the canvas) since
 * the canvas only paints inside the View's screen rect; outside the View
 * the canvas pixel is fully transparent and the gradient shows through
 * unchanged.
 */
export function PreviewPanel<C>({ generator, config }: PreviewPanelProps<C>) {
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
        background: "linear-gradient(180deg, #404040 0%, #2a2a2a 100%)",
        overflow: "hidden",
      }}
    >
      <View
        style={{
          position: "absolute",
          inset: 0,
          // Don't let the View div's own paint cover the canvas-painted 3D.
          background: "transparent",
        }}
      >
        <StudioLights />
        <Scene config={config} />
      </View>
    </Box>
  );
}
