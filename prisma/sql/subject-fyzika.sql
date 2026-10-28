-- Nový předmět Fyzika. Spusť jednou v databázi PŘED prisma/sql/courses-fyzika-6-9.sql
-- (nová hodnota enumu se musí potvrdit dřív, než ji jde použít, proto jsou to dva samostatné soubory).
-- Idempotentní: bezpečné spustit opakovaně.
ALTER TYPE "Subject" ADD VALUE IF NOT EXISTS 'FYZIKA';
