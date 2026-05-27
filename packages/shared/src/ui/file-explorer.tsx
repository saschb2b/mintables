"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { KeyboardEvent, MouseEvent, ReactNode } from "react";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import InputBase from "@mui/material/InputBase";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MuiMenuItem from "@mui/material/MenuItem";
import MuiSelect from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import {
  Check,
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
  /** Receives all currently-selected items. Bulk-safe. */
  onClick: (items: T[]) => void;
  /** Show in red, with a Divider separating from the rest. */
  danger?: boolean;
  /** Hide the action when more than one item is selected. */
  singleOnly?: boolean;
  /** Optional keyboard hint shown in the context menu (e.g. "⌫"). */
  shortcut?: string;
}

interface FileExplorerProps<T extends ExplorerItem> {
  items: T[];
  /** Triggered on double-click / Enter — typically "Open". Single-item. */
  onOpen?: (item: T) => void;
  /** When provided, items become renameable via F2 / context menu. */
  onRename?: (item: T, newName: string) => void;
  /** Buttons shown in the toolbar action bar + context menu. */
  actions?: ExplorerAction<T>[];
  /** Shown when items is empty. */
  emptyState?: ReactNode;
  /** Default view mode (defaults to "icons"). */
  defaultView?: ViewMode;
}

interface ContextMenuTarget {
  x: number;
  y: number;
  /** Items the menu should act on. Empty array means the empty-area menu. */
  itemIds: string[];
}

export function FileExplorer<T extends ExplorerItem>({
  items,
  onOpen,
  onRename,
  actions = [],
  emptyState,
  defaultView = "icons",
}: FileExplorerProps<T>) {
  const [view, setView] = useState<ViewMode>(defaultView);
  const [sort, setSort] = useState<SortField>("date");
  const [dir, setDir] = useState<SortDir>("desc");
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [anchorId, setAnchorId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [menu, setMenu] = useState<ContextMenuTarget | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);

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

  /** Items that survived filtering AND are currently selected. */
  const selectedItems = useMemo(
    () => filtered.filter((it) => selectedIds.has(it.id)),
    [filtered, selectedIds],
  );

  /** Drop any selected ids that no longer exist (e.g. after delete). */
  useEffect(() => {
    const validIds = new Set(items.map((it) => it.id));
    setSelectedIds((prev) => {
      let changed = false;
      const next = new Set<string>();
      for (const id of prev) {
        if (validIds.has(id)) next.add(id);
        else changed = true;
      }
      return changed ? next : prev;
    });
    if (renamingId && !validIds.has(renamingId)) setRenamingId(null);
  }, [items, renamingId]);

  const handleSelect = useCallback(
    (id: string, modifiers: { ctrl?: boolean; shift?: boolean }) => {
      if (modifiers.shift && anchorId) {
        const anchorIdx = filtered.findIndex((it) => it.id === anchorId);
        const clickIdx = filtered.findIndex((it) => it.id === id);
        if (anchorIdx >= 0 && clickIdx >= 0) {
          const [from, to] =
            anchorIdx <= clickIdx
              ? [anchorIdx, clickIdx]
              : [clickIdx, anchorIdx];
          const next = new Set<string>();
          for (let i = from; i <= to; i++) next.add(filtered[i].id);
          setSelectedIds(next);
          return;
        }
      }
      if (modifiers.ctrl) {
        setSelectedIds((prev) => {
          const next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
        });
        setAnchorId(id);
        return;
      }
      setSelectedIds(new Set([id]));
      setAnchorId(id);
    },
    [anchorId, filtered],
  );

  const handleContextMenu = useCallback(
    (e: MouseEvent, itemId: string | null) => {
      e.preventDefault();
      e.stopPropagation();
      // Right-click on a non-selected item promotes it to the selection.
      let ids = itemId === null ? [] : [itemId];
      if (itemId !== null && !selectedIds.has(itemId)) {
        setSelectedIds(new Set([itemId]));
        setAnchorId(itemId);
      } else if (itemId !== null) {
        ids = Array.from(selectedIds);
      }
      setMenu({ x: e.clientX, y: e.clientY, itemIds: ids });
    },
    [selectedIds],
  );

  const commitRename = useCallback(
    (id: string, newName: string) => {
      const item = items.find((it) => it.id === id);
      if (item && onRename && newName.trim() && newName.trim() !== item.name) {
        onRename(item, newName.trim());
      }
      setRenamingId(null);
    },
    [items, onRename],
  );

  const beginRename = useCallback(() => {
    if (!onRename) return;
    if (selectedIds.size !== 1) return;
    const [id] = selectedIds;
    setRenamingId(id);
  }, [onRename, selectedIds]);

  // ─── Keyboard shortcuts ────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      // Don't intercept when the user is typing in search/rename.
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        return;
      }
      if (e.key === "Escape") {
        setSelectedIds(new Set());
        setAnchorId(null);
        setMenu(null);
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "a") {
        e.preventDefault();
        setSelectedIds(new Set(filtered.map((it) => it.id)));
        return;
      }
      if (selectedIds.size === 0) return;
      if (e.key === "Enter" && selectedIds.size === 1) {
        const [id] = selectedIds;
        const it = items.find((x) => x.id === id);
        if (it && onOpen) onOpen(it);
        return;
      }
      if (e.key === "F2") {
        e.preventDefault();
        beginRename();
        return;
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        const deleteAction = actions.find((a) => a.id === "delete");
        if (deleteAction) {
          e.preventDefault();
          deleteAction.onClick(selectedItems);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [actions, beginRename, filtered, items, onOpen, selectedItems, selectedIds]);

  /** Actions visible right now — filters singleOnly entries by selection size. */
  const visibleActions = useMemo(
    () =>
      actions.filter(
        (a) =>
          selectedItems.length > 0 &&
          (!a.singleOnly || selectedItems.length === 1),
      ),
    [actions, selectedItems.length],
  );

  return (
    <Stack ref={rootRef} sx={{ flex: 1, minHeight: 0 }} tabIndex={-1}>
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

        {visibleActions.length > 0 && (
          <Stack direction="row" spacing={0.5} alignItems="center">
            {visibleActions.map((a) => {
              const Icon = a.icon;
              return (
                <Tooltip key={a.id} title={a.label}>
                  <Box
                    component="button"
                    type="button"
                    onClick={() => {
                      a.onClick(selectedItems);
                    }}
                    sx={{
                      all: "unset",
                      cursor: "pointer",
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
                      transition: "background-color 120ms ease",
                      "&:hover": {
                        bgcolor: a.danger
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
          if (e.target === e.currentTarget) {
            setSelectedIds(new Set());
            setAnchorId(null);
          }
        }}
        onContextMenu={(e) => {
          if (e.target === e.currentTarget) handleContextMenu(e, null);
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
            selectedIds={selectedIds}
            renamingId={renamingId}
            onSelect={handleSelect}
            onOpen={onOpen}
            onCommitRename={commitRename}
            onCancelRename={() => {
              setRenamingId(null);
            }}
            onContextMenu={handleContextMenu}
          />
        ) : (
          <ListView
            items={filtered}
            selectedIds={selectedIds}
            renamingId={renamingId}
            onSelect={handleSelect}
            onOpen={onOpen}
            onCommitRename={commitRename}
            onCancelRename={() => {
              setRenamingId(null);
            }}
            onContextMenu={handleContextMenu}
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
          {selectedItems.length === 1 &&
            ` · "${selectedItems[0].name}" selected`}
          {selectedItems.length > 1 &&
            ` · ${String(selectedItems.length)} selected`}
        </Typography>
      </Stack>

      <ContextMenu
        target={menu}
        actions={actions}
        selectedItems={selectedItems}
        canRename={onRename !== undefined}
        canOpen={onOpen !== undefined && selectedItems.length === 1}
        sort={sort}
        dir={dir}
        view={view}
        onClose={() => {
          setMenu(null);
        }}
        onOpen={(it) => {
          onOpen?.(it);
        }}
        onRename={beginRename}
        onChangeView={setView}
        onChangeSort={setSort}
        onChangeDir={setDir}
      />
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
      <MuiSelect<SortField>
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
        <MuiMenuItem value="date">Date</MuiMenuItem>
        <MuiMenuItem value="name">Name</MuiMenuItem>
        <MuiMenuItem value="kind">Kind</MuiMenuItem>
      </MuiSelect>
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

interface ViewProps<T extends ExplorerItem> {
  items: T[];
  selectedIds: Set<string>;
  renamingId: string | null;
  onSelect: (id: string, mods: { ctrl?: boolean; shift?: boolean }) => void;
  onOpen?: (item: T) => void;
  onCommitRename: (id: string, newName: string) => void;
  onCancelRename: () => void;
  onContextMenu: (e: MouseEvent, itemId: string) => void;
}

function IconGrid<T extends ExplorerItem>({
  items,
  selectedIds,
  renamingId,
  onSelect,
  onOpen,
  onCommitRename,
  onCancelRename,
  onContextMenu,
}: ViewProps<T>) {
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
        const selected = selectedIds.has(it.id);
        const renaming = renamingId === it.id;
        return (
          <Stack
            key={it.id}
            alignItems="center"
            spacing={0.75}
            tabIndex={0}
            role="button"
            aria-label={`${it.name}${selected ? " (selected)" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              if (renaming) return;
              onSelect(it.id, { ctrl: e.metaKey || e.ctrlKey, shift: e.shiftKey });
            }}
            onDoubleClick={() => {
              if (renaming) return;
              onOpen?.(it);
            }}
            onContextMenu={(e) => {
              onContextMenu(e, it.id);
            }}
            onKeyDown={(e: KeyboardEvent) => {
              if (renaming) return;
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (selected) onOpen?.(it);
                else onSelect(it.id, {});
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
            {renaming ? (
              <RenameInput
                initial={it.name}
                onCommit={(value) => {
                  onCommitRename(it.id, value);
                }}
                onCancel={onCancelRename}
              />
            ) : (
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
            )}
            {it.subtitle && !renaming && (
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
  selectedIds,
  renamingId,
  onSelect,
  onOpen,
  onCommitRename,
  onCancelRename,
  onContextMenu,
}: ViewProps<T>) {
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
          const selected = selectedIds.has(it.id);
          const renaming = renamingId === it.id;
          return (
            <Box
              key={it.id}
              component="tr"
              tabIndex={0}
              role="row"
              onClick={(e) => {
                if (renaming) return;
                onSelect(it.id, {
                  ctrl: e.metaKey || e.ctrlKey,
                  shift: e.shiftKey,
                });
              }}
              onDoubleClick={() => {
                if (renaming) return;
                onOpen?.(it);
              }}
              onContextMenu={(e) => {
                onContextMenu(e, it.id);
              }}
              onKeyDown={(e: KeyboardEvent) => {
                if (renaming) return;
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  if (selected) onOpen?.(it);
                  else onSelect(it.id, {});
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
                  {renaming ? (
                    <RenameInput
                      initial={it.name}
                      onCommit={(value) => {
                        onCommitRename(it.id, value);
                      }}
                      onCancel={onCancelRename}
                    />
                  ) : (
                    <Box component="span" sx={{ fontWeight: 500 }}>
                      {it.name}
                    </Box>
                  )}
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

/* ─── Inline rename input ─────────────────────────────────────── */

function RenameInput({
  initial,
  onCommit,
  onCancel,
}: {
  initial: string;
  onCommit: (value: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(initial);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.focus();
    // Select the filename stem only (everything before the last "."), the
    // way Finder + Windows Explorer behave.
    const dotIdx = initial.lastIndexOf(".");
    if (dotIdx > 0) el.setSelectionRange(0, dotIdx);
    else el.select();
  }, [initial]);

  return (
    <InputBase
      inputRef={ref}
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onCommit(value);
        } else if (e.key === "Escape") {
          e.preventDefault();
          onCancel();
        } else {
          e.stopPropagation();
        }
      }}
      onBlur={() => {
        onCommit(value);
      }}
      onClick={(e) => {
        e.stopPropagation();
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
      }}
      sx={{
        fontSize: "0.74rem",
        fontWeight: 500,
        textAlign: "center",
        "& input": {
          p: "1px 4px",
          textAlign: "inherit",
          bgcolor: "rgba(20, 22, 32, 0.95)",
          color: "text.primary",
          borderRadius: 0.5,
          boxShadow: "0 0 0 1.5px rgba(120, 160, 220, 0.8)",
          maxWidth: "100%",
        },
      }}
    />
  );
}

/* ─── Context menu ────────────────────────────────────────────── */

interface ContextMenuProps<T extends ExplorerItem> {
  target: ContextMenuTarget | null;
  actions: ExplorerAction<T>[];
  selectedItems: T[];
  canRename: boolean;
  canOpen: boolean;
  sort: SortField;
  dir: SortDir;
  view: ViewMode;
  onClose: () => void;
  onOpen: (item: T) => void;
  onRename: () => void;
  onChangeView: (v: ViewMode) => void;
  onChangeSort: (v: SortField) => void;
  onChangeDir: (v: SortDir) => void;
}

function ContextMenu<T extends ExplorerItem>({
  target,
  actions,
  selectedItems,
  canRename,
  canOpen,
  sort,
  dir,
  view,
  onClose,
  onOpen,
  onRename,
  onChangeView,
  onChangeSort,
  onChangeDir,
}: ContextMenuProps<T>) {
  const open = target !== null;
  const onEmpty = open && target.itemIds.length === 0;
  const anchorPosition = target ? { top: target.y, left: target.x } : undefined;

  const dangerActions = actions.filter(
    (a) =>
      a.danger &&
      selectedItems.length > 0 &&
      (!a.singleOnly || selectedItems.length === 1),
  );
  const normalActions = actions.filter(
    (a) =>
      !a.danger &&
      selectedItems.length > 0 &&
      (!a.singleOnly || selectedItems.length === 1),
  );

  return (
    <Menu
      open={open}
      onClose={onClose}
      anchorReference="anchorPosition"
      anchorPosition={anchorPosition}
      slotProps={{
        paper: {
          sx: {
            bgcolor: "rgba(28, 30, 42, 0.96)",
            backdropFilter: "blur(20px) saturate(160%)",
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: 1.5,
            minWidth: 200,
            "& .MuiMenuItem-root": {
              fontSize: "0.78rem",
              minHeight: 28,
              py: 0.5,
              px: 1.5,
            },
            "& .MuiListItemIcon-root": {
              minWidth: "22px !important",
              color: "text.secondary",
            },
          },
        },
      }}
    >
      {onEmpty ? (
        <>
          <SubmenuLabel>View as</SubmenuLabel>
          <MenuItem
            onClick={() => {
              onChangeView("icons");
              onClose();
            }}
          >
            <ListItemIcon>
              {view === "icons" ? <Check size={13} /> : null}
            </ListItemIcon>
            <ListItemText>Icons</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => {
              onChangeView("list");
              onClose();
            }}
          >
            <ListItemIcon>
              {view === "list" ? <Check size={13} /> : null}
            </ListItemIcon>
            <ListItemText>List</ListItemText>
          </MenuItem>
          <Divider sx={{ my: 0.5, borderColor: "rgba(255,255,255,0.06)" }} />
          <SubmenuLabel>Sort by</SubmenuLabel>
          {(["date", "name", "kind"] as const).map((s) => (
            <MenuItem
              key={s}
              onClick={() => {
                onChangeSort(s);
                onClose();
              }}
            >
              <ListItemIcon>
                {sort === s ? <Check size={13} /> : null}
              </ListItemIcon>
              <ListItemText>
                {s === "date" ? "Date" : s === "name" ? "Name" : "Kind"}
              </ListItemText>
            </MenuItem>
          ))}
          <Divider sx={{ my: 0.5, borderColor: "rgba(255,255,255,0.06)" }} />
          <MenuItem
            onClick={() => {
              onChangeDir(dir === "asc" ? "desc" : "asc");
              onClose();
            }}
          >
            <ListItemText>
              {dir === "asc" ? "Sort descending" : "Sort ascending"}
            </ListItemText>
          </MenuItem>
        </>
      ) : (
        <>
          {canOpen && (
            <MenuItem
              onClick={() => {
                if (selectedItems[0]) onOpen(selectedItems[0]);
                onClose();
              }}
            >
              <ListItemText>Open</ListItemText>
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", ml: 2 }}
              >
                ↵
              </Typography>
            </MenuItem>
          )}
          {canRename && selectedItems.length === 1 && (
            <MenuItem
              onClick={() => {
                onRename();
                onClose();
              }}
            >
              <ListItemText>Rename</ListItemText>
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", ml: 2 }}
              >
                F2
              </Typography>
            </MenuItem>
          )}
          {normalActions
            .filter((a) => a.id !== "open" && a.id !== "rename")
            .map((a) => {
              const Icon = a.icon;
              return (
                <MenuItem
                  key={a.id}
                  onClick={() => {
                    a.onClick(selectedItems);
                    onClose();
                  }}
                >
                  <ListItemIcon>
                    <Icon size={13} />
                  </ListItemIcon>
                  <ListItemText>{a.label}</ListItemText>
                  {a.shortcut && (
                    <Typography
                      variant="caption"
                      sx={{ color: "text.secondary", ml: 2 }}
                    >
                      {a.shortcut}
                    </Typography>
                  )}
                </MenuItem>
              );
            })}
          {dangerActions.length > 0 && (
            <Divider sx={{ my: 0.5, borderColor: "rgba(255,255,255,0.06)" }} />
          )}
          {dangerActions.map((a) => {
            const Icon = a.icon;
            return (
              <MenuItem
                key={a.id}
                onClick={() => {
                  a.onClick(selectedItems);
                  onClose();
                }}
                sx={{ color: "rgba(248,113,113,0.95) !important" }}
              >
                <ListItemIcon sx={{ color: "inherit !important" }}>
                  <Icon size={13} />
                </ListItemIcon>
                <ListItemText>{a.label}</ListItemText>
                <Typography
                  variant="caption"
                  sx={{ color: "inherit", opacity: 0.65, ml: 2 }}
                >
                  ⌫
                </Typography>
              </MenuItem>
            );
          })}
        </>
      )}
    </Menu>
  );
}

function SubmenuLabel({ children }: { children: ReactNode }) {
  return (
    <Typography
      variant="caption"
      sx={{
        display: "block",
        px: 1.5,
        pt: 0.75,
        pb: 0.25,
        fontSize: "0.62rem",
        letterSpacing: 0.6,
        textTransform: "uppercase",
        color: "text.secondary",
        fontWeight: 600,
      }}
    >
      {children}
    </Typography>
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
