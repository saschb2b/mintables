import { sortPrintTips, type PrintTip } from "@mintables/shared/lib/print-tips";
import { getInsertOutputBounds } from "./layout";
import type { BoardGameInsertConfig } from "./types";

export function getInsertPrintTips(config: BoardGameInsertConfig): PrintTip[] {
  const tips: PrintTip[] = [
    {
      icon: "printer",
      title: "Print flat side down",
      body:
        config.outputPart === "lid"
          ? "Print the lid plate on the bed with its skirt facing up. It needs no supports."
          : "Print the tray floor on the bed with every well facing up. The access ramps are support-free.",
      priority: 10,
    },
    {
      icon: "gauge",
      title: "Use three perimeters",
      body: "Three walls and 10 to 15% infill make dividers resilient without filling the whole base with plastic.",
      priority: 7,
    },
  ];

  if (config.outputPart !== "tray") {
    tips.push({
      icon: "layers",
      title: "Test the lid fit first",
      body: `The lid has ${config.lidClearance.toFixed(2)} mm clearance per side. Print a short corner test if your printer's dimensional accuracy is unknown.`,
      priority: 9,
    });
  }

  if (
    config.rows.some((row) =>
      row.compartments.some((well) => well.access === "scoop"),
    )
  ) {
    tips.push({
      icon: "layers",
      title: "Keep scoop layers smooth",
      body: "Use a 0.20 mm layer height or finer so tokens slide cleanly up the access ramps.",
      priority: 8,
    });
  }

  const bounds = getInsertOutputBounds(config);
  if (bounds.width > 220 || bounds.depth > 220) {
    tips.push({
      icon: "split",
      title: "Check the build plate",
      body: `This output spans ${bounds.width.toFixed(1)} by ${bounds.depth.toFixed(1)} mm. Export the tray and lid separately if the combined set does not fit.`,
      priority: 9,
    });
  }

  return sortPrintTips(tips);
}
