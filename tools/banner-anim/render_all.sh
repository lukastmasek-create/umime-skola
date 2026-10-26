#!/bin/sh
# Vyrenderuje a zabalí jednu nebo víc scén: ./render_all.sh galaxy night-city ...
cd "$(dirname "$0")/../.." || exit 1
PY=${PY:-python3}
for s in "$@"; do
  rm -rf "/tmp/banner-frames/$s"
  $PY tools/banner-anim/run.py "$s" --frames 60 --samples 16 || exit 1
  case "$s" in
    galaxy|night-city) G=0.8 ;;
    ocean|sunset) G=0.5 ;;
    *) G=0 ;;
  esac
  $PY tools/banner-anim/pack.py "$s" --glow "$G"
done
