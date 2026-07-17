"use client";
import {
  WindowManagerProvider,
  initialWindowManagerState,
  useWindowManager,
  windowIdOf,
  windowManagerReducer
} from "./chunk-PJ4HMENE.js";
import {
  clearAllNotifications,
  dismissNotification,
  getNotificationSnapshot,
  markAllNotificationsRead,
  markNotificationRead,
  notify,
  removeNotification,
  subscribeNotifications,
  useNotifications
} from "./chunk-U6KQZRS4.js";

// src/storage/local-storage.ts
var CHANGE_EVENT = "react-ui-os:storage-changed";
function createLocalStorageAdapter(prefix = "rui-os") {
  const fullKey = (k) => `${prefix}:${k}`;
  const stripPrefix = (k) => k.startsWith(`${prefix}:`) ? k.slice(prefix.length + 1) : k;
  return {
    get(key) {
      if (typeof window === "undefined") return null;
      try {
        const raw = window.localStorage.getItem(fullKey(key));
        if (raw === null) return null;
        return JSON.parse(raw);
      } catch {
        return null;
      }
    },
    set(key, value) {
      if (typeof window === "undefined") return;
      try {
        window.localStorage.setItem(fullKey(key), JSON.stringify(value));
        window.dispatchEvent(new CustomEvent(CHANGE_EVENT, {
          detail: {
            key
          }
        }));
      } catch {
      }
    },
    remove(key) {
      if (typeof window === "undefined") return;
      window.localStorage.removeItem(fullKey(key));
      window.dispatchEvent(new CustomEvent(CHANGE_EVENT, {
        detail: {
          key
        }
      }));
    },
    subscribe(listener) {
      if (typeof window === "undefined") return () => {
      };
      const handleCustom = (e) => {
        const detail = e.detail;
        if (detail && typeof detail.key === "string") listener(detail.key);
      };
      const handleStorage = (e) => {
        if (e.key && e.key.startsWith(`${prefix}:`)) {
          listener(stripPrefix(e.key));
        }
      };
      window.addEventListener(CHANGE_EVENT, handleCustom);
      window.addEventListener("storage", handleStorage);
      return () => {
        window.removeEventListener(CHANGE_EVENT, handleCustom);
        window.removeEventListener("storage", handleStorage);
      };
    }
  };
}

// src/settings/apply.ts
function getPath(obj, path) {
  if (path.length === 0) return obj;
  const parts = path.split(".");
  let cur = obj;
  for (const part of parts) {
    if (cur === null || typeof cur !== "object") return void 0;
    cur = cur[part];
  }
  return cur;
}
function setPath(obj, path, value) {
  if (path.length === 0) return value;
  const parts = path.split(".");
  const root = {
    ...obj
  };
  let cur = root;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    if (key === void 0) continue;
    const next = cur[key];
    const cloned = next !== null && typeof next === "object" ? {
      ...next
    } : {};
    cur[key] = cloned;
    cur = cloned;
  }
  const leaf = parts[parts.length - 1];
  if (leaf !== void 0) cur[leaf] = value;
  return root;
}
function applyPrefs(theme, prefs) {
  const customizable = theme.customizable;
  if (!customizable) return theme;
  let result = theme;
  for (const [path, value] of Object.entries(prefs)) {
    if (!(path in customizable)) continue;
    if (value === void 0) continue;
    result = setPath(result, path, value);
  }
  return result;
}
function applyAppearance(theme, mode) {
  const variant = theme.appearances?.[mode];
  if (!variant) return theme;
  return {
    ...theme,
    palette: {
      ...theme.palette,
      ...variant.palette
    },
    elevation: variant.elevation ?? theme.elevation,
    blur: {
      ...theme.blur,
      ...variant.blur
    },
    wallpaper: {
      ...theme.wallpaper,
      ...variant.wallpaper
    }
  };
}
export {
  WindowManagerProvider,
  applyAppearance,
  applyPrefs,
  clearAllNotifications,
  createLocalStorageAdapter,
  dismissNotification,
  getNotificationSnapshot,
  getPath,
  initialWindowManagerState,
  markAllNotificationsRead,
  markNotificationRead,
  notify,
  removeNotification,
  setPath,
  subscribeNotifications,
  useNotifications,
  useWindowManager,
  windowIdOf,
  windowManagerReducer
};
//# sourceMappingURL=index.js.map