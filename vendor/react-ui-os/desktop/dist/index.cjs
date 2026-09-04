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

// src/index.ts
var src_exports = {};
__export(src_exports, {
  APP_SWITCHER_CYCLE_EVENT: () => APP_SWITCHER_CYCLE_EVENT,
  AppSwitcher: () => AppSwitcher,
  ContextMenu: () => ContextMenu,
  ContextMenuAnchor: () => ContextMenuAnchor,
  DOCK_HEIGHT: () => DOCK_HEIGHT,
  DOCK_WIDTH: () => DOCK_WIDTH,
  Desktop: () => Desktop,
  DesktopBackdrop: () => DesktopBackdrop,
  DesktopIcons: () => DesktopIcons,
  DesktopProvider: () => DesktopProvider,
  Dock: () => Dock,
  FileExplorer: () => FileExplorer,
  FolderSvg: () => FolderSvg,
  HudOverlay: () => HudOverlay,
  KEYBOARD_HELP_TOGGLE_EVENT: () => KEYBOARD_HELP_TOGGLE_EVENT,
  KeyboardHelp: () => KeyboardHelp,
  KeyboardShortcuts: () => KeyboardShortcuts,
  Launcher: () => Launcher,
  MENU_BAR_HEIGHT: () => MENU_BAR_HEIGHT,
  MISSION_CONTROL_TOGGLE_EVENT: () => MISSION_CONTROL_TOGGLE_EVENT,
  MenuBar: () => MenuBar,
  MissionControl: () => MissionControl,
  NOTIFICATION_CENTER_TOGGLE_EVENT: () => NOTIFICATION_CENTER_TOGGLE_EVENT,
  NotificationCenter: () => NotificationCenter,
  NotificationToasts: () => NotificationToasts,
  QUICK_SETTINGS_TOGGLE_EVENT: () => QUICK_SETTINGS_TOGGLE_EVENT,
  QuickSettings: () => QuickSettings,
  SHORTCUTS: () => SHORTCUTS,
  SPOTLIGHT_OPEN_EVENT: () => SPOTLIGHT_OPEN_EVENT,
  Settings: () => Settings,
  Slider: () => Slider,
  SnapPreview: () => SnapPreview,
  Spotlight: () => Launcher,
  Toggle: () => Toggle,
  Tooltip: () => Tooltip,
  Wallpaper: () => Wallpaper,
  Window: () => Window,
  WindowLayer: () => WindowLayer,
  chordOf: () => chordOf,
  closeContextMenu: () => closeContextMenu,
  computeSnapZone: () => computeSnapZone,
  countRecentsSources: () => countRecentsSources,
  findConflicts: () => findConflicts,
  formatChord: () => formatChord,
  getContextMenuState: () => getContextMenuState,
  getDockTileRect: () => getDockTileRect,
  getHud: () => getHud,
  getSnapPreview: () => getSnapPreview,
  getSystemWindow: () => getSystemWindow,
  hideHud: () => hideHud,
  listQuickSettings: () => listQuickSettings,
  listRecentItems: () => listRecentItems,
  listSpotlightSources: () => listSpotlightSources,
  listStatusItems: () => listStatusItems,
  listSystemWindows: () => listSystemWindows,
  nextCascadeIndex: () => nextCascadeIndex,
  openContextMenu: () => openContextMenu,
  pickInitialBounds: () => pickInitialBounds,
  rectForZone: () => rectForZone,
  registerQuickSetting: () => registerQuickSetting,
  registerRecentsSource: () => registerRecentsSource,
  registerSpotlightSource: () => registerSpotlightSource,
  registerStatusItem: () => registerStatusItem,
  registerSystemWindow: () => registerSystemWindow,
  requestSettingsSection: () => requestSettingsSection,
  resolveSystemWindowName: () => resolveSystemWindowName,
  setSnapPreview: () => setSnapPreview,
  showHud: () => showHud,
  subscribeContextMenu: () => subscribeContextMenu,
  subscribeHud: () => subscribeHud,
  subscribeQuickSettings: () => subscribeQuickSettings,
  subscribeRecentsSources: () => subscribeRecentsSources,
  subscribeSnapPreview: () => subscribeSnapPreview,
  subscribeSpotlightSources: () => subscribeSpotlightSources,
  subscribeStatusItems: () => subscribeStatusItems,
  systemWindows: () => systemWindows,
  unregisterQuickSetting: () => unregisterQuickSetting,
  unregisterStatusItem: () => unregisterStatusItem,
  useApp: () => useApp,
  useApps: () => useApps,
  useBaseTheme: () => useBaseTheme,
  useDesktopContext: () => useDesktopContext,
  useLauncher: () => useLauncher,
  useSettings: () => useSettings,
  useTheme: () => useTheme
});
module.exports = __toCommonJS(src_exports);

// src/Desktop.tsx
var import_compiler_runtime33 = require("react/compiler-runtime");

// src/DesktopProvider.tsx
var import_compiler_runtime3 = require("react/compiler-runtime");
var import_core2 = require("@react-ui-os/core");

// src/desktop-context.tsx
var import_compiler_runtime = require("react/compiler-runtime");
var import_react = require("react");
var import_core = require("@react-ui-os/core");
var import_jsx_runtime = require("react/jsx-runtime");
var DARK_QUERY = "(prefers-color-scheme: dark)";
function readSystemScheme() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return "light";
  }
  return window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
}
var DesktopContext = (0, import_react.createContext)(null);
function prefsKey(themeId) {
  return `settings:${themeId}`;
}
function readStoredPrefs(storage, themeId) {
  const raw = storage.get(prefsKey(themeId));
  return raw && typeof raw === "object" ? raw : {};
}
function DesktopContextProvider({
  apps,
  theme: baseTheme,
  storage: storageProp,
  children
}) {
  const storage = (0, import_react.useMemo)(() => storageProp ?? (0, import_core.createLocalStorageAdapter)(), [storageProp]);
  const [prefs, setPrefs] = (0, import_react.useState)(() => readStoredPrefs(storage, baseTheme.id));
  (0, import_react.useEffect)(() => {
    setPrefs(readStoredPrefs(storage, baseTheme.id));
  }, [storage, baseTheme.id]);
  (0, import_react.useEffect)(() => {
    const unsubscribe = storage.subscribe((key) => {
      if (key === prefsKey(baseTheme.id)) {
        setPrefs(readStoredPrefs(storage, baseTheme.id));
      }
    });
    return unsubscribe;
  }, [storage, baseTheme.id]);
  const writePrefs = (0, import_react.useCallback)((next) => {
    storage.set(prefsKey(baseTheme.id), next);
    setPrefs(next);
  }, [storage, baseTheme.id]);
  const setPref = (0, import_react.useCallback)((path, value) => {
    writePrefs({
      ...prefs,
      [path]: value
    });
  }, [prefs, writePrefs]);
  const resetPref = (0, import_react.useCallback)((path_0) => {
    const {
      [path_0]: _omit,
      ...rest
    } = prefs;
    writePrefs(rest);
  }, [prefs, writePrefs]);
  const resetAllPrefs = (0, import_react.useCallback)(() => {
    writePrefs({});
  }, [writePrefs]);
  const [systemScheme, setSystemScheme] = (0, import_react.useState)(readSystemScheme);
  (0, import_react.useEffect)(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }
    const mq = window.matchMedia(DARK_QUERY);
    const onChange = () => {
      setSystemScheme(mq.matches ? "dark" : "light");
    };
    mq.addEventListener("change", onChange);
    return () => {
      mq.removeEventListener("change", onChange);
    };
  }, []);
  const theme = (0, import_react.useMemo)(() => {
    const choice = prefs.appearance ?? baseTheme.appearance ?? "auto";
    const mode = choice === "auto" ? systemScheme : choice;
    return (0, import_core.applyPrefs)((0, import_core.applyAppearance)(baseTheme, mode), prefs);
  }, [baseTheme, prefs, systemScheme]);
  const value_0 = (0, import_react.useMemo)(() => {
    const appsById = /* @__PURE__ */ new Map();
    for (const app of apps) appsById.set(app.id, app);
    return {
      apps,
      appsById,
      baseTheme,
      theme,
      storage,
      prefs,
      setPref,
      resetPref,
      resetAllPrefs
    };
  }, [apps, baseTheme, theme, storage, prefs, setPref, resetPref, resetAllPrefs]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DesktopContext.Provider, { value: value_0, children });
}
function useDesktopContext() {
  const ctx = (0, import_react.useContext)(DesktopContext);
  if (!ctx) {
    throw new Error("useDesktopContext must be used inside <Desktop> or <DesktopProvider>");
  }
  return ctx;
}
function useTheme() {
  return useDesktopContext().theme;
}
function useBaseTheme() {
  return useDesktopContext().baseTheme;
}
function useApps() {
  return useDesktopContext().apps;
}
function useApp(appId) {
  const $ = (0, import_compiler_runtime.c)(3);
  const t0 = useDesktopContext();
  let t1;
  if ($[0] !== appId || $[1] !== t0.appsById) {
    t1 = t0.appsById.get(appId);
    $[0] = appId;
    $[1] = t0.appsById;
    $[2] = t1;
  } else {
    t1 = $[2];
  }
  return t1;
}
function useSettings() {
  const $ = (0, import_compiler_runtime.c)(8);
  const {
    baseTheme,
    prefs,
    setPref,
    resetPref,
    resetAllPrefs
  } = useDesktopContext();
  let t0;
  if ($[0] !== baseTheme.customizable) {
    t0 = baseTheme.customizable ?? {};
    $[0] = baseTheme.customizable;
    $[1] = t0;
  } else {
    t0 = $[1];
  }
  let t1;
  if ($[2] !== prefs || $[3] !== resetAllPrefs || $[4] !== resetPref || $[5] !== setPref || $[6] !== t0) {
    t1 = {
      schema: t0,
      prefs,
      setPref,
      resetPref,
      resetAll: resetAllPrefs
    };
    $[2] = prefs;
    $[3] = resetAllPrefs;
    $[4] = resetPref;
    $[5] = setPref;
    $[6] = t0;
    $[7] = t1;
  } else {
    t1 = $[7];
  }
  return t1;
}

// src/style-injector.tsx
var import_compiler_runtime2 = require("react/compiler-runtime");
var import_react2 = require("react");
function StyleInjector() {
  const $ = (0, import_compiler_runtime2.c)(1);
  let t0;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t0 = [];
    $[0] = t0;
  } else {
    t0 = $[0];
  }
  (0, import_react2.useEffect)(_temp, t0);
  return null;
}
function _temp() {
  if (document.getElementById("rui-desktop-keyframes")) {
    return;
  }
  const style = document.createElement("style");
  style.id = "rui-desktop-keyframes";
  style.textContent = "\n      @keyframes rui-window-open {\n        from { opacity: 0; scale: var(--rui-open-scale, 0.92); }\n        to   { opacity: 1; scale: 1; }\n      }\n      @keyframes rui-window-close {\n        from { opacity: 1; scale: 1; }\n        to   { opacity: 0; scale: var(--rui-open-scale, 0.92); }\n      }\n      @keyframes rui-window-genie {\n        from {\n          opacity: 1;\n          transform: translate3d(var(--genie-from-x, 0px), var(--genie-from-y, 0px), 0) scale(1);\n        }\n        to {\n          opacity: 0;\n          transform: translate3d(var(--genie-to-x, 0px), var(--genie-to-y, 0px), 0) scale(var(--genie-scale, 0.08));\n        }\n      }\n      @keyframes rui-window-genie-out {\n        from {\n          opacity: 0;\n          transform: translate3d(var(--genie-to-x, 0px), var(--genie-to-y, 0px), 0) scale(var(--genie-scale, 0.08));\n        }\n        to {\n          opacity: 1;\n          transform: translate3d(var(--genie-from-x, 0px), var(--genie-from-y, 0px), 0) scale(1);\n        }\n      }\n      @keyframes rui-wallpaper-in {\n        from { opacity: 0; }\n        to   { opacity: 1; }\n      }\n      @keyframes rui-fade-in {\n        from { opacity: 0; }\n        to   { opacity: 1; }\n      }\n      @keyframes rui-fade-out {\n        from { opacity: 1; }\n        to   { opacity: 0; }\n      }\n      @keyframes rui-context-menu-in {\n        from {\n          opacity: 0;\n          scale: var(--rui-ctx-scale, 1);\n          transform: translateY(var(--rui-ctx-ty, 0px));\n        }\n        to { opacity: 1; scale: 1; transform: translateY(0); }\n      }\n      @keyframes rui-surface-rise {\n        from {\n          opacity: 0;\n          transform: translate(var(--rui-rise-x, 0px), var(--rui-rise-y, 0px)) scale(0.98);\n        }\n        to { opacity: 1; transform: translate(0px, 0px) scale(1); }\n      }\n      @keyframes rui-surface-sink {\n        from { opacity: 1; transform: translate(0px, 0px) scale(1); }\n        to {\n          opacity: 0;\n          transform: translate(var(--rui-rise-x, 0px), var(--rui-rise-y, 0px)) scale(0.98);\n        }\n      }\n    ";
  document.head.appendChild(style);
}

// src/DesktopProvider.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
function DesktopProvider(t0) {
  const $ = (0, import_compiler_runtime3.c)(8);
  const {
    apps,
    theme,
    storage,
    children
  } = t0;
  let t1;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t1 = /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(StyleInjector, {});
    $[0] = t1;
  } else {
    t1 = $[0];
  }
  let t2;
  if ($[1] !== children) {
    t2 = /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.WindowManagerProvider, { children: [
      t1,
      children
    ] });
    $[1] = children;
    $[2] = t2;
  } else {
    t2 = $[2];
  }
  let t3;
  if ($[3] !== apps || $[4] !== storage || $[5] !== t2 || $[6] !== theme) {
    t3 = /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(DesktopContextProvider, { apps, theme, storage, children: t2 });
    $[3] = apps;
    $[4] = storage;
    $[5] = t2;
    $[6] = theme;
    $[7] = t3;
  } else {
    t3 = $[7];
  }
  return t3;
}

// src/Wallpaper.tsx
var import_compiler_runtime4 = require("react/compiler-runtime");
var import_react4 = require("react");

// src/util/use-reduced-motion.ts
var import_react3 = require("react");
var QUERY = "(prefers-reduced-motion: reduce)";
function supported() {
  return typeof window !== "undefined" && typeof window.matchMedia === "function";
}
function subscribe(onChange) {
  if (!supported()) return () => {
  };
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => {
    mq.removeEventListener("change", onChange);
  };
}
function getSnapshot() {
  return supported() ? window.matchMedia(QUERY).matches : false;
}
function getServerSnapshot() {
  return false;
}
function useReducedMotion() {
  return (0, import_react3.useSyncExternalStore)(subscribe, getSnapshot, getServerSnapshot);
}

// src/Wallpaper.tsx
var import_jsx_runtime3 = require("react/jsx-runtime");
var WALLPAPER_FADE_MS = 700;
var PARALLAX_AMPLITUDE_PX = 8;
var BASE_SCALE = 1.04;
var STIFFNESS = 100;
var DAMPING = 2 * Math.sqrt(STIFFNESS);
var MAX_STEP_S = 1 / 30;
function Wallpaper() {
  const $ = (0, import_compiler_runtime4.c)(29);
  const theme = useTheme();
  const {
    wallpaper,
    palette
  } = theme;
  const src = wallpaper.src;
  const stackRef = (0, import_react4.useRef)(null);
  let t0;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t0 = [];
    $[0] = t0;
  } else {
    t0 = $[0];
  }
  const [layers, setLayers] = (0, import_react4.useState)(t0);
  const idRef = (0, import_react4.useRef)(0);
  let t1;
  let t2;
  if ($[1] !== src) {
    t1 = () => {
      if (!src) {
        setLayers([]);
        return;
      }
      let cancelled = false;
      const reveal = () => {
        if (cancelled) {
          return;
        }
        setLayers((prev) => prev.length > 0 && prev[prev.length - 1]?.src === src ? prev : [...prev, {
          src,
          id: idRef.current = idRef.current + 1
        }]);
      };
      const img = document.createElement("img");
      img.setAttribute("fetchpriority", "high");
      img.src = src;
      img.decode().then(reveal, reveal);
      return () => {
        cancelled = true;
      };
    };
    t2 = [src];
    $[1] = src;
    $[2] = t1;
    $[3] = t2;
  } else {
    t1 = $[2];
    t2 = $[3];
  }
  (0, import_react4.useEffect)(t1, t2);
  let t3;
  if ($[4] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t3 = () => {
      setLayers(_temp2);
    };
    $[4] = t3;
  } else {
    t3 = $[4];
  }
  const handleFadeEnd = t3;
  const fadeMs = useReducedMotion() ? 0 : WALLPAPER_FADE_MS;
  let t4;
  let t5;
  if ($[5] !== wallpaper.parallax || $[6] !== wallpaper.src) {
    t4 = () => {
      if (!wallpaper.parallax || !wallpaper.src) {
        return;
      }
      if (typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }
      const el = stackRef.current;
      if (!el) {
        return;
      }
      let raf = 0;
      let last = 0;
      let targetX = 0;
      let targetY = 0;
      let x = 0;
      let y = 0;
      let vx = 0;
      let vy = 0;
      const render = () => {
        el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${String(BASE_SCALE)})`;
      };
      const tick = (now) => {
        const dt = last ? Math.min((now - last) / 1e3, MAX_STEP_S) : 0;
        last = now;
        vx = vx + (-STIFFNESS * (x - targetX) - DAMPING * vx) * dt;
        vx;
        vy = vy + (-STIFFNESS * (y - targetY) - DAMPING * vy) * dt;
        vy;
        x = x + vx * dt;
        x;
        y = y + vy * dt;
        y;
        render();
        const atRest = Math.abs(x - targetX) < 0.05 && Math.abs(y - targetY) < 0.05 && Math.abs(vx) < 2 && Math.abs(vy) < 2;
        if (atRest) {
          x = targetX;
          y = targetY;
          vx = 0;
          vy = 0;
          render();
          raf = 0;
          return;
        }
        raf = window.requestAnimationFrame(tick);
      };
      const wake = () => {
        if (raf) {
          return;
        }
        last = 0;
        raf = window.requestAnimationFrame(tick);
      };
      const onMove = (e) => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        targetX = -(e.clientX / w * 2 - 1) * PARALLAX_AMPLITUDE_PX;
        targetY = -(e.clientY / h * 2 - 1) * PARALLAX_AMPLITUDE_PX;
        wake();
      };
      const recenter = () => {
        targetX = 0;
        targetY = 0;
        wake();
      };
      window.addEventListener("pointermove", onMove);
      document.documentElement.addEventListener("pointerleave", recenter);
      window.addEventListener("blur", recenter);
      return () => {
        window.removeEventListener("pointermove", onMove);
        document.documentElement.removeEventListener("pointerleave", recenter);
        window.removeEventListener("blur", recenter);
        if (raf) {
          window.cancelAnimationFrame(raf);
        }
      };
    };
    t5 = [wallpaper.parallax, wallpaper.src];
    $[5] = wallpaper.parallax;
    $[6] = wallpaper.src;
    $[7] = t4;
    $[8] = t5;
  } else {
    t4 = $[7];
    t5 = $[8];
  }
  (0, import_react4.useEffect)(t4, t5);
  let t6;
  if ($[9] !== palette.background) {
    t6 = {
      position: "fixed",
      inset: 0,
      zIndex: 0,
      backgroundColor: palette.background,
      pointerEvents: "none",
      overflow: "hidden"
    };
    $[9] = palette.background;
    $[10] = t6;
  } else {
    t6 = $[10];
  }
  const t7 = wallpaper.parallax ? `scale(${String(BASE_SCALE)})` : "none";
  const t8 = wallpaper.parallax ? "transform" : void 0;
  let t9;
  if ($[11] !== t7 || $[12] !== t8) {
    t9 = {
      position: "absolute",
      inset: 0,
      transform: t7,
      willChange: t8
    };
    $[11] = t7;
    $[12] = t8;
    $[13] = t9;
  } else {
    t9 = $[13];
  }
  let t10;
  if ($[14] !== fadeMs || $[15] !== layers) {
    let t112;
    if ($[17] !== fadeMs || $[18] !== layers.length) {
      t112 = (layer, i) => {
        const top = i === layers.length - 1;
        return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { onAnimationEnd: top ? handleFadeEnd : void 0, style: {
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${layer.src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          animation: top ? `rui-wallpaper-in ${String(fadeMs)}ms ease both` : void 0
        } }, layer.id);
      };
      $[17] = fadeMs;
      $[18] = layers.length;
      $[19] = t112;
    } else {
      t112 = $[19];
    }
    t10 = layers.map(t112);
    $[14] = fadeMs;
    $[15] = layers;
    $[16] = t10;
  } else {
    t10 = $[16];
  }
  let t11;
  if ($[20] !== t10 || $[21] !== t9) {
    t11 = /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { ref: stackRef, style: t9, children: t10 });
    $[20] = t10;
    $[21] = t9;
    $[22] = t11;
  } else {
    t11 = $[22];
  }
  let t12;
  if ($[23] !== wallpaper.vignette) {
    t12 = wallpaper.vignette && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { style: {
      position: "absolute",
      inset: 0,
      background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.45) 100%)",
      pointerEvents: "none"
    } });
    $[23] = wallpaper.vignette;
    $[24] = t12;
  } else {
    t12 = $[24];
  }
  let t13;
  if ($[25] !== t11 || $[26] !== t12 || $[27] !== t6) {
    t13 = /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { "aria-hidden": true, style: t6, children: [
      t11,
      t12
    ] });
    $[25] = t11;
    $[26] = t12;
    $[27] = t6;
    $[28] = t13;
  } else {
    t13 = $[28];
  }
  return t13;
}
function _temp2(prev_0) {
  return prev_0.length > 1 ? prev_0.slice(-1) : prev_0;
}

// src/MenuBar.tsx
var import_compiler_runtime13 = require("react/compiler-runtime");
var import_react12 = require("react");
var import_core4 = require("@react-ui-os/core");

// src/context-menu/ContextMenu.tsx
var import_compiler_runtime5 = require("react/compiler-runtime");
var import_react5 = require("react");

// src/context-menu/store.ts
var active = null;
var listeners = /* @__PURE__ */ new Set();
function emit() {
  for (const listener of listeners) listener(active);
}
function openContextMenu(state) {
  active = state;
  emit();
}
function closeContextMenu() {
  if (!active) return;
  const returnTo = active.returnFocusTo;
  active = null;
  emit();
  if (returnTo) {
    try {
      returnTo.focus();
    } catch {
    }
  }
}
function getContextMenuState() {
  return active;
}
function subscribeContextMenu(listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// src/context-menu/ContextMenu.tsx
var import_jsx_runtime4 = require("react/jsx-runtime");
var MARGIN = 8;
var MENU_WIDTH = 220;
function menuItemId(index) {
  return `rui-context-menu-item-${String(index)}`;
}
function ContextMenu() {
  const $ = (0, import_compiler_runtime5.c)(5);
  const state = (0, import_react5.useSyncExternalStore)(subscribeContextMenu, getContextMenuState, _temp5);
  let t0;
  let t1;
  if ($[0] !== state) {
    t0 = () => {
      if (!state) {
        return;
      }
      const handleKey = _temp22;
      const handleScroll = _temp3;
      const handleBlur = _temp4;
      window.addEventListener("keydown", handleKey, true);
      window.addEventListener("scroll", handleScroll, true);
      window.addEventListener("resize", handleScroll);
      window.addEventListener("blur", handleBlur);
      return () => {
        window.removeEventListener("keydown", handleKey, true);
        window.removeEventListener("scroll", handleScroll, true);
        window.removeEventListener("resize", handleScroll);
        window.removeEventListener("blur", handleBlur);
      };
    };
    t1 = [state];
    $[0] = state;
    $[1] = t0;
    $[2] = t1;
  } else {
    t0 = $[1];
    t1 = $[2];
  }
  (0, import_react5.useEffect)(t0, t1);
  if (!state) {
    return null;
  }
  let t2;
  if ($[3] !== state) {
    t2 = /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Surface, { state });
    $[3] = state;
    $[4] = t2;
  } else {
    t2 = $[4];
  }
  return t2;
}
function _temp4() {
  return closeContextMenu();
}
function _temp3() {
  return closeContextMenu();
}
function _temp22(e) {
  if (e.key === "Escape") {
    e.preventDefault();
    closeContextMenu();
  }
}
function _temp5() {
  return null;
}
function Surface(t0) {
  const $ = (0, import_compiler_runtime5.c)(49);
  const {
    state
  } = t0;
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const menuRef = (0, import_react5.useRef)(null);
  let t1;
  if ($[0] !== state.x || $[1] !== state.y) {
    t1 = {
      x: state.x,
      y: state.y
    };
    $[0] = state.x;
    $[1] = state.y;
    $[2] = t1;
  } else {
    t1 = $[2];
  }
  const [position, setPosition] = (0, import_react5.useState)(t1);
  const items3 = state.items;
  const previousFocusRef = (0, import_react5.useRef)(null);
  let t2;
  let t3;
  if ($[3] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t2 = () => {
      previousFocusRef.current = typeof document !== "undefined" ? document.activeElement : null;
      menuRef.current?.focus();
      return () => {
        const prev = previousFocusRef.current;
        if (prev && typeof prev.focus === "function") {
          prev.focus();
        }
      };
    };
    t3 = [];
    $[3] = t2;
    $[4] = t3;
  } else {
    t2 = $[3];
    t3 = $[4];
  }
  (0, import_react5.useEffect)(t2, t3);
  let t4;
  if ($[5] !== state.x || $[6] !== state.y) {
    t4 = () => {
      const el = menuRef.current;
      if (!el) {
        return;
      }
      const rect = el.getBoundingClientRect();
      const viewportW = window.innerWidth;
      const viewportH = window.innerHeight;
      let x = state.x;
      let y = state.y;
      if (x + rect.width + MARGIN > viewportW) {
        x = Math.max(MARGIN, viewportW - rect.width - MARGIN);
      }
      if (y + rect.height + MARGIN > viewportH) {
        y = Math.max(MARGIN, viewportH - rect.height - MARGIN);
      }
      setPosition({
        x,
        y
      });
    };
    $[5] = state.x;
    $[6] = state.y;
    $[7] = t4;
  } else {
    t4 = $[7];
  }
  let t5;
  if ($[8] !== items3.length || $[9] !== state.x || $[10] !== state.y) {
    t5 = [state.x, state.y, items3.length];
    $[8] = items3.length;
    $[9] = state.x;
    $[10] = state.y;
    $[11] = t5;
  } else {
    t5 = $[11];
  }
  (0, import_react5.useLayoutEffect)(t4, t5);
  let t6;
  if ($[12] !== items3) {
    t6 = items3.map(_temp52).filter(_temp6);
    $[12] = items3;
    $[13] = t6;
  } else {
    t6 = $[13];
  }
  const navItems = t6;
  const [focusIdx, setFocusIdx] = (0, import_react5.useState)(navItems[0]?.idx ?? -1);
  let t7;
  let t8;
  if ($[14] !== focusIdx || $[15] !== items3 || $[16] !== navItems) {
    t7 = () => {
      if (navItems.length === 0) {
        return;
      }
      const handleKey = (e) => {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          const order = navItems.map(_temp7);
          const cur = order.indexOf(focusIdx);
          const next = order[(cur + 1) % order.length];
          if (next !== void 0) {
            setFocusIdx(next);
          }
        } else {
          if (e.key === "ArrowUp") {
            e.preventDefault();
            const order_0 = navItems.map(_temp8);
            const cur_0 = order_0.indexOf(focusIdx);
            const next_0 = order_0[(cur_0 - 1 + order_0.length) % order_0.length];
            if (next_0 !== void 0) {
              setFocusIdx(next_0);
            }
          } else {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              const item_1 = items3[focusIdx];
              if (item_1 && !item_1.disabled && !item_1.separator) {
                activate(item_1);
              }
            }
          }
        }
      };
      window.addEventListener("keydown", handleKey);
      return () => {
        window.removeEventListener("keydown", handleKey);
      };
    };
    t8 = [focusIdx, items3, navItems];
    $[14] = focusIdx;
    $[15] = items3;
    $[16] = navItems;
    $[17] = t7;
    $[18] = t8;
  } else {
    t7 = $[17];
    t8 = $[18];
  }
  (0, import_react5.useEffect)(t7, t8);
  const handleBackdrop = _temp9;
  const m = theme.motion;
  const ctxDurationMs = reducedMotion ? 0 : m.contextMenuDurationMs ?? 120;
  const flippedX = position.x < state.x;
  const flippedY = position.y < state.y;
  const ty = m.contextMenuTranslateY ?? 0;
  const t9 = position.y;
  const t10 = position.x;
  const t11 = theme.palette.surface;
  const t12 = theme.blur.surface;
  const t13 = theme.blur.surface;
  const t14 = `1px solid ${theme.palette.border}`;
  const t15 = theme.shape.small + 4;
  const t16 = theme.elevation?.windowUnfocused ?? "0 14px 36px -10px rgba(0,0,0,0.55)";
  const t17 = theme.palette.textPrimary;
  const t18 = `${flippedX ? "right" : "left"} ${flippedY ? "bottom" : "top"}`;
  const t19 = `rui-context-menu-in ${String(ctxDurationMs)}ms ${m.contextMenuEasing ?? m.windowOpenEasing} both`;
  const t20 = String(m.contextMenuScale ?? 1);
  const t21 = `${String(flippedY ? ty : -ty)}px`;
  let t22;
  if ($[19] !== position.x || $[20] !== position.y || $[21] !== t14 || $[22] !== t15 || $[23] !== t16 || $[24] !== t18 || $[25] !== t19 || $[26] !== t20 || $[27] !== t21 || $[28] !== theme.blur.surface || $[29] !== theme.palette.surface || $[30] !== theme.palette.textPrimary) {
    t22 = {
      position: "fixed",
      top: t9,
      left: t10,
      minWidth: MENU_WIDTH,
      background: t11,
      backdropFilter: t12,
      WebkitBackdropFilter: t13,
      border: t14,
      borderRadius: t15,
      boxShadow: t16,
      padding: 4,
      zIndex: 1400,
      color: t17,
      fontSize: 12,
      fontFamily: "inherit",
      transformOrigin: t18,
      animation: t19,
      "--rui-ctx-scale": t20,
      "--rui-ctx-ty": t21
    };
    $[19] = position.x;
    $[20] = position.y;
    $[21] = t14;
    $[22] = t15;
    $[23] = t16;
    $[24] = t18;
    $[25] = t19;
    $[26] = t20;
    $[27] = t21;
    $[28] = theme.blur.surface;
    $[29] = theme.palette.surface;
    $[30] = theme.palette.textPrimary;
    $[31] = t22;
  } else {
    t22 = $[31];
  }
  const surface = t22;
  let t23;
  if ($[32] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t23 = {
      position: "fixed",
      inset: 0,
      zIndex: 1390
    };
    $[32] = t23;
  } else {
    t23 = $[32];
  }
  const t24 = state.ariaLabel ?? "Context menu";
  let t25;
  if ($[33] !== focusIdx) {
    t25 = focusIdx >= 0 ? menuItemId(focusIdx) : void 0;
    $[33] = focusIdx;
    $[34] = t25;
  } else {
    t25 = $[34];
  }
  let t26;
  if ($[35] !== surface) {
    t26 = {
      ...surface,
      outline: "none"
    };
    $[35] = surface;
    $[36] = t26;
  } else {
    t26 = $[36];
  }
  let t27;
  if ($[37] !== focusIdx || $[38] !== items3 || $[39] !== theme.palette.border) {
    let t282;
    if ($[41] !== focusIdx || $[42] !== theme.palette.border) {
      t282 = (item_2, idx_0) => {
        if (item_2.separator) {
          return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { role: "separator", style: {
            height: 1,
            background: theme.palette.border,
            margin: "4px 0"
          } }, `sep-${String(idx_0)}`);
        }
        const focused = idx_0 === focusIdx;
        return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Row, { id: menuItemId(idx_0), item: item_2, focused, onFocus: () => setFocusIdx(idx_0) }, `${item_2.label ?? "item"}-${String(idx_0)}`);
      };
      $[41] = focusIdx;
      $[42] = theme.palette.border;
      $[43] = t282;
    } else {
      t282 = $[43];
    }
    t27 = items3.map(t282);
    $[37] = focusIdx;
    $[38] = items3;
    $[39] = theme.palette.border;
    $[40] = t27;
  } else {
    t27 = $[40];
  }
  let t28;
  if ($[44] !== t24 || $[45] !== t25 || $[46] !== t26 || $[47] !== t27) {
    t28 = /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { role: "presentation", onClick: handleBackdrop, onContextMenu: _temp0, style: t23, children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { ref: menuRef, role: "menu", tabIndex: -1, "aria-label": t24, "aria-activedescendant": t25, style: t26, children: t27 }) });
    $[44] = t24;
    $[45] = t25;
    $[46] = t26;
    $[47] = t27;
    $[48] = t28;
  } else {
    t28 = $[48];
  }
  return t28;
}
function _temp0(e_1) {
  e_1.preventDefault();
  closeContextMenu();
}
function _temp9(e_0) {
  if (e_0.target === e_0.currentTarget) {
    closeContextMenu();
  }
}
function _temp8(row_0) {
  return row_0.idx;
}
function _temp7(row) {
  return row.idx;
}
function _temp6(t0) {
  const {
    item: item_0
  } = t0;
  return !item_0.separator && !item_0.disabled;
}
function _temp52(item, idx) {
  return {
    item,
    idx
  };
}
function Row(t0) {
  const $ = (0, import_compiler_runtime5.c)(24);
  const {
    id,
    item,
    focused,
    onFocus
  } = t0;
  const theme = useTheme();
  const danger = item.danger;
  const baseColor = item.disabled ? theme.palette.textSecondary : danger ? "#ef4444" : theme.palette.textPrimary;
  const bg = focused ? theme.palette.border : "transparent";
  let t1;
  if ($[0] !== item) {
    t1 = () => activate(item);
    $[0] = item;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  const t2 = item.disabled ? "not-allowed" : "pointer";
  const t3 = item.disabled ? 0.55 : 1;
  let t4;
  if ($[2] !== baseColor || $[3] !== bg || $[4] !== t2 || $[5] !== t3) {
    t4 = {
      appearance: "none",
      background: bg,
      border: 0,
      color: baseColor,
      padding: "5px 10px",
      borderRadius: 4,
      width: "100%",
      textAlign: "left",
      cursor: t2,
      fontSize: 12,
      fontFamily: "inherit",
      display: "flex",
      alignItems: "center",
      gap: 8,
      opacity: t3
    };
    $[2] = baseColor;
    $[3] = bg;
    $[4] = t2;
    $[5] = t3;
    $[6] = t4;
  } else {
    t4 = $[6];
  }
  let t5;
  if ($[7] !== item.icon) {
    t5 = item.icon && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { "aria-hidden": true, style: {
      width: 14,
      display: "inline-flex"
    }, children: item.icon });
    $[7] = item.icon;
    $[8] = t5;
  } else {
    t5 = $[8];
  }
  let t6;
  if ($[9] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t6 = {
      flex: 1,
      whiteSpace: "nowrap"
    };
    $[9] = t6;
  } else {
    t6 = $[9];
  }
  let t7;
  if ($[10] !== item.label) {
    t7 = /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: t6, children: item.label });
    $[10] = item.label;
    $[11] = t7;
  } else {
    t7 = $[11];
  }
  let t8;
  if ($[12] !== item.shortcut || $[13] !== theme) {
    t8 = item.shortcut && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: {
      color: theme.palette.textSecondary,
      fontVariantNumeric: "tabular-nums",
      fontSize: 11,
      marginLeft: 12
    }, children: item.shortcut });
    $[12] = item.shortcut;
    $[13] = theme;
    $[14] = t8;
  } else {
    t8 = $[14];
  }
  let t9;
  if ($[15] !== id || $[16] !== item.disabled || $[17] !== onFocus || $[18] !== t1 || $[19] !== t4 || $[20] !== t5 || $[21] !== t7 || $[22] !== t8) {
    t9 = /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("button", { type: "button", id, role: "menuitem", tabIndex: -1, disabled: item.disabled, onMouseEnter: onFocus, onClick: t1, style: t4, children: [
      t5,
      t7,
      t8
    ] });
    $[15] = id;
    $[16] = item.disabled;
    $[17] = onFocus;
    $[18] = t1;
    $[19] = t4;
    $[20] = t5;
    $[21] = t7;
    $[22] = t8;
    $[23] = t9;
  } else {
    t9 = $[23];
  }
  return t9;
}
function activate(item) {
  if (item.disabled || item.separator) return;
  item.onSelect?.();
  closeContextMenu();
}

// src/context-menu/ContextMenuAnchor.tsx
var import_compiler_runtime6 = require("react/compiler-runtime");
var import_react6 = require("react");
var import_jsx_runtime5 = require("react/jsx-runtime");
function ContextMenuAnchor(t0) {
  const $ = (0, import_compiler_runtime6.c)(7);
  const {
    items: items3,
    ariaLabel,
    children
  } = t0;
  let t1;
  let t2;
  if ($[0] !== ariaLabel || $[1] !== children || $[2] !== items3) {
    t2 = /* @__PURE__ */ Symbol.for("react.early_return_sentinel");
    bb0: {
      const child = import_react6.Children.only(children);
      if (!(0, import_react6.isValidElement)(child)) {
        let t3;
        if ($[5] !== children) {
          t3 = /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_jsx_runtime5.Fragment, { children });
          $[5] = children;
          $[6] = t3;
        } else {
          t3 = $[6];
        }
        t2 = t3;
        break bb0;
      }
      const existing = child.props.onContextMenu;
      const handler = (e) => {
        existing?.(e);
        if (e.defaultPrevented) {
          return;
        }
        e.preventDefault();
        const resolved = typeof items3 === "function" ? items3() : items3;
        if (resolved.length === 0) {
          return;
        }
        openContextMenu({
          x: e.clientX,
          y: e.clientY,
          items: resolved,
          ariaLabel,
          returnFocusTo: e.currentTarget instanceof HTMLElement ? e.currentTarget : null
        });
      };
      t1 = (0, import_react6.cloneElement)(child, {
        onContextMenu: handler
      });
    }
    $[0] = ariaLabel;
    $[1] = children;
    $[2] = items3;
    $[3] = t1;
    $[4] = t2;
  } else {
    t1 = $[3];
    t2 = $[4];
  }
  if (t2 !== /* @__PURE__ */ Symbol.for("react.early_return_sentinel")) {
    return t2;
  }
  return t1;
}

// src/events.ts
var SPOTLIGHT_OPEN_EVENT = "react-ui-os:spotlight-open";
var NOTIFICATION_CENTER_TOGGLE_EVENT = "react-ui-os:notification-center-toggle";
var QUICK_SETTINGS_TOGGLE_EVENT = "react-ui-os:quick-settings-toggle";
var MISSION_CONTROL_TOGGLE_EVENT = "react-ui-os:mission-control-toggle";
var KEYBOARD_HELP_TOGGLE_EVENT = "react-ui-os:keyboard-help-toggle";
var APP_SWITCHER_CYCLE_EVENT = "react-ui-os:app-switcher-cycle";

// src/Settings.tsx
var import_compiler_runtime9 = require("react/compiler-runtime");
var import_react9 = require("react");
var import_core3 = require("@react-ui-os/core");

// src/settings-nav.ts
var requested = null;
var counter = 0;
var listeners2 = /* @__PURE__ */ new Set();
function requestSettingsSection(section) {
  counter += 1;
  requested = {
    section,
    nonce: counter
  };
  listeners2.forEach((l) => {
    l();
  });
}
function getRequestedSection() {
  return requested;
}
function subscribeSettingsNav(listener) {
  listeners2.add(listener);
  return () => {
    listeners2.delete(listener);
  };
}

// src/primitives/Slider.tsx
var import_compiler_runtime7 = require("react/compiler-runtime");
var import_react7 = require("react");
var import_jsx_runtime6 = require("react/jsx-runtime");
function Slider(t0) {
  const $ = (0, import_compiler_runtime7.c)(40);
  const {
    value,
    min,
    max,
    step: t1,
    onChange,
    label,
    unit,
    accent,
    hideValue: t2,
    disabled: t3,
    ariaLabel
  } = t0;
  const step = t1 === void 0 ? 1 : t1;
  const hideValue = t2 === void 0 ? false : t2;
  const disabled = t3 === void 0 ? false : t3;
  const theme = useTheme();
  const accentColor = accent ?? theme.palette.accent;
  const inputRef = (0, import_react7.useRef)(null);
  const pct = max > min ? (value - min) / (max - min) * 100 : 0;
  const trackBg = `linear-gradient(to right, ${accentColor} 0%, ${accentColor} ${String(pct)}%, ${theme.palette.border} ${String(pct)}%, ${theme.palette.border} 100%)`;
  const t4 = disabled ? 0.5 : 1;
  let t5;
  if ($[0] !== t4) {
    t5 = {
      display: "flex",
      flexDirection: "column",
      gap: 4,
      opacity: t4
    };
    $[0] = t4;
    $[1] = t5;
  } else {
    t5 = $[1];
  }
  const containerStyle = t5;
  let t6;
  if ($[2] !== theme.palette.textSecondary) {
    t6 = {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline",
      fontSize: 12,
      color: theme.palette.textSecondary,
      fontVariantNumeric: "tabular-nums"
    };
    $[2] = theme.palette.textSecondary;
    $[3] = t6;
  } else {
    t6 = $[3];
  }
  const headerStyle = t6;
  let t7;
  if ($[4] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t7 = {
      position: "relative",
      height: 16,
      display: "flex",
      alignItems: "center"
    };
    $[4] = t7;
  } else {
    t7 = $[4];
  }
  const wrapperStyle = t7;
  let t8;
  if ($[5] !== trackBg) {
    t8 = {
      position: "absolute",
      inset: `${String(Math.floor(6))}px 0`,
      borderRadius: 4,
      background: trackBg,
      pointerEvents: "none"
    };
    $[5] = trackBg;
    $[6] = t8;
  } else {
    t8 = $[6];
  }
  const trackStyle = t8;
  const t9 = disabled ? "not-allowed" : "pointer";
  let t10;
  if ($[7] !== t9) {
    t10 = {
      appearance: "none",
      WebkitAppearance: "none",
      width: "100%",
      height: 16,
      background: "transparent",
      margin: 0,
      padding: 0,
      cursor: t9,
      position: "relative",
      zIndex: 1
    };
    $[7] = t9;
    $[8] = t10;
  } else {
    t10 = $[8];
  }
  const inputStyle = t10;
  let t11;
  if ($[9] !== headerStyle || $[10] !== hideValue || $[11] !== label || $[12] !== theme.palette.textPrimary || $[13] !== unit || $[14] !== value) {
    t11 = (label || !hideValue) && /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: headerStyle, children: [
      label ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: {
        color: theme.palette.textPrimary
      }, children: label }) : /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", {}),
      !hideValue && /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { children: [
        String(value),
        unit ? ` ${unit}` : ""
      ] })
    ] });
    $[9] = headerStyle;
    $[10] = hideValue;
    $[11] = label;
    $[12] = theme.palette.textPrimary;
    $[13] = unit;
    $[14] = value;
    $[15] = t11;
  } else {
    t11 = $[15];
  }
  let t12;
  if ($[16] !== trackStyle) {
    t12 = /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: trackStyle, "aria-hidden": true });
    $[16] = trackStyle;
    $[17] = t12;
  } else {
    t12 = $[17];
  }
  let t13;
  if ($[18] !== onChange) {
    t13 = (e) => {
      onChange(Number(e.target.value));
    };
    $[18] = onChange;
    $[19] = t13;
  } else {
    t13 = $[19];
  }
  const t14 = ariaLabel ?? label;
  const t15 = `${String(value)}${unit ? ` ${unit}` : ""}`;
  let t16;
  if ($[20] !== disabled || $[21] !== inputStyle || $[22] !== max || $[23] !== min || $[24] !== step || $[25] !== t13 || $[26] !== t14 || $[27] !== t15 || $[28] !== value) {
    t16 = /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("input", { ref: inputRef, type: "range", value, min, max, step, disabled, onChange: t13, "aria-label": t14, "aria-valuetext": t15, style: inputStyle, className: "rui-slider-input" });
    $[20] = disabled;
    $[21] = inputStyle;
    $[22] = max;
    $[23] = min;
    $[24] = step;
    $[25] = t13;
    $[26] = t14;
    $[27] = t15;
    $[28] = value;
    $[29] = t16;
  } else {
    t16 = $[29];
  }
  let t17;
  if ($[30] !== t12 || $[31] !== t16) {
    t17 = /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: wrapperStyle, children: [
      t12,
      t16
    ] });
    $[30] = t12;
    $[31] = t16;
    $[32] = t17;
  } else {
    t17 = $[32];
  }
  const t18 = `
          .rui-slider-input::-webkit-slider-runnable-track {
            height: ${String(4)}px;
            background: transparent;
            border-radius: ${String(4)}px;
          }
          .rui-slider-input::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: ${String(16)}px;
            height: ${String(16)}px;
            border-radius: 50%;
            background: #fff;
            border: 1px solid rgba(0,0,0,0.15);
            box-shadow: 0 1px 3px rgba(0,0,0,0.35);
            margin-top: ${String(-6)}px;
            cursor: ${disabled ? "not-allowed" : "pointer"};
            transition: transform 100ms ease;
          }
          .rui-slider-input:active::-webkit-slider-thumb {
            transform: scale(1.1);
          }
          .rui-slider-input::-moz-range-track {
            height: ${String(4)}px;
            background: transparent;
          }
          .rui-slider-input::-moz-range-thumb {
            width: ${String(14)}px;
            height: ${String(14)}px;
            border-radius: 50%;
            background: #fff;
            border: 1px solid rgba(0,0,0,0.15);
            box-shadow: 0 1px 3px rgba(0,0,0,0.35);
            cursor: ${disabled ? "not-allowed" : "pointer"};
          }
          .rui-slider-input:focus-visible::-webkit-slider-thumb {
            box-shadow: 0 0 0 3px ${accentColor}66, 0 1px 3px rgba(0,0,0,0.35);
          }
          .rui-slider-input:focus-visible::-moz-range-thumb {
            box-shadow: 0 0 0 3px ${accentColor}66, 0 1px 3px rgba(0,0,0,0.35);
          }
        `;
  let t19;
  if ($[33] !== t18) {
    t19 = /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("style", { children: t18 });
    $[33] = t18;
    $[34] = t19;
  } else {
    t19 = $[34];
  }
  let t20;
  if ($[35] !== containerStyle || $[36] !== t11 || $[37] !== t17 || $[38] !== t19) {
    t20 = /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: containerStyle, children: [
      t11,
      t17,
      t19
    ] });
    $[35] = containerStyle;
    $[36] = t11;
    $[37] = t17;
    $[38] = t19;
    $[39] = t20;
  } else {
    t20 = $[39];
  }
  return t20;
}

// src/primitives/Toggle.tsx
var import_compiler_runtime8 = require("react/compiler-runtime");
var import_jsx_runtime7 = require("react/jsx-runtime");
function Toggle(t0) {
  const $ = (0, import_compiler_runtime8.c)(29);
  const {
    checked,
    onChange,
    label,
    description,
    accent,
    disabled: t1,
    ariaLabel
  } = t0;
  const disabled = t1 === void 0 ? false : t1;
  const theme = useTheme();
  const accentColor = accent ?? theme.palette.accent;
  const t2 = disabled ? 0.55 : 1;
  let t3;
  if ($[0] !== t2) {
    t3 = {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      opacity: t2
    };
    $[0] = t2;
    $[1] = t3;
  } else {
    t3 = $[1];
  }
  const rowStyle = t3;
  let t4;
  if ($[2] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t4 = {
      display: "flex",
      flexDirection: "column",
      gap: 2,
      minWidth: 0
    };
    $[2] = t4;
  } else {
    t4 = $[2];
  }
  const labelBlockStyle = t4;
  const t5 = `1px solid ${checked ? accentColor : theme.palette.border}`;
  const t6 = checked ? accentColor : theme.palette.border;
  const t7 = disabled ? "not-allowed" : "pointer";
  let t8;
  if ($[3] !== t5 || $[4] !== t6 || $[5] !== t7) {
    t8 = {
      appearance: "none",
      position: "relative",
      width: 34,
      height: 20,
      borderRadius: 999,
      border: t5,
      background: t6,
      cursor: t7,
      padding: 0,
      transition: "background 140ms ease, border-color 140ms ease",
      flexShrink: 0
    };
    $[3] = t5;
    $[4] = t6;
    $[5] = t7;
    $[6] = t8;
  } else {
    t8 = $[6];
  }
  const switchStyle = t8;
  const t9 = checked ? 15 : 1;
  let t10;
  if ($[7] !== t9) {
    t10 = {
      position: "absolute",
      top: 1,
      left: t9,
      width: 16,
      height: 16,
      borderRadius: "50%",
      background: "#fff",
      boxShadow: "0 1px 3px rgba(0,0,0,0.35)",
      transition: "left 140ms cubic-bezier(0.2, 0.85, 0.25, 1)"
    };
    $[7] = t9;
    $[8] = t10;
  } else {
    t10 = $[8];
  }
  const thumbStyle = t10;
  let t11;
  if ($[9] !== description || $[10] !== label || $[11] !== theme) {
    t11 = (label || description) && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { style: labelBlockStyle, children: [
      label && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { style: {
        fontSize: 12,
        fontWeight: 500,
        color: theme.palette.textPrimary
      }, children: label }),
      description && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { style: {
        fontSize: 11,
        color: theme.palette.textSecondary
      }, children: description })
    ] });
    $[9] = description;
    $[10] = label;
    $[11] = theme;
    $[12] = t11;
  } else {
    t11 = $[12];
  }
  const t12 = ariaLabel ?? label;
  let t13;
  if ($[13] !== checked || $[14] !== onChange) {
    t13 = () => onChange(!checked);
    $[13] = checked;
    $[14] = onChange;
    $[15] = t13;
  } else {
    t13 = $[15];
  }
  let t14;
  if ($[16] !== thumbStyle) {
    t14 = /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { "aria-hidden": true, style: thumbStyle });
    $[16] = thumbStyle;
    $[17] = t14;
  } else {
    t14 = $[17];
  }
  let t15;
  if ($[18] !== checked || $[19] !== disabled || $[20] !== switchStyle || $[21] !== t12 || $[22] !== t13 || $[23] !== t14) {
    t15 = /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("button", { type: "button", role: "switch", "aria-checked": checked, "aria-label": t12, disabled, onClick: t13, style: switchStyle, children: t14 });
    $[18] = checked;
    $[19] = disabled;
    $[20] = switchStyle;
    $[21] = t12;
    $[22] = t13;
    $[23] = t14;
    $[24] = t15;
  } else {
    t15 = $[24];
  }
  let t16;
  if ($[25] !== rowStyle || $[26] !== t11 || $[27] !== t15) {
    t16 = /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { style: rowStyle, children: [
      t11,
      t15
    ] });
    $[25] = rowStyle;
    $[26] = t11;
    $[27] = t15;
    $[28] = t16;
  } else {
    t16 = $[28];
  }
  return t16;
}

// src/util/use-isomorphic-layout-effect.ts
var import_react8 = require("react");
var useIsomorphicLayoutEffect = typeof window === "undefined" ? import_react8.useEffect : import_react8.useLayoutEffect;

// src/util/roving.ts
function rovingTarget(key, index, count, orientation) {
  if (count <= 0) return -1;
  const forward = orientation !== "vertical" && key === "ArrowRight" || orientation !== "horizontal" && key === "ArrowDown";
  const back = orientation !== "vertical" && key === "ArrowLeft" || orientation !== "horizontal" && key === "ArrowUp";
  if (forward) return (index + 1) % count;
  if (back) return (index - 1 + count) % count;
  if (key === "Home") return 0;
  if (key === "End") return count - 1;
  return -1;
}

// src/Settings.tsx
var import_jsx_runtime8 = require("react/jsx-runtime");
var NARROW_WIDTH = 480;
function focusSibling(from, i) {
  const buttons = from.parentElement?.querySelectorAll("button");
  buttons?.[i]?.focus();
}
function Settings() {
  const theme = useTheme();
  const {
    schema,
    prefs,
    setPref,
    resetPref,
    resetAll
  } = useSettings();
  const sections = /* @__PURE__ */ new Map();
  for (const [path, field] of Object.entries(schema)) {
    const section = field.section ?? "General";
    const arr = sections.get(section) ?? [];
    arr.push([path, field]);
    sections.set(section, arr);
  }
  const grouped2 = Array.from(sections.entries());
  const hasPrefs = Object.keys(prefs).length > 0;
  const sectionNames = grouped2.map(([name]) => name);
  const [active4, setActive] = (0, import_react9.useState)(() => {
    const req = getRequestedSection();
    return req && sectionNames.includes(req.section) ? req.section : grouped2[0]?.[0] ?? "";
  });
  const [query, setQuery] = (0, import_react9.useState)("");
  const appliedNonceRef = (0, import_react9.useRef)(getRequestedSection()?.nonce ?? 0);
  const sectionNamesRef = (0, import_react9.useRef)(sectionNames);
  sectionNamesRef.current = sectionNames;
  (0, import_react9.useEffect)(() => {
    return subscribeSettingsNav(() => {
      const req_0 = getRequestedSection();
      if (req_0 && req_0.nonce > appliedNonceRef.current && sectionNamesRef.current.includes(req_0.section)) {
        appliedNonceRef.current = req_0.nonce;
        setActive(req_0.section);
        setQuery("");
      }
    });
  }, []);
  const rootRef = (0, import_react9.useRef)(null);
  const [width, setWidth] = (0, import_react9.useState)(0);
  useIsomorphicLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    setWidth(el.getBoundingClientRect().width);
    if (typeof window === "undefined" || typeof window.ResizeObserver === "undefined") {
      return;
    }
    const observer = new window.ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (typeof w === "number") setWidth(w);
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, []);
  const narrow = width > 0 && width < NARROW_WIDTH;
  if (grouped2.length === 0) {
    return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { style: {
      fontSize: 13,
      color: theme.palette.textSecondary,
      margin: 0
    }, children: "The active theme exposes no customizable settings." });
  }
  const activeEntry = grouped2.find(([name_0]) => name_0 === active4) ?? grouped2[0] ?? ["", []];
  const [activeName, activeFields] = activeEntry;
  const categories = grouped2.map(([name_1]) => name_1);
  const q = query.trim().toLowerCase();
  const searching = q.length > 0;
  const matches = searching ? grouped2.map(([name_2, fields]) => [name_2, fields.filter(([, field_0]) => field_0.label.toLowerCase().includes(q) || (field_0.description?.toLowerCase().includes(q) ?? false) || name_2.toLowerCase().includes(q))]).filter(([, fields_0]) => fields_0.length > 0) : [];
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { ref: rootRef, style: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
    color: theme.palette.textPrimary,
    minHeight: 300
  }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(SearchField, { value: query, onChange: setQuery }),
    searching ? matches.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("p", { style: {
      fontSize: 13,
      color: theme.palette.textSecondary,
      margin: "4px 2px"
    }, children: [
      "No settings match ",
      `"${query}"`,
      "."
    ] }) : /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { style: {
      display: "flex",
      flexDirection: "column",
      gap: 18
    }, children: matches.map(([name_3, fields_1]) => /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("section", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("h3", { style: {
        margin: "0 0 10px",
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: 0.3,
        textTransform: "uppercase",
        color: theme.palette.textSecondary
      }, children: name_3 }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(FieldCard, { fields: fields_1, prefs, narrow, onSet: setPref, onReset: resetPref })
    ] }, name_3)) }) : /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: {
      display: "flex",
      flexDirection: narrow ? "column" : "row",
      gap: narrow ? 12 : 18
    }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(CategoryNav, { categories, activeName, onSelect: setActive, layout: narrow ? "bar" : "sidebar" }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: {
        flex: 1,
        minWidth: 0
      }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("header", { style: {
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 12,
          margin: "0 0 12px"
        }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("h2", { style: {
            margin: 0,
            fontSize: 16
          }, children: activeName }),
          hasPrefs && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("button", { type: "button", onClick: resetAll, style: {
            border: 0,
            background: "transparent",
            color: theme.palette.textSecondary,
            fontSize: 12,
            padding: 0,
            cursor: "pointer",
            fontFamily: "inherit",
            flexShrink: 0
          }, children: "Reset all" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(FieldCard, { fields: activeFields, prefs, narrow, onSet: setPref, onReset: resetPref })
      ] })
    ] })
  ] });
}
function SearchField(t0) {
  const $ = (0, import_compiler_runtime9.c)(31);
  const {
    value,
    onChange
  } = t0;
  const theme = useTheme();
  let t1;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t1 = {
      position: "relative"
    };
    $[0] = t1;
  } else {
    t1 = $[0];
  }
  let t2;
  if ($[1] !== theme.palette.textSecondary) {
    t2 = {
      position: "absolute",
      left: 10,
      top: "50%",
      transform: "translateY(-50%)",
      pointerEvents: "none",
      color: theme.palette.textSecondary
    };
    $[1] = theme.palette.textSecondary;
    $[2] = t2;
  } else {
    t2 = $[2];
  }
  let t3;
  let t4;
  if ($[3] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t3 = /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("circle", { cx: "7", cy: "7", r: "4.5", fill: "none", stroke: "currentColor", strokeWidth: "1.5" });
    t4 = /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("line", { x1: "10.5", y1: "10.5", x2: "14", y2: "14", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" });
    $[3] = t3;
    $[4] = t4;
  } else {
    t3 = $[3];
    t4 = $[4];
  }
  let t5;
  if ($[5] !== t2) {
    t5 = /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("svg", { width: "14", height: "14", viewBox: "0 0 16 16", "aria-hidden": true, style: t2, children: [
      t3,
      t4
    ] });
    $[5] = t2;
    $[6] = t5;
  } else {
    t5 = $[6];
  }
  let t6;
  if ($[7] !== onChange) {
    t6 = (e) => {
      onChange(e.target.value);
    };
    $[7] = onChange;
    $[8] = t6;
  } else {
    t6 = $[8];
  }
  let t7;
  if ($[9] !== onChange || $[10] !== value) {
    t7 = (e_0) => {
      if (e_0.key === "Escape" && value) {
        e_0.stopPropagation();
        onChange("");
      }
    };
    $[9] = onChange;
    $[10] = value;
    $[11] = t7;
  } else {
    t7 = $[11];
  }
  const t8 = `1px solid ${theme.palette.border}`;
  const t9 = `${theme.palette.textPrimary}0d`;
  let t10;
  if ($[12] !== t8 || $[13] !== t9 || $[14] !== theme.palette.textPrimary || $[15] !== theme.shape.small) {
    t10 = {
      width: "100%",
      boxSizing: "border-box",
      padding: "8px 12px 8px 32px",
      border: t8,
      borderRadius: theme.shape.small,
      background: t9,
      color: theme.palette.textPrimary,
      fontFamily: "inherit",
      fontSize: 13,
      outline: "none"
    };
    $[12] = t8;
    $[13] = t9;
    $[14] = theme.palette.textPrimary;
    $[15] = theme.shape.small;
    $[16] = t10;
  } else {
    t10 = $[16];
  }
  let t11;
  if ($[17] !== theme.palette.accent) {
    t11 = (e_1) => {
      e_1.currentTarget.style.borderColor = theme.palette.accent;
    };
    $[17] = theme.palette.accent;
    $[18] = t11;
  } else {
    t11 = $[18];
  }
  let t12;
  if ($[19] !== theme.palette.border) {
    t12 = (e_2) => {
      e_2.currentTarget.style.borderColor = theme.palette.border;
    };
    $[19] = theme.palette.border;
    $[20] = t12;
  } else {
    t12 = $[20];
  }
  let t13;
  if ($[21] !== t10 || $[22] !== t11 || $[23] !== t12 || $[24] !== t6 || $[25] !== t7 || $[26] !== value) {
    t13 = /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("input", { type: "search", value, onChange: t6, onKeyDown: t7, placeholder: "Search settings", "aria-label": "Search settings", style: t10, onFocus: t11, onBlur: t12 });
    $[21] = t10;
    $[22] = t11;
    $[23] = t12;
    $[24] = t6;
    $[25] = t7;
    $[26] = value;
    $[27] = t13;
  } else {
    t13 = $[27];
  }
  let t14;
  if ($[28] !== t13 || $[29] !== t5) {
    t14 = /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: t1, children: [
      t5,
      t13
    ] });
    $[28] = t13;
    $[29] = t5;
    $[30] = t14;
  } else {
    t14 = $[30];
  }
  return t14;
}
function FieldCard(t0) {
  const $ = (0, import_compiler_runtime9.c)(21);
  const {
    fields,
    prefs,
    narrow,
    onSet,
    onReset
  } = t0;
  const theme = useTheme();
  const t1 = `1px solid ${theme.palette.border}`;
  const t2 = theme.shape.small + 2;
  let t3;
  if ($[0] !== t1 || $[1] !== t2 || $[2] !== theme.palette.background) {
    t3 = {
      border: t1,
      borderRadius: t2,
      background: theme.palette.background,
      overflow: "hidden"
    };
    $[0] = t1;
    $[1] = t2;
    $[2] = theme.palette.background;
    $[3] = t3;
  } else {
    t3 = $[3];
  }
  let t4;
  if ($[4] !== fields || $[5] !== narrow || $[6] !== onReset || $[7] !== onSet || $[8] !== prefs || $[9] !== theme) {
    let t52;
    if ($[11] !== fields.length || $[12] !== narrow || $[13] !== onReset || $[14] !== onSet || $[15] !== prefs || $[16] !== theme) {
      t52 = (t6, i) => {
        const [path, field] = t6;
        const overridden = path in prefs;
        const value = path in prefs ? prefs[path] : (0, import_core3.getPath)(theme, path);
        return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(SettingRow, { field, value, overridden, isLast: i === fields.length - 1, narrow, onChange: (v) => {
          onSet(path, v);
        }, onReset: () => {
          onReset(path);
        } }, path);
      };
      $[11] = fields.length;
      $[12] = narrow;
      $[13] = onReset;
      $[14] = onSet;
      $[15] = prefs;
      $[16] = theme;
      $[17] = t52;
    } else {
      t52 = $[17];
    }
    t4 = fields.map(t52);
    $[4] = fields;
    $[5] = narrow;
    $[6] = onReset;
    $[7] = onSet;
    $[8] = prefs;
    $[9] = theme;
    $[10] = t4;
  } else {
    t4 = $[10];
  }
  let t5;
  if ($[18] !== t3 || $[19] !== t4) {
    t5 = /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { style: t3, children: t4 });
    $[18] = t3;
    $[19] = t4;
    $[20] = t5;
  } else {
    t5 = $[20];
  }
  return t5;
}
function CategoryNav(t0) {
  const $ = (0, import_compiler_runtime9.c)(20);
  const {
    categories,
    activeName,
    onSelect,
    layout
  } = t0;
  const theme = useTheme();
  const bar = layout === "bar";
  const t1 = bar ? "row" : "column";
  const t2 = bar ? 6 : 2;
  let t3;
  if ($[0] !== bar || $[1] !== theme.palette.border) {
    t3 = bar ? {
      overflowX: "auto",
      borderBottom: `1px solid ${theme.palette.border}`,
      paddingBottom: 10
    } : {
      width: 150,
      borderRight: `1px solid ${theme.palette.border}`,
      paddingRight: 12
    };
    $[0] = bar;
    $[1] = theme.palette.border;
    $[2] = t3;
  } else {
    t3 = $[2];
  }
  let t4;
  if ($[3] !== t1 || $[4] !== t2 || $[5] !== t3) {
    t4 = {
      display: "flex",
      flexShrink: 0,
      flexDirection: t1,
      gap: t2,
      ...t3
    };
    $[3] = t1;
    $[4] = t2;
    $[5] = t3;
    $[6] = t4;
  } else {
    t4 = $[6];
  }
  let t5;
  if ($[7] !== activeName || $[8] !== bar || $[9] !== categories || $[10] !== onSelect || $[11] !== theme.motion || $[12] !== theme.palette.accent || $[13] !== theme.palette.textPrimary || $[14] !== theme.palette.textSecondary || $[15] !== theme.shape) {
    t5 = categories.map((name, index) => {
      const isActive = name === activeName;
      return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("button", { type: "button", "aria-current": isActive, tabIndex: isActive ? 0 : -1, onClick: () => {
        onSelect(name);
      }, onKeyDown: (e) => {
        const target = rovingTarget(e.key, index, categories.length, bar ? "horizontal" : "vertical");
        if (target < 0) {
          return;
        }
        e.preventDefault();
        const targetName = categories[target];
        if (targetName !== void 0) {
          onSelect(targetName);
        }
        focusSibling(e.currentTarget, target);
      }, style: {
        appearance: "none",
        border: 0,
        textAlign: bar ? "center" : "left",
        whiteSpace: "nowrap",
        flexShrink: 0,
        padding: bar ? "6px 14px" : "7px 10px",
        borderRadius: theme.shape.small,
        background: isActive ? `${theme.palette.accent}30` : "transparent",
        color: isActive ? theme.palette.textPrimary : theme.palette.textSecondary,
        fontWeight: isActive ? 600 : 500,
        fontSize: 13,
        fontFamily: "inherit",
        cursor: "pointer",
        transition: `background ${String(theme.motion.dockHoverDurationMs)}ms ease`
      }, onMouseEnter: (e_0) => {
        if (!isActive) {
          e_0.currentTarget.style.background = `${theme.palette.textPrimary}12`;
        }
      }, onMouseLeave: (e_1) => {
        if (!isActive) {
          e_1.currentTarget.style.background = "transparent";
        }
      }, children: name }, name);
    });
    $[7] = activeName;
    $[8] = bar;
    $[9] = categories;
    $[10] = onSelect;
    $[11] = theme.motion;
    $[12] = theme.palette.accent;
    $[13] = theme.palette.textPrimary;
    $[14] = theme.palette.textSecondary;
    $[15] = theme.shape;
    $[16] = t5;
  } else {
    t5 = $[16];
  }
  let t6;
  if ($[17] !== t4 || $[18] !== t5) {
    t6 = /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("nav", { "aria-label": "Settings categories", style: t4, children: t5 });
    $[17] = t4;
    $[18] = t5;
    $[19] = t6;
  } else {
    t6 = $[19];
  }
  return t6;
}
function SettingRow(t0) {
  const $ = (0, import_compiler_runtime9.c)(35);
  const {
    field,
    value,
    overridden,
    isLast,
    narrow,
    onChange,
    onReset
  } = t0;
  const theme = useTheme();
  const stacked = field.kind === "image-pick" || narrow && field.kind !== "toggle";
  let t1;
  if ($[0] !== field || $[1] !== onChange || $[2] !== value) {
    t1 = /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(FieldControl, { field, value, onChange });
    $[0] = field;
    $[1] = onChange;
    $[2] = value;
    $[3] = t1;
  } else {
    t1 = $[3];
  }
  const control = t1;
  let t2;
  if ($[4] !== control || $[5] !== field.kind || $[6] !== stacked) {
    t2 = field.kind === "range" ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { style: {
      width: stacked ? "100%" : 180
    }, children: control }) : control;
    $[4] = control;
    $[5] = field.kind;
    $[6] = stacked;
    $[7] = t2;
  } else {
    t2 = $[7];
  }
  const controlNode = t2;
  let t3;
  if ($[8] !== onReset || $[9] !== overridden || $[10] !== theme) {
    t3 = overridden ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("button", { type: "button", onClick: onReset, style: {
      border: 0,
      background: "transparent",
      color: theme.palette.textSecondary,
      fontSize: 11,
      cursor: "pointer",
      padding: 0,
      fontFamily: "inherit"
    }, children: "Reset" }) : null;
    $[8] = onReset;
    $[9] = overridden;
    $[10] = theme;
    $[11] = t3;
  } else {
    t3 = $[11];
  }
  const reset = t3;
  let t4;
  let t5;
  if ($[12] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t4 = {
      minWidth: 0
    };
    t5 = {
      fontSize: 13,
      fontWeight: 500
    };
    $[12] = t4;
    $[13] = t5;
  } else {
    t4 = $[12];
    t5 = $[13];
  }
  let t6;
  if ($[14] !== field.label) {
    t6 = /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { style: t5, children: field.label });
    $[14] = field.label;
    $[15] = t6;
  } else {
    t6 = $[15];
  }
  let t7;
  if ($[16] !== field.description || $[17] !== theme) {
    t7 = field.description && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { style: {
      fontSize: 11,
      color: theme.palette.textSecondary,
      marginTop: 2
    }, children: field.description });
    $[16] = field.description;
    $[17] = theme;
    $[18] = t7;
  } else {
    t7 = $[18];
  }
  let t8;
  if ($[19] !== t6 || $[20] !== t7) {
    t8 = /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: t4, children: [
      t6,
      t7
    ] });
    $[19] = t6;
    $[20] = t7;
    $[21] = t8;
  } else {
    t8 = $[21];
  }
  const labelBlock = t8;
  const t9 = isLast ? "none" : `1px solid ${theme.palette.border}`;
  const t10 = stacked ? "column" : "row";
  const t11 = stacked ? "stretch" : "center";
  const t12 = stacked ? 10 : 16;
  let t13;
  if ($[22] !== t10 || $[23] !== t11 || $[24] !== t12 || $[25] !== t9) {
    t13 = {
      padding: "12px 14px",
      borderBottom: t9,
      display: "flex",
      flexDirection: t10,
      alignItems: t11,
      justifyContent: "space-between",
      gap: t12
    };
    $[22] = t10;
    $[23] = t11;
    $[24] = t12;
    $[25] = t9;
    $[26] = t13;
  } else {
    t13 = $[26];
  }
  let t14;
  if ($[27] !== controlNode || $[28] !== labelBlock || $[29] !== reset || $[30] !== stacked) {
    t14 = stacked ? /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(import_jsx_runtime8.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: {
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: 12
      }, children: [
        labelBlock,
        reset
      ] }),
      controlNode
    ] }) : /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(import_jsx_runtime8.Fragment, { children: [
      labelBlock,
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        flexShrink: 0
      }, children: [
        reset,
        controlNode
      ] })
    ] });
    $[27] = controlNode;
    $[28] = labelBlock;
    $[29] = reset;
    $[30] = stacked;
    $[31] = t14;
  } else {
    t14 = $[31];
  }
  let t15;
  if ($[32] !== t13 || $[33] !== t14) {
    t15 = /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { style: t13, children: t14 });
    $[32] = t13;
    $[33] = t14;
    $[34] = t15;
  } else {
    t15 = $[34];
  }
  return t15;
}
function FieldControl(t0) {
  const $ = (0, import_compiler_runtime9.c)(20);
  const {
    field,
    value,
    onChange
  } = t0;
  switch (field.kind) {
    case "color-from-palette": {
      const t1 = typeof value === "string" ? value : void 0;
      let t2;
      if ($[0] !== field || $[1] !== onChange || $[2] !== t1) {
        t2 = /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(ColorFromPaletteControl, { field, value: t1, onChange });
        $[0] = field;
        $[1] = onChange;
        $[2] = t1;
        $[3] = t2;
      } else {
        t2 = $[3];
      }
      return t2;
    }
    case "image-pick": {
      const t1 = typeof value === "string" ? value : void 0;
      let t2;
      if ($[4] !== field || $[5] !== onChange || $[6] !== t1) {
        t2 = /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(ImagePickControl, { field, value: t1, onChange });
        $[4] = field;
        $[5] = onChange;
        $[6] = t1;
        $[7] = t2;
      } else {
        t2 = $[7];
      }
      return t2;
    }
    case "range": {
      const t1 = typeof value === "number" ? value : field.min;
      let t2;
      if ($[8] !== field || $[9] !== onChange || $[10] !== t1) {
        t2 = /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(RangeControl, { field, value: t1, onChange });
        $[8] = field;
        $[9] = onChange;
        $[10] = t1;
        $[11] = t2;
      } else {
        t2 = $[11];
      }
      return t2;
    }
    case "select": {
      const t1 = typeof value === "string" ? value : void 0;
      let t2;
      if ($[12] !== field || $[13] !== onChange || $[14] !== t1) {
        t2 = /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(SelectControl, { field, value: t1, onChange });
        $[12] = field;
        $[13] = onChange;
        $[14] = t1;
        $[15] = t2;
      } else {
        t2 = $[15];
      }
      return t2;
    }
    case "toggle": {
      const t1 = Boolean(value);
      let t2;
      if ($[16] !== field || $[17] !== onChange || $[18] !== t1) {
        t2 = /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(ToggleControl, { field, value: t1, onChange });
        $[16] = field;
        $[17] = onChange;
        $[18] = t1;
        $[19] = t2;
      } else {
        t2 = $[19];
      }
      return t2;
    }
  }
}
function ColorFromPaletteControl(t0) {
  const $ = (0, import_compiler_runtime9.c)(13);
  const {
    field,
    value,
    onChange
  } = t0;
  const theme = useTheme();
  let t1;
  if ($[0] !== field.options || $[1] !== value) {
    t1 = value ? field.options.indexOf(value) : -1;
    $[0] = field.options;
    $[1] = value;
    $[2] = t1;
  } else {
    t1 = $[2];
  }
  const selectedIndex = t1;
  const focusIndex = selectedIndex >= 0 ? selectedIndex : 0;
  const t2 = field.label;
  let t3;
  if ($[3] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t3 = {
      display: "flex",
      gap: 8,
      flexWrap: "wrap"
    };
    $[3] = t3;
  } else {
    t3 = $[3];
  }
  let t4;
  if ($[4] !== field.options || $[5] !== focusIndex || $[6] !== onChange || $[7] !== theme || $[8] !== value) {
    t4 = field.options.map((color, index) => {
      const selected = value === color;
      return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("button", { type: "button", role: "radio", onClick: () => {
        onChange(color);
      }, "aria-label": color, "aria-checked": selected, tabIndex: index === focusIndex ? 0 : -1, onKeyDown: (e) => {
        const target = rovingTarget(e.key, index, field.options.length, "both");
        if (target < 0) {
          return;
        }
        e.preventDefault();
        const next = field.options[target];
        if (next !== void 0) {
          onChange(next);
        }
        focusSibling(e.currentTarget, target);
      }, style: {
        width: 28,
        height: 28,
        borderRadius: theme.shape.small,
        border: selected ? `2px solid ${theme.palette.textPrimary}` : `1px solid ${theme.palette.border}`,
        background: color,
        cursor: "pointer",
        padding: 0,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)"
      } }, color);
    });
    $[4] = field.options;
    $[5] = focusIndex;
    $[6] = onChange;
    $[7] = theme;
    $[8] = value;
    $[9] = t4;
  } else {
    t4 = $[9];
  }
  let t5;
  if ($[10] !== field.label || $[11] !== t4) {
    t5 = /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { role: "radiogroup", "aria-label": t2, style: t3, children: t4 });
    $[10] = field.label;
    $[11] = t4;
    $[12] = t5;
  } else {
    t5 = $[12];
  }
  return t5;
}
function ImagePickControl(t0) {
  const $ = (0, import_compiler_runtime9.c)(13);
  const {
    field,
    value,
    onChange
  } = t0;
  const theme = useTheme();
  let t1;
  if ($[0] !== field.options || $[1] !== value) {
    t1 = value ? field.options.findIndex((o) => o.src === value) : -1;
    $[0] = field.options;
    $[1] = value;
    $[2] = t1;
  } else {
    t1 = $[2];
  }
  const selectedIndex = t1;
  const focusIndex = selectedIndex >= 0 ? selectedIndex : 0;
  const t2 = field.label;
  let t3;
  if ($[3] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t3 = {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))",
      gap: 8
    };
    $[3] = t3;
  } else {
    t3 = $[3];
  }
  let t4;
  if ($[4] !== field.options || $[5] !== focusIndex || $[6] !== onChange || $[7] !== theme || $[8] !== value) {
    t4 = field.options.map((opt, index) => {
      const selected = value === opt.src;
      return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("button", { type: "button", role: "radio", "aria-label": opt.label, "aria-checked": selected, tabIndex: index === focusIndex ? 0 : -1, onClick: () => {
        onChange(opt.src);
      }, onKeyDown: (e) => {
        const target = rovingTarget(e.key, index, field.options.length, "both");
        if (target < 0) {
          return;
        }
        e.preventDefault();
        const next = field.options[target];
        if (next) {
          onChange(next.src);
        }
        focusSibling(e.currentTarget, target);
      }, style: {
        padding: 4,
        border: selected ? `2px solid ${theme.palette.accent}` : `1px solid ${theme.palette.border}`,
        borderRadius: theme.shape.small + 2,
        background: "transparent",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        alignItems: "center"
      }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("img", { src: opt.src, alt: opt.label, loading: "lazy", decoding: "async", style: {
          width: "100%",
          aspectRatio: "16 / 10",
          objectFit: "cover",
          borderRadius: theme.shape.small
        } }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { style: {
          fontSize: 11,
          color: theme.palette.textSecondary
        }, children: opt.label })
      ] }, opt.src);
    });
    $[4] = field.options;
    $[5] = focusIndex;
    $[6] = onChange;
    $[7] = theme;
    $[8] = value;
    $[9] = t4;
  } else {
    t4 = $[9];
  }
  let t5;
  if ($[10] !== field.label || $[11] !== t4) {
    t5 = /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { role: "radiogroup", "aria-label": t2, style: t3, children: t4 });
    $[10] = field.label;
    $[11] = t4;
    $[12] = t5;
  } else {
    t5 = $[12];
  }
  return t5;
}
function RangeControl(t0) {
  const $ = (0, import_compiler_runtime9.c)(10);
  const {
    field,
    value,
    onChange
  } = t0;
  let t1;
  if ($[0] !== onChange) {
    t1 = (v) => onChange(v);
    $[0] = onChange;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  let t2;
  if ($[2] !== field.label || $[3] !== field.max || $[4] !== field.min || $[5] !== field.step || $[6] !== field.unit || $[7] !== t1 || $[8] !== value) {
    t2 = /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Slider, { value, min: field.min, max: field.max, step: field.step, onChange: t1, unit: field.unit, ariaLabel: field.label });
    $[2] = field.label;
    $[3] = field.max;
    $[4] = field.min;
    $[5] = field.step;
    $[6] = field.unit;
    $[7] = t1;
    $[8] = value;
    $[9] = t2;
  } else {
    t2 = $[9];
  }
  return t2;
}
function SelectControl(t0) {
  const $ = (0, import_compiler_runtime9.c)(16);
  const {
    field,
    value,
    onChange
  } = t0;
  const theme = useTheme();
  let t1;
  if ($[0] !== value) {
    t1 = (o) => o.value === value;
    $[0] = value;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  const selectedIndex = field.options.findIndex(t1);
  const focusIndex = selectedIndex >= 0 ? selectedIndex : 0;
  const t2 = field.label;
  const t3 = `1px solid ${theme.palette.border}`;
  let t4;
  if ($[2] !== t3 || $[3] !== theme.shape.small) {
    t4 = {
      display: "inline-flex",
      border: t3,
      borderRadius: theme.shape.small,
      overflow: "hidden"
    };
    $[2] = t3;
    $[3] = theme.shape.small;
    $[4] = t4;
  } else {
    t4 = $[4];
  }
  let t5;
  if ($[5] !== field.options || $[6] !== focusIndex || $[7] !== onChange || $[8] !== theme.palette.accent || $[9] !== theme.palette.textPrimary || $[10] !== value) {
    t5 = field.options.map((opt, index) => {
      const selected = value === opt.value;
      return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("button", { type: "button", role: "radio", "aria-checked": selected, tabIndex: index === focusIndex ? 0 : -1, onClick: () => {
        onChange(opt.value);
      }, onKeyDown: (e) => {
        const target = rovingTarget(e.key, index, field.options.length, "both");
        if (target < 0) {
          return;
        }
        e.preventDefault();
        const next = field.options[target];
        if (next) {
          onChange(next.value);
        }
        focusSibling(e.currentTarget, target);
      }, style: {
        border: "none",
        background: selected ? `${theme.palette.accent}38` : "transparent",
        color: theme.palette.textPrimary,
        padding: "6px 12px",
        fontSize: 12,
        cursor: "pointer",
        fontFamily: "inherit"
      }, children: opt.label }, opt.value);
    });
    $[5] = field.options;
    $[6] = focusIndex;
    $[7] = onChange;
    $[8] = theme.palette.accent;
    $[9] = theme.palette.textPrimary;
    $[10] = value;
    $[11] = t5;
  } else {
    t5 = $[11];
  }
  let t6;
  if ($[12] !== field.label || $[13] !== t4 || $[14] !== t5) {
    t6 = /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { role: "radiogroup", "aria-label": t2, style: t4, children: t5 });
    $[12] = field.label;
    $[13] = t4;
    $[14] = t5;
    $[15] = t6;
  } else {
    t6 = $[15];
  }
  return t6;
}
function ToggleControl(t0) {
  const $ = (0, import_compiler_runtime9.c)(6);
  const {
    field,
    value,
    onChange
  } = t0;
  let t1;
  if ($[0] !== onChange) {
    t1 = (next) => onChange(next);
    $[0] = onChange;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  let t2;
  if ($[2] !== field.label || $[3] !== t1 || $[4] !== value) {
    t2 = /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Toggle, { checked: value, onChange: t1, ariaLabel: field.label });
    $[2] = field.label;
    $[3] = t1;
    $[4] = value;
    $[5] = t2;
  } else {
    t2 = $[5];
  }
  return t2;
}

// src/system-icons.tsx
var import_compiler_runtime10 = require("react/compiler-runtime");
var import_jsx_runtime9 = require("react/jsx-runtime");
function SettingsIcon(t0) {
  const $ = (0, import_compiler_runtime10.c)(4);
  const {
    size: t1
  } = t0;
  const size = t1 === void 0 ? 24 : t1;
  let t2;
  let t3;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t2 = /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("path", { d: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" });
    t3 = /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("circle", { cx: "12", cy: "12", r: "3" });
    $[0] = t2;
    $[1] = t3;
  } else {
    t2 = $[0];
    t3 = $[1];
  }
  let t4;
  if ($[2] !== size) {
    t4 = /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [
      t2,
      t3
    ] });
    $[2] = size;
    $[3] = t4;
  } else {
    t4 = $[3];
  }
  return t4;
}
function SettingsFluentIcon(t0) {
  const $ = (0, import_compiler_runtime10.c)(3);
  const {
    size: t1
  } = t0;
  const size = t1 === void 0 ? 24 : t1;
  let t2;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t2 = /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("path", { d: "M12.0122 2.25C12.7462 2.25846 13.4773 2.34326 14.1937 2.50304C14.5064 2.57279 14.7403 2.83351 14.7758 3.15196L14.946 4.67881C15.0231 5.37986 15.615 5.91084 16.3206 5.91158C16.5103 5.91188 16.6979 5.87238 16.8732 5.79483L18.2738 5.17956C18.5651 5.05159 18.9055 5.12136 19.1229 5.35362C20.1351 6.43464 20.8889 7.73115 21.3277 9.14558C21.4223 9.45058 21.3134 9.78203 21.0564 9.9715L19.8149 10.8866C19.4607 11.1468 19.2516 11.56 19.2516 11.9995C19.2516 12.4389 19.4607 12.8521 19.8157 13.1129L21.0582 14.0283C21.3153 14.2177 21.4243 14.5492 21.3297 14.8543C20.8911 16.2685 20.1377 17.5649 19.1261 18.6461C18.9089 18.8783 18.5688 18.9483 18.2775 18.8206L16.8712 18.2045C16.4688 18.0284 16.0068 18.0542 15.6265 18.274C15.2463 18.4937 14.9933 18.8812 14.945 19.3177L14.7759 20.8444C14.741 21.1592 14.5122 21.4182 14.204 21.4915C12.7556 21.8361 11.2465 21.8361 9.79803 21.4915C9.48991 21.4182 9.26105 21.1592 9.22618 20.8444L9.05736 19.32C9.00777 18.8843 8.75434 18.498 8.37442 18.279C7.99451 18.06 7.5332 18.0343 7.1322 18.2094L5.72557 18.8256C5.43422 18.9533 5.09403 18.8833 4.87678 18.6509C3.86462 17.5685 3.11119 16.2705 2.6732 14.8548C2.57886 14.5499 2.68786 14.2186 2.94485 14.0293L4.18818 13.1133C4.54232 12.8531 4.75147 12.4399 4.75147 12.0005C4.75147 11.561 4.54232 11.1478 4.18771 10.8873L2.94516 9.97285C2.6878 9.78345 2.5787 9.45178 2.67337 9.14658C3.11212 7.73215 3.86594 6.43564 4.87813 5.35462C5.09559 5.12236 5.43594 5.05259 5.72724 5.18056L7.12762 5.79572C7.53056 5.97256 7.9938 5.94585 8.37577 5.72269C8.75609 5.50209 9.00929 5.11422 9.05817 4.67764L9.22824 3.15196C9.26376 2.83335 9.49786 2.57254 9.8108 2.50294C10.5281 2.34342 11.26 2.25865 12.0122 2.25ZM11.9997 8.99995C10.3428 8.99995 8.9997 10.3431 8.9997 12C8.9997 13.6568 10.3428 15 11.9997 15C13.6565 15 14.9997 13.6568 14.9997 12C14.9997 10.3431 13.6565 8.99995 11.9997 8.99995Z" });
    $[0] = t2;
  } else {
    t2 = $[0];
  }
  let t3;
  if ($[1] !== size) {
    t3 = /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": "true", children: t2 });
    $[1] = size;
    $[2] = t3;
  } else {
    t3 = $[2];
  }
  return t3;
}

// src/system-windows.ts
var systemWindows = {
  settings: {
    name: "Settings",
    tagline: "Tweak the theme",
    accent: "#8a8a93",
    // Where Windows files its Settings app in the Start Category view.
    category: "Utilities & Tools",
    defaultBounds: {
      w: 660,
      h: 540
    },
    content: Settings,
    icon: SettingsIcon,
    icons: {
      fluent: SettingsFluentIcon
    }
    // Settings doesn't get a desktop shortcut by default; it's expected to
    // be reached via Cmd-, or Spotlight. Consumers can override per-app.
  }
};
function registerSystemWindow(systemId, def) {
  systemWindows[systemId] = def;
}
function getSystemWindow(systemId) {
  return systemWindows[systemId];
}
function listSystemWindows() {
  return Object.entries(systemWindows).map(([systemId, def]) => ({
    systemId,
    ...def
  }));
}
function resolveSystemWindowName(def, args) {
  return typeof def.name === "function" ? def.name(args) : def.name;
}

// src/util/viewport-mode.ts
var import_compiler_runtime11 = require("react/compiler-runtime");
var import_react10 = require("react");
var COMPACT_WIDTH = 800;
var COMPACT_HEIGHT = 540;
function getViewportMode() {
  if (typeof window === "undefined") return "regular";
  if (window.innerWidth < COMPACT_WIDTH) return "compact";
  if (window.innerHeight < COMPACT_HEIGHT) return "compact";
  return "regular";
}
var listeners3 = /* @__PURE__ */ new Set();
var resizeBound = false;
var lastNotified = "regular";
function ensureResizeListener() {
  if (resizeBound || typeof window === "undefined") return;
  resizeBound = true;
  lastNotified = getViewportMode();
  window.addEventListener("resize", () => {
    const next = getViewportMode();
    if (next === lastNotified) return;
    lastNotified = next;
    for (const listener of listeners3) listener();
  });
}
function subscribe2(listener) {
  ensureResizeListener();
  listeners3.add(listener);
  return () => {
    listeners3.delete(listener);
  };
}
function useViewportMode() {
  const $ = (0, import_compiler_runtime11.c)(2);
  const [mode, setMode] = (0, import_react10.useState)("regular");
  let t0;
  let t1;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t0 = () => {
      const update = () => {
        setMode(getViewportMode());
      };
      update();
      return subscribe2(update);
    };
    t1 = [];
    $[0] = t0;
    $[1] = t1;
  } else {
    t0 = $[0];
    t1 = $[1];
  }
  useIsomorphicLayoutEffect(t0, t1);
  return mode;
}

// src/util/layout.ts
var REGULAR_METRICS = {
  // macOS Big Sur+ menu bar is 24pt; match it.
  menuBarHeight: 24,
  dockTileSize: 56,
  dockGap: 10,
  dockPadding: 10,
  dockEdgeOffset: 14,
  // Windows 11 taskbar default (Medium) is 48px; icons sit ~24px inside it.
  taskbarSize: 48,
  taskbarTileSize: 36,
  titleBarHeight: 32
};
var COMPACT_METRICS = {
  menuBarHeight: 22,
  dockTileSize: 40,
  dockGap: 6,
  dockPadding: 6,
  dockEdgeOffset: 8,
  taskbarSize: 40,
  taskbarTileSize: 30,
  titleBarHeight: 28
};
function getChromeMetrics(mode = getViewportMode()) {
  const base = mode === "compact" ? COMPACT_METRICS : REGULAR_METRICS;
  return {
    ...base,
    dockHeight: base.dockTileSize + base.dockPadding * 2,
    dockWidth: base.dockTileSize + base.dockPadding * 2
  };
}
var MENU_BAR_HEIGHT = REGULAR_METRICS.menuBarHeight;
var DOCK_TILE_SIZE = REGULAR_METRICS.dockTileSize;
var DOCK_GAP = REGULAR_METRICS.dockGap;
var DOCK_PADDING = REGULAR_METRICS.dockPadding;
var DOCK_EDGE_OFFSET = REGULAR_METRICS.dockEdgeOffset;
var DOCK_HEIGHT = REGULAR_METRICS.dockTileSize + REGULAR_METRICS.dockPadding * 2;
var DOCK_WIDTH = REGULAR_METRICS.dockTileSize + REGULAR_METRICS.dockPadding * 2;
var COMPACT_TILE_RATIO = 0.83;
var BAR_TILE_MARGIN = 4;
var SMALL_TILE_RATIO = 0.6;
var SMALL_ICON_COMPENSATION = 16 / 24 / (24 / 40);
var DOCK_LABELED_BUTTON_MAX = 160;
function getDockTileSize(theme, mode = getViewportMode()) {
  const metrics = getChromeMetrics(mode);
  const override = theme.chrome.dockTileSize;
  const tile = override !== void 0 ? mode === "compact" ? override * COMPACT_TILE_RATIO : override : theme.chrome.dockStyle === "bar" ? metrics.taskbarTileSize : metrics.dockTileSize;
  const small = theme.chrome.dockStyle === "bar" && theme.chrome.dockSmallButtons === "always";
  return Math.round(small ? tile * SMALL_TILE_RATIO : tile);
}
function getDockIconScale(theme, small) {
  const scale = theme.chrome.dockIconScale ?? 0.5;
  return small ? Math.min(scale * SMALL_ICON_COMPENSATION, 1) : scale;
}
function shouldShrinkWhenFull(opts) {
  return opts.count * (opts.tile + opts.gap) + opts.fixed > opts.available;
}
function getBarThickness(theme, mode = getViewportMode()) {
  const smallAlways = theme.chrome.dockStyle === "bar" && theme.chrome.dockSmallButtons === "always";
  const vertical = theme.chrome.dockPosition === "left" || theme.chrome.dockPosition === "right";
  if (theme.chrome.dockStyle === "bar" && vertical && theme.chrome.dockCombineButtons === "never") {
    return DOCK_LABELED_BUTTON_MAX + BAR_TILE_MARGIN * 2;
  }
  if (theme.chrome.dockTileSize === void 0 && !smallAlways) {
    return getChromeMetrics(mode).taskbarSize;
  }
  return getDockTileSize(theme, mode) + BAR_TILE_MARGIN * 2;
}
function getMenuBarHeight(theme) {
  if (theme.chrome.menuBar === "none") return 0;
  return theme.chrome.menuBarHeight ?? getChromeMetrics().menuBarHeight;
}
function getDockReservation(theme) {
  const isBar = theme.chrome.dockStyle === "bar";
  if (theme.chrome.dockPosition === "hidden" || isBar && theme.chrome.dockAutoHide) {
    return {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    };
  }
  const metrics = getChromeMetrics();
  const barThickness = getBarThickness(theme);
  const floatFootprint = getDockTileSize(theme) + metrics.dockPadding * 2;
  const position = theme.chrome.dockPosition;
  const reservation = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  };
  if (position === "left" || position === "right") {
    reservation[position] = isBar ? barThickness : floatFootprint + metrics.dockEdgeOffset * 2;
  } else {
    reservation[position] = isBar ? barThickness : floatFootprint + metrics.dockEdgeOffset;
  }
  return reservation;
}
function getWorkArea(theme) {
  if (typeof window === "undefined") {
    return {
      x: 0,
      y: 0,
      width: 800,
      height: 600
    };
  }
  const menuH = getMenuBarHeight(theme);
  const dock = getDockReservation(theme);
  return {
    x: dock.left,
    y: menuH + dock.top,
    width: window.innerWidth - dock.left - dock.right,
    height: window.innerHeight - menuH - dock.top - dock.bottom
  };
}

// src/util/initial-bounds.ts
function nextCascadeIndex(state) {
  return state.windows.filter((w) => w.workspaceId === state.activeWorkspaceId).length;
}
function pickInitialBounds(payload, theme, apps, explicit, cascadeIndex = 0) {
  const work = getWorkArea(theme);
  const margin = 12;
  const maxW = Math.max(240, work.width - margin * 2);
  const maxH = Math.max(160, work.height - margin * 2);
  if (explicit) {
    const w2 = Math.min(explicit.w, maxW);
    const h2 = Math.min(explicit.h, maxH);
    const x2 = clamp(explicit.x, work.x + margin, work.x + work.width - w2 - margin);
    const y2 = clamp(explicit.y, work.y + margin, work.y + work.height - h2 - margin);
    return {
      x: x2,
      y: y2,
      w: w2,
      h: h2
    };
  }
  const preferred = preferredSizeFor(payload, apps);
  const w = Math.min(preferred.w, maxW);
  const h = Math.min(preferred.h, maxH);
  const centerX = Math.round(work.x + (work.width - w) / 2);
  const centerY = Math.round(work.y + (work.height - h) / 2);
  const {
    x,
    y
  } = cascadeOrigin(centerX, centerY, w, h, work, margin, cascadeIndex);
  return {
    w,
    h,
    x,
    y
  };
}
function cascadeOrigin(centerX, centerY, w, h, work, margin, index) {
  if (index <= 0) return {
    x: centerX,
    y: centerY
  };
  const step = getChromeMetrics().titleBarHeight;
  const topY = work.y + margin;
  const leftX = work.x + margin;
  const bottomLimit = work.y + work.height - margin;
  const rightLimit = work.x + work.width - margin;
  let x = centerX;
  let y = centerY;
  for (let i = 0; i < index; i++) {
    x += step;
    y += step;
    if (y + h > bottomLimit) y = topY;
    if (x + w > rightLimit) x = leftX;
  }
  return {
    x,
    y
  };
}
function preferredSizeFor(payload, apps) {
  if (payload.kind === "app") {
    const app = apps.find((a) => a.id === payload.appId);
    if (app?.defaultBounds) return app.defaultBounds;
  } else {
    const def = getSystemWindow(payload.systemId);
    if (def?.defaultBounds) return def.defaultBounds;
  }
  return {
    w: 720,
    h: 480
  };
}
function clamp(value, min, max) {
  if (max < min) return min;
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

// src/status-items.ts
var items = /* @__PURE__ */ new Map();
var listeners4 = /* @__PURE__ */ new Set();
var cachedSnapshot = [];
function rebuildSnapshot() {
  cachedSnapshot = Array.from(items.values()).sort((a, b) => (a.order ?? 100) - (b.order ?? 100));
}
function emit2() {
  rebuildSnapshot();
  for (const listener of listeners4) listener();
}
function registerStatusItem(item) {
  items.set(item.id, item);
  emit2();
  return () => {
    if (items.get(item.id) === item) {
      items.delete(item.id);
      emit2();
    }
  };
}
function unregisterStatusItem(id) {
  if (!items.has(id)) return;
  items.delete(id);
  emit2();
}
function listStatusItems() {
  return cachedSnapshot;
}
function subscribeStatusItems(listener) {
  listeners4.add(listener);
  return () => {
    listeners4.delete(listener);
  };
}

// src/tooltip/Tooltip.tsx
var import_compiler_runtime12 = require("react/compiler-runtime");
var import_react11 = require("react");
var import_jsx_runtime10 = require("react/jsx-runtime");
var SHOW_DELAY_COLD = 480;
var SHOW_DELAY_WARM = 60;
var HIDE_GRACE_PERIOD = 800;
var OFFSET = 8;
var lastHiddenAt = 0;
function Tooltip(t0) {
  const $ = (0, import_compiler_runtime12.c)(11);
  const {
    text,
    shortcut,
    placement: t1,
    disabled: t2,
    children
  } = t0;
  const placement = t1 === void 0 ? "top" : t1;
  const disabled = t2 === void 0 ? false : t2;
  let child;
  let t3;
  if ($[0] !== children) {
    child = import_react11.Children.only(children);
    t3 = (0, import_react11.isValidElement)(child);
    $[0] = children;
    $[1] = child;
    $[2] = t3;
  } else {
    child = $[1];
    t3 = $[2];
  }
  if (!t3) {
    let t42;
    if ($[3] !== children) {
      t42 = /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(import_jsx_runtime10.Fragment, { children });
      $[3] = children;
      $[4] = t42;
    } else {
      t42 = $[4];
    }
    return t42;
  }
  const t4 = child;
  let t5;
  if ($[5] !== disabled || $[6] !== placement || $[7] !== shortcut || $[8] !== t4 || $[9] !== text) {
    t5 = /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(TooltipImpl, { text, shortcut, placement, disabled, child: t4 });
    $[5] = disabled;
    $[6] = placement;
    $[7] = shortcut;
    $[8] = t4;
    $[9] = text;
    $[10] = t5;
  } else {
    t5 = $[10];
  }
  return t5;
}
function TooltipImpl({
  text,
  shortcut,
  placement,
  disabled,
  child
}) {
  const [visible, setVisible] = (0, import_react11.useState)(false);
  const anchorRef = (0, import_react11.useRef)(null);
  const showTimerRef = (0, import_react11.useRef)(null);
  const cancelShow = () => {
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }
  };
  const onEnter = () => {
    if (disabled) return;
    cancelShow();
    const now = Date.now();
    const warm = now - lastHiddenAt < HIDE_GRACE_PERIOD;
    const delay = warm ? SHOW_DELAY_WARM : SHOW_DELAY_COLD;
    showTimerRef.current = setTimeout(() => setVisible(true), delay);
  };
  const onLeave = () => {
    cancelShow();
    if (visible) {
      lastHiddenAt = Date.now();
      setVisible(false);
    }
  };
  (0, import_react11.useEffect)(() => () => {
    cancelShow();
  }, []);
  const childProps = child.props;
  const wrappedChild = (0, import_react11.cloneElement)(child, {
    onPointerEnter: (e) => {
      childProps.onPointerEnter?.(e);
      onEnter();
    },
    onPointerLeave: (e_0) => {
      childProps.onPointerLeave?.(e_0);
      onLeave();
    },
    onFocus: (e_1) => {
      childProps.onFocus?.(e_1);
      onEnter();
    },
    onBlur: (e_2) => {
      childProps.onBlur?.(e_2);
      onLeave();
    },
    ref: (node) => {
      anchorRef.current = node;
      const existingRef = child.ref;
      if (typeof existingRef === "function") existingRef(node);
      else if (existingRef && typeof existingRef === "object") {
        existingRef.current = node;
      }
    }
  });
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(import_jsx_runtime10.Fragment, { children: [
    wrappedChild,
    visible && anchorRef.current && /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(TooltipSurface, { anchor: anchorRef.current, text, shortcut, placement })
  ] });
}
function TooltipSurface(t0) {
  const $ = (0, import_compiler_runtime12.c)(23);
  const {
    anchor,
    text,
    shortcut,
    placement
  } = t0;
  const theme = useTheme();
  const surfaceRef = (0, import_react11.useRef)(null);
  let t1;
  if ($[0] !== placement) {
    t1 = {
      x: 0,
      y: 0,
      place: placement
    };
    $[0] = placement;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  const [pos, setPos] = (0, import_react11.useState)(t1);
  let t2;
  if ($[2] !== anchor || $[3] !== placement) {
    t2 = () => {
      const update = () => {
        const el = surfaceRef.current;
        if (!el) {
          return;
        }
        const a = anchor.getBoundingClientRect();
        const t = el.getBoundingClientRect();
        const viewportW = window.innerWidth;
        const viewportH = window.innerHeight;
        let place = placement;
        let x = 0;
        let y = 0;
        const calc = (where) => {
          switch (where) {
            case "top": {
              return {
                x: a.left + a.width / 2 - t.width / 2,
                y: a.top - t.height - OFFSET
              };
            }
            case "bottom": {
              return {
                x: a.left + a.width / 2 - t.width / 2,
                y: a.bottom + OFFSET
              };
            }
            case "left": {
              return {
                x: a.left - t.width - OFFSET,
                y: a.top + a.height / 2 - t.height / 2
              };
            }
            case "right": {
              return {
                x: a.right + OFFSET,
                y: a.top + a.height / 2 - t.height / 2
              };
            }
          }
        };
        const {
          x: t32,
          y: t42
        } = calc(place);
        x = t32;
        y = t42;
        const wouldClip = () => x < 6 || y < 6 || x + t.width + 6 > viewportW || y + t.height + 6 > viewportH;
        if (wouldClip()) {
          const flip = {
            top: "bottom",
            bottom: "top",
            left: "right",
            right: "left"
          };
          const alt = calc(flip[place]);
          x = alt.x;
          y = alt.y;
          place = flip[place];
        }
        x = Math.max(6, Math.min(x, viewportW - t.width - 6));
        y = Math.max(6, Math.min(y, viewportH - t.height - 6));
        setPos({
          x,
          y,
          place
        });
      };
      update();
      window.addEventListener("scroll", update, true);
      window.addEventListener("resize", update);
      return () => {
        window.removeEventListener("scroll", update, true);
        window.removeEventListener("resize", update);
      };
    };
    $[2] = anchor;
    $[3] = placement;
    $[4] = t2;
  } else {
    t2 = $[4];
  }
  let t3;
  if ($[5] !== anchor || $[6] !== placement || $[7] !== shortcut || $[8] !== text) {
    t3 = [anchor, placement, text, shortcut];
    $[5] = anchor;
    $[6] = placement;
    $[7] = shortcut;
    $[8] = text;
    $[9] = t3;
  } else {
    t3 = $[9];
  }
  (0, import_react11.useLayoutEffect)(t2, t3);
  const t4 = theme.shape.small + 2;
  let t5;
  if ($[10] !== pos.x || $[11] !== pos.y || $[12] !== t4 || $[13] !== theme.blur.surface) {
    t5 = {
      position: "fixed",
      left: pos.x,
      top: pos.y,
      background: "rgba(20, 22, 32, 0.92)",
      backdropFilter: theme.blur.surface,
      WebkitBackdropFilter: theme.blur.surface,
      color: "#f1f3f8",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: t4,
      padding: "5px 10px",
      fontSize: 11,
      fontFamily: "inherit",
      lineHeight: 1.3,
      whiteSpace: "nowrap",
      pointerEvents: "none",
      zIndex: 2e3,
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      boxShadow: "0 6px 18px rgba(0,0,0,0.45)"
    };
    $[10] = pos.x;
    $[11] = pos.y;
    $[12] = t4;
    $[13] = theme.blur.surface;
    $[14] = t5;
  } else {
    t5 = $[14];
  }
  const surfaceStyle = t5;
  let t6;
  if ($[15] !== text) {
    t6 = /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { children: text });
    $[15] = text;
    $[16] = t6;
  } else {
    t6 = $[16];
  }
  let t7;
  if ($[17] !== shortcut) {
    t7 = shortcut && /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { style: {
      color: "rgba(241, 243, 248, 0.55)",
      fontVariantNumeric: "tabular-nums",
      fontSize: 10
    }, children: shortcut });
    $[17] = shortcut;
    $[18] = t7;
  } else {
    t7 = $[18];
  }
  let t8;
  if ($[19] !== surfaceStyle || $[20] !== t6 || $[21] !== t7) {
    t8 = /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { ref: surfaceRef, role: "tooltip", style: surfaceStyle, children: [
      t6,
      t7
    ] });
    $[19] = surfaceStyle;
    $[20] = t6;
    $[21] = t7;
    $[22] = t8;
  } else {
    t8 = $[22];
  }
  return t8;
}

// src/MenuBar.tsx
var import_jsx_runtime11 = require("react/jsx-runtime");
function MenuBar(t0) {
  const $ = (0, import_compiler_runtime13.c)(66);
  const {
    brand
  } = t0;
  const theme = useTheme();
  const transparentBar = theme.chrome.menuBarStyle === "transparent";
  const mode = useViewportMode();
  getChromeMetrics(mode);
  const apps = useApps();
  const {
    state,
    focusedWindow,
    openWindow
  } = (0, import_core4.useWindowManager)();
  const focusedApp = useApp(focusedWindow?.payload.kind === "app" ? focusedWindow.payload.appId : "__none__");
  let t1;
  if ($[0] !== focusedApp?.name || $[1] !== focusedWindow) {
    const focusedSystem = focusedWindow?.payload.kind === "system" ? getSystemWindow(focusedWindow.payload.systemId) : void 0;
    const focusedSystemArgs = focusedWindow?.payload.kind === "system" ? focusedWindow.payload.args : void 0;
    t1 = focusedApp?.name ?? (focusedSystem ? resolveSystemWindowName(focusedSystem, focusedSystemArgs) : void 0);
    $[0] = focusedApp?.name;
    $[1] = focusedWindow;
    $[2] = t1;
  } else {
    t1 = $[2];
  }
  const focusedName = t1;
  if (theme.chrome.menuBar !== "top") {
    return null;
  }
  const clockCentered = theme.chrome.menuBarClock === "center";
  const showBrand = theme.chrome.menuBarBrand !== false;
  let t2;
  if ($[3] !== apps || $[4] !== brand || $[5] !== openWindow || $[6] !== state || $[7] !== theme) {
    t2 = (e) => {
      if (!brand) {
        return;
      }
      const r = e.currentTarget.getBoundingClientRect();
      openContextMenu({
        x: r.left,
        y: r.bottom + 4,
        ariaLabel: `${brand} menu`,
        items: [{
          label: `About ${brand}`,
          onSelect: () => (0, import_core4.notify)({
            title: brand,
            body: "An OS-style desktop, built with react-ui-os.",
            level: "info"
          })
        }, {
          separator: true
        }, {
          label: "Settings\u2026",
          shortcut: "\u2318,",
          onSelect: () => {
            const payload = {
              kind: "system",
              systemId: "settings"
            };
            openWindow(payload, pickInitialBounds(payload, theme, apps, void 0, nextCascadeIndex(state)));
          }
        }]
      });
    };
    $[3] = apps;
    $[4] = brand;
    $[5] = openWindow;
    $[6] = state;
    $[7] = theme;
    $[8] = t2;
  } else {
    t2 = $[8];
  }
  const openBrandMenu = t2;
  let t3;
  if ($[9] !== theme) {
    t3 = getMenuBarHeight(theme);
    $[9] = theme;
    $[10] = t3;
  } else {
    t3 = $[10];
  }
  const t4 = transparentBar ? "transparent" : theme.palette.surface;
  const t5 = transparentBar ? "none" : theme.blur.surface;
  const t6 = transparentBar ? "none" : theme.blur.surface;
  const t7 = transparentBar ? "none" : `1px solid ${theme.palette.border}`;
  const t8 = transparentBar ? "0 0 3px rgba(0,0,0,0.18)" : void 0;
  let t9;
  if ($[11] !== t3 || $[12] !== t4 || $[13] !== t5 || $[14] !== t6 || $[15] !== t7 || $[16] !== t8 || $[17] !== theme.palette.textPrimary) {
    t9 = {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      height: t3,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 12px",
      backgroundColor: t4,
      backdropFilter: t5,
      WebkitBackdropFilter: t6,
      borderBottom: t7,
      color: theme.palette.textPrimary,
      textShadow: t8,
      fontFamily: "inherit",
      fontSize: 12,
      zIndex: 10,
      userSelect: "none"
    };
    $[11] = t3;
    $[12] = t4;
    $[13] = t5;
    $[14] = t6;
    $[15] = t7;
    $[16] = t8;
    $[17] = theme.palette.textPrimary;
    $[18] = t9;
  } else {
    t9 = $[18];
  }
  let t10;
  if ($[19] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t10 = {
      display: "flex",
      alignItems: "center",
      gap: 10
    };
    $[19] = t10;
  } else {
    t10 = $[19];
  }
  let t11;
  if ($[20] !== brand || $[21] !== openBrandMenu || $[22] !== showBrand || $[23] !== theme.motion || $[24] !== theme.palette.textPrimary || $[25] !== theme.shape) {
    t11 = showBrand && brand && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("button", { type: "button", onClick: openBrandMenu, "aria-haspopup": "menu", "aria-label": `${brand} menu`, style: {
      appearance: "none",
      background: "transparent",
      border: 0,
      margin: 0,
      padding: "3px 7px",
      borderRadius: theme.shape.small,
      color: theme.palette.textPrimary,
      fontFamily: "inherit",
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: 0.2,
      cursor: "pointer",
      transition: `background ${String(theme.motion.dockHoverDurationMs)}ms ease`
    }, onMouseEnter: (e_0) => {
      e_0.currentTarget.style.background = `${theme.palette.textPrimary}1a`;
    }, onMouseLeave: _temp10, children: brand });
    $[20] = brand;
    $[21] = openBrandMenu;
    $[22] = showBrand;
    $[23] = theme.motion;
    $[24] = theme.palette.textPrimary;
    $[25] = theme.shape;
    $[26] = t11;
  } else {
    t11 = $[26];
  }
  let t12;
  if ($[27] !== clockCentered) {
    t12 = clockCentered && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(WorkspaceIndicator, {});
    $[27] = clockCentered;
    $[28] = t12;
  } else {
    t12 = $[28];
  }
  let t13;
  if ($[29] !== clockCentered || $[30] !== focusedName || $[31] !== focusedWindow?.id || $[32] !== focusedWindow?.state || $[33] !== mode || $[34] !== theme.palette.textPrimary) {
    t13 = !clockCentered && focusedName && (mode === "compact" ? /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { style: {
      fontWeight: 600,
      color: theme.palette.textPrimary
    }, children: focusedName }) : /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(AppMenus, { name: focusedName, windowId: focusedWindow?.id ?? null, maximized: focusedWindow?.state === "maximized" }));
    $[29] = clockCentered;
    $[30] = focusedName;
    $[31] = focusedWindow?.id;
    $[32] = focusedWindow?.state;
    $[33] = mode;
    $[34] = theme.palette.textPrimary;
    $[35] = t13;
  } else {
    t13 = $[35];
  }
  let t14;
  if ($[36] !== t11 || $[37] !== t12 || $[38] !== t13) {
    t14 = /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { style: t10, children: [
      t11,
      t12,
      t13
    ] });
    $[36] = t11;
    $[37] = t12;
    $[38] = t13;
    $[39] = t14;
  } else {
    t14 = $[39];
  }
  let t15;
  if ($[40] !== clockCentered || $[41] !== theme.palette.accent || $[42] !== theme.palette.textPrimary) {
    t15 = clockCentered && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { style: {
      position: "absolute",
      left: "50%",
      top: 0,
      bottom: 0,
      transform: "translateX(-50%)",
      display: "flex",
      alignItems: "center"
    }, children: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(SystemClock, { color: theme.palette.textPrimary, accent: theme.palette.accent }) });
    $[40] = clockCentered;
    $[41] = theme.palette.accent;
    $[42] = theme.palette.textPrimary;
    $[43] = t15;
  } else {
    t15 = $[43];
  }
  let t16;
  if ($[44] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t16 = {
      display: "flex",
      alignItems: "center",
      gap: 14
    };
    $[44] = t16;
  } else {
    t16 = $[44];
  }
  let t17;
  if ($[45] !== clockCentered) {
    t17 = !clockCentered && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(WorkspaceIndicator, {});
    $[45] = clockCentered;
    $[46] = t17;
  } else {
    t17 = $[46];
  }
  let t18;
  if ($[47] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t18 = /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(StatusItems, {});
    $[47] = t18;
  } else {
    t18 = $[47];
  }
  let t19;
  if ($[48] !== clockCentered) {
    t19 = !clockCentered && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(SpotlightTrigger, {});
    $[48] = clockCentered;
    $[49] = t19;
  } else {
    t19 = $[49];
  }
  let t20;
  if ($[50] !== theme.chrome.quickSettings) {
    t20 = theme.chrome.quickSettings && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(QuickSettingsTrigger, {});
    $[50] = theme.chrome.quickSettings;
    $[51] = t20;
  } else {
    t20 = $[51];
  }
  let t21;
  if ($[52] !== clockCentered || $[53] !== theme.palette.accent || $[54] !== theme.palette.textSecondary) {
    t21 = !clockCentered && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(SystemClock, { color: theme.palette.textSecondary, accent: theme.palette.accent });
    $[52] = clockCentered;
    $[53] = theme.palette.accent;
    $[54] = theme.palette.textSecondary;
    $[55] = t21;
  } else {
    t21 = $[55];
  }
  let t22;
  if ($[56] !== t17 || $[57] !== t19 || $[58] !== t20 || $[59] !== t21) {
    t22 = /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { style: t16, children: [
      t17,
      t18,
      t19,
      t20,
      t21
    ] });
    $[56] = t17;
    $[57] = t19;
    $[58] = t20;
    $[59] = t21;
    $[60] = t22;
  } else {
    t22 = $[60];
  }
  let t23;
  if ($[61] !== t14 || $[62] !== t15 || $[63] !== t22 || $[64] !== t9) {
    t23 = /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("header", { "data-rui-menubar": "", style: t9, children: [
      t14,
      t15,
      t22
    ] });
    $[61] = t14;
    $[62] = t15;
    $[63] = t22;
    $[64] = t9;
    $[65] = t23;
  } else {
    t23 = $[65];
  }
  return t23;
}
function _temp10(e_1) {
  e_1.currentTarget.style.background = "transparent";
}
function AppMenus(t0) {
  const $ = (0, import_compiler_runtime13.c)(74);
  const {
    name,
    windowId,
    maximized
  } = t0;
  const {
    closeWindow,
    minimizeWindow,
    toggleMaximize
  } = (0, import_core4.useWindowManager)();
  const has = windowId !== null;
  let t1;
  if ($[0] !== windowId) {
    t1 = (fn) => () => {
      if (windowId) {
        fn(windowId);
      }
    };
    $[0] = windowId;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  const onWindow = t1;
  const edit = _temp23;
  const t2 = `About ${name}`;
  let t3;
  if ($[2] !== name) {
    t3 = () => (0, import_core4.notify)({
      title: name,
      body: `${name}, running on react-ui-os.`,
      level: "info"
    });
    $[2] = name;
    $[3] = t3;
  } else {
    t3 = $[3];
  }
  let t4;
  if ($[4] !== t2 || $[5] !== t3) {
    t4 = {
      label: t2,
      onSelect: t3
    };
    $[4] = t2;
    $[5] = t3;
    $[6] = t4;
  } else {
    t4 = $[6];
  }
  let t5;
  if ($[7] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t5 = {
      separator: true
    };
    $[7] = t5;
  } else {
    t5 = $[7];
  }
  const t6 = `Hide ${name}`;
  const t7 = !has;
  let t8;
  if ($[8] !== minimizeWindow || $[9] !== onWindow) {
    t8 = onWindow(minimizeWindow);
    $[8] = minimizeWindow;
    $[9] = onWindow;
    $[10] = t8;
  } else {
    t8 = $[10];
  }
  let t9;
  if ($[11] !== t6 || $[12] !== t7 || $[13] !== t8) {
    t9 = {
      label: t6,
      shortcut: "\u2318H",
      disabled: t7,
      onSelect: t8
    };
    $[11] = t6;
    $[12] = t7;
    $[13] = t8;
    $[14] = t9;
  } else {
    t9 = $[14];
  }
  let t10;
  if ($[15] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t10 = {
      separator: true
    };
    $[15] = t10;
  } else {
    t10 = $[15];
  }
  const t11 = `Quit ${name}`;
  const t12 = !has;
  let t13;
  if ($[16] !== closeWindow || $[17] !== onWindow) {
    t13 = onWindow(closeWindow);
    $[16] = closeWindow;
    $[17] = onWindow;
    $[18] = t13;
  } else {
    t13 = $[18];
  }
  let t14;
  if ($[19] !== t11 || $[20] !== t12 || $[21] !== t13) {
    t14 = {
      label: t11,
      shortcut: "\u2318Q",
      disabled: t12,
      onSelect: t13
    };
    $[19] = t11;
    $[20] = t12;
    $[21] = t13;
    $[22] = t14;
  } else {
    t14 = $[22];
  }
  let t15;
  if ($[23] !== t14 || $[24] !== t4 || $[25] !== t9) {
    t15 = [t4, t5, t9, t10, t14];
    $[23] = t14;
    $[24] = t4;
    $[25] = t9;
    $[26] = t15;
  } else {
    t15 = $[26];
  }
  let t16;
  if ($[27] !== name || $[28] !== t15) {
    t16 = {
      label: name,
      bold: true,
      items: t15
    };
    $[27] = name;
    $[28] = t15;
    $[29] = t16;
  } else {
    t16 = $[29];
  }
  const t17 = !has;
  let t18;
  if ($[30] !== closeWindow || $[31] !== onWindow) {
    t18 = onWindow(closeWindow);
    $[30] = closeWindow;
    $[31] = onWindow;
    $[32] = t18;
  } else {
    t18 = $[32];
  }
  let t19;
  if ($[33] !== t17 || $[34] !== t18) {
    t19 = {
      label: "File",
      items: [{
        label: "Close Window",
        shortcut: "\u2318W",
        disabled: t17,
        onSelect: t18
      }]
    };
    $[33] = t17;
    $[34] = t18;
    $[35] = t19;
  } else {
    t19 = $[35];
  }
  let t20;
  if ($[36] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t20 = {
      label: "Undo",
      shortcut: "\u2318Z",
      onSelect: edit("undo")
    };
    $[36] = t20;
  } else {
    t20 = $[36];
  }
  let t21;
  let t22;
  if ($[37] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t21 = {
      label: "Redo",
      shortcut: "\u21E7\u2318Z",
      onSelect: edit("redo")
    };
    t22 = {
      separator: true
    };
    $[37] = t21;
    $[38] = t22;
  } else {
    t21 = $[37];
    t22 = $[38];
  }
  let t23;
  if ($[39] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t23 = {
      label: "Cut",
      shortcut: "\u2318X",
      onSelect: edit("cut")
    };
    $[39] = t23;
  } else {
    t23 = $[39];
  }
  let t24;
  if ($[40] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t24 = {
      label: "Copy",
      shortcut: "\u2318C",
      onSelect: edit("copy")
    };
    $[40] = t24;
  } else {
    t24 = $[40];
  }
  let t25;
  if ($[41] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t25 = {
      label: "Paste",
      shortcut: "\u2318V",
      onSelect: edit("paste")
    };
    $[41] = t25;
  } else {
    t25 = $[41];
  }
  let t26;
  if ($[42] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t26 = {
      label: "Edit",
      items: [t20, t21, t22, t23, t24, t25, {
        label: "Select All",
        shortcut: "\u2318A",
        onSelect: edit("selectAll")
      }]
    };
    $[42] = t26;
  } else {
    t26 = $[42];
  }
  const t27 = maximized ? "Exit Full Screen" : "Enter Full Screen";
  const t28 = !has;
  let t29;
  if ($[43] !== onWindow || $[44] !== toggleMaximize) {
    t29 = onWindow(toggleMaximize);
    $[43] = onWindow;
    $[44] = toggleMaximize;
    $[45] = t29;
  } else {
    t29 = $[45];
  }
  let t30;
  if ($[46] !== t27 || $[47] !== t28 || $[48] !== t29) {
    t30 = {
      label: "View",
      items: [{
        label: t27,
        shortcut: "\u2303\u2318F",
        disabled: t28,
        onSelect: t29
      }]
    };
    $[46] = t27;
    $[47] = t28;
    $[48] = t29;
    $[49] = t30;
  } else {
    t30 = $[49];
  }
  const t31 = !has;
  let t32;
  if ($[50] !== minimizeWindow || $[51] !== onWindow) {
    t32 = onWindow(minimizeWindow);
    $[50] = minimizeWindow;
    $[51] = onWindow;
    $[52] = t32;
  } else {
    t32 = $[52];
  }
  let t33;
  if ($[53] !== t31 || $[54] !== t32) {
    t33 = {
      label: "Minimize",
      shortcut: "\u2318M",
      disabled: t31,
      onSelect: t32
    };
    $[53] = t31;
    $[54] = t32;
    $[55] = t33;
  } else {
    t33 = $[55];
  }
  const t34 = !has;
  let t35;
  if ($[56] !== onWindow || $[57] !== toggleMaximize) {
    t35 = onWindow(toggleMaximize);
    $[56] = onWindow;
    $[57] = toggleMaximize;
    $[58] = t35;
  } else {
    t35 = $[58];
  }
  let t36;
  if ($[59] !== t34 || $[60] !== t35) {
    t36 = {
      label: "Zoom",
      disabled: t34,
      onSelect: t35
    };
    $[59] = t34;
    $[60] = t35;
    $[61] = t36;
  } else {
    t36 = $[61];
  }
  let t37;
  if ($[62] !== t33 || $[63] !== t36) {
    t37 = {
      label: "Window",
      items: [t33, t36]
    };
    $[62] = t33;
    $[63] = t36;
    $[64] = t37;
  } else {
    t37 = $[64];
  }
  let t38;
  if ($[65] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t38 = {
      label: "Help",
      items: [{
        label: "Search",
        onSelect: _temp32
      }]
    };
    $[65] = t38;
  } else {
    t38 = $[65];
  }
  let t39;
  if ($[66] !== t16 || $[67] !== t19 || $[68] !== t30 || $[69] !== t37) {
    t39 = [t16, t19, t26, t30, t37, t38];
    $[66] = t16;
    $[67] = t19;
    $[68] = t30;
    $[69] = t37;
    $[70] = t39;
  } else {
    t39 = $[70];
  }
  const menus = t39;
  let t40;
  if ($[71] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t40 = {
      display: "flex",
      alignItems: "center"
    };
    $[71] = t40;
  } else {
    t40 = $[71];
  }
  let t41;
  if ($[72] !== menus) {
    t41 = /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { style: t40, children: menus.map(_temp42) });
    $[72] = menus;
    $[73] = t41;
  } else {
    t41 = $[73];
  }
  return t41;
}
function _temp42(menu) {
  return /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(MenuTitle, { label: menu.label, bold: menu.bold, items: menu.items }, menu.label);
}
function _temp32() {
  return window.dispatchEvent(new CustomEvent(SPOTLIGHT_OPEN_EVENT));
}
function _temp23(command) {
  return () => {
    if (typeof document !== "undefined") {
      document.execCommand(command);
    }
  };
}
function MenuTitle(t0) {
  const $ = (0, import_compiler_runtime13.c)(16);
  const {
    label,
    bold,
    items: items3
  } = t0;
  const theme = useTheme();
  const hover = `${theme.palette.textPrimary}14`;
  const t1 = `${label} menu`;
  let t2;
  if ($[0] !== items3 || $[1] !== label) {
    t2 = (e) => {
      if (items3.length === 0) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      const r = e.currentTarget.getBoundingClientRect();
      openContextMenu({
        x: r.left,
        y: r.bottom + 4,
        items: items3,
        ariaLabel: `${label} menu`
      });
    };
    $[0] = items3;
    $[1] = label;
    $[2] = t2;
  } else {
    t2 = $[2];
  }
  let t3;
  if ($[3] !== hover) {
    t3 = (e_0) => {
      e_0.currentTarget.style.background = hover;
    };
    $[3] = hover;
    $[4] = t3;
  } else {
    t3 = $[4];
  }
  const t4 = bold ? 600 : 400;
  const t5 = `background ${String(theme.motion.dockHoverDurationMs)}ms ease`;
  let t6;
  if ($[5] !== t4 || $[6] !== t5 || $[7] !== theme.palette.textPrimary || $[8] !== theme.shape.small) {
    t6 = {
      appearance: "none",
      background: "transparent",
      border: 0,
      margin: 0,
      padding: "3px 8px",
      borderRadius: theme.shape.small,
      color: theme.palette.textPrimary,
      fontFamily: "inherit",
      fontSize: 13,
      fontWeight: t4,
      lineHeight: 1,
      cursor: "default",
      transition: t5
    };
    $[5] = t4;
    $[6] = t5;
    $[7] = theme.palette.textPrimary;
    $[8] = theme.shape.small;
    $[9] = t6;
  } else {
    t6 = $[9];
  }
  let t7;
  if ($[10] !== label || $[11] !== t1 || $[12] !== t2 || $[13] !== t3 || $[14] !== t6) {
    t7 = /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("button", { type: "button", "aria-haspopup": "menu", "aria-label": t1, onPointerDown: t2, onMouseEnter: t3, onMouseLeave: _temp53, style: t6, children: label });
    $[10] = label;
    $[11] = t1;
    $[12] = t2;
    $[13] = t3;
    $[14] = t6;
    $[15] = t7;
  } else {
    t7 = $[15];
  }
  return t7;
}
function _temp53(e_1) {
  e_1.currentTarget.style.background = "transparent";
}
function StatusItems() {
  const $ = (0, import_compiler_runtime13.c)(5);
  const items3 = (0, import_react12.useSyncExternalStore)(subscribeStatusItems, listStatusItems, listStatusItems);
  if (items3.length === 0) {
    return null;
  }
  let t0;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t0 = {
      display: "inline-flex",
      alignItems: "center",
      gap: 2
    };
    $[0] = t0;
  } else {
    t0 = $[0];
  }
  let t1;
  if ($[1] !== items3) {
    t1 = items3.map(_temp62);
    $[1] = items3;
    $[2] = t1;
  } else {
    t1 = $[2];
  }
  let t2;
  if ($[3] !== t1) {
    t2 = /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { role: "toolbar", "aria-label": "Status tray", style: t0, children: t1 });
    $[3] = t1;
    $[4] = t2;
  } else {
    t2 = $[4];
  }
  return t2;
}
function _temp62(item) {
  return /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(StatusItemView, { item }, item.id);
}
function StatusItemView(t0) {
  const $ = (0, import_compiler_runtime13.c)(28);
  const {
    item
  } = t0;
  const theme = useTheme();
  const color = theme.palette.textSecondary;
  const accent = theme.palette.accent;
  const hover = `${theme.palette.textPrimary}1a`;
  let t1;
  if ($[0] !== color) {
    t1 = {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      color,
      position: "relative",
      width: 18,
      height: 18
    };
    $[0] = color;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  let t2;
  if ($[2] !== accent || $[3] !== item.badge) {
    t2 = item.badge !== void 0 && item.badge !== "" && item.badge !== 0 && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { "aria-hidden": true, style: {
      position: "absolute",
      top: -3,
      right: -5,
      minWidth: 12,
      height: 12,
      borderRadius: 6,
      background: accent,
      color: "#0d1226",
      fontSize: 9,
      fontWeight: 700,
      padding: "0 3px",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      lineHeight: 1
    }, children: String(item.badge) });
    $[2] = accent;
    $[3] = item.badge;
    $[4] = t2;
  } else {
    t2 = $[4];
  }
  let t3;
  if ($[5] !== item.icon || $[6] !== t1 || $[7] !== t2) {
    t3 = /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("span", { style: t1, children: [
      item.icon,
      t2
    ] });
    $[5] = item.icon;
    $[6] = t1;
    $[7] = t2;
    $[8] = t3;
  } else {
    t3 = $[8];
  }
  const body = t3;
  const t4 = !item.onClick;
  const t5 = item.tooltip ?? item.id;
  const t6 = item.onClick ? "pointer" : "default";
  const t7 = `background ${String(theme.motion.dockHoverDurationMs)}ms ease`;
  let t8;
  if ($[9] !== color || $[10] !== t6 || $[11] !== t7 || $[12] !== theme.shape.small) {
    t8 = {
      appearance: "none",
      background: "transparent",
      border: 0,
      padding: "3px 5px",
      cursor: t6,
      borderRadius: theme.shape.small,
      display: "inline-flex",
      color,
      transition: t7
    };
    $[9] = color;
    $[10] = t6;
    $[11] = t7;
    $[12] = theme.shape.small;
    $[13] = t8;
  } else {
    t8 = $[13];
  }
  let t9;
  if ($[14] !== hover || $[15] !== item.onClick) {
    t9 = (e) => {
      if (!item.onClick) {
        return;
      }
      e.currentTarget.style.background = hover;
    };
    $[14] = hover;
    $[15] = item.onClick;
    $[16] = t9;
  } else {
    t9 = $[16];
  }
  let t10;
  if ($[17] !== body || $[18] !== item.onClick || $[19] !== t4 || $[20] !== t5 || $[21] !== t8 || $[22] !== t9) {
    t10 = /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("button", { type: "button", onClick: item.onClick, disabled: t4, "aria-label": t5, style: t8, onMouseEnter: t9, onMouseLeave: _temp72, children: body });
    $[17] = body;
    $[18] = item.onClick;
    $[19] = t4;
    $[20] = t5;
    $[21] = t8;
    $[22] = t9;
    $[23] = t10;
  } else {
    t10 = $[23];
  }
  const wrapped = t10;
  if (!item.tooltip) {
    return wrapped;
  }
  let t11;
  if ($[24] !== item.shortcut || $[25] !== item.tooltip || $[26] !== wrapped) {
    t11 = /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Tooltip, { text: item.tooltip, shortcut: item.shortcut, placement: "bottom", children: wrapped });
    $[24] = item.shortcut;
    $[25] = item.tooltip;
    $[26] = wrapped;
    $[27] = t11;
  } else {
    t11 = $[27];
  }
  return t11;
}
function _temp72(e_0) {
  e_0.currentTarget.style.background = "transparent";
}
function SpotlightTrigger() {
  const $ = (0, import_compiler_runtime13.c)(10);
  const theme = useTheme();
  const hover = `${theme.palette.textPrimary}1a`;
  const t0 = `background ${String(theme.motion.dockHoverDurationMs)}ms ease`;
  let t1;
  if ($[0] !== t0 || $[1] !== theme.palette.textPrimary || $[2] !== theme.shape.small) {
    t1 = {
      appearance: "none",
      background: "transparent",
      border: 0,
      padding: "3px 6px",
      cursor: "pointer",
      borderRadius: theme.shape.small,
      display: "inline-flex",
      alignItems: "center",
      color: theme.palette.textPrimary,
      transition: t0
    };
    $[0] = t0;
    $[1] = theme.palette.textPrimary;
    $[2] = theme.shape.small;
    $[3] = t1;
  } else {
    t1 = $[3];
  }
  let t2;
  if ($[4] !== hover) {
    t2 = (e) => {
      e.currentTarget.style.background = hover;
    };
    $[4] = hover;
    $[5] = t2;
  } else {
    t2 = $[5];
  }
  let t3;
  if ($[6] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t3 = /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("svg", { width: "15", height: "15", viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", "aria-hidden": true, children: [
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("circle", { cx: "6.8", cy: "6.8", r: "4.3" }),
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("path", { d: "M10 10 L14 14" })
    ] });
    $[6] = t3;
  } else {
    t3 = $[6];
  }
  let t4;
  if ($[7] !== t1 || $[8] !== t2) {
    t4 = /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Tooltip, { text: "Spotlight Search", shortcut: "\u2318K", placement: "bottom", children: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("button", { type: "button", "aria-label": "Spotlight Search", onClick: _temp82, style: t1, onMouseEnter: t2, onMouseLeave: _temp92, children: t3 }) });
    $[7] = t1;
    $[8] = t2;
    $[9] = t4;
  } else {
    t4 = $[9];
  }
  return t4;
}
function _temp92(e_0) {
  e_0.currentTarget.style.background = "transparent";
}
function _temp82() {
  window.dispatchEvent(new CustomEvent(SPOTLIGHT_OPEN_EVENT));
}
function QuickSettingsTrigger() {
  const $ = (0, import_compiler_runtime13.c)(12);
  const theme = useTheme();
  const hover = `${theme.palette.textPrimary}1a`;
  const t0 = `background ${String(theme.motion.dockHoverDurationMs)}ms ease`;
  let t1;
  if ($[0] !== t0 || $[1] !== theme.palette.textPrimary || $[2] !== theme.shape.small) {
    t1 = {
      appearance: "none",
      background: "transparent",
      border: 0,
      padding: "3px 7px",
      cursor: "pointer",
      borderRadius: theme.shape.small,
      display: "inline-flex",
      alignItems: "center",
      gap: 7,
      color: theme.palette.textPrimary,
      transition: t0
    };
    $[0] = t0;
    $[1] = theme.palette.textPrimary;
    $[2] = theme.shape.small;
    $[3] = t1;
  } else {
    t1 = $[3];
  }
  let t2;
  if ($[4] !== hover) {
    t2 = (e) => {
      e.currentTarget.style.background = hover;
    };
    $[4] = hover;
    $[5] = t2;
  } else {
    t2 = $[5];
  }
  let t3;
  let t4;
  let t5;
  if ($[6] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t3 = /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(NetworkGlyph, {});
    t4 = /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(SpeakerGlyph, {});
    t5 = /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(BatteryGlyph, {});
    $[6] = t3;
    $[7] = t4;
    $[8] = t5;
  } else {
    t3 = $[6];
    t4 = $[7];
    t5 = $[8];
  }
  let t6;
  if ($[9] !== t1 || $[10] !== t2) {
    t6 = /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Tooltip, { text: "Quick Settings", placement: "bottom", children: /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("button", { type: "button", "aria-haspopup": "dialog", "aria-label": "Quick Settings", onClick: _temp02, style: t1, onMouseEnter: t2, onMouseLeave: _temp1, children: [
      t3,
      t4,
      t5
    ] }) });
    $[9] = t1;
    $[10] = t2;
    $[11] = t6;
  } else {
    t6 = $[11];
  }
  return t6;
}
function _temp1(e_0) {
  e_0.currentTarget.style.background = "transparent";
}
function _temp02() {
  window.dispatchEvent(new CustomEvent(QUICK_SETTINGS_TOGGLE_EVENT));
}
function NetworkGlyph() {
  const $ = (0, import_compiler_runtime13.c)(1);
  let t0;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t0 = /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("svg", { width: 14, height: 14, viewBox: "0 0 14 14", fill: "currentColor", "aria-hidden": true, children: [
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("rect", { x: "1", y: "9", width: "2.4", height: "4", rx: "0.6" }),
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("rect", { x: "4.8", y: "6.5", width: "2.4", height: "6.5", rx: "0.6" }),
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("rect", { x: "8.6", y: "3.5", width: "2.4", height: "9.5", rx: "0.6" })
    ] });
    $[0] = t0;
  } else {
    t0 = $[0];
  }
  return t0;
}
function SpeakerGlyph() {
  const $ = (0, import_compiler_runtime13.c)(1);
  let t0;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t0 = /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("svg", { width: 14, height: 14, viewBox: "0 0 14 14", "aria-hidden": true, fill: "none", stroke: "currentColor", strokeWidth: 1.1, strokeLinejoin: "round", children: [
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("path", { d: "M2 5 H4 L7.5 2.5 V11.5 L4 9 H2 Z", fill: "currentColor", stroke: "none" }),
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("path", { d: "M9.5 5 Q11 7 9.5 9", strokeLinecap: "round" })
    ] });
    $[0] = t0;
  } else {
    t0 = $[0];
  }
  return t0;
}
function BatteryGlyph() {
  const $ = (0, import_compiler_runtime13.c)(1);
  let t0;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t0 = /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("svg", { width: 16, height: 14, viewBox: "0 0 16 14", "aria-hidden": true, fill: "none", stroke: "currentColor", strokeWidth: 1.1, children: [
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("rect", { x: "1", y: "4", width: "11", height: "6", rx: "1.4" }),
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("rect", { x: "3", y: "6", width: "6", height: "2", rx: "0.5", fill: "currentColor", stroke: "none" }),
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("rect", { x: "13", y: "5.6", width: "1.6", height: "2.8", rx: "0.6", fill: "currentColor", stroke: "none" })
    ] });
    $[0] = t0;
  } else {
    t0 = $[0];
  }
  return t0;
}
function WorkspaceIndicator() {
  const $ = (0, import_compiler_runtime13.c)(13);
  const theme = useTheme();
  const {
    state,
    switchWorkspace
  } = (0, import_core4.useWindowManager)();
  const workspaces = state.workspaces;
  const activeId = state.activeWorkspaceId;
  if (workspaces.length <= 1) {
    return null;
  }
  let t0;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t0 = {
      display: "inline-flex",
      gap: 4,
      padding: "2px 6px",
      borderRadius: 8
    };
    $[0] = t0;
  } else {
    t0 = $[0];
  }
  let t1;
  if ($[1] !== activeId || $[2] !== switchWorkspace || $[3] !== theme || $[4] !== workspaces) {
    let t22;
    if ($[6] !== activeId || $[7] !== switchWorkspace || $[8] !== theme || $[9] !== workspaces.length) {
      t22 = (id, idx) => {
        const isActive = id === activeId;
        return /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Tooltip, { text: `Workspace ${String(idx + 1)}`, shortcut: `\u2303\u2325${idx === 0 ? "1" : idx === workspaces.length - 1 ? String(workspaces.length) : String(idx + 1)}`, placement: "bottom", children: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("button", { type: "button", role: "tab", "aria-selected": isActive, "aria-label": `Workspace ${String(idx + 1)}`, onClick: () => switchWorkspace(id), style: {
          appearance: "none",
          border: 0,
          background: "transparent",
          padding: 4,
          cursor: "pointer",
          borderRadius: 999,
          display: "inline-flex"
        }, children: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { "aria-hidden": true, style: {
          display: "inline-block",
          width: isActive ? 14 : 6,
          height: 6,
          borderRadius: 3,
          background: isActive ? theme.palette.accent : theme.palette.textSecondary,
          opacity: isActive ? 1 : 0.55,
          transition: "width 140ms ease, opacity 140ms ease"
        } }) }) }, id);
      };
      $[6] = activeId;
      $[7] = switchWorkspace;
      $[8] = theme;
      $[9] = workspaces.length;
      $[10] = t22;
    } else {
      t22 = $[10];
    }
    t1 = workspaces.map(t22);
    $[1] = activeId;
    $[2] = switchWorkspace;
    $[3] = theme;
    $[4] = workspaces;
    $[5] = t1;
  } else {
    t1 = $[5];
  }
  let t2;
  if ($[11] !== t1) {
    t2 = /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { role: "tablist", "aria-label": "Workspaces", style: t0, children: t1 });
    $[11] = t1;
    $[12] = t2;
  } else {
    t2 = $[12];
  }
  return t2;
}
function SystemClock(t0) {
  const $ = (0, import_compiler_runtime13.c)(28);
  const {
    color,
    accent
  } = t0;
  const theme = useTheme();
  const hover = `${theme.palette.textPrimary}1a`;
  const {
    unreadCount
  } = (0, import_core4.useNotifications)();
  const [now, setNow] = (0, import_react12.useState)(null);
  let t1;
  let t2;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t1 = () => {
      setNow(/* @__PURE__ */ new Date());
      const id = window.setInterval(() => {
        setNow(/* @__PURE__ */ new Date());
      }, 3e4);
      return () => {
        window.clearInterval(id);
      };
    };
    t2 = [];
    $[0] = t1;
    $[1] = t2;
  } else {
    t1 = $[0];
    t2 = $[1];
  }
  (0, import_react12.useEffect)(t1, t2);
  if (!now) {
    let t32;
    if ($[2] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
      t32 = /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { style: {
        width: 92
      }, "aria-hidden": true });
      $[2] = t32;
    } else {
      t32 = $[2];
    }
    return t32;
  }
  let t3;
  if ($[3] !== now) {
    t3 = now.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit"
    });
    $[3] = now;
    $[4] = t3;
  } else {
    t3 = $[4];
  }
  const time = t3;
  let t4;
  if ($[5] !== now) {
    t4 = now.toLocaleDateString([], {
      weekday: "short"
    });
    $[5] = now;
    $[6] = t4;
  } else {
    t4 = $[6];
  }
  const weekday = t4;
  let t5;
  if ($[7] !== now) {
    t5 = now.toLocaleDateString([], {
      month: "short",
      day: "numeric"
    });
    $[7] = now;
    $[8] = t5;
  } else {
    t5 = $[8];
  }
  const monthDay = t5;
  const day = `${weekday} ${monthDay}`;
  const t6 = unreadCount > 0 ? `${String(unreadCount)} unread notification${unreadCount === 1 ? "" : "s"}` : "Notification Center";
  const t7 = unreadCount > 0 ? `${String(unreadCount)} unread notifications. Open Notification Center.` : "Open Notification Center";
  const t8 = `background ${String(theme.motion.dockHoverDurationMs)}ms ease`;
  let t9;
  if ($[9] !== color || $[10] !== t8 || $[11] !== theme.shape.small) {
    t9 = {
      appearance: "none",
      background: "transparent",
      border: 0,
      color,
      fontFamily: "inherit",
      fontSize: 12,
      padding: "3px 8px",
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      borderRadius: theme.shape.small,
      position: "relative",
      fontVariantNumeric: "tabular-nums",
      transition: t8
    };
    $[9] = color;
    $[10] = t8;
    $[11] = theme.shape.small;
    $[12] = t9;
  } else {
    t9 = $[12];
  }
  let t10;
  if ($[13] !== hover) {
    t10 = (e) => {
      e.currentTarget.style.background = hover;
    };
    $[13] = hover;
    $[14] = t10;
  } else {
    t10 = $[14];
  }
  let t11;
  if ($[15] !== accent || $[16] !== unreadCount) {
    t11 = unreadCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { "aria-hidden": true, style: {
      width: 6,
      height: 6,
      borderRadius: "50%",
      background: accent
    } });
    $[15] = accent;
    $[16] = unreadCount;
    $[17] = t11;
  } else {
    t11 = $[17];
  }
  let t12;
  if ($[18] !== day || $[19] !== t10 || $[20] !== t11 || $[21] !== t7 || $[22] !== t9 || $[23] !== time) {
    t12 = /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("button", { type: "button", onClick: _temp102, "aria-label": t7, style: t9, onMouseEnter: t10, onMouseLeave: _temp11, children: [
      t11,
      day,
      " ",
      time
    ] });
    $[18] = day;
    $[19] = t10;
    $[20] = t11;
    $[21] = t7;
    $[22] = t9;
    $[23] = time;
    $[24] = t12;
  } else {
    t12 = $[24];
  }
  let t13;
  if ($[25] !== t12 || $[26] !== t6) {
    t13 = /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Tooltip, { text: t6, placement: "bottom", children: t12 });
    $[25] = t12;
    $[26] = t6;
    $[27] = t13;
  } else {
    t13 = $[27];
  }
  return t13;
}
function _temp11(e_0) {
  e_0.currentTarget.style.background = "transparent";
}
function _temp102() {
  window.dispatchEvent(new CustomEvent(NOTIFICATION_CENTER_TOGGLE_EVENT));
}

// src/Dock.tsx
var import_compiler_runtime14 = require("react/compiler-runtime");
var import_react13 = require("react");
var import_core5 = require("@react-ui-os/core");

// src/launcher/launcher-open-store.ts
var open = false;
var listeners5 = /* @__PURE__ */ new Set();
function setLauncherOpen(value) {
  if (open === value) return;
  open = value;
  for (const listener of listeners5) listener();
}
function getLauncherOpen() {
  return open;
}
function subscribeLauncherOpen(listener) {
  listeners5.add(listener);
  return () => {
    listeners5.delete(listener);
  };
}

// src/util/app-icon.ts
function resolveAppIcon(app, theme) {
  const style = theme.chrome.iconStyle;
  return (style ? app.icons?.[style] : void 0) ?? app.icon;
}
function appIconBackground(app, theme) {
  const accent = app.accent ?? theme.palette.accent;
  const surface = theme.palette.appIconSurface;
  if (!surface) {
    return `linear-gradient(180deg, ${accent} 0%, ${accent}c0 100%)`;
  }
  return `linear-gradient(145deg, color-mix(in srgb, ${surface} 96%, ${accent}) 0%, color-mix(in srgb, ${surface} 88%, ${accent}) 52%, color-mix(in srgb, ${surface} 72%, ${accent}) 100%)`;
}
function appIconForeground(app, theme) {
  return theme.palette.appIconSurface ? app.accent ?? theme.palette.accent : "#fff";
}

// src/util/show-desktop.ts
function planShowDesktop(windows, activeWorkspaceId, stash) {
  const onWorkspace = windows.filter((w) => w.workspaceId === activeWorkspaceId);
  const visible = onWorkspace.filter((w) => w.state !== "minimized");
  if (visible.length > 0) {
    const ids = visible.map((w) => w.id);
    return {
      minimize: ids,
      restore: [],
      nextStash: ids
    };
  }
  const minimized = onWorkspace.filter((w) => w.state === "minimized");
  const live = new Set(minimized.map((w) => w.id));
  const source = stash.length > 0 ? stash : minimized.map((w) => w.id);
  return {
    minimize: [],
    restore: source.filter((id) => live.has(id)),
    nextStash: []
  };
}

// src/Dock.tsx
var import_jsx_runtime12 = require("react/jsx-runtime");
var MAG_SCALE = 1.5;
var MAG_DISTANCE = 140;
var SMOOTH_TAU = 0.05;
var SHOW_DESKTOP_WIDTH = 12;
var PRESS_SCALE = 0.86;
var PRESS_MS = 100;
function usePress() {
  const $ = (0, import_compiler_runtime14.c)(5);
  const [pressed, setPressed] = (0, import_react13.useState)(false);
  let t0;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t0 = () => setPressed(true);
    $[0] = t0;
  } else {
    t0 = $[0];
  }
  const down = t0;
  let t1;
  if ($[1] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t1 = () => setPressed(false);
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  const up = t1;
  let t2;
  if ($[2] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t2 = {
      onPointerDown: down,
      onPointerUp: up,
      onPointerLeave: up,
      onPointerCancel: up
    };
    $[2] = t2;
  } else {
    t2 = $[2];
  }
  let t3;
  if ($[3] !== pressed) {
    t3 = {
      pressed,
      handlers: t2
    };
    $[3] = pressed;
    $[4] = t3;
  } else {
    t3 = $[4];
  }
  return t3;
}
function pressStyle(pressed, reducedMotion) {
  return {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transform: pressed ? `scale(${String(PRESS_SCALE)})` : "scale(1)",
    transition: reducedMotion ? void 0 : `transform ${String(PRESS_MS)}ms ease-out`
  };
}
var TRAY_ALLOWANCE = 150;
var TRAY_ALLOWANCE_VERTICAL = 80;
function dockGlassFromSurface(surface) {
  const m = /rgba\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)/.exec(surface);
  const [, r, g, b, a] = m ?? [];
  if (r === void 0 || g === void 0 || b === void 0 || a === void 0) {
    return surface;
  }
  const alpha = Math.round(parseFloat(a) * 0.6 * 100) / 100;
  return `rgba(${r}, ${g}, ${b}, ${String(alpha)})`;
}
var AUTO_HIDE_EDGE = 3;
function useBackdropDisplacementSupported() {
  const $ = (0, import_compiler_runtime14.c)(2);
  const [ok, setOk] = (0, import_react13.useState)(false);
  let t0;
  let t1;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t0 = () => {
      if (typeof navigator === "undefined") {
        return;
      }
      const uaData = navigator.userAgentData;
      const brands = uaData?.brands ?? [];
      const chromium = brands.some(_temp12) || /Chrome\//.test(navigator.userAgent);
      setOk(chromium);
    };
    t1 = [];
    $[0] = t0;
    $[1] = t1;
  } else {
    t0 = $[0];
    t1 = $[1];
  }
  (0, import_react13.useEffect)(t0, t1);
  return ok;
}
function _temp12(b) {
  return /Chromium|Chrome|Edge/i.test(b.brand);
}
function Dock() {
  const theme = useTheme();
  const apps = useApps();
  const {
    state,
    openWindow,
    windows
  } = (0, import_core5.useWindowManager)();
  const mode = useViewportMode();
  const metrics = getChromeMetrics(mode);
  const position = theme.chrome.dockPosition;
  const isLeft = position === "left";
  const isRight = position === "right";
  const isTop = position === "top";
  const vertical = isLeft || isRight;
  const isBar = theme.chrome.dockStyle === "bar";
  const displacementOk = useBackdropDisplacementSupported();
  const liquidGlass = !isBar && Boolean(theme.chrome.liquidGlass) && displacementOk;
  const dockBackdrop = liquidGlass ? "blur(3px) url(#rui-liquid-glass) saturate(180%)" : theme.blur.surface;
  const barThickness = getBarThickness(theme, mode);
  const menuBarH = getMenuBarHeight(theme);
  const gap = isBar ? 4 : metrics.dockGap;
  const count = apps.length;
  const mag = theme.motion.dockMagnification ?? MAG_SCALE;
  const reducedMotion = useReducedMotion();
  const topMenuBar = theme.chrome.menuBar === "top";
  const showTray = isBar && !topMenuBar;
  const launcherTrailing = isBar && isLeft && topMenuBar;
  const showDesktop = isBar && (theme.chrome.showDesktopButton ?? false);
  const taskView = isBar && !launcherTrailing && (theme.chrome.taskViewButton ?? false);
  const taskbarMenu = isBar && (theme.chrome.taskbarContextMenu ?? false);
  const launcherInline = isBar && !launcherTrailing;
  const fullTile = getDockTileSize(theme, mode);
  const smallMode = isBar ? theme.chrome.dockSmallButtons ?? "never" : "never";
  const combine = isBar ? theme.chrome.dockCombineButtons ?? "always" : "always";
  const [viewLen, setViewLen] = (0, import_react13.useState)(null);
  (0, import_react13.useEffect)(() => {
    if (smallMode !== "when-full" && combine !== "when-full") return;
    const update = () => {
      setViewLen(vertical ? window.innerHeight : window.innerWidth);
    };
    update();
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("resize", update);
    };
  }, [smallMode, combine, vertical]);
  const clusterLen = (launcherInline ? fullTile + gap : 0) + (launcherInline && taskView ? fullTile + gap : 0) + (launcherTrailing ? fullTile + 12 : 0) + (showTray ? vertical ? TRAY_ALLOWANCE_VERTICAL : TRAY_ALLOWANCE : 0) + (showDesktop ? SHOW_DESKTOP_WIDTH : 0) + 16;
  const whenFullSmall = smallMode === "when-full" && viewLen !== null && shouldShrinkWhenFull({
    count,
    tile: fullTile,
    gap,
    fixed: clusterLen,
    available: viewLen
  });
  const small = smallMode === "always" || whenFullSmall;
  const base = whenFullSmall ? Math.round(fullTile * SMALL_TILE_RATIO) : fullTile;
  const iconScale = getDockIconScale(theme, small);
  const span = base + gap;
  const runningCount = isBar ? apps.filter((app) => windows.some((w) => w.id === (0, import_core5.windowIdOf)({
    kind: "app",
    appId: app.id
  }))).length : 0;
  const labeledLen = runningCount * (DOCK_LABELED_BUTTON_MAX + gap) + (count - runningCount) * span + clusterLen;
  const labeled = combine === "never" || combine === "when-full" && !vertical && (viewLen === null || labeledLen <= viewLen);
  const autoHide = isBar && (theme.chrome.dockAutoHide ?? false);
  const [revealed, setRevealed] = (0, import_react13.useState)(false);
  const revealedRef = (0, import_react13.useRef)(revealed);
  revealedRef.current = revealed;
  const [sizes2, setSizes] = (0, import_react13.useState)(() => apps.map(() => base));
  const sizesRef = (0, import_react13.useRef)(sizes2);
  const cursorRef = (0, import_react13.useRef)(null);
  const rafRef = (0, import_react13.useRef)(null);
  const lastRef = (0, import_react13.useRef)(0);
  const geomRef = (0, import_react13.useRef)({
    count,
    base,
    span,
    vertical,
    mag
  });
  geomRef.current = {
    count,
    base,
    span,
    vertical,
    mag
  };
  const tick = (0, import_react13.useCallback)((ts) => {
    const dt = lastRef.current ? Math.min((ts - lastRef.current) / 1e3, 0.05) : 0.016;
    lastRef.current = ts;
    const k = 1 - Math.exp(-dt / SMOOTH_TAU);
    const g = geomRef.current;
    const cursor = cursorRef.current;
    const center = typeof window === "undefined" ? 0 : (g.vertical ? window.innerHeight : window.innerWidth) / 2;
    const prev = sizesRef.current;
    let moving = false;
    const next = [];
    for (let i = 0; i < g.count; i++) {
      let target = g.base;
      if (cursor !== null) {
        const off = (i - (g.count - 1) / 2) * g.span;
        const d = Math.abs(cursor - center - off);
        const t = Math.max(0, 1 - d / MAG_DISTANCE);
        const ease = t * t * (3 - 2 * t);
        target = g.base * (1 + (g.mag - 1) * ease);
      }
      const c0 = prev[i] ?? g.base;
      let v = c0 + (target - c0) * k;
      if (Math.abs(target - v) < 0.3) v = target;
      else moving = true;
      next.push(v);
    }
    sizesRef.current = next;
    setSizes(next);
    if (moving || cursorRef.current !== null) {
      rafRef.current = requestAnimationFrame(tick);
    } else {
      rafRef.current = null;
      lastRef.current = 0;
    }
  }, []);
  const startLoop = (0, import_react13.useCallback)(() => {
    if (rafRef.current === null) {
      lastRef.current = 0;
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [tick]);
  useIsomorphicLayoutEffect(() => {
    if (sizesRef.current.length !== count) {
      const resized = Array.from({
        length: count
      }, (_, i_0) => sizesRef.current[i_0] ?? base);
      sizesRef.current = resized;
      setSizes(resized);
      return;
    }
    if (rafRef.current === null && sizesRef.current.some((s) => s !== base)) {
      const resized_0 = Array.from({
        length: count
      }, () => base);
      sizesRef.current = resized_0;
      setSizes(resized_0);
    }
  }, [count, base]);
  (0, import_react13.useEffect)(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);
  const taskbarSize = barThickness;
  (0, import_react13.useEffect)(() => {
    if (!autoHide || typeof window === "undefined") {
      setRevealed(false);
      return;
    }
    const onMove = (e) => {
      const dist = position === "left" ? e.clientX : position === "right" ? window.innerWidth - e.clientX : position === "top" ? e.clientY : window.innerHeight - e.clientY;
      if (!revealedRef.current) {
        if (dist <= AUTO_HIDE_EDGE) setRevealed(true);
      } else if (dist > taskbarSize) {
        setRevealed(false);
      }
    };
    const onLeave = () => {
      setRevealed(false);
    };
    window.addEventListener("pointermove", onMove);
    document.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, [autoHide, position, taskbarSize]);
  if (position === "hidden") return null;
  const crossSize = base + metrics.dockPadding * 2 + 2;
  const align = theme.chrome.dockAlign ?? "center";
  const barJustify = align === "start" ? "flex-start" : align === "end" ? "flex-end" : "center";
  const LAUNCHER_SLOT = 44;
  const FREE_EDGE = 8;
  const leadingPad = align === "center" ? 0 : FREE_EDGE;
  const trailingPad = align === "center" ? 0 : launcherTrailing ? base + 12 : isBar && showTray ? LAUNCHER_SLOT : FREE_EDGE;
  const barPadding = vertical ? `${String(leadingPad)}px 0 ${String(trailingPad)}px` : `0 ${String(trailingPad)}px 0 ${String(leadingPad)}px`;
  const handleMove = (e_0) => {
    cursorRef.current = vertical ? e_0.clientY : e_0.clientX;
    startLoop();
  };
  const handleLeave = () => {
    cursorRef.current = null;
    startLoop();
  };
  const handleBarContextMenu = (e_1) => {
    if (!taskbarMenu) return;
    if (e_1.target.closest("button")) return;
    e_1.preventDefault();
    const payload = {
      kind: "system",
      systemId: "settings"
    };
    openContextMenu({
      x: e_1.clientX,
      y: e_1.clientY,
      ariaLabel: "Taskbar",
      items: [{
        label: "Taskbar settings",
        onSelect: () => {
          requestSettingsSection("Taskbar");
          openWindow(payload, pickInitialBounds(payload, theme, apps, void 0, nextCascadeIndex(state)));
        }
      }]
    });
  };
  const cursorNow = cursorRef.current;
  let floatIndex = -1;
  let floatDist = Infinity;
  if (!isBar && cursorNow !== null && typeof window !== "undefined") {
    const center_0 = (vertical ? window.innerHeight : window.innerWidth) / 2;
    apps.forEach((__0, i_1) => {
      const off_0 = (i_1 - (count - 1) / 2) * span;
      const d_0 = Math.abs(cursorNow - center_0 - off_0);
      if (d_0 < floatDist) {
        floatDist = d_0;
        floatIndex = i_1;
      }
    });
  }
  const focusedSize = floatIndex >= 0 ? sizes2[floatIndex] ?? base : base;
  let labelOffset = metrics.dockPadding;
  for (let i_2 = 0; i_2 < floatIndex; i_2++) {
    labelOffset += (sizes2[i_2] ?? base) + gap;
  }
  if (floatIndex >= 0) labelOffset += focusedSize / 2;
  let barIndex = -1;
  let barLabelMain = 0;
  if (isBar && cursorNow !== null && typeof document !== "undefined") {
    for (let i_3 = 0; i_3 < count; i_3++) {
      const app_0 = apps[i_3];
      if (!app_0) continue;
      const el = document.querySelector(`[data-dock-app-id="${app_0.id}"]`);
      if (!el) continue;
      const r = el.getBoundingClientRect();
      const lo = vertical ? r.top : r.left;
      const hi = vertical ? r.bottom : r.right;
      if (cursorNow >= lo && cursorNow <= hi) {
        barIndex = i_3;
        barLabelMain = vertical ? el.offsetTop + el.offsetHeight / 2 : el.offsetLeft + el.offsetWidth / 2;
        break;
      }
    }
  }
  const focusedIndex = isBar ? barIndex : floatIndex;
  const focusedApp = focusedIndex >= 0 ? apps[focusedIndex] : void 0;
  const hoveredIsLabeled = labeled && focusedApp !== void 0 && windows.some((w_0) => w_0.id === (0, import_core5.windowIdOf)({
    kind: "app",
    appId: focusedApp.id
  }));
  const showLabel = focusedApp !== void 0 && (isBar || floatDist < MAG_DISTANCE * 0.55) && !hoveredIsLabeled;
  const navStyle = {
    position: "fixed",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: vertical ? "column" : "row",
    backgroundColor: isBar ? theme.palette.surface : dockGlassFromSurface(theme.palette.surface),
    backdropFilter: dockBackdrop,
    WebkitBackdropFilter: dockBackdrop,
    overflow: "visible",
    zIndex: 1200,
    userSelect: "none",
    ...isBar ? {
      // Flush taskbar: full span, square, only an edge-facing hairline.
      alignItems: "center",
      justifyContent: barJustify,
      gap,
      padding: barPadding,
      borderRadius: 0,
      ...vertical ? {
        // Sit below the top menu bar when there is one, so the bar can
        // span the full width above the dock (the GNOME arrangement).
        top: topMenuBar ? menuBarH : 0,
        bottom: 0,
        width: barThickness,
        ...isLeft ? {
          left: 0,
          borderRight: `1px solid ${theme.palette.border}`,
          boxShadow: "1px 0 8px rgba(0,0,0,0.12)"
        } : {
          right: 0,
          borderLeft: `1px solid ${theme.palette.border}`,
          boxShadow: "-1px 0 8px rgba(0,0,0,0.12)"
        }
      } : isTop ? {
        left: 0,
        right: 0,
        top: topMenuBar ? menuBarH : 0,
        height: barThickness,
        borderBottom: `1px solid ${theme.palette.border}`,
        boxShadow: "0 1px 8px rgba(0,0,0,0.12)"
      } : {
        left: 0,
        right: 0,
        bottom: 0,
        height: barThickness,
        borderTop: `1px solid ${theme.palette.border}`,
        boxShadow: "0 -1px 8px rgba(0,0,0,0.12)"
      },
      // Auto-hide slide. Reuse the genie translate timing: same character,
      // a system surface moving on and off the screen edge.
      ...autoHide ? {
        transform: revealed ? "none" : isLeft ? "translateX(-100%)" : isRight ? "translateX(100%)" : isTop ? "translateY(-100%)" : "translateY(100%)",
        transition: reducedMotion ? void 0 : `transform ${String(theme.motion.genieDurationMs)}ms ${theme.motion.genieEasing}`,
        willChange: "transform"
      } : {}
    } : {
      // Floating macOS pill: centered, offset from the edge, rounded.
      // Icons hug the screen edge so magnified tiles grow inward.
      alignItems: vertical ? isLeft ? "flex-start" : "flex-end" : isTop ? "flex-start" : "flex-end",
      gap,
      padding: metrics.dockPadding,
      border: `1px solid ${theme.palette.border}`,
      // Concentric corners (Apple's .containerConcentric rule): the
      // container radius is the tile radius plus its padding, so the gap to
      // the tiles is uniform all the way around the corner.
      borderRadius: theme.shape.dockTileRadius + metrics.dockPadding,
      // Tahoe's Liquid Glass dock carries a specular highlight on its top
      // edge (the light catching the glass), over the drop shadow. A thin
      // neutral inset line, not a glow.
      // Source: https://appleinsider.com/articles/25/06/11/liquid-glass-is-more-than-skin-deep-on-macos-tahoe
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5), 0 12px 32px -8px rgba(0,0,0,0.45)",
      ...vertical ? {
        ...isLeft ? {
          left: metrics.dockEdgeOffset
        } : {
          right: metrics.dockEdgeOffset
        },
        top: "50%",
        transform: "translateY(-50%)",
        width: crossSize
      } : {
        ...isTop ? {
          top: metrics.dockEdgeOffset
        } : {
          bottom: metrics.dockEdgeOffset
        },
        left: "50%",
        transform: "translateX(-50%)",
        height: crossSize
      }
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("nav", { "aria-label": "App dock", "data-dock-position": position, "data-rui-dock": "", onPointerMove: handleMove, onPointerLeave: handleLeave, onContextMenu: taskbarMenu ? handleBarContextMenu : void 0, style: navStyle, children: [
    theme.chrome.liquidGlass ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("svg", { "aria-hidden": true, width: "0", height: "0", style: {
      position: "absolute",
      width: 0,
      height: 0,
      pointerEvents: "none"
    }, children: /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("filter", { id: "rui-liquid-glass", x: "0", y: "0", width: "100%", height: "100%", children: [
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("feTurbulence", { type: "fractalNoise", baseFrequency: "0.01 0.012", numOctaves: "2", seed: "4", result: "noise" }),
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("feDisplacementMap", { in: "SourceGraphic", in2: "noise", scale: "20", xChannelSelector: "R", yChannelSelector: "G" })
    ] }) }) : null,
    launcherInline && /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(StartButton, { inline: true, vertical, tile: base, iconScale }),
    launcherInline && taskView && /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(TaskViewButton, { tile: base, iconScale }),
    apps.map((app_1, i_4) => /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(DockTile, { app: app_1, position, bar: isBar, size: Math.round(sizes2[i_4] ?? base), base, iconScale, labeled }, app_1.id)),
    showLabel && focusedApp ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { "aria-hidden": true, style: {
      position: "absolute",
      // The label sits on the bar's inner side, away from the screen
      // edge, whichever edge the bar is on.
      ...isBar ? vertical ? {
        top: barLabelMain,
        ...isLeft ? {
          left: barThickness + 8
        } : {
          right: barThickness + 8
        },
        transform: "translateY(-50%)"
      } : {
        left: barLabelMain,
        ...isTop ? {
          top: barThickness + 8
        } : {
          bottom: barThickness + 8
        },
        transform: "translateX(-50%)"
      } : vertical ? {
        top: labelOffset,
        ...isLeft ? {
          left: metrics.dockPadding + focusedSize + 12
        } : {
          right: metrics.dockPadding + focusedSize + 12
        },
        transform: "translateY(-50%)"
      } : {
        left: labelOffset,
        ...isTop ? {
          top: metrics.dockPadding + focusedSize + 12
        } : {
          bottom: metrics.dockPadding + focusedSize + 12
        },
        transform: "translateX(-50%)"
      },
      pointerEvents: "none",
      background: theme.palette.surface,
      backdropFilter: theme.blur.surface,
      WebkitBackdropFilter: theme.blur.surface,
      border: `1px solid ${theme.palette.border}`,
      borderRadius: theme.shape.small,
      padding: "3px 9px",
      fontSize: 12,
      fontWeight: 500,
      color: theme.palette.textPrimary,
      whiteSpace: "nowrap",
      boxShadow: "0 6px 16px -8px rgba(0,0,0,0.5)"
    }, children: focusedApp.name }) : null,
    launcherTrailing && /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(StartButton, { vertical, trailing: true, tile: base, iconScale }),
    showTray && /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(TaskbarTray, { vertical, trailingInset: showDesktop ? SHOW_DESKTOP_WIDTH : 0 }),
    showDesktop && /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(ShowDesktopButton, { vertical })
  ] });
}
function StartButton(t0) {
  const $ = (0, import_compiler_runtime14.c)(40);
  const {
    vertical,
    trailing: t1,
    inline: t2,
    tile: t3,
    iconScale
  } = t0;
  const trailing = t1 === void 0 ? false : t1;
  const inline = t2 === void 0 ? false : t2;
  const tile = t3 === void 0 ? 32 : t3;
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const launcherOpen = (0, import_react13.useSyncExternalStore)(subscribeLauncherOpen, getLauncherOpen, _temp24);
  const hover = `${theme.palette.textPrimary}14`;
  const active4 = `${theme.palette.textPrimary}1f`;
  const {
    pressed,
    handlers
  } = usePress();
  let t4;
  if ($[0] !== iconScale || $[1] !== theme.chrome.dockIconScale || $[2] !== tile) {
    t4 = Math.round(tile * (iconScale ?? theme.chrome.dockIconScale ?? 0.5));
    $[0] = iconScale;
    $[1] = theme.chrome.dockIconScale;
    $[2] = tile;
    $[3] = t4;
  } else {
    t4 = $[3];
  }
  const glyph = t4;
  let t5;
  if ($[4] !== hover || $[5] !== launcherOpen) {
    t5 = (e) => {
      if (!launcherOpen) {
        e.currentTarget.style.background = hover;
      }
    };
    $[4] = hover;
    $[5] = launcherOpen;
    $[6] = t5;
  } else {
    t5 = $[6];
  }
  let t6;
  if ($[7] !== active4 || $[8] !== launcherOpen) {
    t6 = (e_0) => {
      e_0.currentTarget.style.background = launcherOpen ? active4 : "transparent";
    };
    $[7] = active4;
    $[8] = launcherOpen;
    $[9] = t6;
  } else {
    t6 = $[9];
  }
  let t7;
  if ($[10] !== inline || $[11] !== trailing || $[12] !== vertical) {
    t7 = inline ? {
      position: "relative",
      flexShrink: 0
    } : {
      position: "absolute",
      ...vertical ? trailing ? {
        bottom: 6,
        left: "50%",
        transform: "translateX(-50%)"
      } : {
        top: 6,
        left: "50%",
        transform: "translateX(-50%)"
      } : trailing ? {
        right: 8,
        top: "50%",
        transform: "translateY(-50%)"
      } : {
        left: 8,
        top: "50%",
        transform: "translateY(-50%)"
      }
    };
    $[10] = inline;
    $[11] = trailing;
    $[12] = vertical;
    $[13] = t7;
  } else {
    t7 = $[13];
  }
  const t8 = launcherOpen ? active4 : "transparent";
  const t9 = `background ${String(theme.motion.dockHoverDurationMs)}ms ease`;
  let t10;
  if ($[14] !== t7 || $[15] !== t8 || $[16] !== t9 || $[17] !== theme.palette.accent || $[18] !== theme.shape.small || $[19] !== tile) {
    t10 = {
      ...t7,
      width: tile,
      height: tile,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: "none",
      background: t8,
      borderRadius: theme.shape.small,
      cursor: "pointer",
      color: theme.palette.accent,
      transition: t9
    };
    $[14] = t7;
    $[15] = t8;
    $[16] = t9;
    $[17] = theme.palette.accent;
    $[18] = theme.shape.small;
    $[19] = tile;
    $[20] = t10;
  } else {
    t10 = $[20];
  }
  let t11;
  if ($[21] !== pressed || $[22] !== reducedMotion) {
    t11 = pressStyle(pressed, reducedMotion);
    $[21] = pressed;
    $[22] = reducedMotion;
    $[23] = t11;
  } else {
    t11 = $[23];
  }
  let t12;
  if ($[24] !== glyph || $[25] !== theme.chrome.launcher || $[26] !== theme.chrome.launcherIcon || $[27] !== theme.chrome.launcherIconSrc || $[28] !== theme.palette.textPrimary) {
    t12 = theme.chrome.launcherIconSrc ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { "aria-hidden": true, style: {
      width: glyph,
      height: glyph,
      backgroundColor: theme.palette.textPrimary,
      maskImage: `url("${theme.chrome.launcherIconSrc}")`,
      WebkitMaskImage: `url("${theme.chrome.launcherIconSrc}")`,
      maskRepeat: "no-repeat",
      WebkitMaskRepeat: "no-repeat",
      maskPosition: "center",
      WebkitMaskPosition: "center",
      maskSize: "contain",
      WebkitMaskSize: "contain"
    } }) : /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(LauncherGlyph, { icon: theme.chrome.launcherIcon ?? launcherGlyphFor(theme.chrome.launcher), size: glyph });
    $[24] = glyph;
    $[25] = theme.chrome.launcher;
    $[26] = theme.chrome.launcherIcon;
    $[27] = theme.chrome.launcherIconSrc;
    $[28] = theme.palette.textPrimary;
    $[29] = t12;
  } else {
    t12 = $[29];
  }
  let t13;
  if ($[30] !== t11 || $[31] !== t12) {
    t13 = /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { style: t11, children: t12 });
    $[30] = t11;
    $[31] = t12;
    $[32] = t13;
  } else {
    t13 = $[32];
  }
  let t14;
  if ($[33] !== handlers || $[34] !== launcherOpen || $[35] !== t10 || $[36] !== t13 || $[37] !== t5 || $[38] !== t6) {
    t14 = /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("button", { type: "button", "aria-label": "Open launcher", "aria-expanded": launcherOpen, onClick: _temp33, ...handlers, onMouseEnter: t5, onMouseLeave: t6, style: t10, children: t13 });
    $[33] = handlers;
    $[34] = launcherOpen;
    $[35] = t10;
    $[36] = t13;
    $[37] = t5;
    $[38] = t6;
    $[39] = t14;
  } else {
    t14 = $[39];
  }
  return t14;
}
function _temp33() {
  window.dispatchEvent(new CustomEvent(SPOTLIGHT_OPEN_EVENT));
}
function _temp24() {
  return false;
}
function launcherGlyphFor(launcher) {
  if (launcher === "menu") return "windows";
  if (launcher === "grid") return "grid";
  return "dots";
}
var WINDOWS_LOGO_BLUE = "#0078d4";
function LauncherGlyph(t0) {
  const $ = (0, import_compiler_runtime14.c)(21);
  const {
    icon,
    size: t1
  } = t0;
  const size = t1 === void 0 ? 16 : t1;
  if (icon === "windows") {
    let t22;
    let t32;
    let t42;
    let t52;
    if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
      t22 = /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("rect", { x: "1", y: "1", width: "6.6", height: "6.6" });
      t32 = /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("rect", { x: "8.4", y: "1", width: "6.6", height: "6.6" });
      t42 = /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("rect", { x: "1", y: "8.4", width: "6.6", height: "6.6" });
      t52 = /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("rect", { x: "8.4", y: "8.4", width: "6.6", height: "6.6" });
      $[0] = t22;
      $[1] = t32;
      $[2] = t42;
      $[3] = t52;
    } else {
      t22 = $[0];
      t32 = $[1];
      t42 = $[2];
      t52 = $[3];
    }
    let t62;
    if ($[4] !== size) {
      t62 = /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: WINDOWS_LOGO_BLUE, "aria-hidden": true, children: [
        t22,
        t32,
        t42,
        t52
      ] });
      $[4] = size;
      $[5] = t62;
    } else {
      t62 = $[5];
    }
    return t62;
  }
  if (icon === "grid") {
    let t22;
    if ($[6] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
      t22 = [3, 8, 13].map(_temp43);
      $[6] = t22;
    } else {
      t22 = $[6];
    }
    let t32;
    if ($[7] !== size) {
      t32 = /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "currentColor", "aria-hidden": true, children: t22 });
      $[7] = size;
      $[8] = t32;
    } else {
      t32 = $[8];
    }
    return t32;
  }
  if (icon === "ubuntu") {
    let t22;
    let t32;
    let t42;
    let t52;
    if ($[9] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
      t22 = /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("circle", { cx: "8", cy: "8", r: "5", fill: "none", stroke: "currentColor", strokeWidth: "1.3" });
      t32 = /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("circle", { cx: "8", cy: "3", r: "1.75" });
      t42 = /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("circle", { cx: "3.67", cy: "10.5", r: "1.75" });
      t52 = /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("circle", { cx: "12.33", cy: "10.5", r: "1.75" });
      $[9] = t22;
      $[10] = t32;
      $[11] = t42;
      $[12] = t52;
    } else {
      t22 = $[9];
      t32 = $[10];
      t42 = $[11];
      t52 = $[12];
    }
    let t62;
    if ($[13] !== size) {
      t62 = /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "currentColor", "aria-hidden": true, children: [
        t22,
        t32,
        t42,
        t52
      ] });
      $[13] = size;
      $[14] = t62;
    } else {
      t62 = $[14];
    }
    return t62;
  }
  let t2;
  let t3;
  let t4;
  let t5;
  if ($[15] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t2 = /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("rect", { x: "1", y: "1", width: "6", height: "6", rx: "1.5" });
    t3 = /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("rect", { x: "9", y: "1", width: "6", height: "6", rx: "1.5" });
    t4 = /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("rect", { x: "1", y: "9", width: "6", height: "6", rx: "1.5" });
    t5 = /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("rect", { x: "9", y: "9", width: "6", height: "6", rx: "1.5" });
    $[15] = t2;
    $[16] = t3;
    $[17] = t4;
    $[18] = t5;
  } else {
    t2 = $[15];
    t3 = $[16];
    t4 = $[17];
    t5 = $[18];
  }
  let t6;
  if ($[19] !== size) {
    t6 = /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "currentColor", "aria-hidden": true, children: [
      t2,
      t3,
      t4,
      t5
    ] });
    $[19] = size;
    $[20] = t6;
  } else {
    t6 = $[20];
  }
  return t6;
}
function _temp43(cy) {
  return [3, 8, 13].map((cx) => /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("circle", { cx, cy, r: "1.5" }, `${cx}-${cy}`));
}
function TaskViewButton(t0) {
  const $ = (0, import_compiler_runtime14.c)(28);
  const {
    tile: t1,
    iconScale
  } = t0;
  const tile = t1 === void 0 ? 32 : t1;
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const hover = `${theme.palette.textPrimary}14`;
  const {
    pressed,
    handlers
  } = usePress();
  let t2;
  if ($[0] !== iconScale || $[1] !== theme.chrome || $[2] !== tile) {
    t2 = Math.round(tile * (iconScale ?? theme.chrome.dockIconScale ?? 0.5));
    $[0] = iconScale;
    $[1] = theme.chrome;
    $[2] = tile;
    $[3] = t2;
  } else {
    t2 = $[3];
  }
  const glyph = t2;
  let t3;
  if ($[4] !== hover) {
    t3 = (e) => {
      e.currentTarget.style.background = hover;
    };
    $[4] = hover;
    $[5] = t3;
  } else {
    t3 = $[5];
  }
  const t4 = `background ${String(theme.motion.dockHoverDurationMs)}ms ease`;
  let t5;
  if ($[6] !== t4 || $[7] !== theme.palette.textPrimary || $[8] !== theme.shape.small || $[9] !== tile) {
    t5 = {
      position: "relative",
      flexShrink: 0,
      width: tile,
      height: tile,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: "none",
      background: "transparent",
      borderRadius: theme.shape.small,
      cursor: "pointer",
      color: theme.palette.textPrimary,
      transition: t4
    };
    $[6] = t4;
    $[7] = theme.palette.textPrimary;
    $[8] = theme.shape.small;
    $[9] = tile;
    $[10] = t5;
  } else {
    t5 = $[10];
  }
  let t6;
  if ($[11] !== pressed || $[12] !== reducedMotion) {
    t6 = pressStyle(pressed, reducedMotion);
    $[11] = pressed;
    $[12] = reducedMotion;
    $[13] = t6;
  } else {
    t6 = $[13];
  }
  let t7;
  if ($[14] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t7 = /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("rect", { x: "4.5", y: "2.5", width: "11", height: "8", rx: "1.5", stroke: "currentColor", strokeWidth: "1.3" });
    $[14] = t7;
  } else {
    t7 = $[14];
  }
  let t8;
  if ($[15] !== theme.palette.surface) {
    t8 = /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("rect", { x: "2.5", y: "6.5", width: "9", height: "8", rx: "1.5", fill: theme.palette.surface, stroke: "currentColor", strokeWidth: "1.3" });
    $[15] = theme.palette.surface;
    $[16] = t8;
  } else {
    t8 = $[16];
  }
  let t9;
  if ($[17] !== glyph || $[18] !== t8) {
    t9 = /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("svg", { width: glyph, height: glyph, viewBox: "0 0 18 18", fill: "none", "aria-hidden": true, children: [
      t7,
      t8
    ] });
    $[17] = glyph;
    $[18] = t8;
    $[19] = t9;
  } else {
    t9 = $[19];
  }
  let t10;
  if ($[20] !== t6 || $[21] !== t9) {
    t10 = /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { style: t6, children: t9 });
    $[20] = t6;
    $[21] = t9;
    $[22] = t10;
  } else {
    t10 = $[22];
  }
  let t11;
  if ($[23] !== handlers || $[24] !== t10 || $[25] !== t3 || $[26] !== t5) {
    t11 = /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("button", { type: "button", "aria-label": "Task view", onClick: _temp54, ...handlers, onMouseEnter: t3, onMouseLeave: _temp63, style: t5, children: t10 });
    $[23] = handlers;
    $[24] = t10;
    $[25] = t3;
    $[26] = t5;
    $[27] = t11;
  } else {
    t11 = $[27];
  }
  return t11;
}
function _temp63(e_0) {
  e_0.currentTarget.style.background = "transparent";
}
function _temp54() {
  window.dispatchEvent(new CustomEvent(MISSION_CONTROL_TOGGLE_EVENT));
}
function ShowDesktopButton(t0) {
  const $ = (0, import_compiler_runtime14.c)(18);
  const {
    vertical
  } = t0;
  const theme = useTheme();
  const {
    state,
    windows,
    minimizeWindow,
    restoreWindow
  } = (0, import_core5.useWindowManager)();
  let t1;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t1 = [];
    $[0] = t1;
  } else {
    t1 = $[0];
  }
  const stashRef = (0, import_react13.useRef)(t1);
  let t2;
  if ($[1] !== minimizeWindow || $[2] !== restoreWindow || $[3] !== state.activeWorkspaceId || $[4] !== windows) {
    t2 = () => {
      const plan = planShowDesktop(windows, state.activeWorkspaceId, stashRef.current);
      plan.minimize.forEach((id) => {
        minimizeWindow(id);
      });
      plan.restore.forEach((id_0) => {
        restoreWindow(id_0);
      });
      stashRef.current = plan.nextStash;
    };
    $[1] = minimizeWindow;
    $[2] = restoreWindow;
    $[3] = state.activeWorkspaceId;
    $[4] = windows;
    $[5] = t2;
  } else {
    t2 = $[5];
  }
  const handleClick = t2;
  const hover = `${theme.palette.textPrimary}14`;
  let t3;
  if ($[6] !== hover) {
    t3 = (e) => {
      e.currentTarget.style.background = hover;
    };
    $[6] = hover;
    $[7] = t3;
  } else {
    t3 = $[7];
  }
  let t4;
  if ($[8] !== theme.palette.border || $[9] !== vertical) {
    t4 = vertical ? {
      bottom: 0,
      left: 0,
      right: 0,
      height: SHOW_DESKTOP_WIDTH,
      borderTop: `1px solid ${theme.palette.border}`
    } : {
      right: 0,
      top: 0,
      bottom: 0,
      width: SHOW_DESKTOP_WIDTH,
      borderLeft: `1px solid ${theme.palette.border}`
    };
    $[8] = theme.palette.border;
    $[9] = vertical;
    $[10] = t4;
  } else {
    t4 = $[10];
  }
  const t5 = `background ${String(theme.motion.dockHoverDurationMs)}ms ease`;
  let t6;
  if ($[11] !== t4 || $[12] !== t5) {
    t6 = {
      position: "absolute",
      ...t4,
      border: "none",
      background: "transparent",
      cursor: "pointer",
      padding: 0,
      transition: t5
    };
    $[11] = t4;
    $[12] = t5;
    $[13] = t6;
  } else {
    t6 = $[13];
  }
  let t7;
  if ($[14] !== handleClick || $[15] !== t3 || $[16] !== t6) {
    t7 = /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("button", { type: "button", "aria-label": "Show desktop", onClick: handleClick, onMouseEnter: t3, onMouseLeave: _temp73, style: t6 });
    $[14] = handleClick;
    $[15] = t3;
    $[16] = t6;
    $[17] = t7;
  } else {
    t7 = $[17];
  }
  return t7;
}
function _temp73(e_0) {
  e_0.currentTarget.style.background = "transparent";
}
function TaskbarTray(t0) {
  const $ = (0, import_compiler_runtime14.c)(41);
  const {
    vertical,
    trailingInset: t1
  } = t0;
  const trailingInset = t1 === void 0 ? 0 : t1;
  const theme = useTheme();
  const items3 = (0, import_react13.useSyncExternalStore)(subscribeStatusItems, listStatusItems, listStatusItems);
  const {
    unreadCount
  } = (0, import_core5.useNotifications)();
  const [now, setNow] = (0, import_react13.useState)(null);
  let t2;
  let t3;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t2 = () => {
      setNow(/* @__PURE__ */ new Date());
      const id = window.setInterval(() => {
        setNow(/* @__PURE__ */ new Date());
      }, 3e4);
      return () => {
        window.clearInterval(id);
      };
    };
    t3 = [];
    $[0] = t2;
    $[1] = t3;
  } else {
    t2 = $[0];
    t3 = $[1];
  }
  (0, import_react13.useEffect)(t2, t3);
  const hover = `${theme.palette.textPrimary}14`;
  let t4;
  if ($[2] !== now) {
    t4 = now ? now.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit"
    }) : "";
    $[2] = now;
    $[3] = t4;
  } else {
    t4 = $[3];
  }
  const time = t4;
  let t5;
  if ($[4] !== now) {
    t5 = now ? now.toLocaleDateString() : "";
    $[4] = now;
    $[5] = t5;
  } else {
    t5 = $[5];
  }
  const date = t5;
  let t6;
  if ($[6] !== trailingInset || $[7] !== vertical) {
    t6 = {
      position: "absolute",
      display: "flex",
      alignItems: "center",
      gap: 2,
      ...vertical ? {
        left: 0,
        right: 0,
        bottom: 6 + trailingInset,
        flexDirection: "column"
      } : {
        right: 6 + trailingInset,
        top: 0,
        bottom: 0
      }
    };
    $[6] = trailingInset;
    $[7] = vertical;
    $[8] = t6;
  } else {
    t6 = $[8];
  }
  let t7;
  if ($[9] !== items3) {
    t7 = items3.map(_temp83);
    $[9] = items3;
    $[10] = t7;
  } else {
    t7 = $[10];
  }
  const t8 = unreadCount > 0 ? `${String(unreadCount)} unread notifications. Open Notification Center.` : "Clock and notifications";
  let t9;
  if ($[11] !== hover) {
    t9 = (e) => {
      e.currentTarget.style.background = hover;
    };
    $[11] = hover;
    $[12] = t9;
  } else {
    t9 = $[12];
  }
  const t10 = vertical ? "4px 6px" : "0 8px";
  const t11 = vertical ? void 0 : "100%";
  const t12 = vertical ? "center" : "flex-end";
  const t13 = `background ${String(theme.motion.dockHoverDurationMs)}ms ease`;
  let t14;
  if ($[13] !== t10 || $[14] !== t11 || $[15] !== t12 || $[16] !== t13 || $[17] !== theme.palette.textPrimary || $[18] !== theme.shape.small) {
    t14 = {
      position: "relative",
      appearance: "none",
      border: "none",
      background: "transparent",
      cursor: "pointer",
      borderRadius: theme.shape.small,
      padding: t10,
      height: t11,
      display: "flex",
      flexDirection: "column",
      alignItems: t12,
      justifyContent: "center",
      gap: 1,
      color: theme.palette.textPrimary,
      fontFamily: "inherit",
      fontVariantNumeric: "tabular-nums",
      lineHeight: 1.2,
      transition: t13
    };
    $[13] = t10;
    $[14] = t11;
    $[15] = t12;
    $[16] = t13;
    $[17] = theme.palette.textPrimary;
    $[18] = theme.shape.small;
    $[19] = t14;
  } else {
    t14 = $[19];
  }
  let t15;
  if ($[20] !== theme.palette.accent || $[21] !== unreadCount) {
    t15 = unreadCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { "aria-hidden": true, style: {
      position: "absolute",
      top: 4,
      right: 4,
      width: 6,
      height: 6,
      borderRadius: "50%",
      background: theme.palette.accent
    } });
    $[20] = theme.palette.accent;
    $[21] = unreadCount;
    $[22] = t15;
  } else {
    t15 = $[22];
  }
  let t16;
  if ($[23] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t16 = {
      fontSize: 11
    };
    $[23] = t16;
  } else {
    t16 = $[23];
  }
  let t17;
  if ($[24] !== time) {
    t17 = /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { style: t16, children: time });
    $[24] = time;
    $[25] = t17;
  } else {
    t17 = $[25];
  }
  let t18;
  if ($[26] !== date || $[27] !== theme.palette.textSecondary || $[28] !== vertical) {
    t18 = !vertical && /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { style: {
      fontSize: 11,
      color: theme.palette.textSecondary
    }, children: date });
    $[26] = date;
    $[27] = theme.palette.textSecondary;
    $[28] = vertical;
    $[29] = t18;
  } else {
    t18 = $[29];
  }
  let t19;
  if ($[30] !== t14 || $[31] !== t15 || $[32] !== t17 || $[33] !== t18 || $[34] !== t8 || $[35] !== t9) {
    t19 = /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("button", { type: "button", onClick: _temp93, "aria-label": t8, onMouseEnter: t9, onMouseLeave: _temp03, style: t14, children: [
      t15,
      t17,
      t18
    ] });
    $[30] = t14;
    $[31] = t15;
    $[32] = t17;
    $[33] = t18;
    $[34] = t8;
    $[35] = t9;
    $[36] = t19;
  } else {
    t19 = $[36];
  }
  let t20;
  if ($[37] !== t19 || $[38] !== t6 || $[39] !== t7) {
    t20 = /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { style: t6, children: [
      t7,
      t19
    ] });
    $[37] = t19;
    $[38] = t6;
    $[39] = t7;
    $[40] = t20;
  } else {
    t20 = $[40];
  }
  return t20;
}
function _temp03(e_0) {
  e_0.currentTarget.style.background = "transparent";
}
function _temp93() {
  window.dispatchEvent(new CustomEvent(NOTIFICATION_CENTER_TOGGLE_EVENT));
}
function _temp83(item) {
  return /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(TrayStatusItem, { item }, item.id);
}
function TrayStatusItem(t0) {
  const $ = (0, import_compiler_runtime14.c)(19);
  const {
    item
  } = t0;
  const theme = useTheme();
  const hover = `${theme.palette.textPrimary}14`;
  const t1 = !item.onClick;
  const t2 = item.tooltip ?? item.id;
  let t3;
  if ($[0] !== hover || $[1] !== item.onClick) {
    t3 = (e) => {
      if (item.onClick) {
        e.currentTarget.style.background = hover;
      }
    };
    $[0] = hover;
    $[1] = item.onClick;
    $[2] = t3;
  } else {
    t3 = $[2];
  }
  const t4 = item.onClick ? "pointer" : "default";
  const t5 = `background ${String(theme.motion.dockHoverDurationMs)}ms ease`;
  let t6;
  if ($[3] !== t4 || $[4] !== t5 || $[5] !== theme.palette.textSecondary || $[6] !== theme.shape.small) {
    t6 = {
      position: "relative",
      appearance: "none",
      border: "none",
      background: "transparent",
      cursor: t4,
      borderRadius: theme.shape.small,
      padding: 5,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      color: theme.palette.textSecondary,
      transition: t5
    };
    $[3] = t4;
    $[4] = t5;
    $[5] = theme.palette.textSecondary;
    $[6] = theme.shape.small;
    $[7] = t6;
  } else {
    t6 = $[7];
  }
  let t7;
  if ($[8] !== item.badge || $[9] !== theme.palette.accent) {
    t7 = item.badge !== void 0 && item.badge !== "" && item.badge !== 0 && /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { "aria-hidden": true, style: {
      position: "absolute",
      top: -1,
      right: -1,
      minWidth: 12,
      height: 12,
      borderRadius: 6,
      background: theme.palette.accent,
      color: "#fff",
      fontSize: 9,
      fontWeight: 700,
      padding: "0 3px",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      lineHeight: 1
    }, children: String(item.badge) });
    $[8] = item.badge;
    $[9] = theme.palette.accent;
    $[10] = t7;
  } else {
    t7 = $[10];
  }
  let t8;
  if ($[11] !== item.icon || $[12] !== item.onClick || $[13] !== t1 || $[14] !== t2 || $[15] !== t3 || $[16] !== t6 || $[17] !== t7) {
    t8 = /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("button", { type: "button", onClick: item.onClick, disabled: t1, "aria-label": t2, onMouseEnter: t3, onMouseLeave: _temp13, style: t6, children: [
      item.icon,
      t7
    ] });
    $[11] = item.icon;
    $[12] = item.onClick;
    $[13] = t1;
    $[14] = t2;
    $[15] = t3;
    $[16] = t6;
    $[17] = t7;
    $[18] = t8;
  } else {
    t8 = $[18];
  }
  return t8;
}
function _temp13(e_0) {
  e_0.currentTarget.style.background = "transparent";
}
function DockTile(t0) {
  const $ = (0, import_compiler_runtime14.c)(113);
  const {
    app,
    position,
    bar,
    size,
    base,
    iconScale,
    labeled: t1
  } = t0;
  const labeled = t1 === void 0 ? false : t1;
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const apps = useApps();
  const {
    state,
    windows,
    focusedWindow,
    openWindow,
    focusWindow,
    closeWindow,
    minimizeWindow,
    restoreWindow
  } = (0, import_core5.useWindowManager)();
  const {
    unreadByApp
  } = (0, import_core5.useNotifications)();
  const {
    pressed,
    handlers
  } = usePress();
  let t2;
  if ($[0] !== app.id) {
    t2 = (0, import_core5.windowIdOf)({
      kind: "app",
      appId: app.id
    });
    $[0] = app.id;
    $[1] = t2;
  } else {
    t2 = $[1];
  }
  const id = t2;
  let t3;
  if ($[2] !== id || $[3] !== windows) {
    let t42;
    if ($[5] !== id) {
      t42 = (w) => w.id === id;
      $[5] = id;
      $[6] = t42;
    } else {
      t42 = $[6];
    }
    t3 = windows.find(t42);
    $[2] = id;
    $[3] = windows;
    $[4] = t3;
  } else {
    t3 = $[4];
  }
  const win = t3;
  const isFocused = focusedWindow?.id === id;
  const isMinimized = win?.state === "minimized";
  const badgeCount = unreadByApp[app.id] ?? 0;
  const buttonRef = (0, import_react13.useRef)(null);
  let t4;
  if ($[7] !== app.id || $[8] !== app.name || $[9] !== apps || $[10] !== badgeCount || $[11] !== closeWindow || $[12] !== focusWindow || $[13] !== id || $[14] !== isFocused || $[15] !== isMinimized || $[16] !== minimizeWindow || $[17] !== openWindow || $[18] !== restoreWindow || $[19] !== state || $[20] !== theme || $[21] !== win) {
    t4 = (e) => {
      e.preventDefault();
      const items3 = [];
      if (!win) {
        items3.push({
          label: `Open ${app.name}`,
          onSelect: () => openWindow({
            kind: "app",
            appId: app.id
          }, pickInitialBounds({
            kind: "app",
            appId: app.id
          }, theme, apps, void 0, nextCascadeIndex(state)))
        });
      } else {
        items3.push({
          label: isFocused ? "Window in front" : "Bring to front",
          disabled: isFocused && !isMinimized,
          onSelect: () => {
            if (isMinimized) {
              restoreWindow(id);
            } else {
              focusWindow(id);
            }
          }
        });
        items3.push({
          label: isMinimized ? "Restore" : "Minimize",
          shortcut: isMinimized ? void 0 : "\u2318M",
          onSelect: () => isMinimized ? restoreWindow(id) : minimizeWindow(id)
        });
        items3.push({
          label: "Close",
          shortcut: "\u2318W",
          onSelect: () => closeWindow(id)
        });
      }
      if (badgeCount > 0) {
        items3.push({
          separator: true
        });
        items3.push({
          label: `Mark ${String(badgeCount)} notification${badgeCount === 1 ? "" : "s"} as read`,
          onSelect: _temp103
        });
      }
      if (items3.length === 0) {
        return;
      }
      openContextMenu({
        x: e.clientX,
        y: e.clientY,
        items: items3,
        ariaLabel: `${app.name} dock menu`
      });
    };
    $[7] = app.id;
    $[8] = app.name;
    $[9] = apps;
    $[10] = badgeCount;
    $[11] = closeWindow;
    $[12] = focusWindow;
    $[13] = id;
    $[14] = isFocused;
    $[15] = isMinimized;
    $[16] = minimizeWindow;
    $[17] = openWindow;
    $[18] = restoreWindow;
    $[19] = state;
    $[20] = theme;
    $[21] = win;
    $[22] = t4;
  } else {
    t4 = $[22];
  }
  const handleContextMenu = t4;
  let t5;
  if ($[23] !== app.id || $[24] !== apps || $[25] !== bar || $[26] !== focusWindow || $[27] !== id || $[28] !== isFocused || $[29] !== isMinimized || $[30] !== minimizeWindow || $[31] !== openWindow || $[32] !== position || $[33] !== reducedMotion || $[34] !== restoreWindow || $[35] !== state || $[36] !== theme || $[37] !== win) {
    t5 = () => {
      if (!win) {
        openWindow({
          kind: "app",
          appId: app.id
        }, pickInitialBounds({
          kind: "app",
          appId: app.id
        }, theme, apps, void 0, nextCascadeIndex(state)));
        if (!bar && !reducedMotion) {
          bounce(buttonRef.current, position);
        }
        return;
      }
      if (isMinimized) {
        restoreWindow(id);
        return;
      }
      if (!isFocused) {
        focusWindow(id);
        return;
      }
      minimizeWindow(id);
    };
    $[23] = app.id;
    $[24] = apps;
    $[25] = bar;
    $[26] = focusWindow;
    $[27] = id;
    $[28] = isFocused;
    $[29] = isMinimized;
    $[30] = minimizeWindow;
    $[31] = openWindow;
    $[32] = position;
    $[33] = reducedMotion;
    $[34] = restoreWindow;
    $[35] = state;
    $[36] = theme;
    $[37] = win;
    $[38] = t5;
  } else {
    t5 = $[38];
  }
  const handleClick = t5;
  const accent = app.accent ?? theme.palette.accent;
  const glyphScale = iconScale ?? theme.chrome.dockIconScale ?? 0.5;
  const artScale = Math.min(glyphScale + 0.2, 0.92);
  const Art = app.iconArt;
  let t6;
  if ($[39] !== app || $[40] !== theme) {
    t6 = resolveAppIcon(app, theme);
    $[39] = app;
    $[40] = theme;
    $[41] = t6;
  } else {
    t6 = $[41];
  }
  const Icon = t6;
  const macosFullBleed = !bar && theme.chrome.iconStyle === "macos" && !!app.icons?.macos && !!Icon;
  const verticalTile = position === "left" || position === "right";
  const labeledButton = labeled && bar && !!win;
  const dur = theme.motion.dockHoverDurationMs;
  let t7;
  if ($[42] !== bar || $[43] !== base || $[44] !== size || $[45] !== theme.shape.dockTileRadius || $[46] !== theme.shape.small) {
    t7 = bar ? theme.shape.small : Math.round(theme.shape.dockTileRadius * (size / base));
    $[42] = bar;
    $[43] = base;
    $[44] = size;
    $[45] = theme.shape.dockTileRadius;
    $[46] = theme.shape.small;
    $[47] = t7;
  } else {
    t7 = $[47];
  }
  const radius = t7;
  const hoverBg = `${theme.palette.textPrimary}14`;
  const activeBg = bar && isFocused ? `${theme.palette.textPrimary}1f` : "transparent";
  let t8;
  if ($[48] !== bar || $[49] !== handlers) {
    t8 = bar ? handlers : {};
    $[48] = bar;
    $[49] = handlers;
    $[50] = t8;
  } else {
    t8 = $[50];
  }
  let t9;
  if ($[51] !== bar || $[52] !== hoverBg) {
    t9 = (e_0) => {
      if (bar) {
        e_0.currentTarget.style.background = hoverBg;
      }
    };
    $[51] = bar;
    $[52] = hoverBg;
    $[53] = t9;
  } else {
    t9 = $[53];
  }
  let t10;
  if ($[54] !== activeBg || $[55] !== bar) {
    t10 = (e_1) => {
      if (bar) {
        e_1.currentTarget.style.background = activeBg;
      }
    };
    $[54] = activeBg;
    $[55] = bar;
    $[56] = t10;
  } else {
    t10 = $[56];
  }
  let t11;
  if ($[57] !== labeledButton || $[58] !== size || $[59] !== verticalTile) {
    t11 = labeledButton ? {
      width: verticalTile ? "100%" : void 0,
      minWidth: size,
      maxWidth: verticalTile ? void 0 : DOCK_LABELED_BUTTON_MAX,
      height: size,
      padding: "0 10px 0 8px",
      gap: 8,
      justifyContent: "flex-start",
      boxSizing: "border-box"
    } : {
      width: size,
      height: size,
      padding: 0,
      justifyContent: "center"
    };
    $[57] = labeledButton;
    $[58] = size;
    $[59] = verticalTile;
    $[60] = t11;
  } else {
    t11 = $[60];
  }
  const t12 = macosFullBleed ? "transparent" : bar ? activeBg : appIconBackground(app, theme);
  const t13 = bar ? "none" : macosFullBleed ? "0 3px 8px rgba(0,0,0,0.3)" : "inset 0 1px 0 rgba(255,255,255,0.22), 0 2px 6px rgba(0,0,0,0.35)";
  const t14 = bar ? accent : appIconForeground(app, theme);
  const t15 = bar ? `background ${String(dur)}ms ease` : void 0;
  let t16;
  if ($[61] !== radius || $[62] !== t11 || $[63] !== t12 || $[64] !== t13 || $[65] !== t14 || $[66] !== t15) {
    t16 = {
      position: "relative",
      flexShrink: 0,
      ...t11,
      border: "none",
      borderRadius: radius,
      background: t12,
      boxShadow: t13,
      cursor: "pointer",
      color: t14,
      display: "flex",
      alignItems: "center",
      transition: t15
    };
    $[61] = radius;
    $[62] = t11;
    $[63] = t12;
    $[64] = t13;
    $[65] = t14;
    $[66] = t15;
    $[67] = t16;
  } else {
    t16 = $[67];
  }
  let t17;
  if ($[68] !== bar || $[69] !== pressed || $[70] !== reducedMotion) {
    t17 = bar ? pressStyle(pressed, reducedMotion) : void 0;
    $[68] = bar;
    $[69] = pressed;
    $[70] = reducedMotion;
    $[71] = t17;
  } else {
    t17 = $[71];
  }
  let t18;
  if ($[72] !== Art || $[73] !== Icon || $[74] !== app.name || $[75] !== artScale || $[76] !== bar || $[77] !== glyphScale || $[78] !== macosFullBleed || $[79] !== size) {
    t18 = macosFullBleed && Icon ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Icon, { size: Math.round(size * 0.92) }) : Art ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Art, { size: Math.round(size * artScale) }) : Icon ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Icon, { size: Math.round(size * glyphScale) }) : /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { style: {
      fontFamily: "inherit",
      fontWeight: 700,
      fontSize: Math.round(size * (glyphScale - 0.1)),
      textShadow: bar ? void 0 : "0 1px 2px rgba(0,0,0,0.4)"
    }, children: app.name.charAt(0).toUpperCase() });
    $[72] = Art;
    $[73] = Icon;
    $[74] = app.name;
    $[75] = artScale;
    $[76] = bar;
    $[77] = glyphScale;
    $[78] = macosFullBleed;
    $[79] = size;
    $[80] = t18;
  } else {
    t18 = $[80];
  }
  let t19;
  if ($[81] !== t17 || $[82] !== t18) {
    t19 = /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { style: t17, children: t18 });
    $[81] = t17;
    $[82] = t18;
    $[83] = t19;
  } else {
    t19 = $[83];
  }
  let t20;
  if ($[84] !== app.name || $[85] !== labeledButton || $[86] !== theme.palette.textPrimary) {
    t20 = labeledButton ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { style: {
      minWidth: 0,
      fontSize: 12,
      fontFamily: "inherit",
      color: theme.palette.textPrimary,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    }, children: app.name }) : null;
    $[84] = app.name;
    $[85] = labeledButton;
    $[86] = theme.palette.textPrimary;
    $[87] = t20;
  } else {
    t20 = $[87];
  }
  let t21;
  if ($[88] !== accent || $[89] !== bar || $[90] !== dur || $[91] !== isFocused || $[92] !== position || $[93] !== theme.palette.textPrimary || $[94] !== theme.palette.textSecondary || $[95] !== verticalTile || $[96] !== win) {
    t21 = win && (bar ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { "aria-hidden": true, style: {
      position: "absolute",
      borderRadius: 2,
      backgroundColor: isFocused ? accent : theme.palette.textSecondary,
      opacity: isFocused ? 1 : 0.7,
      transition: `width ${String(dur)}ms ease, height ${String(dur)}ms ease, opacity ${String(dur)}ms ease`,
      ...verticalTile ? {
        ...position === "left" ? {
          left: 0
        } : {
          right: 0
        },
        top: "50%",
        transform: "translateY(-50%)",
        width: 3,
        height: isFocused ? 16 : 8
      } : {
        ...position === "top" ? {
          top: 0
        } : {
          bottom: 0
        },
        left: "50%",
        transform: "translateX(-50%)",
        width: isFocused ? 16 : 8,
        height: 3
      }
    } }) : /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { "aria-hidden": true, style: {
      position: "absolute",
      ...verticalTile ? {
        ...position === "left" ? {
          left: -6
        } : {
          right: -6
        },
        top: "50%",
        transform: "translateY(-50%)"
      } : {
        ...position === "top" ? {
          top: -6
        } : {
          bottom: -6
        },
        left: "50%",
        transform: "translateX(-50%)"
      },
      width: 4,
      height: 4,
      borderRadius: "50%",
      backgroundColor: isFocused ? theme.palette.textPrimary : theme.palette.textSecondary,
      opacity: isFocused ? 1 : 0.6,
      transition: `opacity ${String(dur)}ms ease`
    } }));
    $[88] = accent;
    $[89] = bar;
    $[90] = dur;
    $[91] = isFocused;
    $[92] = position;
    $[93] = theme.palette.textPrimary;
    $[94] = theme.palette.textSecondary;
    $[95] = verticalTile;
    $[96] = win;
    $[97] = t21;
  } else {
    t21 = $[97];
  }
  let t22;
  if ($[98] !== badgeCount) {
    t22 = badgeCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { "aria-label": `${String(badgeCount)} unread notifications`, style: {
      position: "absolute",
      top: -4,
      right: -4,
      minWidth: 18,
      height: 18,
      padding: "0 5px",
      borderRadius: 9,
      background: "#ef4444",
      color: "#fff",
      fontSize: 10,
      fontWeight: 700,
      fontFamily: "inherit",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 0 0 2px rgba(0,0,0,0.55)",
      lineHeight: 1
    }, children: badgeCount > 99 ? "99+" : String(badgeCount) });
    $[98] = badgeCount;
    $[99] = t22;
  } else {
    t22 = $[99];
  }
  let t23;
  if ($[100] !== app.id || $[101] !== app.name || $[102] !== handleClick || $[103] !== handleContextMenu || $[104] !== t10 || $[105] !== t16 || $[106] !== t19 || $[107] !== t20 || $[108] !== t21 || $[109] !== t22 || $[110] !== t8 || $[111] !== t9) {
    t23 = /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("button", { ref: buttonRef, type: "button", onClick: handleClick, onContextMenu: handleContextMenu, "aria-label": app.name, "data-dock-app-id": app.id, ...t8, onMouseEnter: t9, onMouseLeave: t10, style: t16, children: [
      t19,
      t20,
      t21,
      t22
    ] });
    $[100] = app.id;
    $[101] = app.name;
    $[102] = handleClick;
    $[103] = handleContextMenu;
    $[104] = t10;
    $[105] = t16;
    $[106] = t19;
    $[107] = t20;
    $[108] = t21;
    $[109] = t22;
    $[110] = t8;
    $[111] = t9;
    $[112] = t23;
  } else {
    t23 = $[112];
  }
  return t23;
}
function _temp103() {
  return (0, import_core5.markAllNotificationsRead)();
}
function bounce(el, position) {
  if (!el || typeof el.animate !== "function") return;
  const hop = (px) => position === "left" ? `translateX(${String(px)}px)` : position === "right" ? `translateX(${String(-px)}px)` : position === "top" ? `translateY(${String(px)}px)` : `translateY(${String(-px)}px)`;
  const up = hop(18);
  const up2 = hop(7);
  const rest = "translate(0, 0)";
  el.animate([{
    transform: rest
  }, {
    transform: up,
    offset: 0.3
  }, {
    transform: rest,
    offset: 0.55
  }, {
    transform: up2,
    offset: 0.78
  }, {
    transform: rest,
    offset: 1
  }], {
    duration: 560,
    easing: "ease-out"
  });
}
function getDockTileRect(appId) {
  if (typeof document === "undefined") return null;
  const el = document.querySelector(`[data-dock-app-id="${appId}"]`);
  return el ? el.getBoundingClientRect() : null;
}

// src/WindowLayer.tsx
var import_compiler_runtime18 = require("react/compiler-runtime");
var import_core7 = require("@react-ui-os/core");

// src/Window.tsx
var import_compiler_runtime17 = require("react/compiler-runtime");
var import_react16 = require("react");
var import_core6 = require("@react-ui-os/core");

// src/util/clamp.ts
function clamp2(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
function clampWindowToWorkArea(x, y, w, h, workArea, edgeBuffer = 24) {
  const originX = workArea.x ?? 0;
  const originY = workArea.y ?? 0;
  const minX = originX - w + 64;
  const maxX = originX + workArea.width - 64;
  const minY = originY;
  const maxY = originY + workArea.height - edgeBuffer;
  return {
    x: clamp2(x, minX, maxX),
    y: clamp2(y, minY, maxY)
  };
}

// src/snap/SnapPreview.tsx
var import_compiler_runtime15 = require("react/compiler-runtime");
var import_react14 = require("react");

// src/snap/snap-store.ts
var active2 = null;
var listeners6 = /* @__PURE__ */ new Set();
function emit3() {
  for (const listener of listeners6) listener(active2);
}
function setSnapPreview(state) {
  if (active2 === null && state === null) return;
  if (active2 && state && active2.windowId === state.windowId && active2.zone === state.zone) {
    return;
  }
  active2 = state;
  emit3();
}
function getSnapPreview() {
  return active2;
}
function subscribeSnapPreview(listener) {
  listeners6.add(listener);
  return () => {
    listeners6.delete(listener);
  };
}
var EDGE_THRESHOLD = 24;
var CORNER_THRESHOLD = 48;
function computeSnapZone(pointerX, pointerY, work) {
  const top = pointerY <= work.y + EDGE_THRESHOLD;
  const bottom = pointerY >= work.y + work.height - EDGE_THRESHOLD;
  const left = pointerX <= work.x + EDGE_THRESHOLD;
  const right = pointerX >= work.x + work.width - EDGE_THRESHOLD;
  const cornerLeft = pointerX <= work.x + CORNER_THRESHOLD;
  const cornerRight = pointerX >= work.x + work.width - CORNER_THRESHOLD;
  if (top && cornerLeft) return "top-left-quarter";
  if (top && cornerRight) return "top-right-quarter";
  if (bottom && cornerLeft) return "bottom-left-quarter";
  if (bottom && cornerRight) return "bottom-right-quarter";
  if (top) return "top-max";
  if (left) return "left-half";
  if (right) return "right-half";
  return null;
}
function rectForZone(zone, work) {
  const halfW = Math.floor(work.width / 2);
  const halfH = Math.floor(work.height / 2);
  switch (zone) {
    case "left-half":
      return {
        x: work.x,
        y: work.y,
        w: halfW,
        h: work.height
      };
    case "right-half":
      return {
        x: work.x + work.width - halfW,
        y: work.y,
        w: halfW,
        h: work.height
      };
    case "top-max":
      return {
        x: work.x,
        y: work.y,
        w: work.width,
        h: work.height
      };
    case "top-left-quarter":
      return {
        x: work.x,
        y: work.y,
        w: halfW,
        h: halfH
      };
    case "top-right-quarter":
      return {
        x: work.x + work.width - halfW,
        y: work.y,
        w: halfW,
        h: halfH
      };
    case "bottom-left-quarter":
      return {
        x: work.x,
        y: work.y + work.height - halfH,
        w: halfW,
        h: halfH
      };
    case "bottom-right-quarter":
      return {
        x: work.x + work.width - halfW,
        y: work.y + work.height - halfH,
        w: halfW,
        h: halfH
      };
  }
}

// src/snap/SnapPreview.tsx
var import_jsx_runtime13 = require("react/jsx-runtime");
function SnapPreview() {
  const $ = (0, import_compiler_runtime15.c)(8);
  const theme = useTheme();
  const state = (0, import_react14.useSyncExternalStore)(subscribeSnapPreview, getSnapPreview, _temp14);
  if (!state) {
    return null;
  }
  const {
    rect
  } = state;
  const accent = theme.palette.accent;
  const t0 = `${accent}22`;
  const t1 = `2px solid ${accent}aa`;
  let t2;
  if ($[0] !== rect.h || $[1] !== rect.w || $[2] !== rect.x || $[3] !== rect.y || $[4] !== t0 || $[5] !== t1 || $[6] !== theme.shape.windowRadius) {
    t2 = /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { "aria-hidden": true, style: {
      position: "fixed",
      left: rect.x,
      top: rect.y,
      width: rect.w,
      height: rect.h,
      background: t0,
      border: t1,
      borderRadius: theme.shape.windowRadius,
      pointerEvents: "none",
      zIndex: 90,
      transition: "left 120ms ease, top 120ms ease, width 120ms ease, height 120ms ease"
    } });
    $[0] = rect.h;
    $[1] = rect.w;
    $[2] = rect.x;
    $[3] = rect.y;
    $[4] = t0;
    $[5] = t1;
    $[6] = theme.shape.windowRadius;
    $[7] = t2;
  } else {
    t2 = $[7];
  }
  return t2;
}
function _temp14() {
  return null;
}

// src/snap/snap-restore-store.ts
var sizes = /* @__PURE__ */ new Map();
function recordSnapRestore(id, size) {
  if (!sizes.has(id)) sizes.set(id, size);
}
function peekSnapRestore(id) {
  return sizes.get(id);
}
function clearSnapRestore(id) {
  sizes.delete(id);
}

// src/hud/HudOverlay.tsx
var import_compiler_runtime16 = require("react/compiler-runtime");
var import_react15 = require("react");

// src/hud/hud-store.ts
var active3 = null;
var listeners7 = /* @__PURE__ */ new Set();
var idCounter = 0;
var hideTimer = null;
function emit4() {
  for (const listener of listeners7) listener(active3);
}
function showHud(payload) {
  idCounter += 1;
  active3 = {
    ...payload,
    id: idCounter,
    startedAt: Date.now()
  };
  emit4();
  if (hideTimer) clearTimeout(hideTimer);
  hideTimer = setTimeout(() => {
    active3 = null;
    hideTimer = null;
    emit4();
  }, Math.max(200, payload.duration ?? 1100));
}
function hideHud() {
  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }
  if (active3 === null) return;
  active3 = null;
  emit4();
}
function getHud() {
  return active3;
}
function subscribeHud(listener) {
  listeners7.add(listener);
  return () => {
    listeners7.delete(listener);
  };
}

// src/hud/HudOverlay.tsx
var import_jsx_runtime14 = require("react/jsx-runtime");
function HudOverlay() {
  const $ = (0, import_compiler_runtime16.c)(38);
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const active4 = (0, import_react15.useSyncExternalStore)(subscribeHud, getHud, _temp15);
  const [phase, setPhase] = (0, import_react15.useState)("enter");
  let t0;
  if ($[0] !== active4) {
    t0 = () => {
      if (active4) {
        setPhase("enter");
        const raf = window.requestAnimationFrame(() => {
          setPhase("ready");
        });
        return () => {
          window.cancelAnimationFrame(raf);
        };
      }
      setPhase("leave");
    };
    $[0] = active4;
    $[1] = t0;
  } else {
    t0 = $[1];
  }
  const t1 = active4?.id;
  let t2;
  if ($[2] !== active4 || $[3] !== t1) {
    t2 = [t1, active4];
    $[2] = active4;
    $[3] = t1;
    $[4] = t2;
  } else {
    t2 = $[4];
  }
  (0, import_react15.useEffect)(t0, t2);
  const [lastShown, setLastShown] = (0, import_react15.useState)(null);
  let t3;
  let t4;
  if ($[5] !== active4) {
    t3 = () => {
      if (active4) {
        setLastShown(active4);
      } else {
        const t = window.setTimeout(() => setLastShown(null), 200);
        return () => window.clearTimeout(t);
      }
    };
    t4 = [active4];
    $[5] = active4;
    $[6] = t3;
    $[7] = t4;
  } else {
    t3 = $[6];
    t4 = $[7];
  }
  (0, import_react15.useEffect)(t3, t4);
  if (!lastShown) {
    return null;
  }
  const visible = active4 !== null && phase !== "leave";
  const opacity = visible && phase === "ready" ? 1 : 0;
  const scale = reducedMotion ? 1 : phase === "enter" ? 0.9 : phase === "ready" ? 1 : 0.94;
  const accent = lastShown.accent ?? theme.palette.accent;
  const hasProgress = typeof lastShown.progress === "number";
  const t5 = `translate(-50%, -50%) scale(${String(scale)})`;
  const t6 = `1px solid ${theme.palette.border}`;
  const t7 = theme.shape.windowRadius + 4;
  const t8 = hasProgress ? "20px 26px 16px" : "22px 28px";
  const t9 = reducedMotion ? "none" : "opacity 160ms ease, transform 200ms cubic-bezier(0.2, 0.85, 0.25, 1)";
  let t10;
  if ($[8] !== opacity || $[9] !== t5 || $[10] !== t6 || $[11] !== t7 || $[12] !== t8 || $[13] !== t9 || $[14] !== theme.blur.surface || $[15] !== theme.palette.surface || $[16] !== theme.palette.textPrimary) {
    t10 = {
      position: "fixed",
      left: "50%",
      top: "50%",
      transform: t5,
      background: theme.palette.surface,
      backdropFilter: theme.blur.surface,
      WebkitBackdropFilter: theme.blur.surface,
      border: t6,
      borderRadius: t7,
      boxShadow: "0 20px 50px -10px rgba(0,0,0,0.55)",
      padding: t8,
      minWidth: 220,
      color: theme.palette.textPrimary,
      fontFamily: "inherit",
      zIndex: 1600,
      opacity,
      pointerEvents: "none",
      transition: t9,
      textAlign: "center"
    };
    $[8] = opacity;
    $[9] = t5;
    $[10] = t6;
    $[11] = t7;
    $[12] = t8;
    $[13] = t9;
    $[14] = theme.blur.surface;
    $[15] = theme.palette.surface;
    $[16] = theme.palette.textPrimary;
    $[17] = t10;
  } else {
    t10 = $[17];
  }
  const surface = t10;
  let t11;
  if ($[18] !== accent || $[19] !== lastShown.icon) {
    t11 = lastShown.icon && /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("div", { "aria-hidden": true, style: {
      width: 48,
      height: 48,
      margin: "0 auto 8px",
      display: "grid",
      placeItems: "center",
      color: accent
    }, children: lastShown.icon });
    $[18] = accent;
    $[19] = lastShown.icon;
    $[20] = t11;
  } else {
    t11 = $[20];
  }
  let t12;
  if ($[21] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t12 = {
      fontSize: 14,
      fontWeight: 600
    };
    $[21] = t12;
  } else {
    t12 = $[21];
  }
  let t13;
  if ($[22] !== lastShown.title) {
    t13 = /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("div", { style: t12, children: lastShown.title });
    $[22] = lastShown.title;
    $[23] = t13;
  } else {
    t13 = $[23];
  }
  let t14;
  if ($[24] !== lastShown.sublabel || $[25] !== theme.palette.textSecondary) {
    t14 = lastShown.sublabel && /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("div", { style: {
      marginTop: 2,
      fontSize: 11,
      color: theme.palette.textSecondary
    }, children: lastShown.sublabel });
    $[24] = lastShown.sublabel;
    $[25] = theme.palette.textSecondary;
    $[26] = t14;
  } else {
    t14 = $[26];
  }
  let t15;
  if ($[27] !== accent || $[28] !== hasProgress || $[29] !== lastShown.progress || $[30] !== theme.palette.border) {
    t15 = hasProgress && /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("div", { "aria-hidden": true, style: {
      marginTop: 12,
      height: 4,
      borderRadius: 2,
      background: theme.palette.border,
      overflow: "hidden"
    }, children: /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("div", { style: {
      height: "100%",
      width: `${String(Math.round(Math.min(1, Math.max(0, lastShown.progress ?? 0)) * 100))}%`,
      background: accent,
      transition: "width 160ms ease"
    } }) });
    $[27] = accent;
    $[28] = hasProgress;
    $[29] = lastShown.progress;
    $[30] = theme.palette.border;
    $[31] = t15;
  } else {
    t15 = $[31];
  }
  let t16;
  if ($[32] !== surface || $[33] !== t11 || $[34] !== t13 || $[35] !== t14 || $[36] !== t15) {
    t16 = /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { role: "status", "aria-live": "polite", style: surface, children: [
      t11,
      t13,
      t14,
      t15
    ] });
    $[32] = surface;
    $[33] = t11;
    $[34] = t13;
    $[35] = t14;
    $[36] = t15;
    $[37] = t16;
  } else {
    t16 = $[37];
  }
  return t16;
}
function _temp15() {
  return null;
}

// src/Window.tsx
var import_jsx_runtime15 = require("react/jsx-runtime");
function snapZoneLabel(zone) {
  switch (zone) {
    case "left-half":
      return "Snapped Left";
    case "right-half":
      return "Snapped Right";
    case "top-max":
      return "Maximized";
    case "top-left-quarter":
      return "Top Left Quarter";
    case "top-right-quarter":
      return "Top Right Quarter";
    case "bottom-left-quarter":
      return "Bottom Left Quarter";
    case "bottom-right-quarter":
      return "Bottom Right Quarter";
  }
}
var MIN_W = 240;
var MIN_H = 160;
var DEFAULT_WINDOW_SHADOW_FOCUSED = "0 20px 50px -12px rgba(0,0,0,0.55), 0 8px 18px -6px rgba(0,0,0,0.35)";
var DEFAULT_WINDOW_SHADOW_UNFOCUSED = "0 10px 24px -8px rgba(0,0,0,0.4)";
var TEAR_OFF_PX = 6;
function setGenieVars(el, appId, fallbackScale) {
  const winRect = el.getBoundingClientRect();
  const dockRect = appId ? getDockTileRect(appId) : null;
  const toCenterX = dockRect ? dockRect.left + dockRect.width / 2 : winRect.left + winRect.width / 2;
  const toCenterY = dockRect ? dockRect.top + dockRect.height / 2 : winRect.top + winRect.height / 2;
  const scale = dockRect && winRect.width > 0 ? dockRect.width / winRect.width : fallbackScale;
  el.style.setProperty("--genie-scale", String(scale));
  el.style.setProperty("--genie-from-x", `${String(winRect.left)}px`);
  el.style.setProperty("--genie-from-y", `${String(winRect.top)}px`);
  el.style.setProperty("--genie-to-x", `${String(toCenterX - winRect.width / 2)}px`);
  el.style.setProperty("--genie-to-y", `${String(toCenterY - winRect.height / 2)}px`);
}
function Window({
  win,
  hidden = false
}) {
  const theme = useTheme();
  const apps = useApps();
  const wm = (0, import_core6.useWindowManager)();
  const {
    focusedWindow,
    focusWindow,
    closeWindow,
    minimizeWindow,
    toggleMaximize,
    setBounds
  } = wm;
  const focused = focusedWindow?.id === win.id;
  const mode = useViewportMode();
  const metrics = getChromeMetrics(mode);
  const titleBarHeight = metrics.titleBarHeight;
  const appPayload = win.payload.kind === "app" ? win.payload.appId : void 0;
  const app = useApp(appPayload ?? "__none__");
  const systemDef = win.payload.kind === "system" ? getSystemWindow(win.payload.systemId) : void 0;
  const systemArgs = win.payload.kind === "system" ? win.payload.args : void 0;
  const title = win.payload.kind === "app" ? app?.name ?? "Window" : systemDef ? resolveSystemWindowName(systemDef, systemArgs) : "Window";
  const accent = win.payload.kind === "app" ? app?.accent ?? theme.palette.accent : systemDef?.accent ?? theme.palette.accent;
  const elRef = (0, import_react16.useRef)(null);
  const dragRef = (0, import_react16.useRef)(null);
  const resizeRef = (0, import_react16.useRef)(null);
  const [phase, setPhase] = (0, import_react16.useState)("opening");
  const [gesturing, setGesturing] = (0, import_react16.useState)(false);
  const prevStateRef = (0, import_react16.useRef)(win.state);
  const reducedMotion = useReducedMotion();
  const {
    windowOpenDurationMs,
    genieDurationMs
  } = theme.motion;
  const openMs = reducedMotion ? 0 : windowOpenDurationMs;
  const genieMs = reducedMotion ? 0 : genieDurationMs;
  const genieScale = theme.motion.genieScale ?? 0.08;
  (0, import_react16.useEffect)(() => {
    const id = window.setTimeout(() => {
      setPhase("idle");
    }, openMs + 40);
    return () => {
      window.clearTimeout(id);
    };
  }, [openMs]);
  (0, import_react16.useLayoutEffect)(() => {
    elRef.current?.style.setProperty("--rui-open-scale", String(theme.motion.windowOpenScale ?? 0.92));
  }, [theme.motion.windowOpenScale]);
  (0, import_react16.useEffect)(() => {
    return () => {
      clearSnapRestore(win.id);
    };
  }, [win.id]);
  (0, import_react16.useLayoutEffect)(() => {
    const prev = prevStateRef.current;
    prevStateRef.current = win.state;
    const minimizing = prev !== "minimized" && win.state === "minimized";
    const restoring = prev === "minimized" && win.state === "normal";
    if (!minimizing && !restoring) return void 0;
    if (elRef.current) setGenieVars(elRef.current, appPayload, genieScale);
    setPhase(minimizing ? "minimizing" : "restoring");
    const id_0 = window.setTimeout(() => {
      setPhase("idle");
    }, genieMs);
    return () => {
      window.clearTimeout(id_0);
    };
  }, [win.state, appPayload, genieMs, genieScale]);
  const cascadeIndex = win.autoBounds ? wm.state.windows.filter((w) => w.id !== win.id && w.workspaceId === win.workspaceId && w.z < win.z).length : 0;
  (0, import_react16.useLayoutEffect)(() => {
    if (!win.autoBounds) return;
    const b = pickInitialBounds(win.payload, theme, apps, void 0, cascadeIndex);
    setBounds(win.id, b.x, b.y, b.w, b.h);
  }, [win.autoBounds, win.id, win.payload, theme, apps, setBounds, cascadeIndex]);
  const handleClose = () => {
    setPhase("closing");
    const t = window.setTimeout(() => {
      closeWindow(win.id);
    }, openMs);
    return () => {
      window.clearTimeout(t);
    };
  };
  const handleMinimize = () => {
    minimizeWindow(win.id);
  };
  const handleMaximize = () => {
    const willMaximize = win.state !== "maximized";
    toggleMaximize(win.id);
    showHud({
      title: willMaximize ? "Maximized" : "Restored"
    });
  };
  const handleTitleContextMenu = (e) => {
    e.preventDefault();
    const isMaximized = win.state === "maximized";
    const wmState = wm.state;
    const workspaces = wmState.workspaces;
    const items3 = [{
      label: isMaximized ? "Restore" : "Maximize",
      shortcut: isMaximized ? "Esc" : "\u2318\u21A9",
      onSelect: handleMaximize
    }, {
      label: "Minimize",
      shortcut: "\u2318M",
      onSelect: () => {
        handleMinimize();
      }
    }];
    if (workspaces.length > 1) {
      items3.push({
        separator: true
      });
      for (let i = 0; i < workspaces.length; i++) {
        const wsId = workspaces[i];
        if (!wsId) continue;
        items3.push({
          label: `Move to Workspace ${String(i + 1)}`,
          disabled: wsId === win.workspaceId,
          onSelect: () => {
            wm.moveWindowToWorkspace(win.id, wsId);
          }
        });
      }
    }
    items3.push({
      separator: true
    });
    items3.push({
      label: "Close",
      shortcut: "\u2318W",
      danger: true,
      onSelect: () => {
        handleClose();
      }
    });
    openContextMenu({
      x: e.clientX,
      y: e.clientY,
      items: items3,
      ariaLabel: `${title} window menu`
    });
  };
  const startDrag = (e_0) => {
    if (e_0.button !== 0) return;
    const fromMaximized = win.state === "maximized";
    const snapRestore = fromMaximized ? void 0 : peekSnapRestore(win.id);
    const bar = e_0.currentTarget.getBoundingClientRect();
    const grabFracX = bar.width > 0 ? (e_0.clientX - bar.left) / bar.width : 0.5;
    const grabOffsetY = e_0.clientY - bar.top;
    focusWindow(win.id);
    e_0.currentTarget.setPointerCapture(e_0.pointerId);
    if (!fromMaximized && !snapRestore) setGesturing(true);
    dragRef.current = {
      pointerId: e_0.pointerId,
      startClientX: e_0.clientX,
      startClientY: e_0.clientY,
      startX: win.x,
      startY: win.y,
      lastX: win.x,
      lastY: win.y,
      grabFracX,
      grabOffsetY,
      fromMaximized,
      snapRestore
    };
  };
  const moveDrag = (e_1) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e_1.pointerId) return;
    const work = getWorkArea(theme);
    if (drag.fromMaximized || drag.snapRestore) {
      if (Math.hypot(e_1.clientX - drag.startClientX, e_1.clientY - drag.startClientY) < TEAR_OFF_PX) {
        return;
      }
      const restoreW = drag.snapRestore ? drag.snapRestore.w : win.w;
      const restoreH = drag.snapRestore ? drag.snapRestore.h : win.h;
      const restoredX = Math.max(work.x, Math.min(e_1.clientX - restoreW * drag.grabFracX, work.x + work.width - restoreW));
      const restoredY = Math.max(work.y, e_1.clientY - drag.grabOffsetY);
      if (drag.fromMaximized) toggleMaximize(win.id);
      setBounds(win.id, restoredX, restoredY, restoreW, restoreH);
      setGesturing(true);
      clearSnapRestore(win.id);
      drag.fromMaximized = false;
      drag.snapRestore = void 0;
      drag.startX = restoredX;
      drag.startY = restoredY;
      drag.startClientX = e_1.clientX;
      drag.startClientY = e_1.clientY;
      drag.lastX = restoredX;
      drag.lastY = restoredY;
      const elNow = elRef.current;
      if (elNow) {
        elNow.style.transform = `translate3d(${String(restoredX)}px, ${String(restoredY)}px, 0)`;
        elNow.style.width = `${String(restoreW)}px`;
        elNow.style.height = `${String(restoreH)}px`;
      }
      return;
    }
    const targetX = drag.startX + (e_1.clientX - drag.startClientX);
    const targetY = drag.startY + (e_1.clientY - drag.startClientY);
    const clamped = clampWindowToWorkArea(targetX, targetY, win.w, win.h, work);
    drag.lastX = clamped.x;
    drag.lastY = clamped.y;
    const el = elRef.current;
    if (el) {
      el.style.transform = `translate3d(${String(clamped.x)}px, ${String(clamped.y)}px, 0)`;
    }
    const zone = computeSnapZone(e_1.clientX, e_1.clientY, work);
    if (zone) {
      setSnapPreview({
        windowId: win.id,
        zone,
        rect: rectForZone(zone, work)
      });
    } else {
      setSnapPreview(null);
    }
  };
  const endDrag = (e_2) => {
    const drag_0 = dragRef.current;
    if (!drag_0 || drag_0.pointerId !== e_2.pointerId) return;
    if (drag_0.fromMaximized || drag_0.snapRestore) {
      dragRef.current = null;
      return;
    }
    setGesturing(false);
    const snap = getSnapPreview();
    if (snap && snap.windowId === win.id) {
      recordSnapRestore(win.id, {
        w: win.w,
        h: win.h
      });
      setBounds(win.id, snap.rect.x, snap.rect.y, snap.rect.w, snap.rect.h);
      showHud({
        title: snapZoneLabel(snap.zone)
      });
    } else {
      setBounds(win.id, drag_0.lastX, drag_0.lastY, win.w, win.h);
    }
    setSnapPreview(null);
    dragRef.current = null;
  };
  const startResize = (dir, e_3) => {
    if (e_3.button !== 0) return;
    if (win.state === "maximized") return;
    e_3.stopPropagation();
    setGesturing(true);
    focusWindow(win.id);
    e_3.currentTarget.setPointerCapture(e_3.pointerId);
    resizeRef.current = {
      pointerId: e_3.pointerId,
      dir,
      startClientX: e_3.clientX,
      startClientY: e_3.clientY,
      startX: win.x,
      startY: win.y,
      startW: win.w,
      startH: win.h,
      lastX: win.x,
      lastY: win.y,
      lastW: win.w,
      lastH: win.h
    };
  };
  const moveResize = (e_4) => {
    const r = resizeRef.current;
    if (!r || r.pointerId !== e_4.pointerId) return;
    const dx = e_4.clientX - r.startClientX;
    const dy = e_4.clientY - r.startClientY;
    let x = r.startX;
    let y = r.startY;
    let w_0 = r.startW;
    let h = r.startH;
    if (r.dir.includes("e")) w_0 = Math.max(MIN_W, r.startW + dx);
    if (r.dir.includes("w")) {
      const nextW = Math.max(MIN_W, r.startW - dx);
      x = r.startX + (r.startW - nextW);
      w_0 = nextW;
    }
    if (r.dir.includes("s")) h = Math.max(MIN_H, r.startH + dy);
    if (r.dir.includes("n")) {
      const nextH = Math.max(MIN_H, r.startH - dy);
      y = r.startY + (r.startH - nextH);
      h = nextH;
    }
    r.lastX = x;
    r.lastY = y;
    r.lastW = w_0;
    r.lastH = h;
    const el_0 = elRef.current;
    if (el_0) {
      el_0.style.transform = `translate3d(${String(x)}px, ${String(y)}px, 0)`;
      el_0.style.width = `${String(w_0)}px`;
      el_0.style.height = `${String(h)}px`;
    }
  };
  const endResize = (e_5) => {
    const r_0 = resizeRef.current;
    if (!r_0 || r_0.pointerId !== e_5.pointerId) return;
    setGesturing(false);
    clearSnapRestore(win.id);
    setBounds(win.id, r_0.lastX, r_0.lastY, r_0.lastW, r_0.lastH);
    resizeRef.current = null;
  };
  const maximized = win.state === "maximized";
  const work_0 = getWorkArea(theme);
  const baseTransform = maximized ? `translate3d(${String(work_0.x)}px, ${String(work_0.y)}px, 0)` : `translate3d(${String(win.x)}px, ${String(win.y)}px, 0)`;
  const animationStyle = phase === "opening" ? {
    animation: `rui-window-open ${String(openMs)}ms ${theme.motion.windowOpenEasing} both`
  } : phase === "closing" ? {
    animation: `rui-window-close ${String(openMs)}ms ${theme.motion.windowOpenEasing} both`
  } : phase === "minimizing" ? {
    animation: `rui-window-genie ${String(genieMs)}ms ${theme.motion.genieEasing} both`
  } : phase === "restoring" ? {
    // Forward through a dedicated grow keyframe, not the genie
    // played in reverse: animation-direction: reverse also reverses
    // the timing function, turning the theme's ease-out into an
    // ease-in (slow start) that reads as sluggish. GNOME runs
    // minimize and unminimize with the same EASE_OUT_EXPO mode
    // (windowManager.js MINIMIZE_WINDOW_ANIMATION_MODE), so the
    // window emerges fast and decelerates in. Same easing, forward.
    animation: `rui-window-genie-out ${String(genieMs)}ms ${theme.motion.genieEasing} both`
  } : {};
  const justMinimized = prevStateRef.current !== "minimized" && win.state === "minimized";
  if (win.state === "minimized" && phase !== "minimizing" && !justMinimized) {
    return null;
  }
  return /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { ref: elRef, role: "region", "aria-label": `${title} window`, "data-rui-window": win.id, onPointerDown: () => {
    if (!focused) focusWindow(win.id);
  }, style: {
    position: "fixed",
    left: 0,
    top: 0,
    width: maximized ? work_0.width : win.w,
    height: maximized ? work_0.height : win.h,
    transform: baseTransform,
    // The open scale pivots here. Only while opening, so close and the
    // genie keep scaling about the center; a theme that grows from another
    // edge (Ubuntu rises from the bottom) sets motion.windowOpenOrigin.
    transformOrigin: phase === "opening" ? theme.motion.windowOpenOrigin : void 0,
    // Glide programmatic geometry changes (maximize, restore, snap). Off
    // while a drag or resize writes the transform per frame, and during the
    // open / close / genie phases, which run their own keyframes.
    transition: gesturing || phase !== "idle" ? void 0 : `transform ${String(openMs)}ms ${theme.motion.windowOpenEasing}, width ${String(openMs)}ms ${theme.motion.windowOpenEasing}, height ${String(openMs)}ms ${theme.motion.windowOpenEasing}`,
    backgroundColor: theme.palette.surface,
    backdropFilter: theme.blur.surface,
    WebkitBackdropFilter: theme.blur.surface,
    border: `1px solid ${theme.palette.border}`,
    borderRadius: maximized ? 0 : theme.shape.windowRadius,
    boxShadow: focused ? theme.elevation?.windowFocused ?? DEFAULT_WINDOW_SHADOW_FOCUSED : theme.elevation?.windowUnfocused ?? DEFAULT_WINDOW_SHADOW_UNFOCUSED,
    color: theme.palette.textPrimary,
    overflow: "hidden",
    // Off-workspace windows stay mounted but drop out of layout entirely.
    display: hidden ? "none" : "flex",
    flexDirection: "column",
    zIndex: 100 + win.z,
    ...animationStyle
  }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(TitleBar, { title, focused, accent, height: titleBarHeight, maximized, onClose: handleClose, onMinimize: handleMinimize, onMaximize: handleMaximize, onPointerDown: startDrag, onPointerMove: moveDrag, onPointerUp: endDrag, onPointerCancel: endDrag, onDoubleClick: handleMaximize, onContextMenu: handleTitleContextMenu }),
    /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("div", { style: {
      flex: 1,
      minHeight: 0,
      overflow: "auto",
      padding: 16
    }, children: app ? /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(app.content, { appId: app.id, focused }) : systemDef ? /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(systemDef.content, { focused, args: systemArgs }) : null }),
    !maximized && /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(ResizeHandles, { onStart: startResize, onMove: moveResize, onEnd: endResize })
  ] });
}
var HANDLE_THICKNESS = 6;
var CORNER_SIZE = 12;
function ResizeHandles(t0) {
  const $ = (0, import_compiler_runtime17.c)(6);
  const {
    onStart,
    onMove,
    onEnd
  } = t0;
  let t1;
  if ($[0] !== onEnd || $[1] !== onMove || $[2] !== onStart) {
    t1 = (dir, style, cursor) => /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("div", { onPointerDown: (e) => {
      onStart(dir, e);
    }, onPointerMove: onMove, onPointerUp: onEnd, onPointerCancel: onEnd, style: {
      position: "absolute",
      cursor,
      touchAction: "none",
      ...style
    } }, dir);
    $[0] = onEnd;
    $[1] = onMove;
    $[2] = onStart;
    $[3] = t1;
  } else {
    t1 = $[3];
  }
  const edge = t1;
  let t2;
  if ($[4] !== edge) {
    t2 = /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)(import_jsx_runtime15.Fragment, { children: [
      edge("n", {
        top: 0,
        left: CORNER_SIZE,
        right: CORNER_SIZE,
        height: HANDLE_THICKNESS
      }, "ns-resize"),
      edge("s", {
        bottom: 0,
        left: CORNER_SIZE,
        right: CORNER_SIZE,
        height: HANDLE_THICKNESS
      }, "ns-resize"),
      edge("e", {
        right: 0,
        top: CORNER_SIZE,
        bottom: CORNER_SIZE,
        width: HANDLE_THICKNESS
      }, "ew-resize"),
      edge("w", {
        left: 0,
        top: CORNER_SIZE,
        bottom: CORNER_SIZE,
        width: HANDLE_THICKNESS
      }, "ew-resize"),
      edge("nw", {
        top: 0,
        left: 0,
        width: CORNER_SIZE,
        height: CORNER_SIZE
      }, "nwse-resize"),
      edge("ne", {
        top: 0,
        right: 0,
        width: CORNER_SIZE,
        height: CORNER_SIZE
      }, "nesw-resize"),
      edge("sw", {
        bottom: 0,
        left: 0,
        width: CORNER_SIZE,
        height: CORNER_SIZE
      }, "nesw-resize"),
      edge("se", {
        bottom: 0,
        right: 0,
        width: CORNER_SIZE,
        height: CORNER_SIZE
      }, "nwse-resize")
    ] });
    $[4] = edge;
    $[5] = t2;
  } else {
    t2 = $[5];
  }
  return t2;
}
function TitleBar(t0) {
  const $ = (0, import_compiler_runtime17.c)(27);
  const {
    title,
    focused,
    accent,
    height,
    maximized,
    onClose,
    onMinimize,
    onMaximize,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    onDoubleClick,
    onContextMenu
  } = t0;
  const theme = useTheme();
  const controls = theme.chrome.windowControls;
  const trafficLights = controls === "traffic-lights";
  const t1 = trafficLights ? "space-between" : void 0;
  const t2 = trafficLights ? 10 : 12;
  const t3 = controls === "windows" ? 0 : 10;
  const t4 = `1px solid ${theme.palette.border}`;
  let t5;
  if ($[0] !== height || $[1] !== t1 || $[2] !== t2 || $[3] !== t3 || $[4] !== t4) {
    t5 = {
      position: "relative",
      height,
      display: "flex",
      alignItems: "center",
      justifyContent: t1,
      paddingLeft: t2,
      paddingRight: t3,
      borderBottom: t4,
      userSelect: "none",
      cursor: "grab",
      flexShrink: 0
    };
    $[0] = height;
    $[1] = t1;
    $[2] = t2;
    $[3] = t3;
    $[4] = t4;
    $[5] = t5;
  } else {
    t5 = $[5];
  }
  const t6 = focused ? `linear-gradient(90deg, transparent, ${accent}, transparent)` : "transparent";
  let t7;
  if ($[6] !== t6) {
    t7 = /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("span", { "aria-hidden": true, style: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 1,
      background: t6,
      opacity: 0.75
    } });
    $[6] = t6;
    $[7] = t7;
  } else {
    t7 = $[7];
  }
  let t8;
  if ($[8] !== controls || $[9] !== focused || $[10] !== maximized || $[11] !== onClose || $[12] !== onMaximize || $[13] !== onMinimize || $[14] !== title || $[15] !== trafficLights) {
    t8 = trafficLights ? /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)(import_jsx_runtime15.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(TrafficLights, { focused, onClose, onMinimize, onMaximize }),
      /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(TitleLabel, { title, focused, centered: true }),
      /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("span", { style: {
        width: 60
      }, "aria-hidden": true })
    ] }) : /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)(import_jsx_runtime15.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(TitleLabel, { title, focused }),
      controls === "windows" ? /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(WindowsControls, { focused, maximized, onClose, onMinimize, onMaximize }) : controls === "gnome" ? /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(GnomeControls, { focused, maximized, onClose, onMinimize, onMaximize }) : /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(MinimalControls, { focused, onClose })
    ] });
    $[8] = controls;
    $[9] = focused;
    $[10] = maximized;
    $[11] = onClose;
    $[12] = onMaximize;
    $[13] = onMinimize;
    $[14] = title;
    $[15] = trafficLights;
    $[16] = t8;
  } else {
    t8 = $[16];
  }
  let t9;
  if ($[17] !== onContextMenu || $[18] !== onDoubleClick || $[19] !== onPointerCancel || $[20] !== onPointerDown || $[21] !== onPointerMove || $[22] !== onPointerUp || $[23] !== t5 || $[24] !== t7 || $[25] !== t8) {
    t9 = /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onDoubleClick, onContextMenu, style: t5, children: [
      t7,
      t8
    ] });
    $[17] = onContextMenu;
    $[18] = onDoubleClick;
    $[19] = onPointerCancel;
    $[20] = onPointerDown;
    $[21] = onPointerMove;
    $[22] = onPointerUp;
    $[23] = t5;
    $[24] = t7;
    $[25] = t8;
    $[26] = t9;
  } else {
    t9 = $[26];
  }
  return t9;
}
function TitleLabel(t0) {
  const $ = (0, import_compiler_runtime17.c)(9);
  const {
    title,
    focused,
    centered: t1
  } = t0;
  const centered = t1 === void 0 ? false : t1;
  const theme = useTheme();
  const t2 = centered ? 500 : 400;
  const t3 = focused ? theme.palette.textPrimary : theme.palette.textSecondary;
  let t4;
  if ($[0] !== centered) {
    t4 = centered ? {} : {
      flex: 1,
      minWidth: 0,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      paddingRight: 8
    };
    $[0] = centered;
    $[1] = t4;
  } else {
    t4 = $[1];
  }
  let t5;
  if ($[2] !== t2 || $[3] !== t3 || $[4] !== t4) {
    t5 = {
      fontFamily: "inherit",
      fontSize: 12,
      fontWeight: t2,
      color: t3,
      ...t4
    };
    $[2] = t2;
    $[3] = t3;
    $[4] = t4;
    $[5] = t5;
  } else {
    t5 = $[5];
  }
  let t6;
  if ($[6] !== t5 || $[7] !== title) {
    t6 = /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("span", { style: t5, children: title });
    $[6] = t5;
    $[7] = title;
    $[8] = t6;
  } else {
    t6 = $[8];
  }
  return t6;
}
function WindowsControls(t0) {
  const $ = (0, import_compiler_runtime17.c)(16);
  const {
    focused,
    maximized,
    onClose,
    onMinimize,
    onMaximize
  } = t0;
  let t1;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t1 = {
      display: "flex",
      alignSelf: "stretch"
    };
    $[0] = t1;
  } else {
    t1 = $[0];
  }
  let t2;
  if ($[1] !== focused || $[2] !== onMinimize) {
    t2 = /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(CaptionButton, { glyph: "minimize", focused, onClick: onMinimize, ariaLabel: "Minimize" });
    $[1] = focused;
    $[2] = onMinimize;
    $[3] = t2;
  } else {
    t2 = $[3];
  }
  const t3 = maximized ? "restore" : "maximize";
  const t4 = maximized ? "Restore" : "Maximize";
  let t5;
  if ($[4] !== focused || $[5] !== onMaximize || $[6] !== t3 || $[7] !== t4) {
    t5 = /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(CaptionButton, { glyph: t3, focused, onClick: onMaximize, ariaLabel: t4 });
    $[4] = focused;
    $[5] = onMaximize;
    $[6] = t3;
    $[7] = t4;
    $[8] = t5;
  } else {
    t5 = $[8];
  }
  let t6;
  if ($[9] !== focused || $[10] !== onClose) {
    t6 = /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(CaptionButton, { glyph: "close", focused, onClick: onClose, ariaLabel: "Close", danger: true });
    $[9] = focused;
    $[10] = onClose;
    $[11] = t6;
  } else {
    t6 = $[11];
  }
  let t7;
  if ($[12] !== t2 || $[13] !== t5 || $[14] !== t6) {
    t7 = /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { onPointerDown: _temp16, style: t1, children: [
      t2,
      t5,
      t6
    ] });
    $[12] = t2;
    $[13] = t5;
    $[14] = t6;
    $[15] = t7;
  } else {
    t7 = $[15];
  }
  return t7;
}
function _temp16(e) {
  e.stopPropagation();
}
function CaptionButton(t0) {
  const $ = (0, import_compiler_runtime17.c)(18);
  const {
    glyph,
    focused,
    onClick,
    ariaLabel,
    danger: t1
  } = t0;
  const danger = t1 === void 0 ? false : t1;
  const theme = useTheme();
  const hover = `${theme.palette.textPrimary}1a`;
  const idleColor = focused ? theme.palette.textPrimary : theme.palette.textSecondary;
  const t2 = `background ${String(theme.motion.dockHoverDurationMs)}ms ease`;
  let t3;
  if ($[0] !== idleColor || $[1] !== t2) {
    t3 = {
      appearance: "none",
      border: 0,
      background: "transparent",
      width: 46,
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 0,
      cursor: "pointer",
      color: idleColor,
      transition: t2
    };
    $[0] = idleColor;
    $[1] = t2;
    $[2] = t3;
  } else {
    t3 = $[2];
  }
  let t4;
  if ($[3] !== danger || $[4] !== hover) {
    t4 = (e) => {
      e.currentTarget.style.background = danger ? "#c42b1c" : hover;
      if (danger) {
        e.currentTarget.style.color = "#fff";
      }
    };
    $[3] = danger;
    $[4] = hover;
    $[5] = t4;
  } else {
    t4 = $[5];
  }
  let t5;
  if ($[6] !== danger || $[7] !== idleColor) {
    t5 = (e_0) => {
      e_0.currentTarget.style.background = "transparent";
      if (danger) {
        e_0.currentTarget.style.color = idleColor;
      }
    };
    $[6] = danger;
    $[7] = idleColor;
    $[8] = t5;
  } else {
    t5 = $[8];
  }
  let t6;
  if ($[9] !== glyph) {
    t6 = /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(CaptionGlyph, { glyph });
    $[9] = glyph;
    $[10] = t6;
  } else {
    t6 = $[10];
  }
  let t7;
  if ($[11] !== ariaLabel || $[12] !== onClick || $[13] !== t3 || $[14] !== t4 || $[15] !== t5 || $[16] !== t6) {
    t7 = /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("button", { type: "button", onClick, "aria-label": ariaLabel, style: t3, onMouseEnter: t4, onMouseLeave: t5, children: t6 });
    $[11] = ariaLabel;
    $[12] = onClick;
    $[13] = t3;
    $[14] = t4;
    $[15] = t5;
    $[16] = t6;
    $[17] = t7;
  } else {
    t7 = $[17];
  }
  return t7;
}
function GnomeControls(t0) {
  const $ = (0, import_compiler_runtime17.c)(16);
  const {
    focused,
    maximized,
    onClose,
    onMinimize,
    onMaximize
  } = t0;
  let t1;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t1 = {
      display: "flex",
      alignItems: "center",
      gap: 6
    };
    $[0] = t1;
  } else {
    t1 = $[0];
  }
  let t2;
  if ($[1] !== focused || $[2] !== onMinimize) {
    t2 = /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(GnomeControl, { glyph: "minimize", focused, onClick: onMinimize, ariaLabel: "Minimize" });
    $[1] = focused;
    $[2] = onMinimize;
    $[3] = t2;
  } else {
    t2 = $[3];
  }
  const t3 = maximized ? "restore" : "maximize";
  const t4 = maximized ? "Restore" : "Maximize";
  let t5;
  if ($[4] !== focused || $[5] !== onMaximize || $[6] !== t3 || $[7] !== t4) {
    t5 = /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(GnomeControl, { glyph: t3, focused, onClick: onMaximize, ariaLabel: t4 });
    $[4] = focused;
    $[5] = onMaximize;
    $[6] = t3;
    $[7] = t4;
    $[8] = t5;
  } else {
    t5 = $[8];
  }
  let t6;
  if ($[9] !== focused || $[10] !== onClose) {
    t6 = /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(GnomeControl, { glyph: "close", focused, onClick: onClose, ariaLabel: "Close" });
    $[9] = focused;
    $[10] = onClose;
    $[11] = t6;
  } else {
    t6 = $[11];
  }
  let t7;
  if ($[12] !== t2 || $[13] !== t5 || $[14] !== t6) {
    t7 = /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { onPointerDown: _temp25, style: t1, children: [
      t2,
      t5,
      t6
    ] });
    $[12] = t2;
    $[13] = t5;
    $[14] = t6;
    $[15] = t7;
  } else {
    t7 = $[15];
  }
  return t7;
}
function _temp25(e) {
  e.stopPropagation();
}
function GnomeControl(t0) {
  const $ = (0, import_compiler_runtime17.c)(18);
  const {
    glyph,
    focused,
    onClick,
    ariaLabel
  } = t0;
  const theme = useTheme();
  const idle = `${theme.palette.textPrimary}1a`;
  const hover = `${theme.palette.textPrimary}2e`;
  const t1 = focused ? theme.palette.textPrimary : theme.palette.textSecondary;
  const t2 = `background ${String(theme.motion.dockHoverDurationMs)}ms ease`;
  let t3;
  if ($[0] !== idle || $[1] !== t1 || $[2] !== t2) {
    t3 = {
      appearance: "none",
      border: 0,
      width: 24,
      height: 24,
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 0,
      cursor: "pointer",
      background: idle,
      color: t1,
      transition: t2
    };
    $[0] = idle;
    $[1] = t1;
    $[2] = t2;
    $[3] = t3;
  } else {
    t3 = $[3];
  }
  let t4;
  if ($[4] !== hover) {
    t4 = (e) => {
      e.currentTarget.style.background = hover;
    };
    $[4] = hover;
    $[5] = t4;
  } else {
    t4 = $[5];
  }
  let t5;
  if ($[6] !== idle) {
    t5 = (e_0) => {
      e_0.currentTarget.style.background = idle;
    };
    $[6] = idle;
    $[7] = t5;
  } else {
    t5 = $[7];
  }
  const t6 = glyph === "minimize" ? 11 : 10;
  let t7;
  if ($[8] !== glyph || $[9] !== t6) {
    t7 = /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(CaptionGlyph, { glyph, size: t6 });
    $[8] = glyph;
    $[9] = t6;
    $[10] = t7;
  } else {
    t7 = $[10];
  }
  let t8;
  if ($[11] !== ariaLabel || $[12] !== onClick || $[13] !== t3 || $[14] !== t4 || $[15] !== t5 || $[16] !== t7) {
    t8 = /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("button", { type: "button", onClick, "aria-label": ariaLabel, style: t3, onMouseEnter: t4, onMouseLeave: t5, children: t7 });
    $[11] = ariaLabel;
    $[12] = onClick;
    $[13] = t3;
    $[14] = t4;
    $[15] = t5;
    $[16] = t7;
    $[17] = t8;
  } else {
    t8 = $[17];
  }
  return t8;
}
function MinimalControls(t0) {
  const $ = (0, import_compiler_runtime17.c)(11);
  const {
    focused,
    onClose
  } = t0;
  const theme = useTheme();
  const hover = `${theme.palette.textPrimary}1a`;
  const t1 = focused ? theme.palette.textPrimary : theme.palette.textSecondary;
  const t2 = `background ${String(theme.motion.dockHoverDurationMs)}ms ease`;
  let t3;
  if ($[0] !== t1 || $[1] !== t2 || $[2] !== theme.shape.small) {
    t3 = {
      appearance: "none",
      border: 0,
      background: "transparent",
      width: 24,
      height: 24,
      borderRadius: theme.shape.small,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 0,
      cursor: "pointer",
      color: t1,
      transition: t2
    };
    $[0] = t1;
    $[1] = t2;
    $[2] = theme.shape.small;
    $[3] = t3;
  } else {
    t3 = $[3];
  }
  let t4;
  if ($[4] !== hover) {
    t4 = (e_0) => {
      e_0.currentTarget.style.background = hover;
    };
    $[4] = hover;
    $[5] = t4;
  } else {
    t4 = $[5];
  }
  let t5;
  if ($[6] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t5 = /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(CaptionGlyph, { glyph: "close" });
    $[6] = t5;
  } else {
    t5 = $[6];
  }
  let t6;
  if ($[7] !== onClose || $[8] !== t3 || $[9] !== t4) {
    t6 = /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("button", { type: "button", onPointerDown: _temp34, onClick: onClose, "aria-label": "Close", style: t3, onMouseEnter: t4, onMouseLeave: _temp44, children: t5 });
    $[7] = onClose;
    $[8] = t3;
    $[9] = t4;
    $[10] = t6;
  } else {
    t6 = $[10];
  }
  return t6;
}
function _temp44(e_1) {
  e_1.currentTarget.style.background = "transparent";
}
function _temp34(e) {
  e.stopPropagation();
}
function CaptionGlyph(t0) {
  const $ = (0, import_compiler_runtime17.c)(15);
  const {
    glyph,
    size: t1
  } = t0;
  const size = t1 === void 0 ? 10 : t1;
  let t2;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t2 = {
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 1
    };
    $[0] = t2;
  } else {
    t2 = $[0];
  }
  const stroke = t2;
  switch (glyph) {
    case "minimize": {
      let t3;
      if ($[1] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
        t3 = /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("line", { x1: "0", y1: "5", x2: "10", y2: "5" });
        $[1] = t3;
      } else {
        t3 = $[1];
      }
      let t4;
      if ($[2] !== size) {
        t4 = /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("svg", { width: size, height: size, viewBox: "0 0 10 10", "aria-hidden": true, ...stroke, children: t3 });
        $[2] = size;
        $[3] = t4;
      } else {
        t4 = $[3];
      }
      return t4;
    }
    case "maximize": {
      let t3;
      if ($[4] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
        t3 = /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("rect", { x: "0.5", y: "0.5", width: "9", height: "9" });
        $[4] = t3;
      } else {
        t3 = $[4];
      }
      let t4;
      if ($[5] !== size) {
        t4 = /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("svg", { width: size, height: size, viewBox: "0 0 10 10", "aria-hidden": true, ...stroke, children: t3 });
        $[5] = size;
        $[6] = t4;
      } else {
        t4 = $[6];
      }
      return t4;
    }
    case "restore": {
      let t3;
      let t4;
      if ($[7] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
        t3 = /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("rect", { x: "0.5", y: "3.5", width: "7", height: "7" });
        t4 = /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("path", { d: "M3.5 3.5 V0.5 H10.5 V7.5 H7.5" });
        $[7] = t3;
        $[8] = t4;
      } else {
        t3 = $[7];
        t4 = $[8];
      }
      let t5;
      if ($[9] !== size) {
        t5 = /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("svg", { width: size, height: size, viewBox: "0 0 11 11", "aria-hidden": true, ...stroke, children: [
          t3,
          t4
        ] });
        $[9] = size;
        $[10] = t5;
      } else {
        t5 = $[10];
      }
      return t5;
    }
    case "close": {
      let t3;
      let t4;
      if ($[11] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
        t3 = /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("line", { x1: "0.5", y1: "0.5", x2: "9.5", y2: "9.5" });
        t4 = /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("line", { x1: "9.5", y1: "0.5", x2: "0.5", y2: "9.5" });
        $[11] = t3;
        $[12] = t4;
      } else {
        t3 = $[11];
        t4 = $[12];
      }
      let t5;
      if ($[13] !== size) {
        t5 = /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("svg", { width: size, height: size, viewBox: "0 0 10 10", "aria-hidden": true, ...stroke, children: [
          t3,
          t4
        ] });
        $[13] = size;
        $[14] = t5;
      } else {
        t5 = $[14];
      }
      return t5;
    }
  }
}
function TrafficLights(t0) {
  const $ = (0, import_compiler_runtime17.c)(19);
  const {
    focused,
    onClose,
    onMinimize,
    onMaximize
  } = t0;
  const [hovered, setHovered] = (0, import_react16.useState)(false);
  let t1;
  let t2;
  let t3;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t1 = () => {
      setHovered(true);
    };
    t2 = () => {
      setHovered(false);
    };
    t3 = {
      display: "flex",
      gap: 8
    };
    $[0] = t1;
    $[1] = t2;
    $[2] = t3;
  } else {
    t1 = $[0];
    t2 = $[1];
    t3 = $[2];
  }
  let t4;
  if ($[3] !== focused || $[4] !== hovered || $[5] !== onClose) {
    t4 = /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(TrafficLight, { kind: "close", color: "#ff5f57", onClick: onClose, focused, revealed: hovered });
    $[3] = focused;
    $[4] = hovered;
    $[5] = onClose;
    $[6] = t4;
  } else {
    t4 = $[6];
  }
  let t5;
  if ($[7] !== focused || $[8] !== hovered || $[9] !== onMinimize) {
    t5 = /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(TrafficLight, { kind: "minimize", color: "#febc2e", onClick: onMinimize, focused, revealed: hovered });
    $[7] = focused;
    $[8] = hovered;
    $[9] = onMinimize;
    $[10] = t5;
  } else {
    t5 = $[10];
  }
  let t6;
  if ($[11] !== focused || $[12] !== hovered || $[13] !== onMaximize) {
    t6 = /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(TrafficLight, { kind: "zoom", color: "#28c840", onClick: onMaximize, focused, revealed: hovered });
    $[11] = focused;
    $[12] = hovered;
    $[13] = onMaximize;
    $[14] = t6;
  } else {
    t6 = $[14];
  }
  let t7;
  if ($[15] !== t4 || $[16] !== t5 || $[17] !== t6) {
    t7 = /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { onPointerDown: _temp55, onMouseEnter: t1, onMouseLeave: t2, style: t3, children: [
      t4,
      t5,
      t6
    ] });
    $[15] = t4;
    $[16] = t5;
    $[17] = t6;
    $[18] = t7;
  } else {
    t7 = $[18];
  }
  return t7;
}
function _temp55(e) {
  e.stopPropagation();
}
function TrafficLightGlyph(t0) {
  const $ = (0, import_compiler_runtime17.c)(3);
  const {
    kind
  } = t0;
  if (kind === "close") {
    let t12;
    if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
      t12 = /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("svg", { width: "7", height: "7", viewBox: "0 0 7 7", "aria-hidden": true, children: /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("path", { d: "M1.4 1.4 L5.6 5.6 M5.6 1.4 L1.4 5.6", stroke: "rgba(0,0,0,0.55)", strokeWidth: "1.1", strokeLinecap: "round" }) });
      $[0] = t12;
    } else {
      t12 = $[0];
    }
    return t12;
  }
  if (kind === "minimize") {
    let t12;
    if ($[1] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
      t12 = /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("svg", { width: "8", height: "7", viewBox: "0 0 8 7", "aria-hidden": true, children: /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("path", { d: "M1.2 3.5 H6.8", stroke: "rgba(0,0,0,0.55)", strokeWidth: "1.1", strokeLinecap: "round" }) });
      $[1] = t12;
    } else {
      t12 = $[1];
    }
    return t12;
  }
  let t1;
  if ($[2] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t1 = /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("svg", { width: "8", height: "8", viewBox: "0 0 8 8", "aria-hidden": true, fill: "rgba(0,0,0,0.55)", children: [
      /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("path", { d: "M1.2 1.2 H5 L1.2 5 Z" }),
      /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("path", { d: "M6.8 6.8 H3 L6.8 3 Z" })
    ] });
    $[2] = t1;
  } else {
    t1 = $[2];
  }
  return t1;
}
function TrafficLight(t0) {
  const $ = (0, import_compiler_runtime17.c)(14);
  const {
    kind,
    color,
    onClick,
    focused,
    revealed
  } = t0;
  const t1 = focused ? color : "rgba(0,0,0,0.16)";
  let t2;
  if ($[0] !== t1) {
    t2 = {
      width: 12,
      height: 12,
      borderRadius: "50%",
      border: "none",
      cursor: "pointer",
      background: t1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 0,
      lineHeight: 1,
      boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,0.18)"
    };
    $[0] = t1;
    $[1] = t2;
  } else {
    t2 = $[1];
  }
  const t3 = kind === "close" ? "Close" : kind === "minimize" ? "Minimize" : "Maximize";
  const t4 = revealed && focused ? 1 : 0;
  let t5;
  if ($[2] !== t4) {
    t5 = {
      display: "flex",
      opacity: t4,
      transition: "opacity 120ms ease"
    };
    $[2] = t4;
    $[3] = t5;
  } else {
    t5 = $[3];
  }
  let t6;
  if ($[4] !== kind) {
    t6 = /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(TrafficLightGlyph, { kind });
    $[4] = kind;
    $[5] = t6;
  } else {
    t6 = $[5];
  }
  let t7;
  if ($[6] !== t5 || $[7] !== t6) {
    t7 = /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("span", { "aria-hidden": true, style: t5, children: t6 });
    $[6] = t5;
    $[7] = t6;
    $[8] = t7;
  } else {
    t7 = $[8];
  }
  let t8;
  if ($[9] !== onClick || $[10] !== t2 || $[11] !== t3 || $[12] !== t7) {
    t8 = /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("button", { type: "button", onClick, style: t2, "aria-label": t3, children: t7 });
    $[9] = onClick;
    $[10] = t2;
    $[11] = t3;
    $[12] = t7;
    $[13] = t8;
  } else {
    t8 = $[13];
  }
  return t8;
}

// src/WindowLayer.tsx
var import_jsx_runtime16 = require("react/jsx-runtime");
function WindowLayer() {
  const $ = (0, import_compiler_runtime18.c)(7);
  const {
    windows,
    state
  } = (0, import_core7.useWindowManager)();
  const active4 = state.activeWorkspaceId;
  let t0;
  if ($[0] !== active4 || $[1] !== windows) {
    let t12;
    if ($[3] !== active4) {
      t12 = (win) => /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(Window, { win, hidden: win.workspaceId !== active4 }, win.id);
      $[3] = active4;
      $[4] = t12;
    } else {
      t12 = $[4];
    }
    t0 = windows.map(t12);
    $[0] = active4;
    $[1] = windows;
    $[2] = t0;
  } else {
    t0 = $[2];
  }
  let t1;
  if ($[5] !== t0) {
    t1 = /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(import_jsx_runtime16.Fragment, { children: t0 });
    $[5] = t0;
    $[6] = t1;
  } else {
    t1 = $[6];
  }
  return t1;
}

// src/keyboard-shortcuts.tsx
var import_compiler_runtime19 = require("react/compiler-runtime");
var import_react17 = require("react");
var import_core8 = require("@react-ui-os/core");

// src/keymap.ts
var MOD_ORDER = ["ctrl", "alt", "shift", "meta"];
function chordOf(e) {
  const mods = [];
  if (e.ctrlKey) mods.push("ctrl");
  if (e.altKey) mods.push("alt");
  if (e.shiftKey) mods.push("shift");
  if (e.metaKey) mods.push("meta");
  return [...mods, e.key.toLowerCase()].join("+");
}
function expandChord(spec) {
  const tokens = spec.split("+").map((t) => t.trim().toLowerCase());
  const key = tokens[tokens.length - 1] ?? "";
  const mods = tokens.slice(0, -1);
  const fixed = mods.filter((m) => m !== "mod");
  const variants = mods.includes("mod") ? [["ctrl"], ["meta"]] : [[]];
  return variants.map((extra) => {
    const present = /* @__PURE__ */ new Set([...fixed, ...extra]);
    const ordered = MOD_ORDER.filter((m) => present.has(m));
    return [...ordered, key].join("+");
  });
}
function findConflicts(shortcuts) {
  const byScope = /* @__PURE__ */ new Map();
  for (const s of shortcuts) {
    let scoped = byScope.get(s.scope);
    if (!scoped) {
      scoped = /* @__PURE__ */ new Map();
      byScope.set(s.scope, scoped);
    }
    for (const spec of s.chords) {
      for (const chord of expandChord(spec)) {
        let ids = scoped.get(chord);
        if (!ids) {
          ids = /* @__PURE__ */ new Set();
          scoped.set(chord, ids);
        }
        ids.add(s.id);
      }
    }
  }
  const conflicts = [];
  for (const [scope, scoped] of byScope) {
    for (const [chord, ids] of scoped) {
      if (ids.size > 1) conflicts.push({
        scope,
        chord,
        ids: [...ids]
      });
    }
  }
  return conflicts;
}
var SHORTCUTS = [
  // Windows
  {
    id: "window.close",
    chords: ["Mod+W"],
    label: "Close window",
    group: "Window",
    scope: "desktop"
  },
  {
    id: "window.minimize",
    chords: ["Mod+M"],
    label: "Minimize window",
    group: "Window",
    scope: "desktop"
  },
  {
    id: "window.maximize",
    chords: ["Mod+ArrowUp"],
    label: "Maximize window",
    group: "Window",
    scope: "desktop"
  },
  {
    id: "window.unmaximize",
    chords: ["Mod+ArrowDown", "Escape"],
    label: "Restore a maximized window",
    group: "Window",
    scope: "desktop"
  },
  {
    id: "window.snapLeft",
    chords: ["Mod+ArrowLeft"],
    label: "Snap left half",
    group: "Window",
    scope: "desktop"
  },
  {
    id: "window.snapRight",
    chords: ["Mod+ArrowRight"],
    label: "Snap right half",
    group: "Window",
    scope: "desktop"
  },
  {
    id: "window.snapTopLeft",
    chords: ["Mod+Shift+ArrowLeft"],
    label: "Snap top-left quarter",
    group: "Window",
    scope: "desktop"
  },
  {
    id: "window.snapTopRight",
    chords: ["Mod+Shift+ArrowRight"],
    label: "Snap top-right quarter",
    group: "Window",
    scope: "desktop"
  },
  // Apps
  {
    id: "app.spotlight",
    chords: ["Mod+K"],
    label: "Open Spotlight",
    group: "Apps",
    scope: "desktop"
  },
  {
    id: "app.settings",
    chords: ["Mod+,"],
    label: "Open Settings",
    group: "Apps",
    scope: "desktop"
  },
  {
    id: "app.switcher",
    chords: ["Mod+Tab", "Mod+Shift+Tab"],
    label: "Application switcher",
    group: "Apps",
    scope: "desktop"
  },
  {
    id: "app.byIndex",
    chords: ["Mod+1", "Mod+2", "Mod+3", "Mod+4", "Mod+5", "Mod+6", "Mod+7", "Mod+8", "Mod+9"],
    label: "Open / focus / cycle app 1 to 9",
    group: "Apps",
    scope: "desktop",
    display: "Mod+1\u20139"
  },
  {
    id: "app.help",
    // Mod+/ and Mod+Shift+/ (which is Ctrl+?, the GNOME convention). The second
    // also catches layouts where "/" needs Shift: on a German keyboard "/" is
    // Shift+7, so pressing "Ctrl+/" arrives as ctrl+shift+/. A right-click
    // desktop menu item opens it too, for layouts neither chord reaches.
    chords: ["Mod+/", "Mod+Shift+/"],
    label: "Keyboard shortcuts",
    group: "Apps",
    scope: "desktop",
    display: "Mod+/"
  },
  // Spaces
  {
    id: "space.prev",
    chords: ["Ctrl+Alt+ArrowLeft"],
    label: "Previous workspace",
    group: "Spaces",
    scope: "desktop"
  },
  {
    id: "space.next",
    chords: ["Ctrl+Alt+ArrowRight"],
    label: "Next workspace",
    group: "Spaces",
    scope: "desktop"
  },
  {
    id: "space.movePrev",
    chords: ["Ctrl+Alt+Shift+ArrowLeft"],
    label: "Move window to previous workspace",
    group: "Spaces",
    scope: "desktop"
  },
  {
    id: "space.moveNext",
    chords: ["Ctrl+Alt+Shift+ArrowRight"],
    label: "Move window to next workspace",
    group: "Spaces",
    scope: "desktop"
  },
  {
    id: "space.missionControl",
    chords: ["F3"],
    label: "Mission Control",
    group: "Spaces",
    scope: "desktop"
  },
  // In-overlay navigation, each live only while its overlay is open
  {
    id: "missionControl.close",
    chords: ["Escape"],
    label: "Close Mission Control",
    group: "Mission Control",
    scope: "mission-control"
  },
  {
    id: "missionControl.move",
    chords: ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"],
    label: "Move selection",
    group: "Mission Control",
    scope: "mission-control"
  },
  {
    id: "appSwitcher.cancel",
    chords: ["Escape"],
    label: "Cancel switching",
    group: "App switcher",
    scope: "app-switcher"
  },
  {
    id: "spotlight.close",
    chords: ["Escape"],
    label: "Close Spotlight",
    group: "Spotlight",
    scope: "spotlight"
  }
];
var BY_ID = new Map(SHORTCUTS.map((s) => [s.id, s]));
function chordMatches(e, id) {
  const shortcut = BY_ID.get(id);
  if (!shortcut) return false;
  const chord = chordOf(e);
  return shortcut.chords.some((spec) => expandChord(spec).includes(chord));
}
var MAC_SYMBOL = {
  mod: "\u2318",
  meta: "\u2318",
  ctrl: "\u2303",
  alt: "\u2325",
  shift: "\u21E7"
};
var PC_WORD = {
  mod: "Ctrl",
  meta: "Super",
  ctrl: "Ctrl",
  alt: "Alt",
  shift: "Shift"
};
var KEY_LABEL = {
  arrowup: "\u2191",
  arrowdown: "\u2193",
  arrowleft: "\u2190",
  arrowright: "\u2192",
  escape: "Esc"
};
function formatChord(spec, mac) {
  const tokens = spec.split("+");
  const last = tokens.length - 1;
  const parts = tokens.map((raw, i) => {
    const token = raw.trim();
    const low = token.toLowerCase();
    if (i < last) return (mac ? MAC_SYMBOL[low] : PC_WORD[low]) ?? token;
    return KEY_LABEL[low] ?? (token.length === 1 ? token.toUpperCase() : token);
  });
  return parts.join(mac ? "" : " + ");
}

// src/keyboard-shortcuts.tsx
function KeyboardShortcuts() {
  const $ = (0, import_compiler_runtime19.c)(16);
  const apps = useApps();
  const theme = useTheme();
  const {
    focusedWindow,
    windowById,
    openWindow,
    closeWindow,
    minimizeWindow,
    restoreWindow,
    focusWindow,
    setBounds,
    toggleMaximize,
    state,
    switchWorkspace,
    moveWindowToWorkspace
  } = (0, import_core8.useWindowManager)();
  let t0;
  let t1;
  if ($[0] !== apps || $[1] !== closeWindow || $[2] !== focusWindow || $[3] !== focusedWindow || $[4] !== minimizeWindow || $[5] !== moveWindowToWorkspace || $[6] !== openWindow || $[7] !== restoreWindow || $[8] !== setBounds || $[9] !== state || $[10] !== switchWorkspace || $[11] !== theme || $[12] !== toggleMaximize || $[13] !== windowById) {
    t0 = () => {
      const onKey = (e) => {
        const target = e.target;
        if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
          return;
        }
        if (chordMatches(e, "app.spotlight")) {
          e.preventDefault();
          window.dispatchEvent(new CustomEvent(SPOTLIGHT_OPEN_EVENT));
          return;
        }
        if (chordMatches(e, "app.help")) {
          e.preventDefault();
          window.dispatchEvent(new CustomEvent(KEYBOARD_HELP_TOGGLE_EVENT));
          return;
        }
        if (chordMatches(e, "app.switcher")) {
          e.preventDefault();
          window.dispatchEvent(new CustomEvent(APP_SWITCHER_CYCLE_EVENT, {
            detail: {
              backward: e.shiftKey
            }
          }));
          return;
        }
        if (chordMatches(e, "app.settings")) {
          e.preventDefault();
          const payload = {
            kind: "system",
            systemId: "settings"
          };
          openWindow(payload, pickInitialBounds(payload, theme, apps, void 0, nextCascadeIndex(state)));
          return;
        }
        if (chordMatches(e, "window.close")) {
          if (focusedWindow) {
            e.preventDefault();
            closeWindow(focusedWindow.id);
          }
          return;
        }
        if (chordMatches(e, "window.minimize")) {
          if (focusedWindow) {
            e.preventDefault();
            minimizeWindow(focusedWindow.id);
          }
          return;
        }
        if (chordMatches(e, "app.byIndex")) {
          const idx = Number(e.key) - 1;
          const app = apps[idx];
          if (!app) {
            return;
          }
          e.preventDefault();
          const id = (0, import_core8.windowIdOf)({
            kind: "app",
            appId: app.id
          });
          const win = windowById(id);
          if (!win) {
            const payload_0 = {
              kind: "app",
              appId: app.id
            };
            openWindow(payload_0, pickInitialBounds(payload_0, theme, apps, void 0, nextCascadeIndex(state)));
            return;
          }
          if (win.state === "minimized") {
            restoreWindow(id);
            return;
          }
          if (focusedWindow?.id === id) {
            minimizeWindow(id);
            return;
          }
          focusWindow(id);
          return;
        }
        if (chordMatches(e, "window.unmaximize")) {
          if (focusedWindow?.state === "maximized") {
            e.preventDefault();
            toggleMaximize(focusedWindow.id);
            showHud({
              title: "Restored"
            });
          }
          return;
        }
        if (chordMatches(e, "space.prev") || chordMatches(e, "space.next") || chordMatches(e, "space.movePrev") || chordMatches(e, "space.moveNext")) {
          e.preventDefault();
          const idx_0 = state.workspaces.indexOf(state.activeWorkspaceId);
          if (idx_0 < 0) {
            return;
          }
          const forward = chordMatches(e, "space.next") || chordMatches(e, "space.moveNext");
          const withWindow = chordMatches(e, "space.movePrev") || chordMatches(e, "space.moveNext");
          const dir = forward ? 1 : -1;
          const nextIdx = (idx_0 + dir + state.workspaces.length) % state.workspaces.length;
          const nextId = state.workspaces[nextIdx];
          if (!nextId || nextId === state.activeWorkspaceId) {
            return;
          }
          if (withWindow && focusedWindow) {
            moveWindowToWorkspace(focusedWindow.id, nextId);
          }
          switchWorkspace(nextId);
          showHud({
            title: `Workspace ${String(nextIdx + 1)}`,
            sublabel: withWindow ? "Window moved with you" : void 0
          });
          return;
        }
        if (chordMatches(e, "space.missionControl")) {
          e.preventDefault();
          window.dispatchEvent(new CustomEvent(MISSION_CONTROL_TOGGLE_EVENT));
          return;
        }
        const zone = snapZoneFor(e);
        if (zone && focusedWindow && focusedWindow.state !== "maximized") {
          e.preventDefault();
          recordSnapRestore(focusedWindow.id, {
            w: focusedWindow.w,
            h: focusedWindow.h
          });
          const rect = rectForZone(zone, getWorkArea(theme));
          setBounds(focusedWindow.id, rect.x, rect.y, rect.w, rect.h);
          showHud({
            title: snapZoneLabel2(zone)
          });
          return;
        }
        if (chordMatches(e, "window.maximize")) {
          if (focusedWindow && focusedWindow.state !== "maximized") {
            e.preventDefault();
            toggleMaximize(focusedWindow.id);
            showHud({
              title: "Maximized"
            });
          }
          return;
        }
      };
      window.addEventListener("keydown", onKey);
      return () => {
        window.removeEventListener("keydown", onKey);
      };
    };
    t1 = [apps, focusedWindow, windowById, openWindow, closeWindow, minimizeWindow, restoreWindow, focusWindow, setBounds, theme, toggleMaximize, state, switchWorkspace, moveWindowToWorkspace];
    $[0] = apps;
    $[1] = closeWindow;
    $[2] = focusWindow;
    $[3] = focusedWindow;
    $[4] = minimizeWindow;
    $[5] = moveWindowToWorkspace;
    $[6] = openWindow;
    $[7] = restoreWindow;
    $[8] = setBounds;
    $[9] = state;
    $[10] = switchWorkspace;
    $[11] = theme;
    $[12] = toggleMaximize;
    $[13] = windowById;
    $[14] = t0;
    $[15] = t1;
  } else {
    t0 = $[14];
    t1 = $[15];
  }
  (0, import_react17.useEffect)(t0, t1);
  return null;
}
function snapZoneLabel2(zone) {
  switch (zone) {
    case "left-half":
      return "Snapped Left";
    case "right-half":
      return "Snapped Right";
    case "top-max":
      return "Maximized";
    case "top-left-quarter":
      return "Top Left Quarter";
    case "top-right-quarter":
      return "Top Right Quarter";
    case "bottom-left-quarter":
      return "Bottom Left Quarter";
    case "bottom-right-quarter":
      return "Bottom Right Quarter";
  }
}
function snapZoneFor(e) {
  if (chordMatches(e, "window.snapLeft")) return "left-half";
  if (chordMatches(e, "window.snapRight")) return "right-half";
  if (chordMatches(e, "window.snapTopLeft")) return "top-left-quarter";
  if (chordMatches(e, "window.snapTopRight")) return "top-right-quarter";
  return null;
}

// src/launcher/Launcher.tsx
var import_compiler_runtime23 = require("react/compiler-runtime");
var import_react20 = require("react");
var import_core10 = require("@react-ui-os/core");

// src/spaces-bar.tsx
var import_compiler_runtime20 = require("react/compiler-runtime");
var import_jsx_runtime17 = require("react/jsx-runtime");
function SpacesBar(t0) {
  const $ = (0, import_compiler_runtime20.c)(42);
  const {
    workspaces,
    activeId,
    onSwitch,
    onAdd,
    windows,
    wallpaperSrc,
    theme
  } = t0;
  const vw = typeof window === "undefined" ? 1600 : window.innerWidth || 1600;
  const vh = typeof window === "undefined" ? 900 : window.innerHeight || 900;
  let t1;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t1 = {
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-end",
      gap: 14,
      flexWrap: "wrap"
    };
    $[0] = t1;
  } else {
    t1 = $[0];
  }
  let t2;
  if ($[1] !== activeId || $[2] !== onSwitch || $[3] !== theme.motion.dockHoverDurationMs || $[4] !== theme.palette.background || $[5] !== theme.palette.border || $[6] !== theme.palette.textPrimary || $[7] !== theme.palette.textSecondary || $[8] !== theme.shape.small || $[9] !== wallpaperSrc || $[10] !== windows || $[11] !== workspaces) {
    let t32;
    if ($[13] !== activeId || $[14] !== onSwitch || $[15] !== theme.motion.dockHoverDurationMs || $[16] !== theme.palette.background || $[17] !== theme.palette.border || $[18] !== theme.palette.textPrimary || $[19] !== theme.palette.textSecondary || $[20] !== theme.shape.small || $[21] !== wallpaperSrc || $[22] !== windows) {
      t32 = (id, i) => {
        const active4 = id === activeId;
        const spaceWindows = windows.filter((w) => w.workspaceId === id && w.state !== "minimized");
        return /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("button", { type: "button", role: "tab", "data-mc-space": true, "aria-selected": active4, "aria-label": `Desktop ${String(i + 1)}`, onClick: () => {
          onSwitch(id);
        }, onPointerEnter: _temp17, onPointerLeave: (e_0) => {
          e_0.currentTarget.style.opacity = active4 ? "1" : "0.6";
        }, style: {
          appearance: "none",
          border: "none",
          background: "transparent",
          padding: 0,
          cursor: "pointer",
          fontFamily: "inherit",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          opacity: active4 ? 1 : 0.6,
          transition: `opacity ${String(theme.motion.dockHoverDurationMs)}ms ease`
        }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("span", { "aria-hidden": true, style: {
            position: "relative",
            display: "block",
            width: 124,
            height: 74,
            borderRadius: theme.shape.small,
            border: active4 ? `2px solid ${theme.palette.textPrimary}` : `1px solid ${theme.palette.border}`,
            background: wallpaperSrc ? `center / cover no-repeat url("${wallpaperSrc}")` : theme.palette.background,
            boxShadow: "0 6px 16px -8px rgba(0,0,0,0.5)",
            overflow: "hidden"
          }, children: spaceWindows.map((w_0) => /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("span", { style: {
            position: "absolute",
            left: `${String(Math.max(0, w_0.x / vw * 100))}%`,
            top: `${String(Math.max(0, w_0.y / vh * 100))}%`,
            width: `${String(w_0.w / vw * 100)}%`,
            height: `${String(w_0.h / vh * 100)}%`,
            background: theme.palette.border,
            border: `1px solid ${theme.palette.textSecondary}`,
            borderRadius: 2,
            boxSizing: "border-box"
          } }, w_0.id)) }),
          /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("span", { style: {
            fontSize: 12,
            fontWeight: active4 ? 600 : 500,
            color: active4 ? theme.palette.textPrimary : theme.palette.textSecondary
          }, children: `Desktop ${String(i + 1)}` })
        ] }, id);
      };
      $[13] = activeId;
      $[14] = onSwitch;
      $[15] = theme.motion.dockHoverDurationMs;
      $[16] = theme.palette.background;
      $[17] = theme.palette.border;
      $[18] = theme.palette.textPrimary;
      $[19] = theme.palette.textSecondary;
      $[20] = theme.shape.small;
      $[21] = wallpaperSrc;
      $[22] = windows;
      $[23] = t32;
    } else {
      t32 = $[23];
    }
    t2 = workspaces.map(t32);
    $[1] = activeId;
    $[2] = onSwitch;
    $[3] = theme.motion.dockHoverDurationMs;
    $[4] = theme.palette.background;
    $[5] = theme.palette.border;
    $[6] = theme.palette.textPrimary;
    $[7] = theme.palette.textSecondary;
    $[8] = theme.shape.small;
    $[9] = wallpaperSrc;
    $[10] = windows;
    $[11] = workspaces;
    $[12] = t2;
  } else {
    t2 = $[12];
  }
  let t3;
  if ($[24] !== onAdd) {
    t3 = () => {
      onAdd();
    };
    $[24] = onAdd;
    $[25] = t3;
  } else {
    t3 = $[25];
  }
  const t4 = `opacity ${String(theme.motion.dockHoverDurationMs)}ms ease`;
  let t5;
  if ($[26] !== t4) {
    t5 = {
      appearance: "none",
      border: "none",
      background: "transparent",
      padding: 0,
      cursor: "pointer",
      fontFamily: "inherit",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 6,
      opacity: 0.5,
      transition: t4
    };
    $[26] = t4;
    $[27] = t5;
  } else {
    t5 = $[27];
  }
  const t6 = `1px dashed ${theme.palette.border}`;
  let t7;
  if ($[28] !== t6 || $[29] !== theme.palette.textSecondary || $[30] !== theme.shape.small) {
    t7 = /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("span", { "aria-hidden": true, style: {
      display: "grid",
      placeItems: "center",
      width: 124,
      height: 74,
      borderRadius: theme.shape.small,
      border: t6,
      color: theme.palette.textSecondary,
      fontSize: 28,
      fontWeight: 300,
      lineHeight: 1
    }, children: "+" });
    $[28] = t6;
    $[29] = theme.palette.textSecondary;
    $[30] = theme.shape.small;
    $[31] = t7;
  } else {
    t7 = $[31];
  }
  let t8;
  if ($[32] !== theme.palette.textSecondary) {
    t8 = /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("span", { style: {
      fontSize: 12,
      fontWeight: 500,
      color: theme.palette.textSecondary
    }, children: "Add" });
    $[32] = theme.palette.textSecondary;
    $[33] = t8;
  } else {
    t8 = $[33];
  }
  let t9;
  if ($[34] !== t3 || $[35] !== t5 || $[36] !== t7 || $[37] !== t8) {
    t9 = /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("button", { type: "button", "data-mc-space": true, "aria-label": "Add a space", onClick: t3, onPointerEnter: _temp26, onPointerLeave: _temp35, style: t5, children: [
      t7,
      t8
    ] });
    $[34] = t3;
    $[35] = t5;
    $[36] = t7;
    $[37] = t8;
    $[38] = t9;
  } else {
    t9 = $[38];
  }
  let t10;
  if ($[39] !== t2 || $[40] !== t9) {
    t10 = /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { role: "tablist", "aria-label": "Spaces", style: t1, children: [
      t2,
      t9
    ] });
    $[39] = t2;
    $[40] = t9;
    $[41] = t10;
  } else {
    t10 = $[41];
  }
  return t10;
}
function _temp35(e_2) {
  e_2.currentTarget.style.opacity = "0.5";
}
function _temp26(e_1) {
  e_1.currentTarget.style.opacity = "1";
}
function _temp17(e) {
  e.currentTarget.style.opacity = "1";
}

// src/recents.ts
var sources = /* @__PURE__ */ new Map();
var listeners8 = /* @__PURE__ */ new Set();
function registerRecentsSource(id, source) {
  sources.set(id, source);
  listeners8.forEach((l) => {
    l();
  });
  return () => {
    if (sources.get(id) === source) {
      sources.delete(id);
      listeners8.forEach((l) => {
        l();
      });
    }
  };
}
function countRecentsSources() {
  return sources.size;
}
function listRecentItems() {
  const merged = [];
  for (const [sourceId, source] of sources) {
    try {
      for (const item of source()) {
        merged.push({
          ...item,
          sourceId
        });
      }
    } catch (err) {
      if (typeof process !== "undefined" && process.env?.NODE_ENV !== "production") {
        console.warn("[react-ui-os] recents source threw:", err);
      }
    }
  }
  return merged.sort((a, b) => b.timestamp - a.timestamp);
}
function subscribeRecentsSources(listener) {
  listeners8.add(listener);
  return () => {
    listeners8.delete(listener);
  };
}

// src/util/use-surface-transition.ts
var import_compiler_runtime21 = require("react/compiler-runtime");
var import_react18 = require("react");
function useSurfaceTransition(open2, t0) {
  const $ = (0, import_compiler_runtime21.c)(17);
  const {
    durationMs,
    easing
  } = t0;
  const [mounted, setMounted] = (0, import_react18.useState)(open2);
  const [phase, setPhase] = (0, import_react18.useState)(open2 ? "open" : "closing");
  let t1;
  let t2;
  if ($[0] !== durationMs || $[1] !== open2) {
    t1 = () => {
      if (open2) {
        setMounted(true);
        setPhase("opening");
        const id = window.setTimeout(() => {
          setPhase("open");
        }, durationMs + 40);
        return () => {
          window.clearTimeout(id);
        };
      }
      setPhase("closing");
      const id_0 = window.setTimeout(() => {
        setMounted(false);
      }, durationMs);
      return () => {
        window.clearTimeout(id_0);
      };
    };
    t2 = [open2, durationMs];
    $[0] = durationMs;
    $[1] = open2;
    $[2] = t1;
    $[3] = t2;
  } else {
    t1 = $[2];
    t2 = $[3];
  }
  (0, import_react18.useEffect)(t1, t2);
  let t3;
  if ($[4] !== durationMs || $[5] !== easing || $[6] !== phase) {
    t3 = phase === "opening" ? {
      animation: `rui-window-open ${String(durationMs)}ms ${easing} both`
    } : phase === "closing" ? {
      animation: `rui-window-close ${String(durationMs)}ms ${easing} both`
    } : {};
    $[4] = durationMs;
    $[5] = easing;
    $[6] = phase;
    $[7] = t3;
  } else {
    t3 = $[7];
  }
  const surfaceStyle = t3;
  let t4;
  if ($[8] !== durationMs || $[9] !== easing || $[10] !== phase) {
    t4 = phase === "opening" ? {
      animation: `rui-fade-in ${String(durationMs)}ms ${easing} both`
    } : phase === "closing" ? {
      animation: `rui-fade-out ${String(durationMs)}ms ${easing} both`
    } : {};
    $[8] = durationMs;
    $[9] = easing;
    $[10] = phase;
    $[11] = t4;
  } else {
    t4 = $[11];
  }
  const backdropStyle = t4;
  let t5;
  if ($[12] !== backdropStyle || $[13] !== mounted || $[14] !== phase || $[15] !== surfaceStyle) {
    t5 = {
      mounted,
      phase,
      surfaceStyle,
      backdropStyle
    };
    $[12] = backdropStyle;
    $[13] = mounted;
    $[14] = phase;
    $[15] = surfaceStyle;
    $[16] = t5;
  } else {
    t5 = $[16];
  }
  return t5;
}

// src/launcher/use-launcher.ts
var import_compiler_runtime22 = require("react/compiler-runtime");
var import_react19 = require("react");
var import_core9 = require("@react-ui-os/core");

// src/spotlight-sources.ts
var sources2 = /* @__PURE__ */ new Map();
var listeners9 = /* @__PURE__ */ new Set();
function registerSpotlightSource(id, source) {
  sources2.set(id, source);
  listeners9.forEach((l) => l());
  return () => {
    if (sources2.get(id) === source) {
      sources2.delete(id);
      listeners9.forEach((l) => l());
    }
  };
}
function listSpotlightSources() {
  return Array.from(sources2.values());
}
function subscribeSpotlightSources(listener) {
  listeners9.add(listener);
  return () => {
    listeners9.delete(listener);
  };
}

// src/launcher/use-launcher.ts
function useLauncher() {
  const $ = (0, import_compiler_runtime22.c)(39);
  const theme = useTheme();
  const apps = useApps();
  const {
    state,
    openWindow
  } = (0, import_core9.useWindowManager)();
  const [open2, setOpen] = (0, import_react19.useState)(false);
  const [query, setQuery] = (0, import_react19.useState)("");
  const [selectedIndex, setSelectedIndex] = (0, import_react19.useState)(0);
  const previousFocusRef = (0, import_react19.useRef)(null);
  let t0;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t0 = () => {
      previousFocusRef.current = typeof document !== "undefined" ? document.activeElement : null;
      setQuery("");
      setSelectedIndex(0);
      setOpen(true);
    };
    $[0] = t0;
  } else {
    t0 = $[0];
  }
  const openLauncher = t0;
  let t1;
  if ($[1] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t1 = () => {
      setOpen(false);
      const prev = previousFocusRef.current;
      if (prev && typeof prev.focus === "function") {
        window.setTimeout(() => {
          prev.focus();
        }, 0);
      }
    };
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  const close = t1;
  let t2;
  let t3;
  if ($[2] !== open2) {
    t2 = () => {
      setLauncherOpen(open2);
      return _temp18;
    };
    t3 = [open2];
    $[2] = open2;
    $[3] = t2;
    $[4] = t3;
  } else {
    t2 = $[3];
    t3 = $[4];
  }
  (0, import_react19.useEffect)(t2, t3);
  let t4;
  let t5;
  if ($[5] !== open2) {
    t4 = () => {
      const onKey = (e) => {
        const isCmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
        if (!isCmdK) {
          return;
        }
        if (!open2) {
          const t = e.target;
          const inField = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
          if (inField) {
            return;
          }
          e.preventDefault();
          openLauncher();
          return;
        }
        e.preventDefault();
        close();
      };
      window.addEventListener("keydown", onKey);
      return () => {
        window.removeEventListener("keydown", onKey);
      };
    };
    t5 = [open2, openLauncher, close];
    $[5] = open2;
    $[6] = t4;
    $[7] = t5;
  } else {
    t4 = $[6];
    t5 = $[7];
  }
  (0, import_react19.useEffect)(t4, t5);
  let t6;
  let t7;
  if ($[8] !== open2) {
    t6 = () => {
      const onOpenEvt = () => {
        if (!open2) {
          openLauncher();
        }
      };
      window.addEventListener(SPOTLIGHT_OPEN_EVENT, onOpenEvt);
      return () => {
        window.removeEventListener(SPOTLIGHT_OPEN_EVENT, onOpenEvt);
      };
    };
    t7 = [open2, openLauncher];
    $[8] = open2;
    $[9] = t6;
    $[10] = t7;
  } else {
    t6 = $[9];
    t7 = $[10];
  }
  (0, import_react19.useEffect)(t6, t7);
  const sourcesVersion = (0, import_react19.useSyncExternalStore)(subscribeSpotlightSources, _temp27, _temp36);
  let t8;
  if ($[11] !== apps || $[12] !== query) {
    bb0: {
      const appResults = apps.map(_temp45);
      const systemResults = listSystemWindows().map(_temp56);
      const q = query.trim().toLowerCase();
      const externalResults = listSpotlightSources().flatMap((source, idx) => {
        ;
        try {
          return source(q).map((r) => ({
            kind: "external",
            key: `external:${String(idx)}:${r.id}`,
            name: r.name,
            tagline: r.tagline,
            accent: r.accent,
            icon: r.icon,
            kindLabel: r.kindLabel,
            onActivate: r.onActivate
          }));
        } catch (t92) {
          const err = t92;
          if (typeof process !== "undefined" && process.env?.NODE_ENV !== "production") {
            console.warn("[react-ui-os] launcher source threw:", err);
          }
          return [];
        }
      });
      const builtIn = [...appResults, ...systemResults];
      if (!q) {
        t8 = [...builtIn, ...externalResults];
        break bb0;
      }
      const filteredBuiltIn = builtIn.filter((r_0) => {
        const name = r_0.name.toLowerCase();
        const tag = (r_0.tagline ?? "").toLowerCase();
        return name.includes(q) || tag.includes(q);
      });
      t8 = [...filteredBuiltIn, ...externalResults];
    }
    $[11] = apps;
    $[12] = query;
    $[13] = t8;
  } else {
    t8 = $[13];
  }
  const results = t8;
  let t10;
  let t9;
  if ($[14] !== results.length) {
    t9 = () => {
      setSelectedIndex((idx_0) => {
        if (results.length === 0) {
          return 0;
        }
        if (idx_0 >= results.length) {
          return results.length - 1;
        }
        if (idx_0 < 0) {
          return 0;
        }
        return idx_0;
      });
    };
    t10 = [results.length];
    $[14] = results.length;
    $[15] = t10;
    $[16] = t9;
  } else {
    t10 = $[15];
    t9 = $[16];
  }
  (0, import_react19.useEffect)(t9, t10);
  let t11;
  if ($[17] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t11 = () => {
      setSelectedIndex(0);
    };
    $[17] = t11;
  } else {
    t11 = $[17];
  }
  let t12;
  if ($[18] !== query) {
    t12 = [query];
    $[18] = query;
    $[19] = t12;
  } else {
    t12 = $[19];
  }
  (0, import_react19.useEffect)(t11, t12);
  let t13;
  if ($[20] !== apps || $[21] !== openWindow || $[22] !== state || $[23] !== theme) {
    t13 = (result) => {
      if (result.kind === "app") {
        const payload = {
          kind: "app",
          appId: result.app.id
        };
        openWindow(payload, pickInitialBounds(payload, theme, apps, void 0, nextCascadeIndex(state)));
      } else {
        if (result.kind === "system") {
          const payload_0 = {
            kind: "system",
            systemId: result.systemId
          };
          openWindow(payload_0, pickInitialBounds(payload_0, theme, apps, void 0, nextCascadeIndex(state)));
        } else {
          result.onActivate();
        }
      }
      close();
    };
    $[20] = apps;
    $[21] = openWindow;
    $[22] = state;
    $[23] = theme;
    $[24] = t13;
  } else {
    t13 = $[24];
  }
  const activate2 = t13;
  let t14;
  if ($[25] !== results.length) {
    t14 = (delta) => {
      setSelectedIndex((idx_1) => {
        if (results.length === 0) {
          return 0;
        }
        return (idx_1 + delta + results.length) % results.length;
      });
    };
    $[25] = results.length;
    $[26] = t14;
  } else {
    t14 = $[26];
  }
  const moveSelection = t14;
  let t15;
  if ($[27] !== activate2 || $[28] !== results || $[29] !== selectedIndex) {
    t15 = () => {
      const target = results[selectedIndex];
      if (target) {
        activate2(target);
      }
    };
    $[27] = activate2;
    $[28] = results;
    $[29] = selectedIndex;
    $[30] = t15;
  } else {
    t15 = $[30];
  }
  const activateSelected = t15;
  let t16;
  if ($[31] !== activate2 || $[32] !== activateSelected || $[33] !== moveSelection || $[34] !== open2 || $[35] !== query || $[36] !== results || $[37] !== selectedIndex) {
    t16 = {
      open: open2,
      query,
      setQuery,
      results,
      selectedIndex,
      setSelectedIndex,
      moveSelection,
      openLauncher,
      close,
      activate: activate2,
      activateSelected
    };
    $[31] = activate2;
    $[32] = activateSelected;
    $[33] = moveSelection;
    $[34] = open2;
    $[35] = query;
    $[36] = results;
    $[37] = selectedIndex;
    $[38] = t16;
  } else {
    t16 = $[38];
  }
  return t16;
}
function _temp56(sys) {
  return {
    kind: "system",
    key: `system:${sys.systemId}`,
    name: resolveSystemWindowName(sys),
    tagline: sys.tagline,
    accent: sys.accent,
    category: sys.category,
    systemId: sys.systemId,
    def: sys
  };
}
function _temp45(app) {
  return {
    kind: "app",
    key: `app:${app.id}`,
    name: app.name,
    tagline: app.tagline,
    accent: app.accent,
    category: app.category,
    app
  };
}
function _temp36() {
  return 0;
}
function _temp27() {
  return listSpotlightSources().length;
}
function _temp18() {
  setLauncherOpen(false);
}

// src/launcher/start-categories.ts
var MIN_CATEGORY_APPS = 3;
var OTHER_CATEGORY = "Other";
function groupByCategory(items3) {
  const byCategory = /* @__PURE__ */ new Map();
  for (const item of items3) {
    const name = item.category ?? OTHER_CATEGORY;
    const list = byCategory.get(name) ?? [];
    list.push(item);
    byCategory.set(name, list);
  }
  const named = [];
  const other = [];
  for (const [name, list] of byCategory) {
    if (name !== OTHER_CATEGORY && list.length >= MIN_CATEGORY_APPS) {
      named.push({
        name,
        items: list
      });
    } else {
      other.push(...list);
    }
  }
  named.sort((a, b) => a.name.localeCompare(b.name));
  if (other.length > 0) {
    other.sort((a, b) => a.name.localeCompare(b.name));
    named.push({
      name: OTHER_CATEGORY,
      items: other
    });
  }
  return named;
}

// src/launcher/Launcher.tsx
var import_jsx_runtime18 = require("react/jsx-runtime");
function Launcher() {
  const $ = (0, import_compiler_runtime23.c)(12);
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const launcher = useLauncher();
  const isMenu = theme.chrome.launcher === "menu";
  const openMs = reducedMotion ? 0 : isMenu ? START_RISE_MS : theme.motion.windowOpenDurationMs;
  let t0;
  if ($[0] !== openMs || $[1] !== theme.motion.windowOpenEasing) {
    t0 = {
      durationMs: openMs,
      easing: theme.motion.windowOpenEasing
    };
    $[0] = openMs;
    $[1] = theme.motion.windowOpenEasing;
    $[2] = t0;
  } else {
    t0 = $[2];
  }
  const {
    mounted,
    phase,
    surfaceStyle
  } = useSurfaceTransition(launcher.open, t0);
  if (!mounted) {
    return null;
  }
  switch (theme.chrome.launcher) {
    case "grid": {
      let t1;
      if ($[3] !== launcher || $[4] !== surfaceStyle) {
        t1 = /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(GridView, { launcher, surfaceStyle });
        $[3] = launcher;
        $[4] = surfaceStyle;
        $[5] = t1;
      } else {
        t1 = $[5];
      }
      return t1;
    }
    case "menu": {
      let t1;
      if ($[6] !== launcher || $[7] !== phase) {
        t1 = /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(MenuView, { launcher, phase });
        $[6] = launcher;
        $[7] = phase;
        $[8] = t1;
      } else {
        t1 = $[8];
      }
      return t1;
    }
    default: {
      let t1;
      if ($[9] !== launcher || $[10] !== surfaceStyle) {
        t1 = /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(SpotlightView, { launcher, surfaceStyle });
        $[9] = launcher;
        $[10] = surfaceStyle;
        $[11] = t1;
      } else {
        t1 = $[11];
      }
      return t1;
    }
  }
}
var SPOTLIGHT_LISTBOX_ID = "rui-spotlight-listbox";
function spotlightOptionId(index) {
  return `rui-spotlight-option-${String(index)}`;
}
function SpotlightView(t0) {
  const $ = (0, import_compiler_runtime23.c)(65);
  const {
    launcher,
    surfaceStyle
  } = t0;
  const theme = useTheme();
  const {
    query,
    setQuery,
    results,
    selectedIndex,
    setSelectedIndex
  } = launcher;
  const {
    moveSelection,
    activate: activate2,
    activateSelected,
    close
  } = launcher;
  const inputRef = (0, import_react20.useRef)(null);
  const listRef = (0, import_react20.useRef)(null);
  let t1;
  let t2;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t1 = () => {
      const id = window.setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
      return () => {
        window.clearTimeout(id);
      };
    };
    t2 = [];
    $[0] = t1;
    $[1] = t2;
  } else {
    t1 = $[0];
    t2 = $[1];
  }
  (0, import_react20.useEffect)(t1, t2);
  let t3;
  let t4;
  if ($[2] !== selectedIndex) {
    t3 = () => {
      const root = listRef.current;
      if (!root) {
        return;
      }
      const el = root.querySelector(`[data-spotlight-index="${String(selectedIndex)}"]`);
      if (el) {
        el.scrollIntoView({
          block: "nearest"
        });
      }
    };
    t4 = [selectedIndex];
    $[2] = selectedIndex;
    $[3] = t3;
    $[4] = t4;
  } else {
    t3 = $[3];
    t4 = $[4];
  }
  (0, import_react20.useEffect)(t3, t4);
  let t5;
  if ($[5] !== activateSelected || $[6] !== close || $[7] !== moveSelection) {
    t5 = (e) => {
      if (e.key === "Tab") {
        e.preventDefault();
        inputRef.current?.focus();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        e.stopPropagation();
        moveSelection(1);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        e.stopPropagation();
        moveSelection(-1);
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        activateSelected();
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        close();
      }
    };
    $[5] = activateSelected;
    $[6] = close;
    $[7] = moveSelection;
    $[8] = t5;
  } else {
    t5 = $[8];
  }
  const handlePaletteKey = t5;
  let t6;
  if ($[9] !== close) {
    t6 = (e_0) => {
      if (e_0.target === e_0.currentTarget) {
        close();
      }
    };
    $[9] = close;
    $[10] = t6;
  } else {
    t6 = $[10];
  }
  const handleBackdropClick = t6;
  let t7;
  if ($[11] !== surfaceStyle || $[12] !== theme.blur.spotlight) {
    t7 = {
      position: "fixed",
      inset: 0,
      zIndex: 1400,
      backdropFilter: theme.blur.spotlight,
      WebkitBackdropFilter: theme.blur.spotlight,
      backgroundColor: "rgba(0,0,0,0.32)",
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start",
      paddingTop: "14vh",
      ...surfaceStyle
    };
    $[11] = surfaceStyle;
    $[12] = theme.blur.spotlight;
    $[13] = t7;
  } else {
    t7 = $[13];
  }
  const t8 = `1px solid ${theme.palette.border}`;
  const t9 = theme.shape.windowRadius + 4;
  let t10;
  if ($[14] !== t8 || $[15] !== t9 || $[16] !== theme.blur.spotlight || $[17] !== theme.palette.surface || $[18] !== theme.palette.textPrimary) {
    t10 = {
      width: "min(640px, calc(100vw - 32px))",
      maxHeight: "70vh",
      display: "flex",
      flexDirection: "column",
      position: "relative",
      overflow: "hidden",
      backgroundColor: theme.palette.surface,
      backdropFilter: theme.blur.spotlight,
      WebkitBackdropFilter: theme.blur.spotlight,
      border: t8,
      borderRadius: t9,
      color: theme.palette.textPrimary,
      boxShadow: "0 40px 90px -22px rgba(0,0,0,0.75), 0 10px 28px -8px rgba(0,0,0,0.4)"
    };
    $[14] = t8;
    $[15] = t9;
    $[16] = theme.blur.spotlight;
    $[17] = theme.palette.surface;
    $[18] = theme.palette.textPrimary;
    $[19] = t10;
  } else {
    t10 = $[19];
  }
  const t11 = `1px solid ${theme.palette.border}`;
  let t12;
  if ($[20] !== t11) {
    t12 = {
      height: 56,
      padding: "0 16px",
      display: "flex",
      alignItems: "center",
      borderBottom: t11,
      flexShrink: 0
    };
    $[20] = t11;
    $[21] = t12;
  } else {
    t12 = $[21];
  }
  const t13 = results.length > 0;
  let t14;
  if ($[22] !== results.length || $[23] !== selectedIndex) {
    t14 = results.length > 0 ? spotlightOptionId(selectedIndex) : void 0;
    $[22] = results.length;
    $[23] = selectedIndex;
    $[24] = t14;
  } else {
    t14 = $[24];
  }
  let t15;
  if ($[25] !== setQuery) {
    t15 = (e_1) => {
      setQuery(e_1.target.value);
    };
    $[25] = setQuery;
    $[26] = t15;
  } else {
    t15 = $[26];
  }
  let t16;
  if ($[27] !== theme.palette.textPrimary) {
    t16 = {
      width: "100%",
      border: "none",
      outline: "none",
      background: "transparent",
      color: theme.palette.textPrimary,
      fontFamily: "inherit",
      fontSize: 16
    };
    $[27] = theme.palette.textPrimary;
    $[28] = t16;
  } else {
    t16 = $[28];
  }
  let t17;
  if ($[29] !== query || $[30] !== t13 || $[31] !== t14 || $[32] !== t15 || $[33] !== t16) {
    t17 = /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("input", { ref: inputRef, role: "combobox", "aria-label": "Search apps and commands", "aria-autocomplete": "list", "aria-controls": SPOTLIGHT_LISTBOX_ID, "aria-expanded": t13, "aria-activedescendant": t14, value: query, onChange: t15, placeholder: "Search apps...", style: t16 });
    $[29] = query;
    $[30] = t13;
    $[31] = t14;
    $[32] = t15;
    $[33] = t16;
    $[34] = t17;
  } else {
    t17 = $[34];
  }
  let t18;
  if ($[35] !== t12 || $[36] !== t17) {
    t18 = /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("div", { style: t12, children: t17 });
    $[35] = t12;
    $[36] = t17;
    $[37] = t18;
  } else {
    t18 = $[37];
  }
  let t19;
  if ($[38] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t19 = {
      flex: 1,
      minHeight: 0,
      overflow: "auto",
      padding: "4px 0"
    };
    $[38] = t19;
  } else {
    t19 = $[38];
  }
  let t20;
  if ($[39] !== activate2 || $[40] !== query || $[41] !== results || $[42] !== selectedIndex || $[43] !== setSelectedIndex) {
    t20 = results.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(EmptyState, { query }) : results.map((result, i) => /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(ResultRow, { result, index: i, selected: i === selectedIndex, onHover: () => {
      setSelectedIndex(i);
    }, onActivate: () => {
      activate2(result);
    } }, result.key));
    $[39] = activate2;
    $[40] = query;
    $[41] = results;
    $[42] = selectedIndex;
    $[43] = setSelectedIndex;
    $[44] = t20;
  } else {
    t20 = $[44];
  }
  let t21;
  if ($[45] !== t20) {
    t21 = /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("div", { ref: listRef, id: SPOTLIGHT_LISTBOX_ID, role: "listbox", "aria-label": "Spotlight results", style: t19, children: t20 });
    $[45] = t20;
    $[46] = t21;
  } else {
    t21 = $[46];
  }
  const t22 = `1px solid ${theme.palette.border}`;
  let t23;
  if ($[47] !== t22 || $[48] !== theme.palette.textSecondary) {
    t23 = {
      height: 28,
      padding: "0 12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 16,
      borderTop: t22,
      flexShrink: 0,
      color: theme.palette.textSecondary,
      fontSize: 11
    };
    $[47] = t22;
    $[48] = theme.palette.textSecondary;
    $[49] = t23;
  } else {
    t23 = $[49];
  }
  let t24;
  let t25;
  let t26;
  if ($[50] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t24 = /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(HintChip, { keys: "\u2191\u2193", label: "Navigate" });
    t25 = /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(HintChip, { keys: "\u21B5", label: "Open" });
    t26 = /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(HintChip, { keys: "Esc", label: "Close" });
    $[50] = t24;
    $[51] = t25;
    $[52] = t26;
  } else {
    t24 = $[50];
    t25 = $[51];
    t26 = $[52];
  }
  let t27;
  if ($[53] !== t23) {
    t27 = /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("div", { style: t23, children: [
      t24,
      t25,
      t26
    ] });
    $[53] = t23;
    $[54] = t27;
  } else {
    t27 = $[54];
  }
  let t28;
  if ($[55] !== handlePaletteKey || $[56] !== t10 || $[57] !== t18 || $[58] !== t21 || $[59] !== t27) {
    t28 = /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("div", { role: "dialog", "aria-modal": "true", "aria-label": "Spotlight", onKeyDown: handlePaletteKey, style: t10, children: [
      t18,
      t21,
      t27
    ] });
    $[55] = handlePaletteKey;
    $[56] = t10;
    $[57] = t18;
    $[58] = t21;
    $[59] = t27;
    $[60] = t28;
  } else {
    t28 = $[60];
  }
  let t29;
  if ($[61] !== handleBackdropClick || $[62] !== t28 || $[63] !== t7) {
    t29 = /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("div", { role: "presentation", onClick: handleBackdropClick, style: t7, children: t28 });
    $[61] = handleBackdropClick;
    $[62] = t28;
    $[63] = t7;
    $[64] = t29;
  } else {
    t29 = $[64];
  }
  return t29;
}
var GRID_LISTBOX_ID = "rui-launcher-grid";
var GRID_COLUMNS = 6;
function gridOptionId(index) {
  return `rui-launcher-grid-option-${String(index)}`;
}
function GridView(t0) {
  const $ = (0, import_compiler_runtime23.c)(54);
  const {
    launcher,
    surfaceStyle
  } = t0;
  const theme = useTheme();
  const {
    state,
    windows,
    switchWorkspace,
    addWorkspace
  } = (0, import_core10.useWindowManager)();
  const {
    query,
    setQuery,
    results,
    selectedIndex,
    setSelectedIndex
  } = launcher;
  const {
    moveSelection,
    activate: activate2,
    activateSelected,
    close
  } = launcher;
  const inputRef = (0, import_react20.useRef)(null);
  let t1;
  let t2;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t1 = () => {
      const id = window.setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
      return () => {
        window.clearTimeout(id);
      };
    };
    t2 = [];
    $[0] = t1;
    $[1] = t2;
  } else {
    t1 = $[0];
    t2 = $[1];
  }
  (0, import_react20.useEffect)(t1, t2);
  let t3;
  if ($[2] !== activateSelected || $[3] !== close || $[4] !== moveSelection) {
    t3 = (e) => {
      bb13: switch (e.key) {
        case "ArrowRight": {
          e.preventDefault();
          moveSelection(1);
          break bb13;
        }
        case "ArrowLeft": {
          e.preventDefault();
          moveSelection(-1);
          break bb13;
        }
        case "ArrowDown": {
          e.preventDefault();
          moveSelection(GRID_COLUMNS);
          break bb13;
        }
        case "ArrowUp": {
          e.preventDefault();
          moveSelection(-GRID_COLUMNS);
          break bb13;
        }
        case "Enter": {
          e.preventDefault();
          activateSelected();
          break bb13;
        }
        case "Escape": {
          e.preventDefault();
          close();
          break bb13;
        }
        default:
      }
    };
    $[2] = activateSelected;
    $[3] = close;
    $[4] = moveSelection;
    $[5] = t3;
  } else {
    t3 = $[5];
  }
  const onKey = t3;
  let t4;
  if ($[6] !== close) {
    t4 = (e_0) => {
      if (e_0.target === e_0.currentTarget) {
        close();
      }
    };
    $[6] = close;
    $[7] = t4;
  } else {
    t4 = $[7];
  }
  let t5;
  if ($[8] !== surfaceStyle || $[9] !== theme.blur.spotlight) {
    t5 = {
      position: "fixed",
      inset: 0,
      zIndex: 1400,
      backdropFilter: theme.blur.spotlight,
      WebkitBackdropFilter: theme.blur.spotlight,
      backgroundColor: "rgba(0,0,0,0.55)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      paddingTop: "11vh",
      gap: 40,
      ...surfaceStyle
    };
    $[8] = surfaceStyle;
    $[9] = theme.blur.spotlight;
    $[10] = t5;
  } else {
    t5 = $[10];
  }
  const t6 = results.length > 0;
  let t7;
  if ($[11] !== results.length || $[12] !== selectedIndex) {
    t7 = results.length > 0 ? gridOptionId(selectedIndex) : void 0;
    $[11] = results.length;
    $[12] = selectedIndex;
    $[13] = t7;
  } else {
    t7 = $[13];
  }
  let t8;
  if ($[14] !== setQuery) {
    t8 = (e_1) => {
      setQuery(e_1.target.value);
    };
    $[14] = setQuery;
    $[15] = t8;
  } else {
    t8 = $[15];
  }
  const t9 = `1px solid ${theme.palette.border}`;
  let t10;
  if ($[16] !== t9 || $[17] !== theme.blur.spotlight || $[18] !== theme.palette.surface || $[19] !== theme.palette.textPrimary) {
    t10 = {
      width: "min(420px, calc(100vw - 64px))",
      height: 44,
      padding: "0 18px",
      textAlign: "center",
      border: t9,
      borderRadius: 999,
      outline: "none",
      background: theme.palette.surface,
      backdropFilter: theme.blur.spotlight,
      WebkitBackdropFilter: theme.blur.spotlight,
      color: theme.palette.textPrimary,
      fontFamily: "inherit",
      fontSize: 15,
      flexShrink: 0
    };
    $[16] = t9;
    $[17] = theme.blur.spotlight;
    $[18] = theme.palette.surface;
    $[19] = theme.palette.textPrimary;
    $[20] = t10;
  } else {
    t10 = $[20];
  }
  let t11;
  if ($[21] !== query || $[22] !== t10 || $[23] !== t6 || $[24] !== t7 || $[25] !== t8) {
    t11 = /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("input", { ref: inputRef, role: "combobox", "aria-label": "Search applications", "aria-autocomplete": "list", "aria-controls": GRID_LISTBOX_ID, "aria-expanded": t6, "aria-activedescendant": t7, value: query, onChange: t8, placeholder: "Type to search", style: t10 });
    $[21] = query;
    $[22] = t10;
    $[23] = t6;
    $[24] = t7;
    $[25] = t8;
    $[26] = t11;
  } else {
    t11 = $[26];
  }
  let t12;
  if ($[27] !== close || $[28] !== switchWorkspace) {
    t12 = (id_0) => {
      switchWorkspace(id_0);
      close();
    };
    $[27] = close;
    $[28] = switchWorkspace;
    $[29] = t12;
  } else {
    t12 = $[29];
  }
  let t13;
  if ($[30] !== addWorkspace || $[31] !== state.activeWorkspaceId || $[32] !== state.workspaces || $[33] !== t12 || $[34] !== theme || $[35] !== windows) {
    t13 = /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(SpacesBar, { workspaces: state.workspaces, activeId: state.activeWorkspaceId, onSwitch: t12, onAdd: addWorkspace, windows, wallpaperSrc: theme.wallpaper.src, theme });
    $[30] = addWorkspace;
    $[31] = state.activeWorkspaceId;
    $[32] = state.workspaces;
    $[33] = t12;
    $[34] = theme;
    $[35] = windows;
    $[36] = t13;
  } else {
    t13 = $[36];
  }
  let t14;
  if ($[37] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t14 = {
      width: "min(840px, calc(100vw - 64px))",
      maxHeight: "62vh",
      overflowY: "auto",
      display: "grid",
      gridTemplateColumns: `repeat(${String(GRID_COLUMNS)}, 1fr)`,
      gap: 24,
      padding: 8,
      justifyItems: "center"
    };
    $[37] = t14;
  } else {
    t14 = $[37];
  }
  let t15;
  if ($[38] !== activate2 || $[39] !== query || $[40] !== results || $[41] !== selectedIndex || $[42] !== setSelectedIndex || $[43] !== theme.palette.textSecondary) {
    t15 = results.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("div", { style: {
      gridColumn: "1 / -1",
      textAlign: "center",
      color: theme.palette.textSecondary,
      fontSize: 14,
      padding: "24px 0"
    }, children: query.trim().length > 0 ? `No matches for "${query.trim()}".` : "No applications." }) : results.map((result, i) => /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(LauncherTile, { result, index: i, selected: i === selectedIndex, onHover: () => {
      setSelectedIndex(i);
    }, onActivate: () => {
      activate2(result);
    } }, result.key));
    $[38] = activate2;
    $[39] = query;
    $[40] = results;
    $[41] = selectedIndex;
    $[42] = setSelectedIndex;
    $[43] = theme.palette.textSecondary;
    $[44] = t15;
  } else {
    t15 = $[44];
  }
  let t16;
  if ($[45] !== t15) {
    t16 = /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("div", { id: GRID_LISTBOX_ID, role: "listbox", "aria-label": "Applications", style: t14, children: t15 });
    $[45] = t15;
    $[46] = t16;
  } else {
    t16 = $[46];
  }
  let t17;
  if ($[47] !== onKey || $[48] !== t11 || $[49] !== t13 || $[50] !== t16 || $[51] !== t4 || $[52] !== t5) {
    t17 = /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("div", { role: "presentation", onClick: t4, onKeyDown: onKey, style: t5, children: [
      t11,
      t13,
      t16
    ] });
    $[47] = onKey;
    $[48] = t11;
    $[49] = t13;
    $[50] = t16;
    $[51] = t4;
    $[52] = t5;
    $[53] = t17;
  } else {
    t17 = $[53];
  }
  return t17;
}
function LauncherTile(t0) {
  const $ = (0, import_compiler_runtime23.c)(50);
  const {
    result,
    index,
    selected: t1,
    onHover,
    onActivate,
    size: t2,
    optionId: t3,
    plain: t4
  } = t0;
  const selected = t1 === void 0 ? false : t1;
  const size = t2 === void 0 ? 72 : t2;
  const optionId = t3 === void 0 ? gridOptionId : t3;
  const plain = t4 === void 0 ? false : t4;
  const theme = useTheme();
  const accent = result.accent ?? theme.palette.accent;
  const Art = result.kind === "app" ? result.app.iconArt : void 0;
  let t5;
  if ($[0] !== result.app || $[1] !== result.def || $[2] !== result.kind || $[3] !== theme) {
    t5 = result.kind === "app" ? resolveAppIcon(result.app, theme) : result.kind === "system" ? resolveAppIcon(result.def, theme) : void 0;
    $[0] = result.app;
    $[1] = result.def;
    $[2] = result.kind;
    $[3] = theme;
    $[4] = t5;
  } else {
    t5 = $[4];
  }
  const Icon = t5;
  const externalIcon = result.kind === "external" ? result.icon : void 0;
  const tile = size;
  const bare = plain && (Art ?? Icon ?? externalIcon) !== void 0;
  let t6;
  if ($[5] !== index || $[6] !== optionId) {
    t6 = index !== void 0 ? optionId(index) : void 0;
    $[5] = index;
    $[6] = optionId;
    $[7] = t6;
  } else {
    t6 = $[7];
  }
  const t7 = index !== void 0 ? "option" : void 0;
  const t8 = index !== void 0 ? selected : void 0;
  let t9;
  if ($[8] !== index || $[9] !== onHover || $[10] !== theme.palette.textPrimary) {
    t9 = (e) => {
      onHover?.();
      if (index === void 0) {
        e.currentTarget.style.background = `${theme.palette.textPrimary}10`;
      }
    };
    $[8] = index;
    $[9] = onHover;
    $[10] = theme.palette.textPrimary;
    $[11] = t9;
  } else {
    t9 = $[11];
  }
  let t10;
  if ($[12] !== index) {
    t10 = (e_0) => {
      if (index === void 0) {
        e_0.currentTarget.style.background = "transparent";
      }
    };
    $[12] = index;
    $[13] = t10;
  } else {
    t10 = $[13];
  }
  const t11 = plain ? theme.shape.small : theme.shape.windowRadius;
  const t12 = selected ? `${theme.palette.textPrimary}1f` : "transparent";
  let t13;
  if ($[14] !== t11 || $[15] !== t12) {
    t13 = {
      width: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 8,
      padding: "12px 6px",
      borderRadius: t11,
      cursor: "pointer",
      background: t12,
      transition: "background 100ms ease"
    };
    $[14] = t11;
    $[15] = t12;
    $[16] = t13;
  } else {
    t13 = $[16];
  }
  let t14;
  if ($[17] !== accent || $[18] !== bare || $[19] !== theme.palette.textPrimary || $[20] !== theme.shape.dockTileRadius) {
    t14 = bare ? {
      color: theme.palette.textPrimary
    } : {
      borderRadius: theme.shape.dockTileRadius,
      background: appIconBackground({ accent }, theme),
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.22), 0 2px 6px rgba(0,0,0,0.35)",
      color: appIconForeground({ accent }, theme)
    };
    $[17] = accent;
    $[18] = bare;
    $[19] = theme.palette.textPrimary;
    $[20] = theme.shape.dockTileRadius;
    $[21] = t14;
  } else {
    t14 = $[21];
  }
  let t15;
  if ($[22] !== t14 || $[23] !== tile) {
    t15 = {
      width: tile,
      height: tile,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      ...t14
    };
    $[22] = t14;
    $[23] = tile;
    $[24] = t15;
  } else {
    t15 = $[24];
  }
  let t16;
  if ($[25] !== Art || $[26] !== Icon || $[27] !== bare || $[28] !== externalIcon || $[29] !== result.name || $[30] !== tile) {
    t16 = Art ? /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(Art, { size: Math.round(tile * (bare ? 0.8 : 0.7)) }) : Icon ? /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(Icon, { size: Math.round(tile * (bare ? 0.8 : 0.46)) }) : externalIcon ? externalIcon : /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("span", { style: {
      fontWeight: 700,
      fontSize: Math.round(tile * 0.4)
    }, children: result.name.charAt(0).toUpperCase() });
    $[25] = Art;
    $[26] = Icon;
    $[27] = bare;
    $[28] = externalIcon;
    $[29] = result.name;
    $[30] = tile;
    $[31] = t16;
  } else {
    t16 = $[31];
  }
  let t17;
  if ($[32] !== t15 || $[33] !== t16) {
    t17 = /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("div", { style: t15, children: t16 });
    $[32] = t15;
    $[33] = t16;
    $[34] = t17;
  } else {
    t17 = $[34];
  }
  let t18;
  if ($[35] !== theme.palette.textPrimary) {
    t18 = {
      maxWidth: "100%",
      fontSize: 12,
      textAlign: "center",
      color: theme.palette.textPrimary,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    };
    $[35] = theme.palette.textPrimary;
    $[36] = t18;
  } else {
    t18 = $[36];
  }
  let t19;
  if ($[37] !== result.name || $[38] !== t18) {
    t19 = /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("span", { style: t18, children: result.name });
    $[37] = result.name;
    $[38] = t18;
    $[39] = t19;
  } else {
    t19 = $[39];
  }
  let t20;
  if ($[40] !== onActivate || $[41] !== t10 || $[42] !== t13 || $[43] !== t17 || $[44] !== t19 || $[45] !== t6 || $[46] !== t7 || $[47] !== t8 || $[48] !== t9) {
    t20 = /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("div", { id: t6, role: t7, "aria-selected": t8, onMouseEnter: t9, onMouseLeave: t10, onClick: onActivate, style: t13, children: [
      t17,
      t19
    ] });
    $[40] = onActivate;
    $[41] = t10;
    $[42] = t13;
    $[43] = t17;
    $[44] = t19;
    $[45] = t6;
    $[46] = t7;
    $[47] = t8;
    $[48] = t9;
    $[49] = t20;
  } else {
    t20 = $[49];
  }
  return t20;
}
var MENU_LISTBOX_ID = "rui-launcher-menu";
var MENU_SIZES = {
  small: {
    width: 640,
    height: 820,
    columns: 6
  },
  large: {
    width: 820,
    height: 1e3,
    columns: 8
  }
};
var RECENT_SLOTS = 6;
var RECENT_APP_SLOTS = 4;
var START_RISE_MS = 250;
var PINNED_DEFAULT_ROWS = 2;
var PINS_EXPANDED_KEY = "start-pins-expanded";
function menuOptionId(index) {
  return `rui-launcher-menu-option-${String(index)}`;
}
function MenuView({
  launcher,
  phase
}) {
  const theme = useTheme();
  const apps = useApps();
  const {
    storage
  } = useDesktopContext();
  const reducedMotion = useReducedMotion();
  const {
    state,
    openWindow,
    windows
  } = (0, import_core10.useWindowManager)();
  const {
    query,
    setQuery,
    results,
    selectedIndex,
    setSelectedIndex
  } = launcher;
  const {
    moveSelection,
    activate: activate2,
    activateSelected,
    close
  } = launcher;
  const inputRef = (0, import_react20.useRef)(null);
  const pinnedOn = theme.chrome.startMenuPinned ?? true;
  const allAppsOn = theme.chrome.startMenuAllApps ?? true;
  const recentOn = theme.chrome.startMenuRecent ?? true;
  const recentFilesOn = theme.chrome.startMenuRecentFiles ?? true;
  const profileOn = theme.chrome.startMenuProfile ?? true;
  const sizePref = theme.chrome.startMenuSize ?? "auto";
  const vwForSize = typeof window === "undefined" ? 1280 : window.innerWidth;
  const sizeKey = sizePref === "auto" ? vwForSize >= MENU_SIZES.large.width + 48 ? "large" : "small" : sizePref;
  const menuSize = MENU_SIZES[sizeKey];
  const [showAllPins, setShowAllPins] = (0, import_react20.useState)(() => storage.get(PINS_EXPANDED_KEY) ?? false);
  const togglePins = (next) => {
    setShowAllPins(next);
    storage.set(PINS_EXPANDED_KEY, next);
  };
  (0, import_react20.useEffect)(() => {
    const id = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
    return () => {
      window.clearTimeout(id);
    };
  }, []);
  const searching = query.trim().length > 0;
  const cols = menuSize.columns;
  const defaultPins = cols * PINNED_DEFAULT_ROWS;
  const gridCount = searching || showAllPins ? results.length : Math.min(results.length, defaultPins);
  const showListbox = searching || pinnedOn;
  (0, import_react20.useEffect)(() => {
    if (!searching && !showAllPins && pinnedOn && selectedIndex >= gridCount) {
      setShowAllPins(true);
    }
  }, [searching, showAllPins, pinnedOn, selectedIndex, gridCount]);
  const onKey = (e) => {
    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        moveSelection(1);
        break;
      case "ArrowLeft":
        e.preventDefault();
        moveSelection(-1);
        break;
      case "ArrowDown":
        e.preventDefault();
        moveSelection(cols);
        break;
      case "ArrowUp":
        e.preventDefault();
        moveSelection(-cols);
        break;
      case "Enter":
        e.preventDefault();
        if (showListbox) activateSelected();
        break;
      case "Escape":
        e.preventDefault();
        close();
        break;
      default:
        break;
    }
  };
  const zByApp = /* @__PURE__ */ new Map();
  for (const w of windows) {
    if (w.payload.kind === "app") {
      zByApp.set(w.payload.appId, Math.max(zByApp.get(w.payload.appId) ?? 0, w.z));
    }
  }
  const recentApps = (recentOn ? results : []).filter((r) => r.kind === "app" && zByApp.has(r.app.id)).sort((a, b) => {
    const za = a.kind === "app" ? zByApp.get(a.app.id) ?? 0 : 0;
    const zb = b.kind === "app" ? zByApp.get(b.app.id) ?? 0 : 0;
    return zb - za;
  }).slice(0, RECENT_APP_SLOTS);
  (0, import_react20.useSyncExternalStore)(subscribeRecentsSources, countRecentsSources, () => 0);
  const recentRows = [
    ...recentApps.map((r_0) => ({
      key: `rec:${r_0.key}`,
      result: r_0,
      subtitle: "Recently used"
    })),
    // The separate file control: off hides the file rows, apps stay.
    ...(recentOn && recentFilesOn ? listRecentItems() : []).slice(0, Math.max(0, RECENT_SLOTS - recentApps.length)).map((f) => ({
      key: `rec-file:${f.sourceId}:${f.id}`,
      result: {
        kind: "external",
        key: `rec-file:${f.sourceId}:${f.id}`,
        name: f.name,
        accent: f.accent,
        icon: f.icon,
        kindLabel: f.kindLabel,
        onActivate: f.onActivate
      },
      subtitle: f.kindLabel ? `${f.kindLabel} \xB7 ${relativeTime(f.timestamp)}` : relativeTime(f.timestamp)
    }))
  ];
  const openSettings = () => {
    const payload = {
      kind: "system",
      systemId: "settings"
    };
    openWindow(payload, pickInitialBounds(payload, theme, apps, void 0, nextCascadeIndex(state)));
    close();
  };
  const reservation = getDockReservation(theme);
  const gap = 8;
  const dockPosition = theme.chrome.dockPosition;
  const align = theme.chrome.dockAlign ?? "center";
  const vw = typeof window === "undefined" ? 1280 : window.innerWidth;
  const vh = typeof window === "undefined" ? 800 : window.innerHeight;
  const btn = typeof document === "undefined" ? null : document.querySelector('[data-rui-dock] [aria-label="Open launcher"]')?.getBoundingClientRect() ?? null;
  const width = Math.min(menuSize.width, vw - 2 * gap);
  const horizontalLeft = () => {
    const raw = align === "start" ? reservation.left + gap : align === "end" ? vw - reservation.right - width - gap : (vw - width) / 2;
    return Math.max(gap, Math.min(raw, vw - width - gap));
  };
  let anchor;
  let menuOrigin;
  let available;
  if (dockPosition === "left" || dockPosition === "right") {
    const top = btn ? Math.max(gap, Math.min(btn.top, vh - gap - 220)) : gap;
    anchor = dockPosition === "left" ? {
      left: reservation.left + gap,
      top
    } : {
      right: reservation.right + gap,
      top
    };
    menuOrigin = dockPosition === "left" ? "top left" : "top right";
    available = vh - top - gap;
  } else if (dockPosition === "top") {
    const left = horizontalLeft();
    const top_0 = getMenuBarHeight(theme) + reservation.top + gap;
    anchor = {
      left,
      top: top_0
    };
    const pivotX = btn ? Math.round(btn.left + btn.width / 2 - left) : width / 2;
    menuOrigin = `${String(Math.max(0, Math.min(pivotX, width)))}px 0px`;
    available = vh - top_0 - gap;
  } else {
    const left_0 = horizontalLeft();
    anchor = {
      left: left_0,
      bottom: reservation.bottom + gap
    };
    const pivotX_0 = btn ? Math.round(btn.left + btn.width / 2 - left_0) : width / 2;
    menuOrigin = `${String(Math.max(0, Math.min(pivotX_0, width)))}px 100%`;
    available = vh - reservation.bottom - 2 * gap;
  }
  const heightFill = sizeKey === "large" ? 0.9 : 0.78;
  const height = Math.min(menuSize.height, Math.round(available * heightFill));
  const RISE = 48;
  const riseVars = dockPosition === "top" ? {
    ["--rui-rise-y"]: `${String(-RISE)}px`
  } : dockPosition === "left" ? {
    ["--rui-rise-x"]: `${String(-RISE)}px`
  } : dockPosition === "right" ? {
    ["--rui-rise-x"]: `${String(RISE)}px`
  } : {
    ["--rui-rise-y"]: `${String(RISE)}px`
  };
  const riseStyle = reducedMotion ? {} : {
    ...riseVars,
    animation: `${phase === "closing" ? "rui-surface-sink" : "rui-surface-rise"} ${String(START_RISE_MS)}ms ${theme.motion.windowOpenEasing} both`
  };
  const listbox = /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("div", { id: MENU_LISTBOX_ID, role: "listbox", "aria-label": searching ? "Results" : "Pinned", style: {
    display: "grid",
    gridTemplateColumns: `repeat(${String(cols)}, 1fr)`,
    gap: 4,
    justifyItems: "center",
    alignContent: "start"
  }, children: results.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("div", { style: {
    gridColumn: "1 / -1",
    textAlign: "center",
    color: theme.palette.textSecondary,
    fontSize: 13,
    padding: "20px 0"
  }, children: searching ? `No matches for "${query.trim()}".` : "No apps." }) : results.slice(0, gridCount).map((result, i) => /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(LauncherTile, { result, index: i, size: 40, plain: true, optionId: menuOptionId, selected: i === selectedIndex, onHover: () => {
    setSelectedIndex(i);
  }, onActivate: () => {
    activate2(result);
  } }, result.key)) });
  const allSorted = [...results].sort((a_0, b_0) => a_0.name.localeCompare(b_0.name));
  return /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)(import_jsx_runtime18.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("div", { role: "presentation", onClick: close, style: {
      position: "fixed",
      inset: 0,
      zIndex: 1399
    } }),
    /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("div", { role: "dialog", "aria-label": "Start", onKeyDown: onKey, style: {
      position: "fixed",
      ...anchor,
      width,
      height,
      zIndex: 1400,
      display: "flex",
      flexDirection: "column",
      background: theme.palette.surface,
      backdropFilter: theme.blur.spotlight,
      WebkitBackdropFilter: theme.blur.spotlight,
      border: `1px solid ${theme.palette.border}`,
      borderRadius: theme.shape.windowRadius,
      color: theme.palette.textPrimary,
      boxShadow: theme.elevation?.windowFocused ?? "0 24px 60px -16px rgba(0,0,0,0.6)",
      overflow: "hidden",
      transformOrigin: menuOrigin,
      ...riseStyle
    }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("div", { style: {
        position: "relative",
        flexShrink: 0,
        padding: "16px 20px 8px"
      }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("svg", { width: 16, height: 16, viewBox: "0 0 16 16", fill: "none", "aria-hidden": true, style: {
          position: "absolute",
          left: 32,
          top: "50%",
          transform: "translateY(-50%)",
          pointerEvents: "none",
          color: theme.palette.textSecondary
        }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("circle", { cx: "7", cy: "7", r: "4.5", stroke: "currentColor", strokeWidth: "1.4" }),
          /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("line", { x1: "10.4", y1: "10.4", x2: "14", y2: "14", stroke: "currentColor", strokeWidth: "1.4", strokeLinecap: "round" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("input", { ref: inputRef, role: "combobox", "aria-label": "Search for apps", "aria-autocomplete": "list", "aria-controls": MENU_LISTBOX_ID, "aria-expanded": results.length > 0, "aria-activedescendant": results.length > 0 ? menuOptionId(selectedIndex) : void 0, value: query, onChange: (e_0) => {
          setQuery(e_0.target.value);
        }, placeholder: "Search for apps, settings, and documents", style: {
          width: "100%",
          boxSizing: "border-box",
          height: 36,
          padding: "0 14px 0 36px",
          border: `1px solid ${theme.palette.border}`,
          borderRadius: 18,
          outline: "none",
          background: theme.palette.background,
          color: theme.palette.textPrimary,
          fontFamily: "inherit",
          fontSize: 13
        } })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("div", { style: {
        flex: 1,
        minHeight: 0,
        overflowY: "auto",
        padding: "4px 20px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 6
      }, children: [
        searching ? /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)(import_jsx_runtime18.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(MenuSectionHeader, { label: "Results" }),
          listbox
        ] }) : pinnedOn ? /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)(import_jsx_runtime18.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(MenuSectionHeader, { label: "Pinned", action: results.length > defaultPins ? showAllPins ? {
            label: "Show less",
            onClick: () => {
              togglePins(false);
            },
            back: true
          } : {
            label: "Show all",
            onClick: () => {
              togglePins(true);
            }
          } : void 0 }),
          listbox
        ] }) : null,
        !searching && recentRows.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)(import_jsx_runtime18.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("div", { style: {
            height: 6
          } }),
          /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(MenuSectionHeader, { label: "Recent" }),
          /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("div", { style: {
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 4
          }, children: recentRows.map(({
            key,
            result: result_0,
            subtitle
          }) => /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(MenuRow, { result: result_0, subtitle, onActivate: () => {
            activate2(result_0);
          } }, key)) })
        ] }) : null,
        !searching && allAppsOn && allSorted.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(MenuAllSection, { items: allSorted, onActivate: (result_1) => {
          activate2(result_1);
        } }) : null
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("div", { style: {
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        // The privacy option hides the name and picture; the power button
        // stays, holding the trailing corner as on Windows.
        justifyContent: profileOn ? "space-between" : "flex-end",
        padding: "8px 14px",
        borderTop: `1px solid ${theme.palette.border}`,
        background: `${theme.palette.textPrimary}08`
      }, children: [
        profileOn ? /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)(MenuFooterButton, { "aria-label": "Account", onClick: openSettings, children: [
          /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("span", { "aria-hidden": true, style: {
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: theme.palette.accent,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0
          }, children: /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("svg", { width: 16, height: 16, viewBox: "0 0 16 16", fill: "currentColor", children: [
            /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("circle", { cx: "8", cy: "5", r: "3" }),
            /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("path", { d: "M2.5 14a5.5 5.5 0 0 1 11 0z" })
          ] }) }),
          /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("span", { style: {
            fontSize: 13,
            fontWeight: 500
          }, children: "User" })
        ] }) : null,
        /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(PowerButton, { onAction: close })
      ] })
    ] })
  ] });
}
var ALL_VIEW_KEY = "start-all-view";
var ALL_VIEWS = ["category", "grid", "list"];
var ALL_VIEW_LABELS = {
  category: "Category",
  grid: "Grid",
  list: "List"
};
var ALL_ALPHABET = ["#", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];
function letterOf(name) {
  const c = name.charAt(0).toUpperCase();
  return c >= "A" && c <= "Z" ? c : "#";
}
function ResultMiniIcon(t0) {
  const $ = (0, import_compiler_runtime23.c)(22);
  const {
    result,
    size
  } = t0;
  const theme = useTheme();
  const Art = result.kind === "app" ? result.app.iconArt : void 0;
  let t1;
  if ($[0] !== result.app || $[1] !== result.def || $[2] !== result.kind || $[3] !== theme) {
    t1 = result.kind === "app" ? resolveAppIcon(result.app, theme) : result.kind === "system" ? resolveAppIcon(result.def, theme) : void 0;
    $[0] = result.app;
    $[1] = result.def;
    $[2] = result.kind;
    $[3] = theme;
    $[4] = t1;
  } else {
    t1 = $[4];
  }
  const Icon = t1;
  if (Art) {
    let t22;
    if ($[5] !== Art || $[6] !== size) {
      t22 = /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(Art, { size });
      $[5] = Art;
      $[6] = size;
      $[7] = t22;
    } else {
      t22 = $[7];
    }
    return t22;
  }
  if (Icon) {
    let t22;
    if ($[8] !== Icon || $[9] !== size) {
      t22 = /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(Icon, { size });
      $[8] = Icon;
      $[9] = size;
      $[10] = t22;
    } else {
      t22 = $[10];
    }
    return t22;
  }
  if (result.kind === "external" && result.icon) {
    let t22;
    if ($[11] !== result.icon) {
      t22 = /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(import_jsx_runtime18.Fragment, { children: result.icon });
      $[11] = result.icon;
      $[12] = t22;
    } else {
      t22 = $[12];
    }
    return t22;
  }
  let t2;
  if ($[13] !== size) {
    t2 = Math.round(size * 0.8);
    $[13] = size;
    $[14] = t2;
  } else {
    t2 = $[14];
  }
  let t3;
  if ($[15] !== t2) {
    t3 = {
      fontWeight: 700,
      fontSize: t2
    };
    $[15] = t2;
    $[16] = t3;
  } else {
    t3 = $[16];
  }
  let t4;
  if ($[17] !== result.name) {
    t4 = result.name.charAt(0).toUpperCase();
    $[17] = result.name;
    $[18] = t4;
  } else {
    t4 = $[18];
  }
  let t5;
  if ($[19] !== t3 || $[20] !== t4) {
    t5 = /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("span", { style: t3, children: t4 });
    $[19] = t3;
    $[20] = t4;
    $[21] = t5;
  } else {
    t5 = $[21];
  }
  return t5;
}
function MenuAllSection(t0) {
  const $ = (0, import_compiler_runtime23.c)(52);
  const {
    items: items3,
    onActivate
  } = t0;
  const theme = useTheme();
  const {
    storage
  } = useDesktopContext();
  const reducedMotion = useReducedMotion();
  let t1;
  if ($[0] !== storage) {
    t1 = () => {
      const stored = storage.get(ALL_VIEW_KEY);
      return ALL_VIEWS.includes(stored ?? "") ? stored : "category";
    };
    $[0] = storage;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  const [view, setView] = (0, import_react20.useState)(t1);
  const [viewMenuOpen, setViewMenuOpen] = (0, import_react20.useState)(false);
  const [jumpOpen, setJumpOpen] = (0, import_react20.useState)(false);
  const [flyout, setFlyout] = (0, import_react20.useState)(null);
  const flyoutRef = (0, import_react20.useRef)(null);
  const flyoutTriggerRef = (0, import_react20.useRef)(null);
  const openFlyout = (category, trigger) => {
    flyoutTriggerRef.current = trigger;
    setFlyout(category);
  };
  const closeFlyout = () => {
    setFlyout(null);
    flyoutTriggerRef.current?.focus();
    flyoutTriggerRef.current = null;
  };
  let t2;
  let t3;
  if ($[2] !== flyout) {
    t2 = () => {
      if (flyout) {
        flyoutRef.current?.focus();
      }
    };
    t3 = [flyout];
    $[2] = flyout;
    $[3] = t2;
    $[4] = t3;
  } else {
    t2 = $[3];
    t3 = $[4];
  }
  (0, import_react20.useEffect)(t2, t3);
  let t4;
  if ($[5] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t4 = /* @__PURE__ */ new Map();
    $[5] = t4;
  } else {
    t4 = $[5];
  }
  const sectionRefs = (0, import_react20.useRef)(t4);
  const pendingJumpRef = (0, import_react20.useRef)(null);
  let t5;
  let t6;
  if ($[6] !== jumpOpen) {
    t5 = () => {
      if (jumpOpen || pendingJumpRef.current === null) {
        return;
      }
      sectionRefs.current.get(pendingJumpRef.current)?.scrollIntoView({
        block: "start"
      });
      pendingJumpRef.current = null;
    };
    t6 = [jumpOpen];
    $[6] = jumpOpen;
    $[7] = t5;
    $[8] = t6;
  } else {
    t5 = $[7];
    t6 = $[8];
  }
  (0, import_react20.useEffect)(t5, t6);
  let t7;
  if ($[9] !== items3) {
    t7 = (letter) => ({
      letter,
      items: items3.filter((i) => letterOf(i.name) === letter)
    });
    $[9] = items3;
    $[10] = t7;
  } else {
    t7 = $[10];
  }
  const groups = ALL_ALPHABET.map(t7).filter(_temp20);
  const present = new Set(groups.map(_temp28));
  const categories = groupByCategory(items3.map(_temp37)).map(_temp57);
  const flyoutItems = flyout ? categories.find((c) => c.name === flyout)?.items ?? [] : [];
  let t8;
  if ($[11] !== storage) {
    t8 = (next) => {
      setView(next);
      storage.set(ALL_VIEW_KEY, next);
      setViewMenuOpen(false);
    };
    $[11] = storage;
    $[12] = t8;
  } else {
    t8 = $[12];
  }
  const chooseView = t8;
  const hover = `${theme.palette.textPrimary}14`;
  let t10;
  let t9;
  if ($[13] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t9 = /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("div", { style: {
      height: 6
    } });
    t10 = {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexShrink: 0
    };
    $[13] = t10;
    $[14] = t9;
  } else {
    t10 = $[13];
    t9 = $[14];
  }
  let t11;
  if ($[15] !== theme.palette.textPrimary) {
    t11 = /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("span", { style: {
      fontSize: 13,
      fontWeight: 600,
      color: theme.palette.textPrimary
    }, children: "All" });
    $[15] = theme.palette.textPrimary;
    $[16] = t11;
  } else {
    t11 = $[16];
  }
  let t12;
  if ($[17] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t12 = {
      position: "relative"
    };
    $[17] = t12;
  } else {
    t12 = $[17];
  }
  let t13;
  if ($[18] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t13 = () => {
      setViewMenuOpen(_temp64);
    };
    $[18] = t13;
  } else {
    t13 = $[18];
  }
  let t14;
  if ($[19] !== hover) {
    t14 = (e) => {
      e.currentTarget.style.background = hover;
    };
    $[19] = hover;
    $[20] = t14;
  } else {
    t14 = $[20];
  }
  let t15;
  if ($[21] !== theme.palette.textSecondary || $[22] !== theme.shape.small) {
    t15 = {
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      border: "none",
      background: "transparent",
      color: theme.palette.textSecondary,
      cursor: "pointer",
      borderRadius: theme.shape.small,
      padding: "4px 8px",
      fontSize: 12,
      fontFamily: "inherit"
    };
    $[21] = theme.palette.textSecondary;
    $[22] = theme.shape.small;
    $[23] = t15;
  } else {
    t15 = $[23];
  }
  const t16 = `View: ${ALL_VIEW_LABELS[view]}`;
  let t17;
  if ($[24] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t17 = /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("svg", { width: 10, height: 10, viewBox: "0 0 10 10", fill: "none", "aria-hidden": true, children: /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("path", { d: "M2 3.5 5 6.5 8 3.5", stroke: "currentColor", strokeWidth: "1.3", strokeLinecap: "round", strokeLinejoin: "round" }) });
    $[24] = t17;
  } else {
    t17 = $[24];
  }
  let t18;
  if ($[25] !== t14 || $[26] !== t15 || $[27] !== t16 || $[28] !== viewMenuOpen) {
    t18 = /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("button", { type: "button", "aria-haspopup": "menu", "aria-expanded": viewMenuOpen, "aria-label": "Change All apps view", onClick: t13, onMouseEnter: t14, onMouseLeave: _temp74, style: t15, children: [
      t16,
      t17
    ] });
    $[25] = t14;
    $[26] = t15;
    $[27] = t16;
    $[28] = viewMenuOpen;
    $[29] = t18;
  } else {
    t18 = $[29];
  }
  let t19;
  if ($[30] !== chooseView || $[31] !== hover || $[32] !== theme.blur || $[33] !== theme.palette.border || $[34] !== theme.palette.surface || $[35] !== theme.palette.textPrimary || $[36] !== theme.shape.small || $[37] !== view || $[38] !== viewMenuOpen) {
    t19 = viewMenuOpen ? /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)(import_jsx_runtime18.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("div", { role: "presentation", onClick: () => {
        setViewMenuOpen(false);
      }, style: {
        position: "fixed",
        inset: 0,
        zIndex: 1
      } }),
      /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("div", { role: "menu", "aria-label": "All apps view", style: {
        position: "absolute",
        right: 0,
        top: "100%",
        zIndex: 2,
        minWidth: 120,
        padding: 4,
        background: theme.palette.surface,
        backdropFilter: theme.blur.surface,
        WebkitBackdropFilter: theme.blur.surface,
        border: `1px solid ${theme.palette.border}`,
        borderRadius: theme.shape.small,
        boxShadow: "0 12px 28px -10px rgba(0,0,0,0.5)"
      }, children: ALL_VIEWS.map((v_0) => /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("button", { type: "button", role: "menuitemradio", "aria-checked": view === v_0, onClick: () => {
        chooseView(v_0);
      }, onMouseEnter: (e_1) => {
        e_1.currentTarget.style.background = hover;
      }, onMouseLeave: _temp84, style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        width: "100%",
        textAlign: "left",
        border: "none",
        background: "transparent",
        color: theme.palette.textPrimary,
        cursor: "pointer",
        borderRadius: theme.shape.small,
        padding: "6px 10px",
        fontSize: 12,
        fontFamily: "inherit"
      }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("span", { style: {
          width: 12
        }, children: view === v_0 ? "\u2713" : "" }),
        ALL_VIEW_LABELS[v_0]
      ] }, v_0)) })
    ] }) : null;
    $[30] = chooseView;
    $[31] = hover;
    $[32] = theme.blur;
    $[33] = theme.palette.border;
    $[34] = theme.palette.surface;
    $[35] = theme.palette.textPrimary;
    $[36] = theme.shape.small;
    $[37] = view;
    $[38] = viewMenuOpen;
    $[39] = t19;
  } else {
    t19 = $[39];
  }
  let t20;
  if ($[40] !== t18 || $[41] !== t19) {
    t20 = /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("div", { style: t12, children: [
      t18,
      t19
    ] });
    $[40] = t18;
    $[41] = t19;
    $[42] = t20;
  } else {
    t20 = $[42];
  }
  let t21;
  if ($[43] !== t11 || $[44] !== t20) {
    t21 = /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("div", { style: t10, children: [
      t11,
      t20
    ] });
    $[43] = t11;
    $[44] = t20;
    $[45] = t21;
  } else {
    t21 = $[45];
  }
  const t22 = view === "category" && !jumpOpen ? /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("div", { style: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 12,
    alignContent: "start",
    paddingTop: 4
  }, children: categories.map((cat) => /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("button", { type: "button", onClick: (e_3) => {
    openFlyout(cat.name, e_3.currentTarget);
  }, onMouseEnter: (e_4) => {
    const tile = e_4.currentTarget.firstElementChild;
    if (tile) {
      tile.style.background = `${theme.palette.textPrimary}1a`;
    }
  }, onMouseLeave: (e_5) => {
    const tile_0 = e_5.currentTarget.firstElementChild;
    if (tile_0) {
      tile_0.style.background = `${theme.palette.textPrimary}0d`;
    }
  }, style: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    padding: 0,
    border: "none",
    background: "transparent",
    color: theme.palette.textPrimary,
    cursor: "pointer",
    fontFamily: "inherit"
  }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("span", { "aria-hidden": true, style: {
      width: "100%",
      boxSizing: "border-box",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: 152,
      borderRadius: theme.shape.windowRadius + 2,
      background: `${theme.palette.textPrimary}0d`,
      border: `1px solid ${theme.palette.border}`,
      transition: "background 120ms ease"
    }, children: /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("span", { style: {
      display: "grid",
      gridTemplateColumns: "repeat(2, 36px)",
      gridTemplateRows: "repeat(2, 36px)",
      gap: 8
    }, children: cat.items.slice(0, 4).map(_temp94) }) }),
    /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("span", { style: {
      maxWidth: "100%",
      fontSize: 13,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }, children: cat.name })
  ] }, cat.name)) }) : null;
  const t23 = flyout ? /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)(import_jsx_runtime18.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("div", { role: "presentation", onClick: closeFlyout, style: {
      position: "fixed",
      inset: 0,
      zIndex: 1401,
      background: "rgba(0,0,0,0.35)",
      backdropFilter: "blur(2px)",
      WebkitBackdropFilter: "blur(2px)",
      animation: reducedMotion ? void 0 : `rui-fade-in ${String(theme.motion.windowOpenDurationMs)}ms ${theme.motion.windowOpenEasing} both`
    } }),
    /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("div", { ref: flyoutRef, role: "dialog", "aria-modal": "true", "aria-label": flyout, tabIndex: -1, onKeyDown: (e_6) => {
      if (e_6.key === "Escape") {
        e_6.stopPropagation();
        closeFlyout();
      }
    }, style: {
      position: "fixed",
      left: "50%",
      top: "50%",
      outline: "none",
      transform: "translate(-50%, -50%)",
      width: "min(86%, 620px)",
      maxHeight: "78%",
      zIndex: 1402,
      display: "flex",
      flexDirection: "column",
      gap: 16,
      padding: "28px 28px 24px",
      background: theme.palette.surface,
      backdropFilter: theme.blur.spotlight,
      WebkitBackdropFilter: theme.blur.spotlight,
      border: `1px solid ${theme.palette.border}`,
      borderRadius: theme.shape.windowRadius + 4,
      color: theme.palette.textPrimary,
      boxShadow: "0 32px 70px -18px rgba(0,0,0,0.7)",
      animation: reducedMotion ? void 0 : `rui-window-open ${String(theme.motion.windowOpenDurationMs)}ms ${theme.motion.windowOpenEasing} both`
    }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("h2", { style: {
        margin: 0,
        textAlign: "center",
        fontSize: 22,
        fontWeight: 600,
        fontFamily: "inherit"
      }, children: flyout }),
      /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("div", { style: {
        overflowY: "auto",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 8,
        alignContent: "start"
      }, children: flyoutItems.map((result) => /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("div", { style: {
        width: 116,
        flexShrink: 0
      }, children: /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(LauncherTile, { result, size: 48, plain: true, onActivate: () => {
        flyoutTriggerRef.current = null;
        setFlyout(null);
        onActivate(result);
      } }) }, `cat:${result.key}`)) })
    ] })
  ] }) : null;
  const t24 = view === "category" ? null : jumpOpen ? /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("div", { style: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: 4,
    padding: "8px 0"
  }, children: ALL_ALPHABET.map((letter_0) => /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("button", { type: "button", disabled: !present.has(letter_0), onClick: () => {
    pendingJumpRef.current = letter_0;
    setJumpOpen(false);
  }, onMouseEnter: (e_7) => {
    if (present.has(letter_0)) {
      e_7.currentTarget.style.background = hover;
    }
  }, onMouseLeave: _temp04, style: {
    height: 40,
    border: "none",
    background: "transparent",
    color: present.has(letter_0) ? theme.palette.accent : theme.palette.textSecondary,
    opacity: present.has(letter_0) ? 1 : 0.45,
    cursor: present.has(letter_0) ? "pointer" : "default",
    borderRadius: theme.shape.small,
    fontSize: 14,
    fontWeight: 600,
    fontFamily: "inherit"
  }, children: letter_0 }, letter_0)) }) : groups.map((group) => /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("div", { ref: (el) => {
    if (el) {
      sectionRefs.current.set(group.letter, el);
    } else {
      sectionRefs.current.delete(group.letter);
    }
  }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("button", { type: "button", "aria-label": `Jump from ${group.letter}`, onClick: () => {
      setJumpOpen(true);
    }, onMouseEnter: (e_9) => {
      e_9.currentTarget.style.background = hover;
    }, onMouseLeave: _temp19, style: {
      display: "block",
      border: "none",
      background: "transparent",
      color: theme.palette.textPrimary,
      cursor: "pointer",
      borderRadius: theme.shape.small,
      padding: "6px 8px",
      margin: "2px 0",
      fontSize: 13,
      fontWeight: 600,
      fontFamily: "inherit"
    }, children: group.letter }),
    view === "grid" ? /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("div", { style: {
      display: "grid",
      gridTemplateColumns: "repeat(6, 1fr)",
      gap: 4,
      justifyItems: "center",
      alignContent: "start"
    }, children: group.items.map((result_0) => /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(LauncherTile, { result: result_0, size: 36, plain: true, onActivate: () => {
      onActivate(result_0);
    } }, `all:${result_0.key}`)) }) : /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("div", { style: {
      display: "flex",
      flexDirection: "column",
      gap: 2
    }, children: group.items.map((result_1) => /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(MenuRow, { result: result_1, onActivate: () => {
      onActivate(result_1);
    } }, `all:${result_1.key}`)) })
  ] }, group.letter));
  let t25;
  if ($[46] !== t21 || $[47] !== t22 || $[48] !== t23 || $[49] !== t24 || $[50] !== t9) {
    t25 = /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)(import_jsx_runtime18.Fragment, { children: [
      t9,
      t21,
      t22,
      t23,
      t24
    ] });
    $[46] = t21;
    $[47] = t22;
    $[48] = t23;
    $[49] = t24;
    $[50] = t9;
    $[51] = t25;
  } else {
    t25 = $[51];
  }
  return t25;
}
function _temp19(e_10) {
  e_10.currentTarget.style.background = "transparent";
}
function _temp04(e_8) {
  e_8.currentTarget.style.background = "transparent";
}
function _temp94(item_0) {
  return /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("span", { style: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  }, children: /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(ResultMiniIcon, { result: item_0, size: 36 }) }, item_0.key);
}
function _temp84(e_2) {
  e_2.currentTarget.style.background = "transparent";
}
function _temp74(e_0) {
  e_0.currentTarget.style.background = "transparent";
}
function _temp64(v) {
  return !v;
}
function _temp57(g_1) {
  return {
    name: g_1.name,
    items: g_1.items.map(_temp46)
  };
}
function _temp46(i_0) {
  return i_0.result;
}
function _temp37(item) {
  return {
    result: item,
    name: item.name,
    category: item.kind !== "external" ? item.category : void 0
  };
}
function _temp28(g_0) {
  return g_0.letter;
}
function _temp20(g) {
  return g.items.length > 0;
}
function MenuSectionHeader(t0) {
  const $ = (0, import_compiler_runtime23.c)(14);
  const {
    label,
    action
  } = t0;
  const theme = useTheme();
  const hover = `${theme.palette.textPrimary}14`;
  let t1;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t1 = {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexShrink: 0
    };
    $[0] = t1;
  } else {
    t1 = $[0];
  }
  let t2;
  if ($[1] !== theme.palette.textPrimary) {
    t2 = {
      fontSize: 13,
      fontWeight: 600,
      color: theme.palette.textPrimary
    };
    $[1] = theme.palette.textPrimary;
    $[2] = t2;
  } else {
    t2 = $[2];
  }
  let t3;
  if ($[3] !== label || $[4] !== t2) {
    t3 = /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("span", { style: t2, children: label });
    $[3] = label;
    $[4] = t2;
    $[5] = t3;
  } else {
    t3 = $[5];
  }
  let t4;
  if ($[6] !== action || $[7] !== hover || $[8] !== theme.palette.textSecondary || $[9] !== theme.shape) {
    t4 = action ? /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("button", { type: "button", onClick: action.onClick, onMouseEnter: (e) => {
      e.currentTarget.style.background = hover;
    }, onMouseLeave: _temp104, style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      border: "none",
      background: "transparent",
      color: theme.palette.textSecondary,
      cursor: "pointer",
      borderRadius: theme.shape.small,
      padding: "4px 8px",
      fontSize: 12,
      fontFamily: "inherit"
    }, children: [
      action.back ? "\u2039 " : null,
      action.label,
      action.back ? null : " \u203A"
    ] }) : null;
    $[6] = action;
    $[7] = hover;
    $[8] = theme.palette.textSecondary;
    $[9] = theme.shape;
    $[10] = t4;
  } else {
    t4 = $[10];
  }
  let t5;
  if ($[11] !== t3 || $[12] !== t4) {
    t5 = /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("div", { style: t1, children: [
      t3,
      t4
    ] });
    $[11] = t3;
    $[12] = t4;
    $[13] = t5;
  } else {
    t5 = $[13];
  }
  return t5;
}
function _temp104(e_0) {
  e_0.currentTarget.style.background = "transparent";
}
function MenuFooterButton(t0) {
  const $ = (0, import_compiler_runtime23.c)(11);
  const {
    children,
    onClick,
    "aria-label": ariaLabel
  } = t0;
  const theme = useTheme();
  const hover = `${theme.palette.textPrimary}14`;
  let t1;
  if ($[0] !== hover) {
    t1 = (e) => {
      e.currentTarget.style.background = hover;
    };
    $[0] = hover;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  let t2;
  if ($[2] !== theme.palette.textPrimary || $[3] !== theme.shape.small) {
    t2 = {
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      border: "none",
      background: "transparent",
      color: theme.palette.textPrimary,
      cursor: "pointer",
      borderRadius: theme.shape.small,
      padding: "4px 8px",
      fontFamily: "inherit"
    };
    $[2] = theme.palette.textPrimary;
    $[3] = theme.shape.small;
    $[4] = t2;
  } else {
    t2 = $[4];
  }
  let t3;
  if ($[5] !== ariaLabel || $[6] !== children || $[7] !== onClick || $[8] !== t1 || $[9] !== t2) {
    t3 = /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("button", { type: "button", "aria-label": ariaLabel, onClick, onMouseEnter: t1, onMouseLeave: _temp112, style: t2, children });
    $[5] = ariaLabel;
    $[6] = children;
    $[7] = onClick;
    $[8] = t1;
    $[9] = t2;
    $[10] = t3;
  } else {
    t3 = $[10];
  }
  return t3;
}
function _temp112(e_0) {
  e_0.currentTarget.style.background = "transparent";
}
function PowerButton(t0) {
  const $ = (0, import_compiler_runtime23.c)(29);
  const {
    onAction
  } = t0;
  const theme = useTheme();
  const [open2, setOpen] = (0, import_react20.useState)(false);
  const btnRef = (0, import_react20.useRef)(null);
  const firstItemRef = (0, import_react20.useRef)(null);
  const hover = `${theme.palette.textPrimary}14`;
  let t1;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t1 = ["Sleep", "Restart", "Shut down"];
    $[0] = t1;
  } else {
    t1 = $[0];
  }
  const items3 = t1;
  let t2;
  let t3;
  if ($[1] !== open2) {
    t2 = () => {
      if (open2) {
        firstItemRef.current?.focus();
      }
    };
    t3 = [open2];
    $[1] = open2;
    $[2] = t2;
    $[3] = t3;
  } else {
    t2 = $[2];
    t3 = $[3];
  }
  (0, import_react20.useEffect)(t2, t3);
  let t4;
  if ($[4] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t4 = () => {
      setOpen(false);
      btnRef.current?.focus();
    };
    $[4] = t4;
  } else {
    t4 = $[4];
  }
  const close = t4;
  let t5;
  if ($[5] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t5 = {
      position: "relative"
    };
    $[5] = t5;
  } else {
    t5 = $[5];
  }
  let t6;
  if ($[6] !== hover || $[7] !== onAction || $[8] !== open2 || $[9] !== theme.blur || $[10] !== theme.palette.border || $[11] !== theme.palette.surface || $[12] !== theme.palette.textPrimary || $[13] !== theme.shape.small) {
    t6 = open2 ? /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)(import_jsx_runtime18.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("div", { role: "presentation", onClick: () => {
        setOpen(false);
      }, style: {
        position: "fixed",
        inset: 0,
        zIndex: 1
      } }),
      /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("div", { role: "menu", "aria-label": "Power", onKeyDown: (e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          close();
        }
      }, style: {
        position: "absolute",
        right: 0,
        bottom: 40,
        zIndex: 2,
        minWidth: 150,
        padding: 4,
        background: theme.palette.surface,
        backdropFilter: theme.blur.surface,
        WebkitBackdropFilter: theme.blur.surface,
        border: `1px solid ${theme.palette.border}`,
        borderRadius: theme.shape.small,
        boxShadow: "0 12px 28px -10px rgba(0,0,0,0.5)"
      }, children: items3.map((label, i) => /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("button", { ref: i === 0 ? firstItemRef : void 0, type: "button", role: "menuitem", onClick: () => {
        (0, import_core10.notify)({
          title: label,
          body: "This is a demo desktop."
        });
        setOpen(false);
        onAction();
      }, onMouseEnter: (e_0) => {
        e_0.currentTarget.style.background = hover;
      }, onMouseLeave: _temp122, style: {
        display: "block",
        width: "100%",
        textAlign: "left",
        border: "none",
        background: "transparent",
        color: theme.palette.textPrimary,
        cursor: "pointer",
        borderRadius: theme.shape.small,
        padding: "8px 10px",
        fontSize: 13,
        fontFamily: "inherit"
      }, children: label }, label)) })
    ] }) : null;
    $[6] = hover;
    $[7] = onAction;
    $[8] = open2;
    $[9] = theme.blur;
    $[10] = theme.palette.border;
    $[11] = theme.palette.surface;
    $[12] = theme.palette.textPrimary;
    $[13] = theme.shape.small;
    $[14] = t6;
  } else {
    t6 = $[14];
  }
  let t7;
  if ($[15] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t7 = () => {
      setOpen(_temp132);
    };
    $[15] = t7;
  } else {
    t7 = $[15];
  }
  let t8;
  if ($[16] !== hover) {
    t8 = (e_2) => {
      e_2.currentTarget.style.background = hover;
    };
    $[16] = hover;
    $[17] = t8;
  } else {
    t8 = $[17];
  }
  let t9;
  if ($[18] !== theme.palette.textPrimary || $[19] !== theme.shape.small) {
    t9 = {
      width: 34,
      height: 34,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: "none",
      background: "transparent",
      color: theme.palette.textPrimary,
      cursor: "pointer",
      borderRadius: theme.shape.small
    };
    $[18] = theme.palette.textPrimary;
    $[19] = theme.shape.small;
    $[20] = t9;
  } else {
    t9 = $[20];
  }
  let t10;
  if ($[21] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t10 = /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("svg", { width: 17, height: 17, viewBox: "0 0 16 16", fill: "none", "aria-hidden": true, children: [
      /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("path", { d: "M8 1.5v6", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" }),
      /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("path", { d: "M4.4 3.6a5 5 0 1 0 7.2 0", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
    ] });
    $[21] = t10;
  } else {
    t10 = $[21];
  }
  let t11;
  if ($[22] !== open2 || $[23] !== t8 || $[24] !== t9) {
    t11 = /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("button", { ref: btnRef, type: "button", "aria-label": "Power", "aria-haspopup": "menu", "aria-expanded": open2, onClick: t7, onMouseEnter: t8, onMouseLeave: _temp142, style: t9, children: t10 });
    $[22] = open2;
    $[23] = t8;
    $[24] = t9;
    $[25] = t11;
  } else {
    t11 = $[25];
  }
  let t12;
  if ($[26] !== t11 || $[27] !== t6) {
    t12 = /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("div", { style: t5, children: [
      t6,
      t11
    ] });
    $[26] = t11;
    $[27] = t6;
    $[28] = t12;
  } else {
    t12 = $[28];
  }
  return t12;
}
function _temp142(e_3) {
  e_3.currentTarget.style.background = "transparent";
}
function _temp132(v) {
  return !v;
}
function _temp122(e_1) {
  e_1.currentTarget.style.background = "transparent";
}
function ResultGlyph(t0) {
  const $ = (0, import_compiler_runtime23.c)(18);
  const {
    result,
    size
  } = t0;
  const theme = useTheme();
  const accent = result.accent ?? theme.palette.accent;
  const Art = result.kind === "app" ? result.app.iconArt : void 0;
  let t1;
  if ($[0] !== result.app || $[1] !== result.def || $[2] !== result.kind || $[3] !== theme) {
    t1 = result.kind === "app" ? resolveAppIcon(result.app, theme) : result.kind === "system" ? resolveAppIcon(result.def, theme) : void 0;
    $[0] = result.app;
    $[1] = result.def;
    $[2] = result.kind;
    $[3] = theme;
    $[4] = t1;
  } else {
    t1 = $[4];
  }
  const Icon = t1;
  const externalIcon = result.kind === "external" ? result.icon : void 0;
  const t2 = appIconBackground(result.kind === "app" ? result.app : { accent }, theme);
  let t3;
  if ($[5] !== size || $[6] !== t2 || $[7] !== theme.shape.dockTileRadius) {
    t3 = {
      width: size,
      height: size,
      borderRadius: theme.shape.dockTileRadius,
      background: t2,
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.22), 0 2px 6px rgba(0,0,0,0.35)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: appIconForeground(result.kind === "app" ? result.app : { accent }, theme),
      flexShrink: 0
    };
    $[5] = size;
    $[6] = t2;
    $[7] = theme.shape.dockTileRadius;
    $[8] = t3;
  } else {
    t3 = $[8];
  }
  let t4;
  if ($[9] !== Art || $[10] !== Icon || $[11] !== externalIcon || $[12] !== result.name || $[13] !== size) {
    t4 = Art ? /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(Art, { size: Math.round(size * 0.7) }) : Icon ? /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(Icon, { size: Math.round(size * 0.5) }) : externalIcon ? externalIcon : /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("span", { style: {
      fontWeight: 700,
      fontSize: Math.round(size * 0.42)
    }, children: result.name.charAt(0).toUpperCase() });
    $[9] = Art;
    $[10] = Icon;
    $[11] = externalIcon;
    $[12] = result.name;
    $[13] = size;
    $[14] = t4;
  } else {
    t4 = $[14];
  }
  let t5;
  if ($[15] !== t3 || $[16] !== t4) {
    t5 = /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("div", { style: t3, children: t4 });
    $[15] = t3;
    $[16] = t4;
    $[17] = t5;
  } else {
    t5 = $[17];
  }
  return t5;
}
function MenuRow(t0) {
  const $ = (0, import_compiler_runtime23.c)(35);
  const {
    result,
    subtitle,
    index,
    selected,
    optionId,
    onHover,
    onActivate
  } = t0;
  const theme = useTheme();
  let t1;
  if ($[0] !== index || $[1] !== optionId) {
    t1 = index !== void 0 && optionId ? optionId(index) : void 0;
    $[0] = index;
    $[1] = optionId;
    $[2] = t1;
  } else {
    t1 = $[2];
  }
  const t2 = index !== void 0 ? "option" : void 0;
  const t3 = index !== void 0 ? selected : void 0;
  let t4;
  if ($[3] !== onHover || $[4] !== selected || $[5] !== theme.palette) {
    t4 = (e) => {
      onHover?.();
      if (!selected) {
        e.currentTarget.style.background = `${theme.palette.textPrimary}10`;
      }
    };
    $[3] = onHover;
    $[4] = selected;
    $[5] = theme.palette;
    $[6] = t4;
  } else {
    t4 = $[6];
  }
  let t5;
  if ($[7] !== selected) {
    t5 = (e_0) => {
      if (!selected) {
        e_0.currentTarget.style.background = "transparent";
      }
    };
    $[7] = selected;
    $[8] = t5;
  } else {
    t5 = $[8];
  }
  const t6 = selected ? `${theme.palette.textPrimary}1f` : "transparent";
  let t7;
  if ($[9] !== t6 || $[10] !== theme.shape.small) {
    t7 = {
      display: "flex",
      alignItems: "center",
      gap: 12,
      width: "100%",
      boxSizing: "border-box",
      padding: "6px 8px",
      borderRadius: theme.shape.small,
      cursor: "pointer",
      background: t6,
      transition: "background 100ms ease"
    };
    $[9] = t6;
    $[10] = theme.shape.small;
    $[11] = t7;
  } else {
    t7 = $[11];
  }
  const t8 = subtitle ? 30 : 24;
  let t9;
  if ($[12] !== result || $[13] !== t8) {
    t9 = /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(ResultGlyph, { result, size: t8 });
    $[12] = result;
    $[13] = t8;
    $[14] = t9;
  } else {
    t9 = $[14];
  }
  let t10;
  let t11;
  if ($[15] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t10 = {
      minWidth: 0,
      display: "flex",
      flexDirection: "column"
    };
    t11 = {
      fontSize: 13,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    };
    $[15] = t10;
    $[16] = t11;
  } else {
    t10 = $[15];
    t11 = $[16];
  }
  let t12;
  if ($[17] !== result.name) {
    t12 = /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("span", { style: t11, children: result.name });
    $[17] = result.name;
    $[18] = t12;
  } else {
    t12 = $[18];
  }
  let t13;
  if ($[19] !== subtitle || $[20] !== theme.palette) {
    t13 = subtitle ? /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("span", { style: {
      fontSize: 11,
      color: theme.palette.textSecondary
    }, children: subtitle }) : null;
    $[19] = subtitle;
    $[20] = theme.palette;
    $[21] = t13;
  } else {
    t13 = $[21];
  }
  let t14;
  if ($[22] !== t12 || $[23] !== t13) {
    t14 = /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("div", { style: t10, children: [
      t12,
      t13
    ] });
    $[22] = t12;
    $[23] = t13;
    $[24] = t14;
  } else {
    t14 = $[24];
  }
  let t15;
  if ($[25] !== onActivate || $[26] !== t1 || $[27] !== t14 || $[28] !== t2 || $[29] !== t3 || $[30] !== t4 || $[31] !== t5 || $[32] !== t7 || $[33] !== t9) {
    t15 = /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("div", { id: t1, role: t2, "aria-selected": t3, onMouseEnter: t4, onMouseLeave: t5, onClick: onActivate, style: t7, children: [
      t9,
      t14
    ] });
    $[25] = onActivate;
    $[26] = t1;
    $[27] = t14;
    $[28] = t2;
    $[29] = t3;
    $[30] = t4;
    $[31] = t5;
    $[32] = t7;
    $[33] = t9;
    $[34] = t15;
  } else {
    t15 = $[34];
  }
  return t15;
}
function resultKindLabel(result) {
  return result.kind === "app" ? "App" : result.kind === "system" ? "System" : result.kindLabel ?? "External";
}
function ResultRow(t0) {
  const $ = (0, import_compiler_runtime23.c)(42);
  const {
    result,
    index,
    selected,
    onHover,
    onActivate
  } = t0;
  const theme = useTheme();
  const accent = result.accent ?? theme.palette.accent;
  let t1;
  if ($[0] !== result.app || $[1] !== result.def || $[2] !== result.kind || $[3] !== theme) {
    t1 = result.kind === "app" ? resolveAppIcon(result.app, theme) : result.kind === "system" ? resolveAppIcon(result.def, theme) : void 0;
    $[0] = result.app;
    $[1] = result.def;
    $[2] = result.kind;
    $[3] = theme;
    $[4] = t1;
  } else {
    t1 = $[4];
  }
  const Icon = t1;
  const externalIcon = result.kind === "external" ? result.icon : void 0;
  let t2;
  if ($[5] !== index) {
    t2 = spotlightOptionId(index);
    $[5] = index;
    $[6] = t2;
  } else {
    t2 = $[6];
  }
  const t3 = theme.shape.small + 2;
  const t4 = selected ? `${theme.palette.accent}38` : "transparent";
  let t5;
  if ($[7] !== t3 || $[8] !== t4) {
    t5 = {
      display: "flex",
      alignItems: "center",
      gap: 12,
      margin: "0 8px",
      padding: "0 12px",
      height: 44,
      borderRadius: t3,
      cursor: "pointer",
      backgroundColor: t4,
      transition: "background-color 80ms ease"
    };
    $[7] = t3;
    $[8] = t4;
    $[9] = t5;
  } else {
    t5 = $[9];
  }
  const t6 = theme.shape.small + 2;
  const t7 = appIconBackground(result.kind === "app" ? result.app : { accent }, theme);
  let t8;
  if ($[10] !== t6 || $[11] !== t7) {
    t8 = {
      width: 28,
      height: 28,
      flexShrink: 0,
      borderRadius: t6,
      background: t7,
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.22), 0 1px 2px rgba(0,0,0,0.3)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: appIconForeground(result.kind === "app" ? result.app : { accent }, theme)
    };
    $[10] = t6;
    $[11] = t7;
    $[12] = t8;
  } else {
    t8 = $[12];
  }
  let t9;
  if ($[13] !== Icon || $[14] !== externalIcon || $[15] !== result.name) {
    t9 = Icon ? /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(Icon, { size: 15 }) : externalIcon ? externalIcon : /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("span", { style: {
      fontWeight: 700,
      fontSize: 14
    }, children: result.name.charAt(0).toUpperCase() });
    $[13] = Icon;
    $[14] = externalIcon;
    $[15] = result.name;
    $[16] = t9;
  } else {
    t9 = $[16];
  }
  let t10;
  if ($[17] !== t8 || $[18] !== t9) {
    t10 = /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("div", { style: t8, children: t9 });
    $[17] = t8;
    $[18] = t9;
    $[19] = t10;
  } else {
    t10 = $[19];
  }
  let t11;
  if ($[20] !== theme.palette.textPrimary) {
    t11 = {
      flex: 1,
      fontSize: 14,
      fontWeight: 500,
      color: theme.palette.textPrimary,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    };
    $[20] = theme.palette.textPrimary;
    $[21] = t11;
  } else {
    t11 = $[21];
  }
  let t12;
  if ($[22] !== result.name || $[23] !== t11) {
    t12 = /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("span", { style: t11, children: result.name });
    $[22] = result.name;
    $[23] = t11;
    $[24] = t12;
  } else {
    t12 = $[24];
  }
  let t13;
  if ($[25] !== theme.palette.textSecondary) {
    t13 = {
      fontSize: 11,
      color: theme.palette.textSecondary,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      maxWidth: 220
    };
    $[25] = theme.palette.textSecondary;
    $[26] = t13;
  } else {
    t13 = $[26];
  }
  let t14;
  if ($[27] !== result) {
    t14 = result.tagline ?? resultKindLabel(result);
    $[27] = result;
    $[28] = t14;
  } else {
    t14 = $[28];
  }
  let t15;
  if ($[29] !== t13 || $[30] !== t14) {
    t15 = /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("span", { style: t13, children: t14 });
    $[29] = t13;
    $[30] = t14;
    $[31] = t15;
  } else {
    t15 = $[31];
  }
  let t16;
  if ($[32] !== index || $[33] !== onActivate || $[34] !== onHover || $[35] !== selected || $[36] !== t10 || $[37] !== t12 || $[38] !== t15 || $[39] !== t2 || $[40] !== t5) {
    t16 = /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("div", { id: t2, role: "option", "aria-selected": selected, "data-spotlight-index": index, onMouseEnter: onHover, onClick: onActivate, style: t5, children: [
      t10,
      t12,
      t15
    ] });
    $[32] = index;
    $[33] = onActivate;
    $[34] = onHover;
    $[35] = selected;
    $[36] = t10;
    $[37] = t12;
    $[38] = t15;
    $[39] = t2;
    $[40] = t5;
    $[41] = t16;
  } else {
    t16 = $[41];
  }
  return t16;
}
function EmptyState(t0) {
  const $ = (0, import_compiler_runtime23.c)(10);
  const {
    query
  } = t0;
  const theme = useTheme();
  let t1;
  if ($[0] !== theme.palette.textSecondary) {
    t1 = {
      padding: "32px 16px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 4,
      color: theme.palette.textSecondary
    };
    $[0] = theme.palette.textSecondary;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  let t2;
  if ($[2] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t2 = {
      fontSize: 13
    };
    $[2] = t2;
  } else {
    t2 = $[2];
  }
  let t3;
  if ($[3] !== query) {
    t3 = query.trim().length > 0 ? `No matches for "${query.trim()}".` : "Nothing to show yet.";
    $[3] = query;
    $[4] = t3;
  } else {
    t3 = $[4];
  }
  let t4;
  if ($[5] !== t3) {
    t4 = /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("span", { style: t2, children: t3 });
    $[5] = t3;
    $[6] = t4;
  } else {
    t4 = $[6];
  }
  let t5;
  if ($[7] !== t1 || $[8] !== t4) {
    t5 = /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("div", { style: t1, children: t4 });
    $[7] = t1;
    $[8] = t4;
    $[9] = t5;
  } else {
    t5 = $[9];
  }
  return t5;
}
function relativeTime(ts) {
  const mins = Math.floor((Date.now() - ts) / 6e4);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${String(mins)}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${String(hours)}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  return new Date(ts).toLocaleDateString();
}
function HintChip(t0) {
  const $ = (0, import_compiler_runtime23.c)(12);
  const {
    keys,
    label
  } = t0;
  const theme = useTheme();
  let t1;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t1 = {
      display: "inline-flex",
      alignItems: "center",
      gap: 6
    };
    $[0] = t1;
  } else {
    t1 = $[0];
  }
  const t2 = theme.shape.small - 2;
  let t3;
  if ($[1] !== t2 || $[2] !== theme.palette.textSecondary) {
    t3 = {
      fontSize: 10,
      fontWeight: 600,
      padding: "1px 6px",
      borderRadius: t2,
      backgroundColor: "rgba(255,255,255,0.06)",
      color: theme.palette.textSecondary,
      letterSpacing: 0.4,
      fontFamily: "inherit"
    };
    $[1] = t2;
    $[2] = theme.palette.textSecondary;
    $[3] = t3;
  } else {
    t3 = $[3];
  }
  let t4;
  if ($[4] !== keys || $[5] !== t3) {
    t4 = /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("kbd", { style: t3, children: keys });
    $[4] = keys;
    $[5] = t3;
    $[6] = t4;
  } else {
    t4 = $[6];
  }
  let t5;
  if ($[7] !== label) {
    t5 = /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("span", { children: label });
    $[7] = label;
    $[8] = t5;
  } else {
    t5 = $[8];
  }
  let t6;
  if ($[9] !== t4 || $[10] !== t5) {
    t6 = /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("span", { style: t1, children: [
      t4,
      t5
    ] });
    $[9] = t4;
    $[10] = t5;
    $[11] = t6;
  } else {
    t6 = $[11];
  }
  return t6;
}

// src/DesktopIcons.tsx
var import_compiler_runtime25 = require("react/compiler-runtime");
var import_react22 = require("react");
var import_core11 = require("@react-ui-os/core");

// src/folder-svg.tsx
var import_compiler_runtime24 = require("react/compiler-runtime");
var import_jsx_runtime19 = require("react/jsx-runtime");
function FolderSvg(t0) {
  const $ = (0, import_compiler_runtime24.c)(8);
  const {
    size: t1
  } = t0;
  const size = t1 === void 0 ? 48 : t1;
  let t2;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t2 = {
      filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.4))"
    };
    $[0] = t2;
  } else {
    t2 = $[0];
  }
  let t3;
  if ($[1] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t3 = /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("linearGradient", { id: "rui-folder-body", x1: "0", y1: "0", x2: "0", y2: "1", children: [
      /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("stop", { offset: "0%", stopColor: "#3c4658" }),
      /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("stop", { offset: "100%", stopColor: "#1c2333" })
    ] });
    $[1] = t3;
  } else {
    t3 = $[1];
  }
  let t4;
  let t5;
  let t6;
  let t7;
  if ($[2] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t4 = /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("defs", { children: [
      t3,
      /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("linearGradient", { id: "rui-folder-tab", x1: "0", y1: "0", x2: "0", y2: "1", children: [
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("stop", { offset: "0%", stopColor: "#4a5573" }),
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("stop", { offset: "100%", stopColor: "#2c364e" })
      ] })
    ] });
    t5 = /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("path", { d: "M 6 12 L 18 12 L 22 16 L 42 16 L 42 19 L 6 19 Z", fill: "url(#rui-folder-tab)" });
    t6 = /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("rect", { x: "6", y: "18", width: "36", height: "22", rx: "2.5", ry: "2.5", fill: "url(#rui-folder-body)", stroke: "rgba(255,255,255,0.08)", strokeWidth: "0.5" });
    t7 = /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("path", { d: "M 7 19 L 41 19", stroke: "rgba(255,255,255,0.18)", strokeWidth: "0.6" });
    $[2] = t4;
    $[3] = t5;
    $[4] = t6;
    $[5] = t7;
  } else {
    t4 = $[2];
    t5 = $[3];
    t6 = $[4];
    t7 = $[5];
  }
  let t8;
  if ($[6] !== size) {
    t8 = /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("svg", { width: size, height: size, viewBox: "0 0 48 48", fill: "none", "aria-hidden": true, style: t2, children: [
      t4,
      t5,
      t6,
      t7
    ] });
    $[6] = size;
    $[7] = t8;
  } else {
    t8 = $[7];
  }
  return t8;
}

// src/use-desktop-marquee.ts
var import_react21 = require("react");

// src/util/marquee.ts
function marqueeFromPoints(x0, y0, x1, y1) {
  return {
    left: Math.min(x0, x1),
    top: Math.min(y0, y1),
    width: Math.abs(x1 - x0),
    height: Math.abs(y1 - y0)
  };
}
function marqueeIntersects(rect, tile) {
  const right = rect.left + rect.width;
  const bottom = rect.top + rect.height;
  return tile.left <= right && tile.right >= rect.left && tile.top <= bottom && tile.bottom >= rect.top;
}

// src/use-desktop-marquee.ts
var MARQUEE_THRESHOLD_PX = 4;
function isBareDesktop(target) {
  if (!target) return false;
  if (target.closest("[data-rui-window]") || target.closest("[data-rui-dock]") || target.closest("[data-rui-menubar]") || target.closest("[data-rui-context-region]")) {
    return false;
  }
  const tag = target.tagName.toLowerCase();
  return !(tag === "input" || tag === "textarea" || target.isContentEditable);
}
function iconsInMarquee(rect, container) {
  if (!container) return [];
  const ids = [];
  container.querySelectorAll("[data-desktop-icon-id]").forEach((el) => {
    const id = el.getAttribute("data-desktop-icon-id");
    if (id && marqueeIntersects(rect, el.getBoundingClientRect())) ids.push(id);
  });
  return ids;
}
function useDesktopMarquee({
  containerRef,
  selectedIds,
  selectIcons,
  clearSelection
}) {
  const [marquee, setMarquee] = (0, import_react21.useState)(null);
  const latest = (0, import_react21.useRef)({
    selectedIds,
    selectIcons,
    clearSelection
  });
  latest.current = {
    selectedIds,
    selectIcons,
    clearSelection
  };
  (0, import_react21.useEffect)(() => {
    const onPointerDown = (e) => {
      const target = e.target;
      if (containerRef.current?.contains(target)) return;
      if (!isBareDesktop(target)) {
        if (latest.current.selectedIds.size > 0) latest.current.clearSelection();
        return;
      }
      if (e.button !== 0) return;
      const x0 = e.clientX;
      const y0 = e.clientY;
      const additive = e.shiftKey || e.metaKey || e.ctrlKey;
      const base = new Set(latest.current.selectedIds);
      let dragging = false;
      let lastApplied = [];
      const teardown = () => {
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);
        document.removeEventListener("contextmenu", onContextMenu, true);
        window.removeEventListener("keydown", onKey, true);
        document.body.style.userSelect = "";
        setMarquee(null);
      };
      const cancel = () => {
        if (dragging) latest.current.selectIcons(Array.from(base));
        teardown();
      };
      const onMove = (ev) => {
        if (!dragging && Math.hypot(ev.clientX - x0, ev.clientY - y0) < MARQUEE_THRESHOLD_PX) {
          return;
        }
        dragging = true;
        document.body.style.userSelect = "none";
        const rect = marqueeFromPoints(x0, y0, ev.clientX, ev.clientY);
        setMarquee(rect);
        const swept = iconsInMarquee(rect, containerRef.current);
        lastApplied = additive ? Array.from(/* @__PURE__ */ new Set([...base, ...swept])) : swept;
        latest.current.selectIcons(lastApplied);
      };
      const onUp = () => {
        teardown();
        if (!dragging) {
          if (!additive && latest.current.selectedIds.size > 0) {
            latest.current.clearSelection();
          }
          return;
        }
        if (lastApplied.length > 0) containerRef.current?.focus();
      };
      const onKey = (ev_0) => {
        if (ev_0.key === "Escape" && dragging) {
          ev_0.preventDefault();
          ev_0.stopPropagation();
          cancel();
        }
      };
      const onContextMenu = (ev_1) => {
        if (!dragging) return;
        ev_1.preventDefault();
        ev_1.stopPropagation();
        cancel();
      };
      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", onUp);
      document.addEventListener("contextmenu", onContextMenu, true);
      window.addEventListener("keydown", onKey, true);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [containerRef]);
  return marquee;
}

// src/util/desktop-icon-nav.ts
function nextIconIndex(current, key, count) {
  switch (key) {
    case "ArrowDown":
      return current < 0 ? 0 : clamp2(current + 1, 0, count - 1);
    case "ArrowUp":
      return current < 0 ? count - 1 : clamp2(current - 1, 0, count - 1);
    case "Home":
      return 0;
    case "End":
      return count - 1;
  }
}

// src/DesktopIcons.tsx
var import_jsx_runtime20 = require("react/jsx-runtime");
var ICON_TILE = 56;
var ICON_LABEL_GAP = 4;
var ICON_GAP = 18;
var EDGE_INSET = 14;
function optionDomId(systemId) {
  return `rui-desktop-icon-${systemId}`;
}
function DesktopIcons() {
  const $ = (0, import_compiler_runtime25.c)(35);
  const theme = useTheme();
  const apps = useApps();
  const {
    storage
  } = useDesktopContext();
  const {
    state,
    openWindow
  } = (0, import_core11.useWindowManager)();
  let t0;
  if ($[0] !== storage) {
    t0 = () => computeVisible(storage);
    $[0] = storage;
    $[1] = t0;
  } else {
    t0 = $[1];
  }
  const [visible, setVisible] = (0, import_react22.useState)(t0);
  let t1;
  if ($[2] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t1 = /* @__PURE__ */ new Set();
    $[2] = t1;
  } else {
    t1 = $[2];
  }
  const [selectedIds, setSelectedIds] = (0, import_react22.useState)(t1);
  const [activeId, setActiveId] = (0, import_react22.useState)(null);
  const listboxRef = (0, import_react22.useRef)(null);
  let t2;
  let t3;
  if ($[3] !== storage) {
    t2 = () => {
      const recompute = () => {
        setVisible(computeVisible(storage));
      };
      recompute();
      const unsubscribe = storage.subscribe(() => {
        recompute();
      });
      return unsubscribe;
    };
    t3 = [storage];
    $[3] = storage;
    $[4] = t2;
    $[5] = t3;
  } else {
    t2 = $[4];
    t3 = $[5];
  }
  (0, import_react22.useEffect)(t2, t3);
  let t4;
  let t5;
  if ($[6] !== visible) {
    t4 = () => {
      const ids = new Set(visible.map(_temp21));
      setSelectedIds((prev) => {
        const next = /* @__PURE__ */ new Set();
        for (const id of prev) {
          if (ids.has(id)) {
            next.add(id);
          }
        }
        return next.size === prev.size ? prev : next;
      });
      setActiveId((prev_0) => prev_0 && ids.has(prev_0) ? prev_0 : null);
    };
    t5 = [visible];
    $[6] = visible;
    $[7] = t4;
    $[8] = t5;
  } else {
    t4 = $[7];
    t5 = $[8];
  }
  (0, import_react22.useEffect)(t4, t5);
  let t6;
  if ($[9] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t6 = (ids_0) => {
      setSelectedIds(new Set(ids_0));
      setActiveId(ids_0.length > 0 ? ids_0[ids_0.length - 1] ?? null : null);
    };
    $[9] = t6;
  } else {
    t6 = $[9];
  }
  const selectIcons = t6;
  let t7;
  if ($[10] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t7 = () => {
      setSelectedIds(/* @__PURE__ */ new Set());
      setActiveId(null);
    };
    $[10] = t7;
  } else {
    t7 = $[10];
  }
  const clearSelection = t7;
  const marquee = useDesktopMarquee({
    containerRef: listboxRef,
    selectedIds,
    selectIcons,
    clearSelection
  });
  let t8;
  if ($[11] !== apps || $[12] !== openWindow || $[13] !== state || $[14] !== theme) {
    t8 = (systemId) => {
      const payload = {
        kind: "system",
        systemId
      };
      openWindow(payload, pickInitialBounds(payload, theme, apps, void 0, nextCascadeIndex(state)));
    };
    $[11] = apps;
    $[12] = openWindow;
    $[13] = state;
    $[14] = theme;
    $[15] = t8;
  } else {
    t8 = $[15];
  }
  const openIcon = t8;
  let t9;
  if ($[16] !== activeId || $[17] !== visible) {
    t9 = (systemId_0, modifiers) => {
      if (modifiers.range && activeId) {
        const ids_1 = visible.map(_temp29);
        const a = ids_1.indexOf(activeId);
        const b = ids_1.indexOf(systemId_0);
        if (a >= 0 && b >= 0) {
          const [from, to] = a <= b ? [a, b] : [b, a];
          const next_0 = /* @__PURE__ */ new Set();
          for (let i = from; i <= to; i++) {
            const id_0 = ids_1[i];
            if (id_0) {
              next_0.add(id_0);
            }
          }
          setSelectedIds(next_0);
          return;
        }
      }
      if (modifiers.toggle) {
        setSelectedIds((prev_1) => {
          const next_1 = new Set(prev_1);
          if (next_1.has(systemId_0)) {
            next_1.delete(systemId_0);
          } else {
            next_1.add(systemId_0);
          }
          return next_1;
        });
        setActiveId(systemId_0);
        return;
      }
      setSelectedIds(/* @__PURE__ */ new Set([systemId_0]));
      setActiveId(systemId_0);
    };
    $[16] = activeId;
    $[17] = visible;
    $[18] = t9;
  } else {
    t9 = $[18];
  }
  const selectIcon = t9;
  const mode = useViewportMode();
  let t10;
  if ($[19] !== mode) {
    t10 = getChromeMetrics(mode);
    $[19] = mode;
    $[20] = t10;
  } else {
    t10 = $[20];
  }
  const metrics = t10;
  let t11;
  if ($[21] !== theme) {
    t11 = getDockReservation(theme);
    $[21] = theme;
    $[22] = t11;
  } else {
    t11 = $[22];
  }
  const dock = t11;
  const topInset = (theme.chrome.menuBar === "top" ? metrics.menuBarHeight : 0) + dock.top + EDGE_INSET;
  const rightInset = dock.right + EDGE_INSET;
  let t12;
  if ($[23] !== activeId || $[24] !== openIcon || $[25] !== selectedIds || $[26] !== visible) {
    t12 = (e) => {
      if (visible.length === 0) {
        return;
      }
      const ids_2 = visible.map(_temp38);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "a") {
        e.preventDefault();
        selectIcons(ids_2);
        return;
      }
      const currentIdx = activeId ? ids_2.indexOf(activeId) : -1;
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Home" || e.key === "End") {
        e.preventDefault();
        const next_2 = nextIconIndex(currentIdx, e.key, ids_2.length);
        const id_1 = ids_2[next_2];
        selectIcons(id_1 ? [id_1] : []);
        return;
      }
      if (e.key === "Enter") {
        if (activeId) {
          e.preventDefault();
          openIcon(activeId);
        }
        return;
      }
      if (e.key === "Escape" && selectedIds.size > 0) {
        e.preventDefault();
        clearSelection();
      }
    };
    $[23] = activeId;
    $[24] = openIcon;
    $[25] = selectedIds;
    $[26] = visible;
    $[27] = t12;
  } else {
    t12 = $[27];
  }
  const handleKeyDown = t12;
  const t13 = visible.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("div", { ref: listboxRef, role: "listbox", "aria-label": "Desktop icons", "aria-orientation": "vertical", "aria-multiselectable": true, "aria-activedescendant": activeId ? optionDomId(activeId) : void 0, tabIndex: 0, onKeyDown: handleKeyDown, style: {
    position: "fixed",
    top: topInset,
    right: rightInset,
    display: "flex",
    flexDirection: "column",
    gap: ICON_GAP,
    zIndex: 1,
    outline: "none"
  }, children: visible.map((t14) => {
    const {
      systemId: systemId_1,
      def
    } = t14;
    return /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(DesktopShortcut, { systemId: systemId_1, def, selected: selectedIds.has(systemId_1), onSelect: (modifiers_0) => {
      selectIcon(systemId_1, modifiers_0);
      listboxRef.current?.focus();
    }, onOpen: () => {
      openIcon(systemId_1);
    }, onContextMenu: (x, y) => {
      if (!selectedIds.has(systemId_1)) {
        selectIcon(systemId_1, {});
      }
      listboxRef.current?.focus();
      openContextMenu({
        x,
        y,
        ariaLabel: resolveSystemWindowName(def),
        items: [{
          label: "Open",
          shortcut: "\u21B5",
          onSelect: () => {
            openIcon(systemId_1);
          }
        }],
        returnFocusTo: listboxRef.current
      });
    } }, systemId_1);
  }) });
  let t15;
  if ($[28] !== marquee || $[29] !== theme.palette || $[30] !== theme.shape) {
    t15 = marquee && /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("div", { "aria-hidden": true, style: {
      position: "fixed",
      left: marquee.left,
      top: marquee.top,
      width: marquee.width,
      height: marquee.height,
      background: `${theme.palette.accent}22`,
      border: `1px solid ${theme.palette.accent}99`,
      borderRadius: theme.shape.small,
      pointerEvents: "none",
      zIndex: 2
    } });
    $[28] = marquee;
    $[29] = theme.palette;
    $[30] = theme.shape;
    $[31] = t15;
  } else {
    t15 = $[31];
  }
  let t16;
  if ($[32] !== t13 || $[33] !== t15) {
    t16 = /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)(import_jsx_runtime20.Fragment, { children: [
      t13,
      t15
    ] });
    $[32] = t13;
    $[33] = t15;
    $[34] = t16;
  } else {
    t16 = $[34];
  }
  return t16;
}
function _temp38(v_1) {
  return v_1.systemId;
}
function _temp29(v_0) {
  return v_0.systemId;
}
function _temp21(v) {
  return v.systemId;
}
function DesktopShortcut(t0) {
  const $ = (0, import_compiler_runtime25.c)(33);
  const {
    systemId,
    def,
    selected,
    onSelect,
    onOpen,
    onContextMenu
  } = t0;
  const theme = useTheme();
  const Icon = def.desktopIcon ?? FolderSvg;
  let t1;
  if ($[0] !== def) {
    t1 = resolveSystemWindowName(def);
    $[0] = def;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  const label = t1;
  const onWallpaper = Boolean(theme.wallpaper.src);
  const labelColor = onWallpaper ? "#fff" : theme.palette.textPrimary;
  const labelShadow = onWallpaper ? "0 1px 3px rgba(0,0,0,0.8)" : "none";
  let t2;
  if ($[2] !== onSelect) {
    t2 = (e) => {
      e.stopPropagation();
      onSelect({
        toggle: e.metaKey || e.ctrlKey,
        range: e.shiftKey
      });
    };
    $[2] = onSelect;
    $[3] = t2;
  } else {
    t2 = $[3];
  }
  const handleClick = t2;
  let t3;
  if ($[4] !== onContextMenu) {
    t3 = (e_0) => {
      e_0.preventDefault();
      e_0.stopPropagation();
      onContextMenu(e_0.clientX, e_0.clientY);
    };
    $[4] = onContextMenu;
    $[5] = t3;
  } else {
    t3 = $[5];
  }
  const handleContextMenu = t3;
  let t4;
  if ($[6] !== systemId) {
    t4 = optionDomId(systemId);
    $[6] = systemId;
    $[7] = t4;
  } else {
    t4 = $[7];
  }
  const t5 = selected ? `${theme.palette.accent}38` : "transparent";
  let t6;
  if ($[8] !== t5 || $[9] !== theme.palette.textPrimary || $[10] !== theme.shape.small) {
    t6 = {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: ICON_LABEL_GAP,
      width: ICON_TILE + 24,
      padding: "4px 0",
      borderRadius: theme.shape.small,
      background: t5,
      cursor: "pointer",
      color: theme.palette.textPrimary
    };
    $[8] = t5;
    $[9] = theme.palette.textPrimary;
    $[10] = theme.shape.small;
    $[11] = t6;
  } else {
    t6 = $[11];
  }
  let t7;
  if ($[12] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t7 = {
      width: ICON_TILE,
      height: ICON_TILE,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    };
    $[12] = t7;
  } else {
    t7 = $[12];
  }
  let t8;
  if ($[13] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t8 = Math.round(ICON_TILE * 0.85);
    $[13] = t8;
  } else {
    t8 = $[13];
  }
  let t9;
  if ($[14] !== Icon) {
    t9 = /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("div", { style: t7, children: /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(Icon, { size: t8 }) });
    $[14] = Icon;
    $[15] = t9;
  } else {
    t9 = $[15];
  }
  let t10;
  if ($[16] !== labelColor || $[17] !== labelShadow) {
    t10 = {
      fontSize: 11,
      fontWeight: 500,
      color: labelColor,
      textShadow: labelShadow,
      whiteSpace: "nowrap",
      maxWidth: ICON_TILE + 24,
      overflow: "hidden",
      textOverflow: "ellipsis"
    };
    $[16] = labelColor;
    $[17] = labelShadow;
    $[18] = t10;
  } else {
    t10 = $[18];
  }
  let t11;
  if ($[19] !== label || $[20] !== t10) {
    t11 = /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("span", { style: t10, children: label });
    $[19] = label;
    $[20] = t10;
    $[21] = t11;
  } else {
    t11 = $[21];
  }
  let t12;
  if ($[22] !== handleClick || $[23] !== handleContextMenu || $[24] !== label || $[25] !== onOpen || $[26] !== selected || $[27] !== systemId || $[28] !== t11 || $[29] !== t4 || $[30] !== t6 || $[31] !== t9) {
    t12 = /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { role: "option", id: t4, "aria-selected": selected, "data-desktop-icon-id": systemId, title: label, onClick: handleClick, onDoubleClick: onOpen, onContextMenu: handleContextMenu, style: t6, children: [
      t9,
      t11
    ] });
    $[22] = handleClick;
    $[23] = handleContextMenu;
    $[24] = label;
    $[25] = onOpen;
    $[26] = selected;
    $[27] = systemId;
    $[28] = t11;
    $[29] = t4;
    $[30] = t6;
    $[31] = t9;
    $[32] = t12;
  } else {
    t12 = $[32];
  }
  return t12;
}
function computeVisible(storage) {
  return listSystemWindows().filter((entry) => {
    const cond = entry.appearsAsDesktopIcon;
    if (cond === void 0 || cond === false) return false;
    if (cond === true) return true;
    try {
      return cond(storage);
    } catch {
      return false;
    }
  }).map(({
    systemId,
    ...def
  }) => ({
    systemId,
    def
  }));
}

// src/NotificationToasts.tsx
var import_compiler_runtime26 = require("react/compiler-runtime");
var import_react23 = require("react");
var import_core12 = require("@react-ui-os/core");
var import_jsx_runtime21 = require("react/jsx-runtime");
function NotificationToasts() {
  const $ = (0, import_compiler_runtime26.c)(17);
  const theme = useTheme();
  const apps = useApps();
  const {
    active: active4
  } = (0, import_core12.useNotifications)();
  const mode = useViewportMode();
  let t0;
  if ($[0] !== mode) {
    t0 = getChromeMetrics(mode);
    $[0] = mode;
    $[1] = t0;
  } else {
    t0 = $[1];
  }
  const metrics = t0;
  let t1;
  if ($[2] !== theme) {
    t1 = theme.chrome.dockStyle === "bar" ? getDockReservation(theme) : {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    };
    $[2] = theme;
    $[3] = t1;
  } else {
    t1 = $[3];
  }
  const dock = t1;
  const dockGutter = (theme.chrome.menuBar === "top" ? metrics.menuBarHeight : 0) + dock.top + 12;
  if (active4.length === 0) {
    return null;
  }
  const t2 = dock.right + 12;
  let t3;
  if ($[4] !== dockGutter || $[5] !== t2) {
    t3 = {
      position: "fixed",
      top: dockGutter,
      right: t2,
      display: "flex",
      flexDirection: "column",
      gap: 10,
      zIndex: 1300,
      pointerEvents: "none",
      maxWidth: 380,
      width: "calc(100vw - 24px)"
    };
    $[4] = dockGutter;
    $[5] = t2;
    $[6] = t3;
  } else {
    t3 = $[6];
  }
  let t4;
  if ($[7] !== active4 || $[8] !== apps || $[9] !== theme.palette) {
    let t52;
    if ($[11] !== apps || $[12] !== theme.palette) {
      t52 = (item, idx) => {
        const accent = item.accent ?? (item.appId ? apps.find((a) => a.id === item.appId)?.accent : void 0) ?? levelAccent(item.level) ?? theme.palette.accent;
        return /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(Toast, { item, accent, indexFromTop: idx }, item.id);
      };
      $[11] = apps;
      $[12] = theme.palette;
      $[13] = t52;
    } else {
      t52 = $[13];
    }
    t4 = active4.map(t52);
    $[7] = active4;
    $[8] = apps;
    $[9] = theme.palette;
    $[10] = t4;
  } else {
    t4 = $[10];
  }
  let t5;
  if ($[14] !== t3 || $[15] !== t4) {
    t5 = /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("div", { role: "region", "aria-label": "Notifications", "aria-live": "polite", style: t3, children: t4 });
    $[14] = t3;
    $[15] = t4;
    $[16] = t5;
  } else {
    t5 = $[16];
  }
  return t5;
}
function levelAccent(level) {
  switch (level) {
    case "success":
      return "#22c55e";
    case "warn":
      return "#f59e0b";
    case "error":
      return "#ef4444";
    default:
      return void 0;
  }
}
function Toast(t0) {
  const $ = (0, import_compiler_runtime26.c)(57);
  const {
    item,
    accent,
    indexFromTop
  } = t0;
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const [phase, setPhase] = (0, import_react23.useState)("enter");
  const enterDelay = Math.min(indexFromTop, 4) * 40;
  let t1;
  let t2;
  if ($[0] !== enterDelay) {
    t1 = () => {
      const raf = window.requestAnimationFrame(() => {
        window.setTimeout(() => setPhase("ready"), enterDelay);
      });
      return () => {
        window.cancelAnimationFrame(raf);
      };
    };
    t2 = [enterDelay];
    $[0] = enterDelay;
    $[1] = t1;
    $[2] = t2;
  } else {
    t1 = $[1];
    t2 = $[2];
  }
  (0, import_react23.useEffect)(t1, t2);
  const readTimerRef = (0, import_react23.useRef)(null);
  let t3;
  let t4;
  if ($[3] !== item.id || $[4] !== item.level || $[5] !== item.read) {
    t3 = () => {
      if (item.level === "error" || item.read) {
        return;
      }
      readTimerRef.current = setTimeout(() => {
        (0, import_core12.markNotificationRead)(item.id);
      }, 1500);
      return () => {
        if (readTimerRef.current) {
          clearTimeout(readTimerRef.current);
        }
      };
    };
    t4 = [item.id, item.level, item.read];
    $[3] = item.id;
    $[4] = item.level;
    $[5] = item.read;
    $[6] = t3;
    $[7] = t4;
  } else {
    t3 = $[6];
    t4 = $[7];
  }
  (0, import_react23.useEffect)(t3, t4);
  const baseTransform = reducedMotion ? "none" : phase === "enter" ? "translateX(120%) scale(0.96)" : "translateX(0) scale(1)";
  const baseOpacity = phase === "enter" ? 0 : 1;
  const t5 = `1px solid ${theme.palette.border}`;
  const t6 = reducedMotion ? "none" : `transform ${String(theme.motion.windowOpenDurationMs)}ms ${theme.motion.windowOpenEasing}, opacity ${String(theme.motion.windowOpenDurationMs)}ms ${theme.motion.windowOpenEasing}`;
  let t7;
  if ($[8] !== baseOpacity || $[9] !== baseTransform || $[10] !== t5 || $[11] !== t6 || $[12] !== theme.blur.surface || $[13] !== theme.palette.surface || $[14] !== theme.palette.textPrimary || $[15] !== theme.shape.windowRadius) {
    t7 = {
      pointerEvents: "auto",
      background: theme.palette.surface,
      backdropFilter: theme.blur.surface,
      WebkitBackdropFilter: theme.blur.surface,
      border: t5,
      borderRadius: theme.shape.windowRadius,
      boxShadow: "0 18px 48px -16px rgba(0,0,0,0.55)",
      color: theme.palette.textPrimary,
      padding: "12px 14px 12px 18px",
      position: "relative",
      overflow: "hidden",
      transform: baseTransform,
      opacity: baseOpacity,
      transition: t6
    };
    $[8] = baseOpacity;
    $[9] = baseTransform;
    $[10] = t5;
    $[11] = t6;
    $[12] = theme.blur.surface;
    $[13] = theme.palette.surface;
    $[14] = theme.palette.textPrimary;
    $[15] = theme.shape.windowRadius;
    $[16] = t7;
  } else {
    t7 = $[16];
  }
  const card = t7;
  let t8;
  if ($[17] !== accent) {
    t8 = {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: 4,
      background: accent
    };
    $[17] = accent;
    $[18] = t8;
  } else {
    t8 = $[18];
  }
  const accentBar = t8;
  let t9;
  if ($[19] !== accentBar) {
    t9 = /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("span", { style: accentBar, "aria-hidden": true });
    $[19] = accentBar;
    $[20] = t9;
  } else {
    t9 = $[20];
  }
  let t10;
  if ($[21] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t10 = {
      display: "flex",
      alignItems: "flex-start",
      gap: 10
    };
    $[21] = t10;
  } else {
    t10 = $[21];
  }
  let t11;
  if ($[22] !== accent || $[23] !== item) {
    t11 = /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(ToastIcon, { item, accent });
    $[22] = accent;
    $[23] = item;
    $[24] = t11;
  } else {
    t11 = $[24];
  }
  let t12;
  let t13;
  if ($[25] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t12 = {
      minWidth: 0,
      flex: 1
    };
    t13 = {
      fontWeight: 600,
      fontSize: 13,
      lineHeight: 1.3,
      wordBreak: "break-word"
    };
    $[25] = t12;
    $[26] = t13;
  } else {
    t12 = $[25];
    t13 = $[26];
  }
  let t14;
  if ($[27] !== item.title) {
    t14 = /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("div", { style: t13, children: item.title });
    $[27] = item.title;
    $[28] = t14;
  } else {
    t14 = $[28];
  }
  let t15;
  if ($[29] !== item.body || $[30] !== item.bodyNode || $[31] !== theme.palette.textSecondary) {
    t15 = (item.body || item.bodyNode) && /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("div", { style: {
      marginTop: 2,
      fontSize: 12,
      lineHeight: 1.4,
      color: theme.palette.textSecondary,
      wordBreak: "break-word"
    }, children: item.bodyNode ?? item.body });
    $[29] = item.body;
    $[30] = item.bodyNode;
    $[31] = theme.palette.textSecondary;
    $[32] = t15;
  } else {
    t15 = $[32];
  }
  let t16;
  if ($[33] !== accent || $[34] !== item.actions || $[35] !== item.id || $[36] !== theme.palette.border || $[37] !== theme.palette.textPrimary || $[38] !== theme.shape.small) {
    t16 = item.actions && item.actions.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("div", { style: {
      marginTop: 10,
      display: "flex",
      gap: 8,
      flexWrap: "wrap"
    }, children: item.actions.map((action) => /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("button", { type: "button", onClick: () => {
      action.onClick(item.id);
      (0, import_core12.dismissNotification)(item.id);
    }, style: {
      appearance: "none",
      border: action.primary ? "1px solid transparent" : `1px solid ${theme.palette.border}`,
      background: action.primary ? accent : "transparent",
      color: action.primary ? "#fff" : theme.palette.textPrimary,
      borderRadius: theme.shape.small,
      fontSize: 12,
      padding: "4px 10px",
      cursor: "pointer",
      fontFamily: "inherit",
      fontWeight: action.primary ? 600 : 500
    }, children: action.label }, action.label)) });
    $[33] = accent;
    $[34] = item.actions;
    $[35] = item.id;
    $[36] = theme.palette.border;
    $[37] = theme.palette.textPrimary;
    $[38] = theme.shape.small;
    $[39] = t16;
  } else {
    t16 = $[39];
  }
  let t17;
  if ($[40] !== t14 || $[41] !== t15 || $[42] !== t16) {
    t17 = /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("div", { style: t12, children: [
      t14,
      t15,
      t16
    ] });
    $[40] = t14;
    $[41] = t15;
    $[42] = t16;
    $[43] = t17;
  } else {
    t17 = $[43];
  }
  let t18;
  if ($[44] !== item.id) {
    t18 = () => (0, import_core12.dismissNotification)(item.id);
    $[44] = item.id;
    $[45] = t18;
  } else {
    t18 = $[45];
  }
  let t19;
  if ($[46] !== t18 || $[47] !== theme.palette.textSecondary) {
    t19 = /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(DismissButton, { onClick: t18, color: theme.palette.textSecondary });
    $[46] = t18;
    $[47] = theme.palette.textSecondary;
    $[48] = t19;
  } else {
    t19 = $[48];
  }
  let t20;
  if ($[49] !== t11 || $[50] !== t17 || $[51] !== t19) {
    t20 = /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("div", { style: t10, children: [
      t11,
      t17,
      t19
    ] });
    $[49] = t11;
    $[50] = t17;
    $[51] = t19;
    $[52] = t20;
  } else {
    t20 = $[52];
  }
  let t21;
  if ($[53] !== card || $[54] !== t20 || $[55] !== t9) {
    t21 = /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("div", { style: card, role: "status", children: [
      t9,
      t20
    ] });
    $[53] = card;
    $[54] = t20;
    $[55] = t9;
    $[56] = t21;
  } else {
    t21 = $[56];
  }
  return t21;
}
function ToastIcon(t0) {
  const $ = (0, import_compiler_runtime26.c)(11);
  const {
    item,
    accent
  } = t0;
  const theme = useTheme();
  const IconComp = item.icon;
  let t1;
  if ($[0] !== IconComp || $[1] !== item) {
    t1 = IconComp ? /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(IconComp, { size: 16 }) : /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("span", { style: {
      fontSize: 12,
      fontWeight: 700
    }, children: iconLetterFor(item) });
    $[0] = IconComp;
    $[1] = item;
    $[2] = t1;
  } else {
    t1 = $[2];
  }
  const content = t1;
  const t2 = theme.shape.small + 2;
  const t3 = `${accent}1f`;
  const t4 = `1px solid ${theme.palette.border}`;
  let t5;
  if ($[3] !== t2 || $[4] !== t3 || $[5] !== t4 || $[6] !== theme.palette.textPrimary) {
    t5 = {
      flexShrink: 0,
      width: 28,
      height: 28,
      borderRadius: t2,
      background: t3,
      border: t4,
      color: theme.palette.textPrimary,
      display: "grid",
      placeItems: "center",
      marginTop: 1
    };
    $[3] = t2;
    $[4] = t3;
    $[5] = t4;
    $[6] = theme.palette.textPrimary;
    $[7] = t5;
  } else {
    t5 = $[7];
  }
  let t6;
  if ($[8] !== content || $[9] !== t5) {
    t6 = /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("div", { "aria-hidden": true, style: t5, children: content });
    $[8] = content;
    $[9] = t5;
    $[10] = t6;
  } else {
    t6 = $[10];
  }
  return t6;
}
function iconLetterFor(item) {
  if (item.level === "error") return "!";
  if (item.level === "warn") return "!";
  if (item.level === "success") return "\u2713";
  if (item.title) return item.title.trim().charAt(0).toUpperCase();
  return "\xB7";
}
function DismissButton(t0) {
  const $ = (0, import_compiler_runtime26.c)(5);
  const {
    onClick,
    color
  } = t0;
  let t1;
  if ($[0] !== color) {
    t1 = {
      appearance: "none",
      background: "transparent",
      border: 0,
      color,
      padding: 2,
      cursor: "pointer",
      opacity: 0.6,
      fontSize: 14,
      lineHeight: 1,
      marginTop: -2
    };
    $[0] = color;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  let t2;
  if ($[2] !== onClick || $[3] !== t1) {
    t2 = /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("button", { type: "button", onClick, "aria-label": "Dismiss notification", style: t1, onMouseEnter: _temp30, onMouseLeave: _temp210, children: "\xD7" });
    $[2] = onClick;
    $[3] = t1;
    $[4] = t2;
  } else {
    t2 = $[4];
  }
  return t2;
}
function _temp210(e_0) {
  e_0.currentTarget.style.opacity = "0.6";
}
function _temp30(e) {
  e.currentTarget.style.opacity = "1";
}

// src/NotificationCenter.tsx
var import_compiler_runtime27 = require("react/compiler-runtime");
var import_react24 = require("react");
var import_core13 = require("@react-ui-os/core");
var import_jsx_runtime22 = require("react/jsx-runtime");
function NotificationCenter() {
  const $ = (0, import_compiler_runtime27.c)(77);
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const apps = useApps();
  const {
    items: items3,
    unreadCount
  } = (0, import_core13.useNotifications)();
  const [open2, setOpen] = (0, import_react24.useState)(false);
  let t0;
  let t1;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t0 = () => {
      const handleToggle = () => setOpen(_temp31);
      window.addEventListener(NOTIFICATION_CENTER_TOGGLE_EVENT, handleToggle);
      return () => {
        window.removeEventListener(NOTIFICATION_CENTER_TOGGLE_EVENT, handleToggle);
      };
    };
    t1 = [];
    $[0] = t0;
    $[1] = t1;
  } else {
    t0 = $[0];
    t1 = $[1];
  }
  (0, import_react24.useEffect)(t0, t1);
  let t2;
  let t3;
  if ($[2] !== open2) {
    t2 = () => {
      if (!open2) {
        return;
      }
      const handleKey = (e) => {
        if (e.key === "Escape") {
          setOpen(false);
        }
      };
      window.addEventListener("keydown", handleKey);
      return () => {
        window.removeEventListener("keydown", handleKey);
      };
    };
    t3 = [open2];
    $[2] = open2;
    $[3] = t2;
    $[4] = t3;
  } else {
    t2 = $[3];
    t3 = $[4];
  }
  (0, import_react24.useEffect)(t2, t3);
  let t4;
  let t5;
  if ($[5] !== open2 || $[6] !== unreadCount) {
    t4 = () => {
      if (open2 && unreadCount > 0) {
        (0, import_core13.markAllNotificationsRead)();
      }
    };
    t5 = [open2, unreadCount];
    $[5] = open2;
    $[6] = unreadCount;
    $[7] = t4;
    $[8] = t5;
  } else {
    t4 = $[7];
    t5 = $[8];
  }
  (0, import_react24.useEffect)(t4, t5);
  const mode = useViewportMode();
  let t6;
  if ($[9] !== mode) {
    t6 = getChromeMetrics(mode);
    $[9] = mode;
    $[10] = t6;
  } else {
    t6 = $[10];
  }
  const metrics = t6;
  const isBar = theme.chrome.dockStyle === "bar";
  let t7;
  if ($[11] !== isBar || $[12] !== theme) {
    t7 = isBar ? getDockReservation(theme) : {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    };
    $[11] = isBar;
    $[12] = theme;
    $[13] = t7;
  } else {
    t7 = $[13];
  }
  const dock = t7;
  const topGutter = (theme.chrome.menuBar === "top" ? metrics.menuBarHeight : 0) + dock.top;
  const t8 = open2 ? "auto" : "none";
  let t9;
  if ($[14] !== t8) {
    t9 = {
      position: "fixed",
      inset: 0,
      background: "transparent",
      zIndex: 1180,
      pointerEvents: t8
    };
    $[14] = t8;
    $[15] = t9;
  } else {
    t9 = $[15];
  }
  const backdrop = t9;
  const t10 = `1px solid ${theme.palette.border}`;
  const t11 = open2 ? "translateX(0)" : `translateX(calc(100% + ${String(dock.right)}px))`;
  const t12 = reducedMotion ? "none" : `transform ${String(theme.motion.windowOpenDurationMs)}ms ${theme.motion.windowOpenEasing}`;
  let t13;
  if ($[16] !== dock.bottom || $[17] !== dock.right || $[18] !== t10 || $[19] !== t11 || $[20] !== t12 || $[21] !== theme.blur.surface || $[22] !== theme.palette.surface || $[23] !== theme.palette.textPrimary || $[24] !== topGutter) {
    t13 = {
      position: "fixed",
      top: topGutter,
      right: dock.right,
      bottom: dock.bottom,
      width: 360,
      maxWidth: "calc(100vw - 24px)",
      background: theme.palette.surface,
      backdropFilter: theme.blur.surface,
      WebkitBackdropFilter: theme.blur.surface,
      borderLeft: t10,
      color: theme.palette.textPrimary,
      boxShadow: "-20px 0 50px -20px rgba(0,0,0,0.55)",
      zIndex: 1200,
      transform: t11,
      transition: t12,
      display: "flex",
      flexDirection: "column",
      fontFamily: "inherit"
    };
    $[16] = dock.bottom;
    $[17] = dock.right;
    $[18] = t10;
    $[19] = t11;
    $[20] = t12;
    $[21] = theme.blur.surface;
    $[22] = theme.palette.surface;
    $[23] = theme.palette.textPrimary;
    $[24] = topGutter;
    $[25] = t13;
  } else {
    t13 = $[25];
  }
  const sheet = t13;
  let t14;
  let t15;
  let t16;
  let t17;
  let t18;
  let t19;
  let t20;
  let t21;
  if ($[26] !== apps || $[27] !== backdrop || $[28] !== items3 || $[29] !== open2 || $[30] !== sheet || $[31] !== theme) {
    const grouped2 = groupByDay(items3);
    const t222 = !open2;
    let t232;
    if ($[40] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
      t232 = () => setOpen(false);
      $[40] = t232;
    } else {
      t232 = $[40];
    }
    if ($[41] !== backdrop || $[42] !== t222) {
      t21 = /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("div", { style: backdrop, "aria-hidden": t222, onClick: t232 });
      $[41] = backdrop;
      $[42] = t222;
      $[43] = t21;
    } else {
      t21 = $[43];
    }
    t16 = sheet;
    t17 = !open2;
    t18 = "Notification Center";
    t19 = "dialog";
    const t242 = `1px solid ${theme.palette.border}`;
    let t25;
    if ($[44] !== t242) {
      t25 = {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 16px",
        borderBottom: t242,
        flexShrink: 0
      };
      $[44] = t242;
      $[45] = t25;
    } else {
      t25 = $[45];
    }
    let t26;
    let t27;
    if ($[46] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
      t26 = {
        display: "flex",
        alignItems: "baseline",
        gap: 8
      };
      t27 = /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("strong", { style: {
        fontSize: 13
      }, children: "Notifications" });
      $[46] = t26;
      $[47] = t27;
    } else {
      t26 = $[46];
      t27 = $[47];
    }
    let t28;
    if ($[48] !== theme.palette.textSecondary) {
      t28 = {
        color: theme.palette.textSecondary,
        fontSize: 11
      };
      $[48] = theme.palette.textSecondary;
      $[49] = t28;
    } else {
      t28 = $[49];
    }
    const t29 = items3.length === 0 ? "No notifications" : `${String(items3.length)} total`;
    let t30;
    if ($[50] !== t28 || $[51] !== t29) {
      t30 = /* @__PURE__ */ (0, import_jsx_runtime22.jsxs)("div", { style: t26, children: [
        t27,
        /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("span", { style: t28, children: t29 })
      ] });
      $[50] = t28;
      $[51] = t29;
      $[52] = t30;
    } else {
      t30 = $[52];
    }
    let t31;
    if ($[53] !== items3.length || $[54] !== theme.palette.border || $[55] !== theme.palette.textSecondary || $[56] !== theme.shape) {
      t31 = items3.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("button", { type: "button", onClick: import_core13.clearAllNotifications, style: {
        appearance: "none",
        background: "transparent",
        border: `1px solid ${theme.palette.border}`,
        color: theme.palette.textSecondary,
        borderRadius: theme.shape.small,
        fontSize: 11,
        padding: "3px 8px",
        cursor: "pointer",
        fontFamily: "inherit"
      }, children: "Clear all" });
      $[53] = items3.length;
      $[54] = theme.palette.border;
      $[55] = theme.palette.textSecondary;
      $[56] = theme.shape;
      $[57] = t31;
    } else {
      t31 = $[57];
    }
    if ($[58] !== t25 || $[59] !== t30 || $[60] !== t31) {
      t20 = /* @__PURE__ */ (0, import_jsx_runtime22.jsxs)("header", { style: t25, children: [
        t30,
        t31
      ] });
      $[58] = t25;
      $[59] = t30;
      $[60] = t31;
      $[61] = t20;
    } else {
      t20 = $[61];
    }
    const t32 = items3.length === 0 ? "32px 16px" : "12px 12px 24px";
    if ($[62] !== t32) {
      t14 = {
        flex: 1,
        overflowY: "auto",
        padding: t32
      };
      $[62] = t32;
      $[63] = t14;
    } else {
      t14 = $[63];
    }
    t15 = items3.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(EmptyState2, { theme }) : grouped2.map((t33) => {
      const [label, group] = t33;
      return /* @__PURE__ */ (0, import_jsx_runtime22.jsxs)("section", { style: {
        marginBottom: 18
      }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("h3", { style: {
          margin: "0 6px 6px",
          fontSize: 10,
          letterSpacing: 0.6,
          textTransform: "uppercase",
          color: theme.palette.textSecondary,
          fontWeight: 600
        }, children: label }),
        /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("div", { style: {
          display: "flex",
          flexDirection: "column",
          gap: 6
        }, children: group.map((item) => /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(CenterRow, { item, accent: accentFor(item, apps) }, item.id)) })
      ] }, label);
    });
    $[26] = apps;
    $[27] = backdrop;
    $[28] = items3;
    $[29] = open2;
    $[30] = sheet;
    $[31] = theme;
    $[32] = t14;
    $[33] = t15;
    $[34] = t16;
    $[35] = t17;
    $[36] = t18;
    $[37] = t19;
    $[38] = t20;
    $[39] = t21;
  } else {
    t14 = $[32];
    t15 = $[33];
    t16 = $[34];
    t17 = $[35];
    t18 = $[36];
    t19 = $[37];
    t20 = $[38];
    t21 = $[39];
  }
  let t22;
  if ($[64] !== t14 || $[65] !== t15) {
    t22 = /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("div", { style: t14, children: t15 });
    $[64] = t14;
    $[65] = t15;
    $[66] = t22;
  } else {
    t22 = $[66];
  }
  let t23;
  if ($[67] !== t16 || $[68] !== t17 || $[69] !== t18 || $[70] !== t19 || $[71] !== t20 || $[72] !== t22) {
    t23 = /* @__PURE__ */ (0, import_jsx_runtime22.jsxs)("aside", { style: t16, "aria-hidden": t17, "aria-label": t18, role: t19, children: [
      t20,
      t22
    ] });
    $[67] = t16;
    $[68] = t17;
    $[69] = t18;
    $[70] = t19;
    $[71] = t20;
    $[72] = t22;
    $[73] = t23;
  } else {
    t23 = $[73];
  }
  let t24;
  if ($[74] !== t21 || $[75] !== t23) {
    t24 = /* @__PURE__ */ (0, import_jsx_runtime22.jsxs)(import_jsx_runtime22.Fragment, { children: [
      t21,
      t23
    ] });
    $[74] = t21;
    $[75] = t23;
    $[76] = t24;
  } else {
    t24 = $[76];
  }
  return t24;
}
function _temp31(prev) {
  return !prev;
}
function EmptyState2(t0) {
  const $ = (0, import_compiler_runtime27.c)(9);
  const {
    theme
  } = t0;
  let t1;
  if ($[0] !== theme.palette.textSecondary) {
    t1 = {
      textAlign: "center",
      color: theme.palette.textSecondary,
      fontSize: 12,
      lineHeight: 1.5
    };
    $[0] = theme.palette.textSecondary;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  let t2;
  if ($[2] !== theme.palette.border || $[3] !== theme.palette.textPrimary) {
    t2 = /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("div", { "aria-hidden": true, style: {
      width: 42,
      height: 42,
      borderRadius: 12,
      background: theme.palette.border,
      margin: "0 auto 10px",
      display: "grid",
      placeItems: "center",
      color: theme.palette.textPrimary,
      fontSize: 22,
      fontWeight: 200
    }, children: "\xB7" });
    $[2] = theme.palette.border;
    $[3] = theme.palette.textPrimary;
    $[4] = t2;
  } else {
    t2 = $[4];
  }
  let t3;
  if ($[5] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t3 = /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("br", {});
    $[5] = t3;
  } else {
    t3 = $[5];
  }
  let t4;
  if ($[6] !== t1 || $[7] !== t2) {
    t4 = /* @__PURE__ */ (0, import_jsx_runtime22.jsxs)("div", { style: t1, children: [
      t2,
      "You are all caught up.",
      t3,
      "Toasts will collect here while you work."
    ] });
    $[6] = t1;
    $[7] = t2;
    $[8] = t4;
  } else {
    t4 = $[8];
  }
  return t4;
}
function CenterRow(t0) {
  const $ = (0, import_compiler_runtime27.c)(36);
  const {
    item,
    accent
  } = t0;
  const theme = useTheme();
  let t1;
  if ($[0] !== item.createdAt) {
    t1 = new Date(item.createdAt).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit"
    });
    $[0] = item.createdAt;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  const time = t1;
  const t2 = theme.shape.small + 2;
  let t3;
  if ($[2] !== t2 || $[3] !== theme.palette.border) {
    t3 = {
      position: "relative",
      background: theme.palette.border,
      borderRadius: t2,
      padding: "10px 12px 10px 16px",
      fontSize: 12,
      lineHeight: 1.4
    };
    $[2] = t2;
    $[3] = theme.palette.border;
    $[4] = t3;
  } else {
    t3 = $[4];
  }
  let t4;
  if ($[5] !== accent) {
    t4 = /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("span", { "aria-hidden": true, style: {
      position: "absolute",
      left: 0,
      top: 6,
      bottom: 6,
      width: 3,
      background: accent,
      borderRadius: 3
    } });
    $[5] = accent;
    $[6] = t4;
  } else {
    t4 = $[6];
  }
  let t5;
  let t6;
  if ($[7] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t5 = {
      display: "flex",
      justifyContent: "space-between",
      gap: 8,
      alignItems: "baseline"
    };
    t6 = {
      fontSize: 12
    };
    $[7] = t5;
    $[8] = t6;
  } else {
    t5 = $[7];
    t6 = $[8];
  }
  let t7;
  if ($[9] !== item.title) {
    t7 = /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("strong", { style: t6, children: item.title });
    $[9] = item.title;
    $[10] = t7;
  } else {
    t7 = $[10];
  }
  let t8;
  if ($[11] !== theme.palette.textSecondary) {
    t8 = {
      color: theme.palette.textSecondary,
      fontSize: 10,
      fontVariantNumeric: "tabular-nums"
    };
    $[11] = theme.palette.textSecondary;
    $[12] = t8;
  } else {
    t8 = $[12];
  }
  let t9;
  if ($[13] !== t8 || $[14] !== time) {
    t9 = /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("span", { style: t8, children: time });
    $[13] = t8;
    $[14] = time;
    $[15] = t9;
  } else {
    t9 = $[15];
  }
  let t10;
  if ($[16] !== t7 || $[17] !== t9) {
    t10 = /* @__PURE__ */ (0, import_jsx_runtime22.jsxs)("div", { style: t5, children: [
      t7,
      t9
    ] });
    $[16] = t7;
    $[17] = t9;
    $[18] = t10;
  } else {
    t10 = $[18];
  }
  let t11;
  if ($[19] !== item.body || $[20] !== item.bodyNode || $[21] !== theme.palette.textSecondary) {
    t11 = (item.body || item.bodyNode) && /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("div", { style: {
      marginTop: 2,
      color: theme.palette.textSecondary
    }, children: item.bodyNode ?? item.body });
    $[19] = item.body;
    $[20] = item.bodyNode;
    $[21] = theme.palette.textSecondary;
    $[22] = t11;
  } else {
    t11 = $[22];
  }
  let t12;
  if ($[23] !== item.id) {
    t12 = () => (0, import_core13.removeNotification)(item.id);
    $[23] = item.id;
    $[24] = t12;
  } else {
    t12 = $[24];
  }
  let t13;
  if ($[25] !== theme.palette.textSecondary) {
    t13 = {
      position: "absolute",
      top: 4,
      right: 6,
      appearance: "none",
      background: "transparent",
      border: 0,
      color: theme.palette.textSecondary,
      padding: 4,
      fontSize: 11,
      cursor: "pointer",
      opacity: 0.5,
      lineHeight: 1
    };
    $[25] = theme.palette.textSecondary;
    $[26] = t13;
  } else {
    t13 = $[26];
  }
  let t14;
  if ($[27] !== t12 || $[28] !== t13) {
    t14 = /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("button", { type: "button", onClick: t12, "aria-label": "Remove notification", style: t13, onMouseEnter: _temp211, onMouseLeave: _temp39, children: "\xD7" });
    $[27] = t12;
    $[28] = t13;
    $[29] = t14;
  } else {
    t14 = $[29];
  }
  let t15;
  if ($[30] !== t10 || $[31] !== t11 || $[32] !== t14 || $[33] !== t3 || $[34] !== t4) {
    t15 = /* @__PURE__ */ (0, import_jsx_runtime22.jsxs)("div", { style: t3, children: [
      t4,
      t10,
      t11,
      t14
    ] });
    $[30] = t10;
    $[31] = t11;
    $[32] = t14;
    $[33] = t3;
    $[34] = t4;
    $[35] = t15;
  } else {
    t15 = $[35];
  }
  return t15;
}
function _temp39(e_0) {
  e_0.currentTarget.style.opacity = "0.5";
}
function _temp211(e) {
  e.currentTarget.style.opacity = "1";
}
function accentFor(item, apps) {
  if (item.accent) return item.accent;
  if (item.appId) {
    const app = apps.find((a) => a.id === item.appId);
    if (app?.accent) return app.accent;
  }
  if (item.level === "success") return "#22c55e";
  if (item.level === "warn") return "#f59e0b";
  if (item.level === "error") return "#ef4444";
  return "#6b8afd";
}
function groupByDay(items3) {
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const groups = {};
  for (const item of items3) {
    const date = new Date(item.createdAt);
    date.setHours(0, 0, 0, 0);
    const label = date.getTime() === today.getTime() ? "Today" : date.getTime() === yesterday.getTime() ? "Yesterday" : new Date(item.createdAt).toLocaleDateString();
    if (!groups[label]) groups[label] = [];
    groups[label].push(item);
  }
  return Object.entries(groups);
}

// src/QuickSettings.tsx
var import_compiler_runtime28 = require("react/compiler-runtime");
var import_react25 = require("react");

// src/quick-settings.ts
var items2 = /* @__PURE__ */ new Map();
var listeners10 = /* @__PURE__ */ new Set();
var cachedSnapshot2 = [];
function rebuildSnapshot2() {
  cachedSnapshot2 = Array.from(items2.values()).sort((a, b) => (a.order ?? 100) - (b.order ?? 100));
}
function emit5() {
  rebuildSnapshot2();
  for (const listener of listeners10) listener();
}
function registerQuickSetting(item) {
  items2.set(item.id, item);
  emit5();
  return () => {
    if (items2.get(item.id) === item) {
      items2.delete(item.id);
      emit5();
    }
  };
}
function unregisterQuickSetting(id) {
  if (!items2.has(id)) return;
  items2.delete(id);
  emit5();
}
function listQuickSettings() {
  return cachedSnapshot2;
}
function subscribeQuickSettings(listener) {
  listeners10.add(listener);
  return () => {
    listeners10.delete(listener);
  };
}

// src/QuickSettings.tsx
var import_jsx_runtime23 = require("react/jsx-runtime");
function QuickSettings() {
  const $ = (0, import_compiler_runtime28.c)(57);
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const mode = useViewportMode();
  let t0;
  if ($[0] !== mode) {
    t0 = getChromeMetrics(mode);
    $[0] = mode;
    $[1] = t0;
  } else {
    t0 = $[1];
  }
  const metrics = t0;
  const items3 = (0, import_react25.useSyncExternalStore)(subscribeQuickSettings, listQuickSettings, listQuickSettings);
  const [open2, setOpen] = (0, import_react25.useState)(false);
  let t1;
  let t2;
  if ($[2] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t1 = () => {
      const handleToggle = () => setOpen(_temp40);
      window.addEventListener(QUICK_SETTINGS_TOGGLE_EVENT, handleToggle);
      return () => {
        window.removeEventListener(QUICK_SETTINGS_TOGGLE_EVENT, handleToggle);
      };
    };
    t2 = [];
    $[2] = t1;
    $[3] = t2;
  } else {
    t1 = $[2];
    t2 = $[3];
  }
  (0, import_react25.useEffect)(t1, t2);
  let t3;
  let t4;
  if ($[4] !== open2) {
    t3 = () => {
      if (!open2) {
        return;
      }
      const handleKey = (e) => {
        if (e.key === "Escape") {
          setOpen(false);
        }
      };
      window.addEventListener("keydown", handleKey);
      return () => {
        window.removeEventListener("keydown", handleKey);
      };
    };
    t4 = [open2];
    $[4] = open2;
    $[5] = t3;
    $[6] = t4;
  } else {
    t3 = $[5];
    t4 = $[6];
  }
  (0, import_react25.useEffect)(t3, t4);
  if (items3.length === 0) {
    return null;
  }
  let t10;
  let t11;
  let t12;
  let t5;
  let t6;
  let t7;
  let t8;
  let t9;
  if ($[7] !== items3 || $[8] !== metrics || $[9] !== open2 || $[10] !== reducedMotion || $[11] !== theme.blur.surface || $[12] !== theme.chrome.menuBar || $[13] !== theme.elevation?.windowFocused || $[14] !== theme.motion || $[15] !== theme.palette.border || $[16] !== theme.palette.surface || $[17] !== theme.palette.textPrimary || $[18] !== theme.shape.windowRadius) {
    const actions = items3.filter(_temp212);
    const sliders = items3.filter(_temp310);
    const toggles = items3.filter(_temp47);
    const startActions = actions.filter(_temp58);
    const endActions = actions.filter(_temp65);
    const topGutter = theme.chrome.menuBar === "top" ? metrics.menuBarHeight : 0;
    const t132 = open2 ? "auto" : "none";
    let t142;
    if ($[27] !== t132) {
      t142 = {
        position: "fixed",
        inset: 0,
        background: "transparent",
        zIndex: 1300,
        pointerEvents: t132
      };
      $[27] = t132;
      $[28] = t142;
    } else {
      t142 = $[28];
    }
    const backdrop = t142;
    const t15 = topGutter + 6;
    const t16 = `1px solid ${theme.palette.border}`;
    const t17 = theme.elevation?.windowFocused ?? "0 16px 40px -12px rgba(0,0,0,0.5)";
    const t18 = open2 ? 1 : 0;
    const t19 = open2 ? "scale(1)" : "scale(0.96)";
    const t20 = open2 ? "auto" : "none";
    const t21 = open2 ? "visible" : "hidden";
    const t22 = reducedMotion ? "none" : `opacity ${String(theme.motion.windowOpenDurationMs)}ms ${theme.motion.windowOpenEasing}, transform ${String(theme.motion.windowOpenDurationMs)}ms ${theme.motion.windowOpenEasing}`;
    let t23;
    if ($[29] !== t15 || $[30] !== t16 || $[31] !== t17 || $[32] !== t18 || $[33] !== t19 || $[34] !== t20 || $[35] !== t21 || $[36] !== t22 || $[37] !== theme.blur.surface || $[38] !== theme.palette.surface || $[39] !== theme.palette.textPrimary || $[40] !== theme.shape.windowRadius) {
      t23 = {
        position: "fixed",
        top: t15,
        right: 8,
        width: 336,
        maxWidth: "calc(100vw - 16px)",
        background: theme.palette.surface,
        backdropFilter: theme.blur.surface,
        WebkitBackdropFilter: theme.blur.surface,
        border: t16,
        borderRadius: theme.shape.windowRadius,
        color: theme.palette.textPrimary,
        boxShadow: t17,
        zIndex: 1310,
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 14,
        fontFamily: "inherit",
        transformOrigin: "top right",
        opacity: t18,
        transform: t19,
        pointerEvents: t20,
        visibility: t21,
        transition: t22
      };
      $[29] = t15;
      $[30] = t16;
      $[31] = t17;
      $[32] = t18;
      $[33] = t19;
      $[34] = t20;
      $[35] = t21;
      $[36] = t22;
      $[37] = theme.blur.surface;
      $[38] = theme.palette.surface;
      $[39] = theme.palette.textPrimary;
      $[40] = theme.shape.windowRadius;
      $[41] = t23;
    } else {
      t23 = $[41];
    }
    const panel = t23;
    const t24 = !open2;
    let t25;
    if ($[42] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
      t25 = () => setOpen(false);
      $[42] = t25;
    } else {
      t25 = $[42];
    }
    if ($[43] !== backdrop || $[44] !== t24) {
      t12 = /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("div", { style: backdrop, "aria-hidden": t24, onClick: t25 });
      $[43] = backdrop;
      $[44] = t24;
      $[45] = t12;
    } else {
      t12 = $[45];
    }
    t5 = panel;
    t6 = "dialog";
    t7 = "Quick settings";
    t8 = !open2;
    t9 = actions.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("div", { style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("div", { style: {
        display: "flex",
        alignItems: "center",
        gap: 4
      }, children: startActions.map(_temp75) }),
      /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("div", { style: {
        display: "flex",
        alignItems: "center",
        gap: 4
      }, children: endActions.map(_temp85) })
    ] });
    t10 = sliders.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("div", { style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }, children: sliders.map(_temp95) });
    t11 = toggles.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("div", { style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 8
    }, children: toggles.map(_temp05) });
    $[7] = items3;
    $[8] = metrics;
    $[9] = open2;
    $[10] = reducedMotion;
    $[11] = theme.blur.surface;
    $[12] = theme.chrome.menuBar;
    $[13] = theme.elevation?.windowFocused;
    $[14] = theme.motion;
    $[15] = theme.palette.border;
    $[16] = theme.palette.surface;
    $[17] = theme.palette.textPrimary;
    $[18] = theme.shape.windowRadius;
    $[19] = t10;
    $[20] = t11;
    $[21] = t12;
    $[22] = t5;
    $[23] = t6;
    $[24] = t7;
    $[25] = t8;
    $[26] = t9;
  } else {
    t10 = $[19];
    t11 = $[20];
    t12 = $[21];
    t5 = $[22];
    t6 = $[23];
    t7 = $[24];
    t8 = $[25];
    t9 = $[26];
  }
  let t13;
  if ($[46] !== t10 || $[47] !== t11 || $[48] !== t5 || $[49] !== t6 || $[50] !== t7 || $[51] !== t8 || $[52] !== t9) {
    t13 = /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("div", { style: t5, role: t6, "aria-label": t7, "aria-hidden": t8, children: [
      t9,
      t10,
      t11
    ] });
    $[46] = t10;
    $[47] = t11;
    $[48] = t5;
    $[49] = t6;
    $[50] = t7;
    $[51] = t8;
    $[52] = t9;
    $[53] = t13;
  } else {
    t13 = $[53];
  }
  let t14;
  if ($[54] !== t12 || $[55] !== t13) {
    t14 = /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)(import_jsx_runtime23.Fragment, { children: [
      t12,
      t13
    ] });
    $[54] = t12;
    $[55] = t13;
    $[56] = t14;
  } else {
    t14 = $[56];
  }
  return t14;
}
function _temp05(t) {
  return /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(ToggleTile, { item: t }, t.id);
}
function _temp95(s) {
  return /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(SliderRow, { item: s }, s.id);
}
function _temp85(a_2) {
  return /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(ActionButton, { item: a_2 }, a_2.id);
}
function _temp75(a_1) {
  return /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(ActionButton, { item: a_1 }, a_1.id);
}
function _temp65(a_0) {
  return a_0.align === "end";
}
function _temp58(a) {
  return a.align !== "end";
}
function _temp47(i_1) {
  return i_1.kind === "toggle";
}
function _temp310(i_0) {
  return i_0.kind === "slider";
}
function _temp212(i) {
  return i.kind === "action";
}
function _temp40(prev) {
  return !prev;
}
function ActionButton(t0) {
  const $ = (0, import_compiler_runtime28.c)(18);
  const {
    item
  } = t0;
  const theme = useTheme();
  const idle = `${theme.palette.textPrimary}14`;
  const hover = `${theme.palette.textPrimary}26`;
  const t1 = item.tooltip ?? item.id;
  const t2 = `background ${String(theme.motion.dockHoverDurationMs)}ms ease`;
  let t3;
  if ($[0] !== idle || $[1] !== t2 || $[2] !== theme.palette.textPrimary) {
    t3 = {
      appearance: "none",
      border: 0,
      width: 34,
      height: 34,
      borderRadius: "50%",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 0,
      cursor: "pointer",
      background: idle,
      color: theme.palette.textPrimary,
      transition: t2
    };
    $[0] = idle;
    $[1] = t2;
    $[2] = theme.palette.textPrimary;
    $[3] = t3;
  } else {
    t3 = $[3];
  }
  let t4;
  if ($[4] !== hover) {
    t4 = (e) => {
      e.currentTarget.style.background = hover;
    };
    $[4] = hover;
    $[5] = t4;
  } else {
    t4 = $[5];
  }
  let t5;
  if ($[6] !== idle) {
    t5 = (e_0) => {
      e_0.currentTarget.style.background = idle;
    };
    $[6] = idle;
    $[7] = t5;
  } else {
    t5 = $[7];
  }
  let t6;
  if ($[8] !== item.icon || $[9] !== item.onClick || $[10] !== t1 || $[11] !== t3 || $[12] !== t4 || $[13] !== t5) {
    t6 = /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("button", { type: "button", onClick: item.onClick, "aria-label": t1, style: t3, onMouseEnter: t4, onMouseLeave: t5, children: item.icon });
    $[8] = item.icon;
    $[9] = item.onClick;
    $[10] = t1;
    $[11] = t3;
    $[12] = t4;
    $[13] = t5;
    $[14] = t6;
  } else {
    t6 = $[14];
  }
  const button = t6;
  if (!item.tooltip) {
    return button;
  }
  let t7;
  if ($[15] !== button || $[16] !== item.tooltip) {
    t7 = /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(Tooltip, { text: item.tooltip, placement: "bottom", children: button });
    $[15] = button;
    $[16] = item.tooltip;
    $[17] = t7;
  } else {
    t7 = $[17];
  }
  return t7;
}
function SliderRow(t0) {
  const $ = (0, import_compiler_runtime28.c)(16);
  const {
    item
  } = t0;
  const theme = useTheme();
  let t1;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t1 = {
      display: "flex",
      alignItems: "center",
      gap: 10
    };
    $[0] = t1;
  } else {
    t1 = $[0];
  }
  let t2;
  if ($[1] !== item.icon || $[2] !== theme) {
    t2 = item.icon && /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { "aria-hidden": true, style: {
      display: "inline-flex",
      color: theme.palette.textSecondary,
      flexShrink: 0
    }, children: item.icon });
    $[1] = item.icon;
    $[2] = theme;
    $[3] = t2;
  } else {
    t2 = $[3];
  }
  let t3;
  if ($[4] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t3 = {
      flex: 1,
      minWidth: 0
    };
    $[4] = t3;
  } else {
    t3 = $[4];
  }
  let t4;
  if ($[5] !== item.value) {
    t4 = Math.round(item.value * 100);
    $[5] = item.value;
    $[6] = t4;
  } else {
    t4 = $[6];
  }
  let t5;
  if ($[7] !== item) {
    t5 = (v) => item.onChange?.(v / 100);
    $[7] = item;
    $[8] = t5;
  } else {
    t5 = $[8];
  }
  let t6;
  if ($[9] !== item.ariaLabel || $[10] !== t4 || $[11] !== t5) {
    t6 = /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("div", { style: t3, children: /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(Slider, { value: t4, min: 0, max: 100, onChange: t5, ariaLabel: item.ariaLabel, hideValue: true }) });
    $[9] = item.ariaLabel;
    $[10] = t4;
    $[11] = t5;
    $[12] = t6;
  } else {
    t6 = $[12];
  }
  let t7;
  if ($[13] !== t2 || $[14] !== t6) {
    t7 = /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("div", { style: t1, children: [
      t2,
      t6
    ] });
    $[13] = t2;
    $[14] = t6;
    $[15] = t7;
  } else {
    t7 = $[15];
  }
  return t7;
}
function ToggleTile(t0) {
  const $ = (0, import_compiler_runtime28.c)(35);
  const {
    item
  } = t0;
  const theme = useTheme();
  const active4 = item.active ?? false;
  const inactiveBg = `${theme.palette.textPrimary}14`;
  const fg = active4 ? "#fff" : theme.palette.textPrimary;
  const t1 = active4 ? theme.palette.accent : inactiveBg;
  const t2 = `background ${String(theme.motion.dockHoverDurationMs)}ms ease`;
  let t3;
  if ($[0] !== t1 || $[1] !== t2 || $[2] !== theme.shape.dockTileRadius) {
    t3 = {
      position: "relative",
      display: "flex",
      alignItems: "center",
      borderRadius: theme.shape.dockTileRadius,
      background: t1,
      overflow: "hidden",
      transition: t2
    };
    $[0] = t1;
    $[1] = t2;
    $[2] = theme.shape.dockTileRadius;
    $[3] = t3;
  } else {
    t3 = $[3];
  }
  let t4;
  if ($[4] !== active4 || $[5] !== item) {
    t4 = () => item.onToggle?.(!active4);
    $[4] = active4;
    $[5] = item;
    $[6] = t4;
  } else {
    t4 = $[6];
  }
  let t5;
  if ($[7] !== fg) {
    t5 = {
      appearance: "none",
      border: 0,
      background: "transparent",
      flex: 1,
      minWidth: 0,
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "10px 12px",
      cursor: "pointer",
      color: fg,
      textAlign: "left",
      fontFamily: "inherit"
    };
    $[7] = fg;
    $[8] = t5;
  } else {
    t5 = $[8];
  }
  let t6;
  if ($[9] !== item.icon) {
    t6 = item.icon && /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { "aria-hidden": true, style: {
      display: "inline-flex",
      flexShrink: 0
    }, children: item.icon });
    $[9] = item.icon;
    $[10] = t6;
  } else {
    t6 = $[10];
  }
  let t7;
  let t8;
  if ($[11] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t7 = {
      minWidth: 0,
      lineHeight: 1.2
    };
    t8 = {
      display: "block",
      fontSize: 12,
      fontWeight: 600,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    };
    $[11] = t7;
    $[12] = t8;
  } else {
    t7 = $[11];
    t8 = $[12];
  }
  let t9;
  if ($[13] !== item.label) {
    t9 = /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { style: t8, children: item.label });
    $[13] = item.label;
    $[14] = t9;
  } else {
    t9 = $[14];
  }
  let t10;
  if ($[15] !== item.sublabel) {
    t10 = item.sublabel && /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { style: {
      display: "block",
      fontSize: 11,
      opacity: 0.8,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }, children: item.sublabel });
    $[15] = item.sublabel;
    $[16] = t10;
  } else {
    t10 = $[16];
  }
  let t11;
  if ($[17] !== t10 || $[18] !== t9) {
    t11 = /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("span", { style: t7, children: [
      t9,
      t10
    ] });
    $[17] = t10;
    $[18] = t9;
    $[19] = t11;
  } else {
    t11 = $[19];
  }
  let t12;
  if ($[20] !== active4 || $[21] !== item.label || $[22] !== t11 || $[23] !== t4 || $[24] !== t5 || $[25] !== t6) {
    t12 = /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("button", { type: "button", "aria-pressed": active4, "aria-label": item.label, onClick: t4, style: t5, children: [
      t6,
      t11
    ] });
    $[20] = active4;
    $[21] = item.label;
    $[22] = t11;
    $[23] = t4;
    $[24] = t5;
    $[25] = t6;
    $[26] = t12;
  } else {
    t12 = $[26];
  }
  let t13;
  if ($[27] !== fg || $[28] !== item.label || $[29] !== item.onExpand) {
    t13 = item.onExpand && /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("button", { type: "button", "aria-label": `${item.label} details`, onClick: item.onExpand, style: {
      appearance: "none",
      border: 0,
      background: "transparent",
      alignSelf: "stretch",
      display: "flex",
      alignItems: "center",
      paddingRight: 10,
      paddingLeft: 4,
      cursor: "pointer",
      color: fg
    }, children: /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("svg", { width: 12, height: 12, viewBox: "0 0 12 12", "aria-hidden": true, fill: "none", stroke: "currentColor", strokeWidth: 1.4, children: /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("path", { d: "M4.5 2.5 L8 6 L4.5 9.5" }) }) });
    $[27] = fg;
    $[28] = item.label;
    $[29] = item.onExpand;
    $[30] = t13;
  } else {
    t13 = $[30];
  }
  let t14;
  if ($[31] !== t12 || $[32] !== t13 || $[33] !== t3) {
    t14 = /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("div", { style: t3, children: [
      t12,
      t13
    ] });
    $[31] = t12;
    $[32] = t13;
    $[33] = t3;
    $[34] = t14;
  } else {
    t14 = $[34];
  }
  return t14;
}

// src/desktop-backdrop.tsx
var import_compiler_runtime29 = require("react/compiler-runtime");
var import_react26 = require("react");
var import_core14 = require("@react-ui-os/core");
function DesktopBackdrop(t0) {
  const $ = (0, import_compiler_runtime29.c)(12);
  let t1;
  if ($[0] !== t0) {
    t1 = t0 === void 0 ? {} : t0;
    $[0] = t0;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  const {
    extraItems,
    buildItems
  } = t1;
  const {
    state,
    windows,
    minimizeWindow,
    openWindow
  } = (0, import_core14.useWindowManager)();
  const theme = useTheme();
  const apps = useApps();
  let t2;
  let t3;
  if ($[2] !== apps || $[3] !== buildItems || $[4] !== extraItems || $[5] !== minimizeWindow || $[6] !== openWindow || $[7] !== state || $[8] !== theme || $[9] !== windows) {
    t2 = () => {
      const handler = (e) => {
        const target = e.target;
        if (!target) {
          return;
        }
        if (target.closest("[data-rui-context-region]")) {
          return;
        }
        if (target.closest("[data-rui-window]")) {
          return;
        }
        if (target.closest("[data-rui-dock]")) {
          return;
        }
        if (target.closest("[data-rui-menubar]")) {
          return;
        }
        const tag = target.tagName.toLowerCase();
        if (tag === "input" || tag === "textarea" || target.isContentEditable) {
          return;
        }
        e.preventDefault();
        const defaultItems = [{
          label: "Spotlight",
          shortcut: "\u2318K",
          onSelect: _temp41
        }, {
          label: "Notifications",
          onSelect: _temp213
        }, {
          label: "Keyboard Shortcuts",
          onSelect: _temp311
        }, {
          separator: true
        }, {
          label: "System Settings",
          shortcut: "\u2318,",
          onSelect: () => {
            const payload = {
              kind: "system",
              systemId: "settings"
            };
            openWindow(payload, pickInitialBounds(payload, theme, apps, void 0, nextCascadeIndex(state)));
          }
        }, {
          label: "Show Desktop",
          disabled: windows.every(_temp48),
          onSelect: () => {
            for (const w_0 of windows) {
              if (w_0.state !== "minimized") {
                minimizeWindow(w_0.id);
              }
            }
          }
        }];
        const items3 = buildItems ? buildItems(defaultItems) : extraItems ? [...defaultItems, {
          separator: true
        }, ...extraItems] : defaultItems;
        if (items3.length === 0) {
          return;
        }
        openContextMenu({
          x: e.clientX,
          y: e.clientY,
          items: items3,
          ariaLabel: "Desktop"
        });
      };
      document.addEventListener("contextmenu", handler);
      return () => {
        document.removeEventListener("contextmenu", handler);
        closeContextMenu();
      };
    };
    t3 = [state, windows, minimizeWindow, openWindow, theme, apps, extraItems, buildItems];
    $[2] = apps;
    $[3] = buildItems;
    $[4] = extraItems;
    $[5] = minimizeWindow;
    $[6] = openWindow;
    $[7] = state;
    $[8] = theme;
    $[9] = windows;
    $[10] = t2;
    $[11] = t3;
  } else {
    t2 = $[10];
    t3 = $[11];
  }
  (0, import_react26.useEffect)(t2, t3);
  return null;
}
function _temp48(w) {
  return w.state === "minimized";
}
function _temp311() {
  window.dispatchEvent(new CustomEvent(KEYBOARD_HELP_TOGGLE_EVENT));
}
function _temp213() {
  window.dispatchEvent(new CustomEvent(NOTIFICATION_CENTER_TOGGLE_EVENT));
}
function _temp41() {
  window.dispatchEvent(new CustomEvent(SPOTLIGHT_OPEN_EVENT));
}

// src/AppSwitcher.tsx
var import_compiler_runtime30 = require("react/compiler-runtime");
var import_react27 = require("react");
var import_core15 = require("@react-ui-os/core");
var import_jsx_runtime24 = require("react/jsx-runtime");
function AppSwitcher() {
  const $ = (0, import_compiler_runtime30.c)(22);
  const theme = useTheme();
  const apps = useApps();
  const {
    state,
    windows,
    focusWindow,
    openWindow,
    restoreWindow
  } = (0, import_core15.useWindowManager)();
  const [open2, setOpen] = (0, import_react27.useState)(false);
  const [index, setIndex] = (0, import_react27.useState)(0);
  let list;
  if ($[0] !== apps || $[1] !== windows) {
    const ordered = [...windows].sort(_temp49);
    const seen = /* @__PURE__ */ new Set();
    list = [];
    for (const w of ordered) {
      if (w.payload.kind !== "app") {
        continue;
      }
      const {
        appId
      } = w.payload;
      if (seen.has(appId)) {
        continue;
      }
      seen.add(appId);
      const app = apps.find((a_0) => a_0.id === appId);
      if (app) {
        list.push(app);
      }
    }
    $[0] = apps;
    $[1] = windows;
    $[2] = list;
  } else {
    list = $[2];
  }
  const candidates = list;
  let t0;
  if ($[3] !== apps || $[4] !== candidates || $[5] !== focusWindow || $[6] !== openWindow || $[7] !== restoreWindow || $[8] !== state || $[9] !== theme || $[10] !== windows) {
    t0 = (idx) => {
      const target = candidates[idx];
      if (!target) {
        return;
      }
      const id = (0, import_core15.windowIdOf)({
        kind: "app",
        appId: target.id
      });
      const win = windows.find((w_0) => w_0.id === id);
      if (!win) {
        openWindow({
          kind: "app",
          appId: target.id
        }, pickInitialBounds({
          kind: "app",
          appId: target.id
        }, theme, apps, void 0, nextCascadeIndex(state)));
      } else {
        if (win.state === "minimized") {
          restoreWindow(id);
        } else {
          focusWindow(id);
        }
      }
    };
    $[3] = apps;
    $[4] = candidates;
    $[5] = focusWindow;
    $[6] = openWindow;
    $[7] = restoreWindow;
    $[8] = state;
    $[9] = theme;
    $[10] = windows;
    $[11] = t0;
  } else {
    t0 = $[11];
  }
  const activate2 = t0;
  let t1;
  let t2;
  if ($[12] !== activate2 || $[13] !== candidates || $[14] !== index || $[15] !== open2) {
    t1 = () => {
      const onCycle = (e) => {
        if (candidates.length === 0) {
          return;
        }
        const backward = e.detail?.backward === true;
        if (!open2) {
          setOpen(true);
          const startIdx = candidates.length > 1 ? 1 : 0;
          setIndex(backward ? candidates.length - 1 : startIdx);
        } else {
          setIndex((prev) => {
            const dir = backward ? -1 : 1;
            return (prev + dir + candidates.length) % candidates.length;
          });
        }
      };
      const handleUp = (e_0) => {
        if (!open2) {
          return;
        }
        if (e_0.key === "Meta" || e_0.key === "Control") {
          activate2(index);
          setOpen(false);
        }
      };
      const handleDown = (e_1) => {
        if (open2 && e_1.key === "Escape") {
          e_1.preventDefault();
          setOpen(false);
        }
      };
      const handleBlur = () => {
        if (open2) {
          setOpen(false);
        }
      };
      window.addEventListener(APP_SWITCHER_CYCLE_EVENT, onCycle);
      window.addEventListener("keyup", handleUp);
      window.addEventListener("keydown", handleDown);
      window.addEventListener("blur", handleBlur);
      return () => {
        window.removeEventListener(APP_SWITCHER_CYCLE_EVENT, onCycle);
        window.removeEventListener("keyup", handleUp);
        window.removeEventListener("keydown", handleDown);
        window.removeEventListener("blur", handleBlur);
      };
    };
    t2 = [open2, candidates, activate2, index];
    $[12] = activate2;
    $[13] = candidates;
    $[14] = index;
    $[15] = open2;
    $[16] = t1;
    $[17] = t2;
  } else {
    t1 = $[16];
    t2 = $[17];
  }
  (0, import_react27.useEffect)(t1, t2);
  if (!open2 || candidates.length === 0) {
    return null;
  }
  let t3;
  if ($[18] !== candidates || $[19] !== index || $[20] !== theme) {
    t3 = /* @__PURE__ */ (0, import_jsx_runtime24.jsx)(Overlay, { theme, candidates, index });
    $[18] = candidates;
    $[19] = index;
    $[20] = theme;
    $[21] = t3;
  } else {
    t3 = $[21];
  }
  return t3;
}
function _temp49(a, b) {
  return b.z - a.z;
}
function Overlay(t0) {
  const $ = (0, import_compiler_runtime30.c)(29);
  const {
    theme,
    candidates,
    index
  } = t0;
  const t1 = `1px solid ${theme.palette.border}`;
  const t2 = theme.shape.windowRadius + 4;
  let t3;
  if ($[0] !== t1 || $[1] !== t2 || $[2] !== theme.blur.surface || $[3] !== theme.palette.surface || $[4] !== theme.palette.textPrimary) {
    t3 = {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      minWidth: 240,
      maxWidth: "min(90vw, 720px)",
      background: theme.palette.surface,
      backdropFilter: theme.blur.surface,
      WebkitBackdropFilter: theme.blur.surface,
      border: t1,
      borderRadius: t2,
      boxShadow: "0 24px 60px -10px rgba(0,0,0,0.6)",
      padding: 18,
      zIndex: 1500,
      fontFamily: "inherit",
      color: theme.palette.textPrimary
    };
    $[0] = t1;
    $[1] = t2;
    $[2] = theme.blur.surface;
    $[3] = theme.palette.surface;
    $[4] = theme.palette.textPrimary;
    $[5] = t3;
  } else {
    t3 = $[5];
  }
  const surface = t3;
  const selected = candidates[index];
  let t4;
  if ($[6] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t4 = /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("div", { "aria-hidden": true, style: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.18)",
      zIndex: 1490
    } });
    $[6] = t4;
  } else {
    t4 = $[6];
  }
  let t5;
  if ($[7] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t5 = {
      display: "flex",
      gap: 12,
      flexWrap: "wrap",
      justifyContent: "center"
    };
    $[7] = t5;
  } else {
    t5 = $[7];
  }
  let t6;
  if ($[8] !== candidates || $[9] !== index || $[10] !== theme) {
    let t72;
    if ($[12] !== index || $[13] !== theme) {
      t72 = (app, i) => /* @__PURE__ */ (0, import_jsx_runtime24.jsx)(Tile, { app, focused: i === index, theme }, app.id);
      $[12] = index;
      $[13] = theme;
      $[14] = t72;
    } else {
      t72 = $[14];
    }
    t6 = candidates.map(t72);
    $[8] = candidates;
    $[9] = index;
    $[10] = theme;
    $[11] = t6;
  } else {
    t6 = $[11];
  }
  let t7;
  if ($[15] !== t6) {
    t7 = /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("div", { style: t5, children: t6 });
    $[15] = t6;
    $[16] = t7;
  } else {
    t7 = $[16];
  }
  let t8;
  if ($[17] !== theme.palette.textPrimary) {
    t8 = {
      marginTop: 12,
      textAlign: "center",
      fontSize: 13,
      fontWeight: 500,
      color: theme.palette.textPrimary
    };
    $[17] = theme.palette.textPrimary;
    $[18] = t8;
  } else {
    t8 = $[18];
  }
  const t9 = selected?.name ?? "";
  let t10;
  if ($[19] !== t8 || $[20] !== t9) {
    t10 = /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("div", { style: t8, children: t9 });
    $[19] = t8;
    $[20] = t9;
    $[21] = t10;
  } else {
    t10 = $[21];
  }
  let t11;
  if ($[22] !== theme.palette.textSecondary) {
    t11 = /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("div", { style: {
      marginTop: 4,
      textAlign: "center",
      fontSize: 11,
      color: theme.palette.textSecondary
    }, children: "Tab to cycle \xB7 Release to activate \xB7 Esc to cancel" });
    $[22] = theme.palette.textSecondary;
    $[23] = t11;
  } else {
    t11 = $[23];
  }
  let t12;
  if ($[24] !== surface || $[25] !== t10 || $[26] !== t11 || $[27] !== t7) {
    t12 = /* @__PURE__ */ (0, import_jsx_runtime24.jsxs)(import_jsx_runtime24.Fragment, { children: [
      t4,
      /* @__PURE__ */ (0, import_jsx_runtime24.jsxs)("div", { role: "dialog", "aria-label": "Application switcher", style: surface, children: [
        t7,
        t10,
        t11
      ] })
    ] });
    $[24] = surface;
    $[25] = t10;
    $[26] = t11;
    $[27] = t7;
    $[28] = t12;
  } else {
    t12 = $[28];
  }
  return t12;
}
function Tile(t0) {
  const $ = (0, import_compiler_runtime30.c)(17);
  const {
    app,
    focused,
    theme
  } = t0;
  const accent = app.accent ?? theme.palette.accent;
  const size = focused ? 72 : 56;
  const Art = app.iconArt;
  let t1;
  if ($[0] !== app || $[1] !== theme) {
    t1 = resolveAppIcon(app, theme);
    $[0] = app;
    $[1] = theme;
    $[2] = t1;
  } else {
    t1 = $[2];
  }
  const Icon = t1;
  const t2 = appIconBackground(app, theme);
  const t3 = focused ? `0 0 0 3px ${theme.palette.textPrimary}, 0 12px 24px rgba(0,0,0,0.45)` : "0 4px 10px rgba(0,0,0,0.35)";
  let t4;
  if ($[3] !== size || $[4] !== t2 || $[5] !== t3 || $[6] !== theme.shape.dockTileRadius) {
    t4 = {
      width: size,
      height: size,
      borderRadius: theme.shape.dockTileRadius,
      background: t2,
      boxShadow: t3,
      display: "grid",
      placeItems: "center",
      color: appIconForeground(app, theme),
      transition: "width 80ms ease, height 80ms ease, box-shadow 80ms ease"
    };
    $[3] = size;
    $[4] = t2;
    $[5] = t3;
    $[6] = theme.shape.dockTileRadius;
    $[7] = t4;
  } else {
    t4 = $[7];
  }
  let t5;
  if ($[8] !== Art || $[9] !== Icon || $[10] !== app.name || $[11] !== size) {
    t5 = Art ? /* @__PURE__ */ (0, import_jsx_runtime24.jsx)(Art, { size: Math.round(size * 0.7) }) : Icon ? /* @__PURE__ */ (0, import_jsx_runtime24.jsx)(Icon, { size: Math.round(size * 0.5) }) : /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("span", { style: {
      fontWeight: 700,
      fontSize: Math.round(size * 0.4),
      textShadow: "0 1px 2px rgba(0,0,0,0.4)"
    }, children: app.name.charAt(0).toUpperCase() });
    $[8] = Art;
    $[9] = Icon;
    $[10] = app.name;
    $[11] = size;
    $[12] = t5;
  } else {
    t5 = $[12];
  }
  let t6;
  if ($[13] !== app.name || $[14] !== t4 || $[15] !== t5) {
    t6 = /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("div", { style: t4, title: app.name, children: t5 });
    $[13] = app.name;
    $[14] = t4;
    $[15] = t5;
    $[16] = t6;
  } else {
    t6 = $[16];
  }
  return t6;
}

// src/MissionControl.tsx
var import_compiler_runtime31 = require("react/compiler-runtime");
var import_react28 = require("react");
var import_core16 = require("@react-ui-os/core");
var import_jsx_runtime25 = require("react/jsx-runtime");
var THUMB_MAX_W = 380;
var THUMB_MAX_H = 280;
var THUMB_MAX_SCALE = 0.9;
var MINI_TITLE_BAR_H = 30;
function cardFocusId(winId) {
  return `rui-mc-card-${winId}`;
}
function MissionControl() {
  const theme = useTheme();
  const apps = useApps();
  const {
    state,
    windows,
    focusWindow,
    restoreWindow,
    switchWorkspace,
    addWorkspace
  } = (0, import_core16.useWindowManager)();
  const [phase, setPhase] = (0, import_react28.useState)("closed");
  const phaseRef = (0, import_react28.useRef)(phase);
  phaseRef.current = phase;
  const [keyIndex, setKeyIndex] = (0, import_react28.useState)(-1);
  const easing = theme.motion.missionControlEasing;
  const reduceMotion = useReducedMotion();
  const duration = reduceMotion ? 0 : theme.motion.missionControlDurationMs;
  const activeWorkspace = state.activeWorkspaceId;
  const visible = (0, import_react28.useMemo)(() => windows.filter((w) => w.state !== "minimized" && w.workspaceId === activeWorkspace), [windows, activeWorkspace]);
  const visibleRef = (0, import_react28.useRef)(visible);
  visibleRef.current = visible;
  const dialogRef = (0, import_react28.useRef)(null);
  const previousFocusRef = (0, import_react28.useRef)(null);
  (0, import_react28.useEffect)(() => {
    const isShowing = () => phaseRef.current === "enter" || phaseRef.current === "open";
    const onToggle = () => {
      setPhase(isShowing() ? "leave" : "enter");
    };
    const onKey = (e) => {
      if (!isShowing()) return;
      const t = e.target;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) {
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setPhase("leave");
        return;
      }
      const vis = visibleRef.current;
      if (vis.length === 0) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        setKeyIndex((idx) => idx < 0 ? 0 : (idx + 1) % vis.length);
        return;
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        setKeyIndex((idx_0) => idx_0 < 0 ? vis.length - 1 : (idx_0 - 1 + vis.length) % vis.length);
        return;
      }
    };
    window.addEventListener(MISSION_CONTROL_TOGGLE_EVENT, onToggle);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener(MISSION_CONTROL_TOGGLE_EVENT, onToggle);
      window.removeEventListener("keydown", onKey);
    };
  }, []);
  (0, import_react28.useEffect)(() => {
    if (phase === "enter") {
      const id = window.requestAnimationFrame(() => {
        setPhase("open");
      });
      return () => {
        window.cancelAnimationFrame(id);
      };
    }
    if (phase === "leave") {
      const id_0 = window.setTimeout(() => {
        setPhase("closed");
      }, duration);
      return () => {
        window.clearTimeout(id_0);
      };
    }
    return void 0;
  }, [phase, duration]);
  (0, import_react28.useEffect)(() => {
    if (phase === "closed") setKeyIndex(-1);
  }, [phase]);
  (0, import_react28.useEffect)(() => {
    if (phase === "enter") {
      previousFocusRef.current = typeof document !== "undefined" ? document.activeElement : null;
      dialogRef.current?.focus();
    } else if (phase === "closed") {
      const prev = previousFocusRef.current;
      previousFocusRef.current = null;
      if (prev && typeof prev.focus === "function") prev.focus();
    }
  }, [phase]);
  (0, import_react28.useEffect)(() => {
    if (keyIndex < 0 || typeof document === "undefined") return;
    const win = visibleRef.current[keyIndex];
    if (win) document.getElementById(cardFocusId(win.id))?.focus();
  }, [keyIndex]);
  if (phase === "closed") return null;
  const expanded = phase === "open";
  const close = () => {
    setPhase("leave");
  };
  const pick = (win_0) => {
    if (win_0.state === "minimized") restoreWindow(win_0.id);
    else focusWindow(win_0.id);
    setPhase("leave");
  };
  return /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("div", { ref: dialogRef, role: "dialog", "aria-label": "Mission Control", tabIndex: -1, onClick: (e_0) => {
    if (e_0.target.closest("[data-mc-card], [data-mc-space]")) return;
    close();
  }, style: {
    position: "fixed",
    inset: 0,
    zIndex: 1450,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "clamp(16px, 5vmin, 56px)",
    boxSizing: "border-box",
    outline: "none"
  }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("div", { "aria-hidden": true, style: {
      position: "absolute",
      inset: 0,
      // The wallpaper stays visible, lightly dimmed. macOS moved away from
      // a solid dark panel to a translucent scrim in OS X El Capitan.
      background: "rgba(0,0,0,0.38)",
      backdropFilter: theme.blur.surface,
      WebkitBackdropFilter: theme.blur.surface,
      opacity: expanded ? 1 : 0,
      transition: `opacity ${String(duration)}ms ${easing}`
    } }),
    /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("div", { style: {
      position: "relative",
      width: "100%",
      maxWidth: "min(1320px, 100%)",
      maxHeight: "100%",
      overflowY: "auto",
      transformOrigin: "center",
      transform: expanded ? "scale(1)" : "scale(0.96)",
      opacity: expanded ? 1 : 0,
      transition: `transform ${String(duration)}ms ${easing}, opacity ${String(duration)}ms ${easing}`
    }, children: /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("div", { style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "clamp(20px, 4vmin, 44px)"
    }, children: [
      state.workspaces.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(SpacesBar, { workspaces: state.workspaces, activeId: state.activeWorkspaceId, onSwitch: switchWorkspace, onAdd: addWorkspace, windows, wallpaperSrc: theme.wallpaper.src, theme }) : null,
      visible.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(EmptyState3, { theme, hasWindowsElsewhere: windows.some((w_0) => w_0.state !== "minimized" && w_0.workspaceId !== activeWorkspace) }) : /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("div", { style: {
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        gap: "clamp(16px, 2.6vmin, 34px)"
      }, children: visible.map((win_1, i) => /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(Card, { win: win_1, apps, theme, selected: i === keyIndex, onPick: () => {
        pick(win_1);
      } }, win_1.id)) })
    ] }) })
  ] });
}
function EmptyState3(t0) {
  const $ = (0, import_compiler_runtime31.c)(14);
  const {
    theme,
    hasWindowsElsewhere
  } = t0;
  let t1;
  if ($[0] !== theme.palette.textPrimary) {
    t1 = {
      color: theme.palette.textPrimary,
      fontSize: 14,
      textAlign: "center",
      lineHeight: 1.5
    };
    $[0] = theme.palette.textPrimary;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  let t2;
  if ($[2] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t2 = {
      fontSize: 24,
      opacity: 0.7,
      marginBottom: 6
    };
    $[2] = t2;
  } else {
    t2 = $[2];
  }
  const t3 = hasWindowsElsewhere ? "No windows in this space" : "Nothing to show";
  let t4;
  if ($[3] !== t3) {
    t4 = /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("div", { style: t2, children: t3 });
    $[3] = t3;
    $[4] = t4;
  } else {
    t4 = $[4];
  }
  let t5;
  if ($[5] !== theme.palette.textSecondary) {
    t5 = {
      color: theme.palette.textSecondary,
      fontSize: 12
    };
    $[5] = theme.palette.textSecondary;
    $[6] = t5;
  } else {
    t5 = $[6];
  }
  const t6 = hasWindowsElsewhere ? "Pick another space above, or open an app here." : "Open an app first, then press F3 to see them all at once.";
  let t7;
  if ($[7] !== t5 || $[8] !== t6) {
    t7 = /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("div", { style: t5, children: t6 });
    $[7] = t5;
    $[8] = t6;
    $[9] = t7;
  } else {
    t7 = $[9];
  }
  let t8;
  if ($[10] !== t1 || $[11] !== t4 || $[12] !== t7) {
    t8 = /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("div", { style: t1, children: [
      t4,
      t7
    ] });
    $[10] = t1;
    $[11] = t4;
    $[12] = t7;
    $[13] = t8;
  } else {
    t8 = $[13];
  }
  return t8;
}
function Card(t0) {
  const $ = (0, import_compiler_runtime31.c)(75);
  const {
    win,
    apps,
    theme,
    selected,
    onPick
  } = t0;
  let t1;
  if ($[0] !== apps || $[1] !== win) {
    t1 = labelFor(win, apps);
    $[0] = apps;
    $[1] = win;
    $[2] = t1;
  } else {
    t1 = $[2];
  }
  const label = t1;
  let t2;
  if ($[3] !== apps || $[4] !== theme || $[5] !== win) {
    t2 = iconFor(win, apps, theme);
    $[3] = apps;
    $[4] = theme;
    $[5] = win;
    $[6] = t2;
  } else {
    t2 = $[6];
  }
  const Icon = t2;
  const scale = Math.min(THUMB_MAX_W / win.w, THUMB_MAX_H / win.h, THUMB_MAX_SCALE);
  let t3;
  if ($[7] !== scale || $[8] !== win.w) {
    t3 = Math.round(win.w * scale);
    $[7] = scale;
    $[8] = win.w;
    $[9] = t3;
  } else {
    t3 = $[9];
  }
  const frameW = t3;
  let t4;
  if ($[10] !== scale || $[11] !== win.h) {
    t4 = Math.round(win.h * scale);
    $[10] = scale;
    $[11] = win.h;
    $[12] = t4;
  } else {
    t4 = $[12];
  }
  const frameH = t4;
  const stageRef = (0, import_react28.useRef)(null);
  const frameRef = (0, import_react28.useRef)(null);
  const [hovered, setHovered] = (0, import_react28.useState)(false);
  const highlight = selected || hovered;
  let t5;
  let t6;
  if ($[13] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t5 = () => {
      stageRef.current?.setAttribute("inert", "");
    };
    t6 = [];
    $[13] = t5;
    $[14] = t6;
  } else {
    t5 = $[13];
    t6 = $[14];
  }
  (0, import_react28.useEffect)(t5, t6);
  let t7;
  let t8;
  if ($[15] !== selected) {
    t7 = () => {
      if (selected) {
        frameRef.current?.scrollIntoView({
          block: "nearest"
        });
      }
    };
    t8 = [selected];
    $[15] = selected;
    $[16] = t7;
    $[17] = t8;
  } else {
    t7 = $[16];
    t8 = $[17];
  }
  (0, import_react28.useEffect)(t7, t8);
  let t9;
  if ($[18] !== frameW) {
    t9 = {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 9,
      width: frameW
    };
    $[18] = frameW;
    $[19] = t9;
  } else {
    t9 = $[19];
  }
  const t10 = `1px solid ${highlight ? theme.palette.textSecondary : theme.palette.border}`;
  const t11 = highlight ? "scale(1.03)" : "scale(1)";
  const t12 = highlight ? "0 20px 44px -14px rgba(0,0,0,0.55)" : "0 14px 34px -16px rgba(0,0,0,0.5)";
  const t13 = `transform ${String(theme.motion.dockHoverDurationMs)}ms ease, box-shadow ${String(theme.motion.dockHoverDurationMs)}ms ease, border-color ${String(theme.motion.dockHoverDurationMs)}ms ease`;
  let t14;
  if ($[20] !== frameH || $[21] !== frameW || $[22] !== t10 || $[23] !== t11 || $[24] !== t12 || $[25] !== t13 || $[26] !== theme.palette.surface || $[27] !== theme.shape.windowRadius) {
    t14 = {
      position: "relative",
      width: frameW,
      height: frameH,
      borderRadius: theme.shape.windowRadius,
      border: t10,
      background: theme.palette.surface,
      overflow: "hidden",
      transform: t11,
      boxShadow: t12,
      transition: t13
    };
    $[20] = frameH;
    $[21] = frameW;
    $[22] = t10;
    $[23] = t11;
    $[24] = t12;
    $[25] = t13;
    $[26] = theme.palette.surface;
    $[27] = theme.shape.windowRadius;
    $[28] = t14;
  } else {
    t14 = $[28];
  }
  const t15 = `scale(${String(scale)})`;
  let t16;
  if ($[29] !== t15 || $[30] !== win.h || $[31] !== win.w) {
    t16 = {
      width: win.w,
      height: win.h,
      transform: t15,
      transformOrigin: "top left",
      pointerEvents: "none"
    };
    $[29] = t15;
    $[30] = win.h;
    $[31] = win.w;
    $[32] = t16;
  } else {
    t16 = $[32];
  }
  let t17;
  if ($[33] !== apps || $[34] !== label || $[35] !== theme || $[36] !== win) {
    t17 = /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(MiniWindow, { win, label, apps, theme });
    $[33] = apps;
    $[34] = label;
    $[35] = theme;
    $[36] = win;
    $[37] = t17;
  } else {
    t17 = $[37];
  }
  let t18;
  if ($[38] !== t16 || $[39] !== t17) {
    t18 = /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("div", { ref: stageRef, "aria-hidden": true, style: t16, children: t17 });
    $[38] = t16;
    $[39] = t17;
    $[40] = t18;
  } else {
    t18 = $[40];
  }
  let t19;
  if ($[41] !== win.id) {
    t19 = cardFocusId(win.id);
    $[41] = win.id;
    $[42] = t19;
  } else {
    t19 = $[42];
  }
  let t20;
  let t21;
  let t22;
  let t23;
  if ($[43] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t20 = () => {
      setHovered(true);
    };
    t21 = () => {
      setHovered(false);
    };
    t22 = () => {
      setHovered(true);
    };
    t23 = () => {
      setHovered(false);
    };
    $[43] = t20;
    $[44] = t21;
    $[45] = t22;
    $[46] = t23;
  } else {
    t20 = $[43];
    t21 = $[44];
    t22 = $[45];
    t23 = $[46];
  }
  let t24;
  if ($[47] !== theme.shape.windowRadius) {
    t24 = {
      position: "absolute",
      inset: 0,
      appearance: "none",
      border: "none",
      background: "transparent",
      padding: 0,
      margin: 0,
      cursor: "pointer",
      borderRadius: theme.shape.windowRadius
    };
    $[47] = theme.shape.windowRadius;
    $[48] = t24;
  } else {
    t24 = $[48];
  }
  let t25;
  if ($[49] !== label || $[50] !== onPick || $[51] !== t19 || $[52] !== t24) {
    t25 = /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("button", { type: "button", id: t19, onClick: onPick, "aria-label": label, onPointerEnter: t20, onPointerLeave: t21, onFocus: t22, onBlur: t23, style: t24 });
    $[49] = label;
    $[50] = onPick;
    $[51] = t19;
    $[52] = t24;
    $[53] = t25;
  } else {
    t25 = $[53];
  }
  let t26;
  if ($[54] !== t14 || $[55] !== t18 || $[56] !== t25) {
    t26 = /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("div", { ref: frameRef, style: t14, children: [
      t18,
      t25
    ] });
    $[54] = t14;
    $[55] = t18;
    $[56] = t25;
    $[57] = t26;
  } else {
    t26 = $[57];
  }
  let t27;
  if ($[58] !== frameW || $[59] !== theme.palette.textPrimary) {
    t27 = {
      display: "flex",
      alignItems: "center",
      gap: 6,
      maxWidth: frameW,
      padding: "0 2px",
      color: theme.palette.textPrimary
    };
    $[58] = frameW;
    $[59] = theme.palette.textPrimary;
    $[60] = t27;
  } else {
    t27 = $[60];
  }
  let t28;
  if ($[61] !== Icon || $[62] !== theme.palette.textSecondary) {
    t28 = Icon ? /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("span", { style: {
      display: "inline-flex",
      flexShrink: 0,
      color: theme.palette.textSecondary
    }, children: /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(Icon, { size: 15 }) }) : null;
    $[61] = Icon;
    $[62] = theme.palette.textSecondary;
    $[63] = t28;
  } else {
    t28 = $[63];
  }
  let t29;
  if ($[64] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t29 = {
      fontSize: 12.5,
      fontWeight: 500,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    };
    $[64] = t29;
  } else {
    t29 = $[64];
  }
  let t30;
  if ($[65] !== label) {
    t30 = /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("span", { style: t29, children: label });
    $[65] = label;
    $[66] = t30;
  } else {
    t30 = $[66];
  }
  let t31;
  if ($[67] !== t27 || $[68] !== t28 || $[69] !== t30) {
    t31 = /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("div", { style: t27, children: [
      t28,
      t30
    ] });
    $[67] = t27;
    $[68] = t28;
    $[69] = t30;
    $[70] = t31;
  } else {
    t31 = $[70];
  }
  let t32;
  if ($[71] !== t26 || $[72] !== t31 || $[73] !== t9) {
    t32 = /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("div", { "data-mc-card": true, style: t9, children: [
      t26,
      t31
    ] });
    $[71] = t26;
    $[72] = t31;
    $[73] = t9;
    $[74] = t32;
  } else {
    t32 = $[74];
  }
  return t32;
}
function MiniWindow(t0) {
  const $ = (0, import_compiler_runtime31.c)(34);
  const {
    win,
    label,
    apps,
    theme
  } = t0;
  let t1;
  if ($[0] !== theme.palette.surface) {
    t1 = {
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      background: theme.palette.surface
    };
    $[0] = theme.palette.surface;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  const t2 = `1px solid ${theme.palette.border}`;
  let t3;
  if ($[2] !== t2) {
    t3 = {
      height: MINI_TITLE_BAR_H,
      flexShrink: 0,
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "0 12px",
      borderBottom: t2
    };
    $[2] = t2;
    $[3] = t3;
  } else {
    t3 = $[3];
  }
  let t4;
  if ($[4] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t4 = /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(TrafficLights2, {});
    $[4] = t4;
  } else {
    t4 = $[4];
  }
  let t5;
  if ($[5] !== theme.palette.textPrimary) {
    t5 = {
      fontSize: 13,
      fontWeight: 600,
      color: theme.palette.textPrimary,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    };
    $[5] = theme.palette.textPrimary;
    $[6] = t5;
  } else {
    t5 = $[6];
  }
  let t6;
  if ($[7] !== label || $[8] !== t5) {
    t6 = /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("span", { style: t5, children: label });
    $[7] = label;
    $[8] = t5;
    $[9] = t6;
  } else {
    t6 = $[9];
  }
  let t7;
  if ($[10] !== t3 || $[11] !== t6) {
    t7 = /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("div", { style: t3, children: [
      t4,
      t6
    ] });
    $[10] = t3;
    $[11] = t6;
    $[12] = t7;
  } else {
    t7 = $[12];
  }
  let t8;
  if ($[13] !== theme.palette.background || $[14] !== theme.palette.textPrimary) {
    t8 = {
      flex: 1,
      minHeight: 0,
      overflow: "hidden",
      padding: 16,
      background: theme.palette.background,
      color: theme.palette.textPrimary
    };
    $[13] = theme.palette.background;
    $[14] = theme.palette.textPrimary;
    $[15] = t8;
  } else {
    t8 = $[15];
  }
  let t9;
  if ($[16] !== apps || $[17] !== label || $[18] !== theme || $[19] !== win) {
    t9 = /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(PreviewFallback, { label, apps, win, theme });
    $[16] = apps;
    $[17] = label;
    $[18] = theme;
    $[19] = win;
    $[20] = t9;
  } else {
    t9 = $[20];
  }
  let t10;
  if ($[21] !== apps || $[22] !== win) {
    t10 = /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(PreviewContent, { win, apps });
    $[21] = apps;
    $[22] = win;
    $[23] = t10;
  } else {
    t10 = $[23];
  }
  let t11;
  if ($[24] !== t10 || $[25] !== t9) {
    t11 = /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(PreviewBoundary, { fallback: t9, children: t10 });
    $[24] = t10;
    $[25] = t9;
    $[26] = t11;
  } else {
    t11 = $[26];
  }
  let t12;
  if ($[27] !== t11 || $[28] !== t8) {
    t12 = /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("div", { style: t8, children: t11 });
    $[27] = t11;
    $[28] = t8;
    $[29] = t12;
  } else {
    t12 = $[29];
  }
  let t13;
  if ($[30] !== t1 || $[31] !== t12 || $[32] !== t7) {
    t13 = /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("div", { style: t1, children: [
      t7,
      t12
    ] });
    $[30] = t1;
    $[31] = t12;
    $[32] = t7;
    $[33] = t13;
  } else {
    t13 = $[33];
  }
  return t13;
}
function PreviewContent(t0) {
  const $ = (0, import_compiler_runtime31.c)(13);
  const {
    win,
    apps
  } = t0;
  const p = win.payload;
  if (p.kind === "app") {
    let t12;
    if ($[0] !== apps || $[1] !== p.appId) {
      let t23;
      if ($[3] !== p.appId) {
        t23 = (a) => a.id === p.appId;
        $[3] = p.appId;
        $[4] = t23;
      } else {
        t23 = $[4];
      }
      t12 = apps.find(t23);
      $[0] = apps;
      $[1] = p.appId;
      $[2] = t12;
    } else {
      t12 = $[2];
    }
    const app = t12;
    if (!app) {
      return null;
    }
    const Content = app.content;
    let t22;
    if ($[5] !== Content || $[6] !== app.id) {
      t22 = /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(Content, { appId: app.id, focused: false });
      $[5] = Content;
      $[6] = app.id;
      $[7] = t22;
    } else {
      t22 = $[7];
    }
    return t22;
  }
  let t1;
  if ($[8] !== p.systemId) {
    t1 = getSystemWindow(p.systemId);
    $[8] = p.systemId;
    $[9] = t1;
  } else {
    t1 = $[9];
  }
  const def = t1;
  if (!def) {
    return null;
  }
  const Content_0 = def.content;
  let t2;
  if ($[10] !== Content_0 || $[11] !== p.args) {
    t2 = /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(Content_0, { focused: false, args: p.args });
    $[10] = Content_0;
    $[11] = p.args;
    $[12] = t2;
  } else {
    t2 = $[12];
  }
  return t2;
}
function PreviewFallback(t0) {
  const $ = (0, import_compiler_runtime31.c)(12);
  const {
    label,
    apps,
    win,
    theme
  } = t0;
  let t1;
  if ($[0] !== apps || $[1] !== theme || $[2] !== win) {
    t1 = iconFor(win, apps, theme);
    $[0] = apps;
    $[1] = theme;
    $[2] = win;
    $[3] = t1;
  } else {
    t1 = $[3];
  }
  const Icon = t1;
  let t2;
  if ($[4] !== theme.palette.textSecondary) {
    t2 = {
      width: "100%",
      height: "100%",
      display: "grid",
      placeItems: "center",
      color: theme.palette.textSecondary
    };
    $[4] = theme.palette.textSecondary;
    $[5] = t2;
  } else {
    t2 = $[5];
  }
  let t3;
  if ($[6] !== Icon || $[7] !== label) {
    t3 = Icon ? /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(Icon, { size: 48 }) : /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("span", { style: {
      fontSize: 44,
      fontWeight: 700,
      opacity: 0.65
    }, children: label.charAt(0).toUpperCase() });
    $[6] = Icon;
    $[7] = label;
    $[8] = t3;
  } else {
    t3 = $[8];
  }
  let t4;
  if ($[9] !== t2 || $[10] !== t3) {
    t4 = /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("div", { style: t2, children: t3 });
    $[9] = t2;
    $[10] = t3;
    $[11] = t4;
  } else {
    t4 = $[11];
  }
  return t4;
}
var PreviewBoundary = class extends import_react28.Component {
  state = {
    failed: false
  };
  static getDerivedStateFromError() {
    return {
      failed: true
    };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
};
function TrafficLights2() {
  const $ = (0, import_compiler_runtime31.c)(2);
  let t0;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t0 = ["#ff5f57", "#febc2e", "#28c840"];
    $[0] = t0;
  } else {
    t0 = $[0];
  }
  const dots = t0;
  let t1;
  if ($[1] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t1 = /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("span", { "aria-hidden": true, style: {
      display: "inline-flex",
      gap: 6
    }, children: dots.map(_temp50) });
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  return t1;
}
function _temp50(color) {
  return /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("span", { style: {
    width: 11,
    height: 11,
    borderRadius: "50%",
    background: color
  } }, color);
}
function labelFor(win, apps) {
  const p = win.payload;
  if (p.kind === "app") {
    return apps.find((a) => a.id === p.appId)?.name ?? p.appId;
  }
  const def = getSystemWindow(p.systemId);
  return def ? resolveSystemWindowName(def, p.args) : p.systemId;
}
function iconFor(win, apps, theme) {
  const p = win.payload;
  if (p.kind === "app") {
    const app = apps.find((a) => a.id === p.appId);
    return (app ? resolveAppIcon(app, theme) : void 0) ?? app?.iconArt ?? null;
  }
  const def = getSystemWindow(p.systemId);
  return def ? resolveAppIcon(def, theme) ?? def.desktopIcon ?? null : null;
}

// src/KeyboardHelp.tsx
var import_compiler_runtime32 = require("react/compiler-runtime");
var import_react29 = require("react");
var import_jsx_runtime26 = require("react/jsx-runtime");
var DEFAULT_SHADOW = "0 24px 60px -16px rgba(0,0,0,0.55)";
function isMacPlatform() {
  if (typeof navigator === "undefined") return false;
  return /Mac|iPhone|iPad/i.test(navigator.userAgent);
}
function chordDisplay(s, mac) {
  if (s.display) return formatChord(s.display, mac);
  return s.chords.map((c) => formatChord(c, mac)).join(" or ");
}
function grouped() {
  const map = /* @__PURE__ */ new Map();
  for (const s of SHORTCUTS) {
    const arr = map.get(s.group);
    if (arr) arr.push(s);
    else map.set(s.group, [s]);
  }
  return [...map];
}
function KeyboardHelp() {
  const $ = (0, import_compiler_runtime32.c)(35);
  const theme = useTheme();
  const [open2, setOpen] = (0, import_react29.useState)(false);
  const [mac] = (0, import_react29.useState)(isMacPlatform);
  const reducedMotion = useReducedMotion();
  const t0 = reducedMotion ? 0 : theme.motion.windowOpenDurationMs;
  let t1;
  if ($[0] !== t0 || $[1] !== theme.motion.windowOpenEasing) {
    t1 = {
      durationMs: t0,
      easing: theme.motion.windowOpenEasing
    };
    $[0] = t0;
    $[1] = theme.motion.windowOpenEasing;
    $[2] = t1;
  } else {
    t1 = $[2];
  }
  const {
    mounted,
    surfaceStyle,
    backdropStyle
  } = useSurfaceTransition(open2, t1);
  let t2;
  let t3;
  if ($[3] !== open2) {
    t2 = () => {
      const onToggle = () => {
        setOpen(_temp51);
      };
      const onKey = (e) => {
        if (e.key === "Escape") {
          setOpen(false);
        }
      };
      window.addEventListener(KEYBOARD_HELP_TOGGLE_EVENT, onToggle);
      if (open2) {
        window.addEventListener("keydown", onKey);
      }
      return () => {
        window.removeEventListener(KEYBOARD_HELP_TOGGLE_EVENT, onToggle);
        window.removeEventListener("keydown", onKey);
      };
    };
    t3 = [open2];
    $[3] = open2;
    $[4] = t2;
    $[5] = t3;
  } else {
    t2 = $[4];
    t3 = $[5];
  }
  (0, import_react29.useEffect)(t2, t3);
  if (!mounted) {
    return null;
  }
  const t4 = `${theme.palette.textPrimary}12`;
  let t5;
  if ($[6] !== t4 || $[7] !== theme.palette.textSecondary || $[8] !== theme.shape.small) {
    t5 = {
      flexShrink: 0,
      fontFamily: "inherit",
      fontSize: 11.5,
      color: theme.palette.textSecondary,
      background: t4,
      borderRadius: theme.shape.small,
      padding: "2px 7px",
      whiteSpace: "nowrap"
    };
    $[6] = t4;
    $[7] = theme.palette.textSecondary;
    $[8] = theme.shape.small;
    $[9] = t5;
  } else {
    t5 = $[9];
  }
  const kbd = t5;
  let t6;
  if ($[10] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t6 = () => setOpen(false);
    $[10] = t6;
  } else {
    t6 = $[10];
  }
  let t7;
  if ($[11] !== backdropStyle) {
    t7 = {
      position: "fixed",
      inset: 0,
      zIndex: 1500,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(0,0,0,0.32)",
      padding: 16,
      ...backdropStyle
    };
    $[11] = backdropStyle;
    $[12] = t7;
  } else {
    t7 = $[12];
  }
  const t8 = `1px solid ${theme.palette.border}`;
  const t9 = theme.elevation?.windowFocused ?? DEFAULT_SHADOW;
  let t10;
  if ($[13] !== surfaceStyle || $[14] !== t8 || $[15] !== t9 || $[16] !== theme.blur.surface || $[17] !== theme.palette.surface || $[18] !== theme.palette.textPrimary || $[19] !== theme.shape.windowRadius) {
    t10 = {
      width: "min(560px, 100%)",
      maxHeight: "82vh",
      overflowY: "auto",
      background: theme.palette.surface,
      backdropFilter: theme.blur.surface,
      WebkitBackdropFilter: theme.blur.surface,
      border: t8,
      borderRadius: theme.shape.windowRadius,
      boxShadow: t9,
      color: theme.palette.textPrimary,
      padding: 22,
      ...surfaceStyle
    };
    $[13] = surfaceStyle;
    $[14] = t8;
    $[15] = t9;
    $[16] = theme.blur.surface;
    $[17] = theme.palette.surface;
    $[18] = theme.palette.textPrimary;
    $[19] = theme.shape.windowRadius;
    $[20] = t10;
  } else {
    t10 = $[20];
  }
  let t11;
  let t12;
  if ($[21] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t11 = /* @__PURE__ */ (0, import_jsx_runtime26.jsx)("h2", { style: {
      margin: "0 0 16px",
      fontSize: 16
    }, children: "Keyboard Shortcuts" });
    t12 = {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      gap: "18px 28px"
    };
    $[21] = t11;
    $[22] = t12;
  } else {
    t11 = $[21];
    t12 = $[22];
  }
  let t13;
  if ($[23] !== kbd || $[24] !== mac || $[25] !== theme.palette.textSecondary) {
    t13 = grouped().map((t142) => {
      const [group, items3] = t142;
      return /* @__PURE__ */ (0, import_jsx_runtime26.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime26.jsx)("h3", { style: {
          margin: "0 0 8px",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: 0.3,
          textTransform: "uppercase",
          color: theme.palette.textSecondary
        }, children: group }),
        items3.map((s) => /* @__PURE__ */ (0, import_jsx_runtime26.jsxs)("div", { style: {
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 12,
          padding: "3px 0"
        }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime26.jsx)("span", { style: {
            fontSize: 12.5
          }, children: s.label }),
          /* @__PURE__ */ (0, import_jsx_runtime26.jsx)("kbd", { style: kbd, children: chordDisplay(s, mac) })
        ] }, s.id))
      ] }, group);
    });
    $[23] = kbd;
    $[24] = mac;
    $[25] = theme.palette.textSecondary;
    $[26] = t13;
  } else {
    t13 = $[26];
  }
  let t14;
  if ($[27] !== t13) {
    t14 = /* @__PURE__ */ (0, import_jsx_runtime26.jsx)("div", { style: t12, children: t13 });
    $[27] = t13;
    $[28] = t14;
  } else {
    t14 = $[28];
  }
  let t15;
  if ($[29] !== t10 || $[30] !== t14) {
    t15 = /* @__PURE__ */ (0, import_jsx_runtime26.jsxs)("div", { role: "dialog", "aria-modal": "true", "aria-label": "Keyboard shortcuts", onPointerDown: _temp214, style: t10, children: [
      t11,
      t14
    ] });
    $[29] = t10;
    $[30] = t14;
    $[31] = t15;
  } else {
    t15 = $[31];
  }
  let t16;
  if ($[32] !== t15 || $[33] !== t7) {
    t16 = /* @__PURE__ */ (0, import_jsx_runtime26.jsx)("div", { onPointerDown: t6, style: t7, children: t15 });
    $[32] = t15;
    $[33] = t7;
    $[34] = t16;
  } else {
    t16 = $[34];
  }
  return t16;
}
function _temp214(e_0) {
  e_0.stopPropagation();
}
function _temp51(v) {
  return !v;
}

// src/Desktop.tsx
var import_jsx_runtime27 = require("react/jsx-runtime");
function Desktop(t0) {
  const $ = (0, import_compiler_runtime33.c)(29);
  const {
    apps,
    theme,
    brand,
    storage,
    children
  } = t0;
  const t1 = theme.font ?? "system-ui, -apple-system, Segoe UI, sans-serif";
  let t2;
  if ($[0] !== t1) {
    t2 = {
      position: "fixed",
      inset: 0,
      overflow: "hidden",
      fontFamily: t1
    };
    $[0] = t1;
    $[1] = t2;
  } else {
    t2 = $[1];
  }
  let t3;
  if ($[2] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t3 = /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(Wallpaper, {});
    $[2] = t3;
  } else {
    t3 = $[2];
  }
  let t4;
  if ($[3] !== brand) {
    t4 = /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(MenuBar, { brand });
    $[3] = brand;
    $[4] = t4;
  } else {
    t4 = $[4];
  }
  let t10;
  let t11;
  let t12;
  let t13;
  let t14;
  let t15;
  let t16;
  let t17;
  let t18;
  let t19;
  let t5;
  let t6;
  let t7;
  let t8;
  let t9;
  if ($[5] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t5 = /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(DesktopIcons, {});
    t6 = /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(SnapPreview, {});
    t7 = /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(WindowLayer, {});
    t8 = /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(Dock, {});
    t9 = /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(KeyboardShortcuts, {});
    t10 = /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(Launcher, {});
    t11 = /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(NotificationToasts, {});
    t12 = /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(NotificationCenter, {});
    t13 = /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(QuickSettings, {});
    t14 = /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(ContextMenu, {});
    t15 = /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(AppSwitcher, {});
    t16 = /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(MissionControl, {});
    t17 = /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(KeyboardHelp, {});
    t18 = /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(HudOverlay, {});
    t19 = /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(DesktopBackdrop, {});
    $[5] = t10;
    $[6] = t11;
    $[7] = t12;
    $[8] = t13;
    $[9] = t14;
    $[10] = t15;
    $[11] = t16;
    $[12] = t17;
    $[13] = t18;
    $[14] = t19;
    $[15] = t5;
    $[16] = t6;
    $[17] = t7;
    $[18] = t8;
    $[19] = t9;
  } else {
    t10 = $[5];
    t11 = $[6];
    t12 = $[7];
    t13 = $[8];
    t14 = $[9];
    t15 = $[10];
    t16 = $[11];
    t17 = $[12];
    t18 = $[13];
    t19 = $[14];
    t5 = $[15];
    t6 = $[16];
    t7 = $[17];
    t8 = $[18];
    t9 = $[19];
  }
  let t20;
  if ($[20] !== t2 || $[21] !== t4) {
    t20 = /* @__PURE__ */ (0, import_jsx_runtime27.jsxs)("div", { style: t2, children: [
      t3,
      t4,
      t5,
      t6,
      t7,
      t8,
      t9,
      t10,
      t11,
      t12,
      t13,
      t14,
      t15,
      t16,
      t17,
      t18,
      t19
    ] });
    $[20] = t2;
    $[21] = t4;
    $[22] = t20;
  } else {
    t20 = $[22];
  }
  let t21;
  if ($[23] !== apps || $[24] !== children || $[25] !== storage || $[26] !== t20 || $[27] !== theme) {
    t21 = /* @__PURE__ */ (0, import_jsx_runtime27.jsxs)(DesktopProvider, { apps, theme, storage, children: [
      t20,
      children
    ] });
    $[23] = apps;
    $[24] = children;
    $[25] = storage;
    $[26] = t20;
    $[27] = theme;
    $[28] = t21;
  } else {
    t21 = $[28];
  }
  return t21;
}

// src/FileExplorer.tsx
var import_compiler_runtime34 = require("react/compiler-runtime");
var import_react30 = require("react");

// src/util/explorer-sort.ts
var collator = new Intl.Collator(void 0, {
  numeric: true,
  sensitivity: "base"
});
function filterAndSortItems(items3, {
  query,
  sort,
  dir
}) {
  const q = query.trim().toLowerCase();
  const matches = q ? items3.filter((it) => it.name.toLowerCase().includes(q) || (it.kind ?? "").toLowerCase().includes(q)) : items3.slice();
  matches.sort((a, b) => {
    const cmp = sort === "name" ? collator.compare(a.name, b.name) : sort === "kind" ? collator.compare(a.kind ?? "", b.kind ?? "") : (a.timestamp ?? 0) - (b.timestamp ?? 0);
    return dir === "asc" ? cmp : -cmp;
  });
  return matches;
}

// src/FileExplorer.tsx
var import_jsx_runtime28 = require("react/jsx-runtime");
var SIDEBAR_WIDTH = 168;
function FileExplorer(t0) {
  const $ = (0, import_compiler_runtime34.c)(123);
  const {
    items: items3,
    onOpen,
    onRename,
    actions: t1,
    sidebar,
    emptyState,
    defaultView: t2
  } = t0;
  let t3;
  if ($[0] !== t1) {
    t3 = t1 === void 0 ? [] : t1;
    $[0] = t1;
    $[1] = t3;
  } else {
    t3 = $[1];
  }
  const actions = t3;
  const defaultView = t2 === void 0 ? "icons" : t2;
  const theme = useTheme();
  const [view, setView] = (0, import_react30.useState)(defaultView);
  const [sort, setSort] = (0, import_react30.useState)("date");
  const [dir, setDir] = (0, import_react30.useState)("desc");
  const [query, setQuery] = (0, import_react30.useState)("");
  let t4;
  if ($[2] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t4 = /* @__PURE__ */ new Set();
    $[2] = t4;
  } else {
    t4 = $[2];
  }
  const [selectedIds, setSelectedIds] = (0, import_react30.useState)(t4);
  const [anchorId, setAnchorId] = (0, import_react30.useState)(null);
  const [renamingId, setRenamingId] = (0, import_react30.useState)(null);
  const [menu, setMenu] = (0, import_react30.useState)(null);
  let t5;
  if ($[3] !== dir || $[4] !== items3 || $[5] !== query || $[6] !== sort) {
    t5 = filterAndSortItems(items3, {
      query,
      sort,
      dir
    });
    $[3] = dir;
    $[4] = items3;
    $[5] = query;
    $[6] = sort;
    $[7] = t5;
  } else {
    t5 = $[7];
  }
  const filtered = t5;
  let t6;
  if ($[8] !== filtered || $[9] !== selectedIds) {
    let t72;
    if ($[11] !== selectedIds) {
      t72 = (it) => selectedIds.has(it.id);
      $[11] = selectedIds;
      $[12] = t72;
    } else {
      t72 = $[12];
    }
    t6 = filtered.filter(t72);
    $[8] = filtered;
    $[9] = selectedIds;
    $[10] = t6;
  } else {
    t6 = $[10];
  }
  const selectedItems = t6;
  let t7;
  let t8;
  if ($[13] !== items3 || $[14] !== renamingId) {
    t7 = () => {
      const validIds = new Set(items3.map(_temp59));
      setSelectedIds((prev) => {
        let changed = false;
        const next = /* @__PURE__ */ new Set();
        for (const id of prev) {
          if (validIds.has(id)) {
            next.add(id);
          } else {
            changed = true;
          }
        }
        return changed ? next : prev;
      });
      if (renamingId && !validIds.has(renamingId)) {
        setRenamingId(null);
      }
    };
    t8 = [items3, renamingId];
    $[13] = items3;
    $[14] = renamingId;
    $[15] = t7;
    $[16] = t8;
  } else {
    t7 = $[15];
    t8 = $[16];
  }
  (0, import_react30.useEffect)(t7, t8);
  let t9;
  if ($[17] !== anchorId || $[18] !== filtered) {
    t9 = (id_0, modifiers) => {
      if (modifiers.shift && anchorId) {
        const anchorIdx = filtered.findIndex((it_1) => it_1.id === anchorId);
        const clickIdx = filtered.findIndex((it_2) => it_2.id === id_0);
        if (anchorIdx >= 0 && clickIdx >= 0) {
          const [from, to] = anchorIdx <= clickIdx ? [anchorIdx, clickIdx] : [clickIdx, anchorIdx];
          const next_0 = /* @__PURE__ */ new Set();
          for (let i = from; i <= to; i++) {
            const item = filtered[i];
            if (item) {
              next_0.add(item.id);
            }
          }
          setSelectedIds(next_0);
          return;
        }
      }
      if (modifiers.ctrl) {
        setSelectedIds((prev_0) => {
          const next_1 = new Set(prev_0);
          if (next_1.has(id_0)) {
            next_1.delete(id_0);
          } else {
            next_1.add(id_0);
          }
          return next_1;
        });
        setAnchorId(id_0);
        return;
      }
      setSelectedIds(/* @__PURE__ */ new Set([id_0]));
      setAnchorId(id_0);
    };
    $[17] = anchorId;
    $[18] = filtered;
    $[19] = t9;
  } else {
    t9 = $[19];
  }
  const handleSelect = t9;
  let t10;
  if ($[20] !== selectedIds) {
    t10 = (e, itemId) => {
      e.preventDefault();
      e.stopPropagation();
      let ids;
      if (itemId === null) {
        ids = [];
      } else {
        if (selectedIds.has(itemId)) {
          ids = Array.from(selectedIds);
        } else {
          ids = [itemId];
          setSelectedIds(/* @__PURE__ */ new Set([itemId]));
          setAnchorId(itemId);
        }
      }
      setMenu({
        x: e.clientX,
        y: e.clientY,
        itemIds: ids
      });
    };
    $[20] = selectedIds;
    $[21] = t10;
  } else {
    t10 = $[21];
  }
  const handleContextMenu = t10;
  let t11;
  if ($[22] !== items3 || $[23] !== onRename) {
    t11 = (id_1, newName) => {
      const item_0 = items3.find((it_3) => it_3.id === id_1);
      const trimmed = newName.trim();
      if (item_0 && onRename && trimmed && trimmed !== item_0.name) {
        onRename(item_0, trimmed);
      }
      setRenamingId(null);
    };
    $[22] = items3;
    $[23] = onRename;
    $[24] = t11;
  } else {
    t11 = $[24];
  }
  const commitRename = t11;
  let t12;
  if ($[25] !== onRename || $[26] !== selectedIds) {
    t12 = () => {
      if (!onRename) {
        return;
      }
      if (selectedIds.size !== 1) {
        return;
      }
      const [id_2] = Array.from(selectedIds);
      if (id_2 !== void 0) {
        setRenamingId(id_2);
      }
    };
    $[25] = onRename;
    $[26] = selectedIds;
    $[27] = t12;
  } else {
    t12 = $[27];
  }
  const beginRename = t12;
  let t13;
  if ($[28] !== dir || $[29] !== sort) {
    t13 = (field) => {
      if (sort === field) {
        setDir(dir === "asc" ? "desc" : "asc");
      } else {
        setSort(field);
        setDir(field === "name" ? "asc" : "desc");
      }
    };
    $[28] = dir;
    $[29] = sort;
    $[30] = t13;
  } else {
    t13 = $[30];
  }
  const handleHeaderSort = t13;
  let t14;
  let t15;
  if ($[31] !== actions || $[32] !== beginRename || $[33] !== filtered || $[34] !== items3 || $[35] !== onOpen || $[36] !== selectedIds || $[37] !== selectedItems) {
    t14 = () => {
      const onKey = (e_0) => {
        const target = e_0.target;
        if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
          return;
        }
        if (e_0.key === "Escape") {
          setSelectedIds(/* @__PURE__ */ new Set());
          setAnchorId(null);
          setMenu(null);
          setRenamingId(null);
          return;
        }
        if ((e_0.metaKey || e_0.ctrlKey) && e_0.key.toLowerCase() === "a") {
          e_0.preventDefault();
          setSelectedIds(new Set(filtered.map(_temp215)));
          return;
        }
        if (selectedIds.size === 0) {
          return;
        }
        if (e_0.key === "Enter" && selectedIds.size === 1 && onOpen) {
          const [id_3] = Array.from(selectedIds);
          const it_5 = items3.find((x) => x.id === id_3);
          if (it_5) {
            onOpen(it_5);
          }
          return;
        }
        if (e_0.key === "F2") {
          e_0.preventDefault();
          beginRename();
          return;
        }
        if (e_0.key === "Delete" || e_0.key === "Backspace") {
          const deleteAction = actions.find(_temp312);
          if (deleteAction) {
            e_0.preventDefault();
            deleteAction.onClick(selectedItems);
          }
        }
      };
      window.addEventListener("keydown", onKey);
      return () => {
        window.removeEventListener("keydown", onKey);
      };
    };
    t15 = [actions, beginRename, filtered, items3, onOpen, selectedItems, selectedIds];
    $[31] = actions;
    $[32] = beginRename;
    $[33] = filtered;
    $[34] = items3;
    $[35] = onOpen;
    $[36] = selectedIds;
    $[37] = selectedItems;
    $[38] = t14;
    $[39] = t15;
  } else {
    t14 = $[38];
    t15 = $[39];
  }
  (0, import_react30.useEffect)(t14, t15);
  let t16;
  if ($[40] !== actions || $[41] !== selectedItems.length) {
    let t172;
    if ($[43] !== selectedItems.length) {
      t172 = (a_0) => selectedItems.length > 0 && (!a_0.singleOnly || selectedItems.length === 1);
      $[43] = selectedItems.length;
      $[44] = t172;
    } else {
      t172 = $[44];
    }
    t16 = actions.filter(t172);
    $[40] = actions;
    $[41] = selectedItems.length;
    $[42] = t16;
  } else {
    t16 = $[42];
  }
  const visibleActions = t16;
  let t17;
  if ($[45] !== theme.palette.textPrimary) {
    t17 = {
      display: "flex",
      height: "100%",
      minHeight: 0,
      gap: 0,
      color: theme.palette.textPrimary,
      fontFamily: "inherit"
    };
    $[45] = theme.palette.textPrimary;
    $[46] = t17;
  } else {
    t17 = $[46];
  }
  let t18;
  if ($[47] !== sidebar || $[48] !== theme.palette.border || $[49] !== theme.palette.textSecondary || $[50] !== theme.shape.small) {
    t18 = sidebar && sidebar.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(Sidebar, { sections: sidebar, borderColor: theme.palette.border, textSecondary: theme.palette.textSecondary, radius: theme.shape.small });
    $[47] = sidebar;
    $[48] = theme.palette.border;
    $[49] = theme.palette.textSecondary;
    $[50] = theme.shape.small;
    $[51] = t18;
  } else {
    t18 = $[51];
  }
  let t19;
  if ($[52] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t19 = {
      display: "flex",
      flexDirection: "column",
      flex: 1,
      minWidth: 0,
      minHeight: 0,
      gap: 0
    };
    $[52] = t19;
  } else {
    t19 = $[52];
  }
  let t20;
  if ($[53] !== dir) {
    t20 = () => {
      setDir(dir === "asc" ? "desc" : "asc");
    };
    $[53] = dir;
    $[54] = t20;
  } else {
    t20 = $[54];
  }
  let t21;
  if ($[55] !== dir || $[56] !== query || $[57] !== selectedItems || $[58] !== sort || $[59] !== t20 || $[60] !== theme.palette.border || $[61] !== theme.palette.textPrimary || $[62] !== theme.palette.textSecondary || $[63] !== theme.shape.small || $[64] !== view || $[65] !== visibleActions) {
    t21 = /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(Toolbar, { view, onViewChange: setView, sortField: sort, sortDir: dir, onSortFieldChange: setSort, onSortDirToggle: t20, query, onQueryChange: setQuery, actions: visibleActions, selectedItems, themeBorder: theme.palette.border, themeText: theme.palette.textPrimary, themeTextMuted: theme.palette.textSecondary, themeRadius: theme.shape.small });
    $[55] = dir;
    $[56] = query;
    $[57] = selectedItems;
    $[58] = sort;
    $[59] = t20;
    $[60] = theme.palette.border;
    $[61] = theme.palette.textPrimary;
    $[62] = theme.palette.textSecondary;
    $[63] = theme.shape.small;
    $[64] = view;
    $[65] = visibleActions;
    $[66] = t21;
  } else {
    t21 = $[66];
  }
  let t22;
  if ($[67] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t22 = () => {
      setSelectedIds(/* @__PURE__ */ new Set());
      setAnchorId(null);
    };
    $[67] = t22;
  } else {
    t22 = $[67];
  }
  let t23;
  if ($[68] !== handleContextMenu) {
    t23 = (e_1) => {
      handleContextMenu(e_1, null);
    };
    $[68] = handleContextMenu;
    $[69] = t23;
  } else {
    t23 = $[69];
  }
  let t24;
  if ($[70] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t24 = {
      flex: 1,
      minHeight: 0,
      overflow: "auto",
      padding: 4
    };
    $[70] = t24;
  } else {
    t24 = $[70];
  }
  let t25;
  if ($[71] !== commitRename || $[72] !== dir || $[73] !== emptyState || $[74] !== filtered || $[75] !== handleContextMenu || $[76] !== handleHeaderSort || $[77] !== handleSelect || $[78] !== onOpen || $[79] !== query || $[80] !== renamingId || $[81] !== selectedIds || $[82] !== sort || $[83] !== theme.palette.border || $[84] !== theme.palette.textSecondary || $[85] !== view) {
    t25 = filtered.length === 0 ? emptyState ?? /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(EmptyState4, { message: query ? "No matches." : "Nothing here yet." }) : view === "icons" ? /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(GridView2, { items: filtered, selectedIds, renamingId, onSelect: handleSelect, onOpen, onContextMenu: handleContextMenu, onCommitRename: commitRename, onCancelRename: () => {
      setRenamingId(null);
    } }) : /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(ListView, { items: filtered, selectedIds, renamingId, sortField: sort, sortDir: dir, onSortFieldChange: handleHeaderSort, onSelect: handleSelect, onOpen, onContextMenu: handleContextMenu, onCommitRename: commitRename, onCancelRename: () => {
      setRenamingId(null);
    }, themeBorder: theme.palette.border, themeTextMuted: theme.palette.textSecondary });
    $[71] = commitRename;
    $[72] = dir;
    $[73] = emptyState;
    $[74] = filtered;
    $[75] = handleContextMenu;
    $[76] = handleHeaderSort;
    $[77] = handleSelect;
    $[78] = onOpen;
    $[79] = query;
    $[80] = renamingId;
    $[81] = selectedIds;
    $[82] = sort;
    $[83] = theme.palette.border;
    $[84] = theme.palette.textSecondary;
    $[85] = view;
    $[86] = t25;
  } else {
    t25 = $[86];
  }
  let t26;
  if ($[87] !== t23 || $[88] !== t25) {
    t26 = /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("div", { onClick: t22, onContextMenu: t23, style: t24, children: t25 });
    $[87] = t23;
    $[88] = t25;
    $[89] = t26;
  } else {
    t26 = $[89];
  }
  let t27;
  if ($[90] !== filtered.length || $[91] !== items3.length || $[92] !== selectedItems.length || $[93] !== theme.palette.border || $[94] !== theme.palette.textSecondary) {
    t27 = /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(Footer, { count: filtered.length, total: items3.length, selectedCount: selectedItems.length, themeBorder: theme.palette.border, themeTextMuted: theme.palette.textSecondary });
    $[90] = filtered.length;
    $[91] = items3.length;
    $[92] = selectedItems.length;
    $[93] = theme.palette.border;
    $[94] = theme.palette.textSecondary;
    $[95] = t27;
  } else {
    t27 = $[95];
  }
  let t28;
  if ($[96] !== t21 || $[97] !== t26 || $[98] !== t27) {
    t28 = /* @__PURE__ */ (0, import_jsx_runtime28.jsxs)("div", { style: t19, children: [
      t21,
      t26,
      t27
    ] });
    $[96] = t21;
    $[97] = t26;
    $[98] = t27;
    $[99] = t28;
  } else {
    t28 = $[99];
  }
  let t29;
  if ($[100] !== actions || $[101] !== beginRename || $[102] !== dir || $[103] !== handleHeaderSort || $[104] !== items3 || $[105] !== menu || $[106] !== onOpen || $[107] !== onRename || $[108] !== selectedItems || $[109] !== sort || $[110] !== theme.blur || $[111] !== theme.palette.border || $[112] !== theme.palette.surface || $[113] !== theme.palette.textPrimary || $[114] !== theme.palette.textSecondary || $[115] !== theme.shape.small || $[116] !== view) {
    t29 = menu && /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(ContextMenu2, { target: menu, actions, selectedItems, renamable: Boolean(onRename) && menu.itemIds.length === 1, openable: Boolean(onOpen) && menu.itemIds.length === 1, view, sort, dir, onClose: () => {
      setMenu(null);
    }, onOpenItem: () => {
      if (menu.itemIds.length === 1 && onOpen) {
        const id_4 = menu.itemIds[0];
        if (id_4 !== void 0) {
          const it_6 = items3.find((x_0) => x_0.id === id_4);
          if (it_6) {
            onOpen(it_6);
          }
        }
      }
      setMenu(null);
    }, onRename: () => {
      beginRename();
      setMenu(null);
    }, onSetView: (v) => {
      setView(v);
      setMenu(null);
    }, onSetSort: (field_0) => {
      handleHeaderSort(field_0);
      setMenu(null);
    }, themeSurface: theme.palette.surface, themeBorder: theme.palette.border, themeText: theme.palette.textPrimary, themeTextMuted: theme.palette.textSecondary, themeBlur: theme.blur.surface, themeRadius: theme.shape.small });
    $[100] = actions;
    $[101] = beginRename;
    $[102] = dir;
    $[103] = handleHeaderSort;
    $[104] = items3;
    $[105] = menu;
    $[106] = onOpen;
    $[107] = onRename;
    $[108] = selectedItems;
    $[109] = sort;
    $[110] = theme.blur;
    $[111] = theme.palette.border;
    $[112] = theme.palette.surface;
    $[113] = theme.palette.textPrimary;
    $[114] = theme.palette.textSecondary;
    $[115] = theme.shape.small;
    $[116] = view;
    $[117] = t29;
  } else {
    t29 = $[117];
  }
  let t30;
  if ($[118] !== t17 || $[119] !== t18 || $[120] !== t28 || $[121] !== t29) {
    t30 = /* @__PURE__ */ (0, import_jsx_runtime28.jsxs)("div", { style: t17, children: [
      t18,
      t28,
      t29
    ] });
    $[118] = t17;
    $[119] = t18;
    $[120] = t28;
    $[121] = t29;
    $[122] = t30;
  } else {
    t30 = $[122];
  }
  return t30;
}
function _temp312(a) {
  return a.id === "delete";
}
function _temp215(it_4) {
  return it_4.id;
}
function _temp59(it_0) {
  return it_0.id;
}
function Toolbar(t0) {
  const $ = (0, import_compiler_runtime34.c)(67);
  const {
    view,
    onViewChange,
    sortField,
    sortDir,
    onSortFieldChange,
    onSortDirToggle,
    query,
    onQueryChange,
    actions,
    selectedItems,
    themeBorder,
    themeText,
    themeTextMuted,
    themeRadius
  } = t0;
  const arrow = sortDir === "asc" ? "\u2191" : "\u2193";
  let t1;
  if ($[0] !== actions || $[1] !== arrow || $[2] !== onQueryChange || $[3] !== onSortDirToggle || $[4] !== onSortFieldChange || $[5] !== onViewChange || $[6] !== query || $[7] !== selectedItems || $[8] !== sortDir || $[9] !== sortField || $[10] !== themeBorder || $[11] !== themeRadius || $[12] !== themeText || $[13] !== themeTextMuted || $[14] !== view) {
    const dangerActions = actions.filter(_temp410);
    const primaryActions = actions.filter(_temp510);
    const t2 = `1px solid ${themeBorder}`;
    let t3;
    if ($[16] !== t2) {
      t3 = {
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: 6,
        borderBottom: t2,
        flexShrink: 0,
        flexWrap: "wrap"
      };
      $[16] = t2;
      $[17] = t3;
    } else {
      t3 = $[17];
    }
    let t4;
    if ($[18] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
      t4 = [{
        value: "icons",
        label: "Icons"
      }, {
        value: "list",
        label: "List"
      }];
      $[18] = t4;
    } else {
      t4 = $[18];
    }
    let t5;
    if ($[19] !== onViewChange) {
      t5 = (v) => {
        onViewChange(v);
      };
      $[19] = onViewChange;
      $[20] = t5;
    } else {
      t5 = $[20];
    }
    let t6;
    if ($[21] !== t5 || $[22] !== themeBorder || $[23] !== themeRadius || $[24] !== themeText || $[25] !== view) {
      t6 = /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(Segmented, { themeBorder, themeText, themeRadius, options: t4, value: view, onChange: t5 });
      $[21] = t5;
      $[22] = themeBorder;
      $[23] = themeRadius;
      $[24] = themeText;
      $[25] = view;
      $[26] = t6;
    } else {
      t6 = $[26];
    }
    let t7;
    if ($[27] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
      t7 = [{
        value: "date",
        label: "Date"
      }, {
        value: "name",
        label: "Name"
      }, {
        value: "kind",
        label: "Kind"
      }];
      $[27] = t7;
    } else {
      t7 = $[27];
    }
    let t8;
    if ($[28] !== onSortFieldChange) {
      t8 = (v_0) => {
        onSortFieldChange(v_0);
      };
      $[28] = onSortFieldChange;
      $[29] = t8;
    } else {
      t8 = $[29];
    }
    let t9;
    if ($[30] !== sortField || $[31] !== t8 || $[32] !== themeBorder || $[33] !== themeRadius || $[34] !== themeText) {
      t9 = /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(Segmented, { themeBorder, themeText, themeRadius, options: t7, value: sortField, onChange: t8 });
      $[30] = sortField;
      $[31] = t8;
      $[32] = themeBorder;
      $[33] = themeRadius;
      $[34] = themeText;
      $[35] = t9;
    } else {
      t9 = $[35];
    }
    const t10 = sortDir === "asc" ? "Ascending" : "Descending";
    const t11 = `1px solid ${themeBorder}`;
    let t12;
    if ($[36] !== t11 || $[37] !== themeRadius || $[38] !== themeText) {
      t12 = {
        border: t11,
        borderRadius: themeRadius,
        background: "transparent",
        color: themeText,
        padding: "3px 8px",
        fontSize: 12,
        fontFamily: "inherit",
        cursor: "pointer"
      };
      $[36] = t11;
      $[37] = themeRadius;
      $[38] = themeText;
      $[39] = t12;
    } else {
      t12 = $[39];
    }
    let t13;
    if ($[40] !== arrow || $[41] !== onSortDirToggle || $[42] !== t10 || $[43] !== t12) {
      t13 = /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("button", { type: "button", onClick: onSortDirToggle, title: t10, style: t12, children: arrow });
      $[40] = arrow;
      $[41] = onSortDirToggle;
      $[42] = t10;
      $[43] = t12;
      $[44] = t13;
    } else {
      t13 = $[44];
    }
    let t14;
    if ($[45] !== onQueryChange) {
      t14 = (e) => {
        onQueryChange(e.target.value);
      };
      $[45] = onQueryChange;
      $[46] = t14;
    } else {
      t14 = $[46];
    }
    const t15 = `1px solid ${themeBorder}`;
    let t16;
    if ($[47] !== t15 || $[48] !== themeRadius || $[49] !== themeText) {
      t16 = {
        flex: "1 1 140px",
        minWidth: 100,
        height: 26,
        border: t15,
        borderRadius: themeRadius,
        background: "transparent",
        color: themeText,
        padding: "0 8px",
        fontFamily: "inherit",
        fontSize: 12,
        outline: "none"
      };
      $[47] = t15;
      $[48] = themeRadius;
      $[49] = themeText;
      $[50] = t16;
    } else {
      t16 = $[50];
    }
    let t17;
    if ($[51] !== query || $[52] !== t14 || $[53] !== t16) {
      t17 = /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("input", { type: "search", placeholder: "Search", value: query, onChange: t14, style: t16 });
      $[51] = query;
      $[52] = t14;
      $[53] = t16;
      $[54] = t17;
    } else {
      t17 = $[54];
    }
    let t18;
    if ($[55] !== selectedItems.length || $[56] !== themeTextMuted) {
      t18 = selectedItems.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime28.jsxs)("span", { style: {
        fontSize: 11,
        color: themeTextMuted
      }, children: [
        String(selectedItems.length),
        " selected"
      ] });
      $[55] = selectedItems.length;
      $[56] = themeTextMuted;
      $[57] = t18;
    } else {
      t18 = $[57];
    }
    let t19;
    if ($[58] !== selectedItems || $[59] !== themeBorder || $[60] !== themeRadius || $[61] !== themeText) {
      t19 = (action) => /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(ToolbarButton, { label: action.label, icon: action.icon, themeBorder, themeText, themeRadius, onClick: () => {
        action.onClick(selectedItems);
      } }, action.id);
      $[58] = selectedItems;
      $[59] = themeBorder;
      $[60] = themeRadius;
      $[61] = themeText;
      $[62] = t19;
    } else {
      t19 = $[62];
    }
    let t20;
    if ($[63] !== selectedItems || $[64] !== themeBorder || $[65] !== themeRadius) {
      t20 = (action_0) => /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(ToolbarButton, { label: action_0.label, icon: action_0.icon, themeBorder, themeText: "#ff6868", themeRadius, onClick: () => {
        action_0.onClick(selectedItems);
      } }, action_0.id);
      $[63] = selectedItems;
      $[64] = themeBorder;
      $[65] = themeRadius;
      $[66] = t20;
    } else {
      t20 = $[66];
    }
    t1 = /* @__PURE__ */ (0, import_jsx_runtime28.jsxs)("div", { style: t3, children: [
      t6,
      t9,
      t13,
      t17,
      t18,
      primaryActions.map(t19),
      dangerActions.map(t20)
    ] });
    $[0] = actions;
    $[1] = arrow;
    $[2] = onQueryChange;
    $[3] = onSortDirToggle;
    $[4] = onSortFieldChange;
    $[5] = onViewChange;
    $[6] = query;
    $[7] = selectedItems;
    $[8] = sortDir;
    $[9] = sortField;
    $[10] = themeBorder;
    $[11] = themeRadius;
    $[12] = themeText;
    $[13] = themeTextMuted;
    $[14] = view;
    $[15] = t1;
  } else {
    t1 = $[15];
  }
  return t1;
}
function _temp510(a_0) {
  return !a_0.danger;
}
function _temp410(a) {
  return a.danger;
}
function Segmented(t0) {
  const $ = (0, import_compiler_runtime34.c)(17);
  const {
    options,
    value,
    onChange,
    themeBorder,
    themeText,
    themeRadius
  } = t0;
  const theme = useTheme();
  const t1 = `1px solid ${themeBorder}`;
  let t2;
  if ($[0] !== t1 || $[1] !== themeRadius) {
    t2 = {
      display: "inline-flex",
      border: t1,
      borderRadius: themeRadius,
      overflow: "hidden"
    };
    $[0] = t1;
    $[1] = themeRadius;
    $[2] = t2;
  } else {
    t2 = $[2];
  }
  let t3;
  if ($[3] !== onChange || $[4] !== options || $[5] !== theme || $[6] !== themeText || $[7] !== value) {
    let t42;
    if ($[9] !== onChange || $[10] !== theme || $[11] !== themeText || $[12] !== value) {
      t42 = (opt) => {
        const selected = opt.value === value;
        return /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("button", { type: "button", onClick: () => {
          onChange(opt.value);
        }, style: {
          border: "none",
          padding: "4px 10px",
          fontSize: 11,
          fontFamily: "inherit",
          cursor: "pointer",
          background: selected ? `${theme.palette.accent}38` : "transparent",
          color: themeText
        }, children: opt.label }, opt.value);
      };
      $[9] = onChange;
      $[10] = theme;
      $[11] = themeText;
      $[12] = value;
      $[13] = t42;
    } else {
      t42 = $[13];
    }
    t3 = options.map(t42);
    $[3] = onChange;
    $[4] = options;
    $[5] = theme;
    $[6] = themeText;
    $[7] = value;
    $[8] = t3;
  } else {
    t3 = $[8];
  }
  let t4;
  if ($[14] !== t2 || $[15] !== t3) {
    t4 = /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("div", { style: t2, children: t3 });
    $[14] = t2;
    $[15] = t3;
    $[16] = t4;
  } else {
    t4 = $[16];
  }
  return t4;
}
function ToolbarButton(t0) {
  const $ = (0, import_compiler_runtime34.c)(9);
  const {
    label,
    icon,
    onClick,
    themeBorder,
    themeText,
    themeRadius
  } = t0;
  const t1 = `1px solid ${themeBorder}`;
  let t2;
  if ($[0] !== t1 || $[1] !== themeRadius || $[2] !== themeText) {
    t2 = {
      border: t1,
      borderRadius: themeRadius,
      padding: "3px 10px",
      background: "transparent",
      color: themeText,
      cursor: "pointer",
      fontSize: 11,
      fontFamily: "inherit",
      display: "inline-flex",
      alignItems: "center",
      gap: 4
    };
    $[0] = t1;
    $[1] = themeRadius;
    $[2] = themeText;
    $[3] = t2;
  } else {
    t2 = $[3];
  }
  let t3;
  if ($[4] !== icon || $[5] !== label || $[6] !== onClick || $[7] !== t2) {
    t3 = /* @__PURE__ */ (0, import_jsx_runtime28.jsxs)("button", { type: "button", onClick, style: t2, children: [
      icon,
      label
    ] });
    $[4] = icon;
    $[5] = label;
    $[6] = onClick;
    $[7] = t2;
    $[8] = t3;
  } else {
    t3 = $[8];
  }
  return t3;
}
function GridView2(t0) {
  const $ = (0, import_compiler_runtime34.c)(22);
  const {
    items: items3,
    selectedIds,
    renamingId,
    onSelect,
    onOpen,
    onContextMenu,
    onCommitRename,
    onCancelRename
  } = t0;
  const theme = useTheme();
  let t1;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t1 = {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))",
      gap: 4,
      padding: 4
    };
    $[0] = t1;
  } else {
    t1 = $[0];
  }
  let t2;
  if ($[1] !== items3 || $[2] !== onCancelRename || $[3] !== onCommitRename || $[4] !== onContextMenu || $[5] !== onOpen || $[6] !== onSelect || $[7] !== renamingId || $[8] !== selectedIds || $[9] !== theme) {
    let t32;
    if ($[11] !== onCancelRename || $[12] !== onCommitRename || $[13] !== onContextMenu || $[14] !== onOpen || $[15] !== onSelect || $[16] !== renamingId || $[17] !== selectedIds || $[18] !== theme) {
      t32 = (item) => {
        const selected = selectedIds.has(item.id);
        const isRenaming = renamingId === item.id;
        return /* @__PURE__ */ (0, import_jsx_runtime28.jsxs)("div", { onClick: (e) => {
          e.stopPropagation();
          onSelect(item.id, {
            ctrl: e.metaKey || e.ctrlKey,
            shift: e.shiftKey
          });
        }, onDoubleClick: () => onOpen?.(item), onContextMenu: (e_0) => {
          onContextMenu(e_0, item.id);
        }, style: {
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          padding: 8,
          borderRadius: theme.shape.small,
          background: selected ? `${theme.palette.accent}38` : "transparent",
          cursor: "pointer",
          color: theme.palette.textPrimary
        }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("div", { style: {
            width: 56,
            height: 56,
            borderRadius: theme.shape.small + 2,
            background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
            border: `1px solid ${theme.palette.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22
          }, children: item.icon ?? item.name.charAt(0).toUpperCase() }),
          isRenaming ? /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(RenameInput, { initial: item.name, onCommit: (name) => {
            onCommitRename(item.id, name);
          }, onCancel: onCancelRename, style: {
            fontSize: 11,
            fontWeight: 500,
            textAlign: "center",
            width: "100%"
          } }) : /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("span", { style: {
            fontSize: 11,
            fontWeight: 500,
            textAlign: "center",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: "100%"
          }, children: item.name }),
          item.kind && /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("span", { style: {
            fontSize: 10,
            color: theme.palette.textSecondary
          }, children: item.kind })
        ] }, item.id);
      };
      $[11] = onCancelRename;
      $[12] = onCommitRename;
      $[13] = onContextMenu;
      $[14] = onOpen;
      $[15] = onSelect;
      $[16] = renamingId;
      $[17] = selectedIds;
      $[18] = theme;
      $[19] = t32;
    } else {
      t32 = $[19];
    }
    t2 = items3.map(t32);
    $[1] = items3;
    $[2] = onCancelRename;
    $[3] = onCommitRename;
    $[4] = onContextMenu;
    $[5] = onOpen;
    $[6] = onSelect;
    $[7] = renamingId;
    $[8] = selectedIds;
    $[9] = theme;
    $[10] = t2;
  } else {
    t2 = $[10];
  }
  let t3;
  if ($[20] !== t2) {
    t3 = /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("div", { style: t1, children: t2 });
    $[20] = t2;
    $[21] = t3;
  } else {
    t3 = $[21];
  }
  return t3;
}
function ListView(t0) {
  const $ = (0, import_compiler_runtime34.c)(54);
  const {
    items: items3,
    selectedIds,
    renamingId,
    sortField,
    sortDir,
    onSortFieldChange,
    onSelect,
    onOpen,
    onContextMenu,
    onCommitRename,
    onCancelRename,
    themeBorder,
    themeTextMuted
  } = t0;
  const theme = useTheme();
  const arrow = sortDir === "asc" ? " \u2191" : " \u2193";
  let t1;
  if ($[0] !== themeTextMuted) {
    t1 = {
      border: "none",
      background: "transparent",
      color: themeTextMuted,
      fontSize: 11,
      fontFamily: "inherit",
      fontWeight: 600,
      textAlign: "left",
      padding: "6px 8px",
      cursor: "pointer",
      textTransform: "uppercase",
      letterSpacing: 0.4
    };
    $[0] = themeTextMuted;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  const headerStyle = t1;
  let t2;
  if ($[2] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t2 = {
      display: "flex",
      flexDirection: "column"
    };
    $[2] = t2;
  } else {
    t2 = $[2];
  }
  const t3 = `1px solid ${themeBorder}`;
  let t4;
  if ($[3] !== t3) {
    t4 = {
      display: "grid",
      gridTemplateColumns: "1fr 100px 140px",
      alignItems: "center",
      borderBottom: t3,
      background: "rgba(255,255,255,0.02)"
    };
    $[3] = t3;
    $[4] = t4;
  } else {
    t4 = $[4];
  }
  let t5;
  if ($[5] !== onSortFieldChange) {
    t5 = () => {
      onSortFieldChange("name");
    };
    $[5] = onSortFieldChange;
    $[6] = t5;
  } else {
    t5 = $[6];
  }
  const t6 = sortField === "name" ? arrow : "";
  let t7;
  if ($[7] !== headerStyle || $[8] !== t5 || $[9] !== t6) {
    t7 = /* @__PURE__ */ (0, import_jsx_runtime28.jsxs)("button", { type: "button", onClick: t5, style: headerStyle, children: [
      "Name",
      t6
    ] });
    $[7] = headerStyle;
    $[8] = t5;
    $[9] = t6;
    $[10] = t7;
  } else {
    t7 = $[10];
  }
  let t8;
  if ($[11] !== onSortFieldChange) {
    t8 = () => {
      onSortFieldChange("kind");
    };
    $[11] = onSortFieldChange;
    $[12] = t8;
  } else {
    t8 = $[12];
  }
  const t9 = sortField === "kind" ? arrow : "";
  let t10;
  if ($[13] !== headerStyle || $[14] !== t8 || $[15] !== t9) {
    t10 = /* @__PURE__ */ (0, import_jsx_runtime28.jsxs)("button", { type: "button", onClick: t8, style: headerStyle, children: [
      "Kind",
      t9
    ] });
    $[13] = headerStyle;
    $[14] = t8;
    $[15] = t9;
    $[16] = t10;
  } else {
    t10 = $[16];
  }
  let t11;
  if ($[17] !== onSortFieldChange) {
    t11 = () => {
      onSortFieldChange("date");
    };
    $[17] = onSortFieldChange;
    $[18] = t11;
  } else {
    t11 = $[18];
  }
  const t12 = sortField === "date" ? arrow : "";
  let t13;
  if ($[19] !== headerStyle || $[20] !== t11 || $[21] !== t12) {
    t13 = /* @__PURE__ */ (0, import_jsx_runtime28.jsxs)("button", { type: "button", onClick: t11, style: headerStyle, children: [
      "Date",
      t12
    ] });
    $[19] = headerStyle;
    $[20] = t11;
    $[21] = t12;
    $[22] = t13;
  } else {
    t13 = $[22];
  }
  let t14;
  if ($[23] !== t10 || $[24] !== t13 || $[25] !== t4 || $[26] !== t7) {
    t14 = /* @__PURE__ */ (0, import_jsx_runtime28.jsxs)("div", { style: t4, children: [
      t7,
      t10,
      t13
    ] });
    $[23] = t10;
    $[24] = t13;
    $[25] = t4;
    $[26] = t7;
    $[27] = t14;
  } else {
    t14 = $[27];
  }
  let t15;
  if ($[28] !== items3 || $[29] !== onCancelRename || $[30] !== onCommitRename || $[31] !== onContextMenu || $[32] !== onOpen || $[33] !== onSelect || $[34] !== renamingId || $[35] !== selectedIds || $[36] !== theme || $[37] !== themeBorder || $[38] !== themeTextMuted) {
    let t162;
    if ($[40] !== onCancelRename || $[41] !== onCommitRename || $[42] !== onContextMenu || $[43] !== onOpen || $[44] !== onSelect || $[45] !== renamingId || $[46] !== selectedIds || $[47] !== theme || $[48] !== themeBorder || $[49] !== themeTextMuted) {
      t162 = (item) => {
        const selected = selectedIds.has(item.id);
        const isRenaming = renamingId === item.id;
        return /* @__PURE__ */ (0, import_jsx_runtime28.jsxs)("div", { onClick: (e) => {
          e.stopPropagation();
          onSelect(item.id, {
            ctrl: e.metaKey || e.ctrlKey,
            shift: e.shiftKey
          });
        }, onDoubleClick: () => onOpen?.(item), onContextMenu: (e_0) => {
          onContextMenu(e_0, item.id);
        }, style: {
          display: "grid",
          gridTemplateColumns: "1fr 100px 140px",
          alignItems: "center",
          padding: "6px 8px",
          borderBottom: `1px solid ${themeBorder}`,
          background: selected ? `${theme.palette.accent}38` : "transparent",
          cursor: "pointer",
          color: theme.palette.textPrimary
        }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime28.jsxs)("span", { style: {
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            overflow: "hidden"
          }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("span", { style: {
              width: 18,
              height: 18,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              flexShrink: 0
            }, children: item.iconSmall ?? item.icon ?? item.name.charAt(0).toUpperCase() }),
            isRenaming ? /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(RenameInput, { initial: item.name, onCommit: (name) => {
              onCommitRename(item.id, name);
            }, onCancel: onCancelRename, style: {
              fontSize: 12,
              fontWeight: 500,
              flex: 1
            } }) : /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("span", { style: {
              fontSize: 12,
              fontWeight: 500,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap"
            }, children: item.name })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("span", { style: {
            fontSize: 11,
            color: themeTextMuted
          }, children: item.kind ?? "" }),
          /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("span", { style: {
            fontSize: 11,
            color: themeTextMuted
          }, children: item.subtitle ?? (item.timestamp ? formatDate(item.timestamp) : "") })
        ] }, item.id);
      };
      $[40] = onCancelRename;
      $[41] = onCommitRename;
      $[42] = onContextMenu;
      $[43] = onOpen;
      $[44] = onSelect;
      $[45] = renamingId;
      $[46] = selectedIds;
      $[47] = theme;
      $[48] = themeBorder;
      $[49] = themeTextMuted;
      $[50] = t162;
    } else {
      t162 = $[50];
    }
    t15 = items3.map(t162);
    $[28] = items3;
    $[29] = onCancelRename;
    $[30] = onCommitRename;
    $[31] = onContextMenu;
    $[32] = onOpen;
    $[33] = onSelect;
    $[34] = renamingId;
    $[35] = selectedIds;
    $[36] = theme;
    $[37] = themeBorder;
    $[38] = themeTextMuted;
    $[39] = t15;
  } else {
    t15 = $[39];
  }
  let t16;
  if ($[51] !== t14 || $[52] !== t15) {
    t16 = /* @__PURE__ */ (0, import_jsx_runtime28.jsxs)("div", { style: t2, children: [
      t14,
      t15
    ] });
    $[51] = t14;
    $[52] = t15;
    $[53] = t16;
  } else {
    t16 = $[53];
  }
  return t16;
}
function formatDate(ms) {
  return new Date(ms).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}
function RenameInput(t0) {
  const $ = (0, import_compiler_runtime34.c)(19);
  const {
    initial,
    onCommit,
    onCancel,
    style
  } = t0;
  const theme = useTheme();
  const [value, setValue] = (0, import_react30.useState)(initial);
  const ref = (0, import_react30.useRef)(null);
  const cancelledRef = (0, import_react30.useRef)(false);
  let t1;
  let t2;
  if ($[0] !== initial) {
    t1 = () => {
      const el = ref.current;
      if (!el) {
        return;
      }
      el.focus();
      const lastDot = initial.lastIndexOf(".");
      const stemEnd = lastDot > 0 ? lastDot : initial.length;
      el.setSelectionRange(0, stemEnd);
    };
    t2 = [initial];
    $[0] = initial;
    $[1] = t1;
    $[2] = t2;
  } else {
    t1 = $[1];
    t2 = $[2];
  }
  (0, import_react30.useEffect)(t1, t2);
  let t3;
  if ($[3] !== onCancel || $[4] !== onCommit || $[5] !== value) {
    t3 = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        onCommit(value);
      } else {
        if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          cancelledRef.current = true;
          onCancel();
        }
      }
    };
    $[3] = onCancel;
    $[4] = onCommit;
    $[5] = value;
    $[6] = t3;
  } else {
    t3 = $[6];
  }
  const handleKey = t3;
  let t4;
  if ($[7] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t4 = (e_0) => {
      setValue(e_0.target.value);
    };
    $[7] = t4;
  } else {
    t4 = $[7];
  }
  let t5;
  if ($[8] !== onCommit || $[9] !== value) {
    t5 = () => {
      if (cancelledRef.current) {
        return;
      }
      onCommit(value);
    };
    $[8] = onCommit;
    $[9] = value;
    $[10] = t5;
  } else {
    t5 = $[10];
  }
  const t6 = `1px solid ${theme.palette.accent}8c`;
  let t7;
  if ($[11] !== style || $[12] !== t6) {
    t7 = {
      border: t6,
      borderRadius: 4,
      background: "rgba(0,0,0,0.25)",
      color: "inherit",
      outline: "none",
      padding: "1px 4px",
      fontFamily: "inherit",
      ...style
    };
    $[11] = style;
    $[12] = t6;
    $[13] = t7;
  } else {
    t7 = $[13];
  }
  let t8;
  if ($[14] !== handleKey || $[15] !== t5 || $[16] !== t7 || $[17] !== value) {
    t8 = /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("input", { ref, type: "text", value, onChange: t4, onKeyDown: handleKey, onBlur: t5, onClick: _temp66, style: t7 });
    $[14] = handleKey;
    $[15] = t5;
    $[16] = t7;
    $[17] = value;
    $[18] = t8;
  } else {
    t8 = $[18];
  }
  return t8;
}
function _temp66(e_1) {
  e_1.stopPropagation();
}
function ContextMenu2(t0) {
  const $ = (0, import_compiler_runtime34.c)(36);
  const {
    target,
    actions,
    selectedItems,
    renamable,
    openable,
    view,
    sort,
    dir,
    onClose,
    onOpenItem,
    onRename,
    onSetView,
    onSetSort,
    themeSurface,
    themeBorder,
    themeText,
    themeTextMuted,
    themeBlur,
    themeRadius
  } = t0;
  let t1;
  let t2;
  if ($[0] !== onClose) {
    t1 = () => {
      const onAway = () => {
        onClose();
      };
      const t = window.setTimeout(() => {
        window.addEventListener("mousedown", onAway);
        window.addEventListener("scroll", onAway, true);
      }, 0);
      return () => {
        window.clearTimeout(t);
        window.removeEventListener("mousedown", onAway);
        window.removeEventListener("scroll", onAway, true);
      };
    };
    t2 = [onClose];
    $[0] = onClose;
    $[1] = t1;
    $[2] = t2;
  } else {
    t1 = $[1];
    t2 = $[2];
  }
  (0, import_react30.useEffect)(t1, t2);
  const isItemMenu = target.itemIds.length > 0;
  const itemCount = selectedItems.length;
  let t3;
  if ($[3] !== actions || $[4] !== dir || $[5] !== isItemMenu || $[6] !== itemCount || $[7] !== onClose || $[8] !== onOpenItem || $[9] !== onRename || $[10] !== onSetSort || $[11] !== onSetView || $[12] !== openable || $[13] !== renamable || $[14] !== selectedItems || $[15] !== sort || $[16] !== target.x || $[17] !== target.y || $[18] !== themeBlur || $[19] !== themeBorder || $[20] !== themeRadius || $[21] !== themeSurface || $[22] !== themeText || $[23] !== themeTextMuted || $[24] !== view) {
    let t4;
    if ($[26] !== itemCount) {
      t4 = (a) => itemCount > 0 && (!a.singleOnly || itemCount === 1);
      $[26] = itemCount;
      $[27] = t4;
    } else {
      t4 = $[27];
    }
    const visibleActions = actions.filter(t4);
    const primary = visibleActions.filter(_temp76);
    const danger = visibleActions.filter(_temp86);
    const t5 = themeRadius + 2;
    const t6 = `1px solid ${themeBorder}`;
    let t7;
    if ($[28] !== t5 || $[29] !== t6 || $[30] !== target.x || $[31] !== target.y || $[32] !== themeBlur || $[33] !== themeSurface || $[34] !== themeText) {
      t7 = {
        position: "fixed",
        top: target.y,
        left: target.x,
        minWidth: 180,
        maxWidth: 280,
        padding: 4,
        borderRadius: t5,
        border: t6,
        backgroundColor: themeSurface,
        backdropFilter: themeBlur,
        WebkitBackdropFilter: themeBlur,
        boxShadow: "0 14px 40px -12px rgba(0,0,0,0.6)",
        zIndex: 2e3,
        color: themeText,
        fontSize: 12
      };
      $[28] = t5;
      $[29] = t6;
      $[30] = target.x;
      $[31] = target.y;
      $[32] = themeBlur;
      $[33] = themeSurface;
      $[34] = themeText;
      $[35] = t7;
    } else {
      t7 = $[35];
    }
    t3 = /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("div", { onMouseDown: _temp96, style: t7, children: isItemMenu ? /* @__PURE__ */ (0, import_jsx_runtime28.jsxs)(import_jsx_runtime28.Fragment, { children: [
      openable && /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(MenuRow2, { label: "Open", shortcut: "\u21B5", onClick: onOpenItem, themeTextMuted }),
      renamable && /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(MenuRow2, { label: "Rename", shortcut: "F2", onClick: onRename, themeTextMuted }),
      primary.map((a_2) => /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(MenuRow2, { label: a_2.label, icon: a_2.icon, shortcut: a_2.shortcut, onClick: () => {
        a_2.onClick(selectedItems);
        onClose();
      }, themeTextMuted }, a_2.id)),
      danger.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(MenuDivider, { color: themeBorder }),
      danger.map((a_3) => /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(MenuRow2, { label: a_3.label, icon: a_3.icon, shortcut: a_3.shortcut, danger: true, onClick: () => {
        a_3.onClick(selectedItems);
        onClose();
      }, themeTextMuted }, a_3.id))
    ] }) : /* @__PURE__ */ (0, import_jsx_runtime28.jsxs)(import_jsx_runtime28.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(MenuLabel, { text: "View as", themeTextMuted }),
      /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(MenuRow2, { label: "Icons", checked: view === "icons", onClick: () => {
        onSetView("icons");
      }, themeTextMuted }),
      /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(MenuRow2, { label: "List", checked: view === "list", onClick: () => {
        onSetView("list");
      }, themeTextMuted }),
      /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(MenuDivider, { color: themeBorder }),
      /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(MenuLabel, { text: "Sort by", themeTextMuted }),
      ["date", "name", "kind"].map((field) => /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(MenuRow2, { label: field === "date" ? "Date" : field === "name" ? "Name" : "Kind", shortcut: sort === field ? dir === "asc" ? "\u2191" : "\u2193" : void 0, checked: sort === field, onClick: () => {
        onSetSort(field);
      }, themeTextMuted }, field))
    ] }) });
    $[3] = actions;
    $[4] = dir;
    $[5] = isItemMenu;
    $[6] = itemCount;
    $[7] = onClose;
    $[8] = onOpenItem;
    $[9] = onRename;
    $[10] = onSetSort;
    $[11] = onSetView;
    $[12] = openable;
    $[13] = renamable;
    $[14] = selectedItems;
    $[15] = sort;
    $[16] = target.x;
    $[17] = target.y;
    $[18] = themeBlur;
    $[19] = themeBorder;
    $[20] = themeRadius;
    $[21] = themeSurface;
    $[22] = themeText;
    $[23] = themeTextMuted;
    $[24] = view;
    $[25] = t3;
  } else {
    t3 = $[25];
  }
  return t3;
}
function _temp96(e) {
  e.stopPropagation();
}
function _temp86(a_1) {
  return a_1.danger;
}
function _temp76(a_0) {
  return !a_0.danger;
}
function MenuRow2(t0) {
  const $ = (0, import_compiler_runtime34.c)(20);
  const {
    label,
    icon,
    shortcut,
    checked,
    danger,
    onClick,
    themeTextMuted
  } = t0;
  const theme = useTheme();
  const t1 = danger ? "#ff6868" : "inherit";
  let t2;
  if ($[0] !== t1) {
    t2 = {
      display: "flex",
      alignItems: "center",
      gap: 8,
      width: "100%",
      border: "none",
      background: "transparent",
      cursor: "pointer",
      color: t1,
      padding: "5px 8px",
      borderRadius: 4,
      fontFamily: "inherit",
      fontSize: 12,
      textAlign: "left"
    };
    $[0] = t1;
    $[1] = t2;
  } else {
    t2 = $[1];
  }
  let t3;
  if ($[2] !== theme.palette.accent) {
    t3 = (e) => {
      e.currentTarget.style.background = `${theme.palette.accent}2e`;
    };
    $[2] = theme.palette.accent;
    $[3] = t3;
  } else {
    t3 = $[3];
  }
  let t4;
  if ($[4] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t4 = {
      width: 14,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center"
    };
    $[4] = t4;
  } else {
    t4 = $[4];
  }
  const t5 = checked ? "\u2713" : icon ?? null;
  let t6;
  if ($[5] !== t5) {
    t6 = /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("span", { style: t4, children: t5 });
    $[5] = t5;
    $[6] = t6;
  } else {
    t6 = $[6];
  }
  let t7;
  if ($[7] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t7 = {
      flex: 1
    };
    $[7] = t7;
  } else {
    t7 = $[7];
  }
  let t8;
  if ($[8] !== label) {
    t8 = /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("span", { style: t7, children: label });
    $[8] = label;
    $[9] = t8;
  } else {
    t8 = $[9];
  }
  let t9;
  if ($[10] !== shortcut || $[11] !== themeTextMuted) {
    t9 = shortcut && /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("span", { style: {
      fontSize: 11,
      color: themeTextMuted,
      fontVariantNumeric: "tabular-nums"
    }, children: shortcut });
    $[10] = shortcut;
    $[11] = themeTextMuted;
    $[12] = t9;
  } else {
    t9 = $[12];
  }
  let t10;
  if ($[13] !== onClick || $[14] !== t2 || $[15] !== t3 || $[16] !== t6 || $[17] !== t8 || $[18] !== t9) {
    t10 = /* @__PURE__ */ (0, import_jsx_runtime28.jsxs)("button", { type: "button", onClick, style: t2, onPointerEnter: t3, onPointerLeave: _temp06, children: [
      t6,
      t8,
      t9
    ] });
    $[13] = onClick;
    $[14] = t2;
    $[15] = t3;
    $[16] = t6;
    $[17] = t8;
    $[18] = t9;
    $[19] = t10;
  } else {
    t10 = $[19];
  }
  return t10;
}
function _temp06(e_0) {
  e_0.currentTarget.style.background = "transparent";
}
function MenuLabel(t0) {
  const $ = (0, import_compiler_runtime34.c)(5);
  const {
    text,
    themeTextMuted
  } = t0;
  let t1;
  if ($[0] !== themeTextMuted) {
    t1 = {
      fontSize: 10,
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: 0.6,
      color: themeTextMuted,
      padding: "6px 8px 2px"
    };
    $[0] = themeTextMuted;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  let t2;
  if ($[2] !== t1 || $[3] !== text) {
    t2 = /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("div", { style: t1, children: text });
    $[2] = t1;
    $[3] = text;
    $[4] = t2;
  } else {
    t2 = $[4];
  }
  return t2;
}
function MenuDivider(t0) {
  const $ = (0, import_compiler_runtime34.c)(2);
  const {
    color
  } = t0;
  let t1;
  if ($[0] !== color) {
    t1 = /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("div", { style: {
      height: 1,
      background: color,
      margin: "4px 4px"
    }, "aria-hidden": true });
    $[0] = color;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  return t1;
}
function Sidebar(t0) {
  const $ = (0, import_compiler_runtime34.c)(14);
  const {
    sections,
    borderColor,
    textSecondary,
    radius
  } = t0;
  const theme = useTheme();
  const t1 = `1px solid ${borderColor}`;
  let t2;
  if ($[0] !== t1) {
    t2 = {
      width: SIDEBAR_WIDTH,
      flexShrink: 0,
      borderRight: t1,
      padding: "8px 6px",
      overflow: "auto",
      background: "rgba(0,0,0,0.18)"
    };
    $[0] = t1;
    $[1] = t2;
  } else {
    t2 = $[1];
  }
  let t3;
  if ($[2] !== radius || $[3] !== sections || $[4] !== textSecondary || $[5] !== theme) {
    let t42;
    if ($[7] !== radius || $[8] !== textSecondary || $[9] !== theme) {
      t42 = (section) => /* @__PURE__ */ (0, import_jsx_runtime28.jsxs)("div", { style: {
        marginBottom: 12
      }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("div", { style: {
          fontSize: 10,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: 0.6,
          color: textSecondary,
          padding: "4px 6px"
        }, children: section.label }),
        section.items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime28.jsxs)("button", { type: "button", onClick: item.onClick, style: {
          display: "flex",
          alignItems: "center",
          gap: 8,
          width: "100%",
          border: "none",
          background: item.active ? `${theme.palette.accent}38` : "transparent",
          color: "inherit",
          cursor: "pointer",
          padding: "5px 8px",
          borderRadius: radius,
          fontFamily: "inherit",
          fontSize: 12,
          textAlign: "left"
        }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("span", { style: {
            width: 16,
            height: 16,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: item.iconColor
          }, children: item.icon ?? "\u2022" }),
          /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("span", { style: {
            flex: 1
          }, children: item.label })
        ] }, item.id))
      ] }, section.label);
      $[7] = radius;
      $[8] = textSecondary;
      $[9] = theme;
      $[10] = t42;
    } else {
      t42 = $[10];
    }
    t3 = sections.map(t42);
    $[2] = radius;
    $[3] = sections;
    $[4] = textSecondary;
    $[5] = theme;
    $[6] = t3;
  } else {
    t3 = $[6];
  }
  let t4;
  if ($[11] !== t2 || $[12] !== t3) {
    t4 = /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("div", { style: t2, children: t3 });
    $[11] = t2;
    $[12] = t3;
    $[13] = t4;
  } else {
    t4 = $[13];
  }
  return t4;
}
function EmptyState4(t0) {
  const $ = (0, import_compiler_runtime34.c)(5);
  const {
    message
  } = t0;
  const theme = useTheme();
  let t1;
  if ($[0] !== theme.palette.textSecondary) {
    t1 = {
      padding: "40px 20px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      color: theme.palette.textSecondary,
      fontSize: 12
    };
    $[0] = theme.palette.textSecondary;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  let t2;
  if ($[2] !== message || $[3] !== t1) {
    t2 = /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("div", { style: t1, children: message });
    $[2] = message;
    $[3] = t1;
    $[4] = t2;
  } else {
    t2 = $[4];
  }
  return t2;
}
function Footer(t0) {
  const $ = (0, import_compiler_runtime34.c)(7);
  const {
    count,
    total,
    selectedCount,
    themeBorder,
    themeTextMuted
  } = t0;
  const base = count === total ? `${String(total)} item${total === 1 ? "" : "s"}` : `${String(count)} of ${String(total)} item${total === 1 ? "" : "s"}`;
  const sel = selectedCount > 0 ? ` \xB7 ${String(selectedCount)} selected` : "";
  const t1 = `1px solid ${themeBorder}`;
  let t2;
  if ($[0] !== t1 || $[1] !== themeTextMuted) {
    t2 = {
      height: 22,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderTop: t1,
      color: themeTextMuted,
      fontSize: 11,
      flexShrink: 0
    };
    $[0] = t1;
    $[1] = themeTextMuted;
    $[2] = t2;
  } else {
    t2 = $[2];
  }
  let t3;
  if ($[3] !== base || $[4] !== sel || $[5] !== t2) {
    t3 = /* @__PURE__ */ (0, import_jsx_runtime28.jsxs)("div", { style: t2, children: [
      base,
      sel
    ] });
    $[3] = base;
    $[4] = sel;
    $[5] = t2;
    $[6] = t3;
  } else {
    t3 = $[6];
  }
  return t3;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  APP_SWITCHER_CYCLE_EVENT,
  AppSwitcher,
  ContextMenu,
  ContextMenuAnchor,
  DOCK_HEIGHT,
  DOCK_WIDTH,
  Desktop,
  DesktopBackdrop,
  DesktopIcons,
  DesktopProvider,
  Dock,
  FileExplorer,
  FolderSvg,
  HudOverlay,
  KEYBOARD_HELP_TOGGLE_EVENT,
  KeyboardHelp,
  KeyboardShortcuts,
  Launcher,
  MENU_BAR_HEIGHT,
  MISSION_CONTROL_TOGGLE_EVENT,
  MenuBar,
  MissionControl,
  NOTIFICATION_CENTER_TOGGLE_EVENT,
  NotificationCenter,
  NotificationToasts,
  QUICK_SETTINGS_TOGGLE_EVENT,
  QuickSettings,
  SHORTCUTS,
  SPOTLIGHT_OPEN_EVENT,
  Settings,
  Slider,
  SnapPreview,
  Spotlight,
  Toggle,
  Tooltip,
  Wallpaper,
  Window,
  WindowLayer,
  chordOf,
  closeContextMenu,
  computeSnapZone,
  countRecentsSources,
  findConflicts,
  formatChord,
  getContextMenuState,
  getDockTileRect,
  getHud,
  getSnapPreview,
  getSystemWindow,
  hideHud,
  listQuickSettings,
  listRecentItems,
  listSpotlightSources,
  listStatusItems,
  listSystemWindows,
  nextCascadeIndex,
  openContextMenu,
  pickInitialBounds,
  rectForZone,
  registerQuickSetting,
  registerRecentsSource,
  registerSpotlightSource,
  registerStatusItem,
  registerSystemWindow,
  requestSettingsSection,
  resolveSystemWindowName,
  setSnapPreview,
  showHud,
  subscribeContextMenu,
  subscribeHud,
  subscribeQuickSettings,
  subscribeRecentsSources,
  subscribeSnapPreview,
  subscribeSpotlightSources,
  subscribeStatusItems,
  systemWindows,
  unregisterQuickSetting,
  unregisterStatusItem,
  useApp,
  useApps,
  useBaseTheme,
  useDesktopContext,
  useLauncher,
  useSettings,
  useTheme
});
//# sourceMappingURL=index.cjs.map
