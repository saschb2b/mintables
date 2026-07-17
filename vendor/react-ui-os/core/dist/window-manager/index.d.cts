import { Dispatch, ReactNode } from 'react';
import * as react_jsx_runtime from 'react/jsx-runtime';

/**
 * Args attached to a system-window payload. Restricted to JSON-serializable
 * primitives so the window id stays stable and deep-linkable across reloads.
 */
type SystemWindowArgs = Record<string, string | number | boolean>;
/**
 * What a window is showing.
 *
 *   `app`     hosts a user-registered app from the apps list. One slot per
 *             `appId`, just like a macOS app instance.
 *   `system`  hosts a built-in surface (Settings, file explorers, etc.).
 *             Multiple instances per `systemId` are possible by passing
 *             distinct `args`: for example, a docs site can open a
 *             "Component" system window with `args: { name: "Spotlight" }`
 *             and another with `args: { name: "Window" }` side by side.
 */
type WindowPayload = {
    kind: "app";
    appId: string;
} | {
    kind: "system";
    systemId: string;
    args?: SystemWindowArgs;
};
type WindowState = "normal" | "minimized" | "maximized";
interface WindowBounds {
    x: number;
    y: number;
    w: number;
    h: number;
}
interface OpenWindow {
    /** Stable id derived from payload. */
    id: string;
    payload: WindowPayload;
    state: WindowState;
    /** Pixel bounds for the normal (non-maximized) layout. Preserved across max/min cycles. */
    x: number;
    y: number;
    w: number;
    h: number;
    z: number;
    /**
     * Workspace this window belongs to. Defaults to the workspace that was
     * active when the window opened. Switching workspaces hides all windows
     * whose `workspaceId` doesn't match. They aren't unmounted, just
     * filtered by the window layer, so internal state survives.
     */
    workspaceId: string;
    /**
     * True when the window was opened without explicit bounds, so it currently
     * holds the placeholder DEFAULT_BOUNDS. core is viewport-agnostic and cannot
     * size a window to the screen, so it records the intent ("place this for
     * me") with this flag. The desktop layer, which knows the viewport and the
     * theme's chrome, resolves it to centered, work-area-clamped bounds on first
     * mount and clears the flag via SET_BOUNDS. Surfaces that pass their own
     * bounds (via pickInitialBounds) arrive with the flag already off.
     */
    autoBounds?: boolean;
}
interface WindowManagerState {
    windows: OpenWindow[];
    /** Top-most non-minimized window id, or null when none. */
    focusedId: string | null;
    /** Next z-index to assign. The reducer increments monotonically. */
    nextZ: number;
    /** Ordered list of workspace ids. The library seeds three by default. */
    workspaces: string[];
    /** Workspace currently displayed by the desktop. */
    activeWorkspaceId: string;
}
/**
 * Stable id from payload. Opening the same app twice focuses the existing
 * window rather than spawning a duplicate, mirroring macOS app-instance
 * behavior.
 *
 * For system windows: when `args` is absent (or empty), there is a single
 * slot per `systemId` (Settings, the active folder window, etc.). When
 * `args` is present, the id includes a stable serialization of the keys
 * so two distinct argument sets produce two distinct windows. The args
 * are also encoded in the same order regardless of insertion order so
 * `{ name: "Window" }` and `{ name: "Window" }` always collide.
 */
declare function windowIdOf(payload: WindowPayload): string;
interface WindowManagerActions {
    openWindow: (payload: WindowPayload, initialBounds?: WindowBounds) => void;
    closeWindow: (id: string) => void;
    focusWindow: (id: string) => void;
    minimizeWindow: (id: string) => void;
    restoreWindow: (id: string) => void;
    toggleMaximize: (id: string) => void;
    moveWindow: (id: string, x: number, y: number) => void;
    resizeWindow: (id: string, w: number, h: number) => void;
    setBounds: (id: string, x: number, y: number, w: number, h: number) => void;
    switchWorkspace: (workspaceId: string) => void;
    moveWindowToWorkspace: (id: string, workspaceId: string) => void;
    addWorkspace: (workspaceId?: string) => void;
    removeWorkspace: (workspaceId: string) => void;
}
type WindowManagerAction = {
    type: "OPEN";
    payload: WindowPayload;
    initialBounds?: WindowBounds;
} | {
    type: "CLOSE";
    id: string;
} | {
    type: "FOCUS";
    id: string;
} | {
    type: "MINIMIZE";
    id: string;
} | {
    type: "RESTORE";
    id: string;
} | {
    type: "MAXIMIZE_TOGGLE";
    id: string;
} | {
    type: "MOVE";
    id: string;
    x: number;
    y: number;
} | {
    type: "RESIZE";
    id: string;
    w: number;
    h: number;
} | {
    type: "SET_BOUNDS";
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
} | {
    type: "SWITCH_WORKSPACE";
    workspaceId: string;
} | {
    type: "MOVE_WINDOW_TO_WORKSPACE";
    id: string;
    workspaceId: string;
} | {
    type: "ADD_WORKSPACE";
    workspaceId: string;
} | {
    type: "REMOVE_WORKSPACE";
    workspaceId: string;
};
type WindowManagerDispatch = Dispatch<WindowManagerAction>;

declare const initialWindowManagerState: WindowManagerState;
declare function windowManagerReducer(state: WindowManagerState, action: WindowManagerAction): WindowManagerState;

declare function WindowManagerProvider({ children }: {
    children: ReactNode;
}): react_jsx_runtime.JSX.Element;
interface UseWindowManagerResult extends WindowManagerActions {
    state: WindowManagerState;
    windows: OpenWindow[];
    focusedWindow: OpenWindow | null;
    windowById: (id: string) => OpenWindow | undefined;
}
declare function useWindowManager(): UseWindowManagerResult;

export { type OpenWindow, type SystemWindowArgs, type UseWindowManagerResult, type WindowBounds, type WindowManagerAction, type WindowManagerActions, type WindowManagerDispatch, WindowManagerProvider, type WindowManagerState, type WindowPayload, type WindowState, initialWindowManagerState, useWindowManager, windowIdOf, windowManagerReducer };
