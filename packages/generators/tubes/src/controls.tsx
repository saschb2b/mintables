"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Switch from "@mui/material/Switch";
import Stack from "@mui/material/Stack";
import type {
  TubeConfig,
  TubeShape,
  CutType,
  EndCutConfig,
  FlareConfig,
  ClamshellConfig,
} from "./types";
import {
  DEFAULT_ROUND_CONFIG,
  DEFAULT_SQUARE_CONFIG,
  DEFAULT_RECTANGULAR_CONFIG,
  FLARE_FIT_CLEARANCE,
} from "./types";
import type { ValidationResult } from "@mintables/shared/lib/validation";
import {
  fieldHasError,
  fieldHelperText,
} from "@mintables/shared/lib/validation";
import {
  CollapsibleSection,
  NumberField as NumberInput,
  SectionCard,
} from "@mintables/shared/ui";

interface TubeControlsProps {
  config: TubeConfig;
  onChange: (config: TubeConfig) => void;
  validation: ValidationResult;
}

function EndCutControls({
  cutConfig,
  onChange,
  outerSize,
  disabled = false,
  field,
  validation,
}: {
  cutConfig: EndCutConfig;
  onChange: (config: EndCutConfig) => void;
  outerSize: number;
  disabled?: boolean;
  field: string;
  validation: ValidationResult;
}) {
  const handleTypeChange = (type: CutType) => {
    let newCut: EndCutConfig;
    if (type === "flat") {
      newCut = { type: "flat" };
    } else if (type === "miter") {
      newCut = { type: "miter", angle: 45 };
    } else if (type === "chamfer") {
      newCut = { type: "chamfer", angle: 45, depth: 2 };
    } else {
      newCut = { type: "saddle", targetDiameter: outerSize * 2, angle: 90 };
    }
    onChange(newCut);
  };

  return (
    <Stack spacing={1.5}>
      <TextField
        select
        size="small"
        value={cutConfig.type}
        onChange={(e) => handleTypeChange(e.target.value as CutType)}
        disabled={disabled}
        fullWidth
      >
        <MenuItem value="flat">Flat (Standard)</MenuItem>
        <MenuItem value="miter">Miter (Angled)</MenuItem>
        <MenuItem value="chamfer">Chamfer (Beveled Edge)</MenuItem>
        <MenuItem value="saddle">Saddle (T-Joint / Fish-mouth)</MenuItem>
      </TextField>

      {cutConfig.type === "miter" && (
        <NumberInput
          label="Miter Angle"
          value={cutConfig.angle}
          onChange={(v) => onChange({ ...cutConfig, angle: v })}
          field={field}
          validation={validation}
          min={0}
          max={60}
          step={1}
          unit="°"
        />
      )}

      {cutConfig.type === "chamfer" && (
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
          <NumberInput
            label="Chamfer Angle"
            value={cutConfig.angle}
            onChange={(v) => onChange({ ...cutConfig, angle: v })}
            field={field}
            validation={validation}
            min={15}
            max={75}
            step={1}
            unit="°"
          />
          <NumberInput
            label="Chamfer Depth"
            value={cutConfig.depth}
            onChange={(v) => onChange({ ...cutConfig, depth: v })}
            field={field}
            validation={validation}
            min={0.5}
            max={10}
            step={0.5}
          />
        </Box>
      )}

      {cutConfig.type === "saddle" && (
        <>
          <Typography variant="caption" color="text.secondary">
            Creates a curved cut to fit against another cylindrical pipe
          </Typography>
          <Box
            sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}
          >
            <NumberInput
              label="Target Pipe Diameter"
              value={cutConfig.targetDiameter}
              onChange={(v) => onChange({ ...cutConfig, targetDiameter: v })}
              field={field}
              validation={validation}
              min={1}
              step={1}
            />
            <NumberInput
              label="Intersection Angle"
              value={cutConfig.angle}
              onChange={(v) => onChange({ ...cutConfig, angle: v })}
              field={field}
              validation={validation}
              min={45}
              max={90}
              step={1}
              unit="°"
            />
          </Box>
        </>
      )}
    </Stack>
  );
}

export function TubeControls({ config, onChange, validation }: TubeControlsProps) {
  const handleShapeChange = (shape: TubeShape) => {
    const clamshell =
      shape === "round"
        ? config.clamshell
        : { ...config.clamshell, enabled: false };
    if (shape === "round") {
      onChange({
        ...DEFAULT_ROUND_CONFIG,
        length: config.length,
        flare: config.flare,
        topCut: config.topCut,
        bottomCut: config.bottomCut,
        clamshell,
      });
    } else if (shape === "square") {
      onChange({
        ...DEFAULT_SQUARE_CONFIG,
        length: config.length,
        flare: config.flare,
        topCut: config.topCut,
        bottomCut: config.bottomCut,
        clamshell,
      });
    } else {
      onChange({
        ...DEFAULT_RECTANGULAR_CONFIG,
        length: config.length,
        flare: config.flare,
        topCut: config.topCut,
        bottomCut: config.bottomCut,
        clamshell,
      });
    }
  };

  const updateConfig = (updates: Partial<TubeConfig>) => {
    onChange({ ...config, ...updates } as TubeConfig);
  };

  const updateFlare = (updates: Partial<FlareConfig>) => {
    onChange({
      ...config,
      flare: { ...config.flare, ...updates },
    } as TubeConfig);
  };

  const updateClamshell = (updates: Partial<ClamshellConfig>) => {
    const newClamshell = { ...config.clamshell, ...updates };
    const newConfig = { ...config, clamshell: newClamshell } as TubeConfig;
    // When enabling clamshell, force flat cuts, disable flare, ensure wall thickness
    if (updates.enabled) {
      newConfig.topCut = { type: "flat" };
      newConfig.bottomCut = { type: "flat" };
      newConfig.flare = { ...newConfig.flare, enabled: false };
      // Ensure minimum wall thickness for stepped joint
      if (newConfig.shape === "round") {
        const wallThickness =
          (newConfig.outerDiameter - newConfig.innerDiameter) / 2;
        const minWall = newClamshell.clearance + 1.0; // clearance gap + 0.5mm per band minimum
        if (wallThickness < minWall) {
          newConfig.outerDiameter = newConfig.innerDiameter + minWall * 2;
        }
      }
    }
    onChange(newConfig);
  };

  const getOuterSize = () => {
    if (config.shape === "round") return config.outerDiameter;
    if (config.shape === "square") return config.outerSize;
    return config.outerWidth;
  };

  const canUseFlare =
    config.topCut.type === "flat" && !config.clamshell.enabled;
  const canUseClamshell = config.shape === "round";
  const clamshellActive = config.clamshell.enabled && canUseClamshell;

  return (
    <Stack spacing={2}>
      {/* Shape & Dimensions */}
      <SectionCard title="Tube Shape & Dimensions">
        <TextField
          select
          size="small"
          value={config.shape}
          onChange={(e) => handleShapeChange(e.target.value as TubeShape)}
          fullWidth
        >
          <MenuItem value="round">Round / Circular</MenuItem>
          <MenuItem value="square">Square</MenuItem>
          <MenuItem value="rectangular">Rectangular</MenuItem>
        </TextField>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
          {config.shape === "round" && (
            <>
              <NumberInput
                label="Inner Diameter"
                value={config.innerDiameter}
                onChange={(v) => updateConfig({ innerDiameter: v })}
                field="innerDiameter"
                validation={validation}
                step={0.5}
              />
              <NumberInput
                label="Outer Diameter"
                value={config.outerDiameter}
                onChange={(v) => updateConfig({ outerDiameter: v })}
                field="outerDiameter"
                validation={validation}
                step={0.5}
              />
            </>
          )}

          {config.shape === "square" && (
            <>
              <NumberInput
                label="Inner Size"
                value={config.innerSize}
                onChange={(v) => updateConfig({ innerSize: v })}
                field="innerSize"
                validation={validation}
                step={0.5}
              />
              <NumberInput
                label="Outer Size"
                value={config.outerSize}
                onChange={(v) => updateConfig({ outerSize: v })}
                field="outerSize"
                validation={validation}
                step={0.5}
              />
              <NumberInput
                label="Corner Radius"
                value={config.cornerRadius}
                onChange={(v) => updateConfig({ cornerRadius: v })}
                field="cornerRadius"
                validation={validation}
                step={0.5}
              />
            </>
          )}

          {config.shape === "rectangular" && (
            <>
              <NumberInput
                label="Inner Width"
                value={config.innerWidth}
                onChange={(v) => updateConfig({ innerWidth: v })}
                field="innerWidth"
                validation={validation}
                step={0.5}
              />
              <NumberInput
                label="Inner Height"
                value={config.innerHeight}
                onChange={(v) => updateConfig({ innerHeight: v })}
                field="innerHeight"
                validation={validation}
                step={0.5}
              />
              <NumberInput
                label="Outer Width"
                value={config.outerWidth}
                onChange={(v) => updateConfig({ outerWidth: v })}
                field="outerWidth"
                validation={validation}
                step={0.5}
              />
              <NumberInput
                label="Outer Height"
                value={config.outerHeight}
                onChange={(v) => updateConfig({ outerHeight: v })}
                field="outerHeight"
                validation={validation}
                step={0.5}
              />
              <NumberInput
                label="Corner Radius"
                value={config.cornerRadius}
                onChange={(v) => updateConfig({ cornerRadius: v })}
                field="cornerRadius"
                validation={validation}
                step={0.5}
              />
            </>
          )}

          <NumberInput
            label="Length"
            value={config.length}
            onChange={(v) => updateConfig({ length: v })}
            field="length"
            validation={validation}
            step={1}
          />
        </Box>
      </SectionCard>

      <CollapsibleSection title="End Cuts" defaultExpanded>
        <Stack spacing={2}>
          <SectionCard title="Top End">
            <EndCutControls
              cutConfig={config.topCut}
              onChange={(cut) => updateConfig({ topCut: cut })}
              outerSize={getOuterSize()}
              disabled={clamshellActive}
              field="topCut"
              validation={validation}
            />
            {clamshellActive && (
              <Typography variant="caption" color="text.secondary">
                End cuts disabled in clamshell mode
              </Typography>
            )}
            {!clamshellActive &&
              config.topCut.type !== "flat" &&
              config.flare.enabled && (
                <Typography variant="caption" color="warning.main">
                  Flare disabled - only works with flat top cut
                </Typography>
              )}
          </SectionCard>

          <SectionCard title="Bottom End">
            <EndCutControls
              cutConfig={config.bottomCut}
              onChange={(cut) => updateConfig({ bottomCut: cut })}
              outerSize={getOuterSize()}
              disabled={clamshellActive}
              field="bottomCut"
              validation={validation}
            />
            {clamshellActive && (
              <Typography variant="caption" color="text.secondary">
                End cuts disabled in clamshell mode
              </Typography>
            )}
          </SectionCard>
        </Stack>
      </CollapsibleSection>

      <CollapsibleSection title="Clamshell Split" defaultExpanded={clamshellActive}>
        <Stack spacing={1.5}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Split into two interlocking halves
            </Typography>
            <Switch
              size="small"
              checked={clamshellActive}
              onChange={(e) => updateClamshell({ enabled: e.target.checked })}
              disabled={!canUseClamshell}
            />
          </Box>

          {!canUseClamshell && config.clamshell.enabled && (
            <Typography variant="caption" color="warning.main">
              Clamshell split is only available for round tubes
            </Typography>
          )}
          {fieldHelperText(validation, "clamshell") && (
            <Typography variant="caption" color="warning.main">
              {fieldHelperText(validation, "clamshell")}
            </Typography>
          )}

          {clamshellActive && (
            <Stack spacing={1.5}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 1.5,
                }}
              >
                <NumberInput
                  label="Overlap"
                  value={config.clamshell.overlap}
                  onChange={(v) => updateClamshell({ overlap: v })}
                  field="clamshell"
                  validation={validation}
                  min={2}
                  max={30}
                  step={1}
                  unit="°"
                />
                <NumberInput
                  label="Clearance"
                  value={config.clamshell.clearance}
                  onChange={(v) => updateClamshell({ clearance: v })}
                  field="clamshell"
                  validation={validation}
                  min={0.05}
                  max={0.5}
                  step={0.05}
                />
                <NumberInput
                  label="Separation"
                  value={config.clamshell.separation}
                  onChange={(v) => updateClamshell({ separation: v })}
                  field="clamshell"
                  validation={validation}
                  min={2}
                  max={20}
                  step={1}
                />
                <NumberInput
                  label="Snap Lip"
                  value={config.clamshell.snapLipHeight}
                  onChange={(v) => updateClamshell({ snapLipHeight: v })}
                  field="clamshell"
                  validation={validation}
                  min={0}
                  max={1}
                  step={0.1}
                  unit="mm"
                />
              </Box>
            </Stack>
          )}
        </Stack>
      </CollapsibleSection>

      <CollapsibleSection
        title="Press-Fit Flare"
        defaultExpanded={config.flare.enabled && canUseFlare}
      >
        <Stack spacing={1.5}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Add a press-fit flare at the top
            </Typography>
            <Switch
              size="small"
              checked={config.flare.enabled && canUseFlare && !clamshellActive}
              onChange={(e) => updateFlare({ enabled: e.target.checked })}
              disabled={!canUseFlare || clamshellActive}
            />
          </Box>

          {!canUseFlare && (
            <Typography variant="caption" color="warning.main">
              Flare only available with flat top cut
            </Typography>
          )}
          {fieldHelperText(validation, "flare") && (
            <Typography variant="caption" color="error.main">
              {fieldHelperText(validation, "flare")}
            </Typography>
          )}

          {config.flare.enabled && canUseFlare && (
            <Stack spacing={1.5}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 1.5,
                }}
              >
                {config.shape === "round" && (
                  <NumberInput
                    label="Flare Diameter"
                    value={config.flare.diameter}
                    onChange={(v) => updateFlare({ diameter: v })}
                    field="flare"
                    validation={validation}
                    step={0.5}
                  />
                )}

                {(config.shape === "square" ||
                  config.shape === "rectangular") && (
                  <>
                    <NumberInput
                      label="Flare Width"
                      value={config.flare.width}
                      onChange={(v) => updateFlare({ width: v })}
                      field="flare"
                      validation={validation}
                      step={0.5}
                    />
                    {config.shape === "rectangular" && (
                      <NumberInput
                        label="Flare Height"
                        value={config.flare.height}
                        onChange={(v) => updateFlare({ height: v })}
                        field="flare"
                        validation={validation}
                        step={0.5}
                      />
                    )}
                  </>
                )}

                <NumberInput
                  label="Flare Length"
                  value={config.flare.length}
                  onChange={(v) => updateFlare({ length: v })}
                  field="flare.length"
                  validation={validation}
                  step={1}
                />

                <TextField
                  select
                  size="small"
                  label="Fit Type"
                  value={config.flare.fitType}
                  error={fieldHasError(validation, "flare.fitType")}
                  helperText={fieldHelperText(validation, "flare.fitType")}
                  onChange={(e) => {
                    const fitType = e.target.value as FlareConfig["fitType"];
                    updateFlare({
                      fitType,
                      clearance: FLARE_FIT_CLEARANCE[fitType],
                    });
                  }}
                  fullWidth
                >
                  <MenuItem value="loose">Loose (0.3mm)</MenuItem>
                  <MenuItem value="snug">Snug (0.15mm)</MenuItem>
                  <MenuItem value="interference">
                    Interference (-0.05mm)
                  </MenuItem>
                </TextField>
                <NumberInput
                  label="Clearance"
                  value={config.flare.clearance}
                  onChange={(v) => updateFlare({ clearance: v })}
                  field="flare"
                  validation={validation}
                  min={-0.2}
                  max={1}
                  step={0.05}
                />
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 1,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 0.25,
                  }}
                >
                  <Switch
                    size="small"
                    checked={config.flare.leadInChamfer}
                    onChange={(e) =>
                      updateFlare({ leadInChamfer: e.target.checked })
                    }
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    textAlign="center"
                    sx={{ lineHeight: 1.2 }}
                  >
                    Lead-in Chamfer
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 0.25,
                  }}
                >
                  <Switch
                    size="small"
                    checked={config.flare.stopShoulder}
                    onChange={(e) =>
                      updateFlare({ stopShoulder: e.target.checked })
                    }
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    textAlign="center"
                    sx={{ lineHeight: 1.2 }}
                  >
                    Stop Shoulder
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 0.25,
                  }}
                >
                  <Switch
                    size="small"
                    checked={config.flare.antiRotation}
                    onChange={(e) =>
                      updateFlare({ antiRotation: e.target.checked })
                    }
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    textAlign="center"
                    sx={{ lineHeight: 1.2 }}
                  >
                    Anti-Rotation
                  </Typography>
                </Box>
              </Box>

              {config.flare.leadInChamfer && (
                <NumberInput
                  label="Chamfer Angle"
                  value={config.flare.leadInAngle}
                  onChange={(v) => updateFlare({ leadInAngle: v })}
                  field="flare"
                  validation={validation}
                  min={30}
                  max={60}
                  step={5}
                  unit="°"
                />
              )}
              {config.flare.stopShoulder && (
                <NumberInput
                  label="Stop Depth"
                  value={config.flare.stopDepth}
                  onChange={(v) => updateFlare({ stopDepth: v })}
                  field="flare.stopDepth"
                  validation={validation}
                  min={1}
                  max={10}
                  step={0.5}
                />
              )}
              {config.flare.antiRotation && (
                <TextField
                  select
                  size="small"
                  value={config.flare.antiRotationType}
                  onChange={(e) =>
                    updateFlare({
                      antiRotationType: e.target
                        .value as FlareConfig["antiRotationType"],
                    })
                  }
                  fullWidth
                >
                  <MenuItem value="flat">Flat (D-shape)</MenuItem>
                  <MenuItem value="key">Key (Slot)</MenuItem>
                  <MenuItem value="notch">Notch</MenuItem>
                </TextField>
              )}
            </Stack>
          )}
        </Stack>
      </CollapsibleSection>
    </Stack>
  );
}
