import { sortPrintTips, type PrintTip } from "@mintables/shared/lib/print-tips";
import type { PullConfig } from "./types";

export function getPullPrintTips(config: PullConfig): PrintTip[] {
  const tips: PrintTip[] = [];

  switch (config.style) {
    case "knob": {
      tips.push({
        icon: "printer",
        title: "Print base-down, no supports",
        body: "The knob stands on its mounting flange and every overhang is a 45-degree cone or dome. Nothing needs support.",
        priority: 10,
      });
      tips.push({
        icon: "gauge",
        title: "4+ perimeters over infill",
        body: "A knob takes twisting loads through its neck. Four perimeters with 15% infill beats 100% infill with two.",
        priority: 8,
      });
      if (config.mount === "screws") {
        tips.push({
          icon: "layers",
          title: "Let the screw cut its own thread",
          body: `The ${config.screwDiameter.toFixed(1)} mm pilot bore is sized for the screw to self-thread. Drive it slowly so the plastic doesn't melt; for repeated assembly, use a heat-set insert instead.`,
          priority: 7,
        });
      }
      break;
    }
    case "tab": {
      tips.push({
        icon: "printer",
        title: "Print lying on its side",
        body: "Lay the tab on one side face so the whole bent profile prints as vertical walls: no supports at any blade angle, and layer lines run along the strip where they're strongest.",
        priority: 10,
      });
      if (config.mount === "screws") {
        tips.push({
          icon: "layers",
          title: "Countersinks print sideways",
          body: "On its side, the screw holes print as horizontal circles. They come out slightly faceted on top; a quick pass with a drill bit or countersink bit cleans them up.",
          priority: 7,
        });
      }
      if (config.thickness < 2.4) {
        tips.push({
          icon: "gauge",
          title: "Thin strip, slow it down",
          body: "Under 2.4 mm the strip flexes noticeably. Drop perimeter speed and consider PETG for a lid that gets pulled daily.",
          priority: 8,
        });
      }
      break;
    }
    case "arc": {
      tips.push({
        icon: "printer",
        title: "Print lying flat on its back",
        body: "Lay the handle down so the whole arc touches the bed on one side. Layer lines then run along the bar, which is the strong direction for a handle you pull on.",
        priority: 10,
      });
      if (config.barProfile === "round") {
        tips.push({
          icon: "layers",
          title: "Round bar needs a brim",
          body: "On its side a round bar meets the bed in a narrow line. Add a 4 mm brim or switch to the flat profile for a self-stable print.",
          priority: 8,
        });
      }
      if (config.mount === "screws") {
        tips.push({
          icon: "layers",
          title: "Screws come from inside the drawer",
          body: `Drill clearance holes through the drawer front at ${String(config.holeSpacing)} mm centers and drive screws up into the pilot bores in each foot.`,
          priority: 7,
        });
      }
      break;
    }
  }

  if (config.mount === "glue") {
    tips.push({
      icon: "layers",
      title: "Scuff before gluing",
      body: "Sand the mount face and the furniture spot with 120 grit, then use CA glue or epoxy. PLA glues well; PP and PE surfaces don't.",
      priority: 6,
    });
  }

  return sortPrintTips(tips);
}
