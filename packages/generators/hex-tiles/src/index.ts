import { Hexagon } from "lucide-react";
import type { Generator } from "@mintables/shared/lib";
import { HexTileControls } from "./controls";
import { generateHexTileTriangles } from "./geometry";
import { HexTileIconArt } from "./icon-art";
import { calculateHexTileLayout } from "./layout";
import { getHexTilePrintTips } from "./print-tips";
import { HexTileScene } from "./scene";
import { HexTileSummary } from "./summary";
import {
  DEFAULT_HEX_TILE_CONFIG,
  type HexTileConfig,
  type HexTileDividerAngle,
  type HexTileMagnetMode,
  type HexTilePurpose,
} from "./types";
import { validateHexTileConfig } from "./validation";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function finiteNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function purposeValue(
  value: unknown,
  fallback: HexTilePurpose,
): HexTilePurpose {
  return value === "bowl" || value === "cards" || value === "dice-orbit"
    ? value
    : fallback;
}

function magnetModeValue(
  value: unknown,
  fallback: HexTileMagnetMode,
): HexTileMagnetMode {
  return value === "none" || value === "single" || value === "paired"
    ? value
    : fallback;
}

function dividerAngleValue(
  value: unknown,
  fallback: HexTileDividerAngle,
): HexTileDividerAngle {
  return value === 0 || value === 60 || value === 120 ? value : fallback;
}

export function decodeHexTile(data: unknown): HexTileConfig | null {
  if (!isObject(data)) return null;
  const config = { ...DEFAULT_HEX_TILE_CONFIG };
  for (const key of [
    "acrossFlats",
    "bodyHeight",
    "raiseHeight",
    "rimWidth",
    "floorThickness",
    "edgeBevel",
    "magnetDiameter",
    "magnetDepth",
    "magnetClearance",
    "bowlDepth",
    "cardSlotCount",
    "cardSlotWidth",
    "cardSlotDepth",
    "cardSlotLength",
    "cardSlotSpacing",
    "orbitCenterDiameter",
    "orbitCenterRaise",
    "orbitCenterDepth",
  ] as const) {
    config[key] = finiteNumber(data[key], config[key]);
  }
  config.purpose = purposeValue(data.purpose, config.purpose);
  config.magnetMode = magnetModeValue(data.magnetMode, config.magnetMode);
  config.dividerAngle = dividerAngleValue(
    data.dividerAngle,
    config.dividerAngle,
  );
  if (typeof data.bowlDivider === "boolean") {
    config.bowlDivider = data.bowlDivider;
  }
  return config;
}

function purposeLabel(config: HexTileConfig): string {
  if (config.purpose === "cards") return "card-rack";
  if (config.purpose === "dice-orbit") return "dice-orbit";
  return config.bowlDivider ? "divided-bowl" : "bowl";
}

function purposeBadge(config: HexTileConfig): string {
  switch (config.purpose) {
    case "cards":
      return "Card rack";
    case "dice-orbit":
      return "Dice orbit";
    case "bowl":
      return config.bowlDivider ? "Divided bowl" : "Bowl";
  }
}

function magnetBadge(config: HexTileConfig, magnetCount: number): string {
  switch (config.magnetMode) {
    case "single":
      return `${String(magnetCount)} keyed magnets`;
    case "paired":
      return `${String(magnetCount)} orientation-free magnets`;
    case "none":
      return "No magnets";
  }
}

export const hexTileGenerator: Generator<HexTileConfig> = {
  id: "hex-tiles",
  meta: {
    name: "Hex Tiles",
    tagline: "Magnetic Tabletop Tile Generator",
    description:
      "Create connectable hex tiles with smooth component bowls, card racks, divided wells, and elevated dice displays.",
    icon: Hexagon,
    accent: "#ef4444",
    iconArt: HexTileIconArt,
  },
  defaults: DEFAULT_HEX_TILE_CONFIG,
  decode: decodeHexTile,
  validate: validateHexTileConfig,
  geometry: generateHexTileTriangles,
  axis: "z-up",
  filename: (config) =>
    `tabletop-hex-${purposeLabel(config)}-${String(config.acrossFlats)}mm`,
  describe: (config) => {
    const layout = calculateHexTileLayout(config);
    return `${String(config.acrossFlats)} mm magnetic hex ${purposeLabel(config)} tile with ${String(layout.magnetCount)} support-free magnet sockets`;
  },
  printTips: getHexTilePrintTips,
  badges: (config) => {
    const layout = calculateHexTileLayout(config);
    return [
      {
        label: purposeBadge(config),
        color: "primary",
      },
      {
        label: magnetBadge(config, layout.magnetCount),
        color: "info",
      },
    ];
  },
  Controls: HexTileControls,
  Scene: HexTileScene,
  Summary: HexTileSummary,
};

export type { HexTileConfig } from "./types";
