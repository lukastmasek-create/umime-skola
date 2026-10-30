// Osobní rekordy ve hrách (jen v tomto prohlížeči): hvězdy 0–3 a skóre za hru, kurz a obtížnost.
export type Best = { stars: number; score: number };

const KEY = "game:best:v1";

function readAll(): Record<string, Best> {
  try {
    const raw = localStorage.getItem(KEY);
    const data = raw ? JSON.parse(raw) : null;
    return data && typeof data === "object" ? data : {};
  } catch {
    return {};
  }
}

const id = (game: string, course: string, level: number) => `${game}|${course}|${level}`;

export function readBest(game: string, course: string, level: number): Best | null {
  return readAll()[id(game, course, level)] ?? null;
}

// Rekordy všech her jednoho kurzu a obtížnosti (pro seznam her).
export function readCourseBest(course: string, level: number): Record<string, Best> {
  const out: Record<string, Best> = {};
  for (const [k, v] of Object.entries(readAll())) {
    const [game, c, l] = k.split("|");
    if (c === course && Number(l) === level) out[game] = v;
  }
  return out;
}

// Uloží výsledek; vrátí true, když je lepší než dosavadní rekord (víc hvězd, při shodě vyšší skóre).
export function saveBest(game: string, course: string, level: number, result: Best): boolean {
  const all = readAll();
  const k = id(game, course, level);
  const prev = all[k];
  const better = !prev || result.stars > prev.stars || (result.stars === prev.stars && result.score > prev.score);
  if (!better) return false;
  all[k] = result;
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    // bez úložiště se rekord jen neuloží
  }
  return !!prev || result.stars > 0;
}

// Hvězdy podle přesnosti: 100 % tři, aspoň 75 % dvě, aspoň 40 % jedna.
export function starsFor(right: number, total: number): 0 | 1 | 2 | 3 {
  if (total <= 0) return 0;
  const pct = (right / total) * 100;
  return pct === 100 ? 3 : pct >= 75 ? 2 : pct >= 40 ? 1 : 0;
}
