import {
  emptyValidation,
  mergeValidation,
  type ValidationIssue,
  type ValidationResult,
} from "@mintables/shared/lib/validation/types";
import type { DividerConfig } from "./types";

const MIN_THICKNESS_MM = 0.4;
const MAX_THICKNESS_MM = 20;
const MIN_DIM_MM = 1;
const MAX_DIM_MM = 500;

function issue(
  severity: ValidationIssue["severity"],
  code: string,
  message: string,
  field?: string,
): ValidationIssue {
  return { severity, code, message, field };
}

export function validateDividerConfig(config: DividerConfig): ValidationResult {
  const parts: ValidationResult[] = [];

  if (config.thickness < MIN_THICKNESS_MM || config.thickness > MAX_THICKNESS_MM) {
    parts.push({
      errors: [
        issue(
          "error",
          "thickness_range",
          `Thickness must be between ${String(MIN_THICKNESS_MM)} mm and ${String(MAX_THICKNESS_MM)} mm.`,
          "thickness",
        ),
      ],
      warnings: [],
    });
  } else if (config.thickness < 0.8) {
    parts.push({
      errors: [],
      warnings: [
        issue(
          "warning",
          "thickness_thin",
          "Thicknesses under 0.8 mm can warp or fail to bond. Verify on a test print.",
          "thickness",
        ),
      ],
    });
  }

  if (config.width < MIN_DIM_MM || config.width > MAX_DIM_MM) {
    parts.push({
      errors: [
        issue(
          "error",
          "width_range",
          `Width must be between ${String(MIN_DIM_MM)} mm and ${String(MAX_DIM_MM)} mm.`,
          "width",
        ),
      ],
      warnings: [],
    });
  }

  if (config.height < MIN_DIM_MM || config.height > MAX_DIM_MM) {
    parts.push({
      errors: [
        issue(
          "error",
          "height_range",
          `Height must be between ${String(MIN_DIM_MM)} mm and ${String(MAX_DIM_MM)} mm.`,
          "height",
        ),
      ],
      warnings: [],
    });
  }

  if (config.taperEnabled) {
    if (config.bottomWidth < MIN_DIM_MM || config.bottomWidth > MAX_DIM_MM) {
      parts.push({
        errors: [
          issue(
            "error",
            "bottom_width_range",
            `Bottom width must be between ${String(MIN_DIM_MM)} mm and ${String(MAX_DIM_MM)} mm.`,
            "bottomWidth",
          ),
        ],
        warnings: [],
      });
    } else if (config.bottomWidth === config.width) {
      parts.push({
        errors: [],
        warnings: [
          issue(
            "warning",
            "taper_noop",
            "Taper is on but the bottom width matches the top — adjust the bottom width or turn taper off.",
            "bottomWidth",
          ),
        ],
      });
    }
  }

  // Corner radius is bounded by the SHORTER side of the slab — once taper
  // narrows the bottom edge, the safe radius shrinks with it.
  const effectiveBottom = config.taperEnabled ? config.bottomWidth : config.width;
  const shortestSide = Math.min(config.width, effectiveBottom, config.height);
  const maxRadius = shortestSide / 2;
  if (config.cornerRadius < 0) {
    parts.push({
      errors: [
        issue(
          "error",
          "corner_radius_negative",
          "Corner radius can't be negative.",
          "cornerRadius",
        ),
      ],
      warnings: [],
    });
  } else if (config.cornerRadius > maxRadius) {
    const tapered = config.taperEnabled && config.bottomWidth < config.width;
    parts.push({
      errors: [
        issue(
          "error",
          "corner_radius_too_large",
          `Corner radius must be at most ${maxRadius.toFixed(1)} mm (half of the shortest side${tapered ? ", which is the tapered bottom" : ""}).`,
          "cornerRadius",
        ),
      ],
      warnings: [],
    });
  }

  if (config.labelEnabled) {
    // The label sits centered horizontally, so width is bounded by the
    // narrower edge of the slab (the bottom when tapered). Vertical bound
    // depends on the chosen position: "center" needs 1 mm of wall on each
    // side (so labelHeight ≤ height − 2); "top"/"bottom" only need to fit
    // the pocket between its 1 mm margin and the opposite edge.
    const narrowestWidth = config.taperEnabled
      ? Math.min(config.width, config.bottomWidth)
      : config.width;
    const maxLabelWidth = Math.max(0, narrowestWidth - 2);
    const maxLabelHeight = Math.max(0, config.height - 2);
    const maxLabelDepth = config.thickness / 2;

    if (config.labelWidth <= 0 || config.labelWidth > maxLabelWidth) {
      parts.push({
        errors: [
          issue(
            "error",
            "label_width_range",
            `Label width must be between 1 mm and ${maxLabelWidth.toFixed(1)} mm so it fits the slab with a 1 mm wall.`,
            "labelWidth",
          ),
        ],
        warnings: [],
      });
    }
    if (config.labelHeight <= 0 || config.labelHeight > maxLabelHeight) {
      parts.push({
        errors: [
          issue(
            "error",
            "label_height_range",
            `Label height must be between 1 mm and ${maxLabelHeight.toFixed(1)} mm so it fits the slab with a 1 mm wall.`,
            "labelHeight",
          ),
        ],
        warnings: [],
      });
    }
    if (config.labelDepth <= 0 || config.labelDepth > maxLabelDepth) {
      parts.push({
        errors: [
          issue(
            "error",
            "label_depth_range",
            `Label depth must be between 0.1 mm and ${maxLabelDepth.toFixed(2)} mm (half the slab thickness).`,
            "labelDepth",
          ),
        ],
        warnings: [],
      });
    }
  }

  if (parts.length === 0) return emptyValidation();
  return mergeValidation(...parts);
}
