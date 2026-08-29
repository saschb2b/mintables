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

/** Solid liner behind a lined kumiko lattice. */
export const PEN_LINER_THICKNESS = 1.6;
/** Solid band above and below the lattice. */
export const PEN_BAND_HEIGHT = 6;
/** How far the cup sinks into the tile so the two print as one. */
export const PEN_SINK = 2;

export interface HexTileLayout {
  pointToPoint: number;
  sideLength: number;
  topHeight: number;
  /** Top of the tallest feature, the tile itself unless a cup rises above. */
  overallHeight: number;
  innerAcrossFlats: number;
  /** Half the length of a top-face flat, the widest a through channel may sit. */
  topFlatHalfSpan: number;
  cardChannelCount: number;
  cardSlotFloorZ: number;
  /** Floor of whichever channels run through this variant. */
  channelFloorZ: number;
  /** Floor where a channel meets the tile edge, lifted over a magnet socket. */
  channelEdgeFloorZ: number;
  /** How far that lifted shelf reaches in from each edge. */
  channelLedgeReach: number;
  /** Length of channel left at full depth between the two shelves. */
  channelClearSpan: number;
  deckSlotWidth: number;
  /** Total width the cradles and their dividing wall take up. */
  deckSlotSpan: number;
  /** Where the corner wells start, measured from the tile center. */
  deckWellInset: number;
  /** How far a full deck stands above the rim. */
  deckStandProud: number;
  bowlWellCount: number;
  /** Flat ridge left between neighbouring bowl wells. */
  bowlDividerWall: number;
  /** Widest circle one well holds, walls already taken out. */
  bowlWellBandWidth: number;
  /** Everything the cup wall takes, liner included. */
  penWallTotal: number;
  /** Clear width inside the cup. */
  penOpeningWidth: number;
  /** Outer perimeter of the cup, which the lattice wraps around. */
  penPerimeter: number;
  penCellWidth: number;
  penCellHeight: number;
  /** Slat climb measured from horizontal; steeper prints cleaner. */
  penSlatAngle: number;
  /** Clear vertical gap left inside one lattice diamond. */
  penLatticeOpening: number;
  /** Rough count of 10 mm pens the cup swallows. */
  penCapacity: number;
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

/** Wall left standing between two deck cradles, and beside the corner wells. */
export const DECK_WALL = 4;

/**
 * A plain tile has no interior, so it has no rim either. Its orientation dot
 * sits in a band of this width just inside the top edge instead.
 */
export const PLAIN_MARKER_BAND = 6;

/** Room around a deck so it drops in without being pressed. */
export const DECK_CLEARANCE = 2;

export function deckSlotWidth(config: HexTileConfig): number {
  const capacity = Math.max(1, Math.round(config.deckCapacity));
  return capacity * config.deckCardThickness + DECK_CLEARANCE;
}

/**
 * Cradles a deck tile stands its decks in. They run flat to flat and open at
 * both ends: a sleeved card is 92 mm long and the interior of a 100 mm tile is
 * only 86 mm, so the deck stands on its long edge in a channel that reaches
 * the tile edges, where a thumb can still reach it.
 */
export function deckSlots(config: HexTileConfig): CardChannel[] {
  if (config.purpose !== "deck") return [];
  const count = Math.min(2, Math.max(1, Math.round(config.deckSlotCount)));
  const width = deckSlotWidth(config);
  if (!Number.isFinite(width) || width <= 0) return [];
  const pitch = width + DECK_WALL;
  const centerOffset = ((count - 1) * pitch) / 2;
  return Array.from({ length: count }, (_, slot) => {
    const center = slot * pitch - centerOffset;
    return { min: center - width / 2, max: center + width / 2 };
  });
}

/** Every channel that runs clean through the tile, whatever the variant. */
export function throughChannels(config: HexTileConfig): CardChannel[] {
  if (config.purpose === "deck") return deckSlots(config);
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

/** Clamped superellipse exponent: 2 is a circle, higher squares the corners. */
export function penExponent(config: HexTileConfig): number {
  return Number.isFinite(config.penCornerExponent)
    ? Math.min(8, Math.max(2, config.penCornerExponent))
    : 2;
}

function penCupPerimeter(config: HexTileConfig): number {
  if (!Number.isFinite(config.penCupWidth) || config.penCupWidth <= 0) return 0;
  if (config.penShape === "hexagon") {
    return 2 * Math.sqrt(3) * config.penCupWidth;
  }
  const a = config.penCupWidth / 2;
  const n = penExponent(config);
  let length = 0;
  let previousX = a;
  let previousY = 0;
  const samples = 128;
  for (let index = 1; index <= samples; index++) {
    const t = (index / samples) * 2 * Math.PI;
    const c = Math.cos(t);
    const s = Math.sin(t);
    const x = a * Math.sign(c) * Math.abs(c) ** (2 / n);
    const y = a * Math.sign(s) * Math.abs(s) ** (2 / n);
    length += Math.hypot(x - previousX, y - previousY);
    previousX = x;
    previousY = y;
  }
  return length;
}

/** Fraction of the bounding square a cup cross-section fills. */
function penAreaFactor(config: HexTileConfig): number {
  if (config.penShape === "hexagon") return 0.83;
  // Superellipse area factors sampled at n = 2..6, interpolated between.
  const table = [0.785, 0.849, 0.887, 0.911, 0.927];
  const n = Math.min(6, penExponent(config));
  const low = Math.min(table.length - 1, Math.max(0, Math.floor(n) - 2));
  const high = Math.min(table.length - 1, low + 1);
  return table[low] + (table[high] - table[low]) * (n - 2 - low);
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
  const markerBandWidth =
    config.purpose === "plain"
      ? PLAIN_MARKER_BAND
      : config.rimWidth - config.edgeBevel;
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
  const channels = throughChannels(config);
  const northMarkerRadius = Math.min(
    1.5,
    Math.max(0.9, markerBandWidth * 0.22),
  );
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

  const penWallTotal =
    config.penWallStyle === "lined-lattice"
      ? config.penWallThickness + PEN_LINER_THICKNESS
      : config.penWallThickness;
  const penOpeningWidth = config.penCupWidth - 2 * penWallTotal;
  const penPerimeter = penCupPerimeter(config);
  const penRows = Math.max(1, Math.round(config.penLatticeRows));
  const penColumns = Math.max(3, Math.round(config.penLatticeColumns));
  const penCellWidth = penPerimeter / penColumns;
  const penCellHeight =
    Math.max(1, config.penCupHeight - 2 * PEN_BAND_HEIGHT) / penRows;
  const penInnerArea =
    Math.max(0, penOpeningWidth) ** 2 * penAreaFactor(config);

  const slotWidth = deckSlotWidth(config);
  const deckSpan = Math.max(
    0,
    ...channels.map((channel) => Math.max(-channel.min, channel.max) * 2),
  );
  const deckFloorZ = topHeight - config.deckSlotDepth;
  const channelFloorZ =
    config.purpose === "deck" ? deckFloorZ : topHeight - config.cardSlotDepth;

  // A channel wide enough to pass a magnet socket would cut its roof open, so
  // the floor steps up over the socket. The shelf sits outside the length a
  // card occupies, which is what keeps it out of the way.
  const magnetSocketDepth = usesCaptiveRods
    ? config.magnetLipDepth + chamberIntersectionDepth + socketRadius
    : config.magnetDepth + config.magnetClearance;
  const magnetRoofZ =
    magnetCenterZ + (usesCaptiveRods ? magnetSocketLength / 2 : socketRadius);
  const socketHalfWidth =
    (config.magnetMode === "paired" ? Math.min(12, sideLength * 0.2) : 0) +
    magnetSocketDiameter / 2;
  const channelMeetsSocket =
    magnetCount > 0 &&
    channelFloorZ < magnetRoofZ + 0.6 &&
    channels.some(
      (channel) =>
        channel.min - 0.6 < socketHalfWidth &&
        -socketHalfWidth - 0.6 < channel.max,
    );
  const channelEdgeFloorZ = channelMeetsSocket
    ? Math.max(channelFloorZ, magnetRoofZ + 0.6)
    : channelFloorZ;
  const channelLedgeReach = channelMeetsSocket ? magnetSocketDepth + 0.6 : 0;

  return {
    pointToPoint,
    sideLength,
    topHeight,
    overallHeight:
      topHeight + (config.purpose === "pens" ? config.penCupHeight : 0),
    penWallTotal,
    penOpeningWidth,
    penPerimeter,
    penCellWidth,
    penCellHeight,
    penSlatAngle: (Math.atan2(penCellHeight, penCellWidth) * 180) / Math.PI,
    penLatticeOpening: penCellHeight - 2 * config.penLatticeSlatWidth,
    penCapacity: Math.max(0, Math.floor(penInnerArea / 140)),
    innerAcrossFlats,
    topFlatHalfSpan,
    cardChannelCount: channels.length,
    cardSlotFloorZ: topHeight - config.cardSlotDepth,
    channelFloorZ,
    channelEdgeFloorZ,
    channelLedgeReach,
    channelClearSpan: config.acrossFlats - 2 * channelLedgeReach,
    deckSlotWidth: slotWidth,
    deckSlotSpan: deckSpan,
    deckWellInset: deckSpan / 2 + DECK_WALL,
    // A card standing on its long edge is as tall as the card is wide, and a
    // 66 mm card in an 11 mm cradle leaves plenty to grab.
    deckStandProud: 66 - config.deckSlotDepth,
    bowlWellCount,
    bowlDividerWall,
    // Two wells take a band each, so the band height is the limit. Three take a
    // 120-degree sector each, where the widest circle that fits an apothem-deep
    // wedge is 0.464 of the interior.
    bowlWellBandWidth:
      bowlWellCount === 3
        ? innerAcrossFlats * 0.464 - bowlDividerWall
        : innerAcrossFlats / bowlWellCount -
          ((bowlWellCount - 1) / bowlWellCount) * bowlDividerWall,
    rollFloorZ: topHeight - config.rollDepth,
    rollFloorAcrossFlats: innerAcrossFlats - 2 * rollFloorInset,
    rollFloorInset,
    magnetCount,
    magnetSocketDiameter,
    magnetSocketDepth,
    magnetSocketLength,
    magnetThroatWidth: usesCaptiveRods
      ? config.magnetLipOpening
      : magnetSocketDiameter,
    magnetCenterZ,
    magnetRoofZ,
    magnetBridgeWidth: magnetSocketDiameter * (Math.SQRT2 - 1),
    pairedMagnetOffset: Math.min(12, sideLength * 0.2),
    // Centered in whichever band carries it, measured in from the top edge.
    northMarkerCenterY:
      config.acrossFlats / 2 - config.edgeBevel - markerBandWidth / 2,
    northMarkerCenterX: placeNorthMarker(
      channels,
      northMarkerRadius,
      topFlatHalfSpan,
    ),
    northMarkerRadius,
    northMarkerDepth: 0.8,
  };
}
