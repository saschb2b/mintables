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
      bowlDivider: true,
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
      bowlDivider: true,
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

  it("rejects non-object preset data", () => {
    expect(decodeHexTile(null)).toBeNull();
    expect(decodeHexTile(["bowl"])).toBeNull();
  });
});
