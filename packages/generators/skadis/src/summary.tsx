"use client";

import {
  SpecCard,
  SpecRow,
  type SpecStatus,
} from "@mintables/shared/ui/spec-card";
import { deriveSkadis } from "./derived";
import { getSkadisSpec } from "./spec";
import type { SkadisConfig } from "./types";

function statusFor(config: SkadisConfig): {
  status: SpecStatus;
  label: string;
} {
  const d = deriveSkadis(config);
  const hooks = d.hooks.columns * d.hooks.rowTops.length;
  if (d.hooks.columns === 1 && d.body.width > 60)
    return { status: "warn", label: "Rocks sideways" };
  const heavy = config.body.kind === "tray" || config.body.kind === "rack";
  if (d.hooks.rowTops.length === 1 && d.body.depth > (heavy ? 45 : 80))
    return { status: "warn", label: "May tip forward" };
  return { status: "ok", label: `${String(hooks)} hooks` };
}

export function SkadisSummary({ config }: { config: SkadisConfig }) {
  const spec = getSkadisSpec(config);
  return (
    <SpecCard status={statusFor(config)}>
      <SpecRow
        label="Footprint"
        value={`${spec.footprintX.toFixed(1)} × ${spec.footprintY.toFixed(1)} mm`}
      />
      <SpecRow label="Height" value={`${spec.height.toFixed(1)} mm`} />
      <SpecRow
        label="Plate"
        value={`${spec.plateWidth.toFixed(1)} × ${spec.plateHeight.toFixed(1)} mm`}
      />
      <SpecRow
        label="Hooks"
        value={`${String(spec.hookColumns)} × ${String(spec.hookRows)}, ${spec.hookReach.toFixed(1)} mm behind`}
      />
      <SpecRow label="Holds" value={spec.capacity} />
      <SpecRow
        label="Est. volume"
        value={`~${spec.volumeCm3.toFixed(1)} cm³`}
      />
    </SpecCard>
  );
}
