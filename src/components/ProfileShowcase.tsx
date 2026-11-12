"use client";
import { withFallbacks } from "@/i18n/config";

import { useState } from "react";
import Link from "next/link";
import { RewardImage } from "@/components/RewardImage";
import { getBadgeTier } from "@/lib/rewards";
import layout from "./vitrina.json";
import type { Locale } from "@/i18n/config";

// Vitrína odměn: skříň z Blenderu (umime-art/blender/profil.py) s devíti místy na policích. Získané věci
// stojí na policích (po najetí se zvednou a rozsvítí), nezískané jsou ztlumené siluety s nápovědou.

type Item = {
  id: string;
  image: string;
  hover?: string; // animovaná varianta, načte se až při najetí
  label: string;
  value?: string;
  unlocked: boolean;
  hint?: string;
  href?: string;
};

const TEXT: Record<Locale, Record<string, string>> = {
  ...withFallbacks({
  cs:{ title: "Vitrína odměn", badge: "Odznak úrovně", trophy: "Pohár žebříčku", podium: "Stupně vítězů", rubin: "Avatary", safir: "Tituly", smaragd: "Vzhled", chest: "Denní truhla", coin: "Body", wheel: "Kolo štěstí", top3: "Buď v první trojce žebříčku", top10: "Dostaň se do první desítky", need: "Odemkni {n} pro tenhle drahokam", open: "Otevřít" },
  en: { title: "Trophy case", badge: "Level badge", trophy: "Leaderboard cup", podium: "Winners' podium", rubin: "Avatars", safir: "Titles", smaragd: "Looks", chest: "Daily chest", coin: "Points", wheel: "Wheel of fortune", top3: "Reach the top three of the leaderboard", top10: "Get into the top ten", need: "Unlock {n} for this gem", open: "Open" },
  de: { title: "Pokalvitrine", badge: "Level-Abzeichen", trophy: "Ranglisten-Pokal", podium: "Siegerpodest", rubin: "Avatare", safir: "Titel", smaragd: "Look", chest: "Tagestruhe", coin: "Punkte", wheel: "Glücksrad", top3: "Komm unter die ersten drei der Rangliste", top10: "Schaffe es in die Top Ten", need: "Schalte {n} für diesen Edelstein frei", open: "Öffnen" },
  ru: { title: "Витрина наград", badge: "Значок уровня", trophy: "Кубок рейтинга", podium: "Пьедестал", rubin: "Аватары", safir: "Титулы", smaragd: "Внешний вид", chest: "Ежедневный сундук", coin: "Очки", wheel: "Колесо удачи", top3: "Попади в тройку рейтинга", top10: "Попади в десятку лучших", need: "Открой {n}, чтобы получить этот камень", open: "Открыть" },
  }),
  uk: { title: "Вітрина нагород", badge: "Значок рівня", trophy: "Кубок рейтингу", podium: "Подіум переможців", rubin: "Аватари", safir: "Титули", smaragd: "Зовнішній вигляд", chest: "Денна скриня", coin: "Бали", wheel: "Колесо фортуни", top3: "Потрапи в першу трійку рейтингу", top10: "Потрапи до першої десятки", need: "Відкрий ще {n} для цього самоцвіту", open: "Відкрити" },
  ja: { title: "ごほうびのショーケース", badge: "レベルバッジ", trophy: "ランキングのカップ", podium: "優勝者の表彰台", rubin: "アバター", safir: "称号", smaragd: "見た目", chest: "デイリーチェスト", coin: "ポイント", wheel: "ラッキーホイール", top3: "ランキングの上位3位に入ろう", top10: "トップ10に入ろう", need: "あと {n} 個解放すると、このジェムが手に入ります", open: "開く" },
  es: { title: "Vitrina de premios", badge: "Insignia de nivel", trophy: "Copa de la clasificación", podium: "Podio de ganadores", rubin: "Avatares", safir: "Títulos", smaragd: "Estilos", chest: "Cofre diario", coin: "Puntos", wheel: "Rueda de la fortuna", top3: "Llega al top tres de la clasificación", top10: "Entra en el top diez", need: "Desbloquea {n} para esta gema", open: "Abrir" },
  fr: { title: "Vitrine des récompenses", badge: "Badge de niveau", trophy: "Coupe du classement", podium: "Podium des gagnants", rubin: "Avatars", safir: "Titres", smaragd: "Looks", chest: "Coffre quotidien", coin: "Points", wheel: "Roue de la fortune", top3: "Atteins le top 3 du classement", top10: "Entre dans le top 10", need: "Débloque {n} pour cette gemme", open: "Ouvrir" },
};

export function ProfileShowcase({
  locale,
  level,
  rank,
  points,
  avatars,
  titles,
  looks,
}: {
  locale: Locale;
  level: number;
  rank: number | null;
  points: number;
  avatars: number;
  titles: number;
  looks: number;
}) {
  const t = TEXT[locale];
  const tier = getBadgeTier(level);
  const cup = rank === 1 ? "pohar_zlato" : rank === 2 ? "pohar_stribro" : rank === 3 ? "pohar_bronz" : "pohar_zlato";
  const need = (have: number, goal: number) => t.need.replace("{n}", String(Math.max(0, goal - have)));
  const items: Item[] = [
    { id: "badge", image: `odznak_${tier.id}`, hover: `odznak_${tier.id}-lesk`, label: t.badge, value: `${level}`, unlocked: true },
    { id: "trophy", image: cup, hover: `${cup}-lesk`, label: t.trophy, value: rank ? `#${rank}` : undefined, unlocked: rank != null && rank <= 3, hint: t.top3 },
    { id: "podium", image: "podium", label: t.podium, unlocked: rank != null && rank <= 10, hint: t.top10, href: `/${locale}/zebricky` },
    { id: "rubin", image: "rubin", hover: "rubin-trpyt", label: t.rubin, value: `${avatars}`, unlocked: avatars >= 5, hint: need(avatars, 5) },
    { id: "safir", image: "safir", hover: "safir-trpyt", label: t.safir, value: `${titles}`, unlocked: titles >= 3, hint: need(titles, 3) },
    { id: "smaragd", image: "smaragd", hover: "smaragd-trpyt", label: t.smaragd, value: `${looks}`, unlocked: looks >= 2, hint: need(looks, 2) },
    { id: "chest", image: "truhla", hover: "truhla-otevreni", label: t.chest, unlocked: true, href: `/${locale}/obchod` },
    { id: "coin", image: "mince", hover: "mince-otoceni", label: t.coin, value: `${points}`, unlocked: true },
    { id: "wheel", image: "kolo", label: t.wheel, unlocked: true, href: `/${locale}/obchod` },
  ];
  return (
    <section className="card overflow-hidden p-4 sm:p-6">
      <h2 className="mb-3 text-xl font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>
        {t.title}
      </h2>
      <div className="relative mx-auto w-full max-w-3xl" style={{ aspectRatio: `${layout.w} / ${layout.h}` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img loading="lazy" decoding="async" src="/home/profil/vitrina.webp" alt="" aria-hidden draggable={false} className="pointer-events-none absolute inset-0 h-full w-full select-none drop-shadow-[0_14px_16px_rgba(0,0,0,0.3)]" />
        {items.map((item, i) => {
          const [x, y] = layout.slots[2 - Math.floor(i / 3)][i % 3]; // police v JSONu jdou odspodu
          return <ShowcaseItem key={item.id} item={item} x={x * 100} y={y * 100} w={layout.item * 100} openLabel={t.open} />;
        })}
      </div>
    </section>
  );
}

function ShowcaseItem({ item, x, y, w, openLabel }: { item: Item; x: number; y: number; w: number; openLabel: string }) {
  const [hot, setHot] = useState(false);
  const name = hot && item.hover && item.unlocked ? item.hover : item.image;
  const body = (
    <>
      <span className={`showcase-item block transition-transform duration-300 ${hot && item.unlocked ? "-translate-y-2 scale-105" : ""}`} style={item.unlocked ? undefined : { filter: "grayscale(1) brightness(0.55)", opacity: 0.5 }}>
        <RewardImage name={name} size={256} alt={item.label} className="h-auto w-full" />
      </span>
      <span className="pointer-events-none absolute left-1/2 top-[88%] z-10 hidden w-max sm:block max-w-[150%] -translate-x-1/2 rounded-full bg-[#16132b]/85 px-2 py-0.5 text-center text-[10px] font-bold leading-tight text-white sm:text-xs">
        {item.label}
        {item.value ? ` · ${item.value}` : ""}
      </span>
      {!item.unlocked && item.hint && hot && (
        <span className="pointer-events-none absolute bottom-[112%] left-1/2 z-20 w-40 -translate-x-1/2 rounded-xl bg-white px-2 py-1 text-center text-[11px] font-semibold text-[#16132b] shadow">{item.hint}</span>
      )}
    </>
  );
  const common = {
    className: "absolute block -translate-x-1/2 -translate-y-[93%] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-yellow)] rounded-xl",
    style: { left: `${x}%`, top: `${y}%`, width: `${w}%` },
    onMouseEnter: () => setHot(true),
    onMouseLeave: () => setHot(false),
    onFocus: () => setHot(true),
    onBlur: () => setHot(false),
  };
  if (item.href) {
    return (
      <Link href={item.href} {...common} title={openLabel}>
        {body}
      </Link>
    );
  }
  return (
    <div tabIndex={0} {...common}>
      {body}
    </div>
  );
}
