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

  it("tells a plain tile how to finish for paint and terrain", () => {
    const tips = getHexTilePrintTips({
      ...DEFAULT_HEX_TILE_CONFIG,
      purpose: "plain",
      magnetMode: "none",
    });

    expect(
      tips.some((tip) => tip.title === "Print a plain tile for paint"),
    ).toBe(true);
    expect(tips.some((tip) => tip.title === "Prime, then build on top")).toBe(
      true,
    );
    // The magnet-heavy default list still leaves room for the finishing tip.
    expect(
      getHexTilePrintTips({
        ...DEFAULT_HEX_TILE_CONFIG,
        purpose: "plain",
      }).some((tip) => tip.title === "Print a plain tile for paint"),
    ).toBe(true);
  });

  it("explains the keyed top-pole sequence for captive rods", () => {
    const tips = getHexTilePrintTips({
      ...DEFAULT_HEX_TILE_CONFIG,
      magnetMode: "captive",
    });

    expect(tips.some((tip) => tip.title === "Follow the north dot")).toBe(true);
    expect(tips.some((tip) => tip.body.includes("axially magnetized"))).toBe(
      true,
    );
    expect(tips.some((tip) => tip.body.includes("north end up"))).toBe(true);
    expect(tips.some((tip) => tip.body.includes("N / S / N / S / N / S"))).toBe(
      true,
    );
  });
});
