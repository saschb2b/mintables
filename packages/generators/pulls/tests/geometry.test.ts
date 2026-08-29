import { describe, expect, it } from "vitest";
import { isPrintableMesh } from "@mintables/shared/lib/geometry/mesh-analysis";
import { generatePullTriangles, tabScrewPositions } from "../src/geometry";
import { getPullSpec } from "../src/spec";
import {
  DEFAULT_ARC_PULL,
  DEFAULT_KNOB_PULL,
  DEFAULT_TAB_PULL,
  type PullConfig,
} from "../src/types";
import { validatePullConfig } from "../src/validation";

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

/** Positive when every triangle's normal points out of the solid. */
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

function zRange(triangles: number[][]): { min: number; max: number } {
  const zs = triangles.flatMap((t) => [t[2], t[5], t[8]]);
  return { min: Math.min(...zs), max: Math.max(...zs) };
}

const VARIANTS: [string, PullConfig][] = [
  ["knob dome + screws", DEFAULT_KNOB_PULL],
  [
    "knob flat + glue",
    { ...DEFAULT_KNOB_PULL, headShape: "flat", mount: "glue" },
  ],
  [
    "knob dished + grip rings",
    { ...DEFAULT_KNOB_PULL, headShape: "dished", gripGrooves: 5 },
  ],
  [
    "knob cylinder (neck = head)",
    { ...DEFAULT_KNOB_PULL, neckDiameter: 32, baseDiameter: 32 },
  ],
  ["tab two screws rounded", DEFAULT_TAB_PULL],
  [
    "tab one screw square 90 degrees",
    {
      ...DEFAULT_TAB_PULL,
      screwCount: 1,
      tipStyle: "square",
      tabAngle: 90,
    },
  ],
  ["tab glued shallow", { ...DEFAULT_TAB_PULL, mount: "glue", tabAngle: 20 }],
  ["arc round + screws", DEFAULT_ARC_PULL],
  [
    "arc flat + glue",
    { ...DEFAULT_ARC_PULL, barProfile: "flat", mount: "glue" },
  ],
  [
    "arc horseshoe",
    { ...DEFAULT_ARC_PULL, holeSpacing: 64, rise: 70, screwHoleDepth: 10 },
  ],
  ["arc shallow", { ...DEFAULT_ARC_PULL, holeSpacing: 128, rise: 24 }],
];

describe("generatePullTriangles", () => {
  it.each(VARIANTS)("builds a watertight solid: %s", (_name, config) => {
    const triangles = generatePullTriangles(config);
    expect(triangles.length).toBeGreaterThan(0);
    expect(isPrintableMesh(triangles)).toBe(true);
    expect(isWatertight(triangles)).toBe(true);
    expect(signedVolume(triangles)).toBeGreaterThan(0);
  });

  it("sits on the mount plane and matches the spec height", () => {
    for (const [, config] of VARIANTS) {
      const { min, max } = zRange(generatePullTriangles(config));
      expect(min).toBeCloseTo(0, 5);
      expect(max).toBeCloseTo(getPullSpec(config).height, 1);
    }
  });

  it("gives the knob its full stacked height", () => {
    const c = {
      ...DEFAULT_KNOB_PULL,
      baseHeight: 4,
      neckHeight: 8,
      headHeight: 14,
    };
    expect(zRange(generatePullTriangles(c)).max).toBeCloseTo(26, 6);
  });

  it("bores the knob pilot hole only when screw-mounted", () => {
    const bored = generatePullTriangles(DEFAULT_KNOB_PULL);
    const holeR = DEFAULT_KNOB_PULL.screwDiameter / 2;
    const onBore = bored
      .flatMap((t) => [
        [t[0], t[1], t[2]],
        [t[3], t[4], t[5]],
        [t[6], t[7], t[8]],
      ])
      .filter(([x, y]) => Math.abs(Math.hypot(x, y) - holeR) < 1e-4);
    expect(onBore.length).toBeGreaterThan(0);
    expect(Math.max(...onBore.map(([, , z]) => z))).toBeCloseTo(
      DEFAULT_KNOB_PULL.screwHoleDepth,
      6,
    );

    const glued = generatePullTriangles({
      ...DEFAULT_KNOB_PULL,
      mount: "glue",
    });
    const gluedBore = glued
      .flatMap((t) => [
        [t[0], t[1], t[2]],
        [t[3], t[4], t[5]],
        [t[6], t[7], t[8]],
      ])
      .filter(
        ([x, y, z]) => Math.abs(Math.hypot(x, y) - holeR) < 1e-4 && z > 0.1,
      );
    expect(gluedBore).toHaveLength(0);
  });

  it("dishes the dished head below its rim", () => {
    const c: PullConfig = { ...DEFAULT_KNOB_PULL, headShape: "dished" };
    const triangles = generatePullTriangles(c);
    const top = zRange(triangles).max;
    // The axis point of the dish sits below the rim by the dish depth.
    const axisTop = Math.max(
      ...triangles
        .flatMap((t) => [
          [t[0], t[1], t[2]],
          [t[3], t[4], t[5]],
          [t[6], t[7], t[8]],
        ])
        .filter(([x, y]) => Math.hypot(x, y) < 1e-4)
        .map(([, , z]) => z),
    );
    expect(axisTop).toBeLessThan(top - 1);
  });

  it("keeps the tab mount face flat at z = 0 along the base", () => {
    const triangles = generatePullTriangles(DEFAULT_TAB_PULL);
    const below = triangles
      .flatMap((t) => [t[2], t[5], t[8]])
      .filter((z) => z < -1e-6);
    expect(below).toHaveLength(0);
  });

  it("pierces the tab base with the configured screw holes", () => {
    const triangles = generatePullTriangles(DEFAULT_TAB_PULL);
    const shankR = DEFAULT_TAB_PULL.screwDiameter / 2;
    const expected = tabScrewPositions(DEFAULT_TAB_PULL);
    expect(expected).toHaveLength(2);
    // Vertices on the shank barrel at the mount face exist for both screws.
    const centers = new Set<number>();
    for (const t of triangles) {
      for (let i = 0; i < 3; i++) {
        const x = t[i * 3];
        const y = t[i * 3 + 1];
        const z = t[i * 3 + 2];
        if (Math.abs(z) > 1e-6) continue;
        for (const cx of expected) {
          if (Math.abs(Math.hypot(x - cx, y) - shankR) < 1e-3) centers.add(cx);
        }
      }
    }
    expect(centers.size).toBe(2);
  });

  it("plants the arc feet exactly on the requested hole spacing", () => {
    for (const spacing of [64, 96, 128]) {
      const c: PullConfig = { ...DEFAULT_ARC_PULL, holeSpacing: spacing };
      const triangles = generatePullTriangles(c);
      const holeR = c.screwDiameter / 2;
      // Bore rims in the mount plane reveal the actual foot centers.
      const rimXs: number[] = [];
      for (const t of triangles) {
        for (let i = 0; i < 3; i++) {
          const x = t[i * 3];
          const y = t[i * 3 + 1];
          const z = t[i * 3 + 2];
          if (Math.abs(z) > 1e-6) continue;
          if (Math.abs(Math.hypot(Math.abs(x) - spacing / 2, y) - holeR) < 0.2)
            rimXs.push(x);
        }
      }
      expect(rimXs.length).toBeGreaterThan(0);
      const right = rimXs.filter((x) => x > 0);
      const avg = right.reduce((s, x) => s + x, 0) / right.length;
      expect(avg).toBeCloseTo(spacing / 2, 1);
    }
  });

  it("crests the arc at rise plus half the bar", () => {
    const { max } = zRange(generatePullTriangles(DEFAULT_ARC_PULL));
    expect(max).toBeCloseTo(
      DEFAULT_ARC_PULL.rise + DEFAULT_ARC_PULL.barDiameter / 2,
      1,
    );
  });

  it("keeps every tested variant valid", () => {
    for (const [, config] of VARIANTS) {
      expect(validatePullConfig(config).errors).toHaveLength(0);
    }
  });
});
