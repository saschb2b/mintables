import { addTriangle } from "@mintables/shared/lib/geometry/mesh-utils";
import type { DividerConfig } from "./types";

/** Resolution of each quarter-corner arc when cornerRadius > 0. */
const SEGMENTS_PER_CORNER = 12;

/**
 * 2D outline of the slab footprint (in the bed plane). Returned in CCW order
 * when viewed from above (+z), centered on the origin. For cornerRadius = 0
 * this is just the 4 sharp corners; for r > 0 each corner becomes a
 * quarter-arc of (SEGMENTS_PER_CORNER + 1) points.
 */
function buildOutline(w: number, h: number, r: number): { x: number; y: number }[] {
  const hw = w / 2;
  const hh = h / 2;

  if (r <= 0) {
    return [
      { x: hw, y: -hh },
      { x: hw, y: hh },
      { x: -hw, y: hh },
      { x: -hw, y: -hh },
    ];
  }

  // Corner arc centers, traversed CCW from above starting at the
  // bottom-right (+x, -y). The startAngle is the polar angle (from each
  // corner's center) where the arc begins; each arc sweeps +π/2.
  const corners = [
    { cx: hw - r, cy: -hh + r, startAngle: -Math.PI / 2 }, // bottom-right
    { cx: hw - r, cy: hh - r, startAngle: 0 },             // top-right
    { cx: -hw + r, cy: hh - r, startAngle: Math.PI / 2 },  // top-left
    { cx: -hw + r, cy: -hh + r, startAngle: Math.PI },     // bottom-left
  ];

  const pts: { x: number; y: number }[] = [];
  for (const { cx, cy, startAngle } of corners) {
    for (let i = 0; i <= SEGMENTS_PER_CORNER; i++) {
      const angle = startAngle + (i / SEGMENTS_PER_CORNER) * (Math.PI / 2);
      pts.push({
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
      });
    }
  }
  return pts;
}

/**
 * Build the mesh for a flat divider slab lying on the print bed. Coordinates
 * use z-up, centered horizontally around the origin so the orbit camera
 * frames the slab symmetrically:
 *   x ∈ [-width/2, width/2]   (width along the bed)
 *   y ∈ [-height/2, height/2] (height along the bed)
 *   z ∈ [0, thickness]        (slim; bottom sits on z = 0)
 *
 * When cornerRadius = 0 this is a 12-triangle box. With r > 0 the footprint
 * becomes a rounded rectangle, fan-triangulated from the origin on top and
 * bottom, with one quad per outline segment for the side wall.
 */
export function generateDividerTriangles(config: DividerConfig): number[][] {
  const { thickness: t, width: w, height: h } = config;
  // Clamp the radius defensively — UI + validation also guard this, but the
  // mesh builder shouldn't crash if a bad preset slips through.
  const r = Math.max(0, Math.min(config.cornerRadius, w / 2, h / 2));
  const outline = buildOutline(w, h, r);
  const triangles: number[][] = [];

  for (let i = 0; i < outline.length; i++) {
    const a = outline[i];
    const b = outline[(i + 1) % outline.length];

    // Top face — CCW from above (outward normal +z)
    addTriangle(triangles, 0, 0, t, a.x, a.y, t, b.x, b.y, t);

    // Bottom face — CCW from below (outward normal -z)
    addTriangle(triangles, 0, 0, 0, b.x, b.y, 0, a.x, a.y, 0);

    // Side wall — quad from (a, z=0) → (b, z=0) → (b, t) → (a, t),
    // wound for outward normals (radially away from the centroid).
    addTriangle(triangles, a.x, a.y, 0, b.x, b.y, 0, b.x, b.y, t);
    addTriangle(triangles, a.x, a.y, 0, b.x, b.y, t, a.x, a.y, t);
  }

  return triangles;
}
