"use client";

import { Suspense, useMemo } from "react";
import { ContactShadows, Line, Text } from "@react-three/drei";
import { configKey } from "@mintables/shared/lib/config-key";
import { ModelMesh } from "@mintables/shared/shell/model-mesh";
import { GridFloor } from "@mintables/shared/shell/grid-floor";
import {
  PreviewSceneRig,
  type SceneBounds,
} from "@mintables/shared/shell/preview-scene-rig";
import type { DividerConfig } from "./types";
import { generateDividerTriangles } from "./geometry";

/**
 * A dimension stick laid flat on the print bed (world y = 0 plane). The
 * source mesh uses z-up coords and gets axis-flipped at render time, but
 * <Line> and <Text> here render directly in three.js world coords (y-up),
 * so we author these helpers in world space:
 *   world x = divider width    (red axis)
 *   world y = divider thickness (green axis, up)
 *   world z = divider height    (blue axis, depth)
 */
function BedDimension({
  from,
  to,
  axis,
  label,
  color = "#f59e0b",
  textOffset = 6,
}: {
  from: [number, number, number];
  to: [number, number, number];
  axis: "x" | "z";
  label: string;
  color?: string;
  textOffset?: number;
}) {
  const tick = 2;
  // Tick marks point along the in-plane perpendicular (still on the bed).
  const tickDir = axis === "x" ? ([0, 0, tick] as const) : ([tick, 0, 0] as const);
  const mid: [number, number, number] = [
    (from[0] + to[0]) / 2,
    0,
    (from[2] + to[2]) / 2,
  ];
  const textPos: [number, number, number] =
    axis === "x"
      ? [mid[0], 0, mid[2] + textOffset]
      : [mid[0] + textOffset, 0, mid[2]];
  const length = Math.hypot(to[0] - from[0], to[2] - from[2]);
  const fontSize = Math.max(2.5, length * 0.08);

  return (
    <group>
      <Line points={[from, to]} color={color} lineWidth={1.5} />
      <Line
        points={[
          [from[0] - tickDir[0], 0, from[2] - tickDir[2]],
          [from[0] + tickDir[0], 0, from[2] + tickDir[2]],
        ]}
        color={color}
        lineWidth={1.5}
      />
      <Line
        points={[
          [to[0] - tickDir[0], 0, to[2] - tickDir[2]],
          [to[0] + tickDir[0], 0, to[2] + tickDir[2]],
        ]}
        color={color}
        lineWidth={1.5}
      />
      <Text
        position={textPos}
        fontSize={fontSize}
        color={color}
        anchorX="center"
        anchorY="middle"
        rotation={[-Math.PI / 2, 0, 0]}
      >
        {label}
      </Text>
    </group>
  );
}

function DividerDimensionIndicators({ config }: { config: DividerConfig }) {
  const { width, height, thickness } = config;
  const hw = width / 2;
  const hh = height / 2;
  // Lay dimension lines just outside the slab footprint, on the bed plane
  // (world y = 0) so they read like blueprint annotations.
  const inset = Math.max(width, height) * 0.18;
  // The thickness label scales with the bed footprint, not the (tiny)
  // thickness value — so a 1 mm slab still gets a legible label.
  const thicknessFont = Math.max(3, Math.max(width, height) * 0.045);

  return (
    <group>
      {/* Width — along world X, drawn in front of the slab on the bed */}
      <BedDimension
        from={[-hw, 0, hh + inset]}
        to={[hw, 0, hh + inset]}
        axis="x"
        label={`${String(width)} mm`}
        color="#3b82f6"
      />
      {/* Height — along world Z (depth), drawn to the right of the slab */}
      <BedDimension
        from={[hw + inset, 0, -hh]}
        to={[hw + inset, 0, hh]}
        axis="z"
        label={`${String(height)} mm`}
        color="#22c55e"
      />
      {/* Thickness — text label only, like the tube wall callout. The slab
          is too thin (often 1 mm) to draw a useful dimension line for. */}
      <Text
        position={[-hw, thickness + thicknessFont * 0.4, -hh - thicknessFont * 0.3]}
        fontSize={thicknessFont}
        color="#a855f7"
        anchorX="left"
        anchorY="bottom"
      >
        {`${thickness.toFixed(2)} mm thick`}
      </Text>
    </group>
  );
}

function useDividerBounds(config: DividerConfig): SceneBounds {
  const serialized = configKey(config);
  return useMemo(() => {
    const parsed = JSON.parse(serialized) as DividerConfig;
    const maxDimension = Math.max(parsed.width, parsed.height, parsed.thickness);
    // Z-up source → world y-up after axis flip. Center the orbit at the
    // mid-thickness so the slab sits centered in the camera frame.
    return {
      maxDimension,
      cameraDistance: maxDimension * 2.2,
      orbitTarget: [0, parsed.thickness / 2, 0] as [number, number, number],
    };
  }, [serialized]);
}

export function DividerScene({ config }: { config: DividerConfig }) {
  const bounds = useDividerBounds(config);

  return (
    <>
      <PreviewSceneRig bounds={bounds} />
      <ModelMesh
        config={config}
        generate={generateDividerTriangles}
        axis="z-up"
      />
      <Suspense fallback={null}>
        <DividerDimensionIndicators config={config} />
      </Suspense>
      <GridFloor size={bounds.maxDimension} />
      <ContactShadows
        position={[0, -0.01, 0]}
        opacity={0.4}
        scale={bounds.maxDimension * 2}
        blur={2}
        far={bounds.maxDimension}
      />
    </>
  );
}
