"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Tooltip from "@mui/material/Tooltip";
import { useViewport, type ViewPreset } from "./viewport-context";

const PRESETS: { id: ViewPreset; label: string; title: string }[] = [
  { id: "iso", label: "Iso", title: "Isometric view" },
  { id: "front", label: "Front", title: "Front view" },
  { id: "top", label: "Top", title: "Top view" },
  { id: "right", label: "Right", title: "Right view" },
];

export function ViewToolbar() {
  const { requestView } = useViewport();

  return (
    <Box
      sx={{
        position: "absolute",
        top: 12,
        right: 12,
        zIndex: 2,
        pointerEvents: "auto",
      }}
    >
      <ButtonGroup
        size="small"
        variant="outlined"
        aria-label="Camera view presets"
        sx={{
          bgcolor: "rgba(44, 44, 44, 0.88)",
          backdropFilter: "blur(8px)",
          "& .MuiButton-root": {
            minWidth: 44,
            color: "text.primary",
            borderColor: "divider",
            fontSize: "0.7rem",
            fontWeight: 600,
            letterSpacing: 0.5,
            px: 1,
          },
        }}
      >
        {PRESETS.map((preset) => (
          <Tooltip key={preset.id} title={preset.title}>
            <Button onClick={() => requestView(preset.id)}>{preset.label}</Button>
          </Tooltip>
        ))}
      </ButtonGroup>
    </Box>
  );
}
