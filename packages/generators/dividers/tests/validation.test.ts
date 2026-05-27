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

  it("accepts a sensible taper", () => {
    const result = validateDividerConfig({
      ...DEFAULT_DIVIDER_CONFIG,
      taperEnabled: true,
      bottomWidth: 64,
    });
    expect(result.errors).toHaveLength(0);
  });

  it("warns when taper is on but bottom matches top", () => {
    const result = validateDividerConfig({
      ...DEFAULT_DIVIDER_CONFIG,
      taperEnabled: true,
      bottomWidth: DEFAULT_DIVIDER_CONFIG.width,
    });
    expect(result.warnings.some((w) => w.code === "taper_noop")).toBe(true);
  });

  it("errors on out-of-range bottom width when taper is on", () => {
    const result = validateDividerConfig({
      ...DEFAULT_DIVIDER_CONFIG,
      taperEnabled: true,
      bottomWidth: 0,
    });
    expect(result.errors.some((e) => e.code === "bottom_width_range")).toBe(true);
  });

  it("tightens corner radius constraint to the narrowed bottom edge", () => {
    // height=35 alone would allow r up to 17.5, but with bottom=10 the bound
    // collapses to 5. Asking for r=8 should now error.
    const result = validateDividerConfig({
      ...DEFAULT_DIVIDER_CONFIG,
      taperEnabled: true,
      bottomWidth: 10,
      cornerRadius: 8,
    });
    expect(
      result.errors.some((e) => e.code === "corner_radius_too_large"),
    ).toBe(true);
  });

  it("ignores bottomWidth in validation when taper is off", () => {
    const result = validateDividerConfig({
      ...DEFAULT_DIVIDER_CONFIG,
      taperEnabled: false,
      bottomWidth: 0, // invalid value, but taper is off so it shouldn't matter
    });
    expect(
      result.errors.some((e) => e.code === "bottom_width_range"),
    ).toBe(false);
  });

  it("accepts a sensible label pocket", () => {
    const result = validateDividerConfig({
      ...DEFAULT_DIVIDER_CONFIG,
      labelEnabled: true,
      labelWidth: 40,
      labelHeight: 15,
      labelDepth: 0.4,
    });
    expect(result.errors).toHaveLength(0);
  });

  it("errors when the label pocket is wider than the slab leaves room for", () => {
    const result = validateDividerConfig({
      ...DEFAULT_DIVIDER_CONFIG,
      labelEnabled: true,
      labelWidth: 70, // > width (65), no wall
    });
    expect(result.errors.some((e) => e.code === "label_width_range")).toBe(
      true,
    );
  });

  it("errors when the label pocket is too deep for the slab", () => {
    const result = validateDividerConfig({
      ...DEFAULT_DIVIDER_CONFIG,
      labelEnabled: true,
      labelWidth: 30,
      labelHeight: 10,
      labelDepth: 0.8, // > thickness/2 = 0.5
    });
    expect(result.errors.some((e) => e.code === "label_depth_range")).toBe(
      true,
    );
  });

  it("uses the narrower tapered bottom as the label-width bound", () => {
    // bottom=30 → narrowestWidth=30, maxLabelWidth=28. 35 mm label fails.
    const result = validateDividerConfig({
      ...DEFAULT_DIVIDER_CONFIG,
      taperEnabled: true,
      bottomWidth: 30,
      labelEnabled: true,
      labelWidth: 35,
      labelHeight: 10,
    });
    expect(result.errors.some((e) => e.code === "label_width_range")).toBe(
      true,
    );
  });

  it("ignores label fields when the toggle is off", () => {
    const result = validateDividerConfig({
      ...DEFAULT_DIVIDER_CONFIG,
      labelEnabled: false,
      labelDepth: 99, // would be invalid but toggle is off
    });
    expect(result.errors.some((e) => e.code === "label_depth_range")).toBe(
      false,
    );
  });
});
