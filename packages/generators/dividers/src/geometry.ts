import { addTriangle } from "@mintables/shared/lib/geometry/mesh-utils";
import { effectiveBottomWidth, type DividerConfig } from "./types";

/** Resolution of each quarter-corner arc when cornerRadius > 0. */
const SEGMENTS_PER_CORNER = 12;

interface Pt {
  x: number;
  y: number;
}

interface OutlineCorner {
  pos: Pt;
  prev: Pt;
  next: Pt;
}

/**
 * 2D outline of the slab footprint (in the bed plane). Returned in CCW order
 * when viewed from above. Supports an arbitrary symmetric trapezoid (top and
 * bottom edges horizontal, sides slanted), so a plain rectangle is just the
 * `topW === bottomW` case. When `r > 0` each corner is replaced by an arc
 * whose center is offset along the corner's inward angle bisector — this
 * collapses to the perpendicular rectangle case automatically.
 */
function buildOutline(
  topW: number,
  bottomW: number,
  h: number,
  rIn: number,
): Pt[] {
  const topHalf = topW / 2;
  const botHalf = bottomW / 2;
  const halfH = h / 2;

  // The slab's *top* edge (when the divider is standing in a box — wider in
  // a typical taper) is placed at y = -halfH so that in the default ISO
  // camera it projects toward the visual top of the screen. The "bottom"
  // edge (narrower) sits at y = +halfH and projects toward the visual bottom.
  // CCW order viewed from above: top-right → bottom-right → bottom-left →
  // top-left, where "top/bottom" here mean the divider's own top/bottom.
  const corners: OutlineCorner[] = [
    {
      pos: { x: topHalf, y: -halfH },
      prev: { x: -topHalf, y: -halfH },
      next: { x: botHalf, y: halfH },
    },
    {
      pos: { x: botHalf, y: halfH },
      prev: { x: topHalf, y: -halfH },
      next: { x: -botHalf, y: halfH },
    },
    {
      pos: { x: -botHalf, y: halfH },
      prev: { x: botHalf, y: halfH },
      next: { x: -topHalf, y: -halfH },
    },
    {
      pos: { x: -topHalf, y: -halfH },
      prev: { x: -botHalf, y: halfH },
      next: { x: topHalf, y: -halfH },
    },
  ];

  // Conservatively clamp r to half the shortest in-plane dimension.
  const r = Math.max(0, Math.min(rIn, Math.min(topW, bottomW, h) / 2));

  if (r <= 1e-9) {
    return corners.map((c) => c.pos);
  }

  const pts: Pt[] = [];
  for (const c of corners) {
    // Unit vectors from this corner toward each neighbor.
    const v1x = c.prev.x - c.pos.x;
    const v1y = c.prev.y - c.pos.y;
    const v1len = Math.hypot(v1x, v1y);
    const v1 = { x: v1x / v1len, y: v1y / v1len };

    const v2x = c.next.x - c.pos.x;
    const v2y = c.next.y - c.pos.y;
    const v2len = Math.hypot(v2x, v2y);
    const v2 = { x: v2x / v2len, y: v2y / v2len };

    // Inward angle bisector (sum of unit edge directions, normalized).
    const bx = v1.x + v2.x;
    const by = v1.y + v2.y;
    const blen = Math.hypot(bx, by);
    if (blen < 1e-9) {
      // Collinear edges (shouldn't happen for a real trapezoid) — drop arc.
      pts.push(c.pos);
      continue;
    }
    const bisector = { x: bx / blen, y: by / blen };

    // Half-angle: cos(θ/2) = v1 · bisector. sin from Pythagoras.
    const cosHalf = v1.x * bisector.x + v1.y * bisector.y;
    const sinHalf = Math.sqrt(Math.max(0, 1 - cosHalf * cosHalf));
    if (sinHalf < 1e-9) {
      pts.push(c.pos);
      continue;
    }

    // Arc center sits on the inward bisector at d = r / sin(θ/2).
    const d = r / sinHalf;
    const cx = c.pos.x + d * bisector.x;
    const cy = c.pos.y + d * bisector.y;

    // Tangent points where the arc meets each edge: r * cot(θ/2) from corner.
    const tDist = (r * cosHalf) / sinHalf;
    const tan1 = {
      x: c.pos.x + tDist * v1.x,
      y: c.pos.y + tDist * v1.y,
    };
    const tan2 = {
      x: c.pos.x + tDist * v2.x,
      y: c.pos.y + tDist * v2.y,
    };

    const startAngle = Math.atan2(tan1.y - cy, tan1.x - cx);
    const endAngle = Math.atan2(tan2.y - cy, tan2.x - cx);

    // For a CCW polygon traversal at a convex corner the arc sweeps CCW
    // around its center, so normalize delta into (0, 2π].
    let delta = endAngle - startAngle;
    while (delta <= 0) delta += 2 * Math.PI;
    while (delta > 2 * Math.PI) delta -= 2 * Math.PI;

    for (let i = 0; i <= SEGMENTS_PER_CORNER; i++) {
      const angle = startAngle + (i / SEGMENTS_PER_CORNER) * delta;
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
 *   x ∈ width-direction (top edge wider than bottom when taper is on)
 *   y ∈ [-height/2, height/2] (height along the bed; +y is the slab's "top"
 *                              edge when standing in a box)
 *   z ∈ [0, thickness]        (slim; bottom sits on z = 0)
 *
 * Top + bottom faces are fan-triangulated from the centroid; the side wall
 * is a quad strip following the perimeter.
 */
export function generateDividerTriangles(config: DividerConfig): number[][] {
  const { thickness: t, width: topW, height: h } = config;
  const bottomW = effectiveBottomWidth(config);
  const outline = buildOutline(topW, bottomW, h, config.cornerRadius);
  const triangles: number[][] = [];

  for (let i = 0; i < outline.length; i++) {
    const a = outline[i];
    const b = outline[(i + 1) % outline.length];

    // Top face — CCW from above (outward normal +z)
    addTriangle(triangles, 0, 0, t, a.x, a.y, t, b.x, b.y, t);

    // Bottom face — CCW from below (outward normal -z)
    addTriangle(triangles, 0, 0, 0, b.x, b.y, 0, a.x, a.y, 0);

    // Side wall quad — outward normals
    addTriangle(triangles, a.x, a.y, 0, b.x, b.y, 0, b.x, b.y, t);
    addTriangle(triangles, a.x, a.y, 0, b.x, b.y, t, a.x, a.y, t);
  }

  return triangles;
}
