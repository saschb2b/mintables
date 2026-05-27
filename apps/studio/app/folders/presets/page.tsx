import type { Metadata } from "next";
import { PresetsWindow } from "./presets-window";

export const metadata: Metadata = {
  title: "Presets — Mintables",
};

export default function PresetsPage() {
  return <PresetsWindow />;
}
