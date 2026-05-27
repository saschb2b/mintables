import { Bookmark, FolderOpen, type LucideIcon } from "lucide-react";
import type { FolderId } from "./window-manager";

export interface FolderMeta {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  accent: string;
}

/**
 * Single source of truth for the system folders Mintables exposes. Read by
 * both the WindowLayer (window chrome) and the AppDock (folder tiles that
 * appear when their corresponding window is open). Adding a new folder
 * means: add an entry here, register its `FolderId` in window-manager,
 * and add a route + content component for it.
 */
export const FOLDER_META: Record<FolderId, FolderMeta> = {
  downloads: {
    title: "Downloads",
    subtitle: "Recently exported parts",
    icon: FolderOpen,
    accent: "#3b82f6",
  },
  presets: {
    title: "Presets",
    subtitle: "Saved configurations across generators",
    icon: Bookmark,
    accent: "#a855f7",
  },
};

export function folderPath(folderId: FolderId): string {
  return `/folders/${folderId}`;
}
