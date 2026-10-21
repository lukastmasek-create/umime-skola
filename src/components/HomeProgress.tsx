"use client";

import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { fill, getProfileText } from "@/i18n/profile";
import { getHomeText } from "@/i18n/home";
import { useAccount } from "@/lib/use-account";
import type { Locale } from "@/i18n/config";

// Osobní přehled na úvodní stránce: přihlášenému ukáže úroveň a postup,
// ostatním pozvánku k registraci.
export function HomeProgress({ locale, registerLabel }: { locale: Locale; registerLabel: string }) {
  const [account] = useAccount();
  const t = getHomeText(locale);
  const p = getProfileText(locale);

  if (!account) {
    return <div className="card h-28 animate-pulse bg-[var(--surface-muted)]" aria-hidden />;
  }

  if (!account.loggedIn) {
    return (
      <div className="card flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>
            {t.progressTitle}
          </h2>
          <p className="mt-1 max-w-xl text-sm text-[var(--muted)]">{t.progressGuest}</p>
        </div>
        <Link
          href={`/${locale}/registrace`}
          className="btn-bouncy shrink-0 bg-[var(--brand-500)] px-5 py-2.5 text-sm font-bold text-white"
        >
          {registerLabel}
        </Link>
      </div>
    );
  }

  const toNext = account.neededForNext - account.intoLevel;

  return (
    <div className="card flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
      <div className="flex items-center gap-4">
        <Avatar id={account.avatar} size={64} />
        <div className="min-w-0">
          <p className="truncate text-lg font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>
            {account.name ?? p.anonymous}
          </p>
          <p className="text-sm font-bold text-[var(--accent-500)]">
            {t.progressLevel} {account.level}
          </p>
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2 text-xs font-semibold text-[var(--muted)]">
          <span>{fill(t.progressNext, toNext)}</span>
          <span>
            {t.progressPoints}: <strong className="text-[var(--foreground)]">{account.points}</strong>
          </span>
        </div>
        <div
          className="mt-1.5 h-3.5 overflow-hidden rounded-full border-2 border-[var(--edge)] bg-[var(--surface-muted)]"
          role="progressbar"
          aria-valuenow={account.percent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="h-full bg-[var(--accent-500)]" style={{ width: `${account.percent}%` }} />
        </div>
      </div>

      <div className="flex gap-2">
        <Link
          href={`/${locale}/kurzy/zakladni`}
          className="btn-bouncy bg-[var(--brand-500)] px-4 py-2 text-sm font-bold text-white"
        >
          {t.continueLearning}
        </Link>
        <Link href={`/${locale}/profil`} className="btn-bouncy bg-[var(--surface)] px-4 py-2 text-sm font-bold">
          {t.openProfile}
        </Link>
      </div>
    </div>
  );
}
