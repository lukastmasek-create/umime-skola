#!/bin/bash
# bundle once, render per-scene frame ranges (timed), concat -c copy, mux sfx.wav
cd /home/user/work/shorts
mkdir -p out/tmp out/final
export REMOTION_TMP=/tmp/remotion-tmp
npx remotion bundle 2d/src/index.ts --out-dir=out/bundle > out/bundle.log 2>&1 || { echo BUNDLE FAIL; exit 1; }
echo "part,scene,frames,seconds,ms_per_frame" > out/timing.csv
for n in 1 2 3; do
  P=tymy-0$n; ID=TymyDil$n
  read F1S F1E F2S TOT < <(node -e "const c=require('./2d/$P/composition.json');console.log(c.flights[0].start,c.flights[0].end,c.flights[1].start,c.frames)")
  R=("intro 0 $((F1E-1))" "feature $F1E $((F2S-1))" "outro $F2S $((TOT-1))")
  : > out/tmp/$P.list
  for r in "${R[@]}"; do set -- $r
    S=$(date +%s.%N)
    npx remotion render out/bundle $ID out/tmp/${P}_$1.mp4 --frames=$2-$3 --codec h264 --crf 18 --muted --gl=swangle --browser-executable=/opt/pw-browsers/chromium --concurrency=3 --log=error > out/tmp/${P}_$1.log 2>&1 || { echo RENDER FAIL $P $1; exit 1; }
    E=$(date +%s.%N); N=$(( $3-$2+1 ))
    echo "$P,$1,$N,$(echo "$E-$S"|bc),$(echo "($E-$S)*1000/$N"|bc)" >> out/timing.csv
    echo "file '${P}_$1.mp4'" >> out/tmp/$P.list
  done
  ffmpeg -y -loglevel error -f concat -safe 0 -i out/tmp/$P.list -c copy out/tmp/$P-video.mp4
  D=$(node -e "console.log(require('./2d/$P/composition.json').frames/30)")
  ffmpeg -y -loglevel error -i out/tmp/$P-video.mp4 -i public/$P/sfx.wav -filter_complex "[1:a]apad=whole_dur=$D,atrim=0:$D[a]" -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -movflags +faststart -t $D out/final/$P.mp4
  echo "DONE $P"
done
echo ALLDONE > out/render_done.txt
