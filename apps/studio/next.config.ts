import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "three",
    "@mintables/shared",
    "@mintables/gen-tubes",
    "@mintables/gen-adapters",
  ],
  experimental: {
    optimizePackageImports: ["three"],
  },
};

export default nextConfig;
