"use client";

import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { NumberField as NumberInput, SectionCard } from "@mintables/shared/ui";
import type { ValidationResult } from "@mintables/shared/lib/validation";
import { fieldHelperText } from "@mintables/shared/lib/validation";
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

  // The geometric max for corner radius depends on the shortest in-plane side.
  // When the user has dialed a tapered bottom narrower than the top, the
  // bottom edge becomes the binding constraint.
  const effectiveBottom = config.taperEnabled
    ? config.bottomWidth
    : config.width;
  const shortestSide = Math.min(config.width, effectiveBottom, config.height);
  const maxRadius = Math.floor((shortestSide / 2) * 10) / 10;

  // Label pocket has to leave at least 1 mm of slab wall around it and can't
  // cut deeper than half the slab thickness.
  const maxLabelWidth = Math.max(
    1,
    Math.floor((Math.min(config.width, effectiveBottom) - 2) * 10) / 10,
  );
  const maxLabelHeight = Math.max(1, Math.floor((config.height - 2) * 10) / 10);
  const maxLabelDepth = Math.max(
    0.1,
    Math.floor((config.thickness / 2) * 100) / 100,
  );

  const taperWarning = fieldHelperText(validation, "bottomWidth");

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
            label={config.taperEnabled ? "Width (top)" : "Width"}
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
      <SectionCard title="Corners">
        <NumberInput
          label="Corner radius"
          value={config.cornerRadius}
          onChange={(v) => {
            update({ cornerRadius: v });
          }}
          field="cornerRadius"
          validation={validation}
          min={0}
          max={maxRadius}
          step={0.5}
          unit="mm"
        />
      </SectionCard>
      <SectionCard title="Taper">
        <Stack spacing={1.5}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="body2" sx={{
              color: "text.secondary"
            }}>
              Shrink the bottom edge to fit a tapered slot
            </Typography>
            <Switch
              size="small"
              checked={config.taperEnabled}
              onChange={(e) => {
                const enabled = e.target.checked;
                // When toggling on for the first time, pre-fill the bottom
                // width with the current top width so the slab looks the same
                // until the user actually changes it. When toggling off, keep
                // bottomWidth as-is so re-enabling later restores the value.
                if (enabled && config.bottomWidth === 0) {
                  update({ taperEnabled: true, bottomWidth: config.width });
                } else {
                  update({ taperEnabled: enabled });
                }
              }}
            />
          </Box>

          {config.taperEnabled && (
            <>
              <NumberInput
                label="Width (bottom)"
                value={config.bottomWidth}
                onChange={(v) => {
                  update({ bottomWidth: v });
                }}
                field="bottomWidth"
                validation={validation}
                min={1}
                max={500}
                step={0.5}
                unit="mm"
              />
              {taperWarning && (
                <Typography variant="caption" sx={{
                  color: "warning.main"
                }}>
                  {taperWarning}
                </Typography>
              )}
            </>
          )}
        </Stack>
      </SectionCard>
      <SectionCard title="Label pocket">
        <Stack spacing={1.5}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="body2" sx={{
              color: "text.secondary"
            }}>
              Recess a sticker into the top face
            </Typography>
            <Switch
              size="small"
              checked={config.labelEnabled}
              onChange={(e) => {
                update({ labelEnabled: e.target.checked });
              }}
            />
          </Box>

          {config.labelEnabled && (
            <Stack spacing={1.5}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 1.5,
                }}
              >
                <NumberInput
                  label="Label width"
                  value={config.labelWidth}
                  onChange={(v) => {
                    update({ labelWidth: v });
                  }}
                  field="labelWidth"
                  validation={validation}
                  min={1}
                  max={maxLabelWidth}
                  step={0.5}
                  unit="mm"
                />
                <NumberInput
                  label="Label height"
                  value={config.labelHeight}
                  onChange={(v) => {
                    update({ labelHeight: v });
                  }}
                  field="labelHeight"
                  validation={validation}
                  min={1}
                  max={maxLabelHeight}
                  step={0.5}
                  unit="mm"
                />
                <NumberInput
                  label="Depth"
                  value={config.labelDepth}
                  onChange={(v) => {
                    update({ labelDepth: v });
                  }}
                  field="labelDepth"
                  validation={validation}
                  min={0.1}
                  max={maxLabelDepth}
                  step={0.05}
                  unit="mm"
                />
                <TextField
                  select
                  size="small"
                  label="Position"
                  value={config.labelPosition}
                  onChange={(e) => {
                    update({
                      labelPosition: e.target
                        .value as DividerConfig["labelPosition"],
                    });
                  }}
                  fullWidth
                >
                  <MenuItem value="top">Top</MenuItem>
                  <MenuItem value="center">Center</MenuItem>
                  <MenuItem value="bottom">Bottom</MenuItem>
                </TextField>
              </Box>
            </Stack>
          )}
        </Stack>
      </SectionCard>
    </Stack>
  );
}
