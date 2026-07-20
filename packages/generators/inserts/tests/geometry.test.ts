import { describe, expect, it } from "vitest";
import {
  analyzeTriangles,
  isPrintableMesh,
} from "@mintables/shared/lib/geometry/mesh-analysis";
import { generateInsertTriangles } from "../src/geometry";
import {
  calculateInsertLayout,
  CARD_ACCESS_UNDERCUT,
  lidOuterDepth,
  lidOuterWidth,
} from "../src/layout";
import { DEFAULT_INSERT_CONFIG } from "../src/types";

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

describe("generateInsertTriangles", () => {
  it("creates a printable, closed tray mesh at the configured size", () => {
    const triangles = generateInsertTriangles(DEFAULT_INSERT_CONFIG);
    const analysis = analyzeTriangles(triangles);

    expect(isPrintableMesh(triangles)).toBe(true);
    expect(analysis.bounds.minX).toBeCloseTo(-90, 6);
    expect(analysis.bounds.maxX).toBeCloseTo(90, 6);
    expect(analysis.bounds.minY).toBeCloseTo(-60, 6);
    expect(analysis.bounds.maxY).toBeCloseTo(60, 6);
    expect(analysis.bounds.minZ).toBe(0);
    expect(analysis.bounds.maxZ).toBe(32);
    expect(edgeUseCounts(triangles).every((count) => count === 2)).toBe(true);
  });

  it("adds intermediate sloped surfaces to token scoop wells", () => {
    const triangles = generateInsertTriangles(DEFAULT_INSERT_CONFIG);
    const heights = new Set(
      triangles.flatMap((triangle) => [triangle[2], triangle[5], triangle[8]]),
    );

    expect(
      [...heights].some(
        (height) =>
          height > DEFAULT_INSERT_CONFIG.floorThickness + 5 &&
          height <
            DEFAULT_INSERT_CONFIG.height - DEFAULT_INSERT_CONFIG.notchDepth,
      ),
    ).toBe(true);
  });

  it("lets a thumb reach below the bottom card while retaining the deck", () => {
    const config = {
      ...DEFAULT_INSERT_CONFIG,
      rows: [
        {
          id: "cards-row",
          depthShare: 100,
          compartments: [
            {
              id: "cards",
              label: "Cards",
              widthShare: 100,
              floorLift: 0,
              access: "cards" as const,
            },
          ],
        },
      ],
    };
    const cell = calculateInsertLayout(config).cells[0];
    const triangles = generateInsertTriangles(config);
    const frontY = -config.depth / 2;
    const frontAccessHeights = triangles.flatMap((triangle) => {
      const vertices = [
        [triangle[0], triangle[1], triangle[2]],
        [triangle[3], triangle[4], triangle[5]],
        [triangle[6], triangle[7], triangle[8]],
      ];
      return vertices
        .filter(
          ([x, y, z]) =>
            Math.abs(y - frontY) < 1e-6 &&
            Math.abs(x) < cell.clearWidth * 0.4 &&
            z > 0,
        )
        .map(([, , z]) => z);
    });

    expect(frontAccessHeights).toContain(cell.floorZ);
    expect(cell.contentFloorZ - Math.min(...frontAccessHeights)).toBeCloseTo(
      CARD_ACCESS_UNDERCUT,
      6,
    );
    expect(
      triangles.some((triangle) =>
        [triangle[2], triangle[5], triangle[8]].some(
          (z) => Math.abs(z - cell.contentFloorZ) < 1e-6,
        ),
      ),
    ).toBe(true);
    expect(
      triangles.some((triangle) => {
        const vertices = [
          [triangle[0], triangle[1], triangle[2]],
          [triangle[3], triangle[4], triangle[5]],
          [triangle[6], triangle[7], triangle[8]],
        ];
        return vertices.some(
          ([x, y, z]) =>
            Math.abs(y - frontY) < 1e-6 &&
            Math.abs(x) > cell.clearWidth * 0.45 &&
            Math.abs(z - config.height) < 1e-6,
        );
      }),
    ).toBe(true);
    expect(edgeUseCounts(triangles).every((count) => count === 2)).toBe(true);
  });

  it("keeps deep card access independent of the general notch depth", () => {
    const cardConfig = {
      ...DEFAULT_INSERT_CONFIG,
      rows: [
        {
          id: "cards-row",
          depthShare: 100,
          compartments: [
            {
              id: "cards",
              label: "Cards",
              widthShare: 100,
              floorLift: 0,
              access: "cards" as const,
            },
          ],
        },
      ],
    };
    const accessHeight = (notchDepth: number) => {
      const config = { ...cardConfig, notchDepth };
      const frontY = -config.depth / 2;
      return Math.min(
        ...generateInsertTriangles(config).flatMap((triangle) => {
          const vertices = [
            [triangle[0], triangle[1], triangle[2]],
            [triangle[3], triangle[4], triangle[5]],
            [triangle[6], triangle[7], triangle[8]],
          ];
          return vertices
            .filter(
              ([x, y, z]) =>
                Math.abs(y - frontY) < 1e-6 && Math.abs(x) < 50 && z > 0,
            )
            .map(([, , z]) => z);
        }),
      );
    };

    expect(accessHeight(4)).toBeCloseTo(accessHeight(25), 6);
  });

  it("creates a fitted lid with the requested skirt height and clearance", () => {
    const config = { ...DEFAULT_INSERT_CONFIG, outputPart: "lid" as const };
    const triangles = generateInsertTriangles(config);
    const { bounds } = analyzeTriangles(triangles);

    expect(bounds.maxX - bounds.minX).toBeCloseTo(lidOuterWidth(config), 6);
    expect(bounds.maxY - bounds.minY).toBeCloseTo(lidOuterDepth(config), 6);
    expect(bounds.maxZ).toBeCloseTo(
      config.lidThickness + config.lidSkirtDepth,
      6,
    );
    expect(edgeUseCounts(triangles).every((count) => count === 2)).toBe(true);
  });

  it("places tray and lid as separate closed parts with a print gap", () => {
    const config = { ...DEFAULT_INSERT_CONFIG, outputPart: "both" as const };
    const triangles = generateInsertTriangles(config);
    const { bounds } = analyzeTriangles(triangles);

    expect(bounds.maxX - bounds.minX).toBeCloseTo(
      config.width + 10 + lidOuterWidth(config),
      6,
    );
    expect(edgeUseCounts(triangles).every((count) => count === 2)).toBe(true);
  });
});
