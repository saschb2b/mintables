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

/** Sort by priority desc and cap. Generators call this on their own tip list. */
export function sortPrintTips(tips: PrintTip[], max = 4): PrintTip[] {
  return [...tips].sort((a, b) => b.priority - a.priority).slice(0, max);
}
