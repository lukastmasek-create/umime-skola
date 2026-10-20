"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { getProfileText } from "@/i18n/profile";
import type { Locale } from "@/i18n/config";

type Account = { loggedIn: boolean; avatar?: string; level?: number } | null;

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
  const [account, setAccount] = useState<Account>(null);
  const t = getProfileText(locale);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/profil");
        const data = await res.json();
        if (!cancelled) setAccount(data);
      } catch {
        if (!cancelled) setAccount({ loggedIn: false });
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!account) {
    return <span className="inline-block h-9 w-40" aria-hidden />;
  }

  if (account.loggedIn) {
    return (
      <Link
        href={`/${locale}/profil`}
        className="flex items-center gap-2 rounded-xl border-2 border-[var(--edge)] bg-[var(--surface)] py-0.5 pl-0.5 pr-3 text-sm font-bold hover:bg-[var(--surface-muted)]"
        aria-label={t.nav}
      >
        <Avatar id={account.avatar} size={30} />
        <span>
          {t.level} {account.level ?? 1}
        </span>
      </Link>
    );
  }

  return (
    <>
      <Link href={`/${locale}/prihlaseni`} className={linkClass}>
        {loginLabel}
      </Link>
      <Link
        href={`/${locale}/registrace`}
        className="btn-bouncy bg-[var(--brand-500)] px-4 py-1.5 text-sm font-bold text-white"
      >
        {registerLabel}
      </Link>
    </>
  );
}
