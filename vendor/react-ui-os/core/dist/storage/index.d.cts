/**
 * Abstract storage backend. The library ships a localStorage adapter and
 * accepts custom ones for products that want server-side persistence or
 * cross-device sync.
 */
interface StorageAdapter {
    get<T = unknown>(key: string): T | null;
    set<T>(key: string, value: T): void;
    remove(key: string): void;
    /**
     * Notify a listener whenever a stored value changes. Returns an unsubscribe
     * function. Listeners receive the unprefixed key.
     */
    subscribe(listener: (key: string) => void): () => void;
}

/**
 * Default storage adapter, backed by `window.localStorage`. Writes dispatch
 * a CustomEvent so any in-tab listeners can react; the native `storage`
 * event handles cross-tab updates.
 *
 * SSR-safe: when `window` is unavailable, all methods are no-ops returning
 * `null` / nothing. Subscriptions return a no-op unsubscribe.
 */
declare function createLocalStorageAdapter(prefix?: string): StorageAdapter;

export { type StorageAdapter, createLocalStorageAdapter };
