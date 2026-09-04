import {
  deriveSkadis,
  rackLayout,
  slotLayout,
  trayLayout,
  cupFrame,
} from "./derived";
import { rackHoleDiameters, type SkadisConfig } from "./types";

export interface SkadisSpec {
  footprintX: number;
  /** Total depth including the hooks behind the board. */
  footprintY: number;
  height: number;
  plateWidth: number;
  plateHeight: number;
  hookColumns: number;
  hookRows: number;
  /** Tab length behind the plate. */
  hookReach: number;
  /** Human description of what the body holds. */
  capacity: string;
  /** Rough material volume in cm3 (the CSG build reports the exact figure). */
  volumeCm3: number;
}

function bodyVolume(config: SkadisConfig, plateThickness: number): number {
  const b = config.body;
  switch (b.kind) {
    case "cup": {
      const f = cupFrame(b, plateThickness);
      const outerArea =
        b.shape === "round"
          ? Math.PI * (f.outerW / 2) ** 2
          : f.outerW * f.outerD;
      const innerArea =
        b.shape === "round"
          ? Math.PI * (f.innerW / 2) ** 2
          : f.innerW * f.innerD;
      return outerArea * b.height - innerArea * (b.height - b.floor);
    }
    case "tray": {
      const L = trayLayout(b, plateThickness);
      const shelf = L.width * L.depth * b.shelfThickness;
      const ringArea =
        b.pocketShape === "round"
          ? Math.PI * ((L.outerW / 2) ** 2 - (L.innerW / 2) ** 2)
          : L.outerW * L.outerD - L.innerW * L.innerD;
      const rings = L.pockets.reduce(
        (sum, p) =>
          sum +
          ringArea *
            (b.lipHeight +
              (p.row === 0 && b.guardHeight > b.lipHeight
                ? (b.guardHeight - b.lipHeight) / 2
                : 0)),
        0,
      );
      const step =
        b.rows === 2
          ? (L.width / 2) * (L.outerD / 2 + plateThickness) * b.rowStep
          : 0;
      return shelf + rings + step;
    }
    case "rack": {
      const L = rackLayout(b, plateThickness);
      const holes = rackHoleDiameters(b).reduce(
        (sum, d) => sum + Math.PI * (d / 2) ** 2,
        0,
      );
      const bar = (L.width * L.barDepth - holes) * b.barThickness;
      const gusset =
        b.tiers === 2 ? (L.width * L.barDepth * L.barDepth) / 2 : 0;
      return bar * b.tiers + gusset;
    }
    case "slot": {
      const L = slotLayout(b, plateThickness);
      const block = L.width * (L.frontY - plateThickness) * L.height;
      const pockets = L.xs.length * b.slotWidth * b.slotDepth * b.slotHeight;
      return block - pockets;
    }
  }
}

function capacity(config: SkadisConfig): string {
  const b = config.body;
  switch (b.kind) {
    case "cup":
      return b.shape === "round"
        ? `Ø ${String(b.innerDiameter)} × ${String(b.height)} mm cup`
        : `${String(b.innerWidth)} × ${String(b.innerDepth)} × ${String(b.height)} mm cup`;
    case "tray": {
      const n = Math.round(b.pockets) * b.rows;
      const size =
        b.pocketShape === "round"
          ? `Ø ${String(b.pocketDiameter)}`
          : `${String(b.pocketWidth)} × ${String(b.pocketDepth)}`;
      return `${String(n)} × ${size} mm pockets`;
    }
    case "rack": {
      const holes = rackHoleDiameters(b);
      const sizes = [...new Set(holes)].map((d) => `Ø ${String(d)}`).join(", ");
      return `${String(holes.length)} holes (${sizes} mm)`;
    }
    case "slot":
      return `${String(Math.round(b.slots))} × ${String(b.slotWidth)} × ${String(b.slotDepth)} mm slots`;
  }
}

export function getSkadisSpec(config: SkadisConfig): SkadisSpec {
  const d = deriveSkadis(config);
  const m = config.mount;
  const plate = d.plateWidth * d.plateHeight * m.plateThickness;
  const hookOne =
    m.tabWidth * (m.tabHeight * d.hooks.reach + m.lipThickness * m.lipDrop);
  const hooks = hookOne * d.hooks.columns * d.hooks.rowTops.length;
  return {
    footprintX: d.footprintX,
    footprintY: d.footprintY,
    height: d.height,
    plateWidth: d.plateWidth,
    plateHeight: d.plateHeight,
    hookColumns: d.hooks.columns,
    hookRows: d.hooks.rowTops.length,
    hookReach: d.hooks.reach,
    capacity: capacity(config),
    volumeCm3: (plate + hooks + bodyVolume(config, m.plateThickness)) / 1000,
  };
}
