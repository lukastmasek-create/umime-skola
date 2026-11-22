import { continueRender, delayRender, staticFile } from "remotion";

// Fonty jsou lokálně v public/fonts (render běží bez přístupu na Google).
export const HEADING = "Unbounded";
export const BODY = "Onest";
export const HAND = "Pangolin";

const FILES: [string, string, string][] = [
  [HEADING, "800", "Unbounded-800-latin.woff2"],
  [HEADING, "800", "Unbounded-800-latin-ext.woff2"],
  [HAND, "400", "Pangolin-400-latin.woff2"],
  [HAND, "400", "Pangolin-400-latin-ext.woff2"],
  [BODY, "500 700", "Onest-700-latin.woff2"],
  [BODY, "500 700", "Onest-700-latin-ext.woff2"],
];

if (typeof document !== "undefined") {
  const h = delayRender("fonts");
  Promise.all(
    FILES.map(async ([family, weight, file]) => {
      const face = new FontFace(family, `url(${staticFile("fonts/" + file)})`, { weight });
      await face.load();
      (document.fonts as unknown as { add(f: FontFace): void }).add(face);
    }),
  )
    .then(() => continueRender(h))
    .catch((e) => {
      console.error(e);
      continueRender(h);
    });
}
