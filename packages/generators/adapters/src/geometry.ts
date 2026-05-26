import type { AdapterConfig, TubeSpec, FitType } from "./types";
import { getEffectiveBendRadius, getTubeInnerDimensions } from "./types";
import { addTriangle } from "@mintables/shared/lib/geometry/mesh-utils";

// Generate profile points for different shapes
function generateRoundProfile(
  diameter: number,
  segments: number,
): { x: number; z: number }[] {
  const radius = diameter / 2;
  const points: { x: number; z: number }[] = [];
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    points.push({
      x: Math.cos(angle) * radius,
      z: Math.sin(angle) * radius,
    });
  }
  return points;
}

function generateRoundedRectProfile(
  width: number,
  height: number,
  cornerRadius: number,
  segmentsPerCorner = 8,
): { x: number; z: number }[] {
  const halfW = width / 2;
  const halfH = height / 2;
  const points: { x: number; z: number }[] = [];
  const r = Math.min(cornerRadius, Math.min(halfW, halfH) * 0.9);

  const corners = [
    { cx: halfW - r, cz: halfH - r, startAngle: 0 },
    { cx: -(halfW - r), cz: halfH - r, startAngle: Math.PI / 2 },
    { cx: -(halfW - r), cz: -(halfH - r), startAngle: Math.PI },
    { cx: halfW - r, cz: -(halfH - r), startAngle: (3 * Math.PI) / 2 },
  ];

  for (const corner of corners) {
    for (let i = 0; i < segmentsPerCorner; i++) {
      const angle = corner.startAngle + (i / segmentsPerCorner) * (Math.PI / 2);
      points.push({
        x: corner.cx + Math.cos(angle) * r,
        z: corner.cz + Math.sin(angle) * r,
      });
    }
  }

  return points;
}

// Get inner profile of the adapter at a given end
function getInnerProfile(
  tube: TubeSpec,
  clearance: number,
  wallThickness: number,
  fitType: FitType,
  segments: number,
): { x: number; z: number }[] {
  if (fitType === "plug") {
    // Plug inner = plug outer - wall thickness
    const inner = getTubeInnerDimensions(tube);
    const plugOuterW = inner.width - clearance * 2;
    const plugOuterH = inner.height - clearance * 2;
    const plugInnerW = plugOuterW - wallThickness * 2;
    const plugInnerH = plugOuterH - wallThickness * 2;
    switch (tube.shape) {
      case "round":
        return generateRoundProfile(plugInnerW, segments);
      case "square":
        return generateRoundedRectProfile(
          plugInnerW,
          plugInnerH,
          Math.max(0, tube.cornerRadius - wallThickness),
          segments / 4,
        );
      case "rectangular":
        return generateRoundedRectProfile(
          plugInnerW,
          plugInnerH,
          Math.max(0, tube.cornerRadius - wallThickness),
          segments / 4,
        );
    }
  }
  // Socket: inner = tube outer + clearance
  switch (tube.shape) {
    case "round":
      return generateRoundProfile(tube.outerDiameter + clearance * 2, segments);
    case "square":
      return generateRoundedRectProfile(
        tube.outerSize + clearance * 2,
        tube.outerSize + clearance * 2,
        tube.cornerRadius,
        segments / 4,
      );
    case "rectangular":
      return generateRoundedRectProfile(
        tube.outerWidth + clearance * 2,
        tube.outerHeight + clearance * 2,
        tube.cornerRadius,
        segments / 4,
      );
  }
}

// Get outer profile of the adapter at a given end
function getOuterProfile(
  tube: TubeSpec,
  clearance: number,
  wallThickness: number,
  fitType: FitType,
  segments: number,
): { x: number; z: number }[] {
  if (fitType === "plug") {
    // Plug outer = tube inner - clearance
    const inner = getTubeInnerDimensions(tube);
    const plugOuterW = inner.width - clearance * 2;
    const plugOuterH = inner.height - clearance * 2;
    switch (tube.shape) {
      case "round":
        return generateRoundProfile(plugOuterW, segments);
      case "square":
        return generateRoundedRectProfile(
          plugOuterW,
          plugOuterH,
          tube.cornerRadius,
          segments / 4,
        );
      case "rectangular":
        return generateRoundedRectProfile(
          plugOuterW,
          plugOuterH,
          tube.cornerRadius,
          segments / 4,
        );
    }
  }
  // Socket: outer = tube outer + clearance + wall
  switch (tube.shape) {
    case "round":
      return generateRoundProfile(
        tube.outerDiameter + clearance * 2 + wallThickness * 2,
        segments,
      );
    case "square":
      return generateRoundedRectProfile(
        tube.outerSize + clearance * 2 + wallThickness * 2,
        tube.outerSize + clearance * 2 + wallThickness * 2,
        tube.cornerRadius + wallThickness,
        segments / 4,
      );
    case "rectangular":
      return generateRoundedRectProfile(
        tube.outerWidth + clearance * 2 + wallThickness * 2,
        tube.outerHeight + clearance * 2 + wallThickness * 2,
        tube.cornerRadius + wallThickness,
        segments / 4,
      );
  }
}

// Interpolate between two profiles
function interpolateProfiles(
  profileA: { x: number; z: number }[],
  profileB: { x: number; z: number }[],
  t: number,
): { x: number; z: number }[] {
  const numPoints = Math.max(profileA.length, profileB.length);
  const result: { x: number; z: number }[] = [];

  for (let i = 0; i < numPoints; i++) {
    const idxA =
      Math.floor((i / numPoints) * profileA.length) % profileA.length;
    const idxB =
      Math.floor((i / numPoints) * profileB.length) % profileB.length;
    const pA = profileA[idxA];
    const pB = profileB[idxB];

    result.push({
      x: pA.x + (pB.x - pA.x) * t,
      z: pA.z + (pB.z - pA.z) * t,
    });
  }

  return result;
}

// Transform a point along the elbow path
function transformAlongPath(
  localX: number,
  localZ: number,
  pathT: number,
  bendAngle: number,
  bendRadius: number,
  straightLength: number,
): { x: number; y: number; z: number } {
  if (bendAngle === 0) {
    // Straight adapter - simple Y offset
    return { x: localX, y: pathT * straightLength, z: localZ };
  }

  const angleRad = (bendAngle * Math.PI) / 180;
  const currentAngle = pathT * angleRad;

  // The bend follows a circular arc in the Y-Z plane
  // Center of the bend arc is at (0, 0, bendRadius)
  // At angle 0, we're at (0, 0, 0) facing +Y
  // At angle 90°, we're at (0, bendRadius, bendRadius) facing +Z

  // Position on the centerline of the bend
  const centerY = bendRadius * Math.sin(currentAngle);
  const centerZ = bendRadius * (1 - Math.cos(currentAngle));

  // The profile plane rotates around the X axis as we go around the bend
  // localX stays in X direction (perpendicular to bend plane)
  // localZ rotates from Z direction toward Y direction

  // At currentAngle, the "up" direction of the profile (originally Z)
  // becomes: Y component = -sin(angle), Z component = cos(angle)
  const transformedY = -localZ * Math.sin(currentAngle);
  const transformedZ = localZ * Math.cos(currentAngle);

  return {
    x: localX,
    y: centerY + transformedY,
    z: centerZ + transformedZ,
  };
}

export function generateAdapterTriangles(config: AdapterConfig): number[][] {
  const { endA, endB, wallThickness, socketDepth, socketClearance, bendAngle } =
    config;
  const bendRadius = getEffectiveBendRadius(config);
  const segments = config.segmentAmount;

  const straightLength = bendAngle === 0 ? bendRadius : 0;

  const triangles: number[][] = [];

  const { endAFit, endBFit } = config;

  // Get profiles for both ends
  const innerProfileA = getInnerProfile(
    endA,
    socketClearance,
    wallThickness,
    endAFit,
    segments,
  );
  const outerProfileA = getOuterProfile(
    endA,
    socketClearance,
    wallThickness,
    endAFit,
    segments,
  );
  const innerProfileB = getInnerProfile(
    endB,
    socketClearance,
    wallThickness,
    endBFit,
    segments,
  );
  const outerProfileB = getOuterProfile(
    endB,
    socketClearance,
    wallThickness,
    endBFit,
    segments,
  );

  const numPoints = Math.max(
    innerProfileA.length,
    innerProfileB.length,
    segments,
  );

  // Normalize all profiles to same point count
  const normalizeProfile = (
    profile: { x: number; z: number }[],
  ): { x: number; z: number }[] => {
    const result: { x: number; z: number }[] = [];
    for (let i = 0; i < numPoints; i++) {
      const idx = Math.floor((i / numPoints) * profile.length) % profile.length;
      result.push(profile[idx]);
    }
    return result;
  };

  const normInnerA = normalizeProfile(innerProfileA);
  const normOuterA = normalizeProfile(outerProfileA);
  const normInnerB = normalizeProfile(innerProfileB);
  const normOuterB = normalizeProfile(outerProfileB);

  const slicesSocket = 4;
  const slicesBend = bendAngle > 0 ? Math.max(32, Math.ceil(bendAngle)) : 2;

  // Helper to generate wall between two slice rings
  function generateWall(
    ring1: { x: number; y: number; z: number }[],
    ring2: { x: number; y: number; z: number }[],
    outward: boolean,
  ) {
    for (let i = 0; i < numPoints; i++) {
      const next = (i + 1) % numPoints;
      const p1 = ring1[i];
      const p2 = ring1[next];
      const p3 = ring2[i];
      const p4 = ring2[next];

      if (outward) {
        addTriangle(
          triangles,
          p1.x,
          p1.y,
          p1.z,
          p3.x,
          p3.y,
          p3.z,
          p2.x,
          p2.y,
          p2.z,
        );
        addTriangle(
          triangles,
          p2.x,
          p2.y,
          p2.z,
          p3.x,
          p3.y,
          p3.z,
          p4.x,
          p4.y,
          p4.z,
        );
      } else {
        addTriangle(
          triangles,
          p1.x,
          p1.y,
          p1.z,
          p2.x,
          p2.y,
          p2.z,
          p3.x,
          p3.y,
          p3.z,
        );
        addTriangle(
          triangles,
          p2.x,
          p2.y,
          p2.z,
          p4.x,
          p4.y,
          p4.z,
          p3.x,
          p3.y,
          p3.z,
        );
      }
    }
  }

  // Helper to generate cap between inner and outer rings
  function generateCap(
    outerRing: { x: number; y: number; z: number }[],
    innerRing: { x: number; y: number; z: number }[],
    faceDown: boolean,
  ) {
    for (let i = 0; i < numPoints; i++) {
      const next = (i + 1) % numPoints;
      const o1 = outerRing[i];
      const o2 = outerRing[next];
      const i1 = innerRing[i];
      const i2 = innerRing[next];

      if (faceDown) {
        addTriangle(
          triangles,
          o1.x,
          o1.y,
          o1.z,
          o2.x,
          o2.y,
          o2.z,
          i1.x,
          i1.y,
          i1.z,
        );
        addTriangle(
          triangles,
          o2.x,
          o2.y,
          o2.z,
          i2.x,
          i2.y,
          i2.z,
          i1.x,
          i1.y,
          i1.z,
        );
      } else {
        addTriangle(
          triangles,
          o1.x,
          o1.y,
          o1.z,
          i1.x,
          i1.y,
          i1.z,
          o2.x,
          o2.y,
          o2.z,
        );
        addTriangle(
          triangles,
          o2.x,
          o2.y,
          o2.z,
          i1.x,
          i1.y,
          i1.z,
          i2.x,
          i2.y,
          i2.z,
        );
      }
    }
  }

  // Build all slice rings
  const allOuterSlices: { x: number; y: number; z: number }[][] = [];
  const allInnerSlices: { x: number; y: number; z: number }[][] = [];

  // Socket A (bottom) - straight section going downward from y=0
  for (let s = 0; s <= slicesSocket; s++) {
    const t = s / slicesSocket;
    const y = -socketDepth * (1 - t);

    const outerSlice: { x: number; y: number; z: number }[] = [];
    const innerSlice: { x: number; y: number; z: number }[] = [];

    for (let i = 0; i < numPoints; i++) {
      outerSlice.push({ x: normOuterA[i].x, y, z: normOuterA[i].z });
      innerSlice.push({ x: normInnerA[i].x, y, z: normInnerA[i].z });
    }

    allOuterSlices.push(outerSlice);
    allInnerSlices.push(innerSlice);
  }

  // Bend section (or straight transition)
  for (let s = 0; s <= slicesBend; s++) {
    const t = s / slicesBend;

    // Interpolate between end profiles for reducers
    const outerInterp = interpolateProfiles(normOuterA, normOuterB, t);
    const innerInterp = interpolateProfiles(normInnerA, normInnerB, t);

    const outerSlice: { x: number; y: number; z: number }[] = [];
    const innerSlice: { x: number; y: number; z: number }[] = [];

    for (let i = 0; i < numPoints; i++) {
      const outerP = transformAlongPath(
        outerInterp[i].x,
        outerInterp[i].z,
        t,
        bendAngle,
        bendRadius,
        straightLength,
      );
      const innerP = transformAlongPath(
        innerInterp[i].x,
        innerInterp[i].z,
        t,
        bendAngle,
        bendRadius,
        straightLength,
      );

      outerSlice.push(outerP);
      innerSlice.push(innerP);
    }

    allOuterSlices.push(outerSlice);
    allInnerSlices.push(innerSlice);
  }

  // Socket B (top) - straight section extending from bend end
  const bendEndOuter = allOuterSlices[allOuterSlices.length - 1];
  const bendEndInner = allInnerSlices[allInnerSlices.length - 1];

  // Calculate the direction at the end of the bend
  const endAngleRad = (bendAngle * Math.PI) / 180;
  const dirY = bendAngle > 0 ? Math.cos(endAngleRad) : 1;
  const dirZ = bendAngle > 0 ? Math.sin(endAngleRad) : 0;

  for (let s = 1; s <= slicesSocket; s++) {
    const t = s / slicesSocket;
    const offset = socketDepth * t;

    const outerSlice: { x: number; y: number; z: number }[] = [];
    const innerSlice: { x: number; y: number; z: number }[] = [];

    for (let i = 0; i < numPoints; i++) {
      const baseOuter = bendEndOuter[i];
      const baseInner = bendEndInner[i];

      // Use the profile-relative offset instead of absolute coordinates
      outerSlice.push({
        x: baseOuter.x,
        y: baseOuter.y + dirY * offset,
        z: baseOuter.z + dirZ * offset,
      });
      innerSlice.push({
        x: baseInner.x,
        y: baseInner.y + dirY * offset,
        z: baseInner.z + dirZ * offset,
      });
    }

    allOuterSlices.push(outerSlice);
    allInnerSlices.push(innerSlice);
  }

  // Generate all walls
  for (let s = 0; s < allOuterSlices.length - 1; s++) {
    generateWall(allOuterSlices[s], allOuterSlices[s + 1], true);
    generateWall(allInnerSlices[s], allInnerSlices[s + 1], false);
  }

  // Bottom cap (Socket A opening)
  generateCap(allOuterSlices[0], allInnerSlices[0], true);

  // Top cap (Socket B opening)
  const lastIdx = allOuterSlices.length - 1;
  generateCap(allOuterSlices[lastIdx], allInnerSlices[lastIdx], false);

  return triangles;
}

