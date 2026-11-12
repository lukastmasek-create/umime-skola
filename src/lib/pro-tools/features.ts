// Seznam PRO nástrojů. `slug` je adresa /[locale]/pro/[slug].
export const PRO_FEATURES = [
  { slug: "doucovatel" },
  { slug: "plan" },
  { slug: "zkouska" },
  { slug: "fotka" },
  { slug: "ustni", locales: ["en"] },
  { slug: "sesit-chyb" },
  { slug: "poznamky" },
  { slug: "vyslovnost" },
  { slug: "offline" },
  { slug: "rodina", tier: "FAMILY" },
  { slug: "souboj", tier: "FAMILY" },
  { slug: "prazdniny", tier: "FAMILY" },
  { slug: "skola", tier: "SCHOOL" },
] as const satisfies readonly { slug: string; tier?: "FAMILY" | "SCHOOL"; locales?: readonly string[] }[];

export type ProFeatureSlug = (typeof PRO_FEATURES)[number]["slug"];

/** Tarif, který nástroj vyžaduje (bez něj stačí jakékoli PRO). */
export function featureTier(slug: ProFeatureSlug): "FAMILY" | "SCHOOL" | undefined {
  const f = PRO_FEATURES.find((x) => x.slug === slug) as { tier?: "FAMILY" | "SCHOOL" } | undefined;
  return f?.tier;
}

export function isProFeature(slug: string): slug is ProFeatureSlug {
  return PRO_FEATURES.some((f) => f.slug === slug);
}

// Záložky stránek UčímePRO: každý nástroj patří právě do jedné (podle tarifu).
export const PRO_TABS = ["pro", "rodina", "skola"] as const;
export type ProTab = (typeof PRO_TABS)[number];

const TAB_TIER: Record<ProTab, "FAMILY" | "SCHOOL" | undefined> = {
  pro: undefined,
  rodina: "FAMILY",
  skola: "SCHOOL",
};

/** Nástroje patřící do dané záložky. */
export function featuresForTab(tab: ProTab) {
  return PRO_FEATURES.filter((f) => featureTier(f.slug) === TAB_TIER[tab]);
}

/** Adresa samostatné stránky záložky. */
export function proTabPath(tab: ProTab): string {
  return tab === "pro" ? "/pro" : `/${tab}`;
}

/** Nástroj je dostupný v daném jazyce. Bez omezení `locales` je dostupný všude. */
export function featureAvailableIn(slug: ProFeatureSlug, locale: string): boolean {
  const f = PRO_FEATURES.find((x) => x.slug === slug) as { locales?: readonly string[] } | undefined;
  return !f?.locales || f.locales.includes(locale);
}
