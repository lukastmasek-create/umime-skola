# Archiv

Sem patří stránky vyřazené z webu. Složka není v `src/app`, takže se nesmí routovat, a je vyloučená z `tsconfig.json`.
Obnovení: přesuň složku zpět do `src/app/[locale]/` a vrať odkazy.

- `app/mestecko/` — 3D městečko (`/mestecko`), přesměrování `/mestecko/nove` a původní městečko `/mestecko/puvodni`.
  Komponenty (`components/town3d`, `TownHub`, …), `lib/town*` a API `/api/mestecko/*` zůstaly na místě.
- Sekce „Co tu najdeš“ na homepage (`IslandHub`, `TechBoard`, `TechScenes`) — odebrána z `src/app/[locale]/page.tsx`, komponenty zůstaly.
