export type HexTilePurpose = "bowl" | "cards" | "dice-orbit";

export type HexTileMagnetMode = "none" | "single" | "paired";

export type HexTileDividerAngle = 0 | 60 | 120;

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

  magnetMode: HexTileMagnetMode;
  magnetDiameter: number;
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

  magnetMode: "single",
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

  orbitCenterDiameter: 36,
  orbitCenterRaise: 7,
  orbitCenterDepth: 4.5,
};
