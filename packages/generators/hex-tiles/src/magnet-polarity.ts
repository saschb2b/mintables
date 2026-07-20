export type MagnetPole = "north" | "south";

function normalizedSide(side: number): number {
  return ((side % 6) + 6) % 6;
}

/** Outward-facing pole for a keyed single-magnet tile, clockwise from its north side. */
export function keyedPoleForSide(side: number): MagnetPole {
  return normalizedSide(side) % 2 === 0 ? "north" : "south";
}

/**
 * Reports whether two keyed tiles attract across one global side.
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
