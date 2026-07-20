import { describe, expect, it } from "vitest";
import { calculateInsertLayout, getInsertOutputBounds } from "../src/layout";
import { DEFAULT_INSERT_CONFIG } from "../src/types";

describe("calculateInsertLayout", () => {
  it("turns independent row and well shares into exact clear dimensions", () => {
    const layout = calculateInsertLayout(DEFAULT_INSERT_CONFIG);

    expect(layout.rows).toHaveLength(2);
    expect(layout.cells).toHaveLength(5);
    expect(layout.rows[0].clearDepth / layout.rows[1].clearDepth).toBeCloseTo(
      55 / 45,
      6,
    );
    expect(
      layout.rows[0].cells[0].clearWidth / layout.rows[0].cells[1].clearWidth,
    ).toBeCloseTo(62 / 38, 6);
  });

  it("subtracts the outer walls and only the dividers used by each row", () => {
    const config = {
      ...DEFAULT_INSERT_CONFIG,
      width: 100,
      depth: 80,
      wallThickness: 2,
      dividerThickness: 1,
      rows: [
        {
          id: "front",
          depthShare: 1,
          compartments: [
            {
              id: "wide",
              label: "Wide",
              widthShare: 1,
              floorLift: 0,
              access: "standard" as const,
            },
          ],
        },
        {
          id: "back",
          depthShare: 1,
          compartments: [
            {
              id: "left",
              label: "Left",
              widthShare: 1,
              floorLift: 0,
              access: "standard" as const,
            },
            {
              id: "right",
              label: "Right",
              widthShare: 1,
              floorLift: 0,
              access: "standard" as const,
            },
          ],
        },
      ],
    };
    const layout = calculateInsertLayout(config);

    expect(layout.innerWidth).toBe(96);
    expect(layout.innerDepth).toBe(76);
    expect(layout.rows[0].clearDepth).toBe(37.5);
    expect(layout.rows[0].cells[0].clearWidth).toBe(96);
    expect(layout.rows[1].cells[0].clearWidth).toBe(47.5);
    expect(layout.rows[1].cells[1].clearWidth).toBe(47.5);
  });

  it("reports the complete side-by-side footprint for a tray and lid set", () => {
    const bounds = getInsertOutputBounds({
      ...DEFAULT_INSERT_CONFIG,
      outputPart: "both",
    });

    const lidWidth =
      DEFAULT_INSERT_CONFIG.width +
      2 *
        (DEFAULT_INSERT_CONFIG.lidClearance +
          DEFAULT_INSERT_CONFIG.wallThickness);
    expect(bounds.width).toBeCloseTo(
      DEFAULT_INSERT_CONFIG.width + 10 + lidWidth,
      6,
    );
    expect(bounds.depth).toBeGreaterThan(DEFAULT_INSERT_CONFIG.depth);
  });
});
