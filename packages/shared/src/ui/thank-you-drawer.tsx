"use client";

import type { CSSProperties, ReactNode } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {
  CheckCircle2,
  Coffee,
  ExternalLink,
  Gauge,
  Layers,
  Link2,
  Printer,
  SplitSquareVertical,
  Star,
  Thermometer,
  X,
} from "lucide-react";
import type { PrintTip, PrintTipIcon } from "../lib/print-tips";
import { SITE_LINKS } from "../lib/site-links";

interface ThankYouDrawerProps {
  open: boolean;
  exportFormat: "stl" | "3mf";
  generatorName: string;
  printTips: PrintTip[];
  onClose: () => void;
}

const TIP_ICON_PROPS = {
  size: 16,
  color: "#5a9a9d",
  style: { marginTop: 2, flexShrink: 0 } satisfies CSSProperties,
};

function renderTipIcon(icon: PrintTipIcon) {
  switch (icon) {
    case "layers":
      return <Layers {...TIP_ICON_PROPS} />;
    case "gauge":
      return <Gauge {...TIP_ICON_PROPS} />;
    case "thermometer":
      return <Thermometer {...TIP_ICON_PROPS} />;
    case "printer":
      return <Printer {...TIP_ICON_PROPS} />;
    case "split":
      return <SplitSquareVertical {...TIP_ICON_PROPS} />;
    case "link":
      return <Link2 {...TIP_ICON_PROPS} />;
  }
}

function SupportCtaButton({
  href,
  variant,
  icon,
  title,
  subtitle,
}: {
  href: string;
  variant: "contained" | "outlined";
  icon: ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <Button
      component="a"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      variant={variant}
      fullWidth
      sx={{
        py: 1.5,
        px: 2,
        justifyContent: "flex-start",
        textAlign: "left",
        textTransform: "none",
      }}
    >
      <Stack
        direction="row"
        spacing={1.5}
        alignItems="flex-start"
        sx={{ width: "100%" }}
      >
        <Box sx={{ mt: 0.25, flexShrink: 0, display: "flex" }}>{icon}</Box>
        <Stack spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={1}
          >
            <Typography variant="body2" fontWeight={600} color="inherit">
              {title}
            </Typography>
            <ExternalLink size={14} style={{ flexShrink: 0, opacity: 0.7 }} />
          </Stack>
          <Typography
            variant="caption"
            sx={{
              color: "inherit",
              opacity: variant === "contained" ? 0.85 : 0.7,
              lineHeight: 1.4,
            }}
          >
            {subtitle}
          </Typography>
        </Stack>
      </Stack>
    </Button>
  );
}

export function ThankYouDrawer({
  open,
  exportFormat,
  generatorName,
  printTips,
  onClose,
}: ThankYouDrawerProps) {
  const formatLabel = exportFormat.toUpperCase();

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: { xs: "min(100vw, 380px)", sm: 380 }, p: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <CheckCircle2
              size={22}
              color="#5a9a9d"
              style={{ marginTop: 2, flexShrink: 0 }}
            />
            <Box>
              <Typography variant="h6" lineHeight={1.3}>
                Download started
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                Your {formatLabel} file should appear in your downloads folder.
              </Typography>
            </Box>
          </Stack>
          <IconButton size="small" onClick={onClose} aria-label="Close">
            <X size={18} />
          </IconButton>
        </Box>

        <Stack spacing={2.5}>
          <Divider />

          <Box>
            <Typography variant="overline" color="text.secondary">
              Tips for this part
            </Typography>
            <Stack spacing={1.5} sx={{ mt: 1 }}>
              {printTips.map((tip) => (
                <Stack
                  key={tip.title}
                  direction="row"
                  spacing={1.5}
                  alignItems="flex-start"
                >
                  {renderTipIcon(tip.icon)}
                  <Typography variant="caption" color="text.secondary">
                    <strong>{tip.title}:</strong> {tip.body}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Box>

          <Divider />

          <Box>
            <Typography variant="overline" color="text.secondary">
              Keep {generatorName} free
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.75, mb: 2, lineHeight: 1.5 }}
            >
              Mintables is free, open source, and runs entirely in your browser
              — no uploads and no account. A GitHub star helps others find it; a
              coffee helps keep it online.
            </Typography>
            <Stack spacing={1.5}>
              <SupportCtaButton
                href={SITE_LINKS.github}
                variant="contained"
                icon={<Star size={18} />}
                title="Star on GitHub"
                subtitle="Free — helps others discover the tool"
              />
              <SupportCtaButton
                href={SITE_LINKS.buyMeACoffee}
                variant="outlined"
                icon={<Coffee size={18} />}
                title="Buy me a coffee"
                subtitle="Optional — supports hosting and development"
              />
            </Stack>
          </Box>

          <Button
            variant="outlined"
            fullWidth
            onClick={onClose}
            sx={{ mt: 0.5 }}
          >
            Back to editing
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
}
