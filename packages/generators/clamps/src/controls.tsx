"use client";

import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { NumberField as NumberInput, SectionCard } from "@mintables/shared/ui";
import type { ValidationResult } from "@mintables/shared/lib/validation";
import { deriveClamp } from "./derived";
import type {
  ClampConfig,
  ClampMount,
  ClampScrewRecess,
  ClampTipStyle,
} from "./types";

interface ClampControlsProps {
  config: ClampConfig;
  onChange: (config: ClampConfig) => void;
  validation: ValidationResult;
}

export function ClampControls({
  config,
  onChange,
  validation,
}: ClampControlsProps) {
  const update = (patch: Partial<ClampConfig>) => {
    onChange({ ...config, ...patch });
  };

  const d = deriveClamp(config);
  const maxNeck =
    Math.floor(Math.min(config.baseWidth - 1, 2 * d.outerRadius * 0.95) * 10) /
    10;

  return (
    <Stack spacing={2}>
      <SectionCard title="Rod">
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
          <NumberInput
            label="Rod diameter"
            value={config.rodDiameter}
            onChange={(v) => {
              update({ rodDiameter: v });
            }}
            field="rodDiameter"
            validation={validation}
            min={2}
            max={80}
            step={0.5}
            unit="mm"
          />
          <NumberInput
            label="Fit clearance"
            value={config.fitClearance}
            onChange={(v) => {
              update({ fitClearance: v });
            }}
            field="fitClearance"
            validation={validation}
            min={-0.5}
            max={1.5}
            step={0.05}
            unit="mm"
          />
        </Box>
        <Typography
          variant="caption"
          sx={{ color: "text.secondary", display: "block", mt: 1 }}
        >
          Measure the rod with calipers. Clearance 0.2 mm lets it rotate, 0
          grips snug, negative squeezes.
        </Typography>
      </SectionCard>

      <SectionCard title="Jaw">
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
          <NumberInput
            label="Wrap angle"
            value={config.wrapAngle}
            onChange={(v) => {
              update({ wrapAngle: v });
            }}
            field="wrapAngle"
            validation={validation}
            min={190}
            max={300}
            step={5}
            unit="deg"
          />
          <NumberInput
            label="Jaw width"
            value={config.jawWidth}
            onChange={(v) => {
              update({ jawWidth: v });
            }}
            field="jawWidth"
            validation={validation}
            min={3}
            max={60}
            step={0.5}
            unit="mm"
          />
          <NumberInput
            label="Throat depth"
            value={config.throatDepth}
            onChange={(v) => {
              update({ throatDepth: v });
            }}
            field="throatDepth"
            validation={validation}
            min={0}
            max={15}
            step={0.5}
            unit="mm"
          />
          <NumberInput
            label="Arm thickness"
            value={config.armThickness}
            onChange={(v) => {
              update({ armThickness: v });
            }}
            field="armThickness"
            validation={validation}
            min={1.2}
            max={12}
            step={0.2}
            unit="mm"
          />
          <TextField
            select
            size="small"
            label="Tip style"
            value={config.tipStyle}
            onChange={(e) => {
              update({ tipStyle: e.target.value as ClampTipStyle });
            }}
            fullWidth
          >
            <MenuItem value="bulb">Rounded bulbs</MenuItem>
            <MenuItem value="plain">Plain rounded</MenuItem>
          </TextField>
          {config.tipStyle === "bulb" && (
            <NumberInput
              label="Bulb size"
              value={config.bulbScale}
              onChange={(v) => {
                update({ bulbScale: v });
              }}
              field="bulbScale"
              validation={validation}
              min={1}
              max={2.6}
              step={0.1}
              unit="x arm"
            />
          )}
        </Box>
        <Typography
          variant="caption"
          sx={{ color: "text.secondary", display: "block", mt: 1 }}
        >
          Mouth opening: {d.mouthOpening.toFixed(1)} mm
          {d.snapInterference > 0
            ? ` (each arm flexes ${(d.snapInterference / 2).toFixed(1)} mm to snap on)`
            : " (wider than the rod, no snap retention)"}
        </Typography>
      </SectionCard>

      <SectionCard title="Mounting">
        <Stack spacing={1.5}>
          <TextField
            select
            size="small"
            label="Mount"
            value={config.mount}
            onChange={(e) => {
              update({ mount: e.target.value as ClampMount });
            }}
            fullWidth
          >
            <MenuItem value="plate">Screw-on base plate</MenuItem>
            <MenuItem value="clip">Bare clip</MenuItem>
          </TextField>

          {config.mount === "plate" && (
            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}
            >
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
                label="Base width"
                value={config.baseWidth}
                onChange={(v) => {
                  update({ baseWidth: v });
                }}
                field="baseWidth"
                validation={validation}
                min={6}
                max={60}
                step={0.5}
                unit="mm"
              />
              <NumberInput
                label="Base thickness"
                value={config.baseThickness}
                onChange={(v) => {
                  update({ baseThickness: v });
                }}
                field="baseThickness"
                validation={validation}
                min={2}
                max={15}
                step={0.5}
                unit="mm"
              />
              <NumberInput
                label="Standoff"
                value={config.standoff}
                onChange={(v) => {
                  update({ standoff: v });
                }}
                field="standoff"
                validation={validation}
                min={0}
                max={40}
                step={0.5}
                unit="mm"
              />
              <NumberInput
                label="Neck width"
                value={config.neckWidth}
                onChange={(v) => {
                  update({ neckWidth: v });
                }}
                field="neckWidth"
                validation={validation}
                min={4}
                max={Math.max(4, maxNeck)}
                step={0.5}
                unit="mm"
              />
            </Box>
          )}
        </Stack>
      </SectionCard>

      {config.mount === "plate" && (
        <SectionCard title="Screw holes">
          <Box
            sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}
          >
            <NumberInput
              label="Hole spacing"
              value={config.holeSpacing}
              onChange={(v) => {
                update({ holeSpacing: v });
              }}
              field="holeSpacing"
              validation={validation}
              min={6}
              max={110}
              step={0.5}
              unit="mm"
            />
            <NumberInput
              label="Screw hole"
              value={config.screwDiameter}
              onChange={(v) => {
                update({ screwDiameter: v });
              }}
              field="screwDiameter"
              validation={validation}
              min={1.5}
              max={10}
              step={0.1}
              unit="mm"
            />
            <TextField
              select
              size="small"
              label="Head recess"
              value={config.screwRecess}
              onChange={(e) => {
                update({ screwRecess: e.target.value as ClampScrewRecess });
              }}
              fullWidth
            >
              <MenuItem value="counterbore">Counterbore</MenuItem>
              <MenuItem value="countersink">Countersink</MenuItem>
              <MenuItem value="plain">Plain hole</MenuItem>
            </TextField>
            {config.screwRecess !== "plain" && (
              <NumberInput
                label="Head diameter"
                value={config.headDiameter}
                onChange={(v) => {
                  update({ headDiameter: v });
                }}
                field="headDiameter"
                validation={validation}
                min={2}
                max={20}
                step={0.5}
                unit="mm"
              />
            )}
            {config.screwRecess === "counterbore" && (
              <NumberInput
                label="Head depth"
                value={config.headDepth}
                onChange={(v) => {
                  update({ headDepth: v });
                }}
                field="headDepth"
                validation={validation}
                min={0.5}
                max={Math.max(0.5, config.baseThickness - 1.2)}
                step={0.5}
                unit="mm"
              />
            )}
          </Box>
          <Typography
            variant="caption"
            sx={{ color: "text.secondary", display: "block", mt: 1 }}
          >
            Hole spacing is center to center along the rod. 4.5 mm holes with an
            8.5 mm counterbored head fit an M4 cap screw. Extra space between
            the jaw and the holes is used for a strength fillet at the jaw's
            feet.
          </Typography>
        </SectionCard>
      )}
    </Stack>
  );
}
