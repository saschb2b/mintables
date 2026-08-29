import { addTriangle } from "@mintables/shared/lib/geometry/mesh-utils";
import {
  arcBarDepth,
  arcBarWidth,
  type ArcPullConfig,
  type KnobPullConfig,
  type PullConfig,
  type TabPullConfig,
} from "./types";

/** Angular resolution of the knob's solid of revolution. */
const REVOLVE_SEGMENTS = 64;
/** Rings along the arc handle's sweep. */
const SWEEP_STEPS = 72;
/** Points around screw circles and the arc bar cross-section. */
const RING_SEGMENTS = 24;
/** Profile samples along the tab's bend arc and rounded tip. */
const BEND_SEGMENTS = 8;

export interface Pt2 {
  x: number;
  y: number;
}

interface Pt3 {
  x: number;
  y: number;
  z: number;
}

function pushTri(triangles: number[][], a: Pt3, b: Pt3, c: Pt3): void {
  addTriangle(triangles, a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
}

function signedArea(pts: Pt2[]): number {
  let sum = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    sum += a.x * b.y - b.x * a.y;
  }
  return sum / 2;
}

/** CCW circle in 2D around a center. */
function circleOutline(cx: number, cy: number, radius: number): Pt2[] {
  const pts: Pt2[] = [];
  for (let i = 0; i < RING_SEGMENTS; i++) {
    const a = (i / RING_SEGMENTS) * Math.PI * 2;
    pts.push({ x: cx + radius * Math.cos(a), y: cy + radius * Math.sin(a) });
  }
  return pts;
}

/* ------------------------------------------------------------------ */
/* Shared face and wall builders                                       */
/* ------------------------------------------------------------------ */

/**
 * Lateral wall between two loops with matching point counts. Loops must be
 * ordered CCW when viewed from above (+z). "outward" faces away from the
 * loop interior, "inward" faces the cavity inside (bores, countersinks).
 */
function buildLoopWall(
  triangles: number[][],
  low: Pt3[],
  high: Pt3[],
  facing: "outward" | "inward",
): void {
  const n = low.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    if (facing === "outward") {
      pushTri(triangles, low[i], low[j], high[j]);
      pushTri(triangles, low[i], high[j], high[i]);
    } else {
      pushTri(triangles, low[i], high[i], low[j]);
      pushTri(triangles, low[j], high[i], high[j]);
    }
  }
}

/** Planar fan from an interior anchor point across a CCW outline. */
function buildFanFace(
  triangles: number[][],
  outline: Pt2[],
  anchor: Pt2,
  z: number,
  facing: "up" | "down",
): void {
  const c: Pt3 = { x: anchor.x, y: anchor.y, z };
  for (let i = 0; i < outline.length; i++) {
    const a = outline[i];
    const b = outline[(i + 1) % outline.length];
    if (facing === "up") {
      pushTri(triangles, c, { x: a.x, y: a.y, z }, { x: b.x, y: b.y, z });
    } else {
      pushTri(triangles, c, { x: b.x, y: b.y, z }, { x: a.x, y: a.y, z });
    }
  }
}

/**
 * Planar ring face between a convex CCW outer outline and a convex CCW
 * inner outline (a hole), triangulated by merging the two loops in angular
 * order around the inner centroid. Point counts may differ; every boundary
 * edge of both loops appears exactly once, so neighbouring faces that share
 * those loops stay watertight.
 */
function buildZipperFace(
  triangles: number[][],
  outer: Pt2[],
  inner: Pt2[],
  z: number,
  facing: "up" | "down",
): void {
  const center = {
    x: inner.reduce((s, p) => s + p.x, 0) / inner.length,
    y: inner.reduce((s, p) => s + p.y, 0) / inner.length,
  };
  const angleOf = (p: Pt2) => Math.atan2(p.y - center.y, p.x - center.x);

  // Rotate each loop so it starts at its smallest angle, then unwrap the
  // angles into a monotonically increasing sequence.
  const prepare = (loop: Pt2[]) => {
    let start = 0;
    for (let i = 1; i < loop.length; i++) {
      if (angleOf(loop[i]) < angleOf(loop[start])) start = i;
    }
    const pts = loop.map((_, i) => loop[(start + i) % loop.length]);
    const angles = [angleOf(pts[0])];
    for (let i = 1; i < pts.length; i++) {
      let a = angleOf(pts[i]);
      while (a < angles[i - 1]) a += Math.PI * 2;
      angles.push(a);
    }
    return { pts, angles };
  };

  const o = prepare(outer);
  const inn = prepare(inner);
  const emit = (a: Pt2, b: Pt2, c: Pt2) => {
    const p1: Pt3 = { x: a.x, y: a.y, z };
    const p2: Pt3 = { x: b.x, y: b.y, z };
    const p3: Pt3 = { x: c.x, y: c.y, z };
    if (facing === "up") pushTri(triangles, p1, p2, p3);
    else pushTri(triangles, p1, p3, p2);
  };

  let i = 0;
  let j = 0;
  while (i < o.pts.length || j < inn.pts.length) {
    const oNext = i < o.pts.length ? o.angles[i] : Number.POSITIVE_INFINITY;
    const iNext = j < inn.pts.length ? inn.angles[j] : Number.POSITIVE_INFINITY;
    const oi = o.pts[i % o.pts.length];
    const oiNextPt = o.pts[(i + 1) % o.pts.length];
    const ij = inn.pts[j % inn.pts.length];
    const ijNextPt = inn.pts[(j + 1) % inn.pts.length];
    if (i < o.pts.length && (j >= inn.pts.length || oNext <= iNext)) {
      // Advance the outer loop: triangle over its next edge.
      emit(oi, oiNextPt, ij);
      i++;
    } else {
      // Advance the inner loop.
      emit(oi, ijNextPt, ij);
      j++;
    }
  }
}

/* ------------------------------------------------------------------ */
/* Ear-clipping triangulation for the tab's side profile               */
/* ------------------------------------------------------------------ */

function pointInTriangle(p: Pt2, a: Pt2, b: Pt2, c: Pt2): boolean {
  const eps = 1e-9;
  const d1 = (p.x - b.x) * (a.y - b.y) - (a.x - b.x) * (p.y - b.y);
  const d2 = (p.x - c.x) * (b.y - c.y) - (b.x - c.x) * (p.y - c.y);
  const d3 = (p.x - a.x) * (c.y - a.y) - (c.x - a.x) * (p.y - a.y);
  const hasNeg = d1 < -eps || d2 < -eps || d3 < -eps;
  const hasPos = d1 > eps || d2 > eps || d3 > eps;
  return !(hasNeg && hasPos);
}

/**
 * Ear-clipping triangulation of a simple CCW polygon, returning index
 * triples. Collinear vertices (the tab keeps split points on its straight
 * edges so wall strips can match) are never picked as ears themselves but
 * survive as triangle corners, which keeps every boundary sub-edge intact.
 */
export function triangulateSimplePolygon(
  pts: Pt2[],
): [number, number, number][] {
  const idx = pts.map((_, i) => i);
  const out: [number, number, number][] = [];
  let guard = pts.length * pts.length + 16;
  while (idx.length > 3 && guard-- > 0) {
    let clipped = false;
    for (let k = 0; k < idx.length; k++) {
      const i0 = idx[(k + idx.length - 1) % idx.length];
      const i1 = idx[k];
      const i2 = idx[(k + 1) % idx.length];
      const a = pts[i0];
      const b = pts[i1];
      const c = pts[i2];
      const cross = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
      if (cross <= 1e-9) continue;
      let blocked = false;
      for (const other of idx) {
        if (other === i0 || other === i1 || other === i2) continue;
        if (pointInTriangle(pts[other], a, b, c)) {
          blocked = true;
          break;
        }
      }
      if (blocked) continue;
      out.push([i0, i1, i2]);
      idx.splice(k, 1);
      clipped = true;
      break;
    }
    if (!clipped) break;
  }
  if (idx.length === 3) out.push([idx[0], idx[1], idx[2]]);
  return out;
}

/* ------------------------------------------------------------------ */
/* Knob: solid of revolution                                           */
/* ------------------------------------------------------------------ */

interface KnobHeadFrame {
  /** z where the head's underside cone tops out and the side band starts. */
  bandLow: number;
  /** z where the side band ends and the top treatment begins. */
  bandTop: number;
  /** Total knob height. */
  top: number;
  /** Rise of the 45-degree cone under the head. */
  coneRise: number;
  /** Edge roundover radius (flat and dished heads). */
  edgeRadius: number;
}

function knobHeadFrame(config: KnobPullConfig): KnobHeadFrame {
  const headR = config.headDiameter / 2;
  const neckR = config.neckDiameter / 2;
  const zNeck = config.baseHeight + config.neckHeight;
  const top = zNeck + config.headHeight;
  const coneRise = Math.min(
    Math.max(0, headR - neckR),
    config.headHeight * 0.5,
  );
  const above = config.headHeight - coneRise;
  let bandTop: number;
  let edgeRadius = 0;
  if (config.headShape === "dome") {
    const domeRise = Math.min(headR * 0.95, above * 0.7);
    bandTop = top - domeRise;
  } else {
    edgeRadius = Math.min(1.6, headR * 0.3, above * 0.35);
    bandTop = top - edgeRadius;
  }
  return { bandLow: zNeck + coneRise, bandTop, top, coneRise, edgeRadius };
}

/**
 * How many grip rings actually fit on the head's cylindrical band. The
 * requested count is clamped so grooves never overlap or spill off the band.
 */
export function effectiveGrooveCount(config: KnobPullConfig): number {
  const requested = Math.max(0, Math.round(config.gripGrooves));
  if (requested === 0 || config.gripGrooveDepth <= 0) return 0;
  const frame = knobHeadFrame(config);
  const bandH = frame.bandTop - frame.bandLow - 1.2;
  if (bandH <= 0) return 0;
  const halfW = config.gripGrooveDepth;
  const maxFit = Math.floor(bandH / (2.6 * halfW)) - 1;
  return Math.max(0, Math.min(requested, maxFit));
}

/**
 * Radial profile of the knob from the mount face to the top, ordered from
 * the axis at the bottom (or the pilot bore ceiling), outward, up the
 * silhouette, and back to the axis at the top. Revolving this closed path
 * produces the whole watertight knob, pilot bore included.
 */
export function knobProfile(
  config: KnobPullConfig,
): { r: number; z: number }[] {
  const headR = config.headDiameter / 2;
  const neckR = config.neckDiameter / 2;
  const baseR = config.baseDiameter / 2;
  const zBase = config.baseHeight;
  const zNeck = zBase + config.neckHeight;
  const frame = knobHeadFrame(config);
  const pts: { r: number; z: number }[] = [];

  if (config.mount === "screws") {
    const holeR = config.screwDiameter / 2;
    pts.push({ r: 0, z: config.screwHoleDepth });
    pts.push({ r: holeR, z: config.screwHoleDepth });
    pts.push({ r: holeR, z: 0 });
  } else {
    pts.push({ r: 0, z: 0 });
  }

  pts.push({ r: baseR, z: 0 });
  pts.push({ r: baseR, z: zBase });
  pts.push({ r: neckR, z: zBase });
  pts.push({ r: neckR, z: zNeck });
  pts.push({ r: headR, z: frame.bandLow });

  // Grip rings across the cylindrical band.
  const grooves = effectiveGrooveCount(config);
  if (grooves > 0) {
    const halfW = config.gripGrooveDepth;
    const depth = Math.min(config.gripGrooveDepth, headR * 0.25);
    const lo = frame.bandLow + 0.6;
    const pitch = (frame.bandTop - 0.6 - lo) / (grooves + 1);
    for (let k = 1; k <= grooves; k++) {
      const zg = lo + pitch * k;
      pts.push({ r: headR, z: zg - halfW });
      pts.push({ r: headR - depth, z: zg });
      pts.push({ r: headR, z: zg + halfW });
    }
  }
  pts.push({ r: headR, z: frame.bandTop });

  if (config.headShape === "dome") {
    const domeRise = frame.top - frame.bandTop;
    for (let s = 1; s <= BEND_SEGMENTS; s++) {
      const t = (s / BEND_SEGMENTS) * (Math.PI / 2);
      pts.push({
        r: headR * Math.cos(t),
        z: frame.bandTop + domeRise * Math.sin(t),
      });
    }
  } else {
    const r0 = frame.edgeRadius;
    for (let s = 1; s <= 4; s++) {
      const t = (s / 4) * (Math.PI / 2);
      pts.push({
        r: headR - r0 + r0 * Math.cos(t),
        z: frame.bandTop + r0 * Math.sin(t),
      });
    }
    if (config.headShape === "dished") {
      const dishR = headR - r0;
      const dishDepth = Math.min(
        6,
        (config.headHeight - frame.coneRise) * 0.45,
      );
      for (let s = 1; s <= BEND_SEGMENTS; s++) {
        const t = 1 - s / BEND_SEGMENTS;
        pts.push({ r: dishR * t, z: frame.top - dishDepth * (1 - t * t) });
      }
    } else {
      pts.push({ r: 0, z: frame.top });
    }
  }

  return pts;
}

/**
 * Revolve a radial profile around the z axis. The profile must run from the
 * axis at its start to the axis at its end, ordered counterclockwise around
 * the material cross-section (axis-bottom, outward, up, axis-top); segments
 * that touch the axis degenerate into fans, which addTriangle handles by
 * dropping the zero-area half of each quad.
 */
function revolveProfile(
  triangles: number[][],
  profile: { r: number; z: number }[],
): void {
  const at = (p: { r: number; z: number }, angle: number): Pt3 => ({
    x: p.r * Math.cos(angle),
    y: p.r * Math.sin(angle),
    z: p.z,
  });
  for (let s = 0; s < profile.length - 1; s++) {
    const a = profile[s];
    const b = profile[s + 1];
    if (a.r < 1e-9 && b.r < 1e-9) continue;
    for (let i = 0; i < REVOLVE_SEGMENTS; i++) {
      const t1 = (i / REVOLVE_SEGMENTS) * Math.PI * 2;
      const t2 = ((i + 1) / REVOLVE_SEGMENTS) * Math.PI * 2;
      pushTri(triangles, at(a, t1), at(a, t2), at(b, t2));
      pushTri(triangles, at(a, t1), at(b, t2), at(b, t1));
    }
  }
}

function buildKnob(config: KnobPullConfig): number[][] {
  const triangles: number[][] = [];
  revolveProfile(triangles, knobProfile(config));
  return triangles;
}

/* ------------------------------------------------------------------ */
/* Tab: bent strip extruded across its width                           */
/* ------------------------------------------------------------------ */

export interface TabScrewStrip {
  /** Hole center along the flat run. */
  cx: number;
  /** Strip boundaries along x; the strip spans the full width. */
  xLow: number;
  xHigh: number;
}

/** Half-length of the full-width strip each screw hole occupies. */
export function tabStripHalfLength(config: TabPullConfig): number {
  return config.screwHeadDiameter / 2 + 1.4;
}

/** Screw hole centers along the tab's flat run. */
export function tabScrewPositions(config: TabPullConfig): number[] {
  if (config.mount !== "screws") return [];
  const count = Math.max(1, Math.min(2, Math.round(config.screwCount)));
  if (count === 1) return [config.baseLength / 2];
  const inset = tabStripHalfLength(config) + 1.6;
  return [inset, config.baseLength - inset];
}

/**
 * Side profile of the tab in the (x, z) plane, ordered CCW: mount face from
 * x = 0 to the bend, the outer bend arc, the blade underside, the tip, and
 * back along the top. Split points for each screw strip are kept on the two
 * straight edges of the flat run so extrusion walls can be swapped for hole
 * patches without T-junctions.
 */
export function tabProfile(config: TabPullConfig): {
  pts: Pt2[];
  strips: TabScrewStrip[];
} {
  const t = config.thickness;
  const angle = (config.tabAngle * Math.PI) / 180;
  const ro = config.bendRadius + t;
  const bendX = config.baseLength;
  const center = { x: bendX, y: ro };
  const dir = { x: Math.cos(angle), y: Math.sin(angle) };
  const normal = { x: -Math.sin(angle), y: Math.cos(angle) };

  const strips: TabScrewStrip[] = tabScrewPositions(config).map((cx) => {
    const s = tabStripHalfLength(config);
    return { cx, xLow: cx - s, xHigh: cx + s };
  });

  const pts: Pt2[] = [];
  pts.push({ x: 0, y: 0 });
  for (const strip of strips) {
    pts.push({ x: strip.xLow, y: 0 });
    pts.push({ x: strip.xHigh, y: 0 });
  }
  pts.push({ x: bendX, y: 0 });

  // Outer bend arc from the mount plane up to the blade underside.
  for (let s = 1; s <= BEND_SEGMENTS; s++) {
    const phi = (s / BEND_SEGMENTS) * angle;
    pts.push({
      x: center.x + ro * Math.sin(phi),
      y: center.y - ro * Math.cos(phi),
    });
  }

  const bladeLow = {
    x: center.x + ro * Math.sin(angle),
    y: center.y - ro * Math.cos(angle),
  };
  const tipLow = {
    x: bladeLow.x + dir.x * config.tabLength,
    y: bladeLow.y + dir.y * config.tabLength,
  };
  const tipHigh = {
    x: tipLow.x + normal.x * t,
    y: tipLow.y + normal.y * t,
  };

  if (config.tipStyle === "rounded") {
    const mid = {
      x: (tipLow.x + tipHigh.x) / 2,
      y: (tipLow.y + tipHigh.y) / 2,
    };
    for (let s = 1; s < BEND_SEGMENTS; s++) {
      const psi = -Math.PI / 2 + (s / BEND_SEGMENTS) * Math.PI;
      pts.push({
        x: mid.x + (t / 2) * (dir.x * Math.cos(psi) + normal.x * Math.sin(psi)),
        y: mid.y + (t / 2) * (dir.y * Math.cos(psi) + normal.y * Math.sin(psi)),
      });
    }
  } else {
    pts.push(tipLow);
  }
  pts.push(tipHigh);

  // Inner bend arc back down to the top of the flat run.
  const ri = config.bendRadius;
  for (let s = BEND_SEGMENTS; s >= 1; s--) {
    const phi = (s / BEND_SEGMENTS) * angle;
    pts.push({
      x: center.x + ri * Math.sin(phi),
      y: center.y - ri * Math.cos(phi),
    });
  }
  pts.push({ x: bendX, y: t });
  for (let i = strips.length - 1; i >= 0; i--) {
    pts.push({ x: strips[i].xHigh, y: t });
    pts.push({ x: strips[i].xLow, y: t });
  }
  pts.push({ x: 0, y: t });

  return { pts, strips };
}

function buildTab(config: TabPullConfig): number[][] {
  const triangles: number[][] = [];
  const { pts, strips } = tabProfile(config);
  const w = config.width / 2;
  const t = config.thickness;
  const shankR = config.screwDiameter / 2;
  const headR = config.screwHeadDiameter / 2;
  const csDepth = Math.min(Math.max(0.2, headR - shankR), t - 0.4);

  // Side caps. The CCW profile in (x, z) emits -y normals directly, so the
  // near cap (y = -w) uses the triangulation as-is and the far cap reverses.
  const capTris = triangulateSimplePolygon(pts);
  for (const [a, b, c] of capTris) {
    pushTri(
      triangles,
      { x: pts[a].x, y: -w, z: pts[a].y },
      { x: pts[b].x, y: -w, z: pts[b].y },
      { x: pts[c].x, y: -w, z: pts[c].y },
    );
    pushTri(
      triangles,
      { x: pts[a].x, y: w, z: pts[a].y },
      { x: pts[c].x, y: w, z: pts[c].y },
      { x: pts[b].x, y: w, z: pts[b].y },
    );
  }

  const isStripEdge = (a: Pt2, b: Pt2, z: number): TabScrewStrip | null => {
    if (Math.abs(a.y - z) > 1e-9 || Math.abs(b.y - z) > 1e-9) return null;
    for (const strip of strips) {
      const lo = Math.min(a.x, b.x);
      const hi = Math.max(a.x, b.x);
      if (Math.abs(lo - strip.xLow) < 1e-9 && Math.abs(hi - strip.xHigh) < 1e-9)
        return strip;
    }
    return null;
  };

  // Perimeter walls; screw strips on the flat run are replaced by patches.
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    const bottomStrip = isStripEdge(a, b, 0);
    const topStrip = isStripEdge(a, b, t);
    if (bottomStrip || topStrip) continue;
    const a1: Pt3 = { x: a.x, y: -w, z: a.y };
    const a2: Pt3 = { x: a.x, y: w, z: a.y };
    const b1: Pt3 = { x: b.x, y: -w, z: b.y };
    const b2: Pt3 = { x: b.x, y: w, z: b.y };
    pushTri(triangles, a1, b2, b1);
    pushTri(triangles, a1, a2, b2);
  }

  // Screw hole patches: countersunk on top, clearance exit on the bottom.
  for (const strip of strips) {
    const corners: Pt2[] = [
      { x: strip.xLow, y: -w },
      { x: strip.xHigh, y: -w },
      { x: strip.xHigh, y: w },
      { x: strip.xLow, y: w },
    ];
    const headCircle = circleOutline(strip.cx, 0, headR);
    const shankCircle = circleOutline(strip.cx, 0, shankR);
    buildZipperFace(triangles, corners, headCircle, t, "up");
    buildZipperFace(triangles, corners, shankCircle, 0, "down");

    const loopAt = (outline: Pt2[], z: number): Pt3[] =>
      outline.map((p) => ({ x: p.x, y: p.y, z }));
    // Countersink cone, then the straight shank bore to the mount face.
    buildLoopWall(
      triangles,
      loopAt(shankCircle, t - csDepth),
      loopAt(headCircle, t),
      "inward",
    );
    buildLoopWall(
      triangles,
      loopAt(shankCircle, 0),
      loopAt(shankCircle, t - csDepth),
      "inward",
    );
  }

  return triangles;
}

/* ------------------------------------------------------------------ */
/* Arc: circular sweep in the x-z plane                                */
/* ------------------------------------------------------------------ */

interface ArcFrame {
  /** Arc radius of the bar centerline. */
  radius: number;
  /** Center z of the arc circle (its x is 0). */
  centerZ: number;
  /** Half-angle from apex to the mount plane. */
  thetaEnd: number;
  /** Half-angle where the sweep stops and the straight foot stub begins. */
  thetaCut: number;
}

function arcFrameForSpan(config: ArcPullConfig, span: number): ArcFrame {
  const rise = config.rise;
  const half = span / 2;
  const radius = (rise * rise + half * half) / (2 * rise);
  const centerZ = rise - radius;
  const thetaEnd = Math.atan2(half, radius - rise);
  const halfDepth = arcBarDepth(config) / 2;

  // Stop the curved sweep where the whole cross-section clears the mount
  // plane; from there the bar continues as a straight stub sheared onto the
  // plane, which keeps the underside from dipping below the mount face.
  let thetaCut = thetaEnd;
  const steps = 512;
  for (let i = 0; i <= steps; i++) {
    const theta = thetaEnd * (1 - i / steps);
    const zCenter = centerZ + radius * Math.cos(theta);
    if (zCenter - halfDepth * Math.abs(Math.cos(theta)) >= 0.05) {
      thetaCut = theta;
      break;
    }
  }
  return { radius, centerZ, thetaEnd, thetaCut };
}

/**
 * Where the foot's tangent line meets the mount plane for a given sweep
 * span. Used to correct the span so the mounting holes land exactly on the
 * requested spacing.
 */
function footCenterX(config: ArcPullConfig, span: number): number {
  const frame = arcFrameForSpan(config, span);
  const theta = frame.thetaCut;
  const px = frame.radius * Math.sin(theta);
  const pz = frame.centerZ + frame.radius * Math.cos(theta);
  const tx = Math.cos(theta);
  const tz = -Math.sin(theta);
  return px - (tx * pz) / tz;
}

export function arcFrame(config: ArcPullConfig): ArcFrame & { span: number } {
  // Two-pass span correction: the straight foot stub lands slightly outside
  // the arc endpoint, so shrink the sweep span until the sheared foot
  // centers sit on the requested hole spacing.
  let span = config.holeSpacing;
  for (let pass = 0; pass < 3; pass++) {
    const x = footCenterX(config, span);
    span += config.holeSpacing - 2 * x;
    if (span < config.holeSpacing * 0.5) {
      span = config.holeSpacing * 0.5;
      break;
    }
  }
  return { ...arcFrameForSpan(config, span), span };
}

/** Bar cross-section in (u, v): u along the outward radial, v across. */
function arcCrossSection(config: ArcPullConfig): Pt2[] {
  if (config.barProfile === "round") {
    return circleOutline(0, 0, config.barDiameter / 2);
  }
  const hu = config.barDepth / 2;
  const hv = config.barWidth / 2;
  const r = Math.min(2.5, 0.3 * Math.min(config.barDepth, config.barWidth));
  const perCorner = RING_SEGMENTS / 4;
  const centers = [
    { u: hu - r, v: hv - r, start: 0 },
    { u: -hu + r, v: hv - r, start: Math.PI / 2 },
    { u: -hu + r, v: -hv + r, start: Math.PI },
    { u: hu - r, v: -hv + r, start: (3 * Math.PI) / 2 },
  ];
  const pts: Pt2[] = [];
  for (const c of centers) {
    for (let s = 0; s < perCorner; s++) {
      const a = c.start + (s / (perCorner - 1)) * (Math.PI / 2);
      pts.push({ x: c.u + r * Math.cos(a), y: c.v + r * Math.sin(a) });
    }
  }
  return pts;
}

function arcRing(
  config: ArcPullConfig,
  frame: ArcFrame,
  cross: Pt2[],
  theta: number,
): Pt3[] {
  const px = frame.radius * Math.sin(theta);
  const pz = frame.centerZ + frame.radius * Math.cos(theta);
  const nx = Math.sin(theta);
  const nz = Math.cos(theta);
  return cross.map((c) => ({
    x: px + c.x * nx,
    y: c.y,
    z: pz + c.x * nz,
  }));
}

/** Shear a ring onto the mount plane along the sweep tangent at theta. */
function shearRingToPlane(ring: Pt3[], theta: number): Pt3[] {
  const tx = Math.cos(theta);
  const tz = -Math.sin(theta);
  return ring.map((p) => ({
    x: p.x - (tx * p.z) / tz,
    y: p.y,
    z: 0,
  }));
}

/** The flat oval each arc foot stands on, in the mount plane. */
export function arcFootOutline(config: ArcPullConfig, side: 1 | -1): Pt2[] {
  const frame = arcFrame(config);
  const theta = frame.thetaCut * side;
  const ring = shearRingToPlane(
    arcRing(config, frame, arcCrossSection(config), theta),
    theta,
  );
  return ring.map((p) => ({ x: p.x, y: p.y }));
}

function buildArc(config: ArcPullConfig): number[][] {
  const triangles: number[][] = [];
  const frame = arcFrame(config);
  const cross = arcCrossSection(config);

  const rings: Pt3[][] = [];
  const startRing = arcRing(config, frame, cross, -frame.thetaCut);
  rings.push(shearRingToPlane(startRing, -frame.thetaCut));
  for (let i = 0; i <= SWEEP_STEPS; i++) {
    const theta = -frame.thetaCut + (i / SWEEP_STEPS) * (2 * frame.thetaCut);
    rings.push(arcRing(config, frame, cross, theta));
  }
  const endRing = arcRing(config, frame, cross, frame.thetaCut);
  rings.push(shearRingToPlane(endRing, frame.thetaCut));

  for (let r = 0; r < rings.length - 1; r++) {
    const a = rings[r];
    const b = rings[r + 1];
    for (let i = 0; i < a.length; i++) {
      const j = (i + 1) % a.length;
      pushTri(triangles, a[i], b[j], a[j]);
      pushTri(triangles, a[i], b[i], b[j]);
    }
  }

  // Foot caps in the mount plane, with optional pilot bores.
  for (const side of [-1, 1] as const) {
    const ring = side === -1 ? rings[0] : rings[rings.length - 1];
    let outline: Pt2[] = ring.map((p) => ({ x: p.x, y: p.y }));
    if (signedArea(outline) < 0) outline = [...outline].reverse();
    const cx = outline.reduce((s, p) => s + p.x, 0) / outline.length;
    if (config.mount === "screws") {
      const holeR = config.screwDiameter / 2;
      const hole = circleOutline(cx, 0, holeR);
      buildZipperFace(triangles, outline, hole, 0, "down");
      const loopAt = (z: number): Pt3[] =>
        hole.map((p) => ({ x: p.x, y: p.y, z }));
      buildLoopWall(
        triangles,
        loopAt(0),
        loopAt(config.screwHoleDepth),
        "inward",
      );
      buildFanFace(
        triangles,
        hole,
        { x: cx, y: 0 },
        config.screwHoleDepth,
        "down",
      );
    } else {
      buildFanFace(triangles, outline, { x: cx, y: 0 }, 0, "down");
    }
  }

  return triangles;
}

/* ------------------------------------------------------------------ */

export function generatePullTriangles(config: PullConfig): number[][] {
  switch (config.style) {
    case "knob":
      return buildKnob(config);
    case "tab":
      return buildTab(config);
    case "arc":
      return buildArc(config);
  }
}
