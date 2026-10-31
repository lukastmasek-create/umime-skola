# Vzdělávací platforma

Základ webu pro online kurzy s uživatelskými účty, postaveno na Next.js.

## Tech stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS 4** — styly
- **Prisma** — ORM pro PostgreSQL
- **NextAuth.js (Auth.js) v5** — přihlašování (email + heslo)

## Struktura

```
prisma/schema.prisma      # datový model: User, Course, Lesson, Enrollment, ...
src/lib/prisma.ts         # Prisma klient (singleton)
src/lib/auth.ts           # NextAuth konfigurace
src/app/
  page.tsx                # úvodní stránka
  kurzy/page.tsx           # výpis kurzů
  prihlaseni/page.tsx      # přihlašovací formulář
  registrace/page.tsx      # registrační formulář
  api/auth/[...nextauth]/  # NextAuth route handler
  api/registrace/          # endpoint pro vytvoření účtu
```

## Lokální vývoj

1. Zkopíruj `.env.example` do `.env` a doplň `DATABASE_URL` (PostgreSQL) a `AUTH_SECRET`
   (vygeneruješ pomocí `openssl rand -base64 32`).
2. Nainstaluj závislosti:
   ```bash
   npm install
   ```
3. Vytvoř databázové tabulky podle schématu:
   ```bash
   npm run db:migrate
   ```
4. Spusť vývojový server:
   ```bash
   npm run dev
   ```

### Školy pro výběr v Nastavení

Žáci si školu mohou přidat sami, ale je lepší naplnit tabulku `School` skutečnými školami
z Rejstříku škol MŠMT (open data) nebo z vlastního CSV (`název;obec`):

```
node prisma/import-schools.cjs vrejcelk.xml
node prisma/import-schools.cjs skoly.csv
```

U XML lze názvy tagů změnit parametry `--record-tag`, `--name-tag` a `--city-tag`. Duplicity se přeskočí.

## Deploy (Vercel nebo Render)

1. Push repozitáře na GitHub.
2. Na Vercelu/Renderu vytvoř nový projekt a napoj ho na tento GitHub repozitář.
3. V nastavení projektu (Environment Variables) nastav `DATABASE_URL` a `AUTH_SECRET`
   stejně jako v `.env`.
4. Zajisti databázi (např. Render PostgreSQL, Neon, Supabase) a po prvním deployi
   spusť migraci (`npx prisma migrate deploy`) — na Renderu lze jako "Build Command"
   použít `npm install && npx prisma migrate deploy && npm run build`.

## Další kroky

- Přidat administrační rozhraní pro vytváření kurzů a lekcí.
- Napojit zápis studenta do kurzu (`Enrollment`) a sledování postupu (`LessonProgress`).
- Případně doplnit přihlášení přes Google/GitHub OAuth v `src/lib/auth.ts`.

## Hrát společně (živé hry)

Stránka `/hrat-spolecne`: kdokoliv založí hru (kvíz, závod nebo zlatá horečka), ostatní se připojí kódem. Stav se čte pollingem (~1 s), takže stačí Next.js a Postgres.

- Před nasazením jednou spusť `prisma/sql/live-games.sql` v databázi (nové tabulky `QuestionSet`, `LiveRoom`, `LivePlayer`, `LiveAnswer`).
- Herní logika (body, pořadí, truhly) je v `src/lib/live/logic.ts`, testy: `npm test`.
- Server: `src/lib/live/service.ts` a `src/app/api/live/`, obrazovky: `src/components/live/`, texty: `src/i18n/live.ts`.

## Nové kurzy a předmět Fyzika

Obsah kurzů je v `prisma/content/*.cjs`, SQL se generuje příkazem `node prisma/build-courses-sql.cjs`.
Předmět Fyzika je nová hodnota enumu `Subject`, proto se v databázi spouští ve dvou krocích:

1. `prisma/sql/subject-fyzika.sql` (přidá hodnotu `FYZIKA`),
2. `prisma/sql/courses-fyzika-6-9.sql`, `courses-cestina-mezery.sql`, `courses-matematika-mezery.sql`, `courses-fyzika-stredni.sql` a `courses-matematika-stredni.sql` (kurzy a otázky; opakované spuštění nic nezdvojí).

## Výzvy ve stálých hrách

Farma, Město a Základna mají panel Výzvy (`src/components/idle/ChallengePanel.tsx`, API `src/app/api/stale-hry/vyzvy/route.ts`,
logika `src/lib/idle/challenge.ts`, testy v `challenge.test.ts`). Stav je v `IdleState` pod klíčem `vyzvy`, nové tabulky nejsou potřeba.
