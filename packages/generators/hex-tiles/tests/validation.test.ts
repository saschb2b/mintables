import { describe, expect, it } from "vitest";
import {
  CUSTOM_TEXTURE_SAMPLE_COUNT,
  encodeCustomTextureSamples,
} from "../src/custom-height-map";
import { calculateHexTileLayout } from "../src/layout";
import { DEFAULT_HEX_TILE_CONFIG } from "../src/types";
import { validateHexTileConfig } from "../src/validation";

describe("validateHexTileConfig", () => {
  it("accepts the support-free keyed single-magnet default", () => {
    const result = validateHexTileConfig(DEFAULT_HEX_TILE_CONFIG);

    expect(result.errors).toHaveLength(0);
  });

  it("accepts the default captive 3 by 10 mm rod channel", () => {
    const result = validateHexTileConfig({
      ...DEFAULT_HEX_TILE_CONFIG,
      magnetMode: "captive",
    });

    expect(result.errors).toHaveLength(0);
  });

  it("rejects a captive opening that cannot retain the rod", () => {
    const result = validateHexTileConfig({
      ...DEFAULT_HEX_TILE_CONFIG,
      magnetMode: "captive",
      magnetLipOpening: 3,
    });

    expect(
      result.errors.some((error) => error.code === "magnet_lip_not_retaining"),
    ).toBe(true);
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

  it("accepts the default pair of card through channels", () => {
    const result = validateHexTileConfig({
      ...DEFAULT_HEX_TILE_CONFIG,
      purpose: "cards",
    });

    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it("rejects through channels that run past the flat edges", () => {
    const result = validateHexTileConfig({
      ...DEFAULT_HEX_TILE_CONFIG,
      purpose: "cards",
      cardSlotCount: 5,
      cardSlotSpacing: 22,
      cardSlotThroughCount: 4,
    });

    expect(
      result.errors.some((error) => error.code === "through_channel_off_flat"),
    ).toBe(true);
  });

  it("steps a through channel over a magnet socket rather than cutting it", () => {
    const config = {
      ...DEFAULT_HEX_TILE_CONFIG,
      purpose: "cards" as const,
      magnetMode: "paired" as const,
      cardSlotThroughCount: 2,
    };
    const result = validateHexTileConfig(config);

    expect(calculateHexTileLayout(config).channelLedgeReach).toBeGreaterThan(0);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it("warns when a through-channel count cannot be met symmetrically", () => {
    const result = validateHexTileConfig({
      ...DEFAULT_HEX_TILE_CONFIG,
      purpose: "cards",
      cardSlotCount: 4,
      cardSlotThroughCount: 3,
    });

    expect(result.errors).toHaveLength(0);
    expect(
      result.warnings.some(
        (warning) => warning.code === "through_count_rounded",
      ),
    ).toBe(true);
  });

  it("rejects card slots that leave no wall between them", () => {
    const result = validateHexTileConfig({
      ...DEFAULT_HEX_TILE_CONFIG,
      purpose: "cards",
      cardSlotWidth: 4,
      cardSlotSpacing: 4,
    });

    expect(
      result.errors.some((error) => error.code === "slot_walls_thin"),
    ).toBe(true);
  });

  it("rejects more bowl wells than the tile can hold", () => {
    const result = validateHexTileConfig({
      ...DEFAULT_HEX_TILE_CONFIG,
      acrossFlats: 60,
      rimWidth: 12,
      bowlWellCount: 3,
    });

    expect(
      result.errors.some((error) => error.code === "bowl_wells_crowded"),
    ).toBe(true);
  });

  it("accepts the default deck cradle without a word about its shelf", () => {
    const result = validateHexTileConfig({
      ...DEFAULT_HEX_TILE_CONFIG,
      purpose: "deck",
    });

    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it("warns when the magnet shelf eats into the card length", () => {
    const result = validateHexTileConfig({
      ...DEFAULT_HEX_TILE_CONFIG,
      purpose: "deck",
      magnetDiameter: 10,
      magnetDepth: 5,
      rimWidth: 8,
    });

    expect(result.errors).toHaveLength(0);
    expect(
      result.warnings.some(
        (warning) => warning.code === "through_channel_shelf",
      ),
    ).toBe(true);
  });

  it("rejects a cradle wider than the tile's flat edges", () => {
    const result = validateHexTileConfig({
      ...DEFAULT_HEX_TILE_CONFIG,
      purpose: "deck",
      deckCapacity: 150,
    });

    expect(
      result.errors.some((error) => error.code === "through_channel_off_flat"),
    ).toBe(true);
  });

  it("accepts the default pen holder quietly", () => {
    const result = validateHexTileConfig({
      ...DEFAULT_HEX_TILE_CONFIG,
      purpose: "pens",
    });

    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it("rejects a pen cup that overflows the tile interior", () => {
    const result = validateHexTileConfig({
      ...DEFAULT_HEX_TILE_CONFIG,
      purpose: "pens",
      penCupWidth: 88,
    });

    expect(
      result.errors.some((error) => error.code === "pen_cup_overflow"),
    ).toBe(true);
  });

  it("warns when the cells are too small for hemp leaves", () => {
    const result = validateHexTileConfig({
      ...DEFAULT_HEX_TILE_CONFIG,
      purpose: "pens",
      penLatticeColumns: 24,
    });

    expect(result.errors).toHaveLength(0);
    expect(
      result.warnings.some((warning) => warning.code === "pen_asanoha_dense"),
    ).toBe(true);
  });

  it("warns when lattice slats climb too shallowly to print", () => {
    const result = validateHexTileConfig({
      ...DEFAULT_HEX_TILE_CONFIG,
      purpose: "pens",
      penLatticeColumns: 6,
      penLatticeRows: 5,
    });

    expect(result.errors).toHaveLength(0);
    expect(
      result.warnings.some((warning) => warning.code === "pen_lattice_shallow"),
    ).toBe(true);
  });

  it("accepts the default rolling tray", () => {
    const result = validateHexTileConfig({
      ...DEFAULT_HEX_TILE_CONFIG,
      purpose: "rolling",
    });

    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it("rejects a rolling well deeper than its floor allows", () => {
    const result = validateHexTileConfig({
      ...DEFAULT_HEX_TILE_CONFIG,
      purpose: "rolling",
      rollDepth: 14,
    });

    expect(
      result.errors.some((error) => error.code === "roll_floor_thin"),
    ).toBe(true);
  });

  it("rejects rolling corners eaten by the draft and fillet", () => {
    const result = validateHexTileConfig({
      ...DEFAULT_HEX_TILE_CONFIG,
      purpose: "rolling",
      rollCornerRadius: 2,
      rollFloorFillet: 6,
      rollWallDraft: 10,
    });

    expect(
      result.errors.some((error) => error.code === "roll_corner_pinched"),
    ).toBe(true);
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

  it("lets a plain tile print thinner than a tile with a well", () => {
    const plain = {
      ...DEFAULT_HEX_TILE_CONFIG,
      purpose: "plain" as const,
      bodyHeight: 10,
      magnetDiameter: 5,
      magnetDepth: 2,
    };

    expect(validateHexTileConfig(plain).errors).toHaveLength(0);
    expect(
      validateHexTileConfig({ ...plain, purpose: "bowl" }).errors.some(
        (error) => error.code === "height_range",
      ),
    ).toBe(true);
  });

  it("does not fault a plain tile over the rim and floor it has none of", () => {
    const plain = {
      ...DEFAULT_HEX_TILE_CONFIG,
      purpose: "plain" as const,
      rimWidth: 5,
      magnetDepth: 5,
    };
    const bowlCodes = validateHexTileConfig({
      ...plain,
      purpose: "bowl" as const,
    }).errors.map((error) => error.code);

    expect(validateHexTileConfig(plain).errors).toHaveLength(0);
    expect(bowlCodes).toContain("magnet_back_wall_thin");
  });

  it("rejects surface relief deeper than the printable control range", () => {
    const result = validateHexTileConfig({
      ...DEFAULT_HEX_TILE_CONFIG,
      isSurfaceTextureEnabled: true,
      surfaceTextureDepth: 1.2,
    });

    expect(
      result.errors.some(
        (error) => error.code === "surface_texture_depth_range",
      ),
    ).toBe(true);
  });

  it("requires uploaded image data for a custom texture", () => {
    const result = validateHexTileConfig({
      ...DEFAULT_HEX_TILE_CONFIG,
      isSurfaceTextureEnabled: true,
      surfaceTexture: "custom",
    });

    expect(
      result.errors.some((error) => error.code === "custom_texture_missing"),
    ).toBe(true);
  });

  it("warns when a custom height map is too flat to print clearly", () => {
    const result = validateHexTileConfig({
      ...DEFAULT_HEX_TILE_CONFIG,
      isSurfaceTextureEnabled: true,
      surfaceTexture: "custom",
      customTextureData: encodeCustomTextureSamples(
        new Uint8Array(CUSTOM_TEXTURE_SAMPLE_COUNT).fill(128),
      ),
    });

    expect(result.errors).toHaveLength(0);
    expect(
      result.warnings.some((warning) => warning.code === "custom_texture_flat"),
    ).toBe(true);
  });
});
