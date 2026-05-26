"use client";

import * as THREE from "three";
import type { AdapterEndLayout } from "./layout";

const GHOST_COLOR = "#60a5fa";
const GHOST_OPACITY = 0.28;

function orientedCylinderProps(
  from: [number, number, number],
  to: [number, number, number],
) {
  const fromVec = new THREE.Vector3(...from);
  const toVec = new THREE.Vector3(...to);
  const dir = toVec.clone().sub(fromVec);
  const length = dir.length();
  const position = fromVec.clone().add(toVec).multiplyScalar(0.5);
  const quaternion = new THREE.Quaternion();
  if (length > 1e-6) {
    quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir.normalize(),
    );
  }
  return { position, quaternion, length };
}

function RoundGhost({
  end,
  extension,
}: {
  end: AdapterEndLayout;
  extension: number;
}) {
  const from: [number, number, number] = end.center;
  const to: [number, number, number] = [
    end.center[0] + end.outward[0] * extension,
    end.center[1] + end.outward[1] * extension,
    end.center[2] + end.outward[2] * extension,
  ];
  const { position, quaternion, length } = orientedCylinderProps(from, to);
  const radius = end.tubeOuter.width / 2;

  if (length < 0.1) return null;

  return (
    <mesh position={position} quaternion={quaternion}>
      <cylinderGeometry args={[radius, radius, length, 32, 1, true]} />
      <meshBasicMaterial
        color={GHOST_COLOR}
        wireframe
        transparent
        opacity={GHOST_OPACITY}
        depthWrite={false}
      />
    </mesh>
  );
}

function BoxGhost({
  end,
  extension,
}: {
  end: AdapterEndLayout;
  extension: number;
}) {
  const from: [number, number, number] = end.center;
  const to: [number, number, number] = [
    end.center[0] + end.outward[0] * extension,
    end.center[1] + end.outward[1] * extension,
    end.center[2] + end.outward[2] * extension,
  ];
  const { position, quaternion, length } = orientedCylinderProps(from, to);
  const w = end.tubeOuter.width;
  const h = end.tubeOuter.height;

  if (length < 0.1) return null;

  return (
    <mesh position={position} quaternion={quaternion}>
      <boxGeometry args={[w, length, h]} />
      <meshBasicMaterial
        color={GHOST_COLOR}
        wireframe
        transparent
        opacity={GHOST_OPACITY}
        depthWrite={false}
      />
    </mesh>
  );
}

export function AdapterGhostTubes({
  endA,
  endB,
  socketDepth,
}: {
  endA: AdapterEndLayout;
  endB: AdapterEndLayout;
  socketDepth: number;
}) {
  const extension = Math.min(50, Math.max(20, socketDepth * 1.5));

  return (
    <group>
      {endA.tube.shape === "round" ? (
        <RoundGhost end={endA} extension={extension} />
      ) : (
        <BoxGhost end={endA} extension={extension} />
      )}
      {endB.tube.shape === "round" ? (
        <RoundGhost end={endB} extension={extension} />
      ) : (
        <BoxGhost end={endB} extension={extension} />
      )}
    </group>
  );
}
