import { RewardImage } from "@/components/RewardImage";
import { getBadgeTier, getNextBadgeTier } from "@/lib/rewards";
import { fill, getProfileText } from "@/i18n/profile";
import type { Locale } from "@/i18n/config";

// Odznak úrovně z Blenderu: stupeň podle úrovně a od které úrovně je další.
export function LevelBadge({ level, locale, size = 80 }: { level: number; locale: Locale; size?: number }) {
  const t = getProfileText(locale);
  const tier = getBadgeTier(level);
  const next = getNextBadgeTier(level);
  return (
    <div className="flex items-center gap-3">
      <RewardImage name={`odznak_${tier.id}-lesk`} size={size} alt={tier.names[locale]} />
      <div className="min-w-0 text-sm">
        <p className="font-bold">{tier.names[locale]}</p>
        {next && (
          <p className="text-xs text-[var(--faint)]">
            {next.names[locale]}: {fill(t.unlockAtLevel, next.fromLevel)}
          </p>
        )}
      </div>
    </div>
  );
}
