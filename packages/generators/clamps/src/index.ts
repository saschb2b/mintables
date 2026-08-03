import { Magnet } from "lucide-react";
import type { Generator, GeneratorBadge } from "@mintables/shared/lib";
import { DEFAULT_CLAMP_CONFIG, type ClampConfig } from "./types";
import { deriveClamp } from "./derived";
import { validateClampConfig } from "./validation";
import { generateClampTriangles } from "./geometry";
import { getClampPrintTips } from "./print-tips";
import { ClampControls } from "./controls";
import { ClampScene } from "./scene";
import { ClampSummary } from "./summary";
import { ClampIconArt } from "./icon-art";

function isObj(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

function mergeWithDefaults<T>(defaults: T, incoming: unknown): T {
  if (!isObj(incoming) || !isObj(defaults)) return defaults;
  const out: Record<string, unknown> = { ...(defaults as object) };
  for (const [k, defVal] of Object.entries(defaults as object)) {
    if (!(k in incoming)) continue;
    const incVal = incoming[k];
    if (isObj(defVal)) {
      out[k] = mergeWithDefaults(defVal, incVal);
    } else if (typeof incVal === typeof defVal) {
      out[k] = incVal;
    }
  }
  return out as T;
}

function decodeClamp(data: unknown): ClampConfig | null {
  if (!isObj(data)) return null;
  const merged = mergeWithDefaults(DEFAULT_CLAMP_CONFIG, data);
  if (merged.tipStyle !== "bulb" && merged.tipStyle !== "plain") {
    merged.tipStyle = DEFAULT_CLAMP_CONFIG.tipStyle;
  }
  if (merged.mount !== "plate" && merged.mount !== "clip") {
    merged.mount = DEFAULT_CLAMP_CONFIG.mount;
  }
  if (
    merged.screwRecess !== "counterbore" &&
    merged.screwRecess !== "countersink" &&
    merged.screwRecess !== "blended" &&
    merged.screwRecess !== "plain"
  ) {
    merged.screwRecess = DEFAULT_CLAMP_CONFIG.screwRecess;
  }
  return merged;
}

function describeClamp(c: ClampConfig): string {
  const parts: string[] = [
    `Snap clamp for Ø ${String(c.rodDiameter)} mm rod`,
    `${String(c.wrapAngle)}° wrap`,
    `${String(c.jawWidth)} mm wide`,
  ];
  if (c.tipStyle === "bulb") parts.push("bulb tips");
  if (c.mount === "plate") {
    parts.push(
      `${String(c.baseLength)}×${String(c.baseWidth)} mm base, holes @ ${String(c.holeSpacing)} mm`,
    );
  } else {
    parts.push("bare clip");
  }
  return parts.join(", ");
}

function clampBadges(c: ClampConfig): GeneratorBadge[] {
  const badges: GeneratorBadge[] = [];
  const d = deriveClamp(c);
  if (d.snapInterference > 0.3) {
    badges.push({ label: "Snap fit", color: "#f97316" });
  }
  badges.push(
    c.mount === "plate"
      ? { label: "Screw-on", color: "#3b82f6" }
      : { label: "Bare clip", color: "#22c55e" },
  );
  return badges;
}

function clampFilename(c: ClampConfig): string {
  return `clamp-d${String(c.rodDiameter)}-${String(c.wrapAngle)}deg-w${String(c.jawWidth)}-${c.mount}`;
}

export const clampGenerator: Generator<ClampConfig> = {
  id: "clamps",
  meta: {
    name: "Clamps",
    tagline: "3D Printable Snap-Fit Rod Clamp Generator",
    description:
      "Engineered snap-on clamps with tapered spring arms, reinforced roots, rounded bulb tips, and a screw-on base plate.",
    icon: Magnet,
    accent: "#f97316",
    iconArt: ClampIconArt,
  },
  defaults: DEFAULT_CLAMP_CONFIG,
  decode: decodeClamp,
  validate: validateClampConfig,
  geometry: generateClampTriangles,
  axis: "z-up",
  filename: clampFilename,
  describe: describeClamp,
  printTips: getClampPrintTips,
  badges: clampBadges,
  Controls: ClampControls,
  Scene: ClampScene,
  Summary: ClampSummary,
};

export type { ClampConfig } from "./types";
