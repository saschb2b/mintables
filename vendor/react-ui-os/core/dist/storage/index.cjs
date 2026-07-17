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

// src/storage/index.ts
var storage_exports = {};
__export(storage_exports, {
  createLocalStorageAdapter: () => createLocalStorageAdapter
});
module.exports = __toCommonJS(storage_exports);

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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createLocalStorageAdapter
});
//# sourceMappingURL=index.cjs.map