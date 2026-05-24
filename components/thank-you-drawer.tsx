"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {
  Coffee,
  ExternalLink,
  Gauge,
  Layers,
  Printer,
  Star,
  Thermometer,
  X,
} from "lucide-react";

interface ThankYouDrawerProps {
  open: boolean;
  exportFormat: "stl" | "3mf";
  onClose: () => void;
}

export function ThankYouDrawer({
  open,
  exportFormat,
  onClose,
}: ThankYouDrawerProps) {
  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 320, p: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Typography variant="h6">Download Started!</Typography>
          <IconButton size="small" onClick={onClose}>
            <X size={18} />
          </IconButton>
        </Box>

        <Stack spacing={2.5}>
          <Typography variant="body2" color="text.secondary">
            Your {exportFormat.toUpperCase()} file is ready for 3D printing.
          </Typography>

          <Divider />

          <Box>
            <Typography variant="overline" color="text.secondary">
              Print Tips
            </Typography>
            <Stack spacing={1.5} sx={{ mt: 1 }}>
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <Layers
                  size={16}
                  color="#5a9a9d"
                  style={{ marginTop: 2, flexShrink: 0 }}
                />
                <Typography variant="caption" color="text.secondary">
                  <strong>Layer height:</strong> 0.2mm for a good balance of
                  speed and quality. Use 0.12mm for press-fit parts.
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <Gauge
                  size={16}
                  color="#5a9a9d"
                  style={{ marginTop: 2, flexShrink: 0 }}
                />
                <Typography variant="caption" color="text.secondary">
                  <strong>Infill:</strong> 20-30% is usually enough. Use 50%+
                  for structural joints.
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <Thermometer
                  size={16}
                  color="#5a9a9d"
                  style={{ marginTop: 2, flexShrink: 0 }}
                />
                <Typography variant="caption" color="text.secondary">
                  <strong>Material:</strong> PETG for durability and heat
                  resistance. PLA works for prototyping.
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <Printer
                  size={16}
                  color="#5a9a9d"
                  style={{ marginTop: 2, flexShrink: 0 }}
                />
                <Typography variant="caption" color="text.secondary">
                  <strong>Orientation:</strong> Print upright for best layer
                  adhesion along the tube walls.
                </Typography>
              </Stack>
            </Stack>
          </Box>

          <Divider />

          <Box>
            <Typography variant="overline" color="text.secondary">
              Support the project
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 0.5, mb: 1.5, display: "block" }}
            >
              TubeCraft is free and open source. If it saved you time, consider
              giving back!
            </Typography>
            <Stack spacing={1.5}>
              <Button
                component="a"
                href="https://github.com/saschb2b/tubecraft"
                target="_blank"
                rel="noopener noreferrer"
                variant="outlined"
                fullWidth
                startIcon={<Star size={18} />}
                endIcon={<ExternalLink size={14} />}
              >
                Star on GitHub
              </Button>
              <Button
                component="a"
                href="https://buymeacoffee.com/qohreuukw"
                target="_blank"
                rel="noopener noreferrer"
                variant="contained"
                fullWidth
                startIcon={<Coffee size={18} />}
                endIcon={<ExternalLink size={14} />}
              >
                Buy me a coffee
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Box>
    </Drawer>
  );
}
