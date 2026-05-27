"use client";

import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export type SpecStatus = "ok" | "warn" | "error";

const STATUS_STYLES: Record<SpecStatus, { bg: string; color: string }> = {
  ok: { bg: "rgba(34, 197, 94, 0.15)", color: "#22c55e" },
  warn: { bg: "rgba(245, 158, 11, 0.15)", color: "#f59e0b" },
  error: { bg: "rgba(239, 68, 68, 0.15)", color: "#ef4444" },
};

export function SpecStatusChip({
  status,
  label,
}: {
  status: SpecStatus;
  label: string;
}) {
  const s = STATUS_STYLES[status];
  return (
    <Chip
      size="small"
      label={label}
      sx={{ bgcolor: s.bg, color: s.color, fontWeight: 600, height: 24 }}
    />
  );
}

export function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
      <Typography variant="caption" sx={{
        color: "text.secondary"
      }}>
        {label}
      </Typography>
      <Typography
        variant="caption"
        sx={{
          fontWeight: 600,
          color: "text.primary"
        }}>
        {value}
      </Typography>
    </Box>
  );
}

interface SpecCardProps {
  title?: string;
  status?: { status: SpecStatus; label: string };
  children: ReactNode;
}

/** Bordered teal card used to surface live spec summary above controls. */
export function SpecCard({ title = "Live Spec", status, children }: SpecCardProps) {
  return (
    <Box
      sx={{
        bgcolor: "rgba(90, 154, 157, 0.08)",
        border: "1px solid",
        borderColor: "rgba(90, 154, 157, 0.25)",
        borderRadius: 1.5,
        p: 1.5,
      }}
    >
      <Stack spacing={1}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Typography
            variant="overline"
            sx={{
              color: "primary.main",
              letterSpacing: 1
            }}>
            {title}
          </Typography>
          {status && <SpecStatusChip {...status} />}
        </Box>
        {children}
      </Stack>
    </Box>
  );
}
