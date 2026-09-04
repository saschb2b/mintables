/**
 * Pure layout math shared by geometry, validation, spec and the scene. The
 * frame is z-up with the board face at y = 0: the plate occupies y in
 * [0, plateThickness], hooks reach into -y, bodies extend into +y, and the
 * printed part stands on z = 0 exactly as it hangs on the wall.
 */
import { hookColumnXs, maxHookColumns } from "./board";
import {
  rackHoleDiameters,
  type BodyConfig,
  type CupBody,
  type RackBody,
  type SkadisConfig,
  type SlotBody,
  type TrayBody,
} from "./types";

/** How far bodies sink into the plate so the union has no seam. */
export const BODY_OVERLAP = 0.4;
/** Round pockets sink this far into the plate to gain a contact chord. */
export const POCKET_INSET = 0.6;
/** Shelf margin outside the pocket lips so nothing meets at a tangent. */
export const SHELF_MARGIN = 1.2;
/** Narrowest plate ever produced, even for tiny bodies. */
export const PLATE_MIN_WIDTH = 16;

export const DEG = Math.PI / 180;

export interface HookFrame {
  /** Tab length from plate rear to lip rear: board + fit + lip. */
  reach: number;
  /** Total height of the hook profile (tab + hanging lip); must pass a 15 mm slot. */
  profileHeight: number;
  columns: number;
  columnXs: number[];
  /** z of each row's tab top, highest row first. */
  rowTops: number[];
}

export interface BodyFrame {
  width: number;
  /** Extent in +y measured from the plate's front face. */
  depth: number;
  height: number;
}

export interface SkadisDerived {
  plateWidth: number;
  plateHeight: number;
  plateThickness: number;
  hooks: HookFrame;
  body: BodyFrame;
  footprintX: number;
  /** Total depth: hook reach + plate + body. */
  footprintY: number;
  height: number;
}

/* ------------------------------------------------------------------ */
/* Cup                                                                 */
/* ------------------------------------------------------------------ */

export interface CupFrame {
  innerW: number;
  innerD: number;
  outerW: number;
  outerD: number;
  /** Corner radius of the inner outline (rect / stadium only). */
  innerR: number;
  outerR: number;
  /** z of the cavity floor before tilting (raised so the floor stays solid). */
  floorZ: number;
  /**
   * How far the cup sinks into the plate. Round cups would only touch the
   * plate along a line, so they sink deeper to gain a wide contact chord.
   */
  inset: number;
}

export function cupFrame(body: CupBody, plateThickness: number): CupFrame {
  const round = body.shape === "round";
  const innerW = round ? body.innerDiameter : body.innerWidth;
  const innerD = round ? body.innerDiameter : body.innerDepth;
  const outerW = innerW + 2 * body.wall;
  const outerD = innerD + 2 * body.wall;
  const innerR =
    body.shape === "stadium" ? Math.min(innerW, innerD) / 2 : round ? 0 : 2;
  const outerR = round ? 0 : innerR + body.wall;
  const theta = body.tilt * DEG;
  const floorZ =
    theta > 0
      ? (body.floor + (outerD - body.wall) * Math.sin(theta)) / Math.cos(theta)
      : body.floor;
  const inset = round
    ? Math.min(1.5, plateThickness / 2)
    : Math.min(BODY_OVERLAP, plateThickness / 2);
  return { innerW, innerD, outerW, outerD, innerR, outerR, floorZ, inset };
}

function cupBodyFrame(body: CupBody, plateThickness: number): BodyFrame {
  const f = cupFrame(body, plateThickness);
  const theta = body.tilt * DEG;
  return {
    width: f.outerW,
    depth:
      (f.outerD - f.inset) * Math.cos(theta) + body.height * Math.sin(theta),
    height: body.height * Math.cos(theta) + f.inset * Math.sin(theta),
  };
}

/* ------------------------------------------------------------------ */
/* Tray                                                                */
/* ------------------------------------------------------------------ */

export interface TrayPocket {
  x: number;
  y: number;
  /** 0 = rear row (against the plate), 1 = front row. */
  row: 0 | 1;
}

export interface TrayLayout {
  innerW: number;
  innerD: number;
  outerW: number;
  outerD: number;
  pitch: number;
  rowDy: number;
  width: number;
  depth: number;
  pockets: TrayPocket[];
  /** z of the shelf surface a pocket stands on. */
  shelfTop: (row: 0 | 1) => number;
  height: number;
}

export function trayLayout(body: TrayBody, plateThickness: number): TrayLayout {
  const round = body.pocketShape === "round";
  const innerW =
    (round ? body.pocketDiameter : body.pocketWidth) + 2 * body.clearance;
  const innerD =
    (round ? body.pocketDiameter : body.pocketDepth) + 2 * body.clearance;
  const outerW = innerW + 2 * body.lipThickness;
  const outerD = innerD + 2 * body.lipThickness;
  const pitch = outerW + body.gap;
  const n = Math.max(1, Math.round(body.pockets));
  const twoRows = body.rows === 2;
  const rowDy = round
    ? Math.max(Math.sqrt(Math.max(0, pitch * pitch - (pitch * pitch) / 4)), 1)
    : outerD + body.gap;
  const span = n * pitch - body.gap + (twoRows ? pitch / 2 : 0);
  const width = span + 2 * SHELF_MARGIN;
  const xs = Array.from({ length: n }, (_, i) => (i - (n - 1) / 2) * pitch);
  const rearY = plateThickness + outerD / 2 - POCKET_INSET;
  const pockets: TrayPocket[] = [];
  if (twoRows) {
    for (const x of xs) pockets.push({ x: x + pitch / 4, y: rearY, row: 0 });
    for (const x of xs)
      pockets.push({ x: x - pitch / 4, y: rearY + rowDy, row: 1 });
  } else {
    for (const x of xs) pockets.push({ x, y: rearY, row: 0 });
  }
  const shelfTop = (row: 0 | 1) =>
    body.shelfThickness + (twoRows && row === 0 ? body.rowStep : 0);
  const rearTop = shelfTop(0) + Math.max(body.lipHeight, body.guardHeight);
  const frontTop = twoRows ? shelfTop(1) + body.lipHeight : 0;
  return {
    innerW,
    innerD,
    outerW,
    outerD,
    pitch,
    rowDy,
    width,
    depth: (twoRows ? rowDy : 0) + outerD - POCKET_INSET + SHELF_MARGIN,
    pockets,
    shelfTop,
    height: Math.max(rearTop, frontTop),
  };
}

/* ------------------------------------------------------------------ */
/* Rack                                                                */
/* ------------------------------------------------------------------ */

export interface RackHole {
  x: number;
  d: number;
}

export interface RackLayout {
  holes: RackHole[];
  maxDiameter: number;
  width: number;
  barDepth: number;
  /** y of the hole centres at mid bar height. */
  holeY: number;
  /** Forward shift of the second tier so tilted holes stay collinear. */
  tierShift: number;
  height: number;
}

export function rackLayout(body: RackBody, plateThickness: number): RackLayout {
  const diameters = rackHoleDiameters(body);
  const maxDiameter = diameters.length ? Math.max(...diameters) : 0;
  const total = diameters.reduce((s, d) => s + d, 0);
  const width = total + (diameters.length + 1) * body.gap;
  const theta = body.tilt * DEG;
  const autoDepth =
    maxDiameter + 2 * body.gap + body.barThickness * Math.tan(theta);
  const barDepth = body.barDepth > 0 ? body.barDepth : autoDepth;
  const holes: RackHole[] = [];
  let cursor = -width / 2 + body.gap;
  for (const d of diameters) {
    holes.push({ x: cursor + d / 2, d });
    cursor += d + body.gap;
  }
  const tierShift = body.tiers === 2 ? body.tierSpacing * Math.tan(theta) : 0;
  return {
    holes,
    maxDiameter,
    width,
    barDepth,
    holeY: plateThickness + barDepth / 2,
    tierShift,
    height:
      body.tiers === 2
        ? body.tierSpacing + body.barThickness
        : body.barThickness,
  };
}

/* ------------------------------------------------------------------ */
/* Slot                                                                */
/* ------------------------------------------------------------------ */

export interface SlotLayout {
  width: number;
  /** y of the block's front face. */
  frontY: number;
  height: number;
  /** Pivot of each pocket: its rear-bottom edge before leaning back. */
  pivotY: number;
  pivotZ: number;
  /** y of the pocket's front-top edge (where the window starts). */
  frontTopY: number;
  xs: number[];
}

export function slotLayout(body: SlotBody, plateThickness: number): SlotLayout {
  const n = Math.max(1, Math.round(body.slots));
  const theta = body.tilt * DEG;
  const width = n * body.slotWidth + (n + 1) * body.wall;
  const xs = Array.from(
    { length: n },
    (_, i) =>
      -width / 2 +
      body.wall +
      body.slotWidth / 2 +
      i * (body.slotWidth + body.wall),
  );
  const pivotY = plateThickness + body.wall + body.slotHeight * Math.sin(theta);
  const pivotZ = body.openFloor ? 0 : body.floor;
  const frontBottomY = pivotY + body.slotDepth * Math.cos(theta);
  const frontTopY = frontBottomY - body.slotHeight * Math.sin(theta);
  return {
    width,
    frontY: frontBottomY + body.wall,
    height: pivotZ + body.slotHeight * Math.cos(theta),
    pivotY,
    pivotZ,
    frontTopY,
    xs,
  };
}

/* ------------------------------------------------------------------ */
/* Whole part                                                          */
/* ------------------------------------------------------------------ */

export function bodyFrame(body: BodyConfig, plateThickness: number): BodyFrame {
  switch (body.kind) {
    case "cup":
      return cupBodyFrame(body, plateThickness);
    case "tray": {
      const l = trayLayout(body, plateThickness);
      return { width: l.width, depth: l.depth, height: l.height };
    }
    case "rack": {
      const l = rackLayout(body, plateThickness);
      return {
        width: l.width,
        depth: l.barDepth + l.tierShift,
        height: l.height,
      };
    }
    case "slot": {
      const l = slotLayout(body, plateThickness);
      return {
        width: l.width,
        depth: l.frontY - plateThickness,
        height: l.height,
      };
    }
  }
}

export function deriveSkadis(config: SkadisConfig): SkadisDerived {
  const m = config.mount;
  const body = bodyFrame(config.body, m.plateThickness);
  const reach = m.boardThickness + m.fit + m.lipThickness;
  const profileHeight = m.tabHeight + m.lipDrop;
  const plateWidth =
    m.plateWidth > 0 ? m.plateWidth : Math.max(PLATE_MIN_WIDTH, body.width);
  // Below the tab the plate presses on the board and resists tip-forward
  // torque: keep about 20 mm there, like well-behaved published holders.
  const hookBand = m.hookInset + m.tabHeight + 20;
  const rowsBand =
    m.hookRows === 2 ? m.hookInset + m.rowSpacing + m.tabHeight + 20 : 0;
  const plateHeight =
    m.plateHeight > 0
      ? m.plateHeight
      : Math.max(body.height + 3, hookBand, rowsBand);
  const columns =
    m.hookColumns > 0
      ? Math.round(m.hookColumns)
      : Math.max(1, maxHookColumns(plateWidth, m.tabWidth));
  const rowTops = [plateHeight - m.hookInset];
  if (m.hookRows === 2) rowTops.push(plateHeight - m.hookInset - m.rowSpacing);
  return {
    plateWidth,
    plateHeight,
    plateThickness: m.plateThickness,
    hooks: {
      reach,
      profileHeight,
      columns,
      columnXs: hookColumnXs(columns),
      rowTops,
    },
    body,
    footprintX: Math.max(plateWidth, body.width),
    footprintY: reach + m.plateThickness + body.depth,
    height: Math.max(plateHeight, body.height),
  };
}
