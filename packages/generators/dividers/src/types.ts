export interface DividerConfig {
  /** Slab thickness in mm — the slim dimension, points up off the print bed. */
  thickness: number;
  /** Width in mm — the longer in-plane dimension on the print bed. */
  width: number;
  /** Height in mm — the shorter in-plane dimension on the print bed. */
  height: number;
}

export const DEFAULT_DIVIDER_CONFIG: DividerConfig = {
  thickness: 1,
  width: 65,
  height: 35,
};
