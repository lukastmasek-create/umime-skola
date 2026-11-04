import { withFallbacks } from "./config";
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

const texts: Record<Locale, CustomText> = {
  ...withFallbacks({ cs, en, de, ru }),
  uk: {
    tab: "Вигляд",
    hint: "Перефарбовуй частини персонажа, додавай узор і вмикай або вимикай аксесуари. Кожен аватар пам'ятає свій вигляд.",
    slots: { head: "Голова", body: "Тіло", arms: "Руки", tail: "Хвіст", topper: "Прикраса на голові", eyes: "Очі", glow: "Світіння" },
    toggles: { whiskers: "Вусики", tail: "Хвіст", topper: "Прикраса на голові", crown: "Корона", earring: "Сережка", extra: "Додатки" },
    patterns: { none: "Без узора", stripes: "Смуги", dots: "Горошок", checks: "Клітинка", belly: "Пляма" },
    pattern: "Узор",
    patternColor: "Колір узора",
    accessories: "Аксесуари",
    colors: "Кольори",
    reset: "Початковий вигляд",
    random: "Випадково",
    saving: "Зберігаю…",
    saved: "Збережено",
    dragHint: "Перетягни, щоб повернути персонажа, клік — і він зрадіє.",
    noParts: "Цей аватар поки що не можна змінити.",
  },
  ja: {
    tab: "外見",
    hint: "キャラクターの部分の色を変えたり、模様を追加したり、アクセサリーのオン・オフを切り替えたりできます。アバターごとに外見が保存されます。",
    slots: { head: "頭", body: "体", arms: "腕", tail: "しっぽ", topper: "頭の飾り", eyes: "目", glow: "光" },
    toggles: { whiskers: "ひげ", tail: "しっぽ", topper: "頭の飾り", crown: "王冠", earring: "イヤリング", extra: "その他" },
    patterns: { none: "模様なし", stripes: "しま模様", dots: "水玉", checks: "チェック", belly: "ぶち" },
    pattern: "模様",
    patternColor: "模様の色",
    accessories: "アクセサリー",
    colors: "色",
    reset: "元の外見",
    random: "ランダム",
    saving: "保存しています…",
    saved: "保存しました",
    dragHint: "ドラッグするとキャラクターが回ります。クリックすると喜びます。",
    noParts: "このアバターはまだ変更できません。",
  },
  es: {
    tab: "Aspecto",
    hint: "Cambia el color de las partes del personaje, añade un estampado y activa o desactiva los accesorios. Cada avatar recuerda su propio aspecto.",
    slots: { head: "Cabeza", body: "Cuerpo", arms: "Brazos", tail: "Cola", topper: "Adorno de la cabeza", eyes: "Ojos", glow: "Brillo" },
    toggles: { whiskers: "Bigotes", tail: "Cola", topper: "Adorno de la cabeza", crown: "Corona", earring: "Pendiente", extra: "Extras" },
    patterns: { none: "Sin estampado", stripes: "Rayas", dots: "Lunares", checks: "Cuadros", belly: "Mancha" },
    pattern: "Estampado",
    patternColor: "Color del estampado",
    accessories: "Accesorios",
    colors: "Colores",
    reset: "Aspecto original",
    random: "Aleatorio",
    saving: "Guardando…",
    saved: "Guardado",
    dragHint: "Arrastra para girar al personaje; haz clic y se alegrará.",
    noParts: "Este avatar todavía no se puede personalizar.",
  },
  fr: {
    tab: "Apparence",
    hint: "Recolore des parties de ton personnage, ajoute un motif et active ou désactive les accessoires. Chaque avatar garde sa propre apparence.",
    slots: { head: "Tête", body: "Corps", arms: "Bras", tail: "Queue", topper: "Ornement de tête", eyes: "Yeux", glow: "Lueur" },
    toggles: { whiskers: "Moustaches", tail: "Queue", topper: "Ornement de tête", crown: "Couronne", earring: "Boucle d'oreille", extra: "Accessoires" },
    patterns: { none: "Sans motif", stripes: "Rayures", dots: "Pois", checks: "Carreaux", belly: "Tache" },
    pattern: "Motif",
    patternColor: "Couleur du motif",
    accessories: "Accessoires",
    colors: "Couleurs",
    reset: "Apparence d'origine",
    random: "Aléatoire",
    saving: "Enregistrement…",
    saved: "Enregistré",
    dragHint: "Fais glisser pour tourner le personnage, clique pour le rendre heureux.",
    noParts: "Cet avatar ne peut pas encore être personnalisé.",
  },
};

export function getCustomText(locale: Locale): CustomText {
  return texts[locale];
}
