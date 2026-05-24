import { describe, expect, it } from "vitest";
import {
  DEFAULT_ADAPTER_CONFIG,
  DEFAULT_ROUND_TUBE,
} from "@/lib/adapter-types";
import {
  DEFAULT_ROUND_CONFIG,
  DEFAULT_SQUARE_CONFIG,
} from "@/lib/tube-types";
import {
  getAdapterPrintTips,
  getPrintTips,
  getTubePrintTips,
} from "./print-tips";

describe("getTubePrintTips", () => {
  it("prioritizes press-fit flare tips", () => {
    const tips = getTubePrintTips({
      ...DEFAULT_ROUND_CONFIG,
      flare: { ...DEFAULT_ROUND_CONFIG.flare, enabled: true },
    });
    expect(tips[0]?.title).toBe("Press-fit flare");
    expect(tips[0]?.body).toContain("0.12mm");
  });

  it("includes clamshell guidance when enabled", () => {
    const tips = getTubePrintTips({
      ...DEFAULT_ROUND_CONFIG,
      clamshell: { ...DEFAULT_ROUND_CONFIG.clamshell, enabled: true },
    });
    expect(tips.some((tip) => tip.title === "Clamshell halves")).toBe(true);
  });

  it("flags long tubes", () => {
    const tips = getTubePrintTips({
      ...DEFAULT_SQUARE_CONFIG,
      length: 200,
    });
    expect(tips.some((tip) => tip.title === "Long tube")).toBe(true);
  });
});

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
      endB: { ...DEFAULT_ROUND_TUBE, shape: "square", outerSize: 50 },
    });
    expect(tips.some((tip) => tip.title === "Shape transition")).toBe(true);
  });
});

describe("getPrintTips", () => {
  it("routes to tube tips on tube tab", () => {
    const tips = getPrintTips("tube", DEFAULT_ROUND_CONFIG, DEFAULT_ADAPTER_CONFIG);
    expect(tips.length).toBeGreaterThan(0);
    expect(tips.length).toBeLessThanOrEqual(4);
  });
});
