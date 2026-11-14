#!/usr/bin/env python3
"""Sestaví storyboard.html a animace.html (a testovací obaly) ze šablon, kitů a stylu."""
import pathlib
d = pathlib.Path(__file__).parent
(d / "out").mkdir(exist_ok=True)
stage, sound, style = (d / "lib/stage.js").read_text(), (d / "lib/sound.js").read_text(), (d / "styles/ucimesehrou.js").read_text()
for name, src in (("stage", stage), ("sound", sound), ("style", style)):
    assert "</script" not in src, name
def make(template, out):
    t = (d / template).read_text().replace("/*STAGE*/", stage).replace("/*SOUND*/", sound).replace("/*STYLE*/", style)
    (d / "out" / out).write_text(t)
    (d / "out" / out.replace(".html", ".test.html")).write_text('<!doctype html><html lang="cs"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>' + t + "</body></html>")
    print(out, len(t))
make("storyboard.template.html", "storyboard.html")
make("player.template.html", "animace.html")
