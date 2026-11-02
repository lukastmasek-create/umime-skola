// Sdílený zdroj pravdy pro kolo štěstí — pořadí a barvy segmentů musí
// odpovídat mezi klientem (vykreslení kola) a serverem (výběr výhry), aby se
// animace kola vždycky zastavila na výhře, kterou API skutečně přiznalo.
// Barvy jsou vypálené v public/rewards/kolo-disk.webp (políčka po směru hodin
// od horního okraje). Při změně barev nebo počtu políček je potřeba disk
// znovu vykreslit (python3 tools/wheel-disk.py, pole COLORS musí odpovídat tomuhle poli); částky lze
// měnit volně, kreslí je web.

// Políčko může místo bodů dát věc z obchodu (avatar nebo titul). Kdo ji už vlastní,
// dostane místo ní `amount` bodů, takže výhra nikdy nepropadne.
export type WheelItemPrize = { kind: "avatar" | "title" | "frame" | "banner"; ref: string; name: string; icon: string };

export type WheelPrize = {
  amount: number;
  item?: WheelItemPrize;
  weight: number;
  color: string;
};

export const WHEEL_PRIZES: WheelPrize[] = [
  { amount: 5, weight: 30, color: "#3248f0" },
  { amount: 10, weight: 25, color: "#ff5a3c" },
  { amount: 15, weight: 16, color: "#ffc933" },
  { amount: 20, weight: 10, color: "#17a864" },
  { amount: 10, weight: 25, color: "#29a3ff" },
  { amount: 50, weight: 4, color: "#9b5cf0", item: { kind: "title", ref: "dreamer", name: "Titul Snílek", icon: "🏅" } },
  { amount: 15, weight: 16, color: "#3248f0" },
  { amount: 20, weight: 4, color: "#ff5a3c", item: { kind: "frame", ref: "leaf", name: "Listový rámeček", icon: "🖼️" } },
  { amount: 25, weight: 8, color: "#ffc933" },
  { amount: 15, weight: 4, color: "#17a864", item: { kind: "banner", ref: "sunset", name: "Banner Západ slunce", icon: "🌅" } },
  { amount: 50, weight: 3, color: "#29a3ff" },
  { amount: 100, weight: 2, color: "#9b5cf0", item: { kind: "avatar", ref: "fairy", name: "Avatar Víla", icon: "🧚" } },
];

export const WHEEL_SPIN_COOLDOWN_MS = 24 * 60 * 60 * 1000;

// Další točení navíc za body (po využití bezplatného denního točení).
export const WHEEL_EXTRA_PRICE = 40;
export const WHEEL_EXTRA_PER_DAY = 5;
export const WHEEL_EXTRA_REASON = "Kolo štěstí: extra točení";

export function pickWheelPrizeIndex(): number {
  const totalWeight = WHEEL_PRIZES.reduce((sum, p) => sum + p.weight, 0);
  let roll = Math.random() * totalWeight;
  for (let i = 0; i < WHEEL_PRIZES.length; i++) {
    roll -= WHEEL_PRIZES[i].weight;
    if (roll <= 0) return i;
  }
  return WHEEL_PRIZES.length - 1;
}
