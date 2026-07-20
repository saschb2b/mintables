import { describe, expect, it } from "vitest";
import { DEFAULT_INSERT_CONFIG } from "../src/types";
import { validateInsertConfig } from "../src/validation";

describe("validateInsertConfig", () => {
  it("accepts the useful uneven default layout", () => {
    const result = validateInsertConfig(DEFAULT_INSERT_CONFIG);
    expect(result.errors).toHaveLength(0);
  });

  it("warns about fragile walls without blocking export", () => {
    const result = validateInsertConfig({
      ...DEFAULT_INSERT_CONFIG,
      wallThickness: 1,
    });
    expect(result.errors).toHaveLength(0);
    expect(
      result.warnings.some((warning) => warning.code === "wall_thin"),
    ).toBe(true);
  });

  it("rejects floor lifts that leave no usable well depth", () => {
    const result = validateInsertConfig({
      ...DEFAULT_INSERT_CONFIG,
      rows: [
        {
          ...DEFAULT_INSERT_CONFIG.rows[0],
          compartments: [
            {
              ...DEFAULT_INSERT_CONFIG.rows[0].compartments[0],
              floorLift: 30,
            },
          ],
        },
      ],
    });
    expect(
      result.errors.some((error) => error.code === "floor_lift_high"),
    ).toBe(true);
  });

  it("accounts for the undercut platform when validating card-well height", () => {
    const result = validateInsertConfig({
      ...DEFAULT_INSERT_CONFIG,
      rows: [
        {
          id: "cards-row",
          depthShare: 100,
          compartments: [
            {
              id: "cards",
              label: "Cards",
              widthShare: 100,
              floorLift: 27,
              access: "cards",
            },
          ],
        },
      ],
    });

    expect(
      result.errors.some((error) => error.code === "content_floor_high"),
    ).toBe(true);
  });

  it("rejects layouts that squeeze a well below a usable size", () => {
    const tiny = {
      ...DEFAULT_INSERT_CONFIG,
      width: 40,
      rows: [
        {
          ...DEFAULT_INSERT_CONFIG.rows[0],
          compartments: Array.from({ length: 6 }, (_, index) => ({
            id: `tiny-${String(index)}`,
            label: `Tiny ${String(index)}`,
            widthShare: 1,
            floorLift: 0,
            access: "standard" as const,
          })),
        },
      ],
    };
    const result = validateInsertConfig(tiny);
    expect(
      result.errors.some((error) => error.code === "compartment_too_small"),
    ).toBe(true);
  });

  it("warns when the selected set exceeds a common 220 mm print bed", () => {
    const result = validateInsertConfig({
      ...DEFAULT_INSERT_CONFIG,
      outputPart: "both",
    });
    expect(
      result.warnings.some((warning) => warning.code === "print_bed_size"),
    ).toBe(true);
  });
});
