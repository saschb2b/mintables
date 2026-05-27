import type { AnyGenerator } from "@mintables/shared/lib";
import { tubeGenerator } from "@mintables/gen-tubes";
import { adapterGenerator } from "@mintables/gen-adapters";

export const generators: AnyGenerator[] = [
  tubeGenerator as AnyGenerator,
  adapterGenerator as AnyGenerator,
];

export const bySlug: Record<string, AnyGenerator> = Object.fromEntries(
  generators.map((g) => [g.id, g]),
);

/**
 * Safe lookup that returns `undefined` for unknown slugs. The plain `bySlug`
 * Record is typed as if every string maps to a generator, which is false at
 * runtime — e.g. a Downloads entry can carry a `generatorId` for a generator
 * that's been removed or renamed.
 */
export function findGenerator(id: string): AnyGenerator | undefined {
  return id in bySlug ? bySlug[id] : undefined;
}
