export type ValidationSeverity = "error" | "warning";

export interface ValidationIssue {
  severity: ValidationSeverity;
  code: string;
  message: string;
  field?: string;
}

export interface ValidationResult {
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
}

export function emptyValidation(): ValidationResult {
  return { errors: [], warnings: [] };
}

export function mergeValidation(
  ...results: ValidationResult[]
): ValidationResult {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  for (const r of results) {
    errors.push(...r.errors);
    warnings.push(...r.warnings);
  }
  return { errors, warnings };
}

export function isValid(result: ValidationResult): boolean {
  return result.errors.length === 0;
}
