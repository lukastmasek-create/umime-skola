import { tr8, type Locale } from "./config";
import type { SketchIconKind } from "@/components/SketchIcons";

export const CONTACT_EMAIL = "ucime.se.hrou@seznam.cz";
export const INSTAGRAM_HANDLE = "ucime.se.hrou";
export const INSTAGRAM_URL = `https://www.instagram.com/${INSTAGRAM_HANDLE}/`;

const privacyLabel = tr8("Ochrana soukromí", "Privacy policy", "Datenschutz", "Конфиденциальность", "Політика конфіденційності", "プライバシーポリシー", "Privacidad", "Confidentialité");
const termsLabel = tr8("Podmínky", "Terms", "Nutzungsbedingungen", "Условия", "Умови використання", "利用規約", "Condiciones", "Conditions");
const cookiesLabel = tr8("Cookies", "Cookies", "Cookies", "Cookies");

export function getFooterLinks(locale: Locale) {
  return { privacy: privacyLabel[locale], terms: termsLabel[locale], cookies: cookiesLabel[locale] };
}

type Section = {
  h: string;
  p?: string;
  icon?: SketchIconKind;
  list?: string[];
  table?: { head: string[]; rows: string[][] };
};
export type LegalPage = {
  title: string;
  updated: string;
  intro: string;
  summaryTitle: string;
  summary: string[];
  tocTitle: string;
  sections: Section[];
};

// Obsah je psaný srozumitelně, ale je to právní text. Před ostrým provozem nechte zkontrolovat právníkem
// (zejména identifikaci provozovatele, lhůty uchovávání a seznam zpracovatelů).

// ---------- Ochrana soukromí ----------

const privacyCs: LegalPage = {
  title: "Ochrana soukromí",
  updated: "Poslední úprava: listopad 2026",
  intro: "Tahle stránka vysvětluje, jaké osobní údaje o vás web Učíme se hrou zpracovává, proč je potřebuje, jak dlouho je držíme a jaká máte práva. Píšeme ji co nejsrozumitelněji. Kdyby něco nebylo jasné, napište nám.",
  summaryTitle: "V kostce",
  summary: [
    "Účet potřebuje jméno, e-mail a heslo. Heslo ukládáme jen jako zabezpečený otisk.",
    "Údaje neprodáváme a nepoužíváme je pro reklamu.",
    "Používáme jen nezbytné cookies, žádné sledování.",
    "Kdykoli můžete požádat o kopii, opravu nebo smazání svých údajů.",
  ],
  tocTitle: "Obsah stránky",
  sections: [
    {
      icon: "info",
      h: "Kdo údaje zpracovává",
      p: `Správcem osobních údajů je tým, který web Učíme se hrou provozuje. Pro všechny dotazy k ochraně soukromí nás kontaktujte na ${CONTACT_EMAIL}.`,
    },
    {
      icon: "user",
      h: "Jaké údaje zpracováváme",
      p: "Které údaje vzniknou, záleží na tom, jak web používáte. Bez jména, e-mailu a hesla nelze vytvořit účet.",
      list: [
        "Účet: jméno, e-mail, heslo (ukládáme jen zabezpečený otisk, nikdy ne čitelnou podobu), případně avatar a vaši školu.",
        "Herní postup: body, úrovně, odemčené hry a kurzy, výsledky v žebříčcích, historie bodů a nákupů v obchodě.",
        "Nastavení: zvolený jazyk, vzhled a nastavení rodičovské kontroly (PIN je uložen jen jako otisk).",
        "Zprávy: texty z kontaktního formuláře, zprávy v týmech a zadání, která žáci odevzdávají učitelům.",
        "Texty pro AI asistenta: to, co do něj napíšete, zpracujeme jen proto, abychom vám odpověděli.",
        "Technické údaje: IP adresa a údaje o požadavcích, které nutně zpracovává hosting a ochrana proti botům.",
      ],
    },
    {
      icon: "gear",
      h: "Proč je používáme a na jakém základě",
      p: "Údaje používáme jen k těmto účelům: provoz účtu a ukládání postupu (plnění smlouvy o používání webu), odpověď na vaše dotazy (vaše žádost nebo náš oprávněný zájem), zabezpečení a ochrana proti zneužití (oprávněný zájem) a plnění zákonných povinností. Údaje neprodáváme, nepoužíváme je k reklamnímu profilování a nepředáváme je třetím stranám k marketingu.",
    },
    {
      icon: "people",
      h: "Zpracovatelé a služby třetích stran",
      p: "Některé části webu běží u externích poskytovatelů, kteří údaje zpracovávají podle našich pokynů a na základě smluv o zpracování:",
      list: [
        "Cloudflare: hosting webu (Cloudflare Workers), odesílání e-mailů a ověření Turnstile proti botům u registrace a kontaktního formuláře.",
        "Databáze PostgreSQL: uložení účtů, postupu a dalších herních dat.",
        "AI asistent: generování odpovědí běží na Cloudflare Workers AI, případně na API společnosti Anthropic, pokud je tak provoz nastaven. Do těchto služeb se posílá jen text, který do asistenta napíšete.",
      ],
    },
    {
      icon: "trophy",
      h: "Děti, žáci a rodiče",
      p: "Žáci mladší 15 let mohou web používat jen se souhlasem rodiče nebo zákonného zástupce. Rodič může v nastavení rodičovské kontroly omezit čas na webu, zakázat nákupy v obchodě nebo společné hraní a dostávat týdenní přehled dokončených kurzů. Pokud zjistíme, že účet dítěte vznikl bez souhlasu zákonného zástupce, účet smažeme.",
    },
    {
      icon: "study",
      h: "Učitelé a školy",
      p: "Učitelé vidí údaje žáků z týmů, do kterých jsou přidáni, a jejich odevzdané úkoly a výsledky, a to jen pro účely výuky. Učitelé nesmějí do týmů vkládat citlivé údaje žáků ani používat údaje mimo výuku. Škola odpovídá za to, že žáky do týmů přidává v souladu se svými pravidly a s případným souhlasem zákonných zástupců.",
    },
    {
      icon: "courses",
      h: "Jak dlouho údaje držíme",
      p: "Údaje z účtu uchováváme po dobu, kdy účet existuje. Po jeho smazání je odstraníme, pokud nám zákon neukládá je dál uchovat (například účetní doklady k nákupům). Zprávy z kontaktního formuláře držíme jen po dobu, kterou potřebujeme k vyřízení dotazu. Záznamy o pokusech o přihlášení a omezování počtu požadavků slouží jen k ochraně proti zneužití a uchovávají se jen krátce. Při smazání účtu zmizí i z žebříčků a týmových přehledů, anonymní souhrnné statistiky mohou zůstat.",
    },
    {
      icon: "shield",
      h: "Zabezpečení",
      p: "Hesla ukládáme jen jako otisk, přístup k datům mají jen lidé, kteří je potřebují k provozu webu, a přenos mezi vaším prohlížečem a námi je šifrovaný (HTTPS). Žádný systém ale není stoprocentně bezpečný. Pokud by došlo k úniku údajů s rizikem pro vás, informujeme vás a Úřad pro ochranu osobních údajů, jak to ukládá zákon.",
    },
    {
      icon: "pencil",
      h: "Cookies a místní úložiště",
      p: "Podrobný přehled je na stránce Zásady cookies. Stručně: používáme jen nezbytné cookies (přihlášení a volbu jazyka) a místní úložiště prohlížeče pro nastavení vzhledu a postup ve hrách. Neslouží k reklamě ani ke sledování.",
    },
    {
      icon: "mail",
      h: "Vaše práva",
      p: `Máte právo požádat o přístup ke svým údajům, o jejich opravu, výmaz (smazání účtu), omezení zpracování, přenos do strojově čitelné podoby a vznést námitku proti zpracování na základě oprávněného zájmu. Žádost pošlete na ${CONTACT_EMAIL}. Odpovíme do jednoho měsíce. Máte také právo podat stížnost u Úřadu pro ochranu osobních údajů.`,
    },
    {
      icon: "scroll",
      h: "Změny těchto zásad",
      p: "Zásady můžeme upravit, například kvůli novým funkcím nebo změně zákona. Aktuální verze je vždy na této stránce a datum poslední úpravy je uvedeno nahoře. O podstatných změnách vás informujeme předem na webu.",
    },
  ],
};

const privacyEn: LegalPage = {
  title: "Privacy policy",
  updated: "Last updated: November 2026",
  intro: "This page explains which personal data the Učíme se hrou site holds about you, why we need it, how long we keep it and what rights you have. We have tried to keep it clear. If something is unclear, just write to us.",
  summaryTitle: "In short",
  summary: [
    "An account needs a name, e-mail and password. Passwords are stored only as a secure hash.",
    "We do not sell your data and do not use it for advertising.",
    "We use only essential cookies, no tracking.",
    "You can ask for a copy, correction or deletion of your data at any time.",
  ],
  tocTitle: "On this page",
  sections: [
    {
      icon: "info",
      h: "Who processes your data",
      p: `The controller of your personal data is the team that runs the Učíme se hrou site. For any privacy questions, contact us at ${CONTACT_EMAIL}.`,
    },
    {
      icon: "user",
      h: "What data we process",
      p: "What is collected depends on how you use the site. An account cannot be created without a name, e-mail and password.",
      list: [
        "Account: name, e-mail, password (stored only as a secure hash, never in readable form), and optionally an avatar and your school.",
        "Game progress: points, levels, unlocked games and courses, leaderboard results, and the history of points and shop purchases.",
        "Settings: chosen language, appearance and parental control settings (the PIN is stored only as a hash).",
        "Messages: text from the contact form, team messages and assignments that pupils submit to teachers.",
        "AI assistant texts: what you type into the assistant is processed only in order to answer you.",
        "Technical data: IP address and request data that hosting and bot protection necessarily process.",
      ],
    },
    {
      icon: "gear",
      h: "Why we use it and on what basis",
      p: "We use data only for these purposes: running your account and saving progress (performance of the contract for using the site), answering your questions (your request or our legitimate interest), security and protection against misuse (legitimate interest), and meeting legal obligations. We do not sell data, do not use it for advertising profiling and do not pass it to third parties for marketing.",
    },
    {
      icon: "people",
      h: "Processors and third-party services",
      p: "Some parts of the site run on external providers, who process data on our instructions under data processing agreements:",
      list: [
        "Cloudflare: site hosting (Cloudflare Workers), sending e-mails, and the Turnstile bot check on sign-up and the contact form.",
        "PostgreSQL database: storage of accounts, progress and other game data.",
        "AI assistant: answers are generated on Cloudflare Workers AI, or on the Anthropic API where that is configured. Only the text you type into the assistant is sent there.",
      ],
    },
    {
      icon: "trophy",
      h: "Children, pupils and parents",
      p: "Pupils under 15 may use the site only with the consent of a parent or legal guardian. In the parental control settings a parent can limit time on the site, block shop purchases or shared play, and receive a weekly overview of completed courses. If we learn that a child's account was created without guardian consent, we will delete it.",
    },
    {
      icon: "study",
      h: "Teachers and schools",
      p: "Teachers can see data about pupils in the teams they belong to, including submitted assignments and results, and only for teaching purposes. Teachers must not put sensitive personal data about pupils into teams or use the data outside teaching. The school is responsible for adding pupils to teams in line with its own rules and any guardian consent required.",
    },
    {
      icon: "courses",
      h: "How long we keep data",
      p: "We keep account data for as long as the account exists. After deletion we remove it, unless the law requires us to keep it longer (for example accounting records for purchases). Contact-form messages are kept only as long as needed to handle your question. Records of sign-in attempts and request limits serve only to prevent misuse and are kept briefly. When an account is deleted, it also disappears from leaderboards and team overviews. Anonymous aggregate statistics may remain.",
    },
    {
      icon: "shield",
      h: "Security",
      p: "Passwords are stored only as hashes, access to data is limited to people who need it to run the site, and traffic between your browser and us is encrypted (HTTPS). No system is perfectly secure, though. If a data breach posed a risk to you, we would inform you and the Office for Personal Data Protection, as the law requires.",
    },
    {
      icon: "pencil",
      h: "Cookies and local storage",
      p: "A detailed overview is on the Cookie policy page. In brief: we use only essential cookies (sign-in and language choice) and browser local storage for appearance settings and game progress. They are not used for advertising or tracking.",
    },
    {
      icon: "mail",
      h: "Your rights",
      p: `You have the right to request access to your data, its correction, erasure (account deletion), restriction of processing, portability in a machine-readable form, and to object to processing based on legitimate interest. Send your request to ${CONTACT_EMAIL}. We will reply within one month. You also have the right to lodge a complaint with the Office for Personal Data Protection (ÚOOÚ) in the Czech Republic.`,
    },
    {
      icon: "scroll",
      h: "Changes to this policy",
      p: "We may update this policy, for example because of new features or changes in the law. The current version is always on this page and the date of the last update is shown at the top. We will announce significant changes on the site in advance.",
    },
  ],
};

// ---------- Podmínky použití ----------

const termsCs: LegalPage = {
  title: "Podmínky použití",
  updated: "Poslední úprava: listopad 2026",
  intro: "Tyto podmínky upravují používání webu Učíme se hrou. Vytvořením účtu nebo používáním webu s nimi souhlasíte. Snažíme se, aby byly srozumitelné, ale jsou závazné jako každá smlouva.",
  summaryTitle: "V kostce",
  summary: [
    "Web slouží k učení a procvičování. Hrajte férově.",
    "Za svůj účet odpovídáte vy, a u dětských účtů i zákonný zástupce.",
    "Body, mince a herní peníze nejsou skutečné peníze a nelze je vyplatit.",
    "Obsah webu je náš. Kopírovat ho můžete jen se souhlasem.",
  ],
  tocTitle: "Obsah stránky",
  sections: [
    {
      icon: "info",
      h: "Úvod a rozsah",
      p: "Podmínky platí pro každého, kdo web navštíví nebo má účet, včetně žáků, učitelů a rodičů. Pokud s nimi nesouhlasíte, web prosím nepoužívejte.",
    },
    {
      icon: "user",
      h: "Registrace a účet",
      list: [
        "Při registraci uvádíte pravdivé údaje a heslo chráníte před ostatními.",
        "Žáci mladší 15 let se mohou zaregistrovat jen se souhlasem rodiče nebo zákonného zástupce.",
        "Jeden člověk má mít jeden účet. Účet nesmíte předat jinému ani ho používat jménem někoho jiného.",
        "Pokud zjistíte zneužití svého účtu, ozvěte se nám co nejdříve.",
      ],
      p: "Účet je osobní. Odpovídáte za všechny činnosti, které se přes něj provedou, pokud jste je neohlásili.",
    },
    {
      icon: "gamepad",
      h: "Fair play, body a žebříčky",
      p: "Body, odměny a žebříčky mají odrážet vaše skutečné učení. Zakázané je používat automatické nástroje a skripty, zneužívat chyby webu, hrát pod cizím účtem, záměrně ovlivňovat výsledky a obcházet omezení, například rodičovskou kontrolu nebo časový limit. Porušení může vést ke smazání bodů nebo zrušení účtu.",
    },
    {
      icon: "people",
      h: "Chování a obsah uživatelů",
      list: [
        "Zprávy v týmech, názvy místností, recenze v obchodě a další texty, které napíšete, musí být slušné a nesmí urážet ani ohrožovat ostatní.",
        "Nesmíte zveřejňovat osobní údaje jiných lidí, obsah, který porušuje zákon, ani spam.",
        "Texty, které napíšete, zůstávají vaše. Dáváte nám ale nevýhradní právo je v rámci webu zobrazit, třeba v žebříčku nebo v týmu.",
        "Obsah, který porušuje tato pravidla, můžeme upravit nebo odstranit.",
      ],
    },
    {
      icon: "trophy",
      h: "Body, mince a herní peníze",
      p: "Body, mince, předměty a herní peníze z Ekonomiky jsou součástí hry. Nemají skutečnou peněžní hodnotu a nelze je vyplatit. Používat je můžete jen uvnitř webu, v obchodě a na trhu mezi hráči. Pokud by se v budoucnu objevily placené produkty nebo předplatná, jejich podmínky a cenu uvedeme předem a odděleně.",
    },
    {
      icon: "shop",
      h: "Obchod, limitované edice a ceny",
      p: "Pokud je u funkce uvedena cena, platí cena zobrazená v době objednávky. Limitované edice mají omezený počet kusů a jejich dostupnost se může změnit. Dostupnost a obsah obchodu, koupených předmětů a výher v kole štěstí se mohou v čase upravovat.",
    },
    {
      icon: "courses",
      h: "Obsah a autorská práva",
      p: "Texty, úlohy, grafiku, animace a hry na webu vytváří náš tým, nebo jsou použity se souhlasem autora. Můžete je používat k osobnímu učení. Kopírovat, upravovat, dále šířit nebo komerčně využívat je bez písemného souhlasu zakázáno. Úlohy připravujeme s péčí, ale nemůžeme zaručit, že jsou zcela bez chyb. Pokud nějakou najdete, napište nám.",
    },
    {
      icon: "study",
      h: "Učitelé, týmy a zadání",
      p: "Učitelé mohou zakládat týmy, zadávat úkoly a sledovat výsledky žáků. Musí to dělat v souladu s právem, pro účely výuky a s ohledem na ochranu údajů žáků (viz Ochrana soukromí). Učitel nebo škola odpovídá za to, že žáky do týmu přidává v souladu s pravidly školy a s případným souhlasem zákonných zástupců.",
    },
    {
      icon: "rocket",
      h: "AI asistent a generované texty",
      p: "AI asistent slouží k pomoci s učením, ne jako zaručený zdroj informací. Jeho odpovědi se mohou mýlit a nenahrazují odborné posouzení, učitele ani lékaře. Do asistenta neposílejte citlivé údaje, jako jsou hesla, rodná čísla nebo zdravotní údaje.",
    },
    {
      icon: "shield",
      h: "Dostupnost a odpovědnost",
      p: "Web provozujeme průběžně, ale nemůžeme zaručit, že bude vždy dostupný a bez chyb. Můžeme dočasně přerušit provoz kvůli údržbě nebo novým funkcím. V rozsahu, který zákon dovoluje, neneseme odpovědnost za nepřímé škody vzniklé používáním webu. Práva spotřebitele, která nelze smluvně vyloučit, tím nejsou dotčena.",
    },
    {
      icon: "close",
      h: "Ukončení účtu",
      p: "Účet můžete kdykoli zrušit v nastavení, nebo nám to napište na e-mail. Účet, který porušuje tyto podmínky nebo ruší ostatní, můžeme omezit nebo zrušit. Pokud to půjde, předem vám to oznámíme a vysvětlíme důvod.",
    },
    {
      icon: "scroll",
      h: "Změny podmínek a rozhodné právo",
      p: "Podmínky můžeme změnit. O podstatných změnách vás předem upozorníme na webu. Pokud s nimi nesouhlasíte, můžete účet zrušit. Na vztah mezi vámi a provozovatelem se vztahuje právní řád České republiky. Spotřebitelé mohou využít mimosoudní řešení sporů u České obchodní inspekce.",
    },
    {
      icon: "mail",
      h: "Kontakt",
      p: `Dotazy k podmínkám pište na ${CONTACT_EMAIL}.`,
    },
  ],
};

const termsEn: LegalPage = {
  title: "Terms of use",
  updated: "Last updated: November 2026",
  intro: "These terms govern the use of the Učíme se hrou site. By creating an account or using the site you agree to them. We have tried to keep them readable, but they are binding like any contract.",
  summaryTitle: "In short",
  summary: [
    "The site is for learning and practice. Play fair.",
    "You are responsible for your account, and for child accounts so is the parent or guardian.",
    "Points, coins and in-game money are not real money and cannot be cashed out.",
    "The site content is ours. You may copy it only with permission.",
  ],
  tocTitle: "On this page",
  sections: [
    {
      icon: "info",
      h: "Introduction and scope",
      p: "These terms apply to everyone who visits the site or has an account, including pupils, teachers and parents. If you do not agree with them, please do not use the site.",
    },
    {
      icon: "user",
      h: "Sign-up and accounts",
      list: [
        "When you sign up you give true details and keep your password away from others.",
        "Pupils under 15 may sign up only with the consent of a parent or legal guardian.",
        "One person should have one account. Do not pass your account to someone else or use it on behalf of another person.",
        "If you notice that your account has been misused, contact us as soon as possible.",
      ],
      p: "Your account is personal. You are responsible for activity carried out through it unless you have reported it.",
    },
    {
      icon: "gamepad",
      h: "Fair play, points and leaderboards",
      p: "Points, rewards and leaderboards should reflect your real learning. The following is not allowed: automated tools and scripts, abusing site bugs, playing on someone else's account, deliberately manipulating results, and bypassing limits such as parental controls or time limits. A breach may lead to points being removed or the account being closed.",
    },
    {
      icon: "people",
      h: "User behaviour and content",
      list: [
        "Team messages, room names, shop reviews and other text you write must be polite and must not insult or threaten others.",
        "Do not publish other people's personal data, unlawful content or spam.",
        "The texts you write remain yours. You grant us a non-exclusive right to display them within the site, for example on a leaderboard or in a team.",
        "We may edit or remove content that breaks these rules.",
      ],
    },
    {
      icon: "trophy",
      h: "Points, coins and in-game money",
      p: "Points, coins, items and in-game money from the Economy are part of the game. They have no real monetary value and cannot be cashed out. You may use them only inside the site, in the shop and on the player market. If paid products or subscriptions are introduced in the future, we will publish their terms and prices in advance and separately.",
    },
    {
      icon: "shop",
      h: "Shop, limited editions and prices",
      p: "Where a price is shown for a feature, the price displayed at the time of ordering applies. Limited editions are available in limited numbers and their availability may change. The shop, purchased items and wheel-of-fortune prizes may change over time.",
    },
    {
      icon: "courses",
      h: "Content and copyright",
      p: "The texts, tasks, graphics, animations and games on the site are created by our team or used with the author's permission. You may use them for personal learning. Copying, modifying, redistributing or commercially using them without written permission is prohibited. We prepare tasks with care but cannot guarantee they are completely error-free. If you find a mistake, please let us know.",
    },
    {
      icon: "study",
      h: "Teachers, teams and assignments",
      p: "Teachers may create teams, set assignments and follow pupils' results. They must do so in line with the law, for teaching purposes and with regard to pupils' data protection (see Privacy policy). The teacher or school is responsible for adding pupils to a team in line with school rules and any guardian consent required.",
    },
    {
      icon: "rocket",
      h: "AI assistant and generated text",
      p: "The AI assistant is there to help with learning, not as a guaranteed source of information. Its answers can be wrong and do not replace professional advice, a teacher or a doctor. Do not send sensitive data to the assistant, such as passwords, national ID numbers or health data.",
    },
    {
      icon: "shield",
      h: "Availability and liability",
      p: "We run the site continuously but cannot guarantee that it will always be available and error-free. We may temporarily suspend it for maintenance or new features. To the extent the law allows, we are not liable for indirect damage caused by using the site. Consumer rights that cannot be excluded by contract are not affected.",
    },
    {
      icon: "close",
      h: "Closing your account",
      p: "You can close your account at any time in the settings, or by writing to us. We may limit or close an account that breaks these terms or disturbs others. Where possible, we will tell you in advance and explain why.",
    },
    {
      icon: "scroll",
      h: "Changes and governing law",
      p: "We may change these terms. We will warn you in advance on the site about significant changes. If you do not agree with them, you can close your account. The relationship between you and the operator is governed by the law of the Czech Republic. Consumers may use out-of-court dispute resolution through the Czech Trade Inspection Authority.",
    },
    {
      icon: "mail",
      h: "Contact",
      p: `Questions about these terms: ${CONTACT_EMAIL}.`,
    },
  ],
};

// ---------- Zásady cookies ----------

const cookiesCs: LegalPage = {
  title: "Zásady cookies",
  updated: "Poslední úprava: listopad 2026",
  intro: "Vysvětlujeme, co jsou cookies a podobné technologie, které web používá, proč je používá a jak je můžete spravovat. Všechny položky, které používáme, jsou uvedeny v tabulce.",
  summaryTitle: "V kostce",
  summary: [
    "Používáme jen nezbytné cookies a místní úložiště prohlížeče.",
    "Nepoužíváme reklamní ani analytické cookies.",
    "Bez nezbytných cookies nemůže web bezpečně fungovat (přihlášení, jazyk).",
  ],
  tocTitle: "Obsah stránky",
  sections: [
    {
      icon: "info",
      h: "Co jsou cookies a místní úložiště",
      p: "Cookies jsou malé textové soubory, které web uloží do vašeho prohlížeče a při další návštěvě je pošle zpět. Místní úložiště (localStorage) funguje podobně, ale data zůstávají jen v prohlížeči a neposílají se na server. Obojí používáme jen k účelům popsaným na této stránce.",
    },
    {
      icon: "shield",
      h: "Nezbytné cookies",
      p: "Tyto položky web potřebuje pro základní provoz. Pro jejich použití nežádáme souhlas, protože bez nich nelze bezpečně provozovat účty.",
      table: {
        head: ["Název", "Účel", "Platnost", "Typ"],
        rows: [
          ["NEXT_LOCALE", "Uchovává zvolený jazyk webu", "1 rok", "Vlastní (první strana)"],
          ["Přihlašovací cookie (session)", "Udrží vás přihlášené po dobu relace", "Do odhlášení nebo vypršení relace", "Vlastní (první strana), nečitelná pro skripty"],
          ["Cookies Cloudflare Turnstile", "Ověří, že nejste robot, u registrace a kontaktního formuláře", "Podle poskytovatele (krátkodobé)", "Třetí strana (Cloudflare)"],
        ],
      },
    },
    {
      icon: "gear",
      h: "Místní úložiště prohlížeče",
      p: "Ukládáme jen to, co potřebujeme ke správnému zobrazení a pohodlí: nastavení vzhledu (téma, písmo, velikost, barvy, pohyb a rozestupy), denní cíl, nejlepší výsledky her, zvolenou šablonu denního kvízu a stav některých herních prvků, například zda jste už viděli úvod. Tyto údaje zůstávají ve vašem zařízení.",
    },
    {
      icon: "star",
      h: "Cookies, které nepoužíváme",
      list: [
        "Reklamní cookies a sítě, které cílí reklamy.",
        "Analytické nástroje jako Google Analytics nebo podobné nástroje pro měření návštěvnosti.",
        "Sledování napříč weby a profilování uživatelů.",
      ],
    },
    {
      icon: "pencil",
      h: "Jak cookies spravovat",
      p: "Cookies a místní úložiště můžete kdykoli smazat nebo zablokovat v nastavení prohlížeče. Pokud smažete místní úložiště, vrátí se výchozí vzhled a resetuje se postup v hrách, který není uložený na účtu. Blokování nezbytných cookies může způsobit, že se nepřihlásíte nebo nebude fungovat volba jazyka.",
    },
    {
      icon: "mail",
      h: "Změny a kontakt",
      p: `Pokud přidáme nové cookies, tuto stránku aktualizujeme. Dotazy k cookies pište na ${CONTACT_EMAIL}. Více o zpracování údajů najdete v sekci Ochrana soukromí.`,
    },
  ],
};

const cookiesEn: LegalPage = {
  title: "Cookie policy",
  updated: "Last updated: November 2026",
  intro: "We explain what cookies and similar technologies the site uses, why we use them and how you can manage them. Every item we use is listed in the table.",
  summaryTitle: "In short",
  summary: [
    "We use only essential cookies and browser local storage.",
    "We do not use advertising or analytics cookies.",
    "Without essential cookies the site cannot run securely (sign-in, language).",
  ],
  tocTitle: "On this page",
  sections: [
    {
      icon: "info",
      h: "What cookies and local storage are",
      p: "Cookies are small text files that a website stores in your browser and sends back on your next visit. Local storage (localStorage) works in a similar way, but the data stays in your browser and is not sent to the server. We use both only for the purposes described on this page.",
    },
    {
      icon: "shield",
      h: "Essential cookies",
      p: "The site needs these items to run. We do not ask for consent for them, because accounts cannot be run securely without them.",
      table: {
        head: ["Name", "Purpose", "Duration", "Type"],
        rows: [
          ["NEXT_LOCALE", "Stores your chosen site language", "1 year", "First-party"],
          ["Sign-in cookie (session)", "Keeps you signed in for the session", "Until sign-out or session expiry", "First-party, not readable by scripts"],
          ["Cloudflare Turnstile cookies", "Checks that you are not a bot on sign-up and the contact form", "Set by the provider (short-lived)", "Third-party (Cloudflare)"],
        ],
      },
    },
    {
      icon: "gear",
      h: "Browser local storage",
      p: "We store only what is needed to display the site correctly and for convenience: appearance settings (theme, font, size, colours, motion and spacing), your daily goal, best game results, the selected daily quiz template and the state of some game elements, for example whether you have already seen the intro. This data stays on your device.",
    },
    {
      icon: "star",
      h: "Cookies we do not use",
      list: [
        "Advertising cookies and ad networks that target ads.",
        "Analytics tools such as Google Analytics or similar traffic measurement tools.",
        "Cross-site tracking and user profiling.",
      ],
    },
    {
      icon: "pencil",
      h: "How to manage cookies",
      p: "You can delete or block cookies and local storage at any time in your browser settings. If you delete local storage, the default appearance returns and any game progress not saved to your account is reset. Blocking essential cookies may stop you from signing in or make the language choice stop working.",
    },
    {
      icon: "mail",
      h: "Changes and contact",
      p: `If we add new cookies, we will update this page. Questions about cookies: ${CONTACT_EMAIL}. More about data processing is in the Privacy policy.`,
    },
  ],
};

const privacyDe: LegalPage = {
  title: "Datenschutzerklärung",
  updated: "Zuletzt aktualisiert: November 2026",
  intro: "Diese Seite erklärt, welche personenbezogenen Daten die Website Učíme se hrou über dich speichert, warum wir sie brauchen, wie lange wir sie aufbewahren und welche Rechte du hast. Wir haben versucht, es verständlich zu halten. Wenn etwas unklar ist, schreib uns einfach.",
  summaryTitle: "Kurz gesagt",
  summary: [
    "Für ein Konto braucht es Name, E-Mail und Passwort. Passwörter werden nur als sicherer Hash gespeichert.",
    "Wir verkaufen deine Daten nicht und nutzen sie nicht für Werbung.",
    "Wir verwenden nur notwendige Cookies, kein Tracking.",
    "Du kannst jederzeit eine Kopie, eine Berichtigung oder die Löschung deiner Daten verlangen.",
  ],
  tocTitle: "Auf dieser Seite",
  sections: [
    {
      icon: "info",
      h: "Wer deine Daten verarbeitet",
      p: `Verantwortlich für deine personenbezogenen Daten ist das Team, das die Website Učíme se hrou betreibt. Bei Fragen zum Datenschutz erreichst du uns unter ${CONTACT_EMAIL}.`,
    },
    {
      icon: "user",
      h: "Welche Daten wir verarbeiten",
      p: "Welche Daten erhoben werden, hängt davon ab, wie du die Website nutzt. Ein Konto kann nicht ohne Name, E-Mail und Passwort erstellt werden.",
      list: [
        "Konto: Name, E-Mail, Passwort (nur als sicherer Hash gespeichert, nie im Klartext) und optional ein Avatar und deine Schule.",
        "Spielfortschritt: Punkte, Level, freigeschaltete Spiele und Kurse, Ergebnisse in der Rangliste sowie der Verlauf von Punkten und Shop-Käufen.",
        "Einstellungen: gewählte Sprache, Aussehen und Einstellungen der Kindersicherung (die PIN wird nur als Hash gespeichert).",
        "Nachrichten: Text aus dem Kontaktformular, Teamnachrichten und Aufgaben, die Schüler an Lehrkräfte abgeben.",
        "Texte des KI-Assistenten: Was du in den Assistenten eingibst, wird nur verarbeitet, um dir zu antworten.",
        "Technische Daten: IP-Adresse und Anfragedaten, die Hosting und Bot-Schutz zwangsläufig verarbeiten.",
      ],
    },
    {
      icon: "gear",
      h: "Wozu wir sie verwenden und auf welcher Grundlage",
      p: "Wir verwenden Daten nur für diese Zwecke: Betrieb deines Kontos und Speicherung des Fortschritts (Erfüllung des Vertrags zur Nutzung der Website), Beantwortung deiner Fragen (deine Anfrage oder unser berechtigtes Interesse), Sicherheit und Schutz vor Missbrauch (berechtigtes Interesse) sowie die Erfüllung gesetzlicher Pflichten. Wir verkaufen keine Daten, nutzen sie nicht für werbliches Profiling und geben sie nicht zu Marketingzwecken an Dritte weiter.",
    },
    {
      icon: "people",
      h: "Auftragsverarbeiter und Drittdienste",
      p: "Einige Teile der Website laufen bei externen Anbietern, die Daten in unserem Auftrag auf Grundlage von Auftragsverarbeitungsverträgen verarbeiten:",
      list: [
        "Cloudflare: Hosting der Website (Cloudflare Workers), Versand von E-Mails und die Turnstile-Bot-Prüfung bei der Registrierung und im Kontaktformular.",
        "PostgreSQL-Datenbank: Speicherung von Konten, Fortschritt und anderen Spieldaten.",
        "KI-Assistent: Antworten werden auf Cloudflare Workers AI oder, wo dies eingerichtet ist, über die Anthropic-API erzeugt. Dorthin wird nur der Text gesendet, den du in den Assistenten eingibst.",
      ],
    },
    {
      icon: "trophy",
      h: "Kinder, Schüler und Eltern",
      p: "Schüler unter 15 Jahren dürfen die Website nur mit Zustimmung eines Elternteils oder einer gesetzlichen Vertretung nutzen. In den Einstellungen der Kindersicherung können Eltern die Zeit auf der Website begrenzen, Käufe im Shop oder gemeinsames Spielen sperren und eine wöchentliche Übersicht über abgeschlossene Kurse erhalten. Wenn wir erfahren, dass ein Kinderkonto ohne Zustimmung der Erziehungsberechtigten erstellt wurde, löschen wir es.",
    },
    {
      icon: "study",
      h: "Lehrkräfte und Schulen",
      p: "Lehrkräfte können Daten über Schüler in den Teams sehen, denen sie angehören, einschließlich abgegebener Aufgaben und Ergebnisse, und nur für Unterrichtszwecke. Lehrkräfte dürfen keine sensiblen personenbezogenen Daten von Schülern in Teams eintragen oder die Daten außerhalb des Unterrichts verwenden. Die Schule ist dafür verantwortlich, Schüler im Einklang mit ihren eigenen Regeln und einer etwaig erforderlichen Zustimmung der Erziehungsberechtigten in Teams aufzunehmen.",
    },
    {
      icon: "courses",
      h: "Wie lange wir Daten aufbewahren",
      p: "Kontodaten bewahren wir auf, solange das Konto besteht. Nach der Löschung entfernen wir sie, außer das Gesetz verlangt eine längere Aufbewahrung (zum Beispiel Buchhaltungsunterlagen zu Käufen). Nachrichten aus dem Kontaktformular bewahren wir nur so lange auf, wie es zur Bearbeitung deiner Anfrage nötig ist. Protokolle über Anmeldeversuche und Anfragelimits dienen nur der Verhinderung von Missbrauch und werden nur kurz gespeichert. Wenn ein Konto gelöscht wird, verschwindet es auch aus den Ranglisten und Teamübersichten. Anonyme Gesamtstatistiken dürfen erhalten bleiben.",
    },
    {
      icon: "shield",
      h: "Sicherheit",
      p: "Passwörter werden nur als Hash gespeichert, der Zugriff auf Daten ist auf Personen beschränkt, die sie für den Betrieb der Website brauchen, und die Verbindung zwischen deinem Browser und uns ist verschlüsselt (HTTPS). Kein System ist jedoch völlig sicher. Wenn eine Datenpanne ein Risiko für dich darstellen würde, würden wir dich und das Amt für den Schutz personenbezogener Daten informieren, wie es das Gesetz verlangt.",
    },
    {
      icon: "pencil",
      h: "Cookies und lokaler Speicher",
      p: "Eine ausführliche Übersicht findest du auf der Seite zur Cookie-Richtlinie. Kurz gesagt: Wir verwenden nur notwendige Cookies (Anmeldung und Sprachwahl) sowie den lokalen Browserspeicher für Aussehenseinstellungen und Spielfortschritt. Sie dienen nicht der Werbung oder dem Tracking.",
    },
    {
      icon: "mail",
      h: "Deine Rechte",
      p: `Du hast das Recht, Auskunft über deine Daten zu verlangen, sie berichtigen oder löschen (Kontolöschung) zu lassen, die Verarbeitung einschränken zu lassen, sie in maschinenlesbarer Form zu erhalten und einer Verarbeitung auf Grundlage eines berechtigten Interesses zu widersprechen. Sende deine Anfrage an ${CONTACT_EMAIL}. Wir antworten innerhalb eines Monats. Außerdem hast du das Recht, bei der tschechischen Datenschutzbehörde (ÚOOÚ) Beschwerde einzulegen.`,
    },
    {
      icon: "scroll",
      h: "Änderungen dieser Erklärung",
      p: "Wir können diese Erklärung aktualisieren, zum Beispiel wegen neuer Funktionen oder geänderter Rechtslage. Die aktuelle Fassung steht immer auf dieser Seite, das Datum der letzten Aktualisierung oben. Wesentliche Änderungen kündigen wir vorab auf der Website an.",
    },
  ],
};

const termsDe: LegalPage = {
  title: "Nutzungsbedingungen",
  updated: "Zuletzt aktualisiert: November 2026",
  intro: "Diese Bedingungen regeln die Nutzung der Website Učíme se hrou. Mit der Erstellung eines Kontos oder der Nutzung der Website stimmst du ihnen zu. Wir haben sie verständlich gehalten, sie sind aber wie jeder Vertrag verbindlich.",
  summaryTitle: "Kurz gesagt",
  summary: [
    "Die Website dient dem Lernen und Üben. Spiel fair.",
    "Du bist für dein Konto verantwortlich, bei Kinderkonten auch der Elternteil oder die gesetzliche Vertretung.",
    "Punkte, Münzen und Spielgeld sind kein echtes Geld und können nicht ausgezahlt werden.",
    "Die Inhalte der Website gehören uns. Du darfst sie nur mit Erlaubnis kopieren.",
  ],
  tocTitle: "Auf dieser Seite",
  sections: [
    {
      icon: "info",
      h: "Einleitung und Geltungsbereich",
      p: "Diese Bedingungen gelten für alle, die die Website besuchen oder ein Konto haben, auch für Schüler, Lehrkräfte und Eltern. Wenn du ihnen nicht zustimmst, nutze bitte die Website nicht.",
    },
    {
      icon: "user",
      h: "Registrierung und Konten",
      list: [
        "Bei der Registrierung gibst du wahre Angaben an und hältst dein Passwort geheim.",
        "Schüler unter 15 Jahren dürfen sich nur mit Zustimmung eines Elternteils oder einer gesetzlichen Vertretung registrieren.",
        "Eine Person sollte ein Konto haben. Gib dein Konto nicht an andere weiter und nutze es nicht im Namen einer anderen Person.",
        "Wenn du bemerkst, dass dein Konto missbraucht wird, kontaktiere uns so schnell wie möglich.",
      ],
      p: "Dein Konto ist persönlich. Du bist für Aktivitäten verantwortlich, die über dein Konto stattfinden, sofern du sie nicht gemeldet hast.",
    },
    {
      icon: "gamepad",
      h: "Fair Play, Punkte und Ranglisten",
      p: "Punkte, Belohnungen und Ranglisten sollen dein tatsächliches Lernen widerspiegeln. Nicht erlaubt sind: automatisierte Werkzeuge und Skripte, das Ausnutzen von Fehlern der Website, das Spielen auf dem Konto einer anderen Person, das bewusste Manipulieren von Ergebnissen sowie das Umgehen von Grenzen wie der Kindersicherung oder Zeitlimits. Ein Verstoß kann dazu führen, dass Punkte entfernt oder das Konto geschlossen wird.",
    },
    {
      icon: "people",
      h: "Verhalten der Nutzer und Inhalte",
      list: [
        "Teamnachrichten, Raumnamen, Shop-Bewertungen und andere Texte, die du schreibst, müssen höflich sein und dürfen andere weder beleidigen noch bedrohen.",
        "Veröffentliche keine persönlichen Daten anderer Personen, keine rechtswidrigen Inhalte und keinen Spam.",
        "Die Texte, die du schreibst, bleiben deine. Du räumst uns das nicht ausschließliche Recht ein, sie innerhalb der Website anzuzeigen, zum Beispiel in einer Rangliste oder in einem Team.",
        "Wir dürfen Inhalte, die gegen diese Regeln verstoßen, bearbeiten oder entfernen.",
      ],
    },
    {
      icon: "trophy",
      h: "Punkte, Münzen und Spielgeld",
      p: "Punkte, Münzen, Gegenstände und Spielgeld aus der Ökonomie sind Teil des Spiels. Sie haben keinen echten Geldwert und können nicht ausgezahlt werden. Du darfst sie nur innerhalb der Website, im Shop und auf dem Spielermarkt verwenden. Sollten künftig kostenpflichtige Produkte oder Abonnements eingeführt werden, veröffentlichen wir deren Bedingungen und Preise vorab und gesondert.",
    },
    {
      icon: "shop",
      h: "Shop, limitierte Editionen und Preise",
      p: "Wo bei einer Funktion ein Preis angezeigt wird, gilt der Preis, der zum Zeitpunkt der Bestellung angezeigt wird. Limitierte Editionen sind nur in begrenzter Stückzahl verfügbar, und ihre Verfügbarkeit kann sich ändern. Shop, gekaufte Gegenstände und Gewinne aus dem Glücksrad können sich mit der Zeit ändern.",
    },
    {
      icon: "courses",
      h: "Inhalte und Urheberrecht",
      p: "Die Texte, Aufgaben, Grafiken, Animationen und Spiele auf der Website stammen von unserem Team oder werden mit Erlaubnis der Urheber verwendet. Du darfst sie für dein persönliches Lernen nutzen. Kopieren, Verändern, Weitergeben oder kommerzielle Nutzung ohne schriftliche Genehmigung ist untersagt. Wir erstellen Aufgaben sorgfältig, können aber nicht garantieren, dass sie völlig fehlerfrei sind. Wenn du einen Fehler findest, sag uns bitte Bescheid.",
    },
    {
      icon: "study",
      h: "Lehrkräfte, Teams und Aufgaben",
      p: "Lehrkräfte dürfen Teams anlegen, Aufgaben stellen und die Ergebnisse von Schülern verfolgen. Sie müssen das im Einklang mit dem Gesetz, zu Unterrichtszwecken und unter Beachtung des Datenschutzes der Schüler tun (siehe Datenschutzerklärung). Die Lehrkraft oder Schule ist dafür verantwortlich, Schüler im Einklang mit den Schulregeln und einer etwaig erforderlichen Zustimmung der Erziehungsberechtigten in ein Team aufzunehmen.",
    },
    {
      icon: "rocket",
      h: "KI-Assistent und erzeugter Text",
      p: "Der KI-Assistent soll beim Lernen helfen und ist keine garantierte Informationsquelle. Seine Antworten können falsch sein und ersetzen keine fachliche Beratung, keine Lehrkraft und keinen Arzt. Sende dem Assistenten keine sensiblen Daten wie Passwörter, Ausweisnummern oder Gesundheitsdaten.",
    },
    {
      icon: "shield",
      h: "Verfügbarkeit und Haftung",
      p: "Wir betreiben die Website durchgehend, können aber nicht garantieren, dass sie immer verfügbar und fehlerfrei ist. Wir können sie für Wartungsarbeiten oder neue Funktionen vorübergehend aussetzen. Soweit das Gesetz es erlaubt, haften wir nicht für mittelbare Schäden durch die Nutzung der Website. Verbraucherrechte, die vertraglich nicht ausgeschlossen werden können, bleiben unberührt.",
    },
    {
      icon: "close",
      h: "Schließen deines Kontos",
      p: "Du kannst dein Konto jederzeit in den Einstellungen oder durch eine Nachricht an uns schließen. Wir können ein Konto einschränken oder schließen, das gegen diese Bedingungen verstößt oder andere stört. Wenn möglich, informieren wir dich vorher und erklären den Grund.",
    },
    {
      icon: "scroll",
      h: "Änderungen und anwendbares Recht",
      p: "Wir können diese Bedingungen ändern. Über wesentliche Änderungen informieren wir dich vorab auf der Website. Wenn du ihnen nicht zustimmst, kannst du dein Konto schließen. Das Verhältnis zwischen dir und dem Betreiber unterliegt dem Recht der Tschechischen Republik. Verbraucher können die außergerichtliche Streitbeilegung über die tschechische Handelsinspektion nutzen.",
    },
    {
      icon: "mail",
      h: "Kontakt",
      p: `Fragen zu diesen Bedingungen: ${CONTACT_EMAIL}.`,
    },
  ],
};

const cookiesDe: LegalPage = {
  title: "Cookie-Richtlinie",
  updated: "Zuletzt aktualisiert: November 2026",
  intro: "Wir erklären, welche Cookies und ähnlichen Technologien die Website verwendet, warum wir sie einsetzen und wie du sie verwalten kannst. Jedes Element, das wir nutzen, steht in der Tabelle.",
  summaryTitle: "Kurz gesagt",
  summary: [
    "Wir verwenden nur notwendige Cookies und den lokalen Speicher des Browsers.",
    "Wir verwenden keine Werbe- oder Analyse-Cookies.",
    "Ohne notwendige Cookies kann die Website nicht sicher laufen (Anmeldung, Sprache).",
  ],
  tocTitle: "Auf dieser Seite",
  sections: [
    {
      icon: "info",
      h: "Was Cookies und lokaler Speicher sind",
      p: "Cookies sind kleine Textdateien, die eine Website in deinem Browser speichert und beim nächsten Besuch zurücksendet. Der lokale Speicher (localStorage) funktioniert ähnlich, die Daten bleiben aber in deinem Browser und werden nicht an den Server gesendet. Wir verwenden beides nur für die Zwecke, die auf dieser Seite beschrieben sind.",
    },
    {
      icon: "shield",
      h: "Notwendige Cookies",
      p: "Die Website braucht diese Elemente, um zu funktionieren. Wir fragen dafür nicht um Zustimmung, weil Konten ohne sie nicht sicher betrieben werden können.",
      table: {
        head: ["Name", "Zweck", "Dauer", "Art"],
        rows: [
          ["NEXT_LOCALE", "Speichert die gewählte Sprache der Website", "1 Jahr", "Eigene Website"],
          ["Anmelde-Cookie (Sitzung)", "Hält dich für die Sitzung angemeldet", "Bis zur Abmeldung oder zum Ablauf der Sitzung", "Eigene Website, für Skripte nicht lesbar"],
          ["Cloudflare-Turnstile-Cookies", "Prüft bei der Registrierung und im Kontaktformular, dass du kein Bot bist", "Vom Anbieter gesetzt (kurzlebig)", "Drittanbieter (Cloudflare)"],
        ],
      },
    },
    {
      icon: "gear",
      h: "Lokaler Speicher des Browsers",
      p: "Wir speichern nur, was nötig ist, um die Website korrekt anzuzeigen, und zur Bequemlichkeit: Aussehenseinstellungen (Design, Schrift, Größe, Farben, Bewegung und Abstände), dein Tagesziel, die besten Spielergebnisse, die gewählte Vorlage des Tagesquiz und den Zustand einiger Spielelemente, zum Beispiel ob du die Einführung schon gesehen hast. Diese Daten bleiben auf deinem Gerät.",
    },
    {
      icon: "star",
      h: "Cookies, die wir nicht verwenden",
      list: [
        "Werbe-Cookies und Werbenetzwerke, die Anzeigen gezielt ausspielen.",
        "Analyse-Werkzeuge wie Google Analytics oder ähnliche Reichweitenmessung.",
        "Seitenübergreifendes Tracking und Nutzerprofilierung.",
      ],
    },
    {
      icon: "pencil",
      h: "So verwaltest du Cookies",
      p: "Du kannst Cookies und lokalen Speicher jederzeit in den Einstellungen deines Browsers löschen oder blockieren. Wenn du den lokalen Speicher löschst, kehrt das Standard-Aussehen zurück und Spielfortschritt, der nicht in deinem Konto gespeichert ist, wird zurückgesetzt. Wenn du notwendige Cookies blockierst, kannst du dich möglicherweise nicht anmelden oder die Sprachwahl funktioniert nicht mehr.",
    },
    {
      icon: "mail",
      h: "Änderungen und Kontakt",
      p: `Wenn wir neue Cookies einführen, aktualisieren wir diese Seite. Fragen zu Cookies: ${CONTACT_EMAIL}. Mehr zur Datenverarbeitung steht in der Datenschutzerklärung.`,
    },
  ],
};

const privacyRu: LegalPage = {
  title: "Политика конфиденциальности",
  updated: "Последнее обновление: ноябрь 2026",
  intro: "На этой странице объясняется, какие персональные данные сайт Učíme se hrou хранит о тебе, зачем они нужны, как долго мы их храним и какие у тебя есть права. Мы старались писать понятно. Если что-то непонятно, просто напиши нам.",
  summaryTitle: "Коротко",
  summary: [
    "Для аккаунта нужны имя, e-mail и пароль. Пароли хранятся только в виде защищённого хеша.",
    "Мы не продаём твои данные и не используем их для рекламы.",
    "Мы используем только необходимые cookie, без отслеживания.",
    "Ты можешь в любой момент запросить копию, исправление или удаление своих данных.",
  ],
  tocTitle: "На этой странице",
  sections: [
    {
      icon: "info",
      h: "Кто обрабатывает твои данные",
      p: `Оператором персональных данных является команда, которая управляет сайтом Učíme se hrou. По любым вопросам о конфиденциальности пиши на ${CONTACT_EMAIL}.`,
    },
    {
      icon: "user",
      h: "Какие данные мы обрабатываем",
      p: "Какие данные собираются, зависит от того, как ты пользуешься сайтом. Аккаунт нельзя создать без имени, e-mail и пароля.",
      list: [
        "Аккаунт: имя, e-mail, пароль (хранится только в виде защищённого хеша, никогда в открытом виде) и, по желанию, аватар и твоя школа.",
        "Прогресс в игре: очки, уровни, открытые игры и курсы, результаты в рейтингах, а также история очков и покупок в магазине.",
        "Настройки: выбранный язык, оформление и настройки родительского контроля (PIN хранится только в виде хеша).",
        "Сообщения: текст из формы обратной связи, сообщения в командах и задания, которые ученики сдают учителям.",
        "Тексты ИИ-помощника: то, что ты вводишь в помощника, обрабатывается только для того, чтобы ответить тебе.",
        "Технические данные: IP-адрес и данные запросов, которые неизбежно обрабатывают хостинг и защита от ботов.",
      ],
    },
    {
      icon: "gear",
      h: "Зачем мы их используем и на каком основании",
      p: "Мы используем данные только для этих целей: ведение аккаунта и сохранение прогресса (исполнение договора об использовании сайта), ответы на твои вопросы (твой запрос или наш законный интерес), безопасность и защита от злоупотреблений (законный интерес), а также выполнение правовых обязанностей. Мы не продаём данные, не используем их для рекламного профилирования и не передаём третьим лицам в маркетинговых целях.",
    },
    {
      icon: "people",
      h: "Обработчики и сторонние сервисы",
      p: "Некоторые части сайта работают у внешних поставщиков, которые обрабатывают данные по нашим поручениям на основании соглашений об обработке данных:",
      list: [
        "Cloudflare: хостинг сайта (Cloudflare Workers), отправка e-mail и проверка Turnstile против ботов при регистрации и в форме обратной связи.",
        "База данных PostgreSQL: хранение аккаунтов, прогресса и других игровых данных.",
        "ИИ-помощник: ответы формируются на Cloudflare Workers AI или, где это настроено, через API Anthropic. Туда отправляется только текст, который ты вводишь в помощника.",
      ],
    },
    {
      icon: "trophy",
      h: "Дети, ученики и родители",
      p: "Ученики младше 15 лет могут пользоваться сайтом только с согласия родителя или законного представителя. В настройках родительского контроля родитель может ограничить время на сайте, заблокировать покупки в магазине или совместную игру и получать еженедельную сводку пройденных курсов. Если мы узнаем, что детский аккаунт создан без согласия опекуна, мы его удалим.",
    },
    {
      icon: "study",
      h: "Учителя и школы",
      p: "Учителя могут видеть данные об учениках в командах, в которых они состоят, включая сданные задания и результаты, и только в учебных целях. Учителя не должны вносить в команды чувствительные персональные данные учеников и использовать данные вне учебного процесса. Школа отвечает за добавление учеников в команды в соответствии с её правилами и с учётом требуемого согласия опекунов.",
    },
    {
      icon: "courses",
      h: "Как долго мы храним данные",
      p: "Данные аккаунта мы храним, пока существует аккаунт. После удаления мы их убираем, если закон не требует хранить их дольше (например, бухгалтерские документы о покупках). Сообщения из формы обратной связи хранятся только столько, сколько нужно для ответа на твой вопрос. Записи о попытках входа и лимитах запросов служат только для предотвращения злоупотреблений и хранятся недолго. Когда аккаунт удаляется, он также исчезает из рейтингов и обзоров команд. Анонимная совокупная статистика может сохраниться.",
    },
    {
      icon: "shield",
      h: "Безопасность",
      p: "Пароли хранятся только в виде хешей, доступ к данным ограничен людьми, которым он нужен для работы сайта, а трафик между твоим браузером и нами шифруется (HTTPS). Однако никакая система не является абсолютно надёжной. Если утечка данных создала бы для тебя риск, мы сообщили бы об этом тебе и Управлению по защите персональных данных, как того требует закон.",
    },
    {
      icon: "pencil",
      h: "Cookie и локальное хранилище",
      p: "Подробный обзор есть на странице политики cookie. Коротко: мы используем только необходимые cookie (вход в аккаунт и выбор языка) и локальное хранилище браузера для настроек оформления и прогресса в игре. Они не используются для рекламы или отслеживания.",
    },
    {
      icon: "mail",
      h: "Твои права",
      p: `У тебя есть право запросить доступ к своим данным, их исправление, удаление (удаление аккаунта), ограничение обработки, переносимость в машиночитаемом виде, а также возражать против обработки на основании законного интереса. Отправь запрос на ${CONTACT_EMAIL}. Мы ответим в течение месяца. Ты также вправе подать жалобу в Управление по защите персональных данных (ÚOOÚ) в Чешской Республике.`,
    },
    {
      icon: "scroll",
      h: "Изменения в этой политике",
      p: "Мы можем обновлять эту политику, например из-за новых функций или изменений законодательства. Актуальная версия всегда находится на этой странице, а дата последнего обновления указана вверху. О существенных изменениях мы заранее сообщим на сайте.",
    },
  ],
};

const termsRu: LegalPage = {
  title: "Условия использования",
  updated: "Последнее обновление: ноябрь 2026",
  intro: "Эти условия регулируют использование сайта Učíme se hrou. Создавая аккаунт или пользуясь сайтом, ты с ними соглашаешься. Мы постарались написать их понятно, но они обязательны, как любой договор.",
  summaryTitle: "Коротко",
  summary: [
    "Сайт предназначен для учёбы и тренировок. Играй честно.",
    "Ты отвечаешь за свой аккаунт, а за детские аккаунты отвечают родитель или опекун.",
    "Очки, монеты и игровые деньги — не настоящие деньги, их нельзя обналичить.",
    "Содержимое сайта принадлежит нам. Копировать его можно только с разрешения.",
  ],
  tocTitle: "На этой странице",
  sections: [
    {
      icon: "info",
      h: "Введение и сфера действия",
      p: "Эти условия распространяются на всех, кто заходит на сайт или имеет аккаунт, включая учеников, учителей и родителей. Если ты с ними не согласен, пожалуйста, не пользуйся сайтом.",
    },
    {
      icon: "user",
      h: "Регистрация и аккаунты",
      list: [
        "При регистрации ты указываешь достоверные данные и не передаёшь пароль другим.",
        "Ученики младше 15 лет могут регистрироваться только с согласия родителя или законного представителя.",
        "Один человек должен иметь один аккаунт. Не передавай свой аккаунт другим и не используй его от имени другого человека.",
        "Если ты заметил, что аккаунтом злоупотребляют, как можно скорее напиши нам.",
      ],
      p: "Аккаунт личный. Ты отвечаешь за действия, совершённые через него, если только не сообщил о них.",
    },
    {
      icon: "gamepad",
      h: "Честная игра, очки и рейтинги",
      p: "Очки, награды и рейтинги должны отражать твоё реальное обучение. Не допускаются: автоматизированные инструменты и скрипты, использование ошибок сайта, игра через чужой аккаунт, намеренная подмена результатов и обход ограничений, например родительского контроля или лимитов времени. За нарушение очки могут быть аннулированы или аккаунт закрыт.",
    },
    {
      icon: "people",
      h: "Поведение пользователей и содержимое",
      list: [
        "Сообщения в командах, названия комнат, отзывы в магазине и другие тексты, которые ты пишешь, должны быть вежливыми и не оскорблять и не угрожать другим.",
        "Не публикуй персональные данные других людей, незаконный контент или спам.",
        "Тексты, которые ты пишешь, остаются твоими. Ты предоставляешь нам неисключительное право показывать их на сайте, например в рейтинге или в команде.",
        "Мы можем редактировать или удалять содержимое, нарушающее эти правила.",
      ],
    },
    {
      icon: "trophy",
      h: "Очки, монеты и игровые деньги",
      p: "Очки, монеты, предметы и игровые деньги из раздела «Экономика» являются частью игры. Они не имеют реальной денежной стоимости и не подлежат обналичиванию. Использовать их можно только внутри сайта, в магазине и на рынке игроков. Если в будущем появятся платные продукты или подписки, мы заранее и отдельно опубликуем их условия и цены.",
    },
    {
      icon: "shop",
      h: "Магазин, ограниченные издания и цены",
      p: "Если за функцию показана цена, действует цена, отображаемая в момент заказа. Ограниченные издания доступны в ограниченном количестве, и их наличие может меняться. Магазин, купленные предметы и призы колеса фортуны со временем могут меняться.",
    },
    {
      icon: "courses",
      h: "Содержимое и авторское право",
      p: "Тексты, задания, графика, анимации и игры на сайте созданы нашей командой или используются с разрешения автора. Ты можешь использовать их для личного обучения. Копирование, изменение, распространение или коммерческое использование без письменного разрешения запрещено. Задания мы готовим тщательно, но не можем гарантировать полное отсутствие ошибок. Если ты найдёшь ошибку, сообщи нам.",
    },
    {
      icon: "study",
      h: "Учителя, команды и задания",
      p: "Учители могут создавать команды, назначать задания и следить за результатами учеников. Делать это они должны в соответствии с законом, в учебных целях и с учётом защиты данных учеников (см. Политику конфиденциальности). Учитель или школа отвечают за добавление учеников в команду в соответствии с школьными правилами и требуемым согласием опекунов.",
    },
    {
      icon: "rocket",
      h: "ИИ-помощник и созданный им текст",
      p: "ИИ-помощник нужен, чтобы помогать в учёбе, а не как гарантированный источник информации. Его ответы могут быть ошибочными и не заменяют профессиональную консультацию, учителя или врача. Не отправляй помощнику чувствительные данные, например пароли, номера документов или сведения о здоровье.",
    },
    {
      icon: "shield",
      h: "Доступность и ответственность",
      p: "Мы работаем над сайтом постоянно, но не можем гарантировать, что он всегда будет доступен и без ошибок. Мы можем временно приостановить его для обслуживания или внедрения новых функций. В пределах, допускаемых законом, мы не отвечаем за косвенный ущерб от использования сайта. Права потребителей, которые нельзя исключить договором, не затрагиваются.",
    },
    {
      icon: "close",
      h: "Закрытие аккаунта",
      p: "Ты можешь закрыть аккаунт в любое время в настройках или написав нам. Мы можем ограничить или закрыть аккаунт, который нарушает эти условия или мешает другим. По возможности мы заранее сообщим тебе и объясним причину.",
    },
    {
      icon: "scroll",
      h: "Изменения и применимое право",
      p: "Мы можем менять эти условия. О существенных изменениях мы предупредим заранее на сайте. Если ты с ними не согласен, можешь закрыть аккаунт. Отношения между тобой и оператором регулируются законодательством Чешской Республики. Потребители могут воспользоваться внесудебным урегулированием споров через Чешскую торговую инспекцию.",
    },
    {
      icon: "mail",
      h: "Контакты",
      p: `Вопросы по этим условиям: ${CONTACT_EMAIL}.`,
    },
  ],
};

const cookiesRu: LegalPage = {
  title: "Политика cookie",
  updated: "Последнее обновление: ноябрь 2026",
  intro: "Мы объясняем, какие cookie и похожие технологии использует сайт, зачем мы их применяем и как ими управлять. Каждый используемый нами элемент перечислен в таблице.",
  summaryTitle: "Коротко",
  summary: [
    "Мы используем только необходимые cookie и локальное хранилище браузера.",
    "Мы не используем рекламные и аналитические cookie.",
    "Без необходимых cookie сайт не может работать безопасно (вход, язык).",
  ],
  tocTitle: "На этой странице",
  sections: [
    {
      icon: "info",
      h: "Что такое cookie и локальное хранилище",
      p: "Cookie — это небольшие текстовые файлы, которые сайт сохраняет в твоём браузере и отправляет обратно при следующем посещении. Локальное хранилище (localStorage) работает похожим образом, но данные остаются в браузере и не отправляются на сервер. Мы используем оба механизма только для целей, описанных на этой странице.",
    },
    {
      icon: "shield",
      h: "Необходимые cookie",
      p: "Эти элементы нужны, чтобы сайт работал. Мы не запрашиваем на них согласие, потому что без них аккаунты нельзя безопасно вести.",
      table: {
        head: ["Название", "Назначение", "Срок", "Тип"],
        rows: [
          ["NEXT_LOCALE", "Сохраняет выбранный язык сайта", "1 год", "Собственный сайт"],
          ["Cookie входа (сессия)", "Держит тебя в системе в течение сессии", "До выхода или окончания сессии", "Собственный сайт, недоступен скриптам"],
          ["Cookie Cloudflare Turnstile", "Проверяет, что ты не бот, при регистрации и в форме обратной связи", "Задаёт поставщик (короткий срок)", "Сторонний (Cloudflare)"],
        ],
      },
    },
    {
      icon: "gear",
      h: "Локальное хранилище браузера",
      p: "Мы храним только то, что нужно для правильного отображения сайта и для удобства: настройки оформления (тема, шрифт, размер, цвета, движение и интервалы), твою дневную цель, лучшие результаты в играх, выбранный шаблон ежедневной викторины и состояние некоторых игровых элементов, например, видел ли ты уже вводное объяснение. Эти данные остаются на твоём устройстве.",
    },
    {
      icon: "star",
      h: "Cookie, которые мы не используем",
      list: [
        "Рекламные cookie и рекламные сети, которые показывают таргетированную рекламу.",
        "Аналитические инструменты, например Google Analytics или похожие средства измерения трафика.",
        "Межсайтовое отслеживание и профилирование пользователей.",
      ],
    },
    {
      icon: "pencil",
      h: "Как управлять cookie",
      p: "Ты можешь удалить или заблокировать cookie и локальное хранилище в любой момент в настройках браузера. Если ты удалишь локальное хранилище, вернётся оформление по умолчанию, а игровой прогресс, не сохранённый в аккаунте, будет сброшен. Блокировка необходимых cookie может помешать входу в аккаунт или перестать работать выбор языка.",
    },
    {
      icon: "mail",
      h: "Изменения и контакты",
      p: `Если мы добавим новые cookie, мы обновим эту страницу. Вопросы о cookie: ${CONTACT_EMAIL}. Подробнее об обработке данных — в Политике конфиденциальности.`,
    },
  ],
};

const privacyUk: LegalPage = {
  title: "Політика конфіденційності",
  updated: "Востаннє оновлено: листопад 2026",
  intro: "Ця сторінка пояснює, які персональні дані сайт Učíme se hrou зберігає про тебе, навіщо вони потрібні, як довго ми їх зберігаємо і які в тебе є права. Ми намагалися писати зрозуміло. Якщо щось незрозуміло, просто напиши нам.",
  summaryTitle: "Коротко",
  summary: [
    "Для облікового запису потрібні ім'я, e-mail і пароль. Паролі зберігаються лише у вигляді захищеного хешу.",
    "Ми не продаємо твої дані і не використовуємо їх для реклами.",
    "Ми використовуємо лише необхідні cookie, без відстеження.",
    "Ти можеш будь-коли попросити копію, виправлення або видалення своїх даних.",
  ],
  tocTitle: "На цій сторінці",
  sections: [
    {
      icon: "info",
      h: "Хто обробляє твої дані",
      p: `Оператором персональних даних є команда, яка керує сайтом Učíme se hrou. З будь-яких питань щодо конфіденційності пиши на ${CONTACT_EMAIL}.`,
    },
    {
      icon: "user",
      h: "Які дані ми обробляємо",
      p: "Які дані збираються, залежить від того, як ти користуєшся сайтом. Обліковий запис не можна створити без імені, e-mail і пароля.",
      list: [
        "Обліковий запис: ім'я, e-mail, пароль (зберігається лише у вигляді захищеного хешу, ніколи у відкритому вигляді) і, за бажанням, аватар та твоя школа.",
        "Прогрес у грі: бали, рівні, відкриті ігри та курси, результати в рейтингах, а також історія балів і покупок у магазині.",
        "Налаштування: обрана мова, оформлення та налаштування батьківського контролю (PIN зберігається лише у вигляді хешу).",
        "Повідомлення: текст із форми зворотного зв'язку, повідомлення в командах і завдання, які учні здають вчителям.",
        "Тексти ШІ-асистента: те, що ти вводиш в асистента, обробляється лише для того, щоб тобі відповісти.",
        "Технічні дані: IP-адреса і дані запитів, які неминуче обробляють хостинг і захист від ботів.",
      ],
    },
    {
      icon: "gear",
      h: "Навіщо ми їх використовуємо і на якій підставі",
      p: "Ми використовуємо дані лише для цих цілей: ведення облікового запису і збереження прогресу (виконання договору про користування сайтом), відповіді на твої запитання (твій запит або наш законний інтерес), безпека і захист від зловживань (законний інтерес), а також виконання правових обов'язків. Ми не продаємо дані, не використовуємо їх для рекламного профілювання і не передаємо третім особам для маркетингу.",
    },
    {
      icon: "people",
      h: "Обробники і сторонні сервіси",
      p: "Деякі частини сайту працюють на зовнішніх постачальників, які обробляють дані за нашими дорученнями на підставі угод про обробку даних:",
      list: [
        "Cloudflare: хостинг сайту (Cloudflare Workers), надсилання e-mail і перевірка Turnstile проти ботів під час реєстрації та у формі зворотного зв'язку.",
        "База даних PostgreSQL: зберігання облікових записів, прогресу та інших ігрових даних.",
        "ШІ-асистент: відповіді формуються на Cloudflare Workers AI або, де це налаштовано, через API Anthropic. Туди надсилається лише текст, який ти вводиш в асистента.",
      ],
    },
    {
      icon: "trophy",
      h: "Діти, учні та батьки",
      p: "Учні до 15 років можуть користуватися сайтом лише за згодою батьків або законного представника. У налаштуваннях батьківського контролю батько або мати можуть обмежити час на сайті, заблокувати покупки в магазині або спільну гру та отримувати щотижневий огляд пройдених курсів. Якщо ми дізнаємося, що дитячий обліковий запис створено без згоди опікунів, ми його видалимо.",
    },
    {
      icon: "study",
      h: "Вчителі і школи",
      p: "Вчителі можуть бачити дані про учнів у командах, до яких вони належать, зокрема здані завдання і результати, і лише для навчальних цілей. Вчителі не повинні вносити до команд чутливі персональні дані учнів і використовувати дані поза навчанням. Школа відповідає за додавання учнів до команд згідно з її правилами та з урахуванням потрібної згоди опікунів.",
    },
    {
      icon: "courses",
      h: "Як довго ми зберігаємо дані",
      p: "Дані облікового запису ми зберігаємо, доки існує обліковий запис. Після видалення ми їх прибираємо, якщо закон не вимагає зберігати їх довше (наприклад, бухгалтерські документи про покупки). Повідомлення з форми зворотного зв'язку зберігаються лише стільки, скільки потрібно для розгляду твого запитання. Записи про спроби входу і ліміти запитів слугують лише для запобігання зловживанням і зберігаються недовго. Коли обліковий запис видаляється, він також зникає з рейтингів і оглядів команд. Анонімна сукупна статистика може залишитися.",
    },
    {
      icon: "shield",
      h: "Безпека",
      p: "Паролі зберігаються лише у вигляді хешів, доступ до даних обмежений людьми, яким він потрібен для роботи сайту, а трафік між твоїм браузером і нами шифрується (HTTPS). Проте жодна система не є повністю захищеною. Якщо витік даних становив би для тебе ризик, ми повідомили б тебе і Управління із захисту персональних даних, як того вимагає закон.",
    },
    {
      icon: "pencil",
      h: "Cookie та локальне сховище",
      p: "Докладний огляд є на сторінці політики cookie. Коротко: ми використовуємо лише необхідні cookie (вхід і вибір мови) та локальне сховище браузера для налаштувань оформлення і прогресу в грі. Вони не використовуються для реклами чи відстеження.",
    },
    {
      icon: "mail",
      h: "Твої права",
      p: `У тебе є право вимагати доступу до своїх даних, їх виправлення, видалення (видалення облікового запису), обмеження обробки, переносу у машинночитному вигляді, а також заперечувати проти обробки на підставі законного інтересу. Надішли запит на ${CONTACT_EMAIL}. Ми відповімо протягом місяця. Ти також маєш право подати скаргу до Управління із захисту персональних даних (ÚOOÚ) у Чеській Республіці.`,
    },
    {
      icon: "scroll",
      h: "Зміни в цій політиці",
      p: "Ми можемо оновлювати цю політику, наприклад через нові функції чи зміни в законодавстві. Актуальна версія завжди на цій сторінці, а дата останнього оновлення вказана згори. Про суттєві зміни ми заздалегідь повідомимо на сайті.",
    },
  ],
};

const termsUk: LegalPage = {
  title: "Умови використання",
  updated: "Востаннє оновлено: листопад 2026",
  intro: "Ці умови регулюють користування сайтом Učíme se hrou. Створюючи обліковий запис або користуючись сайтом, ти з ними погоджуєшся. Ми намагалися писати зрозуміло, але вони обов'язкові, як будь-який договір.",
  summaryTitle: "Коротко",
  summary: [
    "Сайт призначений для навчання і тренувань. Грай чесно.",
    "Ти відповідаєш за свій обліковий запис, а за дитячі облікові записи відповідають батьки або опікуни.",
    "Бали, монети та ігрові гроші — це не справжні гроші, їх не можна обміняти на готівку.",
    "Вміст сайту належить нам. Копіювати його можна лише з дозволу.",
  ],
  tocTitle: "На цій сторінці",
  sections: [
    {
      icon: "info",
      h: "Вступ і сфера дії",
      p: "Ці умови стосуються всіх, хто відвідує сайт або має обліковий запис, зокрема учнів, вчителів і батьків. Якщо ти з ними не згоден, будь ласка, не користуйся сайтом.",
    },
    {
      icon: "user",
      h: "Реєстрація та облікові записи",
      list: [
        "Під час реєстрації ти вказуєш правдиві дані і не передаєш пароль іншим.",
        "Учні до 15 років можуть реєструватися лише за згодою батьків або законного представника.",
        "Одна людина має мати один обліковий запис. Не передавай свій обліковий запис іншим і не використовуй його від імені іншої особи.",
        "Якщо ти помітив, що обліковим записом зловживають, якомога швидше напиши нам.",
      ],
      p: "Обліковий запис персональний. Ти відповідаєш за дії, здійснені через нього, якщо тільки не повідомив про них.",
    },
    {
      icon: "gamepad",
      h: "Чесна гра, бали і рейтинги",
      p: "Бали, нагороди і рейтинги мають відображати твоє справжнє навчання. Не дозволяється: автоматизовані інструменти і скрипти, використання помилок сайту, гра з чужого облікового запису, свідома підміна результатів і обхід обмежень, як-от батьківський контроль чи ліміти часу. За порушення бали можуть бути анульовані, а обліковий запис закритий.",
    },
    {
      icon: "people",
      h: "Поведінка користувачів і вміст",
      list: [
        "Повідомлення в командах, назви кімнат, відгуки в магазині та інший текст, який ти пишеш, мають бути ввічливими і не ображати та не погрожувати іншим.",
        "Не публікуй персональні дані інших людей, незаконний вміст або спам.",
        "Тексти, які ти пишеш, залишаються твоїми. Ти надаєш нам невиключне право показувати їх на сайті, наприклад у рейтингу або в команді.",
        "Ми можемо редагувати або видаляти вміст, що порушує ці правила.",
      ],
    },
    {
      icon: "trophy",
      h: "Бали, монети та ігрові гроші",
      p: "Бали, монети, предмети та ігрові гроші з розділу «Економіка» є частиною гри. Вони не мають реальної грошової вартості й не підлягають обміну на готівку. Використовувати їх можна лише всередині сайту, у магазині та на ринку гравців. Якщо в майбутньому з'являться платні продукти або підписки, ми заздалегідь і окремо опублікуємо їхні умови та ціни.",
    },
    {
      icon: "shop",
      h: "Магазин, обмежені видання і ціни",
      p: "Якщо для функції показана ціна, діє ціна, яка відображається під час замовлення. Обмежені видання доступні в обмеженій кількості, і їх наявність може змінюватися. Магазин, придбані предмети та призи колеса фортуни можуть змінюватися з часом.",
    },
    {
      icon: "courses",
      h: "Вміст і авторське право",
      p: "Тексти, завдання, графіка, анімації та ігри на сайті створені нашою командою або використовуються за дозволом автора. Ти можеш використовувати їх для особистого навчання. Копіювати, змінювати, поширювати або комерційно використовувати їх без письмового дозволу заборонено. Завдання ми готуємо ретельно, але не можемо гарантувати повну відсутність помилок. Якщо ти знайдеш помилку, повідом нам.",
    },
    {
      icon: "study",
      h: "Вчителі, команди і завдання",
      p: "Вчителі можуть створювати команди, задавати завдання і стежити за результатами учнів. Робити це вони мають згідно із законом, для навчальних цілей і з урахуванням захисту даних учнів (див. Політику конфіденційності). Вчитель або школа відповідає за додавання учня до команди згідно з шкільними правилами та з урахуванням потрібної згоди опікунів.",
    },
    {
      icon: "rocket",
      h: "ШІ-асистент і згенерований текст",
      p: "ШІ-асистент допомагає в навчанні, але не є гарантованим джерелом інформації. Його відповіді можуть бути помилковими і не замінюють фахову консультацію, вчителя чи лікаря. Не надсилай асистенту чутливих даних, наприклад паролів, номерів документів або медичних відомостей.",
    },
    {
      icon: "shield",
      h: "Доступність і відповідальність",
      p: "Ми працюємо над сайтом постійно, але не можемо гарантувати, що він завжди буде доступним і без помилок. Ми можемо тимчасово призупинити його для обслуговування або нових функцій. У межах, дозволених законом, ми не відповідаємо за непрямі збитки від користування сайтом. Права споживачів, які не можна виключити договором, не змінюються.",
    },
    {
      icon: "close",
      h: "Закриття облікового запису",
      p: "Ти можеш закрити обліковий запис будь-коли в налаштуваннях або написавши нам. Ми можемо обмежити або закрити обліковий запис, що порушує ці умови або заважає іншим. Якщо можливо, ми заздалегідь повідомимо тебе і поясним причину.",
    },
    {
      icon: "scroll",
      h: "Зміни та застосовне право",
      p: "Ми можемо змінювати ці умови. Про суттєві зміни ми попередимо заздалегідь на сайті. Якщо ти з ними не погоджуєшся, можеш закрити обліковий запис. Відносини між тобою і оператором регулюються законодавством Чеської Республіки. Споживачі можуть скористатися позасудовим врегулюванням спорів через Чеську торговельну інспекцію.",
    },
    {
      icon: "mail",
      h: "Контакти",
      p: `Питання щодо цих умов: ${CONTACT_EMAIL}.`,
    },
  ],
};

const cookiesUk: LegalPage = {
  title: "Політика cookie",
  updated: "Востаннє оновлено: листопад 2026",
  intro: "Ми пояснюємо, які cookie та подібні технології використовує сайт, навіщо ми їх застосовуємо і як ними керувати. Кожен використовуваний нами елемент перелічено в таблиці.",
  summaryTitle: "Коротко",
  summary: [
    "Ми використовуємо лише необхідні cookie і локальне сховище браузера.",
    "Ми не використовуємо рекламні та аналітичні cookie.",
    "Без необхідних cookie сайт не може працювати безпечно (вхід, мова).",
  ],
  tocTitle: "На цій сторінці",
  sections: [
    {
      icon: "info",
      h: "Що таке cookie і локальне сховище",
      p: "Cookie — це невеликі текстові файли, які сайт зберігає у твоєму браузері і надсилає назад під час наступного відвідування. Локальне сховище (localStorage) працює подібно, але дані залишаються у браузері і не надсилаються на сервер. Ми використовуємо обидва механізми лише для цілей, описаних на цій сторінці.",
    },
    {
      icon: "shield",
      h: "Необхідні cookie",
      p: "Ці елементи потрібні, щоб сайт працював. Ми не запитуємо згоди на них, бо без них облікові записи не можна безпечно вести.",
      table: {
        head: ["Назва", "Призначення", "Строк", "Тип"],
        rows: [
          ["NEXT_LOCALE", "Зберігає обрану мову сайту", "1 рік", "Власний сайт"],
          ["Cookie входу (сесія)", "Тримає тебе в системі протягом сесії", "До виходу або завершення сесії", "Власний сайт, недоступний скриптам"],
          ["Cookie Cloudflare Turnstile", "Перевіряє, що ти не бот, під час реєстрації та у формі зворотного зв'язку", "Задає постачальник (короткий строк)", "Сторонній (Cloudflare)"],
        ],
      },
    },
    {
      icon: "gear",
      h: "Локальне сховище браузера",
      p: "Ми зберігаємо лише те, що потрібно для правильного відображення сайту і для зручності: налаштування оформлення (тема, шрифт, розмір, кольори, рух і відступи), твою денну ціль, найкращі результати в іграх, обраний шаблон щоденної вікторини і стан деяких ігрових елементів, наприклад, чи ти вже бачив вступ. Ці дані залишаються на твоєму пристрої.",
    },
    {
      icon: "star",
      h: "Cookie, які ми не використовуємо",
      list: [
        "Рекламні cookie і рекламні мережі, які показують таргетовану рекламу.",
        "Аналітичні інструменти, як-от Google Analytics або подібні засоби вимірювання трафіку.",
        "Міжсайтове відстеження і профілювання користувачів.",
      ],
    },
    {
      icon: "pencil",
      h: "Як керувати cookie",
      p: "Ти можеш видалити або заблокувати cookie і локальне сховище будь-коли в налаштуваннях браузера. Якщо ти видалиш локальне сховище, повернеться оформлення за замовчуванням, а ігровий прогрес, не збережений в обліковому записі, буде скинуто. Блокування необхідних cookie може завадити входу або перестати працювати вибір мови.",
    },
    {
      icon: "mail",
      h: "Зміни та контакти",
      p: `Якщо ми додамо нові cookie, ми оновимо цю сторінку. Питання про cookie: ${CONTACT_EMAIL}. Докладніше про обробку даних — у Політиці конфіденційності.`,
    },
  ],
};

const privacyJa: LegalPage = {
  title: "プライバシーポリシー",
  updated: "最終更新: 2026年11月",
  intro: "このページでは、Učíme se hrou のサイトがあなたについてどのような個人データを保存しているか、その理由、保存期間、そしてあなたの権利について説明します。できるだけわかりやすく書くよう努めました。わかりにくい点があれば、お気軽にご連絡ください。",
  summaryTitle: "要点",
  summary: [
    "アカウントには名前、メールアドレス、パスワードが必要です。パスワードは安全なハッシュとしてのみ保存されます。",
    "あなたのデータを販売することはなく、広告に利用することもありません。",
    "必要最小限のクッキーのみを使用し、トラッキングは行いません。",
    "あなたのデータのコピー、修正、削除はいつでも請求できます。",
  ],
  tocTitle: "このページの内容",
  sections: [
    {
      icon: "info",
      h: "データを処理する者",
      p: `あなたの個人データの管理者は、Učíme se hrou サイトを運営するチームです。プライバシーに関するご質問は ${CONTACT_EMAIL} までご連絡ください。`,
    },
    {
      icon: "user",
      h: "処理するデータ",
      p: "収集されるデータは、サイトの利用方法によって異なります。アカウントは名前、メールアドレス、パスワードがなければ作成できません。",
      list: [
        "アカウント: 名前、メールアドレス、パスワード（安全なハッシュとしてのみ保存し、判読可能な形では保存しません）、任意でアバターと所属する学校。",
        "ゲームの進行状況: ポイント、レベル、解放されたゲームとコース、ランキングの結果、ポイントとショップ購入の履歴。",
        "設定: 選んだ言語、外観、保護者による管理設定（PINはハッシュとしてのみ保存します）。",
        "メッセージ: お問い合わせフォームの本文、チーム内のメッセージ、生徒が先生に提出する課題。",
        "AIアシスタントのテキスト: アシスタントに入力した内容は、回答するためだけに処理されます。",
        "技術データ: ホスティングとボット対策に必然的に処理される IP アドレスとリクエストのデータ。",
      ],
    },
    {
      icon: "gear",
      h: "データを利用する目的と法的根拠",
      p: "データは次の目的にのみ利用します。アカウントの運用と進行状況の保存（サイト利用契約の履行）、ご質問への回答（お客様のご要望または当社の正当な利益）、セキュリティと不正利用の防止（正当な利益）、そして法的義務の履行です。データを販売したり、広告のためのプロファイリングに使ったり、マーケティング目的で第三者に渡したりすることはありません。",
    },
    {
      icon: "people",
      h: "処理業者と第三者サービス",
      p: "サイトの一部は外部の事業者が運用しており、データ処理契約に基づき、当社の指示のもとでデータを処理しています。",
      list: [
        "Cloudflare: サイトのホスティング（Cloudflare Workers）、メール送信、新規登録とお問い合わせフォームでの Turnstile によるボット判定。",
        "PostgreSQL データベース: アカウント、進行状況、その他のゲームデータの保存。",
        "AIアシスタント: 回答は Cloudflare Workers AI で生成されるか、設定されている場合は Anthropic API で生成されます。送信されるのは、アシスタントに入力したテキストだけです。",
      ],
    },
    {
      icon: "trophy",
      h: "子ども、生徒と保護者",
      p: "15歳未満の生徒は、保護者または法定代理人の同意がある場合にのみサイトを利用できます。保護者は保護者による管理設定で、サイトの利用時間を制限したり、ショップでの購入や一緒に遊ぶ機能を止めたり、修了したコースの週次の概要を受け取ったりできます。保護者の同意なしに子どものアカウントが作成されたとわかった場合、そのアカウントを削除します。",
    },
    {
      icon: "study",
      h: "先生と学校",
      p: "先生は、所属するチームの生徒に関するデータ（提出された課題と結果を含む）を、授業の目的に限って閲覧できます。先生は生徒の機微な個人情報をチームに入力したり、授業以外の目的でデータを使ったりしてはいけません。生徒をチームに追加することは、学校の規則および必要な保護者の同意に従って、学校が責任をもって行います。",
    },
    {
      icon: "courses",
      h: "データの保存期間",
      p: "アカウントのデータは、アカウントが存在する間保存します。削除後は、法律により長期間の保存が義務づけられている場合（購入に関する会計記録など）を除き、データを消去します。お問い合わせフォームのメッセージは、ご質問に対応するために必要な期間だけ保存します。ログイン試行やリクエスト制限の記録は、不正利用を防ぐためだけに使われ、短期間のみ保存します。アカウントを削除すると、ランキングやチームの概要からも消えます。匿名化された集計統計は残る場合があります。",
    },
    {
      icon: "shield",
      h: "セキュリティ",
      p: "パスワードはハッシュとしてのみ保存し、データへのアクセスはサイトの運用に必要な人だけに限定しています。また、ブラウザと当社の間の通信は暗号化（HTTPS）されています。ただし、完全に安全なシステムは存在しません。データ漏えいがあなたにリスクをもたらす場合は、法律の定めに従ってあなたと個人情報保護局に通知します。",
    },
    {
      icon: "pencil",
      h: "クッキーとローカルストレージ",
      p: "詳しくはクッキーポリシーのページをご覧ください。要約すると、使用するのは必要最小限のクッキー（ログインと言語の選択）と、外観の設定やゲームの進行状況のためのブラウザのローカルストレージだけです。広告やトラッキングには使用しません。",
    },
    {
      icon: "mail",
      h: "あなたの権利",
      p: `あなたには、ご自身のデータへのアクセス、修正、削除（アカウントの削除）、処理の制限、機械可読な形式でのデータの受け取りを請求する権利があります。また、正当な利益に基づく処理に異議を申し立てることもできます。ご請求は ${CONTACT_EMAIL} までお送りください。1か月以内に回答します。チェコ共和国の個人情報保護局（ÚOOÚ）に苦情を申し立てる権利もあります。`,
    },
    {
      icon: "scroll",
      h: "このポリシーの変更",
      p: "新機能の追加や法律の変更などにより、このポリシーを更新することがあります。最新版は常にこのページに掲載され、最終更新日は上部に表示されます。重要な変更は事前にサイト上でお知らせします。",
    },
  ],
};

const termsJa: LegalPage = {
  title: "利用規約",
  updated: "最終更新: 2026年11月",
  intro: "この規約は Učíme se hrou サイトの利用に適用されます。アカウントを作成するか、サイトを利用することで、この規約に同意したものとみなします。わかりやすく書くよう努めましたが、どの契約とも同様に拘束力があります。",
  summaryTitle: "要点",
  summary: [
    "このサイトは学習と練習のためのものです。フェアに遊んでください。",
    "アカウントの管理はご自身の責任です。子どものアカウントについては、保護者または法定代理人も責任を負います。",
    "ポイント、コイン、ゲーム内のお金は本物のお金ではなく、現金化することはできません。",
    "サイトのコンテンツは当社のものです。許可なくコピーすることはできません。",
  ],
  tocTitle: "このページの内容",
  sections: [
    {
      icon: "info",
      h: "はじめに・適用範囲",
      p: "この規約は、生徒、先生、保護者を含め、サイトを訪問する人やアカウントを持つすべての人に適用されます。この規約に同意できない場合は、サイトを利用しないでください。",
    },
    {
      icon: "user",
      h: "新規登録とアカウント",
      list: [
        "登録時には正確な情報を入力し、パスワードを他人に知られないようにしてください。",
        "15歳未満の生徒は、保護者または法定代理人の同意がある場合にのみ登録できます。",
        "1人が持つアカウントは1つにしてください。アカウントを他人に渡したり、別の人の代わりに使ったりしないでください。",
        "アカウントが不正に使われていることに気づいたら、できるだけ早くご連絡ください。",
      ],
      p: "アカウントは個人のものです。報告していない限り、アカウントを通じて行われた活動について責任を負います。",
    },
    {
      icon: "gamepad",
      h: "フェアプレイ、ポイント、ランキング",
      p: "ポイント、ごほうび、ランキングは、実際の学習を反映したものである必要があります。次の行為は禁止されています。自動化ツールやスクリプトの使用、サイトの不具合の悪用、他人のアカウントでのプレイ、結果の意図的な操作、保護者による管理や時間制限などの制限の回避です。違反があった場合、ポイントが取り消されたり、アカウントが閉鎖されたりすることがあります。",
    },
    {
      icon: "people",
      h: "利用者の行動とコンテンツ",
      list: [
        "チームのメッセージ、ルーム名、ショップのレビューなど、あなたが書く文章は礼儀正しいものにし、他人を侮辱したり脅したりしないでください。",
        "他人の個人情報、違法なコンテンツ、スパムを投稿しないでください。",
        "あなたが書いた文章の権利は、あなたに帰属します。ただし、ランキングやチームなど、サイト内で表示するための非独占的な権利を当社に付与していただきます。",
        "この規則に違反するコンテンツは、当社が編集または削除することがあります。",
      ],
    },
    {
      icon: "trophy",
      h: "ポイント、コイン、ゲーム内のお金",
      p: "経済のポイント、コイン、アイテム、ゲーム内のお金は、ゲームの一部です。実際の金銭的価値はなく、現金化することはできません。サイト内、ショップ、プレイヤーマーケットでのみ使用できます。将来、有料の商品やサブスクリプションを導入する場合は、その条件と価格を事前に別途公表します。",
    },
    {
      icon: "shop",
      h: "ショップ、限定版と価格",
      p: "機能に価格が表示されている場合は、注文時に表示された価格が適用されます。限定版は数量限定で、入手可能な状況は変わることがあります。ショップ、購入したアイテム、ルーレットの景品は、時間の経過とともに変わることがあります。",
    },
    {
      icon: "courses",
      h: "コンテンツと著作権",
      p: "サイト上のテキスト、課題、グラフィック、アニメーション、ゲームは、当社のチームが制作したものか、作者の許可を得て使用しているものです。個人の学習のために使用できます。書面による許可なく、コピー、改変、再配布、または商用利用することは禁止されています。課題は慎重に作成していますが、完全に誤りがないことは保証できません。誤りを見つけた場合はお知らせください。",
    },
    {
      icon: "study",
      h: "先生、チーム、課題",
      p: "先生はチームを作成し、課題を出し、生徒の結果を確認できます。その際は、法律を守り、授業の目的で、生徒のデータ保護に配慮して行ってください（プライバシーポリシーを参照）。チームへの生徒の追加は、学校の規則と必要な保護者の同意に従って、先生または学校が責任をもって行います。",
    },
    {
      icon: "rocket",
      h: "AIアシスタントと生成されたテキスト",
      p: "AIアシスタントは学習を手助けするためのもので、確実な情報源ではありません。回答が誤っている場合があり、専門家の助言、先生、医師に代わるものではありません。パスワード、身分証番号、健康情報などの機微な情報はアシスタントに送らないでください。",
    },
    {
      icon: "shield",
      h: "提供の継続性と責任",
      p: "サイトは継続して運営しますが、常に利用可能で誤りがないことを保証することはできません。保守や新機能のために、一時的に停止することがあります。法律で認められる範囲で、サイトの利用によって生じた間接的な損害について責任を負いません。契約によって除外できない消費者の権利は影響を受けません。",
    },
    {
      icon: "close",
      h: "アカウントの解約",
      p: "設定から、またはご連絡いただくことで、いつでもアカウントを解約できます。この規約に違反する、または他の人の迷惑になるアカウントは、制限または閉鎖することがあります。可能な場合は事前にお知らせし、理由を説明します。",
    },
    {
      icon: "scroll",
      h: "変更と準拠法",
      p: "この規約は変更することがあります。重要な変更は事前にサイト上でお知らせします。同意できない場合は、アカウントを解約できます。お客様と運営者の関係は、チェコ共和国の法律に準拠します。消費者は、チェコ商務監督局を通じた裁判外紛争解決を利用できます。",
    },
    {
      icon: "mail",
      h: "お問い合わせ",
      p: `この規約についてのご質問: ${CONTACT_EMAIL}。`,
    },
  ],
};

const cookiesJa: LegalPage = {
  title: "クッキーポリシー",
  updated: "最終更新: 2026年11月",
  intro: "このサイトが使用するクッキーや類似の技術、その使用目的、そして管理方法を説明します。使用しているすべての項目は表に記載しています。",
  summaryTitle: "要点",
  summary: [
    "使用するのは必要最小限のクッキーとブラウザのローカルストレージだけです。",
    "広告用やアクセス解析用のクッキーは使用していません。",
    "必要なクッキーがなければ、サイトは安全に動作できません（ログイン、言語の選択）。",
  ],
  tocTitle: "このページの内容",
  sections: [
    {
      icon: "info",
      h: "クッキーとローカルストレージとは",
      p: "クッキーは、ウェブサイトがブラウザに保存し、次回の訪問時に送り返す小さなテキストファイルです。ローカルストレージ（localStorage）も似た仕組みですが、データはブラウザに残り、サーバーには送信されません。どちらも、このページに記載された目的にのみ使用しています。",
    },
    {
      icon: "shield",
      h: "必要なクッキー",
      p: "これらの項目はサイトが動作するために必要です。これらについては同意を求めません。必要なクッキーがなければ、アカウントを安全に運用できないためです。",
      table: {
        head: ["名前", "目的", "期間", "種類"],
        rows: [
          ["NEXT_LOCALE", "選択したサイトの言語を保存します", "1年", "自社サイト"],
          ["ログインクッキー（セッション）", "セッションの間ログイン状態を保ちます", "ログアウトまたはセッションの有効期限切れまで", "自社サイト、スクリプトから読み取れません"],
          ["Cloudflare Turnstile のクッキー", "新規登録とお問い合わせフォームで、ボットでないことを確認します", "提供元が設定（短期間）", "第三者（Cloudflare）"],
        ],
      },
    },
    {
      icon: "gear",
      h: "ブラウザのローカルストレージ",
      p: "サイトを正しく表示するため、また利便性のために必要な情報だけを保存します。外観の設定（テーマ、フォント、サイズ、色、動きと間隔）、1日の目標、ゲームの最高記録、選んだ毎日のクイズのテンプレート、一部のゲーム要素の状態（例えば、イントロをすでに見たかどうか）です。これらのデータはお使いの端末に残ります。",
    },
    {
      icon: "star",
      h: "使用していないクッキー",
      list: [
        "広告を配信するための広告クッキーや広告ネットワーク。",
        "Google Analytics など、アクセス解析のためのツール。",
        "サイトをまたいだトラッキングやユーザーのプロファイリング。",
      ],
    },
    {
      icon: "pencil",
      h: "クッキーの管理方法",
      p: "ブラウザの設定から、いつでもクッキーとローカルストレージを削除またはブロックできます。ローカルストレージを削除すると、初期の外観に戻り、アカウントに保存されていないゲームの進行状況はリセットされます。必要なクッキーをブロックすると、ログインできなくなったり、言語の選択が機能しなくなったりすることがあります。",
    },
    {
      icon: "mail",
      h: "変更とお問い合わせ",
      p: `新しいクッキーを追加した場合は、このページを更新します。クッキーについてのご質問: ${CONTACT_EMAIL}。データの処理については、プライバシーポリシーをご覧ください。`,
    },
  ],
};

const privacyEs: LegalPage = {
  title: "Política de privacidad",
  updated: "Última actualización: noviembre de 2026",
  intro: "Esta página explica qué datos personales guarda sobre ti la web Učíme se hrou, por qué los necesitamos, cuánto tiempo los conservamos y qué derechos tienes. Hemos intentado que sea claro. Si algo no se entiende, escríbenos.",
  summaryTitle: "En resumen",
  summary: [
    "Una cuenta necesita nombre, correo electrónico y contraseña. Las contraseñas se guardan solo como hash seguro.",
    "No vendemos tus datos ni los usamos para publicidad.",
    "Usamos solo cookies esenciales, sin seguimiento.",
    "Puedes pedir en cualquier momento una copia, la corrección o la eliminación de tus datos.",
  ],
  tocTitle: "En esta página",
  sections: [
    {
      icon: "info",
      h: "Quién trata tus datos",
      p: `El responsable de tus datos personales es el equipo que gestiona la web Učíme se hrou. Para cualquier pregunta sobre privacidad, escríbenos a ${CONTACT_EMAIL}.`,
    },
    {
      icon: "user",
      h: "Qué datos tratamos",
      p: "Qué datos se recogen depende de cómo uses la web. No se puede crear una cuenta sin nombre, correo electrónico y contraseña.",
      list: [
        "Cuenta: nombre, correo electrónico, contraseña (guardada solo como hash seguro, nunca en texto legible) y, opcionalmente, un avatar y tu colegio.",
        "Progreso en el juego: puntos, niveles, juegos y cursos desbloqueados, resultados de las clasificaciones e historial de puntos y compras en la tienda.",
        "Ajustes: idioma elegido, apariencia y ajustes del control parental (el PIN se guarda solo como hash).",
        "Mensajes: texto del formulario de contacto, mensajes de los equipos y tareas que los alumnos entregan a sus profesores.",
        "Textos del asistente de IA: lo que escribes en el asistente se procesa solo para responderte.",
        "Datos técnicos: dirección IP y datos de las solicitudes que el alojamiento y la protección contra bots tratan necesariamente.",
      ],
    },
    {
      icon: "gear",
      h: "Para qué lo usamos y con qué base",
      p: "Usamos los datos solo para estos fines: gestionar tu cuenta y guardar tu progreso (ejecución del contrato de uso de la web), responder a tus preguntas (tu solicitud o nuestro interés legítimo), seguridad y protección frente al uso indebido (interés legítimo) y el cumplimiento de obligaciones legales. No vendemos datos, no los usamos para elaborar perfiles publicitarios ni los transferimos a terceros con fines de marketing.",
    },
    {
      icon: "people",
      h: "Encargados del tratamiento y servicios de terceros",
      p: "Algunas partes de la web funcionan con proveedores externos, que tratan los datos siguiendo nuestras instrucciones y con acuerdos de tratamiento de datos:",
      list: [
        "Cloudflare: alojamiento de la web (Cloudflare Workers), envío de correos y la comprobación antibots Turnstile en el registro y en el formulario de contacto.",
        "Base de datos PostgreSQL: almacenamiento de cuentas, progreso y otros datos del juego.",
        "Asistente de IA: las respuestas se generan en Cloudflare Workers AI o, cuando está configurado, en la API de Anthropic. Solo se envía allí el texto que escribes en el asistente.",
      ],
    },
    {
      icon: "trophy",
      h: "Niños, alumnos y familias",
      p: "Los alumnos menores de 15 años solo pueden usar la web con el consentimiento de un progenitor o tutor legal. En los ajustes de control parental, un progenitor puede limitar el tiempo en la web, bloquear las compras en la tienda o el juego compartido, y recibir un resumen semanal de los cursos completados. Si sabemos que una cuenta infantil se creó sin el consentimiento del tutor, la eliminaremos.",
    },
    {
      icon: "study",
      h: "Profesores y colegios",
      p: "Los profesores pueden ver datos de los alumnos de los equipos a los que pertenecen, incluidas las tareas entregadas y los resultados, y solo con fines docentes. Los profesores no deben introducir en los equipos datos personales sensibles de los alumnos ni usar los datos fuera de la enseñanza. El colegio es responsable de añadir a los alumnos a los equipos de acuerdo con sus normas y con el consentimiento de los tutores cuando sea necesario.",
    },
    {
      icon: "courses",
      h: "Cuánto tiempo guardamos los datos",
      p: "Guardamos los datos de la cuenta mientras la cuenta exista. Tras la eliminación, los borramos, salvo que la ley nos obligue a conservarlos más tiempo (por ejemplo, los registros contables de las compras). Los mensajes del formulario de contacto se guardan solo el tiempo necesario para atender tu consulta. Los registros de intentos de acceso y de límites de solicitudes sirven solo para evitar el uso indebido y se conservan brevemente. Cuando se elimina una cuenta, también desaparece de las clasificaciones y de los resúmenes de los equipos. Pueden conservarse estadísticas agregadas y anónimas.",
    },
    {
      icon: "shield",
      h: "Seguridad",
      p: "Las contraseñas se guardan solo como hash, el acceso a los datos se limita a las personas que lo necesitan para gestionar la web y el tráfico entre tu navegador y nosotros va cifrado (HTTPS). Sin embargo, ningún sistema es perfectamente seguro. Si una filtración de datos supusiera un riesgo para ti, te informaríamos a ti y a la Oficina para la Protección de Datos Personales, como exige la ley.",
    },
    {
      icon: "pencil",
      h: "Cookies y almacenamiento local",
      p: "En la página de la política de cookies encontrarás un resumen detallado. En resumen: usamos solo cookies esenciales (inicio de sesión y elección de idioma) y el almacenamiento local del navegador para los ajustes de apariencia y el progreso del juego. No se usan para publicidad ni para seguimiento.",
    },
    {
      icon: "mail",
      h: "Tus derechos",
      p: `Tienes derecho a solicitar acceso a tus datos, su corrección, su supresión (eliminación de la cuenta), la limitación del tratamiento, su portabilidad en un formato legible por máquina, y a oponerte al tratamiento basado en el interés legítimo. Envía tu solicitud a ${CONTACT_EMAIL}. Responderemos en el plazo de un mes. También tienes derecho a presentar una reclamación ante la Oficina para la Protección de Datos Personales (ÚOOÚ) de la República Checa.`,
    },
    {
      icon: "scroll",
      h: "Cambios en esta política",
      p: "Podemos actualizar esta política, por ejemplo por nuevas funciones o cambios legales. La versión vigente está siempre en esta página y la fecha de la última actualización aparece arriba. Anunciaremos los cambios importantes en la web con antelación.",
    },
  ],
};

const termsEs: LegalPage = {
  title: "Condiciones de uso",
  updated: "Última actualización: noviembre de 2026",
  intro: "Estas condiciones regulan el uso de la web Učíme se hrou. Al crear una cuenta o usar la web, las aceptas. Hemos intentado que sean fáciles de leer, pero son vinculantes como cualquier contrato.",
  summaryTitle: "En resumen",
  summary: [
    "La web es para aprender y practicar. Juega limpio.",
    "Eres responsable de tu cuenta; en el caso de las cuentas infantiles, también lo son el progenitor o tutor.",
    "Los puntos, las monedas y el dinero del juego no son dinero real y no se pueden canjear.",
    "El contenido de la web es nuestro. Solo puedes copiarlo con permiso.",
  ],
  tocTitle: "En esta página",
  sections: [
    {
      icon: "info",
      h: "Introducción y ámbito",
      p: "Estas condiciones se aplican a todas las personas que visitan la web o tienen una cuenta, incluidos alumnos, profesores y familias. Si no estás de acuerdo con ellas, no uses la web.",
    },
    {
      icon: "user",
      h: "Registro y cuentas",
      list: [
        "Al registrarte, facilitas datos veraces y mantienes tu contraseña en secreto.",
        "Los alumnos menores de 15 años solo pueden registrarse con el consentimiento de un progenitor o tutor legal.",
        "Una persona debe tener una sola cuenta. No cedas tu cuenta a otros ni la uses en nombre de otra persona.",
        "Si notas que tu cuenta se ha usado indebidamente, contacta con nosotros lo antes posible.",
      ],
      p: "Tu cuenta es personal. Eres responsable de la actividad realizada a través de ella, salvo que la hayas comunicado.",
    },
    {
      icon: "gamepad",
      h: "Juego limpio, puntos y clasificaciones",
      p: "Los puntos, las recompensas y las clasificaciones deben reflejar tu aprendizaje real. No está permitido: usar herramientas automáticas o scripts, aprovechar errores de la web, jugar con la cuenta de otra persona, manipular deliberadamente los resultados o saltarse límites como el control parental o los límites de tiempo. Una infracción puede dar lugar a la retirada de puntos o al cierre de la cuenta.",
    },
    {
      icon: "people",
      h: "Conducta de los usuarios y contenido",
      list: [
        "Los mensajes de los equipos, los nombres de sala, las reseñas de la tienda y cualquier otro texto que escribas deben ser respetuosos y no pueden insultar ni amenazar a otros.",
        "No publiques datos personales de otras personas, contenido ilegal ni spam.",
        "Los textos que escribes siguen siendo tuyos. Nos concedes un derecho no exclusivo a mostrarlos dentro de la web, por ejemplo en una clasificación o en un equipo.",
        "Podemos editar o eliminar contenido que incumpla estas normas.",
      ],
    },
    {
      icon: "trophy",
      h: "Puntos, monedas y dinero del juego",
      p: "Los puntos, las monedas, los objetos y el dinero del juego de la Economía forman parte del juego. No tienen valor monetario real y no se pueden canjear. Solo puedes usarlos dentro de la web, en la tienda y en el mercado de jugadores. Si en el futuro se introducen productos de pago o suscripciones, publicaremos sus condiciones y precios con antelación y por separado.",
    },
    {
      icon: "shop",
      h: "Tienda, ediciones limitadas y precios",
      p: "Cuando se muestra un precio para una función, se aplica el precio que aparece en el momento del pedido. Las ediciones limitadas están disponibles en cantidades limitadas y su disponibilidad puede cambiar. La tienda, los objetos comprados y los premios de la rueda de la fortuna pueden cambiar con el tiempo.",
    },
    {
      icon: "courses",
      h: "Contenido y derechos de autor",
      p: "Los textos, las tareas, los gráficos, las animaciones y los juegos de la web los crea nuestro equipo o se usan con permiso del autor. Puedes usarlos para tu aprendizaje personal. Queda prohibido copiarlos, modificarlos, redistribuirlos o usarlos comercialmente sin permiso por escrito. Preparamos las tareas con cuidado, pero no podemos garantizar que estén totalmente libres de errores. Si encuentras uno, avísanos.",
    },
    {
      icon: "study",
      h: "Profesores, equipos y tareas",
      p: "Los profesores pueden crear equipos, asignar tareas y seguir los resultados de los alumnos. Deben hacerlo conforme a la ley, con fines docentes y respetando la protección de datos de los alumnos (véase la Política de privacidad). El profesor o el colegio es responsable de añadir a un alumno a un equipo de acuerdo con las normas del colegio y con el consentimiento de los tutores cuando sea necesario.",
    },
    {
      icon: "rocket",
      h: "Asistente de IA y texto generado",
      p: "El asistente de IA está para ayudar en el aprendizaje, no como fuente de información garantizada. Sus respuestas pueden ser incorrectas y no sustituyen el consejo profesional, a un profesor ni a un médico. No envíes al asistente datos sensibles, como contraseñas, números de documentos de identidad o datos de salud.",
    },
    {
      icon: "shield",
      h: "Disponibilidad y responsabilidad",
      p: "Mantenemos la web de forma continuada, pero no podemos garantizar que esté siempre disponible y libre de errores. Podemos suspenderla temporalmente por mantenimiento o por nuevas funciones. En la medida que permita la ley, no respondemos de los daños indirectos causados por el uso de la web. No se ven afectados los derechos de los consumidores que no pueden excluirse por contrato.",
    },
    {
      icon: "close",
      h: "Cierre de tu cuenta",
      p: "Puedes cerrar tu cuenta en cualquier momento desde los ajustes o escribiéndonos. Podemos limitar o cerrar una cuenta que incumpla estas condiciones o moleste a otros. Cuando sea posible, te avisaremos antes y te explicaremos el motivo.",
    },
    {
      icon: "scroll",
      h: "Cambios y ley aplicable",
      p: "Podemos modificar estas condiciones. Avisaremos con antelación en la web de los cambios importantes. Si no estás de acuerdo con ellos, puedes cerrar tu cuenta. La relación entre tú y el operador se rige por la ley de la República Checa. Los consumidores pueden utilizar la resolución extrajudicial de conflictos a través de la Inspección Checa de Comercio.",
    },
    {
      icon: "mail",
      h: "Contacto",
      p: `Preguntas sobre estas condiciones: ${CONTACT_EMAIL}.`,
    },
  ],
};

const cookiesEs: LegalPage = {
  title: "Política de cookies",
  updated: "Última actualización: noviembre de 2026",
  intro: "Explicamos qué cookies y tecnologías similares usa la web, por qué las usamos y cómo puedes gestionarlas. Cada elemento que usamos aparece en la tabla.",
  summaryTitle: "En resumen",
  summary: [
    "Usamos solo cookies esenciales y el almacenamiento local del navegador.",
    "No usamos cookies publicitarias ni de análisis.",
    "Sin las cookies esenciales, la web no puede funcionar de forma segura (inicio de sesión, idioma).",
  ],
  tocTitle: "En esta página",
  sections: [
    {
      icon: "info",
      h: "Qué son las cookies y el almacenamiento local",
      p: "Las cookies son pequeños archivos de texto que una web guarda en tu navegador y envía de vuelta en tu siguiente visita. El almacenamiento local (localStorage) funciona de forma parecida, pero los datos permanecen en tu navegador y no se envían al servidor. Usamos ambos solo para los fines descritos en esta página.",
    },
    {
      icon: "shield",
      h: "Cookies esenciales",
      p: "La web necesita estos elementos para funcionar. No pedimos consentimiento para ellos, porque sin ellos las cuentas no pueden gestionarse de forma segura.",
      table: {
        head: ["Nombre", "Finalidad", "Duración", "Tipo"],
        rows: [
          ["NEXT_LOCALE", "Guarda el idioma de la web que has elegido", "1 año", "Propia"],
          ["Cookie de inicio de sesión (sesión)", "Mantiene tu sesión iniciada durante la sesión", "Hasta cerrar sesión o hasta que caduque la sesión", "Propia, no legible por scripts"],
          ["Cookies de Cloudflare Turnstile", "Comprueba que no eres un bot en el registro y en el formulario de contacto", "Las establece el proveedor (de corta duración)", "De terceros (Cloudflare)"],
        ],
      },
    },
    {
      icon: "gear",
      h: "Almacenamiento local del navegador",
      p: "Guardamos solo lo necesario para mostrar bien la web y por comodidad: los ajustes de apariencia (tema, tipografía, tamaño, colores, movimiento y espaciado), tu objetivo diario, tus mejores resultados en los juegos, la plantilla elegida del test diario y el estado de algunos elementos del juego, por ejemplo si ya has visto la introducción. Estos datos permanecen en tu dispositivo.",
    },
    {
      icon: "star",
      h: "Cookies que no usamos",
      list: [
        "Cookies publicitarias y redes de anuncios que muestran publicidad segmentada.",
        "Herramientas de análisis como Google Analytics u otras de medición de tráfico similares.",
        "Seguimiento entre sitios web y elaboración de perfiles de usuario.",
      ],
    },
    {
      icon: "pencil",
      h: "Cómo gestionar las cookies",
      p: "Puedes borrar o bloquear las cookies y el almacenamiento local en cualquier momento desde los ajustes de tu navegador. Si borras el almacenamiento local, volverá la apariencia predeterminada y se reiniciará el progreso del juego que no esté guardado en tu cuenta. Bloquear las cookies esenciales puede impedirte iniciar sesión o hacer que deje de funcionar la elección de idioma.",
    },
    {
      icon: "mail",
      h: "Cambios y contacto",
      p: `Si añadimos nuevas cookies, actualizaremos esta página. Preguntas sobre cookies: ${CONTACT_EMAIL}. Más información sobre el tratamiento de datos en la Política de privacidad.`,
    },
  ],
};

const privacyFr: LegalPage = {
  title: "Politique de confidentialité",
  updated: "Dernière mise à jour : novembre 2026",
  intro: "Cette page explique quelles données personnelles le site Učíme se hrou conserve à ton sujet, pourquoi nous en avons besoin, combien de temps nous les gardons et quels droits tu as. Nous avons essayé de rester clairs. Si quelque chose n'est pas clair, écris-nous simplement.",
  summaryTitle: "En bref",
  summary: [
    "Un compte nécessite un nom, une adresse e-mail et un mot de passe. Les mots de passe ne sont conservés que sous forme de hachage sécurisé.",
    "Nous ne vendons pas tes données et ne les utilisons pas à des fins publicitaires.",
    "Nous n'utilisons que les cookies essentiels, sans suivi.",
    "Tu peux demander à tout moment une copie, une correction ou la suppression de tes données.",
  ],
  tocTitle: "Sur cette page",
  sections: [
    {
      icon: "info",
      h: "Qui traite tes données",
      p: `Le responsable de tes données personnelles est l'équipe qui gère le site Učíme se hrou. Pour toute question sur la confidentialité, écris-nous à ${CONTACT_EMAIL}.`,
    },
    {
      icon: "user",
      h: "Quelles données nous traitons",
      p: "Les données collectées dépendent de la façon dont tu utilises le site. Un compte ne peut pas être créé sans nom, adresse e-mail et mot de passe.",
      list: [
        "Compte : nom, adresse e-mail, mot de passe (conservé uniquement sous forme de hachage sécurisé, jamais en clair) et, facultativement, un avatar et ton école.",
        "Progression dans le jeu : points, niveaux, jeux et parcours débloqués, résultats des classements, ainsi que l'historique des points et des achats dans la boutique.",
        "Paramètres : langue choisie, apparence et réglages du contrôle parental (le code PIN n'est conservé que sous forme de hachage).",
        "Messages : texte du formulaire de contact, messages d'équipe et devoirs que les élèves remettent à leurs enseignants.",
        "Textes de l'assistant IA : ce que tu saisis dans l'assistant n'est traité que pour te répondre.",
        "Données techniques : adresse IP et données des requêtes que l'hébergement et la protection anti-bots traitent nécessairement.",
      ],
    },
    {
      icon: "gear",
      h: "Pourquoi nous les utilisons et sur quelle base",
      p: "Nous n'utilisons les données que pour ces finalités : gérer ton compte et sauvegarder ta progression (exécution du contrat d'utilisation du site), répondre à tes questions (ta demande ou notre intérêt légitime), assurer la sécurité et la protection contre les abus (intérêt légitime) et respecter nos obligations légales. Nous ne vendons pas de données, ne les utilisons pas pour du profilage publicitaire et ne les transmettons pas à des tiers à des fins de marketing.",
    },
    {
      icon: "people",
      h: "Sous-traitants et services tiers",
      p: "Certaines parties du site fonctionnent avec des prestataires externes, qui traitent les données sur nos instructions dans le cadre d'accords de traitement de données :",
      list: [
        "Cloudflare : hébergement du site (Cloudflare Workers), envoi des e-mails et vérification anti-bots Turnstile lors de l'inscription et dans le formulaire de contact.",
        "Base de données PostgreSQL : stockage des comptes, de la progression et des autres données de jeu.",
        "Assistant IA : les réponses sont générées sur Cloudflare Workers AI ou, lorsque c'est configuré, via l'API Anthropic. Seul le texte que tu saisis dans l'assistant y est envoyé.",
      ],
    },
    {
      icon: "trophy",
      h: "Enfants, élèves et parents",
      p: "Les élèves de moins de 15 ans ne peuvent utiliser le site qu'avec le consentement d'un parent ou d'un représentant légal. Dans les réglages du contrôle parental, un parent peut limiter le temps passé sur le site, bloquer les achats dans la boutique ou le jeu à plusieurs, et recevoir un récapitulatif hebdomadaire des parcours terminés. Si nous apprenons qu'un compte d'enfant a été créé sans le consentement du responsable légal, nous le supprimerons.",
    },
    {
      icon: "study",
      h: "Enseignants et écoles",
      p: "Les enseignants peuvent voir les données des élèves des équipes auxquelles ils appartiennent, y compris les devoirs remis et les résultats, et uniquement à des fins pédagogiques. Les enseignants ne doivent pas saisir de données personnelles sensibles sur les élèves dans les équipes ni utiliser les données en dehors de l'enseignement. L'école est responsable de l'ajout des élèves aux équipes conformément à ses propres règles et au consentement des responsables légaux lorsqu'il est requis.",
    },
    {
      icon: "courses",
      h: "Combien de temps nous conservons les données",
      p: "Nous conservons les données du compte tant que le compte existe. Après la suppression, nous les effaçons, sauf si la loi nous oblige à les garder plus longtemps (par exemple les justificatifs comptables des achats). Les messages du formulaire de contact ne sont conservés que le temps nécessaire pour traiter ta demande. Les journaux des tentatives de connexion et des limites de requêtes servent uniquement à prévenir les abus et sont conservés brièvement. Lorsqu'un compte est supprimé, il disparaît aussi des classements et des vues d'ensemble des équipes. Des statistiques globales et anonymes peuvent être conservées.",
    },
    {
      icon: "shield",
      h: "Sécurité",
      p: "Les mots de passe ne sont conservés que sous forme de hachage, l'accès aux données est limité aux personnes qui en ont besoin pour faire fonctionner le site, et les échanges entre ton navigateur et nous sont chiffrés (HTTPS). Aucun système n'est toutefois parfaitement sûr. Si une fuite de données présentait un risque pour toi, nous t'en informerions ainsi que l'Office pour la protection des données personnelles, comme la loi l'exige.",
    },
    {
      icon: "pencil",
      h: "Cookies et stockage local",
      p: "Un aperçu détaillé se trouve sur la page de la politique relative aux cookies. En bref : nous n'utilisons que les cookies essentiels (connexion et choix de la langue) et le stockage local du navigateur pour les réglages d'apparence et la progression dans le jeu. Ils ne servent ni à la publicité ni au suivi.",
    },
    {
      icon: "mail",
      h: "Tes droits",
      p: `Tu as le droit de demander l'accès à tes données, leur rectification, leur effacement (suppression du compte), la limitation du traitement, leur portabilité sous une forme lisible par machine, et de t'opposer au traitement fondé sur un intérêt légitime. Envoie ta demande à ${CONTACT_EMAIL}. Nous répondrons dans un délai d'un mois. Tu as également le droit d'introduire une réclamation auprès de l'Office pour la protection des données personnelles (ÚOOÚ) en République tchèque.`,
    },
    {
      icon: "scroll",
      h: "Modifications de cette politique",
      p: "Nous pouvons mettre à jour cette politique, par exemple à cause de nouvelles fonctionnalités ou de changements légaux. La version en vigueur est toujours sur cette page et la date de la dernière mise à jour figure en haut. Nous annoncerons les changements importants sur le site à l'avance.",
    },
  ],
};

const termsFr: LegalPage = {
  title: "Conditions d'utilisation",
  updated: "Dernière mise à jour : novembre 2026",
  intro: "Ces conditions régissent l'utilisation du site Učíme se hrou. En créant un compte ou en utilisant le site, tu les acceptes. Nous avons essayé de les rendre lisibles, mais elles ont la même valeur contraignante que tout contrat.",
  summaryTitle: "En bref",
  summary: [
    "Le site sert à apprendre et à s'entraîner. Joue loyalement.",
    "Tu es responsable de ton compte ; pour les comptes d'enfants, le parent ou le responsable légal l'est aussi.",
    "Les points, les pièces et l'argent du jeu ne sont pas de l'argent réel et ne peuvent pas être encaissés.",
    "Le contenu du site nous appartient. Tu ne peux le copier qu'avec notre autorisation.",
  ],
  tocTitle: "Sur cette page",
  sections: [
    {
      icon: "info",
      h: "Introduction et champ d'application",
      p: "Ces conditions s'appliquent à toute personne qui visite le site ou possède un compte, y compris les élèves, les enseignants et les parents. Si tu ne les acceptes pas, merci de ne pas utiliser le site.",
    },
    {
      icon: "user",
      h: "Inscription et comptes",
      list: [
        "Lors de l'inscription, tu fournis des informations exactes et tu gardes ton mot de passe pour toi.",
        "Les élèves de moins de 15 ans ne peuvent s'inscrire qu'avec le consentement d'un parent ou d'un représentant légal.",
        "Une personne ne doit avoir qu'un seul compte. Ne transmets pas ton compte à quelqu'un d'autre et ne l'utilise pas au nom d'une autre personne.",
        "Si tu remarques qu'un usage abusif est fait de ton compte, contacte-nous dès que possible.",
      ],
      p: "Ton compte est personnel. Tu es responsable des activités réalisées par son intermédiaire, sauf si tu les as signalées.",
    },
    {
      icon: "gamepad",
      h: "Fair-play, points et classements",
      p: "Les points, les récompenses et les classements doivent refléter ton véritable apprentissage. Sont interdits : les outils automatisés et les scripts, l'exploitation des bugs du site, le fait de jouer avec le compte de quelqu'un d'autre, la manipulation délibérée des résultats et le contournement des limites comme le contrôle parental ou les limites de temps. Un manquement peut entraîner la suppression de points ou la fermeture du compte.",
    },
    {
      icon: "people",
      h: "Comportement des utilisateurs et contenus",
      list: [
        "Les messages d'équipe, les noms de salles, les avis de la boutique et tout autre texte que tu écris doivent être polis et ne doivent ni insulter ni menacer autrui.",
        "Ne publie pas de données personnelles d'autres personnes, de contenus illicites ou de spam.",
        "Les textes que tu écris restent tes textes. Tu nous accordes un droit non exclusif de les afficher sur le site, par exemple dans un classement ou dans une équipe.",
        "Nous pouvons modifier ou supprimer les contenus qui enfreignent ces règles.",
      ],
    },
    {
      icon: "trophy",
      h: "Points, pièces et argent du jeu",
      p: "Les points, les pièces, les objets et l'argent du jeu issus de l'Économie font partie du jeu. Ils n'ont aucune valeur monétaire réelle et ne peuvent pas être encaissés. Tu ne peux les utiliser que sur le site, dans la boutique et sur le marché des joueurs. Si des produits payants ou des abonnements sont introduits à l'avenir, nous publierons leurs conditions et leurs prix à l'avance et séparément.",
    },
    {
      icon: "shop",
      h: "Boutique, éditions limitées et prix",
      p: "Lorsqu'un prix est affiché pour une fonctionnalité, c'est le prix affiché au moment de la commande qui s'applique. Les éditions limitées sont disponibles en quantité limitée et leur disponibilité peut changer. La boutique, les objets achetés et les lots de la roue de la fortune peuvent évoluer avec le temps.",
    },
    {
      icon: "courses",
      h: "Contenus et droits d'auteur",
      p: "Les textes, exercices, graphiques, animations et jeux du site sont créés par notre équipe ou utilisés avec l'autorisation de leur auteur. Tu peux les utiliser pour ton apprentissage personnel. Il est interdit de les copier, de les modifier, de les redistribuer ou de les exploiter commercialement sans autorisation écrite. Nous préparons les exercices avec soin, mais nous ne pouvons pas garantir qu'ils sont totalement exempts d'erreurs. Si tu en trouves une, fais-le-nous savoir.",
    },
    {
      icon: "study",
      h: "Enseignants, équipes et devoirs",
      p: "Les enseignants peuvent créer des équipes, donner des devoirs et suivre les résultats des élèves. Ils doivent le faire dans le respect de la loi, à des fins pédagogiques et en tenant compte de la protection des données des élèves (voir la Politique de confidentialité). L'enseignant ou l'école est responsable de l'ajout d'un élève à une équipe conformément au règlement de l'école et au consentement des responsables légaux lorsqu'il est requis.",
    },
    {
      icon: "rocket",
      h: "Assistant IA et texte généré",
      p: "L'assistant IA est là pour aider à apprendre, il n'est pas une source d'information garantie. Ses réponses peuvent être inexactes et ne remplacent ni un avis professionnel, ni un enseignant, ni un médecin. N'envoie pas à l'assistant de données sensibles, comme des mots de passe, des numéros de pièces d'identité ou des données de santé.",
    },
    {
      icon: "shield",
      h: "Disponibilité et responsabilité",
      p: "Nous faisons fonctionner le site en continu, mais nous ne pouvons pas garantir qu'il sera toujours disponible et exempt d'erreurs. Nous pouvons le suspendre temporairement pour maintenance ou pour de nouvelles fonctionnalités. Dans la mesure permise par la loi, nous ne sommes pas responsables des dommages indirects causés par l'utilisation du site. Les droits des consommateurs qui ne peuvent pas être exclus par contrat restent intacts.",
    },
    {
      icon: "close",
      h: "Fermeture de ton compte",
      p: "Tu peux fermer ton compte à tout moment dans les réglages, ou en nous écrivant. Nous pouvons limiter ou fermer un compte qui enfreint ces conditions ou gêne d'autres personnes. Lorsque cela est possible, nous t'en informerons à l'avance et t'expliquerons les raisons.",
    },
    {
      icon: "scroll",
      h: "Modifications et droit applicable",
      p: "Nous pouvons modifier ces conditions. Nous t'avertirons à l'avance, sur le site, des changements importants. Si tu ne les acceptes pas, tu peux fermer ton compte. La relation entre toi et l'exploitant est régie par le droit de la République tchèque. Les consommateurs peuvent recourir à la résolution extrajudiciaire des litiges auprès de l'Inspection tchèque du commerce.",
    },
    {
      icon: "mail",
      h: "Contact",
      p: `Questions sur ces conditions : ${CONTACT_EMAIL}.`,
    },
  ],
};

const cookiesFr: LegalPage = {
  title: "Politique relative aux cookies",
  updated: "Dernière mise à jour : novembre 2026",
  intro: "Nous expliquons quels cookies et technologies similaires le site utilise, pourquoi et comment tu peux les gérer. Chaque élément que nous utilisons figure dans le tableau.",
  summaryTitle: "En bref",
  summary: [
    "Nous n'utilisons que les cookies essentiels et le stockage local du navigateur.",
    "Nous n'utilisons pas de cookies publicitaires ni de cookies d'analyse.",
    "Sans les cookies essentiels, le site ne peut pas fonctionner de manière sécurisée (connexion, langue).",
  ],
  tocTitle: "Sur cette page",
  sections: [
    {
      icon: "info",
      h: "Qu'est-ce qu'un cookie et le stockage local",
      p: "Les cookies sont de petits fichiers texte qu'un site enregistre dans ton navigateur et renvoie lors de ta prochaine visite. Le stockage local (localStorage) fonctionne de façon similaire, mais les données restent dans ton navigateur et ne sont pas envoyées au serveur. Nous utilisons les deux uniquement pour les finalités décrites sur cette page.",
    },
    {
      icon: "shield",
      h: "Cookies essentiels",
      p: "Le site a besoin de ces éléments pour fonctionner. Nous ne demandons pas de consentement pour eux, car les comptes ne peuvent pas être gérés en toute sécurité sans eux.",
      table: {
        head: ["Nom", "Finalité", "Durée", "Type"],
        rows: [
          ["NEXT_LOCALE", "Enregistre la langue du site que tu as choisie", "1 an", "Propre au site"],
          ["Cookie de connexion (session)", "Te garde connecté pendant la session", "Jusqu'à la déconnexion ou l'expiration de la session", "Propre au site, illisible par les scripts"],
          ["Cookies Cloudflare Turnstile", "Vérifie que tu n'es pas un robot lors de l'inscription et dans le formulaire de contact", "Définis par le prestataire (courte durée)", "Tiers (Cloudflare)"],
        ],
      },
    },
    {
      icon: "gear",
      h: "Stockage local du navigateur",
      p: "Nous ne stockons que ce qui est nécessaire pour afficher correctement le site et par commodité : les réglages d'apparence (thème, police, taille, couleurs, animations et espacements), ton objectif quotidien, tes meilleurs résultats aux jeux, le modèle choisi pour le quiz du jour et l'état de certains éléments du jeu, par exemple si tu as déjà vu l'introduction. Ces données restent sur ton appareil.",
    },
    {
      icon: "star",
      h: "Cookies que nous n'utilisons pas",
      list: [
        "Cookies publicitaires et réseaux publicitaires qui diffusent des annonces ciblées.",
        "Outils d'analyse comme Google Analytics ou d'autres outils de mesure d'audience similaires.",
        "Suivi d'un site à l'autre et profilage des utilisateurs.",
      ],
    },
    {
      icon: "pencil",
      h: "Comment gérer les cookies",
      p: "Tu peux supprimer ou bloquer les cookies et le stockage local à tout moment dans les paramètres de ton navigateur. Si tu supprimes le stockage local, l'apparence par défaut revient et la progression du jeu non enregistrée sur ton compte est réinitialisée. Bloquer les cookies essentiels peut t'empêcher de te connecter ou faire cesser le fonctionnement du choix de la langue.",
    },
    {
      icon: "mail",
      h: "Modifications et contact",
      p: `Si nous ajoutons de nouveaux cookies, nous mettrons à jour cette page. Questions sur les cookies : ${CONTACT_EMAIL}. Pour en savoir plus sur le traitement des données, consulte la Politique de confidentialité.`,
    },
  ],
};

const LEGAL: Record<Locale, Record<"privacy" | "terms" | "cookies", LegalPage>> = {
  cs: { privacy: privacyCs, terms: termsCs, cookies: cookiesCs },
  en: { privacy: privacyEn, terms: termsEn, cookies: cookiesEn },
  de: { privacy: privacyDe, terms: termsDe, cookies: cookiesDe },
  ru: { privacy: privacyRu, terms: termsRu, cookies: cookiesRu },
  uk: { privacy: privacyUk, terms: termsUk, cookies: cookiesUk },
  ja: { privacy: privacyJa, terms: termsJa, cookies: cookiesJa },
  es: { privacy: privacyEs, terms: termsEs, cookies: cookiesEs },
  fr: { privacy: privacyFr, terms: termsFr, cookies: cookiesFr },
};

export function getLegalPage(kind: "privacy" | "terms" | "cookies", locale: Locale): LegalPage {
  return LEGAL[locale][kind];
}
