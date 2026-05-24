"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { TubeSpecSummary, AdapterSpecSummary, WallStatus } from "@/lib/tube-spec";

function wallChip(status: WallStatus, label: string) {
  if (status === "ok") {
    return (
      <Chip
        size="small"
        label={label}
        sx={{
          bgcolor: "rgba(34, 197, 94, 0.15)",
          color: "#22c55e",
          fontWeight: 600,
          height: 24,
        }}
      />
    );
  }
  if (status === "thin") {
    return (
      <Chip
        size="small"
        label={label}
        sx={{
          bgcolor: "rgba(245, 158, 11, 0.15)",
          color: "#f59e0b",
          fontWeight: 600,
          height: 24,
        }}
      />
    );
  }
  return (
    <Chip
      size="small"
      label={label}
      sx={{
        bgcolor: "rgba(239, 68, 68, 0.15)",
        color: "#ef4444",
        fontWeight: 600,
        height: 24,
      }}
    />
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="caption" fontWeight={600} color="text.primary">
        {value}
      </Typography>
    </Box>
  );
}

export function TubeSpecSummaryCard({ spec }: { spec: TubeSpecSummary }) {
  const wallLabel =
    spec.wall.status === "invalid"
      ? "Invalid wall"
      : spec.wall.secondary !== undefined
        ? `${spec.wall.primary.toFixed(2)} / ${spec.wall.secondary.toFixed(2)} mm`
        : `${spec.wall.primary.toFixed(2)} mm`;

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
          <Typography variant="overline" color="primary.main" sx={{ letterSpacing: 1 }}>
            Live Spec
          </Typography>
          {wallChip(spec.wall.status, wallLabel)}
        </Box>
        <SpecRow label="Shape" value={spec.shapeLabel} />
        <SpecRow label={spec.innerLabel} value={spec.innerValue} />
        <SpecRow label={spec.outerLabel} value={spec.outerValue} />
        <SpecRow label="Length" value={`${String(spec.length)} mm`} />
        {spec.volumeCm3 !== null && (
          <SpecRow label="Est. volume" value={`~${spec.volumeCm3.toFixed(1)} cm³`} />
        )}
      </Stack>
    </Box>
  );
}

export function AdapterSpecSummaryCard({ spec }: { spec: AdapterSpecSummary }) {
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
        <Typography variant="overline" color="primary.main" sx={{ letterSpacing: 1 }}>
          Live Spec
        </Typography>
        <SpecRow label="Transition" value={spec.transition} />
        <SpecRow label="End A" value={spec.endA} />
        <SpecRow label="End B" value={spec.endB} />
        <SpecRow label="Socket depth" value={`${String(spec.socketDepth)} mm`} />
        <SpecRow label="Adapter wall" value={`${String(spec.adapterWall)} mm`} />
        <SpecRow
          label="Bend"
          value={spec.bendAngle > 0 ? `${String(spec.bendAngle)}°` : "Straight"}
        />
        <SpecRow label="Total height" value={`${String(spec.totalHeight)} mm`} />
      </Stack>
    </Box>
  );
}
