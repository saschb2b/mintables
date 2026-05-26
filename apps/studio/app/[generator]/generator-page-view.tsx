"use client";

import { GeneratorShell } from "@mintables/shared/shell";
import { bySlug } from "@/lib/registry";

/**
 * The parent server `page.tsx` already calls `notFound()` for unknown slugs, so
 * `bySlug[slug]` is guaranteed to resolve here.
 */
export function GeneratorPageView({ slug }: { slug: string }) {
  return <GeneratorShell generator={bySlug[slug]} />;
}
