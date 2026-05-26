import { describe, expect, it } from "vitest";
import {
  encodeConfig,
  decodeConfig,
} from "@mintables/shared/lib/preset-storage";
import { tubeGenerator } from "../src";
import { DEFAULT_ROUND_CONFIG } from "../src/types";

describe("tubeGenerator.decode", () => {
  it("round-trips the default round config through base64", () => {
    const encoded = encodeConfig(DEFAULT_ROUND_CONFIG);
    const decoded = tubeGenerator.decode(decodeConfig(encoded));
    expect(decoded).toEqual(DEFAULT_ROUND_CONFIG);
  });

  it("merges partial config with defaults", () => {
    const decoded = tubeGenerator.decode({
      shape: "round",
      length: 200,
      innerDiameter: 40,
      outerDiameter: 44,
    });
    expect(decoded?.length).toBe(200);
    expect(decoded?.shape).toBe("round");
    if (decoded?.shape === "round") {
      expect(decoded.innerDiameter).toBe(40);
    }
    expect(decoded?.flare.enabled).toBe(false);
  });

  it("rejects unknown tube shapes", () => {
    expect(tubeGenerator.decode({ shape: "hex" })).toBeNull();
  });
});
