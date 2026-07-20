"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select, { type SelectChangeEvent } from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import type { ValidationResult } from "@mintables/shared/lib/validation";
import { NumberField, SectionCard } from "@mintables/shared/ui";
import { CircleDot, Dices, PanelsTopLeft, type LucideIcon } from "lucide-react";
import { calculateHexTileLayout } from "./layout";
import type {
  HexTileConfig,
  HexTileDividerAngle,
  HexTileMagnetMode,
  HexTilePurpose,
} from "./types";

interface HexTileControlsProps {
  config: HexTileConfig;
  onChange: (config: HexTileConfig) => void;
  validation: ValidationResult;
}

interface ControlSectionProps {
  config: HexTileConfig;
  update: (patch: Partial<HexTileConfig>) => void;
  validation: ValidationResult;
}

interface PurposeOption {
  value: HexTilePurpose;
  label: string;
  description: string;
  icon: LucideIcon;
}

const PURPOSES: PurposeOption[] = [
  {
    value: "bowl",
    label: "Component bowl",
    description: "A smooth scoop for tokens, dice, coins, and loose pieces.",
    icon: CircleDot,
  },
  {
    value: "cards",
    label: "Card display",
    description: "Rounded slots keep cards visible and easy to draw.",
    icon: PanelsTopLeft,
  },
  {
    value: "dice-orbit",
    label: "Dice orbit",
    description: "An outer dice trough with a raised active-die cup.",
    icon: Dices,
  },
];

const MAGNET_MODES: { value: HexTileMagnetMode; label: string }[] = [
  { value: "single", label: "Keyed single (6)" },
  { value: "paired", label: "Any orientation (12)" },
  { value: "none", label: "No magnets" },
];

const DIVIDER_ANGLES: HexTileDividerAngle[] = [0, 60, 120];
const KEYED_POLES = [
  { side: 1, pole: "N", color: "primary" as const },
  { side: 2, pole: "S", color: "secondary" as const },
  { side: 3, pole: "N", color: "primary" as const },
  { side: 4, pole: "S", color: "secondary" as const },
  { side: 5, pole: "N", color: "primary" as const },
  { side: 6, pole: "S", color: "secondary" as const },
];

function purposeOption(value: HexTilePurpose): PurposeOption {
  return PURPOSES.find((purpose) => purpose.value === value) ?? PURPOSES[0];
}

function PurposeOptionContent({
  purpose,
  selectedValue = false,
}: {
  purpose: PurposeOption;
  selectedValue?: boolean;
}) {
  const Icon = purpose.icon;

  return (
    <Stack
      direction="row"
      spacing={1.25}
      sx={{ alignItems: "center", minWidth: 0, width: "100%" }}
    >
      <Box
        sx={(theme) => ({
          alignItems: "center",
          bgcolor: alpha(theme.palette.primary.main, 0.12),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.24)}`,
          borderRadius: 1.25,
          color: "primary.light",
          display: "flex",
          flex: "0 0 auto",
          height: selectedValue ? 36 : 32,
          justifyContent: "center",
          width: selectedValue ? 36 : 32,
        })}
      >
        <Icon aria-hidden size={selectedValue ? 20 : 18} strokeWidth={1.8} />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="body2"
          sx={{ color: "text.primary", fontWeight: 600, lineHeight: 1.25 }}
        >
          {purpose.label}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            display: "block",
            lineHeight: 1.35,
            whiteSpace: "normal",
          }}
        >
          {purpose.description}
        </Typography>
      </Box>
    </Stack>
  );
}

function PurposeSelector({
  value,
  onChange,
}: {
  value: HexTilePurpose;
  onChange: (purpose: HexTilePurpose) => void;
}) {
  return (
    <FormControl fullWidth>
      <InputLabel id="hex-tile-purpose-label">Variant</InputLabel>
      <Select<HexTilePurpose>
        id="hex-tile-purpose"
        labelId="hex-tile-purpose-label"
        label="Variant"
        value={value}
        onChange={(event: SelectChangeEvent<HexTilePurpose>) =>
          onChange(event.target.value as HexTilePurpose)
        }
        renderValue={(selected) => (
          <PurposeOptionContent
            purpose={purposeOption(selected)}
            selectedValue
          />
        )}
        MenuProps={{
          slotProps: {
            list: {
              "aria-label": "Tile purpose variants",
              sx: { py: 0.5 },
            },
            paper: {
              sx: { mt: 0.75 },
            },
          },
        }}
        sx={{
          "& .MuiSelect-select": {
            alignItems: "center",
            display: "flex",
            minHeight: "52px !important",
            py: 1.25,
            whiteSpace: "normal",
          },
        }}
      >
        {PURPOSES.map((purpose) => (
          <MenuItem
            key={purpose.value}
            value={purpose.value}
            sx={{ px: 1.25, py: 1.1, whiteSpace: "normal" }}
          >
            <PurposeOptionContent purpose={purpose} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

function magnetModeDescription(config: HexTileConfig): string {
  switch (config.magnetMode) {
    case "single":
      return "Align the recessed north dots on connected tiles. Begin at the marked side and install the outward poles clockwise.";
    case "paired":
      return "Each side uses a mirrored polarity pair, allowing tiles to connect at every 60-degree rotation.";
    case "none":
      return "The tile prints with uninterrupted side walls.";
  }
}

function PolarityGuide() {
  return (
    <Box
      component="ol"
      aria-label="Clockwise outward magnet polarity"
      sx={{
        display: "flex",
        gap: 0.75,
        p: 0,
        m: 0,
        listStyle: "none",
      }}
    >
      {KEYED_POLES.map(({ side, pole, color }) => (
        <Box component="li" key={side} sx={{ flex: 1, minWidth: 0 }}>
          <Chip
            label={`${String(side)}:${pole}`}
            color={color}
            variant="outlined"
            size="small"
            sx={{ width: "100%" }}
          />
        </Box>
      ))}
    </Box>
  );
}

function TileBodyControls({ config, update, validation }: ControlSectionProps) {
  return (
    <SectionCard title="Tile body">
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
        <NumberField
          label="Across flats"
          value={config.acrossFlats}
          onChange={(acrossFlats) => update({ acrossFlats })}
          field="acrossFlats"
          validation={validation}
          min={60}
          max={180}
          step={1}
        />
        <NumberField
          label="Body height"
          value={config.bodyHeight}
          onChange={(bodyHeight) => update({ bodyHeight })}
          field="bodyHeight"
          validation={validation}
          min={12}
          max={30}
          step={1}
        />
        <NumberField
          label="Raised base"
          value={config.raiseHeight}
          onChange={(raiseHeight) => update({ raiseHeight })}
          field="raiseHeight"
          validation={validation}
          min={0}
          max={16}
          step={1}
        />
        <NumberField
          label="Rim width"
          value={config.rimWidth}
          onChange={(rimWidth) => update({ rimWidth })}
          field="rimWidth"
          validation={validation}
          min={5}
          max={18}
          step={0.5}
        />
        <NumberField
          label="Floor"
          value={config.floorThickness}
          onChange={(floorThickness) => update({ floorThickness })}
          field="floorThickness"
          validation={validation}
          min={2}
          max={8}
          step={0.2}
        />
        <NumberField
          label="Edge bevel"
          value={config.edgeBevel}
          onChange={(edgeBevel) => update({ edgeBevel })}
          field="edgeBevel"
          validation={validation}
          min={0.6}
          max={2.5}
          step={0.2}
        />
      </Box>
    </SectionCard>
  );
}

function MagnetControls({ config, update, validation }: ControlSectionProps) {
  const layout = calculateHexTileLayout(config);
  return (
    <SectionCard title="Magnetic connections">
      <TextField
        select
        size="small"
        label="Socket layout"
        value={config.magnetMode}
        onChange={(event) =>
          update({ magnetMode: event.target.value as HexTileMagnetMode })
        }
        fullWidth
      >
        {MAGNET_MODES.map((mode) => (
          <MenuItem key={mode.value} value={mode.value}>
            {mode.label}
          </MenuItem>
        ))}
      </TextField>
      {config.magnetMode !== "none" ? (
        <>
          <Box
            sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}
          >
            <NumberField
              label="Diameter"
              value={config.magnetDiameter}
              onChange={(magnetDiameter) => update({ magnetDiameter })}
              field="magnetDiameter"
              validation={validation}
              min={3}
              max={10}
              step={0.5}
            />
            <NumberField
              label="Depth"
              value={config.magnetDepth}
              onChange={(magnetDepth) => update({ magnetDepth })}
              field="magnetDepth"
              validation={validation}
              min={1}
              max={5}
              step={0.5}
            />
            <NumberField
              label="Clearance"
              value={config.magnetClearance}
              onChange={(magnetClearance) => update({ magnetClearance })}
              field="magnetClearance"
              validation={validation}
              min={0.05}
              max={0.8}
              step={0.05}
            />
          </Box>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {String(layout.magnetCount)} glue-in sockets. Compact octagonal
            roofs use 45-degree shoulders and a short printable bridge.
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {magnetModeDescription(config)}
          </Typography>
          {config.magnetMode === "single" ? <PolarityGuide /> : null}
        </>
      ) : null}
    </SectionCard>
  );
}

function BowlControls({ config, update, validation }: ControlSectionProps) {
  return (
    <SectionCard title="Bowl layout">
      <NumberField
        label="Dish depth"
        value={config.bowlDepth}
        onChange={(bowlDepth) => update({ bowlDepth })}
        field="bowlDepth"
        validation={validation}
        min={5}
        max={Math.max(5, config.bodyHeight - config.floorThickness)}
        step={0.5}
      />
      <FormControlLabel
        control={
          <Switch
            checked={config.bowlDivider}
            onChange={(event) => update({ bowlDivider: event.target.checked })}
          />
        }
        label="Split into two smooth wells"
      />
      {config.bowlDivider ? (
        <TextField
          select
          size="small"
          label="Divider direction"
          value={config.dividerAngle}
          onChange={(event) =>
            update({
              dividerAngle: Number(event.target.value) as HexTileDividerAngle,
            })
          }
          fullWidth
        >
          {DIVIDER_ANGLES.map((angle) => (
            <MenuItem key={angle} value={angle}>
              {String(angle)} degrees
            </MenuItem>
          ))}
        </TextField>
      ) : null}
      <Typography variant="caption" sx={{ color: "text.secondary" }}>
        A deeper floor increases capacity and removes print material. The broad
        wall blend keeps tokens easy to scoop without a harsh corner.
      </Typography>
    </SectionCard>
  );
}

function CardControls({ config, update, validation }: ControlSectionProps) {
  const layout = calculateHexTileLayout(config);
  return (
    <SectionCard title="Card slots">
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
        <NumberField
          label="Slot count"
          value={config.cardSlotCount}
          onChange={(cardSlotCount) =>
            update({ cardSlotCount: Math.round(cardSlotCount) })
          }
          field="cardSlotCount"
          validation={validation}
          min={1}
          max={8}
          step={1}
          unit="slots"
        />
        <NumberField
          label="Slot width"
          value={config.cardSlotWidth}
          onChange={(cardSlotWidth) => update({ cardSlotWidth })}
          field="cardSlotWidth"
          validation={validation}
          min={0.8}
          max={5}
          step={0.1}
        />
        <NumberField
          label="Slot depth"
          value={config.cardSlotDepth}
          onChange={(cardSlotDepth) => update({ cardSlotDepth })}
          field="cardSlotDepth"
          validation={validation}
          min={3}
          max={Math.max(3, config.bodyHeight - 2)}
          step={0.5}
        />
        <NumberField
          label="Slot length"
          value={config.cardSlotLength}
          onChange={(cardSlotLength) => update({ cardSlotLength })}
          field="cardSlotLength"
          validation={validation}
          min={20}
          max={Math.max(20, layout.innerAcrossFlats)}
          step={1}
        />
        <NumberField
          label="Slot spacing"
          value={config.cardSlotSpacing}
          onChange={(cardSlotSpacing) => update({ cardSlotSpacing })}
          field="cardSlotSpacing"
          validation={validation}
          min={4}
          max={24}
          step={1}
        />
      </Box>
      <Typography variant="caption" sx={{ color: "text.secondary" }}>
        Measure a sleeved card stack before setting width. Rounded slot ends
        reduce stress marks on cards and sleeves.
      </Typography>
    </SectionCard>
  );
}

function DiceOrbitControls({
  config,
  update,
  validation,
}: ControlSectionProps) {
  const layout = calculateHexTileLayout(config);
  return (
    <SectionCard title="Dice orbit">
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
        <NumberField
          label="Center diameter"
          value={config.orbitCenterDiameter}
          onChange={(orbitCenterDiameter) => update({ orbitCenterDiameter })}
          field="orbitCenterDiameter"
          validation={validation}
          min={24}
          max={Math.max(24, layout.innerAcrossFlats - 20)}
          step={1}
        />
        <NumberField
          label="Center elevation"
          value={config.orbitCenterRaise}
          onChange={(orbitCenterRaise) => update({ orbitCenterRaise })}
          field="orbitCenterRaise"
          validation={validation}
          min={3}
          max={12}
          step={0.5}
        />
        <NumberField
          label="Center depth"
          value={config.orbitCenterDepth}
          onChange={(orbitCenterDepth) => update({ orbitCenterDepth })}
          field="orbitCenterDepth"
          validation={validation}
          min={2}
          max={9}
          step={0.5}
        />
      </Box>
      <Typography variant="caption" sx={{ color: "text.secondary" }}>
        The outer trough holds a full dice set while the elevated center keeps
        one active die easy to identify.
      </Typography>
    </SectionCard>
  );
}

function PurposeSpecificControls(props: ControlSectionProps) {
  switch (props.config.purpose) {
    case "bowl":
      return <BowlControls {...props} />;
    case "cards":
      return <CardControls {...props} />;
    case "dice-orbit":
      return <DiceOrbitControls {...props} />;
  }
}

export function HexTileControls({
  config,
  onChange,
  validation,
}: HexTileControlsProps) {
  const update = (patch: Partial<HexTileConfig>) => {
    onChange({ ...config, ...patch });
  };

  return (
    <Stack spacing={2}>
      <SectionCard title="Purpose">
        <PurposeSelector
          value={config.purpose}
          onChange={(purpose) => update({ purpose })}
        />
      </SectionCard>

      <TileBodyControls
        config={config}
        update={update}
        validation={validation}
      />

      <PurposeSpecificControls
        config={config}
        update={update}
        validation={validation}
      />

      <MagnetControls config={config} update={update} validation={validation} />
    </Stack>
  );
}
