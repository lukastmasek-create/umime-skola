import type { Locale } from "./config";
import type { ContactCategory, ContactField, ContactTopic } from "@/lib/contact";

type TopicText = { title: string; hint: string; placeholder: string };

export type ContactText = {
  nav: string;
  title: string;
  subtitle: string;
  step: { category: string; topic: string; details: string };
  categories: Record<ContactCategory, { title: string; hint: string }>;
  topics: Record<ContactTopic, TopicText>;
  fields: Record<ContactField, string>;
  name: string;
  email: string;
  message: string;
  optional: string;
  send: string;
  sending: string;
  back: string;
  change: string;
  privacy: string;
  successTitle: string;
  successText: string;
  sendAnother: string;
  missingSchool: string;
  errors: {
    topic: string;
    name: string;
    email: string;
    "message-short": string;
    field: string;
    rate: string;
    unavailable: string;
  };
};

const cs: ContactText = {
  nav: "Kontakt",
  title: "Kontakt",
  subtitle: "Napiš nám. Vyber, čeho se zpráva týká, ať se dostane ke správnému člověku.",
  step: { category: "1. S čím potřebuješ pomoct?", topic: "2. Upřesni téma", details: "3. Napiš zprávu" },
  categories: {
    support: { title: "Podpora", hint: "Našel jsi chybu v učivu, na stránce nebo máš problém s účtem." },
    partner: { title: "Partnerství", hint: "Školy, influenceři a vydavatelé učebnic, kteří chtějí spolupracovat." },
    school: { title: "Přidání školy", hint: "Tvoje škola chybí v seznamu škol? Pošli nám ji a doplníme ji." },
  },
  topics: {
    "content-error": { title: "Chyba v učivu", hint: "Špatná odpověď, překlep nebo nejasné vysvětlení v kurzu či materiálech.", placeholder: "Co je špatně a jak by to mělo být správně?" },
    "site-error": { title: "Chyba ve stránce", hint: "Něco nefunguje, nenačítá se nebo se zobrazuje divně.", placeholder: "Co jsi dělal(a), co se stalo a co jsi čekal(a)? Pomůže i zařízení a prohlížeč." },
    account: { title: "Chyba s účtem", hint: "Přihlášení, heslo, body, nákupy nebo nastavení účtu.", placeholder: "Popiš, co se s účtem děje. Nikdy nám neposílej heslo." },
    "partner-school": { title: "Partnerská škola", hint: "Chcete web používat ve škole a spolupracovat s námi.", placeholder: "Představte školu a napište, jakou spolupráci si představujete." },
    influencer: { title: "Influenceři", hint: "Tvoříš obsah pro děti, rodiče nebo učitele a chceš spolupracovat.", placeholder: "Kde tvoříš, pro koho a jakou spolupráci navrhuješ?" },
    textbooks: { title: "Učebnice pro materiály", hint: "Vydavatelé a autoři učebnic, jejichž obsah může být podkladem materiálů.", placeholder: "O jaké učebnice jde, pro které ročníky a předměty?" },
    "add-school": { title: "Přidání školy", hint: "Doplníme školu do seznamu, aby si ji mohli vybrat žáci i učitelé.", placeholder: "Cokoli, co nám pomůže školu najít (adresa, web školy…)." },
  },
  fields: {
    where: "Kde je chyba (předmět, kurz, lekce)",
    url: "Odkaz na stránku",
    accountEmail: "E-mail účtu (pokud je jiný)",
    schoolName: "Název školy",
    city: "Obec / město",
    role: "Tvoje role ve škole",
    profile: "Odkaz na profil nebo kanál",
    audience: "Počet sledujících (přibližně)",
    publisher: "Vydavatelství / autor",
    izo: "IZO nebo RED IZO",
  },
  name: "Jméno",
  email: "E-mail pro odpověď",
  message: "Zpráva",
  optional: "nepovinné",
  send: "Odeslat zprávu",
  sending: "Odesílám…",
  back: "Zpět",
  change: "Změnit",
  privacy: "Údaje použijeme jen k vyřízení zprávy a k odpovědi.",
  successTitle: "Zpráva odeslána!",
  successText: "Děkujeme. Odpovíme na e-mail {email} co nejdřív.",
  sendAnother: "Poslat další zprávu",
  missingSchool: "Chybí tvoje škola v seznamu? Napiš nám a doplníme ji.",
  errors: {
    topic: "Vyber téma zprávy.",
    name: "Vyplň jméno.",
    email: "Zadej platný e-mail, ať ti můžeme odpovědět.",
    "message-short": "Zpráva je moc krátká, napiš aspoň pár slov.",
    field: "Zkontroluj pole „{field}“.",
    rate: "Poslal(a) jsi hodně zpráv za sebou. Zkus to prosím za pár minut.",
    unavailable: "Zprávu se teď nepodařilo odeslat. Zkus to prosím za chvíli.",
  },
};

const en: ContactText = {
  nav: "Contact",
  title: "Contact",
  subtitle: "Write to us. Pick what your message is about so it reaches the right person.",
  step: { category: "1. What do you need help with?", topic: "2. Choose a topic", details: "3. Write your message" },
  categories: {
    support: { title: "Support", hint: "You found a mistake in the lessons or on the site, or have a problem with your account." },
    partner: { title: "Partnership", hint: "Schools, influencers and textbook publishers who want to work with us." },
    school: { title: "Add a school", hint: "Is your school missing from the list? Send it to us and we'll add it." },
  },
  topics: {
    "content-error": { title: "Mistake in the lessons", hint: "A wrong answer, a typo or an unclear explanation in a course or study material.", placeholder: "What is wrong and what should it say instead?" },
    "site-error": { title: "Website problem", hint: "Something doesn't work, doesn't load or looks broken.", placeholder: "What did you do, what happened and what did you expect? Your device and browser help too." },
    account: { title: "Account problem", hint: "Signing in, password, points, purchases or account settings.", placeholder: "Describe what is happening with your account. Never send us your password." },
    "partner-school": { title: "Partner school", hint: "You want to use the site at your school and work with us.", placeholder: "Introduce your school and tell us what kind of cooperation you have in mind." },
    influencer: { title: "Influencers", hint: "You create content for kids, parents or teachers and want to work together.", placeholder: "Where do you create, for whom, and what do you suggest?" },
    textbooks: { title: "Textbooks for study materials", hint: "Textbook publishers and authors whose content could be the basis of our materials.", placeholder: "Which textbooks, for which grades and subjects?" },
    "add-school": { title: "Add a school", hint: "We'll add the school to the list so students and teachers can pick it.", placeholder: "Anything that helps us find the school (address, school website…)." },
  },
  fields: {
    where: "Where is the mistake (subject, course, lesson)",
    url: "Link to the page",
    accountEmail: "Account e-mail (if different)",
    schoolName: "School name",
    city: "Town / city",
    role: "Your role at the school",
    profile: "Link to your profile or channel",
    audience: "Followers (roughly)",
    publisher: "Publisher / author",
    izo: "School ID (IZO or RED IZO)",
  },
  name: "Name",
  email: "E-mail for our reply",
  message: "Message",
  optional: "optional",
  send: "Send message",
  sending: "Sending…",
  back: "Back",
  change: "Change",
  privacy: "We only use your details to handle and answer your message.",
  successTitle: "Message sent!",
  successText: "Thank you. We'll reply to {email} as soon as we can.",
  sendAnother: "Send another message",
  missingSchool: "Is your school missing from the list? Let us know and we'll add it.",
  errors: {
    topic: "Choose a topic for your message.",
    name: "Fill in your name.",
    email: "Enter a valid e-mail so we can reply.",
    "message-short": "The message is too short, write at least a few words.",
    field: "Check the field “{field}”.",
    rate: "You've sent a lot of messages in a row. Please try again in a few minutes.",
    unavailable: "The message couldn't be sent right now. Please try again in a moment.",
  },
};

const de: ContactText = {
  nav: "Kontakt",
  title: "Kontakt",
  subtitle: "Schreib uns. Wähle, worum es geht, damit deine Nachricht bei der richtigen Person landet.",
  step: { category: "1. Wobei brauchst du Hilfe?", topic: "2. Wähle ein Thema", details: "3. Schreib deine Nachricht" },
  categories: {
    support: { title: "Support", hint: "Du hast einen Fehler im Lernstoff oder auf der Seite gefunden oder ein Problem mit deinem Konto." },
    partner: { title: "Partnerschaft", hint: "Schulen, Influencer und Schulbuchverlage, die mit uns zusammenarbeiten möchten." },
    school: { title: "Schule hinzufügen", hint: "Fehlt deine Schule in der Liste? Schick sie uns und wir ergänzen sie." },
  },
  topics: {
    "content-error": { title: "Fehler im Lernstoff", hint: "Eine falsche Antwort, ein Tippfehler oder eine unklare Erklärung im Kurs oder Material.", placeholder: "Was ist falsch und wie wäre es richtig?" },
    "site-error": { title: "Fehler auf der Seite", hint: "Etwas funktioniert nicht, lädt nicht oder wird seltsam angezeigt.", placeholder: "Was hast du gemacht, was ist passiert und was hast du erwartet? Gerät und Browser helfen auch." },
    account: { title: "Problem mit dem Konto", hint: "Anmeldung, Passwort, Punkte, Käufe oder Kontoeinstellungen.", placeholder: "Beschreibe, was mit deinem Konto los ist. Schick uns nie dein Passwort." },
    "partner-school": { title: "Partnerschule", hint: "Ihr wollt die Seite in eurer Schule nutzen und mit uns zusammenarbeiten.", placeholder: "Stellt eure Schule vor und schreibt, welche Zusammenarbeit ihr euch vorstellt." },
    influencer: { title: "Influencer", hint: "Du machst Inhalte für Kinder, Eltern oder Lehrkräfte und willst zusammenarbeiten.", placeholder: "Wo machst du Inhalte, für wen und was schlägst du vor?" },
    textbooks: { title: "Schulbücher für Materialien", hint: "Verlage und Autoren von Schulbüchern, deren Inhalte Grundlage unserer Materialien sein können.", placeholder: "Um welche Schulbücher geht es, für welche Klassen und Fächer?" },
    "add-school": { title: "Schule hinzufügen", hint: "Wir nehmen die Schule in die Liste auf, damit Schüler und Lehrkräfte sie wählen können.", placeholder: "Alles, was uns hilft, die Schule zu finden (Adresse, Website…)." },
  },
  fields: {
    where: "Wo ist der Fehler (Fach, Kurs, Lektion)",
    url: "Link zur Seite",
    accountEmail: "E-Mail des Kontos (falls anders)",
    schoolName: "Name der Schule",
    city: "Ort / Stadt",
    role: "Deine Rolle an der Schule",
    profile: "Link zu Profil oder Kanal",
    audience: "Follower (ungefähr)",
    publisher: "Verlag / Autor",
    izo: "Schulkennzahl (IZO / RED IZO)",
  },
  name: "Name",
  email: "E-Mail für die Antwort",
  message: "Nachricht",
  optional: "optional",
  send: "Nachricht senden",
  sending: "Wird gesendet…",
  back: "Zurück",
  change: "Ändern",
  privacy: "Wir verwenden deine Angaben nur, um die Nachricht zu bearbeiten und zu beantworten.",
  successTitle: "Nachricht gesendet!",
  successText: "Danke. Wir antworten so bald wie möglich an {email}.",
  sendAnother: "Weitere Nachricht senden",
  missingSchool: "Fehlt deine Schule in der Liste? Schreib uns, wir ergänzen sie.",
  errors: {
    topic: "Wähle ein Thema für deine Nachricht.",
    name: "Gib deinen Namen ein.",
    email: "Gib eine gültige E-Mail ein, damit wir antworten können.",
    "message-short": "Die Nachricht ist zu kurz, schreib wenigstens ein paar Wörter.",
    field: "Prüfe das Feld „{field}“.",
    rate: "Du hast viele Nachrichten hintereinander gesendet. Versuche es bitte in ein paar Minuten noch einmal.",
    unavailable: "Die Nachricht konnte gerade nicht gesendet werden. Versuche es bitte gleich noch einmal.",
  },
};

const ru: ContactText = {
  nav: "Контакты",
  title: "Контакты",
  subtitle: "Напиши нам. Выбери, о чём сообщение, чтобы оно попало к нужному человеку.",
  step: { category: "1. С чем нужна помощь?", topic: "2. Уточни тему", details: "3. Напиши сообщение" },
  categories: {
    support: { title: "Поддержка", hint: "Ты нашёл ошибку в учебном материале или на сайте или у тебя проблема с аккаунтом." },
    partner: { title: "Партнёрство", hint: "Школы, инфлюенсеры и издательства учебников, которые хотят сотрудничать." },
    school: { title: "Добавить школу", hint: "Твоей школы нет в списке? Пришли её нам, и мы её добавим." },
  },
  topics: {
    "content-error": { title: "Ошибка в учебном материале", hint: "Неверный ответ, опечатка или непонятное объяснение в курсе или материалах.", placeholder: "Что неправильно и как должно быть?" },
    "site-error": { title: "Ошибка на сайте", hint: "Что-то не работает, не загружается или странно отображается.", placeholder: "Что ты делал(а), что произошло и чего ты ожидал(а)? Устройство и браузер тоже помогут." },
    account: { title: "Проблема с аккаунтом", hint: "Вход, пароль, баллы, покупки или настройки аккаунта.", placeholder: "Опиши, что происходит с аккаунтом. Никогда не присылай нам пароль." },
    "partner-school": { title: "Школа-партнёр", hint: "Вы хотите пользоваться сайтом в школе и сотрудничать с нами.", placeholder: "Расскажите о школе и о том, какое сотрудничество вы представляете." },
    influencer: { title: "Инфлюенсеры", hint: "Ты создаёшь контент для детей, родителей или учителей и хочешь сотрудничать.", placeholder: "Где ты создаёшь контент, для кого и что предлагаешь?" },
    textbooks: { title: "Учебники для материалов", hint: "Издательства и авторы учебников, чьё содержание может стать основой наших материалов.", placeholder: "О каких учебниках речь, для каких классов и предметов?" },
    "add-school": { title: "Добавить школу", hint: "Мы добавим школу в список, чтобы ученики и учителя могли её выбрать.", placeholder: "Всё, что поможет найти школу (адрес, сайт школы…)." },
  },
  fields: {
    where: "Где ошибка (предмет, курс, урок)",
    url: "Ссылка на страницу",
    accountEmail: "E-mail аккаунта (если другой)",
    schoolName: "Название школы",
    city: "Населённый пункт / город",
    role: "Твоя роль в школе",
    profile: "Ссылка на профиль или канал",
    audience: "Подписчики (примерно)",
    publisher: "Издательство / автор",
    izo: "Код школы (IZO / RED IZO)",
  },
  name: "Имя",
  email: "E-mail для ответа",
  message: "Сообщение",
  optional: "необязательно",
  send: "Отправить сообщение",
  sending: "Отправляю…",
  back: "Назад",
  change: "Изменить",
  privacy: "Мы используем данные только для обработки сообщения и ответа.",
  successTitle: "Сообщение отправлено!",
  successText: "Спасибо. Мы ответим на {email} как можно скорее.",
  sendAnother: "Отправить ещё одно сообщение",
  missingSchool: "Твоей школы нет в списке? Напиши нам, и мы её добавим.",
  errors: {
    topic: "Выбери тему сообщения.",
    name: "Укажи имя.",
    email: "Укажи правильный e-mail, чтобы мы могли ответить.",
    "message-short": "Сообщение слишком короткое, напиши хотя бы несколько слов.",
    field: "Проверь поле «{field}».",
    rate: "Ты отправил(а) много сообщений подряд. Попробуй, пожалуйста, через несколько минут.",
    unavailable: "Сейчас не удалось отправить сообщение. Попробуй, пожалуйста, чуть позже.",
  },
};

const texts: Record<Locale, ContactText> = { cs, en, de, ru };

export function getContactText(locale: Locale): ContactText {
  return texts[locale] ?? cs;
}
