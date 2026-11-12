"use client";

import Link from "next/link";
import { useState } from "react";
import type { Locale } from "@/i18n/config";
import { getProToolsText } from "@/i18n/pro-tools";
import { errorText, proFetch } from "./api";

// Uloží vygenerované otázky s odpovědí do vlastní sady otázek (AI doplní špatné možnosti).
export function SaveAsSet({ locale, title, items }: { locale: Locale; title: string; items: { question: string; answer: string }[] }) {
  const t = getProToolsText(locale);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [count, setCount] = useState(0);

  async function save() {
    setBusy(true);
    setError("");
    const r = await proFetch<{ id: string; count: number }>("/api/pro/ai", { mode: "toset", locale, title, items });
    setBusy(false);
    if (r.ok) setCount(r.data.count);
    else setError(errorText(t, r.error));
  }

  return (
    <div className="grid gap-2">
      {count > 0 ? (
        <p className="text-sm font-semibold text-[var(--accent-green)]">
          {t.saveSetDone.replace("{n}", String(count))}{" "}
          <Link href={`/${locale}/hrat-spolecne/sady`} className="underline">
            {t.saveSetOpen}
          </Link>
        </p>
      ) : (
        <button type="button" onClick={() => void save()} disabled={busy || items.length === 0} className="btn-bouncy btn-secondary w-fit px-4 py-2 text-sm font-bold disabled:opacity-50">
          {busy ? t.thinking : t.saveSet}
        </button>
      )}
      {error && <p className="text-sm font-semibold text-[#ff5d73]">{error}</p>}
    </div>
  );
}
