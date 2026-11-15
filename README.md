# Vzdělávací platforma

Základ webu pro online kurzy s uživatelskými účty, postaveno na Next.js.

## Tech stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS 4** — styly
- **Prisma** — ORM pro PostgreSQL
- **NextAuth.js (Auth.js) v5** — přihlašování (email + heslo)

## Struktura

```
prisma/schema.prisma          # datový model (42 modelů)
prisma/migrations/            # migrace (0_init = výchozí stav, viz „Databáze“)
prisma/sql/                   # ruční SQL skripty (obsah kurzů, jednorázové úpravy)
src/proxy.ts                  # přesměrování na jazykovou verzi (/ → /cs)
src/i18n/                     # texty v 8 jazycích (cs, en, de, ru, uk, ja, es, fr)
src/lib/                      # logika (auth, prisma, hry, obchod …) + testy *.test.ts
src/app/[locale]/             # stránky, např. kurzy/, prihlaseni/, registrace/, ucitele/, tymy/
src/app/api/                  # API (registrace, kontakt, týmy, obchod, cron …)
worker.ts                     # vstup Cloudflare workeru: http→https, www→bez www, plánovač
public/_headers               # cache a bezpečnostní hlavičky statických souborů
docs/                         # návrhy a podklady (3D modely, Blender, ekonomika, UI knihovny)
```

## Lokální vývoj

Node 22 (viz `.nvmrc`).

1. Zkopíruj `.env.example` do `.env` a doplň `DATABASE_URL` (PostgreSQL) a `AUTH_SECRET`
   (vygeneruješ pomocí `openssl rand -base64 32`).
2. Nainstaluj závislosti:
   ```bash
   npm install
   ```
3. Vytvoř databázové tabulky podle schématu:
   ```bash
   npx prisma migrate deploy
   ```
4. Spusť vývojový server:
   ```bash
   npm run dev
   ```

### Kontroly (stejné jako v CI)

```bash
npm run lint        # ESLint
npm run typecheck   # next typegen + tsc
npm test            # všechny src/**/*.test.ts
```

GitHub Actions (`.github/workflows/check.yml`) je spouští na každý pull request; nasazení
(`deploy.yml`) proběhne jen tehdy, když kontroly projdou.

### Proměnné a secrety

| Název | Kde | K čemu |
|---|---|---|
| `DATABASE_URL` | `.env` (lokálně) | PostgreSQL pro Prisma |
| `AUTH_SECRET` | `.env`, `wrangler secret put` | podpis přihlášení (Auth.js) |
| `TURNSTILE_SECRET_KEY` | `.env`, `wrangler secret put` | ověření „nejsem robot“ u registrace a kontaktu. **V produkci povinné** – bez něj se registrace a kontakt odmítnou. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | `.env` | veřejný klíč Turnstile (výchozí je produkční) |
| `CRON_SECRET` | `wrangler secret put` | autorizace plánovače e-mailových připomínek |
| `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` | GitHub secrets | nasazení z GitHub Actions |

### Plný přístup (správci)

Plný přístup ke všem PRO tarifům a odemčením má jen účet s rolí `ADMIN` v tabulce `User`.
Role se nastavuje ručně v databázi (`prisma/sql/full-access-admins.sql`), nikdy podle e-mailu.

### Školy pro výběr v Nastavení

Žáci si školu mohou přidat sami, ale je lepší naplnit tabulku `School` skutečnými školami
z Rejstříku škol MŠMT (open data) nebo z vlastního CSV (`název;obec`):

```
node prisma/import-schools.cjs vrejcelk.xml
node prisma/import-schools.cjs skoly.csv
```

U XML lze názvy tagů změnit parametry `--record-tag`, `--name-tag` a `--city-tag`. Duplicity se přeskočí.

## Deploy (Cloudflare Workers, doména ucimesehrou.org)

Aplikace běží na Cloudflare Workers přes OpenNext (`@opennextjs/cloudflare`), databáze PostgreSQL zůstává externí a připojuje se přes Hyperdrive.

1. Jednorázově vytvoř Hyperdrive konfiguraci nad Postgresem (výstup obsahuje `id`):
   ```bash
   npx wrangler hyperdrive create ucimesehrou --connection-string="postgresql://USER:PASS@HOST:5432/DB"
   ```
   Vlož `id` do `wrangler.jsonc` (pole `hyperdrive[0].id`).
2. Nastav secret pro přihlašování (NextAuth):
   ```bash
   npx wrangler secret put AUTH_SECRET
   ```
3. Zóna `ucimesehrou.org` musí být přidána do účtu Cloudflare. Vlastní domény (`ucimesehrou.org` i `www.ucimesehrou.org`)
   se nastavují v `routes` ve `wrangler.jsonc`; DNS záznam pro `www` vytvoří Cloudflare při nasazení.
4. Nasazení:
   ```bash
   npm run deploy      # build přes OpenNext + wrangler deploy
   npm run preview     # lokální náhled v prostředí Workers
   ```
5. Databáze (z lokálního stroje, s `DATABASE_URL` ukazující na produkční Postgres):
   - **Existující databáze** (tabulky už jsou): jednou označ výchozí migraci jako provedenou,
     další migrace pak jdou přes `migrate deploy`:
     ```bash
     npx prisma migrate resolve --applied 0_init
     ```
   - **Nová databáze:**
     ```bash
     npx prisma migrate deploy
     ```
   - Nové změny schématu: `npm run db:migrate` (vytvoří migraci v `prisma/migrations/`), commitni ji.

Lokálně se Prisma připojuje přes `DATABASE_URL` z `.env`. Na Workers se použije binding `HYPERDRIVE`.

## Další kroky

- Přidat administrační rozhraní pro vytváření kurzů a lekcí.
- Napojit zápis studenta do kurzu (`Enrollment`) a sledování postupu (`LessonProgress`).
- Případně doplnit přihlášení přes Google/GitHub OAuth v `src/lib/auth.ts`.

## Hrát společně (živé hry)

Stránka `/hrat-spolecne`: kdokoliv založí hru (kvíz, závod nebo zlatá horečka), ostatní se připojí kódem. Stav se čte pollingem (~1 s), takže stačí Next.js a Postgres.

- Před nasazením jednou spusť `prisma/sql/live-games.sql` v databázi (nové tabulky `QuestionSet`, `LiveRoom`, `LivePlayer`, `LiveAnswer`).
- Oznámení Ekonomiky (založení firmy, předehnání v žebříčku): jednou spusť `prisma/sql/economy-feed.sql` (nová tabulka `EconomyEvent`).
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

## Kontakt

Stránka `/kontakt` (odkaz v menu Nastavení, v patičce a u výběru školy): formulář s kategoriemi Podpora (chyba v učivu, chyba ve stránce, chyba s účtem), Partnerství (partnerská škola, influenceři, učebnice pro materiály) a Přidání školy. Odkaz `/kontakt?tema=add-school` (nebo jiné id tématu či kategorie) formulář rovnou předvyplní.

- Před nasazením jednou spusť `prisma/sql/contact.sql` v databázi (nová tabulka `ContactMessage`).
- Zprávy se ukládají do `ContactMessage` (stav `new`), čtou se zatím přímo v databázi (např. `npm run db:studio`).
- Každá nová zpráva se zároveň pošle e-mailem týmu podpory přes Cloudflare Email Service (binding `EMAIL`, `src/lib/contact-mail.ts`). Adresa odesílatele je v Reply-To, takže se dá odpovědět přímo z e-mailu. Nastavení je ve `wrangler.jsonc`: `CONTACT_EMAIL_TO` (`ucimesehrou@seznam.cz`), `CONTACT_EMAIL_FROM` (`kontakt@ucimesehrou.org`) a `send_email` binding s povoleným příjemcem. Doména `ucimesehrou.org` musí být onboardovaná v Cloudflare → Compute → Email Service → Email Sending. Odesílání z workeru vyžaduje plán Workers Paid. Když něco chybí, e-mail se přeskočí a zpráva se uloží tak jako dřív.
- Témata a kontrola dat: `src/lib/contact.ts` (testy v `npm test`), e-maily: `src/lib/contact-mail-format.ts`, API: `src/app/api/kontakt/`, texty: `src/i18n/contact.ts`.

## Craftování

Záložka **Craftování** v profilu (`/profil#craftovani`): Bonusy, Avatary, Doplňky a Materiály.

- 24 materiálů: 6 světů (obecné, vesmír, moře, les, hrad, kouzla) × 4 vzácnosti (běžný, neobvyklý, vzácný, epický). Věc se vyrábí jen z materiálů svého světa, bonusy z obecných.
- Materiály se získávají učením (každých 10 XP, kromě kola štěstí; světové padají do zvoleného světa), za vybrané odměny ve stálých hrách, nákupem za body (jen běžné a neobvyklé, 10 denně) a zušlechtěním 3 → 1.
- Bonusy: XP navíc (strop +50 %), zrychlení stálých her (strop +50 %), body, otočka kola, štít série v kvízech.
- Avatary, tituly a pozadí jsou jen z craftování a fungují hned. Doplňky (avatar, mazlíčci, pokoj) jsou zatím jen pojmenované a čekají na 3D modely (`docs/CRAFT_ASSETS.md`).
- Logika a recepty: `src/lib/craft.ts` (testy v `npm test`), server: `src/lib/craft-server.ts`, `src/app/api/craft/`, obrazovka: `src/components/CraftPanel.tsx`, texty: `src/i18n/craft.ts`. Stav je v `IdleState` (hra `craft`), takže není potřeba měnit databázi.
