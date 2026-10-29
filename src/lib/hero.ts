// Vzhled hrdiny městečka: šest vzhledů z Blenderu (umime-art/blender/mesto_figury.py, HERO_LOOKS). Vzhled 0 je původní,
// ostatní mají sprity hrdina-<k>-<akce>.webp. Volba se pamatuje v prohlížeči.

export const HERO_LOOKS = 6;
const KEY = "town-hero";

export type HeroAction = "chuze" | "stoji" | "radost";

export function getHeroLook(): number {
  try {
    const v = Number(window.localStorage.getItem(KEY));
    return Number.isInteger(v) && v >= 0 && v < HERO_LOOKS ? v : 0;
  } catch {
    return 0;
  }
}

export function setHeroLook(look: number) {
  try {
    window.localStorage.setItem(KEY, String(look));
  } catch {}
}

export const heroSpriteUrl = (action: HeroAction, look = 0) => `/home/mesto/hrdina${look ? `-${look}` : ""}-${action}.webp`;

/** Adresa sprite hrdiny podle uloženého vzhledu (jen v prohlížeči; na serveru původní vzhled). */
export const currentHeroUrl = (action: HeroAction) => heroSpriteUrl(action, typeof window === "undefined" ? 0 : getHeroLook());
