"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bookmark, Coffee, Download, ExternalLink, Scale } from "lucide-react";
import GitHubIcon from "@mui/icons-material/GitHub";
import {
  registerSpotlightSource,
  registerStatusItem,
  useDesktopContext,
  type SpotlightResult,
} from "@react-ui-os/desktop";
import { useWindowManager, type WindowPayload } from "@react-ui-os/core";
import {
  buildShareUrl,
  DOWNLOADS_CHANGED_EVENT,
  invalidatePreview,
  listAllPresets,
  listDownloads,
  PRESETS_CHANGED_EVENT,
  SITE_LINKS,
} from "@mintables/shared/lib";
import { findGenerator } from "@/lib/registry";

/**
 * Headless helpers mounted inside <Desktop>. Each renders nothing; together
 * they glue Mintables' storage, routes, and the shared R3F preview canvas to
 * the react-ui-os window manager.
 */
export function DesktopCompanions() {
  return (
    <>
      <FocusUrlSync />
      <MintablesSpotlightSources />
      <StorageEventBridge />
      <LocalStatusItem />
      <PreviewInvalidateBridge />
    </>
  );
}

function pathForPayload(payload: WindowPayload): string {
  if (payload.kind === "app") return `/generators/${payload.appId}`;
  if (payload.systemId === "downloads" || payload.systemId === "presets") {
    return `/folders/${payload.systemId}`;
  }
  // README, Settings, and future system surfaces have no route of their own.
  return "/";
}

/**
 * Keep the URL pinned to whatever window is on top. When no window is open,
 * we point at `/`. The route shims fire `openWindow` on their own mount, so
 * navigating via Link or a typed URL still produces the right WM state.
 *
 * IMPORTANT: this effect only runs when the focused window's target path
 * actually changes, not when pathname changes. Reason: when the user
 * navigates from /generators/tubes to /folders/downloads, pathname updates
 * before the new route's shim has a chance to dispatch its openWindow
 * effect. If we also reacted to pathname, we'd see the new pathname but a
 * still-stale focused window and replace right back to the old URL,
 * stealing focus from the just-opened window. Reading pathname through a
 * ref lets us check "did we already match?" without depending on it.
 */
function FocusUrlSync() {
  const { focusedWindow } = useWindowManager();
  const router = useRouter();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  const target = focusedWindow ? pathForPayload(focusedWindow.payload) : "/";
  useEffect(() => {
    if (target !== pathnameRef.current) router.replace(target);
  }, [target, router]);

  return null;
}

/**
 * Extra Spotlight rows beyond the built-in apps + system windows: saved
 * presets, recent downloads, and the external links that used to live as
 * desktop icons (GitHub, Sponsor, License). Only match a non-empty query so
 * the palette's resting state stays apps-only.
 */
function MintablesSpotlightSources() {
  const router = useRouter();

  useEffect(() => {
    const unsubPresets = registerSpotlightSource("mintables-presets", (q) => {
      if (!q) return [];
      return listAllPresets()
        .filter((p) => p.name.toLowerCase().includes(q))
        .slice(0, 6)
        .map((p): SpotlightResult => {
          const gen = findGenerator(p.generatorId);
          return {
            id: `preset-${p.id}`,
            name: p.name,
            tagline: gen ? `${gen.meta.name} preset` : "Preset",
            kindLabel: "Preset",
            accent: gen?.meta.accent ?? "#a855f7",
            icon: <Bookmark size={16} />,
            onActivate: () => {
              if (!gen) return;
              const target = new URL(buildShareUrl(gen.id, p.config));
              target.searchParams.set("preset", p.id);
              router.push(target.pathname + target.search);
            },
          };
        });
    });

    const unsubDownloads = registerSpotlightSource(
      "mintables-downloads",
      (q) => {
        if (!q) return [];
        return listDownloads()
          .filter((d) => `${d.filename}.${d.format}`.toLowerCase().includes(q))
          .slice(0, 6)
          .map((d): SpotlightResult => {
            const gen = findGenerator(d.generatorId);
            return {
              id: `download-${d.id}`,
              name: `${d.filename}.${d.format}`,
              tagline: gen ? `${gen.meta.name} export` : "Export",
              kindLabel: "Download",
              accent: gen?.meta.accent ?? "#3b82f6",
              icon: <Download size={16} />,
              onActivate: () => {
                if (!gen) return;
                const url = new URL(buildShareUrl(gen.id, d.config));
                router.push(url.pathname + url.search);
              },
            };
          });
      },
    );

    const links: {
      id: string;
      name: string;
      href: string;
      icon: SpotlightResult["icon"];
    }[] = [
      {
        id: "github",
        name: "GitHub repository",
        href: SITE_LINKS.github,
        icon: <GitHubIcon sx={{ fontSize: 16 }} />,
      },
      {
        id: "sponsor",
        name: "Sponsor Mintables",
        href: SITE_LINKS.buyMeACoffee,
        icon: <Coffee size={16} />,
      },
      {
        id: "license",
        name: "MIT License",
        href: `${SITE_LINKS.github}/blob/main/LICENSE`,
        icon: <Scale size={16} />,
      },
    ];
    const unsubLinks = registerSpotlightSource("mintables-links", (q) => {
      if (!q) return [];
      return links
        .filter((l) => l.name.toLowerCase().includes(q))
        .map(
          (l): SpotlightResult => ({
            id: `link-${l.id}`,
            name: l.name,
            kindLabel: "Link",
            icon: l.icon ?? <ExternalLink size={16} />,
            onActivate: () => {
              window.open(l.href, "_blank", "noopener,noreferrer");
            },
          }),
        );
    });

    return () => {
      unsubPresets();
      unsubDownloads();
      unsubLinks();
    };
  }, [router]);

  return null;
}

/**
 * The desktop's "earned" folder icons re-evaluate their predicates when the
 * library storage adapter fires a change event. Mintables' download/preset
 * stores live in their own localStorage keys and fire their own events, so
 * poke the adapter after every Mintables write to trigger a re-check.
 */
function StorageEventBridge() {
  const { storage } = useDesktopContext();

  useEffect(() => {
    const poke = () => {
      storage.set("mintables-sync", Date.now());
    };
    window.addEventListener(DOWNLOADS_CHANGED_EVENT, poke);
    window.addEventListener(PRESETS_CHANGED_EVENT, poke);
    return () => {
      window.removeEventListener(DOWNLOADS_CHANGED_EVENT, poke);
      window.removeEventListener(PRESETS_CHANGED_EVENT, poke);
    };
  }, [storage]);

  return null;
}

/** Menu-bar "runs locally" marker: the old header's green status dot. */
function LocalStatusItem() {
  useEffect(() => {
    return registerStatusItem({
      id: "mintables-local",
      icon: (
        <span
          aria-hidden
          style={{
            display: "inline-block",
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "#22c55e",
            boxShadow: "0 0 6px rgba(34, 197, 94, 0.6)",
          }}
        />
      ),
      tooltip: "Runs locally: no accounts, no uploads",
      order: 50,
    });
  }, []);

  return null;
}

/**
 * The shared R3F canvas renders on demand. The library's window drag/resize
 * writes transforms straight to the DOM (no per-frame React state), so
 * without a nudge the 3D preview would freeze mid-drag while its tracked
 * <View> div moves. Two nudges cover it:
 *
 *  1. any pointer movement with a button held (window drag / resize / orbit)
 *  2. a short rAF burst after every WM state change, spanning the window
 *     open / genie / maximize CSS animations
 */
function PreviewInvalidateBridge() {
  const { state } = useWindowManager();

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (e.buttons !== 0) invalidatePreview();
    };
    window.addEventListener("pointermove", onMove, {
      capture: true,
      passive: true,
    });
    return () => {
      window.removeEventListener("pointermove", onMove, { capture: true });
    };
  }, []);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const loop = (t: number) => {
      invalidatePreview();
      if (t - start < 700) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
    };
  }, [state]);

  return null;
}
