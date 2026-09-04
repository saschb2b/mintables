export type BodyKind = "cup" | "tray" | "rack" | "slot";
export type CupShape = "round" | "rect" | "stadium";
export type PocketShape = "round" | "rect";

/** Backplate and hook settings shared by every body. */
export interface MountConfig {
  /** Hook columns across the plate; 0 = as many 40 mm columns as fit. */
  hookColumns: number;
  /** One row at the top of the plate, or a second row below it. */
  hookRows: 1 | 2;
  /** Vertical distance between hook rows (must sit on the 40 mm grid). */
  rowSpacing: 40 | 80;
  /** Gap between plate and lip, i.e. the board thickness the hook is cut for. */
  boardThickness: number;
  /** Extra gap between plate and lip so the hook slides on (+) or bites (-). */
  fit: number;
  /** Tab width across the 5 mm slot. */
  tabWidth: number;
  /** Vertical thickness of the tab that passes through the slot. */
  tabHeight: number;
  /** How far the lip hangs below the tab behind the board (push-down lock). */
  lipDrop: number;
  /** Thickness of the lip behind the board. */
  lipThickness: number;
  /** Distance from the plate's top edge down to the top of the hook tabs. */
  hookInset: number;
  /** Plate width; 0 = match the body. */
  plateWidth: number;
  /** Plate height; 0 = body height plus the hook band. */
  plateHeight: number;
  plateThickness: number;
  /** Radius of the two top corners of the plate. */
  cornerRadius: number;
}

/** Closed-bottom container for pencils, brushes and small tools. */
export interface CupBody {
  kind: "cup";
  shape: CupShape;
  /** Round cups: inner diameter. */
  innerDiameter: number;
  /** Rect / stadium cups: inner width (x) and depth (y). */
  innerWidth: number;
  innerDepth: number;
  height: number;
  wall: number;
  floor: number;
  /** Forward lean in degrees, hinged at the plate. */
  tilt: number;
  /** Depth of the finger scoop cut into the front wall (0 = none). */
  frontDip: number;
  /** Number of 4 mm drain holes in the floor (0 to 4). */
  drainHoles: number;
  /** Vertical divider walls splitting the cup along its width (0 to 4). */
  dividers: number;
}

/** Shelf with a raised lip per bottle, optional tall guard behind. */
export interface TrayBody {
  kind: "tray";
  /** Pockets per row. */
  pockets: number;
  /** Second, staggered row closer to the plate on a raised step. */
  rows: 1 | 2;
  pocketShape: PocketShape;
  /** Round pockets: object diameter (clearance is added separately). */
  pocketDiameter: number;
  /** Rect pockets: object width (x) and depth (y). */
  pocketWidth: number;
  pocketDepth: number;
  /** Radial clearance around the object. */
  clearance: number;
  /** Height of the lip ring around every pocket. */
  lipHeight: number;
  lipThickness: number;
  /** Wall left between neighbouring pockets. */
  gap: number;
  shelfThickness: number;
  /** Tall half-ring behind the rear pockets; 0 = none. */
  guardHeight: number;
  /** How much the rear row is raised when rows = 2. */
  rowStep: number;
}

export interface RackHoleGroup {
  /** Stable local id used by the editor and React list rendering. */
  id: string;
  diameter: number;
  count: number;
}

/** Bar with holes the object hangs in: screwdrivers, brushes, droppers. */
export interface RackBody {
  kind: "rack";
  /** Hole groups laid out left to right. */
  groups: RackHoleGroup[];
  /** Wall left between neighbouring holes and at each end. */
  gap: number;
  /** Width of the opening cut from every hole to the front; 0 = closed. */
  frontSlot: number;
  /** Bar depth from the plate; 0 = largest hole plus two gaps. */
  barDepth: number;
  barThickness: number;
  /** Second bar higher up with the same holes, for long tools. */
  tiers: 1 | 2;
  /** Height of the second bar above the first. */
  tierSpacing: number;
  /** Forward lean of the holes in degrees. */
  tilt: number;
}

/** Vertical pockets sized to a flat object: calipers, rulers, knives. */
export interface SlotBody {
  kind: "slot";
  slots: number;
  /** Pocket width (x). */
  slotWidth: number;
  /** Pocket depth (y), the object's thickness. */
  slotDepth: number;
  slotHeight: number;
  wall: number;
  floor: number;
  /** Cut the pocket through the floor so the object rests on the board. */
  openFloor: boolean;
  /** Backward lean of the pockets in degrees (top toward the plate). */
  tilt: number;
  /** Height of the window cut into the front wall; 0 = none. */
  frontWindow: number;
  /** Remove the outer side walls to make an open cradle. */
  openSides: boolean;
}

export type BodyConfig = CupBody | TrayBody | RackBody | SlotBody;

export interface SkadisConfig {
  mount: MountConfig;
  body: BodyConfig;
  /** Preview only: draw a translucent board with slots behind the holder. */
  showBoard: boolean;
}

export const MAX_RACK_GROUPS = 6;
export const MAX_RACK_HOLES = 24;

export const DEFAULT_MOUNT: MountConfig = {
  hookColumns: 0,
  hookRows: 1,
  rowSpacing: 40,
  boardThickness: 4.8,
  fit: 0,
  tabWidth: 4.5,
  tabHeight: 4.5,
  lipDrop: 7.5,
  lipThickness: 4.5,
  hookInset: 5,
  plateWidth: 0,
  plateHeight: 0,
  plateThickness: 3,
  cornerRadius: 4,
};

export const DEFAULT_CUP: CupBody = {
  kind: "cup",
  shape: "round",
  innerDiameter: 55,
  innerWidth: 60,
  innerDepth: 40,
  height: 80,
  wall: 2,
  floor: 2,
  tilt: 0,
  frontDip: 0,
  drainHoles: 0,
  dividers: 0,
};

export const DEFAULT_TRAY: TrayBody = {
  kind: "tray",
  pockets: 3,
  rows: 1,
  pocketShape: "round",
  pocketDiameter: 35,
  pocketWidth: 30,
  pocketDepth: 30,
  clearance: 0.6,
  lipHeight: 6,
  lipThickness: 1.6,
  gap: 4,
  shelfThickness: 3,
  guardHeight: 0,
  rowStep: 20,
};

export const DEFAULT_RACK: RackBody = {
  kind: "rack",
  groups: [{ id: "g1", diameter: 12, count: 5 }],
  gap: 6,
  frontSlot: 0,
  barDepth: 0,
  barThickness: 5,
  tiers: 1,
  tierSpacing: 60,
  tilt: 0,
};

export const DEFAULT_SLOT: SlotBody = {
  kind: "slot",
  slots: 1,
  slotWidth: 18,
  slotDepth: 5,
  slotHeight: 30,
  wall: 2.4,
  floor: 2,
  openFloor: false,
  tilt: 10,
  frontWindow: 0,
  openSides: false,
};

export const DEFAULT_BODIES: Record<BodyKind, BodyConfig> = {
  cup: DEFAULT_CUP,
  tray: DEFAULT_TRAY,
  rack: DEFAULT_RACK,
  slot: DEFAULT_SLOT,
};

export const DEFAULT_SKADIS_CONFIG: SkadisConfig = {
  mount: DEFAULT_MOUNT,
  body: DEFAULT_TRAY,
  showBoard: true,
};

/** Flatten rack hole groups into the ordered list of hole diameters. */
export function rackHoleDiameters(body: RackBody): number[] {
  const out: number[] = [];
  for (const group of body.groups) {
    const count = Math.max(0, Math.round(group.count));
    for (let i = 0; i < count; i++) out.push(group.diameter);
  }
  return out;
}
