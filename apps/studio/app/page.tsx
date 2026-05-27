"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { Coffee, ExternalLink, FileText, Scale } from "lucide-react";
import GitHubIcon from "@mui/icons-material/GitHub";
import { DesktopIcon } from "@mintables/shared/ui";
import { SITE_LINKS } from "@mintables/shared/lib";
import { AboutDialog } from "./about-dialog";

/**
 * The desktop. Mostly empty wallpaper — like a real OS home screen. A
 * vertical column of "shortcut" file icons on the right handles secondary
 * navigation (about, license, external links). App launching lives in the
 * dock at the bottom.
 */
export default function HubPage() {
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Stack
        spacing={1}
        sx={{
          position: "absolute",
          top: { xs: 16, md: 24 },
          right: { xs: 12, md: 24 },
          zIndex: 2,
          opacity: 0,
          animation:
            "desktop-icons-in 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) 200ms forwards",
          "@keyframes desktop-icons-in": {
            to: { opacity: 1 },
          },
        }}
      >
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
    </Box>
  );
}

function GitHubIconAdapter({ size = 24 }: { size?: number }) {
  return <GitHubIcon sx={{ fontSize: size }} />;
}

function ExternalLinkBadge({ size = 10 }: { size?: number }) {
  return <ExternalLink size={size} />;
}
