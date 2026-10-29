-- Nové předměty Chemie, Občanská výchova, Hudební výchova a Francouzština. Spusť jednou v databázi PŘED
-- prisma/sql/courses-chemie.sql atd. (nová hodnota enumu se musí potvrdit dřív, než ji jde použít, proto
-- jsou to samostatné soubory). Idempotentní: bezpečné spustit opakovaně.
ALTER TYPE "Subject" ADD VALUE IF NOT EXISTS 'CHEMIE';
ALTER TYPE "Subject" ADD VALUE IF NOT EXISTS 'OBCANKA';
ALTER TYPE "Subject" ADD VALUE IF NOT EXISTS 'HUDEBKA';
ALTER TYPE "Subject" ADD VALUE IF NOT EXISTS 'FRANCOUZSTINA';
