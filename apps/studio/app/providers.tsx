"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import Box from "@mui/material/Box";
import {
  AppSwitcher,
  ContextMenu,
  DesktopBackdrop,
  DesktopIcons,
  DesktopProvider,
  Dock,
  HudOverlay,
  KeyboardHelp,
  KeyboardShortcuts,
  Launcher,
  MenuBar,
  MissionControl,
  NotificationCenter,
  NotificationToasts,
  QuickSettings,
  SnapPreview,
  Wallpaper,
  WindowLayer,
} from "@react-ui-os/desktop";
import { ThemeProvider } from "@mintables/shared/ui";
import { PreviewStage } from "@mintables/shared/shell";
import { osApps } from "@/lib/os-apps";
import { osTheme } from "@/lib/os-theme";
import { DesktopCompanions } from "./desktop-companions";
import { SHOW_WELCOME_EVENT, WelcomeDialog } from "./welcome-dialog";
// Side effect: registers the Downloads / Presets / README system windows in
// the react-ui-os registry before the Desktop mounts.
import "@/lib/os-system-windows";

const WELCOMED_KEY = "mintables.welcomed";

/**
 * The OS shell. The whole desktop metaphor (wallpaper, menu bar, dock,
 * windows, Spotlight, Settings, desktop icons) comes from react-ui-os; this
 * component wires Mintables into it:
 *
 *  · `osApps` maps every generator to a dock app
 *  · `osTheme` is the macOS clone with our wallpaper + accent, forced dark
 *  · system windows (Downloads / Presets / README) register at module load
 *  · <DesktopCompanions> glues routes, Spotlight, storage, and the preview
 *    canvas to the library's window manager
 *  · <PreviewStage> is Mintables' one global R3F canvas: every open
 *    generator window contributes a drei <View>, and the single canvas
 *    scissor-paints them all so N windows can't exhaust WebGL contexts. It
 *    sits above the windows (z 1150) and below the dock (z 1200).
 *
 * The desktop renders client-only (after mount): react-ui-os reads
 * localStorage-backed state (desktop icons, settings) during first render,
 * which can't match server HTML.
 */
const noop = (): void => undefined;
const emptySubscribe = () => noop;

export function Providers({ children }: { children: ReactNode }) {
  // False during SSR + hydration, true on the client afterwards.
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  // Eventsource for the global PreviewStage canvas. Drei's <View> routes
  // pointer events from each view's tracked div into this parent, so
  // OrbitControls in any generator window picks up drags correctly.
  const stageContainerRef = useRef<HTMLDivElement>(null);

  // First-visit welcome: open ~600ms after mount so the wallpaper + dock
  // paint first and the dialog appears *on* the desktop, not *instead* of
  // it. The localStorage flag is set on dismiss, never on open, so a hard
  // refresh before clicking "Got it" still re-shows the welcome next visit.
  useEffect(() => {
    if (window.localStorage.getItem(WELCOMED_KEY) === "1") return;
    const t = window.setTimeout(() => {
      setWelcomeOpen(true);
    }, 600);
    return () => {
      window.clearTimeout(t);
    };
  }, []);

  // Any component can re-open the welcome dialog by dispatching the event,
  // currently used by the README window's "Take the tour again" link.
  useEffect(() => {
    const onShow = () => {
      setWelcomeOpen(true);
    };
    window.addEventListener(SHOW_WELCOME_EVENT, onShow);
    return () => {
      window.removeEventListener(SHOW_WELCOME_EVENT, onShow);
    };
  }, []);

  const handleCloseWelcome = () => {
    window.localStorage.setItem(WELCOMED_KEY, "1");
    setWelcomeOpen(false);
  };

  return (
    <ThemeProvider>
      <Box
        ref={stageContainerRef}
        sx={{
          height: "100dvh",
          width: "100vw",
          overflow: "hidden",
          position: "relative",
          // Fallback color while the desktop boots / wallpaper decodes.
          bgcolor: "#0a0c1a",
        }}
      >
        {mounted && (
          <DesktopProvider apps={osApps} theme={osTheme}>
            {/*
              Hand-composed variant of the library's <Desktop> (same surface
              list, same order). We lift the hood for one reason: the shared
              R3F canvas must paint above the windows but below the dock and
              Spotlight, and the root div here is a stacking context, so the
              canvas has to be a sibling of WindowLayer/Dock inside it. A
              canvas outside this div would paint over every system surface.
            */}
            <div
              style={{
                position: "fixed",
                inset: 0,
                overflow: "hidden",
                fontFamily:
                  osTheme.font ??
                  "system-ui, -apple-system, Segoe UI, sans-serif",
              }}
            >
              <Wallpaper />
              <MenuBar brand="Mintables" />
              <DesktopIcons />
              <SnapPreview />
              <WindowLayer />
              {/* One global R3F canvas: z 1150, windows ~100+, dock 1200. */}
              <PreviewStage containerRef={stageContainerRef} />
              <Dock />
              <KeyboardShortcuts />
              <Launcher />
              <NotificationToasts />
              <NotificationCenter />
              <QuickSettings />
              <ContextMenu />
              <AppSwitcher />
              <MissionControl />
              <KeyboardHelp />
              <HudOverlay />
              <DesktopBackdrop />
            </div>
            <DesktopCompanions />
            <WelcomeDialog open={welcomeOpen} onClose={handleCloseWelcome} />
            {/* Route shims render null and dispatch openWindow on mount. */}
            {children}
          </DesktopProvider>
        )}
      </Box>
    </ThemeProvider>
  );
}
