import { outerBounds, type LegCapConfig } from "./types";

export interface LegCapSpecSummary {
  outerWidth: number;
  outerHeight: number;
  totalHeight: number;
  socketHeight: number;
  floorThickness: number;
  wallThickness: number;
  /** Rough material volume in cm³. Subtracts the socket cavity from the outer block. */
  volumeCm3: number;
}

/**
 * Estimate the volume of the cap. Treats the outer profile as its bounding
 * rectangle (or the ellipse area for round/oval) and the socket as a
 * straight prism. The taper, felt recess, and corner rounding nibble a few
 * percent off in reality but aren't worth tracking precisely for the spec
 * readout — slicers report the real value anyway.
 */
export function getLegCapSpecSummary(
  config: LegCapConfig,
): LegCapSpecSummary {
  const outer = outerBounds(config);
  const totalHeight = config.floorThickness + config.capHeight;

  const outerArea =
    config.shape === "round"
      ? Math.PI * (outer.width / 2) * (outer.height / 2)
      : config.shape === "oval"
        ? Math.PI * (outer.width / 2) * (outer.height / 2)
        : outer.width * outer.height;

  let innerW: number;
  let innerH: number;
  switch (config.shape) {
    case "round":
      innerW = config.innerDiameter + config.fitClearance;
      innerH = innerW;
      break;
    case "square":
      innerW = config.innerSize + config.fitClearance;
      innerH = innerW;
      break;
    case "rectangular":
    case "oval":
      innerW = config.innerWidth + config.fitClearance;
      innerH = config.innerHeight + config.fitClearance;
      break;
  }
  const innerArea =
    config.shape === "round" || config.shape === "oval"
      ? Math.PI * (innerW / 2) * (innerH / 2)
      : innerW * innerH;

  const wallVolume = (outerArea - innerArea) * config.capHeight;
  const floorVolume = outerArea * config.floorThickness;
  const volumeMm3 = Math.max(0, wallVolume + floorVolume);

  return {
    outerWidth: outer.width,
    outerHeight: outer.height,
    totalHeight,
    socketHeight: config.capHeight,
    floorThickness: config.floorThickness,
    wallThickness: config.wallThickness,
    volumeCm3: volumeMm3 / 1000,
  };
}
