import { iconUrl } from "./eco-icons";

// Ikona jako obrázek pro canvas. Načte se při prvním použití; do té doby vrací
// null a canvas ji nakreslí v dalším snímku, až bude hotová.
const cache = new Map<string, HTMLImageElement>();

export function iconImage(emoji: string): HTMLImageElement | null {
  if (typeof window === "undefined") return null;
  const url = iconUrl(emoji);
  if (!url) return null;
  let img = cache.get(url);
  if (!img) {
    img = new Image();
    img.src = url;
    cache.set(url, img);
  }
  return img.complete && img.naturalWidth > 0 ? img : null;
}
