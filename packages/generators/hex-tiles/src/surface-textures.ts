import type { HexTileSurfaceTexture } from "./types";

export interface SurfaceTextureOption {
  value: HexTileSurfaceTexture;
  label: string;
  description: string;
}

export const SURFACE_TEXTURE_OPTIONS: SurfaceTextureOption[] = [
  {
    value: "wood-grain",
    label: "Wood grain",
    description: "Flowing grain marks for taverns, ships, and rustic tables.",
  },
  {
    value: "cobblestone",
    label: "Cobblestone",
    description: "Staggered worn stones for streets and dungeon floors.",
  },
  {
    value: "hammered-stone",
    label: "Hammered stone",
    description: "Irregular dimples that add a subtle hand-worked finish.",
  },
  {
    value: "sci-fi-panels",
    label: "Sci-fi panels",
    description: "Panel seams and access points for futuristic game tables.",
  },
  {
    value: "custom",
    label: "Custom height map",
    description: "Upload your own seamless grayscale texture image.",
  },
];

export function surfaceTextureLabel(value: HexTileSurfaceTexture): string {
  return (
    SURFACE_TEXTURE_OPTIONS.find((option) => option.value === value)?.label ??
    SURFACE_TEXTURE_OPTIONS[0].label
  );
}
