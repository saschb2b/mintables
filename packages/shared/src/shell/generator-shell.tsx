"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import {
  Bookmark,
  ChevronDown,
  Download,
  RotateCcw,
  Share2,
  Trash2,
} from "lucide-react";
import type { Generator } from "../lib/generator";
import { useDebouncedValue } from "../hooks/use-debounced-value";
import {
  buildShareUrl,
  deletePreset,
  listPresets,
  readUrlConfig,
  savePreset,
  syncUrl,
  type Preset,
} from "../lib/preset-storage";
import { trackEvent, trackPageview } from "../lib/analytics";
import { recordDownload } from "../lib/download-storage";
import { ExportError, exportModel, type ExportFormat } from "../lib/export";
import { SavePresetDialog } from "../ui/save-preset-dialog";
import { ShareDialog } from "../ui/share-dialog";
import { ThankYouDrawer } from "../ui/thank-you-drawer";
import { ValidationBanner } from "../ui/validation-banner";
import { PreviewPanel } from "./preview-panel";

const EXPORT_FORMAT_STORAGE_KEY = "mintables.exportFormat";

interface GeneratorShellProps<C> {
  generator: Generator<C>;
}

export function GeneratorShell<C>({ generator }: GeneratorShellProps<C>) {
  const [config, setConfig] = useState<C>(generator.defaults);
  const [hydrated, setHydrated] = useState(false);

  const debouncedConfig = useDebouncedValue(config, 500);

  useEffect(() => {
    const { raw } = readUrlConfig();
    if (raw !== null) {
      const decoded = generator.decode(raw);
      if (decoded) setConfig(decoded);
    }
    setHydrated(true);
  }, [generator]);

  useEffect(() => {
    trackPageview();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    syncUrl(debouncedConfig);
  }, [hydrated, debouncedConfig]);

  const [showThankYou, setShowThankYou] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("stl");
  const [formatMenuOpen, setFormatMenuOpen] = useState(false);
  const [downloadAnchor, setDownloadAnchor] = useState<HTMLDivElement | null>(
    null,
  );

  const [toast, setToast] = useState<string | null>(null);
  const [presetsAnchor, setPresetsAnchor] = useState<HTMLElement | null>(null);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveDialogName, setSaveDialogName] = useState("");
  const [activePreset, setActivePreset] = useState<{
    id: string;
    name: string;
    snapshot: string;
  } | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [exporting, setExporting] = useState(false);

  const validation = useMemo(
    () => generator.validate(config),
    [generator, config],
  );
  const exportBlocked = validation.errors.length > 0;
  const configJson = useMemo(() => JSON.stringify(config), [config]);
  const presetModified =
    activePreset !== null && configJson !== activePreset.snapshot;
  const summary = generator.describe(config);
  const shareUrl = useMemo(
    () => (hydrated ? buildShareUrl(generator.id, config) : ""),
    [hydrated, generator.id, config],
  );
  const badges = generator.badges ? generator.badges(config) : [];
  const printTips = useMemo(
    () => (showThankYou ? generator.printTips(config) : []),
    [showThankYou, generator, config],
  );

  useEffect(() => {
    const stored = window.localStorage.getItem(EXPORT_FORMAT_STORAGE_KEY);
    if (stored === "3mf") setExportFormat("3mf");
    setPresets(listPresets(generator.id));
  }, [generator.id]);

  const setExportFormatPersisted = useCallback((format: ExportFormat) => {
    setExportFormat(format);
    window.localStorage.setItem(EXPORT_FORMAT_STORAGE_KEY, format);
  }, []);

  const handleOpenShare = () => {
    setShareCopied(false);
    setShareDialogOpen(true);
  };

  const handleCopyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareCopied(true);
      window.setTimeout(() => {
        setShareCopied(false);
      }, 2000);
      trackEvent("share_copy", { generator: generator.id });
    } catch {
      window.prompt("Copy this URL:", shareUrl);
    }
  };

  const handleOpenSaveDialog = () => {
    setPresetsAnchor(null);
    setSaveDialogName(summary);
    setSaveDialogOpen(true);
  };

  const handleSavePreset = () => {
    const preset = savePreset(saveDialogName, generator.id, config);
    setPresets(listPresets(generator.id));
    setSaveDialogOpen(false);
    setActivePreset({
      id: preset.id,
      name: preset.name,
      snapshot: JSON.stringify(config),
    });
    setToast(`Saved preset "${preset.name}"`);
    trackEvent("preset_save", { generator: generator.id });
  };

  const handleLoadPreset = (preset: Preset) => {
    const decoded = generator.decode(preset.config);
    if (!decoded) {
      setToast(`Preset "${preset.name}" is incompatible with this generator`);
      return;
    }
    setConfig(decoded);
    setActivePreset({
      id: preset.id,
      name: preset.name,
      snapshot: JSON.stringify(decoded),
    });
    setPresetsAnchor(null);
    setToast(`Loaded preset "${preset.name}"`);
    trackEvent("preset_load", { generator: generator.id });
  };

  const handleDeletePreset = (preset: Preset) => {
    deletePreset(preset.id);
    setPresets(listPresets(generator.id));
    if (activePreset?.id === preset.id) setActivePreset(null);
    setToast(`Deleted preset "${preset.name}"`);
    trackEvent("preset_delete", { generator: generator.id });
  };

  const handleClearActivePreset = () => {
    setActivePreset(null);
  };

  const handleDownload = () => {
    if (exportBlocked || exporting) return;
    setExporting(true);
    try {
      exportModel(generator, config, exportFormat);
      // Record in the Downloads folder so the desktop can list / re-run it.
      recordDownload(
        generator.id,
        generator.filename(config),
        exportFormat,
        config,
      );
      trackEvent("download", { generator: generator.id, format: exportFormat });
      setShowThankYou(true);
    } catch (err) {
      const message =
        err instanceof ExportError
          ? err.message
          : "Export failed. Try adjusting dimensions and export again.";
      setToast(message);
    } finally {
      setExporting(false);
    }
  };

  const handleReset = () => {
    setActivePreset(null);
    setConfig(generator.defaults);
  };

  const Controls = generator.Controls;
  const Summary = generator.Summary;

  return (
    <Box
      sx={{
        display: "flex",
        flex: 1,
        minHeight: 0,
        // Same reason as `<main>` below — without this, an enlarged WebGL
        // canvas anchors the row at its widest measured size and the shell
        // overflows its window when the window restores from maximized.
        minWidth: 0,
        flexDirection: { xs: "column", lg: "row" },
      }}
    >
      {/* Sidebar Controls */}
      <Box
        component="aside"
        sx={{
          width: { xs: "100%", lg: 320, xl: 384 },
          flexShrink: 0,
          borderBottom: { xs: 1, lg: 0 },
          borderRight: { lg: 1 },
          borderColor: "divider",
          bgcolor: "background.paper",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
          <Stack spacing={2}>
            {Summary && <Summary config={config} />}
            <Controls
              config={config}
              onChange={setConfig}
              validation={validation}
            />
          </Stack>
        </Box>

        <Box sx={{ borderTop: 1, borderColor: "divider", p: 2 }}>
          <Stack spacing={1}>
            <ButtonGroup
              ref={setDownloadAnchor}
              variant="contained"
              color="primary"
              fullWidth
              aria-label="Download model"
            >
              <Button
                onClick={handleDownload}
                size="large"
                disabled={exportBlocked || exporting}
                startIcon={<Download size={16} />}
                sx={{
                  flexGrow: 1,
                  flexShrink: 1,
                  whiteSpace: "nowrap",
                  px: 1.5,
                }}
              >
                {exporting
                  ? "Exporting…"
                  : exportBlocked
                    ? "Fix errors to export"
                    : `Download ${exportFormat.toUpperCase()}`}
              </Button>
              <Button
                size="large"
                onClick={() => setFormatMenuOpen(true)}
                aria-label="Choose export format"
                sx={{
                  flexGrow: 0,
                  flexShrink: 0,
                  flexBasis: 40,
                  minWidth: 40,
                  px: 0,
                }}
              >
                <ChevronDown size={16} />
              </Button>
            </ButtonGroup>
            <Menu
              anchorEl={downloadAnchor}
              open={formatMenuOpen}
              onClose={() => setFormatMenuOpen(false)}
              anchorOrigin={{ vertical: "top", horizontal: "right" }}
              transformOrigin={{ vertical: "bottom", horizontal: "right" }}
              slotProps={{
                paper: { sx: { minWidth: downloadAnchor?.offsetWidth } },
              }}
            >
              <MenuItem
                selected={exportFormat === "stl"}
                onClick={() => {
                  setExportFormatPersisted("stl");
                  setFormatMenuOpen(false);
                }}
              >
                <ListItemText primary="STL" secondary="Universal, no units" />
              </MenuItem>
              <MenuItem
                selected={exportFormat === "3mf"}
                onClick={() => {
                  setExportFormatPersisted("3mf");
                  setFormatMenuOpen(false);
                }}
              >
                <ListItemText
                  primary="3MF"
                  secondary="Modern, preserves mm units"
                />
              </MenuItem>
            </Menu>
            <Stack direction="row" spacing={1}>
              <Tooltip title="Get a link to this exact configuration">
                <Button
                  onClick={handleOpenShare}
                  variant="outlined"
                  size="small"
                  fullWidth
                  startIcon={<Share2 size={14} />}
                >
                  Share
                </Button>
              </Tooltip>
              <Button
                onClick={(e) => setPresetsAnchor(e.currentTarget)}
                variant="outlined"
                size="small"
                fullWidth
                startIcon={<Bookmark size={14} />}
                endIcon={<ChevronDown size={12} />}
              >
                Presets
              </Button>
            </Stack>
            <Menu
              anchorEl={presetsAnchor}
              open={Boolean(presetsAnchor)}
              onClose={() => setPresetsAnchor(null)}
              anchorOrigin={{ vertical: "top", horizontal: "right" }}
              transformOrigin={{ vertical: "bottom", horizontal: "right" }}
              slotProps={{ paper: { sx: { minWidth: 260, maxWidth: 360 } } }}
            >
              <MenuItem onClick={handleOpenSaveDialog}>
                <ListItemText
                  primary="Save current as preset…"
                  secondary={`Saves the active ${generator.meta.name.toLowerCase()}`}
                />
              </MenuItem>
              {presets.length > 0 && <Divider />}
              {presets.length === 0 ? (
                <MenuItem disabled>
                  <ListItemText
                    secondary="No presets saved yet"
                    slotProps={{ secondary: { sx: { fontStyle: "italic" } } }}
                  />
                </MenuItem>
              ) : (
                presets.map((p) => (
                  <MenuItem
                    key={p.id}
                    onClick={() => handleLoadPreset(p)}
                    sx={{ pr: 1 }}
                  >
                    <ListItemText primary={p.name} />
                    <IconButton
                      size="small"
                      edge="end"
                      aria-label={`Delete preset ${p.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePreset(p);
                      }}
                      sx={{ ml: 1 }}
                    >
                      <Trash2 size={14} />
                    </IconButton>
                  </MenuItem>
                ))
              )}
            </Menu>
            <Button
              onClick={handleReset}
              variant="text"
              size="small"
              fullWidth
              startIcon={<RotateCcw size={14} />}
              sx={{ color: "#d9d9d9" }}
            >
              Reset to Default
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* Preview Area */}
      <Box
        component="main"
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: { xs: "50vh", lg: 0 },
          // Allow this flex item to shrink below the WebGL canvas's
          // intrinsic min-width — otherwise once R3F grows the canvas
          // (e.g. window maximize), it anchors `main` and can't shrink back.
          minWidth: 0,
        }}
      >
        {/* Info Bar */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: 1,
            borderColor: "divider",
            bgcolor: "rgba(53, 53, 53, 0.5)",
            px: 2,
            py: 1,
          }}
        >
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            flexWrap="wrap"
            useFlexGap
          >
            <Chip
              label={exportFormat.toUpperCase()}
              size="small"
              sx={{
                bgcolor: "rgba(90, 154, 157, 0.15)",
                color: "primary.main",
                fontWeight: 600,
                height: 24,
              }}
            />
            {exportBlocked ? (
              <Chip
                label="Fix errors to export"
                size="small"
                sx={{
                  bgcolor: "rgba(239, 68, 68, 0.15)",
                  color: "#ef4444",
                  fontWeight: 600,
                  height: 24,
                }}
              />
            ) : (
              <Chip
                label="Ready to export"
                size="small"
                sx={{
                  bgcolor: "rgba(34, 197, 94, 0.15)",
                  color: "#22c55e",
                  fontWeight: 600,
                  height: 24,
                }}
              />
            )}
            {activePreset && (
              <Tooltip
                title={
                  presetModified
                    ? `You've changed values since loading "${activePreset.name}". Save as a new preset to keep these changes.`
                    : `Currently editing the preset "${activePreset.name}".`
                }
              >
                <Chip
                  icon={<Bookmark size={12} />}
                  label={
                    presetModified
                      ? `${activePreset.name} • modified`
                      : activePreset.name
                  }
                  size="small"
                  onDelete={handleClearActivePreset}
                  sx={{
                    bgcolor: presetModified
                      ? "rgba(245, 158, 11, 0.15)"
                      : "rgba(34, 197, 94, 0.15)",
                    color: presetModified ? "#f59e0b" : "#22c55e",
                    fontSize: "0.75rem",
                    height: 24,
                    "& .MuiChip-icon": {
                      color: "inherit",
                      marginLeft: "6px",
                    },
                    "& .MuiChip-deleteIcon": {
                      color: "inherit",
                      opacity: 0.7,
                      "&:hover": { opacity: 1, color: "inherit" },
                    },
                  }}
                />
              </Tooltip>
            )}
            {badges.map((badge, i) => (
              <Chip
                key={`${badge.label}-${String(i)}`}
                label={badge.label}
                size="small"
                sx={{
                  bgcolor: `${badge.color}1a`,
                  color: badge.color,
                  fontSize: "0.75rem",
                  height: 24,
                }}
              />
            ))}
          </Stack>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: { xs: "none", sm: "block" } }}
          >
            Drag to rotate · scroll to zoom · use view presets
          </Typography>
        </Box>

        <ValidationBanner result={validation} />

        <PreviewPanel generator={generator} config={debouncedConfig} />
      </Box>

      <ThankYouDrawer
        open={showThankYou}
        exportFormat={exportFormat}
        generatorName={generator.meta.name}
        printTips={printTips}
        onClose={() => setShowThankYou(false)}
      />

      <SavePresetDialog
        open={saveDialogOpen}
        name={saveDialogName}
        onNameChange={setSaveDialogName}
        onClose={() => setSaveDialogOpen(false)}
        onSave={handleSavePreset}
      />

      <ShareDialog
        open={shareDialogOpen}
        noun={generator.meta.name.toLowerCase()}
        summary={summary}
        shareUrl={shareUrl}
        copied={shareCopied}
        onClose={() => setShareDialogOpen(false)}
        onCopy={() => {
          void handleCopyShareUrl();
        }}
      />

      <Snackbar
        open={toast !== null}
        autoHideDuration={2500}
        onClose={() => setToast(null)}
        message={toast}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Box>
  );
}
