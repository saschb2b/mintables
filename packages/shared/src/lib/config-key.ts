/** Stable serialization for memo/debounce keys. */
export function configKey(value: unknown): string {
  return JSON.stringify(value);
}
