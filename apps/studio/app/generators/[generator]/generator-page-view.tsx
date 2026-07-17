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
 * Route shim: opening (or revisiting) `/generators/<id>` boils down to a WM
 * dispatch. The actual window is rendered by the react-ui-os WindowLayer.
 * The parent server `page.tsx` already calls `notFound()` for unknown
 * slugs, so the id is trustable here.
 *
 * Bounds inputs (theme / apps / WM state) flow through a ref so the effect
 * re-runs only when the slug changes; depending on WM state directly would
 * re-dispatch openWindow (and steal focus) on every window interaction.
 */
export function GeneratorPageView({ slug }: { slug: string }) {
  const wm = useWindowManager();
  const theme = useTheme();
  const apps = useApps();

  const ctxRef = useRef({ wm, theme, apps });
  useEffect(() => {
    ctxRef.current = { wm, theme, apps };
  });

  useEffect(() => {
    const { wm, theme, apps } = ctxRef.current;
    const payload = { kind: "app", appId: slug } as const;
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
  }, [slug]);

  return null;
}
