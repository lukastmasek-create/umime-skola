import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, type Locale } from "@/i18n/config";
import { Wheel } from "@/components/Wheel";
import { BuyPointsCard } from "@/components/BuyPointsCard";

export const revalidate = 0;

// image = stánek z public/home/obchod (stanek-<image>.webp); čím větší balíček, tím víc pokladu.
const POINT_PACKAGES = [
  { points: 100, price: "49 Kč", popular: false, image: "mince" },
  { points: 300, price: "99 Kč", popular: true, image: "truhla" },
  { points: 1000, price: "249 Kč", popular: false, image: "poklad" },
];

export default async function ShopPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale as Locale);

  const session = await auth();
  const userId = session?.user?.id;

  let points = 0;
  let nextSpinAt: string | null = null;
  if (userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { points: true, lastWheelSpinAt: true },
      });
      points = user?.points ?? 0;
      if (user?.lastWheelSpinAt) {
        nextSpinAt = new Date(user.lastWheelSpinAt.getTime() + 24 * 60 * 60 * 1000).toISOString();
      }
    } catch {
      points = 0;
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
      <h1 className="mb-1 text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
        {dict.shop.title}
      </h1>
      <p className="mb-10 text-[var(--muted)]">{dict.shop.subtitle}</p>

      <Wheel
        locale={locale as Locale}
        dict={dict}
        loggedIn={!!userId}
        initialPoints={points}
        initialNextSpinAt={nextSpinAt}
      />

      <div className="mt-12">
        <h2 className="mb-1 text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          {dict.shop.buyTitle.replace(/^[^a-zA-ZÀ-ɏА-я0-9]+/, "")}
        </h2>
        <p className="mb-6 text-sm text-[var(--muted)]">{dict.shop.buyDesc}</p>
        <div className="grid gap-5 sm:grid-cols-3">
          {POINT_PACKAGES.map((pkg) => (
            <BuyPointsCard key={pkg.points} pkg={pkg} dict={dict} />
          ))}
        </div>
      </div>
    </div>
  );
}
