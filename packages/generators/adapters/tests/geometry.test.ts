import { describe, expect, it } from "vitest";
import { generateAdapterTriangles } from "../src/geometry";
import { isPrintableMesh } from "@mintables/shared/lib/geometry/mesh-analysis";
import { DEFAULT_ADAPTER_CONFIG } from "../src/types";

describe("generateAdapterTriangles", () => {
  it("produces a printable straight adapter", () => {
    const triangles = generateAdapterTriangles(DEFAULT_ADAPTER_CONFIG);
    expect(isPrintableMesh(triangles)).toBe(true);
    expect(triangles.length).toBeGreaterThan(50);
  });

  it("produces a printable 90° elbow", () => {
    const triangles = generateAdapterTriangles({
      ...DEFAULT_ADAPTER_CONFIG,
      bendAngle: 90,
    });
    expect(isPrintableMesh(triangles)).toBe(true);
  });

  it("produces a printable round-to-square transition", () => {
    const triangles = generateAdapterTriangles({
      ...DEFAULT_ADAPTER_CONFIG,
      endB: {
        shape: "square",
        outerSize: 52,
        cornerRadius: 2,
        tubeWallThickness: 2,
      },
    });
    expect(isPrintableMesh(triangles)).toBe(true);
  });

  it("supports plug fit on one end", () => {
    const triangles = generateAdapterTriangles({
      ...DEFAULT_ADAPTER_CONFIG,
      endAFit: "plug",
    });
    expect(isPrintableMesh(triangles)).toBe(true);
  });
});
