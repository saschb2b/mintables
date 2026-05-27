"use client";

import {
  SpecCard,
  SpecRow,
  type SpecStatus,
} from "@mintables/shared/ui/spec-card";
import type { DividerConfig } from "./types";
import { getDividerSpecSummary } from "./spec";

export function DividerSummary({ config }: { config: DividerConfig }) {
  const spec = getDividerSpecSummary(config);
  const status: SpecStatus =
    config.thickness < 0.4
      ? "error"
      : config.thickness < 0.8
        ? "warn"
        : "ok";
  const statusLabel =
    status === "error"
      ? "Too thin"
      : status === "warn"
        ? "Thin slab"
        : `${spec.thickness.toFixed(2)} mm thick`;

  return (
    <SpecCard status={{ status, label: statusLabel }}>
      <SpecRow label="Thickness" value={`${spec.thickness.toFixed(2)} mm`} />
      <SpecRow label="Width" value={`${String(spec.width)} mm`} />
      <SpecRow label="Height" value={`${String(spec.height)} mm`} />
      <SpecRow label="Est. volume" value={`~${spec.volumeCm3.toFixed(2)} cm³`} />
    </SpecCard>
  );
}
