"""Rostlinka, která vyklíčí a rozkvete (pro najetí na kartu; 24 snímků, hraje se tam a zpět)."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from plant import *

FRAMES = 24
PREVIEW = "--preview" in args()
sc = reset(256, 256, FRAMES, samples=20, name="kvetina")

stem = Vine([(0.0, 0, -1.0), (0.12, 0, -0.45), (-0.1, 0, 0.05), (0.02, 0, 0.42)], radius=0.05, tip_scale=0.6, leaf_every=0.28,
            leaf_size=0.26, seed=7, name="k", flowers=[(1.0, 0.31)])
add_sun((math.radians(40), math.radians(10), math.radians(-25)), energy=3.0)
add_area((-3, -5, 4), (0, 0, 0), energy=300, size=5, color="#fff2ff")
add_camera((0, -8, 0), (0, 0, 0), ortho_scale=2.4)

def update(t):
    g = min(1.0, t / 0.55)
    stem.update(ease_out_cubic(g))
    stem.flowers[0][0].update((t - 0.45) / 0.55)

if PREVIEW:
    render(update, only_frames=[6, 14, 24])
else:
    render(update)
