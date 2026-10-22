"use client";

import { useEffect, useState } from "react";
import { ACCOUNT_CHANGED_EVENT } from "@/lib/account-events";

export type Account =
  | {
      loggedIn: true;
      degraded?: boolean;
      name: string | null;
      avatar: string;
      frame?: string | null;
      banner?: string | null;
      title: string | null;
      points: number;
      school: { name: string; city: string } | null;
      unlocks: string[];
      level: number;
      xp: number;
      percent: number;
      neededForNext: number;
      intoLevel: number;
    }
  | { loggedIn: false }
  | null;

// Načte profil z /api/profil (null = ještě se načítá) a znovu ho načte, když
// stránka po přihlášení nebo změně profilu pošle ACCOUNT_CHANGED_EVENT.
export function useAccount() {
  const [account, setAccount] = useState<Account>(null);

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
    window.addEventListener(ACCOUNT_CHANGED_EVENT, load);
    return () => {
      cancelled = true;
      window.removeEventListener(ACCOUNT_CHANGED_EVENT, load);
    };
  }, []);

  return [account, setAccount] as const;
}
