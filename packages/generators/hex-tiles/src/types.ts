export type HexTilePurpose = "bowl" | "cards" | "dice-orbit";

export type HexTileMagnetMode = "none" | "single" | "captive" | "paired";

export type HexTileDividerAngle = 0 | 60 | 120;

export type HexTileSurfaceTexture =
  | "wood-grain"
  | "cobblestone"
  | "hammered-stone"
  | "sci-fi-panels"
  | "custom";

export interface HexTileConfig {
  purpose: HexTilePurpose;
  /** Finished distance between opposite flat sides. */
  acrossFlats: number;
  /** Standard body height before the optional raised base. */
  bodyHeight: number;
  /** Extra solid height below the purpose-specific top surface. */
  raiseHeight: number;
  rimWidth: number;
  floorThickness: number;
  edgeBevel: number;

  isSurfaceTextureEnabled: boolean;
  surfaceTexture: HexTileSurfaceTexture;
  /** Depth of the recessed top-surface relief. */
  surfaceTextureDepth: number;
  customTextureName: string;
  customTextureData: string;
  isCustomTextureInverted: boolean;

  magnetMode: HexTileMagnetMode;
  /** Diameter of a captive, axially magnetized rod. */
  magnetRodDiameter: number;
  /** Length of a captive, axially magnetized rod. */
  magnetRodLength: number;
  /** Additional room around the rod inside its captive chamber. */
  magnetRodClearance: number;
  /** Width of the undersized side opening that retains the vertical rod. */
  magnetLipOpening: number;
  /** Distance from the side wall to the full captive chamber. */
  magnetLipDepth: number;
  /** Diameter of each glue-in disc used by single and paired modes. */
  magnetDiameter: number;
  /** Thickness of each glue-in disc used by single and paired modes. */
  magnetDepth: number;
  magnetClearance: number;

  /** Vertical distance from the rim to the deepest bowl surface. */
  bowlDepth: number;
  bowlDivider: boolean;
  dividerAngle: HexTileDividerAngle;

  cardSlotCount: number;
  cardSlotWidth: number;
  cardSlotDepth: number;
  cardSlotLength: number;
  cardSlotSpacing: number;
  /**
   * How many slots run edge to edge so neighbouring tiles chain into a longer
   * slide. Channels are picked in symmetric pairs from the center outward.
   */
  cardSlotThroughCount: number;

  orbitCenterDiameter: number;
  orbitCenterRaise: number;
  orbitCenterDepth: number;
}

export const DEFAULT_HEX_TILE_CONFIG: HexTileConfig = {
  purpose: "bowl",
  acrossFlats: 100,
  bodyHeight: 16,
  raiseHeight: 0,
  rimWidth: 7,
  floorThickness: 3.2,
  edgeBevel: 1.2,

  isSurfaceTextureEnabled: false,
  surfaceTexture: "wood-grain",
  surfaceTextureDepth: 0.4,
  customTextureName: "",
  customTextureData: "",
  isCustomTextureInverted: false,

  magnetMode: "single",
  magnetRodDiameter: 3,
  magnetRodLength: 10,
  magnetRodClearance: 0.25,
  magnetLipOpening: 2.5,
  magnetLipDepth: 0.75,
  magnetDiameter: 8,
  magnetDepth: 3,
  magnetClearance: 0.25,

  bowlDepth: 10,
  bowlDivider: false,
  dividerAngle: 0,

  cardSlotCount: 5,
  cardSlotWidth: 2.2,
  cardSlotDepth: 9,
  cardSlotLength: 70,
  cardSlotSpacing: 12,
  cardSlotThroughCount: 2,

  orbitCenterDiameter: 36,
  orbitCenterRaise: 7,
  orbitCenterDepth: 4.5,
};
