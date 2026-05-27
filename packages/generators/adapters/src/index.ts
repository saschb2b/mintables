import { Link2 } from "lucide-react";
import type { Generator, GeneratorBadge } from "@mintables/shared/lib";
import { type AdapterConfig, DEFAULT_ADAPTER_CONFIG } from "./types";
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

function decodeAdapter(data: unknown): AdapterConfig | null {
  if (!isObj(data)) return null;
  return mergeWithDefaults(DEFAULT_ADAPTER_CONFIG, data);
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
