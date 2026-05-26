"use client";

import { SpecCard, SpecRow } from "@mintables/shared/ui/spec-card";
import type { AdapterConfig } from "./types";
import { getAdapterSpecSummary } from "./spec";

export function AdapterSummary({ config }: { config: AdapterConfig }) {
  const spec = getAdapterSpecSummary(config);
  return (
    <SpecCard>
      <SpecRow label="Transition" value={spec.transition} />
      <SpecRow label="End A" value={spec.endA} />
      <SpecRow label="End B" value={spec.endB} />
      <SpecRow label="Socket depth" value={`${String(spec.socketDepth)} mm`} />
      <SpecRow label="Adapter wall" value={`${String(spec.adapterWall)} mm`} />
      <SpecRow
        label="Bend"
        value={spec.bendAngle > 0 ? `${String(spec.bendAngle)}°` : "Straight"}
      />
      <SpecRow label="Total height" value={`${String(spec.totalHeight)} mm`} />
    </SpecCard>
  );
}
