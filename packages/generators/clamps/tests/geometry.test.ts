import { describe, expect, it } from "vitest";
import { isPrintableMesh } from "@mintables/shared/lib/geometry/mesh-analysis";
import { generateClampTriangles, jawProfile } from "../src/geometry";
import { deriveClamp } from "../src/derived";
import { DEFAULT_CLAMP_CONFIG, type ClampConfig } from "../src/types";

/**
 * Every undirected edge in a closed triangle soup must be used by exactly
 * two triangles. The clamp is a union of closed solids (jaw + lugs + block
 * sharing exact seam vertices), so this holds for the whole mesh.
 */
function edgeUseCounts(triangles: number[][]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const t of triangles) {
    for (let i = 0; i < 3; i++) {
      const j = (i + 1) % 3;
      const a = `${String(t[i * 3])},${String(t[i * 3 + 1])},${String(t[i * 3 + 2])}`;
      const b = `${String(t[j * 3])},${String(t[j * 3 + 1])},${String(t[j * 3 + 2])}`;
      const key = a < b ? `${a}|${b}` : `${b}|${a}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  return counts;
}

function expectClosedMesh(triangles: number[][]): void {
  const bad: string[] = [];
  for (const [key, count] of edgeUseCounts(triangles)) {
    if (count !== 2) bad.push(`${key} used ${String(count)}x`);
  }
  expect(bad.slice(0, 5)).toEqual([]);
}

const VARIANTS: [string, ClampConfig][] = [
  ["default plate + counterbore + bulbs", DEFAULT_CLAMP_CONFIG],
  ["countersink", { ...DEFAULT_CLAMP_CONFIG, screwRecess: "countersink" }],
  ["plain holes", { ...DEFAULT_CLAMP_CONFIG, screwRecess: "plain" }],
  ["plain tips", { ...DEFAULT_CLAMP_CONFIG, tipStyle: "plain" }],
  ["no throat (tips on the seat)", { ...DEFAULT_CLAMP_CONFIG, throatDepth: 0 }],
  ["deep throat", { ...DEFAULT_CLAMP_CONFIG, throatDepth: 9 }],
  [
    "deep throat, plain tips",
    { ...DEFAULT_CLAMP_CONFIG, throatDepth: 7, tipStyle: "plain" },
  ],
  ["bare clip", { ...DEFAULT_CLAMP_CONFIG, mount: "clip" }],
  [
    "bare clip, plain tips, wide wrap",
    {
      ...DEFAULT_CLAMP_CONFIG,
      mount: "clip",
      tipStyle: "plain",
      wrapAngle: 280,
    },
  ],
  [
    "small rod, thin arms",
    {
      ...DEFAULT_CLAMP_CONFIG,
      rodDiameter: 6,
      armThickness: 2,
      neckWidth: 6,
      standoff: 2,
      baseLength: 26,
      baseWidth: 12,
      holeSpacing: 16,
    },
  ],
  [
    "big rod, zero standoff clearance case",
    {
      ...DEFAULT_CLAMP_CONFIG,
      rodDiameter: 30,
      wrapAngle: 250,
      jawWidth: 12,
      baseLength: 52,
      baseWidth: 20,
      neckWidth: 20,
      holeSpacing: 34,
      standoff: 6,
    },
  ],
];

describe("generateClampTriangles", () => {
  it("produces a printable mesh for every variant", () => {
    for (const [name, config] of VARIANTS) {
      const triangles = generateClampTriangles(config);
      expect(triangles.length, name).toBeGreaterThan(0);
      expect(isPrintableMesh(triangles), name).toBe(true);
    }
  });

  it("is edge-closed (every edge shared by exactly two triangles) for every variant", () => {
    for (const [, config] of VARIANTS) {
      expectClosedMesh(generateClampTriangles(config));
    }
  });

  it("sits on the bed and reaches the expected height (plate mount)", () => {
    const triangles = generateClampTriangles(DEFAULT_CLAMP_CONFIG);
    const d = deriveClamp(DEFAULT_CLAMP_CONFIG);
    const zs = triangles.flatMap((t) => [t[2], t[5], t[8]]);
    expect(Math.min(...zs)).toBeCloseTo(0, 6);
    expect(Math.max(...zs)).toBeCloseTo(d.boreCenterZ + d.profileTop, 1);
  });

  it("matches the base plate footprint (plate mount)", () => {
    const triangles = generateClampTriangles(DEFAULT_CLAMP_CONFIG);
    const xs = triangles.flatMap((t) => [t[0], t[3], t[6]]);
    const ys = triangles.flatMap((t) => [t[1], t[4], t[7]]);
    expect(Math.min(...xs)).toBeCloseTo(
      -DEFAULT_CLAMP_CONFIG.baseLength / 2,
      3,
    );
    expect(Math.max(...xs)).toBeCloseTo(DEFAULT_CLAMP_CONFIG.baseLength / 2, 3);
    // The jaw's outer arc is wider than the plate; polygonized at 96
    // segments it stays a few hundredths inside the exact radius.
    const d = deriveClamp(DEFAULT_CLAMP_CONFIG);
    const halfSpan = Math.max(
      DEFAULT_CLAMP_CONFIG.baseWidth / 2,
      d.outerRadius,
    );
    expect(Math.min(...ys)).toBeCloseTo(-halfSpan, 1);
    expect(Math.max(...ys)).toBeCloseTo(halfSpan, 1);
  });

  it("keeps the bore clear of material at the rod's low point", () => {
    const d = deriveClamp(DEFAULT_CLAMP_CONFIG);
    const triangles = generateClampTriangles(DEFAULT_CLAMP_CONFIG);
    // No vertex may intrude into the bore circle below the axis (the tips
    // intrude near the mouth by design, but only above the axis).
    for (const t of triangles) {
      for (let i = 0; i < 3; i++) {
        const y = t[i * 3 + 1];
        const z = t[i * 3 + 2];
        if (z >= d.boreCenterZ) continue;
        const r = Math.hypot(y, z - d.boreCenterZ);
        expect(r).toBeGreaterThanOrEqual(d.boreRadius - 1e-4);
      }
    }
  });

  it("extrudes the clip flat with the jaw width as its height", () => {
    const config: ClampConfig = { ...DEFAULT_CLAMP_CONFIG, mount: "clip" };
    const triangles = generateClampTriangles(config);
    const zs = triangles.flatMap((t) => [t[2], t[5], t[8]]);
    expect(Math.min(...zs)).toBeCloseTo(0, 6);
    expect(Math.max(...zs)).toBeCloseTo(config.jawWidth, 6);
  });
});

describe("jawProfile", () => {
  it("leaves the mouth open by the derived amount", () => {
    const d = deriveClamp(DEFAULT_CLAMP_CONFIG);
    const profile = jawProfile(DEFAULT_CLAMP_CONFIG);
    // Narrowest horizontal gap across the mouth in the upper region where
    // the tips live.
    let minGap = Infinity;
    for (const p of profile) {
      if (p.v <= d.boreCenterZ + d.boreRadius * Math.cos(d.mouthHalfAngle))
        continue;
      const gap = 2 * Math.abs(p.u);
      if (gap < minGap) minGap = gap;
    }
    expect(minGap).toBeCloseTo(d.mouthOpening, 1);
  });

  it("stays symmetric across the mouth centerline", () => {
    const profile = jawProfile(DEFAULT_CLAMP_CONFIG);
    const maxU = Math.max(...profile.map((p) => p.u));
    const minU = Math.min(...profile.map((p) => p.u));
    expect(maxU).toBeCloseTo(-minU, 5);
  });
});
