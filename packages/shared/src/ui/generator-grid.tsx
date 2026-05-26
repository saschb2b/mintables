"use client";

import { useState } from "react";
import NextLink from "next/link";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { ArrowRight } from "lucide-react";
import type { AnyGenerator } from "../lib/generator";
import { MiniPreview } from "./mini-preview";

interface GeneratorGridProps {
  generators: AnyGenerator[];
  /** Show a rotating 3D preview at the top of each card. Defaults to true. */
  withPreview?: boolean;
}

function GeneratorCard({
  generator,
  withPreview,
  index,
}: {
  generator: AnyGenerator;
  withPreview: boolean;
  index: number;
}) {
  const [hover, setHover] = useState(false);
  const Icon = generator.meta.icon;

  return (
    <Box
      component={NextLink}
      href={`/${generator.id}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      sx={{
        display: "block",
        p: 2.5,
        borderRadius: 2,
        border: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        textDecoration: "none",
        color: "inherit",
        transition:
          "border-color 0.2s, transform 0.2s, box-shadow 0.3s, background-color 0.2s",
        opacity: 0,
        animation: "card-rise 0.55s cubic-bezier(0.2, 0.8, 0.2, 1) forwards",
        animationDelay: `${String(1100 + index * 90)}ms`,
        "&:hover, &:focus-visible": {
          borderColor: "primary.main",
          transform: "translateY(-3px)",
          boxShadow: `0 12px 32px -16px ${generator.meta.accent}66`,
          outline: "none",
        },
      }}
    >
      <style>{`
        @keyframes card-rise {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {withPreview && (
        <Box
          sx={{
            height: 140,
            mb: 1.5,
            mx: -1,
            borderRadius: 1.5,
            overflow: "hidden",
            bgcolor: "rgba(0, 0, 0, 0.2)",
          }}
        >
          <MiniPreview generator={generator} hover={hover} height={140} />
        </Box>
      )}

      <Stack spacing={1.5}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: generator.meta.accent,
              color: "#fff",
              transition: "transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)",
              transform: hover ? "scale(1.08) rotate(-3deg)" : "scale(1)",
            }}
          >
            <Icon size={20} />
          </Box>
          <ArrowRight
            size={18}
            style={{
              color: hover
                ? "var(--mui-palette-primary-main)"
                : "var(--mui-palette-text-secondary)",
              transition: "transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), color 0.2s",
              transform: hover ? "translateX(4px)" : "translateX(0)",
            }}
          />
        </Box>
        <Box>
          <Typography variant="subtitle1" fontWeight={600}>
            {generator.meta.name}
          </Typography>
          <Typography
            variant="caption"
            color="primary.main"
            fontFamily="monospace"
          >
            /{generator.id}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {generator.meta.description}
        </Typography>
      </Stack>
    </Box>
  );
}

export function GeneratorGrid({
  generators,
  withPreview = true,
}: GeneratorGridProps) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          lg: "repeat(3, 1fr)",
        },
        gap: 2,
      }}
    >
      {generators.map((gen, i) => (
        <GeneratorCard
          key={gen.id}
          generator={gen}
          withPreview={withPreview}
          index={i}
        />
      ))}
    </Box>
  );
}
