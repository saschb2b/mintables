"use client";

import { Suspense, useMemo } from "react";
import { Billboard, ContactShadows, Line, Text } from "@react-three/drei";
import { useTheme } from "@mui/material/styles";
import { configKey } from "@mintables/shared/lib/config-key";
import { ModelMesh } from "@mintables/shared/shell/model-mesh";
import { GridFloor } from "@mintables/shared/shell/grid-floor";
import {
  PreviewSceneRig,
  type SceneBounds,
} from "@mintables/shared/shell/preview-scene-rig";
import { deriveClamp } from "./derived";
import { generateClampTriangles } from "./geometry";
import type { ClampConfig } from "./types";

/** Bed-plane dimension stick along the X or Z world axis. */
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

/**
 * Translucent stand-in for the rod the clamp grips. Plate mount: the rod
 * runs horizontally along world X through the bore. Clip mount: the clip
 * lies flat, so the rod stands vertically through it.
 */
function GhostRod({ config }: { config: ClampConfig }) {
  const theme = useTheme();
  const d = deriveClamp(config);
  const radius = config.rodDiameter / 2;
  const isPlate = config.mount === "plate";
  const length = isPlate ? config.baseLength + 24 : config.jawWidth + 24;

  return (
    <mesh
      position={isPlate ? [0, d.boreCenterZ, 0] : [0, config.jawWidth / 2, 0]}
      rotation={isPlate ? [0, 0, Math.PI / 2] : [0, 0, 0]}
    >
      <cylinderGeometry args={[radius, radius, length, 48]} />
      <meshStandardMaterial
        color={theme.palette.info.light}
        transparent
        opacity={0.14}
        depthWrite={false}
      />
    </mesh>
  );
}

/** "12" for whole numbers, "12.3" otherwise. */
function fmt(n: number): string {
  const rounded = Math.round(n * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

/**
 * Diameter callout across the clamp's bore: a chord line with end ticks and
 * a camera-facing label. This is the number the user measured off the rod
 * (plus clearance) - the one dimension the whole part is built around.
 */
function BoreDiameterCallout({ config }: { config: ClampConfig }) {
  const theme = useTheme();
  const d = deriveClamp(config);
  const bore = 2 * d.boreRadius;
  const font = Math.max(2.5, bore * 0.2);
  const tick = Math.max(1, bore * 0.08);
  const color = theme.palette.warning.main;
  const label = `Ø ${fmt(bore)} mm`;

  if (config.mount === "plate") {
    // Bore circle stands vertically; draw its horizontal diameter floating
    // just outside the jaw face.
    const x = config.jawWidth / 2 + 1.5;
    const y = d.boreCenterZ;
    return (
      <group>
        <Line
          points={[
            [x, y, -bore / 2],
            [x, y, bore / 2],
          ]}
          color={color}
          lineWidth={1.5}
        />
        {[-bore / 2, bore / 2].map((z) => (
          <Line
            key={z}
            points={[
              [x, y - tick, z],
              [x, y + tick, z],
            ]}
            color={color}
            lineWidth={1.5}
          />
        ))}
        <Billboard position={[x, y + font * 1.1, 0]}>
          <Text fontSize={font} color={color} anchorX="center" anchorY="bottom">
            {label}
          </Text>
        </Billboard>
      </group>
    );
  }

  // Clip lies flat, bore circle is horizontal; draw the diameter floating
  // above the part.
  const yTop = config.jawWidth + 2;
  return (
    <group>
      <Line
        points={[
          [-bore / 2, yTop, 0],
          [bore / 2, yTop, 0],
        ]}
        color={color}
        lineWidth={1.5}
      />
      {[-bore / 2, bore / 2].map((x) => (
        <Line
          key={x}
          points={[
            [x, yTop, -tick],
            [x, yTop, tick],
          ]}
          color={color}
          lineWidth={1.5}
        />
      ))}
      <Billboard position={[0, yTop + font * 0.9, 0]}>
        <Text fontSize={font} color={color} anchorX="center" anchorY="bottom">
          {label}
        </Text>
      </Billboard>
    </group>
  );
}

/**
 * Kept deliberately sparse: the bore diameter at the jaw, the mounting
 * numbers on the bed (footprint plus one combined screw legend between the
 * hole centers), and nothing else. Everything secondary lives in the
 * summary card instead of the viewport.
 */
function ClampDimensionIndicators({ config }: { config: ClampConfig }) {
  const theme = useTheme();
  const d = deriveClamp(config);
  const isPlate = config.mount === "plate";
  const spanX = isPlate ? config.baseLength : 2 * d.maxOuterRadius;
  const spanZ = isPlate ? config.baseWidth : d.outerRadius + d.profileTop;
  const inset = Math.max(spanX, spanZ) * 0.22;

  return (
    <group>
      <BedDimension
        from={[-spanX / 2, 0, spanZ / 2 + inset]}
        to={[spanX / 2, 0, spanZ / 2 + inset]}
        axis="x"
        label={`${fmt(spanX)} mm`}
        color={theme.palette.info.main}
      />
      {isPlate && (
        <BedDimension
          from={[spanX / 2 + inset, 0, -spanZ / 2]}
          to={[spanX / 2 + inset, 0, spanZ / 2]}
          axis="z"
          label={`${fmt(spanZ)} mm`}
          color={theme.palette.success.main}
        />
      )}
      {isPlate && (
        // Screw legend on the far side of the plate: hole size and
        // center-to-center spacing in one line, ticks on the hole centers.
        <BedDimension
          from={[-config.holeSpacing / 2, 0, -spanZ / 2 - inset * 0.7]}
          to={[config.holeSpacing / 2, 0, -spanZ / 2 - inset * 0.7]}
          axis="x"
          label={`2× Ø ${fmt(config.screwDiameter)} @ ${fmt(config.holeSpacing)} mm`}
          color={theme.palette.warning.main}
          textOffset={-Math.max(5, spanZ * 0.2)}
        />
      )}
      <BoreDiameterCallout config={config} />
    </group>
  );
}

function useClampBounds(config: ClampConfig): SceneBounds {
  const serialized = configKey(config);
  return useMemo(() => {
    const parsed = JSON.parse(serialized) as ClampConfig;
    const d = deriveClamp(parsed);
    const isPlate = parsed.mount === "plate";
    const height = isPlate ? d.boreCenterZ + d.profileTop : parsed.jawWidth;
    const width = isPlate
      ? Math.max(parsed.baseLength, 2 * d.outerRadius)
      : 2 * d.maxOuterRadius;
    const maxDimension = Math.max(width, height, 20);
    return {
      maxDimension,
      cameraDistance: maxDimension * 2.4,
      orbitTarget: [0, height / 2, 0] as [number, number, number],
    };
  }, [serialized]);
}

export function ClampScene({ config }: { config: ClampConfig }) {
  const bounds = useClampBounds(config);

  return (
    <>
      <PreviewSceneRig bounds={bounds} />
      <ModelMesh
        config={config}
        generate={generateClampTriangles}
        axis="z-up"
      />
      <GhostRod config={config} />
      <Suspense fallback={null}>
        <ClampDimensionIndicators config={config} />
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
