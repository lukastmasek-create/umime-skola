"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fill } from "@/i18n/profile";
import { getDailyText } from "@/i18n/daily";
import type { Locale } from "@/i18n/config";

const DISMISS_KEY = "umime:nudge-dismissed";
const REMIND_KEY = "umime:remind";
const EVENING_HOUR = 16;

function today() {
  return new Date().toLocaleDateString("sv");
}

function read(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // bez úložiště se jen nepamatuje volba
  }
}

// Večerní upozornění, že série dnes končí. Ukáže se jako lišta nad stránkou a,
// pokud si to hráč zapnul, i jako oznámení prohlížeče (funguje při otevřeném webu;
// skutečné push upozornění by potřebovalo server s push službou).
export function ReturnNudge({ locale }: { locale: Locale }) {
  const t = getDailyText(locale);
  const [streak, setStreak] = useState(0);
  const [remind, setRemind] = useState(false);
  const [canNotify, setCanNotify] = useState(false);

  useEffect(() => {
    if (new Date().getHours() < EVENING_HOUR || read(DISMISS_KEY) === today()) return;
    let cancelled = false;
    fetch("/api/denni-vyzvy")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled || !data.loggedIn || data.error || !data.streak?.atRisk) return;
        setStreak(data.streak.current);
        const supported = typeof Notification !== "undefined";
        setCanNotify(supported && Notification.permission !== "denied");
        const on = supported && Notification.permission === "granted" && read(REMIND_KEY) === "1";
        setRemind(on);
        if (on && read("umime:notified") !== today()) {
          write("umime:notified", today());
          new Notification(fill(t.nudgeStreak, data.streak.current));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [t.nudgeStreak]);

  async function enable() {
    if (typeof Notification === "undefined") return;
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      write(REMIND_KEY, "1");
      setRemind(true);
    }
  }

  if (streak <= 0) return null;

  return (
    <div className="border-b-2 border-[var(--edge)] bg-[var(--accent-yellow)] px-4 py-2 text-[#16132b]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-1 text-sm font-bold">
        <span>🔥 {fill(t.nudgeStreak, streak)}</span>
        <Link href={`/${locale}/kurzy/zakladni`} className="underline">
          {t.nudgeOpen}
        </Link>
        {canNotify && !remind && (
          <button type="button" onClick={enable} className="underline">
            🔔 {t.remindOn}
          </button>
        )}
        {remind && <span className="font-semibold">🔔 {t.remindOff}</span>}
        <button
          type="button"
          onClick={() => {
            write(DISMISS_KEY, today());
            setStreak(0);
          }}
          className="ml-auto"
          aria-label={t.nudgeDismiss}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
