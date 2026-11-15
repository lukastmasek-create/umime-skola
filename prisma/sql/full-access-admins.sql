-- Plný přístup (všechny PRO tarify a odemčení) mají jen účty s rolí ADMIN.
-- Dřív se odvozoval ze seznamu e-mailů v kódu, což šlo zneužít (vlastnictví e-mailu se neověřuje).
-- Spusť jednou v databázi a doplň e-maily účtů, které mají mít plný přístup.
-- E-maily sem NEcommituj – repozitář je veřejný. Uprav lokálně, spusť, zahoď.

UPDATE "User" SET "role" = 'ADMIN'
WHERE lower("email") IN (
  'doplň@example.com'
);

-- Kontrola:
-- SELECT "email", "role" FROM "User" WHERE "role" = 'ADMIN';
