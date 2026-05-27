import { describe, expect, it } from "vitest";
import { validateDividerConfig } from "../src/validation";
import { DEFAULT_DIVIDER_CONFIG } from "../src/types";

describe("validateDividerConfig", () => {
  it("accepts the default config", () => {
    const result = validateDividerConfig(DEFAULT_DIVIDER_CONFIG);
    expect(result.errors).toHaveLength(0);
  });

  it("flags a sub-printable thickness as an error", () => {
    const result = validateDividerConfig({
      ...DEFAULT_DIVIDER_CONFIG,
      thickness: 0.2,
    });
    expect(result.errors.some((e) => e.code === "thickness_range")).toBe(true);
  });

  it("warns about a thin slab without erroring", () => {
    const result = validateDividerConfig({
      ...DEFAULT_DIVIDER_CONFIG,
      thickness: 0.6,
    });
    expect(result.errors).toHaveLength(0);
    expect(result.warnings.some((w) => w.code === "thickness_thin")).toBe(true);
  });

  it("flags out-of-range width and height", () => {
    const w = validateDividerConfig({
      ...DEFAULT_DIVIDER_CONFIG,
      width: 0,
    });
    expect(w.errors.some((e) => e.code === "width_range")).toBe(true);

    const h = validateDividerConfig({
      ...DEFAULT_DIVIDER_CONFIG,
      height: 1000,
    });
    expect(h.errors.some((e) => e.code === "height_range")).toBe(true);
  });

  it("accepts a corner radius up to half the shorter side", () => {
    // Default 65 × 35 → max r = 17.5.
    const result = validateDividerConfig({
      ...DEFAULT_DIVIDER_CONFIG,
      cornerRadius: 17.5,
    });
    expect(result.errors).toHaveLength(0);
  });

  it("errors on a negative corner radius", () => {
    const result = validateDividerConfig({
      ...DEFAULT_DIVIDER_CONFIG,
      cornerRadius: -1,
    });
    expect(result.errors.some((e) => e.code === "corner_radius_negative")).toBe(
      true,
    );
  });

  it("errors when the corner radius exceeds half the shorter side", () => {
    // Default 65 × 35 → max is 17.5; 18 should fail.
    const result = validateDividerConfig({
      ...DEFAULT_DIVIDER_CONFIG,
      cornerRadius: 18,
    });
    expect(
      result.errors.some((e) => e.code === "corner_radius_too_large"),
    ).toBe(true);
  });
});
