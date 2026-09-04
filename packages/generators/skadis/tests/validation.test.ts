import { describe, expect, it } from "vitest";
import { SKADIS_STARTERS } from "../src/starters";
import {
  DEFAULT_CUP,
  DEFAULT_MOUNT,
  DEFAULT_RACK,
  DEFAULT_SKADIS_CONFIG,
  DEFAULT_SLOT,
  DEFAULT_TRAY,
  type SkadisConfig,
} from "../src/types";
import { validateSkadisConfig } from "../src/validation";

const codes = (c: SkadisConfig) =>
  validateSkadisConfig(c).errors.map((e) => e.code);
const warningCodes = (c: SkadisConfig) =>
  validateSkadisConfig(c).warnings.map((w) => w.code);

describe("validateSkadisConfig", () => {
  it("accepts the defaults without errors or warnings", () => {
    expect(codes(DEFAULT_SKADIS_CONFIG)).toEqual([]);
    expect(warningCodes(DEFAULT_SKADIS_CONFIG)).toEqual([]);
  });

  it.each(SKADIS_STARTERS.map((s) => [s.id, s.config] as const))(
    "starter %s is clean",
    (_id, config) => {
      expect(codes(config)).toEqual([]);
      expect(warningCodes(config)).toEqual([]);
    },
  );

  it("rejects hooks that cannot pass a 15 mm slot", () => {
    const c: SkadisConfig = {
      ...DEFAULT_SKADIS_CONFIG,
      mount: { ...DEFAULT_MOUNT, tabHeight: 6, lipDrop: 10 },
    };
    expect(codes(c)).toContain("hook_profile_too_tall");
  });

  it("rejects more hook columns than the plate can carry", () => {
    const c: SkadisConfig = {
      ...DEFAULT_SKADIS_CONFIG,
      mount: { ...DEFAULT_MOUNT, hookColumns: 4 },
      body: { ...DEFAULT_TRAY, pockets: 2 },
    };
    expect(codes(c)).toContain("hook_columns_overflow");
  });

  it("rejects a manual plate too short for two hook rows", () => {
    const c: SkadisConfig = {
      ...DEFAULT_SKADIS_CONFIG,
      mount: { ...DEFAULT_MOUNT, hookRows: 2, plateHeight: 40 },
    };
    expect(codes(c)).toContain("plate_too_short");
  });

  it("rejects a front slot wider than the smallest hole", () => {
    const c: SkadisConfig = {
      ...DEFAULT_SKADIS_CONFIG,
      body: { ...DEFAULT_RACK, frontSlot: 12 },
    };
    expect(codes(c)).toContain("front_slot_wider_than_hole");
  });

  it("rejects divided cells that are too narrow", () => {
    const c: SkadisConfig = {
      ...DEFAULT_SKADIS_CONFIG,
      body: { ...DEFAULT_CUP, innerDiameter: 20, dividers: 4 },
    };
    expect(codes(c)).toContain("divider_cells_too_small");
  });

  it("rejects a front window reaching the slot floor", () => {
    const c: SkadisConfig = {
      ...DEFAULT_SKADIS_CONFIG,
      body: { ...DEFAULT_SLOT, slotHeight: 20, frontWindow: 18 },
    };
    expect(codes(c)).toContain("front_window_too_tall");
  });

  it("warns about a deep bottle tray on a single hook row", () => {
    const c: SkadisConfig = {
      ...DEFAULT_SKADIS_CONFIG,
      body: { ...DEFAULT_TRAY, rows: 2 },
    };
    expect(warningCodes(c)).toContain("deep_body_single_row");
  });

  it("warns about a wide body on one hook column", () => {
    const c: SkadisConfig = {
      ...DEFAULT_SKADIS_CONFIG,
      mount: { ...DEFAULT_MOUNT, hookColumns: 1 },
      body: { ...DEFAULT_CUP, innerDiameter: 80 },
    };
    expect(warningCodes(c)).toContain("single_hook_wide_body");
  });
});
