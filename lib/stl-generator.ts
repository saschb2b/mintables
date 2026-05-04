import type {
  TubeConfig,
  RoundTubeConfig,
  SquareTubeConfig,
  RectangularTubeConfig,
  EndCutConfig,
} from "./tube-types";

// Helper to round vertices to avoid floating point precision issues
function roundVertex(v: number, precision = 6): number {
  const factor = Math.pow(10, precision);
  return Math.round(v * factor) / factor;
}

function getTopZ(
  angle: number,
  radius: number,
  baseLength: number,
  cutConfig: EndCutConfig,
  outerRadius: number,
): number {
  if (cutConfig.type === "flat") {
    return baseLength;
  } else if (cutConfig.type === "miter") {
    const miterAngle = (cutConfig.angle * Math.PI) / 180;
    return baseLength + radius * Math.tan(miterAngle) * Math.cos(angle);
  } else if (cutConfig.type === "saddle") {
    const targetRadius = cutConfig.targetDiameter / 2;
    const x = outerRadius * Math.cos(angle);
    const distFromCenter = Math.abs(x);

    if (distFromCenter <= targetRadius) {
      const saddleHeight = Math.sqrt(
        targetRadius * targetRadius - distFromCenter * distFromCenter,
      );
      return (
        baseLength + saddleHeight * Math.sin((cutConfig.angle * Math.PI) / 180)
      );
    }
    return baseLength;
  }
  return baseLength;
}

function getBottomZ(
  angle: number,
  radius: number,
  cutConfig: EndCutConfig,
  outerRadius: number,
): number {
  if (cutConfig.type === "flat") {
    return 0;
  } else if (cutConfig.type === "miter") {
    const miterAngle = (cutConfig.angle * Math.PI) / 180;
    // Miter goes in opposite direction at bottom
    return Math.max(0, -radius * Math.tan(miterAngle) * Math.cos(angle));
  } else if (cutConfig.type === "saddle") {
    const targetRadius = cutConfig.targetDiameter / 2;
    const x = outerRadius * Math.cos(angle);
    const distFromCenter = Math.abs(x);

    if (distFromCenter <= targetRadius) {
      const saddleHeight = Math.sqrt(
        targetRadius * targetRadius - distFromCenter * distFromCenter,
      );
      // Saddle cuts into the bottom
      return -saddleHeight * Math.sin((cutConfig.angle * Math.PI) / 180);
    }
    return 0;
  }
  return 0;
}

function addTriangle(
  triangles: number[][],
  x1: number,
  y1: number,
  z1: number,
  x2: number,
  y2: number,
  z2: number,
  x3: number,
  y3: number,
  z3: number,
): void {
  triangles.push([
    roundVertex(x1),
    roundVertex(y1),
    roundVertex(z1),
    roundVertex(x2),
    roundVertex(y2),
    roundVertex(z2),
    roundVertex(x3),
    roundVertex(y3),
    roundVertex(z3),
  ]);
}

function generateRoundTubeSTL(config: RoundTubeConfig): ArrayBuffer {
  const { innerDiameter, outerDiameter, length, flare, topCut, bottomCut } =
    config;
  const innerRadius = innerDiameter / 2;
  const outerRadius = outerDiameter / 2;
  const segments = 64;

  const triangles: number[][] = [];

  const useFlare = flare.enabled && topCut.type === "flat";
  const mainLength = useFlare ? length - flare.length : length;

  const angles: number[] = [];
  const cosines: number[] = [];
  const sines: number[] = [];

  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    angles.push(angle);
    cosines.push(Math.cos(angle));
    sines.push(Math.sin(angle));
  }

  // Calculate bottom offset if bottom has a non-flat cut
  const bottomOffset =
    bottomCut.type !== "flat"
      ? getMaxBottomOffset(bottomCut, outerRadius, segments, angles)
      : 0;

  for (let i = 0; i < segments; i++) {
    const cos1 = cosines[i];
    const sin1 = sines[i];
    const cos2 = cosines[i + 1];
    const sin2 = sines[i + 1];

    const topZ1Outer = useFlare
      ? mainLength
      : getTopZ(angles[i], outerRadius, mainLength, topCut, outerRadius);
    const topZ2Outer = useFlare
      ? mainLength
      : getTopZ(angles[i + 1], outerRadius, mainLength, topCut, outerRadius);
    const topZ1Inner = useFlare
      ? mainLength
      : getTopZ(angles[i], innerRadius, mainLength, topCut, outerRadius);
    const topZ2Inner = useFlare
      ? mainLength
      : getTopZ(angles[i + 1], innerRadius, mainLength, topCut, outerRadius);

    const bottomZ1Outer =
      bottomOffset + getBottomZ(angles[i], outerRadius, bottomCut, outerRadius);
    const bottomZ2Outer =
      bottomOffset +
      getBottomZ(angles[i + 1], outerRadius, bottomCut, outerRadius);
    const bottomZ1Inner =
      bottomOffset + getBottomZ(angles[i], innerRadius, bottomCut, outerRadius);
    const bottomZ2Inner =
      bottomOffset +
      getBottomZ(angles[i + 1], innerRadius, bottomCut, outerRadius);

    // Outer surface
    addTriangle(
      triangles,
      outerRadius * cos1,
      outerRadius * sin1,
      bottomZ1Outer,
      outerRadius * cos2,
      outerRadius * sin2,
      bottomZ2Outer,
      outerRadius * cos1,
      outerRadius * sin1,
      topZ1Outer,
    );
    addTriangle(
      triangles,
      outerRadius * cos2,
      outerRadius * sin2,
      bottomZ2Outer,
      outerRadius * cos2,
      outerRadius * sin2,
      topZ2Outer,
      outerRadius * cos1,
      outerRadius * sin1,
      topZ1Outer,
    );

    // Inner surface
    addTriangle(
      triangles,
      innerRadius * cos1,
      innerRadius * sin1,
      bottomZ1Inner,
      innerRadius * cos1,
      innerRadius * sin1,
      topZ1Inner,
      innerRadius * cos2,
      innerRadius * sin2,
      bottomZ2Inner,
    );
    addTriangle(
      triangles,
      innerRadius * cos2,
      innerRadius * sin2,
      bottomZ2Inner,
      innerRadius * cos1,
      innerRadius * sin1,
      topZ1Inner,
      innerRadius * cos2,
      innerRadius * sin2,
      topZ2Inner,
    );

    // Bottom cap
    addTriangle(
      triangles,
      outerRadius * cos1,
      outerRadius * sin1,
      bottomZ1Outer,
      innerRadius * cos1,
      innerRadius * sin1,
      bottomZ1Inner,
      innerRadius * cos2,
      innerRadius * sin2,
      bottomZ2Inner,
    );
    addTriangle(
      triangles,
      outerRadius * cos1,
      outerRadius * sin1,
      bottomZ1Outer,
      innerRadius * cos2,
      innerRadius * sin2,
      bottomZ2Inner,
      outerRadius * cos2,
      outerRadius * sin2,
      bottomZ2Outer,
    );

    if (!useFlare) {
      // Top cap
      addTriangle(
        triangles,
        innerRadius * cos1,
        innerRadius * sin1,
        topZ1Inner,
        outerRadius * cos1,
        outerRadius * sin1,
        topZ1Outer,
        innerRadius * cos2,
        innerRadius * sin2,
        topZ2Inner,
      );
      addTriangle(
        triangles,
        innerRadius * cos2,
        innerRadius * sin2,
        topZ2Inner,
        outerRadius * cos1,
        outerRadius * sin1,
        topZ1Outer,
        outerRadius * cos2,
        outerRadius * sin2,
        topZ2Outer,
      );
    }

    if (topCut.type === "chamfer") {
      const chamferAngle = (topCut.angle * Math.PI) / 180;
      const chamferDepth = topCut.depth;
      const chamferInnerZ = mainLength - chamferDepth * Math.tan(chamferAngle);

      // Chamfer face (angled surface between inner wall and top)
      addTriangle(
        triangles,
        innerRadius * cos1,
        innerRadius * sin1,
        chamferInnerZ,
        outerRadius * cos1,
        outerRadius * sin1,
        mainLength,
        innerRadius * cos2,
        innerRadius * sin2,
        chamferInnerZ,
      );
      addTriangle(
        triangles,
        innerRadius * cos2,
        innerRadius * sin2,
        chamferInnerZ,
        outerRadius * cos1,
        outerRadius * sin1,
        mainLength,
        outerRadius * cos2,
        outerRadius * sin2,
        mainLength,
      );
    }

    if (bottomCut.type === "chamfer") {
      const chamferAngle = (bottomCut.angle * Math.PI) / 180;
      const chamferDepth = bottomCut.depth;
      const chamferInnerZ =
        bottomOffset + chamferDepth * Math.tan(chamferAngle);

      // Bottom chamfer face
      addTriangle(
        triangles,
        outerRadius * cos1,
        outerRadius * sin1,
        bottomOffset,
        innerRadius * cos1,
        innerRadius * sin1,
        chamferInnerZ,
        outerRadius * cos2,
        outerRadius * sin2,
        bottomOffset,
      );
      addTriangle(
        triangles,
        outerRadius * cos2,
        outerRadius * sin2,
        bottomOffset,
        innerRadius * cos1,
        innerRadius * sin1,
        chamferInnerZ,
        innerRadius * cos2,
        innerRadius * sin2,
        chamferInnerZ,
      );
    }
  }

  if (useFlare) {
    const flareOuterRadius = (flare.diameter + flare.clearance * 2) / 2;
    const flareStart = mainLength;
    const flareEnd = length;

    for (let i = 0; i < segments; i++) {
      const cos1 = cosines[i];
      const sin1 = sines[i];
      const cos2 = cosines[i + 1];
      const sin2 = sines[i + 1];

      // Flare outer surface (tapered)
      addTriangle(
        triangles,
        outerRadius * cos1,
        outerRadius * sin1,
        flareStart,
        outerRadius * cos2,
        outerRadius * sin2,
        flareStart,
        flareOuterRadius * cos1,
        flareOuterRadius * sin1,
        flareEnd,
      );
      addTriangle(
        triangles,
        outerRadius * cos2,
        outerRadius * sin2,
        flareStart,
        flareOuterRadius * cos2,
        flareOuterRadius * sin2,
        flareEnd,
        flareOuterRadius * cos1,
        flareOuterRadius * sin1,
        flareEnd,
      );

      // Flare inner surface - straight up from mainLength to length
      addTriangle(
        triangles,
        innerRadius * cos1,
        innerRadius * sin1,
        flareStart,
        innerRadius * cos1,
        innerRadius * sin1,
        flareEnd,
        innerRadius * cos2,
        innerRadius * sin2,
        flareStart,
      );
      addTriangle(
        triangles,
        innerRadius * cos2,
        innerRadius * sin2,
        flareStart,
        innerRadius * cos1,
        innerRadius * sin1,
        flareEnd,
        innerRadius * cos2,
        innerRadius * sin2,
        flareEnd,
      );

      // Flare top cap - connects flare outer to inner at the top
      addTriangle(
        triangles,
        innerRadius * cos1,
        innerRadius * sin1,
        flareEnd,
        flareOuterRadius * cos1,
        flareOuterRadius * sin1,
        flareEnd,
        innerRadius * cos2,
        innerRadius * sin2,
        flareEnd,
      );
      addTriangle(
        triangles,
        innerRadius * cos2,
        innerRadius * sin2,
        flareEnd,
        flareOuterRadius * cos1,
        flareOuterRadius * sin1,
        flareEnd,
        flareOuterRadius * cos2,
        flareOuterRadius * sin2,
        flareEnd,
      );
    }
  }

  return createSTLBinary(triangles);
}

// Helper to calculate max bottom offset for non-flat bottom cuts
function getMaxBottomOffset(
  bottomCut: EndCutConfig,
  outerRadius: number,
  segments: number,
  angles: number[],
): number {
  let maxNegative = 0;
  for (let i = 0; i <= segments; i++) {
    const z = getBottomZ(angles[i], outerRadius, bottomCut, outerRadius);
    if (z < maxNegative) maxNegative = z;
  }
  return -maxNegative;
}

function getRoundedRectPoints(
  width: number,
  height: number,
  cornerRadius: number,
  segments = 8,
): [number, number][] {
  const points: [number, number][] = [];
  const hw = width / 2;
  const hh = height / 2;
  const r = Math.min(cornerRadius, hw, hh);

  const totalSegments = segments * 4;

  for (let i = 0; i < totalSegments; i++) {
    const cornerIndex = Math.floor(i / segments);
    const segmentInCorner = i % segments;
    const angleInCorner = (segmentInCorner / segments) * (Math.PI / 2);

    let cx: number, cy: number, startAngle: number;

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
      case 3:
      default:
        cx = hw - r;
        cy = -hh + r;
        startAngle = (3 * Math.PI) / 2;
        break;
    }

    const angle = startAngle + angleInCorner;
    points.push([
      roundVertex(cx + r * Math.cos(angle)),
      roundVertex(cy + r * Math.sin(angle)),
    ]);
  }

  return points;
}

function getRectTopZ(
  x: number,
  _y: number,
  baseLength: number,
  cutConfig: EndCutConfig,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _outerWidth: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _outerHeight: number,
): number {
  if (cutConfig.type === "flat") {
    return baseLength;
  } else if (cutConfig.type === "miter") {
    const miterAngle = (cutConfig.angle * Math.PI) / 180;
    return baseLength + x * Math.tan(miterAngle);
  } else if (cutConfig.type === "saddle") {
    const targetRadius = cutConfig.targetDiameter / 2;
    const distFromCenter = Math.abs(x);

    if (distFromCenter <= targetRadius) {
      const saddleHeight = Math.sqrt(
        targetRadius * targetRadius - distFromCenter * distFromCenter,
      );
      return baseLength + saddleHeight;
    }
    return baseLength;
  }
  return baseLength;
}

function getRectBottomZ(
  x: number,
  _y: number,
  cutConfig: EndCutConfig,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _outerWidth: number,
): number {
  if (cutConfig.type === "flat") {
    return 0;
  } else if (cutConfig.type === "miter") {
    const miterAngle = (cutConfig.angle * Math.PI) / 180;
    return Math.max(0, -x * Math.tan(miterAngle));
  } else if (cutConfig.type === "saddle") {
    const targetRadius = cutConfig.targetDiameter / 2;
    const distFromCenter = Math.abs(x);

    if (distFromCenter <= targetRadius) {
      const saddleHeight = Math.sqrt(
        targetRadius * targetRadius - distFromCenter * distFromCenter,
      );
      return -saddleHeight;
    }
    return 0;
  }
  return 0;
}

function generateRectangularTubeSTL(
  config: SquareTubeConfig | RectangularTubeConfig,
): ArrayBuffer {
  const triangles: number[][] = [];

  let innerWidth: number,
    innerHeight: number,
    outerWidth: number,
    outerHeight: number;
  let flareWidth: number, flareHeight: number;

  if (config.shape === "square") {
    innerWidth = innerHeight = config.innerSize;
    outerWidth = outerHeight = config.outerSize;
    flareWidth = flareHeight = config.flare.width;
  } else {
    innerWidth = config.innerWidth;
    innerHeight = config.innerHeight;
    outerWidth = config.outerWidth;
    outerHeight = config.outerHeight;
    flareWidth = config.flare.width;
    flareHeight = config.flare.height;
  }

  const { length, cornerRadius, flare, topCut, bottomCut } = config;
  const useFlare = flare.enabled && topCut.type === "flat";
  const mainLength = useFlare ? length - flare.length : length;

  const innerPoints = getRoundedRectPoints(
    innerWidth,
    innerHeight,
    cornerRadius,
  );
  const outerPoints = getRoundedRectPoints(
    outerWidth,
    outerHeight,
    cornerRadius,
  );
  const n = innerPoints.length;

  // Calculate bottom offset for non-flat cuts
  let bottomOffset = 0;
  if (bottomCut.type !== "flat") {
    for (let i = 0; i < n; i++) {
      const z = getRectBottomZ(
        outerPoints[i][0],
        outerPoints[i][1],
        bottomCut,
        outerWidth,
      );
      if (z < bottomOffset) bottomOffset = z;
    }
    bottomOffset = -bottomOffset;
  }

  for (let i = 0; i < n; i++) {
    const next = (i + 1) % n;

    const outerTopZ1 = roundVertex(
      getRectTopZ(
        outerPoints[i][0],
        outerPoints[i][1],
        mainLength,
        topCut,
        outerWidth,
        outerHeight,
      ),
    );
    const outerTopZ2 = roundVertex(
      getRectTopZ(
        outerPoints[next][0],
        outerPoints[next][1],
        mainLength,
        topCut,
        outerWidth,
        outerHeight,
      ),
    );
    const innerTopZ1 = roundVertex(
      getRectTopZ(
        innerPoints[i][0],
        innerPoints[i][1],
        mainLength,
        topCut,
        outerWidth,
        outerHeight,
      ),
    );
    const innerTopZ2 = roundVertex(
      getRectTopZ(
        innerPoints[next][0],
        innerPoints[next][1],
        mainLength,
        topCut,
        outerWidth,
        outerHeight,
      ),
    );

    const outerBottomZ1 = roundVertex(
      bottomOffset +
        getRectBottomZ(
          outerPoints[i][0],
          outerPoints[i][1],
          bottomCut,
          outerWidth,
        ),
    );
    const outerBottomZ2 = roundVertex(
      bottomOffset +
        getRectBottomZ(
          outerPoints[next][0],
          outerPoints[next][1],
          bottomCut,
          outerWidth,
        ),
    );
    const innerBottomZ1 = roundVertex(
      bottomOffset +
        getRectBottomZ(
          innerPoints[i][0],
          innerPoints[i][1],
          bottomCut,
          outerWidth,
        ),
    );
    const innerBottomZ2 = roundVertex(
      bottomOffset +
        getRectBottomZ(
          innerPoints[next][0],
          innerPoints[next][1],
          bottomCut,
          outerWidth,
        ),
    );

    // Outer wall
    addTriangle(
      triangles,
      outerPoints[i][0],
      outerPoints[i][1],
      outerBottomZ1,
      outerPoints[next][0],
      outerPoints[next][1],
      outerBottomZ2,
      outerPoints[i][0],
      outerPoints[i][1],
      outerTopZ1,
    );
    addTriangle(
      triangles,
      outerPoints[next][0],
      outerPoints[next][1],
      outerBottomZ2,
      outerPoints[next][0],
      outerPoints[next][1],
      outerTopZ2,
      outerPoints[i][0],
      outerPoints[i][1],
      outerTopZ1,
    );

    // Inner wall
    addTriangle(
      triangles,
      innerPoints[i][0],
      innerPoints[i][1],
      innerBottomZ1,
      innerPoints[i][0],
      innerPoints[i][1],
      innerTopZ1,
      innerPoints[next][0],
      innerPoints[next][1],
      innerBottomZ2,
    );
    addTriangle(
      triangles,
      innerPoints[next][0],
      innerPoints[next][1],
      innerBottomZ2,
      innerPoints[i][0],
      innerPoints[i][1],
      innerTopZ1,
      innerPoints[next][0],
      innerPoints[next][1],
      innerTopZ2,
    );

    // Bottom cap
    addTriangle(
      triangles,
      outerPoints[i][0],
      outerPoints[i][1],
      outerBottomZ1,
      innerPoints[i][0],
      innerPoints[i][1],
      innerBottomZ1,
      innerPoints[next][0],
      innerPoints[next][1],
      innerBottomZ2,
    );
    addTriangle(
      triangles,
      outerPoints[i][0],
      outerPoints[i][1],
      outerBottomZ1,
      innerPoints[next][0],
      innerPoints[next][1],
      innerBottomZ2,
      outerPoints[next][0],
      outerPoints[next][1],
      outerBottomZ2,
    );

    if (!useFlare) {
      // Top cap
      addTriangle(
        triangles,
        innerPoints[i][0],
        innerPoints[i][1],
        innerTopZ1,
        outerPoints[i][0],
        outerPoints[i][1],
        outerTopZ1,
        innerPoints[next][0],
        innerPoints[next][1],
        innerTopZ2,
      );
      addTriangle(
        triangles,
        innerPoints[next][0],
        innerPoints[next][1],
        innerTopZ2,
        outerPoints[i][0],
        outerPoints[i][1],
        outerTopZ1,
        outerPoints[next][0],
        outerPoints[next][1],
        outerTopZ2,
      );
    }
  }

  if (useFlare) {
    const flarePoints = getRoundedRectPoints(
      flareWidth + flare.clearance * 2,
      flareHeight + flare.clearance * 2,
      cornerRadius,
    );
    const flareStart = mainLength;
    const flareEnd = length;

    for (let i = 0; i < n; i++) {
      const next = (i + 1) % n;

      addTriangle(
        triangles,
        outerPoints[i][0],
        outerPoints[i][1],
        flareStart,
        outerPoints[next][0],
        outerPoints[next][1],
        flareStart,
        flarePoints[i][0],
        flarePoints[i][1],
        flareEnd,
      );
      addTriangle(
        triangles,
        outerPoints[next][0],
        outerPoints[next][1],
        flareStart,
        flarePoints[next][0],
        flarePoints[next][1],
        flareEnd,
        flarePoints[i][0],
        flarePoints[i][1],
        flareEnd,
      );

      addTriangle(
        triangles,
        innerPoints[i][0],
        innerPoints[i][1],
        flareStart,
        innerPoints[i][0],
        innerPoints[i][1],
        flareEnd,
        innerPoints[next][0],
        innerPoints[next][1],
        flareStart,
      );
      addTriangle(
        triangles,
        innerPoints[next][0],
        innerPoints[next][1],
        flareStart,
        innerPoints[i][0],
        innerPoints[i][1],
        flareEnd,
        innerPoints[next][0],
        innerPoints[next][1],
        flareEnd,
      );

      addTriangle(
        triangles,
        innerPoints[i][0],
        innerPoints[i][1],
        flareEnd,
        flarePoints[i][0],
        flarePoints[i][1],
        flareEnd,
        innerPoints[next][0],
        innerPoints[next][1],
        flareEnd,
      );
      addTriangle(
        triangles,
        innerPoints[next][0],
        innerPoints[next][1],
        flareEnd,
        flarePoints[i][0],
        flarePoints[i][1],
        flareEnd,
        flarePoints[next][0],
        flarePoints[next][1],
        flareEnd,
      );
    }
  }

  return createSTLBinary(triangles);
}

function generateClamshellRoundTubeSTL(config: RoundTubeConfig): ArrayBuffer {
  const { innerDiameter, outerDiameter, length, clamshell } = config;
  const innerRadius = innerDiameter / 2;
  const outerRadius = outerDiameter / 2;
  const totalSegments = 64;

  const { overlap, clearance, separation } = clamshell;
  const overlapRad = (overlap * Math.PI) / 180;

  // Split wall at midpoint with clearance gap
  const splitR = (innerRadius + outerRadius) / 2;
  const splitRInner = splitR - clearance / 2;
  const splitROuter = splitR + clearance / 2;

  const triangles: number[][] = [];

  // Generate an arc band: tube segment from rInner to rOuter, startAngle to endAngle
  function generateArcBand(
    startAngle: number,
    endAngle: number,
    rInner: number,
    rOuter: number,
    offsetY: number,
  ) {
    const arcSpan = endAngle - startAngle;
    const segs = Math.max(
      2,
      Math.round((arcSpan / (2 * Math.PI)) * totalSegments),
    );

    for (let i = 0; i < segs; i++) {
      const a1 = startAngle + (i / segs) * arcSpan;
      const a2 = startAngle + ((i + 1) / segs) * arcSpan;
      const c1 = Math.cos(a1),
        s1 = Math.sin(a1);
      const c2 = Math.cos(a2),
        s2 = Math.sin(a2);

      const ox1 = rOuter * c1,
        oy1 = rOuter * s1 + offsetY;
      const ox2 = rOuter * c2,
        oy2 = rOuter * s2 + offsetY;
      const ix1 = rInner * c1,
        iy1 = rInner * s1 + offsetY;
      const ix2 = rInner * c2,
        iy2 = rInner * s2 + offsetY;

      // Outer wall
      addTriangle(triangles, ox1, oy1, 0, ox2, oy2, 0, ox1, oy1, length);
      addTriangle(triangles, ox2, oy2, 0, ox2, oy2, length, ox1, oy1, length);
      // Inner wall
      addTriangle(triangles, ix1, iy1, 0, ix1, iy1, length, ix2, iy2, 0);
      addTriangle(triangles, ix2, iy2, 0, ix1, iy1, length, ix2, iy2, length);
      // Top cap (z = length)
      addTriangle(
        triangles,
        ix1,
        iy1,
        length,
        ox1,
        oy1,
        length,
        ix2,
        iy2,
        length,
      );
      addTriangle(
        triangles,
        ix2,
        iy2,
        length,
        ox1,
        oy1,
        length,
        ox2,
        oy2,
        length,
      );
      // Bottom cap (z = 0)
      addTriangle(triangles, ox1, oy1, 0, ix1, iy1, 0, ix2, iy2, 0);
      addTriangle(triangles, ox1, oy1, 0, ix2, iy2, 0, ox2, oy2, 0);
    }

    // Radial end caps at start and end of arc
    for (const isStart of [true, false]) {
      const angle = isStart ? startAngle : endAngle;
      const c = Math.cos(angle),
        s = Math.sin(angle);
      const oxa = rOuter * c,
        oya = rOuter * s + offsetY;
      const ixa = rInner * c,
        iya = rInner * s + offsetY;

      if (isStart) {
        addTriangle(triangles, ixa, iya, 0, oxa, oya, 0, ixa, iya, length);
        addTriangle(triangles, oxa, oya, 0, oxa, oya, length, ixa, iya, length);
      } else {
        addTriangle(triangles, oxa, oya, 0, ixa, iya, 0, oxa, oya, length);
        addTriangle(triangles, ixa, iya, 0, ixa, iya, length, oxa, oya, length);
      }
    }
  }

  // Step face: seals the clearance gap between inner and outer bands at split plane
  function generateStepFace(angle: number, offsetY: number, normalUp: boolean) {
    const c = Math.cos(angle),
      s = Math.sin(angle);
    const ix = splitRInner * c,
      iy = splitRInner * s + offsetY;
    const ox = splitROuter * c,
      oy = splitROuter * s + offsetY;

    if (normalUp) {
      addTriangle(triangles, ix, iy, 0, ox, oy, 0, ix, iy, length);
      addTriangle(triangles, ox, oy, 0, ox, oy, length, ix, iy, length);
    } else {
      addTriangle(triangles, ox, oy, 0, ix, iy, 0, ox, oy, length);
      addTriangle(triangles, ix, iy, 0, ix, iy, length, ox, oy, length);
    }
  }

  const offA = separation / 2;
  const offB = -separation / 2;

  // Half A (top, angles 0→π): inner band flush, outer band overlaps past split
  generateArcBand(0, Math.PI, innerRadius, splitRInner, offA);
  generateArcBand(
    -overlapRad,
    Math.PI + overlapRad,
    splitROuter,
    outerRadius,
    offA,
  );
  generateStepFace(0, offA, false);
  generateStepFace(Math.PI, offA, true);

  // Half B (bottom, angles π→2π): outer band flush, inner band overlaps past split
  generateArcBand(
    Math.PI - overlapRad,
    2 * Math.PI + overlapRad,
    innerRadius,
    splitRInner,
    offB,
  );
  generateArcBand(Math.PI, 2 * Math.PI, splitROuter, outerRadius, offB);
  generateStepFace(Math.PI, offB, false);
  generateStepFace(2 * Math.PI, offB, true);

  // Snap lips: small teeth at overlap tips that protrude into the clearance gap
  const snapLipH = clamshell.snapLipHeight;
  if (snapLipH > 0) {
    const snapAngle = (2 * Math.PI) / 180; // 2° of arc for each snap lip

    // Half A outer band tips — teeth protrude inward (below splitROuter)
    generateArcBand(
      -overlapRad,
      -overlapRad + snapAngle,
      splitROuter - snapLipH,
      splitROuter,
      offA,
    );
    generateArcBand(
      Math.PI + overlapRad - snapAngle,
      Math.PI + overlapRad,
      splitROuter - snapLipH,
      splitROuter,
      offA,
    );

    // Half B inner band tips — teeth protrude outward (above splitRInner)
    generateArcBand(
      Math.PI - overlapRad,
      Math.PI - overlapRad + snapAngle,
      splitRInner,
      splitRInner + snapLipH,
      offB,
    );
    generateArcBand(
      2 * Math.PI + overlapRad - snapAngle,
      2 * Math.PI + overlapRad,
      splitRInner,
      splitRInner + snapLipH,
      offB,
    );
  }

  return createSTLBinary(triangles);
}

function createSTLBinary(triangles: number[][]): ArrayBuffer {
  const numTriangles = triangles.length;
  const bufferSize = 84 + numTriangles * 50;
  const buffer = new ArrayBuffer(bufferSize);
  const view = new DataView(buffer);

  const header = "TubeCraft STL - Watertight Mesh";
  for (let i = 0; i < 80; i++) {
    view.setUint8(i, i < header.length ? header.charCodeAt(i) : 0);
  }

  view.setUint32(80, numTriangles, true);

  let offset = 84;
  for (const tri of triangles) {
    const v1 = [tri[3] - tri[0], tri[4] - tri[1], tri[5] - tri[2]];
    const v2 = [tri[6] - tri[0], tri[7] - tri[1], tri[8] - tri[2]];
    const nx = v1[1] * v2[2] - v1[2] * v2[1];
    const ny = v1[2] * v2[0] - v1[0] * v2[2];
    const nz = v1[0] * v2[1] - v1[1] * v2[0];
    const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;

    view.setFloat32(offset, nx / len, true);
    offset += 4;
    view.setFloat32(offset, ny / len, true);
    offset += 4;
    view.setFloat32(offset, nz / len, true);
    offset += 4;

    for (let i = 0; i < 9; i++) {
      view.setFloat32(offset, tri[i], true);
      offset += 4;
    }

    view.setUint16(offset, 0, true);
    offset += 2;
  }

  return buffer;
}

export function generateSTL(config: TubeConfig): ArrayBuffer {
  if (config.shape === "round" && config.clamshell.enabled) {
    return generateClamshellRoundTubeSTL(config);
  }
  if (config.shape === "round") {
    return generateRoundTubeSTL(config);
  }
  return generateRectangularTubeSTL(config);
}

export function generateTubeTriangles(config: TubeConfig): number[][] {
  const buffer = generateSTL(config);
  return parseTrianglesFromSTL(buffer);
}

function parseTrianglesFromSTL(buffer: ArrayBuffer): number[][] {
  const view = new DataView(buffer);
  const numTriangles = view.getUint32(80, true);
  const triangles: number[][] = [];
  let offset = 84;
  for (let i = 0; i < numTriangles; i++) {
    offset += 12; // skip normal
    const tri: number[] = [];
    for (let j = 0; j < 9; j++) {
      tri.push(view.getFloat32(offset, true));
      offset += 4;
    }
    triangles.push(tri);
    offset += 2; // skip attribute byte count
  }
  return triangles;
}

export function downloadSTL(config: TubeConfig, filename = "tube.stl"): void {
  const buffer = generateSTL(config);
  const blob = new Blob([buffer], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
