"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, type Locale } from "@/i18n/config";
import { SettingsForm } from "@/components/SettingsForm";

export default function NastaveniPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale as Locale);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
      <h1 className="mb-1 text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
        {dict.settings.title}
      </h1>
      <p className="mb-10 text-[var(--muted)]">{dict.settings.subtitle}</p>
      <SettingsForm locale={locale as Locale} dict={dict} />
    </div>
  );
}
