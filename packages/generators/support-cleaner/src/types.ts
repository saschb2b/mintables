export type ShellRemovalMode = "safe" | "main-only" | "original";

export interface SupportCleanerConfig {
  assetId: string;
  assetName: string;
  assetRevision: number;
  removalMode: ShellRemovalMode;
  /** Maximum secondary-shell size that safe mode may classify as support. */
  supportSizePercent: number;
  centerOnBed: boolean;
  showRemovedSupports: boolean;
  fdmHandoff: boolean;
}

export const DEFAULT_SUPPORT_CLEANER_CONFIG: SupportCleanerConfig = {
  assetId: "",
  assetName: "",
  assetRevision: 0,
  removalMode: "safe",
  supportSizePercent: 0.1,
  centerOnBed: true,
  showRemovedSupports: true,
  fdmHandoff: true,
};
