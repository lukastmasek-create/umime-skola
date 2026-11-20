#!/bin/bash
cd "$(dirname "$0")"
for s in iq immortal teleport time; do for p in 1 2 3 4; do node render.mjs stories/whatif-$s/part-$p 2>&1 | grep -E "wrote|ERR"; done; done
