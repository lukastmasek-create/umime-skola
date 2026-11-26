import type { ChestOutcome } from "@/lib/live/types";

function ChestBase() {
  return (
    <>
      <ellipse cx="65" cy="88" rx="48" ry="5" fill="#170f23" opacity=".5" />
      <path d="M16 48 40 35 108 38 86 53Z" fill="#311a29" stroke="#241727" strokeWidth="3" strokeLinejoin="round" />
      <path d="M16 48 86 53 86 83 21 78 16 73Z" fill="#a6543c" stroke="#241727" strokeWidth="3" strokeLinejoin="round" />
      <path d="M86 53 108 38 108 67 86 83Z" fill="#71394a" stroke="#241727" strokeWidth="3" strokeLinejoin="round" />
      <path d="M21 63 83 68M89 67 104 56" stroke="#402034" strokeWidth="2" opacity=".65" />
      <path d="M20 51 29 52V77L22 76 20 72ZM74 54 83 55V80L74 79Z" fill="#ffcf68" />
      <path d="M90 54 96 50V73L90 78ZM101 46 106 42V66L101 70Z" fill="#c58543" />
      <path d="M45 56 60 57 62 61 62 69 58 73 46 72 43 68V60Z" fill="#ffd77b" stroke="#482336" strokeWidth="2" />
      <path d="M52 60 55 62 53 65V68H50V65L48 63Z" fill="#583044" />
    </>
  );
}

export function ChestClosed({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 124 100" className={className} aria-hidden focusable="false">
      <ChestBase />
      <path d="M16 48V39L24 27 36 22 95 24 106 31 108 38 86 53Z" fill="#be6542" stroke="#241727" strokeWidth="3" strokeLinejoin="round" />
      <path d="M24 27 36 22 95 24 84 28 73 38 20 37Z" fill="#ed9360" />
      <path d="M20 39 28 28 36 23 45 23 35 29 29 40V49L20 48ZM73 39 81 29 91 24 100 26 90 32 83 41V52L73 51Z" fill="#ffcf68" />
      <path d="M86 43 95 34 106 31 108 38 86 53Z" fill="#814050" />
      <path d="M28 36 33 30M77 37 83 30" stroke="#fff0ae" strokeWidth="2" />
    </svg>
  );
}

const loot = {
  gold: <><path d="M34 46 40 35 59 36 65 46 59 52 38 51Z" fill="#f3a63c" /><path d="M51 39 57 29 78 30 83 39 77 44 56 43Z" fill="#ffd66d" /><path d="M66 22 69 16 72 22 79 25 72 28 69 34 66 28 60 25Z" fill="#fff3bc" /></>,
  steal: <><path d="M45 44 48 36 58 30 51 23 70 23 65 30 76 36 81 45 75 51 50 50Z" fill="#ad82ec" /><path d="M58 31 66 31M61 37 66 43 61 47 56 42Z" fill="none" stroke="#f5d784" strokeWidth="2.5" /></>,
  lose: <><path d="M38 47 49 41 57 29 65 40 84 37 74 46 77 50 55 52Z" fill="#f17e67" /><path d="M58 16 65 25 60 28 52 21ZM75 27 83 21 88 26 80 31Z" fill="#ffd166" /></>,
};

export function ChestOpen({ kind, className }: { kind: ChestOutcome["kind"]; className?: string }) {
  return (
    <svg viewBox="0 0 124 100" className={className} aria-hidden focusable="false">
      <path d="M40 35 41 21 49 11 99 15 108 25V38Z" fill="#944959" stroke="#241727" strokeWidth="3" strokeLinejoin="round" />
      <path d="M44 22 50 15 99 19 105 26V32L44 29Z" fill="#ed9360" />
      <path d="M49 17 53 15 59 16 52 24V33H46V24ZM89 18 96 19 91 27V36H84V27Z" fill="#ffcf68" />
      <ChestBase />
      {loot[kind]}
    </svg>
  );
}
