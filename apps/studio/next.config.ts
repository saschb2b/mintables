import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "three",
    "@mintables/shared",
    "@mintables/gen-tubes",
    "@mintables/gen-adapters",
    "@mintables/gen-dividers",
  ],
  devIndicators: false,
  experimental: {
    optimizePackageImports: ["three"],
  },
};

export default nextConfig;
