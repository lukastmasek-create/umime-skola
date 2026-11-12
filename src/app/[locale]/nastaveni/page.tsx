"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, type Locale } from "@/i18n/config";
import { SettingsForm } from "@/components/SettingsForm";
import { SpaceShell } from "@/components/SpaceShell";

export default function NastaveniPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale as Locale);

  return (
    <SpaceShell title={dict.settings.title} full>
      <SettingsForm locale={locale as Locale} dict={dict} />
    </SpaceShell>
  );
}
