import type { Metadata } from "next";
import { DownloadsWindow } from "./downloads-window";

export const metadata: Metadata = {
  title: "Downloads — Mintables",
};

export default function DownloadsPage() {
  return <DownloadsWindow />;
}
