"use client";

import { OpenFolderWindow } from "../open-folder-window";

/** Route shim for `/folders/presets`. */
export function PresetsWindow() {
  return <OpenFolderWindow folderId="presets" />;
}
