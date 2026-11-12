import Link from "next/link";
import { Icon } from "@/components/Icon";
import type { HomeQuickText } from "@/i18n/home-quick";

// Mřížka ikonových dlaždic pro rychlý vstup na hlavní sekce webu.
const ITEMS: { key: string; href: string; icon: string; grad: string }[] = [
  { key: "courses", href: "kurzy", icon: "sada", grad: "from-[#3b5bff] to-[#0e1a5c]" },
  { key: "escape", href: "unikovky", icon: "escape", grad: "from-[#1ec5ff] to-[#0a2b4d]" },
  { key: "pets", href: "stale-hry/mazlicci", icon: "pets", grad: "from-[#7b3dff] to-[#1a0d4d]" },
  { key: "prijimacky", href: "kurzy/prijimacky", icon: "prijimacky", grad: "from-[#2fae6d] to-[#0c3b2c]" },
  { key: "maturita", href: "kurzy/maturita", icon: "maturita", grad: "from-[#e0584a] to-[#5a1f2b]" },
  { key: "review", href: "opakovani", icon: "review", grad: "from-[#f2a35e] to-[#7a2a2a]" },
];

export function HomeQuickGrid({ locale, t }: { locale: string; t: HomeQuickText }) {
  return (
    <section className="relative mx-auto max-w-6xl px-4 pb-16 sm:px-6" aria-labelledby="quick-title">
      <h2 id="quick-title" className="mb-5 text-2xl font-bold tracking-tight sm:text-3xl" style={{ fontFamily: "var(--font-heading)" }}>
        {t.title}
      </h2>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {ITEMS.map((item) => {
          const text = t.items[item.key];
          return (
            <li key={item.key}>
              <Link
                href={`/${locale}/${item.href}`}
                className={`lobby-card min-h-[140px] bg-gradient-to-br ${item.grad}`}
              >
                <Icon name={item.icon} size={72} className="lobby-emoji" />
                <span className="relative mt-auto block">
                  <span className="block text-base font-bold leading-tight">{text.name}</span>
                  <span className="block text-xs text-white/75">{text.tag}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
