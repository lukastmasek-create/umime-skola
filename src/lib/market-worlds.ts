import type { ShopKind } from "@/lib/shop";

// Prostředí uživatelského obchodu. Každý svět je vlastní scéna z Blenderu s obchodníky u stánků; ve stánku se
// prodává jedna nebo více kategorií zboží. Další světy se odemykají úrovní a body (platí se jednou, odemčení se uloží
// jako klíč "world:<id>"). Svět s `ready: false` se ukáže jako „Připravujeme“.

export type WorldId = "pirate" | "space" | "forest" | "castle" | "sea";

export type StallKey = "avatary" | "tituly" | "ramecky" | "pozadi" | "mazlicci" | "lod";

// Sprite postavy nebo věci ve scéně: `anchor` je klíč polohy z JSON scény, šířka je v % šířky scény a `feet` je,
// kde má sprite chodidla (% jeho výšky), aby stál přesně na kotvě.
export type SceneExtra = { file: string; anchor: string; width: number; feet: number; dur: number; n?: number; dir?: string };
// Klikací věc ve scéně: `fire` vystřelí kouli (kanón, sonda), `talk` rozpovídá postavu.
export type Interactive = { id: string; kind: "fire" | "talk"; anchor: string; w: number; h: number; dx: number; dy: number; dir?: 1 | -1; shot?: "ball" | "laser" | "magic" | "bubble" };

export type SceneDef = {
  dir: string;
  scenery: "sea" | "space" | "forest" | "castle" | "deep";
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
        { id: "kanon", kind: "fire", anchor: "kanon", w: 8, h: 11, dx: -4, dy: -5, dir: -1, shot: "ball" },
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
      prop: { file: "raketa", n: 12, dur: 3, width: 12, ratio: "640 / 384", translate: [-50, -50], hit: [-6, -5, 12, 10], labelDy: 6 },
      extras: [
        { file: "blob", anchor: "pet", width: 5.6, feet: 66, dur: 2.4 },
        { file: "uklizec", anchor: "bot", width: 5.6, feet: 58, dur: 3 },
      ],
      interactive: [
        { id: "sonda", kind: "fire", anchor: "sonda", w: 5, h: 9, dx: -2.5, dy: -6, dir: 1, shot: "laser" },
        { id: "pet", kind: "talk", anchor: "pet", w: 5, h: 9, dx: -2.5, dy: -8 },
        { id: "bot", kind: "talk", anchor: "bot", w: 5, h: 7, dx: -2.5, dy: -6 },
      ],
      lamps: "lampy",
    },
  },
  {
    id: "forest",
    icon: "🧚",
    ready: true,
    unlock: { level: 10, points: 1000 },
    stalls: STALLS(["vila", "hajny", "rezbar", "malirka", "bylinkarka"]),
    scene: {
      dir: "/home/les",
      scenery: "forest",
      night: true,
      prop: { file: "domek", n: 12, dur: 3.2, width: 12, ratio: "640 / 704", translate: [-50, -50], hit: [-6, -9, 12, 20], labelDy: 13 },
      extras: [
        { file: "kralik", dir: "/home/mesto", anchor: "kralik", width: 4.6, feet: 73, dur: 0.9, n: 16 },
        { file: "kocka", dir: "/home/mesto", anchor: "kocka", width: 4.6, feet: 73, dur: 6 },
      ],
      interactive: [
        { id: "hul", kind: "fire", anchor: "hul", w: 5, h: 10, dx: -2.5, dy: -6, dir: 1, shot: "magic" },
        { id: "kralik", kind: "talk", anchor: "kralik", w: 5, h: 9, dx: -2.5, dy: -8 },
        { id: "kocka", kind: "talk", anchor: "kocka", w: 5, h: 9, dx: -2.5, dy: -8 },
      ],
      lamps: "lampy",
    },
  },
  {
    id: "castle",
    icon: "🏰",
    ready: true,
    unlock: { level: 15, points: 1500 },
    stalls: STALLS(["krejci", "kral", "kovar", "tkadlena", "sokolnik"]),
    scene: {
      dir: "/home/hrad",
      scenery: "castle",
      night: true,
      prop: { file: "vez", n: 12, dur: 3.2, width: 8, ratio: "512 / 800", translate: [-50, -62], hit: [-5, -22, 10, 26], labelDy: 6 },
      extras: [
        { file: "pes-sedi", dir: "/home/mesto", anchor: "pes", width: 4.9, feet: 73, dur: 1.8 },
        { file: "slepice", dir: "/home/mesto", anchor: "slepice", width: 3.4, feet: 72, dur: 1.3, n: 16 },
      ],
      interactive: [
        { id: "katapult", kind: "fire", anchor: "katapult", w: 7, h: 11, dx: -3.5, dy: -8, dir: 1, shot: "ball" },
        { id: "pes", kind: "talk", anchor: "pes", w: 5, h: 9, dx: -2.5, dy: -8 },
        { id: "slepice", kind: "talk", anchor: "slepice", w: 4, h: 8, dx: -2, dy: -7 },
      ],
      lamps: "lampy",
    },
  },
  {
    id: "sea",
    icon: "🐠",
    ready: true,
    unlock: { level: 20, points: 2500 },
    stalls: STALLS(["perla", "potapec", "perlar", "mag", "delfinka"]),
    scene: {
      dir: "/home/more",
      scenery: "deep",
      night: false,
      prop: { file: "ponorka", n: 12, dur: 3.2, width: 20, ratio: "640 / 384", translate: [-50, -50], hit: [-9, -9, 18, 17], labelDy: 11 },
      extras: [
        { file: "ryba", dir: "/home/mesto", anchor: "ryba", width: 4.9, feet: 65, dur: 0.9, n: 16 },
        { file: "krab", dir: "/home/pristav", anchor: "krab", width: 5.6, feet: 63, dur: 3.2 },
      ],
      interactive: [
        { id: "bublinac", kind: "fire", anchor: "bublinac", w: 5, h: 9, dx: -2.5, dy: -7, dir: 1, shot: "bubble" },
        { id: "ryba", kind: "talk", anchor: "ryba", w: 5, h: 8, dx: -2.5, dy: -9 },
        { id: "krab", kind: "talk", anchor: "krab", w: 5, h: 8, dx: -2.5, dy: -8 },
      ],
      lamps: "lampy",
    },
  },
];
