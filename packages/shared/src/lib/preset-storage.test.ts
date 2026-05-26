import { describe, expect, it } from "vitest";
import { encodeConfig, decodeConfig } from "./preset-storage";

describe("preset-storage", () => {
  it("round-trips an arbitrary JSON-serializable config through base64", () => {
    const input = {
      shape: "round",
      length: 100,
      nested: { a: 1, b: "two", c: [3, 4] },
    };
    const encoded = encodeConfig(input);
    expect(decodeConfig(encoded)).toEqual(input);
  });

  it("returns null for malformed base64", () => {
    expect(decodeConfig("@@@not-valid@@@")).toBeNull();
  });
});
