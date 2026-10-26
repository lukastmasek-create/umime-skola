"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";

const TEXT: Record<Locale, { title: string; body: string; home: string; courses: string }> = {
  cs: {
    title: "Tahle stránka se ztratila",
    body: "Odkaz je starý, nebo stránka neexistuje. Zkus to od začátku.",
    home: "Na úvodní stránku",
    courses: "Procházet kurzy",
  },
  en: {
    title: "This page got lost in space",
    body: "The link is old or the page doesn't exist. Start again from the beginning.",
    home: "Back to the homepage",
    courses: "Browse courses",
  },
  de: {
    title: "Diese Seite hat sich verirrt",
    body: "Der Link ist alt oder die Seite existiert nicht. Fang am besten von vorn an.",
    home: "Zur Startseite",
    courses: "Kurse ansehen",
  },
  ru: {
    title: "Эта страница потерялась",
    body: "Ссылка устарела или страницы не существует. Начни сначала.",
    home: "На главную",
    courses: "Смотреть курсы",
  },
};

export default function NotFound() {
  // not-found nedostává params, jazyk proto vezmeme z první části adresy.
  const first = usePathname().split("/")[1] ?? "";
  const locale: Locale = isLocale(first) ? first : defaultLocale;
  const t = TEXT[locale];

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-20 text-center sm:py-28">
      <p
        className="text-7xl font-extrabold text-[var(--brand-500)] sm:text-8xl"
        style={{ fontFamily: "var(--font-heading)" }}
        aria-hidden
      >
        404
      </p>
      <h1 className="mt-4 text-2xl font-bold sm:text-3xl" style={{ fontFamily: "var(--font-heading)" }}>
        {t.title}
      </h1>
      <p className="mt-3 text-[var(--muted)]">{t.body}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href={`/${locale}`} className="btn-bouncy bg-[var(--brand-500)] px-5 py-2.5 font-bold text-white">
          {t.home}
        </Link>
        <Link href={`/${locale}/kurzy`} className="btn-bouncy bg-[var(--surface)] px-5 py-2.5 font-bold">
          {t.courses}
        </Link>
      </div>
    </div>
  );
}
