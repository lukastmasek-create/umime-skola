-- Nový předmět Španělština (globus, slug spanelstina). Spusť jednou v databázi PŘED případnými kurzy
-- se subject = 'SPANELSTINA'. Idempotentní: bezpečné spustit opakovaně.
ALTER TYPE "Subject" ADD VALUE IF NOT EXISTS 'SPANELSTINA';
