import { describe, expect, it } from "vitest";
import { isPrintableMesh } from "@mintables/shared/lib/geometry/mesh-analysis";
import { generateClampTriangles, jawProfile } from "../src/geometry";
import { armThicknessAtAngle, deriveClamp } from "../src/derived";
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

  it("builds broad root gussets beyond both jaw faces", () => {
    const triangles = generateClampTriangles(DEFAULT_CLAMP_CONFIG);
    const jawFace = DEFAULT_CLAMP_CONFIG.jawWidth / 2;
    const reinforcedVertices = triangles.flatMap((triangle) =>
      [0, 3, 6].map((offset) => ({
        x: triangle[offset],
        z: triangle[offset + 2],
      })),
    );
    expect(
      reinforcedVertices.some(
        ({ x, z }) =>
          Math.abs(x) > jawFace + 1 &&
          z > DEFAULT_CLAMP_CONFIG.baseThickness + 1,
      ),
    ).toBe(true);
  });

  it("gives the gussets a multi-line landing at the jaw", () => {
    const triangles = generateClampTriangles(DEFAULT_CLAMP_CONFIG);
    const rootTop =
      DEFAULT_CLAMP_CONFIG.baseThickness + DEFAULT_CLAMP_CONFIG.standoff - 0.15;
    const jawFace = DEFAULT_CLAMP_CONFIG.jawWidth / 2;
    const landingReach = Math.max(
      ...triangles
        .flatMap((triangle) =>
          [0, 3, 6].map((offset) => triangle.slice(offset, offset + 3)),
        )
        .filter(
          ([x, y, z]) =>
            Math.abs(z - rootTop) < 1e-4 &&
            Math.abs(x) > jawFace &&
            Math.abs(y) > DEFAULT_CLAMP_CONFIG.headDiameter / 2,
        )
        .map(([x]) => Math.abs(x) - jawFace),
    );
    expect(landingReach).toBeGreaterThanOrEqual(2.1);
  });

  it("keeps the reinforced root inside the rounded plate footprint", () => {
    const triangles = generateClampTriangles(DEFAULT_CLAMP_CONFIG);
    const halfLength = DEFAULT_CLAMP_CONFIG.baseLength / 2;
    const halfWidth = DEFAULT_CLAMP_CONFIG.baseWidth / 2;
    const endCenter = halfLength - halfWidth;
    const rootTop =
      DEFAULT_CLAMP_CONFIG.baseThickness + DEFAULT_CLAMP_CONFIG.standoff - 0.15;
    const gussetShoulderVertices = triangles
      .flatMap((triangle) =>
        [0, 3, 6].map((offset) => triangle.slice(offset, offset + 3)),
      )
      .filter(
        ([x, , z]) =>
          Math.abs(x) > DEFAULT_CLAMP_CONFIG.jawWidth / 2 + 1 &&
          z > DEFAULT_CLAMP_CONFIG.baseThickness + 1e-4 &&
          z <= rootTop + 1e-4,
      );

    const maxFootprintError = Math.max(
      ...gussetShoulderVertices.map(([x, y]) => {
        const endDistance = Math.max(0, Math.abs(x) - endCenter);
        return endDistance * endDistance + y * y - halfWidth * halfWidth;
      }),
    );
    expect(maxFootprintError).toBeLessThanOrEqual(1e-3);
  });

  it("rounds the jaw faces through several axial rings", () => {
    const triangles = generateClampTriangles(DEFAULT_CLAMP_CONFIG);
    const d = deriveClamp(DEFAULT_CLAMP_CONFIG);
    const positiveFaceLayers = new Set(
      triangles
        .flatMap((triangle) =>
          [0, 3, 6].map((offset) => triangle.slice(offset, offset + 3)),
        )
        .filter(([, , z]) => z > d.boreCenterZ)
        .map(([x]) => x)
        .filter((x) => x > DEFAULT_CLAMP_CONFIG.jawWidth / 2 - 1),
    );
    expect(positiveFaceLayers.size).toBeGreaterThanOrEqual(5);
  });

  it("widens a blended screw recess progressively", () => {
    const triangles = generateClampTriangles(DEFAULT_CLAMP_CONFIG);
    const centerX = DEFAULT_CLAMP_CONFIG.holeSpacing / 2;
    const blendStart =
      DEFAULT_CLAMP_CONFIG.baseThickness - DEFAULT_CLAMP_CONFIG.headDepth;
    const radii = new Set(
      triangles
        .flatMap((triangle) =>
          [0, 3, 6].map((offset) => triangle.slice(offset, offset + 3)),
        )
        .filter(
          ([, , z]) => z > blendStart && z < DEFAULT_CLAMP_CONFIG.baseThickness,
        )
        .map(([x, y]) => Math.round(Math.hypot(x - centerX, y) * 100) / 100)
        .filter(
          (radius) =>
            radius >= DEFAULT_CLAMP_CONFIG.screwDiameter / 2 &&
            radius <= DEFAULT_CLAMP_CONFIG.headDiameter / 2,
        ),
    );
    expect(radii.size).toBeGreaterThanOrEqual(5);
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

  it("honors the requested snap interference", () => {
    const d = deriveClamp(DEFAULT_CLAMP_CONFIG);
    expect(d.snapInterference).toBeCloseTo(
      DEFAULT_CLAMP_CONFIG.snapInterference,
      2,
    );
  });

  it("tapers smoothly from the spring into the structural root", () => {
    const atSide = armThicknessAtAngle(DEFAULT_CLAMP_CONFIG, Math.PI / 2);
    const atShoulder = armThicknessAtAngle(
      DEFAULT_CLAMP_CONFIG,
      (125 * Math.PI) / 180,
    );
    const atRoot = armThicknessAtAngle(DEFAULT_CLAMP_CONFIG, Math.PI);
    expect(atSide).toBeCloseTo(DEFAULT_CLAMP_CONFIG.armThickness, 5);
    expect(atShoulder).toBeGreaterThan(atSide);
    expect(atShoulder).toBeLessThan(atRoot);
    expect(atRoot).toBeCloseTo(DEFAULT_CLAMP_CONFIG.rootThickness, 5);
  });
});
