"use client";

import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { NumberField, SectionCard } from "@mintables/shared/ui";
import type { ValidationResult } from "@mintables/shared/lib/validation";
import { calculateInsertLayout } from "./layout";
import {
  MAX_COMPARTMENTS_PER_ROW,
  MAX_INSERT_COMPARTMENTS,
  MAX_INSERT_ROWS,
  type BoardGameInsertConfig,
  type CompartmentAccess,
  type InsertCompartment,
  type InsertOutputPart,
  type InsertRow,
} from "./types";

interface InsertControlsProps {
  config: BoardGameInsertConfig;
  onChange: (config: BoardGameInsertConfig) => void;
  validation: ValidationResult;
}

const ACCESS_OPTIONS: {
  value: CompartmentAccess;
  label: string;
}[] = [
  { value: "standard", label: "Full walls" },
  { value: "finger", label: "Finger notch" },
  { value: "scoop", label: "Token scoop" },
  { value: "cards", label: "Card access" },
];

function nextId(prefix: string, ids: string[]): string {
  let counter = 1;
  while (ids.includes(`${prefix}-${String(counter)}`)) counter += 1;
  return `${prefix}-${String(counter)}`;
}

function compartmentCount(rows: InsertRow[]): number {
  return rows.reduce((sum, row) => sum + row.compartments.length, 0);
}

export function InsertControls({
  config,
  onChange,
  validation,
}: InsertControlsProps) {
  const layout = calculateInsertLayout(config);
  const update = (patch: Partial<BoardGameInsertConfig>) => {
    onChange({ ...config, ...patch });
  };

  const updateRow = (rowIndex: number, nextRow: InsertRow) => {
    update({
      rows: config.rows.map((row, index) =>
        index === rowIndex ? nextRow : row,
      ),
    });
  };

  const updateCompartment = (
    rowIndex: number,
    compartmentIndex: number,
    patch: Partial<InsertCompartment>,
  ) => {
    const row = config.rows[rowIndex];
    updateRow(rowIndex, {
      ...row,
      compartments: row.compartments.map((compartment, index) =>
        index === compartmentIndex ? { ...compartment, ...patch } : compartment,
      ),
    });
  };

  const addRow = () => {
    if (config.rows.length >= MAX_INSERT_ROWS) return;
    const rowId = nextId(
      "row",
      config.rows.map((row) => row.id),
    );
    const compartmentId = nextId(
      "compartment",
      config.rows.flatMap((row) =>
        row.compartments.map((compartment) => compartment.id),
      ),
    );
    update({
      rows: [
        ...config.rows,
        {
          id: rowId,
          depthShare: 50,
          compartments: [
            {
              id: compartmentId,
              label: `Row ${String(config.rows.length + 1)}`,
              widthShare: 100,
              floorLift: 0,
              access: "standard",
            },
          ],
        },
      ],
    });
  };

  const addCompartment = (rowIndex: number) => {
    const row = config.rows[rowIndex];
    if (
      row.compartments.length >= MAX_COMPARTMENTS_PER_ROW ||
      compartmentCount(config.rows) >= MAX_INSERT_COMPARTMENTS
    ) {
      return;
    }
    const id = nextId(
      "compartment",
      config.rows.flatMap((candidate) =>
        candidate.compartments.map((compartment) => compartment.id),
      ),
    );
    updateRow(rowIndex, {
      ...row,
      compartments: [
        ...row.compartments,
        {
          id,
          label: `Well ${String(compartmentCount(config.rows) + 1)}`,
          widthShare: 50,
          floorLift: 0,
          access: "standard",
        },
      ],
    });
  };

  return (
    <Stack spacing={2}>
      <SectionCard title="Output">
        <ToggleButtonGroup
          exclusive
          fullWidth
          size="small"
          value={config.outputPart}
          aria-label="Part to generate"
          onChange={(_, value: InsertOutputPart | null) => {
            if (value) update({ outputPart: value });
          }}
        >
          <ToggleButton value="tray">Tray</ToggleButton>
          <ToggleButton value="lid">Lid</ToggleButton>
          <ToggleButton value="both">Both</ToggleButton>
        </ToggleButtonGroup>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          Export both parts together, or switch parts to fit a smaller print
          bed.
        </Typography>
      </SectionCard>

      <SectionCard title="Tray size">
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
          <NumberField
            label="Width"
            value={config.width}
            onChange={(width) => update({ width })}
            field="width"
            validation={validation}
            min={20}
            max={400}
            step={1}
          />
          <NumberField
            label="Depth"
            value={config.depth}
            onChange={(depth) => update({ depth })}
            field="depth"
            validation={validation}
            min={20}
            max={400}
            step={1}
          />
          <NumberField
            label="Height"
            value={config.height}
            onChange={(height) => update({ height })}
            field="height"
            validation={validation}
            min={8}
            max={120}
            step={1}
          />
        </Box>
      </SectionCard>

      <SectionCard title="Construction">
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
          <NumberField
            label="Outer wall"
            value={config.wallThickness}
            onChange={(wallThickness) => update({ wallThickness })}
            field="wallThickness"
            validation={validation}
            min={0.8}
            max={6}
            step={0.2}
          />
          <NumberField
            label="Dividers"
            value={config.dividerThickness}
            onChange={(dividerThickness) => update({ dividerThickness })}
            field="dividerThickness"
            validation={validation}
            min={0.8}
            max={6}
            step={0.2}
          />
          <NumberField
            label="Floor"
            value={config.floorThickness}
            onChange={(floorThickness) => update({ floorThickness })}
            field="floorThickness"
            validation={validation}
            min={0.6}
            max={6}
            step={0.2}
          />
          <NumberField
            label="Notch depth"
            value={config.notchDepth}
            onChange={(notchDepth) => update({ notchDepth })}
            field="notchDepth"
            validation={validation}
            min={4}
            max={Math.max(4, config.height - 2)}
            step={1}
          />
          <NumberField
            label="Scoop run"
            value={config.scoopLength}
            onChange={(scoopLength) => update({ scoopLength })}
            field="scoopLength"
            validation={validation}
            min={4}
            max={Math.max(4, config.depth / 2)}
            step={1}
          />
        </Box>
      </SectionCard>

      <SectionCard title="Custom layout">
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          Shares are relative. The clear size below each well is calculated from
          the finished tray dimensions.
        </Typography>
        {config.rows.map((row, rowIndex) => {
          const layoutRow = layout.rows[rowIndex];
          return (
            <Stack
              key={row.id}
              spacing={1.5}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                p: 1.25,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1,
                }}
              >
                <Typography variant="subtitle2">
                  Row {String(rowIndex + 1)}
                </Typography>
                <Tooltip title="Remove row">
                  <span>
                    <IconButton
                      size="small"
                      aria-label={`Remove row ${String(rowIndex + 1)}`}
                      disabled={config.rows.length === 1}
                      onClick={() => {
                        update({
                          rows: config.rows.filter(
                            (_, index) => index !== rowIndex,
                          ),
                        });
                      }}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
              <NumberField
                label="Depth share"
                value={row.depthShare}
                onChange={(depthShare) =>
                  updateRow(rowIndex, { ...row, depthShare })
                }
                field={`rows.${String(rowIndex)}.depthShare`}
                validation={validation}
                min={1}
                max={1000}
                step={5}
                unit="parts"
              />
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Clear depth: {layoutRow.clearDepth.toFixed(1)} mm
              </Typography>

              {row.compartments.map((compartment, compartmentIndex) => {
                const cell = layoutRow.cells[compartmentIndex];
                const fieldPrefix = `rows.${String(rowIndex)}.compartments.${String(compartmentIndex)}`;
                return (
                  <Stack key={compartment.id} spacing={1.25}>
                    <Divider />
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <TextField
                        size="small"
                        label="Purpose"
                        value={compartment.label}
                        onChange={(event) =>
                          updateCompartment(rowIndex, compartmentIndex, {
                            label: event.target.value,
                          })
                        }
                        slotProps={{ htmlInput: { maxLength: 48 } }}
                        fullWidth
                      />
                      <Tooltip title="Remove compartment">
                        <span>
                          <IconButton
                            size="small"
                            aria-label={`Remove ${compartment.label || "compartment"}`}
                            disabled={row.compartments.length === 1}
                            onClick={() =>
                              updateRow(rowIndex, {
                                ...row,
                                compartments: row.compartments.filter(
                                  (_, index) => index !== compartmentIndex,
                                ),
                              })
                            }
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 1.5,
                      }}
                    >
                      <NumberField
                        label="Width share"
                        value={compartment.widthShare}
                        onChange={(widthShare) =>
                          updateCompartment(rowIndex, compartmentIndex, {
                            widthShare,
                          })
                        }
                        field={`${fieldPrefix}.widthShare`}
                        validation={validation}
                        min={1}
                        max={1000}
                        step={5}
                        unit="parts"
                      />
                      <NumberField
                        label="Raised floor"
                        value={compartment.floorLift}
                        onChange={(floorLift) =>
                          updateCompartment(rowIndex, compartmentIndex, {
                            floorLift,
                          })
                        }
                        field={`${fieldPrefix}.floorLift`}
                        validation={validation}
                        min={0}
                        max={Math.max(
                          0,
                          config.height - config.floorThickness - 3,
                        )}
                        step={1}
                      />
                    </Box>
                    <TextField
                      select
                      size="small"
                      label="Access"
                      value={compartment.access}
                      onChange={(event) =>
                        updateCompartment(rowIndex, compartmentIndex, {
                          access: event.target.value as CompartmentAccess,
                        })
                      }
                      fullWidth
                    >
                      {ACCESS_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                    <Typography
                      variant="caption"
                      sx={{ color: "text.secondary" }}
                    >
                      Clear space: {cell.clearWidth.toFixed(1)} ×{" "}
                      {cell.clearDepth.toFixed(1)} ×{" "}
                      {(config.height - cell.contentFloorZ).toFixed(1)} mm
                    </Typography>
                  </Stack>
                );
              })}

              <Button
                size="small"
                startIcon={<AddIcon />}
                disabled={
                  row.compartments.length >= MAX_COMPARTMENTS_PER_ROW ||
                  compartmentCount(config.rows) >= MAX_INSERT_COMPARTMENTS
                }
                onClick={() => addCompartment(rowIndex)}
              >
                Add compartment
              </Button>
            </Stack>
          );
        })}
        <Button
          variant="outlined"
          size="small"
          startIcon={<AddIcon />}
          disabled={config.rows.length >= MAX_INSERT_ROWS}
          onClick={addRow}
        >
          Add row
        </Button>
      </SectionCard>

      <SectionCard title="Fitted lid">
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
          <NumberField
            label="Fit clearance"
            value={config.lidClearance}
            onChange={(lidClearance) => update({ lidClearance })}
            field="lidClearance"
            validation={validation}
            min={0.15}
            max={1.5}
            step={0.05}
          />
          <NumberField
            label="Plate"
            value={config.lidThickness}
            onChange={(lidThickness) => update({ lidThickness })}
            field="lidThickness"
            validation={validation}
            min={0.8}
            max={5}
            step={0.2}
          />
          <NumberField
            label="Skirt depth"
            value={config.lidSkirtDepth}
            onChange={(lidSkirtDepth) => update({ lidSkirtDepth })}
            field="lidSkirtDepth"
            validation={validation}
            min={4}
            max={Math.max(4, config.height)}
            step={1}
          />
        </Box>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          The lid slips over the tray and includes a front grip notch. Print it
          plate-down with the skirt facing up.
        </Typography>
      </SectionCard>
    </Stack>
  );
}
