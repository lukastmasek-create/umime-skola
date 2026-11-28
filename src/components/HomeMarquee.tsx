import Link from "next/link";
import { Icon } from "@/components/Icon";

type Item = { slug: string; label: string; color: string };

// Nekonečný pás předmětů mezi sekcemi. Obsah je dvakrát za sebou, posun o -50 % dává plynulou smyčku.
// Druhá kopie je pro čtečky skrytá. Při najetí myší se pás zastaví.
export function HomeMarquee({ items, locale, label }: { items: Item[]; locale: string; label: string }) {
  const row = (copy: boolean) =>
    items.map((s) => (
      <Link
        key={`${copy ? "b" : "a"}-${s.slug}`}
        href={`/${locale}/kurzy/zakladni?predmet=${s.slug}#vyber-kurzu`}
        className="mq-chip"
        style={{ ["--ac" as string]: s.color }}
        tabIndex={copy ? -1 : undefined}
        aria-hidden={copy || undefined}
      >
        <Icon name={s.slug} size={28} />
        {s.label}
      </Link>
    ));
  return (
    <div className="mq" role="navigation" aria-label={label}>
      <div className="mq-track">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
