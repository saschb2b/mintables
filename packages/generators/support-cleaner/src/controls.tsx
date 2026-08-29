"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import InputLabel from "@mui/material/InputLabel";
import LinearProgress from "@mui/material/LinearProgress";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Slider from "@mui/material/Slider";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import { FileUp } from "lucide-react";
import type { ControlsProps } from "@mintables/shared/lib";
import { SectionCard } from "@mintables/shared/ui";
import { analyzeStlInWorker, prepareStlInWorker } from "./browser-analysis";
import { loadImportedAsset, saveImportedAsset } from "./asset-storage";
import {
  getSupportAsset,
  hasPreparedSelection,
  registerSupportAsset,
  removedShellIds,
  updatePreparedSupportAsset,
} from "./asset-store";
import {
  selectionFromConfig,
  supportSelectionKey,
  type SupportSelection,
} from "./mesh-preparation";
import type { SupportCleanerConfig } from "./types";
import type { SupportWorkerResult, WorkerProgress } from "./worker-protocol";

const MAX_FILE_BYTES = 250 * 1024 * 1024;
const PREPARE_DEBOUNCE_MS = 180;
const pendingLoads = new Map<string, Promise<SupportWorkerResult>>();

function createAssetId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return (
    "asset-" +
    String(Date.now()) +
    "-" +
    Math.random().toString(36).slice(2, 10)
  );
}

type WorkOperation = "analyzing" | "preparing";

type ProcessingState =
  | { status: "idle" }
  | {
      status: "working";
      operation: WorkOperation;
      message: string;
      progress: number;
    }
  | { status: "error"; message: string }
  | { status: "warning"; message: string };

async function restoreAsset(
  id: string,
  selection: SupportSelection,
  onProgress: (progress: WorkerProgress) => void,
): Promise<SupportWorkerResult> {
  const existing = pendingLoads.get(id);
  if (existing) return existing;
  const promise = (async () => {
    const stored = await loadImportedAsset(id);
    if (!stored) {
      throw new Error("The locally saved STL is no longer available.");
    }
    return analyzeStlInWorker(
      id,
      await stored.file.arrayBuffer(),
      selection,
      onProgress,
    );
  })();
  pendingLoads.set(id, promise);
  try {
    return await promise;
  } finally {
    pendingLoads.delete(id);
  }
}

function formatCount(value: number): string {
  return new Intl.NumberFormat().format(value);
}

function removalMessage(
  config: SupportCleanerConfig,
  removedShellCount: number,
  removedFaceCount: number,
): string {
  switch (config.removalMode) {
    case "safe":
      return (
        String(removedShellCount) +
        " high-confidence shells will be removed (" +
        formatCount(removedFaceCount) +
        " faces). Larger detached accessories stay intact."
      );
    case "main-only":
      return "Every detached shell will be deleted. Use this only after checking separate bases and accessories.";
    case "original":
      return "Nothing is removed. This is useful for comparing the classifier against the source.";
  }
}

function WorkProgress({ state }: { state: ProcessingState }) {
  if (state.status !== "working") return null;
  const label =
    state.operation === "analyzing" ? "Analyzing STL" : "Updating preview";
  return (
    <Stack spacing={0.75} role="status" aria-live="polite">
      <Stack
        direction="row"
        spacing={1}
        sx={{ justifyContent: "space-between" }}
      >
        <Typography variant="caption">{state.message}</Typography>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {Math.round(state.progress)}%
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={state.progress}
        aria-label={label}
      />
      {state.operation === "preparing" && (
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          The current preview stays interactive until the updated mesh is ready.
        </Typography>
      )}
    </Stack>
  );
}

export function SupportCleanerControls({
  config,
  onChange,
}: ControlsProps<SupportCleanerConfig>) {
  const [processing, setProcessing] = useState<ProcessingState>({
    status: "idle",
  });
  const isMounted = useRef(true);
  const asset = getSupportAsset(config.assetId);
  const selection = selectionFromConfig(config);
  const selectionKey = supportSelectionKey(selection);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!config.assetId) return;
    let cancelled = false;
    const applyProgress =
      (operation: WorkOperation) => (progress: WorkerProgress) => {
        if (cancelled) return;
        setProcessing({ status: "working", operation, ...progress });
      };

    if (!asset) {
      setProcessing({
        status: "working",
        operation: "analyzing",
        message: "Restoring the local STL",
        progress: 0,
      });
      void restoreAsset(config.assetId, selection, applyProgress("analyzing"))
        .then(async (result) => {
          if (cancelled) return;
          if (!result.summary) {
            throw new Error("The restored STL analysis was incomplete.");
          }
          const stored = await loadImportedAsset(config.assetId);
          if (cancelled) return;
          registerSupportAsset(
            config.assetId,
            stored?.name ?? config.assetName,
            result.summary,
            result.prepared,
          );
          setProcessing({ status: "idle" });
          onChange({ ...config, assetRevision: config.assetRevision + 1 });
        })
        .catch((error: unknown) => {
          if (cancelled) return;
          setProcessing({
            status: "error",
            message:
              error instanceof Error
                ? error.message
                : "The local STL could not be restored.",
          });
        });
      return () => {
        cancelled = true;
      };
    }

    if (hasPreparedSelection(asset, config)) return;
    setProcessing({
      status: "working",
      operation: "preparing",
      message: "Waiting for the final setting",
      progress: 0,
    });
    const timer = window.setTimeout(() => {
      void prepareStlInWorker(asset.id, selection, applyProgress("preparing"))
        .then((result) => {
          if (cancelled) return;
          updatePreparedSupportAsset(asset.id, result.prepared);
          setProcessing({ status: "idle" });
          onChange({ ...config, assetRevision: config.assetRevision + 1 });
        })
        .catch((error: unknown) => {
          if (cancelled) return;
          setProcessing({
            status: "error",
            message:
              error instanceof Error
                ? error.message
                : "The preview geometry could not be prepared.",
          });
        });
    }, PREPARE_DEBOUNCE_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [asset, config, onChange, selectionKey]);

  const update = (patch: Partial<SupportCleanerConfig>) => {
    onChange({ ...config, ...patch });
  };

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".stl")) {
      setProcessing({ status: "error", message: "Choose an STL file." });
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setProcessing({
        status: "error",
        message: "This editor currently accepts STL files up to 250 MB.",
      });
      return;
    }

    const id = createAssetId();
    const nextConfig = { ...config, removalMode: "safe" as const };
    const nextSelection = selectionFromConfig(nextConfig);
    setProcessing({
      status: "working",
      operation: "analyzing",
      message: "Reading the local STL",
      progress: 0,
    });
    try {
      const persistence = saveImportedAsset(id, file.name, file)
        .then(() => true)
        .catch(() => false);
      const analysis = analyzeStlInWorker(
        id,
        await file.arrayBuffer(),
        nextSelection,
        (progress) => {
          if (!isMounted.current) return;
          setProcessing({
            status: "working",
            operation: "analyzing",
            ...progress,
          });
        },
      );
      const [result, persisted] = await Promise.all([analysis, persistence]);
      if (!result.summary) {
        throw new Error("The STL analysis was incomplete.");
      }
      registerSupportAsset(id, file.name, result.summary, result.prepared);
      if (!isMounted.current) return;
      onChange({
        ...nextConfig,
        assetId: id,
        assetName: file.name.slice(0, 160),
        assetRevision: config.assetRevision + 1,
      });
      setProcessing(
        persisted
          ? { status: "idle" }
          : {
              status: "warning",
              message:
                "Analysis succeeded, but browser storage was unavailable. Re-import after a reload.",
            },
      );
    } catch (error: unknown) {
      if (!isMounted.current) return;
      setProcessing({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "The STL could not be analyzed.",
      });
    }
  };

  const removed = asset ? removedShellIds(asset, config) : new Set<number>();
  const removedFaces = asset
    ? asset.shells
        .filter((shell) => removed.has(shell.id))
        .reduce((sum, shell) => sum + shell.faceCount, 0)
    : 0;
  const primary = asset?.shells[asset.primaryShellId];
  const analyzedFaces = asset
    ? asset.sourceTriangleCount - asset.degenerateTriangleCount
    : 0;
  const dominance =
    asset && primary ? (primary.faceCount / analyzedFaces) * 100 : 0;

  return (
    <>
      <SectionCard title="Source model">
        <Stack spacing={1.25}>
          <Button
            component="label"
            variant="outlined"
            startIcon={<FileUp aria-hidden size={18} />}
            disabled={processing.status === "working"}
          >
            {asset ? "Replace STL" : "Import supported STL"}
            <input
              hidden
              type="file"
              accept=".stl,model/stl,application/sla"
              onChange={(event) => {
                void handleUpload(event);
              }}
            />
          </Button>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Files stay in this browser. Mesh analysis runs locally and never
            uploads the sculpt.
          </Typography>
          <WorkProgress state={processing} />
          {(processing.status === "error" ||
            processing.status === "warning") && (
            <Alert severity={processing.status}>{processing.message}</Alert>
          )}
          {asset && primary && (
            <Stack spacing={0.4}>
              <Typography variant="body2" sx={{ fontWeight: 650 }}>
                {asset.name}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {formatCount(asset.sourceTriangleCount)} source triangles,{" "}
                {formatCount(asset.shells.length)} connected shells
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Main sculpt: {formatCount(primary.faceCount)} faces (
                {dominance.toFixed(1)}%)
              </Typography>
            </Stack>
          )}
        </Stack>
      </SectionCard>

      {asset && (
        <SectionCard title="Shell separation">
          <Stack spacing={1.5}>
            <FormControl fullWidth size="small">
              <InputLabel id="shell-removal-label">Output</InputLabel>
              <Select
                labelId="shell-removal-label"
                label="Output"
                value={config.removalMode}
                onChange={(event) =>
                  update({
                    removalMode: event.target
                      .value as SupportCleanerConfig["removalMode"],
                  })
                }
              >
                <MenuItem value="safe">Safe cleanup</MenuItem>
                <MenuItem value="main-only">Main shell only</MenuItem>
                <MenuItem value="original">Original model</MenuItem>
              </Select>
            </FormControl>
            {config.removalMode === "safe" && (
              <Stack spacing={0.25}>
                <Typography variant="caption">
                  Maximum support-shell size:{" "}
                  {config.supportSizePercent.toFixed(2)}% of main
                </Typography>
                <Slider
                  value={config.supportSizePercent}
                  onChange={(_, value) =>
                    update({
                      supportSizePercent: Array.isArray(value)
                        ? value[0]
                        : value,
                    })
                  }
                  min={0.01}
                  max={0.5}
                  step={0.01}
                  valueLabelDisplay="auto"
                  aria-label="Maximum support shell size"
                />
              </Stack>
            )}
            <Alert
              severity={config.removalMode === "main-only" ? "warning" : "info"}
            >
              {removalMessage(config, removed.size, removedFaces)}
            </Alert>
            <FormControlLabel
              control={
                <Switch
                  checked={config.showRemovedSupports}
                  onChange={(event) =>
                    update({ showRemovedSupports: event.target.checked })
                  }
                />
              }
              label="Show removed shells in red"
            />
          </Stack>
        </SectionCard>
      )}

      {asset && (
        <SectionCard title="FDM handoff">
          <Stack spacing={1}>
            <FormControlLabel
              control={
                <Switch
                  checked={config.centerOnBed}
                  onChange={(event) =>
                    update({ centerOnBed: event.target.checked })
                  }
                />
              }
              label="Center and place sculpt on bed"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={config.fdmHandoff}
                  onChange={(event) =>
                    update({ fdmHandoff: event.target.checked })
                  }
                />
              }
              label="FDM slicer handoff"
            />
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {config.fdmHandoff
                ? "The export removes resin branches and keeps the source model orientation. Generate fresh Organic supports in your FDM slicer using its nozzle, layer, and interface settings."
                : "Exports only the selected geometry. No assumptions are made about the next print process."}
            </Typography>
          </Stack>
        </SectionCard>
      )}
    </>
  );
}
