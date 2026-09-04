import { LayoutGrid } from "lucide-react";
import type { Generator, GeneratorBadge } from "@mintables/shared/lib";
import {
  isManifoldMeshExportable,
  loadCsg,
} from "@mintables/shared/lib/geometry/csg";
import {
  DEFAULT_BODIES,
  DEFAULT_MOUNT,
  DEFAULT_RACK,
  DEFAULT_SKADIS_CONFIG,
  MAX_RACK_GROUPS,
  rackHoleDiameters,
  type BodyConfig,
  type BodyKind,
  type MountConfig,
  type RackHoleGroup,
  type SkadisConfig,
} from "./types";
import { validateSkadisConfig } from "./validation";
import { generateSkadisTriangles } from "./geometry";
import { getSkadisPrintTips } from "./print-tips";
import { deriveSkadis } from "./derived";
import { SkadisControls } from "./controls";
import { SkadisScene } from "./scene";
import { SkadisSummary } from "./summary";
import { SkadisIconArt } from "./icon-art";

function isObj(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

function num(source: Record<string, unknown>, key: string, fallback: number) {
  const v = source[key];
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function bool(source: Record<string, unknown>, key: string, fallback: boolean) {
  const v = source[key];
  return typeof v === "boolean" ? v : fallback;
}

function oneOf<T extends string | number>(
  value: unknown,
  allowed: readonly T[],
  fallback: T,
): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

/** Copy every numeric / boolean field of `defaults` from `raw`, typed. */
function fill<T extends object>(defaults: T, raw: Record<string, unknown>): T {
  const out: Record<string, unknown> = {
    ...(defaults as Record<string, unknown>),
  };
  for (const [key, def] of Object.entries(defaults)) {
    if (typeof def === "number") out[key] = num(raw, key, def);
    else if (typeof def === "boolean") out[key] = bool(raw, key, def);
  }
  return out as T;
}

function decodeMount(raw: unknown): MountConfig {
  if (!isObj(raw)) return DEFAULT_MOUNT;
  const m = fill(DEFAULT_MOUNT, raw);
  m.hookRows = oneOf(raw.hookRows, [1, 2] as const, 1);
  m.rowSpacing = oneOf(raw.rowSpacing, [40, 80] as const, 40);
  m.hookColumns = Math.max(0, Math.round(m.hookColumns));
  return m;
}

function decodeGroups(raw: unknown): RackHoleGroup[] | null {
  if (!Array.isArray(raw)) return null;
  const groups: RackHoleGroup[] = [];
  raw.slice(0, MAX_RACK_GROUPS).forEach((entry, i) => {
    if (!isObj(entry)) return;
    groups.push({
      id: `g${String(i + 1)}`,
      diameter: num(entry, "diameter", 12),
      count: Math.max(1, Math.round(num(entry, "count", 1))),
    });
  });
  return groups.length > 0 ? groups : null;
}

function decodeBody(raw: unknown): BodyConfig | null {
  if (!isObj(raw)) return null;
  const kind = raw.kind;
  if (typeof kind !== "string" || !(kind in DEFAULT_BODIES)) return null;
  switch (kind as BodyKind) {
    case "cup": {
      const b = fill(DEFAULT_BODIES.cup, raw);
      if (b.kind !== "cup") return null;
      b.shape = oneOf(
        raw.shape,
        ["round", "rect", "stadium"] as const,
        "round",
      );
      b.drainHoles = Math.round(b.drainHoles);
      b.dividers = Math.round(b.dividers);
      return b;
    }
    case "tray": {
      const b = fill(DEFAULT_BODIES.tray, raw);
      if (b.kind !== "tray") return null;
      b.pocketShape = oneOf(
        raw.pocketShape,
        ["round", "rect"] as const,
        "round",
      );
      b.rows = oneOf(raw.rows, [1, 2] as const, 1);
      b.pockets = Math.round(b.pockets);
      return b;
    }
    case "rack": {
      const b = fill(DEFAULT_BODIES.rack, raw);
      if (b.kind !== "rack") return null;
      b.tiers = oneOf(raw.tiers, [1, 2] as const, 1);
      b.groups = decodeGroups(raw.groups) ?? DEFAULT_RACK.groups;
      return b;
    }
    case "slot": {
      const b = fill(DEFAULT_BODIES.slot, raw);
      if (b.kind !== "slot") return null;
      b.slots = Math.round(b.slots);
      return b;
    }
  }
}

function decodeSkadis(data: unknown): SkadisConfig | null {
  if (!isObj(data)) return null;
  const body = decodeBody(data.body);
  if (!body) return null;
  return {
    mount: decodeMount(data.mount),
    body,
    showBoard: bool(data, "showBoard", true),
  };
}

function bodyLabel(c: SkadisConfig): string {
  const b = c.body;
  switch (b.kind) {
    case "cup":
      return b.shape === "round"
        ? `Ø ${String(b.innerDiameter)} mm cup`
        : `${String(b.innerWidth)} × ${String(b.innerDepth)} mm ${b.shape} cup`;
    case "tray": {
      const size =
        b.pocketShape === "round"
          ? `Ø ${String(b.pocketDiameter)}`
          : `${String(b.pocketWidth)} × ${String(b.pocketDepth)}`;
      return `${String(Math.round(b.pockets) * b.rows)}-pocket tray, ${size} mm`;
    }
    case "rack":
      return `${String(rackHoleDiameters(b).length)}-hole rack`;
    case "slot":
      return `${String(Math.round(b.slots))}-slot holder, ${String(b.slotWidth)} × ${String(b.slotDepth)} mm`;
  }
}

function describeSkadis(c: SkadisConfig): string {
  const d = deriveSkadis(c);
  return `SKÅDIS ${bodyLabel(c)}, ${String(d.hooks.columns * d.hooks.rowTops.length)} hooks`;
}

function skadisFilename(c: SkadisConfig): string {
  const d = deriveSkadis(c);
  const hooks = `${String(d.hooks.columns)}x${String(d.hooks.rowTops.length)}hooks`;
  const b = c.body;
  switch (b.kind) {
    case "cup":
      return b.shape === "round"
        ? `skadis-cup-d${String(b.innerDiameter)}-h${String(b.height)}-${hooks}`
        : `skadis-cup-${String(b.innerWidth)}x${String(b.innerDepth)}-h${String(b.height)}-${hooks}`;
    case "tray": {
      const size =
        b.pocketShape === "round"
          ? `d${String(b.pocketDiameter)}`
          : `${String(b.pocketWidth)}x${String(b.pocketDepth)}`;
      return `skadis-tray-${String(Math.round(b.pockets) * b.rows)}x${size}-${hooks}`;
    }
    case "rack":
      return `skadis-rack-${String(rackHoleDiameters(b).length)}holes-${hooks}`;
    case "slot":
      return `skadis-slot-${String(Math.round(b.slots))}x${String(b.slotWidth)}x${String(b.slotDepth)}-${hooks}`;
  }
}

function skadisBadges(c: SkadisConfig): GeneratorBadge[] {
  const d = deriveSkadis(c);
  const badges: GeneratorBadge[] = [
    {
      label: `${String(d.hooks.columns)} × ${String(d.hooks.rowTops.length)} hooks`,
      color: "#0ea5e9",
    },
  ];
  const b = c.body;
  switch (b.kind) {
    case "cup":
      badges.push({ label: `${String(b.height)} mm cup`, color: "#14b8a6" });
      if (b.tilt > 0)
        badges.push({ label: `${String(b.tilt)}° tilt`, color: "#f59e0b" });
      break;
    case "tray":
      badges.push({
        label: `${String(Math.round(b.pockets) * b.rows)} pockets`,
        color: "#14b8a6",
      });
      if (b.guardHeight > b.lipHeight)
        badges.push({ label: "Back guard", color: "#a855f7" });
      break;
    case "rack":
      badges.push({
        label: `${String(rackHoleDiameters(b).length)} holes`,
        color: "#14b8a6",
      });
      if (b.frontSlot > 0)
        badges.push({ label: "Front slot", color: "#a855f7" });
      if (b.tiers === 2) badges.push({ label: "Two tiers", color: "#84cc16" });
      break;
    case "slot":
      badges.push({
        label: `${String(Math.round(b.slots))} slots`,
        color: "#14b8a6",
      });
      if (b.tilt > 0)
        badges.push({ label: `${String(b.tilt)}° lean`, color: "#f59e0b" });
      break;
  }
  return badges;
}

export const skadisGenerator: Generator<SkadisConfig> = {
  id: "skadis",
  meta: {
    name: "Skådis",
    tagline: "IKEA SKÅDIS Pegboard Holder Generator",
    description:
      "Cups, bottle trays, tool racks and slot holders that hook straight into an IKEA SKÅDIS pegboard, sized to whatever you want on the wall.",
    icon: LayoutGrid,
    accent: "#e11d48",
    iconArt: SkadisIconArt,
  },
  defaults: DEFAULT_SKADIS_CONFIG,
  decode: decodeSkadis,
  validate: validateSkadisConfig,
  geometry: generateSkadisTriangles,
  isExportableMesh: isManifoldMeshExportable,
  prepare: async () => {
    await loadCsg();
  },
  axis: "z-up",
  filename: skadisFilename,
  describe: describeSkadis,
  printTips: getSkadisPrintTips,
  badges: skadisBadges,
  Controls: SkadisControls,
  Scene: SkadisScene,
  Summary: SkadisSummary,
};

export type { SkadisConfig } from "./types";
