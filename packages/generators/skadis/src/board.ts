/**
 * IKEA SKÅDIS board facts. Every published accessory agrees on these:
 * vertical 5 x 15 mm stadium slots on a 40 mm grid, with a second grid
 * shifted by (20, 20). The fibreboard is nominally 5 mm; clones ship 3 to 5.
 */
export const SKADIS = {
  slotWidth: 5,
  slotHeight: 15,
  slotRadius: 2.5,
  pitch: 40,
  offset: 20,
  boardThickness: 5,
} as const;

/** Clearance kept between a hook tab and the plate edge when auto-placing. */
export const HOOK_EDGE_MARGIN = 2.5;

/** How many 40 mm hook columns fit inside a plate of the given width. */
export function maxHookColumns(plateWidth: number, tabWidth: number): number {
  const edge = tabWidth / 2 + HOOK_EDGE_MARGIN;
  const usable = plateWidth - 2 * edge;
  if (usable < 0) return 0;
  return Math.floor(usable / SKADIS.pitch) + 1;
}

/** X centres of `count` hook columns, symmetric about x = 0 on the grid. */
export function hookColumnXs(count: number): number[] {
  return Array.from(
    { length: count },
    (_, i) => (i - (count - 1) / 2) * SKADIS.pitch,
  );
}
