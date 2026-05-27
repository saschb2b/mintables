"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { Coffee, ExternalLink, FileText, Scale } from "lucide-react";
import GitHubIcon from "@mui/icons-material/GitHub";
import { DesktopFolder, DesktopIcon } from "@mintables/shared/ui";
import {
  DOWNLOADS_CHANGED_EVENT,
  hasAnyPresets,
  hasDownloads,
  PRESETS_CHANGED_EVENT,
  SITE_LINKS,
} from "@mintables/shared/lib";
import { AboutDialog } from "./about-dialog";

/**
 * Always-on desktop surface mounted in providers so the file-style shortcuts
 * (and earned folders) stay reachable regardless of which app window is open.
 * Icons sit at z=1 - above wallpaper, below WM windows (which start at z=50)
 * so any open window naturally covers them and dragging it aside reveals them.
 */
export function Desktop() {
  const [aboutOpen, setAboutOpen] = useState(false);
  const downloadsExist = useStorageFlag(hasDownloads, DOWNLOADS_CHANGED_EVENT);
  const presetsExist = useStorageFlag(hasAnyPresets, PRESETS_CHANGED_EVENT);

  return (
    <>
      <Stack
        spacing={1}
        sx={{
          position: "absolute",
          top: { xs: 8, md: 12 },
          right: { xs: 10, md: 18 },
          zIndex: 1,
          alignItems: "center",
          opacity: 0,
          animation:
            "desktop-icons-in 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) 200ms forwards",
          "@keyframes desktop-icons-in": {
            to: { opacity: 1 },
          },
        }}
      >
        {downloadsExist && (
          <DesktopFolder
            href="/folders/downloads"
            label="Downloads"
            accent="#3b82f6"
          />
        )}
        {presetsExist && (
          <DesktopFolder
            href="/folders/presets"
            label="Presets"
            accent="#a855f7"
          />
        )}

        {(downloadsExist || presetsExist) && (
          <Box
            aria-hidden
            sx={{
              width: 56,
              height: "1px",
              my: 0.75,
              bgcolor: "rgba(255, 255, 255, 0.12)",
            }}
          />
        )}

        <DesktopIcon
          icon={FileText}
          label="README.md"
          onClick={() => {
            setAboutOpen(true);
          }}
        />
        <DesktopIcon
          icon={Scale}
          label="LICENSE.txt"
          href={`${SITE_LINKS.github}/blob/main/LICENSE`}
          external
          badge={ExternalLinkBadge}
        />
        <DesktopIcon
          icon={GitHubIconAdapter}
          label="GitHub.url"
          href={SITE_LINKS.github}
          external
          badge={ExternalLinkBadge}
        />
        <DesktopIcon
          icon={Coffee}
          label="Sponsor.url"
          href={SITE_LINKS.buyMeACoffee}
          external
          badge={ExternalLinkBadge}
        />
      </Stack>

      <AboutDialog
        open={aboutOpen}
        onClose={() => {
          setAboutOpen(false);
        }}
      />
    </>
  );
}

/**
 * Subscribe to a storage-backed boolean flag. Re-reads via `read` on mount
 * and whenever the named custom event fires (or a cross-tab `storage` event
 * lands). Returns the current value.
 */
function useStorageFlag(read: () => boolean, changeEvent: string): boolean {
  const [value, setValue] = useState(false);
  useEffect(() => {
    const sync = () => {
      setValue(read());
    };
    sync();
    window.addEventListener(changeEvent, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(changeEvent, sync);
      window.removeEventListener("storage", sync);
    };
  }, [read, changeEvent]);
  return value;
}

function GitHubIconAdapter({ size = 24 }: { size?: number }) {
  return <GitHubIcon sx={{ fontSize: size }} />;
}

function ExternalLinkBadge({ size = 10 }: { size?: number }) {
  return <ExternalLink size={size} />;
}
