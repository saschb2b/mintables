"use client";

import { useLayoutEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { Edges } from "@react-three/drei";
import * as THREE from "three";
import {
  trianglesToBufferGeometry,
  type AxisConvention,
} from "../lib/geometry/mesh-utils";
import { configKey } from "../lib/config-key";
import { addBoxProjectedUvs, WoodMaterial } from "./wood-material";

const MATERIAL = {
  color: "#d4dce4",
  metalness: 0.35,
  roughness: 0.42,
  side: THREE.DoubleSide,
} as const;

interface ModelMeshProps<T> {
  config: T;
  generate: (config: T) => number[][];
  axis?: AxisConvention;
  appearance?: "model" | "wood";
}

export function ModelMesh<T>({
  config,
  generate,
  axis = "z-up",
  appearance = "model",
}: ModelMeshProps<T>) {
  const invalidate = useThree((state) => state.invalidate);
  const serialized = configKey(config);

  const geometry = useMemo(() => {
    const parsed = JSON.parse(serialized) as T;
    const triangles = generate(parsed);
    const baseGeometry = trianglesToBufferGeometry(triangles, axis);
    if (appearance === "model") return baseGeometry;
    const projectedGeometry = addBoxProjectedUvs(baseGeometry, 52);
    baseGeometry.dispose();
    return projectedGeometry;
  }, [serialized, generate, axis, appearance]);

  useLayoutEffect(() => {
    invalidate();
    const nextFrame = window.requestAnimationFrame(() => invalidate());
    return () => {
      window.cancelAnimationFrame(nextFrame);
      geometry.dispose();
    };
  }, [geometry, invalidate]);

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      {appearance === "wood" ? (
        <WoodMaterial tone="honey" bumpScale={0.04} roughness={0.52} />
      ) : (
        <>
          <meshStandardMaterial {...MATERIAL} />
          <Edges threshold={15} color="#5c6570" />
        </>
      )}
    </mesh>
  );
}
