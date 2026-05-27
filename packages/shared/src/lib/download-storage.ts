/**
 * Local download history. Stores a small record per successful export so the
 * Downloads "folder" on the desktop can list what the user has produced —
 * even after a reload. The actual STL/3MF binaries are NOT stored; we keep
 * just enough metadata to re-run `exportModel(generator, config, format)`
 * (which is cheap) when the user wants the file again.
 */

import { CONFIG_SCHEMA_VERSION } from "./preset-storage";

export type ExportFormat = "stl" | "3mf";

export interface DownloadEntry {
  id: string;
  generatorId: string;
  filename: string;
  format: ExportFormat;
  /** Opaque config blob — passed to `generator.decode()` on re-open. */
  config: unknown;
  /** Epoch ms. */
  createdAt: number;
  /** Bump when payload shape changes (localStorage only). */
  schemaVersion?: number;
}

const DOWNLOAD_KEY = "mintables.downloads";
const CHANGE_EVENT = "mintables:downloads-changed";
/** Cap entries to keep localStorage payload bounded. Oldest fall off. */
const MAX_ENTRIES = 100;

function emitChange(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

export function listDownloads(): DownloadEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(DOWNLOAD_KEY);
    if (!raw) return [];
    const arr: unknown = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr as DownloadEntry[];
  } catch {
    return [];
  }
}

function writeDownloads(entries: DownloadEntry[]): void {
  window.localStorage.setItem(DOWNLOAD_KEY, JSON.stringify(entries));
}

export function hasDownloads(): boolean {
  return listDownloads().length > 0;
}

export function recordDownload(
  generatorId: string,
  filename: string,
  format: ExportFormat,
  config: unknown,
): DownloadEntry {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${String(Date.now())}-${Math.random().toString(36).slice(2, 8)}`;
  const entry: DownloadEntry = {
    id,
    generatorId,
    filename,
    format,
    config,
    createdAt: Date.now(),
    schemaVersion: CONFIG_SCHEMA_VERSION,
  };
  const next = [entry, ...listDownloads()].slice(0, MAX_ENTRIES);
  writeDownloads(next);
  emitChange();
  return entry;
}

export function deleteDownload(id: string): void {
  writeDownloads(listDownloads().filter((d) => d.id !== id));
  emitChange();
}

export function getDownload(id: string): DownloadEntry | null {
  return listDownloads().find((d) => d.id === id) ?? null;
}

/** Custom event name dispatched after a download is recorded or deleted. */
export const DOWNLOADS_CHANGED_EVENT = CHANGE_EVENT;
