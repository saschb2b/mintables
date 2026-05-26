import type { TubeConfig } from "./types";

export const MIN_PRINTABLE_WALL_MM = 0.4;

export type WallStatus = "ok" | "thin" | "invalid";

export interface TubeWallInfo {
  primary: number;
  secondary?: number;
  status: WallStatus;
  label: string;
}

export interface TubeSpecSummary {
  shapeLabel: string;
  innerLabel: string;
  innerValue: string;
  outerLabel: string;
  outerValue: string;
  length: number;
  wall: TubeWallInfo;
  volumeCm3: number | null;
}

function wallStatus(wall: number, innerOk: boolean): WallStatus {
  if (!innerOk || wall <= 0) return "invalid";
  if (wall < MIN_PRINTABLE_WALL_MM) return "thin";
  return "ok";
}

export function getTubeWallInfo(config: TubeConfig): TubeWallInfo {
  if (config.shape === "round") {
    const innerOk = config.innerDiameter < config.outerDiameter;
    const wall = (config.outerDiameter - config.innerDiameter) / 2;
    return {
      primary: wall,
      status: wallStatus(wall, innerOk),
      label: "Wall thickness",
    };
  }
  if (config.shape === "square") {
    const innerOk = config.innerSize < config.outerSize;
    const wall = (config.outerSize - config.innerSize) / 2;
    return {
      primary: wall,
      status: wallStatus(wall, innerOk),
      label: "Wall thickness",
    };
  }
  const innerOk =
    config.innerWidth < config.outerWidth &&
    config.innerHeight < config.outerHeight;
  const wallW = (config.outerWidth - config.innerWidth) / 2;
  const wallH = (config.outerHeight - config.innerHeight) / 2;
  const primary = Math.min(wallW, wallH);
  return {
    primary,
    secondary: Math.max(wallW, wallH),
    status: wallStatus(primary, innerOk),
    label: "Wall thickness (min)",
  };
}

function estimateTubeVolumeCm3(config: TubeConfig): number | null {
  const wall = getTubeWallInfo(config);
  if (wall.status === "invalid") return null;

  const lengthCm = config.length / 10;
  if (config.shape === "round") {
    const ro = config.outerDiameter / 20;
    const ri = config.innerDiameter / 20;
    return Math.PI * (ro * ro - ri * ri) * lengthCm;
  }
  if (config.shape === "square") {
    const so = config.outerSize / 10;
    const si = config.innerSize / 10;
    return (so * so - si * si) * lengthCm;
  }
  const ow = config.outerWidth / 10;
  const oh = config.outerHeight / 10;
  const iw = config.innerWidth / 10;
  const ih = config.innerHeight / 10;
  return (ow * oh - iw * ih) * lengthCm;
}

export function getTubeSpecSummary(config: TubeConfig): TubeSpecSummary {
  const wall = getTubeWallInfo(config);

  if (config.shape === "round") {
    return {
      shapeLabel: "Round",
      innerLabel: "Inner ⌀",
      innerValue: `${String(config.innerDiameter)} mm`,
      outerLabel: "Outer ⌀",
      outerValue: `${String(config.outerDiameter)} mm`,
      length: config.length,
      wall,
      volumeCm3: estimateTubeVolumeCm3(config),
    };
  }
  if (config.shape === "square") {
    return {
      shapeLabel: "Square",
      innerLabel: "Inner",
      innerValue: `${String(config.innerSize)} mm`,
      outerLabel: "Outer",
      outerValue: `${String(config.outerSize)} mm`,
      length: config.length,
      wall,
      volumeCm3: estimateTubeVolumeCm3(config),
    };
  }
  return {
    shapeLabel: "Rectangular",
    innerLabel: "Inner",
    innerValue: `${String(config.innerWidth)} × ${String(config.innerHeight)} mm`,
    outerLabel: "Outer",
    outerValue: `${String(config.outerWidth)} × ${String(config.outerHeight)} mm`,
    length: config.length,
    wall,
    volumeCm3: estimateTubeVolumeCm3(config),
  };
}
