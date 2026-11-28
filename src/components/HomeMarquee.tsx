"use client";

import { useRef } from "react";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { tr8, type Locale } from "@/i18n/config";
import { prefersReducedMotion } from "@/lib/motion";

type Item = { slug: string; label: string; color: string };
const previous = tr8("Předchozí předměty", "Previous subjects", "Vorherige Fächer", "Предыдущие предметы", "Попередні предмети", "前の科目", "Asignaturas anteriores", "Matières précédentes");
const next = tr8("Další předměty", "Next subjects", "Weitere Fächer", "Следующие предметы", "Наступні предмети", "次の科目", "Más asignaturas", "Matières suivantes");

export function HomeMarquee({ items, locale, label }: { items: Item[]; locale: Locale; label: string }) {
  const track = useRef<HTMLDivElement>(null);

  function scroll(direction: number) {
    const element = track.current;
    if (!element) return;
    element.scrollBy({ left: direction * element.clientWidth * 0.8, behavior: prefersReducedMotion() ? "instant" : "smooth" });
  }

  return (
    <nav className="refresh-subjects" aria-label={label}>
      <div className="refresh-subjects-heading">
        <h2>{label}</h2>
        <div>
          <button type="button" aria-label={previous[locale]} onClick={() => scroll(-1)}>←</button>
          <button type="button" aria-label={next[locale]} onClick={() => scroll(1)}>→</button>
        </div>
      </div>
      <div className="refresh-subjects-track" ref={track}>
        {items.map((item) => (
          <Link
            key={item.slug}
            href={`/${locale}/kurzy/zakladni?predmet=${item.slug}#vyber-kurzu`}
            className="mq-chip"
            style={{ "--ac": item.color } as React.CSSProperties}
          >
            <Icon name={item.slug} size={28} />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
