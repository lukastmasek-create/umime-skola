import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, type Locale } from "@/i18n/config";
import { Wheel } from "@/components/Wheel";
import { BuyPointsCard } from "@/components/BuyPointsCard";
import { Icon } from "@/components/Icon";
import { GammyShop } from "@/components/GammyShop";
import { getPlayerMarketText } from "@/i18n/player-market";
import { staticPageMetadata } from "@/lib/seo";

export const revalidate = 0;

// image = stánek z public/home/obchod (stanek-<image>.webp); čím větší balíček, tím víc pokladu.
const POINT_PACKAGES = [
  { points: 100, price: "49 Kč", popular: false, image: "mince" },
  { points: 300, price: "99 Kč", popular: true, image: "truhla" },
  { points: 1000, price: "249 Kč", popular: false, image: "poklad" },
];
// Barvy a náklon karet balíčků (stejná paleta jako karty kategorií na homepage).
const PACKAGE_ACCENTS = ["#ffc933", "#ff8a6b", "#8fd0ff"];
const PACKAGE_TILTS = [-2.5, 1.5, -1.5];
// Velká karta vlevo nahoře: vezme balíček označený jako nejoblíbenější.
const FEATURED_PACKAGE = POINT_PACKAGES.find((p) => p.popular) ?? POINT_PACKAGES[0];

export const generateMetadata = staticPageMetadata("/obchod");

export default async function ShopPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale as Locale);

  const pm = getPlayerMarketText(locale as Locale);
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

  let players: number | null = null;
  try {
    players = await prisma.user.count();
  } catch {
    players = null;
  }

  return (
    <div className="shop-pcard mx-auto max-w-[96rem] px-4 py-6 sm:px-6 sm:py-10 lg:px-10">
      <GammyShop
        locale={locale as Locale}
        loggedIn={!!userId}
        players={players}
        featured={
          <article className="gammy-panel flex h-full flex-col gap-4 p-5">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-[var(--g-accent)] px-3 py-1 text-xs font-bold text-[var(--g-accent-ink)]">Nejoblíbenější</span>
              <span className="rounded-full border border-[var(--g-line)] px-3 py-1 text-xs font-bold text-[var(--muted)]">{FEATURED_PACKAGE.points} bodů</span>
            </div>
            <div className="flex flex-1 items-center justify-center rounded-2xl bg-[var(--g-bg)] p-4">
              <Icon name={`balicek-${FEATURED_PACKAGE.image}`} size={180} />
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                Truhla s {FEATURED_PACKAGE.points} body
              </h2>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Body získáš učením i kolem štěstí. Za ně si koupíš avatary, mazlíčky nebo budovy do města.
              </p>
            </div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-2xl font-bold">{FEATURED_PACKAGE.price}</p>
              <a href="#body" className="rounded-full bg-[var(--g-accent)] px-5 py-2 text-sm font-bold text-[var(--g-accent-ink)]">
                Vybrat
              </a>
            </div>
          </article>
        }
        topUp={
          <div className="pcard-shelf grid gap-8 sm:grid-cols-3">
            {POINT_PACKAGES.map((pkg, i) => (
              <BuyPointsCard key={pkg.points} pkg={pkg} dict={dict} accent={PACKAGE_ACCENTS[i]} tilt={PACKAGE_TILTS[i]} num={String(i + 1).padStart(2, "0")} />
            ))}
          </div>
        }
        wheel={
          <Wheel
            locale={locale as Locale}
            dict={dict}
            loggedIn={!!userId}
            initialPoints={points}
            initialNextSpinAt={nextSpinAt}
          />
        }
      />

      <a
        href={`/${locale}/trziste`}
        className="card card-hover mt-12 flex items-center gap-4 p-6"
      >
        <span aria-hidden className="text-5xl"></span>
        <span className="flex-1">
          <span className="block text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>{pm.title}</span>
          <span className="block text-sm text-[var(--muted)]">{pm.intro}</span>
        </span>
        <span className="btn-bouncy rounded-full bg-[var(--brand-500)] px-4 py-2 text-sm font-semibold text-white">{pm.open}</span>
      </a>
    </div>
  );
}
