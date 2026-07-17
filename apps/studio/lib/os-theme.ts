import type { OsTheme } from "@react-ui-os/core";
import { createMacosTheme } from "@react-ui-os/theme-macos";

const WALLPAPER_SRC = "/wallpaper-mountains.jpg";

/**
 * The Mintables desktop theme: the macOS clone from react-ui-os, forced dark,
 * with our mountain wallpaper (parallax + vignette, matching the old bespoke
 * wallpaper layer) and the Mintables teal as the system accent.
 *
 * The factory returns a fresh object per call, so spreading + overriding here
 * never leaks into other consumers of the theme package.
 */
const base = createMacosTheme({
  accent: "#5a9a9d",
  wallpaperSrc: WALLPAPER_SRC,
  darkWallpaperSrc: WALLPAPER_SRC,
});

export const osTheme: OsTheme = {
  ...base,
  // Settings prefs are namespaced by theme id; give Mintables its own bucket.
  id: "mintables",
  name: "Mintables",
  // The app is dark-only (the MUI theme inside every window is dark).
  appearance: "dark",
  wallpaper: {
    ...base.wallpaper,
    src: WALLPAPER_SRC,
    parallax: true,
    vignette: true,
  },
  appearances: {
    ...base.appearances,
    dark: {
      ...base.appearances?.dark,
      wallpaper: {
        ...base.appearances?.dark?.wallpaper,
        src: WALLPAPER_SRC,
        parallax: true,
        vignette: true,
      },
    },
  },
};
