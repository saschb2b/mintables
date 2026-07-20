import type {
  ValidationIssue,
  ValidationResult,
} from "@mintables/shared/lib/validation";
import { calculateInsertLayout, getInsertOutputBounds } from "./layout";
import {
  MAX_COMPARTMENTS_PER_ROW,
  MAX_INSERT_COMPARTMENTS,
  MAX_INSERT_ROWS,
  type BoardGameInsertConfig,
} from "./types";

function issue(
  severity: "error" | "warning",
  code: string,
  message: string,
  field?: string,
): ValidationIssue {
  return { severity, code, message, field };
}

function finiteInRange(value: number, min: number, max: number): boolean {
  return Number.isFinite(value) && value >= min && value <= max;
}

export function validateInsertConfig(
  config: BoardGameInsertConfig,
): ValidationResult {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  for (const [field, value, min, max, label] of [
    ["width", config.width, 20, 400, "Width"],
    ["depth", config.depth, 20, 400, "Depth"],
    ["height", config.height, 8, 120, "Height"],
  ] as const) {
    if (!finiteInRange(value, min, max)) {
      errors.push(
        issue(
          "error",
          `${field}_range`,
          `${label} must be between ${String(min)} and ${String(max)} mm.`,
          field,
        ),
      );
    }
  }

  if (!finiteInRange(config.wallThickness, 0.8, 6)) {
    errors.push(
      issue(
        "error",
        "wall_range",
        "Outer wall must be between 0.8 and 6 mm.",
        "wallThickness",
      ),
    );
  } else if (config.wallThickness < 1.2) {
    warnings.push(
      issue(
        "warning",
        "wall_thin",
        "Walls below 1.2 mm may print as a single fragile perimeter.",
        "wallThickness",
      ),
    );
  }

  if (!finiteInRange(config.dividerThickness, 0.8, 6)) {
    errors.push(
      issue(
        "error",
        "divider_range",
        "Divider thickness must be between 0.8 and 6 mm.",
        "dividerThickness",
      ),
    );
  } else if (config.dividerThickness < 1.2) {
    warnings.push(
      issue(
        "warning",
        "divider_thin",
        "Thin dividers can flex when the tray is packed tightly.",
        "dividerThickness",
      ),
    );
  }

  if (!finiteInRange(config.floorThickness, 0.6, 6)) {
    errors.push(
      issue(
        "error",
        "floor_range",
        "Floor thickness must be between 0.6 and 6 mm.",
        "floorThickness",
      ),
    );
  }
  if (config.floorThickness >= config.height - 3) {
    errors.push(
      issue(
        "error",
        "floor_too_high",
        "The floor must leave at least 3 mm of clear tray depth.",
        "floorThickness",
      ),
    );
  }

  if (!finiteInRange(config.notchDepth, 4, Math.max(4, config.height - 2))) {
    errors.push(
      issue(
        "error",
        "notch_range",
        "Notch depth must leave at least 2 mm above the print bed.",
        "notchDepth",
      ),
    );
  }
  if (!finiteInRange(config.scoopLength, 4, Math.max(4, config.depth / 2))) {
    errors.push(
      issue(
        "error",
        "scoop_range",
        "Scoop length must be at least 4 mm and no more than half the tray depth.",
        "scoopLength",
      ),
    );
  }

  if (config.rows.length < 1 || config.rows.length > MAX_INSERT_ROWS) {
    errors.push(
      issue(
        "error",
        "row_count",
        `Use between 1 and ${String(MAX_INSERT_ROWS)} rows.`,
        "rows",
      ),
    );
  }

  let compartmentCount = 0;
  for (const [rowIndex, row] of config.rows.entries()) {
    if (!Number.isFinite(row.depthShare) || row.depthShare <= 0) {
      errors.push(
        issue(
          "error",
          "row_share",
          "Every row needs a positive depth share.",
          `rows.${String(rowIndex)}.depthShare`,
        ),
      );
    }
    if (
      row.compartments.length < 1 ||
      row.compartments.length > MAX_COMPARTMENTS_PER_ROW
    ) {
      errors.push(
        issue(
          "error",
          "compartment_count",
          `Each row needs 1 to ${String(MAX_COMPARTMENTS_PER_ROW)} compartments.`,
          `rows.${String(rowIndex)}.compartments`,
        ),
      );
    }
    compartmentCount += row.compartments.length;
    for (const [compartmentIndex, compartment] of row.compartments.entries()) {
      const prefix = `rows.${String(rowIndex)}.compartments.${String(compartmentIndex)}`;
      if (
        !Number.isFinite(compartment.widthShare) ||
        compartment.widthShare <= 0
      ) {
        errors.push(
          issue(
            "error",
            "compartment_share",
            "Every compartment needs a positive width share.",
            `${prefix}.widthShare`,
          ),
        );
      }
      if (
        !Number.isFinite(compartment.floorLift) ||
        compartment.floorLift < 0
      ) {
        errors.push(
          issue(
            "error",
            "floor_lift_negative",
            "Raised floor must be zero or greater.",
            `${prefix}.floorLift`,
          ),
        );
      } else if (
        config.floorThickness + compartment.floorLift >
        config.height - 3
      ) {
        errors.push(
          issue(
            "error",
            "floor_lift_high",
            "Raised floor must leave at least 3 mm below the tray rim.",
            `${prefix}.floorLift`,
          ),
        );
      }
    }
  }

  if (compartmentCount > MAX_INSERT_COMPARTMENTS) {
    errors.push(
      issue(
        "error",
        "total_compartments",
        `A tray can contain at most ${String(MAX_INSERT_COMPARTMENTS)} compartments.`,
        "rows",
      ),
    );
  }

  const layout = calculateInsertLayout(config);
  for (const cell of layout.cells) {
    const prefix = `rows.${String(cell.rowIndex)}.compartments.${String(cell.compartmentIndex)}`;
    if (cell.contentFloorZ > config.height - 3) {
      errors.push(
        issue(
          "error",
          "content_floor_high",
          `${cell.compartment.label || "Compartment"} needs at least 3 mm above its access floor. Reduce its raised floor or increase tray height.`,
          `${prefix}.floorLift`,
        ),
      );
    }
    if (cell.clearWidth < 6 || cell.clearDepth < 6) {
      errors.push(
        issue(
          "error",
          "compartment_too_small",
          `${cell.compartment.label || "Compartment"} resolves below 6 mm in one direction. Increase its share or reduce the number of wells.`,
          `${prefix}.widthShare`,
        ),
      );
    } else if (cell.clearWidth < 14 || cell.clearDepth < 14) {
      warnings.push(
        issue(
          "warning",
          "compartment_narrow",
          `${cell.compartment.label || "A compartment"} is under 14 mm in one direction and may be hard to reach.`,
          `${prefix}.widthShare`,
        ),
      );
    }
    if (
      cell.compartment.access === "cards" &&
      (cell.clearWidth < 24 || cell.clearDepth < 30)
    ) {
      warnings.push(
        issue(
          "warning",
          "card_access_tight",
          `${cell.compartment.label || "Card well"} is tight for the deep thumb pockets. Allow at least 24 by 30 mm for a useful grip.`,
          `${prefix}.widthShare`,
        ),
      );
    }
  }

  if (!finiteInRange(config.lidClearance, 0.15, 1.5)) {
    errors.push(
      issue(
        "error",
        "lid_clearance_range",
        "Lid clearance must be between 0.15 and 1.5 mm per side.",
        "lidClearance",
      ),
    );
  }
  if (!finiteInRange(config.lidThickness, 0.8, 5)) {
    errors.push(
      issue(
        "error",
        "lid_thickness_range",
        "Lid plate must be between 0.8 and 5 mm.",
        "lidThickness",
      ),
    );
  }
  if (!finiteInRange(config.lidSkirtDepth, 4, Math.max(4, config.height))) {
    errors.push(
      issue(
        "error",
        "lid_skirt_range",
        "Lid skirt must be at least 4 mm and no deeper than the tray.",
        "lidSkirtDepth",
      ),
    );
  }

  const outputBounds = getInsertOutputBounds(config);
  if (outputBounds.width > 220 || outputBounds.depth > 220) {
    warnings.push(
      issue(
        "warning",
        "print_bed_size",
        `The selected output spans ${outputBounds.width.toFixed(1)} by ${outputBounds.depth.toFixed(1)} mm. Check your printer bed before exporting.`,
      ),
    );
  }

  return { errors, warnings };
}
