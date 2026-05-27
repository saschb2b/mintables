"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { Bookmark, FolderOpen, Home, type LucideIcon } from "lucide-react";
import type { ExplorerSidebarSection } from "@mintables/shared/ui";

type SidebarId = "downloads" | "presets";

interface SidebarConfig {
  id: SidebarId;
  label: string;
  icon: LucideIcon;
  iconColor: string;
  href: string;
}

const FOLDERS: SidebarConfig[] = [
  {
    id: "downloads",
    label: "Downloads",
    icon: FolderOpen,
    iconColor: "#3b82f6",
    href: "/folders/downloads",
  },
  {
    id: "presets",
    label: "Presets",
    icon: Bookmark,
    iconColor: "#a855f7",
    href: "/folders/presets",
  },
];

/**
 * Finder-style left rail used by every folder window. The active folder is
 * highlighted; clicking another routes there, and Home returns to the desktop.
 */
export function useExplorerSidebar(active: SidebarId): ExplorerSidebarSection[] {
  const router = useRouter();
  return useMemo(
    () => [
      {
        label: "Favorites",
        items: [
          {
            id: "home",
            label: "Desktop",
            icon: Home,
            onClick: () => {
              router.push("/");
            },
          },
          ...FOLDERS.map((f) => ({
            id: f.id,
            label: f.label,
            icon: f.icon,
            iconColor: f.iconColor,
            active: f.id === active,
            onClick: () => {
              if (f.id !== active) router.push(f.href);
            },
          })),
        ],
      },
    ],
    [router, active],
  );
}
