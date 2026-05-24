import { describe, expect, it } from "vitest";
import { exportTubeModel, ExportError } from "./export-model";
import { DEFAULT_ROUND_CONFIG } from "@/lib/tube-types";

describe("exportTubeModel", () => {
  it("throws ExportError for invalid config", () => {
    expect(() =>
      exportTubeModel(
        {
          ...DEFAULT_ROUND_CONFIG,
          innerDiameter: 60,
          outerDiameter: 50,
        },
        "stl",
        "bad.stl",
      ),
    ).toThrow(ExportError);
  });
});
