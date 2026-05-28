import { describe, expect, it } from "vitest";
import { isPrintableMesh } from "@mintables/shared/lib/geometry/mesh-analysis";
import { generateLegCapTriangles } from "../src/geometry";
import {
  DEFAULT_OVAL_LEGCAP,
  DEFAULT_RECTANGULAR_LEGCAP,
  DEFAULT_ROUND_LEGCAP,
  DEFAULT_SQUARE_LEGCAP,
  type LegCapConfig,
} from "../src/types";

describe("generateLegCapTriangles", () => {
  it("produces a watertight mesh for every default shape", () => {
    for (const c of [
      DEFAULT_ROUND_LEGCAP,
      DEFAULT_SQUARE_LEGCAP,
      DEFAULT_RECTANGULAR_LEGCAP,
      DEFAULT_OVAL_LEGCAP,
    ] as LegCapConfig[]) {
      const triangles = generateLegCapTriangles(c);
      expect(triangles.length).toBeGreaterThan(0);
      expect(isPrintableMesh(triangles)).toBe(true);
    }
  });

  it("sits on the print bed (z = 0) and extends to floorThickness + capHeight", () => {
    const c: LegCapConfig = {
      ...DEFAULT_ROUND_LEGCAP,
      floorThickness: 2,
      capHeight: 20,
    };
    const triangles = generateLegCapTriangles(c);
    const zs = triangles.flatMap((tri) => [tri[2], tri[5], tri[8]]);
    expect(Math.min(...zs)).toBeCloseTo(0, 6);
    expect(Math.max(...zs)).toBeCloseTo(22, 6);
  });

  it("centers the cap horizontally around the origin", () => {
    const c: LegCapConfig = {
      ...DEFAULT_RECTANGULAR_LEGCAP,
      innerWidth: 40,
      innerHeight: 20,
      wallThickness: 2,
      cornerRadius: 0,
    };
    const triangles = generateLegCapTriangles(c);
    const xs = triangles.flatMap((tri) => [tri[0], tri[3], tri[6]]);
    const ys = triangles.flatMap((tri) => [tri[1], tri[4], tri[7]]);
    const outerW = c.innerWidth + 2 * c.wallThickness;
    const outerH = c.innerHeight + 2 * c.wallThickness;
    expect(Math.min(...xs)).toBeCloseTo(-outerW / 2, 5);
    expect(Math.max(...xs)).toBeCloseTo(outerW / 2, 5);
    expect(Math.min(...ys)).toBeCloseTo(-outerH / 2, 5);
    expect(Math.max(...ys)).toBeCloseTo(outerH / 2, 5);
  });

  it("opens the socket from z = floorThickness upward", () => {
    const c: LegCapConfig = {
      ...DEFAULT_ROUND_LEGCAP,
      floorThickness: 3,
      capHeight: 15,
      innerDiameter: 20,
      wallThickness: 2,
      fitClearance: 0,
      innerTaperEnabled: false,
    };
    const triangles = generateLegCapTriangles(c);
    // The inner socket wall has its low end at z = floorThickness. No inner-
    // wall vertex (radius ≈ innerDiameter/2 = 10) should sit below that.
    const innerR = c.innerDiameter / 2;
    const eps = 1e-3;
    for (const tri of triangles) {
      for (let i = 0; i < 3; i++) {
        const x = tri[i * 3];
        const y = tri[i * 3 + 1];
        const z = tri[i * 3 + 2];
        if (Math.abs(Math.hypot(x, y) - innerR) < eps) {
          // Inner-wall radius matches — must be at z ≥ floorThickness.
          expect(z).toBeGreaterThanOrEqual(c.floorThickness - eps);
        }
      }
    }
  });

  it("widens the inner socket toward the opening when taper is enabled", () => {
    const c: LegCapConfig = {
      ...DEFAULT_ROUND_LEGCAP,
      innerDiameter: 25,
      fitClearance: 0,
      innerTaperEnabled: true,
      innerTaper: 1.0,
      floorThickness: 2,
      capHeight: 20,
    };
    const triangles = generateLegCapTriangles(c);
    const zTop = c.floorThickness + c.capHeight;
    const zFloor = c.floorThickness;

    // Innermost radius at the top of the socket should equal innerDiameter/2
    // (= 12.5). At the socket floor it should be reduced by taper/2 (= 12.0).
    // Use a small tolerance — vertex coords are rounded to 6 decimals.
    const radiiAt = (zTarget: number) => {
      const out: number[] = [];
      for (const tri of triangles) {
        for (let i = 0; i < 3; i++) {
          if (Math.abs(tri[i * 3 + 2] - zTarget) < 1e-3) {
            out.push(Math.hypot(tri[i * 3], tri[i * 3 + 1]));
          }
        }
      }
      // Exclude the fan-face center (origin) which is at radius 0.
      return out.filter((r) => r > 0.1);
    };
    const topRadii = radiiAt(zTop);
    const floorRadii = radiiAt(zFloor);
    expect(Math.min(...topRadii)).toBeCloseTo(12.5, 2);
    expect(Math.min(...floorRadii)).toBeCloseTo(12.0, 2);
  });

  it("cuts a felt recess into the bottom face when enabled", () => {
    const c: LegCapConfig = {
      ...DEFAULT_ROUND_LEGCAP,
      floorThickness: 2,
      feltRecessEnabled: true,
      feltInset: 1.5,
      feltDepth: 1,
    };
    const triangles = generateLegCapTriangles(c);
    expect(isPrintableMesh(triangles)).toBe(true);
    // The recess ceiling sits at z = feltDepth = 1. Find triangles whose
    // three vertices are all at that z.
    const ceilingTri = triangles.find(
      (tri) => tri[2] === 1 && tri[5] === 1 && tri[8] === 1,
    );
    expect(ceilingTri).toBeDefined();
  });

  it("emits a plain disk on the bottom face when the felt toggle is off", () => {
    const c: LegCapConfig = {
      ...DEFAULT_ROUND_LEGCAP,
      feltRecessEnabled: false,
      feltDepth: 999, // ignored when toggle is off
    };
    const triangles = generateLegCapTriangles(c);
    // Bottom of the closed cap is at z = 0. No vertex should lie strictly
    // between 0 and the floor (i.e. inside the floor material).
    for (const tri of triangles) {
      for (let i = 0; i < 3; i++) {
        const z = tri[i * 3 + 2];
        expect(z === 0 || z >= c.floorThickness - 1e-6).toBe(true);
      }
    }
  });
});
