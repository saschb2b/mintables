"use client";

import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import type { ValidationResult } from "../lib/validation/types";

interface ValidationBannerProps {
  result: ValidationResult;
}

export function ValidationBanner({ result }: ValidationBannerProps) {
  const messages = [
    ...result.errors.map((e) => ({
      severity: "error" as const,
      text: e.message,
    })),
    ...result.warnings.map((w) => ({
      severity: "warning" as const,
      text: w.message,
    })),
  ];

  if (messages.length === 0) return null;

  return (
    <Stack
      spacing={0.75}
      sx={{ px: 2, py: 1, borderBottom: 1, borderColor: "divider" }}
    >
      {messages.map((m, i) => (
        <Alert
          key={`${m.severity}-${String(i)}`}
          severity={m.severity}
          variant="outlined"
        >
          {m.text}
        </Alert>
      ))}
    </Stack>
  );
}
