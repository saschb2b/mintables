import type { AdapterConfig } from "./adapter-types";
import { generateAdapterTriangles } from "./geometry/adapter-mesh";
import { createSTLBinary } from "./geometry/stl-binary";

export { generateAdapterTriangles } from "./geometry/adapter-mesh";

const ADAPTER_STL_HEADER = "TubeCraft Adapter Generator";

export function generateAdapterSTL(config: AdapterConfig): ArrayBuffer {
  const buffer = createSTLBinary(generateAdapterTriangles(config));
  const view = new DataView(buffer);
  for (let i = 0; i < ADAPTER_STL_HEADER.length && i < 80; i++) {
    view.setUint8(i, ADAPTER_STL_HEADER.charCodeAt(i));
  }
  return buffer;
}

export function downloadAdapterSTL(
  config: AdapterConfig,
  filename: string,
): void {
  const buffer = generateAdapterSTL(config);
  const blob = new Blob([buffer], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
