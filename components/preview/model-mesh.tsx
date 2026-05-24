"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import {
  trianglesToBufferGeometry,
  type AxisConvention,
} from "@/lib/geometry/mesh-utils";
import { configKey } from "@/lib/config-key";

const MATERIAL = {
  color: "#b8c4ce",
  metalness: 0.85,
  roughness: 0.15,
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
  const meshRef = useRef<THREE.Mesh>(null);
  const serialized = configKey(config);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const parsed = JSON.parse(serialized) as T;
    const triangles = generate(parsed);
    const next = trianglesToBufferGeometry(triangles, axis);
    const previous =
      mesh.geometry instanceof THREE.BufferGeometry ? mesh.geometry : null;

    mesh.geometry = next;

    if (previous && previous !== next) {
      previous.dispose();
    }
  }, [serialized, generate, axis]);

  useEffect(() => {
    const mesh = meshRef.current;
    return () => {
      if (mesh?.geometry instanceof THREE.BufferGeometry) {
        mesh.geometry.dispose();
      }
    };
  }, []);

  return (
    <mesh ref={meshRef}>
      <meshStandardMaterial {...MATERIAL} />
    </mesh>
  );
}
