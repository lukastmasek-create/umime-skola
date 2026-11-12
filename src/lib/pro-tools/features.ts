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
] as const;

export type ProFeatureSlug = (typeof PRO_FEATURES)[number]["slug"];

export function isProFeature(slug: string): slug is ProFeatureSlug {
  return PRO_FEATURES.some((f) => f.slug === slug);
}
