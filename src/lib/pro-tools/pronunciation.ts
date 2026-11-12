// Hodnocení výslovnosti: porovná, co rozpoznávání řeči slyšelo, s tím, co mělo zaznít.

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[n];
}

/** Podobnost 0 až 100 (100 = rozpoznáno přesně to, co mělo zaznít). */
export function pronunciationScore(target: string, heard: string): number {
  const a = normalize(target);
  const b = normalize(heard);
  if (!a || !b) return 0;
  const dist = levenshtein(a, b);
  return Math.max(0, Math.round((1 - dist / Math.max(a.length, b.length)) * 100));
}

export type WordCheck = { word: string; ok: boolean };

/** Která slova z cílové věty zazněla (podle nejbližšího rozpoznaného slova). */
export function compareWords(target: string, heard: string): WordCheck[] {
  const heardWords = normalize(heard).split(" ").filter(Boolean);
  return normalize(target)
    .split(" ")
    .filter(Boolean)
    .map((word) => ({
      word,
      ok: heardWords.some((h) => levenshtein(word, h) <= (word.length > 4 ? 1 : 0)),
    }));
}
