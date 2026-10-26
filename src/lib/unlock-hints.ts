import { AVATARS } from "@/lib/avatars";
import { TITLES } from "@/lib/titles";
import { SHOP_ITEMS, type ShopKind } from "@/lib/shop";
import { getProfileText } from "@/i18n/profile";
import { getEscapeText } from "@/i18n/escape";
import type { Locale } from "@/i18n/config";

export type UnlockKind = Extract<ShopKind, "avatar" | "title" | "frame" | "banner">;
export type UnlockHint = { text: string; href?: string };

// Jak věc odemknout, napsané lidsky. Zamčené věci v profilu ukazují tenhle text pod sebou.
export function unlockHint(kind: UnlockKind, id: string, locale: Locale): UnlockHint {
  const t = getProfileText(locale);
  const shop = SHOP_ITEMS.find((i) => i.kind === kind && i.ref === id);
  const shopHint = (): UnlockHint =>
    shop
      ? { text: t.hintShop.replace("{n}", String(shop.price)), href: `/${locale}/obchod` }
      : { text: t.hintShopGeneric, href: `/${locale}/obchod` };

  const def = kind === "avatar" ? AVATARS.find((a) => a.id === id) : kind === "title" ? TITLES.find((x) => x.id === id) : null;
  if (def) {
    if ("level" in def.unlock) return { text: t.hintLevel.replace("{n}", String(def.unlock.level)) };
    const event = def.unlock.event;
    if (event.startsWith("escape-")) {
      const room = getEscapeText(locale).list.rooms.find((r) => r.id === event.slice("escape-".length));
      return { text: t.hintRoom.replace("{room}", room?.name ?? event), href: room ? `/${locale}/unikovky/${room.id}` : undefined };
    }
    if (shop || event === "shop") return shopHint();
    if (event === "founder") return { text: t.hintFounder };
    if (event === "winter") return { text: t.hintWinter };
    return { text: t.hintOther };
  }
  return shopHint();
}
