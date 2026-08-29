"use client";

import {
  SpecCard,
  SpecRow,
  type SpecStatus,
} from "@mintables/shared/ui/spec-card";
import type { PullConfig } from "./types";
import { arcBarDepth } from "./types";
import { getPullSpec } from "./spec";

function statusFor(config: PullConfig): { status: SpecStatus; label: string } {
  switch (config.style) {
    case "knob":
      if (config.neckDiameter < 8)
        return { status: "warn", label: "Slender neck" };
      return {
        status: "ok",
        label: `Ø ${String(config.neckDiameter)} mm neck`,
      };
    case "tab":
      if (config.thickness < 2.4)
        return { status: "warn", label: "Thin strip" };
      return { status: "ok", label: `${config.thickness.toFixed(1)} mm strip` };
    case "arc": {
      const depth = arcBarDepth(config);
      if (config.rise - depth / 2 < 18)
        return { status: "warn", label: "Tight grip room" };
      return { status: "ok", label: `Ø ${depth.toFixed(1)} mm bar` };
    }
  }
}

export function PullSummary({ config }: { config: PullConfig }) {
  const spec = getPullSpec(config);

  return (
    <SpecCard status={statusFor(config)}>
      <SpecRow
        label="Footprint"
        value={`${spec.footprintX.toFixed(1)} × ${spec.footprintY.toFixed(1)} mm`}
      />
      <SpecRow label="Stand-off" value={`${spec.height.toFixed(1)} mm`} />
      {config.style === "knob" && (
        <>
          <SpecRow
            label="Head"
            value={`Ø ${String(config.headDiameter)} × ${String(config.headHeight)} mm`}
          />
          <SpecRow
            label="Neck"
            value={`Ø ${String(config.neckDiameter)} × ${String(config.neckHeight)} mm`}
          />
        </>
      )}
      {config.style === "tab" && spec.bladeReach !== undefined && (
        <SpecRow
          label="Blade reach"
          value={`${spec.bladeReach.toFixed(1)} mm`}
        />
      )}
      {config.style === "arc" && spec.gripClearance !== undefined && (
        <SpecRow
          label="Finger room"
          value={`${spec.gripClearance.toFixed(1)} mm`}
        />
      )}
      {config.style === "arc" && spec.footLength !== undefined && (
        <SpecRow
          label="Foot length"
          value={`${spec.footLength.toFixed(1)} mm`}
        />
      )}
      {config.mount === "screws" ? (
        <SpecRow
          label="Screws"
          value={
            config.style === "tab"
              ? `${String(Math.round(config.screwCount))} × Ø ${config.screwDiameter.toFixed(1)} mm countersunk`
              : `Ø ${config.screwDiameter.toFixed(1)} mm pilot, ${config.style === "arc" ? "both feet" : "rear entry"}`
          }
        />
      ) : (
        <SpecRow label="Mounting" value="Glue-on" />
      )}
      <SpecRow
        label="Est. volume"
        value={`~${spec.volumeCm3.toFixed(2)} cm³`}
      />
    </SpecCard>
  );
}
