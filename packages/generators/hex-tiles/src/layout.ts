import type { HexTileConfig } from "./types";

export interface HexTileLayout {
  pointToPoint: number;
  sideLength: number;
  topHeight: number;
  innerAcrossFlats: number;
  magnetCount: number;
  magnetSocketDiameter: number;
  magnetSocketDepth: number;
  magnetCenterZ: number;
  magnetRoofZ: number;
  magnetBridgeWidth: number;
  pairedMagnetOffset: number;
  northMarkerCenterY: number;
  northMarkerRadius: number;
  northMarkerDepth: number;
}

export function calculateHexTileLayout(config: HexTileConfig): HexTileLayout {
  const pointToPoint = (2 * config.acrossFlats) / Math.sqrt(3);
  const sideLength = pointToPoint / 2;
  const magnetSocketDiameter = config.magnetDiameter + config.magnetClearance;
  const socketRadius = magnetSocketDiameter / 2;
  const magnetCenterZ = config.edgeBevel + 1.2 + socketRadius;
  const rimBandWidth = config.rimWidth - config.edgeBevel;
  const magnetCount =
    config.magnetMode === "paired"
      ? 12
      : config.magnetMode === "single"
        ? 6
        : 0;

  return {
    pointToPoint,
    sideLength,
    topHeight: config.bodyHeight + config.raiseHeight,
    innerAcrossFlats: config.acrossFlats - 2 * config.rimWidth,
    magnetCount,
    magnetSocketDiameter,
    magnetSocketDepth: config.magnetDepth + config.magnetClearance,
    magnetCenterZ,
    magnetRoofZ: magnetCenterZ + socketRadius,
    magnetBridgeWidth: magnetSocketDiameter * (Math.SQRT2 - 1),
    pairedMagnetOffset: Math.min(12, sideLength * 0.2),
    northMarkerCenterY:
      (config.acrossFlats - 2 * config.rimWidth) / 2 + rimBandWidth / 2,
    northMarkerRadius: Math.min(1.5, Math.max(0.9, rimBandWidth * 0.22)),
    northMarkerDepth: 0.8,
  };
}
