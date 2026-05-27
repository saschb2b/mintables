export interface DividerConfig {
  /** Slab thickness in mm — the slim dimension, points up off the print bed. */
  thickness: number;
  /** Width in mm — the longer in-plane dimension on the print bed. */
  width: number;
  /** Height in mm — the shorter in-plane dimension on the print bed. */
  height: number;
  /**
   * Outer corner radius in mm. 0 = sharp corners (a plain box). Clamped at
   * runtime to `min(width, height) / 2` — at that maximum the divider
   * becomes a stadium / discorectangle.
   */
  cornerRadius: number;
}

export const DEFAULT_DIVIDER_CONFIG: DividerConfig = {
  thickness: 1,
  width: 65,
  height: 35,
  cornerRadius: 0,
};
