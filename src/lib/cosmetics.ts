import { normalizeCustomMap, type AvatarCustom } from "@/lib/avatar-custom";
import { AVATARS } from "@/lib/avatars";
import { TITLES } from "@/lib/titles";

// Ozdoby profilu, které se kupují v obchodě: rámečky kolem avataru a pozadí profilu.
// Nové ozdoby přidává vývojář tady a v src/lib/shop.ts (cena a názvy).

export const FRAME_IDS = ["gold", "rainbow", "neon", "leaf", "stars", "fire", "vine", "royal", "coral"] as const;
export type FrameId = (typeof FRAME_IDS)[number];

export function isFrameId(value: unknown): value is FrameId {
  return typeof value === "string" && (FRAME_IDS as readonly string[]).includes(value);
}

// Pozadí jsou čisté CSS přechody, takže nepotřebují žádné obrázky.
export const BANNERS: Record<string, string> = {
  sunset: "linear-gradient(135deg, #ffb25c 0%, #ff5d73 55%, #7c3aed 100%)",
  ocean:
    "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.35), transparent 35%), linear-gradient(160deg, #3fc1ff 0%, #1d4ed8 100%)",
  forest: "linear-gradient(160deg, #6ee7a8 0%, #1f8f4e 55%, #14532d 100%)",
  galaxy:
    "radial-gradient(circle at 18% 30%, rgba(124,108,255,0.55), transparent 40%), radial-gradient(circle at 80% 70%, rgba(255,93,115,0.4), transparent 45%), radial-gradient(1.5px 1.5px at 20% 20%, #fff, transparent), radial-gradient(1.5px 1.5px at 60% 40%, #fff, transparent), radial-gradient(1.5px 1.5px at 85% 25%, #fff, transparent), radial-gradient(1px 1px at 40% 75%, #fff, transparent), #0b0820",
  candy:
    "repeating-linear-gradient(45deg, #ff9ec7 0 14px, #ffffff 14px 28px)",
  "night-city":
    "linear-gradient(180deg, #1b1740 0%, #3b2a6b 60%, #ff7a8a 100%)",
  "treasure-map":
    "radial-gradient(circle at 70% 40%, rgba(138,90,52,0.35), transparent 35%), repeating-linear-gradient(0deg, rgba(138,90,52,0.08) 0 3px, transparent 3px 7px), linear-gradient(160deg, #f1dcaa 0%, #d9b873 100%)",
  "pirate-night":
    "radial-gradient(circle at 78% 22%, #fff3c4 0 6%, transparent 7%), radial-gradient(1.5px 1.5px at 20% 25%, #fff, transparent), radial-gradient(1.5px 1.5px at 45% 15%, #fff, transparent), linear-gradient(180deg, #0e1a3d 0%, #1d3a7a 62%, #0a2a50 100%)",
  storm:
    "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.18), transparent 35%), linear-gradient(170deg, #4a5878 0%, #2a3350 55%, #141b30 100%)",
  "forest-glade":
    "radial-gradient(circle at 30% 20%, rgba(255,244,170,0.55), transparent 35%), radial-gradient(circle at 70% 70%, rgba(200,255,120,0.35), transparent 30%), repeating-linear-gradient(100deg, rgba(10,60,30,0.28) 0 12px, transparent 12px 40px), linear-gradient(180deg, #7fd98a 0%, #2f8f55 55%, #0f3d2a 100%)",
  "castle-day":
    "radial-gradient(circle at 80% 18%, #fff4c0 0 5%, transparent 6%), linear-gradient(180deg, #7cc2ff 0%, #cfe8ff 45%, #8fb87a 46%, #5a9a58 100%), #8fb87a",
  "castle-night":
    "radial-gradient(circle at 20% 20%, #fff3c4 0 5%, transparent 6%), radial-gradient(1.5px 1.5px at 60% 18%, #fff, transparent), radial-gradient(1.5px 1.5px at 85% 30%, #fff, transparent), linear-gradient(180deg, #121a44 0%, #2a2f66 55%, #3a2a3a 56%, #1c1424 100%)",
  "deep-sea":
    "radial-gradient(ellipse at 30% 0%, rgba(210,250,255,0.55), transparent 45%), radial-gradient(circle at 75% 60%, rgba(255,255,255,0.18), transparent 12%), linear-gradient(180deg, #5fd0ee 0%, #1f8ccc 45%, #0a2c6a 100%)",
  jellyfish:
    "radial-gradient(circle at 30% 40%, rgba(255,150,230,0.7), transparent 22%), radial-gradient(circle at 70% 30%, rgba(120,240,255,0.65), transparent 20%), radial-gradient(circle at 55% 75%, rgba(255,230,120,0.5), transparent 18%), linear-gradient(180deg, #0d2a5a 0%, #06122e 100%)",
  snow: "radial-gradient(circle at 25% 25%, #ffffff, transparent 30%), radial-gradient(circle at 70% 60%, #ffffff, transparent 25%), linear-gradient(160deg, #cfe9ff 0%, #8fc3f0 100%)",
};

// Pozadí je obrázek z Blenderu; CSS přechod pod ním je záloha, kdyby se obrázek nenačetl.
export function bannerCss(id: string): string {
  return `url(/cosmetics/banners/${id}.webp) center / cover no-repeat, ${BANNERS[id]}`;
}

// Atributy, kterými se pozadí rozpohybuje (styly .banner-anim v globals.css).
export function bannerAttrs(id: string): { className: string; "data-banner": string } {
  return { className: "banner-anim", "data-banner": id };
}

// Velké pozadí (profil, menu účtu) se přehrává jako animace z Blenderu (public/cosmetics/banners/anim/<id>.webp),
// styl .banner-live v globals.css ji nasadí, pokud si uživatel nevypnul pohyb. Náhledy v seznamech zůstávají statické.
export function bannerLiveAttrs(id: string): { className: string; "data-banner": string } {
  return { className: "banner-live", "data-banner": id };
}

export function isBannerId(value: unknown): value is string {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(BANNERS, value);
}

// Výběr ozdob se ukládá do tabulky IdleState pod touto hrou (bez změny tabulky User).
export const STYLE_GAME = "profile-style";

// Oblíbené věci: hvězdičkou si hráč označí, co chce mít po ruce v rychlém výběru v hlavičce.
// Označit jde i zamčenou věc (jako přání), v rychlém výběru se ukážou jen odemčené.
export type FavoriteKind = "avatar" | "title" | "frame" | "banner";
export const FAVORITE_KINDS: FavoriteKind[] = ["avatar", "title", "frame", "banner"];
export type Favorites = Record<FavoriteKind, string[]>;
export const MAX_FAVORITES = 24;
export const EMPTY_FAVORITES: Favorites = { avatar: [], title: [], frame: [], banner: [] };

export function isFavoriteTarget(kind: unknown, id: unknown): kind is FavoriteKind {
  if (typeof id !== "string") return false;
  switch (kind) {
    case "avatar":
      return AVATARS.some((a) => a.id === id);
    case "title":
      return TITLES.some((t) => t.id === id);
    case "frame":
      return isFrameId(id);
    case "banner":
      return isBannerId(id);
    default:
      return false;
  }
}

export function normalizeFavorites(raw: unknown): Favorites {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const out: Favorites = { avatar: [], title: [], frame: [], banner: [] };
  for (const kind of FAVORITE_KINDS) {
    const list = r[kind];
    if (!Array.isArray(list)) continue;
    for (const id of list) {
      if (isFavoriteTarget(kind, id) && !out[kind].includes(id as string)) out[kind].push(id as string);
      if (out[kind].length >= MAX_FAVORITES) break;
    }
  }
  return out;
}

export type ProfileStyle = { frame: FrameId | null; banner: string | null; custom: Record<string, AvatarCustom>; favorites: Favorites };

export function normalizeStyle(raw: unknown): ProfileStyle {
  const r = (raw && typeof raw === "object" ? raw : {}) as { frame?: unknown; banner?: unknown; custom?: unknown; favorites?: unknown };
  return {
    frame: isFrameId(r.frame) ? r.frame : null,
    banner: isBannerId(r.banner) ? r.banner : null,
    custom: normalizeCustomMap(r.custom),
    favorites: normalizeFavorites(r.favorites),
  };
}
