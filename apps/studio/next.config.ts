import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "three",
    "@mintables/shared",
    "@mintables/gen-tubes",
    "@mintables/gen-adapters",
    "@mintables/gen-dividers",
    "@mintables/gen-legcaps",
    "@mintables/gen-inserts",
    "@mintables/gen-hex-tiles",
    "@mintables/gen-clamps",
    "@mintables/gen-support-cleaner",
    "@mintables/gen-pulls",
    "@mintables/gen-skadis",
  ],
  devIndicators: false,
  experimental: {
    optimizePackageImports: ["three"],
  },
};

export default nextConfig;
