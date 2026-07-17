import { OsTheme } from '@react-ui-os/core';
export { OsTheme } from '@react-ui-os/core';

interface MacosThemeOptions {
    /**
     * Accent override. Defaults to the macOS "Blue" control accent (#0a84ff).
     * Used as the system-wide accent fallback when no per-app accent is set.
     */
    accent?: string;
    /**
     * Wallpaper image url for the light appearance. Themes do not bundle assets;
     * the consumer supplies the path. When omitted, the palette background fills
     * the desktop and the theme reads as the bare skeleton.
     */
    wallpaperSrc?: string;
    /**
     * Wallpaper image url for the dark appearance. Defaults to `wallpaperSrc`
     * when omitted, so dark mode keeps the light wallpaper unless a darker one
     * is supplied.
     */
    darkWallpaperSrc?: string;
    /**
     * Wallpapers to offer in Settings > Appearance. When provided, the theme
     * exposes a `wallpaper.src` picker; choosing one overrides the appearance
     * default until reset. Themes don't bundle assets, so the consumer supplies
     * the list (the same paths it passes for `wallpaperSrc`).
     */
    wallpaperOptions?: {
        src: string;
        label: string;
    }[];
    /**
     * Opt into Tahoe's Liquid Glass refraction on supported (Chromium) browsers;
     * others fall back to the blur. Off by default; experimental. See
     * `OsThemeChrome.liquidGlass`.
     */
    liquidGlass?: boolean;
}
/**
 * The macOS register: traffic lights, a floating dock with a fisheye, a
 * translucent top menu bar, soft motion. With no wallpaper it doubles as the
 * unbranded baseline ("the skeleton"), so consumers immediately see what is
 * theirs to customize; supply a wallpaper for the full Mac look.
 *
 * macOS has no cursor parallax and no wallpaper vignette, so both stay off
 * (see the "build on the shoulders of giants" note in CLAUDE.md).
 *
 * The `customizable` block declares which tokens end users may tweak from
 * the Settings panel. Returns a fresh object on each call so caller
 * customizations never leak between consumers.
 */
declare function createMacosTheme(options?: MacosThemeOptions): OsTheme;
/**
 * The macOS theme with no wallpaper: the unbranded baseline. Kept as a static
 * export so a consumer can drop in `<Desktop theme={macosTheme} />` without
 * the factory call. Supply a wallpaper with `createMacosTheme({ ... })`.
 */
declare const macosTheme: OsTheme;

export { type MacosThemeOptions, createMacosTheme, macosTheme };
