"use client";

import {
  SpecCard,
  SpecRow,
  type SpecStatus,
} from "@mintables/shared/ui/spec-card";
import type { LegCapConfig } from "./types";
import { getLegCapSpecSummary } from "./spec";

function shapeLabel(config: LegCapConfig): string {
  switch (config.shape) {
    case "round":
      return `Ø ${String(config.innerDiameter)} mm`;
    case "square":
      return `${String(config.innerSize)}×${String(config.innerSize)} mm`;
    case "rectangular":
      return `${String(config.innerWidth)}×${String(config.innerHeight)} mm`;
    case "oval":
      return `${String(config.innerWidth)}×${String(config.innerHeight)} mm oval`;
  }
}

export function LegCapSummary({ config }: { config: LegCapConfig }) {
  const spec = getLegCapSpecSummary(config);
  const status: SpecStatus =
    config.wallThickness < 0.8
      ? "error"
      : config.wallThickness < 1.2
        ? "warn"
        : "ok";
  const statusLabel =
    status === "error"
      ? "Wall too thin"
      : status === "warn"
        ? "Thin wall"
        : `${config.wallThickness.toFixed(1)} mm wall`;

  return (
    <SpecCard status={{ status, label: statusLabel }}>
      <SpecRow label="Leg" value={shapeLabel(config)} />
      <SpecRow
        label="Fit clearance"
        value={`+${config.fitClearance.toFixed(2)} mm`}
      />
      <SpecRow
        label="Outer footprint"
        value={`${spec.outerWidth.toFixed(1)} × ${spec.outerHeight.toFixed(1)} mm`}
      />
      <SpecRow label="Total height" value={`${spec.totalHeight.toFixed(1)} mm`} />
      <SpecRow
        label="Socket height"
        value={`${spec.socketHeight.toFixed(1)} mm`}
      />
      <SpecRow
        label="Floor"
        value={`${spec.floorThickness.toFixed(1)} mm`}
      />
      {config.innerTaperEnabled && config.innerTaper > 0 && (
        <SpecRow
          label="Inner taper"
          value={`${config.innerTaper.toFixed(2)} mm wedge`}
        />
      )}
      {config.feltRecessEnabled && (
        <SpecRow
          label="Felt recess"
          value={`${config.feltDepth.toFixed(1)} mm × ${config.feltInset.toFixed(1)} mm inset`}
        />
      )}
      <SpecRow label="Est. volume" value={`~${spec.volumeCm3.toFixed(2)} cm³`} />
    </SpecCard>
  );
}
