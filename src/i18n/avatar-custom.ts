import type { Locale } from "./config";
import type { Pattern, Slot, Toggle } from "@/lib/avatar-custom";

export type CustomText = {
  tab: string;
  hint: string;
  slots: Record<Slot, string>;
  toggles: Record<Toggle, string>;
  patterns: Record<Pattern, string>;
  pattern: string;
  patternColor: string;
  accessories: string;
  colors: string;
  reset: string;
  random: string;
  saving: string;
  saved: string;
  dragHint: string;
  noParts: string;
};

const cs: CustomText = {
  tab: "Vzhled",
  hint: "Přebarvi části postavy, přidej vzor a zapni nebo vypni doplňky. Každý avatar si pamatuje svůj vzhled.",
  slots: { head: "Hlava", body: "Tělo", arms: "Ruce", tail: "Ocas", topper: "Ozdoba na hlavě", eyes: "Oči", glow: "Svit" },
  toggles: { whiskers: "Vousky", tail: "Ocas", topper: "Ozdoba na hlavě", crown: "Koruna", earring: "Náušnice", extra: "Doplňky" },
  patterns: { none: "Bez vzoru", stripes: "Pruhy", dots: "Puntíky", checks: "Kostky", belly: "Skvrna" },
  pattern: "Vzor",
  patternColor: "Barva vzoru",
  accessories: "Doplňky",
  colors: "Barvy",
  reset: "Původní vzhled",
  random: "Náhodně",
  saving: "Ukládám…",
  saved: "Uloženo",
  dragHint: "Tažením postavu otočíš, kliknutím se zaraduje.",
  noParts: "Tenhle avatar zatím nejde upravit.",
};

const en: CustomText = {
  tab: "Look",
  hint: "Recolour parts of your character, add a pattern and turn accessories on or off. Each avatar remembers its own look.",
  slots: { head: "Head", body: "Body", arms: "Arms", tail: "Tail", topper: "Head piece", eyes: "Eyes", glow: "Glow" },
  toggles: { whiskers: "Whiskers", tail: "Tail", topper: "Head piece", crown: "Crown", earring: "Earring", extra: "Extras" },
  patterns: { none: "No pattern", stripes: "Stripes", dots: "Dots", checks: "Checks", belly: "Spot" },
  pattern: "Pattern",
  patternColor: "Pattern colour",
  accessories: "Accessories",
  colors: "Colours",
  reset: "Original look",
  random: "Random",
  saving: "Saving…",
  saved: "Saved",
  dragHint: "Drag to turn the character, click to make it happy.",
  noParts: "This avatar can't be customised yet.",
};

const de: CustomText = {
  tab: "Aussehen",
  hint: "Färbe Teile der Figur um, füge ein Muster hinzu und schalte Zubehör an oder aus. Jeder Avatar merkt sich sein Aussehen.",
  slots: { head: "Kopf", body: "Körper", arms: "Arme", tail: "Schwanz", topper: "Kopfschmuck", eyes: "Augen", glow: "Leuchten" },
  toggles: { whiskers: "Schnurrhaare", tail: "Schwanz", topper: "Kopfschmuck", crown: "Krone", earring: "Ohrring", extra: "Extras" },
  patterns: { none: "Kein Muster", stripes: "Streifen", dots: "Punkte", checks: "Karos", belly: "Fleck" },
  pattern: "Muster",
  patternColor: "Musterfarbe",
  accessories: "Zubehör",
  colors: "Farben",
  reset: "Originalaussehen",
  random: "Zufall",
  saving: "Speichere…",
  saved: "Gespeichert",
  dragHint: "Ziehen dreht die Figur, Klicken macht sie froh.",
  noParts: "Dieser Avatar lässt sich noch nicht anpassen.",
};

const ru: CustomText = {
  tab: "Внешность",
  hint: "Перекрашивай части персонажа, добавляй узор и включай или выключай аксессуары. Каждый аватар помнит свой вид.",
  slots: { head: "Голова", body: "Тело", arms: "Руки", tail: "Хвост", topper: "Украшение на голове", eyes: "Глаза", glow: "Свечение" },
  toggles: { whiskers: "Усы", tail: "Хвост", topper: "Украшение на голове", crown: "Корона", earring: "Серьга", extra: "Аксессуары" },
  patterns: { none: "Без узора", stripes: "Полосы", dots: "Горошек", checks: "Клетка", belly: "Пятно" },
  pattern: "Узор",
  patternColor: "Цвет узора",
  accessories: "Аксессуары",
  colors: "Цвета",
  reset: "Исходный вид",
  random: "Случайно",
  saving: "Сохраняю…",
  saved: "Сохранено",
  dragHint: "Потяни, чтобы повернуть, клик — персонаж обрадуется.",
  noParts: "Этого аватара пока нельзя изменить.",
};

const texts: Record<Locale, CustomText> = { cs, en, de, ru };

export function getCustomText(locale: Locale): CustomText {
  return texts[locale];
}
