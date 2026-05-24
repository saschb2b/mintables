export type TubeShape = "round" | "square" | "rectangular";
export type CutType = "flat" | "miter" | "saddle" | "chamfer";

export interface MiterCutConfig {
  type: "miter";
  angle: number; // Angle in degrees (0-60)
}

export interface SaddleCutConfig {
  type: "saddle";
  targetDiameter: number; // Diameter of the pipe this will connect to
  angle: number; // Angle of intersection (typically 90 for T-joint)
}

export interface FlatCutConfig {
  type: "flat";
}

export interface ChamferCutConfig {
  type: "chamfer";
  angle: number; // Chamfer angle in degrees (typically 45)
  depth: number; // How far the chamfer extends inward
}

export type EndCutConfig =
  | FlatCutConfig
  | MiterCutConfig
  | SaddleCutConfig
  | ChamferCutConfig;

export interface FlareConfig {
  enabled: boolean;
  diameter: number;
  width: number;
  height: number;
  length: number;
  // New press-fit specific options
  clearance: number; // Radial clearance for fit tolerance
  fitType: "loose" | "snug" | "interference";
  leadInChamfer: boolean; // Auto chamfer on flare opening
  leadInAngle: number; // Chamfer angle
  stopShoulder: boolean; // Internal step for consistent seating
  stopDepth: number; // Depth of the stop shoulder
  antiRotation: boolean; // Flat/key to prevent spinning
  antiRotationType: "flat" | "key" | "notch";
}

export interface ClamshellConfig {
  enabled: boolean;
  overlap: number; // Degrees of arc the step joint extends past the split plane
  clearance: number; // Gap between overlapping surfaces for fit tolerance
  separation: number; // Gap between the two halves in the STL output
  snapLipHeight: number; // Height of snap lip detent for retention (mm)
}

export interface HoleConfig {
  enabled: boolean;
  count: number;
  diameter: number;
  positionAlongLength: number; // percentage 0-100
  rotationOffset: number; // degrees
}

export interface DrainHoleConfig {
  enabled: boolean;
  diameter: number;
}

export interface ZipTieSlotConfig {
  enabled: boolean;
  width: number;
  height: number;
  positionAlongLength: number; // percentage 0-100
}

export interface HolesAndSlotsConfig {
  sideHoles: HoleConfig;
  drainHole: DrainHoleConfig;
  zipTieSlots: ZipTieSlotConfig;
}

export type ConnectorMode = "none" | "coupler" | "reducer" | "male-female";

export interface CouplerConfig {
  length: number;
  wallThickness: number;
}

export interface ReducerConfig {
  targetInnerDiameter: number;
  targetOuterDiameter: number;
  transitionLength: number;
}

export interface ConnectorConfig {
  mode: ConnectorMode;
  coupler: CouplerConfig;
  reducer: ReducerConfig;
}

interface BaseTubeConfig {
  length: number;
  flare: FlareConfig;
  topCut: EndCutConfig;
  bottomCut: EndCutConfig;
  holes: HolesAndSlotsConfig;
  connector: ConnectorConfig;
  clamshell: ClamshellConfig;
}

export interface RoundTubeConfig extends BaseTubeConfig {
  shape: "round";
  innerDiameter: number;
  outerDiameter: number;
}

export interface SquareTubeConfig extends BaseTubeConfig {
  shape: "square";
  innerSize: number;
  outerSize: number;
  cornerRadius: number;
}

export interface RectangularTubeConfig extends BaseTubeConfig {
  shape: "rectangular";
  innerWidth: number;
  innerHeight: number;
  outerWidth: number;
  outerHeight: number;
  cornerRadius: number;
}

export type TubeConfig =
  | RoundTubeConfig
  | SquareTubeConfig
  | RectangularTubeConfig;

// Legacy type alias for backwards compatibility
export type TopCutConfig = EndCutConfig;
export type TopCutType = CutType;

export const FLARE_FIT_CLEARANCE: Record<
  FlareConfig["fitType"],
  number
> = {
  loose: 0.3,
  snug: 0.15,
  interference: -0.05,
};

export const DEFAULT_FLARE: FlareConfig = {
  enabled: false,
  diameter: 55,
  width: 55,
  height: 55,
  length: 15,
  clearance: 0.2,
  fitType: "snug",
  leadInChamfer: true,
  leadInAngle: 45,
  stopShoulder: false,
  stopDepth: 2,
  antiRotation: false,
  antiRotationType: "flat",
};

export const DEFAULT_CUT: EndCutConfig = {
  type: "flat",
};

export const DEFAULT_HOLES: HolesAndSlotsConfig = {
  sideHoles: {
    enabled: false,
    count: 2,
    diameter: 5,
    positionAlongLength: 50,
    rotationOffset: 0,
  },
  drainHole: {
    enabled: false,
    diameter: 3,
  },
  zipTieSlots: {
    enabled: false,
    width: 4,
    height: 2,
    positionAlongLength: 25,
  },
};

export const DEFAULT_CONNECTOR: ConnectorConfig = {
  mode: "none",
  coupler: {
    length: 30,
    wallThickness: 2,
  },
  reducer: {
    targetInnerDiameter: 40,
    targetOuterDiameter: 42,
    transitionLength: 20,
  },
};

export const DEFAULT_CLAMSHELL: ClamshellConfig = {
  enabled: false,
  overlap: 8,
  clearance: 0.2,
  separation: 5,
  snapLipHeight: 0.3,
};

export const DEFAULT_ROUND_CONFIG: RoundTubeConfig = {
  shape: "round",
  innerDiameter: 50,
  outerDiameter: 52,
  length: 100,
  flare: { ...DEFAULT_FLARE },
  topCut: { ...DEFAULT_CUT },
  bottomCut: { ...DEFAULT_CUT },
  holes: { ...DEFAULT_HOLES },
  connector: { ...DEFAULT_CONNECTOR },
  clamshell: { ...DEFAULT_CLAMSHELL },
};

export const DEFAULT_SQUARE_CONFIG: SquareTubeConfig = {
  shape: "square",
  innerSize: 50,
  outerSize: 52,
  length: 100,
  cornerRadius: 2,
  flare: { ...DEFAULT_FLARE },
  topCut: { ...DEFAULT_CUT },
  bottomCut: { ...DEFAULT_CUT },
  holes: { ...DEFAULT_HOLES },
  connector: { ...DEFAULT_CONNECTOR },
  clamshell: { ...DEFAULT_CLAMSHELL },
};

export const DEFAULT_RECTANGULAR_CONFIG: RectangularTubeConfig = {
  shape: "rectangular",
  innerWidth: 50,
  innerHeight: 75,
  outerWidth: 52,
  outerHeight: 77,
  length: 100,
  cornerRadius: 2,
  flare: { ...DEFAULT_FLARE },
  topCut: { ...DEFAULT_CUT },
  bottomCut: { ...DEFAULT_CUT },
  holes: { ...DEFAULT_HOLES },
  connector: { ...DEFAULT_CONNECTOR },
  clamshell: { ...DEFAULT_CLAMSHELL },
};
