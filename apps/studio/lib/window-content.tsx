"use client";

import type { CSSProperties, ReactNode } from "react";

/**
 * react-ui-os gives every window body a fixed 16px padding and its own
 * scrollbar. Generator shells and folder explorers manage their own layout
 * and scrolling, so this wrapper cancels the padding (the library's own
 * edge-to-edge idiom, see the Notes example app) and pins the child to the
 * exact window-body height so the body never scrolls.
 */
const style: CSSProperties = {
  margin: -16,
  height: "calc(100% + 32px)",
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
  minHeight: 0,
  overflow: "hidden",
};

export function EdgeToEdge({ children }: { children: ReactNode }) {
  return <div style={style}>{children}</div>;
}
