import type { Topic } from "./types";

// Automatické procvičování k tématu: kartičky a otázky z tabulek a z „Zapamatuj si“. Míchá se podle semínka
// (slug tématu), aby server i prohlížeč vyrobily totéž.
export type PracticeQuestion = { question: string; options: string[]; answer: number };
export type PracticeCard = [string, string];

function rng(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededShuffle<T>(items: T[], seed: string): T[] {
  const r = rng(seed);
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function topicPractice(topic: Topic): { cards: PracticeCard[]; questions: PracticeQuestion[] } {
  const cards: PracticeCard[] = [];
  const questions: PracticeQuestion[] = [];
  for (const section of topic.sections) {
    for (const block of section.blocks) {
      if (block.type === "cards") cards.push(...block.items);
      if (block.type !== "table" || block.rows.length < 3 || block.head.length < 2) continue;
      const rows = block.rows.filter((r) => r[0] && r[1]);
      for (const row of rows) cards.push([row[0], row.slice(1).filter(Boolean).join(" · ")]);
      // otázky: k hodnotě v prvním sloupci najdi tu správnou z druhého
      if (rows.length >= 4) {
        for (const row of seededShuffle(rows, topic.slug + section.heading).slice(0, 3)) {
          const wrong = seededShuffle(
            rows.filter((r) => r !== row && r[1] !== row[1]).map((r) => r[1]),
            row[0],
          ).slice(0, 3);
          if (wrong.length < 2) continue;
          const options = seededShuffle([row[1], ...wrong], row[1] + row[0]);
          questions.push({ question: `${row[0]} → ${block.head[1]}?`, options, answer: options.indexOf(row[1]) });
        }
      }
    }
  }
  // „Zapamatuj si“ ve tvaru „Pojem: vysvětlení“ (dvojtečka hned za slovem, ne ve vzorci) jsou taky kartičky
  for (const r of topic.remember) {
    const m = r.match(/^([^:=]{2,40}?[\p{L})]):\s+(.{3,})$/u);
    if (m) cards.push([m[1].trim(), m[2].trim()]);
  }
  return { cards: seededShuffle(cards, topic.slug).slice(0, 12), questions: questions.slice(0, 6) };
}
