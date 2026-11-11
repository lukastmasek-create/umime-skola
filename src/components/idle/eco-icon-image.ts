import { iconSvg } from "./eco-icons";

// Ikona jako obrázek pro canvas. Vytvoří se při prvním použití; do té doby vrací
// null a canvas ji nakreslí v dalším snímku, až bude hotová.
const cache = new Map<string, HTMLImageElement>();

export function iconImage(emoji: string): HTMLImageElement | null {
  if (typeof window === "undefined") return null;
  let img = cache.get(emoji);
  if (!img) {
    const svg = iconSvg(emoji, 96);
    if (!svg) return null;
    img = new Image();
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    cache.set(emoji, img);
  }
  return img.complete && img.naturalWidth > 0 ? img : null;
}
