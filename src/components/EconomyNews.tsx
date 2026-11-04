"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getEconomyText } from "@/i18n/economy";
import { getEconomyNewsText } from "@/i18n/economy-news";
import type { Locale } from "@/i18n/config";

type Item = {
  id: string;
  kind: "founded" | "overtook";
  actorName: string;
  companyId: string | null;
  targetName: string | null;
  createdAt: string;
};
type Feed = { events: Item[]; mine: Item[]; loggedIn: boolean };

// Na úvodní stránce: poslední oznámení z Ekonomiky a upozornění, když tě někdo v žebříčku předehnal.
export function EconomyNews({ locale }: { locale: Locale }) {
  const t = getEconomyNewsText(locale);
  const econ = getEconomyText(locale);
  const [feed, setFeed] = useState<Feed | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/stale-hry/ekonomika/oznameni")
      .then((r) => r.json())
      .then((d) => !cancelled && !d.error && setFeed(d))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!feed) return null;

  const text = (e: Item) => {
    if (e.kind === "founded") {
      const company = econ.companies[e.companyId as keyof typeof econ.companies] ?? e.companyId ?? "";
      return t.founded.replace("{actor}", e.actorName).replace("{company}", company);
    }
    return t.overtook.replace("{actor}", e.actorName).replace("{target}", e.targetName ?? "—");
  };

  const overtaken = feed.mine[0];

  function markSeen() {
    setFeed((f) => (f ? { ...f, mine: [] } : f));
    fetch("/api/stale-hry/ekonomika/oznameni", { method: "POST" }).catch(() => {});
  }

  return (
    <div className="mt-6 flex flex-col gap-4">
      {overtaken && (
        <div role="status" className="border-2 border-[var(--edge)] bg-[var(--accent-yellow)] px-4 py-3 text-[#16132b]">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-bold">
            <span>🏁 {t.overtookYou.replace("{actor}", overtaken.actorName)}</span>
            <Link href={`/${locale}/stale-hry/ekonomika`} className="underline">
              {t.open}
            </Link>
            <button type="button" onClick={markSeen} className="ml-auto underline">
              {t.seen}
            </button>
          </div>
        </div>
      )}

      <section className="card p-5">
        <h2 className="mb-3 font-bold">📣 {t.title}</h2>
        {feed.events.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">{t.empty}</p>
        ) : (
          <ul className="flex flex-col gap-2 text-sm">
            {feed.events.slice(0, 5).map((e) => (
              <li key={e.id}>
                <span aria-hidden>{e.kind === "founded" ? "🏭" : "🏁"} </span>
                {text(e)}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
