import type { AdapterConfig, FitType, TubeSpec } from "./types";
import {
  getAdapterOuterDimensions,
  getEffectiveBendRadius,
  getTubeOuterDimensions,
} from "./types";

/** Adapter-local coordinates (same space as `adapter-mesh.ts`, before scene offset). */
export interface AdapterEndLayout {
  center: [number, number, number];
  /** Unit vector pointing out of the adapter opening (tube mates outward). */
  outward: [number, number, number];
  tube: TubeSpec;
  fit: FitType;
  tubeOuter: { width: number; height: number };
  adapterOuter: { width: number; height: number };
}

export interface AdapterLayout {
  meshOffsetY: number;
  endA: AdapterEndLayout;
  endB: AdapterEndLayout;
  /** Where socket B begins (local), before the top socket extension. */
  bendEnd: [number, number, number];
  transitionLength: number;
  bendRadius: number;
  bendAngle: number;
  wallThickness: number;
  socketDepth: number;
  isReducer: boolean;
  /** World-space center for orbit target (after mesh Y offset). */
  boundsCenter: [number, number, number];
  boundsSize: number;
}

export function formatTubeEndSize(tube: TubeSpec): string {
  const dim = getTubeOuterDimensions(tube);
  if (tube.shape === "round") return `⌀${String(dim.width)}mm`;
  if (tube.shape === "square") return `${String(dim.width)}mm`;
  return `${String(dim.width)}×${String(dim.height)}mm`;
}

function unitVector(y: number, z: number): [number, number, number] {
  const len = Math.hypot(y, z) || 1;
  return [0, y / len, z / len];
}

function buildEndLayout(
  tube: TubeSpec,
  fit: FitType,
  clearance: number,
  wall: number,
): Omit<AdapterEndLayout, "center" | "outward"> {
  return {
    tube,
    fit,
    tubeOuter: getTubeOuterDimensions(tube),
    adapterOuter: getAdapterOuterDimensions(tube, clearance, wall, fit),
  };
}

export function getAdapterLayout(config: AdapterConfig): AdapterLayout {
  const bendRadius = getEffectiveBendRadius(config);
  const straightLength = config.bendAngle === 0 ? bendRadius : 0;
  const endAngleRad = (config.bendAngle * Math.PI) / 180;
  const socketDepth = config.socketDepth;
  const meshOffsetY = socketDepth;

  const endABase = buildEndLayout(
    config.endA,
    config.endAFit,
    config.socketClearance,
    config.wallThickness,
  );
  const endBBase = buildEndLayout(
    config.endB,
    config.endBFit,
    config.socketClearance,
    config.wallThickness,
  );

  const endA: AdapterEndLayout = {
    ...endABase,
    center: [0, -socketDepth, 0],
    outward: [0, -1, 0],
  };

  let bendEndY: number;
  let bendEndZ: number;
  if (config.bendAngle === 0) {
    bendEndY = straightLength;
    bendEndZ = 0;
  } else {
    bendEndY = bendRadius * Math.sin(endAngleRad);
    bendEndZ = bendRadius * (1 - Math.cos(endAngleRad));
  }

  const outward = unitVector(
    config.bendAngle > 0 ? Math.cos(endAngleRad) : 1,
    config.bendAngle > 0 ? Math.sin(endAngleRad) : 0,
  );

  const endB: AdapterEndLayout = {
    ...endBBase,
    center: [
      bendEndY * 0 + outward[0] * socketDepth + 0,
      bendEndY + outward[1] * socketDepth,
      bendEndZ + outward[2] * socketDepth,
    ],
    outward,
  };

  const dimA = endA.tubeOuter;
  const dimB = endB.tubeOuter;
  const isReducer =
    dimA.width !== dimB.width ||
    dimA.height !== dimB.height ||
    config.endA.shape !== config.endB.shape;

  const worldMinY = endA.center[1] + meshOffsetY;
  const worldMaxY = endB.center[1] + meshOffsetY;
  const worldMaxZ = Math.max(
    Math.abs(endA.center[2]),
    Math.abs(endB.center[2]),
    Math.abs(bendEndZ),
  );

  const boundsSize = Math.max(
    endA.adapterOuter.width,
    endA.adapterOuter.height,
    endB.adapterOuter.width,
    endB.adapterOuter.height,
    worldMaxY - worldMinY,
    worldMaxZ * 2 + endB.adapterOuter.width,
  );

  return {
    meshOffsetY,
    endA,
    endB,
    bendEnd: [0, bendEndY, bendEndZ],
    transitionLength: straightLength,
    bendRadius,
    bendAngle: config.bendAngle,
    wallThickness: config.wallThickness,
    socketDepth,
    isReducer,
    boundsCenter: [0, (worldMinY + worldMaxY) / 2, worldMaxZ / 2],
    boundsSize,
  };
}

/** Points along the bend centerline arc (local coords). */
export function getBendArcPoints(
  bendRadius: number,
  bendAngleDeg: number,
  segments = 24,
): [number, number, number][] {
  if (bendAngleDeg <= 0) return [];
  const endAngleRad = (bendAngleDeg * Math.PI) / 180;
  const points: [number, number, number][] = [];
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * endAngleRad;
    points.push([
      0,
      bendRadius * Math.sin(a),
      bendRadius * (1 - Math.cos(a)),
    ]);
  }
  return points;
}
