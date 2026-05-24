"use client";

import dynamic from "next/dynamic";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import type { TubeConfig } from "@/lib/tube-types";
import type { AdapterConfig } from "@/lib/adapter-types";
import { TubeScene } from "@/components/preview/tube-scene";
import { AdapterScene } from "@/components/preview/adapter-scene";

const PreviewCanvas = dynamic(
  () =>
    import("@/components/preview/preview-canvas").then((m) => ({
      default: m.PreviewCanvas,
    })),
  { ssr: false, loading: () => <PreviewLoading /> },
);

function PreviewLoading() {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        minHeight: 240,
        background: "linear-gradient(180deg, #404040 0%, #2a2a2a 100%)",
      }}
    >
      <CircularProgress size={32} />
    </Box>
  );
}

interface PreviewPanelProps {
  activeTab: "tube" | "adapter";
  tubeConfig: TubeConfig;
  adapterConfig: AdapterConfig;
}

export function PreviewPanel({
  activeTab,
  tubeConfig,
  adapterConfig,
}: PreviewPanelProps) {
  return (
    <Box
      sx={{
        flex: 1,
        position: "relative",
        minHeight: 0,
        minWidth: 0,
        width: "100%",
        height: "100%",
      }}
    >
      <PreviewCanvas>
        {activeTab === "tube" ? (
          <TubeScene config={tubeConfig} />
        ) : (
          <AdapterScene config={adapterConfig} />
        )}
      </PreviewCanvas>
    </Box>
  );
}
