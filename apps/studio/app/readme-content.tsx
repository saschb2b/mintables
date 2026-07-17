"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Coffee, ExternalLink, Sparkles } from "lucide-react";
import GitHubIcon from "@mui/icons-material/GitHub";
import { SITE_LINKS } from "@mintables/shared/lib";
import { SHOW_WELCOME_EVENT } from "./welcome-dialog";

/**
 * Body of the README.md system window (the desktop's About surface). Replaces
 * the old modal About dialog: same content, but as a real window with the
 * standard chrome, plus the license link that used to be its own desktop icon.
 */
export function ReadmeContent() {
  const handleShowTour = () => {
    window.dispatchEvent(new CustomEvent(SHOW_WELCOME_EVENT));
  };

  return (
    <Stack
      spacing={2.5}
      sx={{
        alignItems: "center",
        textAlign: "center",
        px: 2,
        py: 3,
        height: "100%",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(140deg, #7bbabd 0%, #5a9a9d 55%, #3c6e71 100%)",
          boxShadow: "0 14px 30px -12px rgba(90, 154, 157, 0.6)",
          color: "#fff",
        }}
      >
        <Sparkles size={28} />
      </Box>

      <Stack spacing={0.5}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, letterSpacing: "-0.01em" }}
        >
          Mintables
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            fontFamily: "var(--font-geist-mono), monospace",
            letterSpacing: 0.5,
          }}
        >
          v0.1.0 ·{" "}
          <Link
            href={`${SITE_LINKS.github}/blob/main/LICENSE`}
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
            sx={{ color: "inherit" }}
          >
            MIT License
          </Link>
        </Typography>
      </Stack>

      <Typography
        variant="body2"
        sx={{ color: "text.secondary", lineHeight: 1.6, maxWidth: 320 }}
      >
        Browser-based parametric generators for 3D-printable parts. Tune
        dimensions, watch the result update live, and export validated STL or
        3MF, all client-side. No accounts, no uploads.
      </Typography>

      <Stack
        direction="row"
        spacing={1}
        sx={{
          justifyContent: "center",
          width: "100%",
          pt: 1,
        }}
      >
        <Button
          component="a"
          href={SITE_LINKS.github}
          target="_blank"
          rel="noopener noreferrer"
          variant="outlined"
          size="small"
          startIcon={<GitHubIcon sx={{ fontSize: 14 }} />}
          endIcon={<ExternalLink size={11} />}
          sx={{ textTransform: "none", borderColor: "rgba(255,255,255,0.15)" }}
        >
          GitHub
        </Button>
        <Button
          component="a"
          href={SITE_LINKS.buyMeACoffee}
          target="_blank"
          rel="noopener noreferrer"
          variant="outlined"
          size="small"
          startIcon={<Coffee size={13} />}
          endIcon={<ExternalLink size={11} />}
          sx={{ textTransform: "none", borderColor: "rgba(255,255,255,0.15)" }}
        >
          Sponsor
        </Button>
      </Stack>

      <Box
        component="button"
        type="button"
        onClick={handleShowTour}
        sx={{
          all: "unset",
          cursor: "pointer",
          fontSize: "0.74rem",
          color: "text.secondary",
          textDecoration: "underline",
          textDecorationColor: "rgba(255,255,255,0.2)",
          textUnderlineOffset: 3,
          transition: "color 120ms ease, text-decoration-color 120ms ease",
          "&:hover": {
            color: "text.primary",
            textDecorationColor: "rgba(255,255,255,0.5)",
          },
          "&:focus-visible": {
            outline: "2px solid rgba(255,255,255,0.4)",
            outlineOffset: 2,
            borderRadius: 0.5,
          },
        }}
      >
        Take the tour again
      </Box>
    </Stack>
  );
}
