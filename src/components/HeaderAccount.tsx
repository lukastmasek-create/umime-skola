"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Avatar } from "@/components/Avatar";
import { AVATARS, isAvatarUnlocked } from "@/lib/avatars";
import { TITLES, getTitle, isTitleUnlocked } from "@/lib/titles";
import { fill, getProfileText } from "@/i18n/profile";
import { useAccount } from "@/lib/use-account";
import { bannerCss, bannerLiveAttrs, isBannerId, isFrameId } from "@/lib/cosmetics";
import type { Locale } from "@/i18n/config";
import { SketchIcon, type SketchIconKind } from "@/components/SketchIcons";
import { PcardRing, PcardTape } from "@/components/PcardArt";

type Account = NonNullable<ReturnType<typeof useAccount>[0]>;
type LoggedIn = Extract<Account, { loggedIn: true }>;
type Texts = ReturnType<typeof getProfileText>;
type SaveBody = { avatar: string } | { title: string } | { frame: string | null } | { banner: string | null };

const QUICK_AVATARS = 12;
const QUICK_TITLES = 6;

// Ikona na světlém štítku: tmavý obrys ikony zůstane vidět i v tmavém režimu.
function Ico({ kind, size = 18 }: { kind: SketchIconKind; size?: number }) {
  return (
    <span className="acct-chip" aria-hidden>
      <SketchIcon kind={kind} size={size} />
    </span>
  );
}

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

  async function save(body: SaveBody) {
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
        <Link href={`/${locale}/prihlaseni`} aria-label={loginLabel} className={`inline-flex whitespace-nowrap ${linkClass}`}>
          <SketchIcon kind="user" size={18} className="mr-1 shrink-0 min-[400px]:hidden" />
          <span className="hidden min-[400px]:inline">{loginLabel}</span>
        </Link>
        <Link
          href={`/${locale}/registrace`}
          className="btn-bouncy inline-flex whitespace-nowrap bg-[var(--brand-500)] px-2.5 py-1.5 text-xs font-bold text-white sm:px-4 sm:text-sm"
        >
          <SketchIcon kind="rocket" size={18} className="mr-1.5 hidden shrink-0 sm:inline-block" />
          {registerLabel}
        </Link>
      </>
    );
  }

  // Na mobilu se panel váže k hlavičce (sticky = vztažný prvek), takže ho lze roztáhnout přes šířku obrazovky.
  // Od sm výše se váže k tlačítku a je zarovnaný doprava.
  return (
    <div ref={rootRef} className="static sm:relative">
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
        <AccountPanel
          account={account}
          locale={locale}
          t={t}
          busy={busy}
          failed={failed}
          onSave={save}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

// Samotné okno účtu. Seznamy oblíbených a odemčených věcí se počítají až při otevření, a jen jednou.
function AccountPanel({
  account,
  locale,
  t,
  busy,
  failed,
  onSave,
  onClose,
}: {
  account: LoggedIn;
  locale: Locale;
  t: Texts;
  busy: boolean;
  failed: boolean;
  onSave: (body: SaveBody) => void;
  onClose: () => void;
}) {
  const lists = useMemo(() => {
    const favorites = account.favorites ?? { avatar: [], title: [], frame: [], banner: [] };
    const ownedAvatars = AVATARS.filter((a) => isAvatarUnlocked(a, account.level, account.unlocks));
    const favAvatars = favorites.avatar.map((id) => ownedAvatars.find((a) => a.id === id)).filter((a): a is (typeof AVATARS)[number] => !!a);
    const quickAvatars = (favAvatars.length > 0 ? favAvatars : ownedAvatars).slice(0, QUICK_AVATARS);
    const currentAvatar = ownedAvatars.find((a) => a.id === account.avatar);
    if (currentAvatar && !quickAvatars.some((a) => a.id === currentAvatar.id)) quickAvatars.splice(QUICK_AVATARS - 1, 1, currentAvatar);

    const ownedTitles = TITLES.filter((x) => isTitleUnlocked(x, account.level, account.unlocks));
    const favTitles = favorites.title.map((id) => ownedTitles.find((x) => x.id === id)).filter((x): x is (typeof TITLES)[number] => !!x);
    const quickTitles = (favTitles.length > 0 ? favTitles : ownedTitles).slice(0, QUICK_TITLES);
    const currentTitle = ownedTitles.find((x) => x.id === account.title);
    if (currentTitle && !quickTitles.some((x) => x.id === currentTitle.id)) quickTitles.push(currentTitle);

    return {
      ownedAvatars,
      favAvatars,
      quickAvatars,
      ownedTitles,
      favTitles,
      quickTitles,
      favFrames: favorites.frame.filter((f) => account.unlocks.includes(`frame:${f}`)),
      favBanners: favorites.banner.filter((b) => account.unlocks.includes(`banner:${b}`)),
    };
  }, [account]);

  const { ownedAvatars, favAvatars, quickAvatars, ownedTitles, favTitles, quickTitles, favFrames, favBanners } = lists;
  const title = getTitle(account.title);
  const banner = isBannerId(account.banner) ? account.banner : null;
  const frame = isFrameId(account.frame) ? account.frame : null;
  const toNext = account.neededForNext - account.intoLevel;
  const lockedAvatars = AVATARS.length - ownedAvatars.length;

  return (
    <div
      role="dialog"
      aria-label={t.nav}
      className="acct-pop absolute inset-x-4 top-full z-50 mt-3 max-h-[calc(100dvh-6rem)] overflow-y-auto p-4 sm:inset-x-auto sm:left-auto sm:right-0 sm:w-[min(22rem,calc(100vw-2rem))] sm:max-h-[calc(100vh-6rem)]"
    >
      <PcardTape />

      <div
        {...(banner ? { "data-banner": banner } : {})}
        className={`-mx-4 -mt-4 mb-1 flex items-center gap-3 rounded-t-[20px] px-4 pb-3 pt-4 ${
          banner ? `${bannerLiveAttrs(banner).className} text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.65)]` : ""
        }`}
        style={banner ? { background: bannerCss(banner) } : undefined}
      >
        <span className="relative grid shrink-0 place-items-center">
          <PcardRing />
          <Avatar id={account.avatar} icon={account.icon} size={64} frame={frame} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-lg font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>
            {account.name ?? t.anonymous}
          </p>
          <p className="flex items-center gap-1 truncate text-sm font-bold text-[var(--accent-500)]">
            <SketchIcon kind="sparkle" size={14} className="acct-bob shrink-0" />
            <span className="truncate">{title ? title.names[locale] : t.noTitle}</span>
          </p>
          <p className={`flex items-center gap-1 truncate text-xs ${banner ? "text-white/90" : "text-[var(--muted)]"}`}>
            <SketchIcon kind="school" size={14} className="acct-bob shrink-0" />
            <span className="truncate">
              {account.school ? `${account.school.name}${account.school.city ? `, ${account.school.city}` : ""}` : t.noSchool}
            </span>
          </p>
        </div>
      </div>

      {account.degraded && <p className="mt-3 text-xs text-[var(--muted)]">{t.degraded}</p>}

      <div className="mt-4">
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-sm font-bold">
          <span className="flex items-center gap-2">
            <span className="acct-bob">
              <Ico kind="level" />
            </span>
            {t.level} {account.level}
          </span>
          <span className="text-right text-xs font-semibold leading-snug text-[var(--muted)]">{fill(t.toNext, toNext)}</span>
        </div>
        <div
          className="mt-2 h-3 overflow-hidden rounded-full border-2 border-[var(--edge)] bg-[var(--surface-muted)]"
          role="progressbar"
          aria-valuenow={account.percent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="acct-fill h-full bg-[var(--accent-500)]" style={{ width: `${account.percent}%` }} />
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
        <Stat icon="star" label={t.points} value={account.points} />
        <Stat icon="rocket" label={t.totalXp} value={account.xp} />
        <Stat icon="user" label={t.avatars} value={`${ownedAvatars.length}/${AVATARS.length}`} />
      </dl>

      <Section icon="user" label={t.avatars} sub={[favAvatars.length > 0 ? t.quickFavorites : t.quickUnlocked, `${t.unlockedCount} ${ownedAvatars.length}/${AVATARS.length}`, lockedAvatars > 0 ? fill(t.lockedCount, lockedAvatars) : null].filter(Boolean).join(" · ")} />
      <div className="grid grid-cols-6 gap-1.5">
        {quickAvatars.map((a) => {
          const selected = a.id === account.avatar;
          return (
            <button
              key={a.id}
              type="button"
              disabled={busy}
              onClick={() => onSave({ avatar: a.id })}
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
      {favAvatars.length === 0 && (
        <p className="mt-1.5 flex items-center gap-1 text-[11px] text-[var(--muted)]">
          <SketchIcon kind="heart" size={13} className="shrink-0" />
          {t.quickHint}
        </p>
      )}
      <Link href={`/${locale}/profil`} onClick={onClose} className="mt-1.5 inline-block text-xs font-bold text-[var(--brand-600)] hover:underline">
        {fill(t.quickMore, AVATARS.length)} →
      </Link>

      <Section icon="sparkle" label={t.titles} sub={[favTitles.length > 0 ? t.quickFavorites : t.quickUnlocked, `${t.unlockedCount} ${ownedTitles.length}/${TITLES.length}`].join(" · ")} />
      <div className="flex flex-wrap gap-1.5">
        {quickTitles.map((x) => {
          const selected = x.id === account.title;
          return (
            <button
              key={x.id}
              type="button"
              disabled={busy}
              onClick={() => onSave({ title: x.id })}
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
          <Section icon="shield" label={t.frames} />
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              disabled={busy}
              onClick={() => onSave({ frame: null })}
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
                onClick={() => onSave({ frame: f })}
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
          <Section icon="palette" label={t.banners} />
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => onSave({ banner: null })}
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
                onClick={() => onSave({ banner: b })}
                aria-pressed={account.banner === b}
                aria-label={b}
                className={`h-9 w-16 rounded-lg border-2 ${account.banner === b ? "border-[var(--accent-500)]" : "border-[var(--edge)]"}`}
                style={{ background: bannerCss(b) }}
              />
            ))}
          </div>
        </>
      )}

      {failed && (
        <p className="mt-2 flex items-center gap-1 text-xs text-[var(--danger)]">
          <SketchIcon kind="info" size={14} className="shrink-0" />
          {t.error}
        </p>
      )}

      <Link href={`/${locale}/profil`} onClick={onClose} className="btn-bouncy acct-cta mt-4 w-full bg-[var(--brand-500)] px-3 py-2 text-sm font-bold text-white">
        {t.fullProfile}
      </Link>
      <div className="mt-2 grid grid-cols-2 gap-2 border-t-2 border-dashed border-[var(--edge)] pt-2 text-xs font-bold sm:text-sm">
        <Link href={`/${locale}/nastaveni`} onClick={onClose} className="acct-link min-w-0 justify-center rounded-xl px-2 py-1.5 hover:bg-[var(--surface-muted)]">
          <span className="truncate">{t.settings}</span>
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: `/${locale}` })}
          className="acct-link min-w-0 justify-center rounded-xl px-2 py-1.5 text-[var(--danger)] hover:bg-[var(--surface-muted)]"
        >
          <span className="truncate">{t.logout}</span>
        </button>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: SketchIconKind; label: string; value: ReactNode }) {
  return (
    <div className="acct-stat">
      <Ico kind={icon} size={20} />
      <dd className="text-base font-extrabold">{value}</dd>
      <dt className="text-[11px] font-semibold text-[var(--muted)]">{label}</dt>
    </div>
  );
}

function Section({ icon, label, sub }: { icon: SketchIconKind; label: string; sub?: string }) {
  return (
    <p className="acct-label">
      <Ico kind={icon} size={16} />
      <span>{label}</span>
      {sub && <span className="acct-sub">{sub}</span>}
    </p>
  );
}
