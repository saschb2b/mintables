"use client";

import { useMemo } from "react";
import { Bookmark, FolderOpen } from "lucide-react";
import {
  pickInitialBounds,
  nextCascadeIndex,
  useApps,
  useTheme,
  type ExplorerSidebarSection,
} from "@react-ui-os/desktop";
import { useWindowManager } from "@react-ui-os/core";

type SidebarId = "downloads" | "presets";

const FOLDERS = [
  {
    id: "downloads" as const,
    label: "Downloads",
    icon: <FolderOpen size={15} />,
    iconColor: "#3b82f6",
  },
  {
    id: "presets" as const,
    label: "Presets",
    icon: <Bookmark size={15} />,
    iconColor: "#a855f7",
  },
];

/**
 * Finder-style Favorites rail shared by both folder windows. The active
 * folder is highlighted; clicking the other one opens (or focuses) its
 * window, macOS-style: folders are windows, not in-window navigation.
 */
export function useExplorerSidebar(
  active: SidebarId,
): ExplorerSidebarSection[] {
  const { state, openWindow } = useWindowManager();
  const theme = useTheme();
  const apps = useApps();

  return useMemo(
    () => [
      {
        label: "Favorites",
        items: FOLDERS.map((f) => ({
          id: f.id,
          label: f.label,
          icon: f.icon,
          iconColor: f.iconColor,
          active: f.id === active,
          onClick: () => {
            if (f.id === active) return;
            const payload = { kind: "system", systemId: f.id } as const;
            openWindow(
              payload,
              pickInitialBounds(
                payload,
                theme,
                apps,
                undefined,
                nextCascadeIndex(state),
              ),
            );
          },
        })),
      },
    ],
    [active, openWindow, theme, apps, state],
  );
}
