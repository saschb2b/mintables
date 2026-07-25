import { describe, expect, it } from "vitest";
import {
  analyzeTriangles,
  isPrintableMesh,
} from "@mintables/shared/lib/geometry/mesh-analysis";
import {
  CUSTOM_TEXTURE_SAMPLE_COUNT,
  encodeCustomTextureSamples,
} from "../src/custom-height-map";
import { generateHexTileTriangles } from "../src/geometry";
import { calculateHexTileLayout, cardSlotPlan } from "../src/layout";
import { DEFAULT_HEX_TILE_CONFIG } from "../src/types";
import type { HexTileSurfaceTexture } from "../src/types";
import { validateHexTileConfig } from "../src/validation";

const SURFACE_TEXTURES: HexTileSurfaceTexture[] = [
  "wood-grain",
  "cobblestone",
  "hammered-stone",
  "sci-fi-panels",
];

function vertexKey(x: number, y: number, z: number): string {
  return `${x.toFixed(6)},${y.toFixed(6)},${z.toFixed(6)}`;
}

function undirectedEdgeKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

function edgeUseCounts(triangles: number[][]): number[] {
  const counts = new Map<string, number>();
  for (const triangle of triangles) {
    const vertices = [
      vertexKey(triangle[0], triangle[1], triangle[2]),
      vertexKey(triangle[3], triangle[4], triangle[5]),
      vertexKey(triangle[6], triangle[7], triangle[8]),
    ];
    for (const [a, b] of [
      [vertices[0], vertices[1]],
      [vertices[1], vertices[2]],
      [vertices[2], vertices[0]],
    ]) {
      const key = undirectedEdgeKey(a, b);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  return [...counts.values()];
}

function uniqueHeights(triangles: number[][]): number[] {
  return [
    ...new Set(
      triangles.flatMap((triangle) => [triangle[2], triangle[5], triangle[8]]),
    ),
  ];
}

describe("generateHexTileTriangles", () => {
  it("creates an exact printable hex with a closed keyed-magnet mesh", () => {
    const config = DEFAULT_HEX_TILE_CONFIG;
    const layout = calculateHexTileLayout(config);
    const triangles = generateHexTileTriangles(config);
    const analysis = analyzeTriangles(triangles);

    expect(isPrintableMesh(triangles)).toBe(true);
    expect(analysis.bounds.maxX - analysis.bounds.minX).toBeCloseTo(
      layout.pointToPoint,
      6,
    );
    expect(analysis.bounds.maxY - analysis.bounds.minY).toBeCloseTo(
      config.acrossFlats,
      6,
    );
    expect(analysis.bounds.minZ).toBe(0);
    expect(analysis.bounds.maxZ).toBe(config.bodyHeight);
    expect(edgeUseCounts(triangles).every((count) => count === 2)).toBe(true);
  });

  it("uses compact 45-degree magnet shoulders and a short bridge", () => {
    const layout = calculateHexTileLayout(DEFAULT_HEX_TILE_CONFIG);
    const triangles = generateHexTileTriangles(DEFAULT_HEX_TILE_CONFIG);
    const heights = uniqueHeights(triangles);
    const circularTop = layout.magnetCenterZ + layout.magnetSocketDiameter / 2;

    expect(
      heights.some((height) => Math.abs(height - layout.magnetRoofZ) < 1e-5),
    ).toBe(true);
    expect(layout.magnetRoofZ).toBeCloseTo(circularTop, 6);
    expect(layout.magnetBridgeWidth).toBeLessThan(4.5);
    expect(layout.magnetCount).toBe(6);
  });

  it("builds closed vertical rod channels with an undersized retaining lip", () => {
    const config = {
      ...DEFAULT_HEX_TILE_CONFIG,
      magnetMode: "captive" as const,
    };
    const layout = calculateHexTileLayout(config);
    const triangles = generateHexTileTriangles(config);

    expect(isPrintableMesh(triangles)).toBe(true);
    expect(edgeUseCounts(triangles).every((count) => count === 2)).toBe(true);
    expect(layout.magnetCount).toBe(6);
    expect(layout.magnetSocketLength).toBeCloseTo(10.25, 6);
    expect(layout.magnetSocketDiameter).toBeCloseTo(3.25, 6);
    expect(layout.magnetThroatWidth).toBeCloseTo(2.5, 6);
    expect(layout.magnetThroatWidth).toBeLessThan(config.magnetRodDiameter);
    expect(layout.magnetRoofZ - layout.magnetCenterZ).toBeCloseTo(
      layout.magnetSocketLength / 2,
      6,
    );
    const heights = uniqueHeights(triangles);
    expect(
      heights.some(
        (height) =>
          Math.abs(
            height - (layout.magnetCenterZ - layout.magnetSocketLength / 2),
          ) < 1e-6,
      ),
    ).toBe(true);
    expect(
      heights.some((height) => Math.abs(height - layout.magnetRoofZ) < 1e-6),
    ).toBe(true);
  });

  it("closes the face around each socket of a magnet pair", () => {
    const config = {
      ...DEFAULT_HEX_TILE_CONFIG,
      magnetMode: "paired" as const,
    };
    const triangles = generateHexTileTriangles(config);

    expect(calculateHexTileLayout(config).magnetCount).toBe(12);
    expect(isPrintableMesh(triangles)).toBe(true);
    expect(edgeUseCounts(triangles).every((count) => count === 2)).toBe(true);
  });

  it("closes a through channel that runs between paired sockets", () => {
    const config = {
      ...DEFAULT_HEX_TILE_CONFIG,
      purpose: "cards" as const,
      magnetMode: "paired" as const,
      cardSlotCount: 5,
      cardSlotThroughCount: 1,
    };
    const triangles = generateHexTileTriangles(config);

    expect(validateHexTileConfig(config).errors).toHaveLength(0);
    expect(calculateHexTileLayout(config).cardChannelCount).toBe(1);
    expect(isPrintableMesh(triangles)).toBe(true);
    expect(edgeUseCounts(triangles).every((count) => count === 2)).toBe(true);
  });

  it("adds a shallow north marker to both keyed magnet modes", () => {
    const keyedLayout = calculateHexTileLayout(DEFAULT_HEX_TILE_CONFIG);
    const keyedHeights = uniqueHeights(
      generateHexTileTriangles(DEFAULT_HEX_TILE_CONFIG),
    );
    const pairedHeights = uniqueHeights(
      generateHexTileTriangles({
        ...DEFAULT_HEX_TILE_CONFIG,
        magnetMode: "paired",
      }),
    );
    const captiveHeights = uniqueHeights(
      generateHexTileTriangles({
        ...DEFAULT_HEX_TILE_CONFIG,
        magnetMode: "captive",
      }),
    );
    const markerFloorZ = keyedLayout.topHeight - keyedLayout.northMarkerDepth;

    expect(
      keyedHeights.some((height) => Math.abs(height - markerFloorZ) < 1e-5),
    ).toBe(true);
    expect(
      pairedHeights.some((height) => Math.abs(height - markerFloorZ) < 1e-5),
    ).toBe(false);
    expect(
      captiveHeights.some((height) => Math.abs(height - markerFloorZ) < 1e-5),
    ).toBe(true);
  });

  it("uses a circular opening and floor for the basic bowl", () => {
    const config = DEFAULT_HEX_TILE_CONFIG;
    const layout = calculateHexTileLayout(config);
    const triangles = generateHexTileTriangles(config);
    const openingRadius = layout.innerAcrossFlats / 2;
    const openingRadii = triangles
      .flatMap((triangle) => [
        [triangle[0], triangle[1], triangle[2]],
        [triangle[3], triangle[4], triangle[5]],
        [triangle[6], triangle[7], triangle[8]],
      ])
      .filter(([, , z]) => Math.abs(z - layout.topHeight) < 1e-6)
      .map(([x, y]) => Math.hypot(x, y))
      .filter((radius) => Math.abs(radius - openingRadius) < 0.1);

    expect(openingRadii.length).toBeGreaterThanOrEqual(64);
    expect(Math.max(...openingRadii) - Math.min(...openingRadii)).toBeLessThan(
      2e-6,
    );
    expect(uniqueHeights(triangles)).toContain(
      layout.topHeight - config.bowlDepth,
    );
    expect(edgeUseCounts(triangles).every((count) => count === 2)).toBe(true);
  });

  it("keeps divided wells smooth, separate, and manifold", () => {
    const config = {
      ...DEFAULT_HEX_TILE_CONFIG,
      bowlDivider: true,
      dividerAngle: 60 as const,
    };
    const triangles = generateHexTileTriangles(config);
    const layout = calculateHexTileLayout(config);
    const floorZ = Math.max(
      config.floorThickness + config.raiseHeight,
      layout.topHeight - config.bowlDepth,
    );
    const floorVertices = triangles.flatMap((triangle) => {
      const vertices = [
        [triangle[0], triangle[1], triangle[2]],
        [triangle[3], triangle[4], triangle[5]],
        [triangle[6], triangle[7], triangle[8]],
      ];
      return vertices.filter(([, , z]) => Math.abs(z - floorZ) < 1e-6);
    });

    expect(floorVertices.some(([x, y]) => x > 5 || y > 5)).toBe(true);
    expect(floorVertices.some(([x, y]) => x < -5 || y < -5)).toBe(true);
    expect(edgeUseCounts(triangles).every((count) => count === 2)).toBe(true);
  });

  it("builds rounded card slots to their requested count and depth", () => {
    const config = {
      ...DEFAULT_HEX_TILE_CONFIG,
      purpose: "cards" as const,
      cardSlotCount: 6,
      cardSlotDepth: 8,
    };
    const layout = calculateHexTileLayout(config);
    const triangles = generateHexTileTriangles(config);
    const slotFloorZ = layout.topHeight - config.cardSlotDepth;
    const slotFloorXs: number[] = [];

    for (const triangle of triangles) {
      const zs = [triangle[2], triangle[5], triangle[8]];
      if (zs.every((z) => Math.abs(z - slotFloorZ) < 1e-6)) {
        slotFloorXs.push(triangle[0], triangle[3], triangle[6]);
      }
    }

    const sortedXs = [...new Set(slotFloorXs.map((x) => x.toFixed(5)))].map(
      Number,
    );
    sortedXs.sort((a, b) => a - b);
    const slotGroups = sortedXs.reduce(
      (count, x, index) =>
        index === 0 || x - sortedXs[index - 1] > config.cardSlotWidth * 2
          ? count + 1
          : count,
      0,
    );

    expect(slotGroups).toBe(config.cardSlotCount);
    expect(edgeUseCounts(triangles).every((count) => count === 2)).toBe(true);
  });

  it("opens the requested slots into channels that reach both flat edges", () => {
    const config = {
      ...DEFAULT_HEX_TILE_CONFIG,
      purpose: "cards" as const,
      cardSlotThroughCount: 2,
    };
    const layout = calculateHexTileLayout(config);
    const triangles = generateHexTileTriangles(config);
    const plan = cardSlotPlan(config);
    const throughOffsets = plan
      .filter((slot) => slot.isThrough)
      .map((slot) => slot.offset);
    const edgeY = config.acrossFlats / 2;
    const floorEdgeXs = triangles
      .flatMap((triangle) => [
        [triangle[0], triangle[1], triangle[2]],
        [triangle[3], triangle[4], triangle[5]],
        [triangle[6], triangle[7], triangle[8]],
      ])
      .filter(
        ([, y, z]) =>
          Math.abs(Math.abs(y) - edgeY) < 1e-9 &&
          Math.abs(z - layout.cardSlotFloorZ) < 1e-9,
      )
      .map(([x]) => x);

    expect(throughOffsets).toEqual([-12, 12]);
    expect(layout.cardChannelCount).toBe(2);
    expect(isPrintableMesh(triangles)).toBe(true);
    expect(edgeUseCounts(triangles).every((count) => count === 2)).toBe(true);
    for (const offset of throughOffsets) {
      for (const side of [-1, 1]) {
        expect(
          floorEdgeXs.some(
            (x) =>
              Math.abs(x - (offset + (side * config.cardSlotWidth) / 2)) < 1e-9,
          ),
        ).toBe(true);
      }
    }
  });

  it("keeps the tile closed when every card slot runs through", () => {
    const config = {
      ...DEFAULT_HEX_TILE_CONFIG,
      purpose: "cards" as const,
      magnetMode: "none" as const,
      cardSlotCount: 5,
      cardSlotThroughCount: 5,
      isSurfaceTextureEnabled: true,
      surfaceTexture: "wood-grain" as const,
    };
    const layout = calculateHexTileLayout(config);
    const triangles = generateHexTileTriangles(config);
    const analysis = analyzeTriangles(triangles);

    expect(layout.cardChannelCount).toBe(5);
    expect(isPrintableMesh(triangles)).toBe(true);
    expect(edgeUseCounts(triangles).every((count) => count === 2)).toBe(true);
    expect(analysis.bounds.minZ).toBe(0);
    expect(analysis.bounds.maxZ).toBe(layout.topHeight);
  });

  it("moves the orientation dot off a centered through channel", () => {
    const centered = {
      ...DEFAULT_HEX_TILE_CONFIG,
      purpose: "cards" as const,
      cardSlotCount: 5,
      cardSlotThroughCount: 3,
      cardSlotDepth: 4.5,
    };
    const layout = calculateHexTileLayout(centered);
    const triangles = generateHexTileTriangles(centered);
    const markerFloorZ = layout.topHeight - layout.northMarkerDepth;
    const markerXs = triangles
      .flatMap((triangle) => [
        [triangle[0], triangle[1], triangle[2]],
        [triangle[3], triangle[4], triangle[5]],
        [triangle[6], triangle[7], triangle[8]],
      ])
      .filter(([, , z]) => Math.abs(z - markerFloorZ) < 1e-9)
      .map(([x]) => x);

    expect(layout.northMarkerCenterX).not.toBe(0);
    expect(layout.northMarkerCenterX).not.toBeNull();
    expect(markerXs.length).toBeGreaterThan(0);
    expect(
      markerXs.every((x) => Math.abs(x) >= centered.cardSlotWidth / 2 + 0.5),
    ).toBe(true);
    expect(validateHexTileConfig(centered).errors).toHaveLength(0);
    expect(edgeUseCounts(triangles).every((count) => count === 2)).toBe(true);
  });

  it("forms an outer dice trough and a higher center cup", () => {
    const config = {
      ...DEFAULT_HEX_TILE_CONFIG,
      purpose: "dice-orbit" as const,
    };
    const triangles = generateHexTileTriangles(config);
    const floorZ = config.floorThickness + config.raiseHeight;
    const centerTopZ = floorZ + config.orbitCenterRaise;
    const centerFloorZ = centerTopZ - config.orbitCenterDepth;
    const heights = uniqueHeights(triangles);

    expect(heights).toContain(floorZ);
    expect(heights).toContain(centerTopZ);
    expect(
      heights.some((height) => Math.abs(height - centerFloorZ) < 1e-5),
    ).toBe(true);
    expect(centerFloorZ).toBeGreaterThan(floorZ);
    expect(edgeUseCounts(triangles).every((count) => count === 2)).toBe(true);
  });

  it("carves a rolling well with a wide flat floor and no sharp corner", () => {
    const config = {
      ...DEFAULT_HEX_TILE_CONFIG,
      purpose: "rolling" as const,
    };
    const layout = calculateHexTileLayout(config);
    const triangles = generateHexTileTriangles(config);
    const floorPoints = triangles
      .flatMap((triangle) => [
        [triangle[0], triangle[1], triangle[2]],
        [triangle[3], triangle[4], triangle[5]],
        [triangle[6], triangle[7], triangle[8]],
      ])
      .filter(([, , z]) => Math.abs(z - layout.rollFloorZ) < 1e-9);
    const acrossFlats =
      2 * Math.max(...floorPoints.map(([, y]) => Math.abs(y)));
    const cornerReach = Math.max(
      ...floorPoints.map(([x, y]) => Math.hypot(x, y)),
    );

    expect(isPrintableMesh(triangles)).toBe(true);
    expect(edgeUseCounts(triangles).every((count) => count === 2)).toBe(true);
    expect(acrossFlats).toBeCloseTo(layout.rollFloorAcrossFlats, 6);
    // A sharp corner would reach the circumradius. An arc of radius r on a
    // 120-degree corner pulls that in by r * (1 / sin 60 - 1).
    const floorCornerRadius = config.rollCornerRadius - layout.rollFloorInset;
    expect(acrossFlats / Math.sqrt(3) - cornerReach).toBeCloseTo(
      floorCornerRadius * (1 / Math.sin(Math.PI / 3) - 1),
      3,
    );
    expect(layout.rollFloorAcrossFlats).toBeGreaterThan(
      layout.innerAcrossFlats - 2 * config.rollDepth,
    );
  });

  it("keeps the rolling well closed with relief and captive rods", () => {
    const config = {
      ...DEFAULT_HEX_TILE_CONFIG,
      purpose: "rolling" as const,
      magnetMode: "captive" as const,
      isSurfaceTextureEnabled: true,
      surfaceTexture: "hammered-stone" as const,
      rollWallDraft: 0,
      rollFloorFillet: 0.5,
    };
    const layout = calculateHexTileLayout(config);
    const triangles = generateHexTileTriangles(config);
    const heights = uniqueHeights(triangles);

    expect(validateHexTileConfig(config).errors).toHaveLength(0);
    expect(isPrintableMesh(triangles)).toBe(true);
    expect(edgeUseCounts(triangles).every((count) => count === 2)).toBe(true);
    expect(
      heights.some(
        (height) =>
          Math.abs(height - (layout.rollFloorZ - config.surfaceTextureDepth)) <
          1e-9,
      ),
    ).toBe(true);
  });

  it("raises the storage surface without moving the magnet system", () => {
    const raised = { ...DEFAULT_HEX_TILE_CONFIG, raiseHeight: 8 };
    const baseLayout = calculateHexTileLayout(DEFAULT_HEX_TILE_CONFIG);
    const raisedLayout = calculateHexTileLayout(raised);
    const analysis = analyzeTriangles(generateHexTileTriangles(raised));

    expect(analysis.bounds.maxZ).toBe(DEFAULT_HEX_TILE_CONFIG.bodyHeight + 8);
    expect(raisedLayout.magnetCenterZ).toBe(baseLayout.magnetCenterZ);
    expect(raisedLayout.magnetRoofZ).toBe(baseLayout.magnetRoofZ);
  });

  it.each(SURFACE_TEXTURES)(
    "engraves a closed %s relief without increasing finished height",
    (surfaceTexture) => {
      const config = {
        ...DEFAULT_HEX_TILE_CONFIG,
        isSurfaceTextureEnabled: true,
        surfaceTexture,
      };
      const triangles = generateHexTileTriangles(config);
      const analysis = analyzeTriangles(triangles);
      const textureFloorZ = config.bodyHeight - config.surfaceTextureDepth;

      expect(isPrintableMesh(triangles)).toBe(true);
      expect(analysis.bounds.maxZ).toBe(config.bodyHeight);
      expect(
        uniqueHeights(triangles).some(
          (height) => Math.abs(height - textureFloorZ) < 1e-5,
        ),
      ).toBe(true);
      expect(edgeUseCounts(triangles).every((count) => count === 2)).toBe(true);
    },
  );

  it("keeps bowl relief outside the carved opening", () => {
    const config = {
      ...DEFAULT_HEX_TILE_CONFIG,
      isSurfaceTextureEnabled: true,
      surfaceTexture: "hammered-stone" as const,
    };
    const layout = calculateHexTileLayout(config);
    const textureFloorZ = layout.topHeight - config.surfaceTextureDepth;
    const textureVertices = generateHexTileTriangles(config)
      .flatMap((triangle) => [
        [triangle[0], triangle[1], triangle[2]],
        [triangle[3], triangle[4], triangle[5]],
        [triangle[6], triangle[7], triangle[8]],
      ])
      .filter(([, , z]) => Math.abs(z - textureFloorZ) < 1e-6);

    expect(textureVertices.length).toBeGreaterThan(0);
    expect(
      textureVertices.every(
        ([x, y]) => Math.hypot(x, y) >= layout.innerAcrossFlats / 2 + 0.7,
      ),
    ).toBe(true);
  });

  it("keeps card-display relief clear of every slot", () => {
    const config = {
      ...DEFAULT_HEX_TILE_CONFIG,
      purpose: "cards" as const,
      isSurfaceTextureEnabled: true,
      surfaceTexture: "cobblestone" as const,
    };
    const layout = calculateHexTileLayout(config);
    const textureFloorZ = layout.topHeight - config.surfaceTextureDepth;
    const centerOffset =
      ((config.cardSlotCount - 1) * config.cardSlotSpacing) / 2;
    const slotCenters = Array.from(
      { length: config.cardSlotCount },
      (_, index) => index * config.cardSlotSpacing - centerOffset,
    );
    const slotRadius = config.cardSlotWidth / 2;
    const slotStraightHalfLength = (config.cardSlotLength - slotRadius * 2) / 2;
    const textureVertices = generateHexTileTriangles(config)
      .flatMap((triangle) => [
        [triangle[0], triangle[1], triangle[2]],
        [triangle[3], triangle[4], triangle[5]],
        [triangle[6], triangle[7], triangle[8]],
      ])
      .filter(([, , z]) => Math.abs(z - textureFloorZ) < 1e-6);

    expect(textureVertices.length).toBeGreaterThan(0);
    expect(
      textureVertices.every(([x, y]) =>
        slotCenters.every((centerX) => {
          const closestY = Math.max(
            -slotStraightHalfLength,
            Math.min(slotStraightHalfLength, y),
          );
          return Math.hypot(x - centerX, y - closestY) >= slotRadius + 0.7;
        }),
      ),
    ).toBe(true);
  });

  it("turns a custom grayscale map into variable-depth printable relief", () => {
    const samples = Uint8Array.from(
      { length: CUSTOM_TEXTURE_SAMPLE_COUNT },
      (_, index) => (index % 2 === 0 ? 0 : 128),
    );
    const config = {
      ...DEFAULT_HEX_TILE_CONFIG,
      purpose: "cards" as const,
      isSurfaceTextureEnabled: true,
      surfaceTexture: "custom" as const,
      customTextureData: encodeCustomTextureSamples(samples),
    };
    const layout = calculateHexTileLayout(config);
    const triangles = generateHexTileTriangles(config);
    const heights = uniqueHeights(triangles);

    expect(isPrintableMesh(triangles)).toBe(true);
    expect(
      heights.some(
        (height) =>
          Math.abs(height - (layout.topHeight - config.surfaceTextureDepth)) <
          1e-5,
      ),
    ).toBe(true);
    expect(
      heights.some(
        (height) =>
          Math.abs(
            height -
              (layout.topHeight - config.surfaceTextureDepth * (1 - 128 / 255)),
          ) < 1e-5,
      ),
    ).toBe(true);
    expect(edgeUseCounts(triangles).every((count) => count === 2)).toBe(true);
  });
});
