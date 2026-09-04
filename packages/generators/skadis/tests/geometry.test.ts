import { beforeAll, describe, expect, it } from "vitest";
import {
  isManifoldMeshExportable,
  loadCsg,
} from "@mintables/shared/lib/geometry/csg";
import { deriveSkadis } from "../src/derived";
import {
  buildSkadis,
  generateBoardTriangles,
  generateSkadisTriangles,
  hookProfile,
} from "../src/geometry";
import { SKADIS_STARTERS } from "../src/starters";
import {
  DEFAULT_CUP,
  DEFAULT_MOUNT,
  DEFAULT_RACK,
  DEFAULT_SKADIS_CONFIG,
  DEFAULT_SLOT,
  DEFAULT_TRAY,
  type SkadisConfig,
} from "../src/types";
import { validateSkadisConfig } from "../src/validation";

function vertexKey(x: number, y: number, z: number): string {
  return `${String(x)},${String(y)},${String(z)}`;
}

function edgeUseCounts(triangles: number[][]): number[] {
  const counts = new Map<string, number>();
  for (const tri of triangles) {
    const v = [
      vertexKey(tri[0], tri[1], tri[2]),
      vertexKey(tri[3], tri[4], tri[5]),
      vertexKey(tri[6], tri[7], tri[8]),
    ];
    for (const [a, b] of [
      [v[0], v[1]],
      [v[1], v[2]],
      [v[2], v[0]],
    ]) {
      const key = a < b ? `${a}|${b}` : `${b}|${a}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  return [...counts.values()];
}

function isWatertight(triangles: number[][]): boolean {
  return edgeUseCounts(triangles).every((count) => count === 2);
}

function signedVolume(triangles: number[][]): number {
  let sum = 0;
  for (const t of triangles) {
    sum +=
      (t[0] * (t[4] * t[8] - t[5] * t[7]) -
        t[3] * (t[1] * t[8] - t[2] * t[7]) +
        t[6] * (t[1] * t[5] - t[2] * t[4])) /
      6;
  }
  return sum;
}

function bounds(triangles: number[][]) {
  const out = {
    minX: Infinity,
    maxX: -Infinity,
    minY: Infinity,
    maxY: -Infinity,
    minZ: Infinity,
    maxZ: -Infinity,
  };
  for (const t of triangles) {
    for (let i = 0; i < 9; i += 3) {
      out.minX = Math.min(out.minX, t[i]);
      out.maxX = Math.max(out.maxX, t[i]);
      out.minY = Math.min(out.minY, t[i + 1]);
      out.maxY = Math.max(out.maxY, t[i + 1]);
      out.minZ = Math.min(out.minZ, t[i + 2]);
      out.maxZ = Math.max(out.maxZ, t[i + 2]);
    }
  }
  return out;
}

const base = { mount: DEFAULT_MOUNT, showBoard: true };

const VARIANTS: [string, SkadisConfig][] = [
  ["defaults", DEFAULT_SKADIS_CONFIG],
  ...SKADIS_STARTERS.map((s): [string, SkadisConfig] => [
    `starter: ${s.id}`,
    s.config,
  ]),
  [
    "rect cup, dividers, scoop, drains",
    {
      ...base,
      body: {
        ...DEFAULT_CUP,
        shape: "rect",
        innerWidth: 80,
        innerDepth: 30,
        dividers: 3,
        frontDip: 20,
        drainHoles: 4,
      },
    },
  ],
  [
    "round cup tilted with drains",
    { ...base, body: { ...DEFAULT_CUP, tilt: 20, drainHoles: 3 } },
  ],
  [
    "rect tray, two rows, guard",
    {
      ...base,
      mount: { ...DEFAULT_MOUNT, hookRows: 2, rowSpacing: 80 },
      body: {
        ...DEFAULT_TRAY,
        pocketShape: "rect",
        pockets: 2,
        rows: 2,
        pocketWidth: 30,
        pocketDepth: 24,
        guardHeight: 40,
      },
    },
  ],
  [
    "rack tilted, two tiers, front slot",
    {
      ...base,
      body: {
        ...DEFAULT_RACK,
        groups: [
          { id: "g1", diameter: 10, count: 3 },
          { id: "g2", diameter: 6, count: 3 },
        ],
        tilt: 12,
        tiers: 2,
        tierSpacing: 35,
        frontSlot: 4,
      },
    },
  ],
  [
    "slot open floor, open sides, window, lean",
    {
      ...base,
      body: {
        ...DEFAULT_SLOT,
        slots: 2,
        openFloor: true,
        openSides: true,
        frontWindow: 12,
        tilt: 25,
      },
    },
  ],
  [
    "manual plate, three columns, no retainer",
    {
      ...base,
      mount: {
        ...DEFAULT_MOUNT,
        plateWidth: 140,
        plateHeight: 70,
        hookColumns: 3,
        hookInset: 12,
        cornerRadius: 10,
      },
      body: DEFAULT_CUP,
    },
  ],
  [
    "thin clone board, tight fit",
    {
      ...base,
      mount: { ...DEFAULT_MOUNT, boardThickness: 3, fit: 0, tabWidth: 4.5 },
      body: DEFAULT_TRAY,
    },
  ],
];

beforeAll(async () => {
  await loadCsg();
});

describe("generateSkadisTriangles", () => {
  it.each(VARIANTS)("builds a watertight solid: %s", (_name, config) => {
    const triangles = generateSkadisTriangles(config);
    expect(triangles.length).toBeGreaterThan(0);
    expect(isManifoldMeshExportable(triangles)).toBe(true);
    expect(isWatertight(triangles)).toBe(true);
    expect(signedVolume(triangles)).toBeGreaterThan(0);
  });

  it.each(VARIANTS)("matches the derived frame: %s", (_name, config) => {
    const d = deriveSkadis(config);
    const b = bounds(generateSkadisTriangles(config));
    expect(b.minZ).toBeCloseTo(0, 4);
    expect(b.maxZ).toBeCloseTo(d.height, 1);
    expect(b.minY).toBeCloseTo(-d.hooks.reach, 4);
    // Front scoops and rounded ends can trim the very front-most point.
    const frontY = d.plateThickness + d.body.depth;
    expect(b.maxY).toBeLessThanOrEqual(frontY + 0.05);
    expect(b.maxY).toBeGreaterThan(frontY - 1);
    expect(b.maxX - b.minX).toBeCloseTo(d.footprintX, 1);
    expect(b.minX + b.maxX).toBeCloseTo(0, 3);
  });

  it.each(VARIANTS)("validates cleanly: %s", (_name, config) => {
    expect(validateSkadisConfig(config).errors).toEqual([]);
  });

  it("reports the exact volume alongside the mesh", () => {
    const build = buildSkadis(DEFAULT_SKADIS_CONFIG);
    expect(build.volumeMm3).toBeCloseTo(signedVolume(build.triangles), 0);
  });

  it("hook profile matches the IKEA push-down shape", () => {
    const pts = hookProfile(DEFAULT_MOUNT, 50, 3);
    const ys = pts.map(([y]) => y);
    const zs = pts.map(([, z]) => z);
    // Reaches board gap + lip behind the plate, nothing above the tab top.
    expect(Math.min(...ys)).toBeCloseTo(-(4.8 + 4.5), 6);
    expect(Math.max(...zs)).toBeCloseTo(50, 6);
    // Lip hangs 7.5 mm below the 4.5 mm tab: 12 mm total passes a 15 mm slot.
    expect(Math.min(...zs)).toBeCloseTo(50 - 4.5 - 7.5, 6);
    // The lip's front face sits exactly one board gap behind the plate.
    const lipFace = pts.filter(([y]) => Math.abs(y + 4.8) < 1e-6);
    expect(lipFace.length).toBeGreaterThanOrEqual(2);
  });

  it("returns cached builds for identical configs", () => {
    const a = buildSkadis(DEFAULT_SKADIS_CONFIG);
    const b = buildSkadis({ ...DEFAULT_SKADIS_CONFIG, showBoard: false });
    expect(b).toBe(a);
  });
});

describe("generateBoardTriangles", () => {
  it("builds a slotted board slab behind the plate", () => {
    const triangles = generateBoardTriangles(DEFAULT_SKADIS_CONFIG);
    expect(triangles.length).toBeGreaterThan(100);
    expect(isWatertight(triangles)).toBe(true);
    const b = bounds(triangles);
    expect(b.maxY).toBeCloseTo(0, 6);
    expect(b.minY).toBeCloseTo(-DEFAULT_MOUNT.boardThickness, 6);
    expect(b.minZ).toBeCloseTo(0, 6);
  });
});
