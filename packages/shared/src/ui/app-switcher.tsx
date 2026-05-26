"use client";

import { useState } from "react";
import NextLink from "next/link";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Popover from "@mui/material/Popover";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { Compass, LayoutGrid } from "lucide-react";
import type { AnyGenerator } from "../lib/generator";

interface AppSwitcherProps {
  generators: AnyGenerator[];
  currentId?: string;
}

export function AppSwitcher({ generators, currentId }: AppSwitcherProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  return (
    <>
      <Tooltip title="All generators">
        <IconButton
          size="small"
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{ color: "text.secondary" }}
          aria-label="All generators"
        >
          <LayoutGrid size={18} />
        </IconButton>
      </Tooltip>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{
          paper: {
            sx: { mt: 1, p: 2, borderRadius: 2, width: 280 },
          },
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 1,
          }}
        >
          {generators.map((gen) => {
            const isCurrent = gen.id === currentId;
            const Icon = gen.meta.icon;
            return (
              <Box
                key={gen.id}
                component={NextLink}
                href={`/generators/${gen.id}`}
                onClick={() => setAnchorEl(null)}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 0.75,
                  p: 1.5,
                  borderRadius: 1.5,
                  textDecoration: "none",
                  color: "inherit",
                  transition: "background 0.15s ease",
                  bgcolor: isCurrent
                    ? "rgba(90, 154, 157, 0.12)"
                    : "transparent",
                  "&:hover": {
                    bgcolor: isCurrent
                      ? "rgba(90, 154, 157, 0.18)"
                      : "action.hover",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: isCurrent ? "primary.main" : gen.meta.accent,
                    color: "#fff",
                  }}
                >
                  <Icon size={18} />
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: "0.65rem",
                    fontWeight: isCurrent ? 700 : 500,
                    textAlign: "center",
                    lineHeight: 1.2,
                    color: isCurrent ? "primary.main" : "text.secondary",
                  }}
                >
                  {gen.meta.name}
                </Typography>
              </Box>
            );
          })}
        </Box>
        <Divider sx={{ my: 1.5 }} />
        <Box
          component={NextLink}
          href="/"
          onClick={() => setAnchorEl(null)}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            p: 1,
            borderRadius: 1.5,
            textDecoration: "none",
            color: "text.secondary",
            transition: "all 0.15s ease",
            "&:hover": { bgcolor: "action.hover", color: "text.primary" },
          }}
        >
          <Compass size={18} />
          <Box>
            <Typography
              variant="caption"
              fontWeight={700}
              sx={{ display: "block", lineHeight: 1.2 }}
            >
              Mintables Hub
            </Typography>
            <Typography
              variant="caption"
              sx={{ fontSize: "0.6rem", opacity: 0.7 }}
            >
              See all generators
            </Typography>
          </Box>
        </Box>
      </Popover>
    </>
  );
}
