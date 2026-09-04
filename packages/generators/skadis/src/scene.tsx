"use client";

import { Suspense, useLayoutEffect, useMemo } from "react";
import { ContactShadows, Line, Text } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { configKey } from "@mintables/shared/lib/config-key";
import { trianglesToBufferGeometry } from "@mintables/shared/lib/geometry/mesh-utils";
import { ModelMesh } from "@mintables/shared/shell/model-mesh";
import { GridFloor } from "@mintables/shared/shell/grid-floor";
import {
  PreviewSceneRig,
  type SceneBounds,
} from "@mintables/shared/shell/preview-scene-rig";
import { deriveSkadis } from "./derived";
import { generateBoardTriangles, generateSkadisTriangles } from "./geometry";
import type { SkadisConfig } from "./types";

/**
 * World frame is y-up: world x = source x, world y = source z (height),
 * world z = source y (depth away from the board).
 */
function BedDimension({
  from,
  to,
  axis,
  label,
  color,
}: {
  from: [number, number, number];
  to: [number, number, number];
  axis: "x" | "z";
  label: string;
  color: string;
}) {
  const tick = 2;
  const tickDir = axis === "x" ? [0, 0, tick] : [tick, 0, 0];
  const mid: [number, number, number] = [
    (from[0] + to[0]) / 2,
    from[1],
    (from[2] + to[2]) / 2,
  ];
  const textPos: [number, number, number] =
    axis === "x" ? [mid[0], mid[1], mid[2] + 6] : [mid[0] + 6, mid[1], mid[2]];
  const length = Math.hypot(to[0] - from[0], to[2] - from[2]);
  const fontSize = Math.max(2.5, Math.min(6, length * 0.08));
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

function Dimensions({ config }: { config: SkadisConfig }) {
  const d = deriveSkadis(config);
  const front = d.plateThickness + d.body.depth;
  const halfW = d.footprintX / 2;
  const inset = Math.max(8, d.footprintX * 0.1);
  return (
    <group>
      <BedDimension
        from={[-halfW, 0, front + inset]}
        to={[halfW, 0, front + inset]}
        axis="x"
        label={`${d.footprintX.toFixed(0)} mm`}
        color="#3b82f6"
      />
      <BedDimension
        from={[halfW + inset, 0, -d.hooks.reach]}
        to={[halfW + inset, 0, front]}
        axis="z"
        label={`${d.footprintY.toFixed(0)} mm`}
        color="#22c55e"
      />
      <Text
        position={[-halfW - 3, d.height + 3, 0]}
        fontSize={Math.max(3, Math.min(6, d.footprintX * 0.045))}
        color="#a855f7"
        anchorX="right"
        anchorY="bottom"
      >
        {`${d.height.toFixed(0)} mm tall`}
      </Text>
    </group>
  );
}

/** Translucent slice of pegboard so the hooks visibly land in slots. */
function BoardGhost({ config }: { config: SkadisConfig }) {
  const invalidate = useThree((state) => state.invalidate);
  const key = configKey({ mount: config.mount, body: config.body });
  const geometry = useMemo(() => {
    const parsed = JSON.parse(key) as Pick<SkadisConfig, "mount" | "body">;
    return trianglesToBufferGeometry(
      generateBoardTriangles({ ...parsed, showBoard: true }),
      "z-up",
    );
  }, [key]);
  useLayoutEffect(() => {
    invalidate();
    return () => geometry.dispose();
  }, [geometry, invalidate]);
  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial
        color="#c7ced6"
        transparent
        opacity={0.3}
        depthWrite={false}
        side={THREE.DoubleSide}
        roughness={0.9}
      />
    </mesh>
  );
}

function useSkadisBounds(config: SkadisConfig): SceneBounds {
  const key = configKey(config);
  return useMemo(() => {
    const parsed = JSON.parse(key) as SkadisConfig;
    const d = deriveSkadis(parsed);
    const maxDimension = Math.max(d.footprintX, d.footprintY, d.height);
    const centerDepth = (-d.hooks.reach + d.plateThickness + d.body.depth) / 2;
    return {
      maxDimension,
      cameraDistance: maxDimension * 2.1,
      orbitTarget: [0, d.height / 2, centerDepth] as [number, number, number],
    };
  }, [key]);
}

export function SkadisScene({ config }: { config: SkadisConfig }) {
  const bounds = useSkadisBounds(config);
  return (
    <>
      <PreviewSceneRig bounds={bounds} />
      <ModelMesh
        config={config}
        generate={generateSkadisTriangles}
        axis="z-up"
      />
      {config.showBoard && <BoardGhost config={config} />}
      <Suspense fallback={null}>
        <Dimensions config={config} />
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
