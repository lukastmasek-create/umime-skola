import { withFallbacks } from "./config";
import type { Locale } from "./config";

// Texty vzhledové části Nastavení (motiv, akcentní barva).
export type SettingsLookText = {
  themes: string;
  themesHint: string;
  accent: string;
  accentHint: string;
  customColor: string;
  fontStyleHint: string;
  fontSizeHint: string;
  group: string;
  a11y: string;
  contrast: string;
  contrastHint: string;
  links: string;
  linksHint: string;
  spacing: string;
  spacingHint: string;
  shortcuts: string;
  shortcutsHint: string;
  shortcutsHow: string;
  scHome: string;
  scCourses: string;
  scQuiz: string;
  scBoards: string;
  scShop: string;
  scSettings: string;
  plan: string;
  planHint: string;
  planPro: string;
  planFree: string;
  planUnknown: string;
  planLogin: string;
  planCta: string;
  privacy: string;
  privacyHint: string;
  privacyPolicy: string;
  terms: string;
  resetTitle: string;
  resetHint: string;
  resetBtn: string;
};

const texts = withFallbacks<SettingsLookText>({
  cs: {
    themes: "Motiv",
    themesHint: "Vyber si styl nebo si uprav vlastní motiv.",
    accent: "Akcentní barva",
    accentHint: "Použij systémovou nebo vlastní akcentní barvu.",
    customColor: "Vlastní barva",
    fontStyleHint: "Hravé písmo pro nadpisy, nebo klasické.",
    fontSizeHint: "Zvětší nebo zmenší text na celé stránce.",
    group: "Obecné",
    a11y: "Přístupnost",
    contrast: "Vysoký kontrast",
    contrastHint: "Zvýrazní text a ohraničení, aby se lépe četly.",
    links: "Podtržené odkazy",
    linksHint: "Odkazy v textu budou vždy podtržené.",
    spacing: "Větší mezery v textu",
    spacingHint: "Rozšíří řádkování a mezery mezi písmeny, což pomáhá třeba při dyslexii.",
    shortcuts: "Klávesové zkratky",
    shortcutsHint: "Rychlé přepínání mezi stránkami bez myši.",
    shortcutsHow: "Stiskni G a pak písmeno:",
    scHome: "Domů", scCourses: "Kurzy", scQuiz: "Denní kvíz", scBoards: "Žebříčky", scShop: "Obchod", scSettings: "Nastavení",
    plan: "Předplatné",
    planHint: "Tvůj aktuální tarif.",
    planPro: "Máš PRO. Díky!",
    planFree: "Používáš zdarma verzi.",
    planUnknown: "Tarif se teď nepodařilo zjistit.",
    planLogin: "Přihlas se, ať vidíme tvůj tarif.",
    planCta: "Zobrazit PRO",
    privacy: "Soukromí",
    privacyHint: "Co o tobě web ukládá a jak s tím nakládáme.",
    privacyPolicy: "Zásady ochrany soukromí",
    terms: "Podmínky použití",
    resetTitle: "Místní nastavení",
    resetHint: "Vzhled, akcentní barva, přístupnost a animace se ukládají jen v tomto prohlížeči. Tady je smažeš.",
    resetBtn: "Obnovit výchozí nastavení",
  },
  en: {
    themes: "Themes",
    themesHint: "Choose your style or customize your theme.",
    accent: "Accent Colors",
    accentHint: "Use system or custom accent colors.",
    customColor: "Custom Color",
    fontStyleHint: "Playful headings or a classic look.",
    fontSizeHint: "Makes text on the whole site bigger or smaller.",
    group: "General",
    a11y: "Accessibility",
    contrast: "High contrast",
    contrastHint: "Strengthens text and borders so they are easier to read.",
    links: "Underline links",
    linksHint: "Links in text are always underlined.",
    spacing: "Wider text spacing",
    spacingHint: "Increases line and letter spacing, which helps with dyslexia.",
    shortcuts: "Keyboard shortcuts",
    shortcutsHint: "Jump between pages without a mouse.",
    shortcutsHow: "Press G, then a letter:",
    scHome: "Home", scCourses: "Courses", scQuiz: "Daily quiz", scBoards: "Leaderboards", scShop: "Shop", scSettings: "Settings",
    plan: "Plans & upgrades",
    planHint: "Your current plan.",
    planPro: "You have PRO. Thanks!",
    planFree: "You are on the free version.",
    planUnknown: "We could not check your plan right now.",
    planLogin: "Log in so we can show your plan.",
    planCta: "See PRO",
    privacy: "Privacy",
    privacyHint: "What the site stores about you and how it is handled.",
    privacyPolicy: "Privacy policy",
    terms: "Terms of use",
    resetTitle: "Local settings",
    resetHint: "Appearance, accent color, accessibility and animations are stored only in this browser. Clear them here.",
    resetBtn: "Restore default settings",
  },
  de: {
    themes: "Designs",
    themesHint: "Wähle deinen Stil oder passe dein Design an.",
    accent: "Akzentfarben",
    accentHint: "System- oder eigene Akzentfarbe verwenden.",
    customColor: "Eigene Farbe",
    fontStyleHint: "Verspielte Überschriften oder klassisch.",
    fontSizeHint: "Macht den Text auf der ganzen Seite größer oder kleiner.",
    group: "Allgemein",
    a11y: "Barrierefreiheit",
    contrast: "Hoher Kontrast",
    contrastHint: "Verstärkt Text und Ränder für bessere Lesbarkeit.",
    links: "Links unterstreichen",
    linksHint: "Links im Text sind immer unterstrichen.",
    spacing: "Größerer Textabstand",
    spacingHint: "Mehr Zeilen- und Buchstabenabstand, hilfreich z. B. bei Legasthenie.",
    shortcuts: "Tastenkürzel",
    shortcutsHint: "Ohne Maus zwischen Seiten wechseln.",
    shortcutsHow: "Drücke G und dann einen Buchstaben:",
    scHome: "Start", scCourses: "Kurse", scQuiz: "Tagesquiz", scBoards: "Bestenlisten", scShop: "Shop", scSettings: "Einstellungen",
    plan: "Abo",
    planHint: "Dein aktueller Tarif.",
    planPro: "Du hast PRO. Danke!",
    planFree: "Du nutzt die kostenlose Version.",
    planUnknown: "Der Tarif konnte gerade nicht geprüft werden.",
    planLogin: "Melde dich an, um deinen Tarif zu sehen.",
    planCta: "PRO ansehen",
    privacy: "Datenschutz",
    privacyHint: "Was die Seite über dich speichert und wie damit umgegangen wird.",
    privacyPolicy: "Datenschutzerklärung",
    terms: "Nutzungsbedingungen",
    resetTitle: "Lokale Einstellungen",
    resetHint: "Aussehen, Akzentfarbe, Barrierefreiheit und Animationen werden nur in diesem Browser gespeichert. Hier löschst du sie.",
    resetBtn: "Standardeinstellungen wiederherstellen",
  },
  ru: {
    themes: "Темы",
    themesHint: "Выбери стиль или настрой тему.",
    accent: "Акцентные цвета",
    accentHint: "Системный или свой акцентный цвет.",
    customColor: "Свой цвет",
    fontStyleHint: "Игривые заголовки или классика.",
    fontSizeHint: "Увеличивает или уменьшает текст на всём сайте.",
    group: "Общие",
    a11y: "Доступность",
    contrast: "Высокий контраст",
    contrastHint: "Усиливает текст и границы для лучшей читаемости.",
    links: "Подчёркивать ссылки",
    linksHint: "Ссылки в тексте всегда подчёркнуты.",
    spacing: "Увеличенные интервалы",
    spacingHint: "Больше межстрочный и межбуквенный интервал, помогает при дислексии.",
    shortcuts: "Горячие клавиши",
    shortcutsHint: "Быстрый переход между страницами без мыши.",
    shortcutsHow: "Нажми G, затем букву:",
    scHome: "Главная", scCourses: "Курсы", scQuiz: "Квиз дня", scBoards: "Рейтинги", scShop: "Магазин", scSettings: "Настройки",
    plan: "Подписка",
    planHint: "Твой текущий тариф.",
    planPro: "У тебя PRO. Спасибо!",
    planFree: "Ты используешь бесплатную версию.",
    planUnknown: "Сейчас не удалось проверить тариф.",
    planLogin: "Войди, чтобы увидеть свой тариф.",
    planCta: "Смотреть PRO",
    privacy: "Конфиденциальность",
    privacyHint: "Что сайт хранит о тебе и как с этим обращается.",
    privacyPolicy: "Политика конфиденциальности",
    terms: "Условия использования",
    resetTitle: "Локальные настройки",
    resetHint: "Внешний вид, акцентный цвет, доступность и анимации хранятся только в этом браузере. Здесь их можно стереть.",
    resetBtn: "Сбросить настройки",
  },
});
export const getSettingsLookText = (locale: Locale) => texts[locale];
