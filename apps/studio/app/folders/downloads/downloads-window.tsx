"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import {
  AppWindow,
  FileExplorer,
  type ExplorerAction,
  type ExplorerItem,
} from "@mintables/shared/ui";
import {
  buildShareUrl,
  type DownloadEntry,
  deleteDownload,
  DOWNLOADS_CHANGED_EVENT,
  listDownloads,
} from "@mintables/shared/lib";
import { exportModel, ExportError } from "@mintables/shared/lib/export";
import { Download, FileText, FolderOpen, Trash2 } from "lucide-react";
import { findGenerator } from "@/lib/registry";

interface Item extends ExplorerItem {
  entry: DownloadEntry;
}

export function DownloadsWindow() {
  const router = useRouter();
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

  const handleReDownload = (it: Item) => {
    const gen = findGenerator(it.entry.generatorId);
    if (!gen) return;
    const config = gen.decode(it.entry.config);
    if (config === null) {
      window.alert(
        "This download's configuration is incompatible with the current version of the generator.",
      );
      return;
    }
    try {
      exportModel(gen, config, it.entry.format);
    } catch (err: unknown) {
      if (err instanceof ExportError) window.alert(err.message);
    }
  };

  const handleDelete = (it: Item) => {
    deleteDownload(it.entry.id);
  };

  const actions: ExplorerAction<Item>[] = [
    { id: "open", label: "Open in app", icon: FolderOpen, onClick: handleOpen },
    {
      id: "re-download",
      label: "Re-download",
      icon: Download,
      onClick: handleReDownload,
    },
    { id: "delete", label: "Delete", icon: Trash2, onClick: handleDelete, danger: true },
  ];

  return (
    <AppWindow
      icon={FolderOpen}
      title="Downloads"
      subtitle="Recently exported parts"
      accent="#3b82f6"
    >
      <FileExplorer
        items={items}
        onOpen={handleOpen}
        actions={actions}
        emptyState="Your exported STL and 3MF files will show up here. Download anything from a generator to fill the folder."
      />
    </AppWindow>
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
