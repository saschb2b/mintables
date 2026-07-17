"use client";

import { OpenFolderWindow } from "../open-folder-window";

/** Route shim for `/folders/downloads`. */
export function DownloadsWindow() {
  return <OpenFolderWindow folderId="downloads" />;
}
