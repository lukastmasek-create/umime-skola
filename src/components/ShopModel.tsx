import { Icon } from "@/components/Icon";

// Ikona věci z obchodu (kategorie, surovina, budova). Dřív tu byly animované 3D rendery, teď jsou to hravé SVG.
export function ShopModel({ id, size = 64, className = "" }: { id: string; size?: number; className?: string }) {
  return <Icon name={id} size={size} className={className} />;
}
