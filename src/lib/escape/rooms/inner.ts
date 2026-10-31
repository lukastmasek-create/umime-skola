import type { ChoicePuzzle, CodePuzzle, Hotspot, MatchPuzzle, OrderPuzzle, Room, RoomTheme } from "../types";

type Thing = { name: string; symbol: string; description: string };
type Place = { label: string; icon: string };

// Druhá místnost každé únikovky. Má jinou kostru než první místnost (kit.ts), aby se hra neopakovala:
//  a) volná otázka s výběrem dá klíč a 1. poznámku,
//  b) zamčená schránka (na klíč) s přiřazováním dá 2. poznámku,
//  c) řazení (otevře se až po b) dá kartu (předmět) a 3. poznámku,
//  d) zařízení na kartu s početní/slovní odpovědí odemkne dveře,
//  dveře mají trojmístný kód ze tří poznámek.
// Obsah je v jazykových souborech inner-*.ts, tady je jen kostra a rozložení obecné scény (RoomScene).
export type InnerText = {
  // Nápis v rohu scény.
  title: string;
  intro: string;
  winMessage: string;
  notes: [string, string, string];
  noteLabel: { name: string; description: string };
  // Hláška u místa c, dokud není vyřešené b ({b} = název místa b).
  lockedC: string;
  things: { key: Thing; card: Thing };
  places: { a: Place; b: Place; c: Place; d: Place; door: Place; examine: Place & { message: string }; robot: string };
  lockedB: string;
  lockedD: string;
  lockedDoor: string;
  a: Omit<ChoicePuzzle, "id" | "type" | "rewardItems">;
  b: Omit<MatchPuzzle, "id" | "type" | "rewardItems">;
  c: Omit<OrderPuzzle, "id" | "type" | "rewardItems">;
  d: Omit<CodePuzzle, "id" | "type" | "rewardItems">;
  door: Omit<CodePuzzle, "id" | "type" | "rewardItems">;
};

// Barvy druhých místností (nemají vyrenderovanou grafiku, kreslí je RoomScene).
export const INNER_THEMES: Record<string, Omit<RoomTheme, "title">> = {
  lab: { wall: "#d3e4ea", floor: "#6f7f8a", accent: "#3fb6a8" },
  museum: { wall: "#ddd6c8", floor: "#9a8f7c", accent: "#a8865a" },
  expedition: { wall: "#f1d7a6", floor: "#8b6b3e", accent: "#c7663a" },
  jungle: { wall: "#b7cfa0", floor: "#5f6f4a", accent: "#c9a13d" },
  pirate: { wall: "#a9d4ef", floor: "#9c6b3f", accent: "#3a6ea5" },
  kitchen: { wall: "#f6e3d3", floor: "#a8705a", accent: "#d9534f" },
  library: { wall: "#d9c9b0", floor: "#6e5640", accent: "#7a5a9e" },
  observatory: { wall: "#8e9ad8", floor: "#4a4f6a", accent: "#ff8a3d" },
  castle: { wall: "#bdb5a6", floor: "#6f6a5f", accent: "#8a3b2e" },
};

// Druhá místnost má o tolik minut víc na časomíře.
export const INNER_EXTRA_MINUTES = 12;

export function buildInnerRoom(escapeId: string, t: InnerText): Room {
  const note = (id: string, n: number, text: string) => ({
    id,
    name: t.noteLabel.name.replace("{n}", String(n)),
    symbol: "📄",
    description: t.noteLabel.description.replace("{n}", String(n)),
    note: text,
  });
  const hotspots: Hotspot[] = [
    { id: "a", kind: "puzzle", label: t.places.a.label, icon: t.places.a.icon, x: 50, y: 50, w: 180, h: 130, puzzleId: "a", lockedMessage: "" },
    { id: "b", kind: "puzzle", label: t.places.b.label, icon: t.places.b.icon, x: 270, y: 160, w: 150, h: 150, puzzleId: "b", requiresItem: "key", lockedMessage: t.lockedB },
    { id: "c", kind: "puzzle", label: t.places.c.label, icon: t.places.c.icon, x: 50, y: 250, w: 200, h: 120, puzzleId: "c", requiresSolved: "b", lockedMessage: t.lockedC.replace("{b}", t.places.b.label) },
    { id: "d", kind: "puzzle", label: t.places.d.label, icon: t.places.d.icon, x: 455, y: 50, w: 145, h: 125, puzzleId: "d", requiresItem: "card", lockedMessage: t.lockedD },
    { id: "door", kind: "puzzle", label: t.places.door.label, icon: t.places.door.icon, x: 640, y: 110, w: 125, h: 275, puzzleId: "door", requiresSolved: "d", lockedMessage: t.lockedDoor },
    { id: "examine", kind: "examine", label: t.places.examine.label, icon: t.places.examine.icon, x: 470, y: 240, w: 115, h: 120, message: t.places.examine.message },
    { id: "robot", kind: "robot", label: t.places.robot, icon: "🤖", x: 300, y: 330, w: 90, h: 90 },
  ];
  return {
    id: `${escapeId}-2`,
    theme: { ...INNER_THEMES[escapeId], title: t.title },
    timeLimitSeconds: INNER_EXTRA_MINUTES * 60,
    intro: t.intro,
    items: [
      { id: "key", ...t.things.key },
      note("note1", 1, t.notes[0]),
      note("note2", 2, t.notes[1]),
      note("note3", 3, t.notes[2]),
      { id: "card", ...t.things.card },
    ],
    recipes: [],
    puzzles: [
      { id: "a", type: "choice", rewardItems: ["key", "note1"], ...t.a },
      { id: "b", type: "match", rewardItems: ["note2"], ...t.b },
      { id: "c", type: "order", rewardItems: ["card", "note3"], ...t.c },
      { id: "d", type: "code", ...t.d },
      { id: "door", type: "code", ...t.door },
    ],
    hotspots,
    order: ["a", "b", "c", "d", "door"],
    winMessage: t.winMessage,
  };
}
