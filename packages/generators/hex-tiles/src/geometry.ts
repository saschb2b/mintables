import { ShapeUtils, Vector2 } from "three";
import { addTriangle } from "@mintables/shared/lib/geometry/mesh-utils";
import { calculateHexTileLayout } from "./layout";
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

const CURVE_SEGMENTS = 64;
const WELL_RINGS = 6;
const BOWL_CURVE_WIDTH = 12;

function regularHex(acrossFlats: number): Point2[] {
  const radius = acrossFlats / Math.sqrt(3);
  return Array.from({ length: 6 }, (_, index) => {
    const angle = (index * Math.PI) / 3;
    return { x: radius * Math.cos(angle), y: radius * Math.sin(angle) };
  });
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
  if (config.magnetMode !== "single") return null;
  const layout = calculateHexTileLayout(config);
  return ellipseOutline(
    layout.northMarkerRadius,
    layout.northMarkerRadius,
    0,
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
): void {
  const marker = northMarkerOutline(config);
  triangulateHorizontalFace(
    triangles,
    outer,
    marker ? [...featureHoles, marker] : featureHoles,
    topZ,
    "up",
  );
  if (marker) {
    const layout = calculateHexTileLayout(config);
    const markerFloorZ = topZ - layout.northMarkerDepth;
    buildContourWall(triangles, marker, marker, markerFloorZ, topZ, "inward");
    buildFanFace(triangles, marker, markerFloorZ, "up");
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

function triangulateSideFace(
  triangles: number[][],
  frame: SideFrame,
  zLow: number,
  zHigh: number,
  holes: Point2[][],
): void {
  const halfLength = frame.length / 2;
  const outer = [
    { x: -halfLength, y: zLow },
    { x: halfLength, y: zLow },
    { x: halfLength, y: zHigh },
    { x: -halfLength, y: zHigh },
  ];
  const contour = outer.map((point) => new Vector2(point.x, point.y));
  const holeVectors = holes.map((hole) =>
    hole.map((point) => new Vector2(point.x, point.y)),
  );
  const allPoints = [outer, ...holes].flat();
  const desired: Point3 = [frame.outward.x, frame.outward.y, 0];
  for (const face of ShapeUtils.triangulateShape(contour, holeVectors)) {
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

function magnetOffsets(config: HexTileConfig): number[] {
  const layout = calculateHexTileLayout(config);
  if (config.magnetMode === "paired") {
    return [-layout.pairedMagnetOffset, layout.pairedMagnetOffset];
  }
  return config.magnetMode === "single" ? [0] : [];
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

  buildFanFace(triangles, bottomOutline, 0, "down");
  buildContourWall(
    triangles,
    bottomOutline,
    fullOutline,
    0,
    zLowerSide,
    "outward",
  );

  const socketRadius = layout.magnetSocketDiameter / 2;
  for (let index = 0; index < fullOutline.length; index++) {
    const next = (index + 1) % fullOutline.length;
    const frame = sideFrame(fullOutline[index], fullOutline[next]);
    const profiles = magnetOffsets(config).map((offset) =>
      supportFreeMagnetProfile(offset, layout.magnetCenterZ, socketRadius),
    );
    triangulateSideFace(triangles, frame, zLowerSide, zUpperSide, profiles);
    for (const profile of profiles) {
      buildMagnetSocket(triangles, frame, profile, layout.magnetSocketDepth);
    }
  }

  buildContourWall(
    triangles,
    fullOutline,
    topOutline,
    zUpperSide,
    layout.topHeight,
    "outward",
  );
  return topOutline;
}

function bowlWells(config: HexTileConfig): {
  openings: Point2[][];
  floors: Point2[][];
} {
  const layout = calculateHexTileLayout(config);
  if (!config.bowlDivider) {
    const openingRadius = layout.innerAcrossFlats / 2;
    const floorRadius = Math.max(6, openingRadius - BOWL_CURVE_WIDTH);
    return {
      openings: [ellipseOutline(openingRadius, openingRadius)],
      floors: [ellipseOutline(floorRadius, floorRadius)],
    };
  }

  const angle = (config.dividerAngle * Math.PI) / 180;
  const normal = angle + Math.PI / 2;
  const majorRadius = layout.innerAcrossFlats * 0.34;
  const minorRadius = layout.innerAcrossFlats * 0.205;
  const centerDistance = minorRadius + 1.5;
  const floorMajor = Math.max(6, majorRadius - 10);
  const floorMinor = Math.max(5, minorRadius - 8);
  const centers = [-1, 1].map((direction) => ({
    x: Math.cos(normal) * centerDistance * direction,
    y: Math.sin(normal) * centerDistance * direction,
  }));
  return {
    openings: centers.map((center) =>
      ellipseOutline(majorRadius, minorRadius, center.x, center.y, angle),
    ),
    floors: centers.map((center) =>
      ellipseOutline(floorMajor, floorMinor, center.x, center.y, angle),
    ),
  };
}

function buildBowlInterior(
  triangles: number[][],
  config: HexTileConfig,
  topOutline: Point2[],
): void {
  const layout = calculateHexTileLayout(config);
  const wells = bowlWells(config);
  buildTopFace(triangles, config, topOutline, wells.openings, layout.topHeight);
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
  const centerOffset =
    ((config.cardSlotCount - 1) * config.cardSlotSpacing) / 2;
  const slots = Array.from({ length: config.cardSlotCount }, (_, index) =>
    roundedRectangle(
      config.cardSlotWidth,
      config.cardSlotLength,
      index * config.cardSlotSpacing - centerOffset,
      0,
    ),
  );
  buildTopFace(triangles, config, topOutline, slots, layout.topHeight);
  const floorZ = layout.topHeight - config.cardSlotDepth;
  for (const slot of slots) {
    buildContourWall(triangles, slot, slot, floorZ, layout.topHeight, "inward");
    buildFanFace(triangles, slot, floorZ, "up");
  }
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
  buildAnnularFace(triangles, islandTop, centerOpening, islandTopZ, "up");
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
  } else if (config.purpose === "dice-orbit") {
    buildDiceOrbitInterior(triangles, config, topOutline);
  } else {
    buildBowlInterior(triangles, config, topOutline);
  }
  return triangles;
}
