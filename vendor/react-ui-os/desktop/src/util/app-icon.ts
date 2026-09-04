import type { App, OsTheme } from "@react-ui-os/core";
import type { ComponentType } from "react";

/**
 * The icon component to render for an app under a given theme. Picks the
 * theme's `chrome.iconStyle` variant from `app.icons` when the app provides
 * one (a Fluent glyph for Windows, say), otherwise the app's default `icon`.
 * Keeps the per-OS icon choice in data, not in a component branching on the
 * theme.
 */
export function resolveAppIcon(
  app: Pick<App, "icon" | "icons">,
  theme: OsTheme,
): ComponentType<{ size?: number }> | undefined {
  const style = theme.chrome.iconStyle;
  return (style ? app.icons?.[style] : undefined) ?? app.icon;
}

/**
 * Paints an app icon as a quiet material canvas when the active theme provides
 * one, while preserving the legacy accent tile for themes that do not.
 */
export function appIconBackground(
  app: Pick<App, "accent">,
  theme: OsTheme,
): string {
  const accent = app.accent ?? theme.palette.accent;
  const surface = theme.palette.appIconSurface;
  if (!surface) {
    return `linear-gradient(180deg, ${accent} 0%, ${accent}c0 100%)`;
  }
  return `linear-gradient(145deg, color-mix(in srgb, ${surface} 96%, ${accent}) 0%, color-mix(in srgb, ${surface} 88%, ${accent}) 52%, color-mix(in srgb, ${surface} 72%, ${accent}) 100%)`;
}

/** Keeps glyph-only fallbacks legible on either icon canvas treatment. */
export function appIconForeground(
  app: Pick<App, "accent">,
  theme: OsTheme,
): string {
  return theme.palette.appIconSurface
    ? (app.accent ?? theme.palette.accent)
    : "#fff";
}
