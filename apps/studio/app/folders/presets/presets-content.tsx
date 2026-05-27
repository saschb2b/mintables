"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import {
  FileExplorer,
  type ExplorerAction,
  type ExplorerItem,
} from "@mintables/shared/ui";
import {
  buildShareUrl,
  deletePreset,
  listAllPresets,
  type Preset,
  PRESETS_CHANGED_EVENT,
  renamePreset,
} from "@mintables/shared/lib";
import { Bookmark, FolderOpen, Trash2 } from "lucide-react";
import { findGenerator } from "@/lib/registry";
import { useExplorerSidebar } from "../use-explorer-sidebar";

interface Item extends ExplorerItem {
  preset: Preset;
}

/**
 * The Presets folder's body — a FileExplorer over `listAllPresets()`. Does
 * NOT render any window chrome; the WindowLayer wraps this in an AppWindow.
 */
export function PresetsContent() {
  const router = useRouter();
  const sidebar = useExplorerSidebar("presets");
  const [presets, setPresets] = useState<Preset[]>([]);

  useEffect(() => {
    const sync = () => {
      setPresets(listAllPresets());
    };
    sync();
    window.addEventListener(PRESETS_CHANGED_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(PRESETS_CHANGED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const items: Item[] = useMemo(
    () =>
      presets.map((p) => {
        const gen = findGenerator(p.generatorId);
        const kind = gen ? gen.meta.name : p.generatorId;
        return {
          id: p.id,
          name: p.name,
          kind,
          timestamp: p.createdAt,
          subtitle: kind,
          meta: "PRESET",
          icon: (
            <PresetFileIcon accent={gen?.meta.accent ?? "#a855f7"} />
          ),
          iconSmall: (
            <PresetFileIconSmall accent={gen?.meta.accent ?? "#a855f7"} />
          ),
          preset: p,
        };
      }),
    [presets],
  );

  const handleOpen = (it: Item) => {
    const gen = findGenerator(it.preset.generatorId);
    if (!gen) return;
    // Append `?preset=<id>` so the shell's hydration marks this preset as
    // active and fires the same toast as the in-shell preset menu.
    const target = new URL(buildShareUrl(gen.id, it.preset.config));
    target.searchParams.set("preset", it.preset.id);
    router.push(target.pathname + target.search);
  };

  const handleDelete = (its: Item[]) => {
    for (const it of its) deletePreset(it.preset.id);
  };

  const handleRename = (it: Item, newName: string) => {
    renamePreset(it.preset.id, newName);
  };

  const actions: ExplorerAction<Item>[] = [
    {
      id: "open",
      label: "Open in app",
      icon: FolderOpen,
      onClick: (its) => {
        if (its[0]) handleOpen(its[0]);
      },
      singleOnly: true,
    },
    {
      id: "delete",
      label: "Delete",
      icon: Trash2,
      onClick: handleDelete,
      danger: true,
    },
  ];

  return (
    <FileExplorer
      items={items}
      onOpen={handleOpen}
      onRename={handleRename}
      actions={actions}
      sidebar={sidebar}
      emptyState="Save a configuration from any generator's Presets menu and it'll appear here."
    />
  );
}

function PresetFileIcon({ accent }: { accent: string }) {
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
        alignItems: "center",
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
      <Bookmark
        size={18}
        style={{ color: accent, marginTop: 10 }}
        fill={accent}
      />
    </Box>
  );
}

function PresetFileIconSmall({ accent }: { accent: string }) {
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
          height: 4,
          background: `linear-gradient(180deg, ${accent} 0%, ${accent}cc 100%)`,
        },
      }}
    >
      <Bookmark
        size={8}
        style={{ color: accent, marginTop: 3 }}
        fill={accent}
      />
    </Box>
  );
}
