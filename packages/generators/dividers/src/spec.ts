import { effectiveBottomWidth, type DividerConfig } from "./types";

export interface DividerSpecSummary {
  thickness: number;
  width: number;
  height: number;
  volumeCm3: number;
}

export function getDividerSpecSummary(
  config: DividerConfig,
): DividerSpecSummary {
  // Trapezoidal prism volume = (avg of top + bottom widths) * height * thickness.
  // Corner rounding only nibbles tiny amounts off the corners, so we ignore it
  // for the rough volume estimate — keeps the readout simple and stable.
  const avgWidth = (config.width + effectiveBottomWidth(config)) / 2;
  const volumeMm3 = config.thickness * avgWidth * config.height;
  return {
    thickness: config.thickness,
    width: config.width,
    height: config.height,
    volumeCm3: volumeMm3 / 1000,
  };
}
