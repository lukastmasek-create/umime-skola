"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Avatar } from "@/components/Avatar";
import { AVATARS, isAvatarUnlocked } from "@/lib/avatars";
import { TITLES, getTitle, isTitleUnlocked } from "@/lib/titles";
import { fill, getProfileText } from "@/i18n/profile";
import { useAccount } from "@/lib/use-account";
import { bannerCss, bannerLiveAttrs, isBannerId, isFrameId } from "@/lib/cosmetics";
import type { Locale } from "@/i18n/config";

export function HeaderAccount({
  locale,
  loginLabel,
  registerLabel,
  linkClass,
}: {
  locale: Locale;
  loginLabel: string;
  registerLabel: string;
  linkClass: string;
}) {
  const [account, setAccount] = useAccount();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const t = getProfileText(locale);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  async function save(body: { avatar: string } | { title: string } | { frame: string | null } | { banner: string | null }) {
    if (busy) return;
    setBusy(true);
    setFailed(false);
    try {
      const res = await fetch("/api/profil", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("save failed");
      setAccount((prev) => (prev && prev.loggedIn ? { ...prev, ...body } : prev));
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  if (!account) {
    return <span className="inline-block h-9 w-40" aria-hidden />;
  }

  if (!account.loggedIn) {
    return (
      <>
        <Link href={`/${locale}/prihlaseni`} className={`hidden sm:inline-flex ${linkClass}`}>
          {loginLabel}
        </Link>
        <Link
          href={`/${locale}/registrace`}
          className="btn-bouncy inline-flex bg-[var(--brand-500)] px-3 py-1.5 text-sm font-bold text-white sm:px-4"
        >
          {registerLabel}
        </Link>
      </>
    );
  }

  const title = getTitle(account.title);
  const unlockedAvatars = AVATARS.filter((a) => isAvatarUnlocked(a, account.level, account.unlocks)).length;
  const unlockedTitles = TITLES.filter((x) => isTitleUnlocked(x, account.level, account.unlocks)).length;
  const toNext = account.neededForNext - account.intoLevel;

  // Rychlý výběr: oblíbené odemčené věci. Bez oblíbených se ukáže pár odemčených, aby šlo hned vybrat.
  // Zamčené věci a jak je odemknout jsou jen v profilu.
  const favorites = account.favorites ?? { avatar: [], title: [], frame: [], banner: [] };
  const QUICK_AVATARS = 12;
  const QUICK_TITLES = 6;
  const ownedAvatars = AVATARS.filter((a) => isAvatarUnlocked(a, account.level, account.unlocks));
  const favAvatars = favorites.avatar.map((id) => ownedAvatars.find((a) => a.id === id)).filter((a): a is (typeof AVATARS)[number] => !!a);
  const currentAvatar = ownedAvatars.find((a) => a.id === account.avatar);
  const quickAvatars = (favAvatars.length > 0 ? favAvatars : ownedAvatars).slice(0, QUICK_AVATARS);
  if (currentAvatar && !quickAvatars.some((a) => a.id === currentAvatar.id)) quickAvatars.splice(QUICK_AVATARS - 1, 1, currentAvatar);
  const ownedTitles = TITLES.filter((x) => isTitleUnlocked(x, account.level, account.unlocks));
  const favTitles = favorites.title.map((id) => ownedTitles.find((x) => x.id === id)).filter((x): x is (typeof TITLES)[number] => !!x);
  const currentTitle = ownedTitles.find((x) => x.id === account.title);
  const quickTitles = (favTitles.length > 0 ? favTitles : ownedTitles).slice(0, QUICK_TITLES);
  if (currentTitle && !quickTitles.some((x) => x.id === currentTitle.id)) quickTitles.push(currentTitle);
  const favFrames = favorites.frame.filter((f) => account.unlocks.includes(`frame:${f}`));
  const favBanners = favorites.banner.filter((b) => account.unlocks.includes(`banner:${b}`));

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={t.nav}
        className="flex items-center gap-2 rounded-xl border-2 border-[var(--edge)] bg-[var(--surface)] py-0.5 pl-0.5 pr-3 text-sm font-bold hover:bg-[var(--surface-muted)]"
      >
        <Avatar id={account.avatar} icon={account.icon} size={30} frame={isFrameId(account.frame) ? account.frame : null} />
        <span>
          {t.level} {account.level}
        </span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={t.nav}
          className="card absolute right-0 top-full z-50 mt-2 max-h-[calc(100vh-6rem)] w-[min(22rem,calc(100vw-2rem))] overflow-y-auto p-4"
        >
          <div
            {...(isBannerId(account.banner) ? { "data-banner": account.banner } : {})}
            className={`-mx-4 -mt-4 mb-1 flex items-center gap-3 rounded-t-[16px] px-4 pb-3 pt-4 ${
              isBannerId(account.banner) ? `${bannerLiveAttrs(account.banner).className} text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.65)]` : ""
            }`}
            style={isBannerId(account.banner) ? { background: bannerCss(account.banner) } : undefined}
          >
            <Avatar id={account.avatar} icon={account.icon} size={64} frame={isFrameId(account.frame) ? account.frame : null} />
            <div className="min-w-0">
              <p className="truncate text-lg font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>
                {account.name ?? t.anonymous}
              </p>
              <p className="truncate text-sm font-bold text-[var(--accent-500)]">
                {title ? title.names[locale] : t.noTitle}
              </p>
              <p className={`truncate text-xs ${isBannerId(account.banner) ? "text-white/90" : "text-[var(--muted)]"}`}>
                {account.school
                  ? `${account.school.name}${account.school.city ? `, ${account.school.city}` : ""}`
                  : t.noSchool}
              </p>
            </div>
          </div>

          {account.degraded && <p className="mt-3 text-xs text-[var(--muted)]">{t.degraded}</p>}

          <div className="mt-4">
            <div className="flex items-baseline justify-between text-sm font-bold">
              <span>
                {t.level} {account.level}
              </span>
              <span className="text-xs font-semibold text-[var(--muted)]">{fill(t.toNext, toNext)}</span>
            </div>
            <div
              className="mt-1 h-3 overflow-hidden rounded-full border-2 border-[var(--edge)] bg-[var(--surface-muted)]"
              role="progressbar"
              aria-valuenow={account.percent}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className="h-full bg-[var(--accent-500)]" style={{ width: `${account.percent}%` }} />
            </div>
          </div>

          <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
            {[
              [t.points, account.points],
              [t.totalXp, account.xp],
              [t.avatars, `${unlockedAvatars}/${AVATARS.length}`],
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded-xl border-2 border-[var(--edge)] bg-[var(--surface-muted)] px-1 py-2">
                <dd className="text-base font-extrabold">{value}</dd>
                <dt className="text-[11px] font-semibold text-[var(--muted)]">{label}</dt>
              </div>
            ))}
          </dl>

          <p className="mb-1.5 mt-4 text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
            {t.avatars}{" "}
            <span className="font-semibold normal-case">
              · {favAvatars.length > 0 ? t.quickFavorites : t.quickUnlocked} · {t.unlockedCount} {unlockedAvatars}/{AVATARS.length}
              {AVATARS.length - unlockedAvatars > 0 && ` · ${fill(t.lockedCount, AVATARS.length - unlockedAvatars)}`}
            </span>
          </p>
          <div className="grid grid-cols-6 gap-1.5">
            {quickAvatars.map((a) => {
              const selected = a.id === account.avatar;
              return (
                <button
                  key={a.id}
                  type="button"
                  disabled={busy}
                  onClick={() => save({ avatar: a.id })}
                  title={a.names[locale]}
                  aria-label={a.names[locale]}
                  aria-pressed={selected}
                  className={`flex items-center justify-center rounded-xl border-2 p-0.5 hover:bg-[var(--surface-muted)] ${
                    selected ? "border-[var(--accent-500)] bg-[var(--surface-muted)]" : "border-transparent"
                  }`}
                >
                  <Avatar id={a.id} size={36} />
                </button>
              );
            })}
          </div>
          {favAvatars.length === 0 && <p className="mt-1.5 text-[11px] text-[var(--muted)]">{t.quickHint}</p>}
          <Link href={`/${locale}/profil`} onClick={() => setOpen(false)} className="mt-1.5 inline-block text-xs font-bold text-[var(--brand-600)] hover:underline">
            {fill(t.quickMore, AVATARS.length)} →
          </Link>

          <p className="mb-1.5 mt-4 text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
            {t.titles}{" "}
            <span className="font-semibold normal-case">
              · {favTitles.length > 0 ? t.quickFavorites : t.quickUnlocked} · {t.unlockedCount} {unlockedTitles}/{TITLES.length}
            </span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {quickTitles.map((x) => {
              const selected = x.id === account.title;
              return (
                <button
                  key={x.id}
                  type="button"
                  disabled={busy}
                  onClick={() => save({ title: x.id })}
                  aria-pressed={selected}
                  className={`pill border-2 px-2.5 py-0.5 text-xs font-bold hover:bg-[var(--surface-muted)] ${
                    selected ? "border-[var(--edge)] bg-[var(--accent-500)] text-white" : "border-[var(--edge)] bg-[var(--surface)]"
                  }`}
                >
                  {x.names[locale]}
                </button>
              );
            })}
          </div>

          {favFrames.length > 0 && (
            <>
              <p className="mb-1.5 mt-4 text-xs font-bold uppercase tracking-wide text-[var(--muted)]">{t.frames}</p>
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => save({ frame: null })}
                  aria-pressed={!account.frame}
                  title={t.none}
                  className={`rounded-xl border-2 px-2 py-1 text-xs font-bold ${!account.frame ? "border-[var(--accent-500)]" : "border-transparent"} hover:bg-[var(--surface-muted)]`}
                >
                  {t.none}
                </button>
                {favFrames.map((f) => (
                  <button
                    key={f}
                    type="button"
                    disabled={busy}
                    onClick={() => save({ frame: f })}
                    aria-pressed={account.frame === f}
                    aria-label={f}
                    className={`rounded-xl border-2 p-1.5 hover:bg-[var(--surface-muted)] ${account.frame === f ? "border-[var(--accent-500)]" : "border-transparent"}`}
                  >
                    <Avatar id={account.avatar} icon={account.icon} size={32} frame={isFrameId(f) ? f : null} />
                  </button>
                ))}
              </div>
            </>
          )}

          {favBanners.length > 0 && (
            <>
              <p className="mb-1.5 mt-4 text-xs font-bold uppercase tracking-wide text-[var(--muted)]">{t.banners}</p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => save({ banner: null })}
                  aria-pressed={!account.banner}
                  className={`rounded-xl border-2 px-2 py-1 text-xs font-bold ${!account.banner ? "border-[var(--accent-500)]" : "border-transparent"} hover:bg-[var(--surface-muted)]`}
                >
                  {t.none}
                </button>
                {favBanners.map((b) => (
                  <button
                    key={b}
                    type="button"
                    disabled={busy}
                    onClick={() => save({ banner: b })}
                    aria-pressed={account.banner === b}
                    aria-label={b}
                    className={`h-9 w-16 rounded-lg border-2 ${account.banner === b ? "border-[var(--accent-500)]" : "border-[var(--edge)]"}`}
                    style={{ background: bannerCss(b) }}
                  />
                ))}
              </div>
            </>
          )}

          {failed && <p className="mt-2 text-xs text-[var(--danger)]">{t.error}</p>}

          <div className="mt-4 flex items-center gap-2 border-t-2 border-[var(--edge)] pt-3 text-sm font-bold">
            <Link
              href={`/${locale}/profil`}
              onClick={() => setOpen(false)}
              className="btn-bouncy flex-1 bg-[var(--brand-500)] px-3 py-1.5 text-center text-white"
            >
              {t.fullProfile}
            </Link>
            <Link
              href={`/${locale}/nastaveni`}
              onClick={() => setOpen(false)}
              className="rounded-xl px-2 py-1.5 hover:bg-[var(--surface-muted)]"
            >
              {t.settings}
            </Link>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: `/${locale}` })}
              className="rounded-xl px-2 py-1.5 text-[var(--danger)] hover:bg-[var(--surface-muted)]"
            >
              {t.logout}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
