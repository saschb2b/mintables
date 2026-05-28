import { describe, expect, it } from "vitest";
import { legCapGenerator } from "../src/index";
import {
  DEFAULT_OVAL_LEGCAP,
  DEFAULT_RECTANGULAR_LEGCAP,
  DEFAULT_ROUND_LEGCAP,
  DEFAULT_SQUARE_LEGCAP,
} from "../src/types";

describe("legCapGenerator.decode", () => {
  it("returns null for non-object input", () => {
    expect(legCapGenerator.decode("nope")).toBeNull();
    expect(legCapGenerator.decode(42)).toBeNull();
    expect(legCapGenerator.decode(null)).toBeNull();
  });

  it("returns null when no recognized shape tag is present", () => {
    expect(legCapGenerator.decode({})).toBeNull();
    expect(legCapGenerator.decode({ shape: "triangle" })).toBeNull();
  });

  it("falls back to round defaults when shape is 'round' but fields are missing", () => {
    expect(legCapGenerator.decode({ shape: "round" })).toEqual(
      DEFAULT_ROUND_LEGCAP,
    );
  });

  it("preserves provided round-cap fields", () => {
    const decoded = legCapGenerator.decode({
      shape: "round",
      innerDiameter: 32,
      capHeight: 25,
      wallThickness: 2.5,
    });
    expect(decoded).toEqual({
      ...DEFAULT_ROUND_LEGCAP,
      innerDiameter: 32,
      capHeight: 25,
      wallThickness: 2.5,
    });
  });

  it("ignores fields with the wrong type", () => {
    const decoded = legCapGenerator.decode({
      shape: "round",
      innerDiameter: "big",
      capHeight: 18,
    });
    expect(decoded).toEqual({ ...DEFAULT_ROUND_LEGCAP, capHeight: 18 });
  });

  it("decodes the square branch", () => {
    expect(legCapGenerator.decode({ shape: "square" })).toEqual(
      DEFAULT_SQUARE_LEGCAP,
    );
    const decoded = legCapGenerator.decode({
      shape: "square",
      innerSize: 30,
      cornerRadius: 3,
    });
    expect(decoded).toEqual({
      ...DEFAULT_SQUARE_LEGCAP,
      innerSize: 30,
      cornerRadius: 3,
    });
  });

  it("decodes the rectangular branch", () => {
    expect(legCapGenerator.decode({ shape: "rectangular" })).toEqual(
      DEFAULT_RECTANGULAR_LEGCAP,
    );
  });

  it("decodes the oval branch", () => {
    expect(legCapGenerator.decode({ shape: "oval" })).toEqual(
      DEFAULT_OVAL_LEGCAP,
    );
  });

  it("preserves the boolean toggles", () => {
    const decoded = legCapGenerator.decode({
      shape: "round",
      innerTaperEnabled: true,
      innerTaper: 0.6,
      feltRecessEnabled: true,
      feltDepth: 0.8,
    });
    expect(decoded?.innerTaperEnabled).toBe(true);
    expect(decoded?.innerTaper).toBe(0.6);
    expect(decoded?.feltRecessEnabled).toBe(true);
    expect(decoded?.feltDepth).toBe(0.8);
  });
});
