import * as react_jsx_runtime from 'react/jsx-runtime';
import { ReactNode, ComponentType, Dispatch, SetStateAction } from 'react';
import { App, OsTheme, StorageAdapter, OpenWindow, SystemWindowArgs, WindowManagerState, WindowPayload, WindowBounds, SettingsPrefs } from '@react-ui-os/core';

interface DesktopProps {
    apps: App[];
    theme: OsTheme;
    /** Optional brand label shown in the menu bar. */
    brand?: string;
    /** Optional storage backend override. Defaults to localStorage. */
    storage?: StorageAdapter;
    /**
     * Extra children rendered inside the provider, alongside the default
     * surfaces. Useful for headless companions like analytics, URL sync,
     * or deep-link activators that need access to `useWindowManager()`.
     */
    children?: ReactNode;
}
/**
 * One-line desktop. Wraps the provider stack and composes the default
 * surfaces: wallpaper, menu bar, dock, window layer, keyboard shortcuts,
 * and Spotlight. Replace with `<DesktopProvider>` + your own layout when
 * you need finer control.
 */
declare function Desktop({ apps, theme, brand, storage, children }: DesktopProps): react_jsx_runtime.JSX.Element;

interface DesktopProviderProps {
    apps: App[];
    theme: OsTheme;
    /** Optional storage backend override. Defaults to localStorage. */
    storage?: StorageAdapter;
    children: ReactNode;
}
/**
 * Lift-the-hood mode. Wrap your own composition of `<Wallpaper>`,
 * `<MenuBar>`, `<Dock>`, `<WindowLayer>`, and `<Spotlight>`. Use
 * `<Desktop>` instead for the one-line entry point.
 */
declare function DesktopProvider({ apps, theme, storage, children, }: DesktopProviderProps): react_jsx_runtime.JSX.Element;

/**
 * Full-bleed wallpaper layer. The palette background paints under the image
 * so the desktop has a fallback when no image is set. The image scales
 * slightly larger than the viewport so the parallax shift never reveals
 * the bare background.
 */
declare function Wallpaper(): react_jsx_runtime.JSX.Element;

declare const MENU_BAR_HEIGHT: 24;
declare const DOCK_HEIGHT: number;
declare const DOCK_WIDTH: number;
interface WorkArea {
    /** Top-left corner of the work area in viewport coords. */
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * System chrome at the top of the desktop. Left: an optional brand (the macOS
 * Apple-menu slot), then the focused app's name. Right: a small status cluster
 * (live clock). The brand renders only when the consumer supplies one, so the
 * library never stamps its own name on a desktop. Returns null when
 * `theme.chrome.menuBar` is "none".
 */
declare function MenuBar({ brand }: {
    brand?: string;
}): react_jsx_runtime.JSX.Element | null;

/**
 * App dock. Direction follows `theme.chrome.dockPosition`:
 *
 *   "bottom"  horizontal run flush to (bar) or centered above (pill) the bottom
 *   "top"     horizontal run at the top edge (the movable Windows taskbar)
 *   "left"    vertical rail on the left edge
 *   "right"   vertical rail on the right edge
 *   "hidden"  returns null
 *
 * Hovering magnifies the icons under the cursor (the macOS fisheye) with a
 * smooth, spring-like response. Clicking a tile toggles: open if not running,
 * focus + restore if minimized or unfocused, otherwise minimize.
 */
declare function Dock(): react_jsx_runtime.JSX.Element | null;
/** Returns the DOMRect of a dock tile by its app id, if mounted. */
declare function getDockTileRect(appId: string): DOMRect | null;

/**
 * Compositor: renders one absolutely-positioned <Window> per open WM entry.
 * z-index ordering comes from each window's `z` so click-to-focus naturally
 * lifts the right one to the top.
 *
 * Workspace filtering is a hide, not an unmount: every window stays mounted
 * and windows on other workspaces are flagged `hidden` so <Window> takes them
 * out of the layout with `display: none`. Keeping them mounted preserves each
 * window's React and DOM state (scroll position, form input, app timers) and
 * stops the open animation from replaying every time you switch back, matching
 * how macOS Spaces and GNOME workspaces keep their windows alive.
 */
declare function WindowLayer(): react_jsx_runtime.JSX.Element;

interface WindowProps {
    win: OpenWindow;
    /**
     * True when the window lives on a workspace other than the active one. The
     * window stays mounted (its state survives) but renders with `display: none`
     * so it is out of layout and not interactable until its workspace is active.
     */
    hidden?: boolean;
}
/**
 * One window. Renders the chrome (title bar with traffic lights) plus the
 * app content. Drag writes the transform directly to the DOM during the
 * gesture and only commits to React state on pointerup, so dragging four
 * windows with live content stays at 60 fps.
 */
declare function Window({ win, hidden }: WindowProps): react_jsx_runtime.JSX.Element | null;

interface SystemWindowContentProps {
    focused: boolean;
    /**
     * Args passed via `openWindow({ kind: "system", systemId, args })`. Use
     * these when one system window definition handles multiple instances
     * (e.g. a single "Component" window powered by a `name` arg).
     */
    args?: SystemWindowArgs;
}
interface SystemWindowDef {
    /**
     * Title shown in the title bar and menu bar. When a string, every
     * instance of this system window shares the title. When a function, the
     * title is derived per-instance from the args (useful for "Component:
     * Spotlight" vs "Component: Window").
     */
    name: string | ((args?: SystemWindowArgs) => string);
    /** Optional one-line subtitle for Spotlight. */
    tagline?: string;
    /** Accent color used by the top-edge highlight. */
    accent?: string;
    /**
     * Category in the Start menu's Category view, like `App.category`.
     * Optional; uncategorized windows file under Other.
     */
    category?: string;
    /** Default window bounds when first opened. */
    defaultBounds: {
        w: number;
        h: number;
    };
    /** Window body component. Receives the optional args alongside focus. */
    content: ComponentType<SystemWindowContentProps>;
    /**
     * Icon shown for this window in the launcher / Start menu, the app switcher,
     * and Mission Control. Optional; without it those surfaces fall back to the
     * window's first letter.
     */
    icon?: ComponentType<{
        size?: number;
    }>;
    /**
     * Per-icon-style variants keyed by the theme's `chrome.iconStyle` (like
     * `App.icons`); the active style is preferred over `icon`.
     */
    icons?: Record<string, ComponentType<{
        size?: number;
    }>>;
    /**
     * Controls whether this system window surfaces as a desktop shortcut icon.
     *
     *   undefined or false  no icon (the window is only reachable via Spotlight
     *                       or a keyboard shortcut, like Settings)
     *   true                always show the icon
     *   function            predicate evaluated against the storage adapter on
     *                       every storage-change event ("state-earned"). Returns
     *                       true to show the icon. The Recents / Downloads /
     *                       Presets pattern: an empty folder is invisible until
     *                       the user has put something in it.
     */
    appearsAsDesktopIcon?: boolean | ((storage: StorageAdapter) => boolean);
    /** Icon component painted on the desktop shortcut. Defaults to a folder. */
    desktopIcon?: ComponentType<{
        size?: number;
    }>;
}
/**
 * Registry of built-in system windows. Each is addressable by `payload:
 * { kind: "system", systemId: "<key>" }`. Consumers can extend this registry
 * with their own folders / system surfaces.
 */
declare const systemWindows: Record<string, SystemWindowDef>;
/** Register a new system window. Consumer apps call this once at startup. */
declare function registerSystemWindow(systemId: string, def: SystemWindowDef): void;
declare function getSystemWindow(systemId: string): SystemWindowDef | undefined;
/** List system windows in declaration order; useful for Spotlight. */
declare function listSystemWindows(): Array<{
    systemId: string;
} & SystemWindowDef>;
/**
 * Resolve the display name for a (possibly args-dependent) system window
 * definition. Used by the title bar, the menu bar, and Spotlight.
 */
declare function resolveSystemWindowName(def: SystemWindowDef, args?: SystemWindowArgs): string;

/** One launcher result: a registered app, a system window, or an external source row. */
type LauncherResult = {
    kind: "app";
    key: string;
    name: string;
    tagline?: string;
    accent?: string;
    icon?: ReactNode;
    /** Start Category-view group, from `App.category`. */
    category?: string;
    app: App;
} | {
    kind: "system";
    key: string;
    name: string;
    tagline?: string;
    accent?: string;
    icon?: ReactNode;
    /** Start Category-view group, from `SystemWindowDef.category`. */
    category?: string;
    systemId: string;
    def: SystemWindowDef;
} | {
    kind: "external";
    key: string;
    name: string;
    tagline?: string;
    accent?: string;
    icon?: ReactNode;
    kindLabel?: string;
    onActivate: () => void;
};
interface LauncherState {
    /** Whether the launcher is currently shown. */
    open: boolean;
    /** Current search text. */
    query: string;
    setQuery: (q: string) => void;
    /** Filtered, ordered results (apps, system windows, then external sources). */
    results: LauncherResult[];
    /** Index of the highlighted result. */
    selectedIndex: number;
    setSelectedIndex: Dispatch<SetStateAction<number>>;
    /** Move the highlight by `delta`, wrapping around the result list. */
    moveSelection: (delta: number) => void;
    /** Open (focus-restoring), close, or activate a result and close. */
    openLauncher: () => void;
    close: () => void;
    activate: (result: LauncherResult) => void;
    /** Activate the currently highlighted result. */
    activateSelected: () => void;
}
/**
 * The shared brain of every launcher presentation. Owns open/close state, the
 * query, the merged result set (apps + system windows + `registerSpotlightSource`
 * rows), selection, and activation, plus the global Cmd/Ctrl+K toggle and the
 * `SPOTLIGHT_OPEN_EVENT` listener. The three built-in presentations
 * (`"spotlight"`, `"grid"`, `"menu"`) are thin views over this hook; consumers
 * can build a fully custom launcher the same way.
 *
 * Activating a result calls `openWindow(...)`, the same primitive a dock click
 * uses, so the shortest path from "I typed three letters" to "the right window
 * is on top" reuses the system's existing plumbing.
 */
declare function useLauncher(): LauncherState;

/**
 * The app launcher. Always mounted by `<Desktop>`; it owns its open/close state
 * and the Cmd/Ctrl+K shortcut through `useLauncher`, and renders the
 * presentation named by `theme.chrome.launcher`:
 *
 *   "spotlight" (default)  macOS centered command palette
 *   "grid"                 GNOME Activities app-grid overview
 *   "menu"                 Windows Start menu
 *
 * All three are thin views over the same hook, so a custom launcher is the
 * same hook plus your own markup.
 */
declare function Launcher(): react_jsx_runtime.JSX.Element | null;

/**
 * Global keyboard shortcut handler. Renders null. Mount once anywhere
 * inside `<DesktopProvider>` (the default `<Desktop>` mounts it for you).
 *
 *   Cmd/Ctrl+W            close focused window
 *   Cmd/Ctrl+M            minimize focused window
 *   Cmd/Ctrl+1..9         open / focus / cycle-minimize app N (1-indexed into
 *                         the apps registry, in declared order)
 *   Cmd/Ctrl+K            dispatches SPOTLIGHT_OPEN_EVENT
 *   Cmd/Ctrl+,            open Settings (macOS convention)
 *   Mod+Arrow             snap the focused window (Up maximize, Down restore,
 *                         Left/Right halves, +Shift quarters). The references
 *                         snap with Win/Super, but the OS eats that key before
 *                         the page, so this uses Mod (Ctrl, or Cmd on macOS)
 *   Ctrl+Alt+Arrow        switch workspace (+Shift brings the focused window)
 *   F3                    Mission Control (Ctrl+Up is the macOS overview key,
 *                         claimed by the OS, so it stays free for maximize)
 *   Escape                restore the focused window if maximized
 *
 * Every binding bails when the event target is an `<input>`, `<textarea>`, or
 * contenteditable element, so typing in fields is never hijacked. The full
 * shortcut registry, including Mission Control and the app switcher, and the
 * test that proves no two chords clash, live in keymap.ts.
 */
declare function KeyboardShortcuts(): null;

/**
 * Top-right stack of active toasts. Each toast slides in from the right
 * edge, sits, then slides out when its `duration` elapses or the user
 * dismisses it. The component is purely a viewer of the module-level
 * notification store; it does not own any of the truth.
 *
 * Self-mounted by `<Desktop>` so the consumer does not have to think
 * about where to put it.
 */
declare function NotificationToasts(): react_jsx_runtime.JSX.Element | null;

/**
 * Right-edge slide-in panel showing the full notification history.
 * Toggled by `NOTIFICATION_CENTER_TOGGLE_EVENT` (typically dispatched
 * when the user clicks the menu-bar clock) and dismissed by Esc, by
 * clicking the backdrop, or by re-firing the toggle event.
 *
 * Marks every visible item as read the first time it opens so the
 * unread badge clears the moment the user acknowledges them.
 */
declare function NotificationCenter(): react_jsx_runtime.JSX.Element;

/**
 * The popover that drops from the menu-bar status cluster: the GNOME system
 * menu, the macOS Control Center, the Windows quick settings flyout. Renders
 * the entries registered via `registerQuickSetting` grouped by kind, action
 * buttons in a header row, sliders, then a two-column grid of toggle tiles.
 * Toggled by `QUICK_SETTINGS_TOGGLE_EVENT`, dismissed by Escape or by clicking
 * away. Renders nothing until something is registered.
 *
 * Mounted once by `<Desktop>`. The panel anchors under the top menu bar when
 * the theme uses one, otherwise to the top-right corner.
 */
declare function QuickSettings(): react_jsx_runtime.JSX.Element | null;

/**
 * Quick settings populate the popover that drops from the menu-bar status
 * cluster: the GNOME system menu, the macOS Control Center, the Windows quick
 * settings flyout. All three are the same shape, a small panel of toggle
 * tiles, a slider or two, and a row of action buttons (settings, lock, power),
 * so the library owns the visuals and consumers contribute data.
 *
 * The contract mirrors `registerStatusItem`: register from any code, get back
 * an unsubscribe, components subscribe via `useSyncExternalStore`. Items are
 * controlled, they carry their current `active` / `value`; re-register the
 * same id to update (the QuickSettings component reads the item as the source
 * of truth and calls the item's handler on interaction). Items render in
 * declared `order`, low-first, grouped by kind: actions in the header row,
 * sliders next, toggle tiles in a two-column grid.
 */
interface QuickSettingBase {
    /** Stable id used as the React key and the dedup token. */
    id: string;
    /** Render order within its group. Lower first. Defaults to 100. */
    order?: number;
}
interface QuickSettingToggle extends QuickSettingBase {
    kind: "toggle";
    label: string;
    /** Secondary line under the label ("Balanced", "Wired"). */
    sublabel?: string;
    /** Leading glyph, ~16px. */
    icon?: ReactNode;
    /** Current on/off state. Controlled: re-register to change it. */
    active?: boolean;
    onToggle?: (next: boolean) => void;
    /**
     * Optional secondary affordance shown as a trailing chevron, the GNOME
     * "expand into a sub-menu" arrow (e.g. Wired › opens network details).
     */
    onExpand?: () => void;
}
interface QuickSettingSlider extends QuickSettingBase {
    kind: "slider";
    ariaLabel: string;
    /** Leading glyph, ~16px (a speaker, a sun). */
    icon?: ReactNode;
    /** Current value in the 0..1 range. Controlled: re-register to change it. */
    value: number;
    onChange?: (next: number) => void;
}
interface QuickSettingAction extends QuickSettingBase {
    kind: "action";
    /** Glyph, ~16px. */
    icon: ReactNode;
    tooltip?: string;
    onClick?: () => void;
    /** Header alignment. `"start"` sits at the left, `"end"` (default) at the right. */
    align?: "start" | "end";
}
type QuickSettingItem = QuickSettingToggle | QuickSettingSlider | QuickSettingAction;
/**
 * Register a quick-settings entry. Returns an unsubscribe. Re-registering the
 * same id replaces the previous record, so a controller can flip a toggle or
 * move a slider by registering again with the new value.
 */
declare function registerQuickSetting(item: QuickSettingItem): () => void;
/** Remove an entry by id. */
declare function unregisterQuickSetting(id: string): void;
declare function listQuickSettings(): QuickSettingItem[];
declare function subscribeQuickSettings(listener: () => void): () => void;

/**
 * Cmd/Ctrl + Tab application switcher. Holds while the modifier is down,
 * cycles selection on Tab (and Shift+Tab to reverse), and activates the
 * focused app when the modifier is released. Esc cancels without switching.
 * The open / cycle keydown comes from the single keyboard dispatcher as
 * APP_SWITCHER_CYCLE_EVENT; this component only watches the modifier release,
 * so it adds no second global keydown listener.
 *
 * MRU order comes from window z-index: the highest z is the most recent
 * focus, so the first Cmd+Tab selects the second entry (Mac convention).
 * Apps without any open window aren't included. The switcher targets
 * running apps, not the launcher.
 */
declare function AppSwitcher(): react_jsx_runtime.JSX.Element | null;

/**
 * Mission Control: press F3 (or Ctrl+Up on non-Mac keyboards) and every open
 * window spreads into a non-overlapping set of preview cards. Click a card to
 * focus that window and collapse back; click empty space or press Esc to
 * collapse without switching.
 *
 * Each card is a live, scaled re-render of the window's own chrome and content,
 * with the app name on a readable label beneath it (scaled title text is too
 * small to read, so macOS labels separately too). The preview mounts a second,
 * inert instance of the content while Mission Control is open, so it shows the
 * real UI but not unsaved live state; an error boundary keeps a misbehaving
 * preview from tearing down the overlay.
 *
 * Self-mounted by `<Desktop>`. Drop down to `<DesktopProvider>` and skip it if
 * you want to replace it.
 */
declare function MissionControl(): react_jsx_runtime.JSX.Element | null;

/**
 * The keyboard shortcuts reference. Opens with Mod+/ or Ctrl+? (and from the
 * right-click desktop menu, for keyboard layouts where neither chord is
 * reachable). It renders the keymap registry, so the list a user reads is
 * exactly the one the dispatcher fires. Toggled by KEYBOARD_HELP_TOGGLE_EVENT;
 * closes on Escape or a backdrop click.
 */
declare function KeyboardHelp(): react_jsx_runtime.JSX.Element | null;

/**
 * Centered floating indicator for transient action feedback ("Snapped
 * Left", "Maximized", "Volume 30%"). Hold-then-fade lifecycle is owned
 * by the HUD store. This component just paints what the store points
 * at and animates the entry / exit.
 */
declare function HudOverlay(): react_jsx_runtime.JSX.Element | null;

/**
 * The HUD is the small floating indicator the OS uses to confirm a
 * momentary action: "Snapped Left", "Maximized", "Volume 35%". Always
 * centered, always fades after a short hold, never blocks input. The
 * store is module-level so a snap handler, a hotkey, or a custom action
 * can fire it without prop-drilling.
 */
interface HudPayload {
    /** Visible main line. Keep short. This is glyphic, not paragraph copy. */
    title: string;
    /** Optional second line. */
    sublabel?: string;
    /** Visual icon. A ReactNode lets consumers use their existing icon kit. */
    icon?: ReactNode;
    /**
     * Optional 0..1 progress bar drawn beneath the title. Useful for
     * volume / brightness analogues.
     */
    progress?: number;
    /**
     * Optional accent color override. Defaults to the theme accent.
     */
    accent?: string;
    /** Hold time in ms before the HUD fades out. Defaults to 1100. */
    duration?: number;
}
interface ActiveHud extends HudPayload {
    id: number;
    /** Wall-clock at which the HUD was triggered. */
    startedAt: number;
}
/**
 * Show a HUD. Re-firing replaces the active one so quick repeated
 * actions (multiple brightness taps) coalesce into a single floating
 * indicator that updates in place.
 */
declare function showHud(payload: HudPayload): void;
/** Hide immediately. Useful when a follow-up surface (toast, dialog) takes over. */
declare function hideHud(): void;
declare function getHud(): ActiveHud | null;
declare function subscribeHud(listener: (value: ActiveHud | null) => void): () => void;

interface TooltipProps {
    /** The label rendered in the body. Use short, glanceable copy. */
    text: string;
    /** Optional shortcut hint shown on the right side ("⌘K", "F3", "↵"). */
    shortcut?: string;
    /** Preferred edge. Tooltip flips if it would clip. Default "top". */
    placement?: "top" | "bottom" | "left" | "right";
    /** Disable the tooltip without unwrapping the child. */
    disabled?: boolean;
    /** Single child. Must accept onPointerEnter / onPointerLeave / onFocus / onBlur. */
    children: ReactNode;
}
declare function Tooltip({ text, shortcut, placement, disabled, children, }: TooltipProps): react_jsx_runtime.JSX.Element;

interface SliderProps {
    value: number;
    min: number;
    max: number;
    step?: number;
    onChange: (next: number) => void;
    /** Optional label rendered above the track. */
    label?: string;
    /** Optional unit appended to the value readout (`"px"`, `"ms"`, `"%"`). */
    unit?: string;
    /** Override the accent. Defaults to the theme accent. */
    accent?: string;
    /** Hide the right-aligned numeric readout. */
    hideValue?: boolean;
    /** Disable interaction. */
    disabled?: boolean;
    /** Accessibility label when no visible `label`. */
    ariaLabel?: string;
}
/**
 * Themed range input. Renders the native input invisibly above the
 * track so keyboard and pointer behavior stay correct (Tab focus, arrow
 * keys, screen-reader announcements) while the visual fill, thumb, and
 * readout are styled to match the rest of the library.
 *
 * Why not a custom-drawn track + a fake thumb? The native input handles
 * page-up / page-down / home / end shortcuts and screen-reader value
 * announcements for free. A custom implementation would have to redo
 * all of that and still wouldn't be as good.
 */
declare function Slider({ value, min, max, step, onChange, label, unit, accent, hideValue, disabled, ariaLabel, }: SliderProps): react_jsx_runtime.JSX.Element;

interface ToggleProps {
    checked: boolean;
    onChange: (next: boolean) => void;
    /** Visible label rendered to the left of the switch. */
    label?: string;
    /** Optional helper line under the label. */
    description?: string;
    /** Accent color override (defaults to the theme accent). */
    accent?: string;
    /** Disable interaction. */
    disabled?: boolean;
    /** Accessibility label when no visible `label` is provided. */
    ariaLabel?: string;
}
/**
 * Themed switch. Renders a labelled row with a sliding thumb track,
 * macOS-style. Built on a real `<button role="switch">` so screen
 * readers and keyboard users get the right semantics and focus ring.
 */
declare function Toggle({ checked, onChange, label, description, accent, disabled, ariaLabel, }: ToggleProps): react_jsx_runtime.JSX.Element;

/**
 * Status items are the small widgets that live in the right-hand cluster
 * of the menu bar. Battery indicators, network status, sync state, an
 * online dot, a current-track player, anything that lives outside the
 * app windows and needs a permanent home next to the clock.
 *
 * The contract mirrors `registerSpotlightSource`: register an item from
 * any code, get back an unsubscribe, components subscribe via
 * `useSyncExternalStore`. Items render in declared `order`, low-first.
 */
interface StatusItem {
    /** Stable id used as the React key and the dedup token. */
    id: string;
    /** Visible icon, ~14 px. Use your icon kit's ReactNode. */
    icon: ReactNode;
    /** Tooltip text shown on hover ("Battery 78%"). */
    tooltip?: string;
    /** Visual badge such as an unread count or status dot. */
    badge?: string | number;
    /** Tooltip-side shortcut hint ("⌃⇧Space"). Decorative. */
    shortcut?: string;
    /** Click handler. If absent, the item renders as a non-interactive marker. */
    onClick?: () => void;
    /** Render order. Lower numbers sit further from the clock. Defaults to 100. */
    order?: number;
}
/**
 * Register a status item. Returns an unsubscribe. Re-registering the same
 * id replaces the previous record so a host component can re-render with
 * an updated badge without churn.
 */
declare function registerStatusItem(item: StatusItem): () => void;
/** Remove an item by id. Useful when the registration was made imperatively. */
declare function unregisterStatusItem(id: string): void;
/**
 * Read the cached snapshot. Stable across calls until a registration
 * mutates the registry, at which point a single new array is built and
 * cached for subsequent reads.
 */
declare function listStatusItems(): StatusItem[];
declare function subscribeStatusItems(listener: () => void): () => void;

/**
 * The visual surface for the context-menu store. Mount this once inside
 * `<DesktopProvider>` and any code can pop up a menu via
 * `openContextMenu({ x, y, items })`. `<Desktop>` mounts it for you.
 *
 * Closes on Esc, click outside, scroll, resize, window blur, or any new
 * contextmenu event somewhere else. Activating an item runs its onSelect
 * and then closes.
 */
declare function ContextMenu(): react_jsx_runtime.JSX.Element | null;

/**
 * Module-level context-menu store. One active menu at a time. Opening
 * a new menu closes whatever was open before. Vanilla because callers
 * dispatch from anywhere (an onContextMenu handler, an effect, a
 * keyboard shortcut). React reads via useSyncExternalStore.
 */
interface ContextMenuItem {
    /** Rendered label. Use `separator: true` instead of a label for dividers. */
    label?: string;
    /** Visual leading icon (small, ~14px). */
    icon?: ReactNode;
    /** Right-aligned shortcut hint, e.g. "⌘N" or "F2". */
    shortcut?: string;
    /** Handler. The menu closes after this runs. */
    onSelect?: () => void;
    /** Greys out the row and skips it during keyboard navigation. */
    disabled?: boolean;
    /** Tints the row red. Usually sits below a separator. */
    danger?: boolean;
    /** Renders a divider in place of a normal row. */
    separator?: boolean;
    /** Optional nested submenu. Hovering opens it; arrow-right enters. */
    submenu?: ContextMenuItem[];
}
interface ContextMenuState {
    /** Page coordinates where the menu should anchor. */
    x: number;
    y: number;
    items: ContextMenuItem[];
    /** Accessibility label for the menu container. */
    ariaLabel?: string;
    /** Optional element that opened the menu. Focus returns here on close. */
    returnFocusTo?: HTMLElement | null;
}
declare function openContextMenu(state: ContextMenuState): void;
declare function closeContextMenu(): void;
declare function getContextMenuState(): ContextMenuState | null;
declare function subscribeContextMenu(listener: (state: ContextMenuState | null) => void): () => void;

interface AnchorProps {
    /** Items to show when the wrapped region is right-clicked. */
    items: ContextMenuItem[] | (() => ContextMenuItem[]);
    /** Accessibility label for the popped menu. */
    ariaLabel?: string;
    children: ReactNode;
}
/**
 * Declarative wrapper. Right-clicking the wrapped child opens a context
 * menu at the cursor with the given items. Pass a function for `items`
 * if the menu contents depend on per-event state; it runs on every
 * right-click.
 *
 * Use the imperative `openContextMenu(...)` instead when you need
 * fine-grained control over the trigger (e.g. opening from a button
 * click, deriving items from selection across multiple regions).
 */
declare function ContextMenuAnchor({ items, ariaLabel, children }: AnchorProps): react_jsx_runtime.JSX.Element;

interface DesktopBackdropProps {
    /** Extra items appended to the default set. */
    extraItems?: ContextMenuItem[];
    /**
     * Override the default items entirely. Receives the default items so the
     * consumer can decide which to keep, drop, or sandwich around custom ones.
     */
    buildItems?: (defaultItems: ContextMenuItem[]) => ContextMenuItem[];
}
/**
 * Catches right-clicks on the desktop background and pops a system menu.
 * Uses a document-level capture-phase listener and bails out when the
 * click landed inside a window, dock, menu bar, or other interactive
 * surface. Anything that already has its own context menu (or a sane
 * "nothing" behavior) keeps it.
 *
 * Default items surface system entry points: Spotlight, Notifications,
 * Settings, Show Desktop. Extend with `extraItems` for app-specific
 * commands (Change wallpaper, Sort icons), or replace wholesale with
 * `buildItems`.
 *
 * Mounted by `<Desktop>` automatically. Mount manually inside a
 * `<DesktopProvider>` composition if you want it but with a custom
 * item set.
 */
declare function DesktopBackdrop({ extraItems, buildItems }?: DesktopBackdropProps): null;

/**
 * Translucent rectangle that appears while a window drag hovers a snap
 * zone. Reads from the snap store: Window updates it during drag, this
 * component just paints. Lives inside the same provider as the windows so
 * the theme accent feels coherent.
 */
declare function SnapPreview(): react_jsx_runtime.JSX.Element | null;

/**
 * Window snapping (Aero Snap). During a drag the pointer's vicinity to a
 * viewport edge or corner picks a snap zone. The SnapPreview overlay reads
 * the active zone from this store; the Window's pointerup handler reads
 * the resolved rect and applies it via setBounds.
 *
 * Vanilla store so the Window and the SnapPreview don't have to share a
 * provider, the same pattern notifications and the context menu use.
 */
type SnapZone = "left-half" | "right-half" | "top-max" | "top-left-quarter" | "top-right-quarter" | "bottom-left-quarter" | "bottom-right-quarter";
interface SnapRect {
    x: number;
    y: number;
    w: number;
    h: number;
}
interface SnapState {
    /** Window id being snapped. */
    windowId: string;
    zone: SnapZone;
    /** Resolved target rectangle in viewport coords. */
    rect: SnapRect;
}
declare function setSnapPreview(state: SnapState | null): void;
declare function getSnapPreview(): SnapState | null;
declare function subscribeSnapPreview(listener: (state: SnapState | null) => void): () => void;
/**
 * Map a pointer position inside `work` to a snap zone, or null if outside
 * the activation thresholds.
 *
 * Layout intent (mirrors Windows Snap / macOS edge drag):
 *
 *   ┌──────────────┬──────────────┐
 *   │ TL quarter   │ TR quarter   │
 *   │              │              │
 *   ├──────────────┴──────────────┤
 *   │   top edge → maximize       │
 *   │                             │
 *   │ left edge ── ── right edge  │
 *   │   half-left   half-right    │
 *   │                             │
 *   ├──────────────┬──────────────┤
 *   │ BL quarter   │ BR quarter   │
 *   └──────────────┴──────────────┘
 */
declare function computeSnapZone(pointerX: number, pointerY: number, work: WorkArea): SnapZone | null;
/** Resolve a snap zone to a target rectangle inside the given work area. */
declare function rectForZone(zone: SnapZone, work: WorkArea): SnapRect;

/**
 * Window event names emitted by the library. Consumers can dispatch these
 * from anywhere in the app to trigger system surfaces without prop-drilling.
 *
 * Example: a "Find" button in a custom menu-bar item can open Spotlight
 * with `window.dispatchEvent(new CustomEvent(SPOTLIGHT_OPEN_EVENT))`.
 */
declare const SPOTLIGHT_OPEN_EVENT = "react-ui-os:spotlight-open";
/**
 * Toggle the Notification Center sheet. The Center component listens for
 * this so any custom menu-bar item or keyboard shortcut can open it
 * without prop drilling.
 */
declare const NOTIFICATION_CENTER_TOGGLE_EVENT = "react-ui-os:notification-center-toggle";
/**
 * Toggle the Quick Settings popover (the GNOME system menu / macOS Control
 * Center / Windows quick settings flyout). The QuickSettings component listens
 * for this so the menu-bar status cluster, a keyboard shortcut, or any custom
 * widget can open it without prop drilling.
 */
declare const QUICK_SETTINGS_TOGGLE_EVENT = "react-ui-os:quick-settings-toggle";
/**
 * Toggle Mission Control (the all-windows overview). The MissionControl
 * component listens for this, so the single keyboard dispatcher owns the open
 * chord (Ctrl+Up, F3) alongside every other global shortcut rather than running
 * a second keydown listener that could clash. Any custom widget can open the
 * overview by dispatching it.
 */
declare const MISSION_CONTROL_TOGGLE_EVENT = "react-ui-os:mission-control-toggle";
/**
 * Toggle the keyboard shortcuts help overlay. The KeyboardHelp component
 * listens, so the menu bar, a button, or the Mod+/ shortcut can all open the
 * reference without prop drilling.
 */
declare const KEYBOARD_HELP_TOGGLE_EVENT = "react-ui-os:keyboard-help-toggle";
/**
 * Advance the application switcher. The single keyboard dispatcher owns the
 * Mod+Tab keydown and fires this (with `detail.backward` for Shift+Tab); the
 * AppSwitcher opens on the first one and cycles on the rest, then commits when
 * the modifier is released. Keeps the switcher's open chord out of a second
 * global keydown listener.
 */
declare const APP_SWITCHER_CYCLE_EVENT = "react-ui-os:app-switcher-cycle";

/**
 * The keyboard shortcut registry and its conflict detection.
 *
 * ## One chord, one action
 *
 * Real desktops keep a chord mapped to exactly one action, enforced where the
 * binding is made:
 *
 * - macOS sends a key equivalent down the responder chain; the first responder
 *   that handles it returns YES and consumes it, stopping propagation. System
 *   hot keys (Mission Control = Ctrl+Up, Spotlight = Cmd+Space) are claimed by
 *   the window server before the app, so an app cannot bind them.
 * - Windows registers global hot keys with RegisterHotKey, which fails if the
 *   chord is already taken, so two handlers can never own one chord. The shell
 *   owns the Win+Arrow snap chords.
 * - GNOME stores keybindings in GSettings; its Settings panel detects a clash
 *   on assignment ("already used for X") and reassigns, disabling the prior
 *   binding. Mutter grabs each binding once.
 *
 * The shared rule is one chord, one action. {@link SHORTCUTS} is our single
 * list of every global binding, and {@link findConflicts} (run by the test)
 * fails the build if two shortcuts in the same scope claim the same chord.
 *
 * ## The browser is not the OS
 *
 * A web desktop only ever sees the chords the browser and the host OS don't
 * claim first. The Super/Win/Cmd key (metaKey) never reaches a page on Windows
 * or GNOME, where Win+Arrow and Super+Arrow are the shell's own snap chords;
 * Cmd+Arrow, Ctrl+W, and Ctrl+1..9 are reserved by the browser itself. So we
 * cannot bind the references' literal chords. We use "Mod" (Ctrl, or Cmd on
 * macOS) for the primary modifier, which does reach the page, and accept that a
 * few combos the browser keeps (Cmd+Arrow on macOS, the tab chords) stay out of
 * reach: a native build could use the real chords, a page cannot.
 *
 * The clash this caught: Ctrl+Up drove both maximize (Mod+Arrow) and Mission
 * Control (the macOS Ctrl+Up). Maximize keeps Ctrl+Up, the chord that reaches
 * the page and the one a browser user reaches for; Mission Control drops to F3,
 * because on the desktops it imitates, the overview chords (Ctrl+Up on macOS,
 * Super/Win+Tab) are taken by the host OS before a page could ever see them.
 */
interface ChordEvent {
    ctrlKey: boolean;
    altKey: boolean;
    shiftKey: boolean;
    metaKey: boolean;
    key: string;
}
/** Canonical chord string for a keydown event, e.g. "ctrl+arrowup", "meta+k". */
declare function chordOf(e: ChordEvent): string;
/**
 * Where a shortcut is live. "desktop" shortcuts are always active; the others
 * only while their overlay is open, so the same key (Escape, arrows) can mean
 * different things in different overlays without clashing.
 */
type Scope = "desktop" | "mission-control" | "app-switcher" | "spotlight";
interface Shortcut {
    id: string;
    /**
     * Chord specs. "Mod" is the primary modifier (Cmd on macOS, Ctrl elsewhere),
     * which a browser reports as metaKey or ctrlKey, so it expands to both. Other
     * tokens (Ctrl, Alt, Shift, Meta, and the key) are literal.
     */
    chords: string[];
    label: string;
    group: string;
    scope: Scope;
    /**
     * Optional override for how the chord reads in the shortcuts help, when the
     * raw chords would be unwieldy (a 1..9 range, say). A spec string like the
     * chords, run through {@link formatChord}.
     */
    display?: string;
}
interface Conflict {
    scope: Scope;
    chord: string;
    ids: string[];
}
/** Concrete chords claimed by more than one shortcut within the same scope. */
declare function findConflicts(shortcuts: Shortcut[]): Conflict[];
/**
 * Every keyboard shortcut the desktop binds, listed once. Keep it in step with
 * the handlers (KeyboardShortcuts, MissionControl, AppSwitcher); the conflict
 * test guards that no two in a scope collide.
 */
declare const SHORTCUTS: Shortcut[];
/**
 * Render a chord spec for the shortcuts help: macOS-style glued symbols
 * (⌘⇧K) when `mac`, spaced words otherwise (Ctrl + Shift + K).
 * Modifiers map to the platform's key, "Mod" included; arrows and Escape get
 * glyphs; a single letter is uppercased.
 */
declare function formatChord(spec: string, mac: boolean): string;

/**
 * One result row contributed by a Spotlight source. Sources are how features
 * outside the apps registry and the system-window registry surface in the
 * Cmd-K palette: recently opened docs pages, presets, downloads, bookmarks,
 * or anything else the consumer wants to make findable.
 */
interface SpotlightResult {
    /** Stable id used as the React key and the dedup token. */
    id: string;
    /** Visible row label. */
    name: string;
    /** Optional one-line subtitle on the right. */
    tagline?: string;
    /** Accent color tinting the row's tile gradient. */
    accent?: string;
    /** Optional icon node rendered inside the tile. */
    icon?: ReactNode;
    /** Source-side label such as "Doc · Spotlight", "Preset · Tubes". */
    kindLabel?: string;
    /** What to do when the row is activated (Enter or click). */
    onActivate: () => void;
}
/**
 * A Spotlight source returns the current set of results for a given query.
 * Receives the raw query string (lowercased, trimmed) and returns the rows
 * to merge into the Spotlight panel. Returning an empty array when the
 * query doesn't apply is the convention.
 */
type SpotlightSource = (query: string) => SpotlightResult[];
/**
 * Register a Spotlight source. Returns an unsubscribe function. Sources are
 * keyed by `id` so registering twice with the same id replaces the previous
 * one, useful when a host component re-mounts.
 */
declare function registerSpotlightSource(id: string, source: SpotlightSource): () => void;
/** Read every registered source. Order follows registration order. */
declare function listSpotlightSources(): SpotlightSource[];
/** Subscribe to source-registry changes; returns unsubscribe. */
declare function subscribeSpotlightSources(listener: () => void): () => void;

/**
 * One row in the Start menu's "Recent" section. Windows 11's redesigned Start
 * renames "Recommended" to "Recent" and fills it with recently installed apps
 * and recently used files. The apps half comes from the window manager's own
 * recency; these sources contribute the files half: notes, documents,
 * downloads, presets, whatever the consumer's apps touch and persist.
 * Source: https://blogs.windows.com/windows-insider/2026/05/15/improving-windows-quality-making-taskbar-and-start-more-personal/
 */
interface RecentItem {
    /** Stable id within the source; the menu keys rows by source id plus this. */
    id: string;
    /** Visible row label, e.g. the document title. */
    name: string;
    /** Epoch ms of last use. The section orders newest first. */
    timestamp: number;
    /** Type label under the name ("Note", "Download"). */
    kindLabel?: string;
    /** Accent color tinting the row's tile gradient. */
    accent?: string;
    /** Optional icon node rendered inside the tile. */
    icon?: ReactNode;
    /** What to do when the row is activated (Enter or click). */
    onActivate: () => void;
}
/**
 * A recents source returns its current items each time the Start menu opens.
 * Read your own store inside the function so the rows are always fresh; the
 * registry never caches results.
 */
type RecentsSource = () => RecentItem[];
/** A merged item tagged with the id of the source that produced it. */
type RecentEntry = RecentItem & {
    sourceId: string;
};
/**
 * Register a recents source. Returns an unsubscribe function. Sources are
 * keyed by `id` so registering twice with the same id replaces the previous
 * one, useful when a host component re-mounts.
 */
declare function registerRecentsSource(id: string, source: RecentsSource): () => void;
/** Number of registered sources; a cheap version token for useSyncExternalStore. */
declare function countRecentsSources(): number;
/**
 * Query every source and merge the results, newest first. A misbehaving
 * source is dropped for that call (with a dev-only warning) rather than
 * tearing down the Start menu, the same guard the launcher applies to
 * Spotlight sources.
 */
declare function listRecentItems(): RecentEntry[];
/** Subscribe to source-registry changes; returns unsubscribe. */
declare function subscribeRecentsSources(listener: () => void): () => void;

/**
 * Settings system app body. Reads the active theme's `customizable` schema and
 * renders one editor per field. Layout follows modern settings apps (macOS
 * Ventura, Windows 11, GNOME): a search field over a category sidebar and a
 * content pane of grouped rows, each row a label and description beside its
 * control. Search filters across every section at once; below a width threshold
 * the sidebar folds into a top bar and wide controls stack under their labels.
 * Edits write straight to the prefs store, so the effective theme rebuilds live.
 */
declare function Settings(): react_jsx_runtime.JSX.Element;

/** Ask the Settings window to switch to `section` on its next read. */
declare function requestSettingsSection(section: string): void;

interface ExplorerItem {
    /** Stable id used as the React key and the action callback argument. */
    id: string;
    /** Visible label. */
    name: string;
    /** "Kind" cell in list view + group/sort field. */
    kind?: string;
    /** Epoch ms, drives the Date column + sort. */
    timestamp?: number;
    /** Optional one-line subtitle in icon view. */
    subtitle?: string;
    /** Optional right-aligned metadata in list view (e.g. file format). */
    meta?: string;
    /** Large tile icon, rendered in icon view. */
    icon?: ReactNode;
    /** Compact icon used in list view. Falls back to `icon`. */
    iconSmall?: ReactNode;
}
interface ExplorerAction<T extends ExplorerItem = ExplorerItem> {
    id: string;
    label: string;
    icon?: ReactNode;
    /** Receives all currently-selected items. Bulk-safe. */
    onClick: (items: T[]) => void;
    /** Show in red and below a divider in the context menu. */
    danger?: boolean;
    /** Hide when more than one item is selected. */
    singleOnly?: boolean;
    /** Optional keyboard hint shown in the context menu (e.g. "⌫", "F2"). */
    shortcut?: string;
}
interface ExplorerSidebarItem {
    id: string;
    label: string;
    icon?: ReactNode;
    /** Tint applied to the icon and to the active background. */
    iconColor?: string;
    active?: boolean;
    onClick: () => void;
}
interface ExplorerSidebarSection {
    label: string;
    items: ExplorerSidebarItem[];
}
interface FileExplorerProps<T extends ExplorerItem = ExplorerItem> {
    items: T[];
    /** Triggered on double-click / Enter, single item. */
    onOpen?: (item: T) => void;
    /** When provided, items become renameable via F2 / context menu. */
    onRename?: (item: T, newName: string) => void;
    /** Buttons shown in the toolbar action bar + context menu. */
    actions?: ExplorerAction<T>[];
    /** Optional Finder-style left rail. */
    sidebar?: ExplorerSidebarSection[];
    /** Shown when items is empty. */
    emptyState?: ReactNode;
    /** Default view mode. Toggle is always available in the toolbar. */
    defaultView?: ViewMode;
}
type ViewMode = "icons" | "list";
/**
 * Finder-style item explorer. Item-agnostic and host-driven: pass an
 * `items` array of your own shape mapped to `ExplorerItem`, optional
 * `actions`, an `onOpen` callback, and (for editable lists) an
 * `onRename` callback. The explorer owns selection, view mode, sort,
 * search, rename, and the context menu.
 *
 * Interaction model mirrors macOS Finder so the muscle memory carries
 * over:
 *
 *  - single click sets the selection
 *  - Cmd/Ctrl-click toggles an item in/out
 *  - Shift-click range-selects from the anchor
 *  - empty-area click clears
 *  - F2 begins rename; Enter / blur commits, Escape cancels
 *  - Delete / Backspace invokes the action with `id: "delete"` if present
 *  - Cmd/Ctrl+A selects all filtered items
 *  - Escape clears the selection, closes the context menu, cancels rename
 */
declare function FileExplorer<T extends ExplorerItem>({ items, onOpen, onRename, actions, sidebar, emptyState, defaultView, }: FileExplorerProps<T>): react_jsx_runtime.JSX.Element;

/**
 * Right-edge column of file-style desktop shortcuts plus the desktop's
 * rubber-band marquee. Renders one icon per system window whose
 * `appearsAsDesktopIcon` evaluates to true. Predicates are re-checked whenever
 * the storage adapter fires a change event, so a Downloads or Presets folder
 * appears the moment the user creates the first item and disappears when they
 * delete the last one.
 *
 * Interaction mirrors the macOS desktop, matching the selection model the
 * `FileExplorer` already implements:
 *
 *  - single click selects an icon; Cmd/Ctrl click toggles; Shift click extends
 *  - double click (or Enter on the active icon) opens it
 *  - a left drag on the bare desktop sweeps a marquee that selects the icons
 *    it covers; a click on bare desktop, or Escape, clears the selection
 *  - ArrowUp / ArrowDown move the selection; Home / End jump to first / last;
 *    Cmd/Ctrl+A selects every icon
 *
 * The column is a WAI-ARIA multi-select listbox driven by
 * `aria-activedescendant`, so the whole column is a single tab stop and
 * assistive tech announces the active icon. The component always mounts (even
 * with no icons) so the marquee works on an empty desktop.
 */
declare function DesktopIcons(): react_jsx_runtime.JSX.Element;

/**
 * Default folder icon for desktop shortcuts. Frosted tab + body with a soft
 * gradient. Sized to look right inside a 48-64 px tile.
 */
declare function FolderSvg({ size }: {
    size?: number;
}): react_jsx_runtime.JSX.Element;

/**
 * Cascade slot the next window opened on the active workspace will occupy: the
 * number of windows already living there. A freshly opened window stacks on
 * top of exactly those, so the count is its position down the diagonal. The
 * open surfaces (dock, Spotlight, menu bar, keyboard shortcuts, ...) pass this
 * to {@link pickInitialBounds} so successive launches step down and to the
 * right instead of piling up dead-center.
 */
declare function nextCascadeIndex(state: WindowManagerState): number;
/**
 * Pick a sensible initial position + size for a new window.
 *
 *   - If the consumer passed explicit bounds, clamp them to the work
 *     area but otherwise honor them.
 *   - Otherwise prefer the App's or SystemWindowDef's `defaultBounds`
 *     and center them in the work area.
 *   - Otherwise fall back to a 720×480 desktop default, centered, and
 *     capped at 90% of the work area so it never overflows a tiny
 *     viewport (LivePreview iframe, narrow phone, etc).
 *
 * Centering matters because a fixed `(80, 80)` default looks fine on a
 * 1440×900 desktop but spawns the entire window into a 760×460 docs
 * iframe with no breathing room around it.
 *
 * `cascadeIndex` staggers successive auto-placed windows so they don't stack
 * dead-center on top of each other: index 0 is centered, every later window
 * steps down and to the right. See {@link cascadeOrigin}.
 */
declare function pickInitialBounds(payload: WindowPayload, theme: OsTheme, apps: App[], explicit?: WindowBounds, cascadeIndex?: number): WindowBounds;

interface DesktopContextValue {
    apps: App[];
    appsById: Map<string, App>;
    /** Theme as declared by the consumer, before any user prefs are layered on. */
    baseTheme: OsTheme;
    /** The effective theme: defaults overlaid with the user's stored prefs. */
    theme: OsTheme;
    storage: StorageAdapter;
    /** Stored user-pref overlay. Keys are the same dotted paths as `theme.customizable`. */
    prefs: SettingsPrefs;
    setPref: (path: string, value: unknown) => void;
    resetPref: (path: string) => void;
    resetAllPrefs: () => void;
}
declare function useDesktopContext(): DesktopContextValue;
/** Effective theme: declared theme overlaid with user prefs. */
declare function useTheme(): OsTheme;
/** Theme as declared by the consumer, before user prefs. Use sparingly. */
declare function useBaseTheme(): OsTheme;
declare function useApps(): App[];
declare function useApp(appId: string): App | undefined;
interface UseSettingsResult {
    /** The active theme's customizable schema. Empty record when undeclared. */
    schema: NonNullable<OsTheme["customizable"]>;
    /** Current user pref values keyed by the same paths. */
    prefs: SettingsPrefs;
    /** Set one pref value. Triggers immediate re-render across the desktop. */
    setPref: (path: string, value: unknown) => void;
    /** Remove a single pref so the field falls back to the theme default. */
    resetPref: (path: string) => void;
    /** Clear every stored pref for the active theme. */
    resetAll: () => void;
}
declare function useSettings(): UseSettingsResult;

export { APP_SWITCHER_CYCLE_EVENT, AppSwitcher, type Conflict, ContextMenu, ContextMenuAnchor, type ContextMenuItem, type ContextMenuState, DOCK_HEIGHT, DOCK_WIDTH, Desktop, DesktopBackdrop, DesktopIcons, type DesktopProps, DesktopProvider, type DesktopProviderProps, Dock, type ExplorerAction, type ExplorerItem, type ExplorerSidebarItem, type ExplorerSidebarSection, FileExplorer, type FileExplorerProps, FolderSvg, HudOverlay, type HudPayload, KEYBOARD_HELP_TOGGLE_EVENT, KeyboardHelp, KeyboardShortcuts, Launcher, type LauncherResult, type LauncherState, MENU_BAR_HEIGHT, MISSION_CONTROL_TOGGLE_EVENT, MenuBar, MissionControl, NOTIFICATION_CENTER_TOGGLE_EVENT, NotificationCenter, NotificationToasts, QUICK_SETTINGS_TOGGLE_EVENT, type QuickSettingAction, type QuickSettingItem, type QuickSettingSlider, type QuickSettingToggle, QuickSettings, type RecentEntry, type RecentItem, type RecentsSource, SHORTCUTS, SPOTLIGHT_OPEN_EVENT, Settings, type Shortcut, Slider, SnapPreview, type SnapRect, type SnapState, type SnapZone, Launcher as Spotlight, type SpotlightResult, type SpotlightSource, type StatusItem, type SystemWindowContentProps, type SystemWindowDef, Toggle, Tooltip, type UseSettingsResult, Wallpaper, Window, WindowLayer, chordOf, closeContextMenu, computeSnapZone, countRecentsSources, findConflicts, formatChord, getContextMenuState, getDockTileRect, getHud, getSnapPreview, getSystemWindow, hideHud, listQuickSettings, listRecentItems, listSpotlightSources, listStatusItems, listSystemWindows, nextCascadeIndex, openContextMenu, pickInitialBounds, rectForZone, registerQuickSetting, registerRecentsSource, registerSpotlightSource, registerStatusItem, registerSystemWindow, requestSettingsSection, resolveSystemWindowName, setSnapPreview, showHud, subscribeContextMenu, subscribeHud, subscribeQuickSettings, subscribeRecentsSources, subscribeSnapPreview, subscribeSpotlightSources, subscribeStatusItems, systemWindows, unregisterQuickSetting, unregisterStatusItem, useApp, useApps, useBaseTheme, useDesktopContext, useLauncher, useSettings, useTheme };
