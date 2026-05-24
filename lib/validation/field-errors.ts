import type { ValidationIssue, ValidationResult } from "./types";

/** Issues attached to a field id (exact match or `field.*` prefix). */
export function issuesForField(
  result: ValidationResult,
  field: string,
): ValidationIssue[] {
  const all = [...result.errors, ...result.warnings];
  return all.filter(
    (issue) =>
      issue.field === field ||
      (issue.field?.startsWith(`${field}.`) ?? false) ||
      (issue.field?.startsWith(`${field}[`) ?? false),
  );
}

export function fieldHasError(
  result: ValidationResult,
  field: string,
): boolean {
  return result.errors.some(
    (issue) =>
      issue.field === field ||
      (issue.field?.startsWith(`${field}.`) ?? false) ||
      (issue.field?.startsWith(`${field}[`) ?? false),
  );
}

export function fieldHelperText(
  result: ValidationResult,
  field: string,
): string | undefined {
  const issues = issuesForField(result, field);
  if (issues.length === 0) return undefined;
  const error = issues.find((i) => i.severity === "error");
  return (error ?? issues[0]).message;
}
