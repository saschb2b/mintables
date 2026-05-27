"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  AppWindow,
  type AppWindowWorkArea,
} from "@mintables/shared/ui";
import {
  FOLDER_META,
  useWindowManager,
  type OpenWindow,
  type WindowPayload,
} from "@mintables/shared/lib";
import { GeneratorShell } from "@mintables/shared/shell";
import { findGenerator } from "@/lib/registry";
import { DownloadsContent } from "./folders/downloads/downloads-content";
import { PresetsContent } from "./folders/presets/presets-content";

/** Header height in providers.tsx, keep in sync. */
const HEADER_H = 30;
/** Reserved bottom space for the floating dock + some breathing room. */
const DOCK_RESERVE = 96;

/**
 * Renders every WM-tracked window as an absolutely-positioned <AppWindow>
 * over the wallpaper layer. Also keeps the URL in sync with the focused
 * window so direct links and back/forward still work.
 */
export function WindowLayer() {
  const {
    state,
    focusedWindow,
    closeWindow,
    focusWindow,
    minimizeWindow,
    toggleMaximize,
    moveWindow,
    setBounds,
  } = useWindowManager();

  const workArea = useWorkArea();
  useFocusUrlSync(focusedWindow);

  return (
    <>
      {state.windows.map((win) => {
        const chrome = chromeFor(win.payload);
        if (!chrome) return null;
        const body = bodyFor(win.payload);
        if (!body) return null;
        return (
          <AppWindow
            key={win.id}
            windowId={win.id}
            icon={chrome.icon}
            title={chrome.title}
            subtitle={chrome.subtitle}
            accent={chrome.accent}
            bounds={{ x: win.x, y: win.y, w: win.w, h: win.h }}
            state={win.state}
            focused={focusedWindow?.id === win.id}
            zIndex={win.z}
            workArea={workArea}
            onClose={() => {
              closeWindow(win.id);
            }}
            onMinimize={() => {
              minimizeWindow(win.id);
            }}
            onToggleMaximize={() => {
              toggleMaximize(win.id);
            }}
            onFocus={() => {
              if (focusedWindow?.id !== win.id) focusWindow(win.id);
            }}
            onMove={(x, y) => {
              moveWindow(win.id, x, y);
            }}
            onMoveCommit={(x, y) => {
              setBounds(win.id, x, y, win.w, win.h);
            }}
          >
            {body}
          </AppWindow>
        );
      })}
    </>
  );
}

interface ChromeMeta {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  accent: string;
}

function chromeFor(payload: WindowPayload): ChromeMeta | null {
  if (payload.kind === "generator") {
    const gen = findGenerator(payload.generatorId);
    if (!gen) return null;
    return {
      title: gen.meta.name,
      subtitle: gen.meta.tagline,
      icon: gen.meta.icon,
      accent: gen.meta.accent,
    };
  }
  const meta = FOLDER_META[payload.folderId];
  return meta;
}

function bodyFor(payload: WindowPayload) {
  if (payload.kind === "generator") {
    const gen = findGenerator(payload.generatorId);
    if (!gen) return null;
    return <GeneratorShell generator={gen} />;
  }
  if (payload.folderId === "downloads") return <DownloadsContent />;
  return <PresetsContent />;
}

/** Live work-area rectangle. Top respects the menu bar, bottom the dock. */
function useWorkArea(): AppWindowWorkArea {
  const [size, setSize] = useState({ w: 1280, h: 800 });
  useEffect(() => {
    const sync = () => {
      setSize({ w: window.innerWidth, h: window.innerHeight });
    };
    sync();
    window.addEventListener("resize", sync);
    return () => {
      window.removeEventListener("resize", sync);
    };
  }, []);
  return useMemo<AppWindowWorkArea>(
    () => ({
      top: HEADER_H,
      left: 0,
      right: size.w,
      bottom: size.h - DOCK_RESERVE,
    }),
    [size.w, size.h],
  );
}

/**
 * Keep the URL pinned to whatever window is on top. When no window is open,
 * we point at `/`. The route shims fire `openWindow` on their own mount, so
 * navigating via Link or a typed URL still produces the right WM state.
 *
 * IMPORTANT: this effect only runs when the focused window's target path
 * actually changes, not when pathname changes. Reason: when the user
 * navigates from /generators/tubes to /folders/downloads, pathname updates
 * before the new route's shim has a chance to dispatch its openWindow
 * effect. If we also reacted to pathname, we'd see the new pathname but
 * still-stale focused window and replace right back to the old URL,
 * stealing focus from the just-opened window. Reading pathname through a
 * ref lets us check "did we already match?" without depending on it.
 */
function useFocusUrlSync(focusedWindow: OpenWindow | null) {
  const router = useRouter();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  const target = focusedWindow ? pathForPayload(focusedWindow.payload) : "/";
  useEffect(() => {
    if (target !== pathnameRef.current) router.replace(target);
  }, [target, router]);
}

function pathForPayload(payload: WindowPayload): string {
  if (payload.kind === "generator") return `/generators/${payload.generatorId}`;
  return `/folders/${payload.folderId}`;
}
