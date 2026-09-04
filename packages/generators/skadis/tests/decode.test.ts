import { describe, expect, it } from "vitest";
import { skadisGenerator } from "../src/index";
import {
  DEFAULT_CUP,
  DEFAULT_MOUNT,
  DEFAULT_RACK,
  DEFAULT_SKADIS_CONFIG,
  DEFAULT_TRAY,
} from "../src/types";

describe("skadisGenerator.decode", () => {
  it("returns null for non-objects and unknown bodies", () => {
    expect(skadisGenerator.decode("nope")).toBeNull();
    expect(skadisGenerator.decode(null)).toBeNull();
    expect(skadisGenerator.decode({})).toBeNull();
    expect(skadisGenerator.decode({ body: { kind: "hammock" } })).toBeNull();
  });

  it("fills missing fields from the defaults", () => {
    expect(skadisGenerator.decode({ body: { kind: "tray" } })).toEqual(
      DEFAULT_SKADIS_CONFIG,
    );
    expect(skadisGenerator.decode({ body: { kind: "cup" } })).toEqual({
      mount: DEFAULT_MOUNT,
      body: DEFAULT_CUP,
      showBoard: true,
    });
  });

  it("preserves typed fields and sanitizes enums", () => {
    const decoded = skadisGenerator.decode({
      mount: { hookRows: 2, rowSpacing: 55, fit: 0.4, tabWidth: "wide" },
      body: { kind: "tray", pockets: 4.4, rows: 3, pocketShape: "hex" },
      showBoard: false,
    });
    expect(decoded).toEqual({
      mount: { ...DEFAULT_MOUNT, hookRows: 2, rowSpacing: 40, fit: 0.4 },
      body: { ...DEFAULT_TRAY, pockets: 4, rows: 1, pocketShape: "round" },
      showBoard: false,
    });
  });

  it("rebuilds rack hole groups with fresh ids", () => {
    const decoded = skadisGenerator.decode({
      body: {
        kind: "rack",
        groups: [
          { diameter: 14, count: 2.6 },
          "junk",
          { id: "dup", diameter: 8, count: 4 },
        ],
      },
    });
    expect(decoded?.body).toEqual({
      ...DEFAULT_RACK,
      groups: [
        { id: "g1", diameter: 14, count: 3 },
        { id: "g3", diameter: 8, count: 4 },
      ],
    });
  });

  it("falls back to the default groups when none survive", () => {
    const decoded = skadisGenerator.decode({
      body: { kind: "rack", groups: [] },
    });
    expect(decoded?.body).toEqual(DEFAULT_RACK);
  });
});
