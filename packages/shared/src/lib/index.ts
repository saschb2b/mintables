export type {
  Generator,
  GeneratorMeta,
  GeneratorBadge,
  ControlsProps,
  SceneProps,
  SummaryProps,
  TriangleMesh,
  AxisConvention,
  AnyGenerator,
} from "./generator";

export { default as theme } from "./theme";
export { configKey } from "./config-key";
export { trackPageview, trackEvent } from "./analytics";
export { SITE_LINKS } from "./site-links";

export type { PrintTip, PrintTipIcon } from "./print-tips";
export { sortPrintTips } from "./print-tips";

export type { Preset, UrlConfig } from "./preset-storage";
export {
  CONFIG_SCHEMA_VERSION,
  PRESETS_CHANGED_EVENT,
  encodeConfig,
  decodeConfig,
  buildShareUrl,
  readUrlConfig,
  syncUrl,
  listPresets,
  listAllPresets,
  hasAnyPresets,
  savePreset,
  deletePreset,
  renamePreset,
} from "./preset-storage";

export type { DownloadEntry, ExportFormat as DownloadFormat } from "./download-storage";
export {
  DOWNLOADS_CHANGED_EVENT,
  listDownloads,
  hasDownloads,
  recordDownload,
  deleteDownload,
  renameDownload,
  getDownload,
} from "./download-storage";

export type {
  ValidationIssue,
  ValidationResult,
  ValidationSeverity,
} from "./validation/types";
export {
  emptyValidation,
  mergeValidation,
  isValid,
} from "./validation/types";
export {
  issuesForField,
  fieldHasError,
  fieldHelperText,
} from "./validation/field-errors";

export type {
  WindowKind,
  WindowPayload,
  WindowState,
  WindowBounds,
  OpenWindow,
  WindowManagerState,
  FolderId,
} from "./window-manager";
export { windowIdOf, WindowManagerProvider, useWindowManager } from "./window-manager";

export type { FolderMeta } from "./folders";
export { FOLDER_META, folderPath } from "./folders";

export {
  invalidatePreview,
  PREVIEW_INVALIDATE_EVENT,
} from "./preview-events";
