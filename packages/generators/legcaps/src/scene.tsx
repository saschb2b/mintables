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
import { type LegCapConfig, outerBounds } from "./types";
import { generateLegCapTriangles } from "./geometry";

/**
 * Bed-plane dimension stick along the X (red) or Z (blue) world axis. The
 * cap mesh uses source z-up coords which are axis-flipped to y-up at render
 * time, so here in world coords:
 *   world x = leg cross-section width
 *   world y = cap height (up)
 *   world z = leg cross-section depth
 */
function BedDimension({
  from,
  to,
  axis,
  label,
  color,
  textOffset = 6,
}: {
  from: [number, number, number];
  to: [number, number, number];
  axis: "x" | "z";
  label: string;
  color: string;
  textOffset?: number;
}) {
  const tick = 2;
  const tickDir =
    axis === "x" ? ([0, 0, tick] as const) : ([tick, 0, 0] as const);
  const mid: [number, number, number] = [
    (from[0] + to[0]) / 2,
    from[1],
    (from[2] + to[2]) / 2,
  ];
  const textPos: [number, number, number] =
    axis === "x"
      ? [mid[0], mid[1], mid[2] + textOffset]
      : [mid[0] + textOffset, mid[1], mid[2]];
  const length = Math.hypot(to[0] - from[0], to[2] - from[2]);
  const fontSize = Math.max(2.5, length * 0.08);

  return (
    <group>
      <Line points={[from, to]} color={color} lineWidth={1.5} />
      <Line
        points={[
          [from[0] - tickDir[0], from[1], from[2] - tickDir[2]],
          [from[0] + tickDir[0], from[1], from[2] + tickDir[2]],
        ]}
        color={color}
        lineWidth={1.5}
      />
      <Line
        points={[
          [to[0] - tickDir[0], to[1], to[2] - tickDir[2]],
          [to[0] + tickDir[0], to[1], to[2] + tickDir[2]],
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

function legLabel(config: LegCapConfig): { width: number; depth: number } {
  // What the user typed (excluding any clearance). The dimension callouts
  // should match the value they measured off the leg, not the inflated
  // socket size.
  switch (config.shape) {
    case "round":
      return { width: config.innerDiameter, depth: config.innerDiameter };
    case "square":
      return { width: config.innerSize, depth: config.innerSize };
    case "rectangular":
    case "oval":
      return { width: config.innerWidth, depth: config.innerHeight };
  }
}

function LegCapDimensionIndicators({ config }: { config: LegCapConfig }) {
  const outer = outerBounds(config);
  const leg = legLabel(config);
  const inset = Math.max(outer.width, outer.height) * 0.18;
  const totalHeight = config.floorThickness + config.capHeight;
  const heightFont = Math.max(3, Math.max(outer.width, outer.height) * 0.045);

  return (
    <group>
      {/* Leg width — along world X (red) */}
      <BedDimension
        from={[-leg.width / 2, 0, -outer.height / 2 - inset]}
        to={[leg.width / 2, 0, -outer.height / 2 - inset]}
        axis="x"
        label={`${String(leg.width)} mm`}
        color="#3b82f6"
      />
      {/* Leg depth — along world Z (blue depth) */}
      <BedDimension
        from={[outer.width / 2 + inset, 0, -leg.depth / 2]}
        to={[outer.width / 2 + inset, 0, leg.depth / 2]}
        axis="z"
        label={`${String(leg.depth)} mm`}
        color="#22c55e"
      />
      {/* Cap height — text-only callout near the top of the cap. */}
      <Text
        position={[
          -outer.width / 2 - heightFont * 0.3,
          totalHeight + heightFont * 0.4,
          0,
        ]}
        fontSize={heightFont}
        color="#a855f7"
        anchorX="right"
        anchorY="bottom"
      >
        {`${totalHeight.toFixed(1)} mm tall`}
      </Text>
    </group>
  );
}

function useLegCapBounds(config: LegCapConfig): SceneBounds {
  const serialized = configKey(config);
  return useMemo(() => {
    const parsed = JSON.parse(serialized) as LegCapConfig;
    const outer = outerBounds(parsed);
    const totalHeight = parsed.floorThickness + parsed.capHeight;
    const maxDimension = Math.max(outer.width, outer.height, totalHeight);
    return {
      maxDimension,
      cameraDistance: maxDimension * 2.4,
      orbitTarget: [0, totalHeight / 2, 0] as [number, number, number],
    };
  }, [serialized]);
}

export function LegCapScene({ config }: { config: LegCapConfig }) {
  const bounds = useLegCapBounds(config);

  return (
    <>
      <PreviewSceneRig bounds={bounds} />
      <ModelMesh
        config={config}
        generate={generateLegCapTriangles}
        axis="z-up"
      />
      <Suspense fallback={null}>
        <LegCapDimensionIndicators config={config} />
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
