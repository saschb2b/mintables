import { describe, expect, it } from "vitest";
import { getHexTilePrintTips } from "../src/print-tips";
import { DEFAULT_HEX_TILE_CONFIG } from "../src/types";

describe("getHexTilePrintTips", () => {
  it("gives keyed tiles an exact alternating installation sequence", () => {
    const tips = getHexTilePrintTips(DEFAULT_HEX_TILE_CONFIG);

    expect(tips.some((tip) => tip.title === "Follow the north dot")).toBe(true);
    expect(tips.some((tip) => tip.body.includes("N / S / N / S / N / S"))).toBe(
      true,
    );
  });

  it("explains the rotation benefit of the twelve-magnet layout", () => {
    const tips = getHexTilePrintTips({
      ...DEFAULT_HEX_TILE_CONFIG,
      magnetMode: "paired",
    });

    expect(tips.some((tip) => tip.title === "Mirror paired polarity")).toBe(
      true,
    );
    expect(tips.some((tip) => tip.body.includes("every 60-degree"))).toBe(true);
  });

  it("explains captive rod insertion without adhesive", () => {
    const tips = getHexTilePrintTips({
      ...DEFAULT_HEX_TILE_CONFIG,
      magnetMode: "captive",
    });

    expect(tips.some((tip) => tip.title === "Press in diametric rods")).toBe(
      true,
    );
    expect(tips.some((tip) => tip.body.includes("without adhesive"))).toBe(
      true,
    );
  });
});
