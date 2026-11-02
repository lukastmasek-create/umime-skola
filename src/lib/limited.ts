// Katalog limitovaných edic. Každý kus má sériové číslo (1 = první koupený) a po vyprodání už nepřibude.
// Koupená věc se uloží jako odemčení "<druh>:<ref>" stejně jako zboží z běžného katalogu,
// takže ji profil, rámečky i bannery rozpoznají. Vlastní grafika limitek se dodá později (SHOP_ASSETS.md);
// zatím používají vzhled odpovídající věci z katalogu.

export type LimitedKind = "avatar" | "frame" | "banner" | "title";

export type LimitedItem = {
  id: string;
  kind: LimitedKind;
  ref: string;
  price: number;
  edition: number;
  name: string;
};

export const LIMITED_ITEMS: LimitedItem[] = [
  { id: "ltd-avatar-wizard", kind: "avatar", ref: "wizard", price: 1500, edition: 100, name: "Čaroděj – zlatá edice" },
  { id: "ltd-frame-royal", kind: "frame", ref: "royal", price: 1200, edition: 100, name: "Královský rámeček – limitka" },
  { id: "ltd-banner-ocean", kind: "banner", ref: "ocean", price: 1000, edition: 150, name: "Oceán – limitovaný banner" },
  { id: "ltd-title-legend", kind: "title", ref: "legend", price: 2000, edition: 50, name: "Titul Legenda – číslovaná edice" },
];

export const getLimited = (id: string) => LIMITED_ITEMS.find((i) => i.id === id);
