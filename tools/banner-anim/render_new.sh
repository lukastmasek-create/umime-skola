#!/bin/sh
# Vyrenderuje nové bannery (48 snímků, 12 fps) a uloží animaci i statický náhled (první snímek):
#   PY=python3 tools/banner-anim/render_new.sh treasure-map storm ...
cd "$(dirname "$0")/../.." || exit 1
PY=${PY:-python3}
for s in "$@"; do
  rm -rf "/tmp/banner-frames/$s"
  $PY tools/banner-anim/run.py "$s" --frames 48 --samples 12 > "/tmp/banner-frames-$s.log" 2>&1 || { echo "FAIL $s"; continue; }
  case "$s" in
    pirate-night|castle-night|jellyfish|town-forest|christmas|halloween|volcano|aurora|town-space|storm) G=0.7 ;;
    *) G=0.2 ;;
  esac
  $PY tools/banner-anim/pack.py "$s" --glow "$G" --fps 12 --quality 66
  $PY tools/banner-anim/still.py "$s"
done
