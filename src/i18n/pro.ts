import { withFallbacks } from "./config";
import type { Locale } from "./config";

export type ProText = {
  nav: string;
  title: string;
  subtitle: string;
  status: {
    guest: string;
    active: string;
    none: string;
    login: string;
  };
  compareTitle: string;
  compareFree: string;
  comparePro: string;
  rows: { what: string; free: string; pro: string }[];
  tiersTitle: string;
  tiers: { individual: TierText; family: TierText; school: TierText };
  availability: string;
  cta: string;
  ctaText: string;
  // Výhody a ceny; chybějící jazyky se berou z angličtiny.
  extra?: ProExtra;
};

export type ProExtra = {
  benefitsTitle: string;
  benefits: { icon: string; title: string; text: string }[];
  plans: { price: string; per: string; perks: string[] }[]; // pořadí: jednotlivec, rodina, škola
  trial: string;
  note: string;
};

type TierText = { title: string; text: string };

const cs: ProText = {
  nav: "UčímePRO",
  title: "UčímePRO",
  subtitle: "Nové funkce navíc: AI doučovač, příprava na přijímačky a mnohem víc. Zdarma zůstává všechno, co už máš.",
  status: {
    guest: "Pro zobrazení stavu předplatného se přihlas.",
    active: "Máš aktivní předplatné PRO.",
    none: "Zatím nemáš aktivní předplatné PRO.",
    login: "Přihlásit se",
  },
  compareTitle: "Zdarma a PRO",
  compareFree: "Zdarma",
  comparePro: "PRO",
  rows: [
    { what: "Kurzy, body, kolo štěstí, rodičovský panel", free: "zdarma", pro: "zdarma" },
    { what: "AI doučovač a osobní plán učení", free: "ne", pro: "ano" },
    { what: "Příprava na přijímačky, ústní zkoušení, sešit chyb", free: "ne", pro: "ano" },
    { what: "Fotka úlohy, import z poznámek, výslovnost, offline", free: "ne", pro: "ano" },
  ],
  tiersTitle: "Tarify",
  tiers: {
    individual: { title: "Jednotlivec", text: "Předplatné pro jeden účet. Platí jen pro tebe." },
    family: { title: "Rodina", text: "Jeden tarif pro více členů rodiny. Plátce ho spravuje a přidává členy." },
    school: { title: "Škola", text: "Tarif pro žáky vybrané školy. Platí, když je škola uvedena ve tvém účtu." },
  },
  availability: "Předplatné se připravuje a zatím ho nelze koupit. Ceny jsou orientační a upřesníme je, až bude možné platit.",
  cta: "Napsat nám",
  ctaText: "Máš otázku nebo zájem o tarif pro školu či rodinu? Ozvi se.",
  extra: {
    benefitsTitle: "Co je v UčímePRO nového",
    benefits: [
      { icon: "🤖", title: "AI doučovač", text: "Vysvětlí úlohu krok za krokem, jinými slovy a tolikrát, kolikrát potřebuješ. Neřekne ti výsledek, dovede tě k němu." },
      { icon: "🗓️", title: "Osobní plán učení", text: "Každý týden dostaneš plán na míru podle toho, co ti nejde. Stačí 15 minut denně." },
      { icon: "🎯", title: "Příprava na přijímačky a testy", text: "Zkoušky nanečisto s časovým limitem, bodováním a odhadem výsledku. Je to samostatná sekce, kurzy zůstávají zdarma." },
      { icon: "📷", title: "Fotka úlohy → podobné příklady", text: "Vyfoť úlohu z učebnice nebo sešitu a dostaneš pět podobných příkladů na procvičení stejného postupu." },
      { icon: "🎤", title: "Ústní zkoušení", text: "Doučovač tě nahlas vyzkouší z dějepisu, přírodopisu nebo zeměpisu a ohodnotí, co sedělo a co chybělo." },
      { icon: "📒", title: "Sešit chyb", text: "Každá tvoje chyba se uloží s vysvětlením, proč. Z nich se sestaví osobní sešit k opakování i k vytištění." },
      { icon: "📝", title: "Import z poznámek", text: "Nahraj poznámky nebo fotku a udělají se z nich kartičky a kvízy na míru." },
      { icon: "🗣️", title: "Hlasové procvičování výslovnosti", text: "Řekni slovíčko nahlas a hned uvidíš, jak jsi na tom s výslovností v angličtině, němčině a dalších jazycích." },
      { icon: "📴", title: "Offline režim", text: "Stáhni si lekce a uč se i ve vlaku nebo na chatě bez internetu." },
    ],
    plans: [
      { price: "100 Kč", per: "měsíčně", perks: ["1 účet", "Všechny výhody PRO pro jednotlivce", "Zrušení kdykoli"] },
      { price: "250 Kč", per: "měsíčně", perks: ["Až 5 členů rodiny s plným PRO", "Dětský bezpečný režim", "Začínat s dítětem: tipy, jak pomoci, aniž bys rušil/a", "Plán na prázdniny, ať se po létě nic nezapomene", "Rodinný souboj s handicapem pro vyrovnané šance"] },
      { price: "12 000 Kč", per: "ročně za školu", perks: ["Mapa mezer třídy s hotovou 20min lekcí na další hodinu", "Souběžná hodina: třída hraje týmově, učitel vidí, kdo se zasekl", "Nepsané testy podle RVP s klíčem a hodnocením", "Každý žák má jiné zadání, opisování nemá smysl", "Exit ticket za 2 minuty na konci hodiny", "Kamarád pro suplování: hodina zadaná jedním kliknutím", "Průvodce rodičovskými schůzkami: stránka o každém žákovi", "Pomalejší a rychlejší tempo bez nálepek", "Vlastní obsah školy z nahraných učebnic", "Zaškolení učitelů a přednostní podpora"] },
    ],
    trial: "30 dní zdarma",
    note: "Zdarma zůstává všechno, co už na webu je, včetně kurzů, bodů, kola štěstí a rodičovského panelu. PRO přidává nové funkce. Ceny jsou včetně DPH.",
  },
};

const en: ProText = {
  nav: "UčímePRO",
  title: "UčímePRO",
  subtitle: "New extras: an AI tutor, exam prep and much more. Everything you already have stays free.",
  status: {
    guest: "Log in to see your subscription status.",
    active: "You have an active PRO subscription.",
    none: "You don't have an active PRO subscription yet.",
    login: "Log in",
  },
  compareTitle: "Free and PRO",
  compareFree: "Free",
  comparePro: "PRO",
  rows: [
    { what: "Courses, points, wheel of fortune, parent panel", free: "free", pro: "free" },
    { what: "AI tutor and personal study plan", free: "no", pro: "yes" },
    { what: "Exam prep, oral examination, mistake notebook", free: "no", pro: "yes" },
    { what: "Task photo, import from notes, pronunciation, offline", free: "no", pro: "yes" },
  ],
  tiersTitle: "Plans",
  tiers: {
    individual: { title: "Individual", text: "A subscription for one account. It applies only to you." },
    family: { title: "Family", text: "One plan for several family members. The payer manages it and adds members." },
    school: { title: "School", text: "A plan for pupils of the selected school. It applies when your school is set in your account." },
  },
  availability: "The subscription is being prepared and cannot be purchased yet. Prices and plan terms will be added once payments are possible.",
  cta: "Contact us",
  ctaText: "Have a question or interest in a plan for a school or family? Get in touch.",
  extra: {
    benefitsTitle: "What is new in UčímePRO",
    benefits: [
      { icon: "🤖", title: "AI tutor", text: "Explains a task step by step, in other words, as many times as you need. It does not give you the answer, it leads you to it." },
      { icon: "🗓️", title: "Personal study plan", text: "Every week you get a plan made for you based on what you find hard. 15 minutes a day is enough." },
      { icon: "🎯", title: "Entrance exam and test prep", text: "Mock exams with a time limit, scoring and an estimate of your result. It is a separate section, courses stay free." },
      { icon: "📷", title: "Photo of a task → similar examples", text: "Take a photo of a task from a textbook or notebook and get five similar examples to practise the same method." },
      { icon: "🎤", title: "Oral examination", text: "The tutor quizzes you out loud in history, biology or geography and rates what was right and what was missing." },
      { icon: "📒", title: "Mistake notebook", text: "Every mistake you make is saved with an explanation of why. They build a personal notebook for review or printing." },
      { icon: "📝", title: "Import from notes", text: "Upload your notes or a photo and they become flashcards and quizzes made for you." },
      { icon: "🗣️", title: "Voice pronunciation practice", text: "Say a word out loud and see right away how your pronunciation is in English, German and other languages." },
      { icon: "📴", title: "Offline mode", text: "Download lessons and learn on a train or at a cabin without internet." },
    ],
    plans: [
      { price: "CZK 100", per: "per month", perks: ["1 account", "All PRO features for individuals", "Cancel anytime"] },
      { price: "CZK 250", per: "per month", perks: ["Up to 5 family members with full PRO", "Child safe mode", "Start with the child: tips on how to help without interrupting", "Holiday plan so nothing is forgotten over the summer", "Family duel with a handicap for fair chances"] },
      { price: "CZK 12,000", per: "per year per school", perks: ["Class gap map with a ready 20-minute lesson for the next class", "Live lesson: the class plays in teams and the teacher sees who is stuck", "Unseen tests based on the curriculum with key and grading", "Every pupil gets a different task, so copying is pointless", "2-minute exit ticket at the end of a lesson", "Cover teacher buddy: a lesson assigned with one click", "Parent-meeting guide: a page about each pupil", "Slower and faster pace with no labels", "School's own content from uploaded textbooks", "Teacher training and priority support"] },
    ],
    trial: "30 days free",
    note: "Everything already on the site stays free, including courses, points, the wheel of fortune and the parent panel. PRO adds new features. Prices include VAT.",
  },
};

const de: ProText = {
  nav: "UčímePRO",
  title: "UčímePRO",
  subtitle: "Ein Abo, das mehr Punkte und mehr Möglichkeiten bringt. Alles, was du schon hast, bleibt kostenlos.",
  status: {
    guest: "Melde dich an, um den Status deines Abos zu sehen.",
    active: "Du hast ein aktives PRO-Abo.",
    none: "Du hast noch kein aktives PRO-Abo.",
    login: "Anmelden",
  },
  compareTitle: "Kostenlos und PRO",
  compareFree: "Kostenlos",
  comparePro: "PRO",
  rows: [
    { what: "Punkte fürs Lernen", free: "normal", pro: "zusätzlicher Multiplikator" },
    { what: "Glücksrad", free: "1× täglich", pro: "mehr Drehungen" },
    { what: "Möglichkeiten im Shop und in Spielen", free: "grundlegend", pro: "mehr Möglichkeiten" },
  ],
  tiersTitle: "Tarife",
  tiers: {
    individual: { title: "Einzelperson", text: "Ein Abo für ein Konto. Es gilt nur für dich." },
    family: { title: "Familie", text: "Ein Tarif für mehrere Familienmitglieder. Der Zahler verwaltet ihn und fügt Mitglieder hinzu." },
    school: { title: "Schule", text: "Ein Tarif für Schülerinnen und Schüler der gewählten Schule. Er gilt, wenn die Schule in deinem Konto eingetragen ist." },
  },
  availability: "Das Abo wird gerade vorbereitet und kann noch nicht gekauft werden. Preise und Tarifbedingungen ergänzen wir, sobald Zahlungen möglich sind.",
  cta: "Schreib uns",
  ctaText: "Hast du eine Frage oder Interesse an einem Tarif für Schule oder Familie? Melde dich.",
};

const ru: ProText = {
  nav: "UčímePRO",
  title: "UčímePRO",
  subtitle: "Подписка, которая добавляет больше баллов и больше возможностей. Всё, что у тебя уже есть, остаётся бесплатным.",
  status: {
    guest: "Войди, чтобы увидеть статус подписки.",
    active: "У тебя активна подписка PRO.",
    none: "Подписки PRO пока нет.",
    login: "Войти",
  },
  compareTitle: "Бесплатно и PRO",
  compareFree: "Бесплатно",
  comparePro: "PRO",
  rows: [
    { what: "Баллы за учёбу", free: "обычные", pro: "дополнительный множитель" },
    { what: "Колесо удачи", free: "1× в день", pro: "больше вращений" },
    { what: "Возможности в магазине и играх", free: "базовые", pro: "больше возможностей" },
  ],
  tiersTitle: "Тарифы",
  tiers: {
    individual: { title: "Для одного", text: "Подписка на один аккаунт. Действует только для тебя." },
    family: { title: "Семья", text: "Один тариф для нескольких членов семьи. Плательщик им управляет и добавляет участников." },
    school: { title: "Школа", text: "Тариф для учеников выбранной школы. Действует, когда школа указана в твоём аккаунте." },
  },
  availability: "Подписка сейчас готовится и пока не продаётся. Цены и условия тарифов добавим, когда будет возможна оплата.",
  cta: "Написать нам",
  ctaText: "Есть вопрос или интерес к тарифу для школы или семьи? Напиши нам.",
};

const texts: Record<Locale, ProText> = {
  ...withFallbacks({ cs, en, de, ru }),
  uk: {
    nav: "UčímePRO",
    title: "UčímePRO",
    subtitle: "Підписка, яка додає більше балів і більше можливостей. Усе, що в тебе вже є, залишається безкоштовним.",
    status: {
      guest: "Увійди, щоб побачити статус підписки.",
      active: "У тебе активна підписка PRO.",
      none: "У тебе поки немає активної підписки PRO.",
      login: "Увійти",
    },
    compareTitle: "Безкоштовно і PRO",
    compareFree: "Безкоштовно",
    comparePro: "PRO",
    rows: [
      { what: "Бали за навчання", free: "звичайні", pro: "додатковий множник" },
      { what: "Колесо фортуни", free: "1× на день", pro: "більше обертань" },
      { what: "Можливості в крамниці та іграх", free: "базові", pro: "більше можливостей" },
    ],
    tiersTitle: "Тарифи",
    tiers: {
      individual: { title: "Для однієї особи", text: "Підписка на один акаунт. Діє лише для тебе." },
      family: { title: "Родина", text: "Один тариф для кількох членів родини. Платник ним керує і додає учасників." },
      school: { title: "Школа", text: "Тариф для учнів обраної школи. Діє, коли школа вказана в твоєму акаунті." },
    },
    availability: "Підписка зараз готується і поки що не продається. Ціни та умови тарифів додамо, коли буде можлива оплата.",
    cta: "Написати нам",
    ctaText: "Маєш питання або цікавить тариф для школи чи родини? Напиши нам.",
  },
  ja: {
    nav: "UčímePRO",
    title: "UčímePRO",
    subtitle: "ポイントがより多く貯まり、できることも増えるサブスクリプションです。今お持ちのものはすべて無料のままです。",
    status: {
      guest: "サブスクリプションの状態を見るにはログインしてください。",
      active: "PROのサブスクリプションが有効です。",
      none: "まだPROのサブスクリプションが有効ではありません。",
      login: "ログイン",
    },
    compareTitle: "無料とPRO",
    compareFree: "無料",
    comparePro: "PRO",
    rows: [
      { what: "学習ポイント", free: "通常", pro: "追加の倍率" },
      { what: "ラッキーホイール", free: "1日1回", pro: "回転回数が増加" },
      { what: "ショップやゲームでの選択肢", free: "基本", pro: "より多くの選択肢" },
    ],
    tiersTitle: "プラン",
    tiers: {
      individual: { title: "個人", text: "1つのアカウント向けのサブスクリプションです。ご自身だけに適用されます。" },
      family: { title: "ファミリー", text: "家族複数人で使える1つのプランです。支払い者が管理し、メンバーを追加します。" },
      school: { title: "学校", text: "選択した学校の児童・生徒向けのプランです。アカウントに学校が登録されていると適用されます。" },
    },
    availability: "サブスクリプションは準備中のため、現在はご購入いただけません。決済が可能になりましたら、料金とプランの条件を追加します。",
    cta: "お問い合わせ",
    ctaText: "学校や家族向けのプランに関するご質問やご興味はありますか？お気軽にご連絡ください。",
  },
  es: {
    nav: "UčímePRO",
    title: "UčímePRO",
    subtitle: "Una suscripción que añade más puntos y más opciones. Todo lo que ya tienes sigue siendo gratis.",
    status: {
      guest: "Inicia sesión para ver el estado de tu suscripción.",
      active: "Tienes una suscripción PRO activa.",
      none: "Todavía no tienes una suscripción PRO activa.",
      login: "Iniciar sesión",
    },
    compareTitle: "Gratis y PRO",
    compareFree: "Gratis",
    comparePro: "PRO",
    rows: [
      { what: "Puntos por aprender", free: "normales", pro: "multiplicador extra" },
      { what: "Rueda de la fortuna", free: "1× al día", pro: "más giros" },
      { what: "Opciones en la tienda y los juegos", free: "básicas", pro: "más opciones" },
    ],
    tiersTitle: "Tarifas",
    tiers: {
      individual: { title: "Individual", text: "Una suscripción para una cuenta. Solo se aplica a ti." },
      family: { title: "Familiar", text: "Una tarifa para varios miembros de la familia. La persona que paga la gestiona y añade miembros." },
      school: { title: "Escolar", text: "Una tarifa para los alumnos del colegio seleccionado. Se aplica cuando el colegio está indicado en tu cuenta." },
    },
    availability: "La suscripción se está preparando y todavía no se puede comprar. Añadiremos los precios y las condiciones de las tarifas cuando sea posible pagar.",
    cta: "Escríbenos",
    ctaText: "¿Tienes alguna pregunta o te interesa una tarifa para un colegio o una familia? Ponte en contacto.",
  },
  fr: {
    nav: "UčímePRO",
    title: "UčímePRO",
    subtitle: "Un abonnement qui ajoute plus de points et plus d'options. Tout ce que tu as déjà reste gratuit.",
    status: {
      guest: "Connecte-toi pour voir l'état de ton abonnement.",
      active: "Tu as un abonnement PRO actif.",
      none: "Tu n'as pas encore d'abonnement PRO actif.",
      login: "Se connecter",
    },
    compareTitle: "Gratuit et PRO",
    compareFree: "Gratuit",
    comparePro: "PRO",
    rows: [
      { what: "Points pour l'apprentissage", free: "standard", pro: "multiplicateur supplémentaire" },
      { what: "Roue de la fortune", free: "1× par jour", pro: "plus de tours" },
      { what: "Options dans la boutique et les jeux", free: "de base", pro: "plus d'options" },
    ],
    tiersTitle: "Formules",
    tiers: {
      individual: { title: "Individuel", text: "Un abonnement pour un seul compte. Il ne s'applique qu'à toi." },
      family: { title: "Famille", text: "Une formule pour plusieurs membres de la famille. Le payeur la gère et ajoute des membres." },
      school: { title: "École", text: "Une formule pour les élèves de l'école choisie. Elle s'applique lorsque ton école est indiquée dans ton compte." },
    },
    availability: "L'abonnement est en préparation et ne peut pas encore être acheté. Les tarifs et conditions des formules seront ajoutés dès que le paiement sera possible.",
    cta: "Nous écrire",
    ctaText: "Tu as une question ou tu t'intéresses à une formule pour une école ou une famille ? Écris-nous.",
  },
};

export function getProText(locale: Locale): ProText {
  const t = texts[locale] ?? cs;
  if (locale === "cs") return t;
  // Obsah nových funkcí se zatím překládá jen do angličtiny; ostatní jazyky ho berou z ní.
  return { ...t, subtitle: en.subtitle, rows: en.rows, extra: en.extra, availability: en.availability };
}
