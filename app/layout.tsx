import type React from "react";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ThemeProvider } from "@/components/ThemeProvider";
import Script from "next/script";

const geistSans = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TubeCraft - 3D Printable Tube & Adapter Generator",
  description:
    "Free online tool to generate custom 3D printable tubes and adapters. Design round, square, and rectangular shapes with press-fit flares, clamshell splits, miter cuts, and STL export.",
  keywords: [
    "3D printing",
    "tube generator",
    "STL generator",
    "adapter generator",
    "pipe fitting",
    "clamshell tube",
    "press-fit flare",
    "3D printable tube",
    "custom tube",
    "parametric design",
  ],
  authors: [{ name: "TubeCraft" }],
  openGraph: {
    title: "TubeCraft - 3D Printable Tube & Adapter Generator",
    description:
      "Free online tool to design custom tubes and adapters for 3D printing with real-time preview and STL export.",
    type: "website",
    siteName: "TubeCraft",
  },
  twitter: {
    card: "summary",
    title: "TubeCraft - 3D Printable Tube & Adapter Generator",
    description:
      "Free online tool to design custom tubes and adapters for 3D printing with real-time preview and STL export.",
  },
  robots: {
    index: true,
    follow: true,
  },
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
          <ThemeProvider>{children}</ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
