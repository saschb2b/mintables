"use client";

import { useLayoutEffect, useMemo } from "react";
import { ContactShadows } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useTheme } from "@mui/material/styles";
import { BufferAttribute, BufferGeometry, DoubleSide } from "three";
import { GridFloor } from "@mintables/shared/shell/grid-floor";
import { PreviewSceneRig } from "@mintables/shared/shell/preview-scene-rig";
import { getSupportAsset } from "./asset-store";
import type { PreparedPreviewMesh } from "./mesh-preparation";
import type { SupportCleanerConfig } from "./types";

function PackedMesh({
  preview,
  color,
  opacity = 1,
}: {
  preview: PreparedPreviewMesh;
  color: string;
  opacity?: number;
}) {
  const invalidate = useThree((state) => state.invalidate);
  const geometry = useMemo(() => {
    const nextGeometry = new BufferGeometry();
    nextGeometry.setAttribute(
      "position",
      new BufferAttribute(preview.positions, 3),
    );
    nextGeometry.setIndex(new BufferAttribute(preview.indices, 1));
    return nextGeometry;
  }, [preview]);

  useLayoutEffect(() => {
    invalidate();
    return () => geometry.dispose();
  }, [geometry, invalidate]);

  if (preview.indices.length === 0) return null;
  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial
        color={color}
        metalness={0.12}
        roughness={0.62}
        flatShading
        side={DoubleSide}
        transparent={opacity < 1}
        opacity={opacity}
        depthWrite={opacity >= 1}
      />
    </mesh>
  );
}

export function SupportCleanerScene({
  config,
}: {
  config: SupportCleanerConfig;
}) {
  const theme = useTheme();
  const asset = getSupportAsset(config.assetId);
  const prepared = asset?.prepared;
  const output = prepared?.preview;
  const removed = prepared?.removedPreview;
  const bounds = prepared?.bounds;
  const width = bounds ? bounds.maxX - bounds.minX : 40;
  const depth = bounds ? bounds.maxY - bounds.minY : 40;
  const height = bounds ? bounds.maxZ - bounds.minZ : 40;
  const maxDimension = Math.max(width, depth, height, 20);
  const sceneBounds = {
    maxDimension,
    cameraDistance: maxDimension * 2,
    orbitTarget: [
      bounds ? (bounds.minX + bounds.maxX) / 2 : 0,
      bounds ? (bounds.minZ + bounds.maxZ) / 2 : 12,
      bounds ? -(bounds.minY + bounds.maxY) / 2 : 0,
    ] as [number, number, number],
  };

  return (
    <>
      <PreviewSceneRig bounds={sceneBounds} />
      <group rotation={[-Math.PI / 2, 0, 0]}>
        {output && (
          <PackedMesh preview={output} color={theme.palette.grey[200]} />
        )}
        {config.showRemovedSupports && removed && (
          <PackedMesh
            preview={removed}
            color={theme.palette.error.main}
            opacity={0.42}
          />
        )}
      </group>
      <GridFloor size={maxDimension} />
      <ContactShadows
        position={[0, -0.01, 0]}
        opacity={0.38}
        scale={maxDimension * 2}
        blur={2}
        far={maxDimension}
        color={theme.palette.common.black}
      />
    </>
  );
}
