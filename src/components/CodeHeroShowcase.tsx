import { Icon } from "@/components/Icon";
import { SketchIcon } from "@/components/SketchIcons";
import { EXERCISES } from "@/lib/code-exercises";

// Plovoucí karty kolem hero textu na stránce Kód: postup, bezpečí, soubory,
// tok „HTML + CSS + JS → živý náhled“ a malý náhled stránky. Stejné rozložení jako na úvodní stránce
// (třídy hs-*), jen s obsahem o kódu. Je to ukázka, proto aria-hidden.
const FILES = [
  { name: "index.html", color: "#ff8a6b" },
  { name: "style.css", color: "#8fd0ff" },
  { name: "script.js", color: "#ffc933" },
];
const CHIPS = [
  { label: "HTML", color: "#ff8a6b" },
  { label: "CSS", color: "#8fd0ff" },
  { label: "JS", color: "#ffc933" },
];

export function CodeHeroShowcase() {
  return (
    <div className="hs-stage" aria-hidden="true">
      <svg className="hs-guides" viewBox="0 0 1000 600" preserveAspectRatio="none">
        <path d="M70 0 V250 Q70 330 0 330" />
        <path d="M930 0 V250 Q930 330 1000 330" />
        <path d="M500 330 V600" />
      </svg>

      <div className="hs-card hs-progress space-float sk-tilt-l">
        <div className="hs-row">
          <span className="hs-level">
            <Icon name="hero-odznak" size={52} />
            <b>{EXERCISES.length}</b>
          </span>
          <div className="hs-grow">
            <div className="hs-label">Cvičení čeká</div>
            <div className="hs-bar"><span style={{ width: "34%" }} /></div>
          </div>
        </div>
        <div className="hs-row hs-streak">
          <SketchIcon kind="bolt" size={22} />
          <span className="hs-label">Nápověda i řešení</span>
        </div>
      </div>

      <div className="hs-card hs-safe space-float sk-tilt-r" style={{ animationDelay: "-2s" }}>
        <div className="hs-label hs-safe-head">
          <span className="hs-shield">✓</span> Bez instalace
        </div>
        <div className="hs-safe-orb">
          <Icon name="hero-stit" size={84} />
        </div>
        <div className="hs-label hs-center">Vše běží v prohlížeči</div>
      </div>

      <div className="hs-flow">
        <div className="hs-card sk-tilt-l">
          <div className="hs-label hs-head">Tvoje soubory</div>
          <ul className="cs-files">
            {FILES.map((f) => (
              <li key={f.name}>
                <SketchIcon kind="code" size={16} />
                <code>{f.name}</code>
              </li>
            ))}
          </ul>
        </div>

        <div className="hs-pipe">
          <div className="hs-chips">
            {CHIPS.map((c) => (
              <span key={c.label} className="cs-chip" style={{ background: c.color }}>
                {c.label}
              </span>
            ))}
          </div>
          <svg className="hs-wires" viewBox="0 0 100 200" preserveAspectRatio="none">
            <path d="M0 44 C60 44 40 100 100 100" />
            <path d="M0 100 C60 100 40 100 100 100" />
            <path d="M0 156 C60 156 40 100 100 100" />
          </svg>
          <span className="hs-pill">
            <SketchIcon kind="play" size={16} /> Živý náhled
          </span>
          <span className="hs-out" />
        </div>

        <div className="hs-card sk-tilt-r">
          <div className="hs-label hs-head">Výsledek</div>
          <div className="cs-mini">
            <span className="cs-mini-h">Učíme se hrou</span>
            <span className="cs-mini-p" />
            <span className="cs-mini-p cs-mini-p2" />
            <span className="cs-mini-btn">Klikni</span>
          </div>
          <div className="hs-row cs-ai">
            <SketchIcon kind="chat" size={18} />
            <span className="hs-label">AI pomocník ti poradí</span>
          </div>
        </div>
      </div>
    </div>
  );
}
