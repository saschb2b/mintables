"use client";

import type { ReactNode } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

interface CollapsibleSectionProps {
  title: string;
  children: ReactNode;
  defaultExpanded?: boolean;
}

export function CollapsibleSection({
  title,
  children,
  defaultExpanded = false,
}: CollapsibleSectionProps) {
  return (
    <Accordion
      defaultExpanded={defaultExpanded}
      disableGutters
      elevation={0}
      sx={{
        bgcolor: "transparent",
        "&::before": { display: "none" },
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "12px !important",
        overflow: "hidden",
        "&.Mui-expanded": { margin: 0 },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: "text.secondary" }} />}
        sx={{
          minHeight: 44,
          px: 1.5,
          "& .MuiAccordionSummary-content": { my: 1 },
        }}
      >
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ letterSpacing: 1 }}
        >
          {title}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 1.5, pt: 0, pb: 1.5 }}>
        {children}
      </AccordionDetails>
    </Accordion>
  );
}
