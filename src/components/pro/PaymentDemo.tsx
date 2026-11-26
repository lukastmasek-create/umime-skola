"use client";

import { useId, useRef, useState } from "react";
import type { BuilderText } from "@/i18n/pro-builder";
import { checkoutPrice, type CheckoutPlan } from "@/lib/pro-checkout";
import { PRO_ITEMS } from "@/lib/pro-prices";

type Initial = { plan: CheckoutPlan; yearly: boolean; selected: string[] };
const TIERS = ["individual", "family", "school"] as const;

export function PaymentDemo({ t, cs, initial }: { t: BuilderText; cs: boolean; initial: Initial }) {
  const [selected, setSelected] = useState(initial.selected);
  const [yearly, setYearly] = useState(initial.yearly);
  const [plan, setPlan] = useState(initial.plan);
  const [finished, setFinished] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const dialogTitle = useId();
  const titleId = useId();
  const annual = plan === "school" || yearly;
  const price = checkoutPrice(plan, selected, annual);
  const customPrice = checkoutPrice("custom", selected, yearly);
  const canContinue = plan !== "custom" || selected.length > 0;
  const money = (n: number) => `${new Intl.NumberFormat(cs ? "cs-CZ" : "en-GB").format(n)} Kč`;
  const names = cs ? { individual: "Jednotlivec", family: "Rodina", school: "Škola", custom: "Vlastní výbava" } : { individual: "Individual", family: "Family", school: "School", custom: "Custom toolkit" };
  const subtitles = cs ? ["Pro jeden účet", "Až pro 5 členů rodiny", "Pro žáky vybrané školy"] : ["For one account", "For up to 5 family members", "For pupils of your school"];
  const perks = cs ? [
    ["AI doučovač", "Osobní plán učení", "Všechny PRO funkce"],
    ["Vše z individuálního PRO", "Správa členů rodiny", "Jeden společný tarif"],
    ["PRO pro žáky školy", "Přiřazení školy v účtu", "Školní tarif"],
  ] : [
    ["AI tutor", "Personal study plan", "All PRO features"],
    ["Everything in individual PRO", "Manage family members", "One shared plan"],
    ["PRO for school pupils", "School linked to your account", "School plan"],
  ];
  const openSummary = (nextPlan: CheckoutPlan) => {
    setPlan(nextPlan);
    setFinished(false);
    dialog.current?.showModal();
  };
  const toggleFeature = (id: string) => {
    setPlan("custom");
    setSelected(previous => previous.includes(id) ? previous.filter(item => item !== id) : [...previous, id]);
  };
  return <div className="ps-content">
    <header className="ps-intro">
      <div><p className="ps-eyebrow">UČÍMEPRO</p><h1 id={titleId}>{cs ? "Vyber si svůj další level." : "Choose your next level."}</h1>
        <p className="ps-subtitle">{cs ? "Kurzy zůstávají zdarma. PRO přidá nové superschopnosti." : "Courses stay free. PRO adds new superpowers."}</p></div>
      <div className="ps-disclaimer"><span className="ps-demo">{cs ? "DEMO · PŘIPRAVUJEME" : "DEMO · COMING SOON"}</span><p>{cs ? "Ceny jsou orientační. Zatím nelze nic koupit." : "Indicative prices. Purchases are not available yet."}</p></div>
    </header>

    <div className="ps-layout">
      <div className="ps-plans">
        <div className="ps-period" role="group" aria-label={cs ? "Období tarifu" : "Plan period"}>
          {[false, true].map(value => <button key={String(value)} type="button" aria-pressed={yearly === value} onClick={() => setYearly(value)}>{value ? t.yearly : t.monthly}{value && <span> · {cs ? "2 měsíce zdarma" : "2 months free"}</span>}</button>)}
        </div>
        <div className="ps-cards" aria-labelledby={titleId}>
          {TIERS.map((tier, index) => {
            const active = tier === plan;
            const showAnnual = tier === "school" || yearly;
            return <article className={`ps-frame ps-tier ps-tier-${tier} ${active ? "is-selected" : ""}`} key={tier}>
              <div className="ps-tier-inner">
                {active && <span className="ps-selected">{cs ? "VYBRÁNO" : "SELECTED"}</span>}
                <div aria-hidden="true" className={`ps-world ps-world-${tier}`} />
                <h2>{names[tier]}</h2><p className="ps-tier-subtitle">{subtitles[index]}</p>
                <div className="ps-tier-price"><p><strong>{money(checkoutPrice(tier, [], showAnnual))}</strong><span> / {showAnnual ? (cs ? "rok" : "year") : (cs ? "měsíc" : "month")}</span></p>
                  <small>{tier === "school" ? (cs ? "Pouze roční tarif" : "Annual plan only") : showAnnual ? `${cs ? "Ušetříš" : "Save"} ${money(checkoutPrice(tier, [], false) * 2)} / ${cs ? "rok" : "year"}` : `${money(checkoutPrice(tier, [], true))} / ${cs ? "rok" : "year"}`}</small>
                </div>
                <ul className="ps-perks">{perks[index].map(perk => <li key={perk}>{perk}</li>)}</ul>
                <button type="button" className={`ps-button ${active ? "ps-button-gold" : "ps-button-outline"}`} aria-pressed={active} onClick={() => active ? openSummary(tier) : setPlan(tier)}>{active ? (cs ? "Prohlédnout demo" : "Preview plan") : (cs ? "Vybrat tarif" : "Choose plan")}<span aria-hidden="true">{active ? " →" : ""}</span></button>
              </div>
            </article>;
          })}
        </div>
      </div>
      <aside className="ps-frame ps-summary" aria-label={cs ? "Tvůj výběr" : "Your selection"}>
        <div className="ps-summary-inner">
          <h2>{cs ? "Tvůj výběr" : "Your selection"}</h2><p className="ps-summary-label">{cs ? "UKÁZKA TARIFU" : "PLAN PREVIEW"}</p>
          <dl><div><dt>{cs ? "Tarif" : "Plan"}</dt><dd>{names[plan]}</dd></div>{plan === "family" && <div><dt>{cs ? "Členové" : "Members"}</dt><dd>{cs ? "až 5" : "up to 5"}</dd></div>}
            {plan === "custom" && <div><dt>{cs ? "Funkce" : "Features"}</dt><dd>{selected.length}</dd></div>}
            <div><dt>{cs ? "Období" : "Period"}</dt><dd>{annual ? t.yearly : t.monthly}</dd></div></dl>
          <div className="ps-total" aria-live="polite" aria-atomic="true"><p>{cs ? "Orientační cena" : "Indicative price"}</p><p><strong>{money(price)}</strong><span> / {annual ? (cs ? "rok" : "year") : (cs ? "měsíc" : "month")}</span></p></div>
          {plan === "custom" && !selected.length && <p className="ps-empty">{t.pick}</p>}
          <button type="button" disabled={!canContinue} className="ps-button ps-button-gold" onClick={() => openSummary(plan)}>{cs ? "Zobrazit souhrn" : "View summary"}<span aria-hidden="true"> →</span></button>
          <p className="ps-demo-note">{cs ? "Jen demo. Bez objednávky a platby." : "Demo only. No order or payment."}</p>
          <p className="ps-summary-help">{cs ? "Vše si můžeš vyzkoušet nanečisto." : "Explore every option with no commitment."}</p>
        </div>
      </aside>
    </div>

    <section className="ps-builder" aria-labelledby={`${titleId}-builder`}>
      <header><h2 id={`${titleId}-builder`}>{cs ? "Poskládej si vlastní PRO" : "Build your own PRO"}</h2><p>{cs ? "Vyber jen funkce, které využiješ." : "Choose only the features you need."}</p></header>
      <div className="ps-features">{PRO_ITEMS.map(item => <label className={`ps-feature ${selected.includes(item.id) ? "is-on" : ""}`} key={item.id}>
        <input type="checkbox" checked={selected.includes(item.id)} onChange={() => toggleFeature(item.id)} />
        <span><span className="ps-feature-title">{t.items[item.id].title}</span><span className="ps-feature-price">{money(item.price * (yearly ? 10 : 1))}<small> / {yearly ? (cs ? "rok" : "year") : (cs ? "měsíc" : "month")}</small></span></span>
      </label>)}</div>
      <div className="ps-builder-total"><p aria-live="polite" aria-atomic="true">{cs ? "Tvůj výběr:" : "Your toolkit:"} <strong>{money(customPrice)}</strong><span> / {yearly ? (cs ? "rok" : "year") : (cs ? "měsíc" : "month")}</span></p><small>{cs ? "Celé PRO nejvýše 200 Kč měsíčně. Ročně za cenu 10 měsíců." : "Full PRO capped at 200 Kč monthly. Annual price equals 10 months."}</small>
        <button type="button" className="ps-button ps-button-outline" disabled={!selected.length} onClick={() => openSummary("custom")}>{cs ? "Prohlédnout výbavu" : "Preview toolkit"}<span aria-hidden="true"> →</span></button></div>
    </section>
    <p className="ps-free">{cs ? "Kurzy, body, kolo štěstí a rodičovský panel zůstávají zdarma." : "Courses, points, the wheel of fortune and the parent panel stay free."}</p>

    <dialog ref={dialog} className="ps-dialog" aria-labelledby={dialogTitle} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      <div className="ps-dialog-inner"><button className="ps-dialog-close" type="button" aria-label={cs ? "Zavřít" : "Close"} onClick={() => dialog.current?.close()}>×</button>
        <span className="ps-demo">DEMO</span><h2 id={dialogTitle}>{finished ? (cs ? "Demo dokončeno" : "Demo complete") : (cs ? "Souhrn tvého výběru" : "Your plan summary")}</h2>
        <p className="ps-dialog-plan">{names[plan]}</p><p className="ps-dialog-price">{money(price)} <small>/ {annual ? (cs ? "rok" : "year") : (cs ? "měsíc" : "month")}</small></p>
        {plan === "custom" && <ul>{PRO_ITEMS.filter(item => selected.includes(item.id)).map(item => <li key={item.id}>{t.items[item.id].title}</li>)}</ul>}
        <p>{finished ? (cs ? "Žádná objednávka ani platba nevznikla. Tvůj účet zůstává beze změny." : "No order or payment was created. Your account is unchanged.") : (cs ? "Toto je pouze ukázka nabídky. Ceny jsou orientační a předplatné zatím nelze koupit." : "This is a preview. Prices are indicative and subscriptions cannot be purchased yet.")}</p>
        <button type="button" className="ps-button ps-button-gold" onClick={() => finished ? dialog.current?.close() : setFinished(true)}>{finished ? (cs ? "Zpět k tarifům" : "Back to plans") : (cs ? "Dokončit ukázku" : "Finish preview")}</button>
        {!finished && <button type="button" className="ps-edit" onClick={() => dialog.current?.close()}>{cs ? "Upravit výběr" : "Edit selection"}</button>}
      </div>
    </dialog>
  </div>;
}
