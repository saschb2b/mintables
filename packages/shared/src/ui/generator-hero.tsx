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

function fitGeometry(generator: AnyGenerator, targetSize: number): FittedGeo {
  const triangles = generator.geometry(generator.defaults);
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
  return { geometry: geo, scale, offset: [offset.x, offset.y, offset.z] };
}

function MorphScene({
  generators,
  intervalMs,
  fadeMs,
  rotationSpeed,
}: {
  generators: AnyGenerator[];
  intervalMs: number;
  fadeMs: number;
  rotationSpeed: number;
}) {
  const [index, setIndex] = useState(0);
  const groupRef = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const targetOpacity = useRef(1);

  const generator = generators[index];
  const fit = useMemo(() => fitGeometry(generator, 2), [generator]);

  useEffect(() => () => fit.geometry.dispose(), [fit]);

  // Re-trigger fade-in whenever the active generator changes.
  useEffect(() => {
    targetOpacity.current = 1;
  }, [index]);

  useEffect(() => {
    if (generators.length < 2) return;
    const id = window.setInterval(() => {
      targetOpacity.current = 0;
      window.setTimeout(() => {
        setIndex((i) => (i + 1) % generators.length);
      }, fadeMs);
    }, intervalMs);
    return () => {
      window.clearInterval(id);
    };
  }, [generators.length, intervalMs, fadeMs]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += rotationSpeed * delta;
    }
    if (matRef.current) {
      const o = matRef.current.opacity;
      matRef.current.opacity =
        o + (targetOpacity.current - o) * Math.min(1, delta * 6);
    }
  });

  return (
    <group scale={fit.scale} position={fit.offset}>
      <group ref={groupRef}>
        <mesh geometry={fit.geometry}>
          <meshStandardMaterial
            ref={matRef}
            color={generator.meta.accent}
            metalness={0.6}
            roughness={0.32}
            side={THREE.DoubleSide}
            transparent
            opacity={0}
          />
        </mesh>
      </group>
    </group>
  );
}

export interface GeneratorHeroProps {
  generators: AnyGenerator[];
  /** Outer container height. */
  height?: number | string;
  /** Time between morph swaps, in ms. */
  intervalMs?: number;
  /** Fade-out duration before the swap, in ms. */
  fadeMs?: number;
  /** Y-axis rotation speed, radians/second. */
  rotationSpeed?: number;
}

/**
 * Hero canvas that morphs through a list of generators, rotating slowly. Uses
 * each generator's actual `geometry(defaults)` so the landing page is a live
 * preview of what the tools produce.
 */
export function GeneratorHero({
  generators,
  height = 360,
  intervalMs = 6000,
  fadeMs = 700,
  rotationSpeed = 0.32,
}: GeneratorHeroProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || generators.length === 0) {
    return <div style={{ height, width: "100%" }} aria-hidden />;
  }

  return (
    <div style={{ height, width: "100%" }}>
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [2.1, 1.5, 2.4], fov: 38 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.5} />
        <hemisphereLight args={["#ffffff", "#444444", 0.35]} />
        <directionalLight position={[4, 6, 4]} intensity={1.2} />
        <directionalLight position={[-4, 2, -4]} intensity={0.5} />
        <MorphScene
          generators={generators}
          intervalMs={intervalMs}
          fadeMs={fadeMs}
          rotationSpeed={rotationSpeed}
        />
      </Canvas>
    </div>
  );
}
