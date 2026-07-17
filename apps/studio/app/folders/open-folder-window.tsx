"use client";

import { useEffect, useRef } from "react";
import {
  nextCascadeIndex,
  pickInitialBounds,
  useApps,
  useTheme,
} from "@react-ui-os/desktop";
import { useWindowManager } from "@react-ui-os/core";

/**
 * Shared route shim for `/folders/<id>`: asks the react-ui-os window
 * manager to open / focus the matching system window. The window itself is
 * rendered by the library's WindowLayer.
 */
export function OpenFolderWindow({
  folderId,
}: {
  folderId: "downloads" | "presets";
}) {
  const wm = useWindowManager();
  const theme = useTheme();
  const apps = useApps();

  const ctxRef = useRef({ wm, theme, apps });
  useEffect(() => {
    ctxRef.current = { wm, theme, apps };
  });

  useEffect(() => {
    const { wm, theme, apps } = ctxRef.current;
    const payload = { kind: "system", systemId: folderId } as const;
    wm.openWindow(
      payload,
      pickInitialBounds(
        payload,
        theme,
        apps,
        undefined,
        nextCascadeIndex(wm.state),
      ),
    );
  }, [folderId]);

  return null;
}
