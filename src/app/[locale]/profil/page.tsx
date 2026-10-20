import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { ProfileView } from "@/components/ProfileView";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <ProfileView locale={locale as Locale} />
    </div>
  );
}
