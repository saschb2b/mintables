import { describe, expect, it } from "vitest";
import { createSTLBinary } from "@mintables/shared/lib/geometry";
import {
  analyzeStl,
  safeSupportShellIds,
  summarizeAnalysis,
} from "../src/analysis";
import {
  hasPreparedSelection,
  registerSupportAsset,
  removedShellIds,
  supportCleanerMesh,
} from "../src/asset-store";
import {
  buildPreviewMesh,
  prepareSupportMesh,
  selectionFromConfig,
} from "../src/mesh-preparation";
import {
  DEFAULT_SUPPORT_CLEANER_CONFIG,
  type SupportCleanerConfig,
} from "../src/types";

const CUBE: number[][] = [
  [0, 0, 0, 1, 1, 0, 1, 0, 0],
  [0, 0, 0, 0, 1, 0, 1, 1, 0],
  [0, 0, 1, 1, 0, 1, 1, 1, 1],
  [0, 0, 1, 1, 1, 1, 0, 1, 1],
  [0, 0, 0, 1, 0, 0, 1, 0, 1],
  [0, 0, 0, 1, 0, 1, 0, 0, 1],
  [1, 0, 0, 1, 1, 0, 1, 1, 1],
  [1, 0, 0, 1, 1, 1, 1, 0, 1],
  [1, 1, 0, 0, 1, 0, 0, 1, 1],
  [1, 1, 0, 0, 1, 1, 1, 1, 1],
  [0, 1, 0, 0, 0, 0, 0, 0, 1],
  [0, 1, 0, 0, 0, 1, 0, 1, 1],
];

const DETACHED_TETRA: number[][] = [
  [4, 0, 0, 5, 0, 0, 4, 1, 0],
  [4, 0, 0, 4, 0, 1, 5, 0, 0],
  [5, 0, 0, 4, 0, 1, 4, 1, 0],
  [4, 1, 0, 4, 0, 1, 4, 0, 0],
];

function config(
  patch: Partial<SupportCleanerConfig> = {},
): SupportCleanerConfig {
  return {
    ...DEFAULT_SUPPORT_CLEANER_CONFIG,
    assetId: "test-asset",
    assetName: "mini.stl",
    ...patch,
  };
}

describe("STL shell analysis", () => {
  it("separates exact connected shells and sorts the main shell first", () => {
    const analysis = analyzeStl(createSTLBinary([...CUBE, ...DETACHED_TETRA]));

    expect(analysis.sourceTriangleCount).toBe(16);
    expect(analysis.degenerateTriangleCount).toBe(0);
    expect(analysis.shells.map((shell) => shell.faceCount)).toEqual([12, 4]);
    expect(new Set(analysis.faceShells)).toEqual(new Set([0, 1]));
  });

  it("keeps classification conservative when the main shell does not dominate", () => {
    const equalShells = analyzeStl(
      createSTLBinary([
        ...DETACHED_TETRA,
        ...DETACHED_TETRA.map((triangle) =>
          triangle.map((value, index) =>
            index % 3 === 0 ? value + 10 : value,
          ),
        ),
      ]),
    );

    expect(safeSupportShellIds(equalShells, 100)).toEqual(new Set());
  });

  it("uses the configured relative shell threshold", () => {
    const analysis = analyzeStl(createSTLBinary([...CUBE, ...DETACHED_TETRA]));

    expect(safeSupportShellIds(analysis, 34)).toEqual(new Set([1]));
    expect(safeSupportShellIds(analysis, 10)).toEqual(new Set());
  });

  it("filters detached shells and centers the kept sculpt on the bed", async () => {
    const analysis = analyzeStl(createSTLBinary([...CUBE, ...DETACHED_TETRA]));
    const selected = config({ supportSizePercent: 34 });
    const prepared = await prepareSupportMesh(
      analysis,
      selectionFromConfig(selected),
    );
    const asset = registerSupportAsset(
      "test-asset",
      "mini.stl",
      summarizeAnalysis(analysis),
      prepared,
    );
    const removed = removedShellIds(asset, selected);
    const output = supportCleanerMesh(selected) as Float32Array;

    expect(removed).toEqual(new Set([1]));
    expect(hasPreparedSelection(asset, selected)).toBe(true);
    expect(output.length).toBe(CUBE.length * 9);
    expect(prepared.removedPreview.indices.length).toBe(
      DETACHED_TETRA.length * 3,
    );
    const xs = Array.from(output.filter((_, index) => index % 3 === 0));
    const ys = Array.from(output.filter((_, index) => index % 3 === 1));
    const zs = Array.from(output.filter((_, index) => index % 3 === 2));
    expect(Math.min(...xs)).toBe(-0.5);
    expect(Math.max(...xs)).toBe(0.5);
    expect(Math.min(...ys)).toBe(-0.5);
    expect(Math.max(...ys)).toBe(0.5);
    expect(Math.min(...zs)).toBe(0);
    expect(Math.max(...zs)).toBe(1);
  });

  it("does not expose stale prepared geometry for export", async () => {
    const analysis = analyzeStl(createSTLBinary([...CUBE, ...DETACHED_TETRA]));
    const selected = config({ supportSizePercent: 34 });
    const asset = registerSupportAsset(
      "test-asset",
      "mini.stl",
      summarizeAnalysis(analysis),
      await prepareSupportMesh(analysis, selectionFromConfig(selected)),
    );
    const changed = { ...selected, centerOnBed: false };

    expect(hasPreparedSelection(asset, changed)).toBe(false);
    expect(supportCleanerMesh(changed)).toHaveLength(0);
    expect(asset.prepared.outputPositions).toHaveLength(CUBE.length * 9);
  });

  it("builds a bounded visual LOD without changing export geometry", async () => {
    const source = new Float32Array(CUBE.flat());
    const preview = await buildPreviewMesh(source, 4);

    expect(preview.indices.length / 3).toBeLessThanOrEqual(CUBE.length);
    expect(preview.indices.length).toBeGreaterThan(0);
    expect(Array.from(preview.positions).every(Number.isFinite)).toBe(true);
    expect(source).toHaveLength(CUBE.length * 9);
  });

  it("drops degenerate input triangles before component analysis", () => {
    const degenerate = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    const analysis = analyzeStl(createSTLBinary([...CUBE, degenerate]));

    expect(analysis.sourceTriangleCount).toBe(13);
    expect(analysis.degenerateTriangleCount).toBe(1);
    expect(analysis.positions.length).toBe(CUBE.length * 9);
  });

  it("accepts ASCII STL files", () => {
    const ascii = [
      "solid one",
      "facet normal 0 0 1",
      "outer loop",
      "vertex 0 0 0",
      "vertex 1 0 0",
      "vertex 0 1 0",
      "endloop",
      "endfacet",
      "endsolid one",
    ].join("\n");
    const encoded = new TextEncoder().encode(ascii);
    const buffer = encoded.buffer.slice(
      encoded.byteOffset,
      encoded.byteOffset + encoded.byteLength,
    ) as ArrayBuffer;

    const analysis = analyzeStl(buffer);

    expect(analysis.sourceTriangleCount).toBe(1);
    expect(analysis.shells).toHaveLength(1);
  });
});
