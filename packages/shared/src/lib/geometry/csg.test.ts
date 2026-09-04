import { beforeAll, describe, expect, it } from "vitest";
import {
  CsgScope,
  box,
  cylinderZ,
  extrudeX,
  extrudeY,
  extrudeZ,
  getCsg,
  isCsgReady,
  loadCsg,
  manifoldToTriangles,
  roundedRectPolygon,
  withCsgScope,
} from "./csg";
import { isPrintableMesh } from "./mesh-analysis";

function edgeUseCounts(triangles: number[][]): number[] {
  const counts = new Map<string, number>();
  for (const t of triangles) {
    const v = [
      `${String(t[0])},${String(t[1])},${String(t[2])}`,
      `${String(t[3])},${String(t[4])},${String(t[5])}`,
      `${String(t[6])},${String(t[7])},${String(t[8])}`,
    ];
    for (const [a, b] of [
      [v[0], v[1]],
      [v[1], v[2]],
      [v[2], v[0]],
    ]) {
      const key = a < b ? `${a}|${b}` : `${b}|${a}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  return [...counts.values()];
}

function signedVolume(triangles: number[][]): number {
  let sum = 0;
  for (const t of triangles) {
    sum +=
      (t[0] * (t[4] * t[8] - t[5] * t[7]) -
        t[3] * (t[1] * t[8] - t[2] * t[7]) +
        t[6] * (t[1] * t[5] - t[2] * t[4])) /
      6;
  }
  return sum;
}

beforeAll(async () => {
  await loadCsg();
});

describe("csg kernel", () => {
  it("reports readiness after loading", () => {
    expect(isCsgReady()).toBe(true);
    expect(getCsg().Manifold).toBeDefined();
  });

  it("extrudes along each axis into the expected bounds", () => {
    withCsgScope((scope) => {
      const square: [number, number][] = [
        [0, 0],
        [2, 0],
        [2, 3],
        [0, 3],
      ];
      const z = extrudeZ(scope, square, 5, 9).boundingBox();
      expect(z.min).toEqual([0, 0, 5]);
      expect(z.max).toEqual([2, 3, 9]);

      const y = extrudeY(scope, square, 5, 9).boundingBox();
      expect(y.min).toEqual([0, 5, 0]);
      expect(y.max).toEqual([2, 9, 3]);

      const x = extrudeX(scope, square, 5, 9).boundingBox();
      expect(x.min).toEqual([5, 0, 0]);
      expect(x.max).toEqual([9, 2, 3]);
    });
  });

  it("accepts clockwise outlines", () => {
    withCsgScope((scope) => {
      const cw: [number, number][] = [
        [0, 0],
        [0, 3],
        [2, 3],
        [2, 0],
      ];
      expect(extrudeZ(scope, cw, 0, 1).volume()).toBeCloseTo(6, 5);
    });
  });

  it("converts a boolean result to a watertight, printable soup", () => {
    const triangles = withCsgScope((scope) => {
      const plate = box(scope, -30, 0, 0, 30, 3, 40);
      const hole = cylinderZ(scope, 4, -1, 50, 32, 10, 1.5);
      const holed = scope.keep(plate.subtract(hole));
      const boss = cylinderZ(scope, 6, 0, 3, 32, -12, 1.5);
      const result = scope.keep(holed.add(boss));
      return manifoldToTriangles(result);
    });
    expect(triangles.length).toBeGreaterThan(12);
    expect(isPrintableMesh(triangles)).toBe(true);
    expect(edgeUseCounts(triangles).every((n) => n === 2)).toBe(true);
    expect(signedVolume(triangles)).toBeGreaterThan(0);
  });

  it("frees tracked objects on dispose", () => {
    const scope = new CsgScope();
    const solid = box(scope, 0, 0, 0, 1, 1, 1);
    expect(solid.volume()).toBeCloseTo(1, 6);
    scope.dispose();
    expect(() => solid.volume()).toThrow();
  });

  it("builds rounded rectangles with the requested corners", () => {
    const full = roundedRectPolygon(20, 10, 3);
    const flatBottom = roundedRectPolygon(20, 10, 3, { roundBottom: false });
    expect(full.length).toBe(4 * 9);
    expect(flatBottom.length).toBe(2 * 9 + 2);
    expect(Math.min(...flatBottom.map((p) => p[1]))).toBeCloseTo(-5, 9);
    expect(flatBottom.some((p) => p[0] === 10 && p[1] === -5)).toBe(true);
  });
});
