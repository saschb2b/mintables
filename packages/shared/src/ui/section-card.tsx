"use client";

import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

interface SectionCardProps {
  title: string;
  children: ReactNode;
}

/** Lightly-bordered card used to group related controls in the sidebar. */
export function SectionCard({ title, children }: SectionCardProps) {
  return (
    <Stack spacing={1}>
      <Typography
        variant="overline"
        sx={{
          color: "text.secondary",
          letterSpacing: 1
        }}>
        {title}
      </Typography>
      <Box
        sx={{
          bgcolor: "rgba(255,255,255,0.03)",
          borderRadius: 1.5,
          border: "1px solid",
          borderColor: "divider",
          p: 1.5,
        }}
      >
        <Stack spacing={1.5}>{children}</Stack>
      </Box>
    </Stack>
  );
}
