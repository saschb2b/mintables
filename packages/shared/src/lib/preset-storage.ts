/**
 * Generic preset + share-URL storage. Generator-agnostic: it stores a string
 * `generatorId` alongside an opaque config blob, and the GeneratorShell calls
 * `generator.decode(rawConfig)` to coerce a loaded blob into the right shape.
 */

export interface Preset {
  id: string;
  name: string;
  generatorId: string;
  config: unknown;
  createdAt: number;
  /** Bump when preset payload shape changes (localStorage only). */
  schemaVersion?: number;
}

export const CONFIG_SCHEMA_VERSION = 3;
const PRESET_KEY = "mintables.presets";

function toBase64Url(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(s: string): string | null {
  try {
    let padded = s.replace(/-/g, "+").replace(/_/g, "/");
    while (padded.length % 4) padded += "=";
    const bin = atob(padded);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

export function encodeConfig(config: unknown): string {
  return toBase64Url(JSON.stringify(config));
}

export function decodeConfig(b64: string): unknown {
  const json = fromBase64Url(b64);
  if (json === null) return null;
  try {
    return JSON.parse(json) as unknown;
  } catch {
    return null;
  }
}

/**
 * Returns a share URL for /generators/<generatorId>?config=… — relative URL
 * is built at call-time so it stays correct on any deploy origin.
 */
export function buildShareUrl(generatorId: string, config: unknown): string {
  const encoded = encodeConfig(config);
  return `${window.location.origin}/generators/${generatorId}?config=${encoded}`;
}

export interface UrlConfig {
  /** Raw decoded config, suitable for `generator.decode(raw)`. */
  raw: unknown;
}

/** Read the `?config=` param from the current URL. */
export function readUrlConfig(): UrlConfig {
  if (typeof window === "undefined") return { raw: null };
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("config");
  if (!raw) return { raw: null };
  return { raw: decodeConfig(raw) };
}

/**
 * Replace the current URL's query string with ?config=<encoded>, preserving
 * the pathname (so the generator route stays intact).
 */
export function syncUrl(config: unknown): void {
  if (typeof window === "undefined") return;
  const encoded = encodeConfig(config);
  const next = `${window.location.pathname}?config=${encoded}`;
  window.history.replaceState(null, "", next);
}

export function listPresets(generatorId?: string): Preset[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(PRESET_KEY);
    if (!raw) return [];
    const arr: unknown = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    const all = arr as Preset[];
    return generatorId ? all.filter((p) => p.generatorId === generatorId) : all;
  } catch {
    return [];
  }
}

function writePresets(presets: Preset[]): void {
  window.localStorage.setItem(PRESET_KEY, JSON.stringify(presets));
}

export function savePreset(
  name: string,
  generatorId: string,
  config: unknown,
): Preset {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${String(Date.now())}-${Math.random().toString(36).slice(2, 8)}`;
  const preset: Preset = {
    id,
    name: name.trim() || "Untitled",
    generatorId,
    config,
    createdAt: Date.now(),
    schemaVersion: CONFIG_SCHEMA_VERSION,
  };
  const next = [preset, ...listPresets()];
  writePresets(next);
  return preset;
}

export function deletePreset(id: string): void {
  writePresets(listPresets().filter((p) => p.id !== id));
}
