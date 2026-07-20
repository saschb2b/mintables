import { describe, expect, it } from "vitest";
import { decodeInsert } from "../src";
import { DEFAULT_INSERT_CONFIG } from "../src/types";

describe("decodeInsert", () => {
  it("rejects non-object input", () => {
    expect(decodeInsert(null)).toBeNull();
    expect(decodeInsert("insert")).toBeNull();
  });

  it("hydrates nested custom rows and preserves new defaults for missing fields", () => {
    const decoded = decodeInsert({
      width: 150,
      outputPart: "both",
      rows: [
        {
          id: "player-row",
          depthShare: 2,
          compartments: [
            {
              id: "red-player",
              label: "Red player",
              widthShare: 3,
              floorLift: 6,
              access: "scoop",
            },
          ],
        },
      ],
    });

    expect(decoded?.width).toBe(150);
    expect(decoded?.depth).toBe(DEFAULT_INSERT_CONFIG.depth);
    expect(decoded?.outputPart).toBe("both");
    expect(decoded?.rows[0].compartments[0]).toMatchObject({
      label: "Red player",
      widthShare: 3,
      floorLift: 6,
      access: "scoop",
    });
  });

  it("falls back safely for malformed nested values and makes ids unique", () => {
    const decoded = decodeInsert({
      rows: [
        {
          id: "same",
          depthShare: "wide",
          compartments: [
            { id: "same", access: "unknown" },
            { id: "same", widthShare: Number.NaN },
          ],
        },
      ],
    });

    expect(decoded?.rows[0].depthShare).toBe(100);
    expect(decoded?.rows[0].compartments[0].access).toBe("standard");
    expect(decoded?.rows[0].compartments[1].widthShare).toBe(100);
    const ids = [
      decoded?.rows[0].id,
      decoded?.rows[0].compartments[0].id,
      decoded?.rows[0].compartments[1].id,
    ];
    expect(new Set(ids).size).toBe(3);
  });
});
