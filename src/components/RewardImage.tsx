import Image from "next/image";
import { rewardSrc } from "@/lib/rewards";

// Odměny jsou předem zmenšené WebP a animace optimalizací stejně neprojdou, proto unoptimized.
export function RewardImage({
  name,
  size,
  alt = "",
  className,
  preload,
}: {
  name: string;
  size: number;
  alt?: string;
  className?: string;
  preload?: boolean;
}) {
  return (
    <Image
      src={rewardSrc(name)}
      alt={alt}
      width={size}
      height={size}
      unoptimized
      preload={preload}
      aria-hidden={alt ? undefined : true}
      className={className}
    />
  );
}
