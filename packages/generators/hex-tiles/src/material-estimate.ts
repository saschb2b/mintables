import { generateHexTileTriangles } from "./geometry";
import type { HexTileConfig } from "./types";

export const MATERIAL_ESTIMATE_PROFILE = {
  infillFraction: 0.15,
  wallThickness: 1.2,
  horizontalSkinThickness: 0.75,
  shellOverlapFactor: 0.9,
  processAllowance: 1.03,
  plaDensityGramsPerCm3: 1.24,
} as const;

export interface MaterialEstimate {
  solidVolumeMm3: number;
  surfaceAreaMm2: number;
  materialVolumeMm3: number;
  plaGrams: number;
  infillPercent: number;
}

interface MeshMeasures {
  solidVolumeMm3: number;
  surfaceAreaMm2: number;
  horizontalProjectedAreaMm2: number;
  verticalProjectedAreaMm2: number;
}

export function measureClosedMesh(triangles: number[][]): MeshMeasures {
  let signedVolume = 0;
  let surfaceArea = 0;
  let horizontalProjectedArea = 0;
  let verticalProjectedArea = 0;

  for (const triangle of triangles) {
    const [ax, ay, az, bx, by, bz, cx, cy, cz] = triangle;
    const ux = bx - ax;
    const uy = by - ay;
    const uz = bz - az;
    const vx = cx - ax;
    const vy = cy - ay;
    const vz = cz - az;
    const nx = uy * vz - uz * vy;
    const ny = uz * vx - ux * vz;
    const nz = ux * vy - uy * vx;

    surfaceArea += Math.hypot(nx, ny, nz) / 2;
    horizontalProjectedArea += Math.abs(nz) / 2;
    verticalProjectedArea += Math.hypot(nx, ny) / 2;
    signedVolume +=
      (ax * (by * cz - bz * cy) -
        ay * (bx * cz - bz * cx) +
        az * (bx * cy - by * cx)) /
      6;
  }

  return {
    solidVolumeMm3: Math.abs(signedVolume),
    surfaceAreaMm2: surfaceArea,
    horizontalProjectedAreaMm2: horizontalProjectedArea,
    verticalProjectedAreaMm2: verticalProjectedArea,
  };
}

export function estimatePrintMaterial(config: HexTileConfig): MaterialEstimate {
  const measures = measureClosedMesh(generateHexTileTriangles(config));
  const profile = MATERIAL_ESTIMATE_PROFILE;
  const rawShellVolume =
    (measures.verticalProjectedAreaMm2 * profile.wallThickness +
      measures.horizontalProjectedAreaMm2 * profile.horizontalSkinThickness) *
    profile.shellOverlapFactor;
  const shellVolume = Math.min(measures.solidVolumeMm3, rawShellVolume);
  const sparseCoreVolume = Math.max(0, measures.solidVolumeMm3 - shellVolume);
  const materialVolumeMm3 = Math.min(
    measures.solidVolumeMm3,
    (shellVolume + sparseCoreVolume * profile.infillFraction) *
      profile.processAllowance,
  );

  return {
    solidVolumeMm3: measures.solidVolumeMm3,
    surfaceAreaMm2: measures.surfaceAreaMm2,
    materialVolumeMm3,
    plaGrams: (materialVolumeMm3 / 1000) * profile.plaDensityGramsPerCm3,
    infillPercent: profile.infillFraction * 100,
  };
}
