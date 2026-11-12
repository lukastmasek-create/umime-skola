import type { Metadata } from "next";
import Link from "next/link";
import { Unbounded, Onest, Pangolin } from "next/font/google";
import "../globals.css";
import { MobileMenu, NavTabs } from "@/components/NavTabs";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { HeaderAccount } from "@/components/HeaderAccount";
import { ReturnNudge } from "@/components/ReturnNudge";
import { SiteLogo } from "@/components/SiteLogo";
import { SketchEdge } from "@/components/SketchEdge";
import { SketchIcon } from "@/components/SketchIcons";
import { HeaderScroll } from "@/components/HeaderScroll";
import { PencilScrollbar } from "@/components/PencilScrollbar";
import { GlobalShortcuts } from "@/components/GlobalShortcuts";
import { SiteMotion } from "@/components/SiteMotion";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { notFound } from "next/navigation";
import { THEME_INIT_SCRIPT } from "@/lib/theme-init-script";
import { ParentalGuard } from "@/components/ParentalGuard";
import { EconomyTicker } from "@/components/EconomyTicker";
import { getContactText } from "@/i18n/contact";
import { getHomeText } from "@/i18n/home";
import { CONTACT_EMAIL, INSTAGRAM_HANDLE, INSTAGRAM_URL, getFooterLinks } from "@/i18n/legal";
import { SITE_URL } from "@/lib/seo";

const heading = Unbounded({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["500", "700", "800"],
  variable: "--font-heading",
});

// Písmo hlavního nadpisu úvodní stránky (ručně psané, s azbukou a latin-ext).
const heroFont = Pangolin({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: "400",
  variable: "--font-hero",
});

const body = Onest({
  subsets: ["latin", "latin-ext", "cyrillic"],
  variable: "--font-body",
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

const SITE_NAME = "Učíme se hrou";
const SITE_DESCRIPTION = "Online příprava na základku, střední, přijímačky i maturitu";

// Ikony a favicon jsou souborové konvence v src/app (icon.svg, apple-icon.png, favicon.ico,
// manifest.ts), náhled odkazu v této složce (opengraph-image.png, twitter-image.png).
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s · ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: { title: SITE_NAME, description: SITE_DESCRIPTION, siteName: SITE_NAME, type: "website" },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale as Locale);

  const navLink =
    "rounded-lg px-2 py-1.5 text-xs font-semibold text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)] sm:px-3 sm:py-2 sm:text-sm";

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`h-full antialiased ${heading.variable} ${body.variable} ${heroFont.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body
        className="min-h-full flex flex-col text-[var(--foreground)]"
        style={{ fontFamily: "var(--font-body), var(--font-sans)" }}
      >
        <header className="site-header sticky top-0 z-40 bg-[var(--surface)]">
          <HeaderScroll />
          <SketchEdge position="bottom" />
          <div className="site-header-in mx-auto flex max-w-6xl items-center justify-between gap-1.5 px-3 py-1.5 min-[400px]:gap-3 min-[400px]:px-4 sm:px-6 xl:max-w-7xl">
            <Link href={`/${locale}`} className="site-logo shrink-0">
              <SiteLogo />
            </Link>
            <NavTabs locale={locale as Locale} dict={dict} />
            <div className="flex shrink-0 items-center justify-end gap-1 text-sm sm:gap-1.5">
              <LanguageSwitcher current={locale as Locale} />
              <HeaderAccount
                locale={locale as Locale}
                loginLabel={dict.nav.login}
                registerLabel={dict.nav.register}
                linkClass={navLink}
              />
              <MobileMenu locale={locale as Locale} dict={dict} />
            </div>
          </div>
        </header>
        <ReturnNudge locale={locale as Locale} />
        <ParentalGuard locale={locale as Locale} />
        <EconomyTicker locale={locale as Locale} />
        <PencilScrollbar />
        <SiteMotion />
        <GlobalShortcuts locale={locale} />
        <main className="world flex-1">{children}</main>
        <footer className="relative bg-[var(--surface)] px-4 py-6 text-center text-sm text-[var(--muted)]">
          <SketchEdge position="top" />
          <span className="sketch-doodles" aria-hidden>
            <SketchIcon kind="pencil" size={26} className="sketch-doodle sketch-doodle-pencil" />
            <SketchIcon kind="star" size={18} className="sketch-doodle sketch-doodle-star" />
            <SketchIcon kind="sparkle" size={22} className="sketch-doodle sketch-doodle-sparkle" />
            <SketchIcon kind="star" size={14} className="sketch-doodle sketch-doodle-star2" />
          </span>
          <nav className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 font-semibold">
            <Link href={`/${locale}#o-nas`} className="sketch-chip">
              <SketchIcon kind="info" size={16} className="sketch-chip-ico" />
              {getHomeText(locale as Locale).about.title}
            </Link>
            <Link href={`/${locale}/kontakt`} className="sketch-chip">
              <SketchIcon kind="mail" size={16} className="sketch-chip-ico" />
              {getContactText(locale as Locale).nav}
            </Link>
            <Link href={`/${locale}/ochrana-soukromi`} className="sketch-chip">
              <SketchIcon kind="shield" size={16} className="sketch-chip-ico" />
              {getFooterLinks(locale as Locale).privacy}
            </Link>
            <Link href={`/${locale}/podminky`} className="sketch-chip">
              <SketchIcon kind="scroll" size={16} className="sketch-chip-ico" />
              {getFooterLinks(locale as Locale).terms}
            </Link>
            <Link href={`/${locale}/zasady-cookies`} className="sketch-chip">
              <SketchIcon kind="info" size={16} className="sketch-chip-ico" />
              {getFooterLinks(locale as Locale).cookies}
            </Link>
          </nav>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <a href={`mailto:${CONTACT_EMAIL}`} className="sketch-chip">
              <SketchIcon kind="mail" size={16} className="sketch-chip-ico" />
              {CONTACT_EMAIL}
            </a>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="sketch-chip">
              <SketchIcon kind="camera" size={16} className="sketch-chip-ico" />
              Instagram @{INSTAGRAM_HANDLE}
            </a>
          </div>
          <p className="mt-2">
            &copy; {new Date().getFullYear()} {dict.footer.rights}
          </p>
        </footer>
      </body>
    </html>
  );
}
