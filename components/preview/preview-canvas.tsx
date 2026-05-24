"use client";

import { Canvas } from "@react-three/fiber";
import { GizmoHelper, GizmoViewport } from "@react-three/drei";
import { StudioLights } from "./studio-lights";

interface PreviewCanvasProps {
  children: React.ReactNode;
}

export function PreviewCanvas({ children }: PreviewCanvasProps) {
  return (
    <Canvas
      dpr={[1, 2]}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        background: "linear-gradient(180deg, #404040 0%, #2a2a2a 100%)",
      }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <StudioLights />
      {children}
      <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
        <GizmoViewport labelColor="white" axisHeadScale={1} />
      </GizmoHelper>
    </Canvas>
  );
}
