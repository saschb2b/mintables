"use client";
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/window-manager/index.ts
var window_manager_exports = {};
__export(window_manager_exports, {
  WindowManagerProvider: () => WindowManagerProvider,
  initialWindowManagerState: () => initialWindowManagerState,
  useWindowManager: () => useWindowManager,
  windowIdOf: () => windowIdOf,
  windowManagerReducer: () => windowManagerReducer
});
module.exports = __toCommonJS(window_manager_exports);

// src/window-manager/types.ts
function windowIdOf(payload) {
  if (payload.kind === "app") return `app:${payload.appId}`;
  const base = `system:${payload.systemId}`;
  if (!payload.args) return base;
  const entries = Object.entries(payload.args);
  if (entries.length === 0) return base;
  entries.sort(([a], [b]) => a.localeCompare(b));
  const argsKey = entries.map(([k, v]) => `${k}=${String(v)}`).join(",");
  return `${base}:${argsKey}`;
}

// src/window-manager/reducer.ts
var DEFAULT_WORKSPACES = ["1", "2", "3"];
var initialWindowManagerState = {
  windows: [],
  focusedId: null,
  nextZ: 1,
  workspaces: [...DEFAULT_WORKSPACES],
  activeWorkspaceId: DEFAULT_WORKSPACES[0] ?? "1"
};
var DEFAULT_BOUNDS = {
  x: 80,
  y: 80,
  w: 720,
  h: 480
};
var Z_RENORMALIZE_AT = 1e4;
function windowManagerReducer(state, action) {
  switch (action.type) {
    case "OPEN": {
      const id = windowIdOf(action.payload);
      const existing = state.windows.find((w) => w.id === id);
      if (existing) {
        const next = state.activeWorkspaceId !== existing.workspaceId ? {
          ...state,
          activeWorkspaceId: existing.workspaceId
        } : state;
        return focusWindow(next, id, {
          payload: action.payload,
          state: "normal"
        });
      }
      const hasExplicitBounds = action.initialBounds != null;
      const bounds = action.initialBounds ?? DEFAULT_BOUNDS;
      const z = state.nextZ;
      const win = {
        id,
        payload: action.payload,
        state: "normal",
        x: bounds.x,
        y: bounds.y,
        w: bounds.w,
        h: bounds.h,
        z,
        workspaceId: state.activeWorkspaceId,
        autoBounds: !hasExplicitBounds
      };
      return bumpZ({
        ...state,
        windows: [...state.windows, win],
        focusedId: id,
        nextZ: z + 1
      });
    }
    case "CLOSE": {
      const windows = state.windows.filter((w) => w.id !== action.id);
      const focusedId = state.focusedId === action.id ? topVisibleId(windows, state.activeWorkspaceId) : state.focusedId;
      return {
        ...state,
        windows,
        focusedId
      };
    }
    case "FOCUS":
      return focusWindow(state, action.id);
    case "MINIMIZE": {
      const windows = state.windows.map((w) => w.id === action.id ? {
        ...w,
        state: "minimized"
      } : w);
      const focusedId = state.focusedId === action.id ? topVisibleId(windows, state.activeWorkspaceId) : state.focusedId;
      return {
        ...state,
        windows,
        focusedId
      };
    }
    case "RESTORE":
      return focusWindow({
        ...state,
        windows: state.windows.map((w) => w.id === action.id ? {
          ...w,
          state: "normal"
        } : w)
      }, action.id);
    case "MAXIMIZE_TOGGLE":
      return focusWindow({
        ...state,
        windows: state.windows.map((w) => w.id === action.id ? {
          ...w,
          state: w.state === "maximized" ? "normal" : "maximized"
        } : w)
      }, action.id);
    case "MOVE":
      return {
        ...state,
        windows: state.windows.map((w) => w.id === action.id ? {
          ...w,
          x: action.x,
          y: action.y
        } : w)
      };
    case "RESIZE":
      return {
        ...state,
        windows: state.windows.map((w) => w.id === action.id ? {
          ...w,
          w: action.w,
          h: action.h
        } : w)
      };
    case "SET_BOUNDS":
      return {
        ...state,
        windows: state.windows.map((w) => w.id === action.id ? {
          ...w,
          x: action.x,
          y: action.y,
          w: action.w,
          h: action.h,
          // The window now has real, placed bounds. Drop the auto flag
          // so a later remount (e.g. workspace switch) won't re-place it
          // and undo a user's drag.
          autoBounds: false
        } : w)
      };
    case "SWITCH_WORKSPACE": {
      if (!state.workspaces.includes(action.workspaceId)) return state;
      if (state.activeWorkspaceId === action.workspaceId) return state;
      const candidates = state.windows.filter((w) => w.workspaceId === action.workspaceId && w.state !== "minimized");
      let focusedId = null;
      for (const w of candidates) {
        if (focusedId === null) {
          focusedId = w.id;
        } else {
          const current = candidates.find((c) => c.id === focusedId);
          if (current && w.z > current.z) focusedId = w.id;
        }
      }
      return {
        ...state,
        activeWorkspaceId: action.workspaceId,
        focusedId
      };
    }
    case "MOVE_WINDOW_TO_WORKSPACE": {
      if (!state.workspaces.includes(action.workspaceId)) return state;
      const target = state.windows.find((w) => w.id === action.id);
      if (!target || target.workspaceId === action.workspaceId) return state;
      const windows = state.windows.map((w) => w.id === action.id ? {
        ...w,
        workspaceId: action.workspaceId
      } : w);
      const focusedId = state.focusedId === action.id ? topVisibleId(windows, state.activeWorkspaceId) : state.focusedId;
      return {
        ...state,
        windows,
        focusedId
      };
    }
    case "ADD_WORKSPACE": {
      if (state.workspaces.includes(action.workspaceId)) return state;
      return {
        ...state,
        workspaces: [...state.workspaces, action.workspaceId]
      };
    }
    case "REMOVE_WORKSPACE": {
      if (!state.workspaces.includes(action.workspaceId)) return state;
      if (state.workspaces.length <= 1) return state;
      const remaining = state.workspaces.filter((w) => w !== action.workspaceId);
      const fallback = remaining[0] ?? state.activeWorkspaceId;
      const windows = state.windows.map((w) => w.workspaceId === action.workspaceId ? {
        ...w,
        workspaceId: fallback
      } : w);
      const activeWorkspaceId = state.activeWorkspaceId === action.workspaceId ? fallback : state.activeWorkspaceId;
      const focusedId = state.activeWorkspaceId === action.workspaceId ? topVisibleId(windows, fallback) : state.focusedId;
      return {
        ...state,
        windows,
        workspaces: remaining,
        activeWorkspaceId,
        focusedId
      };
    }
  }
}
function focusWindow(state, id, patch) {
  const target = state.windows.find((w) => w.id === id);
  if (!target) return state;
  const z = state.nextZ;
  const activeWorkspaceId = target.workspaceId !== state.activeWorkspaceId ? target.workspaceId : state.activeWorkspaceId;
  return bumpZ({
    ...state,
    activeWorkspaceId,
    windows: state.windows.map((w) => w.id === id ? {
      ...w,
      ...patch ?? {},
      z
    } : w),
    focusedId: id,
    nextZ: z + 1
  });
}
function bumpZ(state) {
  if (state.nextZ < Z_RENORMALIZE_AT) return state;
  const ordered = [...state.windows].sort((a, b) => a.z - b.z);
  const remapped = /* @__PURE__ */ new Map();
  ordered.forEach((w, i) => {
    remapped.set(w.id, i + 1);
  });
  return {
    ...state,
    windows: state.windows.map((w) => ({
      ...w,
      z: remapped.get(w.id) ?? w.z
    })),
    nextZ: ordered.length + 1
  };
}
function topVisibleId(windows, workspaceId) {
  let top = null;
  for (const w of windows) {
    if (w.workspaceId !== workspaceId) continue;
    if (w.state === "minimized") continue;
    if (top === null || w.z > top.z) top = w;
  }
  return top?.id ?? null;
}

// src/window-manager/context.tsx
var import_compiler_runtime = require("react/compiler-runtime");
var import_react = require("react");
var import_jsx_runtime = require("react/jsx-runtime");
var WindowManagerContext = (0, import_react.createContext)(null);
function WindowManagerProvider(t0) {
  const $ = (0, import_compiler_runtime.c)(5);
  const {
    children
  } = t0;
  const [state, dispatch] = (0, import_react.useReducer)(windowManagerReducer, initialWindowManagerState);
  let t1;
  if ($[0] !== state) {
    t1 = {
      state,
      dispatch
    };
    $[0] = state;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  const value = t1;
  let t2;
  if ($[2] !== children || $[3] !== value) {
    t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WindowManagerContext.Provider, { value, children });
    $[2] = children;
    $[3] = value;
    $[4] = t2;
  } else {
    t2 = $[4];
  }
  return t2;
}
function useWindowManager() {
  const $ = (0, import_compiler_runtime.c)(49);
  const ctx = (0, import_react.useContext)(WindowManagerContext);
  if (!ctx) {
    throw new Error("useWindowManager must be used within a WindowManagerProvider");
  }
  const {
    state,
    dispatch
  } = ctx;
  let t0;
  if ($[0] !== dispatch) {
    t0 = (payload, initialBounds) => {
      dispatch({
        type: "OPEN",
        payload,
        initialBounds
      });
    };
    $[0] = dispatch;
    $[1] = t0;
  } else {
    t0 = $[1];
  }
  const openWindow = t0;
  let t1;
  if ($[2] !== dispatch) {
    t1 = (id) => {
      dispatch({
        type: "CLOSE",
        id
      });
    };
    $[2] = dispatch;
    $[3] = t1;
  } else {
    t1 = $[3];
  }
  const closeWindow = t1;
  let t2;
  if ($[4] !== dispatch) {
    t2 = (id_0) => {
      dispatch({
        type: "FOCUS",
        id: id_0
      });
    };
    $[4] = dispatch;
    $[5] = t2;
  } else {
    t2 = $[5];
  }
  const focusWindow2 = t2;
  let t3;
  if ($[6] !== dispatch) {
    t3 = (id_1) => {
      dispatch({
        type: "MINIMIZE",
        id: id_1
      });
    };
    $[6] = dispatch;
    $[7] = t3;
  } else {
    t3 = $[7];
  }
  const minimizeWindow = t3;
  let t4;
  if ($[8] !== dispatch) {
    t4 = (id_2) => {
      dispatch({
        type: "RESTORE",
        id: id_2
      });
    };
    $[8] = dispatch;
    $[9] = t4;
  } else {
    t4 = $[9];
  }
  const restoreWindow = t4;
  let t5;
  if ($[10] !== dispatch) {
    t5 = (id_3) => {
      dispatch({
        type: "MAXIMIZE_TOGGLE",
        id: id_3
      });
    };
    $[10] = dispatch;
    $[11] = t5;
  } else {
    t5 = $[11];
  }
  const toggleMaximize = t5;
  let t6;
  if ($[12] !== dispatch) {
    t6 = (id_4, x, y) => {
      dispatch({
        type: "MOVE",
        id: id_4,
        x,
        y
      });
    };
    $[12] = dispatch;
    $[13] = t6;
  } else {
    t6 = $[13];
  }
  const moveWindow = t6;
  let t7;
  if ($[14] !== dispatch) {
    t7 = (id_5, w, h) => {
      dispatch({
        type: "RESIZE",
        id: id_5,
        w,
        h
      });
    };
    $[14] = dispatch;
    $[15] = t7;
  } else {
    t7 = $[15];
  }
  const resizeWindow = t7;
  let t8;
  if ($[16] !== dispatch) {
    t8 = (id_6, x_0, y_0, w_0, h_0) => {
      dispatch({
        type: "SET_BOUNDS",
        id: id_6,
        x: x_0,
        y: y_0,
        w: w_0,
        h: h_0
      });
    };
    $[16] = dispatch;
    $[17] = t8;
  } else {
    t8 = $[17];
  }
  const setBounds = t8;
  let t9;
  if ($[18] !== dispatch) {
    t9 = (workspaceId) => {
      dispatch({
        type: "SWITCH_WORKSPACE",
        workspaceId
      });
    };
    $[18] = dispatch;
    $[19] = t9;
  } else {
    t9 = $[19];
  }
  const switchWorkspace = t9;
  let t10;
  if ($[20] !== dispatch) {
    t10 = (id_7, workspaceId_0) => {
      dispatch({
        type: "MOVE_WINDOW_TO_WORKSPACE",
        id: id_7,
        workspaceId: workspaceId_0
      });
    };
    $[20] = dispatch;
    $[21] = t10;
  } else {
    t10 = $[21];
  }
  const moveWindowToWorkspace = t10;
  let t11;
  if ($[22] !== dispatch || $[23] !== state.workspaces) {
    t11 = (workspaceId_1) => {
      const id_8 = workspaceId_1 ?? String(state.workspaces.length === 0 ? 1 : Math.max(...state.workspaces.map(_temp)) + 1);
      dispatch({
        type: "ADD_WORKSPACE",
        workspaceId: id_8
      });
    };
    $[22] = dispatch;
    $[23] = state.workspaces;
    $[24] = t11;
  } else {
    t11 = $[24];
  }
  const addWorkspace = t11;
  let t12;
  if ($[25] !== dispatch) {
    t12 = (workspaceId_2) => {
      dispatch({
        type: "REMOVE_WORKSPACE",
        workspaceId: workspaceId_2
      });
    };
    $[25] = dispatch;
    $[26] = t12;
  } else {
    t12 = $[26];
  }
  const removeWorkspace = t12;
  let t13;
  if ($[27] !== state.focusedId || $[28] !== state.windows) {
    t13 = state.focusedId ? state.windows.find((w_2) => w_2.id === state.focusedId) ?? null : null;
    $[27] = state.focusedId;
    $[28] = state.windows;
    $[29] = t13;
  } else {
    t13 = $[29];
  }
  const focusedWindow = t13;
  let t14;
  if ($[30] !== state.windows) {
    t14 = (id_9) => state.windows.find((w_3) => w_3.id === id_9);
    $[30] = state.windows;
    $[31] = t14;
  } else {
    t14 = $[31];
  }
  const windowById = t14;
  let t15;
  if ($[32] !== addWorkspace || $[33] !== closeWindow || $[34] !== focusWindow2 || $[35] !== focusedWindow || $[36] !== minimizeWindow || $[37] !== moveWindow || $[38] !== moveWindowToWorkspace || $[39] !== openWindow || $[40] !== removeWorkspace || $[41] !== resizeWindow || $[42] !== restoreWindow || $[43] !== setBounds || $[44] !== state || $[45] !== switchWorkspace || $[46] !== toggleMaximize || $[47] !== windowById) {
    t15 = {
      state,
      windows: state.windows,
      focusedWindow,
      windowById,
      openWindow,
      closeWindow,
      focusWindow: focusWindow2,
      minimizeWindow,
      restoreWindow,
      toggleMaximize,
      moveWindow,
      resizeWindow,
      setBounds,
      switchWorkspace,
      moveWindowToWorkspace,
      addWorkspace,
      removeWorkspace
    };
    $[32] = addWorkspace;
    $[33] = closeWindow;
    $[34] = focusWindow2;
    $[35] = focusedWindow;
    $[36] = minimizeWindow;
    $[37] = moveWindow;
    $[38] = moveWindowToWorkspace;
    $[39] = openWindow;
    $[40] = removeWorkspace;
    $[41] = resizeWindow;
    $[42] = restoreWindow;
    $[43] = setBounds;
    $[44] = state;
    $[45] = switchWorkspace;
    $[46] = toggleMaximize;
    $[47] = windowById;
    $[48] = t15;
  } else {
    t15 = $[48];
  }
  return t15;
}
function _temp(w_1) {
  return Number.parseInt(w_1, 10) || 0;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  WindowManagerProvider,
  initialWindowManagerState,
  useWindowManager,
  windowIdOf,
  windowManagerReducer
});
//# sourceMappingURL=index.cjs.map