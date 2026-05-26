import {
  sortPrintTips,
  type PrintTip,
} from "@mintables/shared/lib/print-tips";
import type { AdapterConfig } from "./types";

export function getAdapterPrintTips(config: AdapterConfig): PrintTip[] {
  const tips: PrintTip[] = [];

  if (config.bendAngle > 0) {
    tips.push({
      icon: "printer",
      title: `${String(config.bendAngle)}° elbow`,
      body: "Print with socket openings up, or lay the curve on its side. Add supports under the bend if overhangs exceed ~45°.",
      priority: 10,
    });
  }

  const hasPlug = config.endAFit === "plug" || config.endBFit === "plug";
  if (hasPlug) {
    tips.push({
      icon: "layers",
      title: "Plug fit",
      body: `Plug end(s) use ${String(config.socketClearance)}mm clearance — print at 0.12mm layers and test fit on a short section before a full print.`,
      priority: 9,
    });
  }

  if (config.endA.shape !== config.endB.shape) {
    tips.push({
      icon: "link",
      title: "Shape transition",
      body: `${config.endA.shape} → ${config.endB.shape} adapter — dry-fit both tubes before committing to a long print.`,
      priority: 8,
    });
  }

  if (!hasPlug) {
    tips.push({
      icon: "layers",
      title: "Socket clearance",
      body: `${String(config.socketClearance)}mm gap between adapter and tube. Add +0.05mm if your printer tends to run slightly over-extruded.`,
      priority: 6,
    });
  }

  tips.push({
    icon: "gauge",
    title: "Wall strength",
    body: `${String(config.wallThickness)}mm walls — use 30–40% infill on socket cuffs; PETG handles repeated insert/remove better than PLA.`,
    priority: 5,
  });

  if (config.bendAngle === 0) {
    tips.push({
      icon: "printer",
      title: "Orientation",
      body: "Straight couplings print well standing on either socket end. Keep layer lines running around the circumference for hoop strength.",
      priority: 4,
    });
  }

  tips.push({
    icon: "thermometer",
    title: "Material",
    body: "PETG for durable, heat-tolerant joints. PLA works for dry-fit prototypes indoors.",
    priority: 1,
  });

  return sortPrintTips(tips);
}
