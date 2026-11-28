"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import type { BuilderText } from "@/i18n/pro-builder";
import { checkoutPrice, type CheckoutPlan } from "@/lib/pro-checkout";
import { PRO_ITEMS } from "@/lib/pro-prices";
import { ProPixelIcon } from "@/components/pro/ProPixelIcon";

type Initial = { plan: CheckoutPlan; yearly: boolean; selected: string[] };
const TIERS = ["individual", "family", "school"] as const;

export function PaymentDemo({ t, cs, initial }: { t: BuilderText; cs: boolean; initial: Initial }) {
  const [selected, setSelected] = useState(initial.selected);
  const [yearly, setYearly] = useState(initial.yearly);
  const [plan, setPlan] = useState(initial.plan);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [finished, setFinished] = useState(false);
  const checkoutTitle = useRef<HTMLHeadingElement>(null);
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
  const billingPeriod = (tier: typeof TIERS[number]) => tier === "school" || yearly ? t.yearly : t.monthly;
  const comparison = [
    { label: cs ? "Pro koho" : "Who it’s for", values: subtitles },
    { label: cs ? "Období" : "Billing period", values: TIERS.map(billingPeriod) },
    { label: cs ? "Orientační cena" : "Indicative price", values: TIERS.map(tier => money(checkoutPrice(tier, [], tier === "school" || yearly))) },
    { label: cs ? "Hlavní výhody" : "Highlights", values: perks.map(list => list.join(" · ")) },
  ];

  const openCheckout = (nextPlan: CheckoutPlan) => {
    setPlan(nextPlan);
    setFinished(false);
    setCheckoutOpen(true);
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
                <button type="button" className={`ps-button ${active ? "ps-button-gold" : "ps-button-outline"}`} aria-pressed={active} onClick={() => active ? openCheckout(tier) : setPlan(tier)}>{active ? (cs ? "Zkusit demo" : "Try demo") : (cs ? "Vybrat tarif" : "Choose plan")}<span aria-hidden="true">{active ? " →" : ""}</span></button>
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
          <div className="ps-total" aria-live="polite" aria-atomic="true"><p>{cs ? "Orientační cena" : "Indicative price"}</p><p><strong key={price} className="refresh-price">{money(price)}</strong><span> / {annual ? (cs ? "rok" : "year") : (cs ? "měsíc" : "month")}</span></p></div>
          {plan === "custom" && !selected.length && <p className="ps-empty">{t.pick}</p>}
          <button type="button" disabled={!canContinue} className="ps-button ps-button-gold" onClick={() => openCheckout(plan)}>{cs ? "Vyzkoušet platbu" : "Try a demo payment"}<span aria-hidden="true"> →</span></button>
          <p className="ps-demo-note">{cs ? "Simulace s testovací kartou." : "Simulation with a test card."}</p>
          <p className="ps-summary-help">{cs ? "Vše si můžeš vyzkoušet nanečisto." : "Explore every option with no commitment."}</p>
        </div>
      </aside>
    </div>

    <details className="refresh-pro-compare ps-frame">
      <summary>{cs ? "Porovnat tarify" : "Compare plans"} <span aria-hidden>+</span></summary>
      <div className="refresh-pro-table" role="region" aria-label={cs ? "Porovnání tarifů" : "Plan comparison"} tabIndex={0}>
        <table>
          <thead><tr><td />{TIERS.map(tier => <th key={tier} scope="col" data-selected={tier === plan}>{names[tier]}</th>)}</tr></thead>
          <tbody>{comparison.map(row => <tr key={row.label}>
            <th scope="row">{row.label}</th>
            {row.values.map((value, index) => <td key={TIERS[index]} data-selected={TIERS[index] === plan}>{value}</td>)}
          </tr>)}</tbody>
        </table>
      </div>
    </details>

    <section className="ps-builder" aria-labelledby={`${titleId}-builder`}>
      <header><h2 id={`${titleId}-builder`}>{cs ? "Poskládej si vlastní PRO" : "Build your own PRO"}</h2><p>{cs ? "Vyber jen funkce, které využiješ." : "Choose only the features you need."}</p></header>
      <div className="ps-features">{PRO_ITEMS.map(item => <label className={`ps-feature ${selected.includes(item.id) ? "is-on" : ""}`} key={item.id}>
        <input type="checkbox" checked={selected.includes(item.id)} onChange={() => toggleFeature(item.id)} />
        <span><ProPixelIcon name={item.icon} /><span className="ps-feature-title">{t.items[item.id].title}</span><span className="ps-feature-price">{money(item.price * (yearly ? 10 : 1))}<small> / {yearly ? (cs ? "rok" : "year") : (cs ? "měsíc" : "month")}</small></span></span>
      </label>)}</div>
      <div className="ps-builder-total"><p aria-live="polite" aria-atomic="true">{cs ? "Tvůj výběr:" : "Your toolkit:"} <strong>{money(customPrice)}</strong><span> / {yearly ? (cs ? "rok" : "year") : (cs ? "měsíc" : "month")}</span></p><small>{cs ? "Celé PRO nejvýše 200 Kč měsíčně. Ročně za cenu 10 měsíců." : "Full PRO capped at 200 Kč monthly. Annual price equals 10 months."}</small>
        <button type="button" className="ps-button ps-button-outline" disabled={!selected.length} onClick={() => openCheckout("custom")}>{cs ? "Vyzkoušet platbu" : "Try a demo payment"}<span aria-hidden="true"> →</span></button></div>
    </section>
    <p className="ps-free">{cs ? "Kurzy, body, kolo štěstí a rodičovský panel zůstávají zdarma." : "Courses, points, the wheel of fortune and the parent panel stay free."}</p>

    <dialog
      ref={dialog}
      className="ps-dialog"
      aria-labelledby={dialogTitle}
      onClose={() => setCheckoutOpen(false)}
      onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}
    >
      <div className="ps-dialog-inner">
        <header className="ps-checkout-header">
          <span className="ps-demo">{cs ? "PLATEBNÍ DEMO" : "PAYMENT DEMO"}</span>
          <button className="ps-dialog-close" type="button" aria-label={cs ? "Zavřít" : "Close"} onClick={() => dialog.current?.close()}>×</button>
        </header>
        <h2 id={dialogTitle} ref={checkoutTitle} tabIndex={-1}>
          {finished ? (cs ? "Zkušební platba proběhla" : "Demo payment complete") : (cs ? "Zkušební platba kartou" : "Demo card payment")}
        </h2>
        <div className="ps-checkout-layout">
          <div className="ps-checkout-summary">
            <p className="ps-checkout-caption">{cs ? "Souhrn tarifu" : "Plan summary"}</p>
            <p className="ps-dialog-plan">{names[plan]}</p>
            {plan === "custom" && <ul>{PRO_ITEMS.filter(item => selected.includes(item.id)).map(item => <li key={item.id}>{t.items[item.id].title}</li>)}</ul>}
            <p className="ps-dialog-price">{money(price)}</p>
            <p className="ps-checkout-caption">{annual ? t.perYear : t.perMonth} · {cs ? "orientační cena" : "indicative price"}</p>
          </div>
          {finished ? (
            <div className="ps-checkout-result">
              <span className="ps-checkout-check" aria-hidden="true">✓</span>
              <p>{cs ? "Simulace byla úspěšná. Nic se nestrhlo a předplatné se neaktivovalo." : "The simulation succeeded. No charge was made and no subscription was activated."}</p>
              <button type="button" className="ps-button ps-button-gold" onClick={() => dialog.current?.close()}>{cs ? "Zpět k tarifům" : "Back to plans"}</button>
            </div>
          ) : checkoutOpen && (
            <DemoCardForm cs={cs} onSuccess={() => {
              setFinished(true);
              requestAnimationFrame(() => checkoutTitle.current?.focus());
            }} />
          )}
        </div>
      </div>
    </dialog>
  </div>;
}

const DEMO_CARDS = { success: "4242 4242 4242 4242", decline: "4000 0000 0000 0002" };
const EMPTY_CARD = { holder: "", number: "", expiry: "", cvc: "" };

function DemoCardForm({ cs, onSuccess }: { cs: boolean; onSuccess: () => void }) {
  const [card, setCard] = useState(EMPTY_CARD);
  const [error, setError] = useState<"number" | "decline" | null>(null);
  const cardNumber = useRef<HTMLInputElement>(null);
  const hintId = useId();
  const errorId = useId();

  function fillCard(scenario: keyof typeof DEMO_CARDS) {
    setCard({ holder: "Demo Student", number: DEMO_CARDS[scenario], expiry: "12/39", cvc: "123" });
    setError(null);
  }

  function updateCard(field: keyof typeof EMPTY_CARD, value: string) {
    setCard(previous => ({ ...previous, [field]: value }));
    if (field === "number") setError(null);
  }

  function simulatePayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (card.number === DEMO_CARDS.success) {
      onSuccess();
    } else if (card.number === DEMO_CARDS.decline) {
      setError("decline");
    } else {
      setCard(previous => ({ ...previous, number: "", cvc: "" }));
      setError("number");
      cardNumber.current?.focus();
    }
  }

  return (
    <form className="ps-checkout-form" method="dialog" autoComplete="off" onSubmit={simulatePayment}>
      <p className="ps-checkout-hint" id={hintId}>{cs ? "Použij jen testovací kartu. Údaje se nikam neposílají ani neukládají." : "Use test cards only. Card details are never sent or saved."}</p>
      <div className="ps-checkout-samples">
        <button type="button" onClick={() => fillCard("success")}>{cs ? "Vyplnit testovací kartu" : "Fill test card"}</button>
        <button type="button" onClick={() => fillCard("decline")}>{cs ? "Použít kartu pro zamítnutí" : "Use a decline test card"}</button>
      </div>
      <label>
        {cs ? "Jméno na kartě" : "Name on card"}
        <input value={card.holder} onChange={event => updateCard("holder", event.target.value)} placeholder="Demo Student" required pattern=".*\S.*" maxLength={60} />
      </label>
      <label>
        {cs ? "Číslo karty" : "Card number"}
        <input
          ref={cardNumber}
          inputMode="numeric"
          value={card.number}
          onChange={event => updateCard("number", event.target.value.replace(/\D/g, "").slice(0, 16).match(/.{1,4}/g)?.join(" ") ?? "")}
          placeholder={DEMO_CARDS.success}
          aria-describedby={error === "number" ? `${hintId} ${errorId}` : hintId}
          aria-invalid={error === "number"}
          required
          minLength={19}
          maxLength={19}
          pattern="[0-9]{4}( [0-9]{4}){3}"
        />
      </label>
      <div className="ps-checkout-fields">
        <label>
          {cs ? "Platnost (MM/RR)" : "Expiry (MM/YY)"}
          <input inputMode="numeric" value={card.expiry} onChange={event => updateCard("expiry", event.target.value.replace(/\D/g, "").slice(0, 4).replace(/^(\d{2})(\d)/, "$1/$2"))} placeholder="12/39" pattern="(0[1-9]|1[0-2])/[0-9]{2}" required maxLength={5} />
        </label>
        <label>
          CVC
          <input inputMode="numeric" value={card.cvc} onChange={event => updateCard("cvc", event.target.value.replace(/\D/g, "").slice(0, 3))} placeholder="123" pattern="[0-9]{3}" required maxLength={3} />
        </label>
      </div>
      {error && <p className="ps-checkout-error" id={errorId} role="alert">
        {error === "decline"
          ? (cs ? "Zkušební platba byla zamítnuta. Pro úspěšný pokus vyplň běžnou testovací kartu." : "The demo payment was declined. Fill the standard test card to try a successful payment.")
          : (cs ? "Demo přijímá pouze testovací čísla. Použij tlačítko pro vyplnění testovací karty." : "This demo only accepts test numbers. Use the test-card button to fill the form.")}
      </p>}
      <button type="submit" className="ps-button ps-button-gold">{cs ? "Simulovat platbu" : "Simulate payment"}</button>
    </form>
  );
}
