"use client";

import type { ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { GizmoHelper, GizmoViewport } from "@react-three/drei";
import { StudioLights } from "./studio-lights";

interface PreviewCanvasProps {
  children: ReactNode;
}

/**
 * Per-window R3F canvas. A few intentional choices, since multiple of these
 * can coexist on the page (one per open generator window):
 *
 *  · `powerPreference` is left at the browser default. Requesting
 *    "high-performance" makes Chromium serialize discrete-GPU contexts,
 *    and a second canvas spinning up can knock the first into a
 *    context-lost state with no visible warning. Default lets the browser
 *    place each canvas on whichever GPU it can without contention.
 *
 *  · `frameloop="demand"` means R3F only paints when something changes
 *    (config update, OrbitControls drag, view-preset request). Background
 *    windows stop burning GPU on continuous render loops, so opening five
 *    generators doesn't fan up the laptop.
 */
export function PreviewCanvas({ children }: PreviewCanvasProps) {
  return (
    <Canvas
      dpr={[1, 2]}
      frameloop="demand"
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        background: "linear-gradient(180deg, #404040 0%, #2a2a2a 100%)",
      }}
      gl={{ antialias: true }}
    >
      <StudioLights />
      {children}
      <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
        <GizmoViewport labelColor="white" axisHeadScale={1} />
      </GizmoHelper>
    </Canvas>
  );
}
