import { describe, expect, it } from "vitest";
import { hookColumnXs, maxHookColumns } from "../src/board";
import { deriveSkadis, rackLayout, trayLayout } from "../src/derived";
import {
  DEFAULT_MOUNT,
  DEFAULT_RACK,
  DEFAULT_SKADIS_CONFIG,
  DEFAULT_TRAY,
} from "../src/types";

describe("hook placement", () => {
  it("fits one column per 40 mm with edge margin", () => {
    expect(maxHookColumns(30, 4.7)).toBe(1);
    expect(maxHookColumns(49, 4.7)).toBe(1);
    expect(maxHookColumns(50, 4.7)).toBe(2);
    expect(maxHookColumns(130, 4.7)).toBe(4);
    expect(maxHookColumns(8, 4.7)).toBe(0);
  });

  it("centres columns on the grid", () => {
    expect(hookColumnXs(1)).toEqual([0]);
    expect(hookColumnXs(2)).toEqual([-20, 20]);
    expect(hookColumnXs(3)).toEqual([-40, 0, 40]);
  });
});

describe("layouts", () => {
  it("sizes the default tray to its pockets", () => {
    const L = trayLayout(DEFAULT_TRAY, 3);
    expect(L.outerW).toBeCloseTo(35 + 1.2 + 3.2, 6);
    expect(L.pitch).toBeCloseTo(L.outerW + 4, 6);
    expect(L.width).toBeCloseTo(3 * L.pitch - 4 + 2 * 1.2, 6);
    expect(L.pockets.map((p) => p.x)).toEqual([-L.pitch, 0, L.pitch]);
    expect(L.pockets.every((p) => p.y === 3 + L.outerD / 2 - 0.6)).toBe(true);
  });

  it("staggers a second tray row and raises it", () => {
    const L = trayLayout({ ...DEFAULT_TRAY, rows: 2 }, 3);
    const rear = L.pockets.filter((p) => p.row === 0);
    const front = L.pockets.filter((p) => p.row === 1);
    expect(rear.length).toBe(3);
    expect(front.length).toBe(3);
    expect(front[0].x - rear[0].x).toBeCloseTo(-L.pitch / 2, 6);
    expect(front[0].y - rear[0].y).toBeCloseTo(L.rowDy, 6);
    expect(L.shelfTop(0)).toBe(3 + 20);
    expect(L.shelfTop(1)).toBe(3);
  });

  it("lays rack holes out left to right with gaps", () => {
    const L = rackLayout(
      {
        ...DEFAULT_RACK,
        groups: [
          { id: "a", diameter: 10, count: 2 },
          { id: "b", diameter: 6, count: 1 },
        ],
        gap: 4,
      },
      3,
    );
    expect(L.width).toBe(10 + 10 + 6 + 4 * 4);
    expect(L.holes.map((h) => h.x)).toEqual([
      -L.width / 2 + 4 + 5,
      -L.width / 2 + 4 + 10 + 4 + 5,
      -L.width / 2 + 4 + 10 + 4 + 10 + 4 + 3,
    ]);
    expect(L.barDepth).toBe(10 + 8);
  });
});

describe("deriveSkadis", () => {
  it("auto-sizes the plate to the body and adds hook columns", () => {
    const d = deriveSkadis(DEFAULT_SKADIS_CONFIG);
    expect(d.plateWidth).toBeCloseTo(d.body.width, 6);
    expect(d.hooks.columns).toBe(3);
    expect(d.hooks.reach).toBeCloseTo(4.8 + 4.5, 6);
    expect(d.hooks.profileHeight).toBeCloseTo(4.5 + 7.5, 6);
    expect(d.hooks.rowTops).toEqual([d.plateHeight - DEFAULT_MOUNT.hookInset]);
    expect(d.height).toBe(d.plateHeight);
  });

  it("adds a second hook row below the first", () => {
    const d = deriveSkadis({
      ...DEFAULT_SKADIS_CONFIG,
      mount: { ...DEFAULT_MOUNT, hookRows: 2, rowSpacing: 80 },
    });
    const top = d.plateHeight - DEFAULT_MOUNT.hookInset;
    expect(d.hooks.rowTops).toEqual([top, top - 80]);
    expect(d.plateHeight).toBeGreaterThanOrEqual(
      DEFAULT_MOUNT.hookInset + 80 + DEFAULT_MOUNT.tabHeight + 8,
    );
  });
});
