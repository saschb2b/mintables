import { addTriangle } from "@mintables/shared/lib/geometry/mesh-utils";
import type { DividerConfig } from "./types";

/**
 * Build the 12-triangle box mesh for a flat divider slab lying on the print
 * bed. Coordinates use z-up, centered horizontally around the origin so the
 * orbit camera frames the slab symmetrically (same convention as tubes):
 *   x ∈ [-width/2, width/2]   (width along the bed)
 *   y ∈ [-height/2, height/2] (height along the bed)
 *   z ∈ [0, thickness]        (slim, points up off the bed — bottom sits on z=0)
 *
 * Winding is CCW when viewed from outside so all face normals point outward.
 */
export function generateDividerTriangles(config: DividerConfig): number[][] {
  const { thickness: t, width: w, height: h } = config;
  const hw = w / 2;
  const hh = h / 2;
  const triangles: number[][] = [];

  // 8 corners of the box
  // Bottom face (z = 0)
  const b00 = [-hw, -hh, 0] as const;
  const b10 = [hw, -hh, 0] as const;
  const b11 = [hw, hh, 0] as const;
  const b01 = [-hw, hh, 0] as const;
  // Top face (z = t)
  const t00 = [-hw, -hh, t] as const;
  const t10 = [hw, -hh, t] as const;
  const t11 = [hw, hh, t] as const;
  const t01 = [-hw, hh, t] as const;

  // Top face (normal +z) — CCW viewed from above
  addTriangle(triangles, ...t00, ...t10, ...t11);
  addTriangle(triangles, ...t00, ...t11, ...t01);

  // Bottom face (normal -z) — CCW viewed from below
  addTriangle(triangles, ...b00, ...b11, ...b10);
  addTriangle(triangles, ...b00, ...b01, ...b11);

  // Front face (y = 0, normal -y)
  addTriangle(triangles, ...b00, ...b10, ...t10);
  addTriangle(triangles, ...b00, ...t10, ...t00);

  // Back face (y = h, normal +y)
  addTriangle(triangles, ...b11, ...b01, ...t01);
  addTriangle(triangles, ...b11, ...t01, ...t11);

  // Right face (x = w, normal +x)
  addTriangle(triangles, ...b10, ...b11, ...t11);
  addTriangle(triangles, ...b10, ...t11, ...t10);

  // Left face (x = 0, normal -x)
  addTriangle(triangles, ...b01, ...b00, ...t00);
  addTriangle(triangles, ...b01, ...t00, ...t01);

  return triangles;
}
