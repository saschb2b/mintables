import { ScanSearch } from "lucide-react";
import type { Generator, GeneratorBadge } from "@mintables/shared/lib";
import {
  getSupportAsset,
  removedShellIds,
  supportCleanerMesh,
} from "./asset-store";
import { SupportCleanerControls } from "./controls";
import { SupportCleanerIconArt } from "./icon-art";
import { supportCleanerPrintTips } from "./print-tips";
import { SupportCleanerScene } from "./scene";
import { SupportCleanerSummary } from "./summary";
import {
  DEFAULT_SUPPORT_CLEANER_CONFIG,
  type ShellRemovalMode,
  type SupportCleanerConfig,
} from "./types";
import { validateSupportCleaner } from "./validation";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isRemovalMode(value: unknown): value is ShellRemovalMode {
  return value === "safe" || value === "main-only" || value === "original";
}

function decodeSupportCleaner(data: unknown): SupportCleanerConfig | null {
  if (!isRecord(data)) return null;
  return {
    assetId:
      typeof data.assetId === "string"
        ? data.assetId.slice(0, 120)
        : DEFAULT_SUPPORT_CLEANER_CONFIG.assetId,
    assetName:
      typeof data.assetName === "string"
        ? data.assetName.slice(0, 160)
        : DEFAULT_SUPPORT_CLEANER_CONFIG.assetName,
    assetRevision:
      typeof data.assetRevision === "number" &&
      Number.isSafeInteger(data.assetRevision)
        ? data.assetRevision
        : DEFAULT_SUPPORT_CLEANER_CONFIG.assetRevision,
    removalMode: isRemovalMode(data.removalMode)
      ? data.removalMode
      : DEFAULT_SUPPORT_CLEANER_CONFIG.removalMode,
    supportSizePercent:
      typeof data.supportSizePercent === "number" &&
      Number.isFinite(data.supportSizePercent)
        ? data.supportSizePercent
        : DEFAULT_SUPPORT_CLEANER_CONFIG.supportSizePercent,
    centerOnBed:
      typeof data.centerOnBed === "boolean"
        ? data.centerOnBed
        : DEFAULT_SUPPORT_CLEANER_CONFIG.centerOnBed,
    showRemovedSupports:
      typeof data.showRemovedSupports === "boolean"
        ? data.showRemovedSupports
        : DEFAULT_SUPPORT_CLEANER_CONFIG.showRemovedSupports,
    fdmHandoff:
      typeof data.fdmHandoff === "boolean"
        ? data.fdmHandoff
        : DEFAULT_SUPPORT_CLEANER_CONFIG.fdmHandoff,
  };
}

function filename(config: SupportCleanerConfig): string {
  const source = config.assetName.replace(/\.stl$/i, "") || "cleaned-model";
  const safe = source
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
  return safe + (config.fdmHandoff ? "-fdm-ready" : "-clean");
}

function describe(config: SupportCleanerConfig): string {
  const asset = getSupportAsset(config.assetId);
  if (!asset) return "Local STL support cleanup";
  const removed = removedShellIds(asset, config);
  return (
    asset.name +
    ": " +
    String(removed.size) +
    " of " +
    String(asset.shells.length) +
    " shells removed"
  );
}

function badges(config: SupportCleanerConfig): GeneratorBadge[] {
  const asset = getSupportAsset(config.assetId);
  if (!asset) return [{ label: "Local STL", color: "#a78bfa" }];
  const removed = removedShellIds(asset, config);
  return [
    { label: String(asset.shells.length) + " shells", color: "#60a5fa" },
    {
      label: String(removed.size) + " removed",
      color: removed.size > 0 ? "#22c55e" : "#f59e0b",
    },
    ...(config.fdmHandoff ? [{ label: "FDM handoff", color: "#a78bfa" }] : []),
  ];
}

export const supportCleanerGenerator: Generator<SupportCleanerConfig> = {
  id: "support-cleaner",
  meta: {
    name: "Support Cleaner",
    tagline: "Remove Resin Supports from Miniature STL Files",
    description:
      "Locally separates support shells from pre-supported resin miniatures, preserves ambiguous accessories, and exports a clean STL for FDM slicing.",
    icon: ScanSearch,
    accent: "#8b5cf6",
    iconArt: SupportCleanerIconArt,
  },
  defaults: DEFAULT_SUPPORT_CLEANER_CONFIG,
  decode: decodeSupportCleaner,
  validate: validateSupportCleaner,
  geometry: supportCleanerMesh,
  isExportableMesh: (mesh) =>
    mesh instanceof Float32Array && mesh.length >= 9 && mesh.length % 9 === 0,
  axis: "z-up",
  filename,
  describe,
  printTips: supportCleanerPrintTips,
  badges,
  capabilities: {
    share: false,
    presets: true,
    downloadHistory: false,
    exportFormats: ["stl"],
  },
  Controls: SupportCleanerControls,
  Scene: SupportCleanerScene,
  Summary: SupportCleanerSummary,
};

export type { SupportCleanerConfig } from "./types";
