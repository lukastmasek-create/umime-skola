"use client";

import { useRef, useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { Home, User, Folder, Clock, FileText, LifeBuoy, Settings, Info, BadgeCheck, Search, Plus } from "lucide-react";
import { clsx } from "clsx";

const SIDE = [
  { label: "Přehled", icon: Home },
  { label: "Můj profil", icon: User },
  { label: "Projekty", icon: Folder },
  { label: "Naplánováno", icon: Clock },
];
const FOLDERS = [
  { label: "Všechny", n: 48 },
  { label: "Nedávné", n: 6 },
  { label: "Oblíbené", n: 4 },
  { label: "Sdílené", n: 22 },
  { label: "Archiv", n: 14 },
];
const TABS = ["Můj profil", "Zabezpečení", "Fakturace", "Oznámení", "Integrace", "Vzhled"];

// Šestimístný kód: po každé číslici se skočí na další pole, Backspace se vrací.
function CodeInput({ onComplete }: { onComplete?: (code: string) => void }) {
  const [digits, setDigits] = useState<string[]>(["8", "5", "2", "1", "", "0"]);
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const setAt = (i: number, v: string) => {
    const next = [...digits];
    next[i] = v;
    setDigits(next);
    if (v && i < 5) refs.current[i + 1]?.focus();
    if (next.every((d) => d !== "")) onComplete?.(next.join(""));
  };
  return (
    <div className="flex gap-1.5" role="group" aria-label="Ověřovací kód">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          inputMode="numeric"
          maxLength={1}
          value={d}
          aria-label={`Číslice ${i + 1}`}
          onChange={(e) => setAt(i, e.target.value.replace(/\D/g, "").slice(-1))}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
          }}
          className="h-10 w-9 rounded-lg border-2 border-[#3a3f4f] bg-[#11141c] text-center font-semibold text-white outline-none focus-visible:border-[#7c86ff]"
        />
      ))}
    </div>
  );
}

function Row({ label, hint, children, action }: { label: string; hint?: string; children: React.ReactNode; action?: string }) {
  return (
    <div className="grid gap-3 border-b border-[#262a36] py-4 sm:grid-cols-[1fr_1.4fr] sm:items-center">
      <div>
        <p className="text-sm font-semibold text-white">{label}</p>
        {hint && <p className="text-xs text-[#8a90a2]">{hint}</p>}
      </div>
      <div className="flex items-center justify-between gap-3 text-sm text-[#d6d9e2]">
        <div className="min-w-0">{children}</div>
        {action && (
          <button type="button" className="shrink-0 text-sm font-semibold text-[#8ea2ff] hover:underline">
            {action}
          </button>
        )}
      </div>
    </div>
  );
}

export function SettingsTab() {
  const [tab, setTab] = useState("Můj profil");
  const [verified, setVerified] = useState(false);
  return (
    <div className="overflow-hidden rounded-[20px] border border-[#262a36] bg-[#0c0f16] text-white">
      <div className="grid md:grid-cols-[220px_1fr]">
        {/* Boční menu */}
        <aside className="flex flex-col gap-5 border-b border-[#262a36] bg-[#11141c] p-4 md:border-b-0 md:border-r">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7c86ff] text-sm font-bold">U</span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">Untitled UI</p>
              <p className="truncate text-xs text-[#8a90a2]">hello@example.com</p>
            </div>
          </div>
          <nav className="flex flex-col gap-1 text-sm" aria-label="Boční navigace">
            {SIDE.map(({ label, icon: Icon }) => (
              <span key={label} className={clsx("flex items-center gap-2 rounded-lg px-2.5 py-2", label === "Můj profil" ? "bg-[#1d2130] text-white" : "text-[#a3a9b9]")}>
                <Icon aria-hidden className="h-4 w-4" /> {label}
              </span>
            ))}
          </nav>
          <div className="flex flex-col gap-1 text-sm">
            <p className="flex items-center gap-2 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-[#6b7285]">
              <Folder aria-hidden className="h-3.5 w-3.5" /> Složky
            </p>
            {FOLDERS.map((f) => (
              <span key={f.label} className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-[#a3a9b9]">
                {f.label}
                <span className="rounded bg-[#1d2130] px-1.5 text-xs">{f.n}</span>
              </span>
            ))}
          </div>
          <div className="mt-auto flex flex-col gap-1 text-sm text-[#a3a9b9]">
            <span className="flex items-center gap-2 px-2.5 py-1.5"><LifeBuoy aria-hidden className="h-4 w-4" /> Podpora</span>
            <span className="flex items-center gap-2 rounded-lg bg-[#1d2130] px-2.5 py-1.5 text-white"><Settings aria-hidden className="h-4 w-4" /> Nastavení</span>
          </div>
        </aside>

        {/* Obsah */}
        <section className="flex flex-col gap-5 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-bold">Nastavení</h3>
              <p className="text-sm text-[#8a90a2]">Spravuj své údaje a osobní nastavení.</p>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 rounded-lg border border-[#262a36] bg-[#11141c] px-3 py-1.5 text-sm text-[#8a90a2]">
                <Search aria-hidden className="h-3.5 w-3.5" />
                <input placeholder="Hledat" className="w-24 bg-transparent text-white outline-none placeholder:text-[#6b7285]" />
              </label>
              <button type="button" className="flex items-center gap-1 rounded-lg border border-[#262a36] px-3 py-1.5 text-sm font-semibold text-white">
                <Plus aria-hidden className="h-3.5 w-3.5" /> Pozvat
              </button>
            </div>
          </div>

          <Tabs.Root value={tab} onValueChange={setTab}>
            <Tabs.List className="flex flex-wrap gap-1 rounded-xl border border-[#262a36] bg-[#11141c] p-1 text-sm" aria-label="Sekce nastavení">
              {TABS.map((t) => (
                <Tabs.Trigger key={t} value={t} className="rounded-lg px-3 py-1.5 font-medium text-[#8a90a2] data-[state=active]:bg-[#1d2130] data-[state=active]:text-white">
                  {t}
                </Tabs.Trigger>
              ))}
            </Tabs.List>

            <Tabs.Content value="Můj profil" className="flex flex-col gap-5">
              {!verified && (
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#262a36] bg-[#11141c] p-4">
                  <div className="flex gap-3">
                    <Info aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-[#8ea2ff]" />
                    <div>
                      <p className="text-sm font-semibold">Potvrď svůj e-mail, aby se profil mohl zveřejnit</p>
                      <p className="text-xs text-[#8a90a2]">
                        Poslali jsme 6místný kód na hello@example.com. <span className="underline">Nedorazil e-mail?</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CodeInput onComplete={() => setVerified(true)} />
                    <button type="button" onClick={() => setVerified(true)} className="text-sm font-semibold text-[#8ea2ff]">
                      Ověřit e-mail
                    </button>
                  </div>
                </div>
              )}
              {verified && (
                <p className="flex items-center gap-2 rounded-xl border border-[#1f4d36] bg-[#0f2619] p-3 text-sm text-[#7ee2a8]">
                  <BadgeCheck aria-hidden className="h-4 w-4" /> E-mail je ověřený, profil můžeš zveřejnit.
                </p>
              )}

              <div className="flex flex-col">
                <h4 className="pb-1 text-sm font-bold">Můj profil</h4>
                <Row label="Adresa profilu" action="Upravit">
                  uui.com/ukazka
                </Row>
                <Row label="Fotografie" hint="Zobrazí se na tvém profilu." action="Nahrát">
                  <span className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#ff8a6b] to-[#7c86ff] text-xs font-bold text-white">AN</span>
                    <span className="text-[#8a90a2]">Smazat</span>
                  </span>
                </Row>
                <Row label="Celé jméno" hint="Zobrazí se na tvém profilu." action="Upravit">
                  Adéla Nováková
                </Row>
                <Row label="Kontaktní e-mail" hint="Přidej aspoň jeden." action="Upravit">
                  <span className="block">hello@example.com</span>
                  <span className="block text-[#8a90a2]">adela@example.org</span>
                </Row>
                <Row label="IČO" action="Spravovat">
                  <span className="inline-flex items-center gap-1.5">12 345 678 <BadgeCheck aria-hidden className="h-3.5 w-3.5 text-[#8ea2ff]" /></span>
                </Row>
                <Row label="Adresa" action="Upravit">
                  <span className="block">Vzorová 100</span>
                  <span className="block">110 00 Praha</span>
                  <span className="block">Česko</span>
                </Row>
              </div>
            </Tabs.Content>

            {TABS.filter((t) => t !== "Můj profil").map((t) => (
              <Tabs.Content key={t} value={t} className="rounded-xl border border-dashed border-[#262a36] p-6 text-center text-sm text-[#8a90a2]">
                <FileText aria-hidden className="mx-auto mb-2 h-5 w-5" />
                Sekce &bdquo;{t}&ldquo; je v ukázce jen jako ukázka rozložení.
              </Tabs.Content>
            ))}
          </Tabs.Root>
        </section>
      </div>
    </div>
  );
}
