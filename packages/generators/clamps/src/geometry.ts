import { addTriangle } from "@mintables/shared/lib/geometry/mesh-utils";
import { armThicknessAtAngle, deriveClamp, type ClampDerived } from "./derived";
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
/** Rings used for quarter-round face and plate edge fillets. */
const FILLET_SEGMENTS = 5;
/** Samples along each structural gusset's curved outer edge. */
const GUSSET_CURVE_SEGMENTS = 12;
/** Printable height held at each gusset attachment before the taper begins. */
const GUSSET_LANDING_HEIGHT = 0.8;

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

function smoothstep01(value: number): number {
  const t = clampNum(value, 0, 1);
  return t * t * (3 - 2 * t);
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

/** Variable-radius outer arm arc with a thin spring and reinforced root. */
function outerArmArc(
  config: ClampConfig,
  centerV: number,
  boreRadius: number,
  fromAngle: number,
  toAngle: number,
): ProfilePoint[] {
  const sweep = toAngle - fromAngle;
  const count = Math.max(
    6,
    Math.ceil((Math.abs(sweep) / (2 * Math.PI)) * ARC_SEGMENTS),
  );
  const points: ProfilePoint[] = [];
  for (let i = 0; i <= count; i++) {
    const angle = fromAngle + (sweep * i) / count;
    points.push(
      fromBore(centerV, boreRadius + armThicknessAtAngle(config, angle), angle),
    );
  }
  return points;
}

/** Root-side intersection of the tapered outer arm with a neck half-width. */
function outerExitAngle(
  config: ClampConfig,
  boreRadius: number,
  neckHalf: number,
): number {
  let low = Math.PI / 2;
  let high = Math.PI;
  for (let i = 0; i < 36; i++) {
    const angle = (low + high) / 2;
    const radius = boreRadius + armThicknessAtAngle(config, angle);
    if (radius * Math.sin(angle) > neckHalf) low = angle;
    else high = angle;
  }
  return (low + high) / 2;
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
 * jaw down into the plate).
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
  // held inside the side walls and the plate's rounded top edge.
  const landHalf = Math.max(
    neckHalf * 0.6,
    Math.min(config.baseWidth / 2 - 1.2, neckHalf + 0.8 * h),
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
  const springRo = der.outerRadius;
  const rootRo = der.maxOuterRadius;
  const rc = der.armCenterRadius;
  const rb = der.tipRadius;
  const arm = springRo - R;
  const alpha = der.mouthHalfAngle;
  const zc = der.boreCenterZ;

  const isPlate = config.mount === "plate";

  // Angle at which the outer arc hands over to the neck (plate mount).
  let exitAngle = Math.PI;
  let neckHalf = 0;
  if (isPlate) {
    neckHalf = clampNum(config.neckWidth / 2, 1, rootRo * 0.98);
    exitAngle = outerExitAngle(config, R, neckHalf);
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
      lineCircleMaxS({ u: outBase.u, v: outBase.v - zc }, dir, springRo) ?? 0;
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
    const dOuter = acosSafe(
      (rc * rc + springRo * springRo - rb * rb) / (2 * rc * springRo),
    );
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
        fromBore(zc, springRo, outerStartAngle),
        Math.atan2(Math.sin(alpha), -Math.cos(alpha)),
      ),
    ];
    leftTipPieces = [
      tipArc(
        leftCenter,
        fromBore(zc, springRo, 2 * Math.PI - outerStartAngle),
        fromBore(zc, R, 2 * Math.PI - innerEndAngle),
        Math.atan2(Math.sin(alpha), Math.cos(alpha)),
      ),
    ];
  }

  const points: ProfilePoint[] = [];

  if (isPlate) {
    const exitRadius = R + armThicknessAtAngle(config, exitAngle);
    const skirt = neckSkirtInfo(config, exitRadius, zc, neckHalf, exitAngle);

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

    appendPoints(
      points,
      outerArmArc(config, zc, R, outerStartAngle, exitAngle),
    );
    appendPoints(points, neckSide(1));
    appendPoints(points, neckSide(-1));
    appendPoints(
      points,
      outerArmArc(
        config,
        zc,
        R,
        2 * Math.PI - exitAngle,
        2 * Math.PI - outerStartAngle,
      ),
    );
  } else {
    appendPoints(
      points,
      outerArmArc(
        config,
        zc,
        R,
        outerStartAngle,
        2 * Math.PI - outerStartAngle,
      ),
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
 * vertex normals. Used for the face-edge fillets; `dist` stays well below
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
 * Extrude a CCW profile from w0 to w1. With `edgeRadius` > 0 the face edges
 * turn through sampled quarter-round fillets instead of a single chamfer.
 * This removes the sharp axial stress riser and gives the bulb tips a
 * three-dimensional crown.
 */
function extrudeProfile(
  triangles: number[][],
  polyIn: ProfilePoint[],
  w0: number,
  w1: number,
  embed: Embed,
  edgeRadius = 0,
): void {
  const poly = signedArea(polyIn) < 0 ? [...polyIn].reverse() : polyIn;
  const radius = Math.min(edgeRadius, (w1 - w0) / 3);
  const useFillet = radius >= 0.15;
  const rings: { profile: ProfilePoint[]; w: number }[] = [];

  if (useFillet) {
    for (let i = 0; i <= FILLET_SEGMENTS; i++) {
      const angle = ((Math.PI / 2) * i) / FILLET_SEGMENTS;
      rings.push({
        profile: offsetInward(poly, radius * Math.cos(angle)),
        w: w0 + radius * Math.sin(angle),
      });
    }
    rings.push({ profile: poly, w: w1 - radius });
    for (let i = FILLET_SEGMENTS - 1; i >= 0; i--) {
      const angle = ((Math.PI / 2) * i) / FILLET_SEGMENTS;
      rings.push({
        profile: offsetInward(poly, radius * Math.cos(angle)),
        w: w1 - radius * Math.sin(angle),
      });
    }
  } else {
    rings.push({ profile: poly, w: w0 }, { profile: poly, w: w1 });
  }

  for (let ring = 0; ring < rings.length - 1; ring++) {
    const low = rings[ring];
    const high = rings[ring + 1];
    for (let i = 0; i < poly.length; i++) {
      const j = (i + 1) % poly.length;
      emitTriangle(
        triangles,
        embed(low.profile[i].u, low.profile[i].v, low.w),
        embed(low.profile[j].u, low.profile[j].v, low.w),
        embed(high.profile[j].u, high.profile[j].v, high.w),
      );
      emitTriangle(
        triangles,
        embed(low.profile[i].u, low.profile[i].v, low.w),
        embed(high.profile[j].u, high.profile[j].v, high.w),
        embed(high.profile[i].u, high.profile[i].v, high.w),
      );
    }
  }

  const lowCap = rings[0];
  const highCap = rings[rings.length - 1];
  const caps = triangulate(lowCap.profile);
  for (const [ia, ib, ic] of caps) {
    const a = lowCap.profile[ia];
    const b = lowCap.profile[ib];
    const cc = lowCap.profile[ic];
    emitTriangle(
      triangles,
      embed(highCap.profile[ia].u, highCap.profile[ia].v, highCap.w),
      embed(highCap.profile[ib].u, highCap.profile[ib].v, highCap.w),
      embed(highCap.profile[ic].u, highCap.profile[ic].v, highCap.w),
    );
    emitTriangle(
      triangles,
      embed(a.u, a.v, lowCap.w),
      embed(cc.u, cc.v, lowCap.w),
      embed(b.u, b.v, lowCap.w),
    );
  }
}

/* ------------------------------------------------------------------ */
/* Base plate: one solid. A stadium outline with rounded top and      */
/* bottom rims; the two screw holes are cut into the caps by splicing  */
/* their loops into the outline before triangulation.                  */
/* ------------------------------------------------------------------ */

/**
 * CCW stadium outline (two semicircle ends joined by straight sides),
 * optionally inset for the rim fillets. Every inset uses the same sample
 * count and parameterization, so loops pair index-to-index for the
 * fillet bands.
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
 * vertical wall; with different loops it forms the rim fillets.
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

/** Rounded, lightly drafted plate with both screw recesses cut through it. */
function buildPlate(config: ClampConfig): number[][] {
  const triangles: number[][] = [];
  const T = config.baseThickness;
  const draft = Math.min(0.35, config.baseWidth * 0.025);
  const recessRadius =
    config.screwRecess === "plain"
      ? config.screwDiameter / 2
      : config.headDiameter / 2;
  const holeX = config.holeSpacing / 2;
  const filletRoom = Math.min(
    config.baseWidth / 2 - recessRadius - draft - 0.6,
    config.baseLength / 2 - holeX - recessRadius - draft - 0.6,
  );
  const edgeRadius = Math.max(
    0.2,
    Math.min(1, T * 0.28, config.baseWidth * 0.08, filletRoom),
  );
  const rings: { loop: Pt2[]; z: number }[] = [];

  for (let i = 0; i <= FILLET_SEGMENTS; i++) {
    const angle = ((Math.PI / 2) * i) / FILLET_SEGMENTS;
    rings.push({
      loop: stadiumOutline(
        config.baseLength,
        config.baseWidth,
        edgeRadius * Math.cos(angle),
      ),
      z: edgeRadius * Math.sin(angle),
    });
  }
  rings.push({
    loop: stadiumOutline(config.baseLength, config.baseWidth, draft),
    z: T - edgeRadius,
  });
  for (let i = 1; i <= FILLET_SEGMENTS; i++) {
    const angle = ((Math.PI / 2) * i) / FILLET_SEGMENTS;
    rings.push({
      loop: stadiumOutline(
        config.baseLength,
        config.baseWidth,
        draft + edgeRadius * (1 - Math.cos(angle)),
      ),
      z: T - edgeRadius + edgeRadius * Math.sin(angle),
    });
  }

  for (let i = 0; i < rings.length - 1; i++) {
    outwardBand(
      triangles,
      rings[i].loop,
      rings[i + 1].loop,
      rings[i].z,
      rings[i + 1].z,
    );
  }
  const shankRadius = config.screwDiameter / 2;
  const headRadius = config.headDiameter / 2;
  const topRadius = config.screwRecess === "plain" ? shankRadius : headRadius;
  capWithHoles(
    triangles,
    rings[0].loop,
    circleCCW(holeX, shankRadius),
    circleCCW(-holeX, shankRadius),
    rings[0].z,
    "down",
  );
  const top = rings[rings.length - 1];
  capWithHoles(
    triangles,
    top.loop,
    circleCCW(holeX, topRadius),
    circleCCW(-holeX, topRadius),
    top.z,
    "up",
  );

  for (const centerX of [holeX, -holeX]) {
    const shank = circleCCW(centerX, shankRadius);
    if (config.screwRecess === "counterbore") {
      const shoulder = Math.max(0.4, T - config.headDepth);
      const head = circleCCW(centerX, headRadius);
      inwardWall(triangles, shank, shank, 0, shoulder);
      ringFace(triangles, head, shank, shoulder, "up");
      inwardWall(triangles, head, head, shoulder, T);
    } else if (config.screwRecess === "countersink") {
      const coneBase = Math.max(0.4, T - (headRadius - shankRadius));
      inwardWall(triangles, shank, shank, 0, coneBase);
      inwardWall(triangles, shank, circleCCW(centerX, headRadius), coneBase, T);
    } else if (config.screwRecess === "blended") {
      const blendStart = Math.max(0.4, T - config.headDepth);
      let previous = shank;
      let previousZ = blendStart;
      inwardWall(triangles, shank, shank, 0, blendStart);
      for (let i = 1; i <= FILLET_SEGMENTS * 2; i++) {
        const t = i / (FILLET_SEGMENTS * 2);
        const blend = t * t * (3 - 2 * t);
        const next = circleCCW(
          centerX,
          shankRadius + (headRadius - shankRadius) * blend,
        );
        const nextZ = blendStart + config.headDepth * t;
        inwardWall(triangles, previous, next, previousZ, nextZ);
        previous = next;
        previousZ = nextZ;
      }
    } else {
      inwardWall(triangles, shank, shank, 0, T);
    }
  }
  return triangles;
}

function rootGussetTop(config: ClampConfig): number {
  return config.baseThickness + Math.max(0.8, config.standoff - 0.15);
}

/**
 * Four finite-width ribs carry jaw loads around the screw pockets and into
 * the plate. Each rib has a printable toe, a tangent-ended curved web, and a
 * landing that overlaps the jaw by multiple extrusion widths. Keeping the
 * ribs outside the screw-head envelope avoids concave sliver regions.
 */
function buildRootGussets(config: ClampConfig): number[][] {
  const triangles: number[][] = [];
  const zLow = Math.max(0.2, config.baseThickness - 1);
  const zHigh = rootGussetTop(config);
  const jawHalf = config.jawWidth / 2;
  const innerX = Math.max(0.5, jawHalf - 0.8);
  // Leave a 2.2 mm printable shoulder beyond the jaw face. With only 1 mm,
  // two perimeter offsets consumed almost the entire landing and Arachne
  // emitted isolated sub-millimeter strokes on its last layers.
  const topOuterX = jawHalf + 2.2;
  const recessRadius =
    config.screwRecess === "plain"
      ? config.screwDiameter / 2
      : config.headDiameter / 2;
  const innerY = recessRadius + 0.35;
  const outerY = Math.min(config.baseWidth / 2 - 0.8, innerY + 2.2);
  const plateRadius = Math.max(0.5, config.baseWidth / 2 - 0.5);
  const plateEndCenter = config.baseLength / 2 - config.baseWidth / 2;
  const footOuterX = Math.max(
    topOuterX + 0.8,
    plateEndCenter +
      Math.sqrt(Math.max(0, plateRadius ** 2 - outerY ** 2)) -
      0.35,
  );
  const lowerLandingZ = Math.min(
    zHigh,
    config.baseThickness + GUSSET_LANDING_HEIGHT,
  );
  const upperLandingZ = Math.max(lowerLandingZ, zHigh - GUSSET_LANDING_HEIGHT);

  const rightProfile: ProfilePoint[] = [
    { u: innerX, v: zLow },
    { u: footOuterX, v: zLow },
    { u: footOuterX, v: lowerLandingZ },
  ];
  for (let i = 1; i <= GUSSET_CURVE_SEGMENTS; i++) {
    const t = i / GUSSET_CURVE_SEGMENTS;
    const blend = smoothstep01(t);
    rightProfile.push({
      u: footOuterX + (topOuterX - footOuterX) * blend,
      v: lowerLandingZ + (upperLandingZ - lowerLandingZ) * t,
    });
  }
  rightProfile.push({ u: topOuterX, v: zHigh }, { u: innerX, v: zHigh });
  const leftProfile = rightProfile.map(({ u, v }) => ({ u: -u, v }));
  const edgeRadius = Math.min(0.35, (outerY - innerY) * 0.2);
  const embed: Embed = (u, v, w) => [u, -w, v];

  for (const profile of [rightProfile, leftProfile]) {
    extrudeProfile(triangles, profile, -outerY, -innerY, embed, edgeRadius);
    extrudeProfile(triangles, profile, innerY, outerY, embed, edgeRadius);
  }
  return triangles;
}

/**
 * Build the clamp mesh (z-up).
 *
 * Plate mount: the base plate sits on the bed (z = 0 to baseThickness), the
 * rod axis runs along x at z = boreCenterZ, and the mouth opens straight up.
 * This matches the print orientation. The mesh is a union of closed solids:
 * the jaw + neck extrusion, the rounded base plate, and four root gussets.
 * The edge-closed solids overlap intentionally, matching the scan's
 * construction while staying fast enough for live parameter edits.
 *
 * Clip mount: just the jaw, extruded flat. It lies on its side (profile in
 * the x-y plane, width along z), which is also the strongest way to print
 * it: the snap flexes along the layers instead of across them.
 */
export function generateClampTriangles(config: ClampConfig): number[][] {
  const derived = deriveClamp(config);
  const profile = jawProfile(config, derived);
  const jawEdgeRadius = Math.min(
    0.8,
    config.armThickness * 0.35,
    config.jawWidth * 0.15,
  );

  if (config.mount === "clip") {
    const triangles: number[][] = [];
    extrudeProfile(
      triangles,
      profile,
      0,
      Math.max(0.4, config.jawWidth),
      (u, v, w) => [u, v, w],
      jawEdgeRadius,
    );
    return triangles;
  }

  const jaw: number[][] = [];
  const half = Math.max(0.2, config.jawWidth / 2);
  extrudeProfile(
    jaw,
    profile,
    -half,
    half,
    (u, v, w) => [w, u, v],
    jawEdgeRadius,
  );
  return [...buildPlate(config), ...buildRootGussets(config), ...jaw];
}
