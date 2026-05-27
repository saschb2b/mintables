"use client";

import { useEffect } from "react";
import { useWindowManager } from "@mintables/shared/lib";

/**
 * Route shim for `/folders/presets`. The Presets window itself is rendered
 * by `<WindowLayer>` over the desktop; this just asks the WM to open /
 * focus it.
 */
export function PresetsWindow() {
  const { openWindow } = useWindowManager();
  useEffect(() => {
    openWindow({ kind: "folder", folderId: "presets" });
  }, [openWindow]);
  return null;
}
