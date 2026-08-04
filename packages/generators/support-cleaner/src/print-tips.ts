import { sortPrintTips, type PrintTip } from "@mintables/shared/lib";
import type { SupportCleanerConfig } from "./types";

export function supportCleanerPrintTips(
  config: SupportCleanerConfig,
): PrintTip[] {
  const tips: PrintTip[] = [
    {
      icon: "printer",
      title: "Slice the cleaned mesh again",
      body: "Do not print the exported STL with support generation disabled unless the sculpt is designed for it. Inspect every island and steep overhang in the slicer preview.",
      priority: 10,
    },
    {
      icon: "gauge",
      title: "Use organic FDM supports",
      body: "Start with Organic supports Everywhere. The slicer can size branches and interfaces for the selected nozzle, layer height, and filament.",
      priority: 9,
    },
    {
      icon: "layers",
      title: "Preserve miniature detail",
      body: "Use a fine layer height, slow outer walls, and support interfaces. Check hands, instruments, weapons, and coat edges before printing.",
      priority: 8,
    },
  ];
  if (config.removalMode === "main-only") {
    tips.push({
      icon: "split",
      title: "Verify detached accessories",
      body: "Main shell only is intentionally aggressive. Compare the export with the source before slicing so a separate base or accessory was not discarded.",
      priority: 11,
    });
  }
  return sortPrintTips(tips);
}
