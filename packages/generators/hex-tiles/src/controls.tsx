"use client";

import { useState, type ChangeEvent } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select, { type SelectChangeEvent } from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import type { ValidationResult } from "@mintables/shared/lib/validation";
import { NumberField, SectionCard } from "@mintables/shared/ui";
import {
  CircleDot,
  Dices,
  Frame,
  ImageUp,
  Layers,
  PanelsTopLeft,
  type LucideIcon,
} from "lucide-react";
import {
  CUSTOM_TEXTURE_RESOLUTION,
  encodeCustomTextureSamples,
} from "./custom-height-map";
import { calculateHexTileLayout } from "./layout";
import {
  SURFACE_TEXTURE_OPTIONS,
  type SurfaceTextureOption,
} from "./surface-textures";
import type {
  HexTileConfig,
  HexTileDividerAngle,
  HexTileMagnetMode,
  HexTilePurpose,
  HexTileSurfaceTexture,
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
  {
    value: "rolling",
    label: "Rolling tray",
    description: "One open hexagonal floor with soft corners for rolling dice.",
    icon: Frame,
  },
  {
    value: "deck",
    label: "Deck cradle",
    description:
      "Decks stand on edge in open channels, with wells for counters.",
    icon: Layers,
  },
];

const MAGNET_MODES: { value: HexTileMagnetMode; label: string }[] = [
  { value: "single", label: "Keyed single (6)" },
  { value: "captive", label: "Keyed captive rods (6)" },
  { value: "paired", label: "Any orientation (12)" },
  { value: "none", label: "No magnets" },
];

const DIVIDER_ANGLES: HexTileDividerAngle[] = [0, 60, 120];
const WELL_COUNTS = [
  { value: 1, label: "One" },
  { value: 2, label: "Two" },
  { value: 3, label: "Three" },
];
const MAX_CUSTOM_TEXTURE_BYTES = 5 * 1024 * 1024;
const CUSTOM_TEXTURE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const KEYED_POLES = [
  { side: 1, pole: "N", color: "primary" as const },
  { side: 2, pole: "S", color: "secondary" as const },
  { side: 3, pole: "N", color: "primary" as const },
  { side: 4, pole: "S", color: "secondary" as const },
  { side: 5, pole: "N", color: "primary" as const },
  { side: 6, pole: "S", color: "secondary" as const },
];

type TextureUploadState =
  | { status: "idle" }
  | { status: "uploading" }
  | { status: "error"; message: string };

async function imageFileToHeightMap(file: File): Promise<string> {
  if (!CUSTOM_TEXTURE_TYPES.has(file.type)) {
    throw new Error("Choose a PNG, JPEG, or WebP image.");
  }
  if (file.size > MAX_CUSTOM_TEXTURE_BYTES) {
    throw new Error("Choose an image smaller than 5 MB.");
  }

  const bitmap = await createImageBitmap(file);
  try {
    if (bitmap.width < 8 || bitmap.height < 8) {
      throw new Error("Choose an image at least 8 by 8 pixels.");
    }
    const canvas = document.createElement("canvas");
    canvas.width = CUSTOM_TEXTURE_RESOLUTION;
    canvas.height = CUSTOM_TEXTURE_RESOLUTION;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("This browser cannot process the image.");

    const cropSize = Math.min(bitmap.width, bitmap.height);
    const sourceX = (bitmap.width - cropSize) / 2;
    const sourceY = (bitmap.height - cropSize) / 2;
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(
      bitmap,
      sourceX,
      sourceY,
      cropSize,
      cropSize,
      0,
      0,
      CUSTOM_TEXTURE_RESOLUTION,
      CUSTOM_TEXTURE_RESOLUTION,
    );

    const pixels = context.getImageData(
      0,
      0,
      CUSTOM_TEXTURE_RESOLUTION,
      CUSTOM_TEXTURE_RESOLUTION,
    ).data;
    const samples = new Uint8Array(
      CUSTOM_TEXTURE_RESOLUTION * CUSTOM_TEXTURE_RESOLUTION,
    );
    for (let index = 0; index < samples.length; index++) {
      const pixelOffset = index * 4;
      const luminance =
        pixels[pixelOffset] * 0.2126 +
        pixels[pixelOffset + 1] * 0.7152 +
        pixels[pixelOffset + 2] * 0.0722;
      const alpha = pixels[pixelOffset + 3] / 255;
      samples[index] = Math.round(luminance * alpha + 255 * (1 - alpha));
    }
    return encodeCustomTextureSamples(samples);
  } finally {
    bitmap.close();
  }
}

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

function SurfaceTextureOptionContent({
  option,
}: {
  option: SurfaceTextureOption;
}) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography
        variant="body2"
        sx={{ color: "text.primary", fontWeight: 600, lineHeight: 1.25 }}
      >
        {option.label}
      </Typography>
      <Typography
        variant="caption"
        sx={{ color: "text.secondary", display: "block", lineHeight: 1.35 }}
      >
        {option.description}
      </Typography>
    </Box>
  );
}

function SurfaceTextureSelector({
  value,
  onChange,
}: {
  value: HexTileSurfaceTexture;
  onChange: (surfaceTexture: HexTileSurfaceTexture) => void;
}) {
  const selectedOption =
    SURFACE_TEXTURE_OPTIONS.find((option) => option.value === value) ??
    SURFACE_TEXTURE_OPTIONS[0];

  return (
    <FormControl fullWidth size="small">
      <InputLabel id="hex-tile-surface-texture-label">Texture</InputLabel>
      <Select<HexTileSurfaceTexture>
        id="hex-tile-surface-texture"
        labelId="hex-tile-surface-texture-label"
        label="Texture"
        value={value}
        onChange={(event: SelectChangeEvent<HexTileSurfaceTexture>) =>
          onChange(event.target.value as HexTileSurfaceTexture)
        }
        renderValue={() => (
          <SurfaceTextureOptionContent option={selectedOption} />
        )}
        MenuProps={{
          slotProps: {
            list: { "aria-label": "Top surface textures", sx: { py: 0.5 } },
            paper: { sx: { mt: 0.75 } },
          },
        }}
        sx={{
          "& .MuiSelect-select": {
            alignItems: "center",
            display: "flex",
            minHeight: "44px !important",
            py: 1,
            whiteSpace: "normal",
          },
        }}
      >
        {SURFACE_TEXTURE_OPTIONS.map((option) => (
          <MenuItem
            key={option.value}
            value={option.value}
            sx={{ px: 1.5, py: 1, whiteSpace: "normal" }}
          >
            <SurfaceTextureOptionContent option={option} />
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
    case "captive":
      return "Start below the recessed north dot with the rod's north end up, then continue clockwise with top poles N / S / N / S / N / S.";
    case "paired":
      return "Each side uses a mirrored polarity pair, allowing tiles to connect at every 60-degree rotation.";
    case "none":
      return "The tile prints with uninterrupted side walls.";
  }
}

function PolarityGuide({ mode }: { mode: "single" | "captive" }) {
  const isCaptive = mode === "captive";
  return (
    <Box
      component="ol"
      aria-label={
        isCaptive
          ? "Clockwise upper rod polarity"
          : "Clockwise outward magnet polarity"
      }
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
            label={`${String(side)}:${pole}${isCaptive ? "↑" : ""}`}
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

function SurfaceTextureControls({
  config,
  update,
  validation,
}: ControlSectionProps) {
  const [uploadState, setUploadState] = useState<TextureUploadState>({
    status: "idle",
  });

  const handleCustomTextureUpload = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploadState({ status: "uploading" });
    try {
      const customTextureData = await imageFileToHeightMap(file);
      update({
        customTextureData,
        customTextureName: file.name.slice(0, 120),
      });
      setUploadState({ status: "idle" });
    } catch (error: unknown) {
      setUploadState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "The texture image could not be processed.",
      });
    }
  };

  return (
    <SectionCard title="Surface finish">
      <FormControlLabel
        control={
          <Switch
            checked={config.isSurfaceTextureEnabled}
            onChange={(event) =>
              update({ isSurfaceTextureEnabled: event.target.checked })
            }
          />
        }
        label="Add printable top texture"
      />
      {config.isSurfaceTextureEnabled ? (
        <>
          <SurfaceTextureSelector
            value={config.surfaceTexture}
            onChange={(surfaceTexture) => update({ surfaceTexture })}
          />
          <NumberField
            label="Relief depth"
            value={config.surfaceTextureDepth}
            onChange={(surfaceTextureDepth) => update({ surfaceTextureDepth })}
            field="surfaceTextureDepth"
            validation={validation}
            min={0.2}
            max={0.8}
            step={0.05}
          />
          {config.surfaceTexture === "custom" ? (
            <Stack spacing={1}>
              <Button
                component="label"
                variant="outlined"
                startIcon={<ImageUp aria-hidden size={18} />}
                disabled={uploadState.status === "uploading"}
              >
                {uploadState.status === "uploading"
                  ? "Processing image"
                  : config.customTextureData
                    ? "Replace height map"
                    : "Upload height map"}
                <input
                  hidden
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(event) => {
                    void handleCustomTextureUpload(event);
                  }}
                />
              </Button>
              {config.customTextureName ? (
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {config.customTextureName} was center-cropped to{" "}
                  {String(CUSTOM_TEXTURE_RESOLUTION)} by{" "}
                  {String(CUSTOM_TEXTURE_RESOLUTION)} grayscale samples.
                </Typography>
              ) : (
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Use a seamless, high-contrast square image. Transparent areas
                  remain smooth. Maximum file size: 5 MB.
                </Typography>
              )}
              <FormControlLabel
                control={
                  <Switch
                    checked={config.isCustomTextureInverted}
                    onChange={(event) =>
                      update({ isCustomTextureInverted: event.target.checked })
                    }
                  />
                }
                label="Invert height map"
              />
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {config.isCustomTextureInverted
                  ? "Light pixels carve deeper; dark pixels stay near the top."
                  : "Dark pixels carve deeper; light pixels stay near the top."}
              </Typography>
              {uploadState.status === "error" ? (
                <Typography
                  role="alert"
                  variant="caption"
                  sx={{ color: "error.main" }}
                >
                  {uploadState.message}
                </Typography>
              ) : null}
            </Stack>
          ) : null}
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Shallow recessed detail stays clear of storage areas, card slots,
            the orientation dot, and functional edges. A 0.4 mm depth is a
            reliable two-layer starting point at 0.2 mm layer height.
          </Typography>
        </>
      ) : (
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          Leave the exposed top land smooth for the quickest print and easiest
          cleanup.
        </Typography>
      )}
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
          {config.magnetMode === "captive" ? (
            <>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 1.5,
                }}
              >
                <NumberField
                  label="Rod diameter"
                  value={config.magnetRodDiameter}
                  onChange={(magnetRodDiameter) =>
                    update({ magnetRodDiameter })
                  }
                  field="magnetRodDiameter"
                  validation={validation}
                  min={2}
                  max={6}
                  step={0.1}
                />
                <NumberField
                  label="Rod length"
                  value={config.magnetRodLength}
                  onChange={(magnetRodLength) => update({ magnetRodLength })}
                  field="magnetRodLength"
                  validation={validation}
                  min={5}
                  max={20}
                  step={0.5}
                />
                <NumberField
                  label="Chamber clearance"
                  value={config.magnetRodClearance}
                  onChange={(magnetRodClearance) =>
                    update({ magnetRodClearance })
                  }
                  field="magnetRodClearance"
                  validation={validation}
                  min={0.05}
                  max={0.8}
                  step={0.05}
                />
                <NumberField
                  label="Lip opening"
                  value={config.magnetLipOpening}
                  onChange={(magnetLipOpening) => update({ magnetLipOpening })}
                  field="magnetLipOpening"
                  validation={validation}
                  min={1}
                  max={5.8}
                  step={0.1}
                />
                <NumberField
                  label="Lip depth"
                  value={config.magnetLipDepth}
                  onChange={(magnetLipDepth) => update({ magnetLipDepth })}
                  field="magnetLipDepth"
                  validation={validation}
                  min={0.4}
                  max={1.5}
                  step={0.05}
                />
              </Box>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {String(layout.magnetCount)} captive channels. The{" "}
                {layout.magnetThroatWidth.toFixed(2)} mm-wide throat flexes
                around the rod, then the{" "}
                {layout.magnetSocketDiameter.toFixed(2)} mm chamber avoids a
                tight friction fit while the lip retains it without glue.
              </Typography>
            </>
          ) : (
            <>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 1.5,
                }}
              >
                <NumberField
                  label="Disc diameter"
                  value={config.magnetDiameter}
                  onChange={(magnetDiameter) => update({ magnetDiameter })}
                  field="magnetDiameter"
                  validation={validation}
                  min={3}
                  max={10}
                  step={0.5}
                />
                <NumberField
                  label="Disc thickness"
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
            </>
          )}
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {magnetModeDescription(config)}
          </Typography>
          {config.magnetMode === "single" || config.magnetMode === "captive" ? (
            <PolarityGuide mode={config.magnetMode} />
          ) : null}
        </>
      ) : null}
    </SectionCard>
  );
}

function BowlControls({ config, update, validation }: ControlSectionProps) {
  const layout = calculateHexTileLayout(config);
  return (
    <SectionCard title="Bowl layout">
      <Box>
        <Typography
          variant="caption"
          component="p"
          sx={{ color: "text.secondary", mb: 0.75 }}
        >
          Wells
        </Typography>
        <ToggleButtonGroup
          exclusive
          fullWidth
          size="small"
          value={layout.bowlWellCount}
          aria-label="Number of wells"
          onChange={(_, value: number | null) => {
            if (value) update({ bowlWellCount: value });
          }}
        >
          {WELL_COUNTS.map((option) => (
            <ToggleButton key={option.value} value={option.value}>
              {option.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>
      {layout.bowlWellCount > 1 ? (
        <TextField
          select
          size="small"
          label="Split direction"
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
      {layout.bowlWellCount > 1 ? (
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {layout.bowlWellCount === 3
            ? "Three sectors meet in the middle, each taking a third of the tile and one of its corners."
            : "Each well spans the tile and follows its outline."}{" "}
          Every well holds a {layout.bowlWellBandWidth.toFixed(1)} mm circle,
          with a {layout.bowlDividerWall.toFixed(1)} mm ridge between them.
        </Typography>
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
  const throughCount = layout.cardChannelCount;
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
        <NumberField
          label="Through channels"
          value={config.cardSlotThroughCount}
          onChange={(cardSlotThroughCount) =>
            update({ cardSlotThroughCount: Math.round(cardSlotThroughCount) })
          }
          field="cardSlotThroughCount"
          validation={validation}
          min={0}
          max={Math.max(0, Math.floor(config.cardSlotCount))}
          step={1}
          unit="slots"
        />
      </Box>
      <Typography variant="caption" sx={{ color: "text.secondary" }}>
        Measure a sleeved card stack before setting width. Rounded slot ends
        reduce stress marks on cards and sleeves.
      </Typography>
      <Typography variant="caption" sx={{ color: "text.secondary" }}>
        {throughCount === 0
          ? "Every slot is a closed pocket. Raise the through channels to open slots at both flat edges."
          : `${String(throughCount)} of ${String(config.cardSlotCount)} slots run edge to edge, so connected tiles line their channels up into one long slide. Channels open in symmetric pairs from the center outward and keep the slot floor.`}
      </Typography>
    </SectionCard>
  );
}

function DeckControls({ config, update, validation }: ControlSectionProps) {
  const layout = calculateHexTileLayout(config);
  return (
    <SectionCard title="Deck cradle">
      <Box>
        <Typography
          variant="caption"
          component="p"
          sx={{ color: "text.secondary", mb: 0.75 }}
        >
          Cradles
        </Typography>
        <ToggleButtonGroup
          exclusive
          fullWidth
          size="small"
          value={Math.min(2, Math.max(1, Math.round(config.deckSlotCount)))}
          aria-label="Number of cradles"
          onChange={(_, value: number | null) => {
            if (value) update({ deckSlotCount: value });
          }}
        >
          <ToggleButton value={1}>One deck</ToggleButton>
          <ToggleButton value={2}>Deck + discard</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
        <NumberField
          label="Capacity"
          value={config.deckCapacity}
          onChange={(deckCapacity) =>
            update({ deckCapacity: Math.round(deckCapacity) })
          }
          field="deckCapacity"
          validation={validation}
          min={20}
          max={200}
          step={5}
          unit="cards"
        />
        <NumberField
          label="Card thickness"
          value={config.deckCardThickness}
          onChange={(deckCardThickness) => update({ deckCardThickness })}
          field="deckCardThickness"
          validation={validation}
          min={0.25}
          max={0.9}
          step={0.05}
        />
        <NumberField
          label="Cradle depth"
          value={config.deckSlotDepth}
          onChange={(deckSlotDepth) => update({ deckSlotDepth })}
          field="deckSlotDepth"
          validation={validation}
          min={5}
          max={Math.max(5, config.bodyHeight - 3)}
          step={0.5}
        />
      </Box>
      <FormControlLabel
        control={
          <Switch
            checked={config.isDeckCounterWellEnabled}
            onChange={(event) =>
              update({ isDeckCounterWellEnabled: event.target.checked })
            }
          />
        }
        label="Scoop the corners into counter wells"
      />
      <Typography variant="caption" sx={{ color: "text.secondary" }}>
        {layout.deckSlotWidth.toFixed(1)} mm per cradle, running edge to edge so
        a thumb reaches the deck from either side. A standard sleeved card is
        0.5 mm; unsleeved is about 0.32, double-sleeved 0.7.
      </Typography>
      <Typography variant="caption" sx={{ color: "text.secondary" }}>
        Cards stand on their long edge, so a 66 mm card clears the rim by{" "}
        {layout.deckStandProud.toFixed(0)} mm. That overhang is what you pinch
        to lift the deck out.
      </Typography>
    </SectionCard>
  );
}

function RollingControls({ config, update, validation }: ControlSectionProps) {
  const layout = calculateHexTileLayout(config);
  return (
    <SectionCard title="Rolling well">
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
        <NumberField
          label="Rolling depth"
          value={config.rollDepth}
          onChange={(rollDepth) => update({ rollDepth })}
          field="rollDepth"
          validation={validation}
          min={6}
          max={Math.max(6, config.bodyHeight - config.floorThickness)}
          step={0.5}
        />
        <NumberField
          label="Corner rounding"
          value={config.rollCornerRadius}
          onChange={(rollCornerRadius) => update({ rollCornerRadius })}
          field="rollCornerRadius"
          validation={validation}
          min={1.5}
          max={20}
          step={0.5}
        />
        <NumberField
          label="Floor fillet"
          value={config.rollFloorFillet}
          onChange={(rollFloorFillet) => update({ rollFloorFillet })}
          field="rollFloorFillet"
          validation={validation}
          min={0.5}
          max={8}
          step={0.5}
        />
        <NumberField
          label="Wall draft"
          value={config.rollWallDraft}
          onChange={(rollWallDraft) => update({ rollWallDraft })}
          field="rollWallDraft"
          validation={validation}
          min={0}
          max={12}
          step={0.5}
          unit="deg"
        />
      </Box>
      <Typography variant="caption" sx={{ color: "text.secondary" }}>
        {layout.rollFloorAcrossFlats.toFixed(1)} mm of flat floor across the
        flats. Narrow the rim to trade wall for rolling space.
      </Typography>
      <Typography variant="caption" sx={{ color: "text.secondary" }}>
        Rounded corners, a leaning wall, and the floor fillet keep dice from
        wedging and let the well print without supports. Keep all three small to
        hold on to rolling area.
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
    case "rolling":
      return <RollingControls {...props} />;
    case "deck":
      return <DeckControls {...props} />;
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

      <SurfaceTextureControls
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
