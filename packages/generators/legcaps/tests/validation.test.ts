import { describe, expect, it } from "vitest";
import { validateLegCapConfig } from "../src/validation";
import {
  DEFAULT_OVAL_LEGCAP,
  DEFAULT_RECTANGULAR_LEGCAP,
  DEFAULT_ROUND_LEGCAP,
  DEFAULT_SQUARE_LEGCAP,
} from "../src/types";

describe("validateLegCapConfig", () => {
  it("accepts every default config", () => {
    for (const c of [
      DEFAULT_ROUND_LEGCAP,
      DEFAULT_SQUARE_LEGCAP,
      DEFAULT_RECTANGULAR_LEGCAP,
      DEFAULT_OVAL_LEGCAP,
    ]) {
      const r = validateLegCapConfig(c);
      expect(r.errors).toHaveLength(0);
    }
  });

  it("flags sub-printable wall thickness", () => {
    const r = validateLegCapConfig({
      ...DEFAULT_ROUND_LEGCAP,
      wallThickness: 0.2,
    });
    expect(r.errors.some((e) => e.code === "wall_range")).toBe(true);
  });

  it("warns on thin walls without erroring", () => {
    const r = validateLegCapConfig({
      ...DEFAULT_ROUND_LEGCAP,
      wallThickness: 1,
    });
    expect(r.errors).toHaveLength(0);
    expect(r.warnings.some((w) => w.code === "wall_thin")).toBe(true);
  });

  it("rejects an out-of-range inner diameter", () => {
    const r = validateLegCapConfig({
      ...DEFAULT_ROUND_LEGCAP,
      innerDiameter: 0.5,
    });
    expect(r.errors.some((e) => e.code === "inner_diameter_range")).toBe(true);
  });

  it("caps the square cap corner radius at half the outer width", () => {
    // size 25 + 2×2 wall = 29 outer, max r = 14.5; 20 should fail.
    const r = validateLegCapConfig({
      ...DEFAULT_SQUARE_LEGCAP,
      cornerRadius: 20,
    });
    expect(r.errors.some((e) => e.code === "corner_radius_too_large")).toBe(
      true,
    );
  });

  it("limits the inner taper to 80% of the wall thickness", () => {
    const r = validateLegCapConfig({
      ...DEFAULT_ROUND_LEGCAP,
      innerTaperEnabled: true,
      innerTaper: 2, // wall=2 → 80% = 1.6, so 2 should fail
    });
    expect(r.errors.some((e) => e.code === "taper_too_large")).toBe(true);
  });

  it("warns when inner taper is enabled but set to 0", () => {
    const r = validateLegCapConfig({
      ...DEFAULT_ROUND_LEGCAP,
      innerTaperEnabled: true,
      innerTaper: 0,
    });
    expect(r.warnings.some((w) => w.code === "taper_noop")).toBe(true);
  });

  it("rejects a felt inset wider than the wall", () => {
    const r = validateLegCapConfig({
      ...DEFAULT_ROUND_LEGCAP,
      feltRecessEnabled: true,
      feltInset: 5, // wall is 2
    });
    expect(r.errors.some((e) => e.code === "felt_inset_too_large")).toBe(true);
  });

  it("rejects a felt depth deeper than 60% of the floor", () => {
    const r = validateLegCapConfig({
      ...DEFAULT_ROUND_LEGCAP,
      feltRecessEnabled: true,
      feltDepth: 1.5, // floor=2, 60% = 1.2, so 1.5 fails
    });
    expect(r.errors.some((e) => e.code === "felt_depth_too_deep")).toBe(true);
  });

  it("ignores felt fields when the toggle is off", () => {
    const r = validateLegCapConfig({
      ...DEFAULT_ROUND_LEGCAP,
      feltRecessEnabled: false,
      feltDepth: 999, // would error if feltRecessEnabled were true
    });
    expect(r.errors.some((e) => e.code.startsWith("felt_"))).toBe(false);
  });

  it("ignores taper fields when the toggle is off", () => {
    const r = validateLegCapConfig({
      ...DEFAULT_ROUND_LEGCAP,
      innerTaperEnabled: false,
      innerTaper: 99,
    });
    expect(r.errors.some((e) => e.code.startsWith("taper_"))).toBe(false);
  });
});
