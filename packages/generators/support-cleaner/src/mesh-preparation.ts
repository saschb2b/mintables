import { MeshoptSimplifier } from "meshoptimizer/simplifier";
import {
  safeSupportShellIds,
  type AnalysisProgress,
  type MeshBounds,
  type SupportAnalysis,
  type SupportAnalysisSummary,
} from "./analysis";
import type { ShellRemovalMode, SupportCleanerConfig } from "./types";

export interface SupportSelection {
  removalMode: ShellRemovalMode;
  supportSizePercent: number;
  centerOnBed: boolean;
}

export interface PreparedPreviewMesh {
  positions: Float32Array;
  indices: Uint32Array;
}

export interface PreparedSupportMesh {
  selectionKey: string;
  outputPositions: Float32Array;
  preview: PreparedPreviewMesh;
  removedPreview: PreparedPreviewMesh;
  bounds: MeshBounds;
}

const MAX_PREVIEW_TRIANGLES = 80_000;
const MAX_REMOVED_PREVIEW_TRIANGLES = 25_000;

export function selectionFromConfig(
  config: SupportCleanerConfig,
): SupportSelection {
  return {
    removalMode: config.removalMode,
    supportSizePercent: config.supportSizePercent,
    centerOnBed: config.centerOnBed,
  };
}

export function supportSelectionKey(selection: SupportSelection): string {
  return [
    selection.removalMode,
    selection.supportSizePercent.toFixed(4),
    selection.centerOnBed ? "bed" : "source",
  ].join(":");
}

export function removedShellIdsForSelection(
  analysis: Pick<SupportAnalysisSummary, "shells" | "primaryShellId">,
  selection: SupportSelection,
): Set<number> {
  if (selection.removalMode === "original") return new Set();
  if (selection.removalMode === "main-only") {
    return new Set(
      analysis.shells
        .filter((shell) => shell.id !== analysis.primaryShellId)
        .map((shell) => shell.id),
    );
  }
  return safeSupportShellIds(analysis, selection.supportSizePercent);
}

export function selectedBounds(
  analysis: Pick<SupportAnalysisSummary, "shells">,
  removed: ReadonlySet<number>,
): MeshBounds {
  const bounds: MeshBounds = {
    minX: Infinity,
    maxX: -Infinity,
    minY: Infinity,
    maxY: -Infinity,
    minZ: Infinity,
    maxZ: -Infinity,
  };
  for (const shell of analysis.shells) {
    if (removed.has(shell.id)) continue;
    bounds.minX = Math.min(bounds.minX, shell.bounds.minX);
    bounds.maxX = Math.max(bounds.maxX, shell.bounds.maxX);
    bounds.minY = Math.min(bounds.minY, shell.bounds.minY);
    bounds.maxY = Math.max(bounds.maxY, shell.bounds.maxY);
    bounds.minZ = Math.min(bounds.minZ, shell.bounds.minZ);
    bounds.maxZ = Math.max(bounds.maxZ, shell.bounds.maxZ);
  }
  return bounds;
}

function transformedBounds(
  bounds: MeshBounds,
  centerOnBed: boolean,
): MeshBounds {
  if (!centerOnBed) return bounds;
  return {
    minX: -(bounds.maxX - bounds.minX) / 2,
    maxX: (bounds.maxX - bounds.minX) / 2,
    minY: -(bounds.maxY - bounds.minY) / 2,
    maxY: (bounds.maxY - bounds.minY) / 2,
    minZ: 0,
    maxZ: bounds.maxZ - bounds.minZ,
  };
}

function nextPowerOfTwo(value: number): number {
  let result = 16;
  while (result < value) result *= 2;
  return result;
}

function hashVertex(x: number, y: number, z: number): number {
  let hash = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
  hash = Math.imul(hash ^ y ^ (hash >>> 16), 0x45d9f3b);
  hash = Math.imul(hash ^ z ^ (hash >>> 16), 0x45d9f3b);
  return (hash ^ (hash >>> 16)) >>> 0;
}

function weldTriangleSoup(positions: Float32Array): PreparedPreviewMesh {
  const vertexCount = positions.length / 3;
  const capacity = nextPowerOfTwo(Math.max(16, vertexCount * 1.35));
  const mask = capacity - 1;
  const xs = new Uint32Array(capacity);
  const ys = new Uint32Array(capacity);
  const zs = new Uint32Array(capacity);
  const vertices = new Uint32Array(capacity);
  const bits = new Uint32Array(
    positions.buffer,
    positions.byteOffset,
    positions.length,
  );
  const uniquePositions = new Float32Array(positions.length);
  const indices = new Uint32Array(vertexCount);
  let uniqueVertexCount = 0;

  for (let vertex = 0; vertex < vertexCount; vertex++) {
    const offset = vertex * 3;
    const x = positions[offset] === 0 ? 0 : bits[offset];
    const y = positions[offset + 1] === 0 ? 0 : bits[offset + 1];
    const z = positions[offset + 2] === 0 ? 0 : bits[offset + 2];
    let slot = hashVertex(x, y, z) & mask;
    while (vertices[slot] !== 0) {
      if (xs[slot] === x && ys[slot] === y && zs[slot] === z) break;
      slot = (slot + 1) & mask;
    }
    if (vertices[slot] === 0) {
      const uniqueOffset = uniqueVertexCount * 3;
      uniquePositions[uniqueOffset] = positions[offset];
      uniquePositions[uniqueOffset + 1] = positions[offset + 1];
      uniquePositions[uniqueOffset + 2] = positions[offset + 2];
      xs[slot] = x;
      ys[slot] = y;
      zs[slot] = z;
      vertices[slot] = ++uniqueVertexCount;
    }
    indices[vertex] = vertices[slot] - 1;
  }

  return {
    positions: uniquePositions.slice(0, uniqueVertexCount * 3),
    indices,
  };
}

function compactPreview(
  positions: Float32Array,
  indices: Uint32Array,
): PreparedPreviewMesh {
  const [remap, vertexCount] = MeshoptSimplifier.compactMesh(indices);
  const compactPositions = new Float32Array(vertexCount * 3);
  for (let vertex = 0; vertex < remap.length; vertex++) {
    const remapped = remap[vertex];
    if (remapped === 0xffffffff) continue;
    compactPositions[remapped * 3] = positions[vertex * 3];
    compactPositions[remapped * 3 + 1] = positions[vertex * 3 + 1];
    compactPositions[remapped * 3 + 2] = positions[vertex * 3 + 2];
  }
  return { positions: compactPositions, indices };
}

export async function buildPreviewMesh(
  positions: Float32Array,
  maximumTriangles = MAX_PREVIEW_TRIANGLES,
): Promise<PreparedPreviewMesh> {
  if (positions.length === 0) {
    return { positions: new Float32Array(), indices: new Uint32Array() };
  }
  await MeshoptSimplifier.ready;
  const welded = weldTriangleSoup(positions);
  if (positions.length / 9 <= maximumTriangles) return welded;
  const [simplifiedIndices] = MeshoptSimplifier.simplify(
    welded.indices,
    welded.positions,
    3,
    maximumTriangles * 3,
    0.02,
  );
  return compactPreview(welded.positions, simplifiedIndices);
}

export async function prepareSupportMesh(
  analysis: SupportAnalysis,
  selection: SupportSelection,
  onProgress?: AnalysisProgress,
): Promise<PreparedSupportMesh> {
  const removedShellIds = removedShellIdsForSelection(analysis, selection);
  const bounds = selectedBounds(analysis, removedShellIds);
  let keptFaceCount = 0;
  for (let face = 0; face < analysis.faceShells.length; face++) {
    if (!removedShellIds.has(analysis.faceShells[face])) keptFaceCount++;
  }

  const removedFaceCount = analysis.faceShells.length - keptFaceCount;
  const outputPositions = new Float32Array(keptFaceCount * 9);
  const removedPositions = new Float32Array(removedFaceCount * 9);
  const shiftX = selection.centerOnBed ? -(bounds.minX + bounds.maxX) / 2 : 0;
  const shiftY = selection.centerOnBed ? -(bounds.minY + bounds.maxY) / 2 : 0;
  const shiftZ = selection.centerOnBed ? -bounds.minZ : 0;
  let keptWriteOffset = 0;
  let removedWriteOffset = 0;

  for (let face = 0; face < analysis.faceShells.length; face++) {
    if ((face & 0x7fff) === 0) {
      onProgress?.(
        76 + (face / analysis.faceShells.length) * 18,
        "Preparing full-resolution export geometry",
      );
    }
    const isRemoved = removedShellIds.has(analysis.faceShells[face]);
    const target = isRemoved ? removedPositions : outputPositions;
    let writeOffset = isRemoved ? removedWriteOffset : keptWriteOffset;
    const readOffset = face * 9;
    for (let vertex = 0; vertex < 3; vertex++) {
      const point = readOffset + vertex * 3;
      target[writeOffset++] = analysis.positions[point] + shiftX;
      target[writeOffset++] = analysis.positions[point + 1] + shiftY;
      target[writeOffset++] = analysis.positions[point + 2] + shiftZ;
    }
    if (isRemoved) removedWriteOffset = writeOffset;
    else keptWriteOffset = writeOffset;
  }

  onProgress?.(95, "Building interactive preview detail");
  const preview = await buildPreviewMesh(outputPositions);
  const removedPreview = await buildPreviewMesh(
    removedPositions,
    MAX_REMOVED_PREVIEW_TRIANGLES,
  );
  onProgress?.(100, "Preview ready");
  return {
    selectionKey: supportSelectionKey(selection),
    outputPositions,
    preview,
    removedPreview,
    bounds: transformedBounds(bounds, selection.centerOnBed),
  };
}
