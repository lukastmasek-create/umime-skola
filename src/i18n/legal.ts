import { tr8, type Locale } from "./config";
import type { SketchIconKind } from "@/components/SketchIcons";

export const CONTACT_EMAIL = "ucime.se.hrou@seznam.cz";
export const INSTAGRAM_HANDLE = "ucime.se.hrou";
export const INSTAGRAM_URL = `https://www.instagram.com/${INSTAGRAM_HANDLE}/`;

const privacyLabel = tr8("Ochrana soukromí", "Privacy policy", "Datenschutz", "Конфиденциальность");
const termsLabel = tr8("Podmínky", "Terms", "Nutzungsbedingungen", "Условия");
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

export function getLegalPage(kind: "privacy" | "terms" | "cookies", locale: Locale): LegalPage {
  if (kind === "cookies") return locale === "cs" ? cookiesCs : cookiesEn;
  if (kind === "privacy") return locale === "cs" ? privacyCs : privacyEn;
  return locale === "cs" ? termsCs : termsEn;
}
