// Sdílený zdroj pravdy pro kolo štěstí — pořadí a barvy segmentů musí
// odpovídat mezi klientem (vykreslení kola) a serverem (výběr výhry), aby se
// animace kola vždycky zastavila na výhře, kterou API skutečně přiznalo.
// Barvy jsou vypálené v public/rewards/kolo-disk.webp (políčka po směru hodin
// od horního okraje). Při změně barev nebo počtu políček je potřeba disk
// znovu vyrenderovat v Blenderu (umime-art/scripts/wheel.py); částky lze
// měnit volně, kreslí je web.

export type WheelPrize = {
  amount: number;
  weight: number;
  color: string;
};

export const WHEEL_PRIZES: WheelPrize[] = [
  { amount: 5, weight: 30, color: "#3248f0" },
  { amount: 10, weight: 25, color: "#ff5a3c" },
  { amount: 15, weight: 18, color: "#ffc933" },
  { amount: 20, weight: 12, color: "#17a864" },
  { amount: 10, weight: 25, color: "#29a3ff" },
  { amount: 50, weight: 4, color: "#ff5a3c" },
  { amount: 15, weight: 18, color: "#3248f0" },
  { amount: 100, weight: 1, color: "#ffc933" },
];

export const WHEEL_SPIN_COOLDOWN_MS = 24 * 60 * 60 * 1000;

export function pickWheelPrizeIndex(): number {
  const totalWeight = WHEEL_PRIZES.reduce((sum, p) => sum + p.weight, 0);
  let roll = Math.random() * totalWeight;
  for (let i = 0; i < WHEEL_PRIZES.length; i++) {
    roll -= WHEEL_PRIZES[i].weight;
    if (roll <= 0) return i;
  }
  return WHEEL_PRIZES.length - 1;
}
