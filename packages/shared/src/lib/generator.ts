import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";
import type { ValidationResult } from "./validation/types";
import type { PrintTip } from "./print-tips";

/** Flat triangle soup — one entry per face, 9 numbers (x,y,z * 3). */
export type TriangleMesh = number[][];

/** Coordinate convention: z-up matches CAD, y-up matches three.js default. */
export type AxisConvention = "z-up" | "y-up";

export interface GeneratorMeta {
  /** Human-readable name shown in nav and hub card (e.g. "Tubes"). */
  name: string;
  /** One-line subtitle / pitch. */
  tagline: string;
  /** Longer description for the hub landing card. */
  description: string;
  /** Lucide icon component used in the app switcher, hub card, and header. */
  icon: LucideIcon;
  /** Accent color used for badge + hub card highlight. */
  accent: string;
}

export interface GeneratorBadge {
  label: string;
  color: string;
}

export interface ControlsProps<C> {
  config: C;
  onChange: (config: C) => void;
  validation: ValidationResult;
}

export interface SceneProps<C> {
  config: C;
}

export interface SummaryProps<C> {
  config: C;
}

export interface Generator<C> {
  /** URL-safe slug — also the route segment (`/tubes`). */
  id: string;
  meta: GeneratorMeta;
  defaults: C;
  /** Coerce arbitrary input (URL param, localStorage) into a valid config or null. */
  decode: (data: unknown) => C | null;
  validate: (config: C) => ValidationResult;
  geometry: (config: C) => TriangleMesh;
  /** Coordinate convention of the triangles returned by geometry(). */
  axis: AxisConvention;
  /** Filename stem (no extension) for the export. */
  filename: (config: C) => string;
  /** Short human-readable summary used in the share dialog. */
  describe: (config: C) => string;
  /** Context-aware print tips for the thank-you drawer. */
  printTips: (config: C) => PrintTip[];
  /** Pill badges shown on the info bar above the preview. */
  badges?: (config: C) => GeneratorBadge[];
  /** Sidebar controls component. */
  Controls: ComponentType<ControlsProps<C>>;
  /** R3F scene component (renders inside the shared Canvas). */
  Scene: ComponentType<SceneProps<C>>;
  /** Optional CAD-style spec summary card shown above the controls. */
  Summary?: ComponentType<SummaryProps<C>>;
}

/** Type-erased generator for registries / dynamic dispatch. */
export type AnyGenerator = Generator<unknown>;
