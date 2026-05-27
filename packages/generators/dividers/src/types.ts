export interface DividerConfig {
  /** Slab thickness in mm — the slim dimension, points up off the print bed. */
  thickness: number;
  /**
   * Top width in mm — width of the edge that faces "up" when the divider is
   * standing in a box. When `taperEnabled` is false, both ends use this value
   * and the slab is a plain rectangle.
   */
  width: number;
  /** Height in mm — the shorter in-plane dimension on the print bed. */
  height: number;
  /**
   * Outer corner radius in mm. 0 = sharp corners. Clamped at runtime to half
   * the shorter side; at the max the slab becomes a stadium / discorectangle.
   */
  cornerRadius: number;
  /**
   * When true, the slab tapers from `width` (top edge) to `bottomWidth`
   * (bottom edge), useful for fitting slightly tapered box slots. When false
   * the bottom uses the same width as the top.
   */
  taperEnabled: boolean;
  /**
   * Width in mm at the bottom edge (the edge that rests on the box floor in
   * use). Only applied when `taperEnabled` is true. Default matches `width`.
   */
  bottomWidth: number;
}

export const DEFAULT_DIVIDER_CONFIG: DividerConfig = {
  thickness: 1,
  width: 65,
  height: 35,
  cornerRadius: 0,
  taperEnabled: false,
  bottomWidth: 65,
};

/** Resolve the actual bottom-edge width, honoring the taper toggle. */
export function effectiveBottomWidth(config: DividerConfig): number {
  return config.taperEnabled ? config.bottomWidth : config.width;
}
