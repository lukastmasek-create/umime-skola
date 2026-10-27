import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { ProfileView } from "@/components/ProfileView";
import { DailyChallenges } from "@/components/DailyChallenges";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <ProfileView locale={locale as Locale} />
      <div className="mt-6">
        <DailyChallenges locale={locale as Locale} showAchievements />
      </div>
    </div>
  );
}
