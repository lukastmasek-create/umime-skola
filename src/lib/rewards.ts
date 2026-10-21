import type { Locale } from "@/i18n/config";

// Grafika odměn z Blenderu (scéna umime-art/odmeny.blend) je v public/rewards.
// Statické obrázky mají 512 × 512 px, animace 256 × 256 px, vše s průhledným pozadím.
export const REWARDS_PATH = "/rewards";

export function rewardSrc(name: string) {
  return `${REWARDS_PATH}/${name}.webp`;
}

export type BadgeTierId = "bronz" | "stribro" | "zlato" | "diamant";

export type BadgeTier = {
  id: BadgeTierId;
  fromLevel: number;
  names: Record<Locale, string>;
};

// Odznak podle úrovně. Hranice sedí na odemykání avatarů (úroveň 20 = král).
export const BADGE_TIERS: BadgeTier[] = [
  { id: "bronz", fromLevel: 1, names: { cs: "Bronzový odznak", en: "Bronze badge", de: "Bronze-Abzeichen", ru: "Бронзовый значок" } },
  { id: "stribro", fromLevel: 5, names: { cs: "Stříbrný odznak", en: "Silver badge", de: "Silber-Abzeichen", ru: "Серебряный значок" } },
  { id: "zlato", fromLevel: 10, names: { cs: "Zlatý odznak", en: "Gold badge", de: "Gold-Abzeichen", ru: "Золотой значок" } },
  { id: "diamant", fromLevel: 20, names: { cs: "Diamantový odznak", en: "Diamond badge", de: "Diamant-Abzeichen", ru: "Алмазный значок" } },
];

export function getBadgeTier(level: number): BadgeTier {
  return BADGE_TIERS.findLast((tier) => level >= tier.fromLevel) ?? BADGE_TIERS[0];
}

export function getNextBadgeTier(level: number): BadgeTier | null {
  return BADGE_TIERS.find((tier) => tier.fromLevel > level) ?? null;
}

// Poháry pro 1., 2. a 3. místo.
export const TROPHIES = ["pohar_zlato", "pohar_stribro", "pohar_bronz"] as const;

// Středy horních ploch stupňů na podium.webp (podíl šířky a výšky obrázku) pro 1., 2. a 3. místo.
// Spočteno promítnutím scény v Blenderu (umime-art/scripts/project_podium.py).
export const PODIUM_SPOTS = [
  { left: 0.5, top: 0.3357 },
  { left: 0.2204, top: 0.408 },
  { left: 0.7796, top: 0.5221 },
] as const;

// Kolo štěstí: kolo-disk.webp se točí, kolo-stred.webp (náboj a ručička) leží nad ním.
// Políčka mají poloměr 0,19 až 0,92 jednotky na obrázku širokém 2,45 jednotky,
// takže popisky v poloměru 0,6 jsou ve 24,5 % šířky obrázku od středu.
export const WHEEL_LABEL_RADIUS = 0.6 / 2.45;
