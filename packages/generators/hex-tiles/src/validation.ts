import type {
  ValidationIssue,
  ValidationResult,
} from "@mintables/shared/lib/validation";
import { decodeCustomTextureSamples } from "./custom-height-map";
import { calculateHexTileLayout } from "./layout";
import type { HexTileConfig } from "./types";

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

export function validateHexTileConfig(config: HexTileConfig): ValidationResult {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  const layout = calculateHexTileLayout(config);

  if (!finiteInRange(config.acrossFlats, 60, 180)) {
    errors.push(
      issue(
        "error",
        "size_range",
        "Across-flats size must be between 60 and 180 mm.",
        "acrossFlats",
      ),
    );
  }
  if (!finiteInRange(config.bodyHeight, 12, 30)) {
    errors.push(
      issue(
        "error",
        "height_range",
        "Body height must be between 12 and 30 mm.",
        "bodyHeight",
      ),
    );
  }
  if (!finiteInRange(config.raiseHeight, 0, 16)) {
    errors.push(
      issue(
        "error",
        "raise_range",
        "Raised base must be between 0 and 16 mm.",
        "raiseHeight",
      ),
    );
  }
  if (!finiteInRange(config.rimWidth, 5, 18)) {
    errors.push(
      issue(
        "error",
        "rim_range",
        "Rim width must be between 5 and 18 mm.",
        "rimWidth",
      ),
    );
  }
  if (layout.innerAcrossFlats < 30) {
    errors.push(
      issue(
        "error",
        "interior_too_small",
        "The rim leaves less than 30 mm for the tile interior.",
        "rimWidth",
      ),
    );
  }
  if (!finiteInRange(config.floorThickness, 2, 8)) {
    errors.push(
      issue(
        "error",
        "floor_range",
        "Floor thickness must be between 2 and 8 mm.",
        "floorThickness",
      ),
    );
  }
  if (config.bodyHeight - config.floorThickness < 5) {
    errors.push(
      issue(
        "error",
        "well_too_shallow",
        "The body must leave at least 5 mm of usable storage depth.",
        "floorThickness",
      ),
    );
  }
  if (!finiteInRange(config.edgeBevel, 0.6, 2.5)) {
    errors.push(
      issue(
        "error",
        "bevel_range",
        "Edge bevel must be between 0.6 and 2.5 mm.",
        "edgeBevel",
      ),
    );
  }
  if (!finiteInRange(config.surfaceTextureDepth, 0.2, 0.8)) {
    errors.push(
      issue(
        "error",
        "surface_texture_depth_range",
        "Surface relief depth must be between 0.2 and 0.8 mm.",
        "surfaceTextureDepth",
      ),
    );
  }
  if (config.isSurfaceTextureEnabled && config.surfaceTexture === "custom") {
    const samples = decodeCustomTextureSamples(config.customTextureData);
    if (!samples) {
      errors.push(
        issue(
          "error",
          "custom_texture_missing",
          "Upload a valid texture image before exporting the custom surface.",
          "customTextureData",
        ),
      );
    } else {
      const minimum = Math.min(...samples);
      const maximum = Math.max(...samples);
      if (maximum - minimum < 16) {
        warnings.push(
          issue(
            "warning",
            "custom_texture_flat",
            "The uploaded height map has very little contrast, so its printed relief may be hard to see.",
            "customTextureData",
          ),
        );
      }
    }
  }

  if (config.purpose === "bowl") {
    if (!finiteInRange(config.bowlDepth, 5, 25)) {
      errors.push(
        issue(
          "error",
          "bowl_depth_range",
          "Dish depth must be between 5 and 25 mm.",
          "bowlDepth",
        ),
      );
    } else if (config.bowlDepth > config.bodyHeight - config.floorThickness) {
      errors.push(
        issue(
          "error",
          "bowl_floor_thin",
          "Dish depth must leave the configured floor thickness below it.",
          "bowlDepth",
        ),
      );
    }
  }

  if (config.magnetMode !== "none") {
    if (!finiteInRange(config.magnetDiameter, 3, 10)) {
      errors.push(
        issue(
          "error",
          "magnet_diameter_range",
          "Magnet diameter must be between 3 and 10 mm.",
          "magnetDiameter",
        ),
      );
    }
    if (!finiteInRange(config.magnetDepth, 1, 5)) {
      errors.push(
        issue(
          "error",
          "magnet_depth_range",
          "Magnet depth must be between 1 and 5 mm.",
          "magnetDepth",
        ),
      );
    }
    if (!finiteInRange(config.magnetClearance, 0.05, 0.8)) {
      errors.push(
        issue(
          "error",
          "magnet_clearance_range",
          "Magnet clearance must be between 0.05 and 0.8 mm.",
          "magnetClearance",
        ),
      );
    }
    if (layout.magnetRoofZ > config.bodyHeight - config.edgeBevel) {
      errors.push(
        issue(
          "error",
          "magnet_roof_high",
          "The support-free magnet roof does not fit below the top bevel. Increase body height or use smaller magnets.",
          "magnetDiameter",
        ),
      );
    }
    if (layout.magnetSocketDepth + 1.2 > config.rimWidth) {
      errors.push(
        issue(
          "error",
          "magnet_back_wall_thin",
          "Leave at least 1.2 mm behind each magnet socket. Increase rim width or reduce magnet depth.",
          "magnetDepth",
        ),
      );
    }
    const outermostSocket =
      (config.magnetMode === "paired" ? layout.pairedMagnetOffset : 0) +
      layout.magnetSocketDiameter / 2;
    if (outermostSocket > layout.sideLength / 2 - 4) {
      errors.push(
        issue(
          "error",
          "magnet_pair_crowded",
          "The magnet sockets are too close to the hex corners for this tile size.",
          "magnetDiameter",
        ),
      );
    }
    if (config.magnetClearance < 0.15) {
      warnings.push(
        issue(
          "warning",
          "magnet_fit_tight",
          "Clearance below 0.15 mm may need drilling or sanding on some printers.",
          "magnetClearance",
        ),
      );
    }
  }

  if (config.purpose === "cards") {
    if (
      !Number.isInteger(config.cardSlotCount) ||
      config.cardSlotCount < 1 ||
      config.cardSlotCount > 8
    ) {
      errors.push(
        issue(
          "error",
          "slot_count_range",
          "Use between 1 and 8 card slots.",
          "cardSlotCount",
        ),
      );
    }
    if (!finiteInRange(config.cardSlotWidth, 0.8, 5)) {
      errors.push(
        issue(
          "error",
          "slot_width_range",
          "Card slot width must be between 0.8 and 5 mm.",
          "cardSlotWidth",
        ),
      );
    }
    if (!finiteInRange(config.cardSlotDepth, 3, config.bodyHeight - 2)) {
      errors.push(
        issue(
          "error",
          "slot_depth_range",
          "Card slot depth must leave at least 2 mm below the slot.",
          "cardSlotDepth",
        ),
      );
    }
    if (
      !finiteInRange(
        config.cardSlotLength,
        20,
        Math.max(20, layout.innerAcrossFlats),
      )
    ) {
      errors.push(
        issue(
          "error",
          "slot_length_range",
          "Card slots must fit inside the usable hex interior.",
          "cardSlotLength",
        ),
      );
    }
    if (!finiteInRange(config.cardSlotSpacing, 4, 24)) {
      errors.push(
        issue(
          "error",
          "slot_spacing_range",
          "Card slot spacing must be between 4 and 24 mm.",
          "cardSlotSpacing",
        ),
      );
    }
    const slotSpan =
      Math.max(0, config.cardSlotCount - 1) * config.cardSlotSpacing +
      config.cardSlotWidth;
    if (slotSpan > layout.innerAcrossFlats - 6) {
      errors.push(
        issue(
          "error",
          "slot_span_wide",
          "The card slots are wider than the safe interior. Reduce count or spacing.",
          "cardSlotSpacing",
        ),
      );
    }
  }

  if (config.purpose === "dice-orbit") {
    if (
      !finiteInRange(
        config.orbitCenterDiameter,
        24,
        Math.max(24, layout.innerAcrossFlats - 20),
      )
    ) {
      errors.push(
        issue(
          "error",
          "center_diameter_range",
          "The center cup must leave a useful outer dice ring.",
          "orbitCenterDiameter",
        ),
      );
    }
    if (!finiteInRange(config.orbitCenterRaise, 3, 12)) {
      errors.push(
        issue(
          "error",
          "center_raise_range",
          "Center elevation must be between 3 and 12 mm.",
          "orbitCenterRaise",
        ),
      );
    }
    if (!finiteInRange(config.orbitCenterDepth, 2, 9)) {
      errors.push(
        issue(
          "error",
          "center_depth_range",
          "Center cup depth must be between 2 and 9 mm.",
          "orbitCenterDepth",
        ),
      );
    }
    if (config.orbitCenterDepth > config.orbitCenterRaise) {
      errors.push(
        issue(
          "error",
          "center_cup_below_ring",
          "Center cup depth cannot exceed its elevation above the outer ring.",
          "orbitCenterDepth",
        ),
      );
    }
  }

  if (layout.pointToPoint > 220) {
    warnings.push(
      issue(
        "warning",
        "print_bed_size",
        `The ${layout.pointToPoint.toFixed(1)} mm point-to-point footprint exceeds a common 220 mm print bed.`,
      ),
    );
  }

  return { errors, warnings };
}
