import type { TubeConfig } from "./tube-types";
import type { AdapterConfig } from "./adapter-types";
import { generateTubeTriangles } from "./geometry/tube-mesh";
import { generateAdapterTriangles } from "./geometry/adapter-mesh";
import { isPrintableMesh } from "./geometry/mesh-analysis";
import { validateTubeConfig, validateAdapterConfig } from "./validation";
import type { ValidationResult } from "./validation";
import { downloadSTL } from "./stl-generator";
import { downloadAdapterSTL } from "./adapter-generator";
import { downloadTube3MF, downloadAdapter3MF } from "./3mf-generator";

export type ExportFormat = "stl" | "3mf";

export class ExportError extends Error {
  constructor(
    message: string,
    readonly validation?: ValidationResult,
  ) {
    super(message);
    this.name = "ExportError";
  }
}

function assertPrintableMesh(triangles: number[][], label: string): void {
  if (!isPrintableMesh(triangles)) {
    throw new ExportError(
      `${label} export failed: generated mesh is empty or contains degenerate triangles.`,
    );
  }
}

export function exportTubeModel(
  config: TubeConfig,
  format: ExportFormat,
  filename: string,
): void {
  const validation = validateTubeConfig(config);
  if (validation.errors.length > 0) {
    throw new ExportError(validation.errors[0].message, validation);
  }

  const triangles = generateTubeTriangles(config);
  assertPrintableMesh(triangles, "Tube");

  if (format === "3mf") {
    downloadTube3MF(config, filename);
  } else {
    downloadSTL(config, filename);
  }
}

export function exportAdapterModel(
  config: AdapterConfig,
  format: ExportFormat,
  filename: string,
): void {
  const validation = validateAdapterConfig(config);
  if (validation.errors.length > 0) {
    throw new ExportError(validation.errors[0].message, validation);
  }

  const triangles = generateAdapterTriangles(config);
  assertPrintableMesh(triangles, "Adapter");

  if (format === "3mf") {
    downloadAdapter3MF(config, filename);
  } else {
    downloadAdapterSTL(config, filename);
  }
}
