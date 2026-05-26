"use client";

import NextLink from "next/link";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { ArrowRight } from "lucide-react";
import type { AnyGenerator } from "../lib/generator";

interface GeneratorGridProps {
  generators: AnyGenerator[];
}

export function GeneratorGrid({ generators }: GeneratorGridProps) {
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
      {generators.map((gen) => {
        const Icon = gen.meta.icon;
        return (
          <Box
            key={gen.id}
            component={NextLink}
            href={`/${gen.id}`}
            sx={{
              display: "block",
              p: 2.5,
              borderRadius: 2,
              border: 1,
              borderColor: "divider",
              bgcolor: "background.paper",
              textDecoration: "none",
              color: "inherit",
              transition: "border-color 0.15s, transform 0.15s",
              "&:hover": {
                borderColor: "primary.main",
                transform: "translateY(-2px)",
              },
            }}
          >
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
                    bgcolor: gen.meta.accent,
                    color: "#fff",
                  }}
                >
                  <Icon size={20} />
                </Box>
                <ArrowRight
                  size={18}
                  style={{ color: "var(--mui-palette-text-secondary)" }}
                />
              </Box>
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  {gen.meta.name}
                </Typography>
                <Typography
                  variant="caption"
                  color="primary.main"
                  fontFamily="monospace"
                >
                  /{gen.id}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {gen.meta.description}
              </Typography>
            </Stack>
          </Box>
        );
      })}
    </Box>
  );
}
