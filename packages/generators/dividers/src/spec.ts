import type { DividerConfig } from "./types";

export interface DividerSpecSummary {
  thickness: number;
  width: number;
  height: number;
  volumeCm3: number;
}

export function getDividerSpecSummary(
  config: DividerConfig,
): DividerSpecSummary {
  // mm³ → cm³
  const volumeMm3 = config.thickness * config.width * config.height;
  return {
    thickness: config.thickness,
    width: config.width,
    height: config.height,
    volumeCm3: volumeMm3 / 1000,
  };
}
