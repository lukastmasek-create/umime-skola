"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { LevelBadge } from "@/components/LevelBadge";
import { AVATARS, getAvatar, isAvatarUnlocked } from "@/lib/avatars";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { TITLES, getTitle, isTitleUnlocked } from "@/lib/titles";
import { fill, getProfileText } from "@/i18n/profile";
import { notifyAccountChanged } from "@/lib/account-events";
import type { Locale } from "@/i18n/config";

type Profile = {
  loggedIn: boolean;
  degraded?: boolean;
  name?: string | null;
  avatar?: string;
  title?: string | null;
  unlocks?: string[];
  points?: number;
  school?: { name: string; city: string } | null;
  level?: number;
  xp?: number;
  intoLevel?: number;
  neededForNext?: number;
  percent?: number;
};

export function ProfileView({ locale }: { locale: Locale }) {
  const t = getProfileText(locale);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);

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
    };
  }, []);

  async function choose(id: string) {
    setError(false);
    setSaving(id);
    try {
      const res = await fetch("/api/profil", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar: id }),
      });
      if (!res.ok) throw new Error();
      setProfile((p) => (p ? { ...p, avatar: id } : p));
      notifyAccountChanged();
    } catch {
      setError(true);
    }
    setSaving(null);
  }

  async function chooseTitle(id: string) {
    setError(false);
    setSaving(id);
    try {
      const res = await fetch("/api/profil", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: id }),
      });
      if (!res.ok) throw new Error();
      setProfile((p) => (p ? { ...p, title: id } : p));
      notifyAccountChanged();
    } catch {
      setError(true);
    }
    setSaving(null);
  }

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
  const remaining = (profile.neededForNext ?? 0) - (profile.intoLevel ?? 0);

  return (
    <div className="flex flex-col gap-8">
      <section className="card flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
        <ProfileAvatar id={profile.avatar} label={getAvatar(profile.avatar).names[locale]} />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
            {profile.name || t.anonymous}
          </h1>
          {profile.title && getTitle(profile.title) && (
            <span className="pill mt-1 bg-[var(--accent-yellow)] px-2.5 py-1 text-[#16132b]">
              {getTitle(profile.title)?.names[locale]}
            </span>
          )}
          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-4xl font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>
              {level}
            </span>
            <span className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
              {t.level}
            </span>
          </div>
          <div className="mt-3">
            <LevelBadge level={level} locale={locale} />
          </div>
          <div className="mt-3 h-4 overflow-hidden rounded-full border-2 border-[var(--edge)] bg-[var(--surface-muted)]">
            <div
              className="h-full bg-[var(--accent-yellow)]"
              style={{ width: `${profile.percent ?? 0}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {profile.xp ?? 0} {t.xp} · {fill(t.toNext, remaining)}
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
            <span className="pill bg-[var(--surface-muted)] px-3 py-1.5">
              {t.points}: {profile.points ?? 0}
            </span>
            <span className="pill bg-[var(--surface-muted)] px-3 py-1.5">
              {t.school}: {profile.school ? profile.school.name : t.noSchool}
            </span>
            {!profile.school && (
              <Link
                href={`/${locale}/nastaveni`}
                className="px-1 py-1.5 text-[var(--brand-600)] hover:underline"
              >
                {t.chooseSchool} →
              </Link>
            )}
          </div>
        </div>
      </section>

      {profile.degraded && <p className="text-sm text-[var(--faint)]">{t.degraded}</p>}

      <section>
        <h2 className="mb-1 text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          {t.avatars}
        </h2>
        <p className="mb-5 text-sm text-[var(--muted)]">{t.avatarsHint}</p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {AVATARS.map((avatar) => {
            const unlocked = isAvatarUnlocked(avatar, level, profile.unlocks ?? []);
            const isCurrent = profile.avatar === avatar.id;
            const requirement =
              "level" in avatar.unlock ? fill(t.unlockAtLevel, avatar.unlock.level) : t.eventHint;
            return (
              <button
                key={avatar.id}
                disabled={!unlocked || saving !== null}
                onClick={() => choose(avatar.id)}
                className={`card flex flex-col items-center gap-2 p-4 text-center ${
                  unlocked ? "card-hover" : "cursor-not-allowed"
                } ${isCurrent ? "outline outline-4 outline-offset-2 outline-[var(--brand-500)]" : ""}`}
              >
                <Avatar id={avatar.id} size={72} locked={!unlocked} />
                <span className="text-sm font-bold">{avatar.names[locale]}</span>
                <span className="text-xs text-[var(--faint)]">
                  {isCurrent ? t.selected : unlocked ? t.choose : requirement}
                </span>
              </button>
            );
          })}
        </div>
        {error && <p className="mt-4 text-sm text-[var(--danger)]">{t.error}</p>}
      </section>

      <section>
        <h2 className="mb-1 text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          {t.titles}
        </h2>
        <p className="mb-5 text-sm text-[var(--muted)]">{t.titlesHint}</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {TITLES.map((title) => {
            const unlocked = isTitleUnlocked(title, level, profile.unlocks ?? []);
            const isCurrent = profile.title === title.id;
            const requirement =
              "level" in title.unlock ? fill(t.unlockAtLevel, title.unlock.level) : t.eventHint;
            return (
              <button
                key={title.id}
                disabled={!unlocked || saving !== null}
                onClick={() => chooseTitle(title.id)}
                className={`card flex flex-col items-center gap-1 p-3 text-center ${
                  unlocked ? "card-hover" : "cursor-not-allowed opacity-60"
                } ${isCurrent ? "outline outline-4 outline-offset-2 outline-[var(--brand-500)]" : ""}`}
              >
                <span className="text-sm font-bold">{title.names[locale]}</span>
                <span className="text-xs text-[var(--faint)]">
                  {isCurrent ? t.selected : unlocked ? t.choose : requirement}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
