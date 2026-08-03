"use client";

import {
  SpecCard,
  SpecRow,
  type SpecStatus,
} from "@mintables/shared/ui/spec-card";
import { getClampSpecSummary } from "./spec";
import { STRAIN_BREAK, STRAIN_STIFF } from "./validation";
import type { ClampConfig } from "./types";

export function ClampSummary({ config }: { config: ClampConfig }) {
  const spec = getClampSpecSummary(config);

  let status: SpecStatus = "ok";
  let statusLabel = "Easy snap";
  if (spec.mouthOpening < 0.5) {
    status = "error";
    statusLabel = "Mouth closed";
  } else if (spec.flexStrain > STRAIN_BREAK) {
    status = "error";
    statusLabel = "Snap too stiff";
  } else if (spec.flexStrain > STRAIN_STIFF) {
    status = "warn";
    statusLabel = "Stiff snap";
  } else if (spec.snapInterference <= 0) {
    status = "warn";
    statusLabel = "No retention";
  }

  return (
    <SpecCard status={{ status, label: statusLabel }}>
      <SpecRow
        label="Rod"
        value={`Ø ${String(config.rodDiameter)} mm, bore Ø ${spec.boreDiameter.toFixed(1)} mm`}
      />
      <SpecRow
        label="Wrap"
        value={`${String(config.wrapAngle)}° × ${String(config.jawWidth)} mm wide`}
      />
      <SpecRow
        label="Mouth opening"
        value={`${spec.mouthOpening.toFixed(1)} mm`}
      />
      <SpecRow
        label="Arm taper"
        value={`${spec.springThickness.toFixed(1)} to ${spec.rootThickness.toFixed(1)} mm`}
      />
      {spec.snapInterference > 0 && (
        <SpecRow
          label="Snap flex"
          value={`${(spec.snapInterference / 2).toFixed(1)} mm per arm`}
        />
      )}
      <SpecRow label="Outer" value={`Ø ${spec.outerDiameter.toFixed(1)} mm`} />
      <SpecRow
        label="Footprint"
        value={`${spec.footprintX.toFixed(1)} × ${spec.footprintY.toFixed(1)} mm`}
      />
      <SpecRow label="Height" value={`${spec.overallHeight.toFixed(1)} mm`} />
      {config.mount === "plate" && (
        <SpecRow
          label="Screws"
          value={`2 × Ø ${String(config.screwDiameter)} mm @ ${String(config.holeSpacing)} mm`}
        />
      )}
      <SpecRow
        label="Est. volume"
        value={`~${spec.volumeCm3.toFixed(2)} cm³`}
      />
    </SpecCard>
  );
}
