import { Hexagon } from "lucide-react";
import type { Generator } from "@mintables/shared/lib";
import { HexTileControls } from "./controls";
import { generateHexTileTriangles } from "./geometry";
import { HexTileIconArt } from "./icon-art";
import { calculateHexTileLayout } from "./layout";
import { getHexTilePrintTips } from "./print-tips";
import { HexTileScene } from "./scene";
import { HexTileSummary } from "./summary";
import { surfaceTextureLabel } from "./surface-textures";
import {
  DEFAULT_HEX_TILE_CONFIG,
  type HexTileConfig,
  type HexTileDividerAngle,
  type HexTileMagnetMode,
  type HexTilePurpose,
  type HexTileSurfaceTexture,
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
  return value === "bowl" ||
    value === "cards" ||
    value === "deck" ||
    value === "dice-orbit" ||
    value === "pens" ||
    value === "plain" ||
    value === "rolling"
    ? value
    : fallback;
}

function magnetModeValue(
  value: unknown,
  fallback: HexTileMagnetMode,
): HexTileMagnetMode {
  return value === "none" ||
    value === "single" ||
    value === "captive" ||
    value === "paired"
    ? value
    : fallback;
}

function dividerAngleValue(
  value: unknown,
  fallback: HexTileDividerAngle,
): HexTileDividerAngle {
  return value === 0 || value === 60 || value === 120 ? value : fallback;
}

function surfaceTextureValue(
  value: unknown,
  fallback: HexTileSurfaceTexture,
): HexTileSurfaceTexture {
  return value === "wood-grain" ||
    value === "cobblestone" ||
    value === "hammered-stone" ||
    value === "sci-fi-panels" ||
    value === "custom"
    ? value
    : fallback;
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
    "surfaceTextureDepth",
    "magnetRodDiameter",
    "magnetRodLength",
    "magnetRodClearance",
    "magnetLipOpening",
    "magnetLipDepth",
    "magnetDiameter",
    "magnetDepth",
    "magnetClearance",
    "bowlDepth",
    "cardSlotCount",
    "cardSlotWidth",
    "cardSlotDepth",
    "cardSlotLength",
    "cardSlotSpacing",
    "cardSlotThroughCount",
    "orbitCenterDiameter",
    "orbitCenterRaise",
    "orbitCenterDepth",
    "rollDepth",
    "rollCornerRadius",
    "rollFloorFillet",
    "rollWallDraft",
    "deckCapacity",
    "deckCardThickness",
    "deckSlotCount",
    "deckSlotDepth",
    "penCornerExponent",
    "penCupWidth",
    "penCupHeight",
    "penWallThickness",
    "penLatticeRows",
    "penLatticeColumns",
    "penLatticeSlatWidth",
    "penSectionCount",
  ] as const) {
    config[key] = finiteNumber(data[key], config[key]);
  }
  config.purpose = purposeValue(data.purpose, config.purpose);
  config.magnetMode = magnetModeValue(data.magnetMode, config.magnetMode);
  config.dividerAngle = dividerAngleValue(
    data.dividerAngle,
    config.dividerAngle,
  );
  config.surfaceTexture = surfaceTextureValue(
    data.surfaceTexture,
    config.surfaceTexture,
  );
  if (typeof data.isSurfaceTextureEnabled === "boolean") {
    config.isSurfaceTextureEnabled = data.isSurfaceTextureEnabled;
  }
  if (typeof data.customTextureName === "string") {
    config.customTextureName = data.customTextureName.slice(0, 120);
  }
  if (typeof data.customTextureData === "string") {
    config.customTextureData = data.customTextureData.slice(0, 2048);
  }
  if (typeof data.isCustomTextureInverted === "boolean") {
    config.isCustomTextureInverted = data.isCustomTextureInverted;
  }
  config.isSurfaceTextureEdgeToEdge = edgeToEdgeValue(
    data,
    config.isSurfaceTextureEdgeToEdge,
  );
  config.bowlWellCount = wellCountValue(data, config.bowlWellCount);
  if (typeof data.isDeckCounterWellEnabled === "boolean") {
    config.isDeckCounterWellEnabled = data.isDeckCounterWellEnabled;
  }
  if (data.penShape === "superellipse" || data.penShape === "hexagon") {
    config.penShape = data.penShape;
  }
  if (
    data.penWallStyle === "solid" ||
    data.penWallStyle === "lattice" ||
    data.penWallStyle === "lined-lattice"
  ) {
    config.penWallStyle = data.penWallStyle;
  }
  if (
    data.penLatticePattern === "asanoha" ||
    data.penLatticePattern === "diamond"
  ) {
    config.penLatticePattern = data.penLatticePattern;
  }
  return config;
}

/**
 * Relief always stopped short of the face edge before this was a choice, so a
 * preset saved with a texture back then keeps the border it was saved with.
 */
function edgeToEdgeValue(
  data: Record<string, unknown>,
  fallback: boolean,
): boolean {
  if (typeof data.isSurfaceTextureEdgeToEdge === "boolean") {
    return data.isSurfaceTextureEdgeToEdge;
  }
  return data.isSurfaceTextureEnabled === true ? false : fallback;
}

/** Presets saved before the well count was a number carry a divider flag. */
function wellCountValue(
  data: Record<string, unknown>,
  fallback: number,
): number {
  if (typeof data.bowlWellCount === "number") {
    const rounded = Math.round(data.bowlWellCount);
    if (rounded >= 1 && rounded <= 3) return rounded;
    return fallback;
  }
  if (typeof data.bowlDivider === "boolean") return data.bowlDivider ? 2 : 1;
  return fallback;
}

function wellName(count: number): string {
  if (count === 3) return "three-well";
  return count === 2 ? "two-well" : "single";
}

function purposeLabel(config: HexTileConfig): string {
  if (config.purpose === "cards") return "card-rack";
  if (config.purpose === "deck") return "deck-cradle";
  if (config.purpose === "dice-orbit") return "dice-orbit";
  if (config.purpose === "pens") return "pen-holder";
  if (config.purpose === "plain") return "plain";
  if (config.purpose === "rolling") return "rolling-tray";
  return `${wellName(calculateHexTileLayout(config).bowlWellCount)}-bowl`;
}

function purposeBadge(config: HexTileConfig): string {
  switch (config.purpose) {
    case "cards":
      return "Card rack";
    case "deck":
      return `${String(config.deckSlotCount)}-deck cradle`;
    case "dice-orbit":
      return "Dice orbit";
    case "pens":
      return config.penWallStyle === "solid" ? "Pen holder" : "Kumiko pens";
    case "plain":
      return "Plain";
    case "rolling":
      return "Rolling tray";
    case "bowl": {
      const wells = calculateHexTileLayout(config).bowlWellCount;
      return wells === 1 ? "Bowl" : `${String(wells)}-well bowl`;
    }
  }
}

function magnetBadge(config: HexTileConfig, magnetCount: number): string {
  switch (config.magnetMode) {
    case "single":
      return `${String(magnetCount)} keyed magnets`;
    case "captive":
      return `${String(magnetCount)} keyed captive rods`;
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
      "Create connectable hex tiles: plain tiles to paint or build terrain on, smooth component bowls, card racks, dice rolling trays, kumiko pen holders, and elevated dice displays.",
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
    `tabletop-hex-${purposeLabel(config)}${config.isSurfaceTextureEnabled ? `-${config.surfaceTexture}` : ""}-${String(config.acrossFlats)}mm`,
  describe: (config) => {
    const layout = calculateHexTileLayout(config);
    const texture = config.isSurfaceTextureEnabled
      ? ` and ${surfaceTextureLabel(config.surfaceTexture).toLowerCase()} relief`
      : "";
    return `${String(config.acrossFlats)} mm magnetic hex ${purposeLabel(config)} tile with ${String(layout.magnetCount)} support-free magnet sockets${texture}`;
  },
  printTips: getHexTilePrintTips,
  badges: (config) => {
    const layout = calculateHexTileLayout(config);
    const badges = [
      {
        label: purposeBadge(config),
        color: "primary",
      },
      {
        label: magnetBadge(config, layout.magnetCount),
        color: "info",
      },
    ];
    if (config.isSurfaceTextureEnabled) {
      badges.push({
        label: surfaceTextureLabel(config.surfaceTexture),
        color: "secondary",
      });
    }
    return badges;
  },
  Controls: HexTileControls,
  Scene: HexTileScene,
  Summary: HexTileSummary,
};

export type { HexTileConfig } from "./types";
