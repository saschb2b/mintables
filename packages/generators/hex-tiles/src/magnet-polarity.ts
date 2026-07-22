export type MagnetPole = "north" | "south";

function normalizedSide(side: number): number {
  return ((side % 6) + 6) % 6;
}

/**
 * Reference pole clockwise from a keyed tile's north side.
 * This is the outward pole for discs and the upper pole for vertical rods.
 */
export function keyedPoleForSide(side: number): MagnetPole {
  return normalizedSide(side) % 2 === 0 ? "north" : "south";
}

/**
 * Reports whether two keyed disc or captive-rod tiles attract across one global side.
 * Rotation is expressed in clockwise 60-degree steps from each tile's north mark.
 */
export function keyedTilesAttract(
  firstGlobalSide: number,
  firstRotation: number,
  secondRotation: number,
): boolean {
  const firstLocalSide = normalizedSide(firstGlobalSide - firstRotation);
  const secondGlobalSide = normalizedSide(firstGlobalSide + 3);
  const secondLocalSide = normalizedSide(secondGlobalSide - secondRotation);
  return keyedPoleForSide(firstLocalSide) !== keyedPoleForSide(secondLocalSide);
}
