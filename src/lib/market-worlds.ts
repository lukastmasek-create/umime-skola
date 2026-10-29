import type { ShopKind } from "@/lib/shop";

// Prostředí uživatelského obchodu. Každý svět je vlastní scéna z Blenderu s obchodníky u stánků; ve stánku se
// prodává jedna nebo více kategorií zboží. Další světy se odemykají úrovní a body (platí se jednou, odemčení se uloží
// jako klíč "world:<id>"). Svět s `ready: false` se ukáže jako „Připravujeme“.

export type WorldId = "pirate" | "space" | "forest" | "castle" | "sea";

export type StallKey = "avatary" | "tituly" | "ramecky" | "pozadi" | "mazlicci" | "lod";

// Sprite postavy nebo věci ve scéně: `anchor` je klíč polohy z JSON scény, šířka je v % šířky scény a `feet` je,
// kde má sprite chodidla (% jeho výšky), aby stál přesně na kotvě.
export type SceneExtra = { file: string; anchor: string; width: number; feet: number; dur: number; n?: number };
// Klikací věc ve scéně: `fire` vystřelí kouli (kanón, sonda), `talk` rozpovídá postavu.
export type Interactive = { id: string; kind: "fire" | "talk"; anchor: string; w: number; h: number; dx: number; dy: number; dir?: 1 | -1 };

export type SceneDef = {
  dir: string;
  scenery: "sea" | "space";
  night: boolean;
  prop: { file: string; n: number; dur: number; width: number; ratio: string; translate: [number, number]; hit: [number, number, number, number]; labelDy: number };
  extras: SceneExtra[];
  interactive: Interactive[];
  lamps: string; // klíč kotev lamp (světla v noci)
};

export type World = {
  id: WorldId;
  icon: string;
  ready: boolean;
  unlock: { level: number; points: number };
  stalls: { key: StallKey; kinds: ShopKind[]; npc: string }[];
  scene?: SceneDef;
};

const STALLS = (npcs: string[]): World["stalls"] => [
  { key: "avatary", kinds: ["avatar"], npc: npcs[0] },
  { key: "tituly", kinds: ["title"], npc: npcs[1] },
  { key: "ramecky", kinds: ["frame"], npc: npcs[2] },
  { key: "pozadi", kinds: ["banner"], npc: npcs[3] },
  { key: "mazlicci", kinds: ["pet"], npc: npcs[4] },
  { key: "lod", kinds: ["city"], npc: "" },
];

export const WORLDS: World[] = [
  {
    id: "pirate",
    icon: "🏴‍☠️",
    ready: true,
    unlock: { level: 1, points: 0 },
    stalls: STALLS(["kapitan", "kvartyrmistr", "tesar", "plachtarka", "chovatel"]),
    scene: {
      dir: "/home/pristav",
      scenery: "sea",
      night: true,
      prop: { file: "lod", n: 12, dur: 3.6, width: 32, ratio: "640 / 512", translate: [-50, -78.1], hit: [-13, -26, 26, 28], labelDy: -4 },
      extras: [
        { file: "papousek", anchor: "papousek", width: 7.2, feet: 63, dur: 4 },
        { file: "krab", anchor: "krab", width: 5.6, feet: 63, dur: 3.2 },
      ],
      interactive: [
        { id: "kanon", kind: "fire", anchor: "kanon", w: 8, h: 11, dx: -4, dy: -5, dir: -1 },
        { id: "papousek", kind: "talk", anchor: "papousek", w: 6, h: 11, dx: -3, dy: -9 },
      ],
      lamps: "lampy",
    },
  },
  {
    id: "space",
    icon: "🚀",
    ready: true,
    unlock: { level: 5, points: 500 },
    stalls: STALLS(["admiral", "robot_obch", "inzenyr", "mimozemstan", "biolog"]),
    scene: {
      dir: "/home/kosmicka",
      scenery: "space",
      night: false,
      prop: { file: "raketa", n: 12, dur: 3, width: 32, ratio: "640 / 384", translate: [-50, -50], hit: [-13, -20, 26, 40], labelDy: -22 },
      extras: [
        { file: "blob", anchor: "pet", width: 5.6, feet: 66, dur: 2.4 },
        { file: "uklizec", anchor: "bot", width: 5.6, feet: 58, dur: 3 },
      ],
      interactive: [
        { id: "sonda", kind: "fire", anchor: "sonda", w: 6, h: 9, dx: -3, dy: -5, dir: 1 },
        { id: "pet", kind: "talk", anchor: "pet", w: 5, h: 9, dx: -2.5, dy: -8 },
        { id: "bot", kind: "talk", anchor: "bot", w: 5, h: 7, dx: -2.5, dy: -6 },
      ],
      lamps: "lampy",
    },
  },
  { id: "forest", icon: "🧚", ready: false, unlock: { level: 10, points: 1000 }, stalls: [] },
  { id: "castle", icon: "🏰", ready: false, unlock: { level: 15, points: 1500 }, stalls: [] },
  { id: "sea", icon: "🐠", ready: false, unlock: { level: 20, points: 2500 }, stalls: [] },
];
