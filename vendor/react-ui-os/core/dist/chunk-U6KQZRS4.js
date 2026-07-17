"use client";

// src/notifications/store.ts
var items = [];
var listeners = /* @__PURE__ */ new Set();
var cachedSnapshot = {
  items: [],
  active: [],
  unreadCount: 0,
  unreadByApp: {}
};
var TICK_MS = 1e3;
var tickHandle = null;
function defaultDurationFor(level) {
  if (level === "error") return 0;
  if (level === "warn") return 8e3;
  return 5e3;
}
function rebuildSnapshot() {
  const now = Date.now();
  const active = items.filter((item) => {
    if (item.dismissedAt) return false;
    const duration = item.duration ?? defaultDurationFor(item.level);
    if (duration === 0) return true;
    return now - item.createdAt < duration;
  });
  const unreadCount = items.reduce((acc, item) => item.read ? acc : acc + 1, 0);
  const unreadByApp = items.reduce((acc, item) => {
    if (item.read || !item.appId) return acc;
    acc[item.appId] = (acc[item.appId] ?? 0) + 1;
    return acc;
  }, {});
  cachedSnapshot = {
    items: [...items],
    active,
    unreadCount,
    unreadByApp
  };
}
function emit() {
  rebuildSnapshot();
  for (const listener of listeners) listener(cachedSnapshot);
}
function computeActiveCount() {
  const now = Date.now();
  let count = 0;
  for (const item of items) {
    if (item.dismissedAt) continue;
    const duration = item.duration ?? defaultDurationFor(item.level);
    if (duration === 0 || now - item.createdAt < duration) count += 1;
  }
  return count;
}
function ensureTickerRunning() {
  if (tickHandle || typeof window === "undefined") return;
  tickHandle = setInterval(() => {
    if (cachedSnapshot.active.length === 0) {
      if (tickHandle) {
        clearInterval(tickHandle);
        tickHandle = null;
      }
      return;
    }
    if (computeActiveCount() !== cachedSnapshot.active.length) {
      emit();
    }
  }, TICK_MS);
}
var idCounter = 0;
function generateId() {
  idCounter += 1;
  return `n${String(Date.now())}-${String(idCounter)}`;
}
function notify(input) {
  const id = input.id ?? generateId();
  const existingIdx = items.findIndex((row) => row.id === id);
  const next = {
    ...input,
    id,
    createdAt: Date.now(),
    dismissedAt: void 0,
    read: false
  };
  if (existingIdx >= 0) {
    items = [...items.slice(0, existingIdx), next, ...items.slice(existingIdx + 1)];
  } else {
    items = [next, ...items];
  }
  emit();
  ensureTickerRunning();
  return id;
}
function dismissNotification(id) {
  const item = items.find((row) => row.id === id);
  if (!item || item.dismissedAt) return;
  item.onDismiss?.();
  items = items.map((row) => row.id === id ? {
    ...row,
    dismissedAt: Date.now()
  } : row);
  emit();
}
function removeNotification(id) {
  const item = items.find((row) => row.id === id);
  if (!item) return;
  if (!item.dismissedAt) item.onDismiss?.();
  items = items.filter((row) => row.id !== id);
  emit();
}
function clearAllNotifications() {
  for (const item of items) {
    if (!item.dismissedAt) item.onDismiss?.();
  }
  items = [];
  emit();
}
function markNotificationRead(id) {
  const idx = items.findIndex((row) => row.id === id);
  if (idx < 0 || items[idx]?.read) return;
  items = items.map((row) => row.id === id ? {
    ...row,
    read: true
  } : row);
  emit();
}
function markAllNotificationsRead() {
  if (items.every((item) => item.read)) return;
  items = items.map((row) => row.read ? row : {
    ...row,
    read: true
  });
  emit();
}
function getNotificationSnapshot() {
  return cachedSnapshot;
}
function subscribeNotifications(listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// src/notifications/context.tsx
import { useSyncExternalStore } from "react";
function useNotifications() {
  return useSyncExternalStore(subscribeNotifications, getNotificationSnapshot, getNotificationSnapshot);
}

export {
  notify,
  dismissNotification,
  removeNotification,
  clearAllNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getNotificationSnapshot,
  subscribeNotifications,
  useNotifications
};
//# sourceMappingURL=chunk-U6KQZRS4.js.map