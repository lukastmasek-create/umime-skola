"""Spuštění: python run.py <scena> [--frames 60] [--only 0,15] [--samples 24] [--out DIR] [--scale 0.5]"""
import argparse
import importlib
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
import common  # noqa: E402

ap = argparse.ArgumentParser()
ap.add_argument("scene")
ap.add_argument("--frames", type=int, default=60)
ap.add_argument("--only", default="")
ap.add_argument("--samples", type=int, default=24)
ap.add_argument("--out", default="")
ap.add_argument("--scale", type=float, default=1.0)
a = ap.parse_args()

common.reset()
mod = importlib.import_module(f"scenes.{a.scene.replace('-', '_')}")
update = mod.build()
only = [int(x) for x in a.only.split(",")] if a.only else None
out = a.out or os.path.join("/tmp/banner-frames", a.scene)
res = (int(common.W * a.scale), int(common.H * a.scale))
common.render_frames(update, a.frames, out, samples=a.samples, only=only, res=res)
