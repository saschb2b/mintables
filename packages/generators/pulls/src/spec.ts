import { arcBarDepth, arcBarWidth, type PullConfig } from "./types";
import { arcFootOutline, knobProfile, tabProfile, type Pt2 } from "./geometry";

export interface PullSpec {
  /** Bounding footprint on the mounting surface, in mm. */
  footprintX: number;
  footprintY: number;
  /** How far the pull stands off the surface. */
  height: number;
  /** Rough material volume in cm3. */
  volumeCm3: number;
  /** Arc only: clear finger room under the bar apex. */
  gripClearance?: number;
  /** Arc only: length of each flat foot oval along the surface. */
  footLength?: number;
  /** Tab only: how far the blade tip reaches past the bend, horizontally. */
  bladeReach?: number;
}

function polygonArea(pts: Pt2[]): number {
  let sum = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    sum += a.x * b.y - b.x * a.y;
  }
  return Math.abs(sum) / 2;
}

/**
 * Exact solid-of-revolution volume from the knob's closed radial profile,
 * summing signed conical frustum slices; the pilot bore subtracts itself
 * because the profile walks it in the opposite direction.
 */
function revolvedVolume(profile: { r: number; z: number }[]): number {
  let sum = 0;
  for (let i = 0; i < profile.length - 1; i++) {
    const a = profile[i];
    const b = profile[i + 1];
    sum += ((a.z - b.z) * (a.r * a.r + a.r * b.r + b.r * b.r)) / 3;
  }
  return Math.abs(sum) * Math.PI;
}

export function getPullSpec(config: PullConfig): PullSpec {
  switch (config.style) {
    case "knob": {
      const profile = knobProfile(config);
      const maxR = Math.max(...profile.map((p) => p.r));
      const height = Math.max(...profile.map((p) => p.z));
      return {
        footprintX: maxR * 2,
        footprintY: maxR * 2,
        height,
        volumeCm3: revolvedVolume(profile) / 1000,
      };
    }
    case "tab": {
      const { pts } = tabProfile(config);
      const maxX = Math.max(...pts.map((p) => p.x));
      const maxZ = Math.max(...pts.map((p) => p.y));
      const screwVolume =
        config.mount === "screws"
          ? Math.round(config.screwCount) *
            Math.PI *
            (config.screwDiameter / 2) ** 2 *
            config.thickness
          : 0;
      return {
        footprintX: maxX,
        footprintY: config.width,
        height: maxZ,
        volumeCm3:
          Math.max(0, polygonArea(pts) * config.width - screwVolume) / 1000,
        bladeReach: maxX - config.baseLength,
      };
    }
    case "arc": {
      const depth = arcBarDepth(config);
      const width = arcBarWidth(config);
      const foot = arcFootOutline(config, 1);
      const footMinX = Math.min(...foot.map((p) => p.x));
      const footMaxX = Math.max(...foot.map((p) => p.x));
      const crossArea =
        config.barProfile === "round"
          ? Math.PI * (config.barDiameter / 2) ** 2
          : config.barWidth * config.barDepth * 0.98;
      // Approximate the centerline length as the arc through span and rise.
      const half = config.holeSpacing / 2;
      const radius =
        (config.rise * config.rise + half * half) / (2 * config.rise);
      const theta = Math.atan2(half, radius - config.rise);
      return {
        footprintX: footMaxX * 2,
        footprintY: width,
        height: config.rise + depth / 2,
        volumeCm3: (crossArea * radius * 2 * theta) / 1000,
        gripClearance: config.rise - depth / 2,
        footLength: footMaxX - footMinX,
      };
    }
  }
}
