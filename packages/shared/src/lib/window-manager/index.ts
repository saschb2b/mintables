export type {
  WindowKind,
  WindowPayload,
  WindowState,
  WindowBounds,
  OpenWindow,
  WindowManagerState,
  WindowManagerActions,
  WindowManagerAction,
  WindowManagerDispatch,
  FolderId,
} from "./types";
export { windowIdOf } from "./types";
export { WindowManagerProvider, useWindowManager } from "./context";
