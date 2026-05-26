"use client";

import type { CSSProperties, ReactElement } from "react";
import NextLink from "next/link";
import {
  Box as BoxIcon,
  Coffee,
  Cylinder,
  Download,
  ExternalLink,
  Layers,
  Link2,
  Ruler,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import GitHubIcon from "@mui/icons-material/GitHub";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { SITE_LINKS } from "@mintables/shared/lib";

const GH = SITE_LINKS.github;

interface FooterLinkItem {
  label: string;
  href: string;
  external?: boolean;
  muted?: boolean;
}

const COLUMNS: { title: string; links: FooterLinkItem[] }[] = [
  {
    title: "Generators",
    links: [
      { label: "Tubes", href: "/generators/tubes" },
      { label: "Adapters", href: "/generators/adapters" },
      { label: "More coming soon", href: "/#generators", muted: true },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "GitHub", href: GH, external: true },
      { label: "Report an issue", href: `${GH}/issues`, external: true },
      { label: "License", href: `${GH}/blob/main/LICENSE`, external: true },
    ],
  },
  {
    title: "Project",
    links: [
      {
        label: "Contributing",
        href: `${GH}/blob/main/CONTRIBUTING.md`,
        external: true,
      },
      { label: "Sponsor", href: SITE_LINKS.buyMeACoffee, external: true },
    ],
  },
];

interface FloatChipProps {
  icon: LucideIcon;
  pos: CSSProperties;
  color: string;
  rotate?: number;
  bobDuration?: number;
  bobDelay?: number;
}

/** Small glassy icon tile that tilts statically + bobs gently. */
function FloatChip({
  icon: Icon,
  pos,
  color,
  rotate = 0,
  bobDuration = 5,
  bobDelay = 0,
}: FloatChipProps) {
  return (
    <Box sx={{ position: "absolute", ...pos }} aria-hidden>
      <Box sx={{ transform: `rotate(${String(rotate)}deg)` }}>
        <Box
          sx={{
            animation: `widget-bob ${String(bobDuration)}s ease-in-out infinite`,
            animationDelay: `${String(bobDelay)}s`,
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 1.75,
              bgcolor: "rgba(44, 44, 44, 0.55)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              boxShadow:
                "0 16px 36px -12px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.02)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon size={18} color={color} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: FooterLinkItem[];
}): ReactElement {
  return (
    <Stack spacing={1.75}>
      <Typography
        sx={{
          fontSize: "0.7rem",
          letterSpacing: 1.4,
          textTransform: "uppercase",
          fontWeight: 700,
          color: "text.secondary",
        }}
      >
        {title}
      </Typography>
      <Stack spacing={1}>
        {links.map((link) => {
          const isExternal = link.external ?? false;
          return (
            <Box
              key={link.label}
              component={isExternal ? "a" : NextLink}
              href={link.href}
              {...(isExternal
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                fontSize: "0.9rem",
                color: link.muted ? "text.secondary" : "text.primary",
                opacity: link.muted ? 0.55 : 0.85,
                textDecoration: "none",
                width: "fit-content",
                transition: "color 0.15s, opacity 0.15s",
                "&:hover": {
                  color: "primary.main",
                  opacity: 1,
                },
              }}
            >
              {link.label}
              {isExternal && (
                <ExternalLink size={11} style={{ opacity: 0.5 }} />
              )}
            </Box>
          );
        })}
      </Stack>
    </Stack>
  );
}

export function LandingFooter() {
  return (
    <Box
      component="footer"
      sx={{
        position: "relative",
        mt: { xs: 6, md: 10 },
        pt: { xs: 6, md: 10 },
        borderTop: "1px solid rgba(255, 255, 255, 0.06)",
        overflow: "hidden",
      }}
    >
      {/* Subtle gradient accent line at the very top of the footer */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: -1,
          left: "20%",
          right: "20%",
          height: 1,
          background:
            "linear-gradient(90deg, transparent 0%, rgba(168, 85, 247, 0.5) 50%, transparent 100%)",
          pointerEvents: "none",
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative" }}>
        <Stack spacing={{ xs: 6, md: 8 }}>
          {/* Brand column + link columns */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
                md: "1.6fr 1fr 1fr 1fr",
              },
              gap: { xs: 4, md: 6 },
            }}
          >
            <Stack spacing={2}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1.5,
                    background: "linear-gradient(135deg, #5a9a9d, #a855f7)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 8px 24px -8px rgba(168, 85, 247, 0.55)",
                  }}
                >
                  <Sparkles size={18} color="#fff" />
                </Box>
                <Typography
                  variant="h5"
                  fontWeight={800}
                  sx={{ letterSpacing: "-0.02em" }}
                >
                  Mintables
                </Typography>
              </Stack>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ maxWidth: 320, lineHeight: 1.65 }}
              >
                Browser-based parametric generators for 3D-printable parts.
                Free, open source, no accounts.
              </Typography>
              <Stack direction="row" spacing={0.75} sx={{ pt: 0.5 }}>
                <Tooltip title="GitHub">
                  <IconButton
                    component="a"
                    href={SITE_LINKS.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="small"
                    aria-label="GitHub"
                    sx={{
                      width: 36,
                      height: 36,
                      bgcolor: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      color: "text.secondary",
                      transition: "color 0.2s, background 0.2s, border-color 0.2s",
                      "&:hover": {
                        color: "text.primary",
                        bgcolor: "rgba(255, 255, 255, 0.06)",
                        borderColor: "rgba(255, 255, 255, 0.16)",
                      },
                    }}
                  >
                    <GitHubIcon sx={{ fontSize: 17 }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Buy me a coffee">
                  <IconButton
                    component="a"
                    href={SITE_LINKS.buyMeACoffee}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="small"
                    aria-label="Buy me a coffee"
                    sx={{
                      width: 36,
                      height: 36,
                      bgcolor: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      color: "text.secondary",
                      transition: "color 0.2s, background 0.2s, border-color 0.2s",
                      "&:hover": {
                        color: "#ffdd00",
                        bgcolor: "rgba(255, 221, 0, 0.06)",
                        borderColor: "rgba(255, 221, 0, 0.25)",
                      },
                    }}
                  >
                    <Coffee size={16} />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>

            {COLUMNS.map((col) => (
              <FooterColumn key={col.title} {...col} />
            ))}
          </Box>

          {/* Floating icon constellation (decorative, desktop only) */}
          <Box
            sx={{
              position: "relative",
              height: 110,
              display: { xs: "none", md: "block" },
            }}
          >
            <FloatChip
              icon={Cylinder}
              color="#5a9a9d"
              pos={{ left: "5%", top: "15%" }}
              rotate={-8}
              bobDuration={4.5}
              bobDelay={0}
            />
            <FloatChip
              icon={Link2}
              color="#a855f7"
              pos={{ left: "20%", top: "55%" }}
              rotate={6}
              bobDuration={5.5}
              bobDelay={0.8}
            />
            <FloatChip
              icon={Layers}
              color="#ec4899"
              pos={{ left: "36%", top: "20%" }}
              rotate={-4}
              bobDuration={5}
              bobDelay={1.6}
            />
            <FloatChip
              icon={BoxIcon}
              color="#5a9a9d"
              pos={{ left: "52%", top: "55%" }}
              rotate={5}
              bobDuration={4.8}
              bobDelay={2.4}
            />
            <FloatChip
              icon={Ruler}
              color="#a855f7"
              pos={{ left: "70%", top: "18%" }}
              rotate={-5}
              bobDuration={5.2}
              bobDelay={0.4}
            />
            <FloatChip
              icon={Download}
              color="#ec4899"
              pos={{ left: "86%", top: "50%" }}
              rotate={4}
              bobDuration={5}
              bobDelay={1.2}
            />
          </Box>

          {/* Bottom bar */}
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={{ xs: 1.5, md: 2 }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            sx={{
              pt: 3,
              borderTop: "1px solid rgba(255, 255, 255, 0.06)",
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: "0.78rem" }}
            >
              © 2026 Mintables · MIT License
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box
                aria-hidden
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: "#22c55e",
                  boxShadow: "0 0 0 0 rgba(34, 197, 94, 0.5)",
                  animation: "status-pulse 2.2s ease-out infinite",
                }}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: "0.78rem" }}
              >
                Open source · No accounts · Runs in your browser
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </Container>

      {/* Giant low-opacity wordmark watermark */}
      <Box
        aria-hidden
        sx={{
          position: "relative",
          textAlign: "center",
          letterSpacing: "0.06em",
          fontWeight: 900,
          fontSize: { xs: "3.5rem", sm: "5.5rem", md: "8.5rem", lg: "11.5rem" },
          lineHeight: 0.85,
          mt: { xs: 4, md: 6 },
          mb: { xs: -2, md: -3 },
          background:
            "linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.005) 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          color: "transparent",
          userSelect: "none",
          pointerEvents: "none",
        }}
      >
        MINTABLES
      </Box>

      <style>{`
        @keyframes status-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.55); }
          50% { box-shadow: 0 0 0 8px rgba(34, 197, 94, 0); }
        }
      `}</style>
    </Box>
  );
}
