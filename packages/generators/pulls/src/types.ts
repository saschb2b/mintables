export type PullStyle = "knob" | "tab" | "arc";

/**
 * How the pull attaches to the drawer or lid.
 *
 *   "screws" - knob and arc get blind pilot bores entered from the mount
 *              face (screwed on from behind the drawer front); the tab gets
 *              countersunk through-holes (screwed down into the lid).
 *   "glue"   - solid mount face, no holes.
 */
export type PullMount = "screws" | "glue";

export type KnobHeadShape = "dome" | "flat" | "dished";

export type TabTipStyle = "rounded" | "square";

export type ArcBarProfile = "round" | "flat";

interface BasePullConfig {
  mount: PullMount;
  /**
   * Screw hole diameter in mm. For knob and arc this is the pilot bore the
   * screw threads itself into (about 0.5 mm under the screw's outer
   * diameter); for the tab it is the shank clearance hole.
   */
  screwDiameter: number;
}

export interface KnobPullConfig extends BasePullConfig {
  style: "knob";
  /** Top silhouette: rounded dome, flat with a soft edge, or a finger dish. */
  headShape: KnobHeadShape;
  /** Widest grip diameter in mm. */
  headDiameter: number;
  /** Height of the head section, including its 45-degree underside cone. */
  headHeight: number;
  /** Waist diameter under the head. Equal to the head gives a cylinder knob. */
  neckDiameter: number;
  /** Height of the waist section. 0 puts the head straight on the base. */
  neckHeight: number;
  /** Mounting flange diameter against the furniture face. */
  baseDiameter: number;
  /** Mounting flange height. */
  baseHeight: number;
  /** Number of grip rings cut around the head side. 0 keeps it smooth. */
  gripGrooves: number;
  /** Radial depth of each grip ring in mm. */
  gripGrooveDepth: number;
  /** Blind pilot bore depth up from the mount face (mount = screws). */
  screwHoleDepth: number;
}

export interface TabPullConfig extends BasePullConfig {
  style: "tab";
  /** Strip width in mm, shared by the base plate and the blade. */
  width: number;
  /** Flat run that lies on the lid, measured up to the bend. */
  baseLength: number;
  /** Length of the angled blade past the bend, along its face. */
  tabLength: number;
  /** Strip thickness in mm. */
  thickness: number;
  /** Blade angle above the surface in degrees (10 to 90). */
  tabAngle: number;
  /** Inner bend radius at the elbow. */
  bendRadius: number;
  /** Blade end: a half-round edge or a square cut. */
  tipStyle: TabTipStyle;
  /** Countersunk screws through the flat run (mount = screws): 1 or 2. */
  screwCount: number;
  /** Screw head diameter for the 90-degree countersink. */
  screwHeadDiameter: number;
}

export interface ArcPullConfig extends BasePullConfig {
  style: "arc";
  /**
   * Center-to-center distance between the two mounting holes in mm. This is
   * the standard drawer-pull dimension (64, 96, 128, ...), held exactly.
   */
  holeSpacing: number;
  /** Height of the bar centerline apex above the mount face. */
  rise: number;
  /** Bar cross-section: round, or a flat rounded rectangle. */
  barProfile: ArcBarProfile;
  /** Bar diameter for the round profile. */
  barDiameter: number;
  /** Flat profile: bar width across the front (out of the arc plane). */
  barWidth: number;
  /** Flat profile: bar depth in the arc plane (the grab thickness). */
  barDepth: number;
  /** Blind pilot bore depth up into each foot (mount = screws). */
  screwHoleDepth: number;
}

export type PullConfig = KnobPullConfig | TabPullConfig | ArcPullConfig;

export const DEFAULT_KNOB_PULL: KnobPullConfig = {
  style: "knob",
  mount: "screws",
  screwDiameter: 3.2,
  headShape: "dome",
  headDiameter: 32,
  headHeight: 14,
  neckDiameter: 14,
  neckHeight: 8,
  baseDiameter: 22,
  baseHeight: 4,
  gripGrooves: 0,
  gripGrooveDepth: 0.6,
  screwHoleDepth: 12,
};

export const DEFAULT_TAB_PULL: TabPullConfig = {
  style: "tab",
  mount: "screws",
  screwDiameter: 3.5,
  width: 22,
  baseLength: 30,
  tabLength: 22,
  thickness: 3,
  tabAngle: 35,
  bendRadius: 3,
  tipStyle: "rounded",
  screwCount: 2,
  screwHeadDiameter: 7,
};

export const DEFAULT_ARC_PULL: ArcPullConfig = {
  style: "arc",
  mount: "screws",
  screwDiameter: 4,
  holeSpacing: 96,
  rise: 32,
  barProfile: "round",
  barDiameter: 11,
  barWidth: 13,
  barDepth: 8,
  screwHoleDepth: 12,
};

/** The studio pre-fills with the knob: the most common pull. */
export const DEFAULT_PULL_CONFIG: PullConfig = DEFAULT_KNOB_PULL;

/** Grab depth of the arc bar in the arc plane, regardless of profile. */
export function arcBarDepth(config: ArcPullConfig): number {
  return config.barProfile === "round" ? config.barDiameter : config.barDepth;
}

/** Bar dimension out of the arc plane, regardless of profile. */
export function arcBarWidth(config: ArcPullConfig): number {
  return config.barProfile === "round" ? config.barDiameter : config.barWidth;
}
