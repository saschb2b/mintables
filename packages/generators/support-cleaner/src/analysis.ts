export interface MeshBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
}

export interface ShellStats {
  id: number;
  faceCount: number;
  area: number;
  bounds: MeshBounds;
  touchesBed: boolean;
  bedConnected: boolean;
}

export interface SupportAnalysis {
  positions: Float32Array;
  faceShells: Uint32Array;
  shells: ShellStats[];
  sourceTriangleCount: number;
  degenerateTriangleCount: number;
  primaryShellId: number;
  bounds: MeshBounds;
}

export type SupportAnalysisSummary = Omit<
  SupportAnalysis,
  "positions" | "faceShells"
>;

export type AnalysisProgress = (progress: number, message: string) => void;

const MIN_TRIANGLE_AREA = 1e-10;
const MAX_TRIANGLES = 10_000_000;

class DisjointSet {
  readonly parent: Int32Array;
  private readonly rank: Uint8Array;

  constructor(size: number) {
    this.parent = new Int32Array(size);
    this.rank = new Uint8Array(size);
    for (let i = 0; i < size; i++) this.parent[i] = i;
  }

  find(value: number): number {
    let root = value;
    while (this.parent[root] !== root) root = this.parent[root];
    let current = value;
    while (this.parent[current] !== current) {
      const next = this.parent[current];
      this.parent[current] = root;
      current = next;
    }
    return root;
  }

  union(a: number, b: number): void {
    let rootA = this.find(a);
    let rootB = this.find(b);
    if (rootA === rootB) return;
    if (this.rank[rootA] < this.rank[rootB]) {
      const swap = rootA;
      rootA = rootB;
      rootB = swap;
    }
    this.parent[rootB] = rootA;
    if (this.rank[rootA] === this.rank[rootB]) this.rank[rootA]++;
  }
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

function connectFacesByExactVertices(
  positions: Float32Array,
  set: DisjointSet,
  onProgress?: AnalysisProgress,
): void {
  const faceCount = positions.length / 9;
  const capacity = nextPowerOfTwo(Math.max(16, faceCount * 4));
  const mask = capacity - 1;
  const xs = new Uint32Array(capacity);
  const ys = new Uint32Array(capacity);
  const zs = new Uint32Array(capacity);
  const firstFaces = new Uint32Array(capacity);
  const bits = new Uint32Array(
    positions.buffer,
    positions.byteOffset,
    positions.length,
  );

  for (let face = 0; face < faceCount; face++) {
    if ((face & 0x7fff) === 0) {
      onProgress?.(
        24 + (face / faceCount) * 34,
        "Finding connected mesh shells",
      );
    }
    for (let vertex = 0; vertex < 3; vertex++) {
      const offset = face * 9 + vertex * 3;
      const x = positions[offset] === 0 ? 0 : bits[offset];
      const y = positions[offset + 1] === 0 ? 0 : bits[offset + 1];
      const z = positions[offset + 2] === 0 ? 0 : bits[offset + 2];
      let slot = hashVertex(x, y, z) & mask;
      while (firstFaces[slot] !== 0) {
        if (xs[slot] === x && ys[slot] === y && zs[slot] === z) {
          set.union(face, firstFaces[slot] - 1);
          break;
        }
        slot = (slot + 1) & mask;
      }
      if (firstFaces[slot] === 0) {
        xs[slot] = x;
        ys[slot] = y;
        zs[slot] = z;
        firstFaces[slot] = face + 1;
      }
    }
  }
}

function emptyBounds(): MeshBounds {
  return {
    minX: Infinity,
    maxX: -Infinity,
    minY: Infinity,
    maxY: -Infinity,
    minZ: Infinity,
    maxZ: -Infinity,
  };
}

function includePoint(bounds: MeshBounds, x: number, y: number, z: number) {
  bounds.minX = Math.min(bounds.minX, x);
  bounds.maxX = Math.max(bounds.maxX, x);
  bounds.minY = Math.min(bounds.minY, y);
  bounds.maxY = Math.max(bounds.maxY, y);
  bounds.minZ = Math.min(bounds.minZ, z);
  bounds.maxZ = Math.max(bounds.maxZ, z);
}

function boundsNear(a: MeshBounds, b: MeshBounds, gap: number): boolean {
  return (
    a.minX <= b.maxX + gap &&
    a.maxX >= b.minX - gap &&
    a.minY <= b.maxY + gap &&
    a.maxY >= b.minY - gap &&
    a.minZ <= b.maxZ + gap &&
    a.maxZ >= b.minZ - gap
  );
}

function markBedNetwork(shells: ShellStats[], bounds: MeshBounds): void {
  const width = bounds.maxX - bounds.minX;
  const depth = bounds.maxY - bounds.minY;
  const height = bounds.maxZ - bounds.minZ;
  const diagonal = Math.hypot(width, depth, height);
  const gap = Math.max(0.1, diagonal * 0.002);
  const bedTolerance = Math.max(0.05, height * 0.002);
  const queue: number[] = [];

  for (const shell of shells) {
    shell.touchesBed = shell.bounds.minZ <= bounds.minZ + bedTolerance;
    shell.bedConnected = shell.id !== 0 && shell.touchesBed;
    if (shell.bedConnected) queue.push(shell.id);
  }

  for (let cursor = 0; cursor < queue.length; cursor++) {
    const current = shells[queue[cursor]];
    for (const candidate of shells) {
      if (candidate.id === 0 || candidate.bedConnected) continue;
      if (!boundsNear(current.bounds, candidate.bounds, gap)) continue;
      candidate.bedConnected = true;
      queue.push(candidate.id);
    }
  }
}

function analyzePositions(
  positions: Float32Array,
  sourceTriangleCount: number,
  degenerateTriangleCount: number,
  onProgress?: AnalysisProgress,
): SupportAnalysis {
  const faceCount = positions.length / 9;
  if (faceCount === 0) throw new Error("The STL contains no usable triangles.");

  const set = new DisjointSet(faceCount);
  connectFacesByExactVertices(positions, set, onProgress);

  const rootToShell = new Map<number, number>();
  const unsortedShells: ShellStats[] = [];
  const unsortedFaceShells = new Uint32Array(faceCount);
  const bounds = emptyBounds();

  for (let face = 0; face < faceCount; face++) {
    if ((face & 0x7fff) === 0) {
      onProgress?.(59 + (face / faceCount) * 13, "Measuring connected shells");
    }
    const root = set.find(face);
    let shellId = rootToShell.get(root);
    if (shellId === undefined) {
      shellId = unsortedShells.length;
      rootToShell.set(root, shellId);
      unsortedShells.push({
        id: shellId,
        faceCount: 0,
        area: 0,
        bounds: emptyBounds(),
        touchesBed: false,
        bedConnected: false,
      });
    }
    unsortedFaceShells[face] = shellId;
    const shell = unsortedShells[shellId];
    shell.faceCount++;
    const offset = face * 9;
    const ax = positions[offset];
    const ay = positions[offset + 1];
    const az = positions[offset + 2];
    const bx = positions[offset + 3];
    const by = positions[offset + 4];
    const bz = positions[offset + 5];
    const cx = positions[offset + 6];
    const cy = positions[offset + 7];
    const cz = positions[offset + 8];
    const ux = bx - ax;
    const uy = by - ay;
    const uz = bz - az;
    const vx = cx - ax;
    const vy = cy - ay;
    const vz = cz - az;
    const nx = uy * vz - uz * vy;
    const ny = uz * vx - ux * vz;
    const nz = ux * vy - uy * vx;
    shell.area += Math.hypot(nx, ny, nz) * 0.5;
    for (let vertex = 0; vertex < 3; vertex++) {
      const point = offset + vertex * 3;
      const x = positions[point];
      const y = positions[point + 1];
      const z = positions[point + 2];
      includePoint(shell.bounds, x, y, z);
      includePoint(bounds, x, y, z);
    }
  }

  const order = unsortedShells
    .map((shell) => shell.id)
    .sort(
      (a, b) =>
        unsortedShells[b].faceCount - unsortedShells[a].faceCount || a - b,
    );
  const remap = new Uint32Array(order.length);
  const shells = order.map((oldId, newId) => {
    remap[oldId] = newId;
    return { ...unsortedShells[oldId], id: newId };
  });
  const faceShells = new Uint32Array(faceCount);
  for (let face = 0; face < faceCount; face++) {
    faceShells[face] = remap[unsortedFaceShells[face]];
  }
  markBedNetwork(shells, bounds);
  onProgress?.(74, "Classifying support candidates");

  return {
    positions,
    faceShells,
    shells,
    sourceTriangleCount,
    degenerateTriangleCount,
    primaryShellId: 0,
    bounds,
  };
}

function binaryTriangleCount(buffer: ArrayBuffer): number | null {
  if (buffer.byteLength < 84) return null;
  const count = new DataView(buffer).getUint32(80, true);
  if (84 + count * 50 !== buffer.byteLength) return null;
  if (count > MAX_TRIANGLES) throw new Error("The STL has too many triangles.");
  return count;
}

function parseBinary(
  buffer: ArrayBuffer,
  triangleCount: number,
  onProgress?: AnalysisProgress,
) {
  const view = new DataView(buffer);
  const positions = new Float32Array(triangleCount * 9);
  let readOffset = 84;
  let writeOffset = 0;
  let degenerateTriangleCount = 0;

  for (let face = 0; face < triangleCount; face++) {
    if ((face & 0x7fff) === 0) {
      onProgress?.(3 + (face / triangleCount) * 20, "Reading STL triangles");
    }
    readOffset += 12;
    const faceOffset = writeOffset;
    for (let i = 0; i < 9; i++) {
      positions[faceOffset + i] = view.getFloat32(readOffset, true);
      readOffset += 4;
    }
    readOffset += 2;
    let finite = true;
    for (let i = 0; i < 9; i++) {
      if (!Number.isFinite(positions[faceOffset + i])) finite = false;
    }
    if (!finite) {
      degenerateTriangleCount++;
      continue;
    }
    const ux = positions[faceOffset + 3] - positions[faceOffset];
    const uy = positions[faceOffset + 4] - positions[faceOffset + 1];
    const uz = positions[faceOffset + 5] - positions[faceOffset + 2];
    const vx = positions[faceOffset + 6] - positions[faceOffset];
    const vy = positions[faceOffset + 7] - positions[faceOffset + 1];
    const vz = positions[faceOffset + 8] - positions[faceOffset + 2];
    const area =
      Math.hypot(uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx) * 0.5;
    if (area < MIN_TRIANGLE_AREA) {
      degenerateTriangleCount++;
      continue;
    }
    writeOffset += 9;
  }
  return {
    positions: positions.slice(0, writeOffset),
    degenerateTriangleCount,
  };
}

function parseAscii(buffer: ArrayBuffer, onProgress?: AnalysisProgress) {
  onProgress?.(3, "Reading ASCII STL triangles");
  const text = new TextDecoder().decode(buffer);
  const matches = text.matchAll(
    /vertex\s+([-+\d.eE]+)\s+([-+\d.eE]+)\s+([-+\d.eE]+)/g,
  );
  const values: number[] = [];
  for (const match of matches) {
    values.push(Number(match[1]), Number(match[2]), Number(match[3]));
    if (values.length / 9 > MAX_TRIANGLES) {
      throw new Error("The STL has too many triangles.");
    }
  }
  if (values.length === 0 || values.length % 9 !== 0) {
    throw new Error("The file is not a valid binary or ASCII STL.");
  }
  const raw = new Float32Array(values);
  onProgress?.(18, "Checking STL triangles");
  const kept = new Float32Array(raw.length);
  let writeOffset = 0;
  let degenerateTriangleCount = 0;
  for (let offset = 0; offset < raw.length; offset += 9) {
    const ux = raw[offset + 3] - raw[offset];
    const uy = raw[offset + 4] - raw[offset + 1];
    const uz = raw[offset + 5] - raw[offset + 2];
    const vx = raw[offset + 6] - raw[offset];
    const vy = raw[offset + 7] - raw[offset + 1];
    const vz = raw[offset + 8] - raw[offset + 2];
    const area =
      Math.hypot(uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx) * 0.5;
    if (area < MIN_TRIANGLE_AREA) {
      degenerateTriangleCount++;
      continue;
    }
    kept.set(raw.subarray(offset, offset + 9), writeOffset);
    writeOffset += 9;
  }
  return {
    positions: kept.slice(0, writeOffset),
    sourceTriangleCount: raw.length / 9,
    degenerateTriangleCount,
  };
}

export function analyzeStl(
  buffer: ArrayBuffer,
  onProgress?: AnalysisProgress,
): SupportAnalysis {
  onProgress?.(1, "Inspecting STL file");
  const binaryCount = binaryTriangleCount(buffer);
  if (binaryCount !== null) {
    const parsed = parseBinary(buffer, binaryCount, onProgress);
    return analyzePositions(
      parsed.positions,
      binaryCount,
      parsed.degenerateTriangleCount,
      onProgress,
    );
  }
  const parsed = parseAscii(buffer, onProgress);
  return analyzePositions(
    parsed.positions,
    parsed.sourceTriangleCount,
    parsed.degenerateTriangleCount,
    onProgress,
  );
}

export function summarizeAnalysis(
  analysis: SupportAnalysis,
): SupportAnalysisSummary {
  return {
    shells: analysis.shells,
    sourceTriangleCount: analysis.sourceTriangleCount,
    degenerateTriangleCount: analysis.degenerateTriangleCount,
    primaryShellId: analysis.primaryShellId,
    bounds: analysis.bounds,
  };
}

export function safeSupportShellIds(
  analysis: Pick<SupportAnalysis, "shells" | "primaryShellId">,
  maxPercent: number,
): Set<number> {
  const primary = analysis.shells[analysis.primaryShellId];
  if (!primary) return new Set();
  const totalFaces = analysis.shells.reduce(
    (sum, shell) => sum + shell.faceCount,
    0,
  );
  const dominance = primary.faceCount / totalFaces;
  if (dominance < 0.75) return new Set();
  const maximumFaces = primary.faceCount * (maxPercent / 100);
  return new Set(
    analysis.shells
      .filter(
        (shell) =>
          shell.id !== analysis.primaryShellId &&
          shell.faceCount <= maximumFaces,
      )
      .map((shell) => shell.id),
  );
}
