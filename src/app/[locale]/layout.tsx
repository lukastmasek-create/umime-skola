import type { Metadata } from "next";
import Link from "next/link";
import { Pixelify_Sans, Onest, Pangolin, Jersey_10 } from "next/font/google";
import "../globals.css";
import "../site-chrome.css";
import "../learning-motion.css";
import { HeaderShop, MobileMenu, NavTabs } from "@/components/NavTabs";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { HeaderAccount } from "@/components/HeaderAccount";
import { ReturnNudge } from "@/components/ReturnNudge";
import { SiteLogo } from "@/components/SiteLogo";
import { SketchIcon } from "@/components/SketchIcons";
import { HeaderScroll } from "@/components/HeaderScroll";
import { PencilScrollbar } from "@/components/PencilScrollbar";
import { GlobalShortcuts } from "@/components/GlobalShortcuts";
import { CookieNotice } from "@/components/CookieNotice";
import { SiteMotion } from "@/components/SiteMotion";
import { OffscreenPause } from "@/components/OffscreenPause";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { notFound } from "next/navigation";
import { THEME_INIT_SCRIPT } from "@/lib/theme-init-script";
import { ParentalGuard } from "@/components/ParentalGuard";
import { getContactText } from "@/i18n/contact";
import { getHomeText } from "@/i18n/home";
import { CONTACT_EMAIL, INSTAGRAM_HANDLE, INSTAGRAM_URL, getFooterLinks } from "@/i18n/legal";
import { SITE_URL } from "@/lib/seo";
import { tr8 } from "@/i18n/config";

const SKIP_LINK = tr8("Přeskočit na obsah", "Skip to content", "Zum Inhalt springen", "Перейти к содержимому", "Перейти до вмісту", "本文へスキップ", "Saltar al contenido", "Aller au contenu");

// Pixelový nadpisový font (Minecraft styl) s latin-ext pro češtinu.
const heading = Pixelify_Sans({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading",
});

// Písmo hlavního nadpisu úvodní stránky (ručně psané, s azbukou a latin-ext).
const heroFont = Pangolin({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: "400",
  variable: "--font-hero",
});

// Pixelové písmo pro nadpisy a tlačítka „arkádového“ vzhledu (Stálé hry, Únikovky, Materiály, Moje sady).
const pixel = Jersey_10({
  subsets: ["latin", "latin-ext"],
  weight: "400",
  variable: "--font-pixel",
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
      className={`h-full antialiased ${heading.variable} ${body.variable} ${heroFont.variable} ${pixel.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body
        className="min-h-full flex flex-col text-[var(--foreground)]"
        style={{ fontFamily: "var(--font-body), var(--font-sans)" }}
      >
        <a href="#obsah" className="skip-link">
          {SKIP_LINK[locale as Locale]}
        </a>
        <header className="site-header sticky top-0 z-40 bg-[var(--surface)]">
          <HeaderScroll />
          <div className="site-header-in mx-auto flex max-w-6xl items-center justify-between gap-1.5 px-3 py-1.5 min-[400px]:gap-3 min-[400px]:px-4 sm:px-6 xl:max-w-7xl">
            <Link href={`/${locale}`} className="site-logo shrink-0">
              <SiteLogo />
            </Link>
            <NavTabs locale={locale as Locale} dict={dict} />
            <div className="flex shrink-0 items-center justify-end gap-1 text-sm sm:gap-1.5">
              <HeaderShop locale={locale as Locale} label={dict.nav.shop} />
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
        <PencilScrollbar />
        <SiteMotion />
        <OffscreenPause />
        <GlobalShortcuts locale={locale as Locale} dict={dict} />
        <main id="obsah" tabIndex={-1} className="world flex-1 outline-none">{children}</main>
        <footer className="site-footer relative bg-[var(--surface)] px-4 py-10 text-sm text-[var(--muted)]">
          <div className="mx-auto max-w-6xl">
            <div className="footer-brand mb-7 flex flex-wrap items-center justify-between gap-5">
              <Link href={`/${locale}`} aria-label="Učíme se hrou"><SiteLogo /></Link>
              <Link href={`/${locale}/pro`} className="footer-shop">{dict.nav.shop} <span aria-hidden>↗</span></Link>
            </div>
            <nav className="flex flex-wrap items-center justify-start gap-x-6 gap-y-2 font-semibold">
              <Link href={`/${locale}#o-nas`} className="footer-link">
                <SketchIcon kind="info" size={16} className="sketch-chip-ico" />
                {getHomeText(locale as Locale).about.title}
              </Link>
              <Link href={`/${locale}/kontakt`} className="footer-link">
                <SketchIcon kind="mail" size={16} className="sketch-chip-ico" />
                {getContactText(locale as Locale).nav}
              </Link>
              <Link href={`/${locale}/ochrana-soukromi`} className="footer-link">
                <SketchIcon kind="shield" size={16} className="sketch-chip-ico" />
                {getFooterLinks(locale as Locale).privacy}
              </Link>
              <Link href={`/${locale}/podminky`} className="footer-link">
                <SketchIcon kind="scroll" size={16} className="sketch-chip-ico" />
                {getFooterLinks(locale as Locale).terms}
              </Link>
              <Link href={`/${locale}/zasady-cookies`} className="footer-link">
                <SketchIcon kind="info" size={16} className="sketch-chip-ico" />
                {getFooterLinks(locale as Locale).cookies}
              </Link>
              <CookieNotice locale={locale as Locale} />
            </nav>
            <div className="mt-2 flex flex-wrap items-center justify-start gap-x-6 gap-y-2">
              <a href={`mailto:${CONTACT_EMAIL}`} className="footer-link">
                <SketchIcon kind="mail" size={16} className="sketch-chip-ico" />
                {CONTACT_EMAIL}
              </a>
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="footer-link">
                <SketchIcon kind="camera" size={16} className="sketch-chip-ico" />
                Instagram @{INSTAGRAM_HANDLE}
              </a>
            </div>
            <p className="mt-7 border-t border-[var(--border)] pt-5 text-xs">
              &copy; {new Date().getFullYear()} {dict.footer.rights}
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
