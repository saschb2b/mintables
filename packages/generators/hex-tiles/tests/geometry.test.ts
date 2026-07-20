import { describe, expect, it } from "vitest";
import {
  analyzeTriangles,
  isPrintableMesh,
} from "@mintables/shared/lib/geometry/mesh-analysis";
import { generateHexTileTriangles } from "../src/geometry";
import { calculateHexTileLayout } from "../src/layout";
import { DEFAULT_HEX_TILE_CONFIG } from "../src/types";

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

  it("adds a shallow north marker only to keyed tiles", () => {
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
    const markerFloorZ = keyedLayout.topHeight - keyedLayout.northMarkerDepth;

    expect(
      keyedHeights.some((height) => Math.abs(height - markerFloorZ) < 1e-5),
    ).toBe(true);
    expect(
      pairedHeights.some((height) => Math.abs(height - markerFloorZ) < 1e-5),
    ).toBe(false);
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

  it("raises the storage surface without moving the magnet system", () => {
    const raised = { ...DEFAULT_HEX_TILE_CONFIG, raiseHeight: 8 };
    const baseLayout = calculateHexTileLayout(DEFAULT_HEX_TILE_CONFIG);
    const raisedLayout = calculateHexTileLayout(raised);
    const analysis = analyzeTriangles(generateHexTileTriangles(raised));

    expect(analysis.bounds.maxZ).toBe(DEFAULT_HEX_TILE_CONFIG.bodyHeight + 8);
    expect(raisedLayout.magnetCenterZ).toBe(baseLayout.magnetCenterZ);
    expect(raisedLayout.magnetRoofZ).toBe(baseLayout.magnetRoofZ);
  });
});
