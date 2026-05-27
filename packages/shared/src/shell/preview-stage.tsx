"use client";

import { useEffect, type RefObject } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { View } from "@react-three/drei";
import { PREVIEW_INVALIDATE_EVENT } from "../lib/preview-events";

// R3F's eventSource expects a non-nullable RefObject<HTMLElement>, but
// React's useRef gives back a nullable variant. The ref is only read after
// mount when it's guaranteed non-null, so a narrowing cast is safe here.
type EventSourceRef = RefObject<HTMLElement>;

interface PreviewStageProps {
  /** Ref to the element that wraps both the canvas and every <View> tracked
   *  div. drei's View routes pointer events from each view's div into this
   *  parent so OrbitControls and clicks reach the right scene. */
  containerRef: RefObject<HTMLElement | null>;
}

/**
 * One R3F canvas for the whole app. Every open generator window renders a
 * drei `<View>` (in `PreviewPanel`) and that view's scene is scissor-painted
 * into the view's tracked div on this single canvas.
 *
 * Why one canvas: browsers cap simultaneous WebGL contexts (Chromium often
 * around 8-16 in practice) and silently drop the oldest when you exceed
 * them. With one canvas per window the user can lose every preview after
 * a few opens/closes. One canvas = one context, no matter how many
 * windows are open.
 *
 * The canvas sits above the WM windows so 3D paints over each window's
 * preview-area background. It's pointer-events: none so it doesn't block
 * UI; drei's View handles routing events to the correct scene through the
 * tracked div under the pointer.
 *
 * `frameloop="demand"` keeps the GPU idle when nothing is changing.
 * Anything that wants the canvas to render an extra frame without going
 * through a React state update (e.g. window drag writing inline transforms
 * straight to the DOM) calls `invalidatePreview()` from
 * @mintables/shared/lib, which fires the event the bridge below listens
 * for.
 */
export function PreviewStage({ containerRef }: PreviewStageProps) {
  return (
    <Canvas
      eventSource={containerRef as EventSourceRef}
      eventPrefix="client"
      dpr={[1, 2]}
      frameloop="demand"
      gl={{ antialias: true }}
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        // Above WM windows (which max out around 1050) and below the dock
        // (1200) and Spotlight (1400).
        zIndex: 1150,
      }}
    >
      <InvalidateBridge />
      <View.Port />
    </Canvas>
  );
}

/**
 * Tiny child component that lives inside the Canvas so it has access to
 * R3F's `invalidate`. It listens for the shared window event and pokes
 * the canvas to render one frame. Lets non-R3F code (the WM drag
 * handler) request frames without prop-drilling or context.
 */
function InvalidateBridge() {
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    const handler = () => {
      invalidate();
    };
    window.addEventListener(PREVIEW_INVALIDATE_EVENT, handler);
    return () => {
      window.removeEventListener(PREVIEW_INVALIDATE_EVENT, handler);
    };
  }, [invalidate]);
  return null;
}
