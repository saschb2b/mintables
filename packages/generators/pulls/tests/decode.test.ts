import { describe, expect, it } from "vitest";
import { pullGenerator } from "../src/index";
import {
  DEFAULT_ARC_PULL,
  DEFAULT_KNOB_PULL,
  DEFAULT_TAB_PULL,
} from "../src/types";

describe("pullGenerator.decode", () => {
  it("returns null for non-object input", () => {
    expect(pullGenerator.decode("nope")).toBeNull();
    expect(pullGenerator.decode(7)).toBeNull();
    expect(pullGenerator.decode(null)).toBeNull();
  });

  it("returns null without a recognized style tag", () => {
    expect(pullGenerator.decode({})).toBeNull();
    expect(pullGenerator.decode({ style: "lever" })).toBeNull();
  });

  it("fills missing fields from the style's defaults", () => {
    expect(pullGenerator.decode({ style: "knob" })).toEqual(DEFAULT_KNOB_PULL);
    expect(pullGenerator.decode({ style: "tab" })).toEqual(DEFAULT_TAB_PULL);
    expect(pullGenerator.decode({ style: "arc" })).toEqual(DEFAULT_ARC_PULL);
  });

  it("preserves provided fields of the right type", () => {
    expect(
      pullGenerator.decode({
        style: "arc",
        holeSpacing: 128,
        rise: 40,
        barProfile: "flat",
      }),
    ).toEqual({
      ...DEFAULT_ARC_PULL,
      holeSpacing: 128,
      rise: 40,
      barProfile: "flat",
    });
  });

  it("sanitizes unknown enum values back to defaults", () => {
    const knob = pullGenerator.decode({ style: "knob", headShape: "banana" });
    expect(knob).toMatchObject({ headShape: "dome" });
    const tab = pullGenerator.decode({ style: "tab", tipStyle: "wavy" });
    expect(tab).toMatchObject({ tipStyle: "rounded" });
    const arc = pullGenerator.decode({
      style: "arc",
      barProfile: "hex",
      mount: "magnets",
    });
    expect(arc).toMatchObject({ barProfile: "round", mount: "screws" });
  });

  it("rounds fractional counts", () => {
    expect(
      pullGenerator.decode({ style: "tab", screwCount: 1.7 }),
    ).toMatchObject({ screwCount: 2 });
    expect(
      pullGenerator.decode({ style: "knob", gripGrooves: 3.4 }),
    ).toMatchObject({ gripGrooves: 3 });
  });

  it("ignores fields with the wrong type", () => {
    expect(
      pullGenerator.decode({ style: "knob", headDiameter: "big" }),
    ).toEqual(DEFAULT_KNOB_PULL);
  });
});
