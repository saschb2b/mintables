"use client";

import {
  SpecCard,
  SpecRow,
  type SpecStatus,
} from "@mintables/shared/ui/spec-card";
import { getHexTileSpec } from "./spec";
import type { HexTileSpec } from "./spec";
import { surfaceTextureLabel } from "./surface-textures";
import type { HexTileConfig } from "./types";

function purposeName(config: HexTileConfig): string {
  if (config.purpose === "cards") return "Card display";
  if (config.purpose === "dice-orbit") return "Dice orbit";
  if (config.purpose === "rolling") return "Rolling tray";
  if (config.purpose === "deck") return "Deck cradle";
  if (config.purpose === "pens") return "Pen holder";
  return "Component bowl";
}

function summaryStatus(
  config: HexTileConfig,
  spec: HexTileSpec,
): {
  status: SpecStatus;
  label: string;
} {
  if (spec.usableInterior < 30 || spec.magnetBackWall < 1.2) {
    return { status: "error", label: "Check dimensions" };
  }
  const magnetClearance =
    config.magnetMode === "captive"
      ? config.magnetRodClearance
      : config.magnetClearance;
  if (config.magnetMode !== "none" && magnetClearance < 0.15) {
    return { status: "warn", label: "Tight magnet fit" };
  }
  return { status: "ok", label: "Print ready" };
}

export function HexTileSummary({ config }: { config: HexTileConfig }) {
  const spec = getHexTileSpec(config);
  const status = summaryStatus(config, spec);

  return (
    <SpecCard title="Hex Tile" status={status}>
      <SpecRow label="Purpose" value={purposeName(config)} />
      <SpecRow
        label="Footprint"
        value={`${spec.pointToPoint.toFixed(1)} x ${spec.acrossFlats.toFixed(1)} mm`}
      />
      <SpecRow
        label="Total height"
        value={`${spec.totalHeight.toFixed(1)} mm`}
      />
      <SpecRow
        label="Usable interior"
        value={`${spec.usableInterior.toFixed(1)} mm across`}
      />
      <SpecRow label="Storage" value={spec.featureLabel} />
      <SpecRow
        label="Top texture"
        value={
          config.isSurfaceTextureEnabled
            ? `${surfaceTextureLabel(config.surfaceTexture)}, ${config.surfaceTextureDepth.toFixed(2)} mm deep`
            : "Smooth"
        }
      />
      {config.purpose === "bowl" ? (
        <SpecRow
          label="Dish depth"
          value={`${config.bowlDepth.toFixed(1)} mm`}
        />
      ) : null}
      {config.purpose === "rolling" ? (
        <SpecRow
          label="Rolling depth"
          value={`${config.rollDepth.toFixed(1)} mm`}
        />
      ) : null}
      {config.purpose === "pens" ? (
        <SpecRow
          label="Cup"
          value={`${config.penCupWidth.toFixed(0)} mm wide, ${config.penCupHeight.toFixed(0)} mm above the tile`}
        />
      ) : null}
      {config.purpose === "deck" ? (
        <>
          <SpecRow
            label="Cradle"
            value={`${spec.deckSlotWidth.toFixed(1)} mm wide, ${config.deckSlotDepth.toFixed(1)} mm deep`}
          />
          <SpecRow
            label="Full-depth span"
            value={`${spec.deckClearSpan.toFixed(1)} mm${spec.deckClearSpan >= 92 ? "" : " (under a card)"}`}
          />
        </>
      ) : null}
      <SpecRow
        label="Magnets"
        value={spec.magnetCount === 0 ? "None" : String(spec.magnetCount)}
      />
      {config.magnetMode !== "none" ? (
        <SpecRow label="Connection" value={spec.connectionLabel} />
      ) : null}
      <SpecRow
        label={`Est. material (${String(spec.estimateInfillPercent)}%)`}
        value={`~${spec.estimatedMaterialCm3.toFixed(1)} cm3 / ${spec.estimatedPlaGrams.toFixed(1)} g PLA`}
      />
    </SpecCard>
  );
}
