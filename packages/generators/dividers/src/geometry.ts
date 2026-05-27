import { addTriangle } from "@mintables/shared/lib/geometry/mesh-utils";
import {
  effectiveBottomWidth,
  labelCenterY,
  type DividerConfig,
} from "./types";

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
 *   y ∈ [-height/2, height/2] (height along the bed; -y is the slab's "top"
 *                              edge when standing in a box — the wider end
 *                              with taper on)
 *   z ∈ [0, thickness]        (slim; bottom sits on z = 0)
 *
 * Bottom face is fan-triangulated from the centroid; side walls are a quad
 * strip following the perimeter. Top face is fan-triangulated from the
 * centroid when no label pocket is requested, otherwise it's the annular
 * region between the perimeter and a centered rectangular hole, plus the
 * pocket's 4 vertical walls and floor (see `cutLabelPocket`).
 */
export function generateDividerTriangles(config: DividerConfig): number[][] {
  const { thickness: t, width: topW, height: h } = config;
  const bottomW = effectiveBottomWidth(config);
  const outline = buildOutline(topW, bottomW, h, config.cornerRadius);
  const triangles: number[][] = [];

  for (let i = 0; i < outline.length; i++) {
    const a = outline[i];
    const b = outline[(i + 1) % outline.length];

    // Bottom face — CCW from below (outward normal -z)
    addTriangle(triangles, 0, 0, 0, b.x, b.y, 0, a.x, a.y, 0);

    // Side wall quad — outward normals
    addTriangle(triangles, a.x, a.y, 0, b.x, b.y, 0, b.x, b.y, t);
    addTriangle(triangles, a.x, a.y, 0, b.x, b.y, t, a.x, a.y, t);
  }

  if (config.labelEnabled) {
    cutLabelPocket(outline, config, triangles);
  } else {
    // Plain top face — same fan as the bottom, opposite winding.
    for (let i = 0; i < outline.length; i++) {
      const a = outline[i];
      const b = outline[(i + 1) % outline.length];
      addTriangle(triangles, 0, 0, t, a.x, a.y, t, b.x, b.y, t);
    }
  }

  return triangles;
}

/**
 * Replace the plain top face with one that has a centered rectangular hole,
 * then build the pocket's walls and floor. Works for any convex outline by
 * shooting a ray from the origin through each pocket corner to find the
 * matching outer-perimeter intersection, then fan-triangulating the four
 * annular strips between them.
 */
function cutLabelPocket(
  outline: Pt[],
  config: DividerConfig,
  triangles: number[][],
): void {
  const { thickness: t, labelWidth, labelHeight, labelDepth } = config;
  // Clamp defensively in case validation was bypassed.
  const depth = Math.max(0, Math.min(labelDepth, t / 2));
  if (depth <= 0) {
    // Treat as no-pocket and just emit the plain top face.
    for (let i = 0; i < outline.length; i++) {
      const a = outline[i];
      const b = outline[(i + 1) % outline.length];
      addTriangle(triangles, 0, 0, t, a.x, a.y, t, b.x, b.y, t);
    }
    return;
  }

  const z = t;
  const pz = t - depth;
  const lhw = labelWidth / 2;
  const lhh = labelHeight / 2;
  const cy = labelCenterY(config);

  // Pocket corners in CCW order viewed from above (matches outline winding
  // so the inward-normal calc below works out). The whole rectangle is
  // shifted by `cy` so the position selector ("top" / "center" / "bottom")
  // moves the pocket along the slab.
  const pocket: Pt[] = [
    { x: lhw, y: cy - lhh },
    { x: lhw, y: cy + lhh },
    { x: -lhw, y: cy + lhh },
    { x: -lhw, y: cy - lhh },
  ];

  // Project each pocket corner outward via a ray from the pocket's center
  // (not the slab origin — the pocket can be offset for "top"/"bottom"
  // alignment) and find where it hits the outline. Returns the intersection
  // point + the outline edge index it landed on.
  const pocketCenter: Pt = { x: 0, y: cy };
  const projections = pocket.map((p) =>
    rayHit(outline, pocketCenter, {
      x: p.x - pocketCenter.x,
      y: p.y - pocketCenter.y,
    }),
  );

  // Annular top face: four strips, one per gap between consecutive pocket
  // corners. Each strip fans from the start pocket corner across the outer
  // arc to the end pocket corner.
  const n = outline.length;
  for (let i = 0; i < 4; i++) {
    const j = (i + 1) % 4;
    const pStart = pocket[i];
    const pEnd = pocket[j];
    const startProj = projections[i];
    const endProj = projections[j];

    const arc: Pt[] = [startProj.point];
    let cur = (startProj.edgeIdx + 1) % n;
    const stop = (endProj.edgeIdx + 1) % n;
    // Walk CCW around the outline collecting any vertices that lie strictly
    // between startProj and endProj.
    let safety = n + 1;
    while (cur !== stop && safety-- > 0) {
      arc.push(outline[cur]);
      cur = (cur + 1) % n;
    }
    arc.push(endProj.point);

    for (let k = 0; k < arc.length - 1; k++) {
      addTriangle(
        triangles,
        pStart.x,
        pStart.y,
        z,
        arc[k].x,
        arc[k].y,
        z,
        arc[k + 1].x,
        arc[k + 1].y,
        z,
      );
    }
    // Closing triangle to the next pocket corner.
    addTriangle(
      triangles,
      pStart.x,
      pStart.y,
      z,
      arc[arc.length - 1].x,
      arc[arc.length - 1].y,
      z,
      pEnd.x,
      pEnd.y,
      z,
    );
  }

  // Pocket walls — wound so the normals point INTO the pocket (away from
  // the surrounding slab material).
  for (let i = 0; i < 4; i++) {
    const a = pocket[i];
    const b = pocket[(i + 1) % 4];
    addTriangle(triangles, a.x, a.y, z, b.x, b.y, z, b.x, b.y, pz);
    addTriangle(triangles, a.x, a.y, z, b.x, b.y, pz, a.x, a.y, pz);
  }

  // Pocket floor — CCW from above (normal +z, visible when looking down
  // into the recess).
  addTriangle(
    triangles,
    pocket[0].x,
    pocket[0].y,
    pz,
    pocket[1].x,
    pocket[1].y,
    pz,
    pocket[2].x,
    pocket[2].y,
    pz,
  );
  addTriangle(
    triangles,
    pocket[0].x,
    pocket[0].y,
    pz,
    pocket[2].x,
    pocket[2].y,
    pz,
    pocket[3].x,
    pocket[3].y,
    pz,
  );
}

/**
 * Ray from `origin` in `direction`. Returns the first outline edge the ray
 * crosses, and the precise intersection point on that edge. Assumes the
 * outline is a convex CCW polygon that contains `origin`.
 */
function rayHit(
  outline: Pt[],
  origin: Pt,
  direction: Pt,
): { point: Pt; edgeIdx: number } {
  let bestT = Infinity;
  let bestIdx = -1;
  let bestPoint: Pt = { x: 0, y: 0 };
  for (let i = 0; i < outline.length; i++) {
    const a = outline[i];
    const b = outline[(i + 1) % outline.length];
    // Ray:  P(t) = origin + t * direction,  t >= 0
    // Edge: Q(s) = a + s * (b - a),         s in [0, 1]
    const dx = direction.x;
    const dy = direction.y;
    const ex = b.x - a.x;
    const ey = b.y - a.y;
    const denom = dx * ey - dy * ex;
    if (Math.abs(denom) < 1e-12) continue;
    const ax = a.x - origin.x;
    const ay = a.y - origin.y;
    const tParam = (ax * ey - ay * ex) / denom;
    const sParam = (ax * dy - ay * dx) / denom;
    if (tParam > 0 && sParam >= -1e-9 && sParam <= 1 + 1e-9 && tParam < bestT) {
      bestT = tParam;
      bestIdx = i;
      bestPoint = {
        x: origin.x + tParam * dx,
        y: origin.y + tParam * dy,
      };
    }
  }
  return { point: bestPoint, edgeIdx: bestIdx };
}
