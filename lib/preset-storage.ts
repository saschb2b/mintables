import type { TubeConfig } from "./tube-types";
import {
  DEFAULT_ROUND_CONFIG,
  DEFAULT_SQUARE_CONFIG,
  DEFAULT_RECTANGULAR_CONFIG,
} from "./tube-types";
import type { AdapterConfig } from "./adapter-types";
import { DEFAULT_ADAPTER_CONFIG } from "./adapter-types";

export type Tab = "tube" | "adapter";

export interface Preset {
  id: string;
  name: string;
  tab: Tab;
  config: TubeConfig | AdapterConfig;
  createdAt: number;
  /** Increment when preset payload shape changes (localStorage only). */
  schemaVersion?: number;
}

/** Bump when preset/config shape changes; used for localStorage presets. */
export const CONFIG_SCHEMA_VERSION = 3;

const PRESET_KEY = "tubecraft.presets";

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

export function encodeConfig(config: TubeConfig | AdapterConfig): string {
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

export function buildShareUrl(
  tab: Tab,
  config: TubeConfig | AdapterConfig,
): string {
  const encoded = encodeConfig(config);
  const tabPart = tab === "adapter" ? "tab=adapter&" : "";
  return `${window.location.origin}/?${tabPart}config=${encoded}`;
}

function isObj(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

function mergeWithDefaults<T>(defaults: T, incoming: unknown): T {
  if (!isObj(incoming) || !isObj(defaults)) return defaults;
  const out: Record<string, unknown> = { ...defaults };
  for (const [k, defVal] of Object.entries(defaults)) {
    if (!(k in incoming)) continue;
    const incVal = incoming[k];
    if (isObj(defVal)) {
      out[k] = mergeWithDefaults(defVal, incVal);
    } else if (typeof incVal === typeof defVal) {
      out[k] = incVal;
    }
  }
  return out as T;
}

export function loadTubeFromData(data: unknown): TubeConfig | null {
  if (!isObj(data)) return null;
  const shape = data.shape;
  let base: TubeConfig;
  if (shape === "round") base = DEFAULT_ROUND_CONFIG;
  else if (shape === "square") base = DEFAULT_SQUARE_CONFIG;
  else if (shape === "rectangular") base = DEFAULT_RECTANGULAR_CONFIG;
  else return null;
  return mergeWithDefaults(base, data);
}

export function loadAdapterFromData(data: unknown): AdapterConfig | null {
  if (!isObj(data)) return null;
  return mergeWithDefaults(DEFAULT_ADAPTER_CONFIG, data);
}

export function readUrlParams(): {
  tab: Tab;
  tubeConfig: TubeConfig | null;
  adapterConfig: AdapterConfig | null;
} {
  if (typeof window === "undefined") {
    return { tab: "tube", tubeConfig: null, adapterConfig: null };
  }
  const params = new URLSearchParams(window.location.search);
  const tab: Tab = params.get("tab") === "adapter" ? "adapter" : "tube";
  const raw = params.get("config");
  if (!raw) return { tab, tubeConfig: null, adapterConfig: null };
  const decoded = decodeConfig(raw);
  if (tab === "adapter") {
    return {
      tab,
      tubeConfig: null,
      adapterConfig: loadAdapterFromData(decoded),
    };
  }
  return { tab, tubeConfig: loadTubeFromData(decoded), adapterConfig: null };
}

export function syncUrl(tab: Tab, config: TubeConfig | AdapterConfig): void {
  if (typeof window === "undefined") return;
  const encoded = encodeConfig(config);
  const tabPart = tab === "adapter" ? "tab=adapter&" : "";
  const next = `/?${tabPart}config=${encoded}`;
  window.history.replaceState(null, "", next);
}

export function listPresets(): Preset[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(PRESET_KEY);
    if (!raw) return [];
    const arr: unknown = JSON.parse(raw);
    return Array.isArray(arr) ? (arr as Preset[]) : [];
  } catch {
    return [];
  }
}

function writePresets(presets: Preset[]): void {
  window.localStorage.setItem(PRESET_KEY, JSON.stringify(presets));
}

export function savePreset(
  name: string,
  tab: Tab,
  config: TubeConfig | AdapterConfig,
): Preset {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${String(Date.now())}-${Math.random().toString(36).slice(2, 8)}`;
  const preset: Preset = {
    id,
    name: name.trim() || "Untitled",
    tab,
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

export function describeConfig(
  tab: Tab,
  config: TubeConfig | AdapterConfig,
): string {
  if (tab === "tube") {
    const c = config as TubeConfig;
    const parts: string[] = [];
    if (c.shape === "round") {
      parts.push(
        `Round tube — ${String(c.innerDiameter)}/${String(c.outerDiameter)}mm Ø`,
      );
    } else if (c.shape === "square") {
      parts.push(
        `Square tube — ${String(c.innerSize)}/${String(c.outerSize)}mm`,
      );
    } else {
      parts.push(
        `Rectangular tube — ${String(c.innerWidth)}×${String(c.innerHeight)} / ${String(c.outerWidth)}×${String(c.outerHeight)}mm`,
      );
    }
    parts.push(`${String(c.length)}mm long`);
    if (c.clamshell.enabled) parts.push("clamshell split");
    if (c.flare.enabled && c.topCut.type === "flat") {
      parts.push(`press-fit (${c.flare.fitType})`);
    }
    if (c.topCut.type !== "flat") parts.push(`top: ${c.topCut.type}`);
    if (c.bottomCut.type !== "flat") parts.push(`bottom: ${c.bottomCut.type}`);
    return parts.join(", ");
  }

  const a = config as AdapterConfig;
  const sameShape = a.endA.shape === a.endB.shape;
  const type = sameShape
    ? `${a.endA.shape} adapter`
    : `${a.endA.shape} → ${a.endB.shape} adapter`;
  const bend = a.bendAngle > 0 ? `${String(a.bendAngle)}° elbow` : "straight";
  const fit =
    a.endAFit === "socket" && a.endBFit === "socket"
      ? "socket/socket"
      : `${a.endAFit}/${a.endBFit}`;
  return `${type}, ${bend}, ${fit}`;
}
