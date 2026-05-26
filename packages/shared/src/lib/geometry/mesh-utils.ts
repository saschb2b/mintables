import * as THREE from "three";

/** Round vertex coordinates to avoid floating-point seams in meshes. */
export function roundVertex(v: number, precision = 6): number {
  const factor = Math.pow(10, precision);
  return Math.round(v * factor) / factor;
}

export function addTriangle(
  triangles: number[][],
  x1: number,
  y1: number,
  z1: number,
  x2: number,
  y2: number,
  z2: number,
  x3: number,
  y3: number,
  z3: number,
): void {
  const rx1 = roundVertex(x1);
  const ry1 = roundVertex(y1);
  const rz1 = roundVertex(z1);
  const rx2 = roundVertex(x2);
  const ry2 = roundVertex(y2);
  const rz2 = roundVertex(z2);
  const rx3 = roundVertex(x3);
  const ry3 = roundVertex(y3);
  const rz3 = roundVertex(z3);

  const ux = rx2 - rx1;
  const uy = ry2 - ry1;
  const uz = rz2 - rz1;
  const vx = rx3 - rx1;
  const vy = ry3 - ry1;
  const vz = rz3 - rz1;
  const nx = uy * vz - uz * vy;
  const ny = uz * vx - ux * vz;
  const nz = ux * vy - uy * vx;
  const area = Math.sqrt(nx * nx + ny * ny + nz * nz);
  if (area < 1e-10) return;

  triangles.push([rx1, ry1, rz1, rx2, ry2, rz2, rx3, ry3, rz3]);
}

export type AxisConvention = "z-up" | "y-up";

/**
 * Convert triangle soup to Three.js BufferGeometry. Tube CAD uses z-up
 * (x,y in radius plane, z = height); adapters use y-up already.
 */
export function trianglesToBufferGeometry(
  triangles: number[][],
  axis: AxisConvention = "z-up",
): THREE.BufferGeometry {
  const positions: number[] = [];
  const indices: number[] = [];

  const vertexKey = new Map<string, number>();
  let vertexCount = 0;

  for (const tri of triangles) {
    const faceIndices: number[] = [];
    for (let i = 0; i < 3; i++) {
      const sx = tri[i * 3];
      const sy = tri[i * 3 + 1];
      const sz = tri[i * 3 + 2];
      const px = sx;
      const py = axis === "z-up" ? sz : sy;
      const pz = axis === "z-up" ? sy : sz;
      const key = `${String(px)},${String(py)},${String(pz)}`;
      let idx = vertexKey.get(key);
      if (idx === undefined) {
        idx = vertexCount++;
        vertexKey.set(key, idx);
        positions.push(px, py, pz);
      }
      faceIndices.push(idx);
    }
    indices.push(faceIndices[0], faceIndices[1], faceIndices[2]);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}
