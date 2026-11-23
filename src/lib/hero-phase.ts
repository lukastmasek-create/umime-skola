// Denní doba pro pixelové pozadí hero (HeroPixel). Hodina se bere z prohlížeče;
// `?hero=night|dawn|day|dusk` v URL ji přepíše (na zkoušení).
export type HeroPhase = "night" | "dawn" | "day" | "dusk";

export function heroPhase(hour: number, override?: string | null): HeroPhase {
  if (override === "night" || override === "dawn" || override === "day" || override === "dusk") return override;
  if (hour >= 21 || hour < 5) return "night";
  if (hour < 8) return "dawn";
  if (hour < 17) return "day";
  return "dusk";
}

// Skript hned za pozadím nastaví data-time ještě před prvním vykreslením (žádné probliknutí).
export const HERO_PHASE_SCRIPT = `(function(){try{var s=document.currentScript,e=s&&s.previousElementSibling;if(!e)return;var q=new URLSearchParams(location.search).get("hero");var h=new Date().getHours();var p=/^(night|dawn|day|dusk)$/.test(q||"")?q:(h>=21||h<5?"night":h<8?"dawn":h<17?"day":"dusk");e.setAttribute("data-time",p)}catch(_){}})();`;
