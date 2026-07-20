import { sortPrintTips, type PrintTip } from "@mintables/shared/lib/print-tips";
import { calculateHexTileLayout } from "./layout";
import type { HexTileConfig } from "./types";

export function getHexTilePrintTips(config: HexTileConfig): PrintTip[] {
  const layout = calculateHexTileLayout(config);
  const tips: PrintTip[] = [
    {
      icon: "printer",
      title: "Print flat, no supports",
      body: "Place the hex bottom on the build plate. The scoop walls, edge bevels, card slots, and compact magnet bridges are designed to print without supports.",
      priority: 10,
    },
    {
      icon: "gauge",
      title: "Use three perimeters",
      body: "Three 0.4 mm walls and 12 to 18% infill give the rim and magnet backs enough strength for repeated table use. The material summary assumes 15% infill and 0.2 mm layers.",
      priority: 8,
    },
  ];

  if (layout.magnetCount > 0) {
    tips.push({
      icon: "layers",
      title: "Test one magnet socket",
      body: `The generated socket is ${layout.magnetSocketDiameter.toFixed(2)} mm wide by ${layout.magnetSocketDepth.toFixed(2)} mm deep. Print a small test or measure extrusion before committing all ${String(layout.magnetCount)} magnets.`,
      priority: 9,
    });
    if (config.magnetMode === "single") {
      tips.push({
        icon: "layers",
        title: "Follow the north dot",
        body: "Start with the side directly below the recessed north dot. Install its north pole facing outward, then continue clockwise with outward poles N / S / N / S / N / S. Verify all six before applying adhesive.",
        priority: 9,
      });
      tips.push({
        icon: "layers",
        title: "Build one master tile",
        body: "Keep north dots pointing the same way while connecting tiles. A verified first tile can orient loose magnets for every later tile before they are glued in.",
        priority: 8,
      });
    }
    if (config.magnetMode === "paired") {
      tips.push({
        icon: "layers",
        title: "Mirror paired polarity",
        body: "Install opposite outward poles in the left and right socket on every side. Facing pairs then mirror and attract at every 60-degree tile rotation.",
        priority: 9,
      });
    }
    tips.push({
      icon: "layers",
      title: "Handle magnets safely",
      body: "Fix magnets with a small drop of adhesive and keep loose magnets away from children, pets, electronics, and medical devices.",
      priority: 7,
    });
  }

  if (config.purpose === "cards") {
    tips.push({
      icon: "layers",
      title: "Fit the cards before a full set",
      body: "Sleeves vary by brand. Test one slot and increase width in 0.1 mm steps until cards slide in without bowing.",
      priority: 8,
    });
  }

  if (config.isSurfaceTextureEnabled) {
    tips.push({
      icon: "layers",
      title: "Keep the relief crisp",
      body: `Use a 0.2 mm or finer layer height for the ${config.surfaceTextureDepth.toFixed(2)} mm recessed texture. Slow top-surface moves help small grooves remain distinct.`,
      priority: 7,
    });
  }

  return sortPrintTips(tips);
}
