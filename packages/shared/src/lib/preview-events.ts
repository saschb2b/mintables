/**
 * Ask the global preview canvas (PreviewStage) to render one extra frame.
 * The drei <View> tracks its scissor rect off the canvas's render loop,
 * so when something moves the View's DOM element WITHOUT going through a
 * React render (e.g. a window drag that writes inline transforms), the
 * View only catches up on the next paint. Calling this dispatches a
 * cheap window event that the PreviewStage listens for to invalidate
 * R3F's demand-mode frameloop.
 */
export const PREVIEW_INVALIDATE_EVENT = "mintables:preview-invalidate";

export function invalidatePreview(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(PREVIEW_INVALIDATE_EVENT));
}
