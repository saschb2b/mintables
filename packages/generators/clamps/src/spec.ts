import { deriveClamp } from "./derived";
import { jawProfileArea } from "./geometry";
import type { ClampConfig } from "./types";

export interface ClampSpecSummary {
  boreDiameter: number;
  outerDiameter: number;
  mouthOpening: number;
  snapInterference: number;
  flexStrain: number;
  springThickness: number;
  rootThickness: number;
  /** Bed footprint (x = along rod, y = across). */
  footprintX: number;
  footprintY: number;
  overallHeight: number;
  /** Rough material volume in cm^3. */
  volumeCm3: number;
}

export function getClampSpecSummary(config: ClampConfig): ClampSpecSummary {
  const d = deriveClamp(config);
  const outerDiameter = 2 * d.outerRadius;

  const jawVolume = jawProfileArea(config) * config.jawWidth;

  let plateVolume = 0;
  let footprintX = outerDiameter;
  let footprintY = config.jawWidth;
  let overallHeight = config.jawWidth;

  if (config.mount === "plate") {
    const L = config.baseLength;
    const W = config.baseWidth;
    const stadiumArea = (L - W) * W + Math.PI * (W / 2) ** 2;
    const rs = config.screwDiameter / 2;
    const rh = config.headDiameter / 2;
    let holes = 2 * Math.PI * rs * rs * config.baseThickness;
    if (config.screwRecess === "counterbore") {
      holes += 2 * Math.PI * (rh * rh - rs * rs) * config.headDepth;
    } else if (config.screwRecess === "blended") {
      const radiusGrowth = rh - rs;
      const extraAreaIntegral =
        rs * radiusGrowth + (13 / 35) * radiusGrowth * radiusGrowth;
      holes += 2 * Math.PI * config.headDepth * extraAreaIntegral;
    } else if (config.screwRecess === "countersink") {
      // Conical frustum minus the shank hole it replaces, per hole.
      const h = rh - rs;
      holes +=
        2 *
        ((Math.PI * h * (rh * rh + rh * rs + rs * rs)) / 3 -
          Math.PI * rs * rs * h);
    }
    plateVolume = Math.max(0, stadiumArea * config.baseThickness - holes);
    footprintX = Math.max(L, config.jawWidth);
    footprintY = Math.max(W, outerDiameter);
    overallHeight = d.boreCenterZ + d.profileTop;
  } else {
    footprintX = outerDiameter;
    footprintY = d.outerRadius + d.profileTop;
    overallHeight = config.jawWidth;
  }

  return {
    boreDiameter: 2 * d.boreRadius,
    outerDiameter,
    mouthOpening: d.mouthOpening,
    snapInterference: d.snapInterference,
    flexStrain: d.flexStrain,
    springThickness: config.armThickness,
    rootThickness: config.rootThickness,
    footprintX,
    footprintY,
    overallHeight,
    volumeCm3: (jawVolume + plateVolume) / 1000,
  };
}
