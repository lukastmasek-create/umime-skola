// Omezení pohybu: systémové „omezit pohyb“ nebo přepínač Animace v Nastavení (atribut data-motion="off" na <html>,
// nastavuje ho theme-init-script z localStorage).
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return document.documentElement.dataset.motion === "off" || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
