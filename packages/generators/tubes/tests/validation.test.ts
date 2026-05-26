import { describe, expect, it } from "vitest";
import { validateTubeConfig } from "../src/validation";
import { DEFAULT_ROUND_CONFIG } from "../src/types";

describe("validateTubeConfig", () => {
  it("accepts default round config", () => {
    const result = validateTubeConfig(DEFAULT_ROUND_CONFIG);
    expect(result.errors).toHaveLength(0);
  });

  it("rejects inner diameter >= outer diameter", () => {
    const result = validateTubeConfig({
      ...DEFAULT_ROUND_CONFIG,
      innerDiameter: 55,
      outerDiameter: 52,
    });
    expect(result.errors.some((e) => e.code === "inner_outer")).toBe(true);
  });

  it("rejects clamshell on non-round tubes", () => {
    const result = validateTubeConfig({
      ...DEFAULT_ROUND_CONFIG,
      shape: "square",
      innerSize: 48,
      outerSize: 52,
      cornerRadius: 2,
      clamshell: { ...DEFAULT_ROUND_CONFIG.clamshell, enabled: true },
    });
    expect(result.errors.some((e) => e.code === "clamshell_shape")).toBe(true);
  });

  it("warns on interference fit", () => {
    const result = validateTubeConfig({
      ...DEFAULT_ROUND_CONFIG,
      flare: {
        ...DEFAULT_ROUND_CONFIG.flare,
        enabled: true,
        fitType: "interference",
      },
    });
    expect(result.warnings.some((w) => w.code === "interference_fit")).toBe(
      true,
    );
  });
});
