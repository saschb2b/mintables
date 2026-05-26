import type { Generator } from "../generator";
import type { ValidationResult } from "../validation/types";
import { isPrintableMesh } from "../geometry/mesh-analysis";
import { triggerDownload } from "./download";
import { serializeSTL } from "./stl";
import { serialize3MF } from "./3mf";

export type ExportFormat = "stl" | "3mf";

const MIME_TYPES: Record<ExportFormat, string> = {
  stl: "application/octet-stream",
  "3mf": "application/vnd.ms-package.3dmanufacturing-3dmodel+xml",
};

export class ExportError extends Error {
  constructor(
    message: string,
    readonly validation?: ValidationResult,
  ) {
    super(message);
    this.name = "ExportError";
  }
}

/**
 * Validate → generate → quality-check → serialize → download. The single entry
 * point for every generator's export path.
 */
export function exportModel<C>(
  generator: Generator<C>,
  config: C,
  format: ExportFormat,
  filename?: string,
): void {
  const validation = generator.validate(config);
  if (validation.errors.length > 0) {
    throw new ExportError(validation.errors[0].message, validation);
  }

  const triangles = generator.geometry(config);
  if (!isPrintableMesh(triangles)) {
    throw new ExportError(
      `${generator.meta.name} export failed: generated mesh is empty or contains degenerate triangles.`,
    );
  }

  const stem = filename ?? generator.filename(config);
  const fullName = `${stem}.${format}`;
  const buffer =
    format === "3mf"
      ? serialize3MF(triangles, generator.meta.name)
      : serializeSTL(triangles, `Mintables ${generator.meta.name} - Watertight Mesh`);

  triggerDownload(buffer, fullName, MIME_TYPES[format]);
}
