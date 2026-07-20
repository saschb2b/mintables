export type InsertOutputPart = "tray" | "lid" | "both";

export type CompartmentAccess = "standard" | "finger" | "scoop" | "cards";

export interface InsertCompartment {
  /** Stable local id used by the editor and React list rendering. */
  id: string;
  /** Human-readable purpose. Stored with presets but not embossed. */
  label: string;
  /** Relative share of the clear row width. */
  widthShare: number;
  /** Extra material below this well, raising short pieces toward the rim. */
  floorLift: number;
  /** Retrieval treatment applied to this well. */
  access: CompartmentAccess;
}

export interface InsertRow {
  /** Stable local id used by the editor and React list rendering. */
  id: string;
  /** Relative share of the clear tray depth. */
  depthShare: number;
  compartments: InsertCompartment[];
}

export interface BoardGameInsertConfig {
  outputPart: InsertOutputPart;
  /** Finished exterior tray dimensions in millimeters. */
  width: number;
  depth: number;
  height: number;
  wallThickness: number;
  dividerThickness: number;
  floorThickness: number;
  /** How far access notches descend from the rim. */
  notchDepth: number;
  /** Horizontal run of a support-free token scoop. */
  scoopLength: number;
  rows: InsertRow[];
  /** Per-side fit gap between tray and lid skirt. */
  lidClearance: number;
  lidThickness: number;
  lidSkirtDepth: number;
}

export const MAX_INSERT_ROWS = 5;
export const MAX_COMPARTMENTS_PER_ROW = 6;
export const MAX_INSERT_COMPARTMENTS = 16;

export const DEFAULT_INSERT_CONFIG: BoardGameInsertConfig = {
  outputPart: "tray",
  width: 180,
  depth: 120,
  height: 32,
  wallThickness: 1.6,
  dividerThickness: 1.2,
  floorThickness: 1.2,
  notchDepth: 14,
  scoopLength: 18,
  rows: [
    {
      id: "row-1",
      depthShare: 55,
      compartments: [
        {
          id: "compartment-1",
          label: "Cards",
          widthShare: 62,
          floorLift: 0,
          access: "cards",
        },
        {
          id: "compartment-2",
          label: "Resources",
          widthShare: 38,
          floorLift: 5,
          access: "scoop",
        },
      ],
    },
    {
      id: "row-2",
      depthShare: 45,
      compartments: [
        {
          id: "compartment-3",
          label: "Player 1",
          widthShare: 35,
          floorLift: 7,
          access: "finger",
        },
        {
          id: "compartment-4",
          label: "Tokens",
          widthShare: 40,
          floorLift: 8,
          access: "scoop",
        },
        {
          id: "compartment-5",
          label: "Dice",
          widthShare: 25,
          floorLift: 3,
          access: "finger",
        },
      ],
    },
  ],
  lidClearance: 0.35,
  lidThickness: 1.2,
  lidSkirtDepth: 10,
};
