"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { ArenaBackdrop } from "@/components/arena/ArenaBackdrop";
import { getLiveText } from "@/i18n/live";
import type { Locale } from "@/i18n/config";
import { MODES } from "@/lib/live/logic";
import { MODE_ACCENT } from "./shared";

export function LiveHome({ locale }: { locale: Locale }) {
  const t = getLiveText(locale);
  const router = useRouter();
  const [pin, setPin] = useState("");
  const input = useRef<HTMLInputElement>(null);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (/^\d{6}$/.test(pin)) router.push(`/${locale}/hrat-spolecne/${pin}`);
  }

  return (
    <div className="arena-stage mx-auto max-w-6xl px-4 py-10 sm:px-8 sm:py-14">
      <ArenaBackdrop variant="neutral" />
      <header className="mb-8 flex flex-col gap-3">
        <span className="arena-eyebrow w-fit">🎮 {t.nav}</span>
        <h1 className="text-4xl font-black sm:text-5xl" style={{ fontFamily: "var(--font-heading)" }}>
          {t.title}
        </h1>
        <p className="max-w-2xl text-lg" style={{ color: "#cfc8e4" }}>
          {t.subtitle}
        </p>
      </header>

      <div className="grid gap-5 md:grid-cols-5">
        <form onSubmit={submit} className="arena-panel flex flex-col gap-4 md:col-span-3">
          <h2 className="text-2xl font-black">{t.join.title}</h2>
          <p className="text-sm" style={{ color: "#cfc8e4" }}>{t.join.hint}</p>
          <label className="relative block cursor-text" onClick={() => input.current?.focus()}>
            <span className="sr-only">{t.join.pin}</span>
            <div className="arena-pin" aria-hidden>
              {Array.from({ length: 6 }, (_, i) => (
                <span key={i} className="arena-pin-cell" data-on={pin.length === i || pin.length > i ? "1" : "0"}>
                  {pin[i] ?? ""}
                </span>
              ))}
            </div>
            <input
              ref={input}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              autoComplete="off"
              autoFocus
              aria-label={t.join.pin}
              className="absolute inset-0 h-full w-full cursor-text opacity-0"
            />
          </label>
          <button type="submit" disabled={pin.length !== 6} className="arena-btn">
            {t.join.button} →
          </button>
        </form>

        <div className="arena-panel flex flex-col gap-3 md:col-span-2">
          <span aria-hidden className="text-4xl">🎓</span>
          <h2 className="text-2xl font-black">{t.host.title}</h2>
          <p className="text-sm" style={{ color: "#cfc8e4" }}>{t.host.hint}</p>
          <div className="mt-auto flex flex-wrap gap-3 pt-2">
            <Link href={`/${locale}/hrat-spolecne/nova`} className="arena-btn">
              {t.host.button}
            </Link>
            <Link href={`/${locale}/hrat-spolecne/sady`} className="arena-btn arena-btn-ghost">
              {t.create.manageSets}
            </Link>
          </div>
        </div>
      </div>

      <h2 className="mb-3 mt-10 text-lg font-black uppercase tracking-wide" style={{ color: "#cfc8e4" }}>
        {t.create.mode}
      </h2>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {MODES.map((m) => (
          <li key={m} className="arena-mode" style={{ ["--mode" as string]: MODE_ACCENT[m] }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/arena/emblem-${m.toLowerCase()}.webp`} alt="" width={88} height={88} loading="lazy" decoding="async" />
            <span className="font-black">{t.create.modes[m].name}</span>
            <span className="text-xs leading-snug" style={{ color: "#cfc8e4" }}>{t.create.modes[m].description}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
