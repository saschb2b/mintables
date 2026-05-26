// Thin wrapper around Umami's tracker. Auto-tracking is disabled in the
// script tag (see apps/studio/app/layout.tsx), so every pageview and custom
// event is fired explicitly. URL is normalized to pathname so the dashboard
// isn't polluted by long base64 ?config=… query strings.

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

export function trackEvent(name: string, data?: Record<string, unknown>): void {
  const url = normalizedUrl();
  withUmami((u) => {
    u.track((payload) => ({ ...payload, url, name, data }));
  });
}
