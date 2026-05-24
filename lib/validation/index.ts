import type { TubeConfig } from "../tube-types";
import type { AdapterConfig } from "../adapter-types";
import type { Tab } from "../preset-storage";
import { validateTubeConfig } from "./tube-validation";
import { validateAdapterConfig } from "./adapter-validation";
import type { ValidationResult } from "./types";

export type { ValidationIssue, ValidationResult } from "./types";
export { isValid } from "./types";
export { validateTubeConfig } from "./tube-validation";
export { validateAdapterConfig } from "./adapter-validation";
export {
  issuesForField,
  fieldHasError,
  fieldHelperText,
} from "./field-errors";

export function validateConfig(
  tab: Tab,
  config: TubeConfig | AdapterConfig,
): ValidationResult {
  if (tab === "tube") return validateTubeConfig(config as TubeConfig);
  return validateAdapterConfig(config as AdapterConfig);
}
