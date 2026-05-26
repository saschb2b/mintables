import type React from "react";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Script from "next/script";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { Providers } from "./providers";

const geistSans = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mintables — 3D printable generators for makers",
  description:
    "Parametric, browser-based generators for printable tubes, adapters, dividers, and more. Real-time 3D preview, validated STL and 3MF export.",
  keywords: [
    "3D printing",
    "tube generator",
    "STL generator",
    "adapter generator",
    "divider generator",
    "parametric design",
  ],
  authors: [{ name: "Mintables" }],
  openGraph: {
    title: "Mintables — 3D printable generators",
    description:
      "Free, browser-based parametric generators for 3D-printable parts with real-time preview and STL/3MF export.",
    type: "website",
    siteName: "Mintables",
  },
  twitter: {
    card: "summary",
    title: "Mintables — 3D printable generators",
    description:
      "Free, browser-based parametric generators for 3D-printable parts.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/*
          Overscroll handling: html + body painted in the app's deep base so
          rubber-band bounce exposes the same color (not MUI's CssBaseline
          grey). `!important` is needed to win against CssBaseline's body bg.

          We intentionally do NOT set `overscroll-behavior: none` on
          html/body — Chrome has known quirks where doing so on a non-
          scrolling root interferes with wheel-event delivery to a nested
          overflow:auto scroll container (the landing wrapper). The wrapper
          sets it on itself.
        */}
        <style>{`
          html, body {
            background-color: #0f1322 !important;
          }
          html { color-scheme: dark; }
        `}</style>
        <Script
          async
          src="https://umami.saschb2b.com/script.js"
          data-website-id="51c8e9a6-abd3-475a-bca2-db808244f8c0"
          data-auto-track="false"
        />
      </head>
      <body className={geistSans.className}>
        <AppRouterCacheProvider>
          <Providers>{children}</Providers>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
