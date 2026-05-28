import { addTriangle } from "@mintables/shared/lib/geometry/mesh-utils";
import type { LegCapConfig } from "./types";

/** Smooth angular segment count for round/oval outlines. */
const ROUND_SEGMENTS = 64;
/** Segments per corner for square/rectangular outlines (4 × this around). */
const SEGMENTS_PER_CORNER = 8;

interface Pt {
  x: number;
  y: number;
}

interface OutlineDims {
  width: number;
  height: number;
  cornerRadius: number;
}

type OutlineTarget = "outer" | "innerTop" | "innerFloor" | "recess";

/**
 * Resolve the 2D bounding-box dimensions for the requested outline. All four
 * outline targets (outer / inner-at-opening / inner-at-floor / felt-recess)
 * share their shape's parameterization, just at different sizes:
 *
 *   outer       = inner + 2 × wall
 *   innerTop    = inner + clearance
 *   innerFloor  = inner + clearance − taper        (when taper enabled)
 *   recess      = outer − 2 × feltInset             (when felt enabled)
 *
 * Corner radius shrinks with the perimeter for the non-round shapes so the
 * inner / recess corners stay parallel to the outer ones.
 */
function resolveDims(config: LegCapConfig, target: OutlineTarget): OutlineDims {
  const wall = config.wallThickness;
  const clearance = config.fitClearance;
  const taper = config.innerTaperEnabled ? config.innerTaper : 0;

  switch (config.shape) {
    case "round": {
      const innerD = config.innerDiameter;
      switch (target) {
        case "outer":
          return {
            width: innerD + 2 * wall,
            height: innerD + 2 * wall,
            cornerRadius: 0,
          };
        case "innerTop":
          return { width: innerD + clearance, height: innerD + clearance, cornerRadius: 0 };
        case "innerFloor":
          return {
            width: innerD + clearance - taper,
            height: innerD + clearance - taper,
            cornerRadius: 0,
          };
        case "recess":
          return {
            width: innerD + 2 * wall - 2 * config.feltInset,
            height: innerD + 2 * wall - 2 * config.feltInset,
            cornerRadius: 0,
          };
      }
      break;
    }
    case "oval": {
      const w = config.innerWidth;
      const h = config.innerHeight;
      switch (target) {
        case "outer":
          return { width: w + 2 * wall, height: h + 2 * wall, cornerRadius: 0 };
        case "innerTop":
          return { width: w + clearance, height: h + clearance, cornerRadius: 0 };
        case "innerFloor":
          return {
            width: w + clearance - taper,
            height: h + clearance - taper,
            cornerRadius: 0,
          };
        case "recess":
          return {
            width: w + 2 * wall - 2 * config.feltInset,
            height: h + 2 * wall - 2 * config.feltInset,
            cornerRadius: 0,
          };
      }
      break;
    }
    case "square": {
      const s = config.innerSize;
      const r = config.cornerRadius;
      switch (target) {
        case "outer":
          return { width: s + 2 * wall, height: s + 2 * wall, cornerRadius: r };
        case "innerTop":
          return {
            width: s + clearance,
            height: s + clearance,
            cornerRadius: Math.max(0, r - wall),
          };
        case "innerFloor":
          return {
            width: s + clearance - taper,
            height: s + clearance - taper,
            cornerRadius: Math.max(0, r - wall),
          };
        case "recess":
          return {
            width: s + 2 * wall - 2 * config.feltInset,
            height: s + 2 * wall - 2 * config.feltInset,
            cornerRadius: Math.max(0, r - config.feltInset),
          };
      }
      break;
    }
    case "rectangular": {
      const w = config.innerWidth;
      const h = config.innerHeight;
      const r = config.cornerRadius;
      switch (target) {
        case "outer":
          return { width: w + 2 * wall, height: h + 2 * wall, cornerRadius: r };
        case "innerTop":
          return {
            width: w + clearance,
            height: h + clearance,
            cornerRadius: Math.max(0, r - wall),
          };
        case "innerFloor":
          return {
            width: w + clearance - taper,
            height: h + clearance - taper,
            cornerRadius: Math.max(0, r - wall),
          };
        case "recess":
          return {
            width: w + 2 * wall - 2 * config.feltInset,
            height: h + 2 * wall - 2 * config.feltInset,
            cornerRadius: Math.max(0, r - config.feltInset),
          };
      }
    }
  }
  // Unreachable — every shape/target combination returns above.
  return { width: 0, height: 0, cornerRadius: 0 };
}

/** CCW samples around an axis-aligned ellipse with the given semi-axes. */
function ellipseOutline(halfW: number, halfH: number, segments: number): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    pts.push({ x: halfW * Math.cos(angle), y: halfH * Math.sin(angle) });
  }
  return pts;
}

/**
 * CCW samples around a rounded rectangle. Mirrors the rounded-rect builder
 * used by the tubes generator so square / rectangular legs use consistent
 * tessellation. With cornerRadius = 0 the four "corners" collapse to single
 * points; addTriangle filters the resulting degenerate strips, so the mesh
 * stays valid (a sharp box) at the cost of a few wasted indices.
 */
function roundedRectOutline(
  width: number,
  height: number,
  cornerRadius: number,
  segmentsPerCorner: number,
): Pt[] {
  const hw = width / 2;
  const hh = height / 2;
  const r = Math.max(0, Math.min(cornerRadius, hw, hh));
  const pts: Pt[] = [];
  const total = segmentsPerCorner * 4;
  for (let i = 0; i < total; i++) {
    const cornerIndex = Math.floor(i / segmentsPerCorner);
    const within = i % segmentsPerCorner;
    const angleInCorner = (within / segmentsPerCorner) * (Math.PI / 2);
    let cx: number;
    let cy: number;
    let startAngle: number;
    switch (cornerIndex) {
      case 0:
        cx = hw - r;
        cy = hh - r;
        startAngle = 0;
        break;
      case 1:
        cx = -hw + r;
        cy = hh - r;
        startAngle = Math.PI / 2;
        break;
      case 2:
        cx = -hw + r;
        cy = -hh + r;
        startAngle = Math.PI;
        break;
      default:
        cx = hw - r;
        cy = -hh + r;
        startAngle = (3 * Math.PI) / 2;
        break;
    }
    const angle = startAngle + angleInCorner;
    pts.push({
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    });
  }
  return pts;
}

function buildOutline(config: LegCapConfig, target: OutlineTarget): Pt[] {
  const dims = resolveDims(config, target);
  switch (config.shape) {
    case "round":
    case "oval":
      return ellipseOutline(dims.width / 2, dims.height / 2, ROUND_SEGMENTS);
    case "square":
    case "rectangular":
      return roundedRectOutline(
        dims.width,
        dims.height,
        dims.cornerRadius,
        SEGMENTS_PER_CORNER,
      );
  }
}

/**
 * Vertical wall from `zLow` to `zHigh`, wrapped around a CCW outline. The
 * `facing` argument picks which side the outward normal sticks out of:
 *
 *   "outward" — normal points away from the polygon's interior. Used for
 *               the cap's exterior side wall.
 *   "inward"  — normal points into the polygon's interior. Used for cavity
 *               walls (the socket bore and the felt recess), whose surfaces
 *               face the empty space inside.
 */
function buildSideWall(
  triangles: number[][],
  outline: Pt[],
  zLow: number,
  zHigh: number,
  facing: "outward" | "inward",
): void {
  const n = outline.length;
  for (let i = 0; i < n; i++) {
    const a = outline[i];
    const b = outline[(i + 1) % n];
    if (facing === "outward") {
      addTriangle(triangles, a.x, a.y, zLow, b.x, b.y, zLow, a.x, a.y, zHigh);
      addTriangle(triangles, b.x, b.y, zLow, b.x, b.y, zHigh, a.x, a.y, zHigh);
    } else {
      addTriangle(triangles, a.x, a.y, zLow, a.x, a.y, zHigh, b.x, b.y, zLow);
      addTriangle(triangles, b.x, b.y, zLow, a.x, a.y, zHigh, b.x, b.y, zHigh);
    }
  }
}

/**
 * Tapered inner socket wall — connects a smaller CCW outline at the bottom
 * (`outlineLow` at `zLow`) to a larger CCW outline at the top (`outlineHigh`
 * at `zHigh`). Both outlines must have the same vertex count. Outward
 * normals point INWARD (toward the polygon's axis) so the surface faces
 * the empty socket interior.
 */
function buildTaperedInnerWall(
  triangles: number[][],
  outlineLow: Pt[],
  outlineHigh: Pt[],
  zLow: number,
  zHigh: number,
): void {
  const n = outlineLow.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const aL = outlineLow[i];
    const bL = outlineLow[j];
    const aH = outlineHigh[i];
    const bH = outlineHigh[j];
    addTriangle(triangles, aL.x, aL.y, zLow, aH.x, aH.y, zHigh, bL.x, bL.y, zLow);
    addTriangle(triangles, bL.x, bL.y, zLow, aH.x, aH.y, zHigh, bH.x, bH.y, zHigh);
  }
}

/**
 * Flat horizontal face filled by fanning from the origin. CCW polygons emit
 * +z normals when `facing` is "up" and −z normals when "down". The origin is
 * inside every cap outline (all shapes are centered), so the fan is safe.
 */
function buildFanFace(
  triangles: number[][],
  outline: Pt[],
  z: number,
  facing: "up" | "down",
): void {
  const n = outline.length;
  for (let i = 0; i < n; i++) {
    const a = outline[i];
    const b = outline[(i + 1) % n];
    if (facing === "up") {
      addTriangle(triangles, 0, 0, z, a.x, a.y, z, b.x, b.y, z);
    } else {
      addTriangle(triangles, 0, 0, z, b.x, b.y, z, a.x, a.y, z);
    }
  }
}

/**
 * Flat horizontal annular face between an outer and an inner CCW outline at
 * height `z`. Both outlines need the same vertex count and the inner one
 * must lie entirely inside the outer.
 *
 *   "up"   — outward normal +z (e.g. the top rim of the cap).
 *   "down" — outward normal −z (e.g. the cap's footprint around a felt recess).
 */
function buildAnnularFace(
  triangles: number[][],
  outer: Pt[],
  inner: Pt[],
  z: number,
  facing: "up" | "down",
): void {
  const n = outer.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const oA = outer[i];
    const oB = outer[j];
    const iA = inner[i];
    const iB = inner[j];
    if (facing === "up") {
      addTriangle(triangles, oA.x, oA.y, z, oB.x, oB.y, z, iA.x, iA.y, z);
      addTriangle(triangles, oB.x, oB.y, z, iB.x, iB.y, z, iA.x, iA.y, z);
    } else {
      addTriangle(triangles, oA.x, oA.y, z, iA.x, iA.y, z, oB.x, oB.y, z);
      addTriangle(triangles, oB.x, oB.y, z, iA.x, iA.y, z, iB.x, iB.y, z);
    }
  }
}

/**
 * Build the mesh for a leg cap printed open-side-up, with the closed floor
 * sitting on the build plate. Coordinates use z-up:
 *
 *   z = 0                            outer bottom face (touches the ground in use)
 *   z = feltDepth                    floor of the felt recess (when enabled)
 *   z = floorThickness               socket floor / top surface of the cap floor
 *   z = floorThickness + capHeight   socket opening (top of the cap, where the leg enters)
 *
 * The cap is centered on the origin so the orbit camera frames it
 * symmetrically. With `innerTaperEnabled` on, the inner socket widens as it
 * approaches the opening so the leg slides in easily and wedges before
 * bottoming out.
 */
export function generateLegCapTriangles(config: LegCapConfig): number[][] {
  const triangles: number[][] = [];

  const zBottom = 0;
  const zFloor = config.floorThickness;
  const zTop = config.floorThickness + config.capHeight;

  const outerOutline = buildOutline(config, "outer");
  const innerTopOutline = buildOutline(config, "innerTop");
  const innerFloorOutline = buildOutline(config, "innerFloor");

  // Outer wall — the side you see from the outside of the cap.
  buildSideWall(triangles, outerOutline, zBottom, zTop, "outward");

  // Top rim — the annular face around the socket opening.
  buildAnnularFace(triangles, outerOutline, innerTopOutline, zTop, "up");

  // Inner socket wall — tapered from a smaller floor outline up to a larger
  // top outline (when taper is enabled; otherwise the two outlines match
  // and the wall is a plain cylinder/box).
  buildTaperedInnerWall(
    triangles,
    innerFloorOutline,
    innerTopOutline,
    zFloor,
    zTop,
  );

  // Top surface of the cap floor — the part the leg's foot rests on.
  buildFanFace(triangles, innerFloorOutline, zFloor, "up");

  // Outer bottom face — either a plain disk or a felt recess.
  if (config.feltRecessEnabled && config.feltDepth > 0) {
    const recessOutline = buildOutline(config, "recess");
    // Visible rim of the cap (annular slice of the bottom face).
    buildAnnularFace(triangles, outerOutline, recessOutline, zBottom, "down");
    // Side walls of the recess pocket. Normals point into the pocket (away
    // from the surrounding floor material), so use the "inward" winding.
    buildSideWall(triangles, recessOutline, zBottom, config.feltDepth, "inward");
    // Ceiling of the pocket — visible from below the cap, normal −z.
    buildFanFace(triangles, recessOutline, config.feltDepth, "down");
  } else {
    buildFanFace(triangles, outerOutline, zBottom, "down");
  }

  return triangles;
}
