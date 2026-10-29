"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { LevelBadge } from "@/components/LevelBadge";
import { ProfileCollection } from "@/components/ProfileCollection";
import { ProfileShowcase } from "@/components/ProfileShowcase";
import { SubjectMedals } from "@/components/SubjectMedals";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { AVATARS, getAvatar, isAvatarUnlocked } from "@/lib/avatars";
import { TITLES, getTitle, isTitleUnlocked } from "@/lib/titles";
import { BANNERS, EMPTY_FAVORITES, FRAME_IDS, bannerAttrs, bannerCss, bannerLiveAttrs, isFrameId, type FavoriteKind, type Favorites, type FrameId } from "@/lib/cosmetics";
import { unlockHint } from "@/lib/unlock-hints";
import { SHOP_ITEMS } from "@/lib/shop";
import {
  EMPTY_CUSTOM,
  PALETTE,
  PATTERNS,
  SLOTS,
  TOGGLES,
  normalizeCustom,
  type AvatarCustom,
  type AvatarParts,
  type Slot,
  type Toggle,
} from "@/lib/avatar-custom";
import { fill, getProfileText } from "@/i18n/profile";
import { getCustomText } from "@/i18n/avatar-custom";
import { notifyAccountChanged } from "@/lib/account-events";
import type { Locale } from "@/i18n/config";

type Profile = {
  loggedIn: boolean;
  degraded?: boolean;
  name?: string | null;
  avatar?: string;
  title?: string | null;
  frame?: string | null;
  banner?: string | null;
  custom?: Record<string, AvatarCustom>;
  favorites?: Favorites;
  unlocks?: string[];
  points?: number;
  school?: { name: string; city: string } | null;
  level?: number;
  xp?: number;
  intoLevel?: number;
  neededForNext?: number;
  percent?: number;
  rank?: number | null;
  players?: number | null;
  pets?: { owned: number; active: string | null; name: string; level: number } | null;
  city?: { buildings: number; population: number } | null;
};

type Tab = "look" | "avatars" | "titles" | "frames" | "banners";

const DEFAULT_BANNER = "linear-gradient(135deg, #5a6cff 0%, #7a5cff 55%, #ff6f91 100%)";

// Úroveň jako zlatý prstenec: oblouk se při načtení plynule vyplní na aktuální procento (čisté CSS).
function XpRing({ level, percent, label }: { level: number; percent: number; label: string }) {
  const r = 46;
  const c = 2 * Math.PI * r;
  const off = c * (1 - Math.max(0, Math.min(100, percent)) / 100);
  return (
    <div className="relative h-[112px] w-[112px] shrink-0">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden>
        <defs>
          <linearGradient id="xpg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffd23a" />
            <stop offset="100%" stopColor="#ff7a3c" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r={r} fill="none" stroke="#16132b" strokeOpacity="0.12" strokeWidth="12" />
        <circle cx="60" cy="60" r={r + 7} fill="none" stroke="#16132b" strokeOpacity="0.2" strokeWidth="1.5" strokeDasharray="2 6" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="url(#xpg)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={c}
          className="xp-ring-arc"
          style={{ ["--c" as string]: c, ["--o" as string]: off }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold leading-none" style={{ fontFamily: "var(--font-heading)" }}>
          {level}
        </span>
        <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide opacity-70">{label}</span>
      </div>
    </div>
  );
}

function itemName(kind: "frame" | "banner", ref: string, locale: Locale) {
  return SHOP_ITEMS.find((i) => i.kind === kind && i.ref === ref)?.names[locale] ?? ref;
}

export function ProfileView({ locale }: { locale: Locale }) {
  const t = getProfileText(locale);
  const c = getCustomText(locale);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("look");
  const [parts, setParts] = useState<{ avatar: string; parts: AvatarParts } | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/profil");
        const data = await res.json();
        if (!cancelled) setProfile(data);
      } catch {
        if (!cancelled) setProfile({ loggedIn: false });
      }
    }
    load();
    return () => {
      cancelled = true;
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  async function post(key: string, body: unknown, apply: (p: Profile) => Profile) {
    setError(false);
    setSaving(key);
    try {
      const res = await fetch("/api/profil", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      setProfile((p) => (p ? apply(p) : p));
      notifyAccountChanged();
    } catch {
      setError(true);
    }
    setSaving(null);
  }

  const favorites: Favorites = profile?.favorites ?? EMPTY_FAVORITES;

  // Hvězdička se projeví hned, na server se uloží na pozadí a při chybě se vrátí zpět.
  async function toggleFavorite(kind: FavoriteKind, id: string, on: boolean) {
    setError(false);
    const withList = (p: Profile, list: string[]): Profile => ({ ...p, favorites: { ...(p.favorites ?? EMPTY_FAVORITES), [kind]: list } });
    const before = favorites[kind];
    const optimistic = on ? [...before.filter((x) => x !== id), id] : before.filter((x) => x !== id);
    setProfile((p) => (p ? withList(p, optimistic) : p));
    try {
      const res = await fetch("/api/profil", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ favorite: { kind, id, on } }),
      });
      if (!res.ok) throw new Error();
      const json = await res.json();
      setProfile((p) => (p && json.favorites ? { ...p, favorites: json.favorites } : p));
      notifyAccountChanged();
    } catch {
      setProfile((p) => (p ? withList(p, before) : p));
      setError(true);
    }
  }

  const avatarId = profile?.avatar ?? "robot";
  const custom = profile?.custom?.[avatarId] ?? EMPTY_CUSTOM;

  // Úpravy vzhledu se ukazují hned a na server se posílají se zpožděním.
  const updateCustom = useCallback(
    (patch: (c: AvatarCustom) => AvatarCustom) => {
      setProfile((p) => {
        if (!p) return p;
        const id = p.avatar ?? "robot";
        const next = normalizeCustom(patch(p.custom?.[id] ?? EMPTY_CUSTOM));
        if (saveTimer.current) clearTimeout(saveTimer.current);
        setSaveState("saving");
        saveTimer.current = setTimeout(async () => {
          try {
            const res = await fetch("/api/profil", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ customFor: id, custom: next }),
            });
            if (!res.ok) throw new Error();
            setSaveState("saved");
          } catch {
            setSaveState("idle");
            setError(true);
          }
        }, 600);
        return { ...p, custom: { ...p.custom, [id]: next } };
      });
    },
    [],
  );

  if (!profile) return null;

  if (!profile.loggedIn) {
    return (
      <div className="card p-8 text-center">
        <p className="mb-3 text-[var(--muted)]">{t.loginRequired}</p>
        <Link
          href={`/${locale}/prihlaseni`}
          className="btn-bouncy inline-block bg-[var(--brand-500)] px-5 py-2 text-sm font-bold text-white"
        >
          →
        </Link>
      </div>
    );
  }

  const level = profile.level ?? 1;
  const unlocks = profile.unlocks ?? [];
  const remaining = (profile.neededForNext ?? 0) - (profile.intoLevel ?? 0);
  const frame: FrameId | null = isFrameId(profile.frame) ? profile.frame : null;
  const banner = profile.banner && BANNERS[profile.banner] ? bannerCss(profile.banner) : DEFAULT_BANNER;
  const ownedFrames = FRAME_IDS.filter((f) => unlocks.includes(`frame:${f}`));
  const ownedBanners = Object.keys(BANNERS).filter((b) => unlocks.includes(`banner:${b}`));
  const unlockedCount =
    AVATARS.filter((a) => isAvatarUnlocked(a, level, unlocks)).length +
    TITLES.filter((x) => isTitleUnlocked(x, level, unlocks)).length +
    ownedFrames.length +
    ownedBanners.length;
  const currentParts = parts?.avatar === avatarId ? parts.parts : null;
  const heading = { fontFamily: "var(--font-heading)" };

  const tabs: { id: Tab; label: string }[] = [
    { id: "look", label: c.tab },
    { id: "avatars", label: t.avatars },
    { id: "titles", label: t.titles },
    { id: "frames", label: t.frames },
    { id: "banners", label: t.banners },
  ];

  function randomize() {
    const pick = () => PALETTE[Math.floor(Math.random() * PALETTE.length)];
    updateCustom((cur) => ({
      ...cur,
      colors: Object.fromEntries((currentParts?.slots ?? []).filter((s) => s !== "eyes").map((s) => [s, pick()])),
      pattern: PATTERNS[Math.floor(Math.random() * PATTERNS.length)],
      patternColor: pick(),
    }));
  }

  const swatchRow = (value: string | undefined, onPick: (hex: string | null) => void, label: string) => (
    <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label={label}>
      <button
        type="button"
        onClick={() => onPick(null)}
        aria-label={c.reset}
        title={c.reset}
        className={`h-7 w-7 rounded-full border-2 border-[var(--edge)] bg-[var(--surface-muted)] text-xs font-bold leading-none ${
          !value ? "outline outline-2 outline-offset-2 outline-[var(--brand-500)]" : ""
        }`}
      >
        ↺
      </button>
      {PALETTE.map((hex) => (
        <button
          key={hex}
          type="button"
          onClick={() => onPick(hex)}
          aria-label={hex}
          style={{ background: hex }}
          className={`h-7 w-7 rounded-full border-2 border-[var(--edge)] transition-transform hover:scale-110 ${
            value === hex ? "outline outline-2 outline-offset-2 outline-[var(--brand-500)]" : ""
          }`}
        />
      ))}
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Herní karta */}
      <section className="card overflow-hidden p-0">
        <div
          {...(profile.banner && BANNERS[profile.banner] ? { "data-banner": profile.banner } : {})}
          className={`relative px-4 pb-6 pt-5 sm:px-8 ${profile.banner && BANNERS[profile.banner] ? bannerLiveAttrs(profile.banner).className : ""}`}
          style={{ background: banner }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/35" aria-hidden />

          <div className="relative flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3 rounded-2xl bg-black/35 px-3 py-2 text-white backdrop-blur-sm">
              <Avatar id={avatarId} size={44} frame={frame} />
              <div className="min-w-0">
                <h1 className="truncate text-xl font-bold leading-tight" style={heading}>
                  {profile.name || t.anonymous}
                </h1>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {profile.title && getTitle(profile.title) && (
                    <span className="pill bg-[var(--accent-yellow)] px-2 py-0.5 text-[#16132b]">
                      {getTitle(profile.title)?.names[locale]}
                    </span>
                  )}
                  <span className="opacity-90">{profile.school ? profile.school.name : t.noSchool}</span>
                </div>
              </div>
            </div>
            {profile.rank != null && (
              <Link
                href={`/${locale}/zebricky`}
                className="rounded-2xl bg-black/35 px-4 py-2 text-center text-white backdrop-blur-sm hover:bg-black/50"
              >
                <span className="block text-2xl font-extrabold leading-none" style={heading}>
                  #{profile.rank}
                </span>
                <span className="text-[11px] uppercase tracking-wide opacity-90">
                  {profile.players ? `/ ${profile.players}` : ""}
                </span>
              </Link>
            )}
          </div>

          <div className="relative mt-2 grid items-end gap-4 sm:grid-cols-[1fr_auto_1fr]">
            <div className="order-2 flex flex-col gap-3 sm:order-1">
              <div className="flex items-center gap-4 rounded-2xl bg-white/90 p-4 text-[#16132b] shadow">
                <XpRing level={level} percent={profile.percent ?? 0} label={t.level} />
                <p className="min-w-0 text-xs leading-snug opacity-80">
                  <span className="block text-sm font-bold opacity-100">
                    {profile.xp ?? 0} {t.xp}
                  </span>
                  {fill(t.toNext, remaining)}
                </p>
              </div>
              <div className="rounded-2xl bg-white/90 p-3 text-[#16132b] shadow">
                <LevelBadge level={level} locale={locale} size={64} />
              </div>
            </div>

            <div className="order-1 flex flex-col items-center sm:order-2">
              <div className="relative">
                <span
                  aria-hidden
                  className="globe-sprite pointer-events-none absolute -bottom-[34%] left-1/2 h-[125%] w-[165%] -translate-x-1/2 drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)]"
                  style={{ backgroundImage: "url(/home/profil/podstavec.webp)" }}
                />
                <ProfileAvatar
                  id={profile.avatar}
                  label={getAvatar(profile.avatar).names[locale]}
                  frame={frame}
                  custom={custom}
                  onParts={(p) => setParts({ avatar: avatarId, parts: p })}
                  className="h-[320px] w-[250px] sm:h-[400px] sm:w-[300px]"
                  svgSize={170}
                />
              </div>
              <p className="mt-1 rounded-full bg-black/35 px-3 py-1 text-xs text-white backdrop-blur-sm">
                {getAvatar(profile.avatar).names[locale]} · {c.dragHint}
              </p>
            </div>

            <div className="order-3 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/90 p-3 text-center text-[#16132b] shadow">
                <p className="text-2xl font-extrabold" style={heading}>
                  {profile.points ?? 0}
                </p>
                <p className="text-[11px] font-semibold uppercase tracking-wide opacity-70">{t.points}</p>
              </div>
              <div className="rounded-2xl bg-white/90 p-3 text-center text-[#16132b] shadow">
                <p className="text-2xl font-extrabold" style={heading}>
                  {unlockedCount}
                </p>
                <p className="text-[11px] font-semibold uppercase tracking-wide opacity-70">{t.unlockedCount}</p>
              </div>
              <Link
                href={`/${locale}/stale-hry`}
                className="rounded-2xl bg-white/90 p-3 text-[#16132b] shadow hover:bg-white"
              >
                <p className="text-lg font-extrabold" style={heading}>
                  🐾 {profile.pets?.owned ?? 0}
                </p>
                <p className="truncate text-[11px] opacity-70">
                  {profile.pets?.active ? `${profile.pets.name || profile.pets.active} · ${profile.pets.level}` : "—"}
                </p>
              </Link>
              <Link
                href={`/${locale}/stale-hry`}
                className="rounded-2xl bg-white/90 p-3 text-[#16132b] shadow hover:bg-white"
              >
                <p className="text-lg font-extrabold" style={heading}>
                  🏙️ {profile.city?.buildings ?? 0}
                </p>
                <p className="truncate text-[11px] opacity-70">👥 {profile.city?.population ?? 0}</p>
              </Link>
              {!profile.school && (
                <Link
                  href={`/${locale}/nastaveni`}
                  className="col-span-2 rounded-2xl bg-white/90 p-3 text-center text-sm font-bold text-[var(--brand-600)] shadow hover:bg-white"
                >
                  {t.chooseSchool} →
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <ProfileShowcase
        locale={locale}
        level={level}
        rank={profile.rank ?? null}
        points={profile.points ?? 0}
        avatars={AVATARS.filter((a) => isAvatarUnlocked(a, level, unlocks)).length}
        titles={TITLES.filter((x) => isTitleUnlocked(x, level, unlocks)).length}
        looks={ownedFrames.length + ownedBanners.length}
      />

      <SubjectMedals locale={locale} />

      {profile.degraded && <p className="text-sm text-[var(--faint)]">{t.degraded}</p>}

      {/* Úpravy */}
      <section>
        <div className="mb-4 flex flex-wrap gap-2" role="tablist">
          {tabs.map((x) => (
            <button
              key={x.id}
              role="tab"
              aria-selected={tab === x.id}
              onClick={() => setTab(x.id)}
              className={`btn-bouncy px-4 py-2 text-sm font-bold ${
                tab === x.id ? "bg-[var(--brand-500)] text-white" : "bg-[var(--surface)]"
              }`}
            >
              {x.label}
            </button>
          ))}
          <Link href={`/${locale}/obchod`} className="btn-bouncy ml-auto bg-[var(--accent-yellow)] px-4 py-2 text-sm font-bold text-[#16132b]">
            {t.shop} →
          </Link>
        </div>

        {tab === "look" && (
          <div className="card flex flex-col gap-5 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="max-w-xl text-sm text-[var(--muted)]">{c.hint}</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--faint)]">
                  {saveState === "saving" ? c.saving : saveState === "saved" ? `✓ ${c.saved}` : ""}
                </span>
                <button onClick={randomize} className="btn-bouncy bg-[var(--surface-muted)] px-3 py-1.5 text-sm font-bold">
                  🎲 {c.random}
                </button>
                <button
                  onClick={() => updateCustom(() => EMPTY_CUSTOM)}
                  className="btn-bouncy bg-[var(--surface-muted)] px-3 py-1.5 text-sm font-bold"
                >
                  ↺ {c.reset}
                </button>
              </div>
            </div>

            {!currentParts && <p className="text-sm text-[var(--faint)]">…</p>}
            {currentParts && currentParts.slots.length === 0 && (
              <p className="text-sm text-[var(--faint)]">{c.noParts}</p>
            )}

            {currentParts && currentParts.slots.length > 0 && (
              <div className="grid gap-5 md:grid-cols-2">
                <div className="flex flex-col gap-4">
                  <h3 className="text-sm font-bold uppercase tracking-wide text-[var(--muted)]">{c.colors}</h3>
                  {SLOTS.filter((s) => currentParts.slots.includes(s)).map((slot: Slot) => (
                    <div key={slot} className="flex flex-col gap-1.5">
                      <span className="text-sm font-semibold">{c.slots[slot]}</span>
                      {swatchRow(
                        custom.colors[slot],
                        (hex) =>
                          updateCustom((cur) => {
                            const colors = { ...cur.colors };
                            if (hex) colors[slot] = hex;
                            else delete colors[slot];
                            return { ...cur, colors };
                          }),
                        c.slots[slot],
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-4">
                  <h3 className="text-sm font-bold uppercase tracking-wide text-[var(--muted)]">{c.pattern}</h3>
                  <div className="flex flex-wrap gap-2">
                    {PATTERNS.map((p) => (
                      <button
                        key={p}
                        onClick={() => updateCustom((cur) => ({ ...cur, pattern: p }))}
                        className={`btn-bouncy px-3 py-1.5 text-sm font-semibold ${
                          custom.pattern === p ? "bg-[var(--brand-500)] text-white" : "bg-[var(--surface-muted)]"
                        }`}
                      >
                        {c.patterns[p]}
                      </button>
                    ))}
                  </div>
                  {custom.pattern !== "none" && (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-sm font-semibold">{c.patternColor}</span>
                      {swatchRow(
                        custom.patternColor === "#ffffff" ? undefined : custom.patternColor,
                        (hex) => updateCustom((cur) => ({ ...cur, patternColor: hex ?? "#ffffff" })),
                        c.patternColor,
                      )}
                    </div>
                  )}

                  {currentParts.toggles.length > 0 && (
                    <>
                      <h3 className="mt-2 text-sm font-bold uppercase tracking-wide text-[var(--muted)]">
                        {c.accessories}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {TOGGLES.filter((x) => currentParts.toggles.includes(x)).map((tg: Toggle) => {
                          const on = !custom.hidden.includes(tg);
                          return (
                            <button
                              key={tg}
                              role="switch"
                              aria-checked={on}
                              onClick={() =>
                                updateCustom((cur) => ({
                                  ...cur,
                                  hidden: on ? [...cur.hidden, tg] : cur.hidden.filter((h) => h !== tg),
                                }))
                              }
                              className={`btn-bouncy px-3 py-1.5 text-sm font-semibold ${
                                on ? "bg-[var(--brand-500)] text-white" : "bg-[var(--surface-muted)] line-through opacity-70"
                              }`}
                            >
                              {c.toggles[tg]}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "avatars" && (
          <>
            <p className="mb-4 text-sm text-[var(--muted)]">{t.avatarsHint}</p>
            <ProfileCollection
              t={t}
              busy={saving !== null}
              grid="grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
              favorites={favorites.avatar}
              entries={AVATARS.map((avatar) => {
                const unlocked = isAvatarUnlocked(avatar, level, unlocks);
                return {
                  id: avatar.id,
                  name: avatar.names[locale],
                  unlocked,
                  current: profile.avatar === avatar.id,
                  preview: <Avatar id={avatar.id} size={72} locked={!unlocked} />,
                  hint: unlocked ? null : unlockHint("avatar", avatar.id, locale),
                };
              })}
              onPick={(id) => post(id, { avatar: id }, (p) => ({ ...p, avatar: id }))}
              onToggleFavorite={(id, on) => toggleFavorite("avatar", id, on)}
            />
          </>
        )}

        {tab === "titles" && (
          <>
            <p className="mb-4 text-sm text-[var(--muted)]">{t.titlesHint}</p>
            <ProfileCollection
              t={t}
              busy={saving !== null}
              grid="grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
              favorites={favorites.title}
              entries={TITLES.map((title) => {
                const unlocked = isTitleUnlocked(title, level, unlocks);
                return {
                  id: title.id,
                  name: title.names[locale],
                  unlocked,
                  current: profile.title === title.id,
                  preview: <span className="pill bg-[var(--accent-yellow)] px-3 py-1 text-sm text-[#16132b]">{title.names[locale]}</span>,
                  hint: unlocked ? null : unlockHint("title", title.id, locale),
                };
              })}
              onPick={(id) => post(id, { title: id }, (p) => ({ ...p, title: id }))}
              onToggleFavorite={(id, on) => toggleFavorite("title", id, on)}
            />
          </>
        )}

        {tab === "frames" && (
          <>
            <p className="mb-4 text-sm text-[var(--muted)]">{t.framesHint}</p>
            <ProfileCollection
              t={t}
              busy={saving !== null}
              grid="grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
              favorites={favorites.frame}
              leading={
                <button
                  type="button"
                  disabled={saving !== null}
                  onClick={() => post("frame-none", { frame: null }, (p) => ({ ...p, frame: null }))}
                  className={`card card-hover flex flex-col items-center gap-2 p-4 text-center ${
                    !frame ? "outline outline-4 outline-offset-2 outline-[var(--brand-500)]" : ""
                  }`}
                >
                  <Avatar id={avatarId} size={72} />
                  <span className="text-sm font-bold">{t.none}</span>
                </button>
              }
              entries={FRAME_IDS.map((f) => {
                const owned = ownedFrames.includes(f);
                return {
                  id: f,
                  name: itemName("frame", f, locale),
                  unlocked: owned,
                  current: frame === f,
                  preview: <Avatar id={avatarId} size={72} frame={f} locked={!owned} />,
                  hint: owned ? null : unlockHint("frame", f, locale),
                };
              })}
              onPick={(id) => post(`frame-${id}`, { frame: id }, (p) => ({ ...p, frame: id }))}
              onToggleFavorite={(id, on) => toggleFavorite("frame", id, on)}
            />
          </>
        )}

        {tab === "banners" && (
          <>
            <p className="mb-4 text-sm text-[var(--muted)]">{t.bannersHint}</p>
            <ProfileCollection
              t={t}
              busy={saving !== null}
              grid="grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
              favorites={favorites.banner}
              leading={
                <button
                  type="button"
                  disabled={saving !== null}
                  onClick={() => post("banner-none", { banner: null }, (p) => ({ ...p, banner: null }))}
                  className={`card card-hover flex flex-col gap-2 p-3 text-center ${
                    !profile.banner ? "outline outline-4 outline-offset-2 outline-[var(--brand-500)]" : ""
                  }`}
                >
                  <div className="h-16 rounded-xl" style={{ background: DEFAULT_BANNER }} />
                  <span className="text-sm font-bold">{t.none}</span>
                </button>
              }
              entries={Object.keys(BANNERS).map((b) => {
                const owned = ownedBanners.includes(b);
                return {
                  id: b,
                  name: itemName("banner", b, locale),
                  unlocked: owned,
                  current: profile.banner === b,
                  preview: (
                    <div
                      {...bannerAttrs(b)}
                      className="banner-anim h-16 w-full rounded-xl"
                      style={{ background: bannerCss(b), filter: owned ? undefined : "grayscale(1) opacity(0.5)" }}
                    />
                  ),
                  hint: owned ? null : unlockHint("banner", b, locale),
                };
              })}
              onPick={(id) => post(`banner-${id}`, { banner: id }, (p) => ({ ...p, banner: id }))}
              onToggleFavorite={(id, on) => toggleFavorite("banner", id, on)}
            />
          </>
        )}

        {error && <p className="mt-4 text-sm text-[var(--danger)]">{t.error}</p>}
      </section>
    </div>
  );
}
