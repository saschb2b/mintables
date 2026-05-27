import {
  sortPrintTips,
  type PrintTip,
} from "@mintables/shared/lib/print-tips";
import type { DividerConfig } from "./types";

export function getDividerPrintTips(config: DividerConfig): PrintTip[] {
  const tips: PrintTip[] = [];

  tips.push({
    icon: "printer",
    title: "Print flat on the bed",
    body: `The divider lies flat with its ${String(config.thickness)} mm face down. No supports needed.`,
    priority: 10,
  });

  if (config.thickness < 1.2) {
    tips.push({
      icon: "layers",
      title: "Thin slab — slow first layer",
      body: "Use a 0.12–0.16 mm layer height and a slower first-layer speed so the slab adheres evenly and doesn't curl at the edges.",
      priority: 9,
    });
  }

  if (config.thickness >= 1.6) {
    tips.push({
      icon: "gauge",
      title: "Solid infill",
      body: "Set infill to 100% so the divider stays rigid under sideways pressure.",
      priority: 7,
    });
  }

  return sortPrintTips(tips);
}
