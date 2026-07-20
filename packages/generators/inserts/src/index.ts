import { PanelsTopLeft } from "lucide-react";
import type { Generator } from "@mintables/shared/lib";
import { InsertControls } from "./controls";
import { generateInsertTriangles } from "./geometry";
import { InsertIconArt } from "./icon-art";
import { calculateInsertLayout } from "./layout";
import { getInsertPrintTips } from "./print-tips";
import { InsertScene } from "./scene";
import { InsertSummary } from "./summary";
import {
  DEFAULT_INSERT_CONFIG,
  MAX_COMPARTMENTS_PER_ROW,
  MAX_INSERT_ROWS,
  type BoardGameInsertConfig,
  type CompartmentAccess,
  type InsertCompartment,
  type InsertOutputPart,
  type InsertRow,
} from "./types";
import { validateInsertConfig } from "./validation";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function finiteNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function decodedId(
  value: unknown,
  fallback: string,
  usedIds: Set<string>,
): string {
  const raw =
    typeof value === "string" && value.trim() ? value.trim() : fallback;
  let id = raw.slice(0, 64);
  let suffix = 2;
  while (usedIds.has(id)) {
    id = `${raw.slice(0, 56)}-${String(suffix)}`;
    suffix += 1;
  }
  usedIds.add(id);
  return id;
}

function decodeCompartment(
  value: unknown,
  index: number,
  usedIds: Set<string>,
): InsertCompartment | null {
  if (!isObject(value)) return null;
  const accessValues: CompartmentAccess[] = [
    "standard",
    "finger",
    "scoop",
    "cards",
  ];
  const access = accessValues.includes(value.access as CompartmentAccess)
    ? (value.access as CompartmentAccess)
    : "standard";
  return {
    id: decodedId(value.id, `compartment-${String(index + 1)}`, usedIds),
    label:
      typeof value.label === "string"
        ? value.label.slice(0, 48)
        : `Well ${String(index + 1)}`,
    widthShare: finiteNumber(value.widthShare, 100),
    floorLift: finiteNumber(value.floorLift, 0),
    access,
  };
}

function decodeRows(value: unknown): InsertRow[] | null {
  if (!Array.isArray(value)) return null;
  const usedIds = new Set<string>();
  return value.slice(0, MAX_INSERT_ROWS).flatMap((candidate, rowIndex) => {
    if (!isObject(candidate)) return [];
    const rawCompartments = Array.isArray(candidate.compartments)
      ? candidate.compartments.slice(0, MAX_COMPARTMENTS_PER_ROW)
      : [];
    const compartments = rawCompartments.flatMap((compartment, index) => {
      const decoded = decodeCompartment(compartment, index, usedIds);
      return decoded ? [decoded] : [];
    });
    return [
      {
        id: decodedId(candidate.id, `row-${String(rowIndex + 1)}`, usedIds),
        depthShare: finiteNumber(candidate.depthShare, 100),
        compartments,
      },
    ];
  });
}

export function decodeInsert(data: unknown): BoardGameInsertConfig | null {
  if (!isObject(data)) return null;
  const config: BoardGameInsertConfig = structuredClone(DEFAULT_INSERT_CONFIG);
  for (const key of [
    "width",
    "depth",
    "height",
    "wallThickness",
    "dividerThickness",
    "floorThickness",
    "notchDepth",
    "scoopLength",
    "lidClearance",
    "lidThickness",
    "lidSkirtDepth",
  ] as const) {
    config[key] = finiteNumber(data[key], config[key]);
  }
  const outputParts: InsertOutputPart[] = ["tray", "lid", "both"];
  if (outputParts.includes(data.outputPart as InsertOutputPart)) {
    config.outputPart = data.outputPart as InsertOutputPart;
  }
  const rows = decodeRows(data.rows);
  if (rows) config.rows = rows;
  return config;
}

function outputLabel(config: BoardGameInsertConfig): string {
  if (config.outputPart === "both") return "tray-and-lid";
  return config.outputPart;
}

function insertFilename(config: BoardGameInsertConfig): string {
  return `board-game-insert-${String(config.width)}x${String(config.depth)}x${String(config.height)}-${outputLabel(config)}`;
}

function describeInsert(config: BoardGameInsertConfig): string {
  const layout = calculateInsertLayout(config);
  const part =
    config.outputPart === "both"
      ? "tray and fitted lid"
      : config.outputPart === "lid"
        ? "fitted lid"
        : "tray";
  return `${String(config.width)} × ${String(config.depth)} × ${String(config.height)} mm board game ${part} with ${String(layout.compartmentCount)} custom compartments`;
}

export const insertGenerator: Generator<BoardGameInsertConfig> = {
  id: "inserts",
  meta: {
    name: "Game Inserts",
    tagline: "Custom Board Game Insert Generator",
    description:
      "Build table-ready organizer trays with uneven compartments, raised floors, card notches, token scoops, and fitted lids.",
    icon: PanelsTopLeft,
    accent: "#0ea5e9",
    iconArt: InsertIconArt,
  },
  defaults: DEFAULT_INSERT_CONFIG,
  decode: decodeInsert,
  validate: validateInsertConfig,
  geometry: generateInsertTriangles,
  axis: "z-up",
  filename: insertFilename,
  describe: describeInsert,
  printTips: getInsertPrintTips,
  badges: (config) => {
    const count = calculateInsertLayout(config).compartmentCount;
    return [
      { label: `${String(count)} wells`, color: "info" },
      {
        label:
          config.outputPart === "both"
            ? "Tray + lid"
            : config.outputPart === "lid"
              ? "Lid"
              : "Tray",
        color: "primary",
      },
    ];
  },
  Controls: InsertControls,
  Scene: InsertScene,
  Summary: InsertSummary,
};

export type { BoardGameInsertConfig } from "./types";
