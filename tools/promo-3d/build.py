#!/usr/bin/env python3
"""Sestaví storyboard.html (a testovací obal) ze šablony, kitu a stylu."""
import pathlib
d = pathlib.Path(__file__).parent
t = (d / "storyboard.template.html").read_text()
t = t.replace("/*STAGE*/", (d / "lib/stage.js").read_text()).replace("/*STYLE*/", (d / "styles/ucimesehrou.js").read_text())
assert "</script" not in (d / "lib/stage.js").read_text() and "</script" not in (d / "styles/ucimesehrou.js").read_text()
(d / "out").mkdir(exist_ok=True)
(d / "out/storyboard.html").write_text(t)
(d / "out/storyboard.test.html").write_text('<!doctype html><html lang="cs"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>' + t + "</body></html>")
print("ok", len(t))
