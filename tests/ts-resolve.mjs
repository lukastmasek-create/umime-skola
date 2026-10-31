// Node hook for `node --test` on files that import without extensions and with the `@/` alias
// (the way Next.js resolves them). Used by `npm test` for src/lib/escape/rooms.test.ts.
import { registerHooks } from "node:module";
import { pathToFileURL } from "node:url";
import { resolve as resolvePath } from "node:path";

const SRC = pathToFileURL(resolvePath(import.meta.dirname, "../src") + "/").href;

registerHooks({
  resolve(specifier, context, next) {
    const spec = specifier.startsWith("@/") ? new URL(specifier.slice(2), SRC).href : specifier;
    if (!spec.startsWith(".") && !spec.startsWith("file:")) return next(specifier, context);
    try {
      return next(spec, context);
    } catch (error) {
      for (const suffix of [".ts", ".tsx", "/index.ts"]) {
        try {
          return next(spec + suffix, context);
        } catch {}
      }
      throw error;
    }
  },
});
