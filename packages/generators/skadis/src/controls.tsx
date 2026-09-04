"use client";

import type { ReactElement } from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { NumberField as NumberInput, SectionCard } from "@mintables/shared/ui";
import type { ValidationResult } from "@mintables/shared/lib/validation";
import { deriveSkadis } from "./derived";
import { SKADIS_STARTERS } from "./starters";
import {
  DEFAULT_BODIES,
  MAX_RACK_GROUPS,
  MAX_RACK_HOLES,
  rackHoleDiameters,
  type BodyConfig,
  type BodyKind,
  type CupBody,
  type CupShape,
  type MountConfig,
  type PocketShape,
  type RackBody,
  type RackHoleGroup,
  type SkadisConfig,
  type SlotBody,
  type TrayBody,
} from "./types";

interface SkadisControlsProps {
  config: SkadisConfig;
  onChange: (config: SkadisConfig) => void;
  validation: ValidationResult;
}

const fieldGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 1.5,
} as const;

const BODY_LABELS: Record<BodyKind, string> = {
  cup: "Cup (pencils, brushes)",
  tray: "Bottle tray (paint, glue)",
  rack: "Hole rack (screwdrivers, droppers)",
  slot: "Slot pocket (calipers, rulers)",
};

function nextGroupId(groups: RackHoleGroup[]): string {
  const used = new Set(groups.map((g) => g.id));
  let i = 1;
  while (used.has(`g${String(i)}`)) i++;
  return `g${String(i)}`;
}

export function SkadisControls({
  config,
  onChange,
  validation,
}: SkadisControlsProps) {
  const derived = deriveSkadis(config);

  const update = (patch: Partial<SkadisConfig>) => {
    onChange({ ...config, ...patch });
  };
  const updateMount = (patch: Partial<MountConfig>) => {
    update({ mount: { ...config.mount, ...patch } });
  };
  const updateBody = (patch: Partial<BodyConfig>) => {
    // Kind-specific patches go through the union; TS cannot narrow which
    // branch a partial belongs to here.
    update({ body: { ...config.body, ...patch } as BodyConfig });
  };
  const switchBody = (kind: BodyKind) => {
    if (kind === config.body.kind) return;
    update({ body: DEFAULT_BODIES[kind] });
  };

  const numberField = (
    label: string,
    field: string,
    value: number,
    onValue: (v: number) => void,
    min: number,
    max: number,
    step = 1,
    unit = "mm",
  ) => (
    <NumberInput
      label={label}
      value={value}
      onChange={onValue}
      field={field}
      validation={validation}
      min={min}
      max={max}
      step={step}
      unit={unit}
    />
  );

  const bodyNumber: BodyNumber = (key, value, label, min, max, step, unit) =>
    numberField(
      label,
      `body.${key}`,
      value,
      (v) => update({ body: { ...config.body, [key]: v } }),
      min,
      max,
      step,
      unit,
    );

  const mountNumber = (
    key: keyof MountConfig,
    value: number,
    label: string,
    min: number,
    max: number,
    step = 1,
    unit = "mm",
  ) =>
    numberField(
      label,
      `mount.${key}`,
      value,
      (v) => update({ mount: { ...config.mount, [key]: v } }),
      min,
      max,
      step,
      unit,
    );

  return (
    <Stack spacing={2}>
      <SectionCard title="Starters">
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
          {SKADIS_STARTERS.map((starter) => (
            <Chip
              key={starter.id}
              label={starter.label}
              title={starter.hint}
              size="small"
              variant="outlined"
              onClick={() => onChange(starter.config)}
            />
          ))}
        </Box>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          Pick the closest match, then adjust the sizes below.
        </Typography>
      </SectionCard>

      <SectionCard title="Body">
        <TextField
          select
          size="small"
          label="Holder type"
          value={config.body.kind}
          onChange={(e) => switchBody(e.target.value as BodyKind)}
          fullWidth
        >
          {(Object.keys(BODY_LABELS) as BodyKind[]).map((kind) => (
            <MenuItem key={kind} value={kind}>
              {BODY_LABELS[kind]}
            </MenuItem>
          ))}
        </TextField>
        {config.body.kind === "cup" && (
          <CupFields
            body={config.body}
            bodyNumber={bodyNumber}
            onPatch={updateBody}
          />
        )}
        {config.body.kind === "tray" && (
          <TrayFields
            body={config.body}
            bodyNumber={bodyNumber}
            onPatch={updateBody}
          />
        )}
        {config.body.kind === "rack" && (
          <RackFields
            body={config.body}
            bodyNumber={bodyNumber}
            onPatch={updateBody}
            validation={validation}
          />
        )}
        {config.body.kind === "slot" && (
          <SlotFields
            body={config.body}
            bodyNumber={bodyNumber}
            onPatch={updateBody}
          />
        )}
      </SectionCard>

      <SectionCard title="Hooks">
        <Box sx={fieldGrid}>
          <TextField
            select
            size="small"
            label="Columns"
            value={config.mount.hookColumns}
            onChange={(e) =>
              updateMount({ hookColumns: Number(e.target.value) })
            }
            fullWidth
          >
            <MenuItem value={0}>
              Auto ({String(derived.hooks.columns)})
            </MenuItem>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <MenuItem key={n} value={n}>
                {String(n)}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label="Rows"
            value={config.mount.hookRows}
            onChange={(e) =>
              updateMount({ hookRows: Number(e.target.value) === 2 ? 2 : 1 })
            }
            fullWidth
          >
            <MenuItem value={1}>Top row only</MenuItem>
            <MenuItem value={2}>Two rows</MenuItem>
          </TextField>
          {config.mount.hookRows === 2 && (
            <TextField
              select
              size="small"
              label="Row spacing"
              value={config.mount.rowSpacing}
              onChange={(e) =>
                updateMount({
                  rowSpacing: Number(e.target.value) === 80 ? 80 : 40,
                })
              }
              fullWidth
            >
              <MenuItem value={40}>40 mm</MenuItem>
              <MenuItem value={80}>80 mm</MenuItem>
            </TextField>
          )}
          {mountNumber(
            "boardThickness",
            config.mount.boardThickness,
            "Board gap",
            3,
            6.5,
            0.1,
          )}
          {mountNumber("fit", config.mount.fit, "Fit clearance", -0.5, 1, 0.05)}
          {mountNumber(
            "tabWidth",
            config.mount.tabWidth,
            "Tab width",
            3.5,
            4.9,
            0.05,
          )}
          {mountNumber(
            "tabHeight",
            config.mount.tabHeight,
            "Tab height",
            3,
            6,
            0.5,
          )}
          {mountNumber("lipDrop", config.mount.lipDrop, "Lip drop", 4, 10, 0.5)}
          {mountNumber(
            "lipThickness",
            config.mount.lipThickness,
            "Lip thickness",
            3,
            6,
            0.5,
          )}
          {mountNumber(
            "hookInset",
            config.mount.hookInset,
            "Inset from plate top",
            2,
            60,
          )}
        </Box>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          IKEA push-down hook: tab plus lip is{" "}
          {derived.hooks.profileHeight.toFixed(1)} mm tall (the slot is 15),
          reaching {derived.hooks.reach.toFixed(1)} mm behind the plate.
          Unpainted boards are about 4.8 mm, painted about 5.2 mm.
        </Typography>
      </SectionCard>

      <SectionCard title="Plate">
        <Box sx={fieldGrid}>
          {mountNumber(
            "plateWidth",
            config.mount.plateWidth,
            "Width (0 = auto)",
            0,
            300,
          )}
          {mountNumber(
            "plateHeight",
            config.mount.plateHeight,
            "Height (0 = auto)",
            0,
            250,
          )}
          {mountNumber(
            "plateThickness",
            config.mount.plateThickness,
            "Thickness",
            2,
            6,
            0.2,
          )}
          {mountNumber(
            "cornerRadius",
            config.mount.cornerRadius,
            "Corner radius",
            0,
            10,
            0.5,
          )}
        </Box>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          Plate is {derived.plateWidth.toFixed(1)} ×{" "}
          {derived.plateHeight.toFixed(1)} mm. Widen it to fit more hook columns
          (one per 40 mm).
        </Typography>
      </SectionCard>

      <SectionCard title="Preview">
        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={config.showBoard}
              onChange={(e) => update({ showBoard: e.target.checked })}
            />
          }
          label="Show pegboard behind the holder"
        />
      </SectionCard>
    </Stack>
  );
}

/* ------------------------------------------------------------------ */

type BodyNumber = (
  key: string,
  value: number,
  label: string,
  min: number,
  max: number,
  step?: number,
  unit?: string,
) => ReactElement;

function CupFields({
  body,
  bodyNumber,
  onPatch,
}: {
  body: CupBody;
  bodyNumber: BodyNumber;
  onPatch: (patch: Partial<CupBody>) => void;
}) {
  return (
    <Box sx={fieldGrid}>
      <TextField
        select
        size="small"
        label="Shape"
        value={body.shape}
        onChange={(e) => onPatch({ shape: e.target.value as CupShape })}
        fullWidth
      >
        <MenuItem value="round">Round</MenuItem>
        <MenuItem value="rect">Rectangular</MenuItem>
        <MenuItem value="stadium">Stadium</MenuItem>
      </TextField>
      {body.shape === "round" ? (
        bodyNumber(
          "innerDiameter",
          body.innerDiameter,
          "Inner diameter",
          8,
          120,
        )
      ) : (
        <Box />
      )}
      {body.shape !== "round" && (
        <>
          {bodyNumber("innerWidth", body.innerWidth, "Inner width", 8, 200)}
          {bodyNumber("innerDepth", body.innerDepth, "Inner depth", 8, 120)}
        </>
      )}
      {bodyNumber("height", body.height, "Height", 15, 200)}
      {bodyNumber("wall", body.wall, "Wall", 1.2, 5, 0.2)}
      {bodyNumber("floor", body.floor, "Floor", 1.2, 6, 0.2)}
      {bodyNumber("tilt", body.tilt, "Forward tilt", 0, 25, 1, "°")}
      {bodyNumber("frontDip", body.frontDip, "Front scoop depth", 0, 100)}
      {bodyNumber("drainHoles", body.drainHoles, "Drain holes", 0, 4, 1, "")}
      {bodyNumber("dividers", body.dividers, "Dividers", 0, 4, 1, "")}
    </Box>
  );
}

function TrayFields({
  body,
  bodyNumber,
  onPatch,
}: {
  body: TrayBody;
  bodyNumber: BodyNumber;
  onPatch: (patch: Partial<TrayBody>) => void;
}) {
  return (
    <Box sx={fieldGrid}>
      <TextField
        select
        size="small"
        label="Pocket shape"
        value={body.pocketShape}
        onChange={(e) =>
          onPatch({ pocketShape: e.target.value as PocketShape })
        }
        fullWidth
      >
        <MenuItem value="round">Round</MenuItem>
        <MenuItem value="rect">Rectangular</MenuItem>
      </TextField>
      <TextField
        select
        size="small"
        label="Rows"
        value={body.rows}
        onChange={(e) =>
          onPatch({ rows: Number(e.target.value) === 2 ? 2 : 1 })
        }
        fullWidth
      >
        <MenuItem value={1}>Single row</MenuItem>
        <MenuItem value={2}>Two staggered rows</MenuItem>
      </TextField>
      {bodyNumber("pockets", body.pockets, "Pockets per row", 1, 8, 1, "")}
      {body.pocketShape === "round" ? (
        bodyNumber(
          "pocketDiameter",
          body.pocketDiameter,
          "Object diameter",
          10,
          100,
        )
      ) : (
        <Box />
      )}
      {body.pocketShape === "rect" && (
        <>
          {bodyNumber("pocketWidth", body.pocketWidth, "Object width", 10, 120)}
          {bodyNumber("pocketDepth", body.pocketDepth, "Object depth", 10, 120)}
        </>
      )}
      {bodyNumber("clearance", body.clearance, "Clearance", 0, 3, 0.1)}
      {bodyNumber("lipHeight", body.lipHeight, "Lip height", 2, 60)}
      {bodyNumber(
        "lipThickness",
        body.lipThickness,
        "Lip thickness",
        1.2,
        4,
        0.2,
      )}
      {bodyNumber("gap", body.gap, "Gap between pockets", 1, 20, 0.5)}
      {bodyNumber(
        "shelfThickness",
        body.shelfThickness,
        "Shelf thickness",
        2,
        8,
        0.5,
      )}
      {bodyNumber(
        "guardHeight",
        body.guardHeight,
        "Back guard (0 = none)",
        0,
        120,
      )}
      {body.rows === 2 &&
        bodyNumber("rowStep", body.rowStep, "Rear row step", 5, 40)}
    </Box>
  );
}

function RackFields({
  body,
  bodyNumber,
  onPatch,
  validation,
}: {
  body: RackBody;
  bodyNumber: BodyNumber;
  onPatch: (patch: Partial<RackBody>) => void;
  validation: ValidationResult;
}) {
  const holeCount = rackHoleDiameters(body).length;
  const updateGroup = (index: number, patch: Partial<RackHoleGroup>) => {
    onPatch({
      groups: body.groups.map((g, i) => (i === index ? { ...g, ...patch } : g)),
    });
  };
  const addGroup = () => {
    if (body.groups.length >= MAX_RACK_GROUPS) return;
    const last = body.groups[body.groups.length - 1];
    onPatch({
      groups: [
        ...body.groups,
        {
          id: nextGroupId(body.groups),
          diameter: Math.max(3, last.diameter - 3),
          count: 3,
        },
      ],
    });
  };
  return (
    <Stack spacing={1.5}>
      <Stack spacing={1}>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          Hole groups, left to right ({String(holeCount)} of{" "}
          {String(MAX_RACK_HOLES)} holes)
        </Typography>
        {body.groups.map((group, index) => (
          <Stack
            key={group.id}
            direction="row"
            spacing={1}
            sx={{ alignItems: "flex-start" }}
          >
            <NumberInput
              label="Diameter"
              value={group.diameter}
              onChange={(v) => updateGroup(index, { diameter: v })}
              field={`body.groups.${String(index)}.diameter`}
              validation={validation}
              min={3}
              max={60}
              step={0.5}
            />
            <NumberInput
              label="Count"
              value={group.count}
              onChange={(v) => updateGroup(index, { count: v })}
              field={`body.groups.${String(index)}.count`}
              validation={validation}
              min={1}
              max={12}
              step={1}
              unit=""
            />
            <IconButton
              size="small"
              aria-label="Remove hole group"
              disabled={body.groups.length <= 1}
              onClick={() =>
                onPatch({ groups: body.groups.filter((_, i) => i !== index) })
              }
              sx={{ mt: 0.5 }}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Stack>
        ))}
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={addGroup}
          disabled={body.groups.length >= MAX_RACK_GROUPS}
          sx={{ alignSelf: "flex-start" }}
        >
          Add hole group
        </Button>
      </Stack>
      <Box sx={fieldGrid}>
        {bodyNumber("gap", body.gap, "Wall between holes", 2, 20, 0.5)}
        {bodyNumber(
          "frontSlot",
          body.frontSlot,
          "Front slot (0 = closed)",
          0,
          60,
          0.5,
        )}
        {bodyNumber("barDepth", body.barDepth, "Bar depth (0 = auto)", 0, 120)}
        {bodyNumber(
          "barThickness",
          body.barThickness,
          "Bar thickness",
          3,
          12,
          0.5,
        )}
        <TextField
          select
          size="small"
          label="Tiers"
          value={body.tiers}
          onChange={(e) =>
            onPatch({ tiers: Number(e.target.value) === 2 ? 2 : 1 })
          }
          fullWidth
        >
          <MenuItem value={1}>Single bar</MenuItem>
          <MenuItem value={2}>Two bars (long tools)</MenuItem>
        </TextField>
        {body.tiers === 2 ? (
          bodyNumber("tierSpacing", body.tierSpacing, "Tier spacing", 20, 150)
        ) : (
          <Box />
        )}
        {bodyNumber("tilt", body.tilt, "Forward tilt", 0, 20, 1, "°")}
      </Box>
    </Stack>
  );
}

function SlotFields({
  body,
  bodyNumber,
  onPatch,
}: {
  body: SlotBody;
  bodyNumber: BodyNumber;
  onPatch: (patch: Partial<SlotBody>) => void;
}) {
  return (
    <Stack spacing={1.5}>
      <Box sx={fieldGrid}>
        {bodyNumber("slots", body.slots, "Slots", 1, 8, 1, "")}
        {bodyNumber("slotWidth", body.slotWidth, "Slot width", 3, 120)}
        {bodyNumber("slotDepth", body.slotDepth, "Slot depth", 1.5, 60, 0.5)}
        {bodyNumber("slotHeight", body.slotHeight, "Slot height", 8, 150)}
        {bodyNumber("wall", body.wall, "Wall", 1.2, 6, 0.2)}
        {bodyNumber("floor", body.floor, "Floor", 1.2, 6, 0.2)}
        {bodyNumber("tilt", body.tilt, "Lean back", 0, 30, 1, "°")}
        {bodyNumber(
          "frontWindow",
          body.frontWindow,
          "Front window (0 = none)",
          0,
          150,
        )}
      </Box>
      <FormControlLabel
        control={
          <Switch
            size="small"
            checked={body.openFloor}
            onChange={(e) => onPatch({ openFloor: e.target.checked })}
          />
        }
        label="Open floor (object rests on the board)"
      />
      <FormControlLabel
        control={
          <Switch
            size="small"
            checked={body.openSides}
            onChange={(e) => onPatch({ openSides: e.target.checked })}
          />
        }
        label="Open sides (cradle)"
      />
    </Stack>
  );
}
