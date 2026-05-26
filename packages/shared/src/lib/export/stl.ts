import type { TriangleMesh } from "../generator";
import { createSTLBinary } from "../geometry/stl-binary";

export function serializeSTL(
  triangles: TriangleMesh,
  headerText?: string,
): ArrayBuffer {
  return createSTLBinary(triangles, headerText);
}
