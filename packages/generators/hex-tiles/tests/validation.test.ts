import { describe, expect, it } from "vitest";
import { DEFAULT_HEX_TILE_CONFIG } from "../src/types";
import { validateHexTileConfig } from "../src/validation";

describe("validateHexTileConfig", () => {
  it("accepts the support-free keyed single-magnet default", () => {
    const result = validateHexTileConfig(DEFAULT_HEX_TILE_CONFIG);

    expect(result.errors).toHaveLength(0);
  });

  it("rejects sockets that break through the bowl rim", () => {
    const result = validateHexTileConfig({
      ...DEFAULT_HEX_TILE_CONFIG,
      rimWidth: 5,
      magnetDepth: 4,
      magnetClearance: 0.3,
    });

    expect(
      result.errors.some((error) => error.code === "magnet_back_wall_thin"),
    ).toBe(true);
  });

  it("rejects a bowl depth that cuts through the configured floor", () => {
    const result = validateHexTileConfig({
      ...DEFAULT_HEX_TILE_CONFIG,
      bowlDepth: 14,
    });

    expect(
      result.errors.some((error) => error.code === "bowl_floor_thin"),
    ).toBe(true);
  });

  it("rejects magnets whose support-free roof reaches the top bevel", () => {
    const result = validateHexTileConfig({
      ...DEFAULT_HEX_TILE_CONFIG,
      bodyHeight: 12,
      magnetDiameter: 10,
    });

    expect(
      result.errors.some((error) => error.code === "magnet_roof_high"),
    ).toBe(true);
  });

  it("rejects a card rack that spreads beyond the safe interior", () => {
    const result = validateHexTileConfig({
      ...DEFAULT_HEX_TILE_CONFIG,
      purpose: "cards",
      cardSlotCount: 8,
      cardSlotSpacing: 16,
    });

    expect(result.errors.some((error) => error.code === "slot_span_wide")).toBe(
      true,
    );
  });

  it("keeps the elevated center cup above the outer dice trough", () => {
    const result = validateHexTileConfig({
      ...DEFAULT_HEX_TILE_CONFIG,
      purpose: "dice-orbit",
      orbitCenterRaise: 4,
      orbitCenterDepth: 6,
    });

    expect(
      result.errors.some((error) => error.code === "center_cup_below_ring"),
    ).toBe(true);
  });
});
