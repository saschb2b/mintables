import { ReactNode, ComponentType } from 'react';

/**
 * One row in the notification feed. Items live for `duration` ms as a
 * toast, then move into the Notification Center history.
 */
interface NotificationItem {
    /** Stable id. If omitted from `notify(...)`, generated. */
    id: string;
    /** Single-line headline. */
    title: string;
    /** Optional body / detail line(s). */
    body?: string;
    /** Optional ReactNode to replace the default body (e.g. inline progress). */
    bodyNode?: ReactNode;
    /** Associates the notification with an app for dock badges + grouping. */
    appId?: string;
    /** Tile accent color. Falls back to the app's accent or the theme accent. */
    accent?: string;
    /** Lucide-style icon. Letter fallback when absent. */
    icon?: ComponentType<{
        size?: number;
    }>;
    /** Severity hint: affects accent / icon if not explicitly set. */
    level?: "info" | "success" | "warn" | "error";
    /**
     * Auto-dismiss duration in ms. `0` keeps the toast pinned until the
     * user dismisses it explicitly. Defaults to 5000 unless the level is
     * `error` (defaults to 0 / sticky).
     */
    duration?: number;
    /** Optional CTA buttons. Activating one runs onClick then dismisses. */
    actions?: NotificationAction[];
    /** Called when the toast leaves the visible stack (timeout or user dismiss). */
    onDismiss?: () => void;
    /** Wall-clock time the item was created. */
    createdAt: number;
    /** Wall-clock time the user dismissed it (closes toast, keeps history). */
    dismissedAt?: number;
    /** Marked true once the user opens Notification Center after createdAt. */
    read?: boolean;
}
interface NotificationAction {
    label: string;
    /** Runs on click. Receives the item id in case the handler needs it. */
    onClick: (id: string) => void;
    /** Visually emphasize the primary action. */
    primary?: boolean;
}
/** Input accepted by `notify(...)`. `id` and `createdAt` are filled in. */
type NotificationInput = Omit<NotificationItem, "id" | "createdAt" | "dismissedAt" | "read"> & {
    id?: string;
};
/** Snapshot the store hands listeners on every change. */
interface NotificationSnapshot {
    items: NotificationItem[];
    active: NotificationItem[];
    unreadCount: number;
    unreadByApp: Record<string, number>;
}

/**
 * Push a notification onto the feed. Returns the assigned id so callers
 * can later update or dismiss the same row (`notify({ id: "downloading", ... })`
 * twice in a row replaces the first item rather than stacking).
 */
declare function notify(input: NotificationInput): string;
/**
 * Hide the toast and the Center entry. Fires `onDismiss` once if provided.
 */
declare function dismissNotification(id: string): void;
/**
 * Same as `dismissNotification` but also removes the item from the
 * Notification Center history.
 */
declare function removeNotification(id: string): void;
/** Empty the Center; any visible toasts are also dismissed. */
declare function clearAllNotifications(): void;
/** Mark a single notification read. Called when the Center is opened. */
declare function markNotificationRead(id: string): void;
/** Mark every notification read in one shot. */
declare function markAllNotificationsRead(): void;
declare function getNotificationSnapshot(): NotificationSnapshot;
declare function subscribeNotifications(listener: (snapshot: NotificationSnapshot) => void): () => void;

/**
 * Subscribe to the module-level notification store from React. Returns the
 * full snapshot (items, active toasts, unread counts). Components that only
 * need a slice should derive it locally. useSyncExternalStore is fine to
 * call repeatedly and the store snapshot is stable until a real change.
 */
declare function useNotifications(): NotificationSnapshot;

export { type NotificationAction, type NotificationInput, type NotificationItem, type NotificationSnapshot, clearAllNotifications, dismissNotification, getNotificationSnapshot, markAllNotificationsRead, markNotificationRead, notify, removeNotification, subscribeNotifications, useNotifications };
