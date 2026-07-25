import type { HexTileConfig } from "./types";

/** One card slot: where it sits and whether it runs out through both flats. */
export interface CardSlotPlanEntry {
  offset: number;
  isThrough: boolean;
}

/** Plan-view span of a through channel, measured across the tile. */
export interface CardChannel {
  min: number;
  max: number;
}

export interface HexTileLayout {
  pointToPoint: number;
  sideLength: number;
  topHeight: number;
  innerAcrossFlats: number;
  /** Half the length of a top-face flat, the widest a through channel may sit. */
  topFlatHalfSpan: number;
  cardChannelCount: number;
  cardSlotFloorZ: number;
  bowlWellCount: number;
  /** Flat ridge left between neighbouring bowl wells. */
  bowlDividerWall: number;
  /** Width of one well across the split direction, walls already taken out. */
  bowlWellBandWidth: number;
  rollFloorZ: number;
  /** Across-flats size of the flat rolling floor, once draft and fillet are cut. */
  rollFloorAcrossFlats: number;
  /** How far the rolling floor sits in from the well opening. */
  rollFloorInset: number;
  magnetCount: number;
  magnetSocketDiameter: number;
  magnetSocketDepth: number;
  magnetSocketLength: number;
  magnetThroatWidth: number;
  magnetCenterZ: number;
  magnetRoofZ: number;
  magnetBridgeWidth: number;
  pairedMagnetOffset: number;
  northMarkerCenterY: number;
  /** Null when through channels leave no rim space for the dot. */
  northMarkerCenterX: number | null;
  northMarkerRadius: number;
  northMarkerDepth: number;
}

/**
 * Card slots left to right, flagging the ones that run edge to edge. Through
 * channels are taken in symmetric pairs from the center outward, so a request
 * that cannot be met symmetrically falls back to the next smaller layout.
 */
export function cardSlotPlan(config: HexTileConfig): CardSlotPlanEntry[] {
  const count = Math.max(0, Math.floor(config.cardSlotCount));
  if (count === 0 || !Number.isFinite(config.cardSlotSpacing)) return [];

  const groups: number[][] = [];
  for (let low = Math.floor(count / 2) - 1; low >= 0; low--) {
    groups.push([low, count - 1 - low]);
  }
  if (count % 2 === 1) groups.push([(count - 1) / 2]);

  let budget = Math.min(
    count,
    Math.max(0, Math.round(config.cardSlotThroughCount)),
  );
  const through = new Set<number>();
  for (const group of groups) {
    if (group.length > budget) continue;
    for (const index of group) through.add(index);
    budget -= group.length;
  }

  const centerOffset = ((count - 1) * config.cardSlotSpacing) / 2;
  return Array.from({ length: count }, (_, index) => ({
    offset: index * config.cardSlotSpacing - centerOffset,
    isThrough: through.has(index),
  }));
}

/** The through channels of a card tile, empty for every other variant. */
export function cardChannels(config: HexTileConfig): CardChannel[] {
  if (config.purpose !== "cards") return [];
  const halfWidth = config.cardSlotWidth / 2;
  return cardSlotPlan(config)
    .filter((slot) => slot.isThrough)
    .map((slot) => ({
      min: slot.offset - halfWidth,
      max: slot.offset + halfWidth,
    }))
    .sort((a, b) => a.min - b.min);
}

/**
 * Slides the orientation dot sideways until it clears every through channel.
 * Returns null when the remaining rim is too crowded to place it at all.
 */
function placeNorthMarker(
  channels: CardChannel[],
  markerRadius: number,
  halfSpan: number,
): number | null {
  const clearance = 0.6;
  const blocked = channels.map((channel) => ({
    min: channel.min - markerRadius - clearance,
    max: channel.max + markerRadius + clearance,
  }));
  const fits = (x: number) =>
    Math.abs(x) + markerRadius <= halfSpan &&
    blocked.every((block) => x <= block.min || x >= block.max);

  if (fits(0)) return 0;
  const candidates = blocked
    .flatMap((block) => [block.min, block.max])
    .filter(fits)
    .sort((a, b) => Math.abs(a) - Math.abs(b));
  return candidates[0] ?? null;
}

export function calculateHexTileLayout(config: HexTileConfig): HexTileLayout {
  const pointToPoint = (2 * config.acrossFlats) / Math.sqrt(3);
  const sideLength = pointToPoint / 2;
  const usesCaptiveRods = config.magnetMode === "captive";
  const magnetSocketDiameter = usesCaptiveRods
    ? config.magnetRodDiameter + config.magnetRodClearance
    : config.magnetDiameter + config.magnetClearance;
  const socketRadius = magnetSocketDiameter / 2;
  const magnetSocketLength = usesCaptiveRods
    ? config.magnetRodLength + config.magnetRodClearance
    : magnetSocketDiameter;
  const magnetCenterZ =
    config.edgeBevel +
    1.2 +
    (usesCaptiveRods ? magnetSocketLength / 2 : socketRadius);
  const rimBandWidth = config.rimWidth - config.edgeBevel;
  const openingHalfHeight = Math.min(config.magnetLipOpening / 2, socketRadius);
  const chamberIntersectionDepth = Math.sqrt(
    Math.max(0, socketRadius ** 2 - openingHalfHeight ** 2),
  );
  const magnetCount =
    config.magnetMode === "paired"
      ? 12
      : config.magnetMode === "single" || config.magnetMode === "captive"
        ? 6
        : 0;

  const topHeight = config.bodyHeight + config.raiseHeight;
  const topFlatHalfSpan =
    (config.acrossFlats - 2 * config.edgeBevel) / (2 * Math.sqrt(3));
  const channels = cardChannels(config);
  const northMarkerRadius = Math.min(1.5, Math.max(0.9, rimBandWidth * 0.22));
  const innerAcrossFlats = config.acrossFlats - 2 * config.rimWidth;
  const bowlWellCount = Math.min(
    3,
    Math.max(1, Math.round(config.bowlWellCount)),
  );
  const bowlDividerWall = Math.min(6, Math.max(3, innerAcrossFlats * 0.05));
  const rollFloorInset =
    Math.tan((config.rollWallDraft * Math.PI) / 180) *
      Math.max(0, config.rollDepth - config.rollFloorFillet) +
    config.rollFloorFillet;

  return {
    pointToPoint,
    sideLength,
    topHeight,
    innerAcrossFlats,
    topFlatHalfSpan,
    cardChannelCount: channels.length,
    cardSlotFloorZ: topHeight - config.cardSlotDepth,
    bowlWellCount,
    bowlDividerWall,
    bowlWellBandWidth:
      innerAcrossFlats / bowlWellCount -
      ((bowlWellCount - 1) / bowlWellCount) * bowlDividerWall,
    rollFloorZ: topHeight - config.rollDepth,
    rollFloorAcrossFlats: innerAcrossFlats - 2 * rollFloorInset,
    rollFloorInset,
    magnetCount,
    magnetSocketDiameter,
    magnetSocketDepth: usesCaptiveRods
      ? config.magnetLipDepth + chamberIntersectionDepth + socketRadius
      : config.magnetDepth + config.magnetClearance,
    magnetSocketLength,
    magnetThroatWidth: usesCaptiveRods
      ? config.magnetLipOpening
      : magnetSocketDiameter,
    magnetCenterZ,
    magnetRoofZ:
      magnetCenterZ + (usesCaptiveRods ? magnetSocketLength / 2 : socketRadius),
    magnetBridgeWidth: magnetSocketDiameter * (Math.SQRT2 - 1),
    pairedMagnetOffset: Math.min(12, sideLength * 0.2),
    northMarkerCenterY:
      (config.acrossFlats - 2 * config.rimWidth) / 2 + rimBandWidth / 2,
    northMarkerCenterX: placeNorthMarker(
      channels,
      northMarkerRadius,
      topFlatHalfSpan,
    ),
    northMarkerRadius,
    northMarkerDepth: 0.8,
  };
}
