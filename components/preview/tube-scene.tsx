"use client";

import { Suspense, useMemo } from "react";
import { ContactShadows, Line, Text } from "@react-three/drei";
import type { TubeConfig } from "@/lib/tube-types";
import { generateTubeTriangles } from "@/lib/geometry/tube-mesh";
import { configKey } from "@/lib/config-key";
import { getTubeWallInfo } from "@/lib/tube-spec";
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
  const textSize = Math.max(4, width * 0.1);
  const textY = labelPosition === "above" ? y + 5 : y - 5 - textSize * 0.5;

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
          [-halfWidth, y - 2, z],
          [-halfWidth, y + 2, z],
        ]}
        color={color}
        lineWidth={1.5}
      />
      <Line
        points={[
          [halfWidth, y - 2, z],
          [halfWidth, y + 2, z],
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
        {label}mm
      </Text>
    </group>
  );
}

function VerticalDimension({
  height,
  x,
  z,
  label,
  color = "#f59e0b",
  startY = 0,
}: {
  height: number;
  x: number;
  z: number;
  label: string;
  color?: string;
  startY?: number;
}) {
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
          [x - 2, startY, z],
          [x + 2, startY, z],
        ]}
        color={color}
        lineWidth={1.5}
      />
      <Line
        points={[
          [x - 2, startY + height, z],
          [x + 2, startY + height, z],
        ]}
        color={color}
        lineWidth={1.5}
      />
      <Text
        position={[x + 8, startY + height / 2, z]}
        fontSize={Math.max(4, height * 0.06)}
        color={color}
        anchorX="left"
        anchorY="middle"
      >
        {label}mm
      </Text>
    </group>
  );
}

function DepthDimension({
  depth,
  y,
  x,
  label,
  color = "#f59e0b",
}: {
  depth: number;
  y: number;
  x: number;
  label: string;
  color?: string;
}) {
  const halfDepth = depth / 2;

  return (
    <group>
      <Line
        points={[
          [x, y, -halfDepth],
          [x, y, halfDepth],
        ]}
        color={color}
        lineWidth={1.5}
      />
      <Line
        points={[
          [x, y - 2, -halfDepth],
          [x, y + 2, -halfDepth],
        ]}
        color={color}
        lineWidth={1.5}
      />
      <Line
        points={[
          [x, y - 2, halfDepth],
          [x, y + 2, halfDepth],
        ]}
        color={color}
        lineWidth={1.5}
      />
      <Text
        position={[x, y, halfDepth + 8]}
        fontSize={Math.max(4, depth * 0.1)}
        color={color}
        anchorX="center"
        anchorY="middle"
      >
        {label}mm
      </Text>
    </group>
  );
}

function TubeDimensionIndicators({ config }: { config: TubeConfig }) {
  const isRectangular = config.shape === "rectangular";
  const isSquare = config.shape === "square";
  const isRound = config.shape === "round";

  const outerWidth = isRound
    ? config.outerDiameter
    : isSquare
      ? config.outerSize
      : config.outerWidth;
  const outerHeight = isRound
    ? config.outerDiameter
    : isSquare
      ? config.outerSize
      : config.outerHeight;
  const innerWidth = isRound
    ? config.innerDiameter
    : isSquare
      ? config.innerSize
      : config.innerWidth;
  const innerHeight = isRound
    ? config.innerDiameter
    : isSquare
      ? config.innerSize
      : config.innerHeight;

  const maxOuter = Math.max(outerWidth, outerHeight);
  const xOffset = maxOuter / 2 + 15;
  const useFlare = config.flare.enabled && config.topCut.type === "flat";
  const flareStartY = useFlare ? config.length - config.flare.length : 0;
  const wall = getTubeWallInfo(config);
  const wallColor =
    wall.status === "ok" ? "#94a3b8" : wall.status === "thin" ? "#f59e0b" : "#ef4444";
  const wallLabel =
    wall.secondary !== undefined
      ? `${wall.primary.toFixed(2)}/${wall.secondary.toFixed(2)}mm wall`
      : `${wall.primary.toFixed(2)}mm wall`;

  return (
    <group>
      <VerticalDimension
        height={config.length}
        x={xOffset}
        z={0}
        label={config.length.toString()}
        color="#f59e0b"
      />

      <Text
        position={[-xOffset, config.length * 0.5, maxOuter / 2 + 8]}
        fontSize={Math.max(4, config.length * 0.045)}
        color={wallColor}
        anchorX="right"
        anchorY="middle"
      >
        {wallLabel}
      </Text>

      <HorizontalDimension
        width={outerWidth}
        y={-8}
        z={outerHeight / 2 + 5}
        label={isRound ? `⌀${String(outerWidth)}` : outerWidth.toString()}
        color="#3b82f6"
        labelPosition="below"
      />

      <HorizontalDimension
        width={innerWidth}
        y={config.length + 8}
        z={0}
        label={isRound ? `⌀${String(innerWidth)}` : innerWidth.toString()}
        color="#22c55e"
      />

      {isRectangular && (
        <DepthDimension
          depth={outerHeight}
          y={-8}
          x={outerWidth / 2 + 8}
          label={outerHeight.toString()}
          color="#60a5fa"
        />
      )}

      {isRectangular && (
        <DepthDimension
          depth={innerHeight}
          y={config.length + 8}
          x={-(innerWidth / 2 + 8)}
          label={innerHeight.toString()}
          color="#4ade80"
        />
      )}

      {useFlare && (
        <group>
          <group>
            <Line
              points={[
                [-xOffset, flareStartY, 0],
                [-xOffset, config.length, 0],
              ]}
              color="#ec4899"
              lineWidth={1.5}
            />
            <Line
              points={[
                [-xOffset - 2, flareStartY, 0],
                [-xOffset + 2, flareStartY, 0],
              ]}
              color="#ec4899"
              lineWidth={1.5}
            />
            <Line
              points={[
                [-xOffset - 2, config.length, 0],
                [-xOffset + 2, config.length, 0],
              ]}
              color="#ec4899"
              lineWidth={1.5}
            />
            <Text
              position={[
                -xOffset - 8,
                flareStartY + config.flare.length / 2,
                0,
              ]}
              fontSize={Math.max(4, config.flare.length * 0.15)}
              color="#ec4899"
              anchorX="right"
              anchorY="middle"
            >
              {config.flare.length}mm
            </Text>
          </group>

          <HorizontalDimension
            width={isRound ? config.flare.diameter : config.flare.width}
            y={config.length + 16}
            z={-(maxOuter / 2 + 5)}
            label={
              isRound
                ? `⌀${String(config.flare.diameter)}`
                : config.flare.width.toString()
            }
            color="#ec4899"
          />

          {isRectangular && (
            <DepthDimension
              depth={config.flare.height}
              y={config.length + 16}
              x={config.flare.width / 2 + 8}
              label={config.flare.height.toString()}
              color="#f472b6"
            />
          )}
        </group>
      )}

      {config.topCut.type === "saddle" && (
        <HorizontalDimension
          width={config.topCut.targetDiameter}
          y={config.length + 20}
          z={0}
          label={`Target ⌀${String(config.topCut.targetDiameter)}`}
          color="#a855f7"
        />
      )}

      {config.topCut.type === "miter" && (
        <Text
          position={[-xOffset, config.length, 0]}
          fontSize={Math.max(4, config.length * 0.05)}
          color="#a855f7"
          anchorX="right"
          anchorY="middle"
        >
          {config.topCut.angle}° miter
        </Text>
      )}

      {config.bottomCut.type === "miter" && (
        <Text
          position={[-xOffset, 0, 0]}
          fontSize={Math.max(4, config.length * 0.05)}
          color="#f97316"
          anchorX="right"
          anchorY="middle"
        >
          {config.bottomCut.angle}° miter
        </Text>
      )}

      {config.bottomCut.type === "saddle" && (
        <HorizontalDimension
          width={config.bottomCut.targetDiameter}
          y={-16}
          z={0}
          label={`Target ⌀${String(config.bottomCut.targetDiameter)}`}
          color="#f97316"
          labelPosition="below"
        />
      )}
    </group>
  );
}

function useTubeBounds(config: TubeConfig): SceneBounds {
  const serialized = configKey(config);
  return useMemo(() => {
    const parsed = JSON.parse(serialized) as TubeConfig;
    const maxDimension = Math.max(
      parsed.length,
      parsed.shape === "round"
        ? parsed.outerDiameter
        : parsed.shape === "square"
          ? parsed.outerSize
          : Math.max(parsed.outerWidth, parsed.outerHeight),
    );

    return {
      maxDimension,
      cameraDistance: maxDimension * 2.5,
      orbitTarget: [0, parsed.length / 2, 0] as [number, number, number],
    };
  }, [serialized]);
}

export function TubeScene({ config }: { config: TubeConfig }) {
  const bounds = useTubeBounds(config);

  return (
    <>
      <PreviewSceneRig bounds={bounds} />
      <ModelMesh
        config={config}
        generate={generateTubeTriangles}
        axis="z-up"
      />
      <Suspense fallback={null}>
        <TubeDimensionIndicators config={config} />
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
