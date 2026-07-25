import { calculateHexTileLayout, cardChannels } from "./layout";
import { estimatePrintMaterial } from "./material-estimate";
import type { HexTileConfig } from "./types";

export interface HexTileSpec {
  pointToPoint: number;
  acrossFlats: number;
  totalHeight: number;
  usableInterior: number;
  magnetCount: number;
  magnetBackWall: number;
  connectionLabel: string;
  featureLabel: string;
  estimatedMaterialCm3: number;
  estimatedPlaGrams: number;
  estimateInfillPercent: number;
}

function connectionLabel(config: HexTileConfig): string {
  switch (config.magnetMode) {
    case "single":
      return "Align north dots";
    case "captive":
      return "Align north dots";
    case "paired":
      return "Any 60-degree rotation";
    case "none":
      return "None";
  }
}

function featureLabel(config: HexTileConfig): string {
  switch (config.purpose) {
    case "cards": {
      const throughCount = cardChannels(config).length;
      return throughCount === 0
        ? `${String(config.cardSlotCount)} card slots`
        : `${String(config.cardSlotCount)} card slots, ${String(throughCount)} through`;
    }
    case "dice-orbit":
      return "Outer ring + center cup";
    case "bowl":
      return config.bowlDivider ? "Two smooth wells" : "One smooth well";
  }
}

export function getHexTileSpec(config: HexTileConfig): HexTileSpec {
  const layout = calculateHexTileLayout(config);
  const material = estimatePrintMaterial(config);

  return {
    pointToPoint: layout.pointToPoint,
    acrossFlats: config.acrossFlats,
    totalHeight: layout.topHeight,
    usableInterior: layout.innerAcrossFlats,
    magnetCount: layout.magnetCount,
    magnetBackWall: config.rimWidth - layout.magnetSocketDepth,
    connectionLabel: connectionLabel(config),
    featureLabel: featureLabel(config),
    estimatedMaterialCm3: material.materialVolumeMm3 / 1000,
    estimatedPlaGrams: material.plaGrams,
    estimateInfillPercent: material.infillPercent,
  };
}
