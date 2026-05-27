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
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import {
  ArrowDown,
  ArrowUp,
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
  /** Large tile icon — rendered in icon view (~44–64px box). */
  icon: ReactNode;
  /** Compact icon used in list view (~16px). Falls back to a scaled `icon`. */
  iconSmall?: ReactNode;
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

export interface ExplorerSidebarItem {
  id: string;
  label: string;
  icon: LucideIcon;
  /** Tint applied to the icon (and to the active background). */
  iconColor?: string;
  active?: boolean;
  onClick: () => void;
}

export interface ExplorerSidebarSection {
  label: string;
  items: ExplorerSidebarItem[];
}

interface FileExplorerProps<T extends ExplorerItem> {
  items: T[];
  /** Triggered on double-click / Enter — typically "Open". Single-item. */
  onOpen?: (item: T) => void;
  /** When provided, items become renameable via F2 / context menu. */
  onRename?: (item: T, newName: string) => void;
  /** Buttons shown in the toolbar action bar + context menu. */
  actions?: ExplorerAction<T>[];
  /** Optional Finder-style left rail. Rendered above sm; hidden on mobile. */
  sidebar?: ExplorerSidebarSection[];
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
  sidebar,
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

  /** Toggle direction when clicking the active column header; pick desc for new. */
  const handleHeaderSort = useCallback(
    (field: SortField) => {
      if (sort === field) {
        setDir(dir === "asc" ? "desc" : "asc");
      } else {
        setSort(field);
        setDir(field === "name" ? "asc" : "desc");
      }
    },
    [sort, dir],
  );

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
        spacing={1.25}
        sx={{
          alignItems: "center",
          flexShrink: 0,
          height: 46,
          px: 1.75,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          bgcolor: "rgba(255,255,255,0.025)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)"
        }}>
        <ViewToggle view={view} onChange={setView} />

        <Box sx={{ width: "1px", height: 22, bgcolor: "rgba(255,255,255,0.08)" }} />

        <SortControl
          sort={sort}
          dir={dir}
          onChangeSort={setSort}
          onChangeDir={setDir}
        />

        {visibleActions.length > 0 && (
          <>
            <Box sx={{ width: "1px", height: 22, bgcolor: "rgba(255,255,255,0.08)" }} />
            <Stack direction="row" spacing={0.5} sx={{
              alignItems: "center"
            }}>
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
                        height: 28,
                        px: 1.1,
                        borderRadius: 1,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 0.6,
                        fontSize: "0.74rem",
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
                      <Icon size={14} />
                      <Box component="span">{a.label}</Box>
                    </Box>
                  </Tooltip>
                );
              })}
            </Stack>
          </>
        )}

        <Box sx={{ flex: 1 }} />

        <SearchBox value={query} onChange={setQuery} />
      </Stack>
      {/* ─── Sidebar + content + status bar ──────────────────── */}
      <Stack direction="row" sx={{ flex: 1, minHeight: 0 }}>
        {sidebar && sidebar.length > 0 && <Sidebar sections={sidebar} />}

        <Stack sx={{ flex: 1, minWidth: 0, minHeight: 0 }}>
          {/* Content */}
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
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
                sort={sort}
                dir={dir}
                onSelect={handleSelect}
                onOpen={onOpen}
                onCommitRename={commitRename}
                onCancelRename={() => {
                  setRenamingId(null);
                }}
                onContextMenu={handleContextMenu}
                onHeaderSort={handleHeaderSort}
              />
            )}
          </Box>

          {/* Status bar */}
          <Stack
            direction="row"
            sx={{
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              height: 28,
              px: 1.5,
              borderTop: "1px solid rgba(255,255,255,0.06)",
              bgcolor: "rgba(0,0,0,0.18)"
            }}>
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", fontSize: "0.72rem" }}
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
        </Stack>
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

/* ─── Sidebar ─────────────────────────────────────────────────── */

function Sidebar({ sections }: { sections: ExplorerSidebarSection[] }) {
  return (
    <Stack
      component="aside"
      aria-label="Sidebar"
      sx={{
        display: { xs: "none", sm: "flex" },
        width: 172,
        flexShrink: 0,
        py: 1.25,
        px: 0.75,
        borderRight: "1px solid rgba(255,255,255,0.06)",
        bgcolor: "rgba(0,0,0,0.22)",
        overflow: "auto",
      }}
      spacing={1.25}
    >
      {sections.map((section) => (
        <Stack key={section.label} spacing={0.25}>
          <Typography
            sx={{
              px: 1.25,
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
          {section.items.map((item) => {
            const Icon = item.icon;
            return (
              <Box
                key={item.id}
                component="button"
                type="button"
                onClick={item.onClick}
                aria-current={item.active ? "page" : undefined}
                sx={{
                  all: "unset",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.85,
                  px: 1.25,
                  height: 26,
                  borderRadius: 1,
                  fontSize: "0.78rem",
                  fontWeight: item.active ? 500 : 400,
                  color: item.active ? "text.primary" : "rgba(255,255,255,0.78)",
                  bgcolor: item.active
                    ? "rgba(120, 160, 220, 0.22)"
                    : "transparent",
                  transition: "background-color 120ms ease, color 120ms ease",
                  "&:hover": {
                    bgcolor: item.active
                      ? "rgba(120, 160, 220, 0.28)"
                      : "rgba(255,255,255,0.05)",
                    color: "text.primary",
                  },
                  "&:focus-visible": {
                    outline: "none",
                    bgcolor: "rgba(120, 160, 220, 0.28)",
                  },
                }}
              >
                <Icon
                  size={14}
                  style={{
                    color: item.iconColor ?? "currentColor",
                    flexShrink: 0,
                  }}
                />
                <Box
                  component="span"
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.label}
                </Box>
              </Box>
            );
          })}
        </Stack>
      ))}
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
        bgcolor: "rgba(255,255,255,0.05)",
        borderRadius: 1.25,
        p: 0.25,
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.04)",
      }}
    >
      <ToggleBtn
        active={view === "icons"}
        onClick={() => {
          onChange("icons");
        }}
        label="Icon view"
      >
        <LayoutGrid size={15} />
      </ToggleBtn>
      <ToggleBtn
        active={view === "list"}
        onClick={() => {
          onChange("list");
        }}
        label="List view"
      >
        <ListIcon size={15} />
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
          width: 30,
          height: 26,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 0.85,
          color: active ? "text.primary" : "text.secondary",
          bgcolor: active ? "rgba(255,255,255,0.12)" : "transparent",
          boxShadow: active
            ? "inset 0 0 0 1px rgba(255,255,255,0.08), 0 1px 2px rgba(0,0,0,0.2)"
            : "none",
          transition: "background-color 120ms ease, color 120ms ease",
          "&:hover": {
            bgcolor: active ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.06)",
            color: "text.primary",
          },
        }}
      >
        {children}
      </Box>
    </Tooltip>
  );
}

const SORT_LABEL: Record<SortField, string> = {
  date: "Date",
  name: "Name",
  kind: "Kind",
};

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
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  return (
    <>
      <Tooltip title="Sort">
        <Box
          component="button"
          type="button"
          aria-label="Sort"
          aria-haspopup="menu"
          onClick={(e) => {
            setAnchor(e.currentTarget);
          }}
          sx={{
            all: "unset",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            height: 28,
            px: 1,
            borderRadius: 1,
            color: "text.primary",
            fontSize: "0.74rem",
            fontWeight: 500,
            transition: "background-color 120ms ease",
            "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
          }}
        >
          <Box
            component="span"
            sx={{
              color: "text.secondary",
              fontSize: "0.66rem",
              letterSpacing: 0.6,
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            Sort
          </Box>
          <Box component="span">{SORT_LABEL[sort]}</Box>
          {dir === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
        </Box>
      </Tooltip>
      <Menu
        open={anchor !== null}
        anchorEl={anchor}
        onClose={() => {
          setAnchor(null);
        }}
        slotProps={menuPaperProps}
      >
        {(["date", "name", "kind"] as const).map((f) => (
          <MenuItem
            key={f}
            onClick={() => {
              onChangeSort(f);
              setAnchor(null);
            }}
          >
            <ListItemIcon>
              {sort === f ? <Check size={13} /> : null}
            </ListItemIcon>
            <ListItemText>{SORT_LABEL[f]}</ListItemText>
          </MenuItem>
        ))}
        <Divider sx={{ my: 0.5, borderColor: "rgba(255,255,255,0.06)" }} />
        <MenuItem
          onClick={() => {
            onChangeDir(dir === "asc" ? "desc" : "asc");
            setAnchor(null);
          }}
        >
          <ListItemIcon>
            {dir === "asc" ? <ArrowUp size={13} /> : <ArrowDown size={13} />}
          </ListItemIcon>
          <ListItemText>
            {dir === "asc" ? "Ascending" : "Descending"}
          </ListItemText>
        </MenuItem>
      </Menu>
    </>
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
      spacing={0.75}
      sx={{
        alignItems: "center",
        height: 28,
        bgcolor: "rgba(0,0,0,0.24)",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
        borderRadius: 1.25,
        px: 1,
        minWidth: 180,
        maxWidth: 240,
        transition: "background-color 120ms ease, box-shadow 120ms ease",

        "&:focus-within": {
          bgcolor: "rgba(0,0,0,0.32)",
          boxShadow:
            "inset 0 0 0 1px rgba(120, 160, 220, 0.55), 0 0 0 3px rgba(120, 160, 220, 0.12)",
        }
      }}>
      <Search size={13} style={{ color: "var(--mui-palette-text-secondary)" }} />
      <InputBase
        placeholder="Search"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        sx={{
          flex: 1,
          fontSize: "0.78rem",
          color: "text.primary",
          "& input": { p: 0 },
          "& input::placeholder": { color: "text.secondary", opacity: 0.8 },
        }}
      />
    </Stack>
  );
}

/* ─── Views ───────────────────────────────────────────────────── */

interface IconGridProps<T extends ExplorerItem> {
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
}: IconGridProps<T>) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "repeat(auto-fill, minmax(108px, 1fr))",
          sm: "repeat(auto-fill, minmax(124px, 1fr))",
        },
        gap: { xs: 1.5, sm: 2.25 },
        rowGap: { xs: 2, sm: 2.75 },
      }}
    >
      {items.map((it) => {
        const selected = selectedIds.has(it.id);
        const renaming = renamingId === it.id;
        return (
          <Stack
            key={it.id}
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
              alignItems: "center",
              cursor: "pointer",
              borderRadius: 1.5,
              px: 1,
              py: 1.25,
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
              }
            }}>
            <Box
              sx={{
                width: 64,
                height: 64,
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
                  fontSize: "0.76rem",
                  fontWeight: 500,
                  color: selected ? "text.primary" : "rgba(255,255,255,0.9)",
                  textAlign: "center",
                  lineHeight: 1.25,
                  wordBreak: "break-word",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  maxWidth: "100%",
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

interface ListViewProps<T extends ExplorerItem> {
  items: T[];
  selectedIds: Set<string>;
  renamingId: string | null;
  sort: SortField;
  dir: SortDir;
  onSelect: (id: string, mods: { ctrl?: boolean; shift?: boolean }) => void;
  onOpen?: (item: T) => void;
  onCommitRename: (id: string, newName: string) => void;
  onCancelRename: () => void;
  onContextMenu: (e: MouseEvent, itemId: string) => void;
  onHeaderSort: (field: SortField) => void;
}

const LIST_COLUMNS: { id: SortField | "format"; label: string; align?: "right" }[] = [
  { id: "name", label: "Name" },
  { id: "kind", label: "Kind" },
  { id: "date", label: "Date Modified" },
  { id: "format", label: "Format", align: "right" },
];

function ListView<T extends ExplorerItem>({
  items,
  selectedIds,
  renamingId,
  sort,
  dir,
  onSelect,
  onOpen,
  onCommitRename,
  onCancelRename,
  onContextMenu,
  onHeaderSort,
}: ListViewProps<T>) {
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
            px: 1.75,
            height: 30,
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            bgcolor: "rgba(20,22,32,0.92)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            userSelect: "none",
          },
          "& th + th": {
            borderLeft: "1px solid rgba(255,255,255,0.04)",
          },
        }}
      >
        <tr>
          {LIST_COLUMNS.map((col) => {
            const sortable = col.id !== "format";
            const active = sortable && sort === col.id;
            return (
              <Box
                key={col.id}
                component="th"
                onClick={
                  sortable
                    ? () => {
                        onHeaderSort(col.id as SortField);
                      }
                    : undefined
                }
                sx={{
                  cursor: sortable ? "pointer" : "default",
                  textAlign: col.align ?? "left",
                  color: active ? "text.primary" : "text.secondary",
                  "&:hover": sortable
                    ? { color: "text.primary", bgcolor: "rgba(255,255,255,0.03)" }
                    : undefined,
                }}
              >
                <Stack
                  direction="row"
                  spacing={0.5}
                  sx={{
                    alignItems: "center",
                    justifyContent: col.align === "right" ? "flex-end" : "flex-start"
                  }}>
                  <Box component="span">{col.label}</Box>
                  {active &&
                    (dir === "asc" ? (
                      <ArrowUp size={11} strokeWidth={2.4} />
                    ) : (
                      <ArrowDown size={11} strokeWidth={2.4} />
                    ))}
                </Stack>
              </Box>
            );
          })}
        </tr>
      </Box>
      <Box component="tbody">
        {items.map((it, idx) => {
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
                  : idx % 2 === 1
                    ? "rgba(255,255,255,0.015)"
                    : "transparent",
                "&:hover": {
                  bgcolor: selected
                    ? "rgba(120, 160, 220, 0.28)"
                    : "rgba(255,255,255,0.05)",
                },
                "&:focus-visible": {
                  outline: "none",
                  bgcolor: "rgba(120, 160, 220, 0.28)",
                },
                "& td": {
                  px: 1.75,
                  height: 30,
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  fontSize: "0.78rem",
                  color: "text.primary",
                  verticalAlign: "middle",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: 0,
                },
                "& td.muted": {
                  color: "text.secondary",
                  fontSize: "0.74rem",
                },
              }}
            >
              <td style={{ width: "45%" }}>
                <Stack direction="row" spacing={1} sx={{
                  alignItems: "center"
                }}>
                  <ListIconCell icon={it.iconSmall ?? it.icon} hasSmall={Boolean(it.iconSmall)} />
                  {renaming ? (
                    <RenameInput
                      initial={it.name}
                      onCommit={(value) => {
                        onCommitRename(it.id, value);
                      }}
                      onCancel={onCancelRename}
                    />
                  ) : (
                    <Box
                      component="span"
                      sx={{
                        fontWeight: 500,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {it.name}
                    </Box>
                  )}
                </Stack>
              </td>
              <td className="muted" style={{ width: "20%" }}>
                {it.kind}
              </td>
              <td className="muted" style={{ width: "25%" }}>
                {formatTimestamp(it.timestamp)}
              </td>
              <td
                className="muted"
                style={{
                  textAlign: "right",
                  fontVariantNumeric: "tabular-nums",
                  width: "10%",
                }}
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

/**
 * 18×18 icon slot for list view. When the host provided a dedicated `iconSmall`,
 * we render it directly. Otherwise we scale the large grid icon down so it at
 * least fits in the row instead of overflowing into the filename.
 */
function ListIconCell({
  icon,
  hasSmall,
}: {
  icon: ReactNode;
  hasSmall: boolean;
}) {
  return (
    <Box
      sx={{
        width: 18,
        height: 18,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {hasSmall ? (
        icon
      ) : (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: "scale(0.32)",
            transformOrigin: "center",
          }}
        >
          {icon}
        </Box>
      )}
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
        fontSize: "0.76rem",
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

const menuPaperProps = {
  paper: {
    sx: {
      bgcolor: "rgba(28, 30, 42, 0.96)",
      backdropFilter: "blur(20px) saturate(160%)",
      WebkitBackdropFilter: "blur(20px) saturate(160%)",
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
} as const;

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

  // MUI's <Menu> walks its children via React.Children to wire up keyboard
  // navigation, which means fragments + conditional groups don't work — we
  // have to hand it a flat array of MenuItem / Divider / label elements.
  const children: ReactNode[] = [];
  if (onEmpty) {
    children.push(
      <SubmenuLabel key="view-label">View as</SubmenuLabel>,
      <MenuItem
        key="view-icons"
        onClick={() => {
          onChangeView("icons");
          onClose();
        }}
      >
        <ListItemIcon>
          {view === "icons" ? <Check size={13} /> : null}
        </ListItemIcon>
        <ListItemText>Icons</ListItemText>
      </MenuItem>,
      <MenuItem
        key="view-list"
        onClick={() => {
          onChangeView("list");
          onClose();
        }}
      >
        <ListItemIcon>
          {view === "list" ? <Check size={13} /> : null}
        </ListItemIcon>
        <ListItemText>List</ListItemText>
      </MenuItem>,
      <Divider
        key="div-sort"
        sx={{ my: 0.5, borderColor: "rgba(255,255,255,0.06)" }}
      />,
      <SubmenuLabel key="sort-label">Sort by</SubmenuLabel>,
    );
    for (const s of ["date", "name", "kind"] as const) {
      children.push(
        <MenuItem
          key={`sort-${s}`}
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
        </MenuItem>,
      );
    }
    children.push(
      <Divider
        key="div-dir"
        sx={{ my: 0.5, borderColor: "rgba(255,255,255,0.06)" }}
      />,
      <MenuItem
        key="sort-dir"
        onClick={() => {
          onChangeDir(dir === "asc" ? "desc" : "asc");
          onClose();
        }}
      >
        <ListItemText>
          {dir === "asc" ? "Sort descending" : "Sort ascending"}
        </ListItemText>
      </MenuItem>,
    );
  } else {
    if (canOpen) {
      children.push(
        <MenuItem
          key="open"
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
        </MenuItem>,
      );
    }
    if (canRename && selectedItems.length === 1) {
      children.push(
        <MenuItem
          key="rename"
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
        </MenuItem>,
      );
    }
    for (const a of normalActions.filter(
      (x) => x.id !== "open" && x.id !== "rename",
    )) {
      const Icon = a.icon;
      children.push(
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
        </MenuItem>,
      );
    }
    if (dangerActions.length > 0) {
      children.push(
        <Divider
          key="div-danger"
          sx={{ my: 0.5, borderColor: "rgba(255,255,255,0.06)" }}
        />,
      );
    }
    for (const a of dangerActions) {
      const Icon = a.icon;
      children.push(
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
        </MenuItem>,
      );
    }
  }

  return (
    <Menu
      open={open}
      onClose={onClose}
      anchorReference="anchorPosition"
      anchorPosition={anchorPosition}
      slotProps={menuPaperProps}
    >
      {children}
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
