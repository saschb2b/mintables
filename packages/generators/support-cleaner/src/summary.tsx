"use client";

import { SpecCard, SpecRow, type SpecStatus } from "@mintables/shared/ui";
import { cleanedBounds, getSupportAsset, removedShellIds } from "./asset-store";
import type { SupportCleanerConfig } from "./types";

function count(value: number): string {
  return new Intl.NumberFormat().format(value);
}

export function SupportCleanerSummary({
  config,
}: {
  config: SupportCleanerConfig;
}) {
  const asset = getSupportAsset(config.assetId);
  if (!asset) {
    return (
      <SpecCard status={{ status: "warn", label: "Import an STL" }}>
        <SpecRow label="Method" value="Connected-shell separation" />
        <SpecRow label="Processing" value="Local browser worker" />
      </SpecCard>
    );
  }
  const removed = removedShellIds(asset, config);
  const removedFaces = asset.shells
    .filter((shell) => removed.has(shell.id))
    .reduce((sum, shell) => sum + shell.faceCount, 0);
  const bounds = cleanedBounds(asset, config);
  const status: SpecStatus =
    config.removalMode === "main-only"
      ? "warn"
      : removed.size > 0
        ? "ok"
        : "warn";
  const statusLabel =
    config.removalMode === "main-only"
      ? "Review removal"
      : removed.size > 0
        ? "Supports isolated"
        : "Needs review";

  return (
    <SpecCard status={{ status, label: statusLabel }}>
      <SpecRow label="Shells" value={count(asset.shells.length)} />
      <SpecRow label="Removed" value={count(removed.size)} />
      <SpecRow label="Faces removed" value={count(removedFaces)} />
      <SpecRow
        label="Clean size"
        value={
          (bounds.maxX - bounds.minX).toFixed(1) +
          " x " +
          (bounds.maxY - bounds.minY).toFixed(1) +
          " x " +
          (bounds.maxZ - bounds.minZ).toFixed(1) +
          " mm"
        }
      />
    </SpecCard>
  );
}
