import { Armchair } from "lucide-react";
import type { Generator, GeneratorBadge } from "@mintables/shared/lib";
import {
  DEFAULT_LEGCAP_CONFIG,
  DEFAULT_OVAL_LEGCAP,
  DEFAULT_RECTANGULAR_LEGCAP,
  DEFAULT_ROUND_LEGCAP,
  DEFAULT_SQUARE_LEGCAP,
  type LegCapConfig,
} from "./types";
import { validateLegCapConfig } from "./validation";
import { generateLegCapTriangles } from "./geometry";
import { getLegCapPrintTips } from "./print-tips";
import { LegCapControls } from "./controls";
import { LegCapScene } from "./scene";
import { LegCapSummary } from "./summary";
import { LegCapIconArt } from "./icon-art";

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

function decodeLegCap(data: unknown): LegCapConfig | null {
  if (!isObj(data)) return null;
  switch (data.shape) {
    case "round":
      return mergeWithDefaults(DEFAULT_ROUND_LEGCAP, data);
    case "square":
      return mergeWithDefaults(DEFAULT_SQUARE_LEGCAP, data);
    case "rectangular":
      return mergeWithDefaults(DEFAULT_RECTANGULAR_LEGCAP, data);
    case "oval":
      return mergeWithDefaults(DEFAULT_OVAL_LEGCAP, data);
    default:
      return null;
  }
}

function describeLegCap(c: LegCapConfig): string {
  const parts: string[] = [];
  switch (c.shape) {
    case "round":
      parts.push(`Round leg cap, Ø ${String(c.innerDiameter)} mm`);
      break;
    case "square":
      parts.push(
        `Square leg cap, ${String(c.innerSize)}×${String(c.innerSize)} mm`,
      );
      break;
    case "rectangular":
      parts.push(
        `Rectangular leg cap, ${String(c.innerWidth)}×${String(c.innerHeight)} mm`,
      );
      break;
    case "oval":
      parts.push(
        `Oval leg cap, ${String(c.innerWidth)}×${String(c.innerHeight)} mm`,
      );
      break;
  }
  parts.push(`${String(c.capHeight)} mm tall`);
  parts.push(`${c.fitClearance.toFixed(2)} mm clearance`);
  if (c.innerTaperEnabled && c.innerTaper > 0) {
    parts.push(`${c.innerTaper.toFixed(2)} mm wedge`);
  }
  if (c.feltRecessEnabled) parts.push("felt recess");
  return parts.join(", ");
}

function legCapBadges(c: LegCapConfig): GeneratorBadge[] {
  const badges: GeneratorBadge[] = [];
  if (c.innerTaperEnabled && c.innerTaper > 0) {
    badges.push({ label: "Wedge fit", color: "#ec4899" });
  }
  if (c.feltRecessEnabled) {
    badges.push({ label: "Felt pad", color: "#06b6d4" });
  }
  return badges;
}

function legCapFilename(c: LegCapConfig): string {
  const dim =
    c.shape === "round"
      ? `${String(c.innerDiameter)}mm`
      : c.shape === "square"
        ? `${String(c.innerSize)}mm`
        : `${String(c.innerWidth)}x${String(c.innerHeight)}mm`;
  return `legcap-${c.shape}-${dim}-h${String(c.capHeight)}`;
}

export const legCapGenerator: Generator<LegCapConfig> = {
  id: "legcaps",
  meta: {
    name: "Leg Caps",
    tagline: "3D Printable Furniture Leg Cap Generator",
    description:
      "Slip-on floor caps for chair, table, and stool legs. Round, square, rectangular, or oval — sized to the leg you measured.",
    icon: Armchair,
    accent: "#84cc16",
    iconArt: LegCapIconArt,
  },
  defaults: DEFAULT_LEGCAP_CONFIG,
  decode: decodeLegCap,
  validate: validateLegCapConfig,
  geometry: generateLegCapTriangles,
  axis: "z-up",
  filename: legCapFilename,
  describe: describeLegCap,
  printTips: getLegCapPrintTips,
  badges: legCapBadges,
  Controls: LegCapControls,
  Scene: LegCapScene,
  Summary: LegCapSummary,
};

export type { LegCapConfig } from "./types";
