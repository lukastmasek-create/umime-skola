"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getTownMiniText } from "@/i18n/town-mini";
import { MINI, type MiniId } from "@/lib/town-mini";
import { notifyAccountChanged } from "@/lib/account-events";
import { sfx } from "@/lib/market-sfx";
import type { Locale } from "@/i18n/config";

// Tři minihry městečka. Každá je krátká hra na dovednost; po konci se skóre pošle serveru (api/mestecko/minihra), který odměnu omezí.

type Done = (score: number) => void;

const rnd = (n: number) => Math.floor(Math.random() * n);

// ---------------------------------------------------------------------------------------------- rybaření
const FISH = [
  { icon: "🐟", value: 3, speed: 1.1, zone: 0.28 },
  { icon: "🐠", value: 5, speed: 1.5, zone: 0.22 },
  { icon: "🐡", value: 7, speed: 1.9, zone: 0.18 },
  { icon: "🦑", value: 9, speed: 2.3, zone: 0.15 },
];
const CASTS = 5;
const ZONE_AT = 0.5;
type Cast = { st: "wait" | "bite" | "reel" | "result"; fish: number; hits: number; ok: boolean | null; n: number };

function Fishing({ t, onDone }: { t: ReturnType<typeof getTownMiniText>; onDone: Done }) {
  const [c, setC] = useState<Cast>({ st: "wait", fish: 0, hits: 0, ok: null, n: 1 });
  const [score, setScore] = useState(0);
  const [pos, setPos] = useState(0);
  const posRef = useRef(0);

  // čekání na záběr
  useEffect(() => {
    if (c.st !== "wait") return;
    const id = window.setTimeout(() => {
      sfx.pop();
      setC((x) => ({ ...x, st: "bite", fish: Math.min(FISH.length - 1, rnd(FISH.length + 1)) }));
    }, 1200 + rnd(1800));
    return () => window.clearTimeout(id);
  }, [c.st, c.n]);
  // záběr trvá krátce, pak ryba uplave
  useEffect(() => {
    if (c.st !== "bite") return;
    const id = window.setTimeout(() => setC((x) => ({ ...x, st: "result", ok: false })), 1000);
    return () => window.clearTimeout(id);
  }, [c.st]);
  // navíjení: jezdec se pohybuje tam a zpět
  useEffect(() => {
    if (c.st !== "reel") return;
    let raf = 0;
    const t0 = performance.now();
    const f = FISH[c.fish];
    const frame = (now: number) => {
      const p = 0.5 + 0.5 * Math.sin(((now - t0) / 1000) * f.speed * Math.PI);
      posRef.current = p;
      setPos(p);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    const limit = window.setTimeout(() => setC((x) => ({ ...x, st: "result", ok: false })), 9000);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(limit);
    };
  }, [c.st, c.fish]);

  function act() {
    if (c.st === "bite") {
      setC((x) => ({ ...x, st: "reel", hits: 0 }));
    } else if (c.st === "reel") {
      const f = FISH[c.fish];
      const inZone = Math.abs(posRef.current - ZONE_AT) <= f.zone / 2;
      if (inZone) {
        sfx.dock();
        if (c.hits + 1 >= 3) {
          setScore((s) => s + f.value);
          setC((x) => ({ ...x, st: "result", ok: true, hits: 3 }));
        } else setC((x) => ({ ...x, hits: x.hits + 1 }));
      } else {
        sfx.creak();
        setC((x) => ({ ...x, hits: Math.max(0, x.hits - 1) }));
      }
    }
  }
  function next() {
    if (c.n >= CASTS) return onDone(score);
    setC({ st: "wait", fish: 0, hits: 0, ok: null, n: c.n + 1 });
  }

  const f = FISH[c.fish];
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-bold text-[var(--muted)]">
        {t.cast.replace("{a}", String(c.n)).replace("{b}", String(CASTS))} · 🐟 {score}
      </p>
      <div className="mini-sea">
        <span className={`mini-float ${c.st === "bite" ? "mini-bite" : ""}`} aria-hidden>
          🎣
        </span>
        {c.st === "bite" && <span className="mini-alert">❗</span>}
        {c.st === "result" && <span className="mini-catch">{c.ok ? f.icon : "💨"}</span>}
      </div>
      {c.st === "reel" && (
        <div className="mini-bar" aria-hidden>
          <div className="mini-zone" style={{ left: `${(ZONE_AT - f.zone / 2) * 100}%`, width: `${f.zone * 100}%` }} />
          <div className="mini-marker" style={{ left: `${pos * 100}%` }} />
        </div>
      )}
      {c.st === "reel" && <p className="text-xs font-semibold text-[var(--muted)]">{"🟢".repeat(c.hits) + "⚪".repeat(3 - c.hits)}</p>}
      {c.st === "result" ? (
        <>
          <p className="font-bold">{c.ok ? t.caught.replace("{n}", String(f.value)) : t.escaped}</p>
          <button type="button" onClick={next} className="btn-bouncy btn-primary self-start px-5 py-2 text-sm font-bold">
            {c.n >= CASTS ? t.finish : t.next}
          </button>
        </>
      ) : (
        <button type="button" onClick={act} disabled={c.st === "wait"} className="btn-bouncy btn-primary self-start px-6 py-3 text-base font-bold disabled:opacity-50">
          {c.st === "wait" ? t.waiting : c.st === "bite" ? t.hook : t.reel}
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------- sklizeň
const VEG = ["🥕", "🍅", "🌽", "🥔"];
const HARVEST_SECONDS = 30;

function Harvest({ t, onDone }: { t: ReturnType<typeof getTownMiniText>; onDone: Done }) {
  const [holes, setHoles] = useState<(string | null)[]>(Array(9).fill(null));
  const [score, setScore] = useState(0);
  const [left, setLeft] = useState(HARVEST_SECONDS);
  const scoreRef = useRef(0);

  useEffect(() => {
    const tick = window.setInterval(() => setLeft((l) => l - 1), 1000);
    const pop = window.setInterval(() => {
      const i = rnd(9);
      const v = Math.random() < 0.22 ? "🐛" : VEG[rnd(VEG.length)];
      setHoles((h) => h.map((x, j) => (j === i ? v : x)));
      window.setTimeout(() => setHoles((cur) => cur.map((x, j) => (j === i && x === v ? null : x))), 850);
    }, 520);
    return () => {
      window.clearInterval(tick);
      window.clearInterval(pop);
    };
  }, []);
  useEffect(() => {
    if (left <= 0) onDone(scoreRef.current);
  }, [left, onDone]);

  function hit(i: number) {
    const v = holes[i];
    if (!v) return;
    setHoles((h) => h.map((x, j) => (j === i ? null : x)));
    const d = v === "🐛" ? -2 : 1;
    if (d > 0) sfx.pop();
    else sfx.creak();
    scoreRef.current = Math.max(0, scoreRef.current + d);
    setScore(scoreRef.current);
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-bold text-[var(--muted)]">
        ⏱ {Math.max(0, left)} s · 🧺 {score}
      </p>
      <div className="grid grid-cols-3 gap-2">
        {holes.map((v, i) => (
          <button key={i} type="button" onClick={() => hit(i)} aria-label={v ?? "·"} className="mini-hole">
            <span className={v ? "mini-pop" : "opacity-0"}>{v ?? "·"}</span>
          </button>
        ))}
      </div>
      <p className="text-xs text-[var(--muted)]">{t.harvestHint}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------- pekárna
const BAKE = ["🥚", "🥛", "🌾", "🍓"];

function Bakery({ t, onDone }: { t: ReturnType<typeof getTownMiniText>; onDone: Done }) {
  const [seq, setSeq] = useState<number[]>(() => [rnd(4)]);
  const [step, setStep] = useState(0); // kolikátý krok hráč zadává
  const [show, setShow] = useState<number>(-1); // který surovina právě svítí při ukázce
  const [phase, setPhase] = useState<"show" | "input" | "over">("show");
  const doneRef = useRef(false);

  // ukázka pořadí
  useEffect(() => {
    if (phase !== "show") return;
    let i = 0;
    const ids: number[] = [];
    const play = () => {
      if (i >= seq.length) {
        setShow(-1);
        setPhase("input");
        setStep(0);
        return;
      }
      setShow(seq[i]);
      ids.push(window.setTimeout(() => setShow(-1), 420));
      i++;
      ids.push(window.setTimeout(play, 640));
    };
    ids.push(window.setTimeout(play, 500));
    return () => ids.forEach((x) => window.clearTimeout(x));
  }, [phase, seq]);

  const finish = useCallback(
    (score: number) => {
      if (doneRef.current) return;
      doneRef.current = true;
      window.setTimeout(() => onDone(score), 900);
    },
    [onDone],
  );

  function press(i: number) {
    if (phase !== "input") return;
    setShow(i);
    window.setTimeout(() => setShow(-1), 160);
    if (i !== seq[step]) {
      sfx.creak();
      setPhase("over");
      finish(seq.length - 1);
      return;
    }
    sfx.pop();
    if (step + 1 >= seq.length) {
      if (seq.length >= MINI.bakery.maxScore) {
        setPhase("over");
        finish(seq.length);
        return;
      }
      sfx.dock();
      window.setTimeout(() => {
        setSeq((s) => [...s, rnd(4)]);
        setPhase("show");
      }, 600);
      setStep(step + 1);
    } else setStep(step + 1);
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-bold text-[var(--muted)]">
        🥐 {t.round} {seq.length}
      </p>
      <div className="grid grid-cols-2 gap-3">
        {BAKE.map((b, i) => (
          <button key={b} type="button" disabled={phase !== "input"} onClick={() => press(i)} className={`mini-ing ${show === i ? "mini-ing-lit" : ""}`} aria-label={b}>
            {b}
          </button>
        ))}
      </div>
      <p className="text-sm font-semibold">{phase === "show" ? t.watch : phase === "input" ? t.repeat : t.bakeOver.replace("{n}", String(Math.max(0, seq.length - 1)))}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------- rámec
export function MiniGame({ locale, game, left, onClose, onReward }: { locale: Locale; game: MiniId; left: number; onClose: () => void; onReward: () => void }) {
  const t = getTownMiniText(locale);
  const [result, setResult] = useState<{ score: number; points: number; xp: number } | { error: string } | null>(null);
  const [started, setStarted] = useState(false);
  const sent = useRef(false);

  const done = useCallback(
    (score: number) => {
      if (sent.current) return;
      sent.current = true;
      fetch("/api/mestecko/minihra", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ game, score }) })
        .then((r) => r.json())
        .then((d) => {
          if (d.ok) {
            setResult({ score: d.score, points: d.points, xp: d.xp });
            notifyAccountChanged();
            onReward();
          } else setResult({ error: d.error ?? "x" });
        })
        .catch(() => setResult({ error: "x" }));
    },
    [game, onReward],
  );

  const heading = { fontFamily: "var(--font-heading)" } as const;
  if (result) {
    return (
      <div className="flex flex-col items-start gap-3">
        {"error" in result ? (
          <p className="font-semibold">{result.error === "login" ? t.login : result.error === "limit" ? t.noPlays : t.error}</p>
        ) : (
          <>
            <p className="text-2xl font-extrabold" style={heading}>
              {t.score.replace("{n}", String(result.score))}
            </p>
            <div className="flex flex-wrap gap-2">
              {result.points > 0 && <span className="pill bg-[var(--accent-yellow)] px-3 py-1.5 text-sm font-bold text-[#16132b]">+{result.points} {t.points}</span>}
              {result.xp > 0 && <span className="pill bg-[var(--surface-muted)] px-3 py-1.5 text-sm font-bold">+{result.xp} XP</span>}
            </div>
          </>
        )}
        <button type="button" onClick={onClose} className="btn-bouncy btn-primary px-5 py-2 text-sm font-bold">
          {t.close}
        </button>
      </div>
    );
  }
  if (!started) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-sm text-[var(--muted)]">{t.intro[game]}</p>
        <p className="text-xs font-semibold text-[var(--muted)]">{t.playsLeft.replace("{n}", String(left))}</p>
        <button type="button" disabled={left <= 0} onClick={() => setStarted(true)} className="btn-bouncy btn-primary px-6 py-2.5 text-sm font-bold disabled:opacity-50">
          {left > 0 ? t.start : t.noPlays}
        </button>
      </div>
    );
  }
  const common = { t, onDone: done };
  return (
    <div>
      {game === "fishing" && <Fishing {...common} />}
      {game === "harvest" && <Harvest {...common} />}
      {game === "bakery" && <Bakery {...common} />}
    </div>
  );
}
