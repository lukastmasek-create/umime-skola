# Website Critique: Učíme se hrou (ucimesehrou.org)

**Access date:** 2026-11-15 · **Repo revision audited:** `082200b` (branch `claude/vigilant-babbage-dqanbm`) · **Type:** read-only critique, no fixes made.

**Team:**
- 3 core subagents ran **concurrently** in one launch: Repo Auditor, Design Critic and Function Checker.
- The optional Accessibility Auditor did **not** run. Its basic accessibility checks were split between Design and Function.
- The Verifier step (Wave 3) **ran inline by the Lead, not as a separate subagent**. It re-checked the top findings (§7).
- **No games or lessons were played.** No forms were submitted and nobody logged in.

> **Note on one finding:** this repository is **public**. The details of finding R-1 (an access-control weakness) are left out of this file on purpose and were given to the owner privately.

---

## 1. Verdict

Učíme se hrou is a real, working, multilingual product. Its basics are solid: real 404s, correct `<html lang>` per language, strong text contrast, clean Czech characters, no sideways scrolling on mobile, a passing build and 305 passing tests.

It is **not yet fully trustworthy for its child, parent and teacher audience**, for these reasons:
- A paid points shop with discount and scarcity tactics sits in the main navigation of a site that markets itself as "safe for kids, no ads".
- A stock and crypto news ticker is the first thing on every page.
- The registration form has no terms, no consent text and no under-15 parent route.
- The published cookie policy says there is no analytics, but Cloudflare Web Analytics runs on every page.

On the technical side:
- The site answers over plain HTTP without redirecting to HTTPS.
- `www.ucimesehrou.org` does not exist (it returns NXDOMAIN, "no such domain").
- One access-control weakness in the code needs fixing (R-1).
- Every push to main deploys to production with no lint, test or type-check gate in front of it.

Nothing here is a hard Blocker. About 12 Major issues should be fixed before the site is actively promoted to schools. Most of them are small (effort S) changes.

## 2. Scorecard

| Area | Rating | One-line reason |
|---|---|---|
| **Design** | 6/10 | Strong identity, contrast and Czech typography, held back by off-mission elements (shop, ticker), a 137,000 px tall course page on mobile, and a broken subject map on mobile. |
| **Function** | 7/10 | Routing, i18n, 404s and security headers are good. Missing: HTTP→HTTPS redirect, `www` record, and caching of static files. The cookie policy does not match the analytics in use. |
| **Repo** | 6/10 | Build and tests pass, and no secrets leaked. But there is no CI gate, no migrations, lint is red, auth runs on a beta library, and one access-control issue (R-1). |

## 3. Findings table

**ID prefixes:**
- D = Design, F = Function, R = Repo.
- **V** = confirmed by the Lead verification pass.
- **NV** = not verified live.
- **Code** = known from the code only.

**Severity scale:** Blocker / Major / Minor / Polish (see the brief).

**Where the evidence is:**
- Screenshots are in the session scratchpad under `review-shots/`. They are **not committed**.
- The full notes from each subagent are in the scratchpad under `notes/{REPO,DESIGN,FUNCTION}-FINDINGS.md`.

### Major

| ID | Area | Page / path | Evidence | Impact | Recommendation | Effort |
|---|---|---|---|---|---|---|
| R-1 | Repo / Security | `src/lib/full-access.ts` and the code that calls it | Code review (V) | **Details withheld because the repo is public.** Some accounts can get every paid tier through a check that does not prove the user owns the account. | Base special access on a database role or flag, not on account details. Require verification before account-identity changes take effect. Keep personal data out of source. | S–M |
| D-1 | Design / Trust | `/cs/obchod` and "Obchod" in the main navigation | `obchod/page.tsx:16-19`: point packs at 49 / 99 / 249 Kč with a "Nejoblíbenější" badge; "-30 % Dnešní sleva"; "Limitované modely"; "Kolo štěstí"; "0 hodnocení · 19 hráčů". `BuyPointsCard.tsx:40` shows "coming soon" only **after** the buy button is clicked (V) | Contradicts "Bezpečné pro děti / bez reklam" for children aged 6–15. Uses pressure tactics (urgency, scarcity, a gambling-style wheel). Prices are shown for a purchase that is not possible. EU consumer guidance for children's virtual currency applies at launch. | Remove the Kč prices and the pay button until payment is real. At launch: purchases go through a parent account, every point price also shows the Kč price, and there are no timers, "limited" labels or wheel for under-15s. Consider taking "Obchod" out of the main navigation. | M |
| D-2 | Design | Every page (header) | "ZPRÁVY Z TRHU" ticker ("Investoři panikaří", "₿ Kryptoměny…") on the homepage, `/cs/ucitele`, the course page, 404, registration and login (V: `src/i18n/economy-ticker.ts`). At 375 px only 4–8 characters show. Close button is 20×14 px | In the first 3 seconds the site reads as a trading app, not school prep. Noise on mobile. Close button is below the 24×24 px minimum. | Show the ticker only inside the Ekonomika game, or as one homepage card. Never on the teacher, auth or 404 pages. Close button at least 44×44. | S |
| D-3 | Design | `/cs/kurzy/zakladni` | About 728 cards. Page height is 60,957 px at 1280 wide and **137,272 px at 375** (`cs-kurz-zakladni-*.png`) | Endless scrolling, no clear first step, a heavy page. | Show 4–6 courses per subject with a "Zobrazit vše (N)" link, or default to the pupil's grade. Sticky filters or pagination. | M |
| D-4 | Design | `/cs/kurzy/zakladni` at 375 px | Subject-map labels overlap or get cut off: "Hudební výchova", "Francouzština · 1…", "Občanská výchova · 10" (`crops/kurz375-a.png`) | The main subject picker is broken on phones. | Below 640 px, use the subject chips the homepage already has, or a 2-column grid. | S–M |
| D-5 | Design / Accessibility | Header, all pages | Hamburger icon contrast is **1.79:1**, language-menu arrow **1.06:1**, dropdown arrows dark on dark. Measured from pixels; medium confidence | Fails WCAG 1.4.11 (icons need 3:1). Pupils may not find the menu. | Give icons the text colour `rgb(246,241,228)`. Add a "CS" label to the language button. | S |
| D-6 | Design / Legal | `/cs/registrace` | The form has only name, email, password and the captcha: no link to terms or privacy, no under-15 or parent notice, no role choice. Login, by contrast, has Žák / Učitel / Rodič tabs | Teachers clicking "Založit třídu zdarma" land on a form written for pupils. Signing up children without visible consent text hurts trust and is a possible GDPR gap (the Czech digital-consent age is 15). | Add role tabs that match login, a one-line "Registrací souhlasíš s…" with links, and a parent route for under-15s. | S–M |
| F-4 | Function / Legal | Cookie and privacy pages vs. all pages | The cookie policy says no analytics is used, but the `static.cloudflareinsights.com` beacon and Cloudflare's bot-detection script load on every page. They set no cookies | The published policy is inaccurate, a GDPR transparency issue on a children's site. | Turn off Web Analytics in the Cloudflare dashboard, **or** disclose it and the bot detection in both policies. | S |
| F-1 | Function / Security | `http://ucimesehrou.org/cs` | Returns **200 with no redirect** (V; tested through the sandbox proxy, worth a re-check from a normal browser) | First-time visitors on an http link send login and registration in plain text. HSTS only protects people who have already been to the site over HTTPS. | Turn on Cloudflare "Always Use HTTPS". Later, add HSTS preload. | S |
| F-2 | Function | `www.ucimesehrou.org` | **NXDOMAIN** from public DNS (`dns.google`, Status 3) (V) | Anyone typing `www.` gets a browser error. | Add a proxied `www` record with a 301 redirect to the bare domain. | S |
| F-3 | Function / Performance | `/_next/static/*` and `public/` images | `cache-control: public, max-age=0, must-revalidate` on hashed JS chunks and `kometa-strip.webp` | About 85 revalidation round trips on every repeat page view. | Add `public/_headers`: `/_next/static/*` set to `max-age=31536000, immutable`, a moderate TTL for images, and copy the security headers there too. | S |
| R-2 | Repo | `.github/workflows/deploy.yml` | The only workflow deploys on every push to main. No lint, test or type-check step, and no pull-request workflow (V) | Regressions go straight to production. | Add a check job (lint, `next typegen && tsc`, test) and make deploy depend on it. | S |
| R-3 | Repo | `prisma/` | No `migrations/` folder anywhere in git history for a 42-model schema, but README tells you to run `migrate dev` / `migrate deploy` | Database changes cannot be reproduced, and `migrate deploy` does nothing. | Create a baseline `0_init` migration, mark it as applied, and fix the README. | M |
| R-5 | Repo | `eslint.config.mjs` | `npm run lint` fails: 162 problems (16 errors). 6 errors and 132 warnings come from the copied-in Draco decoder (`public/draco/`). There are **3 real React hook errors**: `HeroShowcase.tsx`, `pro/SchoolTools.tsx:33`, `idle/EconomyGame.tsx:1082` | Lint cannot be used as a gate, and real bugs are buried in the noise. | Ignore `public/draco/**`, fix the `.cjs` files and the 3 hook errors. | S |

### Minor

| ID | Area | Page / path | Evidence | Recommendation | Effort |
|---|---|---|---|---|---|
| D-7 | Design | `/cs/ucitele` | "Free" is clear in the hero. But the H1 just repeats the label "Pro učitele"; nothing says who runs the site (only a seznam.cz mailbox); no testimonials; the only demo is marked "Ilustrační ukázka"; the shop is not mentioned | Make the H1 a promise ("Zadej třídě procvičování za 1 minutu – zdarma"). Add a short "Co je zdarma / co je placené" section, say who runs the site, add 1–2 real screenshots. | S–M |
| D-8 + F-10 + F-13 + R-21 | SEO / metadata | `/cs/ucitele`, course pages, contact, legal, auth, 23 of 55 pages | No `og:image` on subpages. `og:locale` is "cs" instead of "cs_CZ". The homepage `<title>` is just "Učíme se hrou". Contact and legal pages have no canonical or hreflang tags. Auth and 404 pages share a generic title. 23 pages inherit the Czech-only root description in every language | Add page-level metadata with an OG image, full locale codes, canonical and alternate tags, and a descriptive title. | S |
| D-9 / D-10 | Copy | Homepage, O nás | The hero subtitle "uč se v jazyce, který potřebuješ" reads like language learning, and the same text is the meta description. The homepage says "Čtrnáct předmětů" but lists 15. "1. až 9. třída" contradicts the maturita promise. "skončil" uses only the masculine form | Rewrite the subtitle to say who the site is for and what they get. Take the subject count from the data. Make the audience statements match. | S |
| D-11 | Accessibility | Homepage at 375 px | 33 tappable elements under 44 px, 19 under 24 px (ticker close 20×14, subject buttons 21 px tall, "Vytvořit účet →" 18 px tall) | At least 44 px for main mobile controls, at least 24×24 everywhere. | S |
| D-12 | Accessibility | All pages | No skip link. The focus ring is visible but only about 3.7:1 | Add a "Přeskočit na obsah" link. Lighten the focus ring (e.g. `#8EA2FF`). | S |
| F-8 / F-9 | Accessibility / Function | Language switcher | No `aria-expanded`, `aria-haspopup` or `aria-current`. The options are buttons, not links. Switching drops the query string (`LanguageSwitcher.tsx:29-30`; Code) | Add the ARIA attributes, use real links, keep the query string and hash. | S |
| F-5 | Function | `/cs/kontakt` | `ContactForm.tsx` turns off browser validation, posts without client-side checks and resets the captcha after every attempt (Code; not submitted) | Check fields in the browser before sending, and keep the captcha unless the server used it. | S |
| F-6 / F-7 | Function | `/cs/profil`, `/cs/tymy` (logged out) | The profile page has no H1 and its only link is labelled "→", with no `?next=`. The teams page calls `/api/tymy` and gets a 401 console error | Give the link a real label and a return path. Skip the API call when there is no session. | S |
| F-11 + R-12 + R-13 + R-14 | Performance | Homepage, `public/`, `globals.css` | About 2.0 MB and 86 requests. Fonts: 422 KB in 11 woff2 files. WebGL starts on load and logs "GPU stall" warnings. A single 341 KB stylesheet loads everywhere. 302 GLB files (about 70 MB, 8 MB doll models with PNG textures). The public `/ukazka-ui` demo pulls in about 25 dependencies, including a 1.6 MB recharts bundle | Subset fonts and use fewer of them. Start WebGL lazily. Split the CSS by route. Recompress 3D textures to KTX2/WebP. Exclude the UI demo from production builds and drop unused dependencies (`typewriter-effect`, `@radix-ui/react-switch`). | M |
| R-6 / R-7 | Repo | `package.json` | `tsc` fails on a fresh checkout (12× `RouteContext`) until typegen has run. The test script lists 31 files by name and misses 2 (which pass when run by hand). 0 of 72 API routes have tests | Add a `typecheck` script. Use a glob for test files. Add API route tests, auth first. | S/M |
| R-8 / R-9 / R-10 | Repo / Security | `rate-limit.ts`, `turnstile.ts`, `auth.ts:45`, `api/registrace` | Rate limiting lets requests through when the database errors. The captcha is skipped if its key is missing. The login limit is per email only. Registration reveals whether an email exists (409) | Fail closed in production, add a per-IP limit, document all secrets, consider a generic registration response. | S |
| R-11 | Security | `next.config.ts` | The content security policy has no `script-src` (otherwise the headers are good: HSTS for 2 years, `frame-ancestors 'none'`, nosniff, Referrer-Policy, Permissions-Policy) | Use a nonce- or hash-based `script-src`. | M |
| R-15 / R-16 | i18n | Shop, Code playground, API errors, the uk/ja/es/fr languages | About 171 lines of hardcoded Czech in components. 230 `withFallbacks` calls serve English to uk/ja/es/fr. Fonts have no Japanese characters. **English is thorough** (Design check). The weak spots are the other 6 languages and the shop and code sections | Move the strings into `src/i18n`. Decide which languages are really supported, and drop or label the partial ones. | M |
| R-17 | Repo | README, root folder | Outdated route paths (they are now under `[locale]/`). No mention of lint, test, the captcha, cron or CI. 11 design-note `.md` files at the root | Update the README and move the notes to `docs/`. | S |
| R-19 | Repo | Dependencies | Production auth runs on `next-auth@5.0.0-beta.32`. `npm audit --omit=dev`: 4 high (Prisma → `deepmerge-ts`, fixed only in Prisma 7; `source-map-js`). 34 packages outdated | Plan the Prisma 7 upgrade and run `npm audit fix`. | M |
| D-13 | Design | `/cs/kurzy` | Plain text cards, while the homepage shows the same 4 categories as illustrated cards | Reuse the homepage cards. | S |

### Polish

| ID | Evidence | Recommendation |
|---|---|---|
| D-14 | At 1280 px: 2 homepage sections start 8 px from the left edge while the rest are centred. A rocket covers the globe hint text. "Denní kvíz" appears twice. The teacher section starts about 5,000 px down a 7,025 px page | Use one container width, keep decorations off text, merge the two quiz blocks, move the teacher section higher. |
| D-15 | Content below the fold stays invisible until scrolled into view. Screenshots, print and link previews show blank areas. Reduced-motion settings are respected | Add a print style that shows everything. Hide content only after the script confirms scroll detection works. |
| F-12 / F-14 / F-15 | An unused CSS preload. The manifest's maskable icon is the same as the "any" icon. The sitemap is 11 MB in one file (9,216 URLs) | Remove the preload, add a padded maskable icon, split into a sitemap index. |
| R-18 / R-20 / R-22 / R-23 | No `.nvmrc` or `engines` field. Dead code (`IslandHub`, `TechBoard`, `src/archive`). 58 plain `<img>` vs 4 `next/image`. No LICENSE | Pin Node 22, delete the dead code, check above-the-fold image sizes, add a LICENSE. |

### Struck after verification

- **R-4: "Sitemap may have no course URLs in production."** Struck. The live `/sitemap.xml` has **787** `/cs/kurz…` URLs (V). The risk is limited to builds with no database, which is not what production serves.

### Strengths (keep these)

- **Czech characters:** Onest and Pangolin load the extended Latin character set, and diacritics render cleanly.
- **Text contrast:** passes AA everywhere it was measured (5.09:1 to about 11.7:1).
- **No sideways scrolling** at 375, 768 or 1280 px on 12 pages.
- **Language routing:** real localised 404s, correct `lang` per language, alternate-language tags on the main pages.
- **No cookies or ad trackers** on first load, so having no cookie banner is consistent.
- **Accessible login and registration fields**, with labels, required flags and autocomplete hints.
- **"Free for teachers" is honest and clearly stated** on `/cs/ucitele`. No hidden teacher paywall was found.
- **Engineering basics:** build passes (375 static pages), 305/305 tests pass, no secrets in git, raw SQL is parameterised, three.js is split out to the game route only.

## 4. Quick wins, Real projects, Big rocks

**Quick wins (1 day or less each):**
1. **Cloudflare settings:** turn on HTTPS redirect (F-1), add the `www` record and redirect (F-2), add `_headers` caching for static files (F-3).
2. **Privacy policy:** make the cookie and privacy policy match the analytics actually in use (F-4).
3. **Ticker:** take it out of the global header (D-2).
4. **Shop:** hide the Kč prices and pay button and remove the urgency elements (first step of D-1).
5. **Registration:** add a terms and privacy line and role tabs (D-6).
6. **CI:** add a check job before deploy (R-2), plus the ESLint ignore and the 3 hook fixes (R-5).
7. **Header icons:** fix contrast and touch targets (D-5, D-11), add a skip link (D-12).
8. **Copy and metadata:** subtitle and meta description (D-9/D-10), OG and canonical tags (D-8 group).
9. **Small fixes:** language-switcher ARIA and query string (F-8/F-9), logged-out profile and teams pages (F-6/F-7), contact validation (F-5).

**Real projects (1–4 weeks):**
- **R-1 fix:** role-based access and verified account changes.
- **Course page redesign:** collapsed per-subject lists and a grade default (D-3), plus a mobile subject picker (D-4).
- **Migrations:** baseline and fix the README (R-3, R-17).
- **Performance:** fonts, lazy WebGL, CSS split, 3D texture compression, remove the UI demo from production (F-11 group).
- **Teacher page:** rewrite it with "co je zdarma / placené" and who runs the site (D-7).
- **Security hardening:** fail-closed rate limiting and captcha, per-IP limits, and API route tests (R-8/R-9, R-7).

**Big rocks (strategic):**
- **Monetisation policy for a children's product:** whether to have a shop at all, purchases only through a parent, compliance with EU guidance on virtual currency for children, and a matching under-15 consent route (D-1, D-6).
- **Language strategy:** fully support or drop uk/ja/es/fr/de/ru, and finish moving hardcoded strings into the translation files (R-15/R-16).
- **Platform hardening:** upgrade to Prisma 7, move off the next-auth beta, add a CSP `script-src` (R-19, R-11).

## 5. 30 / 60 / 90 days

- **First 30 days:**
  - All quick wins, R-1 first.
  - Make the site's promise ("safe for kids, no ads, free for teachers") visibly true on every page: ticker gone, shop toned down, consent text on registration, accurate privacy policy.
- **By 60 days:**
  - Course page and mobile subject picker redesign (D-3/D-4).
  - Teacher page rewrite (D-7).
  - Migrations baseline (R-3).
  - Performance pass.
  - API route tests and security hardening.
- **By 90 days:**
  - Monetisation and parent-consent design.
  - Language-support decision and string cleanup.
  - Dependency upgrades and CSP.
  - Re-run this critique, with a proper accessibility pass (axe plus a screen reader) and real-device checks.

## 6. What was NOT checked

- **Games and lessons:** no playthroughs (excluded by budget rule §0). At most a static look was allowed, and no game screenshot was taken.
- **Logged-in flows:** teacher, parent and pupil dashboards, teams, live rooms, the parental lock (no credentials).
- **Shop and economy logic:** server-side tampering checks; only about 12 of 72 API routes were read in full.
- **Account state for R-1:** whether the specific accounts concerned already exist in production.
- **Lab measurements:** no Lighthouse/CrUX, no load testing, no penetration testing, no bundle analyzer.
- **Accessibility:** no screen-reader or axe pass (the optional Accessibility Auditor did not run).
- **Browsers and devices:** no real phones, no Safari or Firefox, no real-GPU 3D rendering. D-4 and D-5 have medium confidence because they come from headless Chromium.
- **Pages not visited:** `/cs/pro`, `/cs/rodina`, `/cs/skola` (pricing), the de/ru/uk/ja/es/fr pages, the English legal pages, and a full depth-2 crawl (about 28 page URLs were checked).
- **Legal content:** the wording of the legal pages and the GDPR legal basis were not reviewed by a lawyer.
- **Not run:** the OpenNext/wrangler build and the live purchase flow (deliberately not clicked).
- **Fixes:** nothing was fixed, so there was nothing to re-test.

## 7. Commands and sources

**Robots and identification.**
- `robots.txt` blocks AI-training crawlers by name (ClaudeBot and others) and disallows `/api/` for everyone.
- This is an owner-requested audit, so live requests used an honest custom user agent: `Mozilla/5.0 (compatible; ucimesehrou-owner-audit/1.0)`.
- Requests were at least 1 s apart, with no `/api/` calls beyond what pages load themselves.

**Caps.**
- About 15 (Design) plus about 28 (Function) page URLs, which overlap heavily: roughly 35 unique.
- **Overrun:** the Function Checker went over its own 25-URL sub-cap by about 3. A script-name clash in the shared scratchpad made it re-run about 8 page GETs. This is disclosed here.
- 25 screenshots (at the cap).

**Wave 0 (Lead):**
- `git status -sb`, `git rev-parse HEAD` → `082200b`
- `curl -sI https://ucimesehrou.org` → 307 to `/cs`
- `curl -s …/robots.txt`

**Repo Auditor:**

| Command | Result |
|---|---|
| `npm ci` | exit 0; 971 packages; 16 vulnerabilities |
| `npm run lint` | exit 1; 162 problems, 16 errors |
| `npm test` | exit 0; 305/305 pass |
| `npx tsc --noEmit` | exit 2 on a fresh checkout; exit 0 after build |
| `npm run build` | exit 0, using **dummy** `DATABASE_URL` and `AUTH_SECRET` |
| `npm audit --omit=dev` | 4 high |
| `npm outdated` | 34 packages behind |

It also scanned all tracked files for secrets (none found) and measured asset sizes.

**Function Checker:**
- `curl -sI` on HTML and static files
- Playwright: page weight, console errors, horizontal-scroll checks, the language switcher, form attributes (all POSTs blocked)
- `/sitemap.xml`: 9,216 URLs

**Design Critic:**
- Playwright screenshots at 375, 768 and 1280 px
- Contrast from `getComputedStyle` and pixel sampling
- `<head>` metadata review

**Pages visited:**
- `/cs`, `/en`
- `/cs/ucitele`, `/en/ucitele`, `/cs/tymy`, `/en/tymy`
- `/cs/kurzy`, `/cs/kurzy/zakladni`
- `/cs/registrace`, `/cs/prihlaseni`, `/cs/kontakt`, `/cs/profil`
- `/cs/obchod` (text only)
- `/cs/ochrana-soukromi` and the cookie and terms pages
- 404 probes on `/cs` and `/en`
- `/sitemap.xml`, the OG image, favicon, manifest

**Screenshots (session scratchpad, not committed):**
- `cs-home-{375,768,1280}.png`, `cs-home-reducedmotion-1280.png`, `cs-home-focus-tab{3,5}-1280.png`
- `cs-ucitele-{375,768,1280}.png`
- `cs-kurz-zakladni-{375,768,1280}.png`
- `cs-kurzy-{375,1280}.png`
- `cs-404-{375,1280}.png`
- `en-home-{375,1280}.png`, `en-ucitele-{375,1280}.png`
- `cs-registrace-{375,1280}.png`, `cs-prihlaseni-375.png`, `cs-tymy-1280.png`, `cs-kontakt-375.png`

**Wave 3 verification (Lead, inline):**

| Check | Result |
|---|---|
| `curl http://ucimesehrou.org/cs` | 200 with no redirect → **F-1 confirmed** |
| `dns.google/resolve?name=www.ucimesehrou.org` | Status 3, NXDOMAIN → **F-2 confirmed** |
| Live sitemap | 787 `/cs/kurz…` URLs → **R-4 struck** |
| `src/lib/full-access.ts`, `api/ucet/email/route.ts:34` | **R-1 logic confirmed**; whether it can actually be exploited depends on production account state |
| `obchod/page.tsx:16-19`, `BuyPointsCard.tsx:40` | **D-1 confirmed** |
| `src/i18n/economy-ticker.ts` | **D-2 confirmed** |
| `.github/workflows/` contains only `deploy.yml` | **R-2 confirmed** |

---

## 8. Fix status (follow-up, 2026-11-15)

Fixes are on branch `claude/vigilant-babbage-dqanbm` (commits `f67acf4` … `29b1738`). Verified with lint (0 errors), `npm run typecheck`, `npm test` (321/321), `npm run build`, and a local smoke test (dummy DB) of the changed pages.

**Fixed:** R-1, R-2, R-3, R-5, R-6, R-7, R-8, R-9, R-12 (partly), R-17, R-18, R-19 (non-breaking `npm audit fix` only), R-20, R-21 · F-1, F-2 (in code; see below), F-3, F-4, F-5, F-6, F-7, F-8, F-9, F-10, F-13, F-14 · D-1 (no real-money offers while payments are off), D-2, D-3, D-4, D-5 (header line icons), D-6, D-7 (partly), D-8, D-9, D-10, D-11 (header, courses, ticker), D-12, D-13, D-14 (column width, duplicate quiz), D-15 (print).

**Owner actions before merging to main** (deploy runs on push to main):
1. Run `prisma/sql/full-access-admins.sql` with the real admin e-mails filled in locally (don't commit them). Until then no account has full access.
2. Make sure the Worker has the `TURNSTILE_SECRET_KEY` secret. In production, registration and contact are now refused without it.
3. Against the existing DB, run once: `npx prisma migrate resolve --applied 0_init`.
4. `www.ucimesehrou.org` is added as a Workers custom domain in `wrangler.jsonc`. The deploy token needs permission to create custom domains/DNS for the zone. If the deploy fails on that, add the domain in the Cloudflare dashboard, or remove that route line.

**Not fixed (reason):**
- R-11 CSP `script-src`: the pupil code playground runs in `srcdoc` iframes that inherit the page CSP. A strict policy would break pupils' HTML/JS. This needs the sandbox on a separate origin first.
- R-13 3D texture recompression, R-14 CSS split, F-11 fonts and lazy WebGL: these need asset tooling and visual QA. Left as a performance project.
- R-15/R-16: hardcoded Czech in the shop and code sections, and partial uk/ja/es/fr. These need translation work and a decision on which languages are supported.
- R-19 Prisma 7 / stable Auth.js: major upgrades. The remaining `deepmerge-ts` advisory needs Prisma 7.
- R-10: the registration 409 is kept because the UI uses it. The risk is low behind rate limiting and the captcha.
- R-23 LICENSE: the owner has to choose a license.
- F-12 (preload emitted by the framework); F-15 (sitemap is within Google's limits: 9,216 URLs and 11 MB, against 50,000 URLs and 50 MB).
- D-1 (launch design for parent-only purchases); D-7 (who runs the site: needs real operator details); D-14 (decorations overlapping text).
