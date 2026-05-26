import { Cylinder } from "lucide-react";
import type { Generator, GeneratorBadge } from "@mintables/shared/lib";
import {
  type TubeConfig,
  DEFAULT_ROUND_CONFIG,
  DEFAULT_SQUARE_CONFIG,
  DEFAULT_RECTANGULAR_CONFIG,
} from "./types";
import { validateTubeConfig } from "./validation";
import { generateTubeTriangles } from "./geometry";
import { getTubePrintTips } from "./print-tips";
import { TubeControls } from "./controls";
import { TubeScene } from "./scene";
import { TubeSummary } from "./summary";

function isObj(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

function mergeWithDefaults<T>(defaults: T, incoming: unknown): T {
  if (!isObj(incoming) || !isObj(defaults)) return defaults;
  const out: Record<string, unknown> = { ...defaults };
  for (const [k, defVal] of Object.entries(defaults)) {
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

function decodeTube(data: unknown): TubeConfig | null {
  if (!isObj(data)) return null;
  switch (data.shape) {
    case "round":
      return mergeWithDefaults(DEFAULT_ROUND_CONFIG, data);
    case "square":
      return mergeWithDefaults(DEFAULT_SQUARE_CONFIG, data);
    case "rectangular":
      return mergeWithDefaults(DEFAULT_RECTANGULAR_CONFIG, data);
    default:
      return null;
  }
}

function describeTube(c: TubeConfig): string {
  const parts: string[] = [];
  if (c.shape === "round") {
    parts.push(
      `Round tube — ${String(c.innerDiameter)}/${String(c.outerDiameter)}mm Ø`,
    );
  } else if (c.shape === "square") {
    parts.push(`Square tube — ${String(c.innerSize)}/${String(c.outerSize)}mm`);
  } else {
    parts.push(
      `Rectangular tube — ${String(c.innerWidth)}×${String(c.innerHeight)} / ${String(c.outerWidth)}×${String(c.outerHeight)}mm`,
    );
  }
  parts.push(`${String(c.length)}mm long`);
  if (c.clamshell.enabled) parts.push("clamshell split");
  if (c.flare.enabled && c.topCut.type === "flat") {
    parts.push(`press-fit (${c.flare.fitType})`);
  }
  if (c.topCut.type !== "flat") parts.push(`top: ${c.topCut.type}`);
  if (c.bottomCut.type !== "flat") parts.push(`bottom: ${c.bottomCut.type}`);
  return parts.join(", ");
}

function tubeBadges(c: TubeConfig): GeneratorBadge[] {
  const badges: GeneratorBadge[] = [];

  if (c.clamshell.enabled) {
    badges.push({ label: "Clamshell", color: "#06b6d4" });
  }
  if (c.flare.enabled && c.topCut.type === "flat") {
    badges.push({
      label: `Press-Fit (${c.flare.fitType})`,
      color: "#ec4899",
    });
  }
  if (c.topCut.type !== "flat") {
    badges.push({ label: `Top: ${c.topCut.type}`, color: "#a855f7" });
  }
  if (c.bottomCut.type !== "flat") {
    badges.push({ label: `Bottom: ${c.bottomCut.type}`, color: "#f97316" });
  }

  return badges;
}

function tubeFilename(c: TubeConfig): string {
  const clamshellSuffix = c.clamshell.enabled ? "-clamshell" : "";
  return `tube-${c.shape}${clamshellSuffix}-${String(c.length)}mm`;
}

export const tubeGenerator: Generator<TubeConfig> = {
  id: "tubes",
  meta: {
    name: "Tubes",
    tagline: "3D Printable Tube Generator",
    description:
      "Round, square, and rectangular tubes with press-fit flares, clamshell splits, and angled end cuts.",
    icon: Cylinder,
    accent: "#5a9a9d",
  },
  defaults: DEFAULT_ROUND_CONFIG,
  decode: decodeTube,
  validate: validateTubeConfig,
  geometry: generateTubeTriangles,
  axis: "z-up",
  filename: tubeFilename,
  describe: describeTube,
  printTips: getTubePrintTips,
  badges: tubeBadges,
  Controls: TubeControls,
  Scene: TubeScene,
  Summary: TubeSummary,
};

export type { TubeConfig } from "./types";
