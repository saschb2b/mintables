"use client";

import {
  SpecCard,
  SpecRow,
  type SpecStatus,
} from "@mintables/shared/ui/spec-card";
import { getInsertSpecSummary } from "./spec";
import type { BoardGameInsertConfig } from "./types";

export function InsertSummary({ config }: { config: BoardGameInsertConfig }) {
  const spec = getInsertSpecSummary(config);
  const isSmallWell =
    spec.smallestWellWidth < 14 || spec.smallestWellDepth < 14;
  const status: SpecStatus =
    spec.smallestWellWidth < 6 || spec.smallestWellDepth < 6
      ? "error"
      : isSmallWell || config.wallThickness < 1.2
        ? "warn"
        : "ok";
  const statusLabel =
    status === "error"
      ? "Well too small"
      : status === "warn"
        ? "Check fit"
        : "Print ready";

  return (
    <SpecCard title="Insert Fit" status={{ status, label: statusLabel }}>
      <SpecRow
        label="Output"
        value={
          config.outputPart === "both"
            ? "Tray + lid"
            : config.outputPart === "lid"
              ? "Lid"
              : "Tray"
        }
      />
      <SpecRow
        label="Print footprint"
        value={`${spec.outputWidth.toFixed(1)} × ${spec.outputDepth.toFixed(1)} mm`}
      />
      <SpecRow label="Compartments" value={String(spec.compartmentCount)} />
      <SpecRow
        label="Smallest well"
        value={`${spec.smallestWellWidth.toFixed(1)} × ${spec.smallestWellDepth.toFixed(1)} mm`}
      />
      <SpecRow
        label="Lowest clear height"
        value={`${spec.lowestClearHeight.toFixed(1)} mm`}
      />
      <SpecRow
        label="Est. material"
        value={`~${spec.estimatedVolumeCm3.toFixed(1)} cm³`}
      />
    </SpecCard>
  );
}
