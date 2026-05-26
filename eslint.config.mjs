import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import tseslint from "typescript-eslint";

/**
 * Root ESLint config. The studio app has its own `apps/studio/eslint.config.mjs`
 * that extends this with Next.js rules; everything else (shared package, per-
 * generator packages) is covered by this config when files are linted from the
 * repo root (e.g. by a pre-commit hook running `npx eslint <files>`).
 */
const config = [
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked.map((c) => ({
    ...c,
    files: ["**/*.ts", "**/*.tsx"],
  })),
  ...tseslint.configs.stylisticTypeChecked.map((c) => ({
    ...c,
    files: ["**/*.ts", "**/*.tsx"],
  })),
  eslintConfigPrettier,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },
  {
    rules: {
      "@typescript-eslint/no-confusing-void-expression": "off",
    },
  },
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/.turbo/**",
      "**/out/**",
      "**/build/**",
      "**/dist/**",
      "**/*.tsbuildinfo",
      "**/next-env.d.ts",
    ],
  },
];

export default config;
