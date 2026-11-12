"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { getProToolsText } from "@/i18n/pro-tools";
import type { PlanDay, PlanTask } from "@/lib/pro-tools/plan";
import { errorText, proFetch } from "./api";

// Osobní plán učení: sedm dní po 15 minutách podle slabých míst.
export function StudyPlan({ locale }: { locale: Locale }) {
  const t = getProToolsText(locale);
  const [plan, setPlan] = useState<PlanDay[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    void proFetch<{ plan: PlanDay[] }>("/api/pro/plan").then((r) => (r.ok ? setPlan(r.data.plan) : setError(errorText(t, r.error))));
  }, [t]);

  if (error) return <p className="card p-4 text-sm font-semibold">{error}</p>;
  if (!plan) return <p className="text-sm text-[var(--muted)]">{t.loading}</p>;

  const fmt = new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "numeric" });

  function label(task: PlanTask) {
    switch (task.kind) {
      case "review":
        return { text: task.due > 0 ? t.planReviewDue.replace("{n}", String(task.due)) : t.planReview, href: `/${locale}/opakovani` };
      case "weak":
        return { text: t.planWeak.replace("{course}", task.title), href: `/${locale}/kurzy/${task.href}` };
      case "fresh":
        return { text: t.planFresh.replace("{course}", task.title), href: `/${locale}/kurzy/${task.href}` };
      case "exam":
        return { text: t.planExam, href: `/${locale}/pro/zkouska` };
      default:
        return { text: t.planRest, href: `/${locale}/opakovani` };
    }
  }

  return (
    <div>
      <p className="mb-4 text-sm text-[var(--muted)]">{t.planIntro}</p>
      <ol className="grid gap-3">
        {plan.map((d, i) => (
          <li key={d.date} className={`card p-4 ${i === 0 ? "ring-2 ring-[var(--brand-500)]" : ""}`}>
            <p className="mb-2 flex items-center justify-between text-sm font-bold">
              <span className="capitalize">{i === 0 ? t.today : fmt.format(new Date(d.date + "T12:00:00"))}</span>
              <span className="text-[var(--muted)]">{d.tasks.reduce((s, x) => s + x.minutes, 0)} min</span>
            </p>
            <ul className="grid gap-2">
              {d.tasks.map((task, j) => {
                const l = label(task);
                return (
                  <li key={j}>
                    <Link href={l.href} className="flex items-center justify-between gap-3 rounded-xl border-2 border-[var(--edge)] px-3 py-2 text-sm font-semibold hover:bg-[var(--surface-muted)]">
                      <span>{l.text}</span>
                      <span className="shrink-0 text-xs text-[var(--muted)]">{task.minutes} min</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}
