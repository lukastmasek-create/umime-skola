"""Liána, která zaroste roh nabídky předmětů (hraje se jednou, 40 snímků)."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from plant import *

FRAMES = 40
PREVIEW = "--preview" in args()
sc = reset(480, 480, FRAMES, samples=20, name="liana")

main = Vine([(-0.92, 0, -1.05), (-0.74, 0, -0.45), (-0.95, 0, 0.05), (-0.62, 0, 0.55), (-0.12, 0, 0.72), (0.4, 0, 0.6), (0.85, 0, 0.88)],
            radius=0.035, seed=4, name="main", flowers=[(0.52, 0.17), (0.86, 0.2), (0.98, 0.15)])
side = Vine([(-0.74, 0, -0.45), (-0.38, 0, -0.62), (0.05, 0, -0.78), (0.4, 0, -0.7)],
            radius=0.026, seed=9, leaf_size=0.12, name="side", flowers=[(0.95, 0.14)])

add_sun((math.radians(40), math.radians(10), math.radians(-25)), energy=3.0)
add_area((-3, -5, 4), (0, 0, 0), energy=300, size=5, color="#e8ffe9")
add_camera((0, -8, 0), (0, 0, 0), ortho_scale=2.4)

def update(t):
    g = ease_out_cubic(t / 0.82) if t < 0.82 else 1.0
    main.update(g)
    side.update(max(0.0, (g - 0.15) / 0.85))

if PREVIEW:
    render(update, only_frames=[10, 25, 40])
else:
    render(update)
