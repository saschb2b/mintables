import { sortPrintTips, type PrintTip } from "@mintables/shared/lib/print-tips";
import { deriveClamp } from "./derived";
import { STRAIN_STIFF } from "./validation";
import type { ClampConfig } from "./types";

export function getClampPrintTips(config: ClampConfig): PrintTip[] {
  const tips: PrintTip[] = [];
  const d = deriveClamp(config);

  if (config.mount === "plate") {
    tips.push({
      icon: "split",
      title: "Strongest: tilt the jaw onto its side",
      body: "Base-down is easy, but the snap then pries layers apart. For maximum strength rotate the part roughly 110 degrees around Y in the slicer so the jaw's flat face points down; the arms then flex along the layers. Add a support enforcer under the raised lug.",
      priority: 10,
    });
    tips.push({
      icon: "printer",
      title: "Base-down works without supports",
      body: "As modeled (plate on the bed, mouth up) the clamp prints support-free and the bore comes out as a clean vertical arc. Good for light-duty clamps.",
      priority: 9,
    });
    tips.push({
      icon: "thermometer",
      title: "Printing base-down? Run it hot",
      body: "Base-down, the arms flex across the layers, so layer adhesion is the snap's strength. Print 5 to 10 degrees hotter than usual and ease off the cooling fan.",
      priority: 8,
    });

    const neckHalf = Math.min(config.neckWidth / 2, d.outerRadius * 0.98);
    const overhangDeg =
      90 - (Math.asin(neckHalf / d.outerRadius) * 180) / Math.PI;
    if (overhangDeg > 58) {
      tips.push({
        icon: "split",
        title: "Steep overhang at the neck",
        body: `Printing base-down, the jaw's underside leaves the neck at roughly ${overhangDeg.toFixed(0)} degrees. Widen the neck or enable supports if the surface droops.`,
        priority: 8,
      });
    }
  } else {
    tips.push({
      icon: "printer",
      title: "Print it lying flat",
      body: "The clip lies on its side, which is also the strongest orientation: the snap flexes along the layers instead of prying them apart.",
      priority: 10,
    });
  }

  tips.push({
    icon: "gauge",
    title: "Perimeters over infill",
    body: "Use 4 or more perimeters so the arms print as solid walls. Infill percentage barely matters after that; 15 to 25 percent is plenty.",
    priority: 7,
  });

  if (d.flexStrain > STRAIN_STIFF) {
    tips.push({
      icon: "layers",
      title: "Pick a tough filament",
      body: "This snap flexes hard. PETG, ASA, or a nylon such as PA6-CF will take it; PLA is stiff and tends to crack at the arm roots.",
      priority: 8,
    });
  } else {
    tips.push({
      icon: "layers",
      title: "Material choice",
      body: "PETG or ASA give a springy, durable snap. Carbon-filled nylon (PA6-CF) is ideal outdoors and near engine heat.",
      priority: 5,
    });
  }

  if (d.snapInterference > 0) {
    tips.push({
      icon: "gauge",
      title: "Dial in the fit on a test print",
      body: `The mouth is ${d.mouthOpening.toFixed(1)} mm for an ${String(config.rodDiameter)} mm rod. If the snap is too tight or too loose, nudge the fit clearance or wrap angle by a small step and re-print.`,
      priority: 6,
    });
  }

  return sortPrintTips(tips);
}
