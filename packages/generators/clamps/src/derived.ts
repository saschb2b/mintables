import type { ClampConfig } from "./types";

/** The throat's inward lean is derived, capped so it stays gentle. */
const MAX_THROAT_LEAN_RAD = (8 * Math.PI) / 180;

/**
 * Quantities shared by geometry, validation, spec, and the scene. Everything
 * is derived from the config; nothing here is user state.
 */
export interface ClampDerived {
  /** Bore radius (rod + clearance) / 2. */
  boreRadius: number;
  /** Outer radius of the arm ring: bore + arm thickness. */
  outerRadius: number;
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
  const outerRadius = boreRadius + arm;
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

  const throatLean = Math.min(
    MAX_THROAT_LEAN_RAD,
    (Math.PI / 2 - mouthHalfAngle) / 2,
  );

  const seatU = armCenterRadius * Math.sin(mouthHalfAngle);
  const seatRise = armCenterRadius * Math.cos(mouthHalfAngle);
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
