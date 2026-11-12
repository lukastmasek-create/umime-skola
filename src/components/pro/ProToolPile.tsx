import type { Locale } from "@/i18n/config";
import { getProToolsText } from "@/i18n/pro-tools";
import type { ProFeatureSlug } from "@/lib/pro-tools/features";
import { PaperCard } from "@/components/PaperCard";
import { ProIcon } from "@/components/pro/ProIcon";

export const FEATURE_COLORS = ["#ffc933", "#ff8a6b", "#8fd0ff", "#7ee0b0"];

// Karty nástrojů (stejný vzhled na všech záložkách).
export function ProToolPile({ locale, slugs }: { locale: Locale; slugs: readonly { slug: ProFeatureSlug }[] }) {
  const tools = getProToolsText(locale);
  return (
    <div className="pcard-pile pcard-pile-wide">
      {slugs.map((f, i) => (
        <PaperCard
          key={f.slug}
          href={`/${locale}/pro/${f.slug}`}
          accent={FEATURE_COLORS[i % FEATURE_COLORS.length]}
          num={i + 1}
          icon={<ProIcon name={f.slug} className="pcard-icon size-14 text-[#f6f1e4]" />}
          title={tools.features[f.slug].title}
          text={tools.features[f.slug].text}
        />
      ))}
    </div>
  );
}
