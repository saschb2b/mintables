"use client";

import { useEffect, useRef, type ComponentRef } from "react";
import { PerspectiveCamera, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useViewport } from "./viewport-context";

export interface SceneBounds {
  maxDimension: number;
  cameraDistance: number;
  orbitTarget: [number, number, number];
  minDistance?: number;
  maxDistance?: number;
  axis?: "y-up" | "z-up";
}

function applyViewPreset(
  preset: "iso" | "front" | "top" | "right",
  camera: THREE.PerspectiveCamera,
  controls: ComponentRef<typeof OrbitControls>,
  bounds: SceneBounds,
) {
  const d = bounds.cameraDistance;
  const [tx, ty, tz] = bounds.orbitTarget;
  controls.target.set(tx, ty, tz);

  switch (preset) {
    case "iso":
      camera.position.set(tx + d * 0.6, ty + d * 0.4, tz + d * 0.6);
      break;
    case "front":
      camera.position.set(tx, ty, tz + d);
      break;
    case "top":
      camera.position.set(tx, ty + d, tz + 0.001);
      break;
    case "right":
      camera.position.set(tx + d, ty, tz);
      break;
  }

  camera.lookAt(tx, ty, tz);
  controls.update();
}

export function PreviewSceneRig({ bounds }: { bounds: SceneBounds }) {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const controlsRef = useRef<ComponentRef<typeof OrbitControls>>(null);
  const placedCamera = useRef(false);
  const { viewRequest } = useViewport();

  useEffect(() => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (camera) {
      camera.far = bounds.maxDimension * 20;
      camera.updateProjectionMatrix();
      if (!placedCamera.current && controls) {
        applyViewPreset("iso", camera, controls, bounds);
        placedCamera.current = true;
      }
    }

    if (controls) {
      controls.target.set(...bounds.orbitTarget);
      controls.minDistance = bounds.minDistance ?? bounds.maxDimension * 0.5;
      controls.maxDistance = bounds.maxDistance ?? bounds.maxDimension * 5;
      controls.update();
    }
  }, [bounds]);

  useEffect(() => {
    if (!viewRequest) return;
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;
    applyViewPreset(viewRequest.preset, camera, controls, bounds);
  }, [viewRequest, bounds]);

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
