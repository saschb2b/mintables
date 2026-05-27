"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ViewPreset = "iso" | "front" | "top" | "right";

export interface ViewRequest {
  preset: ViewPreset;
  nonce: number;
}

/** Window-level event that the info-bar buttons fire to nudge a specific
 *  generator window's camera to a preset. Each ViewportProvider listens
 *  for it and filters by `generatorId`. */
export const VIEW_PRESET_EVENT = "mintables:view-preset";

interface ViewPresetEventDetail {
  generatorId: string;
  preset: ViewPreset;
}

interface ViewportContextValue {
  viewRequest: ViewRequest | null;
}

const ViewportContext = createContext<ViewportContextValue | null>(null);

/**
 * Scoped per-window viewport listener mounted INSIDE drei's `<View>` in
 * PreviewPanel. The view-preset buttons that drive this provider live in
 * the info bar - OUTSIDE the View - which means they can't share context
 * with PreviewSceneRig (drei's View renders children via an R3F portal
 * that does not bridge React context from the outer tree). Instead the
 * buttons dispatch a window-level event with a generatorId tag, and each
 * provider here picks up only the events meant for its window.
 */
export function ViewportProvider({
  generatorId,
  children,
}: {
  generatorId: string;
  children: ReactNode;
}) {
  const [viewRequest, setViewRequest] = useState<ViewRequest | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<ViewPresetEventDetail>;
      if (ce.detail.generatorId !== generatorId) return;
      setViewRequest({ preset: ce.detail.preset, nonce: Date.now() });
    };
    window.addEventListener(VIEW_PRESET_EVENT, handler);
    return () => {
      window.removeEventListener(VIEW_PRESET_EVENT, handler);
    };
  }, [generatorId]);

  const value = useMemo<ViewportContextValue>(
    () => ({ viewRequest }),
    [viewRequest],
  );

  return (
    <ViewportContext.Provider value={value}>
      {children}
    </ViewportContext.Provider>
  );
}

export function useViewport(): ViewportContextValue {
  const ctx = useContext(ViewportContext);
  if (!ctx) {
    throw new Error("useViewport must be used within ViewportProvider");
  }
  return ctx;
}

/**
 * Ask the named generator window's camera to switch to a preset. Fires the
 * shared window event; the matching window's ViewportProvider picks it up
 * and pushes a viewRequest through context to its PreviewSceneRig.
 */
export function requestView(generatorId: string, preset: ViewPreset): void {
  if (typeof window === "undefined") return;
  const detail: ViewPresetEventDetail = { generatorId, preset };
  window.dispatchEvent(new CustomEvent(VIEW_PRESET_EVENT, { detail }));
}
