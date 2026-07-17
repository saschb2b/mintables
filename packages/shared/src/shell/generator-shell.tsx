"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
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
import { useTheme } from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
  Bookmark,
  ChevronDown,
  Download,
  Eye,
  Redo2,
  RotateCcw,
  Share2,
  SlidersHorizontal,
  Trash2,
  Undo2,
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
import { requestView, type ViewPreset } from "./viewport-context";

const EXPORT_FORMAT_STORAGE_KEY = "mintables.exportFormat";

interface GeneratorShellProps<C> {
  generator: Generator<C>;
  /**
   * True when this shell's window is the focused one. Multiple shells can
   * coexist in the window layer (each window keeps its own state); only the
   * focused shell may write back to the URL or swallow undo/redo chords.
   * Hosts without a window manager can omit it (defaults to true).
   */
  focused?: boolean;
}

export function GeneratorShell<C>({
  generator,
  focused = true,
}: GeneratorShellProps<C>) {
  const { config, setConfig, resetConfig, undo, redo, canUndo, canRedo } =
    useUndoableConfig<C>(generator.defaults);
  const [hydrated, setHydrated] = useState(false);

  const isFocused = focused;

  const debouncedConfig = useDebouncedValue(config, 500);

  useEffect(() => {
    const { raw, presetId } = readUrlConfig();
    if (raw !== null) {
      const decoded = generator.decode(raw);
      if (decoded) {
        // Fresh URL load: clear undo history so the user can't undo back into
        // the pre-hydration default state they never actually saw.
        resetConfig(decoded);
        // If the URL carried `?preset=<id>` (e.g. opened from the Presets
        // folder window), mark that preset as active so the shell behaves
        // exactly as if the user picked it from the in-shell preset menu.
        if (presetId) {
          const preset = listPresets(generator.id).find(
            (p) => p.id === presetId,
          );
          if (preset) {
            setActivePreset({
              id: preset.id,
              name: preset.name,
              snapshot: JSON.stringify(decoded),
            });
            setToast(`Loaded preset "${preset.name}"`);
            trackEvent("preset_load", {
              generator: generator.id,
              source: "url",
            });
          }
        }
      }
    }
    setHydrated(true);
  }, [generator]);

  useEffect(() => {
    trackPageview();
  }, []);

  useEffect(() => {
    if (!hydrated || !isFocused) return;
    syncUrl(generator.id, debouncedConfig);
  }, [hydrated, isFocused, generator.id, debouncedConfig]);

  // Cmd/Ctrl+Z / Cmd/Ctrl+Shift+Z / Cmd/Ctrl+Y for undo/redo. Gated by
  // `isFocused` so two open generator windows don't both swallow the chord.
  useEffect(() => {
    if (!isFocused) return;
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) {
        return;
      }
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      const key = e.key.toLowerCase();
      if (key === "z" && e.shiftKey) {
        e.preventDefault();
        redo();
      } else if (key === "z") {
        e.preventDefault();
        undo();
      } else if (key === "y") {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [isFocused, undo, redo]);

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
    // Deliberate UX: loading a preset IS undoable. If the user loads a preset
    // and regrets it, Cmd+Z restores the config they were working on.
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
    // Reset drops undo history (different from undo). The user is asking for
    // a clean slate, not for a step they can immediately walk back from.
    resetConfig(generator.defaults);
  };

  const Controls = generator.Controls;
  const Summary = generator.Summary;

  // Below `md` (≈900px) the panes stack vertically, so we swap them for a
  // segmented Controls/Preview tab — like Figma / Affinity on iPad. Default
  // to Controls since opening a generator usually means "configure", not
  // "look at". Above md the side-by-side layout works comfortably (320px
  // controls + ≥500px preview).
  const theme = useTheme();
  const stacked = !useMediaQuery(theme.breakpoints.up("md"));
  const [pane, setPane] = useState<"controls" | "preview">("controls");

  // R3F's <Canvas> tracks size via ResizeObserver, but a parent flipping from
  // display:none to flex doesn't trigger that observer in some browsers — the
  // canvas keeps its stale 0×0 dims until the next window resize. Nudge it.
  useEffect(() => {
    if (!stacked) return;
    if (pane !== "preview") return;
    const t = window.setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 30);
    return () => {
      window.clearTimeout(t);
    };
  }, [stacked, pane]);

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
        flexDirection: "column",
      }}
    >
      {stacked && (
        <PaneToggle
          pane={pane}
          onChange={setPane}
          accent={generator.meta.accent}
        />
      )}
      <Box
        sx={{
          display: "flex",
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          flexDirection: { xs: "column", md: "row" },
        }}
      >
        {/* Sidebar Controls */}
        <Box
          component="aside"
          sx={{
            width: { xs: "100%", md: 320, xl: 384 },
            flexShrink: 0,
            borderRight: { md: 1 },
            borderColor: "divider",
            bgcolor: "background.paper",
            display: stacked && pane !== "controls" ? "none" : "flex",
            flexDirection: "column",
            minHeight: 0,
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
              <Stack
                direction="row"
                spacing={0.5}
                sx={{
                  alignItems: "center",
                }}
              >
                <Tooltip title="Undo (Ctrl+Z)">
                  <span>
                    <IconButton
                      onClick={undo}
                      disabled={!canUndo}
                      size="small"
                      aria-label="Undo"
                    >
                      <Undo2 size={14} />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Redo (Ctrl+Shift+Z)">
                  <span>
                    <IconButton
                      onClick={redo}
                      disabled={!canRedo}
                      size="small"
                      aria-label="Redo"
                    >
                      <Redo2 size={14} />
                    </IconButton>
                  </span>
                </Tooltip>
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
            </Stack>
          </Box>
        </Box>

        {/* Preview area. The info bar's view-preset buttons reach the
        PreviewSceneRig (inside drei's <View>) through a window event
        tagged with this generator's id - cross-portal React context
        doesn't bridge in drei View, events do. */}
        <Box
          component="main"
          sx={{
            flex: 1,
            display: stacked && pane !== "preview" ? "none" : "flex",
            flexDirection: "column",
            minHeight: { md: 0 },
            // Allow this flex item to shrink below the WebGL canvas's
            // intrinsic min-width, otherwise once R3F grows the canvas
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
              useFlexGap
              sx={{
                alignItems: "center",
                flexWrap: "wrap",
              }}
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
            <ViewPresetButtons generatorId={generator.id} />
          </Box>

          <ValidationBanner result={validation} />

          <PreviewPanel
            generator={generator}
            config={debouncedConfig}
            active={isFocused}
          />
        </Box>
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

/**
 * Segmented "Controls / Preview" tab shown above the shell when the viewport
 * is too narrow to fit both panes side by side. Mirrors the iPad design-app
 * pattern (Figma, Affinity) of swapping editor and canvas instead of forcing
 * the user to scroll past one to reach the other.
 */
function PaneToggle({
  pane,
  onChange,
  accent,
}: {
  pane: "controls" | "preview";
  onChange: (p: "controls" | "preview") => void;
  accent: string;
}) {
  return (
    <Stack
      direction="row"
      sx={{
        justifyContent: "center",
        flexShrink: 0,
        px: 1.5,
        py: 1,
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        bgcolor: "rgba(255,255,255,0.025)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      <Stack
        direction="row"
        role="tablist"
        aria-label="Pane"
        sx={{
          bgcolor: "rgba(0,0,0,0.28)",
          borderRadius: 1.5,
          p: 0.3,
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.05)",
        }}
      >
        <PaneTab
          active={pane === "controls"}
          onClick={() => {
            onChange("controls");
          }}
          accent={accent}
        >
          <SlidersHorizontal size={14} />
          <Box component="span">Controls</Box>
        </PaneTab>
        <PaneTab
          active={pane === "preview"}
          onClick={() => {
            onChange("preview");
          }}
          accent={accent}
        >
          <Eye size={14} />
          <Box component="span">Preview</Box>
        </PaneTab>
      </Stack>
    </Stack>
  );
}

function PaneTab({
  active,
  onClick,
  accent,
  children,
}: {
  active: boolean;
  onClick: () => void;
  accent: string;
  children: ReactNode;
}) {
  return (
    <Box
      component="button"
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      sx={{
        all: "unset",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: 0.75,
        minWidth: 116,
        height: 30,
        px: 1.75,
        borderRadius: 1,
        justifyContent: "center",
        fontSize: "0.78rem",
        fontWeight: 600,
        color: active ? "text.primary" : "text.secondary",
        bgcolor: active ? "rgba(255,255,255,0.10)" : "transparent",
        boxShadow: active
          ? `inset 0 0 0 1px rgba(255,255,255,0.06), 0 1px 2px rgba(0,0,0,0.25), inset 0 -1.5px 0 ${accent}55`
          : "none",
        transition: "background-color 140ms ease, color 140ms ease",
        "&:hover": {
          bgcolor: active ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.05)",
          color: "text.primary",
        },
        "&:focus-visible": {
          outline: "2px solid rgba(120, 160, 220, 0.55)",
          outlineOffset: 1,
        },
      }}
    >
      {children}
    </Box>
  );
}

/**
 * Config state with an undo/redo history. Wraps a single value `C` in two
 * stacks (past, future). Identical writes (deep-equal by JSON serialization,
 * matching how `presetModified` already compares configs) are dropped so
 * incidental re-renders don't pollute the timeline. History is capped at 50
 * entries; resetConfig clears both stacks for a true "fresh start".
 */
const HISTORY_LIMIT = 50;

function useUndoableConfig<C>(initial: C): {
  config: C;
  setConfig: (next: C | ((prev: C) => C)) => void;
  resetConfig: (next: C) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
} {
  const [state, setState] = useState<{ past: C[]; present: C; future: C[] }>(
    () => ({ past: [], present: initial, future: [] }),
  );

  // setConfig accepts an updater; we resolve it against the latest present
  // inside setState so concurrent updates compose correctly.
  const setConfig = useCallback((next: C | ((prev: C) => C)) => {
    setState((s) => {
      const resolved =
        typeof next === "function" ? (next as (prev: C) => C)(s.present) : next;
      if (JSON.stringify(resolved) === JSON.stringify(s.present)) {
        return s;
      }
      const past = [...s.past, s.present];
      if (past.length > HISTORY_LIMIT) past.shift();
      return { past, present: resolved, future: [] };
    });
  }, []);

  const resetConfig = useCallback((next: C) => {
    setState({ past: [], present: next, future: [] });
  }, []);

  const undo = useCallback(() => {
    setState((s) => {
      if (s.past.length === 0) return s;
      const past = s.past.slice(0, -1);
      const previous = s.past[s.past.length - 1];
      return { past, present: previous, future: [s.present, ...s.future] };
    });
  }, []);

  const redo = useCallback(() => {
    setState((s) => {
      if (s.future.length === 0) return s;
      const [next, ...rest] = s.future;
      const past = [...s.past, s.present];
      if (past.length > HISTORY_LIMIT) past.shift();
      return { past, present: next, future: rest };
    });
  }, []);

  return {
    config: state.present,
    setConfig,
    resetConfig,
    undo,
    redo,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
  };
}

/**
 * Camera view presets, rendered inline in the info bar above the preview.
 * Used to live as a floating overlay inside the preview area, but with the
 * shared <PreviewStage> canvas painting above WM windows, an in-preview
 * overlay would get covered by the 3D render. Putting the buttons in the
 * chrome row sidesteps the layering entirely and reads cleaner anyway -
 * preset chips + view presets are both "this is the preview, framed".
 */
const VIEW_PRESETS: { id: ViewPreset; label: string }[] = [
  { id: "iso", label: "Iso" },
  { id: "front", label: "Front" },
  { id: "top", label: "Top" },
  { id: "right", label: "Right" },
];

function ViewPresetButtons({ generatorId }: { generatorId: string }) {
  return (
    <Stack
      direction="row"
      role="group"
      aria-label="Camera view presets"
      sx={{
        bgcolor: "rgba(0, 0, 0, 0.28)",
        borderRadius: 1.25,
        p: 0.25,
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.05)",
        flexShrink: 0,
      }}
    >
      {VIEW_PRESETS.map((p) => (
        <Tooltip key={p.id} title={`${p.label} view`}>
          <Box
            component="button"
            type="button"
            onClick={() => {
              requestView(generatorId, p.id);
            }}
            aria-label={`${p.label} view`}
            sx={{
              all: "unset",
              cursor: "pointer",
              minWidth: 42,
              height: 24,
              px: 1,
              borderRadius: 0.85,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.7rem",
              fontWeight: 600,
              letterSpacing: 0.4,
              color: "text.secondary",
              textTransform: "uppercase",
              transition: "background-color 120ms ease, color 120ms ease",
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.08)",
                color: "text.primary",
              },
              "&:focus-visible": {
                outline: "2px solid rgba(120, 160, 220, 0.55)",
                outlineOffset: 1,
              },
            }}
          >
            {p.label}
          </Box>
        </Tooltip>
      ))}
    </Stack>
  );
}
