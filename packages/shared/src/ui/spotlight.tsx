"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import InputBase from "@mui/material/InputBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {
  Bookmark,
  Download as DownloadIcon,
  Search,
  Sparkles,
} from "lucide-react";
import type { AnyGenerator } from "../lib/generator";
import {
  buildShareUrl,
  listAllPresets,
  PRESETS_CHANGED_EVENT,
  type Preset,
} from "../lib/preset-storage";
import {
  DOWNLOADS_CHANGED_EVENT,
  listDownloads,
  type DownloadEntry,
} from "../lib/download-storage";
import { useWindowManager } from "../lib/window-manager";

export const SPOTLIGHT_OPEN_EVENT = "mintables:spotlight-open";

type ResultKind = "generator" | "preset" | "download";

interface BaseResult {
  id: string;
  kind: ResultKind;
  name: string;
  kindLabel: string;
  accent: string;
  icon: ReactNode;
}

interface GeneratorResult extends BaseResult {
  kind: "generator";
  generator: AnyGenerator;
}

interface PresetResult extends BaseResult {
  kind: "preset";
  preset: Preset;
  generator: AnyGenerator | null;
}

interface DownloadResult extends BaseResult {
  kind: "download";
  download: DownloadEntry;
  generator: AnyGenerator | null;
}

type Result = GeneratorResult | PresetResult | DownloadResult;

/**
 * Spotlight: a floating command palette toggled by Cmd/Ctrl+K. Fuzzy (substring)
 * search across generators, presets, and downloads. Self-contained: it owns its
 * open/close state and listens for both the keyboard shortcut and a custom event
 * (SPOTLIGHT_OPEN_EVENT) so any component can trigger it without prop-drilling.
 */
export function Spotlight({
  generators,
}: {
  generators: AnyGenerator[];
}): React.JSX.Element {
  const router = useRouter();
  const { openWindow } = useWindowManager();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [downloads, setDownloads] = useState<DownloadEntry[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  // Track the element focused at open time so we can restore on close.
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const generatorsById = useMemo(() => {
    const map = new Map<string, AnyGenerator>();
    for (const g of generators) map.set(g.id, g);
    return map;
  }, [generators]);

  const refreshStorage = useCallback(() => {
    setPresets(listAllPresets());
    setDownloads(listDownloads());
  }, []);

  // Open / close handlers ------------------------------------------------
  const handleOpen = useCallback(() => {
    previousFocusRef.current =
      typeof document !== "undefined"
        ? (document.activeElement as HTMLElement | null)
        : null;
    refreshStorage();
    setQuery("");
    setSelectedIndex(0);
    setOpen(true);
  }, [refreshStorage]);

  const handleClose = useCallback(() => {
    setOpen(false);
    // Restore focus to whatever owned it before we opened.
    const prev = previousFocusRef.current;
    if (prev && typeof prev.focus === "function") {
      // Defer so the palette is gone before refocus to avoid a focus battle.
      window.setTimeout(() => {
        prev.focus();
      }, 0);
    }
  }, []);

  // Global keyboard shortcut + custom event -----------------------------
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      const isCmdK =
        (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
      if (!isCmdK) return;
      // Allow toggling-off from anywhere (even when an <input> inside the
      // palette is focused) but suppress while typing in other inputs.
      if (!open) {
        const t = e.target as HTMLElement | null;
        const inField =
          t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA");
        if (inField) return;
        e.preventDefault();
        handleOpen();
        return;
      }
      e.preventDefault();
      handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [open, handleOpen, handleClose]);

  useEffect(() => {
    const onOpen = () => {
      if (!open) handleOpen();
    };
    window.addEventListener(SPOTLIGHT_OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener(SPOTLIGHT_OPEN_EVENT, onOpen);
    };
  }, [open, handleOpen]);

  // Re-fetch on storage changes (only while open: we re-fetch on open too).
  useEffect(() => {
    if (!open) return;
    const sync = () => {
      refreshStorage();
    };
    window.addEventListener(PRESETS_CHANGED_EVENT, sync);
    window.addEventListener(DOWNLOADS_CHANGED_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(PRESETS_CHANGED_EVENT, sync);
      window.removeEventListener(DOWNLOADS_CHANGED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [open, refreshStorage]);

  // Focus input on open.
  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
    return () => {
      window.clearTimeout(id);
    };
  }, [open]);

  // Build all candidate results ----------------------------------------
  const allResults = useMemo<Result[]>(() => {
    const genResults: GeneratorResult[] = generators.map((g) => ({
      id: `generator:${g.id}`,
      kind: "generator",
      name: g.meta.name,
      kindLabel: "Generator",
      accent: g.meta.accent,
      icon: <GeneratorIcon generator={g} />,
      generator: g,
    }));
    const presetResults: PresetResult[] = presets.map((p) => {
      const gen = generatorsById.get(p.generatorId) ?? null;
      return {
        id: `preset:${p.id}`,
        kind: "preset",
        name: p.name,
        kindLabel: gen ? `Preset · ${gen.meta.name}` : "Preset",
        accent: gen?.meta.accent ?? "#a855f7",
        icon: <PresetIcon accent={gen?.meta.accent ?? "#a855f7"} />,
        preset: p,
        generator: gen,
      };
    });
    const downloadResults: DownloadResult[] = downloads.map((d) => {
      const gen = generatorsById.get(d.generatorId) ?? null;
      return {
        id: `download:${d.id}`,
        kind: "download",
        name: d.filename,
        kindLabel: gen ? `Download · ${gen.meta.name}` : "Download",
        accent: gen?.meta.accent ?? "#60a5fa",
        icon: <DownloadIconTile accent={gen?.meta.accent ?? "#60a5fa"} />,
        download: d,
        generator: gen,
      };
    });
    return [...genResults, ...presetResults, ...downloadResults];
  }, [generators, presets, downloads, generatorsById]);

  // Filter + group -------------------------------------------------------
  const grouped = useMemo<{
    flat: Result[];
    sections: { label: string; items: Result[] }[];
  }>(() => {
    const q = query.trim().toLowerCase();
    const matchesGenerator = (r: GeneratorResult) => {
      if (!q) return true;
      return (
        r.generator.meta.name.toLowerCase().includes(q) ||
        r.generator.meta.tagline.toLowerCase().includes(q)
      );
    };
    const matchesPreset = (r: PresetResult) => {
      if (!q) return true;
      const genName = r.generator?.meta.name.toLowerCase() ?? "";
      return r.preset.name.toLowerCase().includes(q) || genName.includes(q);
    };
    const matchesDownload = (r: DownloadResult) => {
      if (!q) return true;
      const genName = r.generator?.meta.name.toLowerCase() ?? "";
      return (
        r.download.filename.toLowerCase().includes(q) || genName.includes(q)
      );
    };

    let gens = allResults.filter(
      (r): r is GeneratorResult => r.kind === "generator",
    );
    let pres = allResults.filter(
      (r): r is PresetResult => r.kind === "preset",
    );
    let dls = allResults.filter(
      (r): r is DownloadResult => r.kind === "download",
    );

    if (q) {
      gens = gens.filter(matchesGenerator);
      pres = pres.filter(matchesPreset);
      dls = dls.filter(matchesDownload);
    } else {
      // Empty query: show top 5 of each kind, recent-first for stored items.
      gens = gens.slice(0, 5);
      pres = [...pres]
        .sort((a, b) => b.preset.createdAt - a.preset.createdAt)
        .slice(0, 5);
      dls = [...dls]
        .sort((a, b) => b.download.createdAt - a.download.createdAt)
        .slice(0, 5);
    }

    const sections: { label: string; items: Result[] }[] = [];
    if (gens.length > 0) sections.push({ label: "Generators", items: gens });
    if (pres.length > 0) sections.push({ label: "Presets", items: pres });
    if (dls.length > 0) sections.push({ label: "Downloads", items: dls });

    const flat: Result[] = [];
    for (const s of sections) flat.push(...s.items);
    return { flat, sections };
  }, [allResults, query]);

  // Clamp selection when results change.
  useEffect(() => {
    setSelectedIndex((idx) => {
      if (grouped.flat.length === 0) return 0;
      if (idx >= grouped.flat.length) return grouped.flat.length - 1;
      if (idx < 0) return 0;
      return idx;
    });
  }, [grouped.flat.length]);

  // Reset selection to the top whenever the query changes.
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Scroll selected row into view.
  useEffect(() => {
    if (!open) return;
    const root = listRef.current;
    if (!root) return;
    const el = root.querySelector<HTMLElement>(
      `[data-spotlight-index="${String(selectedIndex)}"]`,
    );
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [open, selectedIndex]);

  // Activation ----------------------------------------------------------
  const activate = useCallback(
    (result: Result) => {
      if (result.kind === "generator") {
        openWindow({
          kind: "generator",
          generatorId: result.generator.id,
        });
        handleClose();
        return;
      }
      if (result.kind === "preset") {
        const gen = result.generator;
        if (!gen) {
          handleClose();
          return;
        }
        const target = new URL(buildShareUrl(gen.id, result.preset.config));
        target.searchParams.set("preset", result.preset.id);
        router.push(target.pathname + target.search);
        handleClose();
        return;
      }
      // Download: open generator with the recorded config, no preset marker.
      const gen = result.generator;
      if (!gen) {
        handleClose();
        return;
      }
      const target = new URL(buildShareUrl(gen.id, result.download.config));
      router.push(target.pathname + target.search);
      handleClose();
    },
    [openWindow, router, handleClose],
  );

  // Palette-local key handling. Stops propagation so file-explorer's global
  // listener doesn't fight us on arrow keys / Enter / Esc.
  const handlePaletteKey = useCallback(
    (e: ReactKeyboardEvent<HTMLDivElement>) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        e.stopPropagation();
        setSelectedIndex((idx) => {
          if (grouped.flat.length === 0) return 0;
          return (idx + 1) % grouped.flat.length;
        });
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        e.stopPropagation();
        setSelectedIndex((idx) => {
          if (grouped.flat.length === 0) return 0;
          return (idx - 1 + grouped.flat.length) % grouped.flat.length;
        });
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        if (grouped.flat.length === 0) return;
        activate(grouped.flat[selectedIndex]);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        handleClose();
      }
    },
    [grouped.flat, selectedIndex, activate, handleClose],
  );

  const handleBackdropClick = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) handleClose();
    },
    [handleClose],
  );

  if (!open) return <></>;

  return (
    <Box
      role="presentation"
      onClick={handleBackdropClick}
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 1400,
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        bgcolor: "rgba(0, 0, 0, 0.32)",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        pt: "14vh",
        animation: "spotlight-fade 140ms ease-out",
        "@keyframes spotlight-fade": {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
      }}
    >
      <Box
        role="dialog"
        aria-modal="true"
        aria-label="Spotlight"
        onKeyDown={handlePaletteKey}
        sx={{
          width: "min(640px, calc(100vw - 32px))",
          maxHeight: "70vh",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
          bgcolor: "rgba(20, 22, 32, 0.92)",
          backdropFilter: "blur(28px) saturate(160%)",
          WebkitBackdropFilter: "blur(28px) saturate(160%)",
          border: "1px solid rgba(255, 255, 255, 0.10)",
          borderRadius: "16px",
          boxShadow:
            "0 40px 90px -22px rgba(0, 0, 0, 0.75), 0 10px 28px -8px rgba(0, 0, 0, 0.4)",
          animation:
            "spotlight-pop 180ms cubic-bezier(0.2, 0.85, 0.25, 1) forwards",
          "@keyframes spotlight-pop": {
            from: { opacity: 0, transform: "translateY(-6px) scale(0.985)" },
            to: { opacity: 1, transform: "translateY(0) scale(1)" },
          },
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background:
              "linear-gradient(90deg, transparent 0%, rgba(120, 160, 220, 0.7) 50%, transparent 100%)",
            opacity: 0.65,
            pointerEvents: "none",
          },
        }}
      >
        {/* Search row */}
        <Stack
          direction="row"
          spacing={1.25}
          sx={{
            alignItems: "center",
            flexShrink: 0,
            height: 56,
            px: 2,
            borderBottom: "1px solid rgba(255, 255, 255, 0.06)"
          }}>
          <Search
            size={18}
            style={{ color: "var(--mui-palette-text-secondary)" }}
          />
          <InputBase
            inputRef={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
            }}
            placeholder="Search generators, presets, downloads…"
            sx={{
              flex: 1,
              fontSize: "1rem",
              color: "text.primary",
              "& input": { p: 0 },
              "& input::placeholder": {
                color: "text.secondary",
                opacity: 0.85,
              },
            }}
          />
        </Stack>

        {/* Results */}
        <Box
          ref={listRef}
          role="listbox"
          aria-label="Spotlight results"
          sx={{
            flex: 1,
            minHeight: 0,
            overflow: "auto",
            py: grouped.sections.length > 0 ? 0.5 : 0,
          }}
        >
          {grouped.flat.length === 0 ? (
            <EmptyState query={query} />
          ) : (
            grouped.sections.map((section) => {
              // Compute the global index offset for each item in the section.
              let runningIdx = 0;
              for (const s of grouped.sections) {
                if (s === section) break;
                runningIdx += s.items.length;
              }
              return (
                <Box key={section.label}>
                  <Typography
                    sx={{
                      px: 2,
                      pt: 1.25,
                      pb: 0.5,
                      fontSize: "0.62rem",
                      fontWeight: 600,
                      letterSpacing: 0.6,
                      textTransform: "uppercase",
                      color: "text.secondary",
                    }}
                  >
                    {section.label}
                  </Typography>
                  {section.items.map((item, i) => {
                    const idx = runningIdx + i;
                    const selected = idx === selectedIndex;
                    return (
                      <ResultRow
                        key={item.id}
                        item={item}
                        selected={selected}
                        index={idx}
                        onHover={() => {
                          setSelectedIndex(idx);
                        }}
                        onActivate={() => {
                          activate(item);
                        }}
                      />
                    );
                  })}
                </Box>
              );
            })
          )}
        </Box>

        {/* Footer hint bar */}
        <Stack
          direction="row"
          spacing={2}
          sx={{
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            height: 28,
            px: 1.5,
            borderTop: "1px solid rgba(255, 255, 255, 0.06)",
            bgcolor: "rgba(0, 0, 0, 0.18)"
          }}>
          <HintItem keys="↑↓" label="Navigate" />
          <HintItem keys="↵" label="Open" />
          <HintItem keys="Esc" label="Close" />
        </Stack>
      </Box>
    </Box>
  );
}

/* ─── Result row ───────────────────────────────────────────────── */

function ResultRow({
  item,
  selected,
  index,
  onHover,
  onActivate,
}: {
  item: Result;
  selected: boolean;
  index: number;
  onHover: () => void;
  onActivate: () => void;
}) {
  return (
    <Box
      role="option"
      aria-selected={selected}
      data-spotlight-index={index}
      onMouseEnter={onHover}
      onClick={onActivate}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.25,
        mx: 1,
        px: 1.25,
        height: 44,
        borderRadius: 1.25,
        cursor: "pointer",
        bgcolor: selected ? "rgba(120, 160, 220, 0.22)" : "transparent",
        transition: "background-color 80ms ease",
      }}
    >
      <Box
        sx={{
          width: 28,
          height: 28,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {item.icon}
      </Box>
      <Typography
        sx={{
          flex: 1,
          fontSize: "0.88rem",
          fontWeight: 500,
          color: "text.primary",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {item.name}
      </Typography>
      <Typography
        sx={{
          fontSize: "0.72rem",
          color: "text.secondary",
          flexShrink: 0,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {item.kindLabel}
      </Typography>
    </Box>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <Box
      sx={{
        py: 5,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1,
        color: "text.secondary",
      }}
    >
      <Sparkles size={18} />
      <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>
        {query.trim().length > 0
          ? `No matches for "${query.trim()}".`
          : "Nothing to show yet."}
      </Typography>
    </Box>
  );
}

function HintItem({ keys, label }: { keys: string; label: string }) {
  return (
    <Stack direction="row" spacing={0.6} sx={{
      alignItems: "center"
    }}>
      <Box
        component="span"
        sx={{
          fontSize: "0.66rem",
          fontWeight: 600,
          color: "text.secondary",
          bgcolor: "rgba(255, 255, 255, 0.06)",
          borderRadius: 0.75,
          px: 0.65,
          py: 0.1,
          letterSpacing: 0.4,
        }}
      >
        {keys}
      </Box>
      <Typography
        variant="caption"
        sx={{ color: "text.secondary", fontSize: "0.7rem" }}
      >
        {label}
      </Typography>
    </Stack>
  );
}

/* ─── Icons ────────────────────────────────────────────────────── */

function GeneratorIcon({ generator }: { generator: AnyGenerator }) {
  const Icon = generator.meta.icon;
  return (
    <Box
      sx={{
        width: 28,
        height: 28,
        borderRadius: 1.25,
        background: `linear-gradient(180deg, ${generator.meta.accent} 0%, ${generator.meta.accent}cc 100%)`,
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.2), 0 2px 4px rgba(0,0,0,0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
      }}
    >
      <Icon size={15} />
    </Box>
  );
}

function PresetIcon({ accent }: { accent: string }) {
  return (
    <Box
      sx={{
        width: 24,
        height: 26,
        position: "relative",
        borderRadius: 0.75,
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(225,228,238,0.92) 100%)",
        boxShadow:
          "0 1px 2px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          background: `linear-gradient(180deg, ${accent} 0%, ${accent}cc 100%)`,
        },
      }}
    >
      <Bookmark
        size={12}
        style={{ color: accent, marginTop: 5 }}
        fill={accent}
      />
    </Box>
  );
}

function DownloadIconTile({ accent }: { accent: string }) {
  return (
    <Box
      sx={{
        width: 28,
        height: 28,
        borderRadius: 1.25,
        bgcolor: "rgba(255, 255, 255, 0.06)",
        boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: accent,
      }}
    >
      <DownloadIcon size={15} />
    </Box>
  );
}
