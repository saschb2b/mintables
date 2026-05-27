"use client";

import { useEffect } from "react";
import { useWindowManager } from "@mintables/shared/lib";

/**
 * Route shim for `/folders/downloads`. The Downloads window itself is
 * rendered by `<WindowLayer>` over the desktop; this just asks the WM to
 * open / focus it.
 */
export function DownloadsWindow() {
  const { openWindow } = useWindowManager();
  useEffect(() => {
    openWindow({ kind: "folder", folderId: "downloads" });
  }, [openWindow]);
  return null;
}
