import { describe, expect, it } from "vitest";
import {
  CUSTOM_TEXTURE_SAMPLE_COUNT,
  decodeCustomTextureSamples,
  encodeCustomTextureSamples,
} from "../src/custom-height-map";

describe("custom height-map encoding", () => {
  it("round-trips the compact grayscale samples used by presets and URLs", () => {
    const samples = Uint8Array.from(
      { length: CUSTOM_TEXTURE_SAMPLE_COUNT },
      (_, index) => index % 256,
    );

    expect(
      decodeCustomTextureSamples(encodeCustomTextureSamples(samples)),
    ).toEqual(samples);
  });

  it("rejects malformed maps instead of generating partial relief", () => {
    expect(decodeCustomTextureSamples("not-base64")).toBeNull();
    expect(() => encodeCustomTextureSamples(new Uint8Array(12))).toThrow(
      /grayscale samples/,
    );
  });
});
