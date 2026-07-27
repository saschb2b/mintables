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
import {
  calculateHexTileLayout,
  cardSlotPlan,
  PLAIN_MARKER_BAND,
} from "../src/layout";
import { measureClosedMesh } from "../src/material-estimate";
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

function triangleVertices(triangles: number[][]): number[][] {
  return triangles.flatMap((triangle) => [
    [triangle[0], triangle[1], triangle[2]],
    [triangle[3], triangle[4], triangle[5]],
    [triangle[6], triangle[7], triangle[8]],
  ]);
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

  it("keeps split wells smooth, separate, and manifold", () => {
    const config = {
      ...DEFAULT_HEX_TILE_CONFIG,
      bowlWellCount: 2,
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

  it.each([2, 3])(
    "fills the tile outline with %i split wells",
    (bowlWellCount) => {
      const config = { ...DEFAULT_HEX_TILE_CONFIG, bowlWellCount };
      const layout = calculateHexTileLayout(config);
      const triangles = generateHexTileTriangles(config);
      const rimVertices = triangles
        .flatMap((triangle) => [
          [triangle[0], triangle[1], triangle[2]],
          [triangle[3], triangle[4], triangle[5]],
          [triangle[6], triangle[7], triangle[8]],
        ])
        .filter(([, , z]) => Math.abs(z - layout.topHeight) < 1e-9);
      // Wells reach the interior outline, so the top face keeps only the rim
      // band and the ridges between wells.
      const wellEdgeReach = Math.max(
        ...rimVertices.map(([, y]) => Math.abs(y)).filter((y) => y < 43.5),
      );

      expect(validateHexTileConfig(config).errors).toHaveLength(0);
      expect(layout.bowlWellCount).toBe(bowlWellCount);
      expect(isPrintableMesh(triangles)).toBe(true);
      expect(edgeUseCounts(triangles).every((count) => count === 2)).toBe(true);
      expect(wellEdgeReach).toBeCloseTo(layout.innerAcrossFlats / 2, 6);
    },
  );

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

  it("stands a deck on edge in a cradle open at both flats", () => {
    const config = { ...DEFAULT_HEX_TILE_CONFIG, purpose: "deck" as const };
    const layout = calculateHexTileLayout(config);
    const triangles = generateHexTileTriangles(config);
    const edgeY = config.acrossFlats / 2;
    const mouthXs = triangles
      .flatMap((triangle) => [
        [triangle[0], triangle[1], triangle[2]],
        [triangle[3], triangle[4], triangle[5]],
        [triangle[6], triangle[7], triangle[8]],
      ])
      .filter(
        ([, y, z]) =>
          Math.abs(Math.abs(y) - edgeY) < 1e-9 &&
          Math.abs(z - layout.channelEdgeFloorZ) < 1e-9,
      )
      .map(([x]) => x);

    // 60 cards at 0.5 mm plus 2 mm of room.
    expect(layout.deckSlotWidth).toBeCloseTo(32, 6);
    expect(validateHexTileConfig(config).errors).toHaveLength(0);
    expect(isPrintableMesh(triangles)).toBe(true);
    expect(edgeUseCounts(triangles).every((count) => count === 2)).toBe(true);
    expect(Math.min(...mouthXs)).toBeCloseTo(-16, 6);
    expect(Math.max(...mouthXs)).toBeCloseTo(16, 6);
    // A sleeved card is 92 mm long and has to clear the magnet shelves.
    expect(layout.channelClearSpan).toBeGreaterThan(92);
  });

  it("steps the cradle floor over the magnet sockets", () => {
    const keyed = { ...DEFAULT_HEX_TILE_CONFIG, purpose: "deck" as const };
    const bare = { ...keyed, magnetMode: "none" as const };
    const keyedLayout = calculateHexTileLayout(keyed);

    expect(keyedLayout.channelLedgeReach).toBeGreaterThan(0);
    expect(keyedLayout.channelEdgeFloorZ).toBeGreaterThan(
      keyedLayout.magnetRoofZ,
    );
    expect(keyedLayout.channelEdgeFloorZ).toBeGreaterThan(
      keyedLayout.channelFloorZ,
    );
    // Without magnets there is nothing to step over.
    expect(calculateHexTileLayout(bare).channelLedgeReach).toBe(0);
    expect(calculateHexTileLayout(bare).channelEdgeFloorZ).toBeCloseTo(
      keyedLayout.channelFloorZ,
      6,
    );
    expect(
      edgeUseCounts(generateHexTileTriangles(bare)).every(
        (count) => count === 2,
      ),
    ).toBe(true);
  });

  it("keeps two cradles and their corner wells closed", () => {
    const config = {
      ...DEFAULT_HEX_TILE_CONFIG,
      purpose: "deck" as const,
      acrossFlats: 120,
      deckSlotCount: 2,
      deckCapacity: 40,
      isSurfaceTextureEnabled: true,
      surfaceTexture: "wood-grain" as const,
    };
    const triangles = generateHexTileTriangles(config);

    expect(validateHexTileConfig(config).errors).toHaveLength(0);
    expect(calculateHexTileLayout(config).cardChannelCount).toBe(2);
    expect(isPrintableMesh(triangles)).toBe(true);
    expect(edgeUseCounts(triangles).every((count) => count === 2)).toBe(true);
  });

  it("leaves the plain tile solid between its two bevels", () => {
    const config = {
      ...DEFAULT_HEX_TILE_CONFIG,
      purpose: "plain" as const,
      magnetMode: "none" as const,
    };
    const triangles = generateHexTileTriangles(config);
    const analysis = analyzeTriangles(triangles);
    const bevel = config.edgeBevel;
    // A hexagon measured across its flats, and the frustum between two of them.
    const hexArea = (acrossFlats: number) =>
      (Math.sqrt(3) / 2) * acrossFlats ** 2;
    const bevelVolume =
      (bevel / 3) *
      (hexArea(config.acrossFlats) +
        hexArea(config.acrossFlats - 2 * bevel) +
        Math.sqrt(
          hexArea(config.acrossFlats) * hexArea(config.acrossFlats - 2 * bevel),
        ));
    const solidVolume =
      2 * bevelVolume +
      hexArea(config.acrossFlats) * (config.bodyHeight - 2 * bevel);

    expect(isPrintableMesh(triangles)).toBe(true);
    expect(edgeUseCounts(triangles).every((count) => count === 2)).toBe(true);
    expect(analysis.bounds.minZ).toBe(0);
    expect(analysis.bounds.maxZ).toBe(config.bodyHeight);
    // Nothing is carved out, so the mesh encloses the whole bevelled prism.
    // Exported coordinates are rounded to a micron, hence the ratio.
    expect(
      measureClosedMesh(triangles).solidVolumeMm3 / solidVolume,
    ).toBeCloseTo(1, 6);
    // Only the bevel folds and the two end faces, no cavity walls between them.
    expect(uniqueHeights(triangles).sort((a, b) => a - b)).toEqual([
      0,
      bevel,
      config.bodyHeight - bevel,
      config.bodyHeight,
    ]);
  });

  it.each(["single", "captive", "paired"] as const)(
    "closes a plain tile carrying %s magnets and full-face relief",
    (magnetMode) => {
      const config = {
        ...DEFAULT_HEX_TILE_CONFIG,
        purpose: "plain" as const,
        magnetMode,
        isSurfaceTextureEnabled: true,
        surfaceTexture: "cobblestone" as const,
      };
      const triangles = generateHexTileTriangles(config);
      const reliefReach = triangleVertices(triangles)
        .filter(
          ([, , z]) =>
            Math.abs(z - (config.bodyHeight - config.surfaceTextureDepth)) <
            1e-9,
        )
        .map(([x, y]) => Math.hypot(x, y));

      expect(validateHexTileConfig(config).errors).toHaveLength(0);
      expect(isPrintableMesh(triangles)).toBe(true);
      expect(edgeUseCounts(triangles).every((count) => count === 2)).toBe(true);
      // With no opening to keep clear, the relief reaches the middle of the tile.
      expect(Math.min(...reliefReach)).toBeLessThan(10);
    },
  );

  it("keeps the orientation dot on a plain tile that has no rim", () => {
    const config = {
      ...DEFAULT_HEX_TILE_CONFIG,
      purpose: "plain" as const,
      rimWidth: 16,
    };
    const layout = calculateHexTileLayout(config);
    const markerYs = triangleVertices(generateHexTileTriangles(config))
      .filter(
        ([, , z]) =>
          Math.abs(z - (config.bodyHeight - layout.northMarkerDepth)) < 1e-9,
      )
      .map(([, y]) => y);

    // The dot follows the top edge rather than a rim the tile does not have.
    expect(layout.northMarkerCenterX).toBe(0);
    expect(layout.northMarkerCenterY).toBeCloseTo(
      config.acrossFlats / 2 - config.edgeBevel - PLAIN_MARKER_BAND / 2,
      6,
    );
    expect(markerYs.length).toBeGreaterThan(0);
    expect(Math.max(...markerYs)).toBeLessThan(
      config.acrossFlats / 2 - config.edgeBevel,
    );
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

  it.each(SURFACE_TEXTURES)(
    "runs %s relief out to the tile edge when asked",
    (surfaceTexture) => {
      const inset = {
        ...DEFAULT_HEX_TILE_CONFIG,
        purpose: "plain" as const,
        isSurfaceTextureEnabled: true,
        surfaceTexture,
        isSurfaceTextureEdgeToEdge: false,
      };
      const edge = { ...inset, isSurfaceTextureEdgeToEdge: true };
      const reliefReach = (config: typeof inset) => {
        const floorZ = config.bodyHeight - config.surfaceTextureDepth;
        const reach = triangleVertices(generateHexTileTriangles(config))
          .filter(([, , z]) => z < config.bodyHeight - 1e-9 && z >= floorZ)
          .map(([x, y]) =>
            // How close the relief gets to the flat it sits nearest.
            Math.max(
              Math.abs(y),
              Math.abs((Math.sqrt(3) * x) / 2 + y / 2),
              Math.abs((Math.sqrt(3) * x) / 2 - y / 2),
            ),
          );
        return Math.max(...reach);
      };
      // The top face stops one bevel short of the tile size.
      const faceApothem =
        DEFAULT_HEX_TILE_CONFIG.acrossFlats / 2 -
        DEFAULT_HEX_TILE_CONFIG.edgeBevel;
      const border = faceApothem - reliefReach(edge);

      expect(isPrintableMesh(generateHexTileTriangles(edge))).toBe(true);
      expect(
        edgeUseCounts(generateHexTileTriangles(edge)).every(
          (count) => count === 2,
        ),
      ).toBe(true);
      // Cut flush, the pattern stops on the staggered cut line and nowhere
      // short of it. Kept whole, it always ends further in.
      expect(border).toBeGreaterThanOrEqual(0.45);
      expect(border).toBeLessThanOrEqual(0.81);
      expect(reliefReach(edge)).toBeGreaterThan(reliefReach(inset));
    },
  );

  it("carries a custom height map into the corners of the tile", () => {
    const samples = Uint8Array.from(
      { length: CUSTOM_TEXTURE_SAMPLE_COUNT },
      (_, index) => (index % 3 === 0 ? 0 : 200),
    );
    const config = {
      ...DEFAULT_HEX_TILE_CONFIG,
      purpose: "plain" as const,
      isSurfaceTextureEnabled: true,
      surfaceTexture: "custom" as const,
      customTextureData: encodeCustomTextureSamples(samples),
      isSurfaceTextureEdgeToEdge: true,
    };
    const cellReach = (edgeToEdge: boolean) =>
      Math.max(
        ...triangleVertices(
          generateHexTileTriangles({
            ...config,
            isSurfaceTextureEdgeToEdge: edgeToEdge,
          }),
        )
          .filter(
            ([, , z]) =>
              z < config.bodyHeight - 1e-9 &&
              z > config.bodyHeight - config.surfaceTextureDepth - 1e-9,
          )
          .map(([x, y]) => Math.hypot(x, y)),
      );
    const triangles = generateHexTileTriangles(config);

    expect(isPrintableMesh(triangles)).toBe(true);
    expect(edgeUseCounts(triangles).every((count) => count === 2)).toBe(true);
    // A map is always laid over the face itself, so clipping is what fills the
    // corners the square sample grid otherwise leaves bare.
    expect(cellReach(true)).toBeGreaterThan(cellReach(false));
  });

  it("keeps clipped relief clear of the bowl opening", () => {
    const config = {
      ...DEFAULT_HEX_TILE_CONFIG,
      isSurfaceTextureEnabled: true,
      surfaceTexture: "cobblestone" as const,
      isSurfaceTextureEdgeToEdge: true,
    };
    const layout = calculateHexTileLayout(config);
    const floorZ = config.bodyHeight - config.surfaceTextureDepth;
    const reliefRadii = triangleVertices(generateHexTileTriangles(config))
      .filter(([, , z]) => Math.abs(z - floorZ) < 1e-9)
      .map(([x, y]) => Math.hypot(x, y));

    expect(isPrintableMesh(generateHexTileTriangles(config))).toBe(true);
    // Running to the outer edge must not let relief spill into the well.
    expect(Math.min(...reliefRadii)).toBeGreaterThan(
      layout.innerAcrossFlats / 2,
    );
  });

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
