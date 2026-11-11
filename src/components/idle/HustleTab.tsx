import { useState } from "react";
import {
  HUSTLES,
  HUSTLE_MAX_EXPERIENCE,
  HUSTLE_PHASES,
  hustleChoices,
  hustleDef,
  hustleDue,
  hustleHint,
  hustleRoundAt,
  type EconomyState,
  type HustleId,
  type HustleSlot,
} from "@/lib/idle/economy";
import type { HustleText } from "@/i18n/economy-hustle";
import type { Payload } from "./CompanyPanel";
import { Ico } from "./eco-icons";

const EMOJI: Record<HustleId, string> = {
  lemonade: "🍋",
  reselling: "👕",
  carflip: "🚗",
  houseflip: "🏠",
  startup: "🚀",
  freelance: "💻",
};

type Act = (body: Record<string, unknown>, okText?: (p: Payload) => string) => unknown;

type Props = {
  state: EconomyState;
  clock: number;
  liveCash: number;
  busy: boolean;
  t: HustleText;
  m: (n: number) => string;
  fill: (text: string, vars: Record<string, string | number>) => string;
  // čas v textu: pod dvěma minutami sekundy, jinak běžný formát
  left: (ms: number) => string;
  // násobek s dvěma desetinnými místy podle jazyka
  x: (n: number) => string;
  act: Act;
};

// Graf rozsahu volby: pás od nejnižšího po nejvyšší výsledek na škále 0,4–2,0, čára na ×1,00 (bez zisku, bez ztráty).
function RangeBar({ lo, hi }: { lo: number; hi: number }) {
  const at = (v: number) => (Math.min(2, Math.max(0.4, v)) - 0.4) / 1.6 * 100;
  const isWin = lo >= 1;
  return (
    <svg viewBox="0 0 100 10" preserveAspectRatio="none" className="h-2.5 w-full" aria-hidden>
      <rect x="0" y="0" width="100" height="10" rx="3" fill="var(--surface-muted)" />
      <rect x={at(lo)} y="0" width={Math.max(1, at(hi) - at(lo))} height="10" rx="3" fill={isWin ? "var(--accent-green)" : hi < 1 ? "var(--danger)" : "var(--accent-yellow)"} />
      <line x1={at(1)} x2={at(1)} y1="0" y2="10" stroke="var(--edge)" strokeWidth="1.2" strokeDasharray="2 2" />
    </svg>
  );
}

// Vývoj hodnoty: začíná na ×1,00 a každá vyřešená fáze posune křivku o její násobek.
function Trajectory({ log }: { log: number[] }) {
  const pts: number[] = [1];
  for (const v of log) pts.push(pts[pts.length - 1] * v);
  const lo = Math.min(0.6, ...pts);
  const hi = Math.max(1.4, ...pts);
  const y = (v: number) => 40 - ((v - lo) / (hi - lo)) * 40;
  const line = pts.map((v, i) => `${(i / Math.max(1, pts.length - 1)) * 100},${y(v).toFixed(1)}`).join(" ");
  const last = pts[pts.length - 1];
  return (
    <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="h-14 w-full" aria-hidden>
      <line x1="0" x2="100" y1={y(1)} y2={y(1)} stroke="var(--edge)" strokeWidth="1" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
      <polyline points={line} fill="none" stroke={last >= 1 ? "var(--accent-green)" : "var(--danger)"} strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

// Tečky zkušenosti (0–5).
function Dots({ n }: { n: number }) {
  return (
    <span className="inline-flex gap-1" aria-hidden>
      {Array.from({ length: HUSTLE_MAX_EXPERIENCE }, (_, i) => (
        <span key={i} className={`h-2 w-2 rounded-full ${i < n ? "bg-[var(--brand-500)]" : "bg-[var(--surface-muted)]"}`} />
      ))}
    </span>
  );
}

export function HustleTab({ state, clock, liveCash, busy, t, m, fill, left, x, act }: Props) {
  const [openStart, setOpenStart] = useState<HustleId | null>(null);
  const [stakes, setStakes] = useState<Partial<Record<HustleId, number>>>({});
  const [topUps, setTopUps] = useState<Partial<Record<HustleId, number>>>({});

  const running = HUSTLES.filter((h) => state.hustle[h.id]);
  const runningValue = running.reduce((sum, h) => sum + (state.hustle[h.id]?.value ?? 0), 0);
  const runningStake = running.reduce((sum, h) => sum + (state.hustle[h.id]?.stake ?? 0), 0);
  const dueCount = running.filter((h) => hustleDue(state.hustle[h.id], h.id, clock)).length;
  const experience = Object.values(state.knowledge).reduce((sum, n) => sum + (n ?? 0), 0);

  const phaseLeft = (slot: NonNullable<HustleSlot>, id: HustleId) => Math.max(0, hustleRoundAt(slot, id, slot.round) - clock);

  return (
    <section className="flex flex-col gap-5">
      <p className="text-sm text-[var(--muted)]">{t.intro}</p>

      {/* Hrdina: čísla celé sekce na první pohled */}
      <div className="card grid grid-cols-2 gap-4 p-5 md:grid-cols-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--muted)]">{t.value}</p>
          <p className="text-2xl font-bold">{m(runningValue)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--muted)]">{t.stakeTotal}</p>
          <p className="text-2xl font-bold">{m(runningStake)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--muted)]">{t.running}</p>
          <p className="text-2xl font-bold">
            {running.length} {dueCount > 0 && <span className="text-base text-[var(--accent-yellow)]">· {dueCount} <Ico e="✓" /></span>}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--muted)]">{t.chips.experience}</p>
          <p className="text-2xl font-bold">{experience}</p>
        </div>
      </div>

      {/* Běžící projekty */}
      <div className="flex flex-col gap-4">
        {running.length === 0 && <p className="card p-6 text-center text-[var(--muted)]">{t.none}</p>}
        {running.map((h) => {
          const slot = state.hustle[h.id]!;
          const def = hustleDef(h.id);
          const due = hustleDue(slot, h.id, clock);
          const exp = state.knowledge[h.id] ?? 0;
          const profit = slot.value - slot.stake;
          const last = slot.round === HUSTLE_PHASES - 1;
          const choices = due ? hustleChoices(slot, h.id) : [];
          const hint = due && last ? hustleHint(slot, h.id, exp) : null;
          const topUp = topUps[h.id] ?? 0;
          const canTopUp = topUp >= 1 && liveCash >= topUp;
          return (
            <article key={h.id} className={`card flex flex-col gap-4 p-5 ${due ? "ring-2 ring-[var(--accent-yellow)]" : ""}`}>
              <header className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-4xl" aria-hidden><Ico e={EMOJI[h.id]} /></span>
                  <div>
                    <h3 className="text-lg font-bold">{t.names[h.id]}</h3>
                    <p className="text-sm text-[var(--muted)]">{t.phases[slot.round] ?? ""} · {fill(t.phaseOf, { n: Math.min(slot.round + 1, HUSTLE_PHASES) })}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{m(slot.value)}</p>
                  <p className={`text-sm font-bold ${profit >= 0 ? "text-[var(--accent-green)]" : "text-[var(--danger)]"}`}>
                    {profit >= 0 ? "▲" : "▼"} {m(Math.abs(profit))}
                  </p>
                </div>
              </header>

              <Trajectory log={slot.log} />

              {/* Časová osa fází */}
              <ol className="grid grid-cols-3 gap-2">
                {t.phases.map((name, i) => {
                  const done = i < slot.round;
                  const current = i === slot.round;
                  const mult = slot.log[i];
                  return (
                    <li key={name} className="flex flex-col items-center gap-1 text-center">
                      <span
                        className={`grid h-9 w-9 place-items-center rounded-full text-sm font-bold ${
                          done
                            ? "bg-[var(--accent-green)] text-[#16132b]"
                            : current && due
                              ? "bg-[var(--accent-yellow)] text-[#16132b]"
                              : "bg-[var(--surface-muted)] text-[var(--muted)]"
                        }`}
                      >
                        {done ? <Ico e="✓" /> : i + 1}
                      </span>
                      <span className="text-xs font-bold">{name}</span>
                      <span className="min-h-4 text-xs text-[var(--muted)]">{done && mult !== undefined ? `×${x(mult)}` : ""}</span>
                    </li>
                  );
                })}
              </ol>

              {due ? (
                <div className="flex flex-col gap-3 rounded-lg bg-[var(--surface-muted)] p-4">
                  <p className="font-bold">
                    {t.situations[h.id][slot.round]}
                  </p>
                  {hint && (
                    <p className="text-sm font-semibold">{hint.up ? <><Ico e="📈" /> {t.hintUp}</> : <><Ico e="📉" /> {t.hintDown}</>}</p>
                  )}
                  {last && !hint && <p className="text-sm text-[var(--muted)]">{exp > 0 ? t.marketHidden : t.hintNone}</p>}
                  <div className="grid gap-2 sm:grid-cols-2">
                    {choices.map((c) => {
                      const name = c.event ? t.event[0] : t.options[h.id][slot.round][c.index][0];
                      const hintText = c.event ? t.event[1] : t.options[h.id][slot.round][c.index][1];
                      return (
                        <button
                          key={c.index}
                          type="button"
                          disabled={busy}
                          onClick={() => void act({ action: "decideHustle", id: h.id, option: c.index }, last ? (p) => decisionText(p, t, fill, m) : undefined)}
                          className="btn-bouncy flex flex-col gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-left disabled:opacity-45"
                        >
                          <span className="flex items-center justify-between gap-2">
                            <span className="font-bold">{c.event ? <><Ico e="✨" />{" "}</> : null}{name}</span>
                            {c.cost > 0 && <span className="text-xs text-[var(--muted)]">−{Math.round(c.cost * 100)} %</span>}
                          </span>
                          <span className="text-xs text-[var(--muted)]">{hintText}</span>
                          <RangeBar lo={c.lo} hi={c.hi} />
                          <span className="text-xs font-semibold">{fill(t.range, { lo: x(c.lo), hi: x(c.hi) })}</span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-[var(--muted)]">{t.breakEven}</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--surface-muted)]">
                    <div
                      className="h-full bg-[var(--brand-500)] transition-[width]"
                      style={{ width: `${Math.min(100, (1 - phaseLeft(slot, h.id) / (def.gapSec * 1000)) * 100)}%` }}
                    />
                  </div>
                  <p className="text-sm text-[var(--muted)]">{fill(t.next, { t: phaseLeft(slot, h.id) < 120_000 ? fill(t.sec, { n: Math.ceil(phaseLeft(slot, h.id) / 1000) }) : left(phaseLeft(slot, h.id)) })}</p>
                </div>
              )}

              <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-3">
                <div className="flex flex-wrap gap-3 text-xs text-[var(--muted)]">
                  <span>{t.stakeTotal}: <b className="text-[var(--ink)]">{m(slot.stake)}</b></span>
                  {slot.streak > 0 && <span><Ico e="🔥" /> {fill(t.streak, { n: slot.streak })}</span>}
                  <span className="flex items-center gap-1.5">{t.chips.experience}: <Dots n={exp} /></span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    step={1}
                    disabled={busy}
                    aria-label={t.stakeLabel}
                    value={topUp || ""}
                    onChange={(e) => setTopUps((prev) => ({ ...prev, [h.id]: Math.max(0, Math.floor(Number(e.target.value)) || 0) }))}
                    className="w-24 rounded-lg border border-[var(--border)] bg-transparent px-2.5 py-1.5 text-sm"
                  />
                  <button
                    type="button"
                    disabled={busy || !canTopUp}
                    onClick={() => void act({ action: "topUpHustle", id: h.id, stake: topUp })}
                    className="btn-bouncy rounded-lg bg-[var(--brand-500)] px-3 py-1.5 text-sm font-bold text-white disabled:opacity-45"
                  >
                    {fill(t.topUp, { n: m(topUp) })}
                  </button>
                </div>
              </footer>
            </article>
          );
        })}
      </div>

      {/* Spustit nový projekt */}
      <div className="flex flex-col gap-3">
        <h3 className="text-lg font-bold">{t.startTitle}</h3>
        <div className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {HUSTLES.map((h) => {
            const locked = state.edu < h.edu;
            const busyHere = !!state.hustle[h.id];
            const open = openStart === h.id;
            const exp = state.knowledge[h.id] ?? 0;
            const stake = stakes[h.id] ?? h.cost;
            const canAfford = stake >= 1 && liveCash >= stake;
            const totalMin = (h.gapSec * HUSTLE_PHASES) / 60;
            return (
              <article key={h.id} className={`card flex flex-col gap-3 p-5 ${locked ? "opacity-70" : ""}`}>
                <div className="flex items-start gap-3">
                  <span className="text-4xl" aria-hidden><Ico e={EMOJI[h.id]} /></span>
                  <div className="min-w-0">
                    <h4 className="font-bold">{t.names[h.id]}</h4>
                    <p className="text-sm text-[var(--muted)]">{t.desc[h.id]}</p>
                  </div>
                </div>
                <dl className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-[var(--surface-muted)] p-2">
                    <dt className="text-[var(--muted)]">{t.chips.stake}</dt>
                    <dd className="font-bold">{m(h.cost)}</dd>
                  </div>
                  <div className="rounded-lg bg-[var(--surface-muted)] p-2">
                    <dt className="text-[var(--muted)]">{t.chips.time}</dt>
                    <dd className="font-bold">{totalMin < 1 ? fill(t.sec, { n: h.gapSec * HUSTLE_PHASES }) : left(totalMin * 60_000)}</dd>
                  </div>
                  <div className="rounded-lg bg-[var(--surface-muted)] p-2">
                    <dt className="text-[var(--muted)]">{t.chips.commission}</dt>
                    <dd className="font-bold">{h.commission > 0 ? `${Math.round(h.commission * 100)} %` : "0 %"}</dd>
                  </div>
                  <div className="rounded-lg bg-[var(--surface-muted)] p-2">
                    <dt className="text-[var(--muted)]">{t.chips.risk}</dt>
                    <dd className="font-bold">{h.scam > 0 ? `${Math.round(h.scam * 100)} %` : "0 %"}</dd>
                  </div>
                </dl>
                <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                  <span className="flex items-center gap-1.5">{t.chips.experience}: <Dots n={exp} /></span>
                  {h.upkeep > 0 && <span>{t.chips.upkeep}: {Math.round(h.upkeep * 100)} %</span>}
                </div>
                {locked && <p className="text-sm font-bold"><Ico e="🔒" /> {fill(t.locked, { n: h.edu })}</p>}
                {!locked && (
                  <>
                    <button
                      type="button"
                      aria-expanded={open}
                      disabled={busy || busyHere}
                      onClick={() => setOpenStart(open ? null : h.id)}
                      className="btn-bouncy rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-bold disabled:opacity-45"
                    >
                      {busyHere ? <><Ico e="✓" /> {t.running}</> : open ? <><Ico e="▲" /> {t.openCard}</> : <><Ico e="▼" /> {t.openCard}</>}
                    </button>
                    {open && !busyHere && (
                      <div className="flex flex-col gap-2 border-t border-[var(--border)] pt-3">
                        <div className="flex gap-1.5">
                          <input
                            type="number"
                            inputMode="numeric"
                            min={1}
                            step={1}
                            disabled={busy}
                            aria-label={t.stakeLabel}
                            value={stake || ""}
                            onChange={(e) => setStakes((prev) => ({ ...prev, [h.id]: Math.max(0, Math.floor(Number(e.target.value)) || 0) }))}
                            className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-transparent px-2.5 py-1.5 text-sm"
                          />
                          <button
                            type="button"
                            disabled={busy || liveCash < 1}
                            onClick={() => setStakes((prev) => ({ ...prev, [h.id]: Math.floor(liveCash) }))}
                            className="rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-xs font-bold disabled:opacity-45"
                          >
                            {t.all}
                          </button>
                        </div>
                        <button
                          type="button"
                          disabled={busy || !canAfford}
                          onClick={() => void act({ action: "startHustle", id: h.id, stake })}
                          className="btn-bouncy bg-[var(--brand-500)] px-3 py-2 text-sm font-bold text-white disabled:opacity-45"
                        >
                          {fill(t.startBtn, { n: m(stake) })}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Výsledek po posledním rozhodnutí: zisk nebo ztráta a případný zásah rizika.
function decisionText(p: Payload, t: HustleText, fill: Props["fill"], m: Props["m"]): string {
  const profit = p.gained?.profit ?? 0;
  const lost = (p as Payload & { hustle?: { lost: boolean } }).hustle?.lost;
  const base = profit >= 0 ? fill(t.profitText, { n: m(profit) }) : fill(t.lossText, { n: m(-profit) });
  return lost ? `${t.lostTotal} ${t.lostText} ${base}` : base;
}

