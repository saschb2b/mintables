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
  /**
   * When true, a rectangular recess is cut into the top face of the slab so
   * a printed sticker sits flush. The pocket is centered on the slab; size
   * and depth are configured below.
   */
  labelEnabled: boolean;
  /** Pocket width (mm) along the slab's width axis. Only used when `labelEnabled`. */
  labelWidth: number;
  /** Pocket height (mm) along the slab's height axis. Only used when `labelEnabled`. */
  labelHeight: number;
  /** Pocket depth (mm) into the top face. Bounded by half the slab thickness. */
  labelDepth: number;
  /**
   * Vertical placement of the pocket on the divider. "top" aligns it near
   * the top edge (where it stays visible when peeking into a screw bin from
   * above); "center" puts it in the middle of the face; "bottom" mirrors
   * "top". Horizontal placement is always centered.
   */
  labelPosition: "top" | "center" | "bottom";
}

/** Wall left between the pocket and the nearest divider edge (mm). */
export const LABEL_EDGE_MARGIN_MM = 1;

export const DEFAULT_DIVIDER_CONFIG: DividerConfig = {
  thickness: 1,
  width: 65,
  height: 35,
  cornerRadius: 0,
  taperEnabled: false,
  bottomWidth: 65,
  labelEnabled: false,
  labelWidth: 40,
  labelHeight: 15,
  labelDepth: 0.4,
  labelPosition: "top",
};

/** Resolve the actual bottom-edge width, honoring the taper toggle. */
export function effectiveBottomWidth(config: DividerConfig): number {
  return config.taperEnabled ? config.bottomWidth : config.width;
}

/**
 * Y-offset of the label pocket's center in source coords. The divider's
 * "top" edge (when standing in a box) lives at source y = -height/2 thanks
 * to the upstream y-flip in the geometry, so "top" position pulls the
 * pocket toward negative y.
 */
export function labelCenterY(config: DividerConfig): number {
  const halfH = config.height / 2;
  switch (config.labelPosition) {
    case "top":
      return -halfH + LABEL_EDGE_MARGIN_MM + config.labelHeight / 2;
    case "bottom":
      return halfH - LABEL_EDGE_MARGIN_MM - config.labelHeight / 2;
    case "center":
    default:
      return 0;
  }
}
