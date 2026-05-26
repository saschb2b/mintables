export type AdapterEndShape = "round" | "square" | "rectangular";
export type FitType = "socket" | "plug";

// The adapter's socket will be calculated from the tube's outer dimensions
export interface RoundTubeSpec {
  shape: "round";
  outerDiameter: number; // The tube's outer diameter
  tubeWallThickness: number; // The tube's wall thickness (needed for plug fit)
}

export interface SquareTubeSpec {
  shape: "square";
  outerSize: number; // The tube's outer size
  cornerRadius: number;
  tubeWallThickness: number;
}

export interface RectangularTubeSpec {
  shape: "rectangular";
  outerWidth: number;
  outerHeight: number;
  cornerRadius: number;
  tubeWallThickness: number;
}

export type TubeSpec = RoundTubeSpec | SquareTubeSpec | RectangularTubeSpec;

export interface AdapterConfig {
  // What tube connects at each end
  endA: TubeSpec;
  endB: TubeSpec;
  endAFit: FitType; // socket = wraps outside tube, plug = fits inside tube
  endBFit: FitType;

  // Adapter body
  wallThickness: number;
  socketDepth: number; // How deep the adapter inserts/receives at each end
  socketClearance: number; // Gap between adapter and tube (0.2mm typical)

  // Elbow settings
  bendAngle: number; // 0 = straight coupling, 45 = 45° elbow, 90 = 90° elbow
  bendRadius: number; // Center-line radius of the bend (0 = auto-calculate)

  segmentAmount: number;
}

// Default configurations
export const DEFAULT_ROUND_TUBE: RoundTubeSpec = {
  shape: "round",
  outerDiameter: 50,
  tubeWallThickness: 2,
};

export const DEFAULT_SQUARE_TUBE: SquareTubeSpec = {
  shape: "square",
  outerSize: 50,
  cornerRadius: 2,
  tubeWallThickness: 2,
};

export const DEFAULT_RECTANGULAR_TUBE: RectangularTubeSpec = {
  shape: "rectangular",
  outerWidth: 50,
  outerHeight: 75,
  cornerRadius: 2,
  tubeWallThickness: 2,
};

export const DEFAULT_ADAPTER_CONFIG: AdapterConfig = {
  endA: { ...DEFAULT_ROUND_TUBE },
  endB: { ...DEFAULT_ROUND_TUBE },
  endAFit: "socket",
  endBFit: "socket",
  wallThickness: 3,
  socketDepth: 20,
  socketClearance: 0.2,
  bendAngle: 0,
  bendRadius: 0,
  segmentAmount: 64,
};

// Helper functions
export function getTubeOuterDimensions(tube: TubeSpec): {
  width: number;
  height: number;
} {
  switch (tube.shape) {
    case "round":
      return { width: tube.outerDiameter, height: tube.outerDiameter };
    case "square":
      return { width: tube.outerSize, height: tube.outerSize };
    case "rectangular":
      return { width: tube.outerWidth, height: tube.outerHeight };
  }
}

// Get the tube's inner dimensions (outer minus wall thickness)
export function getTubeInnerDimensions(tube: TubeSpec): {
  width: number;
  height: number;
} {
  const outer = getTubeOuterDimensions(tube);
  return {
    width: outer.width - tube.tubeWallThickness * 2,
    height: outer.height - tube.tubeWallThickness * 2,
  };
}

// Calculate the socket inner dimensions (tube fits inside adapter)
export function getSocketInnerDimensions(
  tube: TubeSpec,
  clearance: number,
): { width: number; height: number } {
  const outer = getTubeOuterDimensions(tube);
  return {
    width: outer.width + clearance * 2,
    height: outer.height + clearance * 2,
  };
}

// Calculate the adapter outer dimensions for a given end and fit type
export function getAdapterOuterDimensions(
  tube: TubeSpec,
  clearance: number,
  wallThickness: number,
  fitType: FitType = "socket",
): { width: number; height: number } {
  if (fitType === "plug") {
    // Plug: outer surface fits inside the tube's inner bore
    const inner = getTubeInnerDimensions(tube);
    return {
      width: inner.width - clearance * 2,
      height: inner.height - clearance * 2,
    };
  }
  // Socket: outer = tube outer + clearance + wall
  const socketInner = getSocketInnerDimensions(tube, clearance);
  return {
    width: socketInner.width + wallThickness * 2,
    height: socketInner.height + wallThickness * 2,
  };
}

// Calculate the adapter inner dimensions for a given end and fit type
export function getAdapterInnerDimensions(
  tube: TubeSpec,
  clearance: number,
  wallThickness: number,
  fitType: FitType = "socket",
): { width: number; height: number } {
  if (fitType === "plug") {
    // Plug inner = plug outer - wall thickness
    const plugOuter = getAdapterOuterDimensions(
      tube,
      clearance,
      wallThickness,
      "plug",
    );
    return {
      width: plugOuter.width - wallThickness * 2,
      height: plugOuter.height - wallThickness * 2,
    };
  }
  // Socket inner = tube outer + clearance
  return getSocketInnerDimensions(tube, clearance);
}

// Get the effective bend radius (auto-calculate if 0)
export function getEffectiveBendRadius(config: AdapterConfig): number {
  if (config.bendRadius > 0) return config.bendRadius;

  // Auto-calculate: use 1.5x the larger adapter outer dimension
  const dimA = getAdapterOuterDimensions(
    config.endA,
    config.socketClearance,
    config.wallThickness,
    config.endAFit,
  );
  const dimB = getAdapterOuterDimensions(
    config.endB,
    config.socketClearance,
    config.wallThickness,
    config.endBFit,
  );
  const maxDim = Math.max(dimA.width, dimA.height, dimB.width, dimB.height);
  return maxDim * 1.5;
}
