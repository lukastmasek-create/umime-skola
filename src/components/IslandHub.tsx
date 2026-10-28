import Link from "next/link";

// „Co tu najdeš“: čtyři létající ostrovy (umime-art/blender/namesti.py). Na každém běží animovaná
// diorama (pás 24 snímků, jen CSS), ostrov se vznáší a po najetí se zvedne a zrychlí. Celé je odkaz.

export type IslandFeature = { key: "courses" | "games" | "escape" | "boards"; title: string; text: string; cta: string; href: string; color: string };

const SPRITE = { courses: "skola", games: "herna", escape: "vez", boards: "sin" } as const;

export function IslandHub({ features }: { features: IslandFeature[] }) {
  // Světelné dráhy mezi středy ostrovů (jen na širokém displeji): základní linka + běžící puls.
  const X = [125, 375, 625, 875];
  const Y = [150, 205, 150, 205];
  const paths = X.slice(0, -1).map((x, i) => `M${x},${Y[i]} C${x + 130},${Y[i]} ${X[i + 1] - 130},${Y[i + 1]} ${X[i + 1]},${Y[i + 1]}`);
  return (
    <div className="isle-net relative">
      <svg aria-hidden viewBox="0 0 1000 420" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block">
        {paths.map((d, i) => (
          <g key={i} className={`isle-seg s${i}`}>
            <path d={d} className="isle-path" />
            <path d={d} className="isle-pulse" style={{ animationDelay: `${-i * 1.1}s` }} />
            <circle cx={X[i]} cy={Y[i]} r="5" className="isle-node" />
            <circle cx={X[i + 1]} cy={Y[i + 1]} r="5" className="isle-node" />
          </g>
        ))}
      </svg>
    <ol className="relative z-10 grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:grid-cols-4">
      {features.map((f, i) => (
        <li key={f.key} className={i % 2 ? "lg:mt-14" : ""}>
          <Link href={f.href} className="isle group block rounded-3xl text-center outline-none" style={{ ["--c" as string]: f.color }}>
            <div className="isle-bob relative mx-auto w-full max-w-[300px]" style={{ animationDelay: `${-i * 1.3}s` }}>
              <div className="isle-lift relative aspect-square w-full">
                <span aria-hidden className="isle-glow absolute inset-x-[18%] bottom-[2%] h-[14%] rounded-[50%]" />
                <span aria-hidden className="isle-scan absolute inset-x-[22%] bottom-[0%] h-[12%] rounded-[50%]" />
                <span
                  aria-hidden
                  className="globe-sprite absolute inset-0 block origin-[50%_40%] scale-[1.28] drop-shadow-[0_14px_14px_rgba(5,6,30,0.5)]"
                  style={{ backgroundImage: `url(/home/namesti/${SPRITE[f.key]}.webp)`, animationDelay: `${-i * 0.37}s` }}
                />
              </div>
            </div>
            <span className="relative mt-12 block font-mono text-[11px] tracking-[0.35em] text-[#35d0ff]/85">0{i + 1}</span>
            <h3 className="relative mt-1 text-lg font-bold text-white sm:text-xl" style={{ fontFamily: "var(--font-heading)" }}>
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
    </div>
  );
}
