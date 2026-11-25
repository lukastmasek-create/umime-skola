// Shared with the existing PRO builder. Annual billing costs ten monthly payments.
export const PRO_ITEMS = [
  { id: "tutor", icon: "doucovatel", price: 80 },
  { id: "plan", icon: "plan", price: 30 },
  { id: "photo", icon: "fotka", price: 50 },
  { id: "notes", icon: "poznamky", price: 25 },
  { id: "offline", icon: "offline", price: 15 },
] as const;
export function proPrice(selected: readonly string[], yearly: boolean) {
  const monthly = Math.min(200, PRO_ITEMS.filter(i => selected.includes(i.id)).reduce((sum, i) => sum + i.price, 0));
  return monthly * (yearly ? 10 : 1);
}
