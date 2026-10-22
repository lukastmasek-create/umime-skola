"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { PetArt } from "@/components/idle/PetArt";
import { PetView } from "@/components/idle/PetView";
import type { PetAction } from "@/lib/pets3d";
import { fillN, getPetText } from "@/i18n/pets";
import {
  HAPPY_DECAY_PER_HOUR,
  MAX_UPGRADE_LEVEL,
  PLAY_COOLDOWN_MS,
  SPECIES,
  TREAT_POINTS_COST,
  UPGRADES,
  feedCost,
  hungerDecayPerHour,
  levelFromGrowth,
  moodOf,
  stageFromLevel,
  upgradeCost,
  type ErrorCode,
  type LevelInfo,
  type PetGameState,
} from "@/lib/idle/pets";
import { notifyAccountChanged } from "@/lib/account-events";
import { SHOP_ITEMS } from "@/lib/shop";
import type { Locale } from "@/i18n/config";

type Payload = {
  state: PetGameState;
  points: number;
  accessories: string[];
  learningBonus: number;
  now: number;
  incomePerHour: number;
  offlineCapHours: number;
  level: LevelInfo | null;
};

type View = { data: Payload; receivedAt: number };
type Load = "loading" | "login" | "unavailable" | "ready";

const SYNC_EVERY_MS = 60_000;

function clamp(value: number) {
  return Math.max(0, Math.min(100, value));
}

function Bar({ value, color, label }: { value: number; color: string; label: string }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs font-semibold text-[var(--muted)]">
        <span>{label}</span>
        <span>{Math.round(value)} %</span>
      </div>
      <div
        className="h-3.5 overflow-hidden rounded-full border-2 border-[var(--edge)] bg-[var(--surface-muted)]"
        role="progressbar"
        aria-valuenow={Math.round(value)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div className="h-full" style={{ width: `${value}%`, background: color, transition: "width 0.4s ease" }} />
      </div>
    </div>
  );
}

export function PetGame({ locale }: { locale: Locale }) {
  const t = getPetText(locale);
  const [view, setView] = useState<View | null>(null);
  const [load, setLoad] = useState<Load>("loading");
  const [nowMs, setNowMs] = useState(0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState("");
  // Poslední úspěšná akce, kterou 3D mazlíček přehraje (krmení, hraní, pamlsek).
  const [petAction, setPetAction] = useState<{ id: number; kind: PetAction } | null>(null);

  const apply = useCallback((data: Payload) => {
    const now = Date.now();
    setView({ data, receivedAt: now });
    setNowMs(now);
    setLoad("ready");
  }, []);

  const sync = useCallback(async () => {
    try {
      const res = await fetch("/api/stale-hry/mazlicci");
      if (res.status === 401) {
        setLoad("login");
        return;
      }
      if (!res.ok) {
        setLoad((current) => (current === "ready" ? current : "unavailable"));
        return;
      }
      apply(await res.json());
    } catch {
      setLoad((current) => (current === "ready" ? current : "unavailable"));
    }
  }, [apply]);

  useEffect(() => {
    const first = window.setTimeout(sync, 0);
    const id = window.setInterval(sync, SYNC_EVERY_MS);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, [sync]);

  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  function showMessage(text: string) {
    setMessage(text);
    window.setTimeout(() => setMessage((m) => (m === text ? null : m)), 3500);
  }

  async function act(body: Record<string, unknown>) {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/stale-hry/mazlicci", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const code = (json.error as ErrorCode | "conflict" | undefined) ?? "generic";
        showMessage((t.errors[code] ?? t.errors.generic) + (json.detail ? ` (${json.detail})` : ""));
        if (code === "conflict") void sync();
        return;
      }
      apply(json);
      const kind: PetAction | null = body.action === "feed" ? "feed" : body.action === "play" ? "play" : body.action === "treat" ? "joy" : null;
      if (kind) setPetAction((prev) => ({ id: (prev?.id ?? 0) + 1, kind }));
      if (body.action === "treat" || body.action === "adopt") notifyAccountChanged();
      if (body.action === "rename") setNameDraft("");
    } catch {
      showMessage(t.errors.generic);
    } finally {
      setBusy(false);
    }
  }

  const header = (
    <>
      <Link href={`/${locale}/stale-hry`} className="mb-4 inline-block text-sm font-semibold text-[var(--faint)] hover:text-[var(--foreground)]">
        {t.back}
      </Link>
      <h1 className="mb-1 text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
        🐾 {t.title}
      </h1>
      <p className="mb-8 max-w-2xl text-[var(--muted)]">{t.subtitle}</p>
    </>
  );

  if (load === "loading") {
    return (
      <div>
        {header}
        <div className="card h-64 animate-pulse bg-[var(--surface-muted)]" aria-label={t.loading} />
      </div>
    );
  }

  if (load === "login") {
    return (
      <div>
        {header}
        <div className="card flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[var(--muted)]">{t.loginRequired}</p>
          <Link href={`/${locale}/prihlaseni`} className="btn-bouncy bg-[var(--brand-500)] px-5 py-2.5 text-sm font-bold text-white">
            {t.login}
          </Link>
        </div>
      </div>
    );
  }

  if (load === "unavailable" || !view) {
    return (
      <div>
        {header}
        <div className="card p-6 text-[var(--muted)]">{t.unavailable}</div>
      </div>
    );
  }

  const { data, receivedAt } = view;
  const state = data.state;
  const hoursSince = Math.max(0, (nowMs - receivedAt) / 3_600_000);
  const toastEl = message && (
    <div role="status" className="pill fixed inset-x-0 bottom-6 z-50 mx-auto w-fit bg-[var(--danger)] px-4 py-2 text-sm text-white shadow-lg">
      {message}
    </div>
  );

  const speciesPicker = (title: string, hint?: string) => (
    <section className="card p-5">
      <h2 className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>
        {title}
      </h2>
      {hint && <p className="mb-4 mt-1 text-sm text-[var(--muted)]">{hint}</p>}
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {SPECIES.map((s) => {
          const owned = !!state.pets[s.id];
          const affordable = data.points >= s.pointsCost;
          const isActive = state.active === s.id;
          const disabled = busy || isActive || (!owned && !affordable);
          return (
            <div
              key={s.id}
              className={`flex flex-col items-center gap-1 rounded-2xl border-2 p-3 text-center ${
                isActive ? "border-[var(--accent-500)] bg-[var(--surface-muted)]" : "border-[var(--border-soft)]"
              }`}
            >
              <PetArt species={s.id} stage={2} mood="happy" size={92} />
              <p className="font-bold">{t.species[s.id]}</p>
              <p className="text-xs text-[var(--muted)]">
                {owned ? "✓" : s.pointsCost === 0 ? t.free : fillN(t.pointsCost, s.pointsCost)}
              </p>
              <button
                type="button"
                disabled={disabled}
                onClick={() => act({ action: "adopt", species: s.id })}
                className="btn-bouncy mt-1 w-full bg-[var(--brand-500)] px-2 py-1.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isActive ? "●" : !owned && !affordable ? fillN(t.needPoints, s.pointsCost - data.points) : owned ? t.switchPet : t.adopt}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );

  if (!state.active || !state.pets[state.active]) {
    return (
      <div>
        {header}
        {speciesPicker(t.chooseTitle, t.chooseHint)}
        {toastEl}
      </div>
    );
  }

  const stats = state.pets[state.active]!;
  const hunger = clamp(stats.hunger - hungerDecayPerHour(state) * hoursSince);
  const happy = clamp(stats.happy - HAPPY_DECAY_PER_HOUR * hoursSince);
  const level = data.level ?? { level: levelFromGrowth(stats.growth), percent: 0, intoLevel: 0, needed: 0, maxed: false };
  const mood = moodOf({ ...stats, hunger, happy });
  const coins = Math.floor(state.coins + data.incomePerHour * hoursSince);
  const serverNow = data.now + (nowMs - receivedAt);
  const cooldownLeft = Math.max(0, Math.ceil((state.lastPlayAt + PLAY_COOLDOWN_MS - serverNow) / 1000));
  const feedPrice = feedCost(level.level);
  const bonusPercent = Math.round(data.learningBonus * 100);

  return (
    <div>
      {header}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section className="card flex flex-col items-center gap-3 p-5 text-center">
          <PetView
            species={state.active}
            stage={stageFromLevel(level.level)}
            mood={mood}
            maxed={level.maxed}
            accessory={stats.accessory}
            action={petAction}
            label={stats.name || t.species[state.active]}
          />
          <p className="text-xl font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>
            {stats.name || t.species[state.active]}
          </p>
          <p className="pill bg-[var(--surface-muted)] px-3 py-1 text-sm">{t.mood[mood]}</p>
          <form
            className="mt-1 flex w-full max-w-xs gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (nameDraft.trim()) void act({ action: "rename", name: nameDraft });
            }}
          >
            <input
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              maxLength={16}
              placeholder={t.namePlaceholder}
              aria-label={t.rename}
              className="min-w-0 flex-1 rounded-lg border-2 border-[var(--border-soft)] px-3 py-1.5 text-sm outline-none focus:border-[var(--brand-500)]"
            />
            <button
              type="submit"
              disabled={busy || !nameDraft.trim()}
              className="btn-bouncy bg-[var(--surface)] px-3 py-1.5 text-sm font-semibold disabled:opacity-40"
            >
              {t.save}
            </button>
          </form>
        </section>

        <section className="card flex flex-col gap-4 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="pill bg-[var(--accent-yellow)] px-3 py-1.5 text-sm text-[#16132b]">
              🪙 {coins.toLocaleString(locale)} {t.coins}
            </span>
            <span className="pill bg-[var(--surface-muted)] px-3 py-1.5 text-sm">
              ⭐ {data.points.toLocaleString(locale)} {t.points}
            </span>
          </div>

          <div>
            <div className="flex items-baseline justify-between text-sm font-bold">
              <span>
                {t.level} {level.level}
              </span>
              <span className="text-xs font-semibold text-[var(--muted)]">
                {level.maxed ? t.maxLevel : fillN(t.toNext, level.needed - level.intoLevel)}
              </span>
            </div>
            <div
              className="mt-1 h-3.5 overflow-hidden rounded-full border-2 border-[var(--edge)] bg-[var(--surface-muted)]"
              role="progressbar"
              aria-valuenow={level.percent}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className="h-full bg-[var(--brand-500)]" style={{ width: `${level.percent}%`, transition: "width 0.4s ease" }} />
            </div>
          </div>

          <Bar value={hunger} color={hunger < 25 ? "var(--danger)" : "var(--accent-green)"} label={t.hunger} />
          <Bar value={happy} color={happy < 30 ? "var(--danger)" : "var(--accent-blue)"} label={t.happy} />

          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="pill bg-[var(--surface-muted)] px-3 py-1.5">{fillN(t.perHour, Math.round(data.incomePerHour))}</span>
            {bonusPercent > 0 && (
              <span className="pill bg-[var(--accent-green)] px-3 py-1.5 text-[#16132b]" title={t.learningHint}>
                📚 {fillN(t.learningBonus, bonusPercent)}
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--faint)]">
            {fillN(t.offlineNote, data.offlineCapHours)} {t.learningHint}
          </p>

          <div className="grid gap-2 sm:grid-cols-3">
            <button
              type="button"
              disabled={busy || coins < feedPrice}
              onClick={() => act({ action: "feed" })}
              className="btn-bouncy bg-[var(--brand-500)] px-3 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              🍖 {fillN(t.feed, feedPrice)}
            </button>
            <button
              type="button"
              disabled={busy || cooldownLeft > 0}
              onClick={() => act({ action: "play" })}
              className="btn-bouncy bg-[var(--accent-500)] px-3 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              🎾 {cooldownLeft > 0 ? fillN(t.playIn, cooldownLeft) : t.play}
            </button>
            <button
              type="button"
              disabled={busy || data.points < TREAT_POINTS_COST}
              onClick={() => act({ action: "treat" })}
              title={t.treatHint}
              className="btn-bouncy bg-[var(--accent-yellow)] px-3 py-2.5 text-sm font-bold text-[#16132b] disabled:cursor-not-allowed disabled:opacity-40"
            >
              🍰 {fillN(t.treat, TREAT_POINTS_COST)}
            </button>
          </div>
        </section>
      </div>

      <section className="card mt-5 p-5">
        <h2 className="mb-3 text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          {t.upgradesTitle}
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {UPGRADES.map((id) => {
            const lvl = state.upgrades[id];
            const maxed = lvl >= MAX_UPGRADE_LEVEL;
            const cost = upgradeCost(lvl);
            return (
              <div key={id} className="rounded-xl border-2 border-[var(--border-soft)] bg-[var(--surface-muted)] p-3 text-sm">
                <p className="font-bold">
                  {t.upgrades[id].name}{" "}
                  <span className="text-xs font-semibold text-[var(--muted)]">
                    {t.upgradeLevel} {lvl}/{MAX_UPGRADE_LEVEL}
                  </span>
                </p>
                <p className="mb-2 text-xs text-[var(--muted)]">{t.upgrades[id].effect}</p>
                <button
                  type="button"
                  disabled={busy || maxed || coins < cost}
                  onClick={() => act({ action: "upgrade", upgrade: id })}
                  className="btn-bouncy w-full bg-[var(--brand-500)] px-3 py-1.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {maxed ? t.maxed : `🪙 ${fillN(t.buy, cost)}`}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <section className="card mt-5 p-5">
        <h2 className="mb-3 text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          {t.accessoriesTitle}
        </h2>
        <div className="flex flex-wrap gap-2">
          {[null, ...data.accessories].map((ref) => {
            const item = ref ? SHOP_ITEMS.find((i) => i.kind === "pet" && i.ref === ref) : null;
            const active = (stats.accessory ?? null) === ref;
            return (
              <button
                key={ref ?? "none"}
                type="button"
                disabled={busy}
                onClick={() => act({ action: "accessory", accessory: ref })}
                aria-pressed={active}
                className={`flex items-center gap-2 rounded-xl border-2 px-2 py-1.5 text-sm font-semibold ${
                  active ? "border-[var(--accent-500)] bg-[var(--surface-muted)]" : "border-[var(--border-soft)] hover:border-[var(--edge)]"
                }`}
              >
                <PetArt species={state.active!} stage={2} mood="happy" size={44} accessory={ref} />
                {item ? item.names[locale] : t.noAccessory}
              </button>
            );
          })}
        </div>
        <Link href={`/${locale}/uzivatelsky-obchod`} className="mt-3 inline-block text-sm font-semibold text-[var(--brand-600)] hover:underline">
          {t.getMore} →
        </Link>
      </section>

      <div className="mt-5">{speciesPicker(t.switchPet)}</div>
      {toastEl}
    </div>
  );
}
