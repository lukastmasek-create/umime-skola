import { tr8, type Locale } from "./config";

export const CONTACT_EMAIL = "ucime.se.hrou@seznam.cz";
export const INSTAGRAM_HANDLE = "ucime.se.hrou";
export const INSTAGRAM_URL = `https://www.instagram.com/${INSTAGRAM_HANDLE}/`;

const privacyLabel = tr8("Ochrana soukromí", "Privacy policy", "Datenschutz", "Конфиденциальность");
const termsLabel = tr8("Podmínky", "Terms", "Nutzungsbedingungen", "Условия");

export function getFooterLinks(locale: Locale) {
  return { privacy: privacyLabel[locale], terms: termsLabel[locale] };
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

export function getLegalPage(kind: "privacy" | "terms", locale: Locale): LegalPage {
  const cs = kind === "privacy" ? privacyCs : termsCs;
  return locale === "cs" ? cs : kind === "privacy" ? privacyEn : termsEn;
}
