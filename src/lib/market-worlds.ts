import type { ShopKind } from "@/lib/shop";

// Prostředí uživatelského obchodu. Každý svět je vlastní scéna z Blenderu s obchodníky u stánků; ve stánku se
// prodává jedna nebo více kategorií zboží. Další světy se odemykají úrovní a body (sama scéna je ale zatím
// hotová jen u pirátského přístavu, ostatní mají `ready: false` a ukážou se jako zamčené „Připravujeme“).

export type WorldId = "pirate" | "space" | "forest" | "castle" | "sea";

export type StallKey = "avatary" | "tituly" | "ramecky" | "pozadi" | "mazlicci" | "lod";

export type World = {
  id: WorldId;
  icon: string;
  ready: boolean;
  unlock: { level: number; points: number };
  stalls: { key: StallKey; kinds: ShopKind[]; npc: string }[];
};

export const WORLDS: World[] = [
  {
    id: "pirate",
    icon: "🏴‍☠️",
    ready: true,
    unlock: { level: 1, points: 0 },
    stalls: [
      { key: "avatary", kinds: ["avatar"], npc: "kapitan" },
      { key: "tituly", kinds: ["title"], npc: "kvartyrmistr" },
      { key: "ramecky", kinds: ["frame"], npc: "tesar" },
      { key: "pozadi", kinds: ["banner"], npc: "plachtarka" },
      { key: "mazlicci", kinds: ["pet"], npc: "chovatel" },
      { key: "lod", kinds: ["city"], npc: "" },
    ],
  },
  { id: "space", icon: "🚀", ready: false, unlock: { level: 5, points: 500 }, stalls: [] },
  { id: "forest", icon: "🧚", ready: false, unlock: { level: 10, points: 1000 }, stalls: [] },
  { id: "castle", icon: "🏰", ready: false, unlock: { level: 15, points: 1500 }, stalls: [] },
  { id: "sea", icon: "🐠", ready: false, unlock: { level: 20, points: 2500 }, stalls: [] },
];
