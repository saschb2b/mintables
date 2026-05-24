"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ViewPreset = "iso" | "front" | "top" | "right";

export interface ViewRequest {
  preset: ViewPreset;
  nonce: number;
}

interface ViewportContextValue {
  viewRequest: ViewRequest | null;
  requestView: (preset: ViewPreset) => void;
}

const ViewportContext = createContext<ViewportContextValue | null>(null);

export function ViewportProvider({ children }: { children: ReactNode }) {
  const [viewRequest, setViewRequest] = useState<ViewRequest | null>(null);

  const requestView = useCallback((preset: ViewPreset) => {
    setViewRequest({ preset, nonce: Date.now() });
  }, []);

  const value = useMemo(
    () => ({ viewRequest, requestView }),
    [viewRequest, requestView],
  );

  return (
    <ViewportContext.Provider value={value}>{children}</ViewportContext.Provider>
  );
}

export function useViewport() {
  const ctx = useContext(ViewportContext);
  if (!ctx) {
    throw new Error("useViewport must be used within ViewportProvider");
  }
  return ctx;
}
