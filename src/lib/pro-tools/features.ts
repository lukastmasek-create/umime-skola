// Seznam PRO nástrojů. `slug` je adresa /[locale]/pro/[slug].
export const PRO_FEATURES = [
  { slug: "doucovatel" },
  { slug: "plan" },
  { slug: "zkouska" },
  { slug: "fotka" },
  { slug: "ustni" },
  { slug: "sesit-chyb" },
  { slug: "poznamky" },
  { slug: "vyslovnost" },
  { slug: "offline" },
  { slug: "rodina", tier: "FAMILY" },
  { slug: "souboj", tier: "FAMILY" },
  { slug: "prazdniny", tier: "FAMILY" },
  { slug: "skola", tier: "SCHOOL" },
] as const satisfies readonly { slug: string; tier?: "FAMILY" | "SCHOOL" }[];

export type ProFeatureSlug = (typeof PRO_FEATURES)[number]["slug"];

/** Tarif, který nástroj vyžaduje (bez něj stačí jakékoli PRO). */
export function featureTier(slug: ProFeatureSlug): "FAMILY" | "SCHOOL" | undefined {
  const f = PRO_FEATURES.find((x) => x.slug === slug) as { tier?: "FAMILY" | "SCHOOL" } | undefined;
  return f?.tier;
}

export function isProFeature(slug: string): slug is ProFeatureSlug {
  return PRO_FEATURES.some((f) => f.slug === slug);
}
