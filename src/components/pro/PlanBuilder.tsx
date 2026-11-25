"use client";

import Link from "next/link";
import { useState } from "react";
import { ProIcon } from "@/components/pro/ProIcon";
import type { BuilderText } from "@/i18n/pro-builder";

import { PRO_ITEMS as ITEMS } from "@/lib/pro-prices";
const FULL = 200;

export function PlanBuilder({ t, locale }: { t: BuilderText; locale?: string }) {
  const [on, setOn] = useState<string[]>(["tutor"]);
  const [yearly, setYearly] = useState(false);
  const raw = ITEMS.filter((i) => on.includes(i.id)).reduce((s, i) => s + i.price, 0);
  const capped = raw > FULL;
  const month = Math.min(raw, FULL);
  const price = yearly ? month * 10 : month;
  const toggle = (id: string) => setOn((v) => (v.includes(id) ? v.filter((x) => x !== id) : [...v, id]));
  return (
    <section className="card mb-8 px-7 py-8">
      <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>{t.title}</h2>
      <p className="mb-5 mt-1 text-sm text-[var(--muted)]">{t.hint}</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ITEMS.map((i) => {
          const sel = on.includes(i.id);
          return (
            <button key={i.id} type="button" aria-pressed={sel} onClick={() => toggle(i.id)}
              className={`pro-pick flex flex-col items-start gap-1 rounded-[22px] border-2 px-5 py-4 text-left ${sel ? "is-on" : ""}`}>
              <span className="flex w-full items-center justify-between">
                <ProIcon name={i.icon} className="size-7 text-[var(--brand-600)]" />
                <span className="rounded-full bg-[var(--surface)] px-2.5 py-0.5 text-xs font-bold tabular-nums">+{i.price} Kč</span>
              </span>
              <span className="mt-1 font-bold">{t.items[i.id].title}</span>
              <span className="text-sm text-[var(--muted)]">{t.items[i.id].text}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-[22px] border-2 border-[var(--edge)] px-6 py-5">
        <div>
          <p className="text-sm text-[var(--muted)]">{t.total}</p>
          {on.length === 0 ? <p className="font-semibold">{t.pick}</p> : (
            <>
              <p className="flex items-baseline gap-2"><span className="text-4xl font-extrabold tabular-nums">{price} Kč</span><span className="text-sm text-[var(--muted)]">{yearly ? t.perYear : t.perMonth}</span></p>
              {capped && <p className="text-xs font-semibold text-[var(--brand-600)]">{t.allIn}. {t.capped.replace("{n}", `${yearly ? raw * 10 : raw} Kč`)}</p>}
            </>
          )}
        </div>
        <div role="group" className="inline-flex rounded-full border-2 border-[var(--edge)] p-1">
          {[false, true].map((y) => (
            <button key={String(y)} type="button" aria-pressed={yearly === y} onClick={() => setYearly(y)}
              className={`rounded-full px-5 py-2 text-sm font-bold ${yearly === y ? "bg-[var(--brand-500)] text-white" : "text-[var(--muted)]"}`}>{y ? t.yearly : t.monthly}</button>
          ))}
        </div>
      </div>
      {locale && on.length > 0 && <Link href={`/${locale}/platba?plan=custom&billing=${yearly ? "yearly" : "monthly"}&features=${on.join(",")}`} className="btn-bouncy btn-primary btn-lg mt-5 inline-flex">{locale === "cs" ? "Vyzkoušet tuto výbavu →" : "Try this toolkit →"}</Link>}
      <p className="mt-3 text-xs text-[var(--muted)]">{t.note}</p>
    </section>
  );
}
