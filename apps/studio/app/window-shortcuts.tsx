"use client";

import { useEffect, useRef } from "react";
import {
  useWindowManager,
  windowIdOf,
  type OpenWindow,
} from "@mintables/shared/lib";
import type { AnyGenerator } from "@mintables/shared/lib";

interface ShortcutDeps {
  generators: AnyGenerator[];
  focusedWindow: OpenWindow | null;
  windowById: (id: string) => OpenWindow | undefined;
  openWindow: (payload: {
    kind: "generator";
    generatorId: string;
  }) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
}

/**
 * Global keyboard shortcuts for the window manager. Renders nothing; mounts a
 * single window-level keydown listener.
 *
 * Bindings (modifier is Cmd on macOS, Ctrl elsewhere; we accept either):
 *   Mod+W       close focused window
 *   Mod+M       minimize focused window
 *   Mod+1..9    open / focus / cycle-minimize generator N (1-indexed)
 *
 * Explicitly ignored here:
 *   Mod+K       owned by Spotlight (packages/shared/src/ui/spotlight.tsx)
 *   Mod+Z, Y    owned by GeneratorShell (undo / redo)
 *
 * The handler also bails when the keystroke originates inside an <input>,
 * <textarea>, or contenteditable region so native text editing wins.
 *
 * We funnel current values through a ref so the listener is registered once
 * but always reads fresh state at event time.
 */
export function WindowShortcuts({
  generators,
}: {
  generators: AnyGenerator[];
}): null {
  const {
    focusedWindow,
    windowById,
    openWindow,
    closeWindow,
    focusWindow,
    minimizeWindow,
    restoreWindow,
  } = useWindowManager();

  const depsRef = useRef<ShortcutDeps>({
    generators,
    focusedWindow,
    windowById,
    openWindow,
    closeWindow,
    focusWindow,
    minimizeWindow,
    restoreWindow,
  });

  // Keep the ref pointed at the latest values without re-registering the
  // global listener.
  useEffect(() => {
    depsRef.current = {
      generators,
      focusedWindow,
      windowById,
      openWindow,
      closeWindow,
      focusWindow,
      minimizeWindow,
      restoreWindow,
    };
  });

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      // Require the OS chord modifier.
      if (!(e.metaKey || e.ctrlKey)) return;

      // Never steal native text editing.
      const target = e.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        if (target.isContentEditable) return;
      }

      const key = e.key.toLowerCase();

      // Reserved by other owners: bail without prevent-default so they fire.
      if (key === "k") return;
      if (key === "z" || key === "y") return;

      const deps = depsRef.current;

      if (key === "w") {
        const f = deps.focusedWindow;
        if (!f) return;
        e.preventDefault();
        deps.closeWindow(f.id);
        return;
      }

      if (key === "m") {
        const f = deps.focusedWindow;
        if (!f) return;
        if (f.state === "minimized") return;
        e.preventDefault();
        deps.minimizeWindow(f.id);
        return;
      }

      if (/^[1-9]$/.test(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        // Out-of-range when fewer than 9 generators exist: just no-op.
        if (idx >= deps.generators.length) return;
        const gen = deps.generators[idx];
        e.preventDefault();
        const id = windowIdOf({ kind: "generator", generatorId: gen.id });
        const existing = deps.windowById(id);
        if (!existing) {
          deps.openWindow({ kind: "generator", generatorId: gen.id });
          return;
        }
        if (existing.state === "minimized") {
          deps.restoreWindow(id);
          deps.focusWindow(id);
          return;
        }
        // Open and not minimized: focus if not focused, else toggle minimize.
        if (deps.focusedWindow?.id !== id) {
          deps.focusWindow(id);
          return;
        }
        deps.minimizeWindow(id);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return null;
}
