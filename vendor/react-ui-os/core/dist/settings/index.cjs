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

// src/settings/index.ts
var settings_exports = {};
__export(settings_exports, {
  applyAppearance: () => applyAppearance,
  applyPrefs: () => applyPrefs,
  getPath: () => getPath,
  setPath: () => setPath
});
module.exports = __toCommonJS(settings_exports);

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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  applyAppearance,
  applyPrefs,
  getPath,
  setPath
});
//# sourceMappingURL=index.cjs.map