"use client";

import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { NumberField as NumberInput, SectionCard } from "@mintables/shared/ui";
import type { ValidationResult } from "@mintables/shared/lib/validation";
import {
  DEFAULT_OVAL_LEGCAP,
  DEFAULT_RECTANGULAR_LEGCAP,
  DEFAULT_ROUND_LEGCAP,
  DEFAULT_SQUARE_LEGCAP,
  type LegCapConfig,
  type LegCapShape,
} from "./types";

interface LegCapControlsProps {
  config: LegCapConfig;
  onChange: (config: LegCapConfig) => void;
  validation: ValidationResult;
}

export function LegCapControls({
  config,
  onChange,
  validation,
}: LegCapControlsProps) {
  const update = (patch: Partial<LegCapConfig>) => {
    // Shape-specific patches need to be cast through the discriminated union
    // because TS can't track which branch we're updating here.
    onChange({ ...config, ...patch } as LegCapConfig);
  };

  const switchShape = (shape: LegCapShape) => {
    if (shape === config.shape) return;
    // Carry the shared base parameters across so the user keeps their wall /
    // floor / taper / felt settings when switching cross-sections.
    const carry = {
      wallThickness: config.wallThickness,
      capHeight: config.capHeight,
      floorThickness: config.floorThickness,
      fitClearance: config.fitClearance,
      innerTaperEnabled: config.innerTaperEnabled,
      innerTaper: config.innerTaper,
      feltRecessEnabled: config.feltRecessEnabled,
      feltInset: config.feltInset,
      feltDepth: config.feltDepth,
    };
    switch (shape) {
      case "round":
        onChange({ ...DEFAULT_ROUND_LEGCAP, ...carry });
        return;
      case "square":
        onChange({ ...DEFAULT_SQUARE_LEGCAP, ...carry });
        return;
      case "rectangular":
        onChange({ ...DEFAULT_RECTANGULAR_LEGCAP, ...carry });
        return;
      case "oval":
        onChange({ ...DEFAULT_OVAL_LEGCAP, ...carry });
        return;
    }
  };

  // Per-shape max constraints used by the corner-radius slider.
  const shortOuter = (() => {
    const wall = config.wallThickness;
    switch (config.shape) {
      case "round":
        return config.innerDiameter + 2 * wall;
      case "square":
        return config.innerSize + 2 * wall;
      case "rectangular":
      case "oval":
        return Math.min(config.innerWidth, config.innerHeight) + 2 * wall;
    }
  })();
  const maxCornerRadius = Math.floor((shortOuter / 2) * 10) / 10;

  const maxTaper = Math.floor(config.wallThickness * 0.8 * 100) / 100;
  const maxFeltInset = Math.floor(config.wallThickness * 10) / 10;
  const maxFeltDepth = Math.floor(config.floorThickness * 0.6 * 100) / 100;

  return (
    <Stack spacing={2}>
      <SectionCard title="Leg cross-section">
        <TextField
          select
          size="small"
          label="Shape"
          value={config.shape}
          onChange={(e) => {
            switchShape(e.target.value as LegCapShape);
          }}
          fullWidth
        >
          <MenuItem value="round">Round</MenuItem>
          <MenuItem value="square">Square</MenuItem>
          <MenuItem value="rectangular">Rectangular</MenuItem>
          <MenuItem value="oval">Oval</MenuItem>
        </TextField>
      </SectionCard>

      <SectionCard title="Leg dimensions">
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
          {config.shape === "round" && (
            <NumberInput
              label="Leg diameter"
              value={config.innerDiameter}
              onChange={(v) => {
                update({ innerDiameter: v });
              }}
              field="innerDiameter"
              validation={validation}
              min={2}
              max={200}
              step={0.5}
              unit="mm"
            />
          )}

          {config.shape === "square" && (
            <NumberInput
              label="Leg size"
              value={config.innerSize}
              onChange={(v) => {
                update({ innerSize: v });
              }}
              field="innerSize"
              validation={validation}
              min={2}
              max={200}
              step={0.5}
              unit="mm"
            />
          )}

          {(config.shape === "rectangular" || config.shape === "oval") && (
            <>
              <NumberInput
                label="Leg width"
                value={config.innerWidth}
                onChange={(v) => {
                  update({ innerWidth: v });
                }}
                field="innerWidth"
                validation={validation}
                min={2}
                max={200}
                step={0.5}
                unit="mm"
              />
              <NumberInput
                label="Leg depth"
                value={config.innerHeight}
                onChange={(v) => {
                  update({ innerHeight: v });
                }}
                field="innerHeight"
                validation={validation}
                min={2}
                max={200}
                step={0.5}
                unit="mm"
              />
            </>
          )}

          <NumberInput
            label="Fit clearance"
            value={config.fitClearance}
            onChange={(v) => {
              update({ fitClearance: v });
            }}
            field="fitClearance"
            validation={validation}
            min={0}
            max={5}
            step={0.1}
            unit="mm"
          />
        </Box>
        <Typography
          variant="caption"
          sx={{ color: "text.secondary", display: "block", mt: 1 }}
        >
          Measure the leg with calipers and enter that number. The clearance is
          added to the socket so the leg slides in — 0.3 mm is a snug fit,
          0.5 mm is comfortable.
        </Typography>
      </SectionCard>

      <SectionCard title="Cap dimensions">
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
          <NumberInput
            label="Cap height"
            value={config.capHeight}
            onChange={(v) => {
              update({ capHeight: v });
            }}
            field="capHeight"
            validation={validation}
            min={2}
            max={200}
            step={1}
            unit="mm"
          />
          <NumberInput
            label="Wall thickness"
            value={config.wallThickness}
            onChange={(v) => {
              update({ wallThickness: v });
            }}
            field="wallThickness"
            validation={validation}
            min={0.8}
            max={10}
            step={0.1}
            unit="mm"
          />
          <NumberInput
            label="Floor thickness"
            value={config.floorThickness}
            onChange={(v) => {
              update({ floorThickness: v });
            }}
            field="floorThickness"
            validation={validation}
            min={0.4}
            max={20}
            step={0.1}
            unit="mm"
          />
          {(config.shape === "square" || config.shape === "rectangular") && (
            <NumberInput
              label="Corner radius"
              value={config.cornerRadius}
              onChange={(v) => {
                update({ cornerRadius: v });
              }}
              field="cornerRadius"
              validation={validation}
              min={0}
              max={maxCornerRadius}
              step={0.5}
              unit="mm"
            />
          )}
        </Box>
      </SectionCard>

      <SectionCard title="Inner taper">
        <Stack spacing={1.5}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Narrow the socket toward the floor for a wedge fit
            </Typography>
            <Switch
              size="small"
              checked={config.innerTaperEnabled}
              onChange={(e) => {
                update({ innerTaperEnabled: e.target.checked });
              }}
            />
          </Box>

          {config.innerTaperEnabled && (
            <NumberInput
              label="Taper"
              value={config.innerTaper}
              onChange={(v) => {
                update({ innerTaper: v });
              }}
              field="innerTaper"
              validation={validation}
              min={0}
              max={Math.max(0.05, maxTaper)}
              step={0.05}
              unit="mm"
            />
          )}
        </Stack>
      </SectionCard>

      <SectionCard title="Felt pad recess">
        <Stack spacing={1.5}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Pocket on the bottom face for a glue-in felt pad
            </Typography>
            <Switch
              size="small"
              checked={config.feltRecessEnabled}
              onChange={(e) => {
                update({ feltRecessEnabled: e.target.checked });
              }}
            />
          </Box>

          {config.feltRecessEnabled && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 1.5,
              }}
            >
              <NumberInput
                label="Rim inset"
                value={config.feltInset}
                onChange={(v) => {
                  update({ feltInset: v });
                }}
                field="feltInset"
                validation={validation}
                min={0.5}
                max={Math.max(0.5, maxFeltInset)}
                step={0.1}
                unit="mm"
              />
              <NumberInput
                label="Depth"
                value={config.feltDepth}
                onChange={(v) => {
                  update({ feltDepth: v });
                }}
                field="feltDepth"
                validation={validation}
                min={0.2}
                max={Math.max(0.2, maxFeltDepth)}
                step={0.1}
                unit="mm"
              />
            </Box>
          )}
        </Stack>
      </SectionCard>
    </Stack>
  );
}
