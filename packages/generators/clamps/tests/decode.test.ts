import { describe, expect, it } from "vitest";
import { clampGenerator } from "../src/index";
import { DEFAULT_CLAMP_CONFIG } from "../src/types";

describe("clampGenerator.decode", () => {
  it("round-trips the defaults", () => {
    expect(clampGenerator.decode({ ...DEFAULT_CLAMP_CONFIG })).toEqual(
      DEFAULT_CLAMP_CONFIG,
    );
  });

  it("returns null for non-objects", () => {
    expect(clampGenerator.decode(null)).toBeNull();
    expect(clampGenerator.decode("clamp")).toBeNull();
    expect(clampGenerator.decode([1, 2, 3])).toBeNull();
  });

  it("fills missing fields from the defaults", () => {
    const decoded = clampGenerator.decode({ rodDiameter: 12 });
    expect(decoded).not.toBeNull();
    expect(decoded?.rodDiameter).toBe(12);
    expect(decoded?.wrapAngle).toBe(DEFAULT_CLAMP_CONFIG.wrapAngle);
    expect(decoded?.mount).toBe(DEFAULT_CLAMP_CONFIG.mount);
  });

  it("drops values of the wrong type", () => {
    const decoded = clampGenerator.decode({ rodDiameter: "wide" });
    expect(decoded?.rodDiameter).toBe(DEFAULT_CLAMP_CONFIG.rodDiameter);
  });

  it("sanitizes unknown enum values", () => {
    const decoded = clampGenerator.decode({
      tipStyle: "spiky",
      mount: "welded",
      screwRecess: "glue",
    });
    expect(decoded?.tipStyle).toBe("bulb");
    expect(decoded?.mount).toBe("plate");
    expect(decoded?.screwRecess).toBe(DEFAULT_CLAMP_CONFIG.screwRecess);
  });
});
