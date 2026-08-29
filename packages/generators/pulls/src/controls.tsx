"use client";

import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { NumberField as NumberInput, SectionCard } from "@mintables/shared/ui";
import type { ValidationResult } from "@mintables/shared/lib/validation";
import {
  DEFAULT_ARC_PULL,
  DEFAULT_KNOB_PULL,
  DEFAULT_TAB_PULL,
  type ArcBarProfile,
  type KnobHeadShape,
  type PullConfig,
  type PullMount,
  type PullStyle,
  type TabTipStyle,
} from "./types";

interface PullControlsProps {
  config: PullConfig;
  onChange: (config: PullConfig) => void;
  validation: ValidationResult;
}

const fieldGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 1.5,
} as const;

export function PullControls({
  config,
  onChange,
  validation,
}: PullControlsProps) {
  const update = (patch: Partial<PullConfig>) => {
    // Style-specific patches go through the union; TS can't narrow which
    // branch a partial belongs to here.
    onChange({ ...config, ...patch } as PullConfig);
  };

  const switchStyle = (style: PullStyle) => {
    if (style === config.style) return;
    // Keep the mounting choice when hopping between styles; the screw
    // diameter deliberately resets because each style suits another screw.
    const carry = { mount: config.mount };
    switch (style) {
      case "knob":
        onChange({ ...DEFAULT_KNOB_PULL, ...carry });
        return;
      case "tab":
        onChange({ ...DEFAULT_TAB_PULL, ...carry });
        return;
      case "arc":
        onChange({ ...DEFAULT_ARC_PULL, ...carry });
        return;
    }
  };

  return (
    <Stack spacing={2}>
      <SectionCard title="Pull style">
        <TextField
          select
          size="small"
          label="Style"
          value={config.style}
          onChange={(e) => {
            switchStyle(e.target.value as PullStyle);
          }}
          fullWidth
        >
          <MenuItem value="knob">Knob</MenuItem>
          <MenuItem value="tab">Angled tab</MenuItem>
          <MenuItem value="arc">Arc handle</MenuItem>
        </TextField>
      </SectionCard>

      {config.style === "knob" && (
        <>
          <SectionCard title="Head">
            <Box sx={fieldGrid}>
              <TextField
                select
                size="small"
                label="Top shape"
                value={config.headShape}
                onChange={(e) => {
                  update({ headShape: e.target.value as KnobHeadShape });
                }}
                fullWidth
              >
                <MenuItem value="dome">Dome</MenuItem>
                <MenuItem value="flat">Flat</MenuItem>
                <MenuItem value="dished">Finger dish</MenuItem>
              </TextField>
              <Box />
              <NumberInput
                label="Head diameter"
                value={config.headDiameter}
                onChange={(v) => {
                  update({ headDiameter: v });
                }}
                field="headDiameter"
                validation={validation}
                min={8}
                max={80}
                step={1}
                unit="mm"
              />
              <NumberInput
                label="Head height"
                value={config.headHeight}
                onChange={(v) => {
                  update({ headHeight: v });
                }}
                field="headHeight"
                validation={validation}
                min={4}
                max={60}
                step={1}
                unit="mm"
              />
              <NumberInput
                label="Grip rings"
                value={config.gripGrooves}
                onChange={(v) => {
                  update({ gripGrooves: Math.round(v) });
                }}
                field="gripGrooves"
                validation={validation}
                min={0}
                max={12}
                step={1}
                unit=""
              />
              {config.gripGrooves > 0 && (
                <NumberInput
                  label="Ring depth"
                  value={config.gripGrooveDepth}
                  onChange={(v) => {
                    update({ gripGrooveDepth: v });
                  }}
                  field="gripGrooveDepth"
                  validation={validation}
                  min={0.2}
                  max={2}
                  step={0.1}
                  unit="mm"
                />
              )}
            </Box>
          </SectionCard>

          <SectionCard title="Neck and base">
            <Box sx={fieldGrid}>
              <NumberInput
                label="Neck diameter"
                value={config.neckDiameter}
                onChange={(v) => {
                  update({ neckDiameter: v });
                }}
                field="neckDiameter"
                validation={validation}
                min={4}
                max={80}
                step={0.5}
                unit="mm"
              />
              <NumberInput
                label="Neck height"
                value={config.neckHeight}
                onChange={(v) => {
                  update({ neckHeight: v });
                }}
                field="neckHeight"
                validation={validation}
                min={0}
                max={40}
                step={0.5}
                unit="mm"
              />
              <NumberInput
                label="Base diameter"
                value={config.baseDiameter}
                onChange={(v) => {
                  update({ baseDiameter: v });
                }}
                field="baseDiameter"
                validation={validation}
                min={6}
                max={90}
                step={0.5}
                unit="mm"
              />
              <NumberInput
                label="Base height"
                value={config.baseHeight}
                onChange={(v) => {
                  update({ baseHeight: v });
                }}
                field="baseHeight"
                validation={validation}
                min={0.4}
                max={20}
                step={0.5}
                unit="mm"
              />
            </Box>
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", display: "block", mt: 1 }}
            >
              Equal neck and head diameters give a straight cylinder knob. A
              narrow waist reads classic and grips better.
            </Typography>
          </SectionCard>
        </>
      )}

      {config.style === "tab" && (
        <>
          <SectionCard title="Strip">
            <Box sx={fieldGrid}>
              <NumberInput
                label="Width"
                value={config.width}
                onChange={(v) => {
                  update({ width: v });
                }}
                field="width"
                validation={validation}
                min={8}
                max={80}
                step={1}
                unit="mm"
              />
              <NumberInput
                label="Thickness"
                value={config.thickness}
                onChange={(v) => {
                  update({ thickness: v });
                }}
                field="thickness"
                validation={validation}
                min={1.6}
                max={8}
                step={0.2}
                unit="mm"
              />
              <NumberInput
                label="Base length"
                value={config.baseLength}
                onChange={(v) => {
                  update({ baseLength: v });
                }}
                field="baseLength"
                validation={validation}
                min={10}
                max={120}
                step={1}
                unit="mm"
              />
              <NumberInput
                label="Blade length"
                value={config.tabLength}
                onChange={(v) => {
                  update({ tabLength: v });
                }}
                field="tabLength"
                validation={validation}
                min={8}
                max={120}
                step={1}
                unit="mm"
              />
            </Box>
          </SectionCard>

          <SectionCard title="Bend">
            <Box sx={fieldGrid}>
              <NumberInput
                label="Blade angle"
                value={config.tabAngle}
                onChange={(v) => {
                  update({ tabAngle: v });
                }}
                field="tabAngle"
                validation={validation}
                min={10}
                max={90}
                step={5}
                unit="deg"
              />
              <NumberInput
                label="Bend radius"
                value={config.bendRadius}
                onChange={(v) => {
                  update({ bendRadius: v });
                }}
                field="bendRadius"
                validation={validation}
                min={0.5}
                max={20}
                step={0.5}
                unit="mm"
              />
              <TextField
                select
                size="small"
                label="Tip"
                value={config.tipStyle}
                onChange={(e) => {
                  update({ tipStyle: e.target.value as TabTipStyle });
                }}
                fullWidth
              >
                <MenuItem value="rounded">Rounded</MenuItem>
                <MenuItem value="square">Square</MenuItem>
              </TextField>
            </Box>
          </SectionCard>
        </>
      )}

      {config.style === "arc" && (
        <>
          <SectionCard title="Arch">
            <Box sx={fieldGrid}>
              <NumberInput
                label="Hole spacing"
                value={config.holeSpacing}
                onChange={(v) => {
                  update({ holeSpacing: v });
                }}
                field="holeSpacing"
                validation={validation}
                min={24}
                max={300}
                step={1}
                unit="mm"
              />
              <NumberInput
                label="Rise"
                value={config.rise}
                onChange={(v) => {
                  update({ rise: v });
                }}
                field="rise"
                validation={validation}
                min={12}
                max={160}
                step={1}
                unit="mm"
              />
            </Box>
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", display: "block", mt: 1 }}
            >
              Hole spacing is the standard drawer dimension: 64, 96, or 128 mm
              match most pre-drilled fronts. Raise the rise past half the
              spacing for a horseshoe.
            </Typography>
          </SectionCard>

          <SectionCard title="Bar">
            <Box sx={fieldGrid}>
              <TextField
                select
                size="small"
                label="Profile"
                value={config.barProfile}
                onChange={(e) => {
                  update({ barProfile: e.target.value as ArcBarProfile });
                }}
                fullWidth
              >
                <MenuItem value="round">Round</MenuItem>
                <MenuItem value="flat">Flat</MenuItem>
              </TextField>
              {config.barProfile === "round" ? (
                <NumberInput
                  label="Bar diameter"
                  value={config.barDiameter}
                  onChange={(v) => {
                    update({ barDiameter: v });
                  }}
                  field="barDiameter"
                  validation={validation}
                  min={5}
                  max={30}
                  step={0.5}
                  unit="mm"
                />
              ) : (
                <>
                  <NumberInput
                    label="Bar width"
                    value={config.barWidth}
                    onChange={(v) => {
                      update({ barWidth: v });
                    }}
                    field="barWidth"
                    validation={validation}
                    min={6}
                    max={40}
                    step={0.5}
                    unit="mm"
                  />
                  <NumberInput
                    label="Bar depth"
                    value={config.barDepth}
                    onChange={(v) => {
                      update({ barDepth: v });
                    }}
                    field="barDepth"
                    validation={validation}
                    min={4}
                    max={30}
                    step={0.5}
                    unit="mm"
                  />
                </>
              )}
            </Box>
          </SectionCard>
        </>
      )}

      <SectionCard title="Mounting">
        <Stack spacing={1.5}>
          <TextField
            select
            size="small"
            label="Attachment"
            value={config.mount}
            onChange={(e) => {
              update({ mount: e.target.value as PullMount });
            }}
            fullWidth
          >
            <MenuItem value="screws">Screws</MenuItem>
            <MenuItem value="glue">Glue only</MenuItem>
          </TextField>

          {config.mount === "screws" && (
            <Box sx={fieldGrid}>
              <NumberInput
                label={config.style === "tab" ? "Screw shank" : "Pilot bore"}
                value={config.screwDiameter}
                onChange={(v) => {
                  update({ screwDiameter: v });
                }}
                field="screwDiameter"
                validation={validation}
                min={1.5}
                max={8}
                step={0.1}
                unit="mm"
              />
              {config.style === "tab" ? (
                <>
                  <NumberInput
                    label="Screw head"
                    value={config.screwHeadDiameter}
                    onChange={(v) => {
                      update({ screwHeadDiameter: v });
                    }}
                    field="screwHeadDiameter"
                    validation={validation}
                    min={3}
                    max={14}
                    step={0.5}
                    unit="mm"
                  />
                  <NumberInput
                    label="Screws"
                    value={config.screwCount}
                    onChange={(v) => {
                      update({ screwCount: Math.round(v) });
                    }}
                    field="screwCount"
                    validation={validation}
                    min={1}
                    max={2}
                    step={1}
                    unit=""
                  />
                </>
              ) : (
                <NumberInput
                  label="Bore depth"
                  value={config.screwHoleDepth}
                  onChange={(v) => {
                    update({ screwHoleDepth: v });
                  }}
                  field="screwHoleDepth"
                  validation={validation}
                  min={4}
                  max={40}
                  step={1}
                  unit="mm"
                />
              )}
            </Box>
          )}
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {config.style === "tab"
              ? "Countersunk screws go down through the base into the lid."
              : "Screws come from behind the front and thread into the pilot bore; size it about 0.5 mm under the screw's outer diameter."}
          </Typography>
        </Stack>
      </SectionCard>
    </Stack>
  );
}
