import {
  windowIdOf,
  type OpenWindow,
  type WindowBounds,
  type WindowManagerAction,
  type WindowManagerState,
  type WindowState,
} from "./types";

export const initialState: WindowManagerState = {
  windows: [],
  focusedId: null,
  nextZ: 1,
};

const Z_NORMALIZE_THRESHOLD = 1000;

const DEFAULT_BOUNDS = {
  baseX: 64,
  baseY: 56,
  step: 28,
  w: 1100,
  h: 720,
};

function cascadeBounds(windowCount: number): WindowBounds {
  return {
    x: DEFAULT_BOUNDS.baseX + windowCount * DEFAULT_BOUNDS.step,
    y: DEFAULT_BOUNDS.baseY + windowCount * DEFAULT_BOUNDS.step,
    w: DEFAULT_BOUNDS.w,
    h: DEFAULT_BOUNDS.h,
  };
}

/**
 * Compress z values into a dense 1..N range so `nextZ` stays bounded over long
 * sessions. Relative ordering is preserved.
 */
function normalizeZ(windows: OpenWindow[]): { windows: OpenWindow[]; nextZ: number } {
  const sorted = [...windows].sort((a, b) => a.z - b.z);
  const rankById = new Map<string, number>();
  sorted.forEach((w, i) => {
    rankById.set(w.id, i + 1);
  });
  const next = windows.map((w) => ({ ...w, z: rankById.get(w.id) ?? w.z }));
  return { windows: next, nextZ: sorted.length + 1 };
}

function pickFocused(windows: OpenWindow[]): string | null {
  let best: OpenWindow | null = null;
  for (const w of windows) {
    if (w.state === "minimized") continue;
    if (!best || w.z > best.z) best = w;
  }
  return best ? best.id : null;
}

function bumpZ(
  windows: OpenWindow[],
  id: string,
  nextZ: number,
): { windows: OpenWindow[]; nextZ: number } {
  const updated = windows.map((w) => (w.id === id ? { ...w, z: nextZ } : w));
  let z = nextZ + 1;
  let final = updated;
  if (z > Z_NORMALIZE_THRESHOLD) {
    const norm = normalizeZ(updated);
    final = norm.windows;
    z = norm.nextZ;
  }
  return { windows: final, nextZ: z };
}

export function reducer(
  state: WindowManagerState,
  action: WindowManagerAction,
): WindowManagerState {
  switch (action.type) {
    case "OPEN": {
      const id = windowIdOf(action.payload);
      const existing = state.windows.find((w) => w.id === id);
      if (existing) {
        // Restore from minimized + focus. Bounds are preserved.
        const restored: OpenWindow = {
          ...existing,
          state: existing.state === "minimized" ? "normal" : existing.state,
        };
        const others = state.windows.filter((w) => w.id !== id);
        const merged = [...others, restored];
        const { windows, nextZ } = bumpZ(merged, id, state.nextZ);
        return { windows, focusedId: id, nextZ };
      }
      const bounds = action.initialBounds ?? cascadeBounds(state.windows.length);
      const fresh: OpenWindow = {
        id,
        payload: action.payload,
        state: "normal",
        x: bounds.x,
        y: bounds.y,
        w: bounds.w,
        h: bounds.h,
        z: state.nextZ,
      };
      let windows = [...state.windows, fresh];
      let nextZ = state.nextZ + 1;
      if (nextZ > Z_NORMALIZE_THRESHOLD) {
        const norm = normalizeZ(windows);
        windows = norm.windows;
        nextZ = norm.nextZ;
      }
      return { windows, focusedId: id, nextZ };
    }
    case "CLOSE": {
      const windows = state.windows.filter((w) => w.id !== action.id);
      if (windows.length === state.windows.length) return state;
      return { ...state, windows, focusedId: pickFocused(windows) };
    }
    case "FOCUS": {
      const exists = state.windows.some((w) => w.id === action.id);
      if (!exists) return state;
      const restored = state.windows.map((w) =>
        w.id === action.id && w.state === "minimized" ? { ...w, state: "normal" as const } : w,
      );
      const { windows, nextZ } = bumpZ(restored, action.id, state.nextZ);
      return { windows, focusedId: action.id, nextZ };
    }
    case "MINIMIZE": {
      const target = state.windows.find((w) => w.id === action.id);
      if (!target || target.state === "minimized") return state;
      const windows = state.windows.map((w) =>
        w.id === action.id ? { ...w, state: "minimized" as const } : w,
      );
      return { ...state, windows, focusedId: pickFocused(windows) };
    }
    case "RESTORE": {
      const target = state.windows.find((w) => w.id === action.id);
      if (!target || target.state !== "minimized") return state;
      const restored = state.windows.map((w) =>
        w.id === action.id ? { ...w, state: "normal" as const } : w,
      );
      const { windows, nextZ } = bumpZ(restored, action.id, state.nextZ);
      return { windows, focusedId: action.id, nextZ };
    }
    case "MAXIMIZE_TOGGLE": {
      const target = state.windows.find((w) => w.id === action.id);
      if (!target) return state;
      const nextStateForTarget: WindowState =
        target.state === "maximized" ? "normal" : "maximized";
      const toggled = state.windows.map((w) =>
        w.id === action.id ? { ...w, state: nextStateForTarget } : w,
      );
      const { windows, nextZ } = bumpZ(toggled, action.id, state.nextZ);
      return { windows, focusedId: action.id, nextZ };
    }
    case "MOVE": {
      const target = state.windows.find((w) => w.id === action.id);
      if (!target) return state;
      const windows = state.windows.map((w) =>
        w.id === action.id ? { ...w, x: action.x, y: action.y } : w,
      );
      return { ...state, windows };
    }
    case "RESIZE": {
      const target = state.windows.find((w) => w.id === action.id);
      if (!target) return state;
      const windows = state.windows.map((w) =>
        w.id === action.id ? { ...w, w: action.w, h: action.h } : w,
      );
      return { ...state, windows };
    }
    case "SET_BOUNDS": {
      const target = state.windows.find((w) => w.id === action.id);
      if (!target) return state;
      const windows = state.windows.map((w) =>
        w.id === action.id
          ? { ...w, x: action.x, y: action.y, w: action.w, h: action.h }
          : w,
      );
      return { ...state, windows };
    }
    default: {
      // Exhaustiveness check.
      const _exhaustive: never = action;
      void _exhaustive;
      return state;
    }
  }
}
