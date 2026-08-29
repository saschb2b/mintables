import {
  emptyValidation,
  mergeValidation,
  type ValidationIssue,
  type ValidationResult,
} from "@mintables/shared/lib/validation/types";
import { deriveClamp } from "./derived";
import type { ClampConfig } from "./types";

/**
 * Rough snap-on strain thresholds. Above STIFF the snap only survives in
 * tough materials; above BREAK it is likely to crack in anything printable.
 */
export const STRAIN_STIFF = 0.028;
export const STRAIN_BREAK = 0.055;

function issue(
  severity: ValidationIssue["severity"],
  code: string,
  message: string,
  field?: string,
): ValidationIssue {
  return { severity, code, message, field };
}

function error(
  code: string,
  message: string,
  field?: string,
): ValidationResult {
  return { errors: [issue("error", code, message, field)], warnings: [] };
}

function warning(
  code: string,
  message: string,
  field?: string,
): ValidationResult {
  return { errors: [], warnings: [issue("warning", code, message, field)] };
}

function rangeError(
  field: string,
  code: string,
  label: string,
  min: number,
  max: number,
): ValidationResult {
  return error(
    code,
    `${label} must be between ${String(min)} mm and ${String(max)} mm.`,
    field,
  );
}

export function validateClampConfig(config: ClampConfig): ValidationResult {
  const parts: ValidationResult[] = [];
  const d = deriveClamp(config);

  if (config.rodDiameter < 2 || config.rodDiameter > 80) {
    parts.push(rangeError("rodDiameter", "rod_range", "Rod diameter", 2, 80));
  }
  if (config.fitClearance < -0.5 || config.fitClearance > 1.5) {
    parts.push(
      rangeError("fitClearance", "clearance_range", "Fit clearance", -0.5, 1.5),
    );
  }
  if (config.armThickness < 1.2 || config.armThickness > 12) {
    parts.push(
      rangeError("armThickness", "arm_range", "Arm thickness", 1.2, 12),
    );
  } else if (config.armThickness < 2.2) {
    parts.push(
      warning(
        "arm_thin",
        "Spring sections under 2.2 mm are fragile. Use a tough filament and enough perimeters.",
        "armThickness",
      ),
    );
  }
  if (config.rootThickness < config.armThickness) {
    parts.push(
      error(
        "root_thinner_than_arm",
        "Root thickness must be at least the spring thickness so the arm does not form a weak hinge at its base.",
        "rootThickness",
      ),
    );
  } else if (config.rootThickness > 16) {
    parts.push(
      rangeError("rootThickness", "root_range", "Root thickness", 1.2, 16),
    );
  }
  if (
    config.snapInterference < -2 ||
    config.snapInterference > config.rodDiameter * 0.5
  ) {
    parts.push(
      error(
        "interference_range",
        "Snap interference must be between -2 mm and half the rod diameter.",
        "snapInterference",
      ),
    );
  } else if (
    d.usesThroat &&
    Math.abs(d.snapInterference - config.snapInterference) > 0.15
  ) {
    parts.push(
      error(
        "interference_unreachable",
        "The requested snap interference needs too much throat lean. Increase throat depth or reduce the interference.",
        "snapInterference",
      ),
    );
  }
  if (config.jawWidth < 3 || config.jawWidth > 60) {
    parts.push(rangeError("jawWidth", "jaw_width_range", "Jaw width", 3, 60));
  }
  if (config.throatDepth < 0 || config.throatDepth > 15) {
    parts.push(
      rangeError("throatDepth", "throat_range", "Throat depth", 0, 15),
    );
  } else if (config.throatDepth > 0 && !d.usesThroat) {
    const minThroat =
      Math.sqrt(
        Math.max(
          0,
          d.tipRadius * d.tipRadius -
            (config.armThickness / 2) * (config.armThickness / 2),
        ),
      ) + 0.5;
    parts.push(
      warning(
        "throat_shallow",
        `A throat shallower than the tip bulb has no effect - the tips sit on the seat circle. Deepen it past ${minThroat.toFixed(1)} mm or set it to 0.`,
        "throatDepth",
      ),
    );
  }
  if (config.wrapAngle < 190 || config.wrapAngle > 300) {
    parts.push(
      error(
        "wrap_range",
        "Wrap angle must be between 190 and 300 degrees. Below 190 the clamp is a cradle, not a snap.",
        "wrapAngle",
      ),
    );
  }
  if (config.tipStyle === "bulb") {
    if (config.bulbScale < 1 || config.bulbScale > 2.6) {
      parts.push(
        error(
          "bulb_scale_range",
          "Bulb size must be between 1x and 2.6x the arm thickness.",
          "bulbScale",
        ),
      );
    }
    if (d.tipRadius >= d.boreRadius * 0.9) {
      parts.push(
        error(
          "bulb_too_big",
          "The tip bulbs are nearly as big as the bore itself. Reduce the bulb size or the arm thickness.",
          "bulbScale",
        ),
      );
    }
  }

  // Mouth and snap behavior.
  if (d.mouthOpening < 0.5) {
    parts.push(
      error(
        "mouth_closed",
        "The mouth is closed: the tips (nearly) touch. Reduce the wrap angle or the bulb size.",
        "wrapAngle",
      ),
    );
  } else {
    if (d.snapInterference <= 0) {
      parts.push(
        warning(
          "no_retention",
          `The mouth (${d.mouthOpening.toFixed(1)} mm) is wider than the rod, so nothing holds it in. Increase the wrap angle or the bulbs for a snap fit.`,
          "wrapAngle",
        ),
      );
    } else if (d.flexStrain > STRAIN_BREAK) {
      parts.push(
        error(
          "snap_too_stiff",
          `Snapping on forces each arm to flex ${(d.snapInterference / 2).toFixed(1)} mm, which will crack even tough filaments. Open the wrap angle, shrink the bulbs, or thin the arms.`,
          "wrapAngle",
        ),
      );
    } else if (d.flexStrain > STRAIN_STIFF) {
      parts.push(
        warning(
          "snap_stiff",
          "This is a stiff snap. It should survive in PETG, ASA, or nylon, but PLA will likely crack. Opening the wrap angle or shrinking the bulbs relaxes it.",
          "wrapAngle",
        ),
      );
    }
  }

  if (config.mount === "clip") {
    if (parts.length === 0) return emptyValidation();
    return mergeValidation(...parts);
  }

  // Plate mount checks.
  if (config.baseLength < 10 || config.baseLength > 120) {
    parts.push(
      rangeError("baseLength", "base_length_range", "Base length", 10, 120),
    );
  }
  if (config.baseWidth < 6 || config.baseWidth > 60) {
    parts.push(
      rangeError("baseWidth", "base_width_range", "Base width", 6, 60),
    );
  }
  if (config.baseThickness < 2 || config.baseThickness > 15) {
    parts.push(
      rangeError(
        "baseThickness",
        "base_thickness_range",
        "Base thickness",
        2,
        15,
      ),
    );
  } else if (config.baseThickness < 3) {
    parts.push(
      warning(
        "base_thin",
        "Bases under 3 mm flex around the screws. Fine for light duty; go thicker if the clamp takes real load.",
        "baseThickness",
      ),
    );
  }
  if (config.standoff < 0 || config.standoff > 40) {
    parts.push(rangeError("standoff", "standoff_range", "Standoff", 0, 40));
  }

  const endX = config.baseLength / 2 - config.baseWidth / 2;
  if (endX < config.jawWidth / 2 + 1) {
    parts.push(
      error(
        "base_too_short",
        "The base is too short for its width and the jaw. Lengthen the base, narrow it, or narrow the jaw.",
        "baseLength",
      ),
    );
  }

  const maxNeck = Math.min(config.baseWidth - 1, 2 * d.maxOuterRadius * 0.95);
  if (config.neckWidth < 4) {
    parts.push(
      error("neck_min", "Neck width must be at least 4 mm.", "neckWidth"),
    );
  } else if (config.neckWidth > maxNeck) {
    parts.push(
      error(
        "neck_too_wide",
        `Neck width must be at most ${maxNeck.toFixed(1)} mm here (limited by the base width and the jaw's outer diameter).`,
        "neckWidth",
      ),
    );
  } else {
    const zExit =
      d.boreCenterZ -
      Math.sqrt(
        Math.max(0, d.maxOuterRadius ** 2 - (config.neckWidth / 2) ** 2),
      );
    if (zExit < config.baseThickness + 0.3) {
      parts.push(
        error(
          "standoff_too_small",
          "The jaw digs into the base plate. Increase the standoff or narrow the neck.",
          "standoff",
        ),
      );
    }
  }

  // Screw holes.
  if (config.screwDiameter < 1.5 || config.screwDiameter > 10) {
    parts.push(
      rangeError("screwDiameter", "screw_range", "Screw diameter", 1.5, 10),
    );
  }
  const usesHead = config.screwRecess !== "plain";
  if (usesHead) {
    if (config.headDiameter < config.screwDiameter + 0.8) {
      parts.push(
        error(
          "head_too_small",
          "Head diameter must be at least 0.8 mm larger than the screw hole.",
          "headDiameter",
        ),
      );
    }
    if (
      config.screwRecess === "counterbore" ||
      config.screwRecess === "blended"
    ) {
      const maxDepth = config.baseThickness - 1.2;
      if (config.headDepth < 0.5 || config.headDepth > maxDepth) {
        parts.push(
          error(
            "head_depth_range",
            `Head recess depth must be between 0.5 mm and ${maxDepth.toFixed(1)} mm so at least 1.2 mm of plate remains under the head.`,
            "headDepth",
          ),
        );
      }
    } else {
      const coneRise = (config.headDiameter - config.screwDiameter) / 2;
      if (coneRise > config.baseThickness - 0.8) {
        parts.push(
          error(
            "countersink_too_deep",
            "The countersink cone is deeper than the base plate. Thicken the base or shrink the head diameter.",
            "headDiameter",
          ),
        );
      }
    }
  }

  const holeX = config.holeSpacing / 2;
  const maxHoleRadius = Math.max(
    config.screwDiameter / 2,
    usesHead ? config.headDiameter / 2 : 0,
  );
  if (holeX - maxHoleRadius < config.jawWidth / 2 + 0.8) {
    parts.push(
      error(
        "holes_hit_jaw",
        "The screw holes overlap the jaw. Increase the hole spacing or narrow the jaw.",
        "holeSpacing",
      ),
    );
  }
  if (config.baseLength / 2 - holeX - maxHoleRadius < 1.2) {
    parts.push(
      error(
        "holes_hit_end",
        "The screw holes run off the end of the base. Reduce the hole spacing or lengthen the base.",
        "holeSpacing",
      ),
    );
  }
  if (config.baseWidth / 2 - maxHoleRadius < 1.2) {
    parts.push(
      error(
        "holes_hit_side",
        "The screw holes are wider than the base allows. Widen the base or use a smaller screw head.",
        "baseWidth",
      ),
    );
  }

  if (parts.length === 0) return emptyValidation();
  return mergeValidation(...parts);
}
