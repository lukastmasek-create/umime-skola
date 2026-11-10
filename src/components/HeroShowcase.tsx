"use client";

import { useEffect, useState } from "react";
import { useAccount } from "@/lib/use-account";
import type { HomeHeroText } from "@/i18n/home-hero";

// Plovoucí karty kolem hero textu na úvodní stránce: postup, bezpečí, předměty,
// tok „hry → Umíme školu → třída“ a žebříček třídy. Je to ukázka, proto aria-hidden.
// Úroveň, série a třída jsou pro přihlášeného skutečné (/api/profil, /api/denni-vyzvy, /api/tymy).
type Subject = { slug: string; label: string; emoji: string; color: string };

const GAME_CHIPS = [
  { key: "farm", emoji: "🌾" },
  { key: "town", emoji: "🏙️" },
  { key: "escape", emoji: "🔐" },
  { key: "pets", emoji: "🐾" },
] as const;

const BOARD = [
  { avatar: "astronaut", name: "A. K.", pct: 100 },
  { avatar: "fox", name: "T. N.", pct: 80 },
  { avatar: "owl", name: "E. P.", pct: 60 },
];

const portrait = (slug: string) => `/avatars-3d/${slug}-portret.webp`;

type LiveTeam = { id: string; name: string; role: string; members: number; open: number };

const tpl = (s: string, n: number) => s.replace("{n}", String(n));

export function HeroShowcase({ t, subjects }: { t: HomeHeroText; subjects: Subject[] }) {
  const [account] = useAccount();
  const loggedIn = !!account && account.loggedIn;
  const [streak, setStreak] = useState<number | null>(null);
  const [team, setTeam] = useState<LiveTeam | null>(null);
  const [students, setStudents] = useState<{ name: string; points: number }[]>([]);

  useEffect(() => {
    if (!loggedIn) {
      setStreak(null);
      setTeam(null);
      setStudents([]);
      return;
    }
    let cancelled = false;
    fetch("/api/denni-vyzvy")
      .then((r) => r.json())
      .then((d) => { if (!cancelled && typeof d?.streak?.current === "number") setStreak(d.streak.current); })
      .catch(() => {});
    fetch("/api/tymy")
      .then((r) => r.json())
      .then((d) => {
        const teams: LiveTeam[] | undefined = d?.teams;
        const first = teams?.[0] ?? null;
        if (!cancelled) setTeam(first);
        // Jména žáků vidí jen učitel (přehled třídy je jen pro něj).
        if (first?.role === "TEACHER") {
          return fetch(`/api/tymy/${first.id}/prehled`)
            .then((r) => r.json())
            .then((p) => {
              const list = (p?.students ?? []).map((x: { name: string | null; points?: number }) => ({ name: x.name ?? "?", points: x.points ?? 0 }));
              list.sort((a: { points: number }, b: { points: number }) => b.points - a.points);
              if (!cancelled) setStudents(list);
            });
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [loggedIn]);

  const level = account && account.loggedIn ? account : null;
  const streakLabel = !loggedIn ? t.streak.replace("{n}", "12") : streak === null ? t.streak.replace("{n}", "…") : streak > 0 ? tpl(t.streak, streak) : t.streakNone;
  // Bez skutečné třídy (host, nebo přihlášený bez týmu) zůstává ukázková karta.
  const demoClass = !team;
  const top = students.reduce((m, x) => Math.max(m, x.points), 0);

  return (
    <div className="hs-stage" aria-hidden="true">
      <svg className="hs-guides" viewBox="0 0 1000 600" preserveAspectRatio="none">
        <path d="M70 0 V250 Q70 330 0 330" />
        <path d="M930 0 V250 Q930 330 1000 330" />
        <path d="M500 330 V600" />
      </svg>

      <div className="hs-card hs-progress space-float">
        <div className="hs-row">
          <span className="hs-level">{level ? level.level : 7}</span>
          <div className="hs-grow">
            <div className="hs-label">{t.progressTitle}</div>
            <div className="hs-bar"><span style={{ width: `${level ? level.percent : 68}%` }} /></div>
          </div>
        </div>
        <div className="hs-row hs-streak">
          <span>🔥</span>
          <span className="hs-label">{streakLabel}</span>
        </div>
      </div>

      <div className="hs-card hs-safe space-float" style={{ animationDelay: "-2s" }}>
        <div className="hs-label hs-safe-head">
          <span className="hs-shield">✓</span> {t.safeTitle}
        </div>
        <div className="hs-safe-orb">
          <span>🛡️</span>
        </div>
        <div className="hs-label hs-center">{t.safeText}</div>
      </div>

      <div className="hs-flow">
        <div className="hs-card hs-subjects">
          <div className="hs-label hs-head">{t.subjectsTitle}</div>
          <div className="hs-subject-grid">
            {subjects.slice(0, 9).map((s, i) => (
              <div
                key={s.slug}
                className="hs-tile"
                data-active={i === 1 || i === 5 ? "true" : undefined}
                style={{ ["--c" as string]: s.color }}
              >
                <span className="hs-tile-emoji">{s.emoji}</span>
                <span className="hs-tile-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="hs-pipe">
          <div className="hs-chips">
            {GAME_CHIPS.map((g) => (
              <span key={g.key} className="hs-chip" title={t.games[g.key]}>
                {g.emoji}
              </span>
            ))}
          </div>
          <svg className="hs-wires" viewBox="0 0 100 200" preserveAspectRatio="none">
            <path d="M0 24 C60 24 40 100 100 100" />
            <path d="M0 78 C60 78 40 100 100 100" />
            <path d="M0 132 C60 132 40 100 100 100" />
            <path d="M0 186 C60 186 40 100 100 100" />
          </svg>
          <span className="hs-pill">
            <span className="hs-pill-dot" /> {t.flowStart}
          </span>
          <span className="hs-out" />
        </div>

        <div className="hs-card hs-class">
          <div className="hs-teacher">
            <img src={portrait("wizard")} alt="" width={44} height={44} className="hs-avatar hs-avatar-lg" />
            <div>
              <div className="hs-label">{team ? team.name : t.classTitle}</div>
              <div className="hs-sub">{team ? (team.role === "TEACHER" ? t.teacher : t.student) : t.teacher}</div>
            </div>
          </div>
          {demoClass ? (
            <ul className="hs-board">
              {BOARD.map((r, i) => (
                <li key={r.name}>
                  <span className="hs-rank">{i + 1}</span>
                  <img src={portrait(r.avatar)} alt="" width={28} height={28} className="hs-avatar" />
                  <span className="hs-name">{r.name}</span>
                  <span className="hs-meter"><span style={{ width: `${r.pct}%` }} /></span>
                  <span className="hs-pct">{r.pct * 12} {t.points}</span>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="hs-board">
              <li><span className="hs-name" style={{ width: "auto" }}>{tpl(t.members, team.members)}</span></li>
              {students.slice(0, 3).map((st, i) => (
                <li key={`${st.name}-${i}`}>
                  <span className="hs-rank">{i + 1}</span>
                  <img src={portrait(BOARD[i % BOARD.length].avatar)} alt="" width={28} height={28} className="hs-avatar" />
                  <span className="hs-name" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{st.name}</span>
                  <span className="hs-meter"><span style={{ width: `${top > 0 ? Math.round((st.points / top) * 100) : 0}%` }} /></span>
                  <span className="hs-pct">{st.points} {t.points}</span>
                </li>
              ))}
              {students.length > 3 && (
                <li><span className="hs-sub">+{students.length - 3}</span></li>
              )}
              {team.role !== "TEACHER" && (
                <li><span className="hs-name" style={{ width: "auto" }}>{team.open > 0 ? tpl(t.openTasks, team.open) : t.noTasks}</span></li>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
