import { HeroPixel } from "@/components/HeroPixel";
import { PaymentDemo } from "@/components/pro/PaymentDemo";
import { getBuilderText } from "@/i18n/pro-builder";
import type { Locale } from "@/i18n/config";
import type { CheckoutPlan } from "@/lib/pro-checkout";
import "./pro-storefront.css";

export function ProStorefront({ locale, initial }: { locale: Locale; initial?: { plan: CheckoutPlan; yearly: boolean; selected: string[] } }) {
  return <section className="pro-storefront" id="tarify" aria-label={locale === "cs" ? "Tarify UčímePRO" : "UčímePRO plans"}>
    <div className="ps-landscape" aria-hidden="true"><HeroPixel /></div>
    <PaymentDemo t={getBuilderText(locale)} cs={locale === "cs"} initial={initial ?? { plan: "family", yearly: false, selected: ["tutor"] }} />
  </section>;
}
