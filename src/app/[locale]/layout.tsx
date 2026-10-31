import type { Metadata } from "next";
import Link from "next/link";
import { Unbounded, Onest } from "next/font/google";
import "../globals.css";
import { MobileMenu, NavTabs } from "@/components/NavTabs";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { HeaderAccount } from "@/components/HeaderAccount";
import { ReturnNudge } from "@/components/ReturnNudge";
import { SiteLogo } from "@/components/SiteLogo";
import { HeaderScroll } from "@/components/HeaderScroll";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { notFound } from "next/navigation";
import { THEME_INIT_SCRIPT } from "@/lib/theme-init-script";
import { ParentalGuard } from "@/components/ParentalGuard";
import { getContactText } from "@/i18n/contact";

const heading = Unbounded({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["500", "700", "800"],
  variable: "--font-heading",
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
  title: SITE_NAME,
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
    "rounded-lg px-3 py-2 text-sm font-semibold text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]";

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`h-full antialiased ${heading.variable} ${body.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body
        className="min-h-full flex flex-col text-[var(--foreground)]"
        style={{ fontFamily: "var(--font-body), var(--font-sans)" }}
      >
        <header className="site-header sticky top-0 z-40 border-b-2 border-[var(--edge)] bg-[var(--surface)]">
          <HeaderScroll />
          <div className="site-header-in mx-auto flex max-w-6xl flex-col gap-2 px-4 py-2.5 sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <Link href={`/${locale}`} className="site-logo shrink-0">
                <SiteLogo />
              </Link>
              <div className="flex items-center justify-end gap-1.5 text-sm">
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
            <NavTabs locale={locale as Locale} dict={dict} />
          </div>
        </header>
        <ReturnNudge locale={locale as Locale} />
        <ParentalGuard locale={locale as Locale} />
        <main className="world flex-1">{children}</main>
        <footer className="border-t-2 border-[var(--edge)] bg-[var(--surface)] py-6 text-center text-sm text-[var(--muted)]">
          &copy; {new Date().getFullYear()} {dict.footer.rights}
          <span aria-hidden> · </span>
          <Link href={`/${locale}/kontakt`} className="font-semibold hover:text-[var(--foreground)] hover:underline">
            {getContactText(locale as Locale).nav}
          </Link>
        </footer>
      </body>
    </html>
  );
}
