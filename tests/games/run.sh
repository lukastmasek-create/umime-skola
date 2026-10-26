#!/usr/bin/env bash
# Sestaví testovací stránku se hrami a spustí ji na http://localhost:8770 (viz README.md).
set -euo pipefail
ROOT="$(git rev-parse --show-toplevel)"
OUT="${TMPDIR:-/tmp}/umime-games-site"
mkdir -p "$OUT"
cd "$ROOT"
npx esbuild tests/games/main.tsx --bundle --outfile="$OUT/bundle.js" --format=iife \
  --alias:next/link=./tests/games/stub-link.tsx --jsx=automatic --define:process.env.NODE_ENV='"development"'
cp tests/games/index.html "$OUT/index.html"
for d in public/*; do ln -sfn "$ROOT/$d" "$OUT/$(basename "$d")"; done
echo "Služba běží na http://localhost:8770 (Ctrl+C ukončí)"
python3 -m http.server 8770 --directory "$OUT"
