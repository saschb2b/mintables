import { roundVertex } from "./mesh-utils";

export function createSTLBinary(triangles: number[][]): ArrayBuffer {
  const numTriangles = triangles.length;
  const bufferSize = 84 + numTriangles * 50;
  const buffer = new ArrayBuffer(bufferSize);
  const view = new DataView(buffer);

  const header = "TubeCraft STL - Watertight Mesh";
  for (let i = 0; i < 80; i++) {
    view.setUint8(i, i < header.length ? header.charCodeAt(i) : 0);
  }

  view.setUint32(80, numTriangles, true);

  let offset = 84;
  for (const tri of triangles) {
    const x1 = tri[0],
      y1 = tri[1],
      z1 = tri[2];
    const x2 = tri[3],
      y2 = tri[4],
      z2 = tri[5];
    const x3 = tri[6],
      y3 = tri[7],
      z3 = tri[8];

    const ux = x2 - x1,
      uy = y2 - y1,
      uz = z2 - z1;
    const vx = x3 - x1,
      vy = y3 - y1,
      vz = z3 - z1;

    let nx = uy * vz - uz * vy;
    let ny = uz * vx - ux * vz;
    let nz = ux * vy - uy * vx;
    const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
    nx /= len;
    ny /= len;
    nz /= len;

    view.setFloat32(offset, nx, true);
    offset += 4;
    view.setFloat32(offset, ny, true);
    offset += 4;
    view.setFloat32(offset, nz, true);
    offset += 4;

    for (let i = 0; i < 9; i++) {
      view.setFloat32(offset, tri[i], true);
      offset += 4;
    }

    view.setUint16(offset, 0, true);
    offset += 2;
  }

  return buffer;
}

export function parseTrianglesFromSTL(buffer: ArrayBuffer): number[][] {
  const view = new DataView(buffer);
  const numTriangles = view.getUint32(80, true);
  const triangles: number[][] = [];
  let offset = 84;
  for (let i = 0; i < numTriangles; i++) {
    offset += 12;
    const tri: number[] = [];
    for (let j = 0; j < 9; j++) {
      tri.push(roundVertex(view.getFloat32(offset, true)));
      offset += 4;
    }
    triangles.push(tri);
    offset += 2;
  }
  return triangles;
}
