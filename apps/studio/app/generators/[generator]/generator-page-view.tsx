"use client";

import { GeneratorShell } from "@mintables/shared/shell";
import { AppWindow } from "@mintables/shared/ui";
import { bySlug } from "@/lib/registry";

/**
 * The parent server `page.tsx` already calls `notFound()` for unknown slugs, so
 * `bySlug[slug]` is guaranteed to resolve here.
 */
export function GeneratorPageView({ slug }: { slug: string }) {
  const generator = bySlug[slug];
  return (
    <AppWindow
      icon={generator.meta.icon}
      title={generator.meta.name}
      subtitle={generator.meta.tagline}
      accent={generator.meta.accent}
    >
      <GeneratorShell generator={generator} />
    </AppWindow>
  );
}
