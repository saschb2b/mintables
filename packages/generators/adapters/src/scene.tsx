"use client";

import { Suspense, useMemo } from "react";
import { ContactShadows, Line, Text } from "@react-three/drei";
import type { AdapterConfig } from "./types";
import {
  getAdapterLayout,
  getBendArcPoints,
  formatTubeEndSize,
} from "./layout";
import { generateAdapterTriangles } from "./geometry";
import { configKey } from "@mintables/shared/lib/config-key";
import { ModelMesh } from "@mintables/shared/shell/model-mesh";
import { GridFloor } from "@mintables/shared/shell/grid-floor";
import {
  PreviewSceneRig,
  type SceneBounds,
} from "@mintables/shared/shell/preview-scene-rig";
import { AdapterGhostTubes } from "./ghost-tubes";

function ProfileDimension({
  width,
  center,
  outward,
  label,
  color,
  labelOffset = 8,
}: {
  width: number;
  center: [number, number, number];
  outward: [number, number, number];
  label: string;
  color: string;
  labelOffset?: number;
}) {
  const half = width / 2;
  const tick = Math.max(2, width * 0.06);
  const textSize = Math.max(3, width * 0.08);
  const labelPos: [number, number, number] = [
    center[0] + outward[0] * labelOffset,
    center[1] + outward[1] * labelOffset,
    center[2] + outward[2] * labelOffset,
  ];

  return (
    <group>
      <Line
        points={[
          [center[0] - half, center[1], center[2]],
          [center[0] + half, center[1], center[2]],
        ]}
        color={color}
        lineWidth={1.5}
      />
      <Line
        points={[
          [center[0] - half, center[1] - tick, center[2]],
          [center[0] - half, center[1] + tick, center[2]],
        ]}
        color={color}
        lineWidth={1.5}
      />
      <Line
        points={[
          [center[0] + half, center[1] - tick, center[2]],
          [center[0] + half, center[1] + tick, center[2]],
        ]}
        color={color}
        lineWidth={1.5}
      />
      <Text
        position={labelPos}
        fontSize={textSize}
        color={color}
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
}

function AxisDimension({
  from,
  to,
  label,
  color,
  labelSide = "left",
}: {
  from: [number, number, number];
  to: [number, number, number];
  label: string;
  color: string;
  labelSide?: "left" | "right";
}) {
  const mid: [number, number, number] = [
    (from[0] + to[0]) / 2,
    (from[1] + to[1]) / 2,
    (from[2] + to[2]) / 2,
  ];
  const tick = 2;
  const textSize = Math.max(3, 4);
  const textOffset = labelSide === "left" ? -10 : 10;

  return (
    <group>
      <Line points={[from, to]} color={color} lineWidth={1.5} />
      <Line
        points={[
          [from[0] - tick, from[1], from[2]],
          [from[0] + tick, from[1], from[2]],
        ]}
        color={color}
        lineWidth={1.5}
      />
      <Line
        points={[
          [to[0] - tick, to[1], to[2]],
          [to[0] + tick, to[1], to[2]],
        ]}
        color={color}
        lineWidth={1.5}
      />
      <Text
        position={[mid[0] + textOffset, mid[1], mid[2]]}
        fontSize={textSize}
        color={color}
        anchorX={labelSide === "left" ? "right" : "left"}
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
}

function EndTag({
  center,
  outward,
  title,
  color,
}: {
  center: [number, number, number];
  outward: [number, number, number];
  title: string;
  color: string;
}) {
  const pos: [number, number, number] = [
    center[0] + outward[0] * 14,
    center[1] + outward[1] * 14,
    center[2] + outward[2] * 14 + 6,
  ];

  return (
    <Text position={pos} fontSize={4} color={color} anchorX="center" anchorY="middle">
      {title}
    </Text>
  );
}

function AdapterDimensionIndicators({ config }: { config: AdapterConfig }) {
  const layout = getAdapterLayout(config);
  const {
    endA,
    endB,
    bendEnd,
    transitionLength,
    bendRadius,
    bendAngle,
    wallThickness,
    socketDepth,
    isReducer,
  } = layout;

  const maxOuter = Math.max(
    endA.adapterOuter.width,
    endA.adapterOuter.height,
    endB.adapterOuter.width,
    endB.adapterOuter.height,
  );
  const xOffset = maxOuter / 2 + 14;

  const totalLocalHeight = endB.center[1] + socketDepth;

  const bodyMidY =
    bendAngle === 0 ? transitionLength / 2 : bendEnd[1] / 2;

  const arcPoints =
    bendAngle > 0 ? getBendArcPoints(bendRadius, bendAngle, 28) : [];

  return (
    <group>
      <EndTag
        center={endA.center}
        outward={endA.outward}
        title={`End A · ${endA.fit === "socket" ? "Socket" : "Plug"}`}
        color="#3b82f6"
      />
      <EndTag
        center={endB.center}
        outward={endB.outward}
        title={`End B · ${endB.fit === "socket" ? "Socket" : "Plug"}`}
        color="#22c55e"
      />

      <ProfileDimension
        width={endA.tubeOuter.width}
        center={endA.center}
        outward={endA.outward}
        label={formatTubeEndSize(endA.tube)}
        color="#3b82f6"
        labelOffset={-10}
      />
      <ProfileDimension
        width={endB.tubeOuter.width}
        center={endB.center}
        outward={endB.outward}
        label={formatTubeEndSize(endB.tube)}
        color="#22c55e"
        labelOffset={10}
      />

      <AxisDimension
        from={[0, -socketDepth, 0]}
        to={[0, 0, 0]}
        label={`${String(socketDepth)}mm`}
        color="#f59e0b"
        labelSide="left"
      />
      <AxisDimension
        from={bendEnd}
        to={endB.center}
        label={`${String(socketDepth)}mm`}
        color="#f59e0b"
        labelSide="right"
      />

      <AxisDimension
        from={[xOffset, -socketDepth, 0]}
        to={[xOffset, endB.center[1], 0]}
        label={`${String(Math.round(totalLocalHeight))}mm`}
        color="#fbbf24"
        labelSide="right"
      />

      {bendAngle === 0 && transitionLength > 0 && (
        <AxisDimension
          from={[-xOffset, 0, 0]}
          to={[-xOffset, transitionLength, 0]}
          label={`${String(Math.round(transitionLength))}mm`}
          color="#a855f7"
          labelSide="left"
        />
      )}

      {isReducer && bendAngle === 0 && (
        <Text
          position={[-xOffset - 8, transitionLength / 2, maxOuter / 2 + 8]}
          fontSize={Math.max(3, transitionLength * 0.06)}
          color="#a855f7"
          anchorX="right"
          anchorY="middle"
        >
          Reducer
        </Text>
      )}

      <Text
        position={[-xOffset, bodyMidY, maxOuter / 2 + 6]}
        fontSize={Math.max(3.5, transitionLength * 0.05)}
        color="#94a3b8"
        anchorX="right"
        anchorY="middle"
      >
        {`${String(wallThickness)}mm wall`}
      </Text>

      {bendAngle > 0 && arcPoints.length > 1 && (
        <group>
          <Line points={arcPoints} color="#a855f7" lineWidth={1.5} />
          <Text
            position={[
              bendRadius * 0.55 + 8,
              bendRadius * 0.35,
              bendRadius * 0.35,
            ]}
            fontSize={Math.max(3, bendRadius * 0.06)}
            color="#a855f7"
            anchorX="left"
            anchorY="middle"
          >
            {`${String(bendAngle)}° · R${String(Math.round(bendRadius))}mm`}
          </Text>
        </group>
      )}
    </group>
  );
}

function useAdapterBounds(config: AdapterConfig): SceneBounds {
  const serialized = configKey(config);
  return useMemo(() => {
    const parsed = JSON.parse(serialized) as AdapterConfig;
    const layout = getAdapterLayout(parsed);
    const cameraDistance =
      layout.bendAngle > 0
        ? layout.boundsSize * 3
        : layout.boundsSize * 2.5;

    return {
      maxDimension: layout.boundsSize,
      cameraDistance,
      orbitTarget: layout.boundsCenter,
      minDistance: Math.max(20, layout.boundsSize * 0.35),
      maxDistance: layout.boundsSize * 12,
    };
  }, [serialized]);
}

export function AdapterScene({ config }: { config: AdapterConfig }) {
  const bounds = useAdapterBounds(config);
  const layout = useMemo(() => getAdapterLayout(config), [config]);

  return (
    <>
      <PreviewSceneRig bounds={bounds} />
      <group position={[0, layout.meshOffsetY, 0]}>
        <AdapterGhostTubes
          endA={layout.endA}
          endB={layout.endB}
          socketDepth={layout.socketDepth}
        />
        <ModelMesh
          config={config}
          generate={generateAdapterTriangles}
          axis="y-up"
        />
        <Suspense fallback={null}>
          <AdapterDimensionIndicators config={config} />
        </Suspense>
      </group>
      <GridFloor size={bounds.maxDimension} />
      <ContactShadows
        position={[0, -0.01, 0]}
        opacity={0.35}
        scale={bounds.maxDimension * 2}
        blur={2}
        far={bounds.maxDimension}
      />
    </>
  );
}
