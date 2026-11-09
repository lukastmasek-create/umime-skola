# Ukázka UI knihoven: sestavení

Skript složí `src/components/UiDemo*.tsx` do jednoho HTML souboru bez potřeby dev serveru.

```bash
npm install
node tools/ukazka-ui/build.mjs
```

Výstup je `dist/ukazka-ui.html` (složka `dist/` je v `.gitignore`). Ten soubor se pak publikuje jako artefakt.
