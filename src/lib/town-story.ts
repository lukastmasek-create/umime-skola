import { NPC_KEYS, type NpcKey } from "@/lib/town-npc";
import { MINI_IDS } from "@/lib/town-mini";

// Příběh městečka: pět kapitol „Hvězdná mapa“. Každá kapitola má cíl, který se dá ověřit ze stavu hry na serveru
// (přátelství s obyvateli a minihry), a odměnu v bodech. Texty a dialogy jsou v src/i18n/town-story.ts.

export type Objective =
  | { kind: "talked"; need: number } // kolik různých obyvatel hráč oslovil (alespoň 1 přátelský bod)
  | { kind: "hearts"; hearts: number; need: number } // u kolika obyvatel má alespoň tolik srdíček
  | { kind: "minis" } // každá minihra aspoň jednou
  | { kind: "sumfp"; need: number }; // součet přátelských bodů

export const CHAPTERS: { id: string; reward: number; objectives: Objective[] }[] = [
  { id: "arrival", reward: 15, objectives: [{ kind: "talked", need: 3 }] },
  { id: "friends", reward: 25, objectives: [{ kind: "hearts", hearts: 2, need: 1 }] },
  { id: "skills", reward: 35, objectives: [{ kind: "minis" }] },
  { id: "together", reward: 50, objectives: [{ kind: "hearts", hearts: 3, need: 2 }] },
  { id: "starmap", reward: 100, objectives: [{ kind: "sumfp", need: 60 }] },
];

export const HEART_FP = [0, 3, 8, 15, 25, 40];

export type StoryFacts = { fp: Partial<Record<NpcKey, number>>; miniBest: Record<string, number> };

export type ObjectiveProgress = { kind: Objective["kind"]; have: number; need: number; hearts?: number };

export function progressOf(chapter: number, facts: StoryFacts): ObjectiveProgress[] {
  const def = CHAPTERS[chapter];
  if (!def) return [];
  const fps = NPC_KEYS.map((k) => facts.fp[k] ?? 0);
  return def.objectives.map((o) => {
    if (o.kind === "talked") return { kind: o.kind, have: Math.min(o.need, fps.filter((f) => f >= 1).length), need: o.need };
    if (o.kind === "hearts") return { kind: o.kind, have: Math.min(o.need, fps.filter((f) => f >= HEART_FP[o.hearts]).length), need: o.need, hearts: o.hearts };
    if (o.kind === "minis") return { kind: o.kind, have: MINI_IDS.filter((m) => (facts.miniBest[m] ?? 0) > 0).length, need: MINI_IDS.length };
    return { kind: o.kind, have: Math.min(o.need, fps.reduce((a, b) => a + b, 0)), need: o.need };
  });
}

export const chapterDone = (chapter: number, facts: StoryFacts) => progressOf(chapter, facts).every((p) => p.have >= p.need);
