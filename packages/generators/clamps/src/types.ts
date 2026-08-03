/** How the snap arms end at the mouth of the clamp. */
export type ClampTipStyle = "bulb" | "plain";

/** How the clamp attaches to the world. */
export type ClampMount = "plate" | "clip";

/** Screw head treatment for the base plate holes. */
export type ClampScrewRecess = "counterbore" | "countersink" | "plain";

export interface ClampConfig {
  /**
   * Diameter of the rod, tube, or bar the clamp snaps onto (mm) - the value
   * measured with calipers. The bore is this plus `fitClearance`.
   */
  rodDiameter: number;
  /**
   * Added to the bore diameter (mm). 0 grips exactly at the measured size,
   * positive values let the rod rotate freely, small negative values make
   * the clamp squeeze the rod.
   */
  fitClearance: number;
  /**
   * How far around the rod the circular seat wraps, in degrees. The arms
   * leave the bore circle at this angle and continue up the throat. The
   * scanned original sits around 225.
   */
  wrapAngle: number;
  /**
   * Length of the straight throat above the seat (mm): the arms extend
   * past the circle, leaning slightly inward, before ending in the tips.
   * This is what makes the clamp grab deep around the rod instead of
   * clipping onto its top half. 0 puts the tips directly on the seat.
   */
  throatDepth: number;
  /** Radial thickness of the snap arms (mm). */
  armThickness: number;
  /**
   * Width of the jaw along the rod axis (mm) - the "make it a smidge wider"
   * knob. Wider jaws grip more rod and spread the load.
   */
  jawWidth: number;
  /**
   * Tip treatment. "bulb" ends each arm in an oversized rounded ball that
   * acts as the snap catch and insertion ramp; "plain" ends the arm in a
   * flush half-round of the arm thickness.
   */
  tipStyle: ClampTipStyle;
  /**
   * Bulb diameter as a multiple of the arm thickness (only for tipStyle
   * "bulb"). 1 is flush with the arm; 1.6 matches the scanned original.
   */
  bulbScale: number;

  /** "plate" is a screw-on base under the jaw; "clip" is the bare C only. */
  mount: ClampMount;
  /** Base plate length along the rod axis (mm). Plate mount only. */
  baseLength: number;
  /** Base plate width across the rod (mm). Plate mount only. */
  baseWidth: number;
  /** Base plate thickness (mm). Plate mount only. */
  baseThickness: number;
  /**
   * Gap between the top of the base plate and the lowest point of the bore
   * (mm) - how far the rod floats above the plate.
   */
  standoff: number;
  /**
   * Width of the neck that carries the jaw down to the plate (mm). The neck
   * flares slightly where it meets the plate for strength.
   */
  neckWidth: number;
  /**
   * Center-to-center distance between the two screw holes (mm), measured
   * along the rod axis. Match this to the holes in whatever the clamp
   * screws onto.
   */
  holeSpacing: number;
  /** Screw shank clearance hole diameter (mm). 4.5 clears an M4. */
  screwDiameter: number;
  /** Recess style for the screw head. */
  screwRecess: ClampScrewRecess;
  /** Screw head diameter (mm). Used by counterbore and countersink. */
  headDiameter: number;
  /** Counterbore depth (mm). Counterbore recess only. */
  headDepth: number;
}

/**
 * Defaults reproduce the scanned motorbike shield clamp: an 18 mm rod,
 * a 225 degree seat with a 4 mm throat and bulb tips, on a 32 x 15
 * stadium plate with two M4 counterbored holes.
 */
export const DEFAULT_CLAMP_CONFIG: ClampConfig = {
  rodDiameter: 18,
  fitClearance: 0.2,
  wrapAngle: 225,
  throatDepth: 4,
  armThickness: 3,
  jawWidth: 8,
  tipStyle: "bulb",
  bulbScale: 1.6,
  mount: "plate",
  baseLength: 32,
  baseWidth: 15,
  baseThickness: 4.5,
  standoff: 5,
  neckWidth: 13,
  holeSpacing: 19,
  screwDiameter: 4.5,
  screwRecess: "counterbore",
  headDiameter: 8.5,
  headDepth: 2.5,
};
