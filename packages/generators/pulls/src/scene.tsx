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
import type { PullConfig } from "./types";
import { generatePullTriangles } from "./geometry";
import { getPullSpec } from "./spec";

/**
 * Bed-plane dimension stick along the X (width) or Z (depth) world axis.
 * The mesh uses source z-up coordinates which the shell flips to y-up, so
 * world x = source x, world y = height, world z = source y.
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

function widthLabel(config: PullConfig): string {
  switch (config.style) {
    case "knob":
      return `Ø ${String(config.headDiameter)} mm`;
    case "tab":
      return `${String(config.baseLength)} + ${String(config.tabLength)} mm`;
    case "arc":
      return `${String(config.holeSpacing)} mm centers`;
  }
}

function PullDimensionIndicators({ config }: { config: PullConfig }) {
  const spec = getPullSpec(config);
  // The knob and arc are centered on the origin; the tab starts at x = 0.
  const x0 = config.style === "tab" ? 0 : -spec.footprintX / 2;
  const x1 = config.style === "tab" ? spec.footprintX : spec.footprintX / 2;
  const inset = Math.max(spec.footprintX, spec.footprintY) * 0.18;
  const heightFont = Math.max(
    3,
    Math.max(spec.footprintX, spec.footprintY) * 0.045,
  );

  return (
    <group>
      <BedDimension
        from={[x0, 0, -spec.footprintY / 2 - inset]}
        to={[x1, 0, -spec.footprintY / 2 - inset]}
        axis="x"
        label={widthLabel(config)}
        color="#3b82f6"
      />
      <BedDimension
        from={[x1 + inset, 0, -spec.footprintY / 2]}
        to={[x1 + inset, 0, spec.footprintY / 2]}
        axis="z"
        label={`${spec.footprintY.toFixed(0)} mm`}
        color="#22c55e"
      />
      <Text
        position={[x0 - heightFont * 0.3, spec.height + heightFont * 0.4, 0]}
        fontSize={heightFont}
        color="#a855f7"
        anchorX="right"
        anchorY="bottom"
      >
        {`${spec.height.toFixed(1)} mm tall`}
      </Text>
    </group>
  );
}

function usePullBounds(config: PullConfig): SceneBounds {
  const serialized = configKey(config);
  return useMemo(() => {
    const parsed = JSON.parse(serialized) as PullConfig;
    const spec = getPullSpec(parsed);
    const maxDimension = Math.max(
      spec.footprintX,
      spec.footprintY,
      spec.height,
    );
    const centerX = parsed.style === "tab" ? spec.footprintX / 2 : 0;
    return {
      maxDimension,
      cameraDistance: maxDimension * 2.2,
      orbitTarget: [centerX, spec.height / 2, 0] as [number, number, number],
    };
  }, [serialized]);
}

export function PullScene({ config }: { config: PullConfig }) {
  const bounds = usePullBounds(config);

  return (
    <>
      <PreviewSceneRig bounds={bounds} />
      <ModelMesh config={config} generate={generatePullTriangles} axis="z-up" />
      <Suspense fallback={null}>
        <PullDimensionIndicators config={config} />
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
