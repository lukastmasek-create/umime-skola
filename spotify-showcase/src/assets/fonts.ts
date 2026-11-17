import {continueRender, delayRender, staticFile} from 'remotion';
import {useEffect, useState} from 'react';

export const FONT = 'Figtree';
const weights = [400, 500, 700, 800] as const;
let promise: Promise<void> | null = null;
export function loadFonts() {
  if (!promise) {
    promise = Promise.all(
      weights.map(async (w) => {
        const ff = new FontFace(FONT, `url(${staticFile(`fonts/figtree-latin-${w}-normal.woff2`)})`, {weight: String(w)});
        await ff.load();
        (document.fonts as unknown as {add(f: FontFace): void}).add(ff);
      }),
    ).then(() => undefined);
  }
  return promise;
}
let ready = false;
export function useFonts() {
  const [ok, setOk] = useState(ready);
  const [h] = useState(() => (ready ? null : delayRender('fonts')));
  useEffect(() => {
    if (ready) return;
    loadFonts().then(() => { ready = true; setOk(true); });
  }, []);
  useEffect(() => {
    if (ok && h !== null) { const t = setTimeout(() => continueRender(h), 50); return () => clearTimeout(t); }
  }, [ok, h]);
  return ok;
}
export const fontReady = () => ready;
