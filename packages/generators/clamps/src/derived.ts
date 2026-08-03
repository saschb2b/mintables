import type { ClampConfig } from "./types";

/** The throat lean is derived from the requested mouth interference. */
const MAX_THROAT_LEAN_RAD = (20 * Math.PI) / 180;

const ROOT_TAPER_START_RAD = (105 * Math.PI) / 180;
const ROOT_TAPER_END_RAD = (150 * Math.PI) / 180;

function clampNum(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function smoothstep(value: number): number {
  const t = clampNum(value, 0, 1);
  return t * t * (3 - 2 * t);
}

/**
 * Radial jaw thickness at an angle measured from straight up. The upper
 * arm stays flexible, then grows smoothly into the reinforced root.
 */
export function armThicknessAtAngle(
  config: ClampConfig,
  angle: number,
): number {
  const twoPi = 2 * Math.PI;
  const wrapped = ((angle % twoPi) + twoPi) % twoPi;
  const folded = wrapped <= Math.PI ? wrapped : twoPi - wrapped;
  const blend = smoothstep(
    (folded - ROOT_TAPER_START_RAD) /
      (ROOT_TAPER_END_RAD - ROOT_TAPER_START_RAD),
  );
  return (
    config.armThickness +
    (Math.max(config.armThickness, config.rootThickness) -
      config.armThickness) *
      blend
  );
}

/**
 * Quantities shared by geometry, validation, spec, and the scene. Everything
 * is derived from the config; nothing here is user state.
 */
export interface ClampDerived {
  /** Bore radius (rod + clearance) / 2. */
  boreRadius: number;
  /** Outer radius of the arm ring: bore + arm thickness. */
  outerRadius: number;
  /** Largest root radius after the arm taper reaches full thickness. */
  maxOuterRadius: number;
  /** Radius of the arm centerline, where the throat and tips attach. */
  armCenterRadius: number;
  /** Radius of the tip circle (bulb or half-round cap). */
  tipRadius: number;
  /**
   * Half-angle of the seat opening, in radians from straight up: where the
   * arms leave the bore circle. Set by the wrap angle.
   */
  mouthHalfAngle: number;
  /**
   * True when the throat is deep enough to actually build: at least the
   * bulb's tangent length plus a margin. Below that the tips sit directly
   * on the seat circle and the throat depth is ignored.
   */
  usesThroat: boolean;
  /** Inward lean of the throat walls (radians from vertical). */
  throatLean: number;
  /** Horizontal distance from the mouth centerline to each tip center. */
  tipCenterU: number;
  /** Height of the tip centers above the bore axis. */
  tipCenterRise: number;
  /**
   * Clear width of the entry between the two tips (mm). The rod has to
   * squeeze past this to snap in.
   */
  mouthOpening: number;
  /**
   * rodDiameter minus mouthOpening (mm). Positive means the clamp retains
   * the rod; each arm must flex outward by half of this during snap-on.
   */
  snapInterference: number;
  /**
   * Rough peak bending strain in the arm during snap-on, treating each arm
   * as a straight cantilever of its unrolled length (seat arc plus throat).
   * Order-of-magnitude guidance only: PLA cracks around 0.02 to 0.03, PETG
   * and ASA manage roughly 0.04, nylons go beyond 0.05.
   */
  flexStrain: number;
  /** Height of the bore axis above the bed (mm). 0 for the clip mount. */
  boreCenterZ: number;
  /** Height of the top of the tips above the bore axis (mm). */
  profileTop: number;
}

export function deriveClamp(config: ClampConfig): ClampDerived {
  const boreRadius = Math.max(
    0.5,
    (config.rodDiameter + config.fitClearance) / 2,
  );
  const arm = Math.max(0.4, config.armThickness);
  const root = Math.max(arm, config.rootThickness);
  const outerRadius = boreRadius + arm;
  const maxOuterRadius = boreRadius + root;
  const armCenterRadius = boreRadius + arm / 2;
  const tipRadius =
    config.tipStyle === "bulb"
      ? Math.max(arm / 2, (config.bulbScale * arm) / 2)
      : arm / 2;

  const mouthHalfAngle = Math.min(
    (88 * Math.PI) / 180,
    Math.max(
      (4 * Math.PI) / 180,
      (((360 - config.wrapAngle) / 2) * Math.PI) / 180,
    ),
  );

  // The bulb meets the throat walls sqrt(rb^2 - (t/2)^2) below its center;
  // the throat must be at least that deep to exist as a straight segment.
  const bulbTangent = Math.sqrt(
    Math.max(0, tipRadius * tipRadius - (arm / 2) * (arm / 2)),
  );
  const throat = Math.max(0, config.throatDepth);
  const usesThroat = throat >= bulbTangent + 0.5;

  const seatU = armCenterRadius * Math.sin(mouthHalfAngle);
  const seatRise = armCenterRadius * Math.cos(mouthHalfAngle);
  const requestedMouth = Math.max(
    0,
    config.rodDiameter - config.snapInterference,
  );
  const requestedTipU = requestedMouth / 2 + tipRadius;
  const requiredLean =
    throat > 0
      ? Math.asin(clampNum((seatU - requestedTipU) / throat, -1, 1))
      : 0;
  const throatLean = usesThroat
    ? clampNum(requiredLean, -MAX_THROAT_LEAN_RAD, MAX_THROAT_LEAN_RAD)
    : Math.min(MAX_THROAT_LEAN_RAD, (Math.PI / 2 - mouthHalfAngle) / 2);

  const tipCenterU = usesThroat ? seatU - throat * Math.sin(throatLean) : seatU;
  const tipCenterRise = usesThroat
    ? seatRise + throat * Math.cos(throatLean)
    : seatRise;

  const mouthOpening = Math.max(0, 2 * (tipCenterU - tipRadius));
  const snapInterference = config.rodDiameter - mouthOpening;

  // Each arm runs from its root at the bottom of the C, around the seat,
  // and up the throat to the tip.
  const armLength =
    armCenterRadius * ((config.wrapAngle / 2) * (Math.PI / 180)) +
    (usesThroat ? throat : 0);
  const deflection = Math.max(0, snapInterference / 2);
  const flexStrain =
    armLength > 0.1 ? (3 * arm * deflection) / (2 * armLength * armLength) : 0;

  const boreCenterZ =
    config.mount === "plate"
      ? config.baseThickness + config.standoff + boreRadius
      : 0;

  const profileTop = tipCenterRise + tipRadius;

  return {
    boreRadius,
    outerRadius,
    maxOuterRadius,
    armCenterRadius,
    tipRadius,
    mouthHalfAngle,
    usesThroat,
    throatLean,
    tipCenterU,
    tipCenterRise,
    mouthOpening,
    snapInterference,
    flexStrain,
    boreCenterZ,
    profileTop,
  };
}
