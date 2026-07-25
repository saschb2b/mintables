import type {
  ValidationIssue,
  ValidationResult,
} from "@mintables/shared/lib/validation";
import { decodeCustomTextureSamples } from "./custom-height-map";
import {
  calculateHexTileLayout,
  throughChannels,
  cardSlotPlan,
  type CardChannel,
  type HexTileLayout,
} from "./layout";
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

const CHANNEL_CLEARANCE = 0.6;

/** A sleeved standard card, the long edge a deck stands on. */
const STANDARD_CARD_LENGTH = 92;

/** Sideways spans of the magnet sockets sitting in the two channelled flats. */
function magnetSpansOnChannelledFlats(
  config: HexTileConfig,
  layout: HexTileLayout,
): CardChannel[] {
  if (config.magnetMode === "none") return [];
  const halfWidth = layout.magnetSocketDiameter / 2;
  const centers =
    config.magnetMode === "paired"
      ? [-layout.pairedMagnetOffset, layout.pairedMagnetOffset]
      : [0];
  return centers.map((center) => ({
    min: center - halfWidth,
    max: center + halfWidth,
  }));
}

function spansOverlap(a: CardChannel, b: CardChannel, gap: number): boolean {
  return a.min - gap < b.max && b.min - gap < a.max;
}

/** How much material sits between a top-face point and the nearest tile edge. */
function insetFromTopOutline(
  config: HexTileConfig,
  x: number,
  y: number,
): number {
  const apothem = (config.acrossFlats - 2 * config.edgeBevel) / 2;
  const diagonal = Math.sqrt(3) / 2;
  return (
    apothem -
    Math.max(
      Math.abs(y),
      Math.abs(diagonal * x + y / 2),
      Math.abs(diagonal * x - y / 2),
    )
  );
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
    if (
      !Number.isInteger(config.bowlWellCount) ||
      config.bowlWellCount < 1 ||
      config.bowlWellCount > 3
    ) {
      errors.push(
        issue(
          "error",
          "bowl_well_count_range",
          "A bowl tile holds between 1 and 3 wells.",
          "bowlWellCount",
        ),
      );
    } else if (layout.bowlWellCount > 1 && layout.bowlWellBandWidth < 18) {
      errors.push(
        issue(
          "error",
          "bowl_wells_crowded",
          `${String(layout.bowlWellCount)} wells leave only ${layout.bowlWellBandWidth.toFixed(1)} mm across each one. Widen the tile, narrow the rim, or use fewer wells.`,
          "bowlWellCount",
        ),
      );
    }
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
    if (config.magnetMode === "captive") {
      if (!finiteInRange(config.magnetRodDiameter, 2, 6)) {
        errors.push(
          issue(
            "error",
            "magnet_rod_diameter_range",
            "Rod diameter must be between 2 and 6 mm.",
            "magnetRodDiameter",
          ),
        );
      }
      if (!finiteInRange(config.magnetRodLength, 5, 20)) {
        errors.push(
          issue(
            "error",
            "magnet_rod_length_range",
            "Rod length must be between 5 and 20 mm.",
            "magnetRodLength",
          ),
        );
      }
      if (!finiteInRange(config.magnetRodClearance, 0.05, 0.8)) {
        errors.push(
          issue(
            "error",
            "magnet_rod_clearance_range",
            "Rod clearance must be between 0.05 and 0.8 mm.",
            "magnetRodClearance",
          ),
        );
      }
      if (!finiteInRange(config.magnetLipOpening, 1, 5.8)) {
        errors.push(
          issue(
            "error",
            "magnet_lip_opening_range",
            "Lip opening must be between 1 and 5.8 mm.",
            "magnetLipOpening",
          ),
        );
      } else if (config.magnetLipOpening >= config.magnetRodDiameter) {
        errors.push(
          issue(
            "error",
            "magnet_lip_not_retaining",
            "The lip opening must be smaller than the rod diameter so the magnet cannot fall out.",
            "magnetLipOpening",
          ),
        );
      } else if (config.magnetRodDiameter - config.magnetLipOpening > 1) {
        warnings.push(
          issue(
            "warning",
            "magnet_lip_tight",
            "More than 1 mm of lip interference may make the rod difficult to press in.",
            "magnetLipOpening",
          ),
        );
      }
      if (!finiteInRange(config.magnetLipDepth, 0.4, 1.5)) {
        errors.push(
          issue(
            "error",
            "magnet_lip_depth_range",
            "Lip depth must be between 0.4 and 1.5 mm.",
            "magnetLipDepth",
          ),
        );
      }
      if (config.magnetRodClearance < 0.15) {
        warnings.push(
          issue(
            "warning",
            "magnet_rod_chamber_tight",
            "Rod clearance below 0.15 mm may pinch the magnet inside the channel on some printers.",
            "magnetRodClearance",
          ),
        );
      }
    } else {
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
    if (layout.magnetRoofZ > config.bodyHeight - config.edgeBevel) {
      errors.push(
        issue(
          "error",
          "magnet_roof_high",
          "The support-free magnet roof does not fit below the top bevel. Increase body height or use smaller magnets.",
          config.magnetMode === "captive"
            ? "magnetRodDiameter"
            : "magnetDiameter",
        ),
      );
    }
    if (layout.magnetSocketDepth + 1.2 > config.rimWidth) {
      errors.push(
        issue(
          "error",
          "magnet_back_wall_thin",
          "Leave at least 1.2 mm behind each magnet socket. Increase rim width or reduce the socket depth.",
          config.magnetMode === "captive" ? "magnetLipDepth" : "magnetDepth",
        ),
      );
    }
    const outermostSocket =
      config.magnetMode === "captive"
        ? layout.magnetSocketDiameter / 2
        : (config.magnetMode === "paired" ? layout.pairedMagnetOffset : 0) +
          layout.magnetSocketDiameter / 2;
    if (outermostSocket > layout.sideLength / 2 - 4) {
      errors.push(
        issue(
          "error",
          "magnet_pair_crowded",
          "The magnet sockets are too close to the hex corners for this tile size.",
          config.magnetMode === "captive"
            ? "magnetRodLength"
            : "magnetDiameter",
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
    if (
      config.cardSlotCount > 1 &&
      config.cardSlotSpacing - config.cardSlotWidth < 1
    ) {
      errors.push(
        issue(
          "error",
          "slot_walls_thin",
          "Leave at least 1 mm of material between neighbouring card slots.",
          "cardSlotSpacing",
        ),
      );
    }

    const pocketCorners = cardSlotPlan(config)
      .filter((slot) => !slot.isThrough)
      .flatMap((slot) =>
        [-1, 1].flatMap((sideX) =>
          [-1, 1].map((sideY) => ({
            x: slot.offset + (sideX * config.cardSlotWidth) / 2,
            y: (sideY * config.cardSlotLength) / 2,
          })),
        ),
      );
    if (
      pocketCorners.some(
        (corner) => insetFromTopOutline(config, corner.x, corner.y) < 1.2,
      )
    ) {
      errors.push(
        issue(
          "error",
          "slot_outside_tile",
          "A card slot reaches the sloped tile edge. Shorten the slots or reduce the count or spacing.",
          "cardSlotLength",
        ),
      );
    }

    const channels = throughChannels(config);
    const requestedThrough = Math.round(config.cardSlotThroughCount);
    if (
      !Number.isInteger(config.cardSlotThroughCount) ||
      config.cardSlotThroughCount < 0 ||
      config.cardSlotThroughCount > config.cardSlotCount
    ) {
      errors.push(
        issue(
          "error",
          "through_count_range",
          "Through channels must be between 0 and the card slot count.",
          "cardSlotThroughCount",
        ),
      );
    } else if (channels.length !== requestedThrough) {
      warnings.push(
        issue(
          "warning",
          "through_count_rounded",
          `Through channels are cut in symmetric pairs, so ${String(channels.length)} of the ${String(requestedThrough)} requested slots run edge to edge.`,
          "cardSlotThroughCount",
        ),
      );
    }
  }

  if (config.purpose === "deck") {
    if (
      !Number.isInteger(config.deckCapacity) ||
      config.deckCapacity < 20 ||
      config.deckCapacity > 200
    ) {
      errors.push(
        issue(
          "error",
          "deck_capacity_range",
          "A cradle holds between 20 and 200 cards.",
          "deckCapacity",
        ),
      );
    }
    if (!finiteInRange(config.deckCardThickness, 0.25, 0.9)) {
      errors.push(
        issue(
          "error",
          "deck_thickness_range",
          "Card thickness must be between 0.25 and 0.9 mm. Unsleeved is about 0.32, single-sleeved 0.5, double-sleeved 0.7.",
          "deckCardThickness",
        ),
      );
    }
    if (
      !Number.isInteger(config.deckSlotCount) ||
      config.deckSlotCount < 1 ||
      config.deckSlotCount > 2
    ) {
      errors.push(
        issue(
          "error",
          "deck_slot_count_range",
          "A deck tile holds one or two cradles.",
          "deckSlotCount",
        ),
      );
    }
    if (!finiteInRange(config.deckSlotDepth, 5, 26)) {
      errors.push(
        issue(
          "error",
          "deck_depth_range",
          "Cradle depth must be between 5 and 26 mm.",
          "deckSlotDepth",
        ),
      );
    } else if (config.deckSlotDepth > config.bodyHeight - 3) {
      errors.push(
        issue(
          "error",
          "deck_floor_thin",
          "Leave at least 3 mm of floor below the cradle.",
          "deckSlotDepth",
        ),
      );
    } else if (config.deckSlotDepth < 8) {
      warnings.push(
        issue(
          "warning",
          "deck_cradle_shallow",
          "Below 8 mm the cradle holds little of the deck, so a full stack can topple.",
          "deckSlotDepth",
        ),
      );
    }
    if (
      config.isDeckCounterWellEnabled &&
      layout.deckWellInset + 10 > layout.innerAcrossFlats / Math.sqrt(3)
    ) {
      warnings.push(
        issue(
          "warning",
          "deck_wells_crowded",
          "The cradles leave no room for corner wells, so this tile prints without them.",
          "isDeckCounterWellEnabled",
        ),
      );
    }
  }

  if (config.purpose === "rolling") {
    if (!finiteInRange(config.rollDepth, 6, 26)) {
      errors.push(
        issue(
          "error",
          "roll_depth_range",
          "Rolling depth must be between 6 and 26 mm.",
          "rollDepth",
        ),
      );
    } else if (config.rollDepth > config.bodyHeight - config.floorThickness) {
      errors.push(
        issue(
          "error",
          "roll_floor_thin",
          "Rolling depth must leave the configured floor thickness below it.",
          "rollDepth",
        ),
      );
    }
    if (!finiteInRange(config.rollCornerRadius, 1.5, 20)) {
      errors.push(
        issue(
          "error",
          "roll_corner_range",
          "Corner rounding must be between 1.5 and 20 mm.",
          "rollCornerRadius",
        ),
      );
    }
    if (!finiteInRange(config.rollFloorFillet, 0.5, 8)) {
      errors.push(
        issue(
          "error",
          "roll_fillet_range",
          "Floor fillet must be between 0.5 and 8 mm.",
          "rollFloorFillet",
        ),
      );
    } else if (config.rollFloorFillet > config.rollDepth - 2) {
      errors.push(
        issue(
          "error",
          "roll_fillet_deep",
          "Leave at least 2 mm of straight wall above the floor fillet.",
          "rollFloorFillet",
        ),
      );
    }
    if (!finiteInRange(config.rollWallDraft, 0, 12)) {
      errors.push(
        issue(
          "error",
          "roll_draft_range",
          "Wall draft must be between 0 and 12 degrees.",
          "rollWallDraft",
        ),
      );
    }
    if (config.rollCornerRadius - layout.rollFloorInset < 0.5) {
      errors.push(
        issue(
          "error",
          "roll_corner_pinched",
          "The draft and floor fillet eat the whole corner rounding. Increase the corner radius or reduce the fillet or draft.",
          "rollCornerRadius",
        ),
      );
    }
    if (layout.rollFloorAcrossFlats < 40) {
      errors.push(
        issue(
          "error",
          "roll_floor_small",
          "The rolling floor drops below 40 mm across. Widen the tile or narrow the rim.",
          "rimWidth",
        ),
      );
    }
    if (layout.rollFloorAcrossFlats < 60) {
      warnings.push(
        issue(
          "warning",
          "roll_floor_tight",
          `A ${layout.rollFloorAcrossFlats.toFixed(1)} mm floor is cramped for rolling more than a couple of dice.`,
          "acrossFlats",
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

  const channels = throughChannels(config);
  if (channels.length > 0) {
    const isDeck = config.purpose === "deck";
    const spanField = isDeck ? "deckCapacity" : "cardSlotThroughCount";
    const depthField = isDeck ? "deckSlotDepth" : "cardSlotDepth";
    const spanFix = isDeck
      ? "Reduce the capacity, drop to one cradle, or widen the tile."
      : "Reduce the slot spacing or the number of channels.";
    const outermost = Math.max(
      ...channels.map((channel) => Math.max(-channel.min, channel.max)),
    );
    if (outermost > layout.topFlatHalfSpan - 1) {
      errors.push(
        issue(
          "error",
          "through_channel_off_flat",
          `Through channels must stay within the flat edges so neighbouring tiles line up. ${spanFix}`,
          spanField,
        ),
      );
    }
    if (layout.channelFloorZ < config.edgeBevel + 1) {
      errors.push(
        issue(
          "error",
          "through_channel_deep",
          "Through channels must leave at least 1 mm of wall above the bottom bevel. Make them shallower.",
          depthField,
        ),
      );
    }
    // The channel floor steps up over the magnet sockets. That shelf is part of
    // the design and stays quiet: it only earns a word once it reaches further
    // in than the cards standing on it.
    if (layout.channelLedgeReach > 0) {
      if (layout.channelEdgeFloorZ > layout.topHeight - 2) {
        errors.push(
          issue(
            "error",
            "through_channel_hits_magnet",
            `The magnet sockets leave under 2 mm of channel at the tile edge. ${spanFix} Smaller magnets or a raised base also clear them.`,
            spanField,
          ),
        );
      } else if (isDeck && layout.channelClearSpan < STANDARD_CARD_LENGTH) {
        warnings.push(
          issue(
            "warning",
            "through_channel_shelf",
            `Only ${layout.channelClearSpan.toFixed(1)} mm of the cradle is at full depth, short of the ${String(STANDARD_CARD_LENGTH)} mm a sleeved card needs, so decks rest on the shelf over the magnet sockets. Thinner magnets, a wider tile, or a raised base give it back.`,
            spanField,
          ),
        );
      }
    }
    if (
      layout.northMarkerCenterX === null &&
      (config.magnetMode === "single" || config.magnetMode === "captive")
    ) {
      warnings.push(
        issue(
          "warning",
          "north_marker_crowded",
          "The through channels leave no rim space for the orientation dot, so this tile prints without one.",
          spanField,
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
