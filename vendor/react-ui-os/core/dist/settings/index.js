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
  applyAppearance,
  applyPrefs,
  getPath,
  setPath
};
//# sourceMappingURL=index.js.map