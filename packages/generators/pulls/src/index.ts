import { Grip } from "lucide-react";
import type { Generator, GeneratorBadge } from "@mintables/shared/lib";
import {
  DEFAULT_ARC_PULL,
  DEFAULT_KNOB_PULL,
  DEFAULT_PULL_CONFIG,
  DEFAULT_TAB_PULL,
  type PullConfig,
} from "./types";
import { validatePullConfig } from "./validation";
import { generatePullTriangles } from "./geometry";
import { getPullPrintTips } from "./print-tips";
import { getPullSpec } from "./spec";
import { PullControls } from "./controls";
import { PullScene } from "./scene";
import { PullSummary } from "./summary";
import { PullIconArt } from "./icon-art";

function isObj(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

function mergeWithDefaults<T>(defaults: T, incoming: unknown): T {
  if (!isObj(incoming) || !isObj(defaults)) return defaults;
  const out: Record<string, unknown> = { ...(defaults as object) };
  for (const [k, defVal] of Object.entries(defaults as object)) {
    if (!(k in incoming)) continue;
    const incVal = incoming[k];
    if (typeof incVal === typeof defVal) out[k] = incVal;
  }
  return out as T;
}

function oneOf<T extends string>(value: unknown, allowed: T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

function decodePull(data: unknown): PullConfig | null {
  if (!isObj(data)) return null;
  switch (data.style) {
    case "knob": {
      const c = mergeWithDefaults(DEFAULT_KNOB_PULL, data);
      c.headShape = oneOf(c.headShape, ["dome", "flat", "dished"], "dome");
      c.mount = oneOf(c.mount, ["screws", "glue"], "screws");
      c.gripGrooves = Math.round(c.gripGrooves);
      return c;
    }
    case "tab": {
      const c = mergeWithDefaults(DEFAULT_TAB_PULL, data);
      c.tipStyle = oneOf(c.tipStyle, ["rounded", "square"], "rounded");
      c.mount = oneOf(c.mount, ["screws", "glue"], "screws");
      c.screwCount = Math.round(c.screwCount);
      return c;
    }
    case "arc": {
      const c = mergeWithDefaults(DEFAULT_ARC_PULL, data);
      c.barProfile = oneOf(c.barProfile, ["round", "flat"], "round");
      c.mount = oneOf(c.mount, ["screws", "glue"], "screws");
      return c;
    }
    default:
      return null;
  }
}

function describePull(c: PullConfig): string {
  const mount =
    c.mount === "screws"
      ? c.style === "tab"
        ? `${String(Math.round(c.screwCount))} countersunk screws`
        : "rear screw mount"
      : "glue-on";
  switch (c.style) {
    case "knob":
      return `${c.headShape === "dished" ? "Finger-dish" : c.headShape === "dome" ? "Domed" : "Flat-top"} knob, Ø ${String(c.headDiameter)} mm head, ${mount}`;
    case "tab":
      return `Angled lid tab, ${String(c.width)} mm wide, ${String(c.tabAngle)} degree blade, ${mount}`;
    case "arc":
      return `Arc handle, ${String(c.holeSpacing)} mm hole centers, ${String(c.rise)} mm rise, ${mount}`;
  }
}

function pullFilename(c: PullConfig): string {
  switch (c.style) {
    case "knob":
      return `pull-knob-${c.headShape}-d${String(c.headDiameter)}`;
    case "tab":
      return `pull-tab-w${String(c.width)}-a${String(c.tabAngle)}`;
    case "arc":
      return `pull-arc-${String(c.holeSpacing)}mm-r${String(c.rise)}`;
  }
}

function pullBadges(c: PullConfig): GeneratorBadge[] {
  const badges: GeneratorBadge[] = [];
  switch (c.style) {
    case "knob":
      badges.push({
        label:
          c.headShape === "dished"
            ? "Finger dish"
            : c.headShape === "dome"
              ? "Domed"
              : "Flat top",
        color: "#14b8a6",
      });
      if (Math.round(c.gripGrooves) > 0)
        badges.push({ label: "Grip rings", color: "#f59e0b" });
      break;
    case "tab":
      badges.push({
        label: `${String(c.tabAngle)}° blade`,
        color: "#14b8a6",
      });
      break;
    case "arc": {
      const spec = getPullSpec(c);
      badges.push({
        label: `${String(c.holeSpacing)} mm centers`,
        color: "#14b8a6",
      });
      if (spec.gripClearance !== undefined && spec.gripClearance >= 25)
        badges.push({ label: "Full-hand grip", color: "#84cc16" });
      break;
    }
  }
  badges.push(
    c.mount === "screws"
      ? { label: "Screw mount", color: "#0ea5e9" }
      : { label: "Glue-on", color: "#a855f7" },
  );
  return badges;
}

export const pullGenerator: Generator<PullConfig> = {
  id: "pulls",
  meta: {
    name: "Pulls",
    tagline: "Drawer & Lid Pull Generator",
    description:
      "Handles for drawers, lids, and boxes: turned knobs, angled lid tabs, and arc handles sized to standard hole spacings.",
    icon: Grip,
    accent: "#10b981",
    iconArt: PullIconArt,
  },
  defaults: DEFAULT_PULL_CONFIG,
  decode: decodePull,
  validate: validatePullConfig,
  geometry: generatePullTriangles,
  axis: "z-up",
  filename: pullFilename,
  describe: describePull,
  printTips: getPullPrintTips,
  badges: pullBadges,
  Controls: PullControls,
  Scene: PullScene,
  Summary: PullSummary,
};

export type { PullConfig } from "./types";
