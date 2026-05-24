"use client";

import type React from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import type {
  AdapterConfig,
  TubeSpec,
  AdapterEndShape,
  FitType,
} from "@/lib/adapter-types";
import {
  DEFAULT_ROUND_TUBE,
  DEFAULT_SQUARE_TUBE,
  DEFAULT_RECTANGULAR_TUBE,
} from "@/lib/adapter-types";
import type { ValidationResult } from "@/lib/validation";
import { fieldHasError, fieldHelperText } from "@/lib/validation";
import { getAdapterSpecSummary } from "@/lib/tube-spec";
import { AdapterSpecSummaryCard } from "@/components/spec-summary-card";
import { CollapsibleSection } from "@/components/collapsible-section";

interface AdapterControlsProps {
  config: AdapterConfig;
  onChange: (config: AdapterConfig) => void;
  validation: ValidationResult;
}

function NumberField({
  label,
  value,
  onChange,
  field,
  validation,
  min,
  max,
  step,
  unit = "mm",
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  field: string;
  validation: ValidationResult;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}) {
  return (
    <TextField
      label={label}
      type="number"
      size="small"
      value={value}
      error={fieldHasError(validation, field)}
      helperText={fieldHelperText(validation, field)}
      onChange={(e) => onChange(Number(e.target.value))}
      slotProps={{
        htmlInput: { min, max, step },
        input: {
          endAdornment: unit ? (
            <InputAdornment position="end">
              <Typography variant="caption" color="text.secondary">
                {unit}
              </Typography>
            </InputAdornment>
          ) : undefined,
        },
      }}
      fullWidth
    />
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Stack spacing={1}>
      <Typography
        variant="overline"
        color="text.secondary"
        sx={{ letterSpacing: 1 }}
      >
        {title}
      </Typography>
      <Box
        sx={{
          bgcolor: "rgba(255,255,255,0.03)",
          borderRadius: 1.5,
          border: "1px solid",
          borderColor: "divider",
          p: 1.5,
        }}
      >
        <Stack spacing={1.5}>{children}</Stack>
      </Box>
    </Stack>
  );
}

function TubeEndSection({
  label,
  tube,
  fitType,
  onTubeChange,
  onFitChange,
  field,
  validation,
}: {
  label: string;
  tube: TubeSpec;
  fitType: FitType;
  onTubeChange: (tube: TubeSpec) => void;
  onFitChange: (fit: FitType) => void;
  field: string;
  validation: ValidationResult;
}) {
  const handleShapeChange = (shape: AdapterEndShape) => {
    if (shape === tube.shape) return;

    let newTube: TubeSpec;
    switch (shape) {
      case "round":
        newTube = { ...DEFAULT_ROUND_TUBE };
        break;
      case "square":
        newTube = { ...DEFAULT_SQUARE_TUBE };
        break;
      case "rectangular":
        newTube = { ...DEFAULT_RECTANGULAR_TUBE };
        break;
    }
    onTubeChange(newTube);
  };

  return (
    <SectionCard title={label}>
      {fieldHelperText(validation, field) && (
        <Typography variant="caption" color="error.main">
          {fieldHelperText(validation, field)}
        </Typography>
      )}
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
        <TextField
          select
          label="Tube Shape"
          size="small"
          value={tube.shape}
          onChange={(e) => handleShapeChange(e.target.value as AdapterEndShape)}
          fullWidth
        >
          <MenuItem value="round">Round</MenuItem>
          <MenuItem value="square">Square</MenuItem>
          <MenuItem value="rectangular">Rectangular</MenuItem>
        </TextField>
        <TextField
          select
          label="Fit Type"
          size="small"
          value={fitType}
          onChange={(e) => onFitChange(e.target.value as FitType)}
          fullWidth
        >
          <MenuItem value="socket">Socket (outside)</MenuItem>
          <MenuItem value="plug">Plug (inside)</MenuItem>
        </TextField>
      </Box>

      {tube.shape === "round" && (
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
          <NumberField
            label="Tube Outer Diameter"
            value={tube.outerDiameter}
            onChange={(v) => onTubeChange({ ...tube, outerDiameter: v })}
            field={field}
            validation={validation}
            min={1}
          />
          {fitType === "plug" && (
            <NumberField
              label="Tube Wall Thickness"
              value={tube.tubeWallThickness}
              onChange={(v) => onTubeChange({ ...tube, tubeWallThickness: v })}
              field={field}
              validation={validation}
              min={0.5}
              step={0.5}
            />
          )}
        </Box>
      )}

      {tube.shape === "square" && (
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
          <NumberField
            label="Tube Outer Size"
            value={tube.outerSize}
            onChange={(v) => onTubeChange({ ...tube, outerSize: v })}
            field={field}
            validation={validation}
            min={1}
          />
          <NumberField
            label="Corner Radius"
            value={tube.cornerRadius}
            onChange={(v) => onTubeChange({ ...tube, cornerRadius: v })}
            field={`${field}.cornerRadius`}
            validation={validation}
            min={0}
          />
          {fitType === "plug" && (
            <NumberField
              label="Tube Wall Thickness"
              value={tube.tubeWallThickness}
              onChange={(v) => onTubeChange({ ...tube, tubeWallThickness: v })}
              field={field}
              validation={validation}
              min={0.5}
              step={0.5}
            />
          )}
        </Box>
      )}

      {tube.shape === "rectangular" && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 1.5,
          }}
        >
          <NumberField
            label="Tube Outer Width"
            value={tube.outerWidth}
            onChange={(v) => onTubeChange({ ...tube, outerWidth: v })}
            field={field}
            validation={validation}
            min={1}
          />
          <NumberField
            label="Tube Outer Height"
            value={tube.outerHeight}
            onChange={(v) => onTubeChange({ ...tube, outerHeight: v })}
            field={field}
            validation={validation}
            min={1}
          />
          <NumberField
            label="Corner Radius"
            value={tube.cornerRadius}
            onChange={(v) => onTubeChange({ ...tube, cornerRadius: v })}
            field={`${field}.cornerRadius`}
            validation={validation}
            min={0}
          />
          {fitType === "plug" && (
            <NumberField
              label="Tube Wall Thickness"
              value={tube.tubeWallThickness}
              onChange={(v) => onTubeChange({ ...tube, tubeWallThickness: v })}
              field={field}
              validation={validation}
              min={0.5}
              step={0.5}
            />
          )}
        </Box>
      )}

      <Typography variant="caption" color="text.secondary">
        {fitType === "socket"
          ? "Socket wraps around the outside of the tube"
          : "Plug fits inside the tube bore"}
      </Typography>
    </SectionCard>
  );
}

export function AdapterControls({
  config,
  onChange,
  validation,
}: AdapterControlsProps) {
  const spec = getAdapterSpecSummary(config);

  return (
    <Stack spacing={2}>
      <TubeEndSection
        label="End A (Bottom)"
        tube={config.endA}
        fitType={config.endAFit}
        onTubeChange={(endA) => onChange({ ...config, endA })}
        onFitChange={(endAFit) => onChange({ ...config, endAFit })}
        field="endA"
        validation={validation}
      />

      <TubeEndSection
        label="End B (Top)"
        tube={config.endB}
        fitType={config.endBFit}
        onTubeChange={(endB) => onChange({ ...config, endB })}
        onFitChange={(endBFit) => onChange({ ...config, endBFit })}
        field="endB"
        validation={validation}
      />

      <AdapterSpecSummaryCard spec={spec} />

      <SectionCard title="Adapter Body">
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
          <NumberField
            label="Wall Thickness"
            value={config.wallThickness}
            onChange={(v) => onChange({ ...config, wallThickness: v })}
            field="wallThickness"
            validation={validation}
            min={1}
            step={0.5}
          />
          <NumberField
            label="Socket Depth"
            value={config.socketDepth}
            onChange={(v) => onChange({ ...config, socketDepth: v })}
            field="socketDepth"
            validation={validation}
            min={5}
          />
        </Box>
        <NumberField
          label="Socket Clearance"
          value={config.socketClearance}
          onChange={(v) => onChange({ ...config, socketClearance: v })}
          field="socketClearance"
          validation={validation}
          min={0}
          step={0.05}
        />
        <Typography variant="caption" color="text.secondary">
          0.2mm snug, 0.3mm loose
        </Typography>
      </SectionCard>

      <CollapsibleSection
        title="Elbow / Bend"
        defaultExpanded={config.bendAngle > 0}
      >
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
          <NumberField
            label="Bend Angle"
            value={config.bendAngle}
            onChange={(v) => onChange({ ...config, bendAngle: v })}
            field="bendAngle"
            validation={validation}
            min={0}
            max={180}
            unit="°"
          />
          <NumberField
            label="Bend Radius"
            value={config.bendRadius}
            onChange={(v) => onChange({ ...config, bendRadius: v })}
            field="bendRadius"
            validation={validation}
            min={0}
          />
        </Box>
        <Typography variant="caption" color="text.secondary">
          0° = straight, 90° = elbow. Radius 0 = auto
        </Typography>
      </CollapsibleSection>

      <CollapsibleSection title="Export Resolution">
        <NumberField
          label="Segments"
          value={config.segmentAmount}
          onChange={(v) => onChange({ ...config, segmentAmount: v })}
          field="segmentAmount"
          validation={validation}
          min={4}
          unit=""
        />
        <Typography variant="caption" color="text.secondary">
          Circular segments in exported STL. More = smoother but larger file.
        </Typography>
      </CollapsibleSection>
    </Stack>
  );
}
