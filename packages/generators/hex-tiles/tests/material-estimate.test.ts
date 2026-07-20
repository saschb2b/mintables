import { describe, expect, it } from "vitest";
import {
  estimatePrintMaterial,
  MATERIAL_ESTIMATE_PROFILE,
  measureClosedMesh,
} from "../src/material-estimate";
import { generateHexTileTriangles } from "../src/geometry";
import { DEFAULT_HEX_TILE_CONFIG } from "../src/types";

describe("estimatePrintMaterial", () => {
  it("tracks the supplied 15 percent infill slicer result", () => {
    const legacyShallowBowl = {
      ...DEFAULT_HEX_TILE_CONFIG,
      bowlDepth: 5,
    };
    const estimate = estimatePrintMaterial(legacyShallowBowl);
    expect(estimate.materialVolumeMm3 / 1000).toBeCloseTo(34.295, 0);
    expect(estimate.plaGrams).toBeCloseTo(42.53, 0);
    expect(estimate.infillPercent).toBe(
      MATERIAL_ESTIMATE_PROFILE.infillFraction * 100,
    );
  });

  it("reports less material for a deeper bowl", () => {
    const shallow = estimatePrintMaterial({
      ...DEFAULT_HEX_TILE_CONFIG,
      bowlDepth: 5,
    });
    const deep = estimatePrintMaterial(DEFAULT_HEX_TILE_CONFIG);

    expect(deep.solidVolumeMm3).toBeLessThan(shallow.solidVolumeMm3);
    expect(deep.materialVolumeMm3).toBeLessThan(
      shallow.materialVolumeMm3 * 0.95,
    );
  });

  it("measures a closed generated mesh instead of a bounding box", () => {
    const triangles = generateHexTileTriangles(DEFAULT_HEX_TILE_CONFIG);
    const measures = measureClosedMesh(triangles);
    const boundingBoxVolume =
      (DEFAULT_HEX_TILE_CONFIG.acrossFlats / Math.sqrt(3)) *
      2 *
      DEFAULT_HEX_TILE_CONFIG.acrossFlats *
      DEFAULT_HEX_TILE_CONFIG.bodyHeight;

    expect(measures.solidVolumeMm3).toBeGreaterThan(0);
    expect(measures.solidVolumeMm3).toBeLessThan(boundingBoxVolume);
    expect(measures.surfaceAreaMm2).toBeGreaterThan(0);
  });

  it("accounts for recessed top texture in the slicer-style estimate", () => {
    const textured = estimatePrintMaterial({
      ...DEFAULT_HEX_TILE_CONFIG,
      purpose: "cards",
      isSurfaceTextureEnabled: true,
      surfaceTexture: "cobblestone",
    });
    const smoothCards = estimatePrintMaterial({
      ...DEFAULT_HEX_TILE_CONFIG,
      purpose: "cards",
    });

    expect(textured.solidVolumeMm3).toBeLessThan(smoothCards.solidVolumeMm3);
    expect(textured.surfaceAreaMm2).toBeGreaterThan(smoothCards.surfaceAreaMm2);
    expect(textured.materialVolumeMm3).not.toBe(smoothCards.materialVolumeMm3);
  });
});
