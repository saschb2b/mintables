"use client";

import { useEffect } from "react";
import { useWindowManager } from "@mintables/shared/lib";

/**
 * Route shim: opening (or revisiting) `/generators/<id>` boils down to a WM
 * dispatch. The actual window is rendered by `<WindowLayer>` over the
 * desktop. The parent server `page.tsx` already calls `notFound()` for
 * unknown slugs, so the id is trustable here.
 */
export function GeneratorPageView({ slug }: { slug: string }) {
  const { openWindow } = useWindowManager();
  useEffect(() => {
    openWindow({ kind: "generator", generatorId: slug });
  }, [slug, openWindow]);
  return null;
}
