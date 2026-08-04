import type { TriangleMesh } from "@mintables/shared/lib";
import type { MeshBounds, SupportAnalysisSummary } from "./analysis";
import {
  removedShellIdsForSelection,
  selectedBounds,
  selectionFromConfig,
  supportSelectionKey,
  type PreparedSupportMesh,
} from "./mesh-preparation";
import type { SupportCleanerConfig } from "./types";

export interface SupportAsset extends SupportAnalysisSummary {
  id: string;
  name: string;
  prepared: PreparedSupportMesh;
}

const assets = new Map<string, SupportAsset>();
const EMPTY_MESH = new Float32Array();

export function registerSupportAsset(
  id: string,
  name: string,
  summary: SupportAnalysisSummary,
  prepared: PreparedSupportMesh,
): SupportAsset {
  const asset = { ...summary, id, name, prepared };
  assets.set(id, asset);
  return asset;
}

export function updatePreparedSupportAsset(
  id: string,
  prepared: PreparedSupportMesh,
): SupportAsset | undefined {
  const asset = assets.get(id);
  if (!asset) return undefined;
  asset.prepared = prepared;
  return asset;
}

export function getSupportAsset(id: string): SupportAsset | undefined {
  return assets.get(id);
}

export function removedShellIds(
  asset: SupportAsset,
  config: SupportCleanerConfig,
): Set<number> {
  return removedShellIdsForSelection(asset, selectionFromConfig(config));
}

export function hasPreparedSelection(
  asset: SupportAsset,
  config: SupportCleanerConfig,
): boolean {
  return (
    asset.prepared.selectionKey ===
    supportSelectionKey(selectionFromConfig(config))
  );
}

export function supportCleanerMesh(config: SupportCleanerConfig): TriangleMesh {
  const asset = getSupportAsset(config.assetId);
  if (!asset || !hasPreparedSelection(asset, config)) return EMPTY_MESH;
  return asset.prepared.outputPositions;
}

export function cleanedBounds(
  asset: SupportAsset,
  config: SupportCleanerConfig,
): MeshBounds {
  const selection = selectionFromConfig(config);
  const removed = removedShellIdsForSelection(asset, selection);
  const bounds = selectedBounds(asset, removed);
  if (!selection.centerOnBed) return bounds;
  return {
    minX: -(bounds.maxX - bounds.minX) / 2,
    maxX: (bounds.maxX - bounds.minX) / 2,
    minY: -(bounds.maxY - bounds.minY) / 2,
    maxY: (bounds.maxY - bounds.minY) / 2,
    minZ: 0,
    maxZ: bounds.maxZ - bounds.minZ,
  };
}
