import { Link2 } from "lucide-react";
import type { Generator, GeneratorBadge } from "@mintables/shared/lib";
import {
  type AdapterConfig,
  DEFAULT_ADAPTER_CONFIG,
  DEFAULT_RECTANGULAR_TUBE,
  DEFAULT_ROUND_TUBE,
  DEFAULT_SQUARE_TUBE,
  type TubeSpec,
} from "./types";
import { validateAdapterConfig } from "./validation";
import { generateAdapterTriangles } from "./geometry";
import { getAdapterPrintTips } from "./print-tips";
import { AdapterControls } from "./controls";
import { AdapterScene } from "./scene";
import { AdapterSummary } from "./summary";
import { AdapterIconArt } from "./icon-art";

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

/**
 * `TubeSpec` is a discriminated union — the field set depends on `shape`.
 * Pick the right default per shape so a round → square switch in an
 * incoming preset actually picks up `outerSize` instead of leaving the
 * round-only `outerDiameter` behind (which would crash the scene with
 * NaN downstream).
 */
function decodeTubeSpec(data: unknown, fallback: TubeSpec): TubeSpec {
  if (!isObj(data)) return fallback;
  switch (data.shape) {
    case "round":
      return mergeWithDefaults(DEFAULT_ROUND_TUBE, data);
    case "square":
      return mergeWithDefaults(DEFAULT_SQUARE_TUBE, data);
    case "rectangular":
      return mergeWithDefaults(DEFAULT_RECTANGULAR_TUBE, data);
    default:
      return fallback;
  }
}

function decodeAdapter(data: unknown): AdapterConfig | null {
  if (!isObj(data)) return null;
  const merged = mergeWithDefaults(DEFAULT_ADAPTER_CONFIG, data);
  // Re-decode endA / endB with shape-aware defaults so `mergeWithDefaults`
  // doesn't drop fields that don't exist in the round-default key set.
  // Fallback is the pristine config default — NOT `merged.endA`, which has
  // already been corrupted by mergeWithDefaults walking the round-only keys.
  return {
    ...merged,
    endA: decodeTubeSpec(data.endA, DEFAULT_ADAPTER_CONFIG.endA),
    endB: decodeTubeSpec(data.endB, DEFAULT_ADAPTER_CONFIG.endB),
  };
}

function describeAdapter(a: AdapterConfig): string {
  const sameShape = a.endA.shape === a.endB.shape;
  const type = sameShape
    ? `${a.endA.shape} adapter`
    : `${a.endA.shape} → ${a.endB.shape} adapter`;
  const bend = a.bendAngle > 0 ? `${String(a.bendAngle)}° elbow` : "straight";
  const fit =
    a.endAFit === "socket" && a.endBFit === "socket"
      ? "socket/socket"
      : `${a.endAFit}/${a.endBFit}`;
  return `${type}, ${bend}, ${fit}`;
}

function adapterBadges(a: AdapterConfig): GeneratorBadge[] {
  const badges: GeneratorBadge[] = [];

  if (a.endA.shape !== a.endB.shape) {
    badges.push({
      label: `${a.endA.shape} → ${a.endB.shape}`,
      color: "#3b82f6",
    });
  }
  if (a.endAFit !== "socket" || a.endBFit !== "socket") {
    badges.push({
      label: `A: ${a.endAFit} / B: ${a.endBFit}`,
      color: "#ec4899",
    });
  }
  if (a.bendAngle > 0) {
    badges.push({ label: `${String(a.bendAngle)}° elbow`, color: "#a855f7" });
  } else {
    badges.push({ label: "Straight coupling", color: "#22c55e" });
  }

  return badges;
}

function adapterFilename(a: AdapterConfig): string {
  return `adapter-${a.endA.shape}-to-${a.endB.shape}-${String(a.bendAngle)}deg`;
}

export const adapterGenerator: Generator<AdapterConfig> = {
  id: "adapters",
  meta: {
    name: "Adapters",
    tagline: "3D Printable Adapter Generator",
    description:
      "Press-fit connectors that bridge round, square, and rectangular tubes — straight or elbowed.",
    icon: Link2,
    accent: "#a855f7",
    iconArt: AdapterIconArt,
  },
  defaults: DEFAULT_ADAPTER_CONFIG,
  decode: decodeAdapter,
  validate: validateAdapterConfig,
  geometry: generateAdapterTriangles,
  axis: "y-up",
  filename: adapterFilename,
  describe: describeAdapter,
  printTips: getAdapterPrintTips,
  badges: adapterBadges,
  Controls: AdapterControls,
  Scene: AdapterScene,
  Summary: AdapterSummary,
};

export type { AdapterConfig } from "./types";
