import {
  emptyValidation,
  mergeValidation,
  type ValidationIssue,
  type ValidationResult,
} from "@mintables/shared/lib/validation/types";
import { SKADIS, maxHookColumns } from "./board";
import { deriveSkadis, rackLayout } from "./derived";
import {
  MAX_RACK_GROUPS,
  MAX_RACK_HOLES,
  rackHoleDiameters,
  type CupBody,
  type MountConfig,
  type RackBody,
  type SkadisConfig,
  type SlotBody,
  type TrayBody,
} from "./types";

type Part = ValidationResult | null;

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
  label: string,
  unit = "mm",
): Part {
  if (!Number.isFinite(value) || value < min || value > max) {
    const suffix = unit ? ` ${unit}` : "";
    return error(
      `${field.replace(".", "_")}_range`,
      `${label} must be between ${String(min)}${suffix} and ${String(max)}${suffix}.`,
      field,
    );
  }
  return null;
}

function integer(value: number, field: string, label: string): Part {
  if (!Number.isInteger(value)) {
    return error(
      `${field.replace(".", "_")}_integer`,
      `${label} must be a whole number.`,
      field,
    );
  }
  return null;
}

/* ------------------------------------------------------------------ */

function validateMount(config: SkadisConfig): Part[] {
  const m: MountConfig = config.mount;
  const parts: Part[] = [
    range(m.boardThickness, 3, 6.5, "mount.boardThickness", "Board gap"),
    range(m.fit, -0.5, 1, "mount.fit", "Fit clearance"),
    range(
      m.tabWidth,
      3.5,
      SKADIS.slotWidth - 0.1,
      "mount.tabWidth",
      "Tab width",
    ),
    range(m.tabHeight, 3, 6, "mount.tabHeight", "Tab height"),
    range(m.lipDrop, 4, 10, "mount.lipDrop", "Lip drop"),
    range(m.lipThickness, 3, 6, "mount.lipThickness", "Lip thickness"),
    range(m.hookInset, 2, 60, "mount.hookInset", "Hook inset"),
    range(m.plateThickness, 2, 6, "mount.plateThickness", "Plate thickness"),
    range(m.cornerRadius, 0, 10, "mount.cornerRadius", "Corner radius"),
  ];
  if (m.plateWidth !== 0)
    parts.push(range(m.plateWidth, 10, 300, "mount.plateWidth", "Plate width"));
  if (m.plateHeight !== 0)
    parts.push(
      range(m.plateHeight, 10, 250, "mount.plateHeight", "Plate height"),
    );
  if (m.hookColumns !== 0) {
    parts.push(
      range(m.hookColumns, 1, 8, "mount.hookColumns", "Hook columns", ""),
      integer(m.hookColumns, "mount.hookColumns", "Hook columns"),
    );
  }
  if (parts.some((p) => p !== null && p.errors.length > 0)) return parts;

  const d = deriveSkadis(config);
  const profile = d.hooks.profileHeight;
  if (profile > SKADIS.slotHeight - 1) {
    parts.push(
      error(
        "hook_profile_too_tall",
        `Tab plus lip is ${profile.toFixed(1)} mm tall; it must stay under ${String(SKADIS.slotHeight - 1)} mm to pass through a 15 mm slot before dropping into place. Lower the tab height or lip drop.`,
        "mount.lipDrop",
      ),
    );
  }
  if (m.boardThickness + m.fit < 3) {
    parts.push(
      error(
        "board_gap_too_small",
        "Board gap plus fit must leave at least 3 mm for the board.",
        "mount.fit",
      ),
    );
  }
  if (m.hookColumns > 0) {
    const fits = maxHookColumns(d.plateWidth, m.tabWidth);
    if (m.hookColumns > fits) {
      parts.push(
        error(
          "hook_columns_overflow",
          `${String(m.hookColumns)} hook columns need a plate at least ${String((m.hookColumns - 1) * SKADIS.pitch + m.tabWidth + 5)} mm wide; this one is ${d.plateWidth.toFixed(1)} mm.`,
          "mount.hookColumns",
        ),
      );
    }
  }
  const minPlate =
    m.hookInset + m.tabHeight + 2 + (m.hookRows === 2 ? m.rowSpacing : 0);
  if (m.plateHeight > 0 && m.plateHeight < minPlate) {
    parts.push(
      error(
        "plate_too_short",
        `The plate must be at least ${minPlate.toFixed(1)} mm tall to carry the hooks${m.hookRows === 2 ? " in two rows" : ""} at this inset.`,
        "mount.plateHeight",
      ),
    );
  }
  if (m.cornerRadius > d.plateWidth / 2 || m.cornerRadius > d.plateHeight / 2) {
    parts.push(
      error(
        "corner_radius_too_big",
        "Corner radius must be smaller than half the plate width and height.",
        "mount.cornerRadius",
      ),
    );
  }
  if (d.footprintX > 300) {
    parts.push(
      error(
        "part_too_wide",
        `The holder is ${d.footprintX.toFixed(0)} mm wide; keep it under 300 mm.`,
        m.plateWidth > 0 ? "mount.plateWidth" : undefined,
      ),
    );
  } else if (d.footprintX > 250) {
    parts.push(
      warning(
        "part_wide",
        `The holder is ${d.footprintX.toFixed(0)} mm wide. Check that it fits your print bed.`,
      ),
    );
  }
  if (d.height > 250) {
    parts.push(
      error(
        "part_too_tall",
        `The holder is ${d.height.toFixed(0)} mm tall; keep it under 250 mm.`,
      ),
    );
  }
  if (d.hooks.columns === 1 && d.body.width > 60) {
    parts.push(
      warning(
        "single_hook_wide_body",
        "A single hook column under a body this wide will rock sideways. Widen the plate so two columns fit, or set the plate width to at least 60 mm.",
        m.plateWidth > 0 ? "mount.plateWidth" : "mount.hookColumns",
      ),
    );
  }
  // Bottles and tools load the hooks far more than pencils do.
  const heavy = config.body.kind === "tray" || config.body.kind === "rack";
  if (m.hookRows === 1 && d.body.depth > (heavy ? 45 : 80)) {
    parts.push(
      warning(
        "deep_body_single_row",
        `The body reaches ${d.body.depth.toFixed(0)} mm out from the board. Add a second hook row so a loaded holder cannot tip forward.`,
        "mount.hookRows",
      ),
    );
  }
  return parts;
}

/* ------------------------------------------------------------------ */

function validateCup(body: CupBody): Part[] {
  const parts: Part[] = [
    range(body.height, 15, 200, "body.height", "Cup height"),
    range(body.wall, 1.2, 5, "body.wall", "Wall thickness"),
    range(body.floor, 1.2, 6, "body.floor", "Floor thickness"),
    range(body.tilt, 0, 25, "body.tilt", "Tilt", "°"),
    range(body.frontDip, 0, 100, "body.frontDip", "Front scoop"),
    range(body.drainHoles, 0, 4, "body.drainHoles", "Drain holes", ""),
    integer(body.drainHoles, "body.drainHoles", "Drain holes"),
    range(body.dividers, 0, 4, "body.dividers", "Dividers", ""),
    integer(body.dividers, "body.dividers", "Dividers"),
  ];
  if (body.shape === "round") {
    parts.push(
      range(body.innerDiameter, 8, 120, "body.innerDiameter", "Inner diameter"),
    );
  } else {
    parts.push(
      range(body.innerWidth, 8, 200, "body.innerWidth", "Inner width"),
      range(body.innerDepth, 8, 120, "body.innerDepth", "Inner depth"),
    );
  }
  if (body.frontDip > 0 && body.frontDip > body.height - body.floor - 4) {
    parts.push(
      error(
        "front_dip_too_deep",
        "The front scoop must stop at least 4 mm above the floor.",
        "body.frontDip",
      ),
    );
  }
  const innerW = body.shape === "round" ? body.innerDiameter : body.innerWidth;
  if (body.dividers > 0 && innerW / (body.dividers + 1) < 6) {
    parts.push(
      error(
        "divider_cells_too_small",
        "Each divided cell must be at least 6 mm wide.",
        "body.dividers",
      ),
    );
  }
  if (body.tilt > 20) {
    parts.push(
      warning(
        "cup_tilt_steep",
        "Above 20 degrees of tilt, short items slide out of the cup.",
        "body.tilt",
      ),
    );
  }
  return parts;
}

function validateTray(body: TrayBody): Part[] {
  const parts: Part[] = [
    range(body.pockets, 1, 8, "body.pockets", "Pockets", ""),
    integer(body.pockets, "body.pockets", "Pockets"),
    range(body.clearance, 0, 3, "body.clearance", "Clearance"),
    range(body.lipHeight, 2, 60, "body.lipHeight", "Lip height"),
    range(body.lipThickness, 1.2, 4, "body.lipThickness", "Lip thickness"),
    range(body.gap, 1, 20, "body.gap", "Gap between pockets"),
    range(body.shelfThickness, 2, 8, "body.shelfThickness", "Shelf thickness"),
    range(body.guardHeight, 0, 120, "body.guardHeight", "Guard height"),
    range(body.rowStep, 5, 40, "body.rowStep", "Row step"),
  ];
  if (body.pocketShape === "round") {
    parts.push(
      range(
        body.pocketDiameter,
        10,
        100,
        "body.pocketDiameter",
        "Pocket diameter",
      ),
    );
  } else {
    parts.push(
      range(body.pocketWidth, 10, 120, "body.pocketWidth", "Pocket width"),
      range(body.pocketDepth, 10, 120, "body.pocketDepth", "Pocket depth"),
    );
  }
  if (body.guardHeight > 0 && body.guardHeight <= body.lipHeight) {
    parts.push(
      warning(
        "guard_below_lip",
        "The guard is not taller than the lip, so it has no effect. Raise it or set it to 0.",
        "body.guardHeight",
      ),
    );
  }
  const size =
    body.pocketShape === "round" ? body.pocketDiameter : body.pocketWidth;
  if (size >= 40 && body.lipHeight < 4) {
    parts.push(
      warning(
        "lip_low_for_bottle",
        "A lip under 4 mm lets a bottle this size hop out when bumped.",
        "body.lipHeight",
      ),
    );
  }
  return parts;
}

function validateRack(body: RackBody, plateThickness: number): Part[] {
  const parts: Part[] = [
    range(body.gap, 2, 20, "body.gap", "Gap between holes"),
    range(body.frontSlot, 0, 60, "body.frontSlot", "Front slot"),
    range(body.barThickness, 3, 12, "body.barThickness", "Bar thickness"),
    range(body.tierSpacing, 20, 150, "body.tierSpacing", "Tier spacing"),
    range(body.tilt, 0, 20, "body.tilt", "Tilt", "°"),
  ];
  if (body.groups.length === 0 || body.groups.length > MAX_RACK_GROUPS) {
    parts.push(
      error(
        "rack_groups_count",
        `Use between 1 and ${String(MAX_RACK_GROUPS)} hole groups.`,
        "body.groups",
      ),
    );
    return parts;
  }
  body.groups.forEach((g, i) => {
    parts.push(
      range(
        g.diameter,
        3,
        60,
        `body.groups.${String(i)}.diameter`,
        "Hole diameter",
      ),
      range(g.count, 1, 12, `body.groups.${String(i)}.count`, "Hole count", ""),
      integer(g.count, `body.groups.${String(i)}.count`, "Hole count"),
    );
  });
  const diameters = rackHoleDiameters(body);
  if (diameters.length > MAX_RACK_HOLES) {
    parts.push(
      error(
        "rack_too_many_holes",
        `Keep the rack under ${String(MAX_RACK_HOLES)} holes in total.`,
        "body.groups",
      ),
    );
  }
  if (parts.some((p) => p !== null && p.errors.length > 0)) return parts;
  const minD = Math.min(...diameters);
  if (body.frontSlot > 0 && body.frontSlot >= minD) {
    parts.push(
      error(
        "front_slot_wider_than_hole",
        `The front slot (${String(body.frontSlot)} mm) must be narrower than the smallest hole (${String(minD)} mm) or the tool falls out the front.`,
        "body.frontSlot",
      ),
    );
  } else if (body.frontSlot > 0 && body.frontSlot > 0.7 * minD) {
    parts.push(
      warning(
        "front_slot_wide",
        "A front slot wider than 70% of the hole lets tools swing out when bumped.",
        "body.frontSlot",
      ),
    );
  }
  const L = rackLayout(body, plateThickness);
  if (body.barDepth > 0 && body.barDepth < L.maxDiameter + 2) {
    parts.push(
      error(
        "bar_depth_too_small",
        `The bar must be at least ${String(L.maxDiameter + 2)} mm deep to leave a wall around the largest hole.`,
        "body.barDepth",
      ),
    );
  }
  return parts;
}

function validateSlot(body: SlotBody): Part[] {
  const parts: Part[] = [
    range(body.slots, 1, 8, "body.slots", "Slots", ""),
    integer(body.slots, "body.slots", "Slots"),
    range(body.slotWidth, 3, 120, "body.slotWidth", "Slot width"),
    range(body.slotDepth, 1.5, 60, "body.slotDepth", "Slot depth"),
    range(body.slotHeight, 8, 150, "body.slotHeight", "Slot height"),
    range(body.wall, 1.2, 6, "body.wall", "Wall thickness"),
    range(body.floor, 1.2, 6, "body.floor", "Floor thickness"),
    range(body.tilt, 0, 30, "body.tilt", "Tilt", "°"),
    range(body.frontWindow, 0, 150, "body.frontWindow", "Front window"),
  ];
  if (body.frontWindow > 0 && body.frontWindow > body.slotHeight - 6) {
    parts.push(
      error(
        "front_window_too_tall",
        "The front window must stop at least 6 mm above the slot floor.",
        "body.frontWindow",
      ),
    );
  }
  return parts;
}

/* ------------------------------------------------------------------ */

export function validateSkadisConfig(config: SkadisConfig): ValidationResult {
  let bodyParts: Part[];
  switch (config.body.kind) {
    case "cup":
      bodyParts = validateCup(config.body);
      break;
    case "tray":
      bodyParts = validateTray(config.body);
      break;
    case "rack":
      bodyParts = validateRack(config.body, config.mount.plateThickness);
      break;
    case "slot":
      bodyParts = validateSlot(config.body);
      break;
  }
  const bodyErrors = bodyParts.some((p) => p !== null && p.errors.length > 0);
  // Mount checks derive the layout, which needs a sane body first.
  const parts = bodyErrors
    ? bodyParts
    : [...bodyParts, ...validateMount(config)];
  const present = parts.filter((p): p is ValidationResult => p !== null);
  if (present.length === 0) return emptyValidation();
  return mergeValidation(...present);
}
