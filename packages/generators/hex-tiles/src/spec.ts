import { calculateHexTileLayout, throughChannels } from "./layout";
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
  deckSlotWidth: number;
  deckClearSpan: number;
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
    case "deck": {
      const wells = config.isDeckCounterWellEnabled ? " + corner wells" : "";
      return `${String(config.deckSlotCount)} x ${String(config.deckCapacity)} cards${wells}`;
    }
    case "cards": {
      const throughCount = throughChannels(config).length;
      return throughCount === 0
        ? `${String(config.cardSlotCount)} card slots`
        : `${String(config.cardSlotCount)} card slots, ${String(throughCount)} through`;
    }
    case "dice-orbit":
      return "Outer ring + center cup";
    case "pens": {
      const layout = calculateHexTileLayout(config);
      return `${layout.penOpeningWidth.toFixed(0)} mm pen cup, ~${String(layout.penCapacity)} pens`;
    }
    case "rolling":
      return `${calculateHexTileLayout(config).rollFloorAcrossFlats.toFixed(1)} mm rolling floor`;
    case "bowl": {
      const wells = calculateHexTileLayout(config).bowlWellCount;
      return wells === 1 ? "One smooth well" : `${String(wells)} smooth wells`;
    }
  }
}

export function getHexTileSpec(config: HexTileConfig): HexTileSpec {
  const layout = calculateHexTileLayout(config);
  const material = estimatePrintMaterial(config);

  return {
    pointToPoint: layout.pointToPoint,
    acrossFlats: config.acrossFlats,
    totalHeight: layout.overallHeight,
    usableInterior: layout.innerAcrossFlats,
    magnetCount: layout.magnetCount,
    magnetBackWall: config.rimWidth - layout.magnetSocketDepth,
    connectionLabel: connectionLabel(config),
    featureLabel: featureLabel(config),
    deckSlotWidth: layout.deckSlotWidth,
    deckClearSpan: layout.channelClearSpan,
    estimatedMaterialCm3: material.materialVolumeMm3 / 1000,
    estimatedPlaGrams: material.plaGrams,
    estimateInfillPercent: material.infillPercent,
  };
}
