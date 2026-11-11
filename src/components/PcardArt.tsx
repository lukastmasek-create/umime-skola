import { PcardScene } from "./PcardScenes";

// Výzdoba karet kategorií na homepage. Záměrně střídmá, jako ruční tisk: plochá karta,
// ilustrace s nerovným vystřiženým okrajem (PcardScenes), kolem ikony ručně kroužená čára
// a lepicí páska. Žádná záře, třpytky ani skleněné efekty.

export function PcardArt({ slug }: { slug: string }) {
  return <PcardScene slug={slug} />;
}

// Kolem ikony dvakrát přejetá tužka, nedokonalý kruh.
export function PcardRing() {
  return (
    <svg className="pcard-ring" viewBox="0 0 140 140" aria-hidden focusable="false">
      <path d="M16 72C12 34 42 10 74 11C110 12 132 40 128 74C124 108 92 131 60 127C30 123 12 100 15 68" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M22 50C34 24 68 8 104 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity=".7" />
    </svg>
  );
}

// Lepicí páska nahoře na kartě: nakloněná karta vypadá jako přilepená na nástěnce.
export function PcardTape() {
  return (
    <svg className="pcard-tape" viewBox="0 0 96 28" aria-hidden focusable="false">
      <polygon
        points="4,0 92,0 95,3.5 92,7 95,10.5 92,14 95,17.5 92,21 95,24.5 92,28 4,28 1,24.5 4,21 1,17.5 4,14 1,10.5 4,7 1,3.5"
        fill="currentColor" fillOpacity=".78"
      />
      <path d="M10 9h76M10 15h58" stroke="#fff" strokeOpacity=".28" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
