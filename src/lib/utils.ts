import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Spojí podmíněné třídy a sloučí konfliktní Tailwind utility (standard shadcn/ui).
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
