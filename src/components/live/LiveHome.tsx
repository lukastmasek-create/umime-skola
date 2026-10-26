"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { getLiveText } from "@/i18n/live";
import type { Locale } from "@/i18n/config";

export function LiveHome({ locale }: { locale: Locale }) {
  const t = getLiveText(locale);
  const router = useRouter();
  const [pin, setPin] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    if (/^\d{6}$/.test(pin)) router.push(`/${locale}/hrat-spolecne/${pin}`);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
      <h1 className="mb-1 text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
        {t.title}
      </h1>
      <p className="mb-8 max-w-2xl text-[var(--muted)]">{t.subtitle}</p>
      <div className="grid gap-5 md:grid-cols-2">
        <form onSubmit={submit} className="card flex flex-col gap-4 p-6" style={{ background: "var(--surface)" }}>
          <span aria-hidden className="text-4xl">🎮</span>
          <h2 className="text-xl font-bold">{t.join.title}</h2>
          <p className="text-sm text-[var(--muted)]">{t.join.hint}</p>
          <label className="flex flex-col gap-1 text-sm font-semibold">
            {t.join.pin}
            <input
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              autoComplete="off"
              placeholder="123456"
              className="rounded-lg border-2 px-3 py-3 text-center font-mono text-3xl font-extrabold tracking-[0.3em] outline-none focus:border-[var(--brand-500)]"
            />
          </label>
          <button type="submit" disabled={pin.length !== 6} className="btn-bouncy btn-primary btn-lg disabled:opacity-50">
            {t.join.button}
          </button>
        </form>
        <div className="card flex flex-col gap-4 p-6" style={{ background: "var(--accent-yellow)", color: "#16132b" }}>
          <span aria-hidden className="text-4xl">🎓</span>
          <h2 className="text-xl font-bold">{t.host.title}</h2>
          <p className="text-sm">{t.host.hint}</p>
          <div className="mt-auto flex flex-wrap gap-3">
            <Link href={`/${locale}/hrat-spolecne/nova`} className="btn-bouncy btn-secondary btn-lg">
              {t.host.button}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
