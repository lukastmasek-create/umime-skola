-- Odemkne vše, přidá 1 000 000 bodů a nastaví level 100 (XP 247 500) pro tuzitv@seznam.cz.
-- Spusť v Supabase SQL editoru. Idempotentní u odemčení; body a XP se přičtou při každém spuštění.
DO $$
DECLARE uid text;
BEGIN
  SELECT id INTO uid FROM "User" WHERE lower(email) = lower('tuzitv@seznam.cz');
  IF uid IS NULL THEN RAISE EXCEPTION 'Uživatel tuzitv@seznam.cz neexistuje - nejdřív se musí zaregistrovat'; END IF;

  UPDATE "User" SET points = points + 1000000 WHERE id = uid;

  -- level 100 = 25*100*99 = 247 500 XP; doplní jen chybějící rozdíl
  INSERT INTO "XpEvent" ("id","amount","source","createdAt","userId")
  SELECT gen_random_uuid()::text, GREATEST(0, 247500 - COALESCE((SELECT SUM(amount) FROM "XpEvent" WHERE "userId" = uid),0)), 'admin-grant', NOW(), uid;

  INSERT INTO "Unlock" ("id","key","createdAt","userId")
  SELECT gen_random_uuid()::text, k, NOW(), uid
  FROM unnest(ARRAY['avatar:astronaut','avatar:chemik','avatar:founder','avatar:pirate','avatar:pumpkin','avatar:winter','avatar:wizard','banner:candy','banner:forest','banner:galaxy','banner:night-city','banner:ocean','banner:snow','banner:sunset','city:christmas_tree','city:ferris_wheel','city:windmill','frame:fire','frame:gold','frame:leaf','frame:neon','frame:rainbow','frame:stars','pet:bow','pet:crown','pet:flower','pet:glasses','pet:party','pet:scarf','title:bookworm','title:builder','title:heisenberg','title:legend','title:mathematician','title:pet-friend','title:scholar']) AS k
  ON CONFLICT ("userId","key") DO NOTHING;
END $$;
