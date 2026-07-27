import { describe, expect, it } from "vitest";
import { decodeHexTile } from "../src";
import { DEFAULT_HEX_TILE_CONFIG } from "../src/types";

describe("decodeHexTile", () => {
  it("hydrates every purpose-specific option", () => {
    const decoded = decodeHexTile({
      purpose: "dice-orbit",
      acrossFlats: 112,
      raiseHeight: 6,
      magnetMode: "single",
      bowlDepth: 11,
      bowlWellCount: 3,
      dividerAngle: 120,
      cardSlotCount: 7,
      orbitCenterDiameter: 40,
      orbitCenterRaise: 8,
      orbitCenterDepth: 5,
      isSurfaceTextureEnabled: true,
      surfaceTexture: "cobblestone",
      surfaceTextureDepth: 0.55,
      customTextureName: "my-stone.png",
      customTextureData: "encoded-height-map",
      isCustomTextureInverted: true,
    });

    expect(decoded).toMatchObject({
      purpose: "dice-orbit",
      acrossFlats: 112,
      raiseHeight: 6,
      magnetMode: "single",
      bowlDepth: 11,
      bowlWellCount: 3,
      dividerAngle: 120,
      cardSlotCount: 7,
      orbitCenterDiameter: 40,
      orbitCenterRaise: 8,
      orbitCenterDepth: 5,
      isSurfaceTextureEnabled: true,
      surfaceTexture: "cobblestone",
      surfaceTextureDepth: 0.55,
      customTextureName: "my-stone.png",
      customTextureData: "encoded-height-map",
      isCustomTextureInverted: true,
    });
  });

  it("hydrates a shared plain tile", () => {
    expect(
      decodeHexTile({ purpose: "plain", acrossFlats: 80, bodyHeight: 9 }),
    ).toMatchObject({ purpose: "plain", acrossFlats: 80, bodyHeight: 9 });
  });

  it("leaves relief saved before the edge choice inset as it was", () => {
    // A preset carrying a texture predates the choice, so it keeps its border.
    expect(
      decodeHexTile({
        isSurfaceTextureEnabled: true,
        surfaceTexture: "custom",
      }),
    ).toMatchObject({ isSurfaceTextureEdgeToEdge: false });
    // Anything else takes the new default, and a saved choice always wins.
    expect(decodeHexTile({ acrossFlats: 90 })).toMatchObject({
      isSurfaceTextureEdgeToEdge: true,
    });
    expect(
      decodeHexTile({
        isSurfaceTextureEnabled: true,
        isSurfaceTextureEdgeToEdge: true,
      }),
    ).toMatchObject({ isSurfaceTextureEdgeToEdge: true });
  });

  it("falls back from unknown variants without discarding numeric edits", () => {
    const decoded = decodeHexTile({
      purpose: "unknown",
      magnetMode: "glue-everything",
      surfaceTexture: "lava",
      dividerAngle: 90,
      acrossFlats: 108,
    });

    expect(decoded).toMatchObject({
      purpose: DEFAULT_HEX_TILE_CONFIG.purpose,
      magnetMode: DEFAULT_HEX_TILE_CONFIG.magnetMode,
      dividerAngle: DEFAULT_HEX_TILE_CONFIG.dividerAngle,
      surfaceTexture: DEFAULT_HEX_TILE_CONFIG.surfaceTexture,
      acrossFlats: 108,
    });
  });

  it("hydrates the captive rod mode and its socket dimensions", () => {
    const decoded = decodeHexTile({
      magnetMode: "captive",
      magnetRodDiameter: 3.2,
      magnetRodLength: 12,
      magnetRodClearance: 0.3,
      magnetLipOpening: 2.6,
      magnetLipDepth: 0.8,
    });

    expect(decoded).toMatchObject({
      magnetMode: "captive",
      magnetRodDiameter: 3.2,
      magnetRodLength: 12,
      magnetRodClearance: 0.3,
      magnetLipOpening: 2.6,
      magnetLipDepth: 0.8,
    });
  });

  it("carries a preset saved with the old divider flag over to two wells", () => {
    expect(decodeHexTile({ bowlDivider: true })).toMatchObject({
      bowlWellCount: 2,
    });
    expect(decodeHexTile({ bowlDivider: false })).toMatchObject({
      bowlWellCount: 1,
    });
    expect(
      decodeHexTile({ bowlDivider: true, bowlWellCount: 3 }),
    ).toMatchObject({ bowlWellCount: 3 });
  });

  it("rejects non-object preset data", () => {
    expect(decodeHexTile(null)).toBeNull();
    expect(decodeHexTile(["bowl"])).toBeNull();
  });
});
