"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Snackbar from "@mui/material/Snackbar";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { TubeControls } from "@/components/tube-controls";
import { AdapterControls } from "@/components/adapter-controls";
import { PreviewPanel } from "@/components/preview-panel";
import { ThankYouDrawer } from "@/components/thank-you-drawer";
import { ShareDialog } from "@/components/share-dialog";
import { SavePresetDialog } from "@/components/save-preset-dialog";
import { ValidationBanner } from "@/components/validation-banner";
import {
  exportTubeModel,
  exportAdapterModel,
  ExportError,
} from "@/lib/export-model";
import { validateConfig } from "@/lib/validation";
import type { TubeConfig } from "@/lib/tube-types";
import type { AdapterConfig } from "@/lib/adapter-types";
import { DEFAULT_ROUND_CONFIG } from "@/lib/tube-types";
import { DEFAULT_ADAPTER_CONFIG } from "@/lib/adapter-types";
import {
  buildShareUrl,
  syncUrl,
  readUrlParams,
  listPresets,
  savePreset,
  deletePreset,
  describeConfig,
  type Preset,
} from "@/lib/preset-storage";
import { trackPageview, trackEvent } from "@/lib/analytics";
import {
  Download,
  RotateCcw,
  Cylinder,
  Coffee,
  Heart,
  Link2,
  Share2,
  Bookmark,
  Trash2,
  ChevronDown,
} from "lucide-react";
import GitHubIcon from "@mui/icons-material/GitHub";

type TabType = "tube" | "adapter";
type ExportFormat = "stl" | "3mf";

const EXPORT_FORMAT_STORAGE_KEY = "tubecraft.exportFormat";

export default function Home() {
  // Initial render uses defaults so SSR + client hydration agree. URL params
  // and localStorage are read after mount in the effect below.
  const [activeTab, setActiveTab] = useState<TabType>("tube");
  const [tubeConfig, setTubeConfig] =
    useState<TubeConfig>(DEFAULT_ROUND_CONFIG);
  const [adapterConfig, setAdapterConfig] = useState<AdapterConfig>(
    DEFAULT_ADAPTER_CONFIG,
  );
  const [hydrated, setHydrated] = useState(false);

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

  const debouncedTubeConfig = useDebouncedValue(tubeConfig, 500);
  const debouncedAdapterConfig = useDebouncedValue(adapterConfig, 500);

  // Hydrate from URL once, after mount. setState-in-effect is required here
  // because URL params are not available during SSR.
  useEffect(() => {
    const parsed = readUrlParams();
    setActiveTab(parsed.tab);
    if (parsed.tubeConfig) setTubeConfig(parsed.tubeConfig);
    if (parsed.adapterConfig) setAdapterConfig(parsed.adapterConfig);
    setHydrated(true);
  }, []);

  // Umami auto-tracking is disabled (see app/layout.tsx) because syncUrl()
  // calls history.replaceState on every form change, which Umami would
  // otherwise count as a pageview. Fire one pageview manually on mount.
  useEffect(() => {
    trackPageview();
  }, []);

  // Keep the URL in sync with the active tab + its config. Skipped until after
  // hydration so we don't overwrite the URL with defaults on first paint.
  useEffect(() => {
    if (!hydrated) return;
    const config =
      activeTab === "tube" ? debouncedTubeConfig : debouncedAdapterConfig;
    syncUrl(activeTab, config);
  }, [
    hydrated,
    activeTab,
    debouncedTubeConfig,
    debouncedAdapterConfig,
  ]);

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

  const activeConfig = activeTab === "tube" ? tubeConfig : adapterConfig;
  const tubeValidation = useMemo(
    () => validateConfig("tube", tubeConfig),
    [tubeConfig],
  );
  const adapterValidation = useMemo(
    () => validateConfig("adapter", adapterConfig),
    [adapterConfig],
  );
  const validation = activeTab === "tube" ? tubeValidation : adapterValidation;
  const exportBlocked = validation.errors.length > 0;
  const activeConfigJson = useMemo(
    () => JSON.stringify(activeConfig),
    [activeConfig],
  );
  const presetModified =
    activePreset !== null && activeConfigJson !== activePreset.snapshot;
  const activeConfigSummary = describeConfig(activeTab, activeConfig);
  const shareUrl = useMemo(
    () => (hydrated ? buildShareUrl(activeTab, activeConfig) : ""),
    [hydrated, activeTab, activeConfig],
  );

  useEffect(() => {
    const stored = window.localStorage.getItem(EXPORT_FORMAT_STORAGE_KEY);
    if (stored === "3mf") setExportFormat("3mf");
    setPresets(listPresets());
  }, []);

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
      trackEvent("share_copy", { tab: activeTab });
    } catch {
      window.prompt("Copy this URL:", shareUrl);
    }
  };

  const handleOpenSaveDialog = () => {
    setPresetsAnchor(null);
    const suggested =
      activeTab === "tube"
        ? `${tubeConfig.shape} ${String(tubeConfig.length)}mm`
        : `${adapterConfig.endA.shape}→${adapterConfig.endB.shape} ${String(adapterConfig.bendAngle)}°`;
    setSaveDialogName(suggested);
    setSaveDialogOpen(true);
  };

  const handleSavePreset = () => {
    const config = activeTab === "tube" ? tubeConfig : adapterConfig;
    const preset = savePreset(saveDialogName, activeTab, config);
    setPresets(listPresets());
    setSaveDialogOpen(false);
    setActivePreset({
      id: preset.id,
      name: preset.name,
      snapshot: JSON.stringify(config),
    });
    setToast(`Saved preset "${preset.name}"`);
    trackEvent("preset_save", { tab: activeTab });
  };

  const handleLoadPreset = (preset: Preset) => {
    setActiveTab(preset.tab);
    if (preset.tab === "tube") {
      setTubeConfig(preset.config as TubeConfig);
    } else {
      setAdapterConfig(preset.config as AdapterConfig);
    }
    setActivePreset({
      id: preset.id,
      name: preset.name,
      snapshot: JSON.stringify(preset.config),
    });
    setPresetsAnchor(null);
    setToast(`Loaded preset "${preset.name}"`);
    trackEvent("preset_load", { tab: preset.tab });
  };

  const handleDeletePreset = (preset: Preset) => {
    deletePreset(preset.id);
    setPresets(listPresets());
    if (activePreset?.id === preset.id) setActivePreset(null);
    setToast(`Deleted preset "${preset.name}"`);
    trackEvent("preset_delete", { tab: preset.tab });
  };

  const handleClearActivePreset = () => {
    setActivePreset(null);
  };

  const handleDownload = () => {
    if (exportBlocked || exporting) return;

    setExporting(true);
    try {
      if (activeTab === "tube") {
        const shapeName = tubeConfig.shape;
        const clamshellSuffix = tubeConfig.clamshell.enabled ? "-clamshell" : "";
        const base = `tube-${shapeName}${clamshellSuffix}-${String(tubeConfig.length)}mm`;
        const filename = `${base}.${exportFormat}`;
        exportTubeModel(tubeConfig, exportFormat, filename);
        trackEvent("download", {
          type: "tube",
          format: exportFormat,
          shape: shapeName,
          length: tubeConfig.length,
          clamshell: tubeConfig.clamshell.enabled,
          flare: tubeConfig.flare.enabled,
          topCut: tubeConfig.topCut.type,
          bottomCut: tubeConfig.bottomCut.type,
        });
      } else {
        const base = `adapter-${adapterConfig.endA.shape}-to-${adapterConfig.endB.shape}-${String(adapterConfig.bendAngle)}deg`;
        const filename = `${base}.${exportFormat}`;
        exportAdapterModel(adapterConfig, exportFormat, filename);
        trackEvent("download", {
          type: "adapter",
          format: exportFormat,
          endA: adapterConfig.endA.shape,
          endB: adapterConfig.endB.shape,
          bendAngle: adapterConfig.bendAngle,
          endAFit: adapterConfig.endAFit,
          endBFit: adapterConfig.endBFit,
        });
      }
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
    if (activeTab === "tube") {
      setTubeConfig(DEFAULT_ROUND_CONFIG);
    } else {
      setAdapterConfig(DEFAULT_ADAPTER_CONFIG);
    }
  };

  const getTubeBadges = () => {
    const badges: { label: string; color: string }[] = [];

    if (tubeConfig.clamshell.enabled) {
      badges.push({
        label: "Clamshell",
        color: "#06b6d4",
      });
    }

    if (tubeConfig.flare.enabled && tubeConfig.topCut.type === "flat") {
      badges.push({
        label: `Press-Fit (${tubeConfig.flare.fitType})`,
        color: "#ec4899",
      });
    }

    if (tubeConfig.topCut.type !== "flat") {
      badges.push({
        label: `Top: ${tubeConfig.topCut.type}`,
        color: "#a855f7",
      });
    }

    if (tubeConfig.bottomCut.type !== "flat") {
      badges.push({
        label: `Bottom: ${tubeConfig.bottomCut.type}`,
        color: "#f97316",
      });
    }

    return badges;
  };

  const getAdapterBadges = () => {
    const badges: { label: string; color: string }[] = [];

    if (adapterConfig.endA.shape !== adapterConfig.endB.shape) {
      badges.push({
        label: `${adapterConfig.endA.shape} → ${adapterConfig.endB.shape}`,
        color: "#3b82f6",
      });
    }

    if (
      adapterConfig.endAFit !== "socket" ||
      adapterConfig.endBFit !== "socket"
    ) {
      const fitLabel = `A: ${adapterConfig.endAFit} / B: ${adapterConfig.endBFit}`;
      badges.push({
        label: fitLabel,
        color: "#ec4899",
      });
    }

    if (adapterConfig.bendAngle > 0) {
      badges.push({
        label: `${String(adapterConfig.bendAngle)}° elbow`,
        color: "#a855f7",
      });
    } else {
      badges.push({
        label: "Straight coupling",
        color: "#22c55e",
      });
    }

    return badges;
  };

  const badges = activeTab === "tube" ? getTubeBadges() : getAdapterBadges();

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        flexDirection: { xs: "column", lg: "row" },
      }}
    >
      {/* Sidebar Controls */}
      <Box
        component="aside"
        sx={{
          width: { xs: "100%", lg: 320, xl: 384 },
          height: { lg: "100vh" },
          position: { lg: "sticky" },
          top: 0,
          borderBottom: { xs: 1, lg: 0 },
          borderRight: { lg: 1 },
          borderColor: "divider",
          bgcolor: "background.paper",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            px: 2,
            py: 1.5,
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Box
            sx={{
              display: "flex",
              height: 32,
              width: 32,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 1.5,
              bgcolor: "primary.main",
            }}
          >
            <Cylinder size={18} color="#ffffff" />
          </Box>
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>
              TubeCraft
            </Typography>
            <Typography variant="caption" color="text.secondary">
              3D Printable Tube Generator
            </Typography>
          </Box>
        </Box>

        {/* Tab Navigation */}
        <Tabs
          value={activeTab}
          onChange={(_, v: TabType) => handleTabChange(v)}
          variant="fullWidth"
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            "& .MuiTabs-indicator": { height: 3 },
          }}
        >
          <Tab
            icon={<Cylinder size={16} />}
            iconPosition="start"
            label="Tubes"
            value="tube"
          />
          <Tab
            icon={<Link2 size={16} />}
            iconPosition="start"
            label="Adapters"
            value="adapter"
          />
        </Tabs>

        {/* Controls */}
        <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
          {activeTab === "tube" ? (
            <TubeControls
              config={tubeConfig}
              onChange={setTubeConfig}
              validation={tubeValidation}
            />
          ) : (
            <AdapterControls
              config={adapterConfig}
              onChange={setAdapterConfig}
              validation={adapterValidation}
            />
          )}
        </Box>

        {/* Actions */}
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
                  secondary={`Saves the active ${activeTab}`}
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
                    <ListItemText
                      primary={p.name}
                      secondary={p.tab}
                      slotProps={{
                        secondary: { sx: { textTransform: "capitalize" } },
                      }}
                    />
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

        <Box
          sx={{
            borderTop: 1,
            borderColor: "divider",
            px: 2,
            py: 1,
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={1}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="caption" color="text.secondary">
                Made with{" "}
                <Heart
                  size={12}
                  color="#ef4444"
                  fill="#ef4444"
                  style={{ verticalAlign: "middle" }}
                />{" "}
                by Sascha
              </Typography>
              <Box
                component="a"
                href="https://github.com/saschb2b/tubecraft"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  color: "text.secondary",
                  "&:hover": { color: "text.primary" },
                }}
              >
                <GitHubIcon sx={{ fontSize: 16 }} />
              </Box>
            </Stack>
            <Box
              component="a"
              href="https://buymeacoffee.com/qohreuukw"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                color: "text.secondary",
                textDecoration: "none",
                "&:hover": { color: "text.primary" },
              }}
            >
              <Coffee size={14} />
              <Typography variant="caption">Support</Typography>
            </Box>
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
                key={i}
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

        <PreviewPanel
          activeTab={activeTab}
          tubeConfig={tubeConfig}
          adapterConfig={adapterConfig}
        />
      </Box>

      <ThankYouDrawer
        open={showThankYou}
        exportFormat={exportFormat}
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
        activeTab={activeTab}
        summary={activeConfigSummary}
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
