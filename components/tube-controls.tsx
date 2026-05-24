"use client";

import type React from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
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
} from "@/lib/tube-types";
import {
  DEFAULT_ROUND_CONFIG,
  DEFAULT_SQUARE_CONFIG,
  DEFAULT_RECTANGULAR_CONFIG,
  FLARE_FIT_CLEARANCE,
} from "@/lib/tube-types";

interface TubeControlsProps {
  config: TubeConfig;
  onChange: (config: TubeConfig) => void;
}

function NumberInput({
  label,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  unit = "mm",
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
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
      onChange={(e) => onChange(Number.parseFloat(e.target.value) || 0)}
      slotProps={{
        htmlInput: { min, max, step },
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <Typography variant="caption" color="text.secondary">
                {unit}
              </Typography>
            </InputAdornment>
          ),
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

function EndCutControls({
  cutConfig,
  onChange,
  outerSize,
  disabled = false,
}: {
  cutConfig: EndCutConfig;
  onChange: (config: EndCutConfig) => void;
  outerSize: number;
  disabled?: boolean;
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
            min={15}
            max={75}
            step={1}
            unit="°"
          />
          <NumberInput
            label="Chamfer Depth"
            value={cutConfig.depth}
            onChange={(v) => onChange({ ...cutConfig, depth: v })}
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
              min={1}
              step={1}
            />
            <NumberInput
              label="Intersection Angle"
              value={cutConfig.angle}
              onChange={(v) => onChange({ ...cutConfig, angle: v })}
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

export function TubeControls({ config, onChange }: TubeControlsProps) {
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
    <Stack spacing={2.5}>
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
                step={0.5}
              />
              <NumberInput
                label="Outer Diameter"
                value={config.outerDiameter}
                onChange={(v) => updateConfig({ outerDiameter: v })}
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
                step={0.5}
              />
              <NumberInput
                label="Outer Size"
                value={config.outerSize}
                onChange={(v) => updateConfig({ outerSize: v })}
                step={0.5}
              />
              <NumberInput
                label="Corner Radius"
                value={config.cornerRadius}
                onChange={(v) => updateConfig({ cornerRadius: v })}
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
                step={0.5}
              />
              <NumberInput
                label="Inner Height"
                value={config.innerHeight}
                onChange={(v) => updateConfig({ innerHeight: v })}
                step={0.5}
              />
              <NumberInput
                label="Outer Width"
                value={config.outerWidth}
                onChange={(v) => updateConfig({ outerWidth: v })}
                step={0.5}
              />
              <NumberInput
                label="Outer Height"
                value={config.outerHeight}
                onChange={(v) => updateConfig({ outerHeight: v })}
                step={0.5}
              />
              <NumberInput
                label="Corner Radius"
                value={config.cornerRadius}
                onChange={(v) => updateConfig({ cornerRadius: v })}
                step={0.5}
              />
            </>
          )}

          <NumberInput
            label="Length"
            value={config.length}
            onChange={(v) => updateConfig({ length: v })}
            step={1}
          />
        </Box>
      </SectionCard>

      {/* Clamshell Split */}
      <Stack spacing={1}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ letterSpacing: 1 }}
          >
            Clamshell Split
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

        {clamshellActive && (
          <Box
            sx={{
              bgcolor: "rgba(255,255,255,0.03)",
              borderRadius: 1.5,
              border: "1px solid",
              borderColor: "divider",
              p: 1.5,
            }}
          >
            <Stack spacing={1.5}>
              <Typography variant="caption" color="text.secondary">
                Splits tube into two interlocking halves with stepped joint for
                wrapping around existing pipes
              </Typography>
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
                  min={2}
                  max={30}
                  step={1}
                  unit="°"
                />
                <NumberInput
                  label="Clearance"
                  value={config.clamshell.clearance}
                  onChange={(v) => updateClamshell({ clearance: v })}
                  min={0.05}
                  max={0.5}
                  step={0.05}
                />
                <NumberInput
                  label="Separation"
                  value={config.clamshell.separation}
                  onChange={(v) => updateClamshell({ separation: v })}
                  min={2}
                  max={20}
                  step={1}
                />
                <NumberInput
                  label="Snap Lip"
                  value={config.clamshell.snapLipHeight}
                  onChange={(v) => updateClamshell({ snapLipHeight: v })}
                  min={0}
                  max={1}
                  step={0.1}
                  unit="mm"
                />
              </Box>
            </Stack>
          </Box>
        )}
      </Stack>

      {/* Top End */}
      <SectionCard title="Top End">
        <EndCutControls
          cutConfig={config.topCut}
          onChange={(cut) => updateConfig({ topCut: cut })}
          outerSize={getOuterSize()}
          disabled={clamshellActive}
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

      {/* Bottom End */}
      <SectionCard title="Bottom End">
        <EndCutControls
          cutConfig={config.bottomCut}
          onChange={(cut) => updateConfig({ bottomCut: cut })}
          outerSize={getOuterSize()}
          disabled={clamshellActive}
        />
        {clamshellActive && (
          <Typography variant="caption" color="text.secondary">
            End cuts disabled in clamshell mode
          </Typography>
        )}
      </SectionCard>

      {/* Press-Fit Flare */}
      <Stack spacing={1}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ letterSpacing: 1 }}
          >
            Press-Fit Flare
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

        {config.flare.enabled && canUseFlare && (
          <Box
            sx={{
              bgcolor: "rgba(255,255,255,0.03)",
              borderRadius: 1.5,
              border: "1px solid",
              borderColor: "divider",
              p: 1.5,
            }}
          >
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
                      step={0.5}
                    />
                    {config.shape === "rectangular" && (
                      <NumberInput
                        label="Flare Height"
                        value={config.flare.height}
                        onChange={(v) => updateFlare({ height: v })}
                        step={0.5}
                      />
                    )}
                  </>
                )}

                <NumberInput
                  label="Flare Length"
                  value={config.flare.length}
                  onChange={(v) => updateFlare({ length: v })}
                  step={1}
                />

                <TextField
                  select
                  size="small"
                  label="Fit Type"
                  value={config.flare.fitType}
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
                  min={-0.2}
                  max={1}
                  step={0.05}
                />
              </Box>

              {config.flare.fitType === "interference" && (
                <Typography variant="caption" color="warning.main">
                  Interference fit may require force to assemble
                </Typography>
              )}

              {/* Toggle options row */}
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
                    Lead-in
                    <br />
                    Chamfer
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
                    Stop
                    <br />
                    Shoulder
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
                    Anti-
                    <br />
                    Rotation
                  </Typography>
                </Box>
              </Box>

              {/* Conditional detail fields for toggles */}
              {config.flare.leadInChamfer && (
                <NumberInput
                  label="Chamfer Angle"
                  value={config.flare.leadInAngle}
                  onChange={(v) => updateFlare({ leadInAngle: v })}
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
          </Box>
        )}
      </Stack>
    </Stack>
  );
}
