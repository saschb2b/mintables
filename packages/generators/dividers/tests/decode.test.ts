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
      thickness: 1.5,
      width: DEFAULT_DIVIDER_CONFIG.width,
      height: 40,
      cornerRadius: DEFAULT_DIVIDER_CONFIG.cornerRadius,
    });
  });

  it("rejects NaN and Infinity", () => {
    const decoded = dividerGenerator.decode({
      thickness: Number.NaN,
      width: Number.POSITIVE_INFINITY,
      height: 35,
    });
    expect(decoded).toEqual({
      thickness: DEFAULT_DIVIDER_CONFIG.thickness,
      width: DEFAULT_DIVIDER_CONFIG.width,
      height: 35,
      cornerRadius: DEFAULT_DIVIDER_CONFIG.cornerRadius,
    });
  });

  it("picks up cornerRadius from the incoming payload", () => {
    const decoded = dividerGenerator.decode({ cornerRadius: 4.5 });
    expect(decoded?.cornerRadius).toBe(4.5);
  });
});
