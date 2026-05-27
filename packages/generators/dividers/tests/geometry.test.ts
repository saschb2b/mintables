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
      taperEnabled: false,
      bottomWidth: w,
      labelEnabled: false,
      labelWidth: 40,
      labelHeight: 15,
      labelDepth: 0.4,
      labelPosition: "top",
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
      taperEnabled: false,
      bottomWidth: w,
      labelEnabled: false,
      labelWidth: 40,
      labelHeight: 15,
      labelDepth: 0.4,
      labelPosition: "top",
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
      taperEnabled: false,
      bottomWidth: 40,
      labelEnabled: false,
      labelWidth: 40,
      labelHeight: 15,
      labelDepth: 0.4,
      labelPosition: "top",
    });
    const stadium = generateDividerTriangles({
      thickness: 1,
      width: 40,
      height: 30,
      cornerRadius: 15,
      taperEnabled: false,
      bottomWidth: 40,
      labelEnabled: false,
      labelWidth: 40,
      labelHeight: 15,
      labelDepth: 0.4,
      labelPosition: "top",
    });
    expect(isPrintableMesh(oversized)).toBe(true);
    expect(oversized.length).toBe(stadium.length);
  });

  it("builds a watertight trapezoid when taper is enabled", () => {
    const triangles = generateDividerTriangles({
      ...DEFAULT_DIVIDER_CONFIG,
      taperEnabled: true,
      bottomWidth: 50,
    });
    expect(isPrintableMesh(triangles)).toBe(true);
    // Geometry convention: the divider's "top" edge (the wider top width)
    // sits at source y = -halfH so it projects toward the visual top of the
    // ISO camera; the "bottom" edge (narrower bottomWidth) sits at +halfH.
    const yLow = triangles.flatMap((tri) => [
      tri[1] <= -17.4 ? tri[0] : Number.POSITIVE_INFINITY,
      tri[4] <= -17.4 ? tri[3] : Number.POSITIVE_INFINITY,
      tri[7] <= -17.4 ? tri[6] : Number.POSITIVE_INFINITY,
    ]);
    const yHigh = triangles.flatMap((tri) => [
      tri[1] >= 17.4 ? tri[0] : Number.NEGATIVE_INFINITY,
      tri[4] >= 17.4 ? tri[3] : Number.NEGATIVE_INFINITY,
      tri[7] >= 17.4 ? tri[6] : Number.NEGATIVE_INFINITY,
    ]);
    // y = -halfH carries the top (wider) edge → 65 / 2
    expect(Math.max(...yLow.filter(Number.isFinite))).toBeCloseTo(32.5, 5);
    // y = +halfH carries the bottom (narrower) edge → 50 / 2
    expect(Math.max(...yHigh)).toBeCloseTo(25, 5);
  });

  it("ignores bottomWidth when taperEnabled is false", () => {
    const sharp = generateDividerTriangles({
      ...DEFAULT_DIVIDER_CONFIG,
      taperEnabled: false,
      bottomWidth: 30, // would taper hard if applied
    });
    const reference = generateDividerTriangles(DEFAULT_DIVIDER_CONFIG);
    expect(sharp).toEqual(reference);
  });

  it("cuts a label pocket into the top face when enabled", () => {
    const triangles = generateDividerTriangles({
      ...DEFAULT_DIVIDER_CONFIG,
      thickness: 2,
      labelEnabled: true,
      labelWidth: 30,
      labelHeight: 10,
      labelDepth: 0.5,
    });
    expect(isPrintableMesh(triangles)).toBe(true);

    // Top face (z = thickness) should now show the rectangular hole — meaning
    // there are vertices at z = thickness whose XY fall exactly on the pocket
    // perimeter (15, ±5) and (-15, ±5).
    const zs = triangles.flatMap((tri) => [tri[2], tri[5], tri[8]]);
    const maxZ = Math.max(...zs);
    expect(maxZ).toBeCloseTo(2, 6);

    // Pocket floor should sit at z = thickness - depth = 1.5.
    const pocketFloorTri = triangles.find(
      (tri) => tri[2] === 1.5 && tri[5] === 1.5 && tri[8] === 1.5,
    );
    expect(pocketFloorTri).toBeDefined();
  });

  it("ignores labelEnabled details when the toggle is off", () => {
    const off = generateDividerTriangles({
      ...DEFAULT_DIVIDER_CONFIG,
      labelEnabled: false,
      labelWidth: 30,
      labelHeight: 10,
      labelDepth: 0.5,
    });
    const reference = generateDividerTriangles(DEFAULT_DIVIDER_CONFIG);
    expect(off).toEqual(reference);
  });

  it("shifts the pocket along y when labelPosition is top vs bottom", () => {
    const base = {
      ...DEFAULT_DIVIDER_CONFIG,
      thickness: 2,
      labelEnabled: true,
      labelWidth: 30,
      labelHeight: 10,
      labelDepth: 0.5,
    } as const;
    const top = generateDividerTriangles({ ...base, labelPosition: "top" });
    const bottom = generateDividerTriangles({
      ...base,
      labelPosition: "bottom",
    });
    // Pocket floor (z = thickness - depth = 1.5) carries the pocket's own
    // bounding box. Grab the floor triangles and check their y centroid sign.
    const pocketYs = (tris: number[][]) =>
      tris
        .filter((tri) => tri[2] === 1.5 && tri[5] === 1.5 && tri[8] === 1.5)
        .flatMap((tri) => [tri[1], tri[4], tri[7]]);
    const topYs = pocketYs(top);
    const bottomYs = pocketYs(bottom);
    // Top position pulls the pocket toward source y = -halfH (which is the
    // divider's visible top in the default view), so every pocket-floor y
    // should be negative; bottom position mirrors it.
    expect(Math.max(...topYs)).toBeLessThan(0);
    expect(Math.min(...bottomYs)).toBeGreaterThan(0);
  });

  it("centers the pocket on origin when labelPosition is 'center'", () => {
    const triangles = generateDividerTriangles({
      ...DEFAULT_DIVIDER_CONFIG,
      thickness: 2,
      labelEnabled: true,
      labelWidth: 30,
      labelHeight: 10,
      labelDepth: 0.5,
      labelPosition: "center",
    });
    const floorYs = triangles
      .filter((tri) => tri[2] === 1.5 && tri[5] === 1.5 && tri[8] === 1.5)
      .flatMap((tri) => [tri[1], tri[4], tri[7]]);
    // Pocket of labelHeight=10 centered on origin spans [-5, 5].
    expect(Math.max(...floorYs)).toBeCloseTo(5, 6);
    expect(Math.min(...floorYs)).toBeCloseTo(-5, 6);
  });
});
