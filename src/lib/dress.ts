// Panenky pro hru „Obleč panenku“: každá má vlastní styl a šest kusů oblečení, které si vysloužíš správnými odpověďmi.

export const SLOTS = ["hair", "outfit", "shoes", "makeup", "accessory", "topper"] as const;
export type Slot = (typeof SLOTS)[number];

export type HairKind = "long" | "bob" | "pony" | "bun" | "curly" | "braids";
export type OutfitKind = "gown" | "sport" | "rock" | "fairy" | "chef" | "astro";
export type ShoeKind = "heels" | "sneaker" | "boots" | "ballet" | "clog" | "moon";
export type AccKind = "necklace" | "glasses" | "wand" | "bag" | "ladle" | "star";
export type TopperKind = "crown" | "cap" | "jacket" | "flowers" | "chefhat" | "helmet";

export type Doll = {
  id: string;
  skin: string;
  bg: [string, string];
  hair: { kind: HairKind; c: string };
  outfit: { kind: OutfitKind; c: [string, string] };
  shoes: { kind: ShoeKind; c: [string, string] };
  makeup: { lips: string; shadow: string; blush: string };
  accessory: { kind: AccKind; c: [string, string] };
  topper: { kind: TopperKind; c: [string, string] };
};

export const DOLLS: Doll[] = [
  {
    id: "princess",
    skin: "#f7d3b8",
    bg: ["#ffd6ec", "#ffeaf6"],
    hair: { kind: "long", c: "#f4c542" },
    outfit: { kind: "gown", c: ["#ff7eb6", "#ffd1e8"] },
    shoes: { kind: "heels", c: ["#ff4f9a", "#ffd1e8"] },
    makeup: { lips: "#e0457b", shadow: "#c58bff", blush: "#ff9ab8" },
    accessory: { kind: "necklace", c: ["#ffd23f", "#59c3ff"] },
    topper: { kind: "crown", c: ["#ffd23f", "#ff4f9a"] },
  },
  {
    id: "athlete",
    skin: "#e8b48e",
    bg: ["#c9f0ff", "#e8faff"],
    hair: { kind: "pony", c: "#7a4a2a" },
    outfit: { kind: "sport", c: ["#2a8cff", "#ffffff"] },
    shoes: { kind: "sneaker", c: ["#ffffff", "#ff5d3a"] },
    makeup: { lips: "#e07a6a", shadow: "#8fd0ff", blush: "#ffa08a" },
    accessory: { kind: "star", c: ["#ffd23f", "#ff5d3a"] },
    topper: { kind: "cap", c: ["#ff5d3a", "#ffffff"] },
  },
  {
    id: "rocker",
    skin: "#f1c9a8",
    bg: ["#d8c9ff", "#efe8ff"],
    hair: { kind: "bob", c: "#2a1f3d" },
    outfit: { kind: "rock", c: ["#1f1b2e", "#c43cff"] },
    shoes: { kind: "boots", c: ["#2a2438", "#c43cff"] },
    makeup: { lips: "#7a1fa8", shadow: "#3a2a5c", blush: "#b78acb" },
    accessory: { kind: "glasses", c: ["#1f1b2e", "#c43cff"] },
    topper: { kind: "jacket", c: ["#2a2438", "#c43cff"] },
  },
  {
    id: "fairy",
    skin: "#f9dcc4",
    bg: ["#c9f7d4", "#e9fff0"],
    hair: { kind: "curly", c: "#58c27d" },
    outfit: { kind: "fairy", c: ["#7ee0b0", "#ffe36e"] },
    shoes: { kind: "ballet", c: ["#ffb5d6", "#ffffff"] },
    makeup: { lips: "#f06b9c", shadow: "#9be6c0", blush: "#ffb0c8" },
    accessory: { kind: "wand", c: ["#c9923a", "#ffe36e"] },
    topper: { kind: "flowers", c: ["#ff7eb6", "#ffe36e"] },
  },
  {
    id: "chef",
    skin: "#d9a07a",
    bg: ["#ffe2b8", "#fff3dc"],
    hair: { kind: "bun", c: "#3b2418" },
    outfit: { kind: "chef", c: ["#ffffff", "#ff6b5b"] },
    shoes: { kind: "clog", c: ["#ffffff", "#ff6b5b"] },
    makeup: { lips: "#d4504a", shadow: "#ffb84d", blush: "#f08a70" },
    accessory: { kind: "ladle", c: ["#b0b6c2", "#6e4520"] },
    topper: { kind: "chefhat", c: ["#ffffff", "#e6e6ee"] },
  },
  {
    id: "astronaut",
    skin: "#b98a68",
    bg: ["#b8c7ff", "#dfe6ff"],
    hair: { kind: "braids", c: "#1c1c28" },
    outfit: { kind: "astro", c: ["#f2f4ff", "#ff5d73"] },
    shoes: { kind: "moon", c: ["#c9cfe6", "#ff5d73"] },
    makeup: { lips: "#c4506a", shadow: "#7a8cff", blush: "#d98a8a" },
    accessory: { kind: "star", c: ["#ffd23f", "#2a8cff"] },
    topper: { kind: "helmet", c: ["#cfe3ff", "#9fb4d9"] },
  },
];

export function getDoll(id: string): Doll {
  return DOLLS.find((d) => d.id === id) ?? DOLLS[0];
}

/** Počet kusů oblečení v jedné hře. */
export const SLOT_COUNT = SLOTS.length;

// Výběr kusu: v = tvar (číslo varianty modelu), h = posun odstínu (0..1). Princezna má čtyři různé tvary každého kusu, ostatní panenky
// zatím jeden tvar ve čtyřech barvách.
export type Pick = { v: number; h: number };
export const SHAPE_VARIANTS: Record<string, number> = { princess: 4 };
export const HUE_STEPS = [0, 0.25, 0.5, 0.75];

const SWATCH: Record<string, Record<Slot, string[]>> = {
  princess: {
    hair: ["#f4c542", "#b5532a", "#3a2418", "#e8a0c4"],
    outfit: ["#ff7eb6", "#6fb3ff", "#8a4bd0", "#7ee0b0"],
    shoes: ["#ff4f9a", "#ffffff", "#7a4a2a", "#d8b8ff"],
    makeup: ["#e0457b", "#d98a7a", "#b0102a", "#2ec4b6"],
    accessory: ["#59c3ff", "#ff7eb6", "#ff7eb6", "#ffe36e"],
    topper: ["#ffd23f", "#ff7eb6", "#ff9ec8", "#e8c887"],
  },
};

export type Option = { pick: Pick; swatch: string; hue: number };

/** Čtyři možnosti pro daný kus panenky: tvary (princezna) nebo odstíny (ostatní). */
export function optionsFor(doll: Doll, slot: Slot): Option[] {
  const shapes = SHAPE_VARIANTS[doll.id] ?? 1;
  if (shapes > 1) return Array.from({ length: shapes }, (_, v) => ({ pick: { v, h: 0 }, swatch: SWATCH[doll.id][slot][v], hue: 0 }));
  const base: Record<Slot, string> = { hair: doll.hair.c, outfit: doll.outfit.c[0], shoes: doll.shoes.c[0], makeup: doll.makeup.lips, accessory: doll.accessory.c[0], topper: doll.topper.c[0] };
  return HUE_STEPS.map((h) => ({ pick: { v: 0, h }, swatch: base[slot], hue: h * 360 }));
}
