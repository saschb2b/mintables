"use client";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { GeneratorGrid } from "@mintables/shared/ui";
import { generators } from "@/lib/registry";

export default function HubPage() {
  return (
    <Box sx={{ flex: 1, py: { xs: 4, md: 8 }, overflow: "auto" }}>
      <Container maxWidth="lg">
        <Stack spacing={5}>
          <Stack spacing={1.5} sx={{ maxWidth: 720 }}>
            <Typography
              variant="overline"
              color="primary.main"
              sx={{ letterSpacing: 2 }}
            >
              Mintables
            </Typography>
            <Typography variant="h3" fontWeight={700} lineHeight={1.1}>
              Parametric generators for makers.
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Browser-based design tools for printable parts. Tune dimensions in
              real time, preview the result in 3D, and export validated STL or
              3MF. Pick a generator below.
            </Typography>
          </Stack>

          <GeneratorGrid generators={generators} />
        </Stack>
      </Container>
    </Box>
  );
}
