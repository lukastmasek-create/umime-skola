"""Converts captured PNGs (public/shots, public/strips) to lossless WebP, deletes unused shots, writes src/film/manifest.json."""
import os, json, glob
from PIL import Image
KEEP = ['logo','home','kurzy','multiplayer','multiplayer-typed','ucitele']
def keep(n): return n in KEEP or n.startswith(('g-farma','g-mesto','g-zakladna','g-ekonomika','g-tymy'))
for f in glob.glob('public/shots/*.png'):
    n = os.path.basename(f)[:-4]
    if keep(n):
        Image.open(f).save(f[:-4]+'.webp', lossless=True, method=4, quality=100)
    os.remove(f)
for f in glob.glob('public/strips/*.png'):
    Image.open(f).save(f[:-4]+'.webp', lossless=True, method=4, quality=100); os.remove(f)
json.dump(sorted(os.path.basename(f) for f in glob.glob('public/shots/*.webp')), open('src/film/manifest.json','w'), indent=1)
