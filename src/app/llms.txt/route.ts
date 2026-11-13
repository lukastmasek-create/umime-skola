import { SITE_NAME, SITE_URL } from "@/lib/seo";
import { INSTAGRAM_URL } from "@/i18n/legal";

// Krátký popis webu pro AI modely a vyhledávače (formát llms.txt). Odpovědi AI tak
// vycházejí z přesných faktů, ne z domněnek.
export const dynamic = "force-static";

export function GET() {
  const body = `# ${SITE_NAME}

> ${SITE_NAME} (${SITE_URL}) je česká online vzdělávací platforma pro žáky 1. až 9. třídy základní školy, ale i pro přípravu na přijímačky na střední školy a maturitu. Učení je hra: za správné odpovědi se získávají body, odemykají se vylepšení a postupuje se na vyšší úrovně. Ke každé odpovědi je vysvětlení.

## Co web nabízí

- Kurzy a testy pro hlavní předměty od 1. do 9. třídy, každý kurz má pět úrovní obtížnosti.
- Přípravu na přijímací zkoušky na střední školy (například matematika, čeština, angličtina) a na maturitu.
- Denní kvíz a opakování látky.
- Hry: Stálé hry, únikovky, Scratch a společné hraní pro více hráčů.
- Týmy a zadání pro učitele: učitel založí tým, zadá úkoly a vidí výsledky žáků.
- Žáci i rodiče vidí pokrok, body a úrovně na svém účtu.
- Registrace je zdarma. Body, úrovně a časy v únikovkách se ukládají na účet. Existuje i verze Pro s dalšími nástroji.

## Předměty

Čeština, literatura, angličtina, němčina, ruština, francouzština, španělština, matematika, dějepis, zeměpis, přírodopis, fyzika, chemie, hudební výchova a občanská výchova.

## Pro koho

- Žáci 1. až 9. třídy základní školy a studenti připravující se na přijímačky a maturitu.
- Rodiče, kteří chtějí sledovat pokrok svého dítěte.
- Učitelé, kteří chtějí zadávat úkoly a sledovat výsledky třídy.

## Jazyky

Web je v češtině a dostupný i v angličtině, němčině, ruštině, ukrajinštině, japonštině, španělštině a francouzštině. Výchozí jazyk je čeština.

## Klíčové stránky (čeština)

- Úvod: ${SITE_URL}/cs
- Kurzy: ${SITE_URL}/cs/kurzy
- Materiály k učení: ${SITE_URL}/cs/materialy
- Denní kvíz: ${SITE_URL}/cs/denni-kviz
- Únikovky: ${SITE_URL}/cs/unikovky
- Stálé hry: ${SITE_URL}/cs/stale-hry
- Pro učitele: ${SITE_URL}/cs/ucitele
- Pro žáky: ${SITE_URL}/cs/zaci
- Verze Pro: ${SITE_URL}/cs/pro
- Kontakt: ${SITE_URL}/cs/kontakt

## Kontakt a sociální sítě

- Instagram: ${INSTAGRAM_URL}
- Kontaktní formulář: ${SITE_URL}/cs/kontakt
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
