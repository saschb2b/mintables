import { describe, expect, it } from "vitest";
import {
  encodeConfig,
  decodeConfig,
} from "@mintables/shared/lib/preset-storage";
import { adapterGenerator } from "../src";
import {
  DEFAULT_ADAPTER_CONFIG,
  DEFAULT_RECTANGULAR_TUBE,
  DEFAULT_SQUARE_TUBE,
} from "../src/types";

describe("adapterGenerator.decode", () => {
  it("round-trips the default adapter config through base64", () => {
    const encoded = encodeConfig(DEFAULT_ADAPTER_CONFIG);
    const decoded = adapterGenerator.decode(decodeConfig(encoded));
    expect(decoded).toEqual(DEFAULT_ADAPTER_CONFIG);
  });

  it("decodes a square end A with the square TubeSpec fields", () => {
    // Regression: mergeWithDefaults used to walk the default-round-tube keys,
    // silently dropping `outerSize` from a "square" payload and producing
    // a malformed TubeSpec that crashed the scene with NaN coordinates.
    const incoming = {
      ...DEFAULT_ADAPTER_CONFIG,
      endA: { ...DEFAULT_SQUARE_TUBE, outerSize: 60, cornerRadius: 3 },
    };
    const decoded = adapterGenerator.decode(incoming);
    expect(decoded?.endA).toEqual({
      shape: "square",
      outerSize: 60,
      cornerRadius: 3,
      tubeWallThickness: DEFAULT_SQUARE_TUBE.tubeWallThickness,
    });
  });

  it("decodes a rectangular end B with the rectangular TubeSpec fields", () => {
    const incoming = {
      ...DEFAULT_ADAPTER_CONFIG,
      endB: {
        ...DEFAULT_RECTANGULAR_TUBE,
        outerWidth: 80,
        outerHeight: 40,
      },
    };
    const decoded = adapterGenerator.decode(incoming);
    expect(decoded?.endB).toMatchObject({
      shape: "rectangular",
      outerWidth: 80,
      outerHeight: 40,
    });
  });

  it("falls back to merged default when an end's shape is unknown", () => {
    const incoming = {
      ...DEFAULT_ADAPTER_CONFIG,
      endA: { shape: "hexagonal", outerSize: 60 },
    };
    const decoded = adapterGenerator.decode(incoming);
    expect(decoded?.endA).toEqual(DEFAULT_ADAPTER_CONFIG.endA);
  });
});
