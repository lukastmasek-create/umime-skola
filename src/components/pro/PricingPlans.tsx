"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { ProIcon } from "@/components/pro/ProIcon";

// Ceník UčímePRO s přepínačem měsíc / rok. Čísla jsou stejná jako v textech tarifů:
// rok = 10 měsíců (2 měsíce zdarma), škola se platí jen ročně.
type Labels = {
  monthly: string;
  yearly: string;
  best: string;
  perMonth: string;
  perYear: string;
  perMonthEq: string;
  saves: string;
  perMember: string;
  schoolPerYear: string;
};

export type PlanCard = { id: "individual" | "family" | "school"; title: string; text: string; color: string; perks: string[]; monthly: number | null; yearly: number; best?: boolean; members?: number };

const czk = (n: number, locale: string) => `${new Intl.NumberFormat(locale === "cs" ? "cs-CZ" : "en-GB").format(n)} Kč`;

export function PricingPlans({ plans, labels, locale }: { plans: PlanCard[]; labels: Labels; locale: string }) {
  const [yearly, setYearly] = useState(false);
  return (
    <div>
      <div role="group" aria-label={`${labels.monthly} / ${labels.yearly}`} className="mb-6 inline-flex rounded-full border-2 border-[var(--edge)] bg-[var(--surface)] p-1">
        {[false, true].map((y) => (
          <button
            key={String(y)}
            type="button"
            aria-pressed={yearly === y}
            onClick={() => setYearly(y)}
            className={`rounded-full px-5 py-2 text-sm font-bold transition-colors ${yearly === y ? "bg-[var(--brand-500)] text-white" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}
          >
            {y ? labels.yearly : labels.monthly}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((p) => {
          const showYear = yearly || p.monthly === null;
          const price = showYear ? p.yearly : (p.monthly as number);
          const save = p.monthly !== null ? p.monthly * 12 - p.yearly : 0;
          return (
            <article
              key={p.title}
              className={`card pro-plan relative flex flex-col px-7 pb-7 pt-8 ${p.best ? "pro-plan-best" : ""}`}
              style={{ "--plan": p.color } as CSSProperties}
            >
              {p.best && <span className="pro-plan-badge">{labels.best}</span>}
              <h3 className="text-xl font-bold">{p.title}</h3>
              <p className="mb-4 mt-1 text-sm text-[var(--muted)]">{p.text}</p>
              <p className="flex items-baseline gap-2">
                <span className="pro-price text-4xl font-extrabold tabular-nums">{czk(price, locale)}</span>
                <span className="text-sm text-[var(--muted)]">{showYear ? (p.monthly === null ? labels.schoolPerYear : labels.perYear) : labels.perMonth}</span>
              </p>
              <p className="mt-1 min-h-5 text-xs font-semibold text-[var(--brand-600)]">
                {showYear && p.monthly !== null && `${labels.perMonthEq.replace("{n}", czk(Math.round(p.yearly / 12), locale))} · ${labels.saves.replace("{n}", czk(save, locale))}`}
                {showYear && p.monthly === null && labels.perMonthEq.replace("{n}", czk(Math.round(p.yearly / 12), locale))}
                {!showYear && p.members && labels.perMember.replace("{n}", czk(Math.round(p.monthly! / p.members), locale))}
              </p>
              <ul className="mt-5 grid gap-2.5">
                {p.perks.map((perk, k) => (
                  <li key={perk} style={{ "--i": k } as CSSProperties} className="pro-perk flex items-start gap-2.5 border-t border-[var(--edge)]/20 pt-2.5 text-sm">
                    <ProIcon name="check" className="mt-0.5 size-4 shrink-0 text-[var(--accent-green)]" />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
              <Link href={`/${locale}/platba?plan=${p.id}&billing=${showYear ? "yearly" : "monthly"}`} className="btn-bouncy btn-primary btn-lg mt-6 inline-flex justify-center">
                {locale === "cs" ? "Prohlédnout demo tarifu →" : "Preview this plan →"}
              </Link>
            </article>
          );
        })}
      </div>
    </div>
  );
}
