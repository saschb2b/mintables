import { describe, expect, it } from "vitest";
import { generateTubeTriangles } from "./tube-mesh";
import {
  analyzeTriangles,
  isPrintableMesh,
  triangleArea,
} from "./mesh-analysis";
import {
  DEFAULT_ROUND_CONFIG,
  DEFAULT_SQUARE_CONFIG,
  DEFAULT_RECTANGULAR_CONFIG,
} from "@/lib/tube-types";

describe("generateTubeTriangles", () => {
  it("produces a printable round tube mesh", () => {
    const triangles = generateTubeTriangles(DEFAULT_ROUND_CONFIG);
    expect(isPrintableMesh(triangles)).toBe(true);
    expect(triangles.length).toBeGreaterThan(100);
  });

  it("produces printable square and rectangular meshes", () => {
    expect(isPrintableMesh(generateTubeTriangles(DEFAULT_SQUARE_CONFIG))).toBe(
      true,
    );
    expect(
      isPrintableMesh(generateTubeTriangles(DEFAULT_RECTANGULAR_CONFIG)),
    ).toBe(true);
  });

  it("produces a printable mesh with top chamfer", () => {
    const chamfer = generateTubeTriangles({
      ...DEFAULT_ROUND_CONFIG,
      topCut: { type: "chamfer", angle: 45, depth: 2 },
    });
    expect(isPrintableMesh(chamfer)).toBe(true);
    expect(chamfer.length).toBeGreaterThan(0);
  });

  it("includes press-fit flare geometry", () => {
    const triangles = generateTubeTriangles({
      ...DEFAULT_ROUND_CONFIG,
      flare: {
        ...DEFAULT_ROUND_CONFIG.flare,
        enabled: true,
        leadInChamfer: true,
        stopShoulder: true,
        antiRotation: true,
        antiRotationType: "key",
      },
    });
    expect(isPrintableMesh(triangles)).toBe(true);
    expect(triangles.length).toBeGreaterThan(
      generateTubeTriangles(DEFAULT_ROUND_CONFIG).length,
    );
  });

  it("produces a printable clamshell mesh", () => {
    const triangles = generateTubeTriangles({
      ...DEFAULT_ROUND_CONFIG,
      clamshell: { ...DEFAULT_ROUND_CONFIG.clamshell, enabled: true },
      topCut: { type: "flat" },
      bottomCut: { type: "flat" },
    });
    expect(isPrintableMesh(triangles)).toBe(true);
  });

  it("mesh height matches configured tube length", () => {
    const length = 150;
    const triangles = generateTubeTriangles({
      ...DEFAULT_ROUND_CONFIG,
      length,
    });
    const { bounds } = analyzeTriangles(triangles);
    expect(bounds.minZ).toBeGreaterThanOrEqual(-0.01);
    expect(bounds.maxZ).toBeLessThanOrEqual(length + 0.01);
  });
});

describe("triangleArea", () => {
  it("returns zero for degenerate triangles", () => {
    expect(triangleArea([0, 0, 0, 0, 0, 0, 0, 0, 0])).toBe(0);
  });

  it("returns positive area for valid triangles", () => {
    expect(triangleArea([0, 0, 0, 1, 0, 0, 0, 1, 0])).toBeGreaterThan(0);
  });
});
