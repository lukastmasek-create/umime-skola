#!/bin/bash
# probe.sh stories/x/part-N : montage of mid-shot frames
d=$1; T=$(node -e "const m=JSON.parse(require('fs').readFileSync('$d/marks.js','utf8').replace(/^window\.MARKS=/,'').replace(/;\$/,''));const L=m.lines;console.log(L.map((l,i)=>+(l.start+((i+1<L.length?L[i+1].start:m.total)-l.start)*(i==0?.6:.55)).toFixed(2)).join(','))")
PROBE_T=$T node render.mjs $d
n=$(basename $(dirname $d))-$(basename $d); cd .work; montage $(for t in ${T//,/ }; do echo probe-$n-$t.png; done) -tile 6x1 -geometry 360x640+4+4 m-$n.png; rm probe-$n-*.png
