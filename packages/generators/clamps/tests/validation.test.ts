import { describe, expect, it } from "vitest";
import { isValid } from "@mintables/shared/lib/validation/types";
import { validateClampConfig } from "../src/validation";
import { DEFAULT_CLAMP_CONFIG, type ClampConfig } from "../src/types";

function codes(config: ClampConfig): {
  errors: string[];
  warnings: string[];
} {
  const result = validateClampConfig(config);
  return {
    errors: result.errors.map((e) => e.code),
    warnings: result.warnings.map((w) => w.code),
  };
}

describe("validateClampConfig", () => {
  it("accepts the defaults", () => {
    expect(isValid(validateClampConfig(DEFAULT_CLAMP_CONFIG))).toBe(true);
  });

  it("accepts the bare clip defaults", () => {
    expect(
      isValid(validateClampConfig({ ...DEFAULT_CLAMP_CONFIG, mount: "clip" })),
    ).toBe(true);
  });

  it("rejects a closed mouth", () => {
    const result = codes({
      ...DEFAULT_CLAMP_CONFIG,
      wrapAngle: 300,
      armThickness: 6,
      bulbScale: 2.4,
    });
    expect(result.errors).toContain("mouth_closed");
  });

  it("warns when the mouth is wider than the rod", () => {
    const result = codes({
      ...DEFAULT_CLAMP_CONFIG,
      wrapAngle: 190,
      tipStyle: "plain",
      throatDepth: 0,
    });
    expect(result.warnings).toContain("no_retention");
  });

  it("warns when the throat is too shallow to engage", () => {
    const result = codes({ ...DEFAULT_CLAMP_CONFIG, throatDepth: 1 });
    expect(result.warnings).toContain("throat_shallow");
  });

  it("flags a snap that flexes too far to survive", () => {
    const result = codes({
      ...DEFAULT_CLAMP_CONFIG,
      rodDiameter: 10,
      wrapAngle: 280,
      armThickness: 4,
      throatDepth: 0,
      neckWidth: 8,
    });
    expect(result.errors).toContain("snap_too_stiff");
  });

  it("rejects a root thinner than the spring arm", () => {
    const result = codes({
      ...DEFAULT_CLAMP_CONFIG,
      rootThickness: DEFAULT_CLAMP_CONFIG.armThickness - 0.2,
    });
    expect(result.errors).toContain("root_thinner_than_arm");
  });

  it("rejects interference that the throat cannot reach", () => {
    const result = codes({
      ...DEFAULT_CLAMP_CONFIG,
      throatDepth: 2,
      snapInterference: 8,
    });
    expect(result.errors).toContain("interference_unreachable");
  });

  it("rejects screw holes that overlap the jaw", () => {
    const result = codes({ ...DEFAULT_CLAMP_CONFIG, holeSpacing: 12 });
    expect(result.errors).toContain("holes_hit_jaw");
  });

  it("rejects screw holes that run off the base", () => {
    const result = codes({ ...DEFAULT_CLAMP_CONFIG, holeSpacing: 30 });
    expect(result.errors).toContain("holes_hit_end");
  });

  it("rejects a jaw that digs into the base plate", () => {
    const result = codes({
      ...DEFAULT_CLAMP_CONFIG,
      standoff: 0,
      neckWidth: 5,
    });
    expect(result.errors).toContain("standoff_too_small");
  });

  it("rejects a counterbore that leaves no plate under the head", () => {
    const result = codes({
      ...DEFAULT_CLAMP_CONFIG,
      baseThickness: 3,
      headDepth: 2.5,
    });
    expect(result.errors).toContain("head_depth_range");
  });

  it("ignores plate rules for the bare clip", () => {
    const result = codes({
      ...DEFAULT_CLAMP_CONFIG,
      mount: "clip",
      holeSpacing: 12,
      baseLength: 5,
    });
    expect(result.errors).toEqual([]);
  });
});
