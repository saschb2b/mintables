/**
 * Shared CSG kernel built on Manifold (manifold-3d, WebAssembly).
 *
 * Generators that need booleans (union, subtract, intersect) build their part
 * as Manifold solids and hand the result to `manifoldToTriangles`, which
 * produces the same triangle soup every other generator emits. The WASM
 * module loads once per page; `Generator.prepare` gives the shell a hook to
 * await it before the first `geometry()` call.
 *
 * Coordinate frame: z-up, same as the rest of the CAD pipeline.
 */
import type {
  CrossSection,
  Manifold,
  ManifoldToplevel,
  Vec2,
} from "manifold-3d";
import type { TriangleMesh } from "../generator";
import { addTriangle } from "./mesh-utils";

export type { CrossSection, Manifold, ManifoldToplevel, Vec2 };

let kernel: ManifoldToplevel | null = null;
let loading: Promise<ManifoldToplevel> | null = null;

export class CsgNotReadyError extends Error {
  constructor() {
    super("The geometry kernel has not finished loading yet.");
    this.name = "CsgNotReadyError";
  }
}

/** Load the WASM kernel once. Safe to call repeatedly. */
export function loadCsg(): Promise<ManifoldToplevel> {
  if (kernel) return Promise.resolve(kernel);
  loading ??= (async () => {
    try {
      const { default: createModule } = await import("manifold-3d");
      const wasm = await createModule();
      wasm.setup();
      kernel = wasm;
      return wasm;
    } catch (err) {
      loading = null;
      throw err;
    }
  })();
  return loading;
}

export function isCsgReady(): boolean {
  return kernel !== null;
}

/** Synchronous accessor for code paths that run after `loadCsg` resolved. */
export function getCsg(): ManifoldToplevel {
  if (!kernel) throw new CsgNotReadyError();
  return kernel;
}

interface Disposable {
  delete(): void;
}

/**
 * Tracks every Manifold / CrossSection created while building a part so the
 * WASM heap is released in one sweep. Every kernel call that returns a new
 * object must go through `keep`.
 */
export class CsgScope {
  private readonly items: Disposable[] = [];

  keep<T extends Disposable>(item: T): T {
    this.items.push(item);
    return item;
  }

  dispose(): void {
    for (let i = this.items.length - 1; i >= 0; i--) this.items[i].delete();
    this.items.length = 0;
  }
}

/** Run `build` with a scope that is disposed afterwards, even on throw. */
export function withCsgScope<T>(
  build: (scope: CsgScope, kernel: ManifoldToplevel) => T,
): T {
  const scope = new CsgScope();
  try {
    return build(scope, getCsg());
  } finally {
    scope.dispose();
  }
}

/* ------------------------------------------------------------------ */
/* 2D outlines                                                         */
/* ------------------------------------------------------------------ */

function signedArea(poly: Vec2[]): number {
  let sum = 0;
  for (let i = 0; i < poly.length; i++) {
    const [ax, ay] = poly[i];
    const [bx, by] = poly[(i + 1) % poly.length];
    sum += ax * by - bx * ay;
  }
  return sum / 2;
}

/** Return the polygon wound counter-clockwise (Manifold's fill convention). */
export function ensureCcw(poly: Vec2[]): Vec2[] {
  return signedArea(poly) < 0 ? [...poly].reverse() : poly;
}

export interface RoundedRectOptions {
  /** Round the two corners at +y (default true). */
  roundTop?: boolean;
  /** Round the two corners at -y (default true). */
  roundBottom?: boolean;
  /** Points per rounded corner (default 8). */
  segments?: number;
}

/**
 * Axis-aligned rectangle centred on the origin with optional rounded corners.
 * Radius is clamped so opposite corners never overlap.
 */
export function roundedRectPolygon(
  width: number,
  height: number,
  radius: number,
  options: RoundedRectOptions = {},
): Vec2[] {
  const { roundTop = true, roundBottom = true, segments = 8 } = options;
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));
  const hw = width / 2;
  const hh = height / 2;
  const pts: Vec2[] = [];
  const corner = (
    cx: number,
    cy: number,
    startAngle: number,
    rounded: boolean,
    sx: number,
    sy: number,
  ) => {
    if (!rounded || r <= 0) {
      pts.push([sx, sy]);
      return;
    }
    for (let i = 0; i <= segments; i++) {
      const a = startAngle + (i / segments) * (Math.PI / 2);
      pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
  };
  // CCW starting at the bottom-right corner.
  corner(hw - r, -hh + r, -Math.PI / 2, roundBottom, hw, -hh);
  corner(hw - r, hh - r, 0, roundTop, hw, hh);
  corner(-hw + r, hh - r, Math.PI / 2, roundTop, -hw, hh);
  corner(-hw + r, -hh + r, Math.PI, roundBottom, -hw, -hh);
  return pts;
}

/** Regular polygon approximating a circle, CCW, centred on (cx, cy). */
export function circlePolygon(
  radius: number,
  segments: number,
  cx = 0,
  cy = 0,
): Vec2[] {
  const pts: Vec2[] = [];
  for (let i = 0; i < segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    pts.push([cx + radius * Math.cos(a), cy + radius * Math.sin(a)]);
  }
  return pts;
}

/* ------------------------------------------------------------------ */
/* Extrusions along each axis                                          */
/* ------------------------------------------------------------------ */

/** Extrude an (x, y) outline along +z from z0 to z1. */
export function extrudeZ(
  scope: CsgScope,
  outline: Vec2[],
  z0: number,
  z1: number,
): Manifold {
  const { Manifold } = getCsg();
  const solid = scope.keep(Manifold.extrude(ensureCcw(outline), z1 - z0));
  return scope.keep(solid.translate([0, 0, z0]));
}

/**
 * Extrude an (x, z) outline along +y from y0 to y1. The outline is given in
 * the plane you see when looking at the part from the front.
 */
export function extrudeY(
  scope: CsgScope,
  outline: Vec2[],
  y0: number,
  y1: number,
): Manifold {
  const { Manifold } = getCsg();
  // Extrude along z, then rotate +90 about x: (x, v, w) -> (x, -w, v).
  const solid = scope.keep(Manifold.extrude(ensureCcw(outline), y1 - y0));
  const rotated = scope.keep(solid.rotate([90, 0, 0]));
  return scope.keep(rotated.translate([0, y1, 0]));
}

/**
 * Extrude a (y, z) outline along +x from x0 to x1. The outline is the side
 * view of the part (y to the right, z up).
 */
export function extrudeX(
  scope: CsgScope,
  outline: Vec2[],
  x0: number,
  x1: number,
): Manifold {
  const { Manifold } = getCsg();
  // Build the profile as (u = z, v = y), extrude along w, then rotate -90
  // about y: (u, v, w) -> (-w, v, u), so X = -w, Y = v, Z = u.
  const swapped = ensureCcw(outline.map(([y, z]): Vec2 => [z, y]));
  const solid = scope.keep(Manifold.extrude(swapped, x1 - x0));
  const rotated = scope.keep(solid.rotate([0, -90, 0]));
  return scope.keep(rotated.translate([x1, 0, 0]));
}

/** Axis-aligned box from (x0, y0, z0) to (x1, y1, z1). */
export function box(
  scope: CsgScope,
  x0: number,
  y0: number,
  z0: number,
  x1: number,
  y1: number,
  z1: number,
): Manifold {
  const { Manifold } = getCsg();
  const solid = scope.keep(Manifold.cube([x1 - x0, y1 - y0, z1 - z0]));
  return scope.keep(solid.translate([x0, y0, z0]));
}

/** Vertical cylinder (axis along z) from z0 to z1 centred on (cx, cy). */
export function cylinderZ(
  scope: CsgScope,
  radius: number,
  z0: number,
  z1: number,
  segments: number,
  cx = 0,
  cy = 0,
): Manifold {
  const { Manifold } = getCsg();
  const solid = scope.keep(
    Manifold.cylinder(z1 - z0, radius, radius, segments),
  );
  return scope.keep(solid.translate([cx, cy, z0]));
}

/* ------------------------------------------------------------------ */
/* Output                                                              */
/* ------------------------------------------------------------------ */

/**
 * Convert a Manifold solid to the shared triangle soup.
 *
 * Every face is kept: Manifold guarantees a closed, oriented mesh, and
 * booleans occasionally leave legitimately tiny triangles where two solids
 * touch tangentially (area around 1e-9 mm2). Dropping those would open
 * zero-area holes, so generators built on the kernel should gate export
 * with `isManifoldMeshExportable` instead of the generic degenerate check.
 */
export function manifoldToTriangles(solid: Manifold): number[][] {
  const mesh = solid.getMesh();
  const { numProp, vertProperties, triVerts } = mesh;
  const out: number[][] = [];
  for (let i = 0; i < triVerts.length; i += 3) {
    const a = triVerts[i] * numProp;
    const b = triVerts[i + 1] * numProp;
    const c = triVerts[i + 2] * numProp;
    addTriangle(
      out,
      vertProperties[a],
      vertProperties[a + 1],
      vertProperties[a + 2],
      vertProperties[b],
      vertProperties[b + 1],
      vertProperties[b + 2],
      vertProperties[c],
      vertProperties[c + 1],
      vertProperties[c + 2],
    );
  }
  return out;
}

/** Export gate for kernel-built meshes: closed by construction, so only emptiness and bad numbers are checked. */
export function isManifoldMeshExportable(mesh: TriangleMesh): boolean {
  if (mesh instanceof Float32Array) {
    return (
      mesh.length >= 9 && mesh.length % 9 === 0 && mesh.every(Number.isFinite)
    );
  }
  return (
    mesh.length > 0 &&
    mesh.every((tri) => tri.length === 9 && tri.every(Number.isFinite))
  );
}
