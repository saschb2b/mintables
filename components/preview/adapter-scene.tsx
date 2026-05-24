"use client";

import { Suspense, useMemo } from "react";
import { ContactShadows, Line, Text } from "@react-three/drei";
import type { AdapterConfig } from "@/lib/adapter-types";
import {
  getTubeOuterDimensions,
  getAdapterOuterDimensions,
  getEffectiveBendRadius,
} from "@/lib/adapter-types";
import { generateAdapterTriangles } from "@/lib/geometry/adapter-mesh";
import { configKey } from "@/lib/config-key";
import { ModelMesh } from "./model-mesh";
import { GridFloor } from "./grid-floor";
import { PreviewSceneRig, type SceneBounds } from "./preview-scene-rig";

function HorizontalDimension({
  width,
  y,
  z,
  label,
  color = "#f59e0b",
  labelPosition = "above",
}: {
  width: number;
  y: number;
  z: number;
  label: string;
  color?: string;
  labelPosition?: "above" | "below";
}) {
  const halfWidth = width / 2;
  const tickSize = Math.max(2, width * 0.06);
  const textSize = Math.max(3, width * 0.08);
  const textY =
    labelPosition === "above"
      ? y + tickSize + textSize
      : y - tickSize - textSize;

  return (
    <group>
      <Line
        points={[
          [-halfWidth, y, z],
          [halfWidth, y, z],
        ]}
        color={color}
        lineWidth={1.5}
      />
      <Line
        points={[
          [-halfWidth, y - tickSize, z],
          [-halfWidth, y + tickSize, z],
        ]}
        color={color}
        lineWidth={1.5}
      />
      <Line
        points={[
          [halfWidth, y - tickSize, z],
          [halfWidth, y + tickSize, z],
        ]}
        color={color}
        lineWidth={1.5}
      />
      <Text
        position={[0, textY, z]}
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

function VerticalDimension({
  height,
  x,
  z,
  startY,
  label,
  color = "#f59e0b",
  labelSide = "right",
}: {
  height: number;
  x: number;
  z: number;
  startY: number;
  label: string;
  color?: string;
  labelSide?: "left" | "right";
}) {
  const tickSize = Math.max(2, height * 0.04);
  const textSize = Math.max(3, height * 0.06);
  const textX =
    labelSide === "right"
      ? x + tickSize + textSize * 2
      : x - tickSize - textSize * 2;

  return (
    <group>
      <Line
        points={[
          [x, startY, z],
          [x, startY + height, z],
        ]}
        color={color}
        lineWidth={1.5}
      />
      <Line
        points={[
          [x - tickSize, startY, z],
          [x + tickSize, startY, z],
        ]}
        color={color}
        lineWidth={1.5}
      />
      <Line
        points={[
          [x - tickSize, startY + height, z],
          [x + tickSize, startY + height, z],
        ]}
        color={color}
        lineWidth={1.5}
      />
      <Text
        position={[textX, startY + height / 2, z]}
        fontSize={textSize}
        color={color}
        anchorX={labelSide === "right" ? "left" : "right"}
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
}

function AdapterDimensionIndicators({ config }: { config: AdapterConfig }) {
  const dimA = getTubeOuterDimensions(config.endA);
  const dimB = getTubeOuterDimensions(config.endB);
  const adapterA = getAdapterOuterDimensions(
    config.endA,
    config.socketClearance,
    config.wallThickness,
    config.endAFit,
  );
  const bendRadius = getEffectiveBendRadius(config);
  const straightLength = config.bendAngle === 0 ? bendRadius : 0;

  const yOffset = config.socketDepth;
  const maxOuterWidth = Math.max(adapterA.width, adapterA.height);
  const xOffset = maxOuterWidth / 2 + 12;

  const endAngleRad = (config.bendAngle * Math.PI) / 180;
  let endBY: number;

  if (config.bendAngle > 0) {
    endBY =
      bendRadius * Math.sin(endAngleRad) +
      config.socketDepth * Math.cos(endAngleRad) +
      yOffset;
  } else {
    endBY = straightLength + config.socketDepth + yOffset;
  }

  return (
    <group>
      <HorizontalDimension
        width={dimA.width}
        y={-6}
        z={maxOuterWidth / 2 + 5}
        label={`⌀${String(dimA.width)}mm`}
        color="#3b82f6"
        labelPosition="below"
      />

      <HorizontalDimension
        width={dimB.width}
        y={endBY + 6}
        z={0}
        label={`⌀${String(dimB.width)}mm`}
        color="#22c55e"
      />

      <VerticalDimension
        height={config.socketDepth}
        x={-xOffset}
        z={0}
        startY={0}
        label={`${String(config.socketDepth)}mm`}
        color="#f59e0b"
        labelSide="left"
      />

      <VerticalDimension
        height={endBY}
        x={xOffset}
        z={0}
        startY={0}
        label={`${String(Math.round(endBY))}mm`}
        color="#f59e0b"
      />

      {config.bendAngle > 0 && (
        <Text
          position={[
            -xOffset - 8,
            bendRadius * 0.5 + yOffset,
            bendRadius * 0.3,
          ]}
          fontSize={Math.max(3, bendRadius * 0.06)}
          color="#a855f7"
          anchorX="right"
          anchorY="middle"
        >
          {config.bendAngle}° elbow
        </Text>
      )}
    </group>
  );
}

function useAdapterBounds(config: AdapterConfig): SceneBounds {
  const serialized = configKey(config);
  return useMemo(() => {
    const parsed = JSON.parse(serialized) as AdapterConfig;
    const adapterDim = getAdapterOuterDimensions(
      parsed.endA,
      parsed.socketClearance,
      parsed.wallThickness,
      parsed.endAFit,
    );
    const bendRadius = getEffectiveBendRadius(parsed);
    const straightLength = parsed.bendAngle === 0 ? bendRadius : 0;
    const totalHeight =
      parsed.socketDepth * 2 +
      (parsed.bendAngle > 0 ? bendRadius : straightLength);
    const maxDim = Math.max(adapterDim.width, adapterDim.height, totalHeight);
    const centerY = totalHeight / 2;

    return {
      maxDimension: maxDim,
      cameraDistance: maxDim * 2.5,
      orbitTarget: [0, centerY, parsed.bendAngle > 0 ? bendRadius / 4 : 0] as [
        number,
        number,
        number,
      ],
      minDistance: 20,
      maxDistance: maxDim * 10,
    };
  }, [serialized]);
}

export function AdapterScene({ config }: { config: AdapterConfig }) {
  const bounds = useAdapterBounds(config);

  return (
    <>
      <PreviewSceneRig bounds={bounds} />
      <group position={[0, config.socketDepth, 0]}>
        <ModelMesh
          config={config}
          generate={generateAdapterTriangles}
          axis="y-up"
        />
      </group>
      <Suspense fallback={null}>
        <AdapterDimensionIndicators config={config} />
      </Suspense>
      <GridFloor size={bounds.maxDimension} />
      <ContactShadows
        position={[0, 0, 0]}
        opacity={0.3}
        scale={200}
        blur={2.5}
        far={100}
      />
    </>
  );
}
