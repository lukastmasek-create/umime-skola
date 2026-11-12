import { tr8, type Locale } from "./config";

export const CONTACT_EMAIL = "ucime.se.hrou@seznam.cz";
export const INSTAGRAM_HANDLE = "ucime.se.hrou";
export const INSTAGRAM_URL = `https://www.instagram.com/${INSTAGRAM_HANDLE}/`;

const privacyLabel = tr8("Ochrana soukromí", "Privacy policy", "Datenschutz", "Конфиденциальность");
const termsLabel = tr8("Podmínky", "Terms", "Nutzungsbedingungen", "Условия");
const cookiesLabel = tr8("Cookies", "Cookies", "Cookies", "Cookies");

export function getFooterLinks(locale: Locale) {
  return { privacy: privacyLabel[locale], terms: termsLabel[locale], cookies: cookiesLabel[locale] };
}

type Section = { h: string; p: string };
type LegalPage = { title: string; updated: string; sections: Section[] };

// Stručné úvodní znění; před ostrým provozem je vhodné nechat zkontrolovat právníkem.
const privacyCs: LegalPage = {
  title: "Ochrana soukromí",
  updated: "Poslední úprava: listopad 2026",
  sections: [
    { h: "Kdo údaje zpracovává", p: `Provozovatelem webu Učíme se hrou je tým Učíme se hrou. Kontakt: ${CONTACT_EMAIL}.` },
    { h: "Jaké údaje ukládáme", p: "Při registraci jméno, e-mail a heslo (uložené jen jako otisk), dále postup ve hrách a kurzech, body, nákupy a nastavení. Zprávy z kontaktního formuláře používáme jen k odpovědi." },
    { h: "Proč je používáme", p: "Aby fungoval účet, ukládal se postup, žebříčky a obchod, a abychom mohli odpovědět na dotazy. Údaje neprodáváme a nepředáváme je třetím stranám pro reklamu." },
    { h: "Cookies a místní úložiště", p: "Používáme jen nezbytné cookies (přihlášení a volba jazyka) a místní úložiště prohlížeče pro nastavení vzhledu a postup ve hrách. Neslouží k reklamě ani sledování. Podrobnosti jsou na stránce Cookies." },
    { h: "Děti", p: "Žáci mladší 15 let mají používat web se souhlasem rodiče nebo zákonného zástupce." },
    { h: "Vaše práva", p: `Můžete požádat o přístup k údajům, jejich opravu nebo smazání účtu. Napište na ${CONTACT_EMAIL}.` },
  ],
};
const privacyEn: LegalPage = {
  title: "Privacy policy",
  updated: "Last updated: November 2026",
  sections: [
    { h: "Who processes your data", p: `The site Učíme se hrou is run by the Učíme se hrou team. Contact: ${CONTACT_EMAIL}.` },
    { h: "What we store", p: "On sign-up your name, e-mail and password (stored only as a hash), plus your progress in games and courses, points, purchases and settings. Messages from the contact form are used only to reply." },
    { h: "Why we use it", p: "To run your account, keep progress, leaderboards and the shop working, and to answer questions. We do not sell your data or share it with third parties for advertising." },
    { h: "Cookies and local storage", p: "We use only essential cookies (sign-in and language choice) and browser local storage for appearance settings and game progress. They are not used for advertising or tracking. Details are on the Cookies page." },
    { h: "Children", p: "Pupils under 15 should use the site with the consent of a parent or guardian." },
    { h: "Your rights", p: `You can ask for access to your data, correction, or deletion of your account. Write to ${CONTACT_EMAIL}.` },
  ],
};
const termsCs: LegalPage = {
  title: "Podmínky použití",
  updated: "Poslední úprava: listopad 2026",
  sections: [
    { h: "Používání webu", p: "Web slouží k procvičování a učení. Používáte ho na vlastní odpovědnost a nesmíte narušovat jeho provoz ani podvádět v žebříčcích a hrách." },
    { h: "Účet", p: "Za své přihlašovací údaje odpovídáte. Účet, který porušuje pravidla nebo ruší ostatní hráče, můžeme omezit či zrušit." },
    { h: "Virtuální předměty a body", p: "Body, mince a předměty ve hře nemají peněžní hodnotu a nelze je vyplatit." },
    { h: "Obsah", p: "Texty, úlohy a grafiku webu nelze bez souhlasu kopírovat a dále šířit. Úlohy tvoříme s péčí, ale za případné chyby neručíme." },
    { h: "Kontakt", p: `Dotazy k podmínkám pište na ${CONTACT_EMAIL}.` },
  ],
};
const termsEn: LegalPage = {
  title: "Terms of use",
  updated: "Last updated: November 2026",
  sections: [
    { h: "Using the site", p: "The site is for practice and learning. You use it at your own risk and must not disrupt it or cheat in leaderboards and games." },
    { h: "Account", p: "You are responsible for your login details. We may limit or close accounts that break the rules or disturb other players." },
    { h: "Virtual items and points", p: "Points, coins and in-game items have no monetary value and cannot be cashed out." },
    { h: "Content", p: "Texts, tasks and artwork may not be copied or redistributed without permission. We write tasks with care but cannot guarantee they are error-free." },
    { h: "Contact", p: `Questions about these terms: ${CONTACT_EMAIL}.` },
  ],
};


// Zásady cookies: web nepoužívá reklamní ani analytické cookies, jen nezbytné.
const cookiesCs: LegalPage = {
  title: "Zásady cookies",
  updated: "Poslední úprava: listopad 2026",
  sections: [
    { h: "Co jsou cookies", p: "Cookies jsou malé textové soubory, které web uloží do vašeho prohlížeče. Podobnou funkci plní místní úložiště (localStorage), které používáme stejným způsobem." },
    { h: "Nezbytné cookies", p: "NEXT_LOCALE uchovává zvolený jazyk webu (platnost 1 rok). Session cookie po přihlášení udržuje vaše přihlášení. Bez nich web nelze bezpečně provozovat, proto pro ně souhlas není potřeba." },
    { h: "Místní úložiště", p: "V prohlížeči ukládáme nastavení vzhledu (téma, písmo, barvy, pohyb, rozestupy), denní cíl, nejlepší výsledky her a zvolenou úlohu v denním kvízu. Tyto údaje zůstávají jen ve vašem zařízení. Smažete je v nastavení prohlížeče." },
    { h: "Analytické ani reklamní cookies", p: "Web nepoužívá Google Analytics, reklamní sítě ani jiné sledovací nástroje. Třetím stranám cookies neposíláme." },
    { h: "Jak cookies spravovat", p: "Cookies a místní úložiště můžete smazat nebo zablokovat v nastavení prohlížeče. Pokud zablokujete nezbytné cookies, přihlášení a volba jazyka nemusí fungovat." },
    { h: "Kontakt", p: `Dotazy k cookies pište na ${CONTACT_EMAIL}.` },
  ],
};
const cookiesEn: LegalPage = {
  title: "Cookie policy",
  updated: "Last updated: November 2026",
  sections: [
    { h: "What cookies are", p: "Cookies are small text files that a website stores in your browser. Local storage (localStorage) works in a similar way and we use it the same way." },
    { h: "Essential cookies", p: "NEXT_LOCALE stores your chosen site language (valid for 1 year). A session cookie keeps you signed in. The site cannot run securely without them, so no consent is needed for them." },
    { h: "Local storage", p: "In your browser we store appearance settings (theme, font, colours, motion, spacing), your daily goal, best game results and the selected daily quiz template. This data stays on your device. You can clear it in your browser settings." },
    { h: "No analytics or advertising cookies", p: "The site does not use Google Analytics, ad networks or other tracking tools. We do not send cookies to third parties." },
    { h: "Managing cookies", p: "You can delete or block cookies and local storage in your browser settings. If you block essential cookies, sign-in and language choice may not work." },
    { h: "Contact", p: `Questions about cookies: ${CONTACT_EMAIL}.` },
  ],
};

export function getLegalPage(kind: "privacy" | "terms" | "cookies", locale: Locale): LegalPage {
  if (kind === "cookies") return locale === "cs" ? cookiesCs : cookiesEn;
  const cs = kind === "privacy" ? privacyCs : termsCs;
  return locale === "cs" ? cs : kind === "privacy" ? privacyEn : termsEn;
}
