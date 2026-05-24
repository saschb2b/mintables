"use client";

import { useEffect, useRef, type ComponentRef } from "react";
import { PerspectiveCamera, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

export interface SceneBounds {
  maxDimension: number;
  cameraDistance: number;
  orbitTarget: [number, number, number];
  minDistance?: number;
  maxDistance?: number;
}

export function PreviewSceneRig({ bounds }: { bounds: SceneBounds }) {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const controlsRef = useRef<ComponentRef<typeof OrbitControls>>(null);
  const placedCamera = useRef(false);

  useEffect(() => {
    const camera = cameraRef.current;
    if (camera) {
      camera.far = bounds.maxDimension * 20;
      camera.updateProjectionMatrix();
      if (!placedCamera.current) {
        const d = bounds.cameraDistance;
        camera.position.set(d * 0.6, d * 0.4, d * 0.6);
        placedCamera.current = true;
      }
    }

    const controls = controlsRef.current;
    if (controls) {
      controls.target.set(...bounds.orbitTarget);
      controls.minDistance = bounds.minDistance ?? bounds.maxDimension * 0.5;
      controls.maxDistance = bounds.maxDistance ?? bounds.maxDimension * 5;
      controls.update();
    }
  }, [bounds]);

  const d = bounds.cameraDistance;

  return (
    <>
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        position={[d * 0.6, d * 0.4, d * 0.6]}
        fov={45}
        near={0.1}
        far={bounds.maxDimension * 20}
      />
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.05}
        target={bounds.orbitTarget}
      />
    </>
  );
}
