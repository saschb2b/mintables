import {
  sortPrintTips,
  type PrintTip,
} from "@mintables/shared/lib/print-tips";
import { outerBounds, type LegCapConfig } from "./types";

export function getLegCapPrintTips(config: LegCapConfig): PrintTip[] {
  const tips: PrintTip[] = [];
  const outer = outerBounds(config);
  const totalHeight = config.floorThickness + config.capHeight;
  const aspect = totalHeight / Math.min(outer.width, outer.height);

  tips.push({
    icon: "printer",
    title: "Print floor-down, opening up",
    body: "The cap sits on its closed floor with the socket opening facing the ceiling. No supports needed.",
    priority: 10,
  });

  if (aspect > 1.8) {
    tips.push({
      icon: "layers",
      title: "Tall cap — add a brim",
      body: `The cap is roughly ${aspect.toFixed(1)}× taller than wide. Add a 5–8 mm brim so the small footprint doesn't pop off the bed.`,
      priority: 9,
    });
  }

  if (config.wallThickness < 1.6) {
    tips.push({
      icon: "gauge",
      title: "Thin walls — slow perimeters",
      body: "Drop perimeter speed to 30 mm/s so the wall stays solid and grips the leg without splitting.",
      priority: 8,
    });
  }

  tips.push({
    icon: "gauge",
    title: "100% infill",
    body: "Cap walls already act as the structure. Set infill to 100% (or leave the part hollow with 4+ perimeters) so the leg's weight transfers cleanly.",
    priority: 6,
  });

  if (config.innerTaperEnabled && config.innerTaper > 0) {
    tips.push({
      icon: "layers",
      title: "Test the wedge fit on a sample",
      body: `The socket narrows by ${config.innerTaper.toFixed(2)} mm from opening to floor. If it grips too hard or pops off, adjust the taper by 0.1 mm and re-print just the cap.`,
      priority: 7,
    });
  }

  if (config.feltRecessEnabled) {
    tips.push({
      icon: "layers",
      title: "Felt pad goes in after printing",
      body: `Cut a felt pad to roughly ${String(Math.max(0, outer.width - config.feltInset * 2 - 1))}×${String(Math.max(0, outer.height - config.feltInset * 2 - 1))} mm and glue it into the bottom recess.`,
      priority: 7,
    });
  }

  return sortPrintTips(tips);
}
