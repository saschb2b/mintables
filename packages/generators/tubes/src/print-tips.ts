import {
  sortPrintTips,
  type PrintTip,
} from "@mintables/shared/lib/print-tips";
import type { TubeConfig } from "./types";

function describeEndCuts(config: TubeConfig): string {
  const parts: string[] = [];
  if (config.topCut.type !== "flat") {
    parts.push(`top ${config.topCut.type}`);
  }
  if (config.bottomCut.type !== "flat") {
    parts.push(`bottom ${config.bottomCut.type}`);
  }
  return parts.join(" and ");
}

export function getTubePrintTips(config: TubeConfig): PrintTip[] {
  const tips: PrintTip[] = [];

  if (config.flare.enabled) {
    tips.push({
      icon: "layers",
      title: "Press-fit flare",
      body: `Use 0.12mm layers and ${String(config.flare.clearance)}mm radial clearance (${config.flare.fitType} fit). Print upright with the flare at the top of the build.`,
      priority: 10,
    });
  }

  if (config.clamshell.enabled) {
    tips.push({
      icon: "split",
      title: "Clamshell halves",
      body: `Two halves export with ${String(config.clamshell.separation)}mm separation — print each half on its flat split face. Sand snap lips lightly if the ${String(config.clamshell.snapLipHeight)}mm detents feel tight.`,
      priority: 10,
    });
  }

  const angledCuts = describeEndCuts(config);
  if (angledCuts) {
    tips.push({
      icon: "printer",
      title: "Angled ends",
      body: `${angledCuts} changes the bed footprint — preview orientation in your slicer and add brim where contact area is small.`,
      priority: 8,
    });
  }

  if (config.length >= 120) {
    tips.push({
      icon: "printer",
      title: "Long tube",
      body: `${String(config.length)}mm length — use a brim or enclosure to prevent lifting. Keep the tube vertical for strongest walls.`,
      priority: config.length >= 180 ? 9 : 7,
    });
  } else {
    tips.push({
      icon: "printer",
      title: "Orientation",
      body: "Print upright so layer lines run along the tube walls for best strength.",
      priority: 4,
    });
  }

  if (!config.flare.enabled) {
    tips.push({
      icon: "layers",
      title: "Layer height",
      body: "0.2mm balances speed and quality. Drop to 0.12mm for tight mating surfaces.",
      priority: 2,
    });
  }

  tips.push({
    icon: "gauge",
    title: "Infill",
    body: "20–30% suits most tubes. Use 40%+ if the part carries load or gets clamped hard.",
    priority: 2,
  });

  tips.push({
    icon: "thermometer",
    title: "Material",
    body: "PETG for heat and outdoor use. PLA is fine for indoor prototypes and fit checks.",
    priority: 1,
  });

  return sortPrintTips(tips);
}
