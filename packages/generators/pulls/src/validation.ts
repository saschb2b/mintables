import {
  emptyValidation,
  mergeValidation,
  type ValidationIssue,
  type ValidationResult,
} from "@mintables/shared/lib/validation/types";
import {
  arcBarDepth,
  arcBarWidth,
  type ArcPullConfig,
  type KnobPullConfig,
  type PullConfig,
  type TabPullConfig,
} from "./types";
import {
  effectiveGrooveCount,
  tabScrewPositions,
  tabStripHalfLength,
} from "./geometry";

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

function range(
  value: number,
  min: number,
  max: number,
  field: string,
  code: string,
  label: string,
): ValidationResult | null {
  if (value < min || value > max) {
    return error(
      code,
      `${label} must be between ${String(min)} mm and ${String(max)} mm.`,
      field,
    );
  }
  return null;
}

function validateKnob(config: KnobPullConfig): ValidationResult[] {
  const parts: (ValidationResult | null)[] = [
    range(
      config.headDiameter,
      8,
      80,
      "headDiameter",
      "head_range",
      "Head diameter",
    ),
    range(
      config.headHeight,
      4,
      60,
      "headHeight",
      "head_height_range",
      "Head height",
    ),
    range(
      config.neckDiameter,
      4,
      80,
      "neckDiameter",
      "neck_range",
      "Neck diameter",
    ),
    range(
      config.neckHeight,
      0,
      40,
      "neckHeight",
      "neck_height_range",
      "Neck height",
    ),
    range(
      config.baseDiameter,
      6,
      90,
      "baseDiameter",
      "base_range",
      "Base diameter",
    ),
    range(
      config.baseHeight,
      0.4,
      20,
      "baseHeight",
      "base_height_range",
      "Base height",
    ),
  ];
  const out = parts.filter((p): p is ValidationResult => p !== null);

  if (config.neckDiameter > config.headDiameter) {
    out.push(
      error(
        "neck_wider_than_head",
        "The neck can't be wider than the head; make them equal for a cylinder knob.",
        "neckDiameter",
      ),
    );
  } else if (config.neckDiameter < 9 && config.headDiameter > 24) {
    out.push(
      warning(
        "neck_slender",
        "A neck under 9 mm carrying a wide head can snap; thicken the neck or shrink the head.",
        "neckDiameter",
      ),
    );
  }
  if (config.baseDiameter < config.neckDiameter) {
    out.push(
      error(
        "base_narrower_than_neck",
        "The base flange must be at least as wide as the neck, or the shoulder above it can't print.",
        "baseDiameter",
      ),
    );
  }

  const grooves = Math.round(config.gripGrooves);
  if (grooves < 0 || grooves > 12) {
    out.push(
      error(
        "groove_count_range",
        "Grip rings must be between 0 and 12.",
        "gripGrooves",
      ),
    );
  } else if (grooves > 0) {
    if (config.gripGrooveDepth < 0.2 || config.gripGrooveDepth > 2) {
      out.push(
        error(
          "groove_depth_range",
          "Grip ring depth must be between 0.2 mm and 2 mm.",
          "gripGrooveDepth",
        ),
      );
    } else if (effectiveGrooveCount(config) < grooves) {
      out.push(
        warning(
          "grooves_clamped",
          `Only ${String(effectiveGrooveCount(config))} grip rings fit on this head; shrink the ring depth or grow the head to cut more.`,
          "gripGrooves",
        ),
      );
    }
  }

  if (config.mount === "screws") {
    const total = config.baseHeight + config.neckHeight + config.headHeight;
    if (config.screwDiameter + 2.4 > config.neckDiameter) {
      out.push(
        error(
          "screw_wider_than_neck",
          "The pilot bore needs 1.2 mm of wall inside the neck; use a thinner screw or a wider neck.",
          "screwDiameter",
        ),
      );
    }
    const maxDepth = total - 3;
    if (config.screwHoleDepth < 4 || config.screwHoleDepth > maxDepth) {
      out.push(
        error(
          "screw_depth_range",
          `Pilot bore depth must be between 4 mm and ${maxDepth.toFixed(1)} mm so 3 mm of solid cap remains.`,
          "screwHoleDepth",
        ),
      );
    }
  }
  return out;
}

function validateTab(config: TabPullConfig): ValidationResult[] {
  const parts: (ValidationResult | null)[] = [
    range(config.width, 8, 80, "width", "width_range", "Width"),
    range(
      config.baseLength,
      10,
      120,
      "baseLength",
      "base_length_range",
      "Base length",
    ),
    range(
      config.tabLength,
      8,
      120,
      "tabLength",
      "tab_length_range",
      "Blade length",
    ),
    range(
      config.thickness,
      1.6,
      8,
      "thickness",
      "thickness_range",
      "Thickness",
    ),
    range(
      config.bendRadius,
      0.5,
      20,
      "bendRadius",
      "bend_radius_range",
      "Bend radius",
    ),
  ];
  const out = parts.filter((p): p is ValidationResult => p !== null);

  if (config.tabAngle < 10 || config.tabAngle > 90) {
    out.push(
      error(
        "angle_range",
        "Blade angle must be between 10 and 90 degrees.",
        "tabAngle",
      ),
    );
  } else if (config.tabAngle < 25) {
    out.push(
      warning(
        "angle_shallow",
        "Below 25 degrees the blade hugs the lid and is hard to get a finger under.",
        "tabAngle",
      ),
    );
  }

  if (config.mount === "screws") {
    const count = Math.round(config.screwCount);
    if (count < 1 || count > 2) {
      out.push(error("screw_count_range", "Use 1 or 2 screws.", "screwCount"));
    }
    if (config.screwHeadDiameter < config.screwDiameter + 1) {
      out.push(
        error(
          "screw_head_small",
          "The screw head must be at least 1 mm wider than the shank for the countersink to exist.",
          "screwHeadDiameter",
        ),
      );
    }
    if (config.screwHeadDiameter + 2.8 > config.width) {
      out.push(
        error(
          "screw_head_wide",
          "The strip needs 1.4 mm of material either side of the screw head; widen the tab or use a smaller screw.",
          "screwHeadDiameter",
        ),
      );
    }
    const csDepth = (config.screwHeadDiameter - config.screwDiameter) / 2;
    if (csDepth > config.thickness - 0.6) {
      out.push(
        error(
          "countersink_deep",
          "The countersink would cut through the base; thicken the strip or use a smaller screw head.",
          "thickness",
        ),
      );
    }
    const positions = tabScrewPositions(config);
    const s = tabStripHalfLength(config);
    const fits =
      positions.length > 0 &&
      positions[0] - s >= 0.8 &&
      positions[positions.length - 1] + s <= config.baseLength - 0.8 &&
      (positions.length < 2 || positions[1] - positions[0] >= 2 * s + 1.5);
    if (!fits) {
      out.push(
        error(
          "base_too_short",
          "The flat run is too short for the screw layout; lengthen the base or drop to one screw.",
          "baseLength",
        ),
      );
    }
  }
  return out;
}

function validateArc(config: ArcPullConfig): ValidationResult[] {
  const depth = arcBarDepth(config);
  const width = arcBarWidth(config);
  const parts: (ValidationResult | null)[] = [
    range(
      config.holeSpacing,
      24,
      300,
      "holeSpacing",
      "spacing_range",
      "Hole spacing",
    ),
    range(config.rise, 12, 160, "rise", "rise_range", "Rise"),
  ];
  if (config.barProfile === "round") {
    parts.push(
      range(
        config.barDiameter,
        5,
        30,
        "barDiameter",
        "bar_diameter_range",
        "Bar diameter",
      ),
    );
  } else {
    parts.push(
      range(config.barWidth, 6, 40, "barWidth", "bar_width_range", "Bar width"),
      range(config.barDepth, 4, 30, "barDepth", "bar_depth_range", "Bar depth"),
    );
  }
  const out = parts.filter((p): p is ValidationResult => p !== null);

  if (config.rise <= depth) {
    out.push(
      error(
        "rise_too_low",
        "The rise must exceed the bar depth or there is no arch at all.",
        "rise",
      ),
    );
  } else {
    if (config.rise - depth / 2 < 18) {
      out.push(
        warning(
          "grip_tight",
          "Less than 18 mm of finger room under the bar; raise the arch for a comfortable grip.",
          "rise",
        ),
      );
    }
    if (config.rise > config.holeSpacing) {
      out.push(
        warning(
          "horseshoe",
          "The rise exceeds the hole spacing, giving an extreme horseshoe; expect long overhangs when printing.",
          "rise",
        ),
      );
    } else if (config.rise < config.holeSpacing / 6) {
      out.push(
        warning(
          "arc_shallow",
          "A very shallow arc meets the surface at a grazing angle and grows long oval feet.",
          "rise",
        ),
      );
    }
  }

  if (config.mount === "screws") {
    if (config.screwDiameter + 2.4 > Math.min(depth, width)) {
      out.push(
        error(
          "screw_wider_than_bar",
          "The pilot bore needs 1.2 mm of wall inside the bar; use a thinner screw or a thicker bar.",
          "screwDiameter",
        ),
      );
    }
    if (config.screwHoleDepth < 5 || config.screwHoleDepth > 40) {
      out.push(
        error(
          "screw_depth_range",
          "Pilot bore depth must be between 5 mm and 40 mm.",
          "screwHoleDepth",
        ),
      );
    } else if (config.screwHoleDepth > config.rise * 0.6) {
      out.push(
        warning(
          "screw_depth_curved",
          "A bore this deep follows a curving bar; it may break out of the side. Keep it under 60% of the rise.",
          "screwHoleDepth",
        ),
      );
    }
  }
  return out;
}

export function validatePullConfig(config: PullConfig): ValidationResult {
  let parts: ValidationResult[];
  switch (config.style) {
    case "knob":
      parts = validateKnob(config);
      break;
    case "tab":
      parts = validateTab(config);
      break;
    case "arc":
      parts = validateArc(config);
      break;
  }
  if (config.mount === "screws") {
    const r = range(
      config.screwDiameter,
      1.5,
      8,
      "screwDiameter",
      "screw_diameter_range",
      "Screw diameter",
    );
    if (r) parts.push(r);
  }
  if (parts.length === 0) return emptyValidation();
  return mergeValidation(...parts);
}
