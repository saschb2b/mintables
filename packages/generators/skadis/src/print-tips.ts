import { sortPrintTips, type PrintTip } from "@mintables/shared/lib/print-tips";
import type { SkadisConfig } from "./types";

export function getSkadisPrintTips(config: SkadisConfig): PrintTip[] {
  const tips: PrintTip[] = [];
  const { mount, body } = config;

  tips.push({
    icon: "printer",
    title: "Print standing, supports under the hook lips only",
    body: 'The part is oriented the way it mounts: plate vertical, body on the bed. The only overhang is the underside of each hook lip behind the plate. Enable supports ("on build plate only" is enough, a short column stands behind the plate) or paint supports onto the lips. Add a 5 mm brim for the tall, thin plate.',
    priority: 10,
  });

  tips.push({
    icon: "gauge",
    title: "Board gap is the number to tune",
    body: `The lip sits ${(mount.boardThickness + mount.fit).toFixed(1)} mm behind the plate. Unpainted SKÅDIS boards measure about 4.8 mm, painted ones about 5.2 mm. Print one hook first: if the holder rattles, reduce the fit by 0.2 mm; if it will not push on, raise it by 0.2 mm.`,
    priority: 9,
  });

  tips.push({
    icon: "layers",
    title: "Push in, then let it drop",
    body: `Hold the holder about ${(mount.lipDrop + 1).toFixed(0)} mm higher than its final spot, push the hooks straight through the slots, then lower it. The tabs rest on the slot edges and the lips lock behind the board. Lift to remove.`,
    priority: 8,
  });

  if (body.kind === "tray" || body.kind === "rack") {
    tips.push({
      icon: "thermometer",
      title: "PETG for anything heavy",
      body: "Bottles and tools put a steady load on the hook tabs. PETG or ABS creeps far less than PLA over months on the wall; use 4 perimeters either way.",
      priority: 7,
    });
  }

  if (body.kind === "rack" && body.tiers === 2) {
    tips.push({
      icon: "layers",
      title: "The upper bar is gusseted",
      body: "A 45-degree wedge carries the second tier, so it prints without support. Keep bridging speed normal; nothing bridges.",
      priority: 6,
    });
  }

  if (body.kind === "cup" && body.tilt > 0) {
    tips.push({
      icon: "layers",
      title: "Tilted cup, flat base",
      body: "The cup leans but its base is cut flat on the bed and the wedge to the plate is filled, so it prints as one clean block.",
      priority: 6,
    });
  }

  return sortPrintTips(tips);
}
