import Link from "next/link";

// „Co tu najdeš“: čtyři létající ostrovy (umime-art/blender/namesti.py). Na každém běží animovaná
// diorama (pás 24 snímků, jen CSS), ostrov se vznáší a po najetí se zvedne a zrychlí. Celé je odkaz.

export type IslandFeature = { key: "courses" | "games" | "escape" | "boards"; title: string; text: string; cta: string; href: string; color: string };

const SPRITE = { courses: "skola", games: "herna", escape: "vez", boards: "sin" } as const;

export function IslandHub({ features }: { features: IslandFeature[] }) {
  return (
    <ol className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:grid-cols-4">
      {features.map((f, i) => (
        <li key={f.key} className={i % 2 ? "lg:mt-14" : ""}>
          <Link href={f.href} className="isle group block rounded-3xl text-center outline-none" style={{ ["--c" as string]: f.color }}>
            <div className="isle-bob relative mx-auto w-full max-w-[300px]" style={{ animationDelay: `${-i * 1.3}s` }}>
              <div className="isle-lift relative aspect-square w-full">
                <span aria-hidden className="isle-glow absolute inset-x-[18%] bottom-[2%] h-[14%] rounded-[50%]" />
                <span
                  aria-hidden
                  className="globe-sprite absolute inset-0 block origin-[50%_40%] scale-[1.28] drop-shadow-[0_14px_14px_rgba(5,6,30,0.5)]"
                  style={{ backgroundImage: `url(/home/namesti/${SPRITE[f.key]}.webp)`, animationDelay: `${-i * 0.37}s` }}
                />
              </div>
            </div>
            <h3 className="relative mt-14 text-lg font-bold text-white sm:text-xl" style={{ fontFamily: "var(--font-heading)" }}>
              {f.title}
            </h3>
            <p className="mx-auto mt-1 max-w-[16rem] text-sm text-white/75">{f.text}</p>
            <span className="isle-cta mt-3 inline-flex items-center gap-1 rounded-full px-4 py-1.5 text-sm font-bold text-[#16132b]" style={{ background: f.color }}>
              {f.cta} <span aria-hidden>→</span>
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
