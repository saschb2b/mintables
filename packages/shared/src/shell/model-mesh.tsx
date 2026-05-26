"use client";

import { useEffect, useMemo } from "react";
import { Edges } from "@react-three/drei";
import * as THREE from "three";
import {
  trianglesToBufferGeometry,
  type AxisConvention,
} from "../lib/geometry/mesh-utils";
import { configKey } from "../lib/config-key";

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
}

export function ModelMesh<T>({
  config,
  generate,
  axis = "z-up",
}: ModelMeshProps<T>) {
  const serialized = configKey(config);

  const geometry = useMemo(() => {
    const parsed = JSON.parse(serialized) as T;
    const triangles = generate(parsed);
    return trianglesToBufferGeometry(triangles, axis);
  }, [serialized, generate, axis]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial {...MATERIAL} />
      <Edges threshold={15} color="#5c6570" />
    </mesh>
  );
}
