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
