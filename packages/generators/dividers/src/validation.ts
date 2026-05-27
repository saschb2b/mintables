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

  if (parts.length === 0) return emptyValidation();
  return mergeValidation(...parts);
}
