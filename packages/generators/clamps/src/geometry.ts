import { addTriangle } from "@mintables/shared/lib/geometry/mesh-utils";
import { deriveClamp, type ClampDerived } from "./derived";
import type { ClampConfig } from "./types";

/** Segments for a full circle of the jaw arcs (outer wall, bore). */
const ARC_SEGMENTS = 96;
/** Segments along each tip cap arc. */
const TIP_SEGMENTS = 24;
/** Segments for a full screw-bore circle. */
const HOLE_SEGMENTS = 64;
/** Segments per stadium end cap of the base plate outline. */
const PLATE_CAP_SEGMENTS = 40;
/** Segments per straight side of the base plate outline. */
const PLATE_SIDE_SEGMENTS = 12;
/** Edge chamfer applied to the base plate's top and bottom rims (mm). */
const PLATE_CHAMFER = 0.6;

/** 2D point in the jaw profile plane: u across the mouth, v up. */
export interface ProfilePoint {
  u: number;
  v: number;
}

interface Pt2 {
  x: number;
  y: number;
}

function clampNum(x: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, x));
}

function acosSafe(x: number): number {
  return Math.acos(clampNum(x, -1, 1));
}

/** Point at `angle` radians from straight up (+v), `radius` from the bore center. */
function fromBore(
  centerV: number,
  radius: number,
  angle: number,
): ProfilePoint {
  return { u: radius * Math.sin(angle), v: centerV + radius * Math.cos(angle) };
}

/** Arc around the bore center from `fromAngle` to `toAngle` (either direction). */
function boreArc(
  centerV: number,
  radius: number,
  fromAngle: number,
  toAngle: number,
): ProfilePoint[] {
  const sweep = toAngle - fromAngle;
  const count = Math.max(
    6,
    Math.ceil((Math.abs(sweep) / (2 * Math.PI)) * ARC_SEGMENTS),
  );
  const pts: ProfilePoint[] = [];
  for (let i = 0; i <= count; i++) {
    pts.push(fromBore(centerV, radius, fromAngle + (sweep * i) / count));
  }
  return pts;
}

/**
 * Arc around a tip circle from `from` to `to`, sweeping through the direction
 * `viaAngle` (radians, atan2 convention). Used for the bulb / cap at each arm
 * end, where the correct half of the circle is the one that bulges out of
 * the mouth.
 */
function tipArc(
  center: ProfilePoint,
  from: ProfilePoint,
  to: ProfilePoint,
  viaAngle: number,
): ProfilePoint[] {
  const radius = Math.hypot(from.u - center.u, from.v - center.v);
  const a0 = Math.atan2(from.v - center.v, from.u - center.u);
  const a1 = Math.atan2(to.v - center.v, to.u - center.u);
  const twoPi = 2 * Math.PI;
  const ccw = (((a1 - a0) % twoPi) + twoPi) % twoPi || twoPi;
  const via = (((viaAngle - a0) % twoPi) + twoPi) % twoPi;
  const sweep = via <= ccw ? ccw : ccw - twoPi;
  const pts: ProfilePoint[] = [];
  for (let i = 0; i <= TIP_SEGMENTS; i++) {
    const a = a0 + (sweep * i) / TIP_SEGMENTS;
    pts.push({
      u: center.u + radius * Math.cos(a),
      v: center.v + radius * Math.sin(a),
    });
  }
  return pts;
}

/**
 * Append while dropping near-duplicate junction points. The threshold sits
 * well above the mesh vertex rounding (1e-6 mm), so no two surviving points
 * can collapse into the same rounded vertex.
 */
function appendPoints(list: ProfilePoint[], pts: ProfilePoint[]): void {
  for (const p of pts) {
    const last = list[list.length - 1];
    if (!last || Math.hypot(p.u - last.u, p.v - last.v) > 1e-4) {
      list.push(p);
    }
  }
}

function signedArea(poly: ProfilePoint[]): number {
  let sum = 0;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    sum += a.u * b.v - b.u * a.v;
  }
  return sum / 2;
}

/**
 * Largest line parameter s where `base + s * dir` crosses the circle of
 * `radius` around the origin (base is relative to the circle center).
 * Returns null when the line misses the circle.
 */
function lineCircleMaxS(
  base: ProfilePoint,
  dir: ProfilePoint,
  radius: number,
): number | null {
  const b = 2 * (base.u * dir.u + base.v * dir.v);
  const c = base.u * base.u + base.v * base.v - radius * radius;
  const disc = b * b - 4 * c;
  if (disc < 0) return null;
  return (-b + Math.sqrt(disc)) / 2;
}

/**
 * Shared construction data for the neck skirt (the S-curve that carries the
 * jaw down into the plate). Also used by the jaw-face gussets, which must
 * stay inside the skirt's silhouette.
 */
interface NeckSkirtInfo {
  zExit: number;
  zJoin: number;
  landHalf: number;
  /** Bezier control points of the right-side curve (u mirrored for left). */
  p1u: number;
  p1v: number;
  p2u: number;
  p2v: number;
  /**
   * Lower bound of the skirt's half-width over its whole height (Bezier
   * convex-hull property: the curve never goes below its control points).
   */
  waistHalfMin: number;
}

function neckSkirtInfo(
  config: ClampConfig,
  Ro: number,
  zc: number,
  neckHalf: number,
  exitAngle: number,
): NeckSkirtInfo {
  const zExit = zc - Math.sqrt(Math.max(0, Ro * Ro - neckHalf * neckHalf));
  const bury = Math.min(1, config.baseThickness * 0.25);
  const zJoin = Math.min(config.baseThickness - bury, zExit - 0.3);
  const h = Math.max(0.3, zExit - zJoin);
  // Where the skirt lands on the plate: use the room the plate offers,
  // held inside the side walls AND the plate's top edge chamfer.
  const landHalf = Math.max(
    neckHalf * 0.6,
    Math.min(config.baseWidth / 2 - PLATE_CHAMFER - 0.4, neckHalf + 0.8 * h),
  );
  // P1 continues the jaw's outer circle along its tangent; P2 sets the
  // landing direction, 20 degrees from horizontal.
  const p1u = neckHalf + Math.cos(exitAngle) * 0.25 * h;
  const p1v = zExit - Math.sin(exitAngle) * 0.25 * h;
  const landAngle = (20 * Math.PI) / 180;
  const p2u = landHalf - Math.cos(landAngle) * 0.35 * h;
  const p2v = zJoin + Math.sin(landAngle) * 0.35 * h;
  return {
    zExit,
    zJoin,
    landHalf,
    p1u,
    p1v,
    p2u,
    p2v,
    waistHalfMin: Math.min(neckHalf, landHalf, p1u, p2u),
  };
}

/**
 * Closed CCW profile of the jaw (and, for the plate mount, the neck that
 * runs down into the base). Coordinates: u across the mouth, v up, with the
 * bore center at (0, derived.boreCenterZ). The mouth opens toward +v.
 *
 * The arm has three sections, mirrored left/right:
 *
 *   seat    - the circular section around the bore, up to the wrap angle
 *   throat  - straight walls extending past the circle, leaning slightly
 *             inward, so the rod is captured in a deep channel instead of
 *             just being clipped over the top half (matches the scanned
 *             original, which grabs reliably for exactly this reason)
 *   tip     - the bulb (or half-round cap) at the end of the throat
 *
 * All joints are exact line-circle / circle-circle intersections, so the
 * boundary has no steps. With a shallow throat the tips sit directly on
 * the seat circle (the throatDepth = 0 behavior).
 */
export function jawProfile(
  config: ClampConfig,
  d?: ClampDerived,
): ProfilePoint[] {
  const der = d ?? deriveClamp(config);
  const R = der.boreRadius;
  const Ro = der.outerRadius;
  const rc = der.armCenterRadius;
  const rb = der.tipRadius;
  const arm = Ro - R;
  const alpha = der.mouthHalfAngle;
  const zc = der.boreCenterZ;

  const isPlate = config.mount === "plate";

  // Angle at which the outer arc hands over to the neck (plate mount).
  let exitAngle = Math.PI;
  let neckHalf = 0;
  if (isPlate) {
    neckHalf = clampNum(config.neckWidth / 2, 1, Ro * 0.98);
    exitAngle = Math.PI - Math.asin(neckHalf / Ro);
  }

  // Right-arm tip geometry. Everything below is expressed for the right
  // side (u > 0) and mirrored for the left.
  let outerStartAngle: number;
  let innerEndAngle: number;
  let rightTipPieces: ProfilePoint[][];
  let leftTipPieces: ProfilePoint[][];

  if (der.usesThroat) {
    const lean = der.throatLean;
    const dir = { u: -Math.sin(lean), v: Math.cos(lean) };
    const nOut = { u: Math.cos(lean), v: Math.sin(lean) };
    const seat = fromBore(zc, rc, alpha);
    const tipCenter = { u: der.tipCenterU, v: zc + der.tipCenterRise };

    // Wall base points, offset half an arm from the throat centerline.
    const outBase = {
      u: seat.u + (arm / 2) * nOut.u,
      v: seat.v + (arm / 2) * nOut.v,
    };
    const inBase = {
      u: seat.u - (arm / 2) * nOut.u,
      v: seat.v - (arm / 2) * nOut.v,
    };

    // Where the walls cross the outer and bore circles (relative to the
    // bore center). Fall back to the base points if a wall misses.
    const sOut =
      lineCircleMaxS({ u: outBase.u, v: outBase.v - zc }, dir, Ro) ?? 0;
    const sIn = lineCircleMaxS({ u: inBase.u, v: inBase.v - zc }, dir, R) ?? 0;
    const wallPoint = (base: ProfilePoint, s: number): ProfilePoint => ({
      u: base.u + s * dir.u,
      v: base.v + s * dir.v,
    });
    const jOut = wallPoint(outBase, sOut);
    const jIn = wallPoint(inBase, sIn);

    // Where the tip circle meets the walls, measured along the walls from
    // their base. Clamped so the wall segments never invert.
    const bulbTangent = Math.sqrt(Math.max(0, rb * rb - (arm / 2) * (arm / 2)));
    const sTip = Math.max(
      Math.max(sOut, sIn) + 0.05,
      Math.max(0, config.throatDepth) - bulbTangent,
    );
    const tipOut = wallPoint(outBase, sTip);
    const tipIn = wallPoint(inBase, sTip);

    outerStartAngle = Math.atan2(jOut.u, jOut.v - zc);
    innerEndAngle = Math.atan2(jIn.u, jIn.v - zc);
    const viaRight = Math.atan2(dir.v, dir.u);

    const mirror = (p: ProfilePoint): ProfilePoint => ({ u: -p.u, v: p.v });
    rightTipPieces = [
      [jIn, tipIn],
      tipArc(tipCenter, tipIn, tipOut, viaRight),
      [tipOut, jOut],
    ];
    leftTipPieces = [
      [mirror(jOut), mirror(tipOut)],
      tipArc(
        mirror(tipCenter),
        mirror(tipOut),
        mirror(tipIn),
        Math.atan2(dir.v, -dir.u),
      ),
      [mirror(tipIn), mirror(jIn)],
    ];
  } else {
    // Tips directly on the seat circle: join the tip circle to the outer
    // and bore circles at their exact circle-circle intersections.
    const dOuter = acosSafe((rc * rc + Ro * Ro - rb * rb) / (2 * rc * Ro));
    const dInner = acosSafe((rc * rc + R * R - rb * rb) / (2 * rc * R));
    // Keep the tips clear of the neck even while the user drags into an
    // invalid combination; validation reports the real error.
    const maxTip = exitAngle - 0.05;
    outerStartAngle = Math.min(alpha + dOuter, maxTip);
    innerEndAngle = Math.min(alpha + dInner, Math.PI - 0.05);

    const rightCenter = fromBore(zc, rc, alpha);
    const leftCenter = fromBore(zc, rc, 2 * Math.PI - alpha);
    rightTipPieces = [
      tipArc(
        rightCenter,
        fromBore(zc, R, innerEndAngle),
        fromBore(zc, Ro, outerStartAngle),
        Math.atan2(Math.sin(alpha), -Math.cos(alpha)),
      ),
    ];
    leftTipPieces = [
      tipArc(
        leftCenter,
        fromBore(zc, Ro, 2 * Math.PI - outerStartAngle),
        fromBore(zc, R, 2 * Math.PI - innerEndAngle),
        Math.atan2(Math.sin(alpha), Math.cos(alpha)),
      ),
    ];
  }

  const points: ProfilePoint[] = [];

  if (isPlate) {
    const skirt = neckSkirtInfo(config, Ro, zc, neckHalf, exitAngle);

    // Neck side: a tangent-continuous S-curve, like the scanned original.
    // It leaves the jaw's outer circle exactly along the circle tangent
    // (no kink), narrows into a slight waist, then flares out and lands on
    // the plate at a shallow angle. The whole lower body becomes one broad
    // fillet that spreads bending loads into the plate instead of
    // concentrating them at a corner.
    const neckSide = (side: 1 | -1): ProfilePoint[] => {
      const p0 = { u: side * neckHalf, v: skirt.zExit };
      const p1 = { u: side * skirt.p1u, v: skirt.p1v };
      const p2 = { u: side * skirt.p2u, v: skirt.p2v };
      const p3 = { u: side * skirt.landHalf, v: skirt.zJoin };
      const pts: ProfilePoint[] = [];
      for (let i = 0; i <= 16; i++) {
        const s = i / 16;
        const w0 = (1 - s) ** 3;
        const w1 = 3 * (1 - s) ** 2 * s;
        const w2 = 3 * (1 - s) * s * s;
        const w3 = s ** 3;
        pts.push({
          u: w0 * p0.u + w1 * p1.u + w2 * p2.u + w3 * p3.u,
          v: w0 * p0.v + w1 * p1.v + w2 * p2.v + w3 * p3.v,
        });
      }
      return side === 1 ? pts : pts.reverse();
    };

    appendPoints(points, boreArc(zc, Ro, outerStartAngle, exitAngle));
    appendPoints(points, neckSide(1));
    appendPoints(points, neckSide(-1));
    appendPoints(
      points,
      boreArc(zc, Ro, 2 * Math.PI - exitAngle, 2 * Math.PI - outerStartAngle),
    );
  } else {
    appendPoints(
      points,
      boreArc(zc, Ro, outerStartAngle, 2 * Math.PI - outerStartAngle),
    );
  }

  // Left tip (throat wall up, around the tip, wall back down when present).
  for (const piece of leftTipPieces) appendPoints(points, piece);

  // Bore arc, traced back from the left mouth to the right mouth.
  appendPoints(
    points,
    boreArc(zc, R, 2 * Math.PI - innerEndAngle, innerEndAngle),
  );

  // Right tip, closing back to the start of the outer arc.
  for (const piece of rightTipPieces) appendPoints(points, piece);

  // Drop a duplicated closing point, then force CCW winding.
  const first = points[0];
  const last = points[points.length - 1];
  if (Math.hypot(first.u - last.u, first.v - last.v) < 1e-4) points.pop();
  if (signedArea(points) < 0) points.reverse();
  return points;
}

/** Area enclosed by the jaw profile (mm^2), for the spec volume estimate. */
export function jawProfileArea(config: ClampConfig): number {
  return Math.abs(signedArea(jawProfile(config)));
}

/**
 * Ear-clipping triangulation of a CCW polygon. Returns index triples into
 * `poly`. Handles the "spliced" polygons produced by capWithHoles, whose
 * bridge vertices appear twice at identical coordinates: containment tests
 * ignore points that coincide with an ear corner.
 */
function triangulate(poly: ProfilePoint[]): [number, number, number][] {
  const cross = (a: ProfilePoint, b: ProfilePoint, c: ProfilePoint): number =>
    (b.u - a.u) * (c.v - a.v) - (c.u - a.u) * (b.v - a.v);
  const same = (p: ProfilePoint, q: ProfilePoint): boolean =>
    Math.abs(p.u - q.u) < 1e-9 && Math.abs(p.v - q.v) < 1e-9;
  const inTriangle = (
    p: ProfilePoint,
    a: ProfilePoint,
    b: ProfilePoint,
    c: ProfilePoint,
  ): boolean =>
    cross(a, b, p) >= -1e-12 &&
    cross(b, c, p) >= -1e-12 &&
    cross(c, a, p) >= -1e-12;

  const indices = poly.map((_, i) => i);
  const result: [number, number, number][] = [];

  while (indices.length > 3) {
    let clipped = false;
    for (let i = 0; i < indices.length; i++) {
      const ia = indices[(i + indices.length - 1) % indices.length];
      const ib = indices[i];
      const ic = indices[(i + 1) % indices.length];
      const a = poly[ia];
      const b = poly[ib];
      const c = poly[ic];
      if (cross(a, b, c) <= 1e-10) continue;
      let blocked = false;
      for (const j of indices) {
        if (j === ia || j === ib || j === ic) continue;
        const p = poly[j];
        if (same(p, a) || same(p, b) || same(p, c)) continue;
        if (inTriangle(p, a, b, c)) {
          blocked = true;
          break;
        }
      }
      if (blocked) continue;
      result.push([ia, ib, ic]);
      indices.splice(i, 1);
      clipped = true;
      break;
    }
    if (!clipped) {
      // Numeric corner case: clip the most convex remaining vertex so the
      // loop always terminates. Only reachable on degenerate input.
      let best = 0;
      let bestCross = -Infinity;
      for (let i = 0; i < indices.length; i++) {
        const ia = indices[(i + indices.length - 1) % indices.length];
        const ib = indices[i];
        const ic = indices[(i + 1) % indices.length];
        const cr = cross(poly[ia], poly[ib], poly[ic]);
        if (cr > bestCross) {
          bestCross = cr;
          best = i;
        }
      }
      const ia = indices[(best + indices.length - 1) % indices.length];
      const ib = indices[best];
      const ic = indices[(best + 1) % indices.length];
      result.push([ia, ib, ic]);
      indices.splice(best, 1);
    }
  }
  result.push([indices[0], indices[1], indices[2]]);
  return result;
}

/**
 * Offset a CCW polygon inward (into the material) by `dist`, using mitered
 * vertex normals. Used for the face-edge chamfers; `dist` stays well below
 * the thinnest local feature (validated arm thickness), so the offset
 * cannot fold over itself.
 */
function offsetInward(poly: ProfilePoint[], dist: number): ProfilePoint[] {
  const n = poly.length;
  const out: ProfilePoint[] = [];
  for (let i = 0; i < n; i++) {
    const prev = poly[(i + n - 1) % n];
    const cur = poly[i];
    const next = poly[(i + 1) % n];
    const l1 = Math.hypot(cur.u - prev.u, cur.v - prev.v) || 1;
    const l2 = Math.hypot(next.u - cur.u, next.v - cur.v) || 1;
    // Inward (left-hand) normals of the two adjacent edges.
    const n1 = { u: -(cur.v - prev.v) / l1, v: (cur.u - prev.u) / l1 };
    const n2 = { u: -(next.v - cur.v) / l2, v: (next.u - cur.u) / l2 };
    let mu = n1.u + n2.u;
    let mv = n1.v + n2.v;
    const ml = Math.hypot(mu, mv);
    if (ml < 1e-9) {
      mu = n1.u;
      mv = n1.v;
    } else {
      mu /= ml;
      mv /= ml;
    }
    // Miter scale, capped so near-reversals cannot spike.
    const cosHalf = Math.max(
      0.35,
      Math.sqrt(Math.max(0, (1 + n1.u * n2.u + n1.v * n2.v) / 2)),
    );
    const s = dist / cosHalf;
    out.push({ u: cur.u + mu * s, v: cur.v + mv * s });
  }
  return out;
}

/**
 * Right-handed embedding of the profile plane (u, v) plus extrusion
 * coordinate w into model space. u cross v must point along +w.
 */
type Embed = (u: number, v: number, w: number) => [number, number, number];

function emitTriangle(
  triangles: number[][],
  a: [number, number, number],
  b: [number, number, number],
  c: [number, number, number],
): void {
  addTriangle(triangles, a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);
}

/**
 * Extrude a CCW profile from w0 to w1. With `chamfer` > 0 the profile-to-cap
 * edges are broken by a 45 degree chamfer band: the caps shrink to an inward
 * offset of the profile and the side wall stops `chamfer` short of each end.
 */
function extrudeProfile(
  triangles: number[][],
  polyIn: ProfilePoint[],
  w0: number,
  w1: number,
  embed: Embed,
  chamfer = 0,
): void {
  const poly = signedArea(polyIn) < 0 ? [...polyIn].reverse() : polyIn;
  const n = poly.length;
  const c = Math.min(chamfer, (w1 - w0) / 3);
  const useChamfer = c >= 0.15;
  const capPoly = useChamfer ? offsetInward(poly, c) : poly;
  const caps = triangulate(capPoly);
  const wallLo = useChamfer ? w0 + c : w0;
  const wallHi = useChamfer ? w1 - c : w1;

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const a = poly[i];
    const b = poly[j];
    emitTriangle(
      triangles,
      embed(a.u, a.v, wallLo),
      embed(b.u, b.v, wallLo),
      embed(b.u, b.v, wallHi),
    );
    emitTriangle(
      triangles,
      embed(a.u, a.v, wallLo),
      embed(b.u, b.v, wallHi),
      embed(a.u, a.v, wallHi),
    );
    if (useChamfer) {
      const ai = capPoly[i];
      const bi = capPoly[j];
      // Lower chamfer band: inset ring at w0 out to the full profile.
      emitTriangle(
        triangles,
        embed(ai.u, ai.v, w0),
        embed(bi.u, bi.v, w0),
        embed(b.u, b.v, wallLo),
      );
      emitTriangle(
        triangles,
        embed(ai.u, ai.v, w0),
        embed(b.u, b.v, wallLo),
        embed(a.u, a.v, wallLo),
      );
      // Upper chamfer band: full profile back in to the inset ring at w1.
      emitTriangle(
        triangles,
        embed(a.u, a.v, wallHi),
        embed(b.u, b.v, wallHi),
        embed(bi.u, bi.v, w1),
      );
      emitTriangle(
        triangles,
        embed(a.u, a.v, wallHi),
        embed(bi.u, bi.v, w1),
        embed(ai.u, ai.v, w1),
      );
    }
  }

  for (const [ia, ib, ic] of caps) {
    const a = capPoly[ia];
    const b = capPoly[ib];
    const cc = capPoly[ic];
    emitTriangle(
      triangles,
      embed(a.u, a.v, w1),
      embed(b.u, b.v, w1),
      embed(cc.u, cc.v, w1),
    );
    emitTriangle(
      triangles,
      embed(a.u, a.v, w0),
      embed(cc.u, cc.v, w0),
      embed(b.u, b.v, w0),
    );
  }
}

/* ------------------------------------------------------------------ */
/* Base plate: one solid. A stadium outline with chamfered top and     */
/* bottom rims; the two screw holes are cut into the caps by splicing  */
/* their loops into the outline before triangulation.                  */
/* ------------------------------------------------------------------ */

/**
 * CCW stadium outline (two semicircle ends joined by straight sides),
 * optionally inset for the rim chamfers. Every inset uses the same sample
 * count and parameterization, so loops pair index-to-index for the
 * chamfer bands.
 */
function stadiumOutline(L: number, W: number, inset: number): Pt2[] {
  const hw = Math.max(0.5, W / 2 - inset);
  const ec = Math.max(0.1, L / 2 - W / 2);
  const pts: Pt2[] = [];
  for (let i = 0; i <= PLATE_CAP_SEGMENTS; i++) {
    const a = -Math.PI / 2 + (Math.PI * i) / PLATE_CAP_SEGMENTS;
    pts.push({ x: ec + hw * Math.cos(a), y: hw * Math.sin(a) });
  }
  for (let i = 1; i < PLATE_SIDE_SEGMENTS; i++) {
    pts.push({ x: ec - (2 * ec * i) / PLATE_SIDE_SEGMENTS, y: hw });
  }
  for (let i = 0; i <= PLATE_CAP_SEGMENTS; i++) {
    const a = Math.PI / 2 + (Math.PI * i) / PLATE_CAP_SEGMENTS;
    pts.push({ x: -ec + hw * Math.cos(a), y: hw * Math.sin(a) });
  }
  for (let i = 1; i < PLATE_SIDE_SEGMENTS; i++) {
    pts.push({ x: -ec + (2 * ec * i) / PLATE_SIDE_SEGMENTS, y: -hw });
  }
  return pts;
}

/** CCW circle around (cx, 0). */
function circleCCW(cx: number, radius: number): Pt2[] {
  const pts: Pt2[] = [];
  for (let i = 0; i < HOLE_SEGMENTS; i++) {
    const a = (2 * Math.PI * i) / HOLE_SEGMENTS;
    pts.push({ x: cx + radius * Math.cos(a), y: radius * Math.sin(a) });
  }
  return pts;
}

/** Ring of quads between two loops sampled at the same angles, facing up or down. */
function ringFace(
  triangles: number[][],
  outer: Pt2[],
  inner: Pt2[],
  z: number,
  facing: "up" | "down",
): void {
  const n = outer.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    if (facing === "up") {
      addTriangle(
        triangles,
        outer[i].x,
        outer[i].y,
        z,
        outer[j].x,
        outer[j].y,
        z,
        inner[i].x,
        inner[i].y,
        z,
      );
      addTriangle(
        triangles,
        outer[j].x,
        outer[j].y,
        z,
        inner[j].x,
        inner[j].y,
        z,
        inner[i].x,
        inner[i].y,
        z,
      );
    } else {
      addTriangle(
        triangles,
        outer[i].x,
        outer[i].y,
        z,
        inner[i].x,
        inner[i].y,
        z,
        outer[j].x,
        outer[j].y,
        z,
      );
      addTriangle(
        triangles,
        outer[j].x,
        outer[j].y,
        z,
        inner[i].x,
        inner[i].y,
        z,
        inner[j].x,
        inner[j].y,
        z,
      );
    }
  }
}

/**
 * Band of quads between two CCW loops with matched sample counts, normals
 * pointing away from the loop interiors. With low = high this is a plain
 * vertical wall; with different loops it forms the rim chamfers.
 */
function outwardBand(
  triangles: number[][],
  low: Pt2[],
  high: Pt2[],
  zLow: number,
  zHigh: number,
): void {
  const n = low.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    addTriangle(
      triangles,
      low[i].x,
      low[i].y,
      zLow,
      low[j].x,
      low[j].y,
      zLow,
      high[j].x,
      high[j].y,
      zHigh,
    );
    addTriangle(
      triangles,
      low[i].x,
      low[i].y,
      zLow,
      high[j].x,
      high[j].y,
      zHigh,
      high[i].x,
      high[i].y,
      zHigh,
    );
  }
}

/** Vertical or tapered bore wall between two CCW loops, normals facing the bore. */
function inwardWall(
  triangles: number[][],
  low: Pt2[],
  high: Pt2[],
  z0: number,
  z1: number,
): void {
  const n = low.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    addTriangle(
      triangles,
      low[i].x,
      low[i].y,
      z0,
      high[i].x,
      high[i].y,
      z1,
      low[j].x,
      low[j].y,
      z0,
    );
    addTriangle(
      triangles,
      low[j].x,
      low[j].y,
      z0,
      high[i].x,
      high[i].y,
      z1,
      high[j].x,
      high[j].y,
      z1,
    );
  }
}

/**
 * Splice a hole loop into a CCW polygon with a zero-width bridge toward the
 * nearest polygon vertex in the +x or -x direction. Our holes sit well
 * inside the outline with validated rims, so the straight bridge is always
 * unobstructed.
 */
function spliceHole(
  poly: Pt2[],
  holeCCW: Pt2[],
  towardPositiveX: boolean,
): Pt2[] {
  const hole = [...holeCCW].reverse(); // CW, so the cap interior stays left of travel
  let hIdx = 0;
  for (let i = 1; i < hole.length; i++) {
    if (towardPositiveX ? hole[i].x > hole[hIdx].x : hole[i].x < hole[hIdx].x) {
      hIdx = i;
    }
  }
  const bridgeFrom = hole[hIdx];
  let vIdx = -1;
  let best = Infinity;
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i];
    if (towardPositiveX ? p.x <= bridgeFrom.x : p.x >= bridgeFrom.x) continue;
    const dd = (p.x - bridgeFrom.x) ** 2 + (p.y - bridgeFrom.y) ** 2;
    if (dd < best) {
      best = dd;
      vIdx = i;
    }
  }
  if (vIdx < 0) return poly;
  const rotated = [...hole.slice(hIdx), ...hole.slice(0, hIdx)];
  return [
    ...poly.slice(0, vIdx + 1),
    ...rotated,
    { ...bridgeFrom },
    { ...poly[vIdx] },
    ...poly.slice(vIdx + 1),
  ];
}

/** Flat plate cap at height z with both screw holes cut out. */
function capWithHoles(
  triangles: number[][],
  outline: Pt2[],
  holeRight: Pt2[],
  holeLeft: Pt2[],
  z: number,
  facing: "up" | "down",
): void {
  let poly = [...outline];
  poly = spliceHole(poly, holeRight, true);
  poly = spliceHole(poly, holeLeft, false);
  const asProfile = poly.map((p) => ({ u: p.x, v: p.y }));
  for (const [ia, ib, ic] of triangulate(asProfile)) {
    const a = poly[ia];
    const b = poly[ib];
    const c = poly[ic];
    if (facing === "up") {
      addTriangle(triangles, a.x, a.y, z, b.x, b.y, z, c.x, c.y, z);
    } else {
      addTriangle(triangles, a.x, a.y, z, c.x, c.y, z, b.x, b.y, z);
    }
  }
}

/**
 * The screw-on base plate as a single watertight solid: chamfered stadium
 * rim, caps triangulated around the two screw holes, and the hole internals
 * (bore, counterbore, or countersink). The holes themselves keep sharp
 * edges on purpose: recess rims must stay flat for the screw head.
 */
function buildPlate(triangles: number[][], config: ClampConfig): void {
  const T = config.baseThickness;
  const cCh = Math.min(PLATE_CHAMFER, T * 0.25);
  const outerFull = stadiumOutline(config.baseLength, config.baseWidth, 0);
  const outerInset = stadiumOutline(config.baseLength, config.baseWidth, cCh);

  outwardBand(triangles, outerInset, outerFull, 0, cCh);
  outwardBand(triangles, outerFull, outerFull, cCh, T - cCh);
  outwardBand(triangles, outerFull, outerInset, T - cCh, T);

  const rs = config.screwDiameter / 2;
  const rh = config.headDiameter / 2;
  const rTop = config.screwRecess === "plain" ? rs : rh;
  const hx = Math.max(config.jawWidth / 2 + 0.5, config.holeSpacing / 2);

  capWithHoles(
    triangles,
    outerInset,
    circleCCW(hx, rs),
    circleCCW(-hx, rs),
    0,
    "down",
  );
  capWithHoles(
    triangles,
    outerInset,
    circleCCW(hx, rTop),
    circleCCW(-hx, rTop),
    T,
    "up",
  );

  for (const cx of [hx, -hx]) {
    const screwLoop = circleCCW(cx, rs);
    if (config.screwRecess === "counterbore") {
      const shoulder = Math.max(0.4, T - config.headDepth);
      const headLoop = circleCCW(cx, rh);
      inwardWall(triangles, screwLoop, screwLoop, 0, shoulder);
      ringFace(triangles, headLoop, screwLoop, shoulder, "up");
      inwardWall(triangles, headLoop, headLoop, shoulder, T);
    } else if (config.screwRecess === "countersink") {
      // 90 degree included angle: the cone rises by the radius difference.
      const coneBase = Math.max(0.4, T - Math.max(0.1, rh - rs));
      const headLoop = circleCCW(cx, rh);
      inwardWall(triangles, screwLoop, screwLoop, 0, coneBase);
      inwardWall(triangles, screwLoop, headLoop, coneBase, T);
    } else {
      inwardWall(triangles, screwLoop, screwLoop, 0, T);
    }
  }
}

/** Mirror triangles across x = 0, flipping winding to keep normals outward. */
function mirrorX(triangles: number[][], source: number[][]): void {
  for (const t of source) {
    addTriangle(
      triangles,
      -t[0],
      t[1],
      t[2],
      -t[6],
      t[7],
      t[8],
      -t[3],
      t[4],
      t[5],
    );
  }
}

/**
 * Build the clamp mesh (z-up).
 *
 * Plate mount: the base plate sits on the bed (z = 0 to baseThickness), the
 * rod axis runs along x at z = boreCenterZ, and the mouth opens straight up.
 * This matches the print orientation. The mesh is a union of closed solids:
 * the jaw + neck extrusion, the one-piece base plate, and the two jaw-face
 * gussets, all overlapping into each other. Exposed body edges carry
 * chamfers; only the screw recesses stay sharp.
 *
 * Clip mount: just the jaw, extruded flat. It lies on its side (profile in
 * the x-y plane, width along z), which is also the strongest way to print
 * it: the snap flexes along the layers instead of across them.
 */
export function generateClampTriangles(config: ClampConfig): number[][] {
  const derived = deriveClamp(config);
  const triangles: number[][] = [];
  const profile = jawProfile(config, derived);
  const jawChamfer = Math.min(
    0.5,
    config.armThickness * 0.35,
    config.jawWidth * 0.15,
  );

  if (config.mount === "clip") {
    extrudeProfile(
      triangles,
      profile,
      0,
      Math.max(0.4, config.jawWidth),
      (u, v, w) => [u, v, w],
      jawChamfer,
    );
    return triangles;
  }

  const half = Math.max(0.2, config.jawWidth / 2);
  extrudeProfile(
    triangles,
    profile,
    -half,
    half,
    (u, v, w) => [w, u, v],
    jawChamfer,
  );
  buildPlate(triangles, config);
  buildFaceGussets(triangles, config, derived);

  return triangles;
}

/**
 * Concave fillet gussets where the jaw's flat end faces meet the plate,
 * facing the screw holes. They blend the last hard corner of the body into
 * the plate so bending loads along the rod axis spread instead of
 * concentrating at the face-plate junction. The radius auto-sizes to the
 * room the screw recesses leave (the head must still drop in from above)
 * and the gussets vanish when the holes sit too close.
 */
function buildFaceGussets(
  triangles: number[][],
  config: ClampConfig,
  der: ClampDerived,
): void {
  const x0 = config.jawWidth / 2;
  const recessRadius =
    config.screwRecess === "plain"
      ? config.screwDiameter / 2
      : config.headDiameter / 2;
  const room = config.holeSpacing / 2 - recessRadius - x0 - 0.3;
  const radius = Math.min(3, room);
  if (radius < 0.4) return;

  const T = config.baseThickness;
  const neckHalf = clampNum(config.neckWidth / 2, 1, der.outerRadius * 0.98);
  const exitAngle = Math.PI - Math.asin(neckHalf / der.outerRadius);
  const skirt = neckSkirtInfo(
    config,
    der.outerRadius,
    der.boreCenterZ,
    neckHalf,
    exitAngle,
  );
  const gwHalf = Math.min(skirt.waistHalfMin - 0.3, config.baseWidth / 2 - 0.6);
  if (gwHalf < 1) return;

  // Profile in the (x, z) plane: buried into the jaw and plate, with a
  // quarter-circle fillet from the plate top up the jaw face.
  const buriedX = x0 - 0.8;
  const zLow = Math.min(T - 0.2, skirt.zJoin + 0.15);
  const profile: ProfilePoint[] = [
    { u: buriedX, v: zLow },
    { u: x0 + radius, v: zLow },
  ];
  for (let i = 0; i <= 10; i++) {
    const a = (Math.PI / 2) * (i / 10);
    profile.push({
      u: x0 + radius - radius * Math.sin(a),
      v: T + radius - radius * Math.cos(a),
    });
  }
  profile.push({ u: buriedX, v: T + radius });

  // Right-handed embed: profile u along +x, v along +z, extrusion along -y
  // (symmetric range, so the solid is the same as extruding along +y).
  const gusset: number[][] = [];
  extrudeProfile(
    gusset,
    profile,
    -gwHalf,
    gwHalf,
    (u, v, w) => [u, -w, v],
    0.35,
  );
  triangles.push(...gusset);
  mirrorX(triangles, gusset);
}
