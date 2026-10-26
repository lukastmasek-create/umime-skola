export type Item = {
  id: string;
  name: string;
  symbol: string;
  description: string;
  // Text poznámky, kterou si hráč může přečíst v inventáři.
  note?: string;
};

type PuzzleBase = {
  id: string;
  title: string;
  prompt: string;
  hints: [string, string, string];
  rewardItems?: string[];
  rewardMessage: string;
};

export type CodePuzzle = PuzzleBase & { type: "code"; answers: string[]; placeholder?: string };
export type ChoicePuzzle = PuzzleBase & { type: "choice"; options: string[]; correct: number };
// `items` jsou ve správném pořadí, hráči se zamíchají.
export type OrderPuzzle = PuzzleBase & { type: "order"; items: string[] };
export type MatchPuzzle = PuzzleBase & { type: "match"; pairs: [string, string][] };

export type Puzzle = CodePuzzle | ChoicePuzzle | OrderPuzzle | MatchPuzzle;

type HotspotBase = {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  // Emoji, kterým obecná scéna místnost vykreslí (laboratoř má vlastní kresbu).
  icon?: string;
};

export type Hotspot =
  | (HotspotBase & {
      kind: "puzzle";
      puzzleId: string;
      // Předmět, který musí být vybraný v inventáři, aby se dalo hádanku otevřít.
      requiresItem?: string;
      // Hádanka, která musí být předtím vyřešená.
      requiresSolved?: string;
      lockedMessage: string;
    })
  | (HotspotBase & {
      kind: "use";
      item: string;
      rewardItems: string[];
      message: string;
      lockedMessage: string;
    })
  | (HotspotBase & { kind: "examine"; message: string })
  | (HotspotBase & { kind: "robot" });

export type Recipe = { a: string; b: string; result: string; message: string };

// Barvy obecné scény (RoomScene) pro místnosti bez vlastní kresby.
export type RoomTheme = { wall: string; floor: string; accent: string; title: string };

export type Room = {
  id: string;
  theme?: RoomTheme;
  timeLimitSeconds: number;
  intro: string;
  items: Item[];
  recipes: Recipe[];
  puzzles: Puzzle[];
  hotspots: Hotspot[];
  // Pořadí hádanek pro nápovědu od robota.
  order: string[];
  winMessage: string;
};
