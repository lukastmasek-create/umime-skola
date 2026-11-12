"use client";

import { useCallback, useSyncExternalStore, type Dispatch, type SetStateAction } from "react";
import { ACCOUNT_CHANGED_EVENT } from "@/lib/account-events";
import type { Favorites } from "@/lib/cosmetics";

export type Account =
  | {
      loggedIn: true;
      degraded?: boolean;
      name: string | null;
      avatar: string;
      // Adresa vlastní ikonky (přebarvený avatar), jinak null.
      icon?: string | null;
      frame?: string | null;
      banner?: string | null;
      favorites?: Favorites;
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

// Sdílený stav profilu pro celou stránku. Dřív si každá komponenta (hlavička, menu, úvodní
// stránka…) načítala /api/profil zvlášť, takže se při otevření stránky posílalo až sedm stejných
// požadavků. Teď je jeden zdroj: souběžné dotazy se slučují do jednoho požadavku a všichni
// odběratelé sdílejí stejnou hodnotu.
let account: Account = null;
let inFlight: Promise<void> | null = null;
const listeners = new Set<() => void>();
let eventBound = false;

function emit() {
  listeners.forEach((listener) => listener());
}

function fetchAccount(): Promise<void> {
  if (inFlight) return inFlight;
  inFlight = fetch("/api/profil")
    .then((res) => res.json())
    .then((data: Account) => {
      account = data;
    })
    .catch(() => {
      account = { loggedIn: false };
    })
    .finally(() => {
      inFlight = null;
      emit();
    });
  return inFlight;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!eventBound && typeof window !== "undefined") {
    // Po přihlášení nebo změně profilu stačí načíst data jednou, ať je v hlavičce i na stránce.
    window.addEventListener(ACCOUNT_CHANGED_EVENT, () => void fetchAccount());
    eventBound = true;
  }
  void fetchAccount();
  return () => {
    listeners.delete(listener);
  };
}

function setSharedAccount(value: SetStateAction<Account>) {
  account = typeof value === "function" ? value(account) : value;
  emit();
}

const getServerSnapshot = (): Account => null;
const getSnapshot = (): Account => account;

// Načte profil z /api/profil (null = ještě se načítá) a znovu ho načte, když
// stránka po přihlášení nebo změně profilu pošle ACCOUNT_CHANGED_EVENT.
export function useAccount() {
  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const setAccount = useCallback<Dispatch<SetStateAction<Account>>>((next) => setSharedAccount(next), []);
  return [value, setAccount] as const;
}
