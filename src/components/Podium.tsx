import Image from "next/image";
import { Avatar } from "@/components/Avatar";
import { RewardImage } from "@/components/RewardImage";
import { getAvatarStills } from "@/lib/avatars3d";
import { PODIUM_SPOTS } from "@/lib/rewards";

// Avatary s 3D postavou stojí na stupni celé, ostatní jako kulatá profilovka.
function PodiumFigure({ avatar, first }: { avatar: string | null; first: boolean }) {
  const figure = getAvatarStills(avatar)?.figure;
  if (!figure) return <Avatar id={avatar} size={first ? 60 : 52} />;
  const height = first ? 104 : 90;
  return (
    <Image
      src={figure.src}
      alt=""
      width={Math.round((figure.width / figure.height) * height)}
      height={height}
      unoptimized
      className="block"
    />
  );
}

type PodiumPlayer = { id: string; name: string | null; avatar: string | null };

// Podium z Blenderu s avatary nejlepších tří hráčů postavenými na stupně.
export function Podium({
  players,
  anonymous,
  highlightId,
}: {
  players: PodiumPlayer[];
  anonymous: string;
  highlightId?: string;
}) {
  return (
    // Horní třetina obrázku je průhledná (místo pro avatary) a spodní čtvrtina také,
    // proto záporné okraje.
    <div className="relative mx-auto -mb-10 -mt-4 w-full max-w-md sm:-mb-16 sm:-mt-12">
      <RewardImage name="podium" size={448} preload className="h-auto w-full" />
      {players.slice(0, 3).map((player, i) => (
        <div
          key={player.id}
          className="absolute flex -translate-x-1/2 -translate-y-full flex-col items-center gap-1"
          style={{ left: `${PODIUM_SPOTS[i].left * 100}%`, top: `${PODIUM_SPOTS[i].top * 100}%` }}
        >
          <span
            className={`pill max-w-[7rem] truncate px-2 py-0.5 text-xs ${
              player.id === highlightId
                ? "bg-[var(--brand-500)] text-white"
                : "bg-[var(--surface)] text-[var(--foreground)]"
            }`}
          >
            {player.name || anonymous}
          </span>
          <PodiumFigure avatar={player.avatar} first={i === 0} />
        </div>
      ))}
    </div>
  );
}
