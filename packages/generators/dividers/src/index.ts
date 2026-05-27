import { Rows3 } from "lucide-react";
import type { Generator } from "@mintables/shared/lib";
import { type DividerConfig, DEFAULT_DIVIDER_CONFIG } from "./types";
import { validateDividerConfig } from "./validation";
import { generateDividerTriangles } from "./geometry";
import { getDividerPrintTips } from "./print-tips";
import { DividerControls } from "./controls";
import { DividerScene } from "./scene";
import { DividerSummary } from "./summary";
import { DividerIconArt } from "./icon-art";

function isObj(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

function decodeDivider(data: unknown): DividerConfig | null {
  if (!isObj(data)) return null;
  const out: DividerConfig = { ...DEFAULT_DIVIDER_CONFIG };
  for (const k of [
    "thickness",
    "width",
    "height",
    "cornerRadius",
    "bottomWidth",
    "labelWidth",
    "labelHeight",
    "labelDepth",
  ] as const) {
    const v = data[k];
    if (typeof v === "number" && Number.isFinite(v)) out[k] = v;
  }
  if (typeof data.taperEnabled === "boolean") {
    out.taperEnabled = data.taperEnabled;
  }
  if (typeof data.labelEnabled === "boolean") {
    out.labelEnabled = data.labelEnabled;
  }
  if (
    data.labelPosition === "top" ||
    data.labelPosition === "center" ||
    data.labelPosition === "bottom"
  ) {
    out.labelPosition = data.labelPosition;
  }
  return out;
}

function describeDivider(c: DividerConfig): string {
  const taper =
    c.taperEnabled && c.bottomWidth !== c.width
      ? `, tapers to ${String(c.bottomWidth)} mm`
      : "";
  const radius = c.cornerRadius > 0 ? `, r${c.cornerRadius.toFixed(1)} mm` : "";
  const label = c.labelEnabled
    ? `, ${String(c.labelWidth)}×${String(c.labelHeight)} mm label pocket (${c.labelPosition})`
    : "";
  return `Divider ${String(c.width)}×${String(c.height)} mm, ${String(c.thickness)} mm thick${taper}${radius}${label}`;
}

function dividerFilename(c: DividerConfig): string {
  const taper =
    c.taperEnabled && c.bottomWidth !== c.width ? `-t${String(c.bottomWidth)}` : "";
  const radius = c.cornerRadius > 0 ? `-r${c.cornerRadius.toFixed(1)}` : "";
  const label = c.labelEnabled
    ? `-label${String(c.labelWidth)}x${String(c.labelHeight)}`
    : "";
  return `divider-${String(c.width)}x${String(c.height)}-${String(c.thickness)}mm${taper}${radius}${label}`;
}

export const dividerGenerator: Generator<DividerConfig> = {
  id: "dividers",
  meta: {
    name: "Dividers",
    tagline: "3D Printable Box Divider Generator",
    description:
      "Flat slab dividers for screw bins and small parts boxes. Pick thickness, width, and height — prints flat on the bed.",
    icon: Rows3,
    accent: "#f59e0b",
    iconArt: DividerIconArt,
  },
  defaults: DEFAULT_DIVIDER_CONFIG,
  decode: decodeDivider,
  validate: validateDividerConfig,
  geometry: generateDividerTriangles,
  axis: "z-up",
  filename: dividerFilename,
  describe: describeDivider,
  printTips: getDividerPrintTips,
  Controls: DividerControls,
  Scene: DividerScene,
  Summary: DividerSummary,
};

export type { DividerConfig } from "./types";
