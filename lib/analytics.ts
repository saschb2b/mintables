// Thin wrapper around Umami's tracker. Auto-tracking is disabled in the
// script tag (see app/layout.tsx), so every pageview and custom event must be
// fired explicitly through this module. URLs are normalized to the pathname so
// the analytics dashboard isn't polluted by the long base64 `?config=…` query
// that the UI keeps in sync with form state.

interface TrackPayload {
  website?: string;
  hostname?: string;
  language?: string;
  screen?: string;
  url?: string;
  referrer?: string;
  title?: string;
  name?: string;
  data?: Record<string, unknown>;
}

interface UmamiTracker {
  track: (
    arg?: string | ((payload: TrackPayload) => TrackPayload),
    data?: Record<string, unknown>,
  ) => void;
}

declare global {
  interface Window {
    umami?: UmamiTracker;
  }
}

// Umami's <script> tag is async, so window.umami may not exist yet when we
// fire the initial pageview. Poll briefly for it instead of dropping events.
function withUmami(fn: (u: UmamiTracker) => void, retriesLeft = 50): void {
  if (typeof window === "undefined") return;
  const u = window.umami;
  if (u) {
    fn(u);
    return;
  }
  if (retriesLeft <= 0) return;
  window.setTimeout(() => {
    withUmami(fn, retriesLeft - 1);
  }, 100);
}

function normalizedUrl(): string {
  if (typeof window === "undefined") return "/";
  return window.location.pathname || "/";
}

export function trackPageview(): void {
  const url = normalizedUrl();
  withUmami((u) => {
    u.track((payload) => ({ ...payload, url }));
  });
}

export function trackEvent(
  name: string,
  data?: Record<string, unknown>,
): void {
  const url = normalizedUrl();
  withUmami((u) => {
    u.track((payload) => ({ ...payload, url, name, data }));
  });
}
