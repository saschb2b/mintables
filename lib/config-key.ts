/** Stable serialization for memo/debounce keys (sorted keys for consistency). */
export function configKey(value: unknown): string {
  return JSON.stringify(value);
}
