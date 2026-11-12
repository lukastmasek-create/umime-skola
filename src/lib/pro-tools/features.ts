// Seznam PRO nástrojů. `slug` je adresa /[locale]/pro/[slug].
export const PRO_FEATURES = [
  { slug: "doucovatel", icon: "🤖" },
  { slug: "plan", icon: "🗓️" },
  { slug: "zkouska", icon: "🎯" },
  { slug: "fotka", icon: "📷" },
  { slug: "ustni", icon: "🎤" },
  { slug: "sesit-chyb", icon: "📒" },
  { slug: "poznamky", icon: "📝" },
  { slug: "vyslovnost", icon: "🗣️" },
  { slug: "offline", icon: "📴" },
  { slug: "rodina", icon: "👨‍👩‍👧", tier: "FAMILY" },
  { slug: "souboj", icon: "⚔️", tier: "FAMILY" },
  { slug: "prazdniny", icon: "🏖️", tier: "FAMILY" },
  { slug: "skola", icon: "🏫", tier: "SCHOOL" },
] as const satisfies readonly { slug: string; icon: string; tier?: "FAMILY" | "SCHOOL" }[];

export type ProFeatureSlug = (typeof PRO_FEATURES)[number]["slug"];

/** Tarif, který nástroj vyžaduje (bez něj stačí jakékoli PRO). */
export function featureTier(slug: ProFeatureSlug): "FAMILY" | "SCHOOL" | undefined {
  const f = PRO_FEATURES.find((x) => x.slug === slug) as { tier?: "FAMILY" | "SCHOOL" } | undefined;
  return f?.tier;
}

export function isProFeature(slug: string): slug is ProFeatureSlug {
  return PRO_FEATURES.some((f) => f.slug === slug);
}
