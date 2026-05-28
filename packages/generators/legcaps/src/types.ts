export type LegCapShape = "round" | "square" | "rectangular" | "oval";

interface BaseLegCapConfig {
  /**
   * Wall thickness in mm — the material around the leg between the inner
   * socket and the outer surface.
   */
  wallThickness: number;
  /**
   * Socket height in mm — how far up the leg the cap reaches. Measured from
   * the top of the floor, so the total cap height is `floorThickness + capHeight`.
   */
  capHeight: number;
  /**
   * Floor thickness in mm — the closed bottom of the cap, which is what
   * touches the ground in use.
   */
  floorThickness: number;
  /**
   * Slip-fit clearance added to every inner dimension (mm). 0 means the
   * socket is sized exactly to the entered leg measurements; positive values
   * loosen the fit. Diameter for round, edge length for square/rect/oval.
   */
  fitClearance: number;
  /**
   * When true, the inner socket tapers so it grips tighter near the floor.
   * Inner dimensions at the opening = nominal + clearance; at the floor they
   * shrink by `innerTaper`. The leg slides in until friction stops it.
   */
  innerTaperEnabled: boolean;
  /**
   * Total inward taper applied between the top of the socket and the floor.
   * Acts as a diametric/edge reduction — the socket narrows by this much
   * across its full height. Capped by validation to a fraction of the wall.
   */
  innerTaper: number;
  /**
   * When true, a shallow recess is cut into the floor's outer face so a felt
   * pad sits flush. The recess is the cap's footprint inset by `feltInset`.
   */
  feltRecessEnabled: boolean;
  /**
   * Inset from the cap's outer perimeter to the recess perimeter (mm). Sets
   * how much "rim" remains around the felt pad.
   */
  feltInset: number;
  /**
   * Recess depth into the floor (mm). Bounded by validation to a safe
   * fraction of the floor thickness so the bottom doesn't print as a film.
   */
  feltDepth: number;
}

export interface RoundLegCapConfig extends BaseLegCapConfig {
  shape: "round";
  /** Diameter of the leg in mm — the value the user measured with a caliper. */
  innerDiameter: number;
}

export interface SquareLegCapConfig extends BaseLegCapConfig {
  shape: "square";
  /** Edge length of the square leg cross-section in mm. */
  innerSize: number;
  /**
   * Outer corner radius in mm. The inner corners follow the outer ones with
   * the wall thickness subtracted.
   */
  cornerRadius: number;
}

export interface RectangularLegCapConfig extends BaseLegCapConfig {
  shape: "rectangular";
  /** Leg width in mm (the longer edge by convention; not enforced). */
  innerWidth: number;
  /** Leg depth in mm (the shorter edge by convention). */
  innerHeight: number;
  /** Outer corner radius in mm. */
  cornerRadius: number;
}

export interface OvalLegCapConfig extends BaseLegCapConfig {
  shape: "oval";
  /** Major-axis length of the oval leg in mm. */
  innerWidth: number;
  /** Minor-axis length of the oval leg in mm. */
  innerHeight: number;
}

export type LegCapConfig =
  | RoundLegCapConfig
  | SquareLegCapConfig
  | RectangularLegCapConfig
  | OvalLegCapConfig;

export const DEFAULT_ROUND_LEGCAP: RoundLegCapConfig = {
  shape: "round",
  innerDiameter: 25,
  wallThickness: 2,
  capHeight: 20,
  floorThickness: 2,
  fitClearance: 0.4,
  innerTaperEnabled: false,
  innerTaper: 0.4,
  feltRecessEnabled: false,
  feltInset: 2,
  feltDepth: 1,
};

export const DEFAULT_SQUARE_LEGCAP: SquareLegCapConfig = {
  shape: "square",
  innerSize: 25,
  cornerRadius: 2,
  wallThickness: 2,
  capHeight: 20,
  floorThickness: 2,
  fitClearance: 0.4,
  innerTaperEnabled: false,
  innerTaper: 0.4,
  feltRecessEnabled: false,
  feltInset: 2,
  feltDepth: 1,
};

export const DEFAULT_RECTANGULAR_LEGCAP: RectangularLegCapConfig = {
  shape: "rectangular",
  innerWidth: 40,
  innerHeight: 20,
  cornerRadius: 2,
  wallThickness: 2,
  capHeight: 20,
  floorThickness: 2,
  fitClearance: 0.4,
  innerTaperEnabled: false,
  innerTaper: 0.4,
  feltRecessEnabled: false,
  feltInset: 2,
  feltDepth: 1,
};

export const DEFAULT_OVAL_LEGCAP: OvalLegCapConfig = {
  shape: "oval",
  innerWidth: 40,
  innerHeight: 20,
  wallThickness: 2,
  capHeight: 20,
  floorThickness: 2,
  fitClearance: 0.4,
  innerTaperEnabled: false,
  innerTaper: 0.4,
  feltRecessEnabled: false,
  feltInset: 2,
  feltDepth: 1,
};

/** The default the studio pre-fills with — round is the most common leg. */
export const DEFAULT_LEGCAP_CONFIG: LegCapConfig = DEFAULT_ROUND_LEGCAP;

/**
 * Outer bounding box on the print bed. Round caps are square in their
 * bounding box; the rest match their natural width/height plus 2×wall.
 * Used for camera framing and dimension callouts.
 */
export function outerBounds(config: LegCapConfig): {
  width: number;
  height: number;
} {
  const w2 = config.wallThickness * 2;
  switch (config.shape) {
    case "round":
      return { width: config.innerDiameter + w2, height: config.innerDiameter + w2 };
    case "square":
      return { width: config.innerSize + w2, height: config.innerSize + w2 };
    case "rectangular":
    case "oval":
      return {
        width: config.innerWidth + w2,
        height: config.innerHeight + w2,
      };
  }
}
