"use client";

import {
  SpecCard,
  SpecRow,
  type SpecStatus,
} from "@mintables/shared/ui/spec-card";
import type { TubeConfig } from "./types";
import { getTubeSpecSummary, type WallStatus } from "./spec";

function statusFor(wall: WallStatus): SpecStatus {
  if (wall === "ok") return "ok";
  if (wall === "thin") return "warn";
  return "error";
}

export function TubeSummary({ config }: { config: TubeConfig }) {
  const spec = getTubeSpecSummary(config);
  const wallLabel =
    spec.wall.status === "invalid"
      ? "Invalid wall"
      : spec.wall.secondary !== undefined
        ? `${spec.wall.primary.toFixed(2)} / ${spec.wall.secondary.toFixed(2)} mm`
        : `${spec.wall.primary.toFixed(2)} mm`;

  return (
    <SpecCard status={{ status: statusFor(spec.wall.status), label: wallLabel }}>
      <SpecRow label="Shape" value={spec.shapeLabel} />
      <SpecRow label={spec.innerLabel} value={spec.innerValue} />
      <SpecRow label={spec.outerLabel} value={spec.outerValue} />
      <SpecRow label="Length" value={`${String(spec.length)} mm`} />
      {spec.volumeCm3 !== null && (
        <SpecRow
          label="Est. volume"
          value={`~${spec.volumeCm3.toFixed(1)} cm³`}
        />
      )}
    </SpecCard>
  );
}
