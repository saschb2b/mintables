import { describe, expect, it } from "vitest";
import { getTubePrintTips } from "../src/print-tips";
import {
  DEFAULT_ROUND_CONFIG,
  DEFAULT_SQUARE_CONFIG,
} from "../src/types";

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

  it("caps total tips", () => {
    const tips = getTubePrintTips(DEFAULT_ROUND_CONFIG);
    expect(tips.length).toBeLessThanOrEqual(4);
  });
});
