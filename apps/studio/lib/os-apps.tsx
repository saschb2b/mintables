"use client";

import type { App, AppContentProps } from "@react-ui-os/core";
import type { AnyGenerator } from "@mintables/shared/lib";
import { GeneratorShell } from "@mintables/shared/shell";
import { generators } from "./registry";
import { EdgeToEdge } from "./window-content";

/**
 * Map every Mintables generator onto a react-ui-os App. One entry lights up
 * the dock tile (accent gradient + iconArt), the menu bar, Spotlight, and
 * Cmd/Ctrl+1..9 at once; the window body is the same GeneratorShell as
 * before, told about focus via the library's AppContentProps.
 */
function generatorApp(gen: AnyGenerator): App {
  function Content({ focused }: AppContentProps) {
    return (
      <EdgeToEdge>
        <GeneratorShell generator={gen} focused={focused} />
      </EdgeToEdge>
    );
  }
  Content.displayName = `GeneratorApp(${gen.id})`;

  return {
    id: gen.id,
    name: gen.meta.name,
    tagline: gen.meta.tagline,
    accent: gen.meta.accent,
    icon: gen.meta.icon,
    iconArt: gen.meta.iconArt,
    defaultBounds: { w: 1100, h: 720 },
    content: Content,
  };
}

export const osApps: App[] = generators.map(generatorApp);
