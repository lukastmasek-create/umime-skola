"use client";

import { SketchIcon } from "@/components/SketchIcons";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { locales, localeNames, localeFlags, type Locale } from "@/i18n/config";
import { setLocaleCookie } from "@/lib/locale-cookie";

export function LanguageSwitcher({ current }: { current: Locale }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // Odkaz na stejnou stránku v jiném jazyce. Při kliknutí se zachovají i parametry (filtry) a kotva.
  function hrefFor(locale: Locale) {
    const rest = pathname?.replace(/^\/(cs|en|de|ru|uk|ja|es|fr)(?=\/|$)/, "") || "";
    return `/${locale}${rest}`;
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex min-h-11 items-center gap-1.5 rounded-lg border-2 border-[var(--edge)] bg-[var(--surface)] px-2.5 py-1 text-sm font-semibold hover:bg-[var(--surface-muted)]"
        aria-label={`Language: ${localeNames[current]}`}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls="language-menu"
      >
        <span className="text-base leading-none" aria-hidden>{localeFlags[current]}</span>
        <span>{current.toUpperCase()}</span>
        <span className="text-[var(--muted)]"><SketchIcon kind="chevron" size={14} /></span>
      </button>
      {open && (
        <div id="language-menu" className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-xl border-2 border-[var(--edge)] bg-[var(--surface)] p-1.5 shadow-[4px_4px_0_var(--shadow-ink)]">
          {locales.map((locale) => (
            <Link
              key={locale}
              href={hrefFor(locale)}
              hrefLang={locale}
              lang={locale}
              aria-current={locale === current ? "true" : undefined}
              onClick={(e) => {
                setOpen(false);
                setLocaleCookie(locale);
                const { search, hash } = window.location;
                if (search || hash) {
                  e.preventDefault();
                  router.push(`${hrefFor(locale)}${search}${hash}`);
                }
              }}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                locale === current
                  ? "bg-[var(--brand-50)] text-[var(--brand-700)]"
                  : "hover:bg-[var(--surface-muted)]"
              }`}
            >
              <span className="text-base leading-none" aria-hidden>{localeFlags[locale]}</span>
              {localeNames[locale]}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
