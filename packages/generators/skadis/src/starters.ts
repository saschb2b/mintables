import {
  DEFAULT_CUP,
  DEFAULT_MOUNT,
  DEFAULT_RACK,
  DEFAULT_SLOT,
  DEFAULT_TRAY,
  type SkadisConfig,
} from "./types";

export interface SkadisStarter {
  id: string;
  label: string;
  /** What the preset was sized for. */
  hint: string;
  config: SkadisConfig;
}

const base = { mount: DEFAULT_MOUNT, showBoard: true };

export const SKADIS_STARTERS: SkadisStarter[] = [
  {
    id: "pencil-cup",
    label: "Pencil cup",
    hint: "Ø 60 mm, 90 mm tall, two drain holes",
    config: {
      ...base,
      body: { ...DEFAULT_CUP, innerDiameter: 60, height: 90, drainHoles: 2 },
    },
  },
  {
    id: "brush-cup",
    label: "Brush cup",
    hint: "Tilted 15°, front scoop, divided in two",
    config: {
      ...base,
      body: {
        ...DEFAULT_CUP,
        shape: "stadium",
        innerWidth: 70,
        innerDepth: 32,
        height: 70,
        tilt: 15,
        frontDip: 18,
        dividers: 1,
        drainHoles: 2,
      },
    },
  },
  {
    id: "paint-tray-35",
    label: "Paint bottles Ø35",
    hint: "Tamiya jars, Vallejo 60 ml, Citadel pots",
    config: {
      ...base,
      body: { ...DEFAULT_TRAY, pockets: 3, pocketDiameter: 35, lipHeight: 8 },
    },
  },
  {
    id: "dropper-rack",
    label: "Dropper bottles",
    hint: "Vallejo / Army Painter 17 ml, two staggered rows",
    config: {
      ...base,
      mount: { ...DEFAULT_MOUNT, hookRows: 2 },
      body: {
        ...DEFAULT_TRAY,
        pockets: 4,
        rows: 2,
        pocketDiameter: 26,
        lipHeight: 10,
        gap: 3,
        rowStep: 18,
      },
    },
  },
  {
    id: "glue-tray",
    label: "Glue bottles",
    hint: "Two Ø30 pockets with a tall back guard",
    config: {
      ...base,
      body: {
        ...DEFAULT_TRAY,
        pockets: 2,
        pocketDiameter: 30,
        lipHeight: 8,
        guardHeight: 45,
      },
    },
  },
  {
    id: "screwdriver-rack",
    label: "Screwdrivers",
    hint: "3 × Ø14 and 4 × Ø9, open at the front",
    config: {
      ...base,
      mount: { ...DEFAULT_MOUNT, plateHeight: 40 },
      body: {
        ...DEFAULT_RACK,
        groups: [
          { id: "g1", diameter: 14, count: 3 },
          { id: "g2", diameter: 9, count: 4 },
        ],
        gap: 7,
        frontSlot: 6,
        barThickness: 6,
      },
    },
  },
  {
    id: "precision-rack",
    label: "Precision drivers",
    hint: "8 × Ø8 holes, second tier keeps them upright",
    config: {
      ...base,
      mount: { ...DEFAULT_MOUNT, plateHeight: 60 },
      body: {
        ...DEFAULT_RACK,
        groups: [{ id: "g1", diameter: 8, count: 8 }],
        gap: 5,
        tiers: 2,
        tierSpacing: 45,
      },
    },
  },
  {
    id: "caliper-slot",
    label: "Caliper",
    hint: "18 × 5 mm pocket for the beam, leaning back",
    config: {
      ...base,
      body: { ...DEFAULT_SLOT, slotWidth: 18, slotDepth: 5, slotHeight: 35 },
    },
  },
  {
    id: "ruler-slots",
    label: "Rulers & files",
    hint: "Three 32 × 4 mm slots with a front window",
    config: {
      ...base,
      body: {
        ...DEFAULT_SLOT,
        slots: 3,
        slotWidth: 32,
        slotDepth: 4,
        slotHeight: 40,
        frontWindow: 15,
      },
    },
  },
  {
    id: "pliers-cradle",
    label: "Pliers cradle",
    hint: "Wide open-sided slot with the floor cut away",
    config: {
      ...base,
      body: {
        ...DEFAULT_SLOT,
        slots: 1,
        slotWidth: 40,
        slotDepth: 14,
        slotHeight: 30,
        openSides: true,
        openFloor: true,
        tilt: 0,
      },
    },
  },
];
