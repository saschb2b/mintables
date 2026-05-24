import { describe, expect, it } from "vitest";
import {
  decodeConfig,
  encodeConfig,
  loadTubeFromData,
  loadAdapterFromData,
} from "@/lib/preset-storage";
import { DEFAULT_ROUND_CONFIG } from "@/lib/tube-types";
import { DEFAULT_ADAPTER_CONFIG } from "@/lib/adapter-types";

describe("preset-storage", () => {
  it("round-trips tube config through base64 encoding", () => {
    const encoded = encodeConfig(DEFAULT_ROUND_CONFIG);
    const decoded = decodeConfig(encoded);
    const loaded = loadTubeFromData(decoded);
    expect(loaded).toEqual(DEFAULT_ROUND_CONFIG);
  });

  it("merges partial legacy tube config with defaults", () => {
    const loaded = loadTubeFromData({
      shape: "round",
      length: 200,
      innerDiameter: 40,
      outerDiameter: 44,
    });
    expect(loaded?.length).toBe(200);
    expect(loaded?.shape).toBe("round");
    if (loaded?.shape === "round") {
      expect(loaded.innerDiameter).toBe(40);
    }
    expect(loaded?.flare.enabled).toBe(false);
  });

  it("round-trips adapter config", () => {
    const encoded = encodeConfig(DEFAULT_ADAPTER_CONFIG);
    const loaded = loadAdapterFromData(decodeConfig(encoded));
    expect(loaded).toEqual(DEFAULT_ADAPTER_CONFIG);
  });

  it("returns null for unknown tube shape", () => {
    expect(loadTubeFromData({ shape: "hex" })).toBeNull();
  });
});
