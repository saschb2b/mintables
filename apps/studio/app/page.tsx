"use client";

import type { CSSProperties, ReactNode } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {
  ArrowDown,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  Download,
  Sliders,
  Sparkles,
} from "lucide-react";
import GitHubIcon from "@mui/icons-material/GitHub";
import { GeneratorGrid, GeneratorHero } from "@mintables/shared/ui";
import { SITE_LINKS } from "@mintables/shared/lib";
import { generators } from "@/lib/registry";
import { CascadingText } from "./cascading-text";
import { LandingFooter } from "./landing-footer";

const HEADLINE_LINE_1 = "Custom parts.";
const HEADLINE_LINE_2 = "Without CAD.";
const LINE_2_DELAY = 150 + HEADLINE_LINE_1.length * 30;

interface FloatingProps {
  children: ReactNode;
  pos: CSSProperties;
  rotate?: number;
  bobDuration?: number;
  bobDelay?: number;
  appearDelay?: number;
  width?: number;
}

/** Glassy card that fades + scales in, then bobs gently with a static tilt. */
function Floating({
  children,
  pos,
  rotate = 0,
  bobDuration = 5,
  bobDelay = 0,
  appearDelay = 0,
  width = 230,
}: FloatingProps) {
  return (
    <Box
      sx={{
        position: "absolute",
        width,
        zIndex: 2,
        opacity: 0,
        animation: "widget-appear 0.85s cubic-bezier(0.2, 0.8, 0.2, 1) forwards",
        animationDelay: `${String(appearDelay)}ms`,
        ...pos,
      }}
    >
      <Box sx={{ transform: `rotate(${String(rotate)}deg)` }}>
        <Box
          sx={{
            animation: `widget-bob ${String(bobDuration)}s ease-in-out infinite`,
            animationDelay: `${String(bobDelay)}s`,
          }}
        >
          <Box
            sx={{
              bgcolor: "rgba(44, 44, 44, 0.55)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: 2.5,
              boxShadow:
                "0 24px 60px -20px rgba(0, 0, 0, 0.7), inset 0 0 0 1px rgba(255, 255, 255, 0.02)",
              p: 1.75,
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function PillLabel({ icon: Icon, color, label }: { icon: typeof Bookmark; color: string; label: string }) {
  return (
    <Box
      sx={{
        bgcolor: `${color}2e`,
        width: 36,
        height: 36,
        borderRadius: 1.5,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Icon size={16} color={color} aria-label={label} />
    </Box>
  );
}

function GradientHeadlinePart({ children }: { children: ReactNode }) {
  return (
    <Box
      component="span"
      sx={{
        display: "inline-block",
        backgroundImage:
          "linear-gradient(90deg, #5a9a9d 0%, #a855f7 40%, #ec4899 70%, #5a9a9d 100%)",
        backgroundSize: "300% 100%",
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        color: "transparent",
        WebkitTextFillColor: "transparent",
        animation: "gradient-shift 9s ease-in-out infinite",
      }}
    >
      {children}
    </Box>
  );
}

interface Step {
  num: string;
  title: string;
  description: string;
  icon: typeof Bookmark;
  /** Solid accent for icon gradient, hover border, hover glow. */
  color: string;
  /** Darker partner color for the icon's gradient end. */
  colorDeep: string;
}

const STEPS: Step[] = [
  {
    num: "01",
    title: "Pick a generator",
    description:
      "Tubes, adapters, dividers — open the one that matches the part you need.",
    icon: Sparkles,
    color: "#5a9a9d",
    colorDeep: "#3c6e71",
  },
  {
    num: "02",
    title: "Tune the dimensions",
    description:
      "Sliders, numeric inputs, and presets. Inline validation catches anything that won't print.",
    icon: Sliders,
    color: "#a855f7",
    colorDeep: "#7c3aed",
  },
  {
    num: "03",
    title: "Export and print",
    description:
      "Watertight STL or 3MF with millimeter units preserved. Drop it straight into your slicer.",
    icon: Download,
    color: "#ec4899",
    colorDeep: "#be185d",
  },
];

export default function HubPage() {
  return (
    <Box
      sx={{
        flex: 1,
        overflow: "auto",
        position: "relative",
      }}
    >
      {/* Single atmospheric layer — pinned to viewport so the colors flow
          across every section without hard cutoffs at boundaries. */}
      <Box
        aria-hidden
        sx={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          backgroundImage: `
            radial-gradient(ellipse 70% 50% at 18% 22%, rgba(90, 154, 157, 0.34) 0%, transparent 60%),
            radial-gradient(ellipse 65% 50% at 82% 18%, rgba(168, 85, 247, 0.32) 0%, transparent 60%),
            radial-gradient(ellipse 80% 50% at 50% 78%, rgba(236, 72, 153, 0.22) 0%, transparent 62%),
            radial-gradient(ellipse 60% 40% at 22% 88%, rgba(90, 154, 157, 0.18) 0%, transparent 60%)
          `,
        }}
      />

      {/* All sections sit on a relative z=1 shell so the fixed atmospheric
          layer paints behind them (positioned z=0 would otherwise paint over
          static in-flow siblings per CSS painting order rules). */}
      <Box sx={{ position: "relative", zIndex: 1 }}>
      {/* ─── HERO ─────────────────────────────────────────────────────── */}
      <Box
        sx={{
          position: "relative",
          pt: { xs: 4, md: 6 },
          pb: { xs: 6, md: 10 },
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
            maskImage:
              "radial-gradient(ellipse at center, black 30%, transparent 80%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at center, black 30%, transparent 80%)",
            pointerEvents: "none",
            zIndex: 0,
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          {/* 3D scene + floating widgets */}
          <Box
            sx={{
              position: "relative",
              height: { xs: 320, md: 480 },
              mb: { xs: 4, md: 6 },
            }}
          >
            {/* Centered 3D */}
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1,
              }}
            >
              <Box
                sx={{
                  width: { xs: "92%", md: "60%" },
                  height: "100%",
                  maxWidth: 560,
                }}
              >
                <GeneratorHero generators={generators} height="100%" />
              </Box>
            </Box>

            {/* Floating widgets — desktop only */}
            <Box sx={{ display: { xs: "none", md: "block" } }}>
              {/* Top left: Preset */}
              <Floating
                pos={{ top: "6%", left: "0%" }}
                rotate={-4}
                bobDuration={5.5}
                bobDelay={0}
                appearDelay={700}
                width={230}
              >
                <Stack direction="row" spacing={1.25} alignItems="center">
                  <PillLabel icon={Bookmark} color="#a855f7" label="Preset" />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontSize: "0.65rem",
                        letterSpacing: 1.2,
                        textTransform: "uppercase",
                        color: "text.secondary",
                        lineHeight: 1.4,
                      }}
                    >
                      Saved preset
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      Round tube · 50 mm ⌀
                    </Typography>
                  </Box>
                </Stack>
              </Floating>

              {/* Top right: Validation */}
              <Floating
                pos={{ top: "3%", right: "0%" }}
                rotate={3}
                bobDuration={4.5}
                bobDelay={1.2}
                appearDelay={1000}
                width={240}
              >
                <Stack direction="row" spacing={1.25} alignItems="center">
                  <PillLabel icon={CheckCircle2} color="#22c55e" label="Validated" />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontSize: "0.65rem",
                        letterSpacing: 1.2,
                        textTransform: "uppercase",
                        color: "#22c55e",
                        fontWeight: 600,
                        lineHeight: 1.4,
                      }}
                    >
                      Validated
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      Wall 2.00 mm · watertight
                    </Typography>
                  </Box>
                </Stack>
              </Floating>

              {/* Bottom left: Recent designs */}
              <Floating
                pos={{ bottom: "4%", left: "1%" }}
                rotate={-2}
                bobDuration={6}
                bobDelay={2.4}
                appearDelay={1300}
                width={220}
              >
                <Stack spacing={1}>
                  <Typography
                    sx={{
                      fontSize: "0.65rem",
                      letterSpacing: 1.2,
                      textTransform: "uppercase",
                      color: "text.secondary",
                    }}
                  >
                    Recent designs
                  </Typography>
                  <Stack spacing={0.5}>
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: "var(--font-geist-mono), monospace",
                        color: "primary.main",
                        fontSize: "0.72rem",
                      }}
                    >
                      tube · square · 80 mm
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: "var(--font-geist-mono), monospace",
                        color: "#a855f7",
                        fontSize: "0.72rem",
                      }}
                    >
                      adapter · 90° elbow
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: "var(--font-geist-mono), monospace",
                        color: "text.secondary",
                        fontSize: "0.72rem",
                      }}
                    >
                      tube · clamshell · 150 mm
                    </Typography>
                  </Stack>
                </Stack>
              </Floating>

              {/* Bottom right: Export */}
              <Floating
                pos={{ bottom: "8%", right: "0%" }}
                rotate={2.5}
                bobDuration={5}
                bobDelay={1.7}
                appearDelay={1500}
                width={210}
              >
                <Stack spacing={1}>
                  <Stack direction="row" alignItems="center" spacing={0.75}>
                    <Download size={14} color="#5a9a9d" />
                    <Typography
                      sx={{
                        fontSize: "0.65rem",
                        letterSpacing: 1.2,
                        textTransform: "uppercase",
                        color: "text.secondary",
                      }}
                    >
                      Export
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={0.75}>
                    <Chip
                      label="STL"
                      size="small"
                      sx={{
                        bgcolor: "rgba(90,154,157,0.25)",
                        color: "primary.main",
                        fontWeight: 700,
                        height: 22,
                        border: "1px solid rgba(90,154,157,0.4)",
                      }}
                    />
                    <Chip
                      label="3MF"
                      size="small"
                      sx={{
                        bgcolor: "transparent",
                        border: "1px solid rgba(255,255,255,0.12)",
                        color: "text.secondary",
                        height: 22,
                      }}
                    />
                  </Stack>
                </Stack>
              </Floating>
            </Box>
          </Box>

          {/* Title + CTA */}
          <Stack spacing={{ xs: 2.5, md: 3.5 }} alignItems="center" textAlign="center">
            <Typography
              component="h1"
              sx={{
                fontWeight: 800,
                fontSize: { xs: "2.5rem", sm: "3.75rem", md: "5.25rem" },
                lineHeight: 1,
                letterSpacing: "-0.035em",
                maxWidth: 920,
                m: 0,
              }}
            >
              <Box component="span" sx={{ display: "inline-block", color: "text.primary" }}>
                <CascadingText text={HEADLINE_LINE_1} delayMs={150} staggerMs={30} />
              </Box>{" "}
              <GradientHeadlinePart>
                <CascadingText
                  text={HEADLINE_LINE_2}
                  delayMs={LINE_2_DELAY}
                  staggerMs={30}
                />
              </GradientHeadlinePart>
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                maxWidth: 580,
                fontSize: { xs: "1rem", md: "1.18rem" },
                lineHeight: 1.6,
                opacity: 0,
                animation:
                  "hero-fade 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) 1500ms forwards",
              }}
            >
              Browser-based parametric generators for 3D printing. Dial in
              dimensions, watch the result update in real time, and export
              validated STL or 3MF.
            </Typography>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              sx={{
                opacity: 0,
                animation:
                  "hero-fade 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) 1750ms forwards",
              }}
            >
              <Button
                component="a"
                href="#generators"
                variant="contained"
                size="large"
                endIcon={<ArrowDown size={18} />}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "1rem",
                  px: 3.5,
                  py: 1.5,
                  borderRadius: 2,
                  boxShadow: "0 10px 30px -10px rgba(90, 154, 157, 0.6)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    boxShadow: "0 14px 38px -10px rgba(90, 154, 157, 0.85)",
                    transform: "translateY(-1px)",
                  },
                }}
              >
                Browse generators
              </Button>
              <Button
                component="a"
                href={SITE_LINKS.github}
                target="_blank"
                rel="noopener noreferrer"
                variant="outlined"
                size="large"
                startIcon={<GitHubIcon sx={{ fontSize: 18 }} />}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  px: 3,
                  py: 1.5,
                  borderRadius: 2,
                  borderColor: "rgba(255,255,255,0.15)",
                  color: "text.primary",
                  transition: "border-color 0.2s, background-color 0.2s",
                  "&:hover": {
                    borderColor: "rgba(255,255,255,0.3)",
                    bgcolor: "rgba(255,255,255,0.03)",
                  },
                }}
              >
                View on GitHub
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* ─── GENERATOR GRID ───────────────────────────────────────────── */}
      <Container
        id="generators"
        maxWidth="lg"
        sx={{ py: { xs: 5, md: 9 }, scrollMarginTop: 24 }}
      >
        <Stack spacing={4}>
          <Stack spacing={1.5} alignItems="center" textAlign="center">
            <Box
              sx={{
                px: 1.75,
                py: 0.5,
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 999,
                bgcolor: "rgba(255, 255, 255, 0.04)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ letterSpacing: 1.2, fontSize: "0.7rem" }}
              >
                Generators
              </Typography>
            </Box>
            <Typography
              variant="h4"
              fontWeight={700}
              sx={{
                fontSize: { xs: "1.8rem", md: "2.5rem" },
                letterSpacing: "-0.02em",
              }}
            >
              Pick your starting point
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ maxWidth: 560 }}
            >
              Each generator is a self-contained tool with its own controls,
              validation rules, and 3D preview. More on the way.
            </Typography>
          </Stack>
          <GeneratorGrid generators={generators} />
        </Stack>
      </Container>

      {/* ─── HOW IT WORKS ─────────────────────────────────────────────── */}
      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 9 } }}>
        <Stack spacing={4}>
          <Stack spacing={1.5} alignItems="center" textAlign="center">
            <Box
              sx={{
                px: 1.75,
                py: 0.5,
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 999,
                bgcolor: "rgba(255, 255, 255, 0.04)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ letterSpacing: 1.2, fontSize: "0.7rem" }}
              >
                How it works
              </Typography>
            </Box>
            <Typography
              variant="h4"
              fontWeight={700}
              sx={{
                fontSize: { xs: "1.8rem", md: "2.5rem" },
                letterSpacing: "-0.02em",
              }}
            >
              From idea to print in three steps
            </Typography>
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
              gap: 3,
            }}
          >
            {STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <Box
                  key={step.num}
                  sx={{
                    position: "relative",
                    p: 3,
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 3,
                    bgcolor: "rgba(255,255,255,0.025)",
                    overflow: "hidden",
                    transition:
                      "border-color 0.25s, transform 0.25s, background-color 0.25s, box-shadow 0.25s",
                    "&:hover": {
                      borderColor: `${step.color}80`,
                      transform: "translateY(-4px)",
                      bgcolor: `${step.color}10`,
                      boxShadow: `0 20px 50px -20px ${step.color}80`,
                    },
                    "&::before": {
                      content: `"${step.num}"`,
                      position: "absolute",
                      top: 4,
                      right: 20,
                      fontSize: "5.5rem",
                      fontWeight: 800,
                      color: `${step.color}1f`,
                      letterSpacing: "-0.05em",
                      lineHeight: 1,
                      pointerEvents: "none",
                    },
                  }}
                >
                  <Stack spacing={2} sx={{ position: "relative" }}>
                    <Box
                      sx={{
                        width: 46,
                        height: 46,
                        borderRadius: 1.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: `linear-gradient(135deg, ${step.color}, ${step.colorDeep})`,
                        color: "#fff",
                        boxShadow: `0 10px 24px -8px ${step.color}99`,
                      }}
                    >
                      <Icon size={22} />
                    </Box>
                    <Typography variant="h6" fontWeight={700}>
                      {step.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      lineHeight={1.6}
                    >
                      {step.description}
                    </Typography>
                  </Stack>
                </Box>
              );
            })}
          </Box>
        </Stack>
      </Container>

      {/* ─── CTA BANNER ───────────────────────────────────────────────── */}
      <Container maxWidth="lg" sx={{ pt: { xs: 4, md: 6 }, pb: { xs: 8, md: 12 } }}>
        <Box
          sx={{
            position: "relative",
            borderRadius: 4,
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.1)",
            background:
              "linear-gradient(135deg, rgba(90,154,157,0.18) 0%, rgba(168,85,247,0.16) 50%, rgba(236,72,153,0.14) 100%)",
            px: { xs: 3, md: 7 },
            py: { xs: 5, md: 8 },
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 25% 50%, rgba(90,154,157,0.35) 0%, transparent 55%), radial-gradient(circle at 75% 50%, rgba(168,85,247,0.35) 0%, transparent 55%)",
              filter: "blur(50px)",
              pointerEvents: "none",
            }}
          />
          <Stack spacing={3} alignItems="center" sx={{ position: "relative", textAlign: "center" }}>
            <Typography
              variant="h4"
              fontWeight={800}
              sx={{
                fontSize: { xs: "1.9rem", md: "2.75rem" },
                letterSpacing: "-0.03em",
                lineHeight: 1.05,
              }}
            >
              Ready to make something?
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ maxWidth: 500, fontSize: "1.05rem" }}
            >
              Free, open source, runs entirely in your browser. No accounts, no
              uploads. Just dimensions in, STL out.
            </Typography>
            <Button
              component="a"
              href="#generators"
              variant="contained"
              size="large"
              endIcon={<ArrowRight size={18} />}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                fontSize: "1rem",
                px: 3.5,
                py: 1.5,
                borderRadius: 2,
                bgcolor: "#fff",
                color: "#1a1a1a",
                boxShadow: "0 12px 32px -10px rgba(255, 255, 255, 0.4)",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  bgcolor: "#fff",
                  transform: "translateY(-1px)",
                  boxShadow: "0 16px 40px -10px rgba(255, 255, 255, 0.55)",
                },
              }}
            >
              Pick a generator
            </Button>
          </Stack>
        </Box>
      </Container>

      <LandingFooter />
      </Box>

      {/* Page-level keyframes */}
      <style>{`
        html { scroll-behavior: smooth; }
        @keyframes widget-appear {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes widget-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes hero-fade {
          to { opacity: 1; }
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </Box>
  );
}
