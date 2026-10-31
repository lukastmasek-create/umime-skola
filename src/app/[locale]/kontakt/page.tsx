import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContactForm } from "@/components/ContactForm";
import { getContactText } from "@/i18n/contact";
import { isLocale, type Locale } from "@/i18n/config";
import { auth } from "@/lib/auth";
import { topicFromQuery } from "@/lib/contact";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getContactText(locale);
  return { title: `${t.title} · Učíme se hrou`, description: t.subtitle };
}

export default async function ContactPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tema?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { tema } = await searchParams;
  const t = getContactText(locale as Locale);
  const initial = topicFromQuery(tema);

  // Přihlášenému předvyplníme jméno a e-mail; bez databáze/přihlášení formulář funguje taky.
  let name = "";
  let email = "";
  try {
    const session = await auth();
    name = session?.user?.name ?? "";
    email = session?.user?.email ?? "";
  } catch {
    /* přihlášení není pro formulář nutné */
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
      <h1 className="mb-1 text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
        {t.title}
      </h1>
      <p className="mb-8 text-[var(--muted)]">{t.subtitle}</p>
      <ContactForm locale={locale as Locale} initialCategory={initial.category} initialTopic={initial.topic} defaultName={name} defaultEmail={email} />
    </div>
  );
}
