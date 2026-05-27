"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

/**
 * Live menu-bar clock: weekday + date · HH:MM, updating each minute.
 *
 * SSR-safe: renders an invisible placeholder of fixed width on the server
 * (so the initial render reserves the right space without leaking a server
 * time that would mismatch the client).
 */
export function SystemClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => {
      setNow(new Date());
    }, 30_000);
    return () => {
      window.clearInterval(id);
    };
  }, []);

  if (now === null) {
    return (
      <Box sx={{ minWidth: 138, height: 18 }} aria-hidden suppressHydrationWarning />
    );
  }

  const day = now.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const time = now.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.75,
        color: "text.primary",
        fontFeatureSettings: '"tnum" 1',
      }}
    >
      <Typography
        variant="caption"
        sx={{ color: "text.secondary", fontSize: "0.72rem" }}
      >
        {day}
      </Typography>
      <Typography
        variant="caption"
        sx={{ fontWeight: 600, fontSize: "0.74rem", letterSpacing: 0.2 }}
      >
        {time}
      </Typography>
    </Box>
  );
}
