import type { TubeConfig, EndCutConfig } from "../tube-types";
import {
  emptyValidation,
  mergeValidation,
  type ValidationIssue,
  type ValidationResult,
} from "./types";

const MIN_WALL_MM = 0.4;
const MIN_LENGTH_MM = 1;
const MAX_LENGTH_MM = 5000;
const MIN_MITER_DEG = 0;
const MAX_MITER_DEG = 60;

function issue(
  severity: ValidationIssue["severity"],
  code: string,
  message: string,
  field?: string,
): ValidationIssue {
  return { severity, code, message, field };
}

function validateEndCut(
  cut: EndCutConfig,
  label: string,
): ValidationResult {
  const result = emptyValidation();
  if (cut.type === "miter") {
    if (cut.angle < MIN_MITER_DEG || cut.angle > MAX_MITER_DEG) {
      result.errors.push(
        issue(
          "error",
          "miter_angle_range",
          `${label} miter angle must be between ${String(MIN_MITER_DEG)}° and ${String(MAX_MITER_DEG)}°.`,
          label,
        ),
      );
    }
  }
  if (cut.type === "chamfer") {
    if (cut.depth <= 0) {
      result.errors.push(
        issue(
          "error",
          "chamfer_depth",
          `${label} chamfer depth must be greater than 0 mm.`,
          label,
        ),
      );
    }
    if (cut.angle <= 0 || cut.angle >= 90) {
      result.errors.push(
        issue(
          "error",
          "chamfer_angle",
          `${label} chamfer angle must be between 1° and 89°.`,
          label,
        ),
      );
    }
  }
  if (cut.type === "saddle") {
    if (cut.targetDiameter <= 0) {
      result.errors.push(
        issue(
          "error",
          "saddle_diameter",
          `${label} saddle target diameter must be greater than 0 mm.`,
          label,
        ),
      );
    }
  }
  return result;
}

export function validateTubeConfig(config: TubeConfig): ValidationResult {
  const parts: ValidationResult[] = [];

  if (config.length < MIN_LENGTH_MM || config.length > MAX_LENGTH_MM) {
    parts.push({
      errors: [
        issue(
          "error",
          "length_range",
          `Length must be between ${String(MIN_LENGTH_MM)} mm and ${String(MAX_LENGTH_MM)} mm.`,
          "length",
        ),
      ],
      warnings: [],
    });
  }

  if (config.shape === "round") {
    const wall = (config.outerDiameter - config.innerDiameter) / 2;
    if (config.innerDiameter >= config.outerDiameter) {
      parts.push({
        errors: [
          issue(
            "error",
            "inner_outer",
            "Inner diameter must be smaller than outer diameter.",
            "innerDiameter",
          ),
        ],
        warnings: [],
      });
    }
    if (wall < MIN_WALL_MM) {
      parts.push({
        errors: [
          issue(
            "error",
            "wall_thin",
            `Wall thickness (${wall.toFixed(2)} mm) is too thin to print reliably. Use at least ${String(MIN_WALL_MM)} mm.`,
            "outerDiameter",
          ),
        ],
        warnings: [],
      });
    }
  }

  if (config.shape === "square") {
    const wall = (config.outerSize - config.innerSize) / 2;
    if (config.innerSize >= config.outerSize) {
      parts.push({
        errors: [
          issue(
            "error",
            "inner_outer",
            "Inner size must be smaller than outer size.",
            "innerSize",
          ),
        ],
        warnings: [],
      });
    }
    if (wall < MIN_WALL_MM) {
      parts.push({
        errors: [
          issue(
            "error",
            "wall_thin",
            `Wall thickness (${wall.toFixed(2)} mm) is too thin to print reliably.`,
            "outerSize",
          ),
        ],
        warnings: [],
      });
    }
  }

  if (config.shape === "rectangular") {
    const wallW = (config.outerWidth - config.innerWidth) / 2;
    const wallH = (config.outerHeight - config.innerHeight) / 2;
    if (
      config.innerWidth >= config.outerWidth ||
      config.innerHeight >= config.outerHeight
    ) {
      parts.push({
        errors: [
          issue(
            "error",
            "inner_outer",
            "Inner width/height must be smaller than outer width/height.",
          ),
        ],
        warnings: [],
      });
    }
    if (wallW < MIN_WALL_MM || wallH < MIN_WALL_MM) {
      parts.push({
        errors: [
          issue(
            "error",
            "wall_thin",
            `Wall thickness is too thin to print reliably (minimum ${String(MIN_WALL_MM)} mm).`,
          ),
        ],
        warnings: [],
      });
    }
  }

  parts.push(validateEndCut(config.topCut, "Top"));
  parts.push(validateEndCut(config.bottomCut, "Bottom"));

  if (config.clamshell.enabled) {
    if (config.shape !== "round") {
      parts.push({
        errors: [
          issue(
            "error",
            "clamshell_shape",
            "Clamshell split is only supported on round tubes.",
            "clamshell",
          ),
        ],
        warnings: [],
      });
    }
    if (config.topCut.type !== "flat" || config.bottomCut.type !== "flat") {
      parts.push({
        warnings: [
          issue(
            "warning",
            "clamshell_cuts",
            "End cuts are ignored while clamshell mode is active.",
            "clamshell",
          ),
        ],
        errors: [],
      });
    }
    if (config.flare.enabled) {
      parts.push({
        warnings: [
          issue(
            "warning",
            "clamshell_flare",
            "Press-fit flare is disabled while clamshell mode is active.",
            "flare",
          ),
        ],
        errors: [],
      });
    }
  }

  const flareAllowed =
    config.topCut.type === "flat" && !config.clamshell.enabled;
  if (config.flare.enabled) {
    if (!flareAllowed) {
      parts.push({
        errors: [
          issue(
            "error",
            "flare_incompatible",
            "Press-fit flare requires a flat top end and clamshell disabled.",
            "flare",
          ),
        ],
        warnings: [],
      });
    } else {
      if (config.flare.length <= 0 || config.flare.length >= config.length) {
        parts.push({
          errors: [
            issue(
              "error",
              "flare_length",
              "Flare length must be greater than 0 and less than total tube length.",
              "flare.length",
            ),
          ],
          warnings: [],
        });
      }
      if (config.flare.stopShoulder && config.flare.stopDepth <= 0) {
        parts.push({
          errors: [
            issue(
              "error",
              "stop_depth",
              "Stop shoulder depth must be greater than 0 mm.",
              "flare.stopDepth",
            ),
          ],
          warnings: [],
        });
      }
    }
  }

  if (config.flare.fitType === "interference") {
    parts.push({
      warnings: [
        issue(
          "warning",
          "interference_fit",
          "Interference fit may require force to assemble — verify on a test print.",
          "flare.fitType",
        ),
      ],
      errors: [],
    });
  }

  return mergeValidation(...parts);
}
