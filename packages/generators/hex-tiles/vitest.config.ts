import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@mintables/shared": fileURLToPath(
        new URL("../../shared/src", import.meta.url),
      ),
    },
  },
});
