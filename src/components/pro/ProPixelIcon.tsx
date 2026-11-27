import Image from "next/image";

export function ProPixelIcon({ name }: { name: string }) {
  return <Image className="pro-pixel-icon" src={`/home/pro-icons/${name}.webp`} width={48} height={48} alt="" unoptimized />;
}
