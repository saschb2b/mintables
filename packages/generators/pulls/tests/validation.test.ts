import { describe, expect, it } from "vitest";
import { validatePullConfig } from "../src/validation";
import {
  DEFAULT_ARC_PULL,
  DEFAULT_KNOB_PULL,
  DEFAULT_TAB_PULL,
} from "../src/types";

function codes(result: { errors: { code: string }[] }): string[] {
  return result.errors.map((e) => e.code);
}

function warningCodes(result: { warnings: { code: string }[] }): string[] {
  return result.warnings.map((w) => w.code);
}

describe("validatePullConfig", () => {
  it("accepts all defaults", () => {
    for (const c of [DEFAULT_KNOB_PULL, DEFAULT_TAB_PULL, DEFAULT_ARC_PULL]) {
      const result = validatePullConfig(c);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    }
  });

  it("rejects a neck wider than the head", () => {
    const result = validatePullConfig({
      ...DEFAULT_KNOB_PULL,
      neckDiameter: 40,
      baseDiameter: 42,
    });
    expect(codes(result)).toContain("neck_wider_than_head");
  });

  it("rejects a base narrower than the neck", () => {
    const result = validatePullConfig({
      ...DEFAULT_KNOB_PULL,
      baseDiameter: 10,
    });
    expect(codes(result)).toContain("base_narrower_than_neck");
  });

  it("rejects a pilot bore that leaves no neck wall", () => {
    const result = validatePullConfig({
      ...DEFAULT_KNOB_PULL,
      screwDiameter: 7.5,
      neckDiameter: 9,
    });
    expect(codes(result)).toContain("screw_wider_than_neck");
  });

  it("ignores screw fields for glue mounting", () => {
    const result = validatePullConfig({
      ...DEFAULT_KNOB_PULL,
      mount: "glue",
      screwDiameter: 7.5,
      neckDiameter: 9,
    });
    expect(result.errors).toHaveLength(0);
  });

  it("warns when fewer grip rings fit than requested", () => {
    const result = validatePullConfig({
      ...DEFAULT_KNOB_PULL,
      gripGrooves: 12,
      gripGrooveDepth: 2,
    });
    expect(warningCodes(result)).toContain("grooves_clamped");
  });

  it("rejects a countersink that cuts through the tab", () => {
    const result = validatePullConfig({
      ...DEFAULT_TAB_PULL,
      thickness: 1.6,
      screwHeadDiameter: 8,
      screwDiameter: 3,
    });
    expect(codes(result)).toContain("countersink_deep");
  });

  it("rejects a base too short for two screws", () => {
    const result = validatePullConfig({
      ...DEFAULT_TAB_PULL,
      baseLength: 14,
    });
    expect(codes(result)).toContain("base_too_short");
  });

  it("warns about shallow blade angles", () => {
    const result = validatePullConfig({ ...DEFAULT_TAB_PULL, tabAngle: 15 });
    expect(result.errors).toHaveLength(0);
    expect(warningCodes(result)).toContain("angle_shallow");
  });

  it("rejects an arc with no arch", () => {
    const result = validatePullConfig({
      ...DEFAULT_ARC_PULL,
      rise: 12,
      barDiameter: 14,
    });
    expect(codes(result)).toContain("rise_too_low");
  });

  it("warns about tight finger room", () => {
    const result = validatePullConfig({ ...DEFAULT_ARC_PULL, rise: 18 });
    expect(warningCodes(result)).toContain("grip_tight");
  });

  it("rejects a screw wider than the arc bar allows", () => {
    const result = validatePullConfig({
      ...DEFAULT_ARC_PULL,
      barDiameter: 6,
      screwDiameter: 4.5,
      rise: 40,
    });
    expect(codes(result)).toContain("screw_wider_than_bar");
  });
});
