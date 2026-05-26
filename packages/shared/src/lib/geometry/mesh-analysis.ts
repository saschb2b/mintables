/** Minimum triangle area (mm²) — smaller faces are treated as degenerate. */
export const MIN_TRIANGLE_AREA = 1e-8;

export interface MeshAnalysis {
  triangleCount: number;
  minTriangleArea: number;
  hasDegenerateTriangles: boolean;
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    minZ: number;
    maxZ: number;
  };
}

export function triangleArea(tri: number[]): number {
  const ux = tri[3] - tri[0];
  const uy = tri[4] - tri[1];
  const uz = tri[5] - tri[2];
  const vx = tri[6] - tri[0];
  const vy = tri[7] - tri[1];
  const vz = tri[8] - tri[2];
  const nx = uy * vz - uz * vy;
  const ny = uz * vx - ux * vz;
  const nz = ux * vy - uy * vx;
  return Math.sqrt(nx * nx + ny * ny + nz * nz) * 0.5;
}

export function analyzeTriangles(triangles: number[][]): MeshAnalysis {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;
  let minTriangleArea = Infinity;
  let hasDegenerateTriangles = false;

  for (const tri of triangles) {
    const area = triangleArea(tri);
    if (area < MIN_TRIANGLE_AREA) hasDegenerateTriangles = true;
    if (area < minTriangleArea) minTriangleArea = area;

    for (let i = 0; i < 9; i += 3) {
      const x = tri[i];
      const y = tri[i + 1];
      const z = tri[i + 2];
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      if (z < minZ) minZ = z;
      if (z > maxZ) maxZ = z;
    }
  }

  if (triangles.length === 0) {
    minTriangleArea = 0;
    minX = maxX = minY = maxY = minZ = maxZ = 0;
  }

  return {
    triangleCount: triangles.length,
    minTriangleArea,
    hasDegenerateTriangles,
    bounds: { minX, maxX, minY, maxY, minZ, maxZ },
  };
}

export function isPrintableMesh(triangles: number[][]): boolean {
  const analysis = analyzeTriangles(triangles);
  return analysis.triangleCount > 0 && !analysis.hasDegenerateTriangles;
}
