"use client";

import { useState, type ReactNode } from "react";
import { getTownMiniLearnText } from "@/i18n/town-mini-learn";
import { sfx } from "@/lib/market-sfx";
import type { Locale } from "@/i18n/config";

// Naučné minihry 3D městečka: pokladna v pekárně (počítání), knihovna (abeceda), hvězdárna (vesmír a zeměpis)
// a květinářství (příroda). Skóre = počet správných odpovědí; odměnu omezí server (api/mestecko/minihra).

type Done = (score: number) => void;
type T = ReturnType<typeof getTownMiniLearnText>;

const rnd = (n: number) => Math.floor(Math.random() * n);
function shuffle<X>(a: X[]): X[] {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = rnd(i + 1);
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}
const pickN = <X,>(a: X[], n: number) => shuffle(a).slice(0, n);

// ------------------------------------------------------------------------------------- společný kvíz
type ChoiceQ = { prompt: ReactNode; options: string[]; answer: number };

function ChoiceQuiz({ t, qs, onDone, cols = 2 }: { t: T; qs: ChoiceQ[]; onDone: Done; cols?: 2 | 4 }) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const q = qs[i];

  function pick(k: number) {
    if (picked !== null) return;
    setPicked(k);
    if (k === q.answer) {
      sfx.dock();
      setScore((s) => s + 1);
    } else sfx.creak();
  }
  function next() {
    if (i + 1 >= qs.length) return onDone(score);
    setI(i + 1);
    setPicked(null);
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-bold text-[var(--muted)]">
        {t.question.replace("{a}", String(i + 1)).replace("{b}", String(qs.length))} · ⭐ {score}
      </p>
      <div key={i}>{q.prompt}</div>
      <div className={`grid gap-2 ${cols === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2"}`}>
        {q.options.map((o, k) => {
          const cls = picked === null ? "" : k === q.answer ? "mini-opt-ok" : k === picked ? "mini-opt-bad" : "";
          return (
            <button key={k} type="button" disabled={picked !== null} onClick={() => pick(k)} className={`mini-opt ${cls}`}>
              {o}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div className="flex flex-wrap items-center gap-3">
          <p className="font-bold">{picked === q.answer ? t.right : t.wrong.replace("{x}", q.options[q.answer])}</p>
          <button type="button" onClick={next} className="btn-bouncy btn-primary px-5 py-2 text-sm font-bold">
            {i + 1 >= qs.length ? t.finish : t.next}
          </button>
        </div>
      )}
    </div>
  );
}

// tři špatné odpovědi kolem správného čísla
function numberOptions(answer: number): { options: string[]; answer: number } {
  const set = new Set<number>([answer]);
  const deltas = shuffle([-3, -2, -1, 1, 2, 3, 10, -10]);
  for (const d of deltas) {
    if (set.size >= 4) break;
    if (answer + d >= 0) set.add(answer + d);
  }
  const options = shuffle([...set]);
  return { options: options.map(String), answer: options.indexOf(answer) };
}

// ---------------------------------------------------------------------------------- pokladna v pekárně
const PASTRY: [string, number][] = [
  ["🥐", 3],
  ["🍞", 5],
  ["🥨", 2],
  ["🧁", 4],
  ["🍩", 3],
  ["🥧", 7],
  ["🍪", 1],
  ["🎂", 9],
];
const CUSTOMERS = 10;

function cashierQuestions(t: T): ChoiceQ[] {
  return Array.from({ length: CUSTOMERS }, (_, i) => {
    const items = Array.from({ length: i < 4 ? 2 : 3 }, () => PASTRY[rnd(PASTRY.length)]);
    const total = items.reduce((s, [, p]) => s + p, 0);
    // od sedmého zákazníka se vrací
    const pay = i >= 6 ? Math.ceil((total + 1) / 10) * 10 : null;
    const { options, answer } = numberOptions(pay ? pay - total : total);
    const prompt = (
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold">{t.cashierBuy}</p>
        <div className="mini-receipt">
          {items.map(([icon, price], k) => (
            <span key={k}>
              <span className="text-2xl">{icon}</span> {price} 🪙
            </span>
          ))}
        </div>
        <p className="font-bold">{pay ? t.cashierChange.replace("{p}", String(pay)) : t.cashierTotal}</p>
      </div>
    );
    return { prompt, options: options.map((o) => `${o} 🪙`), answer };
  });
}

export function Cashier({ locale, onDone }: { locale: Locale; onDone: Done }) {
  const t = getTownMiniLearnText(locale);
  const [qs] = useState(() => cashierQuestions(t));
  return <ChoiceQuiz t={t} qs={qs} onDone={onDone} cols={4} />;
}

// ------------------------------------------------------------------------------------------- knihovna
const SHELVES = 6;
const BOOK_COLORS = ["#e5484d", "#2e86c1", "#3f9a4a", "#8e44ad", "#d35400", "#16a085", "#c0392b", "#2e5aa8"];

export function Library({ locale, onDone }: { locale: Locale; onDone: Done }) {
  const t = getTownMiniLearnText(locale);
  const sorted = (w: string[]) => [...w].sort((a, b) => a.localeCompare(b, locale));
  const deal = (round: number) => pickN(t.words, round < 3 ? 4 : 5);
  const [round, setRound] = useState(0);
  const [books, setBooks] = useState<string[]>(() => deal(0));
  const [placed, setPlaced] = useState<string[]>([]);
  const [state, setState] = useState<"play" | "ok" | "bad">("play");
  const [score, setScore] = useState(0);
  const order = sorted(books);

  function click(w: string) {
    if (state !== "play") return;
    if (w !== order[placed.length]) {
      sfx.creak();
      setState("bad");
      return;
    }
    sfx.pop();
    const next = [...placed, w];
    setPlaced(next);
    if (next.length === books.length) {
      sfx.dock();
      setScore((s) => s + 1);
      setState("ok");
    }
  }
  function next() {
    if (round + 1 >= SHELVES) return onDone(score);
    setRound(round + 1);
    setBooks(deal(round + 1));
    setPlaced([]);
    setState("play");
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-bold text-[var(--muted)]">
        📚 {round + 1} / {SHELVES} · ⭐ {score}
      </p>
      <p className="text-sm font-semibold">{t.libraryHint}</p>
      <div className="mini-shelf" aria-label={t.libraryHint}>
        {books.map((w, k) => (
          <button
            key={w}
            type="button"
            disabled={placed.includes(w) || state !== "play"}
            onClick={() => click(w)}
            className="mini-book"
            style={{ background: BOOK_COLORS[(k + round * 3) % BOOK_COLORS.length], height: `${6.5 + ((k * 7 + round) % 4) * 0.7}rem` }}
          >
            {w}
          </button>
        ))}
      </div>
      {placed.length > 0 && <p className="text-sm font-bold">{placed.join(" → ")}</p>}
      {state !== "play" && (
        <div className="flex flex-col items-start gap-2">
          <p className="font-bold">{state === "ok" ? t.libraryRight : t.libraryWrong}</p>
          {state === "bad" && <p className="text-sm font-semibold">{order.join(" → ")}</p>}
          <button type="button" onClick={next} className="btn-bouncy btn-primary px-5 py-2 text-sm font-bold">
            {round + 1 >= SHELVES ? t.finish : t.next}
          </button>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------------------------------ hvězdárna
// průměry planet v km (pořadí od Slunce) a rozlohy světadílů v mil. km² (od největšího)
const PLANET_KM = [4879, 12104, 12742, 6779, 139820, 116460, 50724, 49244];
const CONTINENT_AREA = [44.6, 30.4, 24.7, 17.8, 14.2, 10.2, 8.6];
const QUESTIONS = 10;

function starsQuestions(t: T): ChoiceQ[] {
  const two = (n: number) => {
    const a = rnd(n);
    let b = rnd(n - 1);
    if (b >= a) b++;
    return [a, b];
  };
  const kinds = shuffle([0, 0, 0, 1, 1, 1, 2, 2, 3, 3]).slice(0, QUESTIONS);
  return kinds.map((kind) => {
    if (kind === 3) {
      const p = rnd(8);
      const uniq = shuffle([String(p + 1), ...pickN([1, 2, 3, 4, 5, 6, 7, 8].filter((x) => x !== p + 1), 3).map(String)]);
      return { prompt: <p className="text-lg font-bold">🪐 {t.starsOrder.replace("{a}", t.planets[p])}</p>, options: uniq, answer: uniq.indexOf(String(p + 1)) };
    }
    if (kind === 2) {
      const [a, b] = two(7);
      return { prompt: <p className="text-lg font-bold">🌍 {t.starsContinent}</p>, options: [t.continents[a], t.continents[b]], answer: CONTINENT_AREA[a] > CONTINENT_AREA[b] ? 0 : 1 };
    }
    const [a, b] = two(8);
    if (kind === 1) return { prompt: <p className="text-lg font-bold">☀️ {t.starsCloser}</p>, options: [t.planets[a], t.planets[b]], answer: a < b ? 0 : 1 };
    return { prompt: <p className="text-lg font-bold">🔭 {t.starsBigger}</p>, options: [t.planets[a], t.planets[b]], answer: PLANET_KM[a] > PLANET_KM[b] ? 0 : 1 };
  });
}

export function Stars({ locale, onDone }: { locale: Locale; onDone: Done }) {
  const t = getTownMiniLearnText(locale);
  const [qs] = useState(() => starsQuestions(t));
  return <ChoiceQuiz t={t} qs={qs} onDone={onDone} />;
}

// --------------------------------------------------------------------------------------- květinářství
const NATURE: [string, number][] = [
  ...["🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🍒", "🍑", "🥝", "🍍"].map((e) => [e, 0] as [string, number]),
  ...["🥕", "🥦", "🥔", "🌽", "🧅", "🥒", "🥬", "🧄"].map((e) => [e, 1] as [string, number]),
  ...["🌹", "🌻", "🌷", "🌼", "🪻", "🌸", "🌺"].map((e) => [e, 2] as [string, number]),
  ...["🌲", "🌳", "🌴", "🎄"].map((e) => [e, 3] as [string, number]),
];
const ITEMS = 12;

function flowerQuestions(t: T): ChoiceQ[] {
  // každá skupina aspoň dvakrát, zbytek náhodně
  const by = (c: number) => NATURE.filter(([, k]) => k === c);
  const base = [0, 1, 2, 3].flatMap((c) => pickN(by(c), 2));
  const rest = pickN(NATURE.filter((x) => !base.includes(x)), ITEMS - base.length);
  const icons = ["🍎", "🥕", "🌷", "🌳"];
  return shuffle([...base, ...rest]).map(([emoji, cat]) => ({
    prompt: (
      <div className="flex flex-col gap-2">
        <div className="mini-card mini-pop" style={{ animationDuration: "0.3s" }}>
          {emoji}
        </div>
        <p className="font-bold">{t.flowersAsk}</p>
      </div>
    ),
    options: t.categories.map((c, k) => `${icons[k]} ${c}`),
    answer: cat,
  }));
}

export function Flowers({ locale, onDone }: { locale: Locale; onDone: Done }) {
  const t = getTownMiniLearnText(locale);
  const [qs] = useState(() => flowerQuestions(t));
  return <ChoiceQuiz t={t} qs={qs} onDone={onDone} cols={4} />;
}
