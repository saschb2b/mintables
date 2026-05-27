import { describe, expect, it } from "vitest";
import { dividerGenerator } from "../src/index";
import { DEFAULT_DIVIDER_CONFIG } from "../src/types";

describe("dividerGenerator.decode", () => {
  it("returns null for non-object input", () => {
    expect(dividerGenerator.decode("nope")).toBeNull();
    expect(dividerGenerator.decode(42)).toBeNull();
    expect(dividerGenerator.decode(null)).toBeNull();
  });

  it("falls back to defaults for missing fields", () => {
    expect(dividerGenerator.decode({})).toEqual(DEFAULT_DIVIDER_CONFIG);
  });

  it("preserves valid numeric fields and drops invalid ones", () => {
    const decoded = dividerGenerator.decode({
      thickness: 1.5,
      width: "not a number",
      height: 40,
      extraneous: true,
    });
    expect(decoded).toEqual({
      ...DEFAULT_DIVIDER_CONFIG,
      thickness: 1.5,
      height: 40,
    });
  });

  it("rejects NaN and Infinity", () => {
    const decoded = dividerGenerator.decode({
      thickness: Number.NaN,
      width: Number.POSITIVE_INFINITY,
      height: 35,
    });
    expect(decoded).toEqual({
      ...DEFAULT_DIVIDER_CONFIG,
      height: 35,
    });
  });

  it("picks up cornerRadius from the incoming payload", () => {
    const decoded = dividerGenerator.decode({ cornerRadius: 4.5 });
    expect(decoded?.cornerRadius).toBe(4.5);
  });

  it("picks up taperEnabled + bottomWidth from the incoming payload", () => {
    const decoded = dividerGenerator.decode({
      taperEnabled: true,
      bottomWidth: 60,
    });
    expect(decoded?.taperEnabled).toBe(true);
    expect(decoded?.bottomWidth).toBe(60);
  });

  it("ignores a non-boolean taperEnabled", () => {
    const decoded = dividerGenerator.decode({ taperEnabled: "yes" });
    expect(decoded?.taperEnabled).toBe(DEFAULT_DIVIDER_CONFIG.taperEnabled);
  });

  it("picks up labelEnabled + label sizing from the incoming payload", () => {
    const decoded = dividerGenerator.decode({
      labelEnabled: true,
      labelWidth: 25,
      labelHeight: 8,
      labelDepth: 0.3,
    });
    expect(decoded?.labelEnabled).toBe(true);
    expect(decoded?.labelWidth).toBe(25);
    expect(decoded?.labelHeight).toBe(8);
    expect(decoded?.labelDepth).toBe(0.3);
  });

  it("ignores a non-boolean labelEnabled", () => {
    const decoded = dividerGenerator.decode({ labelEnabled: 1 });
    expect(decoded?.labelEnabled).toBe(DEFAULT_DIVIDER_CONFIG.labelEnabled);
  });

  it("picks up labelPosition when it's a recognized value", () => {
    expect(dividerGenerator.decode({ labelPosition: "bottom" })?.labelPosition).toBe(
      "bottom",
    );
    expect(dividerGenerator.decode({ labelPosition: "center" })?.labelPosition).toBe(
      "center",
    );
  });

  it("falls back to the default labelPosition for unknown strings", () => {
    expect(
      dividerGenerator.decode({ labelPosition: "diagonal" })?.labelPosition,
    ).toBe(DEFAULT_DIVIDER_CONFIG.labelPosition);
  });
});
