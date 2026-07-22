import { describe, expect, it } from "vitest";
import {
  keyedPoleForSide,
  keyedTilesAttract,
  type MagnetPole,
} from "../src/magnet-polarity";

describe("keyed magnet polarity", () => {
  it.each<[number, MagnetPole]>([
    [0, "north"],
    [1, "south"],
    [2, "north"],
    [3, "south"],
    [4, "north"],
    [5, "south"],
  ])("assigns side %i a keyed %s reference pole", (side, pole) => {
    expect(keyedPoleForSide(side)).toBe(pole);
  });

  it.each([0, 2, 4])(
    "connects every edge when the second tile is rotated %i steps",
    (rotation) => {
      expect([
        keyedTilesAttract(0, 0, rotation),
        keyedTilesAttract(1, 0, rotation),
        keyedTilesAttract(2, 0, rotation),
        keyedTilesAttract(3, 0, rotation),
        keyedTilesAttract(4, 0, rotation),
        keyedTilesAttract(5, 0, rotation),
      ]).toEqual([true, true, true, true, true, true]);
    },
  );

  it.each([1, 3, 5])(
    "rejects every edge when the second tile is rotated %i steps",
    (rotation) => {
      expect([
        keyedTilesAttract(0, 0, rotation),
        keyedTilesAttract(1, 0, rotation),
        keyedTilesAttract(2, 0, rotation),
        keyedTilesAttract(3, 0, rotation),
        keyedTilesAttract(4, 0, rotation),
        keyedTilesAttract(5, 0, rotation),
      ]).toEqual([false, false, false, false, false, false]);
    },
  );
});
