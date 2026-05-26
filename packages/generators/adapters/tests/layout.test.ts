import { describe, expect, it } from "vitest";
import { DEFAULT_ADAPTER_CONFIG } from "../src/types";
import { getAdapterLayout, formatTubeEndSize } from "../src/layout";

describe("getAdapterLayout", () => {
  it("places end A at the bottom opening in local space", () => {
    const layout = getAdapterLayout(DEFAULT_ADAPTER_CONFIG);
    expect(layout.endA.center[1]).toBe(-DEFAULT_ADAPTER_CONFIG.socketDepth);
    expect(layout.endA.outward).toEqual([0, -1, 0]);
  });

  it("computes straight coupling total span", () => {
    const layout = getAdapterLayout(DEFAULT_ADAPTER_CONFIG);
    const totalLocal = layout.endB.center[1] + layout.socketDepth;
    expect(totalLocal).toBeGreaterThan(DEFAULT_ADAPTER_CONFIG.socketDepth * 2);
  });

  it("formats round ends with diameter symbol", () => {
    expect(formatTubeEndSize(DEFAULT_ADAPTER_CONFIG.endA)).toBe("⌀50mm");
  });
});
