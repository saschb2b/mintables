import { describe, expect, it } from "vitest";
import { getAdapterPrintTips } from "../src/print-tips";
import {
  DEFAULT_ADAPTER_CONFIG,
  DEFAULT_SQUARE_TUBE,
} from "../src/types";

describe("getAdapterPrintTips", () => {
  it("prioritizes elbow orientation for bends", () => {
    const tips = getAdapterPrintTips({
      ...DEFAULT_ADAPTER_CONFIG,
      bendAngle: 90,
    });
    expect(tips[0]?.title).toBe("90° elbow");
  });

  it("includes plug-fit guidance", () => {
    const tips = getAdapterPrintTips({
      ...DEFAULT_ADAPTER_CONFIG,
      endAFit: "plug",
    });
    expect(tips.some((tip) => tip.title === "Plug fit")).toBe(true);
  });

  it("includes shape transition guidance", () => {
    const tips = getAdapterPrintTips({
      ...DEFAULT_ADAPTER_CONFIG,
      endB: { ...DEFAULT_SQUARE_TUBE, outerSize: 50 },
    });
    expect(tips.some((tip) => tip.title === "Shape transition")).toBe(true);
  });
});
