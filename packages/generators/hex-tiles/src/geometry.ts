import { ShapeUtils, Vector2 } from "three";
import { addTriangle } from "@mintables/shared/lib/geometry/mesh-utils";
import {
  CUSTOM_TEXTURE_RESOLUTION,
  decodeCustomTextureSamples,
} from "./custom-height-map";
import {
  calculateHexTileLayout,
  throughChannels,
  cardSlotPlan,
  type CardChannel,
} from "./layout";
import type { HexTileConfig } from "./types";

interface Point2 {
  x: number;
  y: number;
}

type Point3 = [number, number, number];

interface SideFrame {
  midpoint: Point2;
  tangent: Point2;
  outward: Point2;
  inward: Point2;
  length: number;
}

interface TextureGroove {
  outline: Point2[];
  depthScale: number;
}

const CURVE_SEGMENTS = 64;
const WELL_RINGS = 6;
const ROUNDED_HEX_SEGMENTS = 10;
const BOWL_CORNER_SEGMENTS = 10;
const DECK_WELL_MIN_INRADIUS = 5;
const MIN_CORNER_RADIUS = 0.4;
const ROLL_FILLET_RINGS = 5;
const BOWL_CURVE_WIDTH = 12;
const TEXTURE_EDGE_MARGIN = 0.45;
const TEXTURE_FEATURE_MARGIN = 0.75;

/**
 * Corner coordinates are written out rather than derived from cos/sin so the
 * two flats facing +Y and -Y are exactly horizontal. Through channels cut into
 * those flats and rely on the shared edge coordinates matching to the bit.
 */
function regularHex(acrossFlats: number): Point2[] {
  const circumradius = acrossFlats / Math.sqrt(3);
  const apothem = hexApothem(acrossFlats);
  const halfFlat = circumradius / 2;
  return [
    { x: circumradius, y: 0 },
    { x: halfFlat, y: apothem },
    { x: -halfFlat, y: apothem },
    { x: -circumradius, y: 0 },
    { x: -halfFlat, y: -apothem },
    { x: halfFlat, y: -apothem },
  ];
}

function hexApothem(acrossFlats: number): number {
  return acrossFlats / 2;
}

/**
 * A hexagon with arcs at the corners. Insetting one by d is the same shape
 * with `acrossFlats - 2d` and `cornerRadius - d`: the arc centers hold still,
 * so rings taken at different insets line up point for point and can be walled
 * together directly.
 */
function roundedHex(
  acrossFlats: number,
  cornerRadius: number,
  segmentsPerCorner = ROUNDED_HEX_SEGMENTS,
): Point2[] {
  const circumradius = acrossFlats / Math.sqrt(3);
  const radius = Math.max(MIN_CORNER_RADIUS, cornerRadius);
  const centerDistance = circumradius - radius / Math.sin(Math.PI / 3);
  const points: Point2[] = [];
  for (let corner = 0; corner < 6; corner++) {
    const cornerAngle = (corner * Math.PI) / 3;
    const centerX = centerDistance * Math.cos(cornerAngle);
    const centerY = centerDistance * Math.sin(cornerAngle);
    for (let step = 0; step <= segmentsPerCorner; step++) {
      const angle =
        cornerAngle - Math.PI / 6 + (step / segmentsPerCorner) * (Math.PI / 3);
      points.push({
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      });
    }
  }
  return points;
}

function ellipseOutline(
  radiusX: number,
  radiusY: number,
  centerX = 0,
  centerY = 0,
  rotation = 0,
  segments = CURVE_SEGMENTS,
): Point2[] {
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  return Array.from({ length: segments }, (_, index) => {
    const angle = (index / segments) * Math.PI * 2;
    const x = radiusX * Math.cos(angle);
    const y = radiusY * Math.sin(angle);
    return {
      x: centerX + x * cos - y * sin,
      y: centerY + x * sin + y * cos,
    };
  });
}

function pointInPolygon(point: Point2, polygon: Point2[]): boolean {
  let inside = false;
  for (
    let current = 0, previous = polygon.length - 1;
    current < polygon.length;
    previous = current++
  ) {
    const a = polygon[current];
    const b = polygon[previous];
    const crosses =
      a.y > point.y !== b.y > point.y &&
      point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x;
    if (crosses) inside = !inside;
  }
  return inside;
}

function distanceToSegment(point: Point2, a: Point2, b: Point2): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared === 0) return Math.hypot(point.x - a.x, point.y - a.y);
  const progress = Math.max(
    0,
    Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / lengthSquared),
  );
  return Math.hypot(
    point.x - (a.x + progress * dx),
    point.y - (a.y + progress * dy),
  );
}

function distanceToOutline(point: Point2, outline: Point2[]): number {
  let distance = Number.POSITIVE_INFINITY;
  for (let index = 0; index < outline.length; index++) {
    distance = Math.min(
      distance,
      distanceToSegment(
        point,
        outline[index],
        outline[(index + 1) % outline.length],
      ),
    );
  }
  return distance;
}

function segmentsIntersect(
  a: Point2,
  b: Point2,
  c: Point2,
  d: Point2,
): boolean {
  const epsilon = 1e-9;
  const cross2d = (origin: Point2, first: Point2, second: Point2) =>
    (first.x - origin.x) * (second.y - origin.y) -
    (first.y - origin.y) * (second.x - origin.x);
  const onSegment = (point: Point2, start: Point2, end: Point2) =>
    point.x >= Math.min(start.x, end.x) - epsilon &&
    point.x <= Math.max(start.x, end.x) + epsilon &&
    point.y >= Math.min(start.y, end.y) - epsilon &&
    point.y <= Math.max(start.y, end.y) + epsilon;
  const abC = cross2d(a, b, c);
  const abD = cross2d(a, b, d);
  const cdA = cross2d(c, d, a);
  const cdB = cross2d(c, d, b);
  if (
    ((abC > epsilon && abD < -epsilon) || (abC < -epsilon && abD > epsilon)) &&
    ((cdA > epsilon && cdB < -epsilon) || (cdA < -epsilon && cdB > epsilon))
  ) {
    return true;
  }
  return (
    (Math.abs(abC) <= epsilon && onSegment(c, a, b)) ||
    (Math.abs(abD) <= epsilon && onSegment(d, a, b)) ||
    (Math.abs(cdA) <= epsilon && onSegment(a, c, d)) ||
    (Math.abs(cdB) <= epsilon && onSegment(b, c, d))
  );
}

function distanceBetweenOutlines(a: Point2[], b: Point2[]): number {
  let distance = Number.POSITIVE_INFINITY;
  for (let aIndex = 0; aIndex < a.length; aIndex++) {
    const aStart = a[aIndex];
    const aEnd = a[(aIndex + 1) % a.length];
    for (let bIndex = 0; bIndex < b.length; bIndex++) {
      const bStart = b[bIndex];
      const bEnd = b[(bIndex + 1) % b.length];
      if (segmentsIntersect(aStart, aEnd, bStart, bEnd)) return 0;
      distance = Math.min(
        distance,
        distanceToSegment(aStart, bStart, bEnd),
        distanceToSegment(aEnd, bStart, bEnd),
        distanceToSegment(bStart, aStart, aEnd),
        distanceToSegment(bEnd, aStart, aEnd),
      );
    }
  }
  return distance;
}

function textureCandidateFits(
  candidate: Point2[],
  outer: Point2[],
  blocked: Point2[][],
): boolean {
  const samples = [...candidate, centroid(candidate)];
  const insideOuter = samples.every(
    (point) =>
      pointInPolygon(point, outer) &&
      distanceToOutline(point, outer) >= TEXTURE_EDGE_MARGIN,
  );
  return (
    insideOuter &&
    blocked.every(
      (outline) =>
        samples.every((point) => !pointInPolygon(point, outline)) &&
        !outline.some((blockedPoint) =>
          pointInPolygon(blockedPoint, candidate),
        ) &&
        distanceBetweenOutlines(candidate, outline) >= TEXTURE_FEATURE_MARGIN,
    )
  );
}

function patternHash(x: number, y: number, seed: number): number {
  const value = Math.sin(x * 12.9898 + y * 78.233 + seed * 37.719);
  return value * 43758.5453 - Math.floor(value * 43758.5453);
}

function patternBounds(outline: Point2[]): {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
} {
  return {
    minX: Math.min(...outline.map((point) => point.x)),
    maxX: Math.max(...outline.map((point) => point.x)),
    minY: Math.min(...outline.map((point) => point.y)),
    maxY: Math.max(...outline.map((point) => point.y)),
  };
}

function woodGrainCandidates(outer: Point2[]): Point2[][] {
  const bounds = patternBounds(outer);
  const candidates: Point2[][] = [];
  let row = 0;
  for (let y = bounds.minY + 2; y <= bounds.maxY - 2; y += 3.5) {
    let column = 0;
    for (
      let x = bounds.minX + 3 + (row % 2) * 5.2;
      x <= bounds.maxX - 2;
      x += 10.4
    ) {
      const variation = patternHash(column, row, 1);
      candidates.push(
        ellipseOutline(
          4.2 + variation * 0.7,
          0.24 + variation * 0.07,
          x,
          y + Math.sin(x * 0.09) * 0.45,
          (variation - 0.5) * 0.16,
          16,
        ),
      );
      column++;
    }
    row++;
  }
  return candidates;
}

function cobblestoneCandidates(outer: Point2[]): Point2[][] {
  const bounds = patternBounds(outer);
  const candidates: Point2[][] = [];
  const stoneWidth = 7.2;
  const stoneHeight = 5.6;
  let row = 0;
  for (let y = bounds.minY + 2; y <= bounds.maxY - 2; y += stoneHeight) {
    let column = 0;
    for (
      let x = bounds.minX + 2 + (row % 2) * (stoneWidth / 2);
      x <= bounds.maxX - 2;
      x += stoneWidth
    ) {
      const variation = patternHash(column, row, 2);
      candidates.push(
        ellipseOutline(
          stoneWidth / 2 - 0.75,
          0.3 + variation * 0.07,
          x,
          y + (variation - 0.5) * 0.25,
          (variation - 0.5) * 0.05,
          16,
        ),
      );
      column++;
    }
    row++;
  }

  row = 0;
  for (
    let y = bounds.minY + 2 + stoneHeight / 2;
    y <= bounds.maxY - 2;
    y += stoneHeight
  ) {
    let column = 0;
    for (
      let x = bounds.minX + 2 + (row % 2) * (stoneWidth / 2);
      x <= bounds.maxX - 2;
      x += stoneWidth
    ) {
      const variation = patternHash(column, row, 3);
      candidates.push(
        ellipseOutline(
          0.28 + variation * 0.05,
          stoneHeight / 2 - 0.65,
          x + stoneWidth / 2 + (variation - 0.5) * 0.2,
          y,
          (variation - 0.5) * 0.06,
          16,
        ),
      );
      column++;
    }
    row++;
  }
  return candidates;
}

function hammeredStoneCandidates(outer: Point2[]): Point2[][] {
  const bounds = patternBounds(outer);
  const candidates: Point2[][] = [];
  let row = 0;
  for (let y = bounds.minY + 1.5; y <= bounds.maxY - 1.5; y += 4.1) {
    let column = 0;
    for (
      let x = bounds.minX + 1.5 + (row % 2) * 2;
      x <= bounds.maxX - 1.5;
      x += 4.1
    ) {
      const variation = patternHash(column, row, 4);
      candidates.push(
        ellipseOutline(
          0.55 + variation * 0.35,
          0.48 + patternHash(column, row, 5) * 0.3,
          x + (variation - 0.5) * 0.7,
          y + (patternHash(column, row, 6) - 0.5) * 0.7,
          variation * Math.PI,
          14,
        ),
      );
      column++;
    }
    row++;
  }
  return candidates;
}

function sciFiPanelCandidates(outer: Point2[]): Point2[][] {
  const bounds = patternBounds(outer);
  const candidates: Point2[][] = [];
  let row = 0;
  for (let y = bounds.minY + 3; y <= bounds.maxY - 3; y += 9) {
    let column = 0;
    for (
      let x = bounds.minX + 3 + (row % 2) * 4.5;
      x <= bounds.maxX - 3;
      x += 9
    ) {
      const rotation = ((column + row) % 3) * (Math.PI / 3);
      candidates.push(ellipseOutline(2.8, 0.32, x, y - 1.15, rotation, 16));
      const offsetAngle = rotation + Math.PI / 2;
      candidates.push(
        ellipseOutline(
          0.62,
          0.62,
          x + Math.cos(offsetAngle) * 2.1,
          y - 1.15 + Math.sin(offsetAngle) * 2.1,
          0,
          14,
        ),
      );
      column++;
    }
    row++;
  }
  return candidates;
}

function customHeightMapCandidates(
  config: HexTileConfig,
  outer: Point2[],
): TextureGroove[] {
  const samples = decodeCustomTextureSamples(config.customTextureData);
  if (!samples) return [];
  const bounds = patternBounds(outer);
  const cellWidth = (bounds.maxX - bounds.minX) / CUSTOM_TEXTURE_RESOLUTION;
  const cellHeight = (bounds.maxY - bounds.minY) / CUSTOM_TEXTURE_RESOLUTION;
  const grooves: TextureGroove[] = [];

  for (let row = 0; row < CUSTOM_TEXTURE_RESOLUTION; row++) {
    for (let column = 0; column < CUSTOM_TEXTURE_RESOLUTION; column++) {
      const sample = samples[row * CUSTOM_TEXTURE_RESOLUTION + column] / 255;
      const recess = config.isCustomTextureInverted ? sample : 1 - sample;
      if (recess < 0.08) continue;
      grooves.push({
        outline: ellipseOutline(
          cellWidth * 0.39,
          cellHeight * 0.39,
          bounds.minX + (column + 0.5) * cellWidth,
          bounds.maxY - (row + 0.5) * cellHeight,
          0,
          8,
        ),
        depthScale: Math.max(0.2, recess),
      });
    }
  }
  return grooves;
}

function surfaceTextureGrooves(
  config: HexTileConfig,
  outer: Point2[],
  blocked: Point2[][],
): TextureGroove[] {
  if (!config.isSurfaceTextureEnabled) return [];
  let candidates: TextureGroove[];
  switch (config.surfaceTexture) {
    case "wood-grain":
      candidates = woodGrainCandidates(outer).map((outline) => ({
        outline,
        depthScale: 1,
      }));
      break;
    case "cobblestone":
      candidates = cobblestoneCandidates(outer).map((outline) => ({
        outline,
        depthScale: 1,
      }));
      break;
    case "hammered-stone":
      candidates = hammeredStoneCandidates(outer).map((outline) => ({
        outline,
        depthScale: 1,
      }));
      break;
    case "sci-fi-panels":
      candidates = sciFiPanelCandidates(outer).map((outline) => ({
        outline,
        depthScale: 1,
      }));
      break;
    case "custom":
      candidates = customHeightMapCandidates(config, outer);
      break;
  }
  return candidates.filter((candidate) =>
    textureCandidateFits(candidate.outline, outer, blocked),
  );
}

function roundedRectangle(
  width: number,
  height: number,
  centerX = 0,
  centerY = 0,
  segmentsPerCorner = 6,
): Point2[] {
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const radius = Math.min(halfWidth, halfHeight);
  const centers = [
    { x: halfWidth - radius, y: halfHeight - radius, start: 0 },
    {
      x: -halfWidth + radius,
      y: halfHeight - radius,
      start: Math.PI / 2,
    },
    {
      x: -halfWidth + radius,
      y: -halfHeight + radius,
      start: Math.PI,
    },
    {
      x: halfWidth - radius,
      y: -halfHeight + radius,
      start: (3 * Math.PI) / 2,
    },
  ];
  return centers.flatMap((corner) =>
    Array.from({ length: segmentsPerCorner }, (_, segment) => {
      const angle =
        corner.start + (segment / segmentsPerCorner) * (Math.PI / 2);
      return {
        x: centerX + corner.x + radius * Math.cos(angle),
        y: centerY + corner.y + radius * Math.sin(angle),
      };
    }),
  );
}

/** Plan-view footprint of a through channel, used to keep texture relief off it. */
function channelFootprint(
  config: HexTileConfig,
  channel: CardChannel,
): Point2[] {
  const overhang = hexApothem(config.acrossFlats) + 2;
  return [
    { x: channel.min, y: -overhang },
    { x: channel.max, y: -overhang },
    { x: channel.max, y: overhang },
    { x: channel.min, y: overhang },
  ];
}

function polygonArea(polygon: Point2[]): number {
  let twiceArea = 0;
  for (let index = 0; index < polygon.length; index++) {
    const current = polygon[index];
    const next = polygon[(index + 1) % polygon.length];
    twiceArea += current.x * next.y - next.x * current.y;
  }
  return Math.abs(twiceArea) / 2;
}

/**
 * Sutherland-Hodgman clip of a convex outline against a vertical line. Crossing
 * points take the cut coordinate verbatim so channel walls meet the trimmed
 * outline exactly.
 */
function clipAtVerticalLine(
  polygon: Point2[],
  x: number,
  keep: "left" | "right",
): Point2[] {
  const isInside = (point: Point2) =>
    keep === "left" ? point.x <= x : point.x >= x;
  const clipped: Point2[] = [];
  for (let index = 0; index < polygon.length; index++) {
    const current = polygon[index];
    const next = polygon[(index + 1) % polygon.length];
    if (isInside(current)) clipped.push(current);
    if (isInside(current) !== isInside(next)) {
      const progress = (x - current.x) / (next.x - current.x);
      clipped.push({ x, y: current.y + (next.y - current.y) * progress });
    }
  }
  return dedupeRing(clipped);
}

/**
 * Drops points a clip left sitting on top of their neighbour. A cut through a
 * corner reports that corner both as an inside point and as the crossing, and
 * the zero-length edge that leaves behind derails the ear clipper.
 */
function dedupeRing(polygon: Point2[]): Point2[] {
  return polygon.filter((point, index) => {
    const previous = polygon[(index - 1 + polygon.length) % polygon.length];
    return Math.hypot(point.x - previous.x, point.y - previous.y) > 1e-9;
  });
}

/** Keeps the side of a convex outline that a half-plane covers. */
function clipHalfPlane(
  polygon: Point2[],
  normal: Point2,
  offset: number,
  keep: "below" | "above",
): Point2[] {
  const distance = (point: Point2) =>
    keep === "below"
      ? offset - (point.x * normal.x + point.y * normal.y)
      : point.x * normal.x + point.y * normal.y - offset;
  const clipped: Point2[] = [];
  for (let index = 0; index < polygon.length; index++) {
    const current = polygon[index];
    const next = polygon[(index + 1) % polygon.length];
    const currentDistance = distance(current);
    const nextDistance = distance(next);
    if (currentDistance >= 0) clipped.push(current);
    if (currentDistance >= 0 !== nextDistance >= 0) {
      const progress = currentDistance / (currentDistance - nextDistance);
      clipped.push({
        x: current.x + (next.x - current.x) * progress,
        y: current.y + (next.y - current.y) * progress,
      });
    }
  }
  return dedupeRing(clipped);
}

/** Drops repeated and colinear points so corner rounding has real corners. */
function cleanPolygon(polygon: Point2[]): Point2[] {
  const deduped = polygon.filter((point, index) => {
    const previous = polygon[(index - 1 + polygon.length) % polygon.length];
    return Math.hypot(point.x - previous.x, point.y - previous.y) > 1e-6;
  });
  return deduped.filter((point, index) => {
    const previous = deduped[(index - 1 + deduped.length) % deduped.length];
    const next = deduped[(index + 1) % deduped.length];
    const cross =
      (point.x - previous.x) * (next.y - point.y) -
      (point.y - previous.y) * (next.x - point.x);
    return Math.abs(cross) > 1e-6;
  });
}

function isConvexRing(polygon: Point2[]): boolean {
  if (polygon.length < 3) return false;
  for (let index = 0; index < polygon.length; index++) {
    const a = polygon[index];
    const b = polygon[(index + 1) % polygon.length];
    const c = polygon[(index + 2) % polygon.length];
    const cross = (b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x);
    if (cross <= 1e-9) return false;
    if (Math.hypot(b.x - a.x, b.y - a.y) < 1e-6) return false;
  }
  return true;
}

/** Shortest distance from the centroid out to an edge. */
function polygonInradius(polygon: Point2[]): number {
  const center = centroid(polygon);
  let inradius = Number.POSITIVE_INFINITY;
  for (let index = 0; index < polygon.length; index++) {
    inradius = Math.min(
      inradius,
      distanceToSegment(
        center,
        polygon[index],
        polygon[(index + 1) % polygon.length],
      ),
    );
  }
  return inradius;
}

/**
 * Pulls a counter-clockwise convex outline in by a fixed distance, sliding
 * every edge along its own normal. The corner count is preserved so an outline
 * and its offset can be walled together point for point.
 */
function offsetConvexPolygon(polygon: Point2[], distance: number): Point2[] {
  const lines = polygon.map((point, index) => {
    const next = polygon[(index + 1) % polygon.length];
    const length = Math.hypot(next.x - point.x, next.y - point.y);
    const direction = {
      x: (next.x - point.x) / length,
      y: (next.y - point.y) / length,
    };
    return {
      direction,
      point: {
        x: point.x - direction.y * distance,
        y: point.y + direction.x * distance,
      },
    };
  });

  return polygon.map((_, index) => {
    const before = lines[(index - 1 + lines.length) % lines.length];
    const after = lines[index];
    const denominator =
      before.direction.x * after.direction.y -
      before.direction.y * after.direction.x;
    if (Math.abs(denominator) < 1e-9) return after.point;
    const travel =
      ((after.point.x - before.point.x) * after.direction.y -
        (after.point.y - before.point.y) * after.direction.x) /
      denominator;
    return {
      x: before.point.x + before.direction.x * travel,
      y: before.point.y + before.direction.y * travel,
    };
  });
}

/** The offset that still leaves a usable outline, backing off when it does not. */
function shrinkConvexPolygon(polygon: Point2[], distance: number): Point2[] {
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = offsetConvexPolygon(polygon, distance / 2 ** attempt);
    if (isConvexRing(candidate)) return candidate;
  }
  const center = centroid(polygon);
  return polygon.map((point) => ({
    x: center.x + (point.x - center.x) * 0.6,
    y: center.y + (point.y - center.y) * 0.6,
  }));
}

/**
 * Replaces the corners of a convex outline with arcs. Each corner takes the
 * largest radius its own edges allow, so short edges stay clean, and every
 * corner contributes the same number of points however tight it is.
 */
function roundPolygonCorners(
  polygon: Point2[],
  radius: number,
  segmentsPerCorner: number,
): Point2[] {
  const points: Point2[] = [];
  for (let index = 0; index < polygon.length; index++) {
    const current = polygon[index];
    const previous = polygon[(index - 1 + polygon.length) % polygon.length];
    const next = polygon[(index + 1) % polygon.length];
    const toPrevious = {
      x: previous.x - current.x,
      y: previous.y - current.y,
    };
    const toNext = { x: next.x - current.x, y: next.y - current.y };
    const previousLength = Math.hypot(toPrevious.x, toPrevious.y);
    const nextLength = Math.hypot(toNext.x, toNext.y);
    const unitPrevious = {
      x: toPrevious.x / previousLength,
      y: toPrevious.y / previousLength,
    };
    const unitNext = { x: toNext.x / nextLength, y: toNext.y / nextLength };
    const interior = Math.acos(
      Math.max(
        -1,
        Math.min(1, unitPrevious.x * unitNext.x + unitPrevious.y * unitNext.y),
      ),
    );
    const half = interior / 2;
    const cornerRadius = Math.max(
      MIN_CORNER_RADIUS,
      Math.min(
        radius,
        (Math.min(previousLength, nextLength) / 2) * Math.tan(half),
      ),
    );
    const tangent = cornerRadius / Math.tan(half);
    const bisector = {
      x: unitPrevious.x + unitNext.x,
      y: unitPrevious.y + unitNext.y,
    };
    const bisectorLength = Math.hypot(bisector.x, bisector.y);
    const center = {
      x:
        current.x +
        (bisector.x / bisectorLength) * (cornerRadius / Math.sin(half)),
      y:
        current.y +
        (bisector.y / bisectorLength) * (cornerRadius / Math.sin(half)),
    };
    const start = {
      x: current.x + unitPrevious.x * tangent,
      y: current.y + unitPrevious.y * tangent,
    };
    const end = {
      x: current.x + unitNext.x * tangent,
      y: current.y + unitNext.y * tangent,
    };
    const startAngle = Math.atan2(start.y - center.y, start.x - center.x);
    const endAngle = Math.atan2(end.y - center.y, end.x - center.x);
    let sweep = endAngle - startAngle;
    while (sweep <= -Math.PI) sweep += 2 * Math.PI;
    while (sweep > Math.PI) sweep -= 2 * Math.PI;
    for (let step = 0; step <= segmentsPerCorner; step++) {
      const angle = startAngle + sweep * (step / segmentsPerCorner);
      points.push({
        x: center.x + cornerRadius * Math.cos(angle),
        y: center.y + cornerRadius * Math.sin(angle),
      });
    }
  }
  return points;
}

/** Half of the plane: everything at or beyond `offset` along `normal`. */
interface FaceHalfPlane {
  normal: Point2;
  offset: number;
}

/**
 * One well's share of the tile, as the half-planes that carve it out. Their
 * boundaries are the ridge lines, so the same cells describe where the wells
 * sit and where every face crossing a ridge has to be cut.
 */
type FaceCells = FaceHalfPlane[][];

/**
 * The top face broken into the lands left over between through channels, then
 * cut again along any ridges. Ear clipping merges outline segments that are
 * exactly colinear, and two mirrored wells line their arcs up exactly, so each
 * call is kept down to a single hole. These cuts run inside the face, where
 * both sides of every new edge belong to the same face.
 */
function topFaceRegions(
  outer: Point2[],
  channels: CardChannel[],
  cells?: FaceCells,
): Point2[][] {
  const spans: { left: number | null; right: number | null }[] = [];
  if (channels.length === 0) {
    spans.push({ left: null, right: null });
  } else {
    spans.push({ left: null, right: channels[0].min });
    for (let index = 1; index < channels.length; index++) {
      spans.push({ left: channels[index - 1].max, right: channels[index].min });
    }
    spans.push({ left: channels[channels.length - 1].max, right: null });
  }

  let regions = spans.map(({ left, right }) => {
    let region = outer;
    if (left !== null) region = clipAtVerticalLine(region, left, "right");
    if (right !== null) region = clipAtVerticalLine(region, right, "left");
    return region;
  });

  if (cells && cells.length > 1) {
    regions = regions.flatMap((region) =>
      cells.map((cell) =>
        cell.reduce(
          (piece, half) =>
            clipHalfPlane(piece, half.normal, half.offset, "above"),
          region,
        ),
      ),
    );
  }
  return regions.filter(
    (region) => region.length >= 3 && polygonArea(region) > 1e-6,
  );
}

/**
 * Where the ridge cuts cross one side of an outline, as parameters measured
 * from the middle of that side. The top face and the bevel band both read
 * their crossings from here, so the edge they share stays in step.
 */
function sideCutParams(
  outline: Point2[],
  index: number,
  cells?: FaceCells,
): number[] {
  if (!cells || cells.length < 2) return [];
  const frame = sideFrame(
    outline[index],
    outline[(index + 1) % outline.length],
  );
  const halfLength = frame.length / 2;
  const pointAt = (param: number): Point2 => ({
    x: frame.midpoint.x + frame.tangent.x * param,
    y: frame.midpoint.y + frame.tangent.y * param,
  });
  const params: number[] = [];

  for (const cell of cells) {
    for (const half of cell) {
      const denominator =
        frame.tangent.x * half.normal.x + frame.tangent.y * half.normal.y;
      if (Math.abs(denominator) < 1e-9) continue;
      const base =
        frame.midpoint.x * half.normal.x + frame.midpoint.y * half.normal.y;
      const param = (half.offset - base) / denominator;
      if (param <= -halfLength + 1e-9 || param >= halfLength - 1e-9) continue;
      // A ridge may stop short of this side, in which case the crossing is not
      // a real corner and inserting it would only split an edge in half.
      const point = pointAt(param);
      const bounds = cell.every(
        (other) =>
          other === half ||
          point.x * other.normal.x + point.y * other.normal.y >=
            other.offset - 1e-6,
      );
      if (bounds && !params.some((seen) => Math.abs(seen - param) < 1e-9)) {
        params.push(param);
      }
    }
  }
  return params.sort((first, second) => first - second);
}

/** The same outline with a vertex added wherever a ridge cut crosses it. */
function insertCutPoints(outline: Point2[], cells?: FaceCells): Point2[] {
  if (!cells || cells.length < 2) return outline;
  const augmented: Point2[] = [];
  for (let index = 0; index < outline.length; index++) {
    augmented.push(outline[index]);
    const frame = sideFrame(
      outline[index],
      outline[(index + 1) % outline.length],
    );
    for (const param of sideCutParams(outline, index, cells)) {
      augmented.push({
        x: frame.midpoint.x + frame.tangent.x * param,
        y: frame.midpoint.y + frame.tangent.y * param,
      });
    }
  }
  return augmented;
}

/** A hairline strip along a ridge line, so relief never straddles a cut. */
function cutFootprint(config: HexTileConfig, half: FaceHalfPlane): Point2[] {
  const reach = config.acrossFlats;
  const along = { x: -half.normal.y, y: half.normal.x };
  const corner = (side: number, end: number): Point2 => ({
    x: half.normal.x * (half.offset + side * 0.05) + along.x * reach * end,
    y: half.normal.y * (half.offset + side * 0.05) + along.y * reach * end,
  });
  return [corner(-1, -1), corner(-1, 1), corner(1, 1), corner(1, -1)];
}

function centroid(points: Point2[]): Point2 {
  return points.reduce(
    (sum, point) => ({
      x: sum.x + point.x / points.length,
      y: sum.y + point.y / points.length,
    }),
    { x: 0, y: 0 },
  );
}

function cross(a: Point3, b: Point3, c: Point3): Point3 {
  const ux = b[0] - a[0];
  const uy = b[1] - a[1];
  const uz = b[2] - a[2];
  const vx = c[0] - a[0];
  const vy = c[1] - a[1];
  const vz = c[2] - a[2];
  return [uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx];
}

function dot(a: Point3, b: Point3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function addOrientedTriangle(
  triangles: number[][],
  a: Point3,
  b: Point3,
  c: Point3,
  desiredNormal: Point3,
): void {
  if (dot(cross(a, b, c), desiredNormal) >= 0) {
    addTriangle(triangles, ...a, ...b, ...c);
  } else {
    addTriangle(triangles, ...a, ...c, ...b);
  }
}

function addOrientedQuad(
  triangles: number[][],
  a: Point3,
  b: Point3,
  c: Point3,
  d: Point3,
  desiredNormal: Point3,
): void {
  addOrientedTriangle(triangles, a, b, c, desiredNormal);
  addOrientedTriangle(triangles, a, c, d, desiredNormal);
}

function buildFanFace(
  triangles: number[][],
  outline: Point2[],
  z: number,
  facing: "up" | "down",
): void {
  const center = centroid(outline);
  const desired: Point3 = facing === "up" ? [0, 0, 1] : [0, 0, -1];
  for (let index = 0; index < outline.length; index++) {
    const a = outline[index];
    const b = outline[(index + 1) % outline.length];
    addOrientedTriangle(
      triangles,
      [center.x, center.y, z],
      [a.x, a.y, z],
      [b.x, b.y, z],
      desired,
    );
  }
}

function buildContourWall(
  triangles: number[][],
  lower: Point2[],
  upper: Point2[],
  zLower: number,
  zUpper: number,
  facing: "outward" | "inward",
): void {
  for (let index = 0; index < lower.length; index++) {
    const next = (index + 1) % lower.length;
    const lowerA: Point3 = [lower[index].x, lower[index].y, zLower];
    const lowerB: Point3 = [lower[next].x, lower[next].y, zLower];
    const upperA: Point3 = [upper[index].x, upper[index].y, zUpper];
    const upperB: Point3 = [upper[next].x, upper[next].y, zUpper];
    if (facing === "outward") {
      addTriangle(triangles, ...lowerA, ...lowerB, ...upperA);
      addTriangle(triangles, ...lowerB, ...upperB, ...upperA);
    } else {
      addTriangle(triangles, ...lowerA, ...upperA, ...lowerB);
      addTriangle(triangles, ...lowerB, ...upperA, ...upperB);
    }
  }
}

function buildAnnularFace(
  triangles: number[][],
  outer: Point2[],
  inner: Point2[],
  z: number,
  facing: "up" | "down",
): void {
  const desired: Point3 = facing === "up" ? [0, 0, 1] : [0, 0, -1];
  for (let index = 0; index < outer.length; index++) {
    const next = (index + 1) % outer.length;
    addOrientedQuad(
      triangles,
      [outer[index].x, outer[index].y, z],
      [outer[next].x, outer[next].y, z],
      [inner[next].x, inner[next].y, z],
      [inner[index].x, inner[index].y, z],
      desired,
    );
  }
}

function triangulateHorizontalFace(
  triangles: number[][],
  outer: Point2[],
  holes: Point2[][],
  z: number,
  facing: "up" | "down",
): void {
  const contour = outer.map((point) => new Vector2(point.x, point.y));
  const holeVectors = holes.map((hole) =>
    hole.map((point) => new Vector2(point.x, point.y)),
  );
  const allPoints = [outer, ...holes].flat();
  const desired: Point3 = facing === "up" ? [0, 0, 1] : [0, 0, -1];
  for (const face of ShapeUtils.triangulateShape(contour, holeVectors)) {
    const a = allPoints[face[0]];
    const b = allPoints[face[1]];
    const c = allPoints[face[2]];
    addOrientedTriangle(
      triangles,
      [a.x, a.y, z],
      [b.x, b.y, z],
      [c.x, c.y, z],
      desired,
    );
  }
}

function northMarkerOutline(config: HexTileConfig): Point2[] | null {
  if (config.magnetMode !== "single" && config.magnetMode !== "captive") {
    return null;
  }
  const layout = calculateHexTileLayout(config);
  if (layout.northMarkerCenterX === null) return null;
  return ellipseOutline(
    layout.northMarkerRadius,
    layout.northMarkerRadius,
    layout.northMarkerCenterX,
    layout.northMarkerCenterY,
    0,
    24,
  );
}

function buildTopFace(
  triangles: number[][],
  config: HexTileConfig,
  outer: Point2[],
  featureHoles: Point2[][],
  topZ: number,
  channels: CardChannel[] = [],
  cells?: FaceCells,
): void {
  const marker = northMarkerOutline(config);
  const blocked = [
    ...featureHoles,
    ...(marker ? [marker] : []),
    ...channels.map((channel) => channelFootprint(config, channel)),
    ...(cells && cells.length > 1 ? cells : []).flatMap((cell) =>
      cell.map((half) => cutFootprint(config, half)),
    ),
  ];
  const textureGrooves = surfaceTextureGrooves(config, outer, blocked);
  const holes = [
    ...featureHoles,
    ...(marker ? [marker] : []),
    ...textureGrooves.map((groove) => groove.outline),
  ];
  for (const region of topFaceRegions(
    insertCutPoints(outer, cells),
    channels,
    cells,
  )) {
    triangulateHorizontalFace(
      triangles,
      region,
      holes.filter((hole) => pointInPolygon(centroid(hole), region)),
      topZ,
      "up",
    );
  }
  if (marker) {
    const layout = calculateHexTileLayout(config);
    const markerFloorZ = topZ - layout.northMarkerDepth;
    buildContourWall(triangles, marker, marker, markerFloorZ, topZ, "inward");
    buildFanFace(triangles, marker, markerFloorZ, "up");
  }
  for (const groove of textureGrooves) {
    const textureFloorZ = topZ - config.surfaceTextureDepth * groove.depthScale;
    buildContourWall(
      triangles,
      groove.outline,
      groove.outline,
      textureFloorZ,
      topZ,
      "inward",
    );
    buildFanFace(triangles, groove.outline, textureFloorZ, "up");
  }
}

function buildTexturedAnnularFace(
  triangles: number[][],
  config: HexTileConfig,
  outer: Point2[],
  inner: Point2[],
  z: number,
): void {
  if (!config.isSurfaceTextureEnabled) {
    buildAnnularFace(triangles, outer, inner, z, "up");
    return;
  }

  const textureGrooves = surfaceTextureGrooves(config, outer, [inner]);
  triangulateHorizontalFace(
    triangles,
    outer,
    [inner, ...textureGrooves.map((groove) => groove.outline)],
    z,
    "up",
  );
  for (const groove of textureGrooves) {
    const textureFloorZ = z - config.surfaceTextureDepth * groove.depthScale;
    buildContourWall(
      triangles,
      groove.outline,
      groove.outline,
      textureFloorZ,
      z,
      "inward",
    );
    buildFanFace(triangles, groove.outline, textureFloorZ, "up");
  }
}

function interpolateContours(
  lower: Point2[],
  upper: Point2[],
  progress: number,
): Point2[] {
  return lower.map((point, index) => ({
    x: point.x + (upper[index].x - point.x) * progress,
    y: point.y + (upper[index].y - point.y) * progress,
  }));
}

function buildSmoothCavity(
  triangles: number[][],
  opening: Point2[],
  floor: Point2[],
  floorZ: number,
  topZ: number,
): void {
  let previous = floor;
  let previousZ = floorZ;
  for (let ring = 1; ring <= WELL_RINGS; ring++) {
    const t = ring / WELL_RINGS;
    const radialProgress = Math.sin((t * Math.PI) / 2);
    const heightProgress = 1 - Math.cos((t * Math.PI) / 2);
    const next = interpolateContours(floor, opening, radialProgress);
    const nextZ = floorZ + (topZ - floorZ) * heightProgress;
    buildContourWall(triangles, previous, next, previousZ, nextZ, "inward");
    previous = next;
    previousZ = nextZ;
  }
  buildFanFace(triangles, floor, floorZ, "up");
}

function supportFreeMagnetProfile(
  centerU: number,
  centerZ: number,
  radius: number,
): Point2[] {
  const circumradius = radius / Math.cos(Math.PI / 8);
  return Array.from({ length: 8 }, (_, index) => {
    const angle = Math.PI / 8 + (index * Math.PI) / 4;
    return {
      x: centerU + circumradius * Math.cos(angle),
      y: centerZ + circumradius * Math.sin(angle),
    };
  });
}

function sideFrame(a: Point2, b: Point2): SideFrame {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = Math.hypot(dx, dy);
  const tangent = { x: dx / length, y: dy / length };
  const outward = { x: tangent.y, y: -tangent.x };
  return {
    midpoint: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
    tangent,
    outward,
    inward: { x: -outward.x, y: -outward.y },
    length,
  };
}

function mapSidePoint(
  frame: SideFrame,
  u: number,
  depth: number,
  z: number,
): Point3 {
  return [
    frame.midpoint.x + frame.tangent.x * u + frame.inward.x * depth,
    frame.midpoint.y + frame.tangent.y * u + frame.inward.y * depth,
    z,
  ];
}

/**
 * Outline of one slice of a side face: a rectangle whose top edge drops to the
 * channel floor wherever a through channel crosses it.
 */
function sideFaceContour(
  uMin: number,
  uMax: number,
  zLow: number,
  zHigh: number,
  notches: CardChannel[],
  notchFloorZ: number,
): Point2[] {
  const runs: { min: number; max: number; z: number }[] = [];
  let cursor = uMin;
  for (const notch of [...notches].sort((a, b) => a.min - b.min)) {
    const min = Math.max(notch.min, cursor);
    const max = Math.min(notch.max, uMax);
    if (max - min <= 1e-9) continue;
    if (min > cursor) runs.push({ min: cursor, max: min, z: zHigh });
    runs.push({ min, max, z: notchFloorZ });
    cursor = max;
  }
  if (cursor < uMax) runs.push({ min: cursor, max: uMax, z: zHigh });

  const contour: Point2[] = [
    { x: uMin, y: zLow },
    { x: uMax, y: zLow },
  ];
  for (let index = runs.length - 1; index >= 0; index--) {
    contour.push(
      { x: runs[index].max, y: runs[index].z },
      { x: runs[index].min, y: runs[index].z },
    );
  }
  return contour;
}

/**
 * Ear clipping merges outline segments that are exactly colinear. Two magnet
 * sockets side by side share the height of their top and bottom edges, and the
 * clipper bridges straight past one of those edges, dropping it from the face
 * and leaving the mesh open. Splitting the face midway between the sockets
 * keeps every call down to a single hole. The bevel bands and channel floors
 * that meet these faces take the same splits so no edge is left unmatched.
 */
function magnetSplitOffsets(config: HexTileConfig): number[] {
  return config.magnetMode === "paired" ? [0] : [];
}

function triangulateSideFace(
  triangles: number[][],
  frame: SideFrame,
  zLow: number,
  zHigh: number,
  holes: Point2[][],
  splits: number[],
  notches: CardChannel[] = [],
  notchFloorZ = 0,
): void {
  const halfLength = frame.length / 2;
  const ordered = [...holes].sort(
    (first, second) => centroid(first).x - centroid(second).x,
  );
  const bounds = [-halfLength, ...splits, halfLength];
  const desired: Point3 = [frame.outward.x, frame.outward.y, 0];

  for (let slice = 0; slice + 1 < bounds.length; slice++) {
    const outer = sideFaceContour(
      bounds[slice],
      bounds[slice + 1],
      zLow,
      zHigh,
      notches,
      notchFloorZ,
    );
    const sliceHoles = ordered[slice] ? [ordered[slice]] : [];
    const allPoints = [outer, ...sliceHoles].flat();
    const faces = ShapeUtils.triangulateShape(
      outer.map((point) => new Vector2(point.x, point.y)),
      sliceHoles.map((ring) =>
        ring.map((point) => new Vector2(point.x, point.y)),
      ),
    );
    for (const face of faces) {
      const a = allPoints[face[0]];
      const b = allPoints[face[1]];
      const c = allPoints[face[2]];
      addOrientedTriangle(
        triangles,
        mapSidePoint(frame, a.x, 0, a.y),
        mapSidePoint(frame, b.x, 0, b.y),
        mapSidePoint(frame, c.x, 0, c.y),
        desired,
      );
    }
  }
}

function buildMagnetSocket(
  triangles: number[][],
  frame: SideFrame,
  profile: Point2[],
  depth: number,
): void {
  const profileCenter = centroid(profile);
  for (let index = 0; index < profile.length; index++) {
    const next = (index + 1) % profile.length;
    const a = profile[index];
    const b = profile[next];
    const midpointU = (a.x + b.x) / 2;
    const midpointZ = (a.y + b.y) / 2;
    const towardVoidU = profileCenter.x - midpointU;
    const towardVoidZ = profileCenter.y - midpointZ;
    const desired: Point3 = [
      frame.tangent.x * towardVoidU,
      frame.tangent.y * towardVoidU,
      towardVoidZ,
    ];
    addOrientedQuad(
      triangles,
      mapSidePoint(frame, a.x, 0, a.y),
      mapSidePoint(frame, b.x, 0, b.y),
      mapSidePoint(frame, b.x, depth, b.y),
      mapSidePoint(frame, a.x, depth, a.y),
      desired,
    );
  }

  const desiredBack: Point3 = [frame.outward.x, frame.outward.y, 0];
  for (let index = 0; index < profile.length; index++) {
    const next = (index + 1) % profile.length;
    addOrientedTriangle(
      triangles,
      mapSidePoint(frame, profileCenter.x, depth, profileCenter.y),
      mapSidePoint(frame, profile[index].x, depth, profile[index].y),
      mapSidePoint(frame, profile[next].x, depth, profile[next].y),
      desiredBack,
    );
  }
}

function captiveRodOpening(
  centerZ: number,
  height: number,
  width: number,
): Point2[] {
  const halfHeight = height / 2;
  const halfWidth = width / 2;
  return [
    { x: -halfWidth, y: centerZ - halfHeight },
    { x: halfWidth, y: centerZ - halfHeight },
    { x: halfWidth, y: centerZ + halfHeight },
    { x: -halfWidth, y: centerZ + halfHeight },
  ];
}

function captiveRodCrossSection(config: HexTileConfig): Point2[] {
  const layout = calculateHexTileLayout(config);
  const radius = layout.magnetSocketDiameter / 2;
  const halfOpening = Math.min(layout.magnetThroatWidth / 2, radius);
  const intersectionOffset = Math.sqrt(
    Math.max(0, radius ** 2 - halfOpening ** 2),
  );
  const centerDepth = config.magnetLipDepth + intersectionOffset;
  const lowerAngle = Math.PI + Math.asin(halfOpening / radius);
  const upperAngle = 3 * Math.PI - Math.asin(halfOpening / radius);
  const arcSegments = 16;
  const chamberArc = Array.from({ length: arcSegments + 1 }, (_, index) => {
    const progress = index / arcSegments;
    const angle = lowerAngle + (upperAngle - lowerAngle) * progress;
    return {
      x: centerDepth + radius * Math.cos(angle),
      y: radius * Math.sin(angle),
    };
  });

  return [{ x: 0, y: -halfOpening }, ...chamberArc, { x: 0, y: halfOpening }];
}

function buildCaptiveRodEndCap(
  triangles: number[][],
  frame: SideFrame,
  z: number,
  desiredZ: number,
  crossSection: Point2[],
): void {
  const contour = crossSection.map((point) => new Vector2(point.x, point.y));
  const desired: Point3 = [0, 0, desiredZ];
  for (const face of ShapeUtils.triangulateShape(contour, [])) {
    const a = crossSection[face[0]];
    const b = crossSection[face[1]];
    const c = crossSection[face[2]];
    addOrientedTriangle(
      triangles,
      mapSidePoint(frame, a.y, a.x, z),
      mapSidePoint(frame, b.y, b.x, z),
      mapSidePoint(frame, c.y, c.x, z),
      desired,
    );
  }
}

function buildCaptiveRodSocket(
  triangles: number[][],
  frame: SideFrame,
  config: HexTileConfig,
): void {
  const layout = calculateHexTileLayout(config);
  const halfLength = layout.magnetSocketLength / 2;
  const zLow = layout.magnetCenterZ - halfLength;
  const zHigh = layout.magnetCenterZ + halfLength;
  const crossSection = captiveRodCrossSection(config);

  for (let index = 0; index < crossSection.length - 1; index++) {
    const a = crossSection[index];
    const b = crossSection[index + 1];
    const depthDelta = b.x - a.x;
    const tangentDelta = b.y - a.y;
    const desired: Point3 = [
      frame.inward.x * -tangentDelta + frame.tangent.x * depthDelta,
      frame.inward.y * -tangentDelta + frame.tangent.y * depthDelta,
      0,
    ];
    addOrientedQuad(
      triangles,
      mapSidePoint(frame, a.y, a.x, zLow),
      mapSidePoint(frame, b.y, b.x, zLow),
      mapSidePoint(frame, b.y, b.x, zHigh),
      mapSidePoint(frame, a.y, a.x, zHigh),
      desired,
    );
  }

  buildCaptiveRodEndCap(triangles, frame, zLow, 1, crossSection);
  buildCaptiveRodEndCap(triangles, frame, zHigh, -1, crossSection);
}

function magnetOffsets(config: HexTileConfig): number[] {
  const layout = calculateHexTileLayout(config);
  if (config.magnetMode === "paired") {
    return [-layout.pairedMagnetOffset, layout.pairedMagnetOffset];
  }
  return config.magnetMode === "single" ? [0] : [];
}

/** Through-channel spans mapped onto one side face, empty for the other sides. */
function sideChannelNotches(
  frame: SideFrame,
  channels: CardChannel[],
): CardChannel[] {
  if (channels.length === 0 || Math.abs(frame.outward.y) < 0.99) return [];
  const toU = (x: number) => frame.tangent.x * (x - frame.midpoint.x);
  return channels.map((channel) => {
    const ends = [toU(channel.min), toU(channel.max)];
    return { min: Math.min(...ends), max: Math.max(...ends) };
  });
}

/** The spans of [min, max] left over once the removed spans are taken out. */
function freeRuns(
  min: number,
  max: number,
  removed: CardChannel[],
): CardChannel[] {
  const runs: CardChannel[] = [];
  let cursor = min;
  for (const span of [...removed].sort((a, b) => a.min - b.min)) {
    const start = Math.max(span.min, cursor);
    const end = Math.min(span.max, max);
    if (end <= start) continue;
    if (start > cursor) runs.push({ min: cursor, max: start });
    cursor = end;
  }
  if (cursor < max) runs.push({ min: cursor, max });
  return runs;
}

/**
 * A chamfer strip between two outlines, skipping the spans a through channel
 * carries away. Only the edge that meets the side walls takes the socket
 * splits; the opposite edge belongs to the bottom or top face, which are not
 * split, so each run fans out from there.
 */
function buildBevelBand(
  triangles: number[][],
  splitOutline: Point2[],
  plainOutline: Point2[],
  splitZ: number,
  plainZ: number,
  splits: number[],
  channels: CardChannel[],
  cells?: FaceCells,
): void {
  for (let index = 0; index < splitOutline.length; index++) {
    const next = (index + 1) % splitOutline.length;
    const frame = sideFrame(splitOutline[index], splitOutline[next]);
    const plainFrame = sideFrame(plainOutline[index], plainOutline[next]);
    const halfLength = frame.length / 2;
    const desired: Point3 = [frame.outward.x, frame.outward.y, 0];
    const splitPoint = (u: number): Point3 =>
      u <= -halfLength
        ? [splitOutline[index].x, splitOutline[index].y, splitZ]
        : u >= halfLength
          ? [splitOutline[next].x, splitOutline[next].y, splitZ]
          : mapSidePoint(frame, u, 0, splitZ);
    const plainPoint = (u: number): Point3 =>
      u <= -halfLength
        ? [plainOutline[index].x, plainOutline[index].y, plainZ]
        : u >= halfLength
          ? [plainOutline[next].x, plainOutline[next].y, plainZ]
          : [
              plainFrame.midpoint.x + plainFrame.tangent.x * u,
              plainFrame.midpoint.y + plainFrame.tangent.y * u,
              plainZ,
            ];

    const plainCuts = sideCutParams(plainOutline, index, cells);
    const notches = sideChannelNotches(frame, channels);
    for (const run of freeRuns(-halfLength, halfLength, notches)) {
      const inRun = (value: number) => value > run.min && value < run.max;
      const splitChain = [run.min, ...splits.filter(inRun), run.max];
      const plainChain = [run.min, ...plainCuts.filter(inRun), run.max];

      // Zip the two chains: whichever side has the next point along the run
      // takes the following triangle, so every point on both edges is used.
      let splitStep = 0;
      let plainStep = 0;
      while (
        splitStep + 1 < splitChain.length ||
        plainStep + 1 < plainChain.length
      ) {
        const takeSplit =
          plainStep + 1 >= plainChain.length ||
          (splitStep + 1 < splitChain.length &&
            splitChain[splitStep + 1] <= plainChain[plainStep + 1]);
        if (takeSplit) {
          addOrientedTriangle(
            triangles,
            plainPoint(plainChain[plainStep]),
            splitPoint(splitChain[splitStep]),
            splitPoint(splitChain[splitStep + 1]),
            desired,
          );
          splitStep++;
        } else {
          addOrientedTriangle(
            triangles,
            splitPoint(splitChain[splitStep]),
            plainPoint(plainChain[plainStep]),
            plainPoint(plainChain[plainStep + 1]),
            desired,
          );
          plainStep++;
        }
      }
    }
  }
}

/** Floor and side walls of one channel that runs out through both flats. */
function buildThroughChannel(
  triangles: number[][],
  config: HexTileConfig,
  channel: CardChannel,
): void {
  const layout = calculateHexTileLayout(config);
  const outerY = hexApothem(config.acrossFlats);
  const topY = hexApothem(config.acrossFlats - 2 * config.edgeBevel);
  const zUpperSide = layout.topHeight - config.edgeBevel;
  const floorZ = layout.channelFloorZ;
  const ledgeZ = layout.channelEdgeFloorZ;
  const ledgeY = outerY - layout.channelLedgeReach;
  const hasLedge = ledgeZ > floorZ + 1e-9 && ledgeY > 0;

  // Floor line along the channel, in (y, z). A shelf at each end carries the
  // floor over the magnet sockets buried in those two flats.
  const floorLine: Point2[] = hasLedge
    ? [
        { x: -outerY, y: ledgeZ },
        { x: -ledgeY, y: ledgeZ },
        { x: -ledgeY, y: floorZ },
        { x: ledgeY, y: floorZ },
        { x: ledgeY, y: ledgeZ },
        { x: outerY, y: ledgeZ },
      ]
    : [
        { x: -outerY, y: floorZ },
        { x: outerY, y: floorZ },
      ];

  // The floor meets the two open flats, so it carries the same socket splits
  // as the side faces there. A split at u lands on x on one flat and -x on the
  // other, and the socket layout is symmetric, so both are covered.
  const floorSplits = magnetSplitOffsets(config)
    .flatMap((split) => [split, -split])
    .filter((split) => split > channel.min && split < channel.max)
    .sort((first, second) => first - second);
  const floorBounds = [channel.min, ...new Set(floorSplits), channel.max];
  for (let span = 0; span + 1 < floorBounds.length; span++) {
    const left = floorBounds[span];
    const right = floorBounds[span + 1];
    for (let step = 0; step + 1 < floorLine.length; step++) {
      const from = floorLine[step];
      const to = floorLine[step + 1];
      const isRiser = Math.abs(to.x - from.x) < 1e-9;
      addOrientedQuad(
        triangles,
        [left, from.x, from.y],
        [right, from.x, from.y],
        [right, to.x, to.y],
        [left, to.x, to.y],
        isRiser
          ? [0, Math.sign(to.y - from.y) * (from.x < 0 ? 1 : -1), 0]
          : [0, 0, 1],
      );
    }
  }

  // Wall outline in (y, z): the floor line, then straight out to the flats
  // below the top bevel and drawn in to the trimmed top outline above it.
  const profile: Point2[] = [
    ...floorLine,
    { x: outerY, y: zUpperSide },
    { x: topY, y: layout.topHeight },
    { x: -topY, y: layout.topHeight },
    { x: -outerY, y: zUpperSide },
  ];
  const contour = profile.map((point) => new Vector2(point.x, point.y));
  const faces = ShapeUtils.triangulateShape(contour, []);
  for (const wall of [
    { x: channel.min, normalX: 1 },
    { x: channel.max, normalX: -1 },
  ]) {
    const desired: Point3 = [wall.normalX, 0, 0];
    for (const face of faces) {
      const a = profile[face[0]];
      const b = profile[face[1]];
      const c = profile[face[2]];
      addOrientedTriangle(
        triangles,
        [wall.x, a.x, a.y],
        [wall.x, b.x, b.y],
        [wall.x, c.x, c.y],
        desired,
      );
    }
  }
}

function buildOuterBody(
  triangles: number[][],
  config: HexTileConfig,
): Point2[] {
  const layout = calculateHexTileLayout(config);
  const bottomOutline = regularHex(config.acrossFlats - 2 * config.edgeBevel);
  const fullOutline = regularHex(config.acrossFlats);
  const topOutline = regularHex(config.acrossFlats - 2 * config.edgeBevel);
  const zLowerSide = config.edgeBevel;
  const zUpperSide = layout.topHeight - config.edgeBevel;
  const channels = throughChannels(config);
  const splits = magnetSplitOffsets(config);

  buildFanFace(triangles, bottomOutline, 0, "down");
  buildBevelBand(
    triangles,
    fullOutline,
    bottomOutline,
    zLowerSide,
    0,
    splits,
    [],
  );

  for (let index = 0; index < fullOutline.length; index++) {
    const next = (index + 1) % fullOutline.length;
    const frame = sideFrame(fullOutline[index], fullOutline[next]);
    const profiles =
      config.magnetMode === "captive"
        ? [
            captiveRodOpening(
              layout.magnetCenterZ,
              layout.magnetSocketLength,
              layout.magnetThroatWidth,
            ),
          ]
        : magnetOffsets(config).map((offset) =>
            supportFreeMagnetProfile(
              offset,
              layout.magnetCenterZ,
              layout.magnetSocketDiameter / 2,
            ),
          );
    triangulateSideFace(
      triangles,
      frame,
      zLowerSide,
      zUpperSide,
      profiles,
      splits,
      sideChannelNotches(frame, channels),
      layout.channelEdgeFloorZ,
    );
    if (config.magnetMode === "captive") {
      buildCaptiveRodSocket(triangles, frame, config);
    } else {
      for (const profile of profiles) {
        buildMagnetSocket(triangles, frame, profile, layout.magnetSocketDepth);
      }
    }
  }

  buildBevelBand(
    triangles,
    fullOutline,
    topOutline,
    zUpperSide,
    layout.topHeight,
    splits,
    channels,
    bowlWellCells(config),
  );
  return topOutline;
}

/**
 * Split wells take the whole tile interior rather than sitting inside it: the
 * hexagon is cut into bands across the split direction, each band keeps the
 * hexagon's own edges, and only its corners are rounded off. What is left
 * between two wells is the flat divider ridge.
 */
function unitVector(angle: number): Point2 {
  return { x: Math.cos(angle), y: Math.sin(angle) };
}

/**
 * How the tile interior is shared out. Two wells take a band each, split
 * across the divider. Three take a third of the tile each, as sectors meeting
 * at the middle, so every well hugs one corner of the hexagon.
 */
function bowlWellCells(config: HexTileConfig): FaceCells | undefined {
  const layout = calculateHexTileLayout(config);
  if (config.purpose !== "bowl" || layout.bowlWellCount < 2) return undefined;
  const splitAngle = (config.dividerAngle * Math.PI) / 180;

  if (layout.bowlWellCount === 2) {
    const normal = unitVector(splitAngle + Math.PI / 2);
    return [
      [{ normal: { x: -normal.x, y: -normal.y }, offset: 0 }],
      [{ normal, offset: 0 }],
    ];
  }

  return Array.from({ length: 3 }, (_, sector) => {
    const ridge = splitAngle + (sector * 2 * Math.PI) / 3;
    return [
      { normal: unitVector(ridge + Math.PI / 2), offset: 0 },
      { normal: unitVector(ridge + Math.PI / 6), offset: 0 },
    ];
  });
}

function bowlWells(config: HexTileConfig): {
  openings: Point2[][];
  floors: Point2[][];
  cells?: FaceCells;
} {
  const layout = calculateHexTileLayout(config);
  const openingRadius = layout.innerAcrossFlats / 2;
  const cells = bowlWellCells(config);
  if (!cells) {
    const floorRadius = Math.max(6, openingRadius - BOWL_CURVE_WIDTH);
    return {
      openings: [ellipseOutline(openingRadius, openingRadius)],
      floors: [ellipseOutline(floorRadius, floorRadius)],
    };
  }

  const interior = regularHex(layout.innerAcrossFlats);
  const cornerRadius = Math.min(
    14,
    Math.max(3, layout.bowlWellBandWidth * 0.35),
  );
  const openings: Point2[][] = [];
  const floors: Point2[][] = [];

  for (const cell of cells) {
    // Pulling every shared boundary back by half the ridge leaves the ridge
    // itself standing between neighbouring wells.
    const slab = cleanPolygon(
      cell.reduce(
        (piece, half) =>
          clipHalfPlane(
            piece,
            half.normal,
            half.offset + layout.bowlDividerWall / 2,
            "above",
          ),
        interior,
      ),
    );
    if (!isConvexRing(slab)) continue;

    const curve = Math.min(BOWL_CURVE_WIDTH, polygonInradius(slab) * 0.5);
    openings.push(
      roundPolygonCorners(slab, cornerRadius, BOWL_CORNER_SEGMENTS),
    );
    floors.push(
      roundPolygonCorners(
        shrinkConvexPolygon(slab, curve),
        Math.max(MIN_CORNER_RADIUS, cornerRadius - curve),
        BOWL_CORNER_SEGMENTS,
      ),
    );
  }
  return { openings, floors, cells };
}

function buildBowlInterior(
  triangles: number[][],
  config: HexTileConfig,
  topOutline: Point2[],
): void {
  const layout = calculateHexTileLayout(config);
  const wells = bowlWells(config);
  buildTopFace(
    triangles,
    config,
    topOutline,
    wells.openings,
    layout.topHeight,
    [],
    wells.cells,
  );
  const minimumFloorZ = config.floorThickness + config.raiseHeight;
  const floorZ = Math.max(minimumFloorZ, layout.topHeight - config.bowlDepth);
  for (let index = 0; index < wells.openings.length; index++) {
    buildSmoothCavity(
      triangles,
      wells.openings[index],
      wells.floors[index],
      floorZ,
      layout.topHeight,
    );
  }
}

function buildCardInterior(
  triangles: number[][],
  config: HexTileConfig,
  topOutline: Point2[],
): void {
  const layout = calculateHexTileLayout(config);
  const pockets = cardSlotPlan(config)
    .filter((slot) => !slot.isThrough)
    .map((slot) =>
      roundedRectangle(
        config.cardSlotWidth,
        config.cardSlotLength,
        slot.offset,
        0,
      ),
    );
  const channels = throughChannels(config);
  buildTopFace(
    triangles,
    config,
    topOutline,
    pockets,
    layout.topHeight,
    channels,
  );
  const floorZ = layout.channelFloorZ;
  for (const slot of pockets) {
    buildContourWall(triangles, slot, slot, floorZ, layout.topHeight, "inward");
    buildFanFace(triangles, slot, floorZ, "up");
  }
  for (const channel of channels) {
    buildThroughChannel(triangles, config, channel);
  }
}

/** The scooped wells in the two corners a deck cradle leaves free. */
function deckCounterWells(config: HexTileConfig): {
  openings: Point2[][];
  floors: Point2[][];
} {
  const layout = calculateHexTileLayout(config);
  const openings: Point2[][] = [];
  const floors: Point2[][] = [];
  if (!config.isDeckCounterWellEnabled) return { openings, floors };

  const interior = regularHex(layout.innerAcrossFlats);
  for (const side of [-1, 1]) {
    const slab = cleanPolygon(
      clipHalfPlane(interior, { x: side, y: 0 }, layout.deckWellInset, "above"),
    );
    if (!isConvexRing(slab)) continue;
    const inradius = polygonInradius(slab);
    if (inradius < DECK_WELL_MIN_INRADIUS) continue;

    const cornerRadius = Math.min(12, Math.max(3, inradius * 0.8));
    const curve = Math.min(BOWL_CURVE_WIDTH, inradius * 0.5);
    openings.push(
      roundPolygonCorners(slab, cornerRadius, BOWL_CORNER_SEGMENTS),
    );
    floors.push(
      roundPolygonCorners(
        shrinkConvexPolygon(slab, curve),
        Math.max(MIN_CORNER_RADIUS, cornerRadius - curve),
        BOWL_CORNER_SEGMENTS,
      ),
    );
  }
  return { openings, floors };
}

/**
 * A deck tile: cradles running flat to flat so a deck stands on its long edge
 * with both ends open to a thumb, and the corners the cradles leave over
 * scooped out for counters and dice.
 */
function buildDeckInterior(
  triangles: number[][],
  config: HexTileConfig,
  topOutline: Point2[],
): void {
  const layout = calculateHexTileLayout(config);
  const channels = throughChannels(config);
  const wells = deckCounterWells(config);

  buildTopFace(
    triangles,
    config,
    topOutline,
    wells.openings,
    layout.topHeight,
    channels,
  );
  for (const channel of channels) {
    buildThroughChannel(triangles, config, channel);
  }
  for (let index = 0; index < wells.openings.length; index++) {
    buildSmoothCavity(
      triangles,
      wells.openings[index],
      wells.floors[index],
      layout.channelFloorZ,
      layout.topHeight,
    );
  }
}

function buildTexturedFloor(
  triangles: number[][],
  config: HexTileConfig,
  outline: Point2[],
  z: number,
): void {
  if (!config.isSurfaceTextureEnabled) {
    buildFanFace(triangles, outline, z, "up");
    return;
  }
  const textureGrooves = surfaceTextureGrooves(config, outline, []);
  triangulateHorizontalFace(
    triangles,
    outline,
    textureGrooves.map((groove) => groove.outline),
    z,
    "up",
  );
  for (const groove of textureGrooves) {
    const textureFloorZ = z - config.surfaceTextureDepth * groove.depthScale;
    buildContourWall(
      triangles,
      groove.outline,
      groove.outline,
      textureFloorZ,
      z,
      "inward",
    );
    buildFanFace(triangles, groove.outline, textureFloorZ, "up");
  }
}

/**
 * The rolling well: one open hexagonal floor taking as much of the tile as the
 * rim allows. Its corners are rounded in plan, the wall leans out a few
 * degrees, and it turns into the floor over a fillet, so the well prints
 * without supports and dice never wedge into a hard corner.
 */
function buildRollingInterior(
  triangles: number[][],
  config: HexTileConfig,
  topOutline: Point2[],
): void {
  const layout = calculateHexTileLayout(config);
  const floorZ = layout.rollFloorZ;
  const fillet = Math.min(config.rollFloorFillet, config.rollDepth);
  const draftInset = Math.max(0, layout.rollFloorInset - fillet);
  const ringAt = (inset: number) =>
    roundedHex(
      layout.innerAcrossFlats - 2 * inset,
      config.rollCornerRadius - inset,
    );

  const opening = ringAt(0);
  buildTopFace(triangles, config, topOutline, [opening], layout.topHeight);

  const filletTopZ = floorZ + fillet;
  let previous = ringAt(draftInset);
  let previousZ = filletTopZ;
  buildContourWall(
    triangles,
    previous,
    opening,
    filletTopZ,
    layout.topHeight,
    "inward",
  );

  for (let ring = 1; ring <= ROLL_FILLET_RINGS; ring++) {
    const sweep = (ring / ROLL_FILLET_RINGS) * (Math.PI / 2);
    const next = ringAt(draftInset + fillet * (1 - Math.cos(sweep)));
    const nextZ = floorZ + fillet * (1 - Math.sin(sweep));
    buildContourWall(triangles, next, previous, nextZ, previousZ, "inward");
    previous = next;
    previousZ = nextZ;
  }
  buildTexturedFloor(triangles, config, previous, floorZ);
}

function buildDiceOrbitInterior(
  triangles: number[][],
  config: HexTileConfig,
  topOutline: Point2[],
): void {
  const layout = calculateHexTileLayout(config);
  const floorZ = config.floorThickness + config.raiseHeight;
  const outerOpeningRadius = layout.innerAcrossFlats / 2;
  const outerFloorRadius = Math.max(8, outerOpeningRadius - 7);
  const centerOpeningRadius = config.orbitCenterDiameter / 2;
  const islandTopRadius = centerOpeningRadius + 4;
  const islandBaseRadius = Math.max(5, islandTopRadius - 5);
  const centerFloorRadius = Math.max(4, centerOpeningRadius - 6);
  const islandTopZ = floorZ + config.orbitCenterRaise;
  const centerFloorZ = islandTopZ - config.orbitCenterDepth;

  const outerOpening = ellipseOutline(outerOpeningRadius, outerOpeningRadius);
  const outerFloor = ellipseOutline(outerFloorRadius, outerFloorRadius);
  const islandBase = ellipseOutline(islandBaseRadius, islandBaseRadius);
  const islandTop = ellipseOutline(islandTopRadius, islandTopRadius);
  const centerOpening = ellipseOutline(
    centerOpeningRadius,
    centerOpeningRadius,
  );
  const centerFloor = ellipseOutline(centerFloorRadius, centerFloorRadius);

  buildTopFace(triangles, config, topOutline, [outerOpening], layout.topHeight);
  let previous = outerFloor;
  let previousZ = floorZ;
  for (let ring = 1; ring <= WELL_RINGS; ring++) {
    const t = ring / WELL_RINGS;
    const radialProgress = Math.sin((t * Math.PI) / 2);
    const heightProgress = 1 - Math.cos((t * Math.PI) / 2);
    const next = interpolateContours(outerFloor, outerOpening, radialProgress);
    const nextZ = floorZ + (layout.topHeight - floorZ) * heightProgress;
    buildContourWall(triangles, previous, next, previousZ, nextZ, "inward");
    previous = next;
    previousZ = nextZ;
  }
  buildAnnularFace(triangles, outerFloor, islandBase, floorZ, "up");
  buildContourWall(
    triangles,
    islandBase,
    islandTop,
    floorZ,
    islandTopZ,
    "outward",
  );
  buildTexturedAnnularFace(
    triangles,
    config,
    islandTop,
    centerOpening,
    islandTopZ,
  );
  buildSmoothCavity(
    triangles,
    centerOpening,
    centerFloor,
    centerFloorZ,
    islandTopZ,
  );
}

export function generateHexTileTriangles(config: HexTileConfig): number[][] {
  const triangles: number[][] = [];
  const topOutline = buildOuterBody(triangles, config);
  if (config.purpose === "cards") {
    buildCardInterior(triangles, config, topOutline);
  } else if (config.purpose === "deck") {
    buildDeckInterior(triangles, config, topOutline);
  } else if (config.purpose === "dice-orbit") {
    buildDiceOrbitInterior(triangles, config, topOutline);
  } else if (config.purpose === "rolling") {
    buildRollingInterior(triangles, config, topOutline);
  } else {
    buildBowlInterior(triangles, config, topOutline);
  }
  return triangles;
}
