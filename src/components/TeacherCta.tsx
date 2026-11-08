"use client";

import Link from "next/link";
import { useAccount } from "@/lib/use-account";
import type { Locale } from "@/i18n/config";

// Odkaz pro učitele: nepřihlášeného pošle rovnou na registraci (po ní a po přihlášení skončí v Týmech),
// přihlášeného rovnou do Týmů.
export function TeacherCta({ locale, className, children }: { locale: Locale; className?: string; children: React.ReactNode }) {
  const [account] = useAccount();
  const teams = `/${locale}/tymy`;
  const href = account?.loggedIn ? teams : `/${locale}/registrace?next=${encodeURIComponent(teams)}`;
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
