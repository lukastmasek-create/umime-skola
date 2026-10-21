// Hlavička s profilem zůstává při přepínání stránek, proto jí stránky po
// přihlášení nebo změně profilu touto událostí řeknou, ať data načte znovu.
export const ACCOUNT_CHANGED_EVENT = "umime:account-changed";

export function notifyAccountChanged() {
  window.dispatchEvent(new Event(ACCOUNT_CHANGED_EVENT));
}
