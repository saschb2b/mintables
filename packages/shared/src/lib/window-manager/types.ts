import type { Dispatch } from "react";

export type WindowKind = "generator" | "folder";

export type FolderId = "downloads" | "presets";

export type WindowPayload =
  | { kind: "generator"; generatorId: string }
  | { kind: "folder"; folderId: FolderId };

export type WindowState = "normal" | "minimized" | "maximized";

export interface WindowBounds {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface OpenWindow {
  /** Stable id derived from payload (e.g. "generator:tubes", "folder:downloads"). */
  id: string;
  payload: WindowPayload;
  state: WindowState;
  /** Pixel bounds for the normal (non-maximized) layout. Preserved across max/min cycles. */
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
}

export interface WindowManagerState {
  windows: OpenWindow[];
  /** Top-most non-minimized window id, or null when none. */
  focusedId: string | null;
  /** Next z-index to assign on focus / open. Reducer normalizes when it grows too large. */
  nextZ: number;
}

/**
 * Stable id from payload. Two opens with the same payload collapse to a single
 * window (focus + restore), matching macOS app-instance behavior.
 */
export function windowIdOf(payload: WindowPayload): string {
  if (payload.kind === "generator") return `generator:${payload.generatorId}`;
  return `folder:${payload.folderId}`;
}

export interface WindowManagerActions {
  openWindow: (payload: WindowPayload, initialBounds?: WindowBounds) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  toggleMaximize: (id: string) => void;
  moveWindow: (id: string, x: number, y: number) => void;
  resizeWindow: (id: string, w: number, h: number) => void;
  setBounds: (id: string, x: number, y: number, w: number, h: number) => void;
}

export type WindowManagerAction =
  | { type: "OPEN"; payload: WindowPayload; initialBounds?: WindowBounds }
  | { type: "CLOSE"; id: string }
  | { type: "FOCUS"; id: string }
  | { type: "MINIMIZE"; id: string }
  | { type: "RESTORE"; id: string }
  | { type: "MAXIMIZE_TOGGLE"; id: string }
  | { type: "MOVE"; id: string; x: number; y: number }
  | { type: "RESIZE"; id: string; w: number; h: number }
  | { type: "SET_BOUNDS"; id: string; x: number; y: number; w: number; h: number };

export type WindowManagerDispatch = Dispatch<WindowManagerAction>;
