"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { AnyGenerator } from "../lib/generator";
import { trianglesToBufferGeometry } from "../lib/geometry/mesh-utils";

interface FittedGeo {
  geometry: THREE.BufferGeometry;
  scale: number;
  offset: [number, number, number];
}

function useFittedGeometry(
  generator: AnyGenerator,
  targetSize: number,
): FittedGeo {
  const memo = useMemo<FittedGeo>(() => {
    // Generators with an async kernel may not be ready yet; show nothing
    // rather than crash the grid.
    const triangles = (() => {
      try {
        return generator.geometry(generator.defaults);
      } catch {
        return [];
      }
    })();
    const geo = trianglesToBufferGeometry(triangles, generator.axis);
    geo.computeBoundingBox();
    const box = geo.boundingBox ?? new THREE.Box3();
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const scale = targetSize / maxDim;
    const offset = center.multiplyScalar(-scale);
    return {
      geometry: geo,
      scale,
      offset: [offset.x, offset.y, offset.z],
    };
  }, [generator, targetSize]);

  useEffect(() => () => memo.geometry.dispose(), [memo]);

  return memo;
}

function RotatingMesh({
  generator,
  hover,
  targetSize,
}: {
  generator: AnyGenerator;
  hover: boolean;
  targetSize: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const speedRef = useRef(0.25);
  const fit = useFittedGeometry(generator, targetSize);

  useFrame((_, delta) => {
    const target = hover ? 0.9 : 0.25;
    speedRef.current += (target - speedRef.current) * Math.min(1, delta * 5);
    if (groupRef.current) {
      groupRef.current.rotation.y += speedRef.current * delta;
    }
  });

  return (
    <group scale={fit.scale} position={fit.offset}>
      <group ref={groupRef}>
        <mesh geometry={fit.geometry}>
          <meshStandardMaterial
            color={generator.meta.accent}
            metalness={0.55}
            roughness={0.38}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    </group>
  );
}

export interface MiniPreviewProps {
  generator: AnyGenerator;
  hover?: boolean;
  height?: number;
}

/** Small rotating preview of a generator's default output. */
export function MiniPreview({
  generator,
  hover = false,
  height = 140,
}: MiniPreviewProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div style={{ height, width: "100%" }} aria-hidden />;
  }

  return (
    <div style={{ height, width: "100%" }}>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [1.6, 1.1, 1.6], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.55} />
        <directionalLight position={[3, 4, 3]} intensity={1.1} />
        <directionalLight position={[-3, 1, -3]} intensity={0.45} />
        <RotatingMesh generator={generator} hover={hover} targetSize={1.6} />
      </Canvas>
    </div>
  );
}
