import type { AdapterConfig } from "../adapter-types";
import { getTubeInnerDimensions } from "../adapter-types";
import {
  mergeValidation,
  type ValidationIssue,
  type ValidationResult,
} from "./types";

const MIN_WALL_MM = 0.4;
const MIN_SOCKET_DEPTH = 1;
const MAX_BEND_DEG = 90;

function issue(
  severity: ValidationIssue["severity"],
  code: string,
  message: string,
  field?: string,
): ValidationIssue {
  return { severity, code, message, field };
}

export function validateAdapterConfig(config: AdapterConfig): ValidationResult {
  const parts: ValidationResult[] = [];

  if (config.wallThickness < MIN_WALL_MM) {
    parts.push({
      errors: [
        issue(
          "error",
          "adapter_wall",
          `Adapter wall thickness must be at least ${String(MIN_WALL_MM)} mm.`,
          "wallThickness",
        ),
      ],
      warnings: [],
    });
  }

  if (config.socketDepth < MIN_SOCKET_DEPTH) {
    parts.push({
      errors: [
        issue(
          "error",
          "socket_depth",
          `Socket depth must be at least ${String(MIN_SOCKET_DEPTH)} mm.`,
          "socketDepth",
        ),
      ],
      warnings: [],
    });
  }

  if (config.bendAngle < 0 || config.bendAngle > MAX_BEND_DEG) {
    parts.push({
      errors: [
        issue(
          "error",
          "bend_angle",
          `Bend angle must be between 0° and ${String(MAX_BEND_DEG)}°.`,
          "bendAngle",
        ),
      ],
      warnings: [],
    });
  }

  if (config.segmentAmount < 8) {
    parts.push({
      errors: [
        issue(
          "error",
          "segments",
          "Segment count must be at least 8 for a smooth profile.",
          "segmentAmount",
        ),
      ],
      warnings: [],
    });
  }

  for (const [endLabel, tube, fit] of [
    ["End A", config.endA, config.endAFit] as const,
    ["End B", config.endB, config.endBFit] as const,
  ]) {
    if (fit === "plug") {
      const inner = getTubeInnerDimensions(tube);
      const minInner = config.socketClearance * 2 + config.wallThickness * 2;
      if (inner.width < minInner || inner.height < minInner) {
        parts.push({
          errors: [
            issue(
              "error",
              "plug_too_small",
              `${endLabel}: plug fit needs a larger tube inner size for the selected clearance and wall.`,
              endLabel,
            ),
          ],
          warnings: [],
        });
      }
    }
  }

  return mergeValidation(...parts);
}
