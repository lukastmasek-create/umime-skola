// Platby skutečnými penězi (dobití bodů za Kč). Dokud nejsou spuštěné, web nesmí ukazovat
// ceny v Kč ani tlačítka „Zaplatit“ – dítě by vidělo nabídku, kterou nejde splnit.
// Až se platby spustí, musí jít přes účet rodiče (viz WEBSITE_CRITIQUE.md, D-1).
export const PAYMENTS_ENABLED = false;
