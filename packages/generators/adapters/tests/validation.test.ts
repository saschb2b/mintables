import { describe, expect, it } from "vitest";
import { validateAdapterConfig } from "../src/validation";
import { DEFAULT_ADAPTER_CONFIG } from "../src/types";

describe("validateAdapterConfig", () => {
  it("accepts default adapter config", () => {
    const result = validateAdapterConfig(DEFAULT_ADAPTER_CONFIG);
    expect(result.errors).toHaveLength(0);
  });

  it("rejects bend angles above 90°", () => {
    const result = validateAdapterConfig({
      ...DEFAULT_ADAPTER_CONFIG,
      bendAngle: 120,
    });
    expect(result.errors.some((e) => e.code === "bend_angle")).toBe(true);
  });
});
