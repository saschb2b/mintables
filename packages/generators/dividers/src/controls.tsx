"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { NumberField as NumberInput, SectionCard } from "@mintables/shared/ui";
import type { ValidationResult } from "@mintables/shared/lib/validation";
import type { DividerConfig } from "./types";

interface DividerControlsProps {
  config: DividerConfig;
  onChange: (config: DividerConfig) => void;
  validation: ValidationResult;
}

export function DividerControls({
  config,
  onChange,
  validation,
}: DividerControlsProps) {
  const update = (patch: Partial<DividerConfig>) => {
    onChange({ ...config, ...patch });
  };

  return (
    <Stack spacing={2}>
      <SectionCard title="Dimensions">
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
          <NumberInput
            label="Thickness"
            value={config.thickness}
            onChange={(v) => {
              update({ thickness: v });
            }}
            field="thickness"
            validation={validation}
            min={0.4}
            max={20}
            step={0.1}
            unit="mm"
          />
          <NumberInput
            label="Width"
            value={config.width}
            onChange={(v) => {
              update({ width: v });
            }}
            field="width"
            validation={validation}
            min={1}
            max={500}
            step={1}
            unit="mm"
          />
          <NumberInput
            label="Height"
            value={config.height}
            onChange={(v) => {
              update({ height: v });
            }}
            field="height"
            validation={validation}
            min={1}
            max={500}
            step={1}
            unit="mm"
          />
        </Box>
      </SectionCard>
    </Stack>
  );
}
