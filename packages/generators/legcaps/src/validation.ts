import {
  emptyValidation,
  mergeValidation,
  type ValidationIssue,
  type ValidationResult,
} from "@mintables/shared/lib/validation/types";
import type { LegCapConfig } from "./types";

const MIN_WALL_MM = 0.8;
const MAX_WALL_MM = 10;
const MIN_FLOOR_MM = 0.4;
const MAX_FLOOR_MM = 20;
const MIN_HEIGHT_MM = 2;
const MAX_HEIGHT_MM = 200;
const MIN_INNER_MM = 2;
const MAX_INNER_MM = 200;
const MIN_CLEARANCE_MM = 0;
const MAX_CLEARANCE_MM = 5;
const MIN_TAPER_MM = 0;
const MAX_TAPER_MM = 10;
const MIN_FELT_INSET_MM = 0.5;
const MIN_FELT_DEPTH_MM = 0.2;

function issue(
  severity: ValidationIssue["severity"],
  code: string,
  message: string,
  field?: string,
): ValidationIssue {
  return { severity, code, message, field };
}

function rangeError(
  field: string,
  code: string,
  label: string,
  min: number,
  max: number,
): ValidationResult {
  return {
    errors: [
      issue(
        "error",
        code,
        `${label} must be between ${String(min)} mm and ${String(max)} mm.`,
        field,
      ),
    ],
    warnings: [],
  };
}

export function validateLegCapConfig(config: LegCapConfig): ValidationResult {
  const parts: ValidationResult[] = [];

  if (config.wallThickness < MIN_WALL_MM || config.wallThickness > MAX_WALL_MM) {
    parts.push(
      rangeError(
        "wallThickness",
        "wall_range",
        "Wall thickness",
        MIN_WALL_MM,
        MAX_WALL_MM,
      ),
    );
  } else if (config.wallThickness < 1.2) {
    parts.push({
      errors: [],
      warnings: [
        issue(
          "warning",
          "wall_thin",
          "Walls under 1.2 mm may flex or crack under load. Bump it up if the cap takes real weight.",
          "wallThickness",
        ),
      ],
    });
  }

  if (
    config.floorThickness < MIN_FLOOR_MM ||
    config.floorThickness > MAX_FLOOR_MM
  ) {
    parts.push(
      rangeError(
        "floorThickness",
        "floor_range",
        "Floor thickness",
        MIN_FLOOR_MM,
        MAX_FLOOR_MM,
      ),
    );
  }

  if (config.capHeight < MIN_HEIGHT_MM || config.capHeight > MAX_HEIGHT_MM) {
    parts.push(
      rangeError(
        "capHeight",
        "cap_height_range",
        "Cap height",
        MIN_HEIGHT_MM,
        MAX_HEIGHT_MM,
      ),
    );
  }

  if (
    config.fitClearance < MIN_CLEARANCE_MM ||
    config.fitClearance > MAX_CLEARANCE_MM
  ) {
    parts.push(
      rangeError(
        "fitClearance",
        "clearance_range",
        "Fit clearance",
        MIN_CLEARANCE_MM,
        MAX_CLEARANCE_MM,
      ),
    );
  }

  // Inner dimensions per shape + corner radius bounds.
  if (config.shape === "round") {
    if (
      config.innerDiameter < MIN_INNER_MM ||
      config.innerDiameter > MAX_INNER_MM
    ) {
      parts.push(
        rangeError(
          "innerDiameter",
          "inner_diameter_range",
          "Inner diameter",
          MIN_INNER_MM,
          MAX_INNER_MM,
        ),
      );
    }
  } else if (config.shape === "square") {
    if (config.innerSize < MIN_INNER_MM || config.innerSize > MAX_INNER_MM) {
      parts.push(
        rangeError(
          "innerSize",
          "inner_size_range",
          "Leg size",
          MIN_INNER_MM,
          MAX_INNER_MM,
        ),
      );
    }
    const outerHalf = (config.innerSize + 2 * config.wallThickness) / 2;
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
    } else if (config.cornerRadius > outerHalf) {
      parts.push({
        errors: [
          issue(
            "error",
            "corner_radius_too_large",
            `Corner radius must be at most ${outerHalf.toFixed(1)} mm (half of the outer width).`,
            "cornerRadius",
          ),
        ],
        warnings: [],
      });
    }
  } else if (config.shape === "rectangular" || config.shape === "oval") {
    if (
      config.innerWidth < MIN_INNER_MM ||
      config.innerWidth > MAX_INNER_MM
    ) {
      parts.push(
        rangeError(
          "innerWidth",
          "inner_width_range",
          "Leg width",
          MIN_INNER_MM,
          MAX_INNER_MM,
        ),
      );
    }
    if (
      config.innerHeight < MIN_INNER_MM ||
      config.innerHeight > MAX_INNER_MM
    ) {
      parts.push(
        rangeError(
          "innerHeight",
          "inner_height_range",
          "Leg depth",
          MIN_INNER_MM,
          MAX_INNER_MM,
        ),
      );
    }
    if (config.shape === "rectangular") {
      const shortOuter =
        Math.min(config.innerWidth, config.innerHeight) +
        2 * config.wallThickness;
      const maxR = shortOuter / 2;
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
      } else if (config.cornerRadius > maxR) {
        parts.push({
          errors: [
            issue(
              "error",
              "corner_radius_too_large",
              `Corner radius must be at most ${maxR.toFixed(1)} mm (half of the shorter outer edge).`,
              "cornerRadius",
            ),
          ],
          warnings: [],
        });
      }
    }
  }

  if (config.innerTaperEnabled) {
    if (config.innerTaper < MIN_TAPER_MM || config.innerTaper > MAX_TAPER_MM) {
      parts.push(
        rangeError(
          "innerTaper",
          "taper_range",
          "Inner taper",
          MIN_TAPER_MM,
          MAX_TAPER_MM,
        ),
      );
    } else {
      // The taper narrows the inner socket at the floor by `innerTaper`. It
      // mustn't exceed (or even come close to) the wall thickness, or the
      // floor's outer corner becomes a knife-edge that won't print.
      const safeMax = config.wallThickness * 0.8;
      if (config.innerTaper > safeMax) {
        parts.push({
          errors: [
            issue(
              "error",
              "taper_too_large",
              `Inner taper must be at most ${safeMax.toFixed(2)} mm (80% of the wall thickness) so the floor edge stays printable.`,
              "innerTaper",
            ),
          ],
          warnings: [],
        });
      } else if (config.innerTaper === 0) {
        parts.push({
          errors: [],
          warnings: [
            issue(
              "warning",
              "taper_noop",
              "Inner taper is on but set to 0 mm — the socket is still a plain cylinder. Set a taper or turn it off.",
              "innerTaper",
            ),
          ],
        });
      }
    }
  }

  if (config.feltRecessEnabled) {
    if (config.feltInset < MIN_FELT_INSET_MM) {
      parts.push({
        errors: [
          issue(
            "error",
            "felt_inset_range",
            `Felt inset must be at least ${String(MIN_FELT_INSET_MM)} mm so the cap keeps a usable rim.`,
            "feltInset",
          ),
        ],
        warnings: [],
      });
    } else if (config.feltInset > config.wallThickness) {
      parts.push({
        errors: [
          issue(
            "error",
            "felt_inset_too_large",
            `Felt inset can't exceed the wall thickness (${config.wallThickness.toFixed(1)} mm) — the recess would break through the side wall.`,
            "feltInset",
          ),
        ],
        warnings: [],
      });
    }

    const safeFloorMax = config.floorThickness * 0.6;
    if (config.feltDepth < MIN_FELT_DEPTH_MM) {
      parts.push({
        errors: [
          issue(
            "error",
            "felt_depth_too_shallow",
            `Felt depth must be at least ${String(MIN_FELT_DEPTH_MM)} mm.`,
            "feltDepth",
          ),
        ],
        warnings: [],
      });
    } else if (config.feltDepth > safeFloorMax) {
      parts.push({
        errors: [
          issue(
            "error",
            "felt_depth_too_deep",
            `Felt depth must be at most ${safeFloorMax.toFixed(2)} mm (60% of the floor thickness) so the floor doesn't print as a film.`,
            "feltDepth",
          ),
        ],
        warnings: [],
      });
    }
  }

  if (parts.length === 0) return emptyValidation();
  return mergeValidation(...parts);
}
