import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, isLocale, locales } from "@/i18n/config";

function detectLocale(request: NextRequest) {
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  if (cookieLocale && isLocale(cookieLocale)) return cookieLocale;

  const acceptLanguage = request.headers.get("accept-language");
  if (acceptLanguage) {
    const preferred = acceptLanguage
      .split(",")
      .map((part) => part.split(";")[0].trim().slice(0, 2));
    const match = preferred.find((lang) => isLocale(lang));
    if (match) return match;
  }

  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );
  if (hasLocale) return NextResponse.next();

  const locale = detectLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Statické soubory z public/ (rewards/, brand/, avatars-3d/, draco/, city/, pets/, cosmetics/, game-sprites/, game-models/, home/), ikony a manifest ze src/app
  // a náhled odkazu se na jazykovou verzi nepřesměrovávají. Náhled leží v [locale] a Next ho pro
  // všechny jazyky servíruje pod zástupným segmentem „-“ (/-/opengraph-image.png).
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|rewards/|brand/|avatars-3d/|draco/|city/|pets/|cosmetics/|game-sprites/|game-models/|home/|escape/|icon.svg|apple-icon.png|manifest.webmanifest|-/).*)",
  ],
};
