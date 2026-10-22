import { normalizeCustomMap, type AvatarCustom } from "@/lib/avatar-custom";

// Ozdoby profilu, které se kupují v obchodě: rámečky kolem avataru a pozadí profilu.
// Nové ozdoby přidává vývojář tady a v src/lib/shop.ts (cena a názvy).

export const FRAME_IDS = ["gold", "rainbow", "neon", "leaf", "stars", "fire"] as const;
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
  snow: "radial-gradient(circle at 25% 25%, #ffffff, transparent 30%), radial-gradient(circle at 70% 60%, #ffffff, transparent 25%), linear-gradient(160deg, #cfe9ff 0%, #8fc3f0 100%)",
};

// Pozadí je obrázek z Blenderu; CSS přechod pod ním je záloha, kdyby se obrázek nenačetl.
export function bannerCss(id: string): string {
  return `url(/cosmetics/banners/${id}.webp) center / cover no-repeat, ${BANNERS[id]}`;
}

export function isBannerId(value: unknown): value is string {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(BANNERS, value);
}

// Výběr ozdob se ukládá do tabulky IdleState pod touto hrou (bez změny tabulky User).
export const STYLE_GAME = "profile-style";

export type ProfileStyle = { frame: FrameId | null; banner: string | null; custom: Record<string, AvatarCustom> };

export function normalizeStyle(raw: unknown): ProfileStyle {
  const r = (raw && typeof raw === "object" ? raw : {}) as { frame?: unknown; banner?: unknown; custom?: unknown };
  return {
    frame: isFrameId(r.frame) ? r.frame : null,
    banner: isBannerId(r.banner) ? r.banner : null,
    custom: normalizeCustomMap(r.custom),
  };
}
