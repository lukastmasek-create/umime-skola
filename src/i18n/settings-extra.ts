import type { Locale } from "./config";

// Texty nových částí Nastavení: animace, účet (e-mail, heslo) a rodičovská kontrola.
export type SettingsExtraText = {
  motion: string;
  motionOn: string;
  motionOff: string;
  motionHint: string;
  account: string;
  email: string;
  newEmail: string;
  currentPassword: string;
  newPassword: string;
  saveEmail: string;
  savePassword: string;
  setPassword: string;
  saved: string;
  errors: Record<string, string>;
  parental: string;
  parentalHint: string;
  pin: string;
  newPin: string;
  minutes: string;
  noLimit: string;
  blockShop: string;
  blockTogether: string;
  enable: string;
  save: string;
  disable: string;
  unlock: string;
  locked: string;
  timeUp: string;
  timeUpHint: string;
  blockedTogether: string;
  loginFirst: string;
};

const cs: SettingsExtraText = {
  motion: "Animace",
  motionOn: "Zapnuté",
  motionOff: "Vypnuté",
  motionHint: "Vypnutím se zastaví pohyb na stránkách a ve 3D scénách (hodí se pro slabší počítače a citlivé oči).",
  account: "Účet",
  email: "E-mail",
  newEmail: "Nový e-mail",
  currentPassword: "Současné heslo",
  newPassword: "Nové heslo (aspoň 8 znaků)",
  saveEmail: "Změnit e-mail",
  savePassword: "Změnit heslo",
  setPassword: "Nastavit heslo",
  saved: "Uloženo ✓",
  errors: { wrong: "Heslo nesouhlasí.", weak: "Heslo musí mít aspoň 8 znaků.", taken: "Tento e-mail už používá jiný účet.", "bad-email": "Neplatný e-mail.", "wrong-pin": "Špatný PIN.", "bad-pin": "PIN musí mít 4 až 8 číslic.", "need-pin": "Nejdřív zvol PIN.", x: "Něco se nepovedlo, zkus to znovu." },
  parental: "Rodičovská kontrola",
  parentalHint: "Rodič může nastavit PIN, denní limit času na webu a zakázat nákupy a společné hraní. Změny jdou udělat jen s PINem.",
  pin: "PIN rodiče",
  newPin: "Nový PIN (4–8 číslic)",
  minutes: "Denní limit (minuty)",
  noLimit: "0 = bez limitu",
  blockShop: "Zakázat nákupy v obchodech",
  blockTogether: "Zakázat společné hraní s ostatními",
  enable: "Zapnout rodičovskou kontrolu",
  save: "Uložit nastavení",
  disable: "Vypnout rodičovskou kontrolu",
  unlock: "Odemknout",
  locked: "Nastavení je zamčené PINem.",
  timeUp: "Dnešní čas vypršel",
  timeUpHint: "Pro dnešek je hotovo, zítra zase! Rodič může čas prodloužit zadáním PINu.",
  blockedTogether: "Společné hraní zakázal rodič v nastavení.",
  loginFirst: "Pro tato nastavení se přihlas.",
};
const en: SettingsExtraText = {
  motion: "Animations",
  motionOn: "On",
  motionOff: "Off",
  motionHint: "Turning them off stops motion on pages and in 3D scenes (good for slower computers and sensitive eyes).",
  account: "Account",
  email: "E-mail",
  newEmail: "New e-mail",
  currentPassword: "Current password",
  newPassword: "New password (at least 8 characters)",
  saveEmail: "Change e-mail",
  savePassword: "Change password",
  setPassword: "Set password",
  saved: "Saved ✓",
  errors: { wrong: "The password doesn't match.", weak: "The password needs at least 8 characters.", taken: "Another account already uses this e-mail.", "bad-email": "Invalid e-mail.", "wrong-pin": "Wrong PIN.", "bad-pin": "The PIN must have 4–8 digits.", "need-pin": "Choose a PIN first.", x: "Something went wrong, try again." },
  parental: "Parental controls",
  parentalHint: "A parent can set a PIN, a daily time limit and block purchases and playing together. Changes require the PIN.",
  pin: "Parent PIN",
  newPin: "New PIN (4–8 digits)",
  minutes: "Daily limit (minutes)",
  noLimit: "0 = no limit",
  blockShop: "Block shop purchases",
  blockTogether: "Block playing together with others",
  enable: "Turn on parental controls",
  save: "Save settings",
  disable: "Turn off parental controls",
  unlock: "Unlock",
  locked: "Settings are locked with a PIN.",
  timeUp: "Time's up for today",
  timeUpHint: "That's it for today, see you tomorrow! A parent can extend the time with the PIN.",
  blockedTogether: "A parent has blocked playing together in settings.",
  loginFirst: "Log in to use these settings.",
};
const de: SettingsExtraText = {
  motion: "Animationen",
  motionOn: "An",
  motionOff: "Aus",
  motionHint: "Ausgeschaltet stoppt die Bewegung auf Seiten und in 3D-Szenen (gut für langsamere Computer und empfindliche Augen).",
  account: "Konto",
  email: "E-Mail",
  newEmail: "Neue E-Mail",
  currentPassword: "Aktuelles Passwort",
  newPassword: "Neues Passwort (mindestens 8 Zeichen)",
  saveEmail: "E-Mail ändern",
  savePassword: "Passwort ändern",
  setPassword: "Passwort festlegen",
  saved: "Gespeichert ✓",
  errors: { wrong: "Das Passwort stimmt nicht.", weak: "Das Passwort braucht mindestens 8 Zeichen.", taken: "Diese E-Mail nutzt schon ein anderes Konto.", "bad-email": "Ungültige E-Mail.", "wrong-pin": "Falsche PIN.", "bad-pin": "Die PIN muss 4–8 Ziffern haben.", "need-pin": "Wähle zuerst eine PIN.", x: "Etwas ist schiefgegangen, versuch es nochmal." },
  parental: "Elternkontrolle",
  parentalHint: "Eltern können eine PIN, ein tägliches Zeitlimit festlegen und Käufe sowie gemeinsames Spielen sperren. Änderungen nur mit PIN.",
  pin: "Eltern-PIN",
  newPin: "Neue PIN (4–8 Ziffern)",
  minutes: "Tageslimit (Minuten)",
  noLimit: "0 = kein Limit",
  blockShop: "Käufe in Shops sperren",
  blockTogether: "Gemeinsames Spielen sperren",
  enable: "Elternkontrolle einschalten",
  save: "Einstellungen speichern",
  disable: "Elternkontrolle ausschalten",
  unlock: "Entsperren",
  locked: "Die Einstellungen sind mit PIN gesperrt.",
  timeUp: "Die Zeit für heute ist um",
  timeUpHint: "Für heute ist Schluss, bis morgen! Eltern können die Zeit mit der PIN verlängern.",
  blockedTogether: "Gemeinsames Spielen wurde von den Eltern gesperrt.",
  loginFirst: "Melde dich für diese Einstellungen an.",
};
const ru: SettingsExtraText = {
  motion: "Анимации",
  motionOn: "Вкл.",
  motionOff: "Выкл.",
  motionHint: "Если выключить, движение на страницах и в 3D-сценах остановится (удобно для слабых компьютеров и чувствительных глаз).",
  account: "Аккаунт",
  email: "E-mail",
  newEmail: "Новый e-mail",
  currentPassword: "Текущий пароль",
  newPassword: "Новый пароль (не меньше 8 символов)",
  saveEmail: "Изменить e-mail",
  savePassword: "Изменить пароль",
  setPassword: "Задать пароль",
  saved: "Сохранено ✓",
  errors: { wrong: "Пароль не совпадает.", weak: "Пароль должен быть не короче 8 символов.", taken: "Этот e-mail уже используется другим аккаунтом.", "bad-email": "Неверный e-mail.", "wrong-pin": "Неверный PIN.", "bad-pin": "PIN должен состоять из 4–8 цифр.", "need-pin": "Сначала выбери PIN.", x: "Что-то пошло не так, попробуй ещё раз." },
  parental: "Родительский контроль",
  parentalHint: "Родитель может задать PIN, дневной лимит времени на сайте и запретить покупки и совместную игру. Изменения только с PIN.",
  pin: "PIN родителя",
  newPin: "Новый PIN (4–8 цифр)",
  minutes: "Дневной лимит (минуты)",
  noLimit: "0 = без лимита",
  blockShop: "Запретить покупки в магазинах",
  blockTogether: "Запретить совместную игру",
  enable: "Включить родительский контроль",
  save: "Сохранить",
  disable: "Выключить родительский контроль",
  unlock: "Разблокировать",
  locked: "Настройки защищены PIN-кодом.",
  timeUp: "Время на сегодня закончилось",
  timeUpHint: "На сегодня всё, до завтра! Родитель может продлить время PIN-кодом.",
  blockedTogether: "Совместная игра запрещена родителем в настройках.",
  loginFirst: "Войди, чтобы пользоваться этими настройками.",
};
const texts: Record<Locale, SettingsExtraText> = { cs, en, de, ru };
export const getSettingsExtraText = (locale: Locale) => texts[locale];
