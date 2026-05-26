"use client";

import NextLink from "next/link";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import GitHubIcon from "@mui/icons-material/GitHub";
import { Coffee, Sparkles } from "lucide-react";
import type { AnyGenerator } from "../lib/generator";
import { SITE_LINKS } from "../lib/site-links";
import { AppSwitcher } from "./app-switcher";

interface AppHeaderProps {
  generators: AnyGenerator[];
  /** Current generator id (when on a generator route). */
  currentId?: string;
}

export function AppHeader({ generators, currentId }: AppHeaderProps) {
  const current = generators.find((g) => g.id === currentId);
  const CurrentIcon = current?.meta.icon ?? Sparkles;
  const title = current?.meta.name ?? "Mintables";
  const subtitle =
    current?.meta.tagline ?? "3D printable generators for makers";

  return (
    <Box
      component="header"
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: 2,
        py: 1.5,
        borderBottom: 1,
        borderColor: "rgba(255, 255, 255, 0.06)",
        bgcolor: "rgba(28, 28, 32, 0.55)",
        backdropFilter: "blur(20px) saturate(140%)",
        WebkitBackdropFilter: "blur(20px) saturate(140%)",
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <AppSwitcher generators={generators} currentId={currentId} />
        <Box
          component={NextLink}
          href="/"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <Box
            sx={{
              display: "flex",
              height: 32,
              width: 32,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 1.5,
              bgcolor: current ? "primary.main" : "transparent",
              border: current ? 0 : 1,
              borderColor: "divider",
              color: current ? "#fff" : "primary.main",
            }}
          >
            <CurrentIcon size={18} />
          </Box>
          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            <Typography variant="subtitle2" fontWeight={600} lineHeight={1.2}>
              {title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          </Box>
        </Box>
      </Stack>

      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ ml: "auto" }}>
        <Tooltip title="GitHub">
          <IconButton
            size="small"
            component="a"
            href={SITE_LINKS.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            sx={{ color: "text.secondary" }}
          >
            <GitHubIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Buy me a coffee">
          <IconButton
            size="small"
            component="a"
            href={SITE_LINKS.buyMeACoffee}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Buy me a coffee"
            sx={{ color: "text.secondary" }}
          >
            <Coffee size={16} />
          </IconButton>
        </Tooltip>
      </Stack>
    </Box>
  );
}
