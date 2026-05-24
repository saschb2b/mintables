import type { TubeConfig } from "./tube-types";
import { generateTubeTriangles } from "./geometry/tube-mesh";
import { createSTLBinary } from "./geometry/stl-binary";

export { generateTubeTriangles } from "./geometry/tube-mesh";

export function generateSTL(config: TubeConfig): ArrayBuffer {
  return createSTLBinary(generateTubeTriangles(config));
}

export function downloadSTL(config: TubeConfig, filename = "tube.stl"): void {
  const buffer = generateSTL(config);
  const blob = new Blob([buffer], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
