import { PRO_ITEMS, proPrice } from "./pro-prices";

export const CHECKOUT_PLANS = ["custom", "individual", "family", "school"] as const;
export type CheckoutPlan = typeof CHECKOUT_PLANS[number];
export function checkoutPrice(plan: CheckoutPlan, selected: readonly string[], yearly: boolean) {
  if (plan === "school") return 12000;
  if (plan === "family") return yearly ? 4000 : 400;
  if (plan === "individual") return yearly ? 2000 : 200;
  return proPrice(selected, yearly);
}
export function checkoutSelection(params: { plan?: string | string[]; billing?: string | string[]; features?: string | string[] }) {
  const features = Array.isArray(params.features) ? params.features[0] : params.features;
  const plan: CheckoutPlan = CHECKOUT_PLANS.find(p => p === params.plan) ?? "custom";
  const selected = features === undefined ? ["tutor"] : PRO_ITEMS.filter(i => features.split(",").includes(i.id)).map(i => i.id);
  return { plan, yearly: plan === "school" || params.billing === "yearly", selected };
}
