import type { AdapterConfig } from "@/lib/adapter-types";
import type { TubeConfig } from "@/lib/tube-types";

export type PrintTipIcon =
  | "layers"
  | "gauge"
  | "thermometer"
  | "printer"
  | "split"
  | "link";

export interface PrintTip {
  icon: PrintTipIcon;
  title: string;
  body: string;
  priority: number;
}

const MAX_TIPS = 4;

function sortAndLimit(tips: PrintTip[]): PrintTip[] {
  return [...tips]
    .sort((a, b) => b.priority - a.priority)
    .slice(0, MAX_TIPS);
}

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

  return sortAndLimit(tips);
}

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

  return sortAndLimit(tips);
}

export function getPrintTips(
  activeTab: "tube" | "adapter",
  tubeConfig: TubeConfig,
  adapterConfig: AdapterConfig,
): PrintTip[] {
  return activeTab === "tube"
    ? getTubePrintTips(tubeConfig)
    : getAdapterPrintTips(adapterConfig);
}
