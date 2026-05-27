"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import InputBase from "@mui/material/InputBase";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import {
  LayoutGrid,
  List as ListIcon,
  Search,
  type LucideIcon,
} from "lucide-react";

export type SortField = "name" | "date" | "kind";
export type SortDir = "asc" | "desc";
export type ViewMode = "icons" | "list";

export interface ExplorerItem {
  id: string;
  name: string;
  /** "Kind" cell in list view + group/sort field — e.g. generator name. */
  kind: string;
  /** Epoch ms — drives the Date column + sort. */
  timestamp: number;
  /** Optional one-line subtitle in icon view. */
  subtitle?: string;
  /** Optional right-aligned metadata in list view (e.g. file format). */
  meta?: string;
  /** The rendered icon component for this item. */
  icon: ReactNode;
}

export interface ExplorerAction<T extends ExplorerItem = ExplorerItem> {
  id: string;
  label: string;
  icon: LucideIcon;
  onClick: (item: T) => void;
  /** Show in red, separated visually. */
  danger?: boolean;
  /** Optional disable predicate. */
  disabled?: (item: T) => boolean;
}

interface FileExplorerProps<T extends ExplorerItem> {
  items: T[];
  /** Triggered on double-click / Enter — typically "Open". */
  onOpen?: (item: T) => void;
  /** Buttons shown in the toolbar when an item is selected. */
  actions?: ExplorerAction<T>[];
  /** Shown when items is empty. */
  emptyState?: ReactNode;
  /** Default view mode (defaults to "icons"). */
  defaultView?: ViewMode;
}

export function FileExplorer<T extends ExplorerItem>({
  items,
  onOpen,
  actions = [],
  emptyState,
  defaultView = "icons",
}: FileExplorerProps<T>) {
  const [view, setView] = useState<ViewMode>(defaultView);
  const [sort, setSort] = useState<SortField>("date");
  const [dir, setDir] = useState<SortDir>("desc");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = q
      ? items.filter(
          (it) =>
            it.name.toLowerCase().includes(q) ||
            it.kind.toLowerCase().includes(q),
        )
      : items;
    const sorted = [...matches].sort((a, b) => {
      const cmp =
        sort === "name"
          ? a.name.localeCompare(b.name)
          : sort === "kind"
            ? a.kind.localeCompare(b.kind)
            : a.timestamp - b.timestamp;
      return dir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [items, query, sort, dir]);

  const selected = filtered.find((it) => it.id === selectedId) ?? null;

  return (
    <Stack sx={{ flex: 1, minHeight: 0 }}>
      {/* ─── Toolbar ─────────────────────────────────────────── */}
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{
          flexShrink: 0,
          px: 1.5,
          py: 1,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          bgcolor: "rgba(255,255,255,0.02)",
        }}
      >
        <ViewToggle view={view} onChange={setView} />

        <Box sx={{ width: "1px", height: 18, bgcolor: "divider", mx: 0.5 }} />

        <SortControl
          sort={sort}
          dir={dir}
          onChangeSort={setSort}
          onChangeDir={setDir}
        />

        <Box sx={{ flex: 1 }} />

        {/* Selected-item actions */}
        {selected && actions.length > 0 && (
          <Stack direction="row" spacing={0.5} alignItems="center">
            {actions.map((a) => {
              const Icon = a.icon;
              const disabled = a.disabled?.(selected) ?? false;
              return (
                <Tooltip key={a.id} title={a.label}>
                  <Box
                    component="button"
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      a.onClick(selected);
                    }}
                    sx={{
                      all: "unset",
                      cursor: disabled ? "default" : "pointer",
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 0.5,
                      fontSize: "0.72rem",
                      fontWeight: 500,
                      color: a.danger
                        ? "rgba(248, 113, 113, 0.95)"
                        : "text.primary",
                      opacity: disabled ? 0.4 : 1,
                      transition: "background-color 120ms ease",
                      "&:hover": {
                        bgcolor: disabled
                          ? "transparent"
                          : a.danger
                            ? "rgba(248, 113, 113, 0.12)"
                            : "rgba(255,255,255,0.08)",
                      },
                    }}
                  >
                    <Icon size={13} />
                    <Box component="span">{a.label}</Box>
                  </Box>
                </Tooltip>
              );
            })}
          </Stack>
        )}

        <SearchBox value={query} onChange={setQuery} />
      </Stack>

      {/* ─── Content ─────────────────────────────────────────── */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          p: view === "icons" ? { xs: 2, sm: 3 } : 0,
        }}
        onClick={(e) => {
          // Click on empty space deselects.
          if (e.target === e.currentTarget) setSelectedId(null);
        }}
      >
        {filtered.length === 0 ? (
          <EmptyState>
            {query.length > 0
              ? `No items match "${query}".`
              : (emptyState ?? "Nothing here yet.")}
          </EmptyState>
        ) : view === "icons" ? (
          <IconGrid
            items={filtered}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onOpen={onOpen}
          />
        ) : (
          <ListView
            items={filtered}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onOpen={onOpen}
          />
        )}
      </Box>

      {/* ─── Status bar ───────────────────────────────────────── */}
      <Stack
        direction="row"
        alignItems="center"
        sx={{
          flexShrink: 0,
          height: 26,
          px: 1.5,
          borderTop: "1px solid rgba(255,255,255,0.06)",
          bgcolor: "rgba(0,0,0,0.18)",
        }}
      >
        <Typography
          variant="caption"
          sx={{ color: "text.secondary", fontSize: "0.7rem" }}
        >
          {filtered.length === items.length
            ? `${String(items.length)} item${items.length === 1 ? "" : "s"}`
            : `${String(filtered.length)} of ${String(items.length)} item${items.length === 1 ? "" : "s"}`}
          {selected && ` · "${selected.name}" selected`}
        </Typography>
      </Stack>
    </Stack>
  );
}

/* ─── Toolbar pieces ──────────────────────────────────────────── */

function ViewToggle({
  view,
  onChange,
}: {
  view: ViewMode;
  onChange: (v: ViewMode) => void;
}) {
  return (
    <Stack
      direction="row"
      sx={{
        bgcolor: "rgba(255,255,255,0.04)",
        borderRadius: 1,
        p: 0.25,
      }}
    >
      <ToggleBtn
        active={view === "icons"}
        onClick={() => {
          onChange("icons");
        }}
        label="Icon view"
      >
        <LayoutGrid size={14} />
      </ToggleBtn>
      <ToggleBtn
        active={view === "list"}
        onClick={() => {
          onChange("list");
        }}
        label="List view"
      >
        <ListIcon size={14} />
      </ToggleBtn>
    </Stack>
  );
}

function ToggleBtn({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: ReactNode;
}) {
  return (
    <Tooltip title={label}>
      <Box
        component="button"
        type="button"
        onClick={onClick}
        aria-label={label}
        aria-pressed={active}
        sx={{
          all: "unset",
          cursor: "pointer",
          width: 26,
          height: 22,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 0.75,
          color: active ? "text.primary" : "text.secondary",
          bgcolor: active ? "rgba(255,255,255,0.10)" : "transparent",
          transition: "background-color 120ms ease, color 120ms ease",
          "&:hover": {
            bgcolor: active ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.06)",
            color: "text.primary",
          },
        }}
      >
        {children}
      </Box>
    </Tooltip>
  );
}

function SortControl({
  sort,
  dir,
  onChangeSort,
  onChangeDir,
}: {
  sort: SortField;
  dir: SortDir;
  onChangeSort: (v: SortField) => void;
  onChangeDir: (v: SortDir) => void;
}) {
  return (
    <Stack direction="row" alignItems="center" spacing={0.5}>
      <Typography
        variant="caption"
        sx={{
          color: "text.secondary",
          fontSize: "0.68rem",
          letterSpacing: 0.5,
          textTransform: "uppercase",
        }}
      >
        Sort
      </Typography>
      <Select<SortField>
        value={sort}
        onChange={(e) => {
          onChangeSort(e.target.value);
        }}
        variant="standard"
        disableUnderline
        sx={{
          fontSize: "0.74rem",
          fontWeight: 600,
          color: "text.primary",
          "& .MuiSelect-select": { py: 0.25, pr: "20px !important", pl: 0.75 },
          "& .MuiSelect-icon": { color: "text.secondary", right: 0 },
        }}
      >
        <MenuItem value="date">Date</MenuItem>
        <MenuItem value="name">Name</MenuItem>
        <MenuItem value="kind">Kind</MenuItem>
      </Select>
      <Tooltip title={dir === "asc" ? "Ascending" : "Descending"}>
        <Box
          component="button"
          type="button"
          onClick={() => {
            onChangeDir(dir === "asc" ? "desc" : "asc");
          }}
          aria-label="Toggle sort direction"
          sx={{
            all: "unset",
            cursor: "pointer",
            width: 18,
            height: 18,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 0.5,
            color: "text.secondary",
            fontSize: "0.85rem",
            transition: "color 120ms ease, background-color 120ms ease",
            "&:hover": {
              color: "text.primary",
              bgcolor: "rgba(255,255,255,0.06)",
            },
          }}
        >
          {dir === "asc" ? "↑" : "↓"}
        </Box>
      </Tooltip>
    </Stack>
  );
}

function SearchBox({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={0.5}
      sx={{
        bgcolor: "rgba(255,255,255,0.06)",
        borderRadius: 1,
        px: 0.85,
        py: 0.25,
        minWidth: 160,
        maxWidth: 220,
        "&:focus-within": {
          bgcolor: "rgba(255,255,255,0.10)",
          boxShadow: "0 0 0 2px rgba(255,255,255,0.12)",
        },
      }}
    >
      <Search size={13} style={{ color: "var(--mui-palette-text-secondary)" }} />
      <InputBase
        placeholder="Search"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        sx={{
          flex: 1,
          fontSize: "0.74rem",
          color: "text.primary",
          "& input": { p: 0 },
        }}
      />
    </Stack>
  );
}

/* ─── Views ───────────────────────────────────────────────────── */

function IconGrid<T extends ExplorerItem>({
  items,
  selectedId,
  onSelect,
  onOpen,
}: {
  items: T[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onOpen?: (item: T) => void;
}) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "repeat(auto-fill, minmax(96px, 1fr))",
          sm: "repeat(auto-fill, minmax(108px, 1fr))",
        },
        gap: { xs: 1.5, sm: 2 },
      }}
    >
      {items.map((it) => {
        const selected = it.id === selectedId;
        return (
          <Stack
            key={it.id}
            alignItems="center"
            spacing={0.75}
            tabIndex={0}
            role="button"
            aria-label={`Open ${it.name}`}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(it.id);
            }}
            onDoubleClick={() => onOpen?.(it)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (selected) onOpen?.(it);
                else onSelect(it.id);
              }
            }}
            sx={{
              cursor: "pointer",
              borderRadius: 1.5,
              p: 1,
              transition: "background-color 120ms ease",
              bgcolor: selected ? "rgba(120, 160, 220, 0.22)" : "transparent",
              "&:hover": {
                bgcolor: selected
                  ? "rgba(120, 160, 220, 0.28)"
                  : "rgba(255, 255, 255, 0.04)",
              },
              "&:focus-visible": {
                outline: "none",
                bgcolor: "rgba(120, 160, 220, 0.28)",
              },
            }}
          >
            <Box
              sx={{
                width: 56,
                height: 56,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {it.icon}
            </Box>
            <Typography
              sx={{
                fontSize: "0.74rem",
                fontWeight: 500,
                color: selected ? "text.primary" : "rgba(255,255,255,0.86)",
                textAlign: "center",
                lineHeight: 1.2,
                wordBreak: "break-word",
              }}
            >
              {it.name}
            </Typography>
            {it.subtitle && (
              <Typography
                sx={{
                  fontSize: "0.66rem",
                  color: "text.secondary",
                  textAlign: "center",
                  lineHeight: 1.2,
                }}
              >
                {it.subtitle}
              </Typography>
            )}
          </Stack>
        );
      })}
    </Box>
  );
}

function ListView<T extends ExplorerItem>({
  items,
  selectedId,
  onSelect,
  onOpen,
}: {
  items: T[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onOpen?: (item: T) => void;
}) {
  return (
    <Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
      <Box
        component="thead"
        sx={{
          "& th": {
            position: "sticky",
            top: 0,
            zIndex: 1,
            textAlign: "left",
            fontSize: "0.66rem",
            fontWeight: 600,
            letterSpacing: 0.6,
            textTransform: "uppercase",
            color: "text.secondary",
            px: 1.5,
            py: 1,
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            bgcolor: "rgba(20,22,32,0.85)",
            backdropFilter: "blur(8px)",
          },
        }}
      >
        <tr>
          <th>Name</th>
          <th>Kind</th>
          <th>Date Modified</th>
          <th style={{ textAlign: "right" }}>Format</th>
        </tr>
      </Box>
      <Box component="tbody">
        {items.map((it) => {
          const selected = it.id === selectedId;
          return (
            <Box
              key={it.id}
              component="tr"
              tabIndex={0}
              role="row"
              onClick={() => {
                onSelect(it.id);
              }}
              onDoubleClick={() => onOpen?.(it)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  if (selected) onOpen?.(it);
                  else onSelect(it.id);
                }
              }}
              sx={{
                cursor: "pointer",
                transition: "background-color 120ms ease",
                bgcolor: selected
                  ? "rgba(120, 160, 220, 0.22)"
                  : "transparent",
                "&:hover": {
                  bgcolor: selected
                    ? "rgba(120, 160, 220, 0.28)"
                    : "rgba(255,255,255,0.04)",
                },
                "&:focus-visible": {
                  outline: "none",
                  bgcolor: "rgba(120, 160, 220, 0.28)",
                },
                "& td": {
                  px: 1.5,
                  py: 0.85,
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  fontSize: "0.78rem",
                  color: "text.primary",
                  verticalAlign: "middle",
                },
                "& td.muted": {
                  color: "text.secondary",
                  fontSize: "0.74rem",
                },
              }}
            >
              <td>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ width: 22, height: 22, flexShrink: 0 }}>
                    {it.icon}
                  </Box>
                  <Box component="span" sx={{ fontWeight: 500 }}>
                    {it.name}
                  </Box>
                </Stack>
              </td>
              <td className="muted">{it.kind}</td>
              <td className="muted">{formatTimestamp(it.timestamp)}</td>
              <td
                className="muted"
                style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}
              >
                {it.meta ?? "—"}
              </td>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "text.secondary",
        textAlign: "center",
        p: 4,
      }}
    >
      <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>
        {children}
      </Typography>
    </Box>
  );
}

/* ─── Helpers ─────────────────────────────────────────────────── */

export function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) {
    return `Today ${d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}`;
  }
  const yesterday = new Date(now.getTime() - 86400_000);
  if (d.toDateString() === yesterday.toDateString()) {
    return `Yesterday ${d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}`;
  }
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: d.getFullYear() === now.getFullYear() ? undefined : "numeric",
  });
}
