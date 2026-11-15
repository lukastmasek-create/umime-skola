import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Skripty v CommonJS (prisma/*.cjs) používají require() záměrně.
  {
    files: ["**/*.cjs"],
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Testovací nástroje her (boti a harness) nejsou součástí aplikace.
    "tests/games/**",
    "umime-art/**",
    // Převzatý dekodér Draco (minifikovaný kód třetí strany).
    "public/draco/**",
    // Výstup buildů OpenNext / Wrangler.
    ".open-next/**",
    ".wrangler/**",
  ]),
]);

export default eslintConfig;
