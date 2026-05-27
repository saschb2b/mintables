import { describe, expect, it } from "vitest";
import { isPrintableMesh } from "@mintables/shared/lib/geometry/mesh-analysis";
import { generateDividerTriangles } from "../src/geometry";
import { DEFAULT_DIVIDER_CONFIG } from "../src/types";

describe("generateDividerTriangles", () => {
  it("produces a watertight 12-triangle box for the default config", () => {
    const triangles = generateDividerTriangles(DEFAULT_DIVIDER_CONFIG);
    expect(triangles).toHaveLength(12);
    expect(isPrintableMesh(triangles)).toBe(true);
  });

  it("places the slab on the print bed (z = 0 .. thickness)", () => {
    const t = 1.6;
    const triangles = generateDividerTriangles({
      ...DEFAULT_DIVIDER_CONFIG,
      thickness: t,
    });
    const zs = triangles.flatMap((tri) => [tri[2], tri[5], tri[8]]);
    const minZ = Math.min(...zs);
    const maxZ = Math.max(...zs);
    expect(minZ).toBeCloseTo(0, 6);
    expect(maxZ).toBeCloseTo(t, 6);
  });

  it("centers the slab horizontally around the origin", () => {
    const w = 70;
    const h = 40;
    const triangles = generateDividerTriangles({
      thickness: 1,
      width: w,
      height: h,
    });
    const xs = triangles.flatMap((tri) => [tri[0], tri[3], tri[6]]);
    const ys = triangles.flatMap((tri) => [tri[1], tri[4], tri[7]]);
    expect(Math.min(...xs)).toBeCloseTo(-w / 2, 6);
    expect(Math.max(...xs)).toBeCloseTo(w / 2, 6);
    expect(Math.min(...ys)).toBeCloseTo(-h / 2, 6);
    expect(Math.max(...ys)).toBeCloseTo(h / 2, 6);
  });

  it("scales the mesh with thickness without breaking watertightness", () => {
    for (const thickness of [0.5, 1, 2, 5]) {
      const triangles = generateDividerTriangles({
        ...DEFAULT_DIVIDER_CONFIG,
        thickness,
      });
      expect(isPrintableMesh(triangles)).toBe(true);
    }
  });
});
