export const DANGER_PER_MISTAKE = 15;
export const DANGER_PER_MISTAKE_RELAXED = 8;

export function computeStars({
  seconds,
  mistakes,
  hints,
  relaxed,
  limitSeconds,
}: {
  seconds: number;
  mistakes: number;
  hints: number;
  relaxed: boolean;
  limitSeconds: number;
}): number {
  let stars = 3;
  if (hints > 2) stars -= 1;
  if (mistakes > 3) stars -= 1;
  if (!relaxed && seconds > limitSeconds * 0.7) stars -= 1;
  if (relaxed) stars = Math.min(stars, 2);
  return Math.max(1, stars);
}
