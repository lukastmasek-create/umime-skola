import {execSync} from "node:child_process";
execSync("npx esbuild 2d/tymy_build.ts --bundle --platform=node --format=esm --outfile=/tmp/tymy_build.mjs --log-level=error --external:playwright", {stdio: "inherit"});
await import("/tmp/tymy_build.mjs");
