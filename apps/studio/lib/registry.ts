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
