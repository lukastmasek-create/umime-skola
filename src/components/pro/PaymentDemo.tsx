"use client";

import { useRef, useState } from "react";
import { ProIcon } from "@/components/pro/ProIcon";
import type { BuilderText } from "@/i18n/pro-builder";
import { CHECKOUT_PLANS, checkoutPrice, type CheckoutPlan } from "@/lib/pro-checkout";
import { PRO_ITEMS } from "@/lib/pro-prices";

export function PaymentDemo({ t, cs, initial }: { t: BuilderText; cs: boolean; initial: { plan: CheckoutPlan; yearly: boolean; selected: string[] } }) {
  const [selected, setSelected] = useState<string[]>(initial.selected);
  const [yearly, setYearly] = useState(initial.yearly);
  const [step, setStep] = useState<"select" | "checkout" | "done">("select");
  const heading = useRef<HTMLHeadingElement>(null);
  const [plan, setPlan] = useState<CheckoutPlan>(initial.plan);
  const price = checkoutPrice(plan, selected, yearly);
  const names = cs ? { custom: "Vlastní výbava", individual: "Jednotlivec", family: "Rodina", school: "Škola" } : { custom: "Custom toolkit", individual: "Individual", family: "Family", school: "School" };
  const planNote = plan === "family" ? (cs ? "Kompletní PRO pro až 5 členů rodiny." : "Complete PRO for up to 5 family members.") : plan === "school" ? (cs ? "Školní tarif · 12 000 Kč za rok. Platba pouze ročně." : "School plan · 12,000 Kč per year. Annual billing only.") : (cs ? "Všechny funkce individuálního PRO." : "All individual PRO features.");
  const canContinue = plan !== "custom" || selected.length > 0;
  const money = (n: number) => `${new Intl.NumberFormat(cs ? "cs-CZ" : "en-GB").format(n)} Kč`;
  const next = (s: typeof step) => { setStep(s); requestAnimationFrame(() => heading.current?.focus()); };
  return <div>
    <p className="card mb-6 px-5 py-4 text-sm"><strong>{cs ? "Jen zkouška nanečisto." : "Practice only."}</strong> {cs ? "Nic se nestrhne, předplatné se neaktivuje. Nezadávej žádné platební údaje." : "No charge or subscription activation. Do not enter any payment details."}</p>
    {step === "select" && <div role="group" aria-label={cs ? "Tarif" : "Plan"} className="mb-6 flex flex-wrap gap-3">{CHECKOUT_PLANS.map(p => <button type="button" key={p} aria-pressed={plan === p} className={`btn-bouncy btn-lg ${plan === p ? "btn-primary" : "btn-secondary"}`} onClick={() => { setPlan(p); if (p === "school") setYearly(true); }}>{names[p]}</button>)}</div>}
    <ol className="mb-6 flex flex-wrap gap-3 text-sm font-bold" aria-label={cs ? "Průběh objednávky" : "Order progress"}>
      {[cs ? "Výběr funkcí" : "Features", cs ? "Souhrn a platba" : "Review and payment", cs ? "Hotovo" : "Done"].map((label, i) => <li key={label} aria-current={i === ["select", "checkout", "done"].indexOf(step) ? "step" : undefined} className={`rounded-full border-2 px-4 py-2 ${i === ["select", "checkout", "done"].indexOf(step) ? "border-[var(--accent-green)] bg-[var(--surface)]" : "border-[var(--edge)]"}`}>{i + 1}. {label}</li>)}
    </ol>
    <h2 ref={heading} tabIndex={-1} className="mb-5 text-2xl font-bold">{step === "select" ? t.title : step === "checkout" ? (cs ? "Zkontroluj svůj výběr" : "Review your selection") : (cs ? "Demo platba proběhla!" : "Demo payment complete!")}</h2>
    {step === "done" ? <section className="card px-7 py-10 text-center" role="status">
      <ProIcon name="check" className="mx-auto mb-4 size-12 text-[var(--accent-green)]" />
      <p className="text-xl font-bold">{money(price)} · {yearly ? t.perYear : t.perMonth}</p>
      <p className="mx-auto mb-6 mt-3 max-w-lg text-[var(--muted)]">{cs ? "Vyzkoušel sis celý nákup. Žádná platba ani objednávka nevznikla a tvůj účet zůstává beze změny." : "You tried the full purchase flow. No payment or order was created and your account is unchanged."}</p>
      <button type="button" onClick={() => next("select")} className="btn-bouncy btn-secondary btn-lg">{cs ? "Vyzkoušet znovu" : "Try again"}</button>
    </section> : <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <section className="card p-5 sm:p-7">
        {step === "select" ? <>
          {plan !== "custom" ? <div><h3 className="text-xl font-bold">{names[plan]}</h3><p className="mt-3 text-[var(--muted)]">{planNote}</p></div> : <>
          <p className="mb-5 text-sm text-[var(--muted)]">{t.hint}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {PRO_ITEMS.map(item => {
              const active = selected.includes(item.id);
              return <button type="button" key={item.id} aria-pressed={active} onClick={() => setSelected(prev => active ? prev.filter(id => id !== item.id) : [...prev, item.id])} className={`pro-pick rounded-[22px] border-2 p-5 text-left ${active ? "is-on" : ""}`}>
                <span className="flex items-center justify-between gap-3"><ProIcon name={item.icon} className="size-8 text-[var(--brand-600)]" /><span className="text-sm font-bold">{active ? "✓ " : "+ "}{money(item.price)}</span></span>
                <span className="mt-3 block font-bold">{t.items[item.id].title}</span>
                <span className="mt-1 block text-sm text-[var(--muted)]">{t.items[item.id].text}</span>
              </button>;
            })}
          </div>
          <button type="button" className="mt-5 text-sm font-bold underline" onClick={() => setSelected(PRO_ITEMS.map(i => i.id))}>{cs ? "Vybrat všechny funkce" : "Select all features"}</button></>}
        </> : <>
          <h3 className="font-bold">{cs ? "Demo platební metoda" : "Demo payment method"}</h3>
          <div className="my-5 rounded-2xl border-2 border-[var(--brand-500)] bg-[var(--surface)] p-5"><span className="font-bold">{cs ? "Testovací karta" : "Test card"} ···· 4242</span><p className="mt-2 text-sm text-[var(--muted)]">{cs ? "Připravená simulace. Číslo karty ani osobní údaje nejsou potřeba." : "Ready-made simulation. No card number or personal details needed."}</p></div>
          <p className="text-sm text-[var(--muted)]">{t.note}</p>
          <button type="button" className="mt-6 font-bold underline" onClick={() => next("select")}>← {cs ? "Upravit výběr" : "Edit selection"}</button>
        </>}
      </section>
      <aside className="card p-6 lg:sticky lg:top-24">
        <h3 className="text-lg font-bold">{names[plan]}</h3>
        <div role="group" aria-label={cs ? "Fakturační období" : "Billing period"} className="my-5 flex rounded-full border-2 border-[var(--edge)] p-1">{(plan === "school" ? [true] : [false, true]).map(y => <button key={String(y)} type="button" aria-pressed={yearly === y} onClick={() => setYearly(y)} className={`flex-1 rounded-full px-3 py-2 text-sm font-bold ${yearly === y ? "bg-[var(--brand-500)] text-white" : ""}`}>{y ? t.yearly : t.monthly}</button>)}</div>
        <ul className="space-y-3 text-sm">{PRO_ITEMS.filter(i => plan === "custom" ? selected.includes(i.id) : true).map(i => <li key={i.id} className="flex justify-between gap-3"><span>{t.items[i.id].title}</span>{plan === "custom" && <span className="shrink-0 font-bold">{money(i.price * (yearly ? 10 : 1))}</span>}</li>)}</ul>
        {!canContinue && <p className="text-sm">{t.pick}</p>}
        <div className="my-5 border-t border-[var(--edge)] pt-5" aria-live="polite" aria-atomic="true"><p className="text-sm text-[var(--muted)]">{t.total}</p><p className="mt-1 text-4xl font-extrabold tabular-nums">{money(price)}</p><p className="text-sm text-[var(--muted)]">{yearly ? t.perYear : t.perMonth}</p>{yearly && price > 0 && plan !== "school" && <p className="mt-2 text-sm font-bold text-[var(--accent-green)]">{cs ? "2 měsíce zdarma · ušetříš " : "2 months free · save "}{money(checkoutPrice(plan, selected, false) * 2)}</p>}</div>
        <button type="button" disabled={!canContinue} onClick={() => next(step === "select" ? "checkout" : "done")} className="btn-bouncy btn-primary btn-lg w-full disabled:cursor-not-allowed disabled:opacity-40">{step === "select" ? (cs ? "Pokračovat k platbě →" : "Continue to payment →") : (cs ? "Simulovat platbu" : "Simulate payment")}</button>
        <p className="mt-3 text-center text-xs text-[var(--muted)]">{cs ? "DEMO · Žádné skutečné platby" : "DEMO · No real payments"}</p>
      </aside>
    </div>}
  </div>;
}
