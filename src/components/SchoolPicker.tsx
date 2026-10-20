"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCommunityText } from "@/i18n/community";
import type { Locale } from "@/i18n/config";

type School = { id: string; name: string; city: string };

export function SchoolPicker({ locale }: { locale: Locale }) {
  const t = getCommunityText(locale).school;
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [current, setCurrent] = useState<School | null>(null);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [suggestions, setSuggestions] = useState<School[]>([]);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/skola");
        const data = await res.json();
        if (cancelled) return;
        setLoggedIn(!!data.loggedIn);
        setCurrent(data.school ?? null);
      } catch {
        // offline or database unavailable: the picker just stays empty
      }
      if (!cancelled) setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const query = name.trim();
    if (query.length < 2) return;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/skola?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (!cancelled) setSuggestions(data.schools ?? []);
      } catch {
        if (!cancelled) setSuggestions([]);
      }
    }, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [name]);

  const shown = name.trim().length >= 2 ? suggestions : [];

  async function save() {
    setStatus("saving");
    try {
      const res = await fetch("/api/skola", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, city }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCurrent(data.school);
      setName("");
      setCity("");
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }

  async function leave() {
    setStatus("saving");
    try {
      const res = await fetch("/api/skola", { method: "DELETE" });
      if (!res.ok) throw new Error();
      setCurrent(null);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  const input =
    "w-full rounded-lg border-2 border-[var(--border-soft)] px-3 py-2 text-sm outline-none focus:border-[var(--brand-500)]";

  return (
    <section className="card p-6">
      <h2 className="mb-1 text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>
        {t.title}
      </h2>
      <p className="mb-4 text-sm text-[var(--muted)]">{t.hint}</p>

      {loading ? null : !loggedIn ? (
        <p className="text-sm text-[var(--muted)]">
          {t.loginRequired}{" "}
          <Link href={`/${locale}/prihlaseni`} className="font-semibold text-[var(--brand-600)] hover:underline">
            →
          </Link>
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[var(--surface-muted)] px-4 py-3 text-sm">
            <span>
              <span className="text-[var(--muted)]">{t.current}: </span>
              <span className="font-bold">
                {current ? `${current.name}${current.city ? `, ${current.city}` : ""}` : t.none}
              </span>
            </span>
            {current && (
              <button
                onClick={leave}
                className="text-xs font-semibold text-[var(--danger)] hover:underline"
              >
                {t.leave}
              </button>
            )}
          </div>

          <label className="flex flex-col gap-1 text-sm font-medium">
            {t.nameLabel}
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setStatus("idle");
              }}
              maxLength={80}
              autoComplete="off"
              className={input}
            />
          </label>

          {shown.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--faint)]">
                {t.suggestions}
              </p>
              <div className="flex flex-wrap gap-2">
                {shown.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setName(s.name);
                      setCity(s.city);
                    }}
                    className="rounded-lg border-2 border-[var(--border-soft)] px-3 py-1.5 text-left text-xs font-semibold hover:border-[var(--edge)]"
                  >
                    {s.name}
                    {s.city ? `, ${s.city}` : ""}
                  </button>
                ))}
              </div>
            </div>
          )}

          <label className="flex flex-col gap-1 text-sm font-medium">
            {t.cityLabel}
            <input
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                setStatus("idle");
              }}
              maxLength={60}
              autoComplete="off"
              className={input}
            />
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={save}
              disabled={name.trim().length < 3 || status === "saving"}
              className="btn-bouncy bg-[var(--brand-500)] px-5 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === "saving" ? t.saving : t.save}
            </button>
            {status === "saved" && (
              <span className="text-sm font-semibold text-[var(--accent-green)]">{t.saved}</span>
            )}
            {status === "error" && <span className="text-sm text-[var(--danger)]">{t.error}</span>}
          </div>
        </div>
      )}
    </section>
  );
}
