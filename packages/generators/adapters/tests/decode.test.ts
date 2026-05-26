import { describe, expect, it } from "vitest";
import {
  encodeConfig,
  decodeConfig,
} from "@mintables/shared/lib/preset-storage";
import { adapterGenerator } from "../src";
import { DEFAULT_ADAPTER_CONFIG } from "../src/types";

describe("adapterGenerator.decode", () => {
  it("round-trips the default adapter config through base64", () => {
    const encoded = encodeConfig(DEFAULT_ADAPTER_CONFIG);
    const decoded = adapterGenerator.decode(decodeConfig(encoded));
    expect(decoded).toEqual(DEFAULT_ADAPTER_CONFIG);
  });
});
