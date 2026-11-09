// Sestaví ukázku UI knihoven do jednoho samostatného HTML souboru (dist/ukazka-ui.html).
// Použití z kořene repa: node tools/ukazka-ui/build.mjs
import { createRequire } from "module";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, "..", "..");
const require = createRequire(join(repo, "package.json"));
const esbuild = require("esbuild");
const postcss = require("postcss");
const tailwind = require("@tailwindcss/postcss");

const css = readFileSync(join(repo, "src/app/globals.css"), "utf8");
const processed = await postcss([tailwind()]).process(css, { from: join(repo, "src/app/globals.css") });
const extraCss = [
  "node_modules/swiper/swiper-bundle.css",
  "node_modules/react-day-picker/src/style.css",
  "node_modules/react-circular-progressbar/dist/styles.css",
  "node_modules/react-loading-skeleton/dist/skeleton.css",
].map((p) => readFileSync(join(repo, p), "utf8")).join("\n");

const result = await esbuild.build({
  entryPoints: [join(here, "entry.tsx")],
  bundle: true, minify: true, write: false, format: "iife", target: "es2020",
  jsx: "automatic", platform: "browser", nodePaths: [join(repo, "node_modules")],
  define: { "process.env.NODE_ENV": '"production"' },
  loader: { ".css": "empty" },
});
const js = result.outputFiles[0].text;
const html = `<title>Ukázka UI knihoven</title>
<style>${processed.css}\n${extraCss}</style>
<div id="root"></div>
<script>${js.replace(/<\/script/gi, "<\\/script")}</script>`;

mkdirSync(join(repo, "dist"), { recursive: true });
writeFileSync(join(repo, "dist/ukazka-ui.html"), html);
console.log("dist/ukazka-ui.html", html.length, "bytes");
