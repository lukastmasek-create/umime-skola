"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

const DEBOUNCE_MS = 250;
const LIST_HASH = "vyber-kurzu";

// Hledání se spouští samo při psaní: po krátké pauze se dotaz zapíše do URL (?q=)
// a server vrátí přefiltrovaný seznam. Ostatní filtry v URL (předmět, třída) zůstávají.
export function CourseSearch({ initialQuery, label }: { initialQuery: string; label: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastApplied = useRef(initialQuery);

  const apply = (next: string) => {
    const url = new URL(window.location.href);
    const trimmed = next.trim();
    if (trimmed) url.searchParams.set("q", trimmed);
    else url.searchParams.delete("q");
    url.hash = LIST_HASH;
    if (trimmed === lastApplied.current) return;
    lastApplied.current = trimmed;
    router.replace(`${url.pathname}${url.search}${url.hash}`, { scroll: false });
  };

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => apply(value), DEBOUNCE_MS);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Enter (a formulář bez JS) použije hledání hned, bez čekání na pauzu.
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (timer.current) clearTimeout(timer.current);
    apply(value);
  };

  return (
    <form role="search" onSubmit={onSubmit} className="mb-6">
      <input
        type="search"
        name="q"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-label={label}
        placeholder={label}
        maxLength={100}
        autoComplete="off"
        className="w-full rounded-lg border-2 border-[var(--edge)] bg-[var(--surface)] px-3 py-2 text-sm"
      />
    </form>
  );
}
