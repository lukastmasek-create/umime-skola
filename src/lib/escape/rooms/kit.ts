import type { ChoicePuzzle, CodePuzzle, Hotspot, MatchPuzzle, OrderPuzzle, Room, RoomTheme } from "../types";

type Thing = { name: string; symbol: string; description: string };
type Place = { label: string; icon: string };

// Všechny nové místnosti sdílejí stejnou kostru, stejnou jako v Laboratoři:
//  a) volná hádanka dá klíč a 1. poznámku,
//  b) skříňka na klíč dá část 1 a 2. poznámku,
//  c) volná hádanka dá část 2 a 3. poznámku,
//  části 1 a 2 se spojí v nástroj, ten se použije na místě d) a dá kartu a 4. poznámku,
//  e) hádanka na kartu odemkne dveře, kde se zadá kód ze čtyř poznámek.
// Tady se jen skládá obsah, kreslí ho obecná RoomScene.
export type RoomKit = {
  id: string;
  theme: RoomTheme;
  timeLimitMinutes?: number;
  intro: string;
  winMessage: string;
  notes: [string, string, string, string];
  things: { key: Thing; partB: Thing; partC: Thing; tool: Thing; card: Thing };
  recipeMessage: string;
  places: { a: Place; b: Place; c: Place; d: Place; e: Place; door: Place; examine: Place & { message: string }; robot: string };
  lockedB: string;
  lockedD: string;
  lockedE: string;
  lockedDoor: string;
  useMessage: string;
  a: Omit<CodePuzzle, "id" | "type" | "rewardItems">;
  b: Omit<MatchPuzzle, "id" | "type" | "rewardItems">;
  c: Omit<OrderPuzzle, "id" | "type" | "rewardItems">;
  e: Omit<ChoicePuzzle, "id" | "type" | "rewardItems">;
  door: Omit<CodePuzzle, "id" | "type" | "rewardItems">;
};

export function buildRoom(k: RoomKit): Room {
  const note = (id: string, n: number, text: string) => ({
    id,
    name: `Poznámka ${n}`,
    symbol: "📄",
    description: `Papír s číslem ${n}.`,
    note: text,
  });
  const hotspot = (h: Hotspot) => h;
  const hotspots: Hotspot[] = [
    hotspot({ id: "a", kind: "puzzle", label: k.places.a.label, icon: k.places.a.icon, x: 70, y: 70, w: 190, h: 140, puzzleId: "a", lockedMessage: "" }),
    hotspot({ id: "b", kind: "puzzle", label: k.places.b.label, icon: k.places.b.icon, x: 300, y: 110, w: 130, h: 190, puzzleId: "b", requiresItem: "key", lockedMessage: k.lockedB }),
    hotspot({ id: "c", kind: "puzzle", label: k.places.c.label, icon: k.places.c.icon, x: 80, y: 290, w: 210, h: 100, puzzleId: "c", lockedMessage: "" }),
    hotspot({
      id: "d",
      kind: "use",
      label: k.places.d.label,
      icon: k.places.d.icon,
      x: 470,
      y: 20,
      w: 120,
      h: 70,
      item: "tool",
      rewardItems: ["card", "note4"],
      message: k.useMessage,
      lockedMessage: k.lockedD,
    }),
    hotspot({ id: "e", kind: "puzzle", label: k.places.e.label, icon: k.places.e.icon, x: 470, y: 250, w: 120, h: 100, puzzleId: "e", requiresItem: "card", lockedMessage: k.lockedE }),
    hotspot({ id: "door", kind: "puzzle", label: k.places.door.label, icon: k.places.door.icon, x: 640, y: 120, w: 120, h: 270, puzzleId: "door", requiresSolved: "e", lockedMessage: k.lockedDoor }),
    hotspot({ id: "examine", kind: "examine", label: k.places.examine.label, icon: k.places.examine.icon, x: 595, y: 220, w: 40, h: 100, message: k.places.examine.message }),
    hotspot({ id: "robot", kind: "robot", label: k.places.robot, icon: "🤖", x: 305, y: 330, w: 90, h: 90 }),
  ];
  return {
    id: k.id,
    theme: k.theme,
    timeLimitSeconds: (k.timeLimitMinutes ?? 20) * 60,
    intro: k.intro,
    items: [
      { id: "key", ...k.things.key },
      note("note1", 1, k.notes[0]),
      note("note2", 2, k.notes[1]),
      note("note3", 3, k.notes[2]),
      note("note4", 4, k.notes[3]),
      { id: "partB", ...k.things.partB },
      { id: "partC", ...k.things.partC },
      { id: "tool", ...k.things.tool },
      { id: "card", ...k.things.card },
    ],
    recipes: [{ a: "partB", b: "partC", result: "tool", message: k.recipeMessage }],
    puzzles: [
      { id: "a", type: "code", rewardItems: ["key", "note1"], ...k.a },
      { id: "b", type: "match", rewardItems: ["partB", "note2"], ...k.b },
      { id: "c", type: "order", rewardItems: ["partC", "note3"], ...k.c },
      { id: "e", type: "choice", ...k.e },
      { id: "door", type: "code", ...k.door },
    ],
    hotspots,
    order: ["a", "b", "c", "e", "door"],
    winMessage: k.winMessage,
  };
}
