"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import {
  FileExplorer,
  type ExplorerAction,
  type ExplorerItem,
} from "@react-ui-os/desktop";
import {
  buildShareUrl,
  type DownloadEntry,
  deleteDownload,
  DOWNLOADS_CHANGED_EVENT,
  listDownloads,
  renameDownload,
} from "@mintables/shared/lib";
import { exportModel, ExportError } from "@mintables/shared/lib/export";
import { Download, FileText, FolderOpen, Trash2 } from "lucide-react";
import { findGenerator } from "@/lib/registry";
import { EdgeToEdge } from "@/lib/window-content";
import { useExplorerSidebar } from "../use-explorer-sidebar";

interface Item extends ExplorerItem {
  entry: DownloadEntry;
}

/**
 * The Downloads folder's body: a FileExplorer over `listDownloads()`. Runs as
 * the `downloads` system window's content; the react-ui-os WindowLayer owns
 * the chrome.
 */
export function DownloadsContent() {
  const router = useRouter();
  const sidebar = useExplorerSidebar("downloads");
  const [entries, setEntries] = useState<DownloadEntry[]>([]);

  useEffect(() => {
    const sync = () => {
      setEntries(listDownloads());
    };
    sync();
    window.addEventListener(DOWNLOADS_CHANGED_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(DOWNLOADS_CHANGED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const items: Item[] = useMemo(
    () =>
      entries.map((e) => {
        const gen = findGenerator(e.generatorId);
        const kind = gen ? gen.meta.name : e.generatorId;
        return {
          id: e.id,
          name: `${e.filename}.${e.format}`,
          kind,
          timestamp: e.createdAt,
          subtitle: kind,
          meta: e.format.toUpperCase(),
          icon: (
            <DownloadFileIcon
              format={e.format}
              accent={gen?.meta.accent ?? "#5a9a9d"}
            />
          ),
          iconSmall: (
            <DownloadFileIconSmall accent={gen?.meta.accent ?? "#5a9a9d"} />
          ),
          entry: e,
        };
      }),
    [entries],
  );

  const handleOpen = (it: Item) => {
    const gen = findGenerator(it.entry.generatorId);
    if (!gen) return;
    const url = buildShareUrl(gen.id, it.entry.config);
    router.push(new URL(url).pathname + new URL(url).search);
  };

  const handleReDownload = (its: Item[]) => {
    void (async () => {
      for (const it of its) {
        const gen = findGenerator(it.entry.generatorId);
        if (!gen) continue;
        const config = gen.decode(it.entry.config);
        if (config === null) {
          window.alert(
            `"${it.entry.filename}" is incompatible with the current version of ${gen.meta.name}.`,
          );
          continue;
        }
        try {
          // Generators with an async kernel (CSG) need it loaded first.
          if (gen.prepare) await gen.prepare();
          exportModel(gen, config, it.entry.format);
        } catch (err: unknown) {
          if (err instanceof ExportError) window.alert(err.message);
          else window.alert(`"${it.entry.filename}" could not be rebuilt.`);
        }
      }
    })();
  };

  const handleDelete = (its: Item[]) => {
    for (const it of its) deleteDownload(it.entry.id);
  };

  const handleRename = (it: Item, newName: string) => {
    // Strip a trailing ".stl" / ".3mf" if the user typed the extension —
    // the format is implied by `entry.format` and reattached on display.
    const cleaned = newName.replace(/\.(stl|3mf)$/i, "").trim();
    if (!cleaned) return;
    renameDownload(it.entry.id, cleaned);
  };

  const actions: ExplorerAction<Item>[] = [
    {
      id: "open",
      label: "Open in app",
      icon: <FolderOpen size={13} />,
      onClick: (its) => {
        if (its[0]) handleOpen(its[0]);
      },
      singleOnly: true,
    },
    {
      id: "re-download",
      label: "Re-download",
      icon: <Download size={13} />,
      onClick: handleReDownload,
    },
    {
      id: "delete",
      label: "Delete",
      icon: <Trash2 size={13} />,
      onClick: handleDelete,
      danger: true,
      shortcut: "⌫",
    },
  ];

  return (
    <EdgeToEdge>
      <FileExplorer
        items={items}
        onOpen={handleOpen}
        onRename={handleRename}
        actions={actions}
        sidebar={sidebar}
        emptyState={
          <ExplorerEmptyState>
            Your exported STL and 3MF files will show up here. Download anything
            from a generator to fill the folder.
          </ExplorerEmptyState>
        }
      />
    </EdgeToEdge>
  );
}

/** Centered muted paragraph for the explorer's empty state. */
export function ExplorerEmptyState({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        p: "40px 24px",
        display: "flex",
        justifyContent: "center",
        textAlign: "center",
        color: "text.secondary",
        fontSize: "0.78rem",
        maxWidth: 420,
        mx: "auto",
        lineHeight: 1.6,
      }}
    >
      {children}
    </Box>
  );
}

/**
 * File-icon visual: a small "page" with the generator accent color along the
 * top edge + the format glyph in the middle. Looks like a real file icon.
 */
function DownloadFileIcon({
  format,
  accent,
}: {
  format: "stl" | "3mf";
  accent: string;
}) {
  return (
    <Box
      sx={{
        position: "relative",
        width: 44,
        height: 52,
        borderRadius: 1,
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(225,228,238,0.92) 100%)",
        boxShadow:
          "0 6px 14px -6px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.6)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 12,
          background: `linear-gradient(180deg, ${accent} 0%, ${accent}cc 100%)`,
        },
        "&::after": {
          content: '""',
          position: "absolute",
          top: 0,
          right: 0,
          width: 9,
          height: 9,
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.4) 50%, rgba(0,0,0,0.18) 50%)",
        },
      }}
    >
      <FileText
        size={18}
        style={{
          color: "#3a3f55",
          position: "absolute",
          top: 18,
          left: "50%",
          transform: "translateX(-50%)",
        }}
      />
      <Box
        sx={{
          position: "relative",
          fontFamily: "var(--font-geist-mono), monospace",
          fontSize: "0.6rem",
          fontWeight: 700,
          letterSpacing: 0.4,
          color: "#3a3f55",
          textAlign: "center",
          mb: 0.5,
        }}
      >
        {format.toUpperCase()}
      </Box>
    </Box>
  );
}

/**
 * 16×16 list-view glyph: tiny page with the accent strip + a folded corner.
 * Echoes the large grid icon at a fraction of the size.
 */
function DownloadFileIconSmall({ accent }: { accent: string }) {
  return (
    <Box
      sx={{
        position: "relative",
        width: 14,
        height: 16,
        borderRadius: 0.5,
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(225,228,238,0.92) 100%)",
        boxShadow:
          "0 1px 2px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.55)",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(180deg, ${accent} 0%, ${accent}cc 100%)`,
        },
        "&::after": {
          content: '""',
          position: "absolute",
          top: 0,
          right: 0,
          width: 4,
          height: 4,
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.4) 50%, rgba(0,0,0,0.18) 50%)",
        },
      }}
    />
  );
}
