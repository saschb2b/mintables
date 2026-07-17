"use client";

import { Bookmark, FileText, FolderOpen } from "lucide-react";
import { registerSystemWindow } from "@react-ui-os/desktop";
import { hasAnyPresets, hasDownloads } from "@mintables/shared/lib";
import { DownloadsContent } from "@/app/folders/downloads/downloads-content";
import { PresetsContent } from "@/app/folders/presets/presets-content";
import { ReadmeContent } from "@/app/readme-content";

/**
 * Mintables' system windows in the react-ui-os registry. Imported for its
 * side effects once, from providers.tsx, before the Desktop mounts.
 *
 * Downloads and Presets follow the library's "state-earned" desktop-icon
 * pattern: the folder icon appears the moment the first item exists and
 * disappears when the last one is deleted. The predicates read Mintables'
 * own storage (not the library adapter); a bridge in desktop-companions.tsx
 * pokes the adapter whenever Mintables storage changes so the icons
 * re-evaluate at the right moments.
 */

registerSystemWindow("downloads", {
  name: "Downloads",
  tagline: "Recently exported parts",
  accent: "#3b82f6",
  defaultBounds: { w: 900, h: 560 },
  content: DownloadsContent,
  icon: FolderOpen,
  appearsAsDesktopIcon: () => hasDownloads(),
});

registerSystemWindow("presets", {
  name: "Presets",
  tagline: "Saved configurations across generators",
  accent: "#a855f7",
  defaultBounds: { w: 900, h: 560 },
  content: PresetsContent,
  icon: Bookmark,
  appearsAsDesktopIcon: () => hasAnyPresets(),
});

registerSystemWindow("readme", {
  name: "README.md",
  tagline: "About Mintables",
  accent: "#5a9a9d",
  defaultBounds: { w: 460, h: 560 },
  content: ReadmeContent,
  icon: FileText,
  appearsAsDesktopIcon: true,
  desktopIcon: ReadmeFileIcon,
});

/**
 * Document-page desktop icon for README.md: white page with a folded corner,
 * a teal accent strip, and text lines. Reads as "a file on the desktop",
 * distinct from the folder icons.
 */
function ReadmeFileIcon({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden
      style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.35))" }}
    >
      {/* page with folded top-right corner */}
      <path
        d="M10 6a3 3 0 0 1 3-3h16l9 9v30a3 3 0 0 1-3 3H13a3 3 0 0 1-3-3V6Z"
        fill="url(#readme-page)"
      />
      <path d="M29 3l9 9h-7a2 2 0 0 1-2-2V3Z" fill="#c8cddd" />
      {/* accent strip */}
      <rect x="10" y="18" width="28" height="4" rx="1" fill="#5a9a9d" />
      {/* text lines */}
      <rect x="14" y="27" width="20" height="2.4" rx="1.2" fill="#9aa1b5" />
      <rect x="14" y="32" width="16" height="2.4" rx="1.2" fill="#b3b9ca" />
      <rect x="14" y="37" width="18" height="2.4" rx="1.2" fill="#b3b9ca" />
      <defs>
        <linearGradient
          id="readme-page"
          x1="24"
          y1="3"
          x2="24"
          y2="45"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#fbfcff" />
          <stop offset="1" stopColor="#e2e5ef" />
        </linearGradient>
      </defs>
    </svg>
  );
}
