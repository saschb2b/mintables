import type { ValidationResult } from "@mintables/shared/lib";
import {
  getSupportAsset,
  hasPreparedSelection,
  removedShellIds,
} from "./asset-store";
import type { SupportCleanerConfig } from "./types";

export function validateSupportCleaner(
  config: SupportCleanerConfig,
): ValidationResult {
  const errors: ValidationResult["errors"] = [];
  const warnings: ValidationResult["warnings"] = [];
  if (!config.assetId) {
    errors.push({
      severity: "error",
      code: "asset_required",
      message: "Import a supported STL before exporting.",
      field: "assetId",
    });
    return { errors, warnings };
  }
  const asset = getSupportAsset(config.assetId);
  if (!asset) {
    errors.push({
      severity: "error",
      code: "asset_loading",
      message:
        "The imported STL is not loaded. Wait for local analysis or import it again.",
      field: "assetId",
    });
    return { errors, warnings };
  }
  if (config.supportSizePercent < 0.01 || config.supportSizePercent > 2) {
    errors.push({
      severity: "error",
      code: "support_threshold",
      message: "Safe shell size must be between 0.01 and 2 percent.",
      field: "supportSizePercent",
    });
  }
  if (!hasPreparedSelection(asset, config)) {
    errors.push({
      severity: "error",
      code: "mesh_preparing",
      message:
        "The updated mesh is still being prepared locally. Export unlocks automatically when it is ready.",
    });
  }
  const removed = removedShellIds(asset, config);
  if (config.removalMode === "safe" && removed.size === 0) {
    warnings.push({
      severity: "warning",
      code: "no_safe_supports",
      message:
        "No detached shells meet the conservative support rule. Inspect the model or use Main shell only.",
    });
  }
  if (config.removalMode === "main-only" && asset.shells.length > 2) {
    warnings.push({
      severity: "warning",
      code: "aggressive_removal",
      message:
        "Main shell only deletes every detached shell, including separate bases, weapons, or accessories.",
      field: "removalMode",
    });
  }
  if (config.removalMode === "original") {
    warnings.push({
      severity: "warning",
      code: "supports_retained",
      message: "Original mode keeps the detected resin support shells.",
      field: "removalMode",
    });
  }
  if (config.fdmHandoff && !config.centerOnBed) {
    warnings.push({
      severity: "warning",
      code: "fdm_not_on_bed",
      message: "FDM handoff works best with Center and place on bed enabled.",
      field: "centerOnBed",
    });
  }
  return { errors, warnings };
}
