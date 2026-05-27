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
  for (const k of ["thickness", "width", "height"] as const) {
    const v = data[k];
    if (typeof v === "number" && Number.isFinite(v)) out[k] = v;
  }
  return out;
}

function describeDivider(c: DividerConfig): string {
  return `Divider ${String(c.width)}×${String(c.height)} mm, ${String(c.thickness)} mm thick`;
}

function dividerFilename(c: DividerConfig): string {
  return `divider-${String(c.width)}x${String(c.height)}-${String(c.thickness)}mm`;
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
