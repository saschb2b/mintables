import { describe, expect, it } from "vitest";
import { ExportError, exportModel } from "@mintables/shared/lib/export";
import { tubeGenerator } from "../src";
import { DEFAULT_ROUND_CONFIG } from "../src/types";

describe("exportModel(tubeGenerator)", () => {
  it("throws ExportError for invalid config", () => {
    expect(() =>
      exportModel(
        tubeGenerator,
        {
          ...DEFAULT_ROUND_CONFIG,
          innerDiameter: 60,
          outerDiameter: 50,
        },
        "stl",
      ),
    ).toThrow(ExportError);
  });
});
