import { describe, expect, it } from "vitest";
import { isPrintableMesh } from "@mintables/shared/lib/geometry/mesh-analysis";
import { generateDividerTriangles } from "../src/geometry";
import { DEFAULT_DIVIDER_CONFIG } from "../src/types";

describe("generateDividerTriangles", () => {
  it("produces a watertight 16-triangle box for the default sharp-corner config", () => {
    // Fan-triangulated top/bottom (4 tris each) + 4 side quads (2 tris each).
    const triangles = generateDividerTriangles(DEFAULT_DIVIDER_CONFIG);
    expect(triangles).toHaveLength(16);
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
      cornerRadius: 0,
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

  it("produces a watertight mesh with rounded corners", () => {
    const triangles = generateDividerTriangles({
      ...DEFAULT_DIVIDER_CONFIG,
      cornerRadius: 5,
    });
    expect(isPrintableMesh(triangles)).toBe(true);
    // A rounded slab has many more tris than the 12-tri sharp box.
    expect(triangles.length).toBeGreaterThan(40);
  });

  it("keeps every vertex inside the bounding rectangle when rounded", () => {
    const w = 80;
    const h = 50;
    const r = 12;
    const triangles = generateDividerTriangles({
      thickness: 2,
      width: w,
      height: h,
      cornerRadius: r,
    });
    const xs = triangles.flatMap((tri) => [tri[0], tri[3], tri[6]]);
    const ys = triangles.flatMap((tri) => [tri[1], tri[4], tri[7]]);
    // Floating-point rounding can nudge a value past the half-side by a hair.
    const eps = 1e-5;
    expect(Math.max(...xs)).toBeLessThanOrEqual(w / 2 + eps);
    expect(Math.min(...xs)).toBeGreaterThanOrEqual(-w / 2 - eps);
    expect(Math.max(...ys)).toBeLessThanOrEqual(h / 2 + eps);
    expect(Math.min(...ys)).toBeGreaterThanOrEqual(-h / 2 - eps);
  });

  it("clamps an oversized corner radius to half the shorter side (stadium)", () => {
    const oversized = generateDividerTriangles({
      thickness: 1,
      width: 40,
      height: 30,
      cornerRadius: 999,
    });
    const stadium = generateDividerTriangles({
      thickness: 1,
      width: 40,
      height: 30,
      cornerRadius: 15,
    });
    expect(isPrintableMesh(oversized)).toBe(true);
    expect(oversized.length).toBe(stadium.length);
  });
});
