"""Split an installer .lua into src/<Name>.lua module files (one per make(...) block)."""
import re, sys, pathlib
text = pathlib.Path(sys.argv[1]).read_text()
out = pathlib.Path(sys.argv[2]); out.mkdir(parents=True, exist_ok=True)
for m in re.finditer(r'make\("(\w+)", "(\w+)", \w+, \[==\[\n(.*?)\]==\]\)', text, re.S):
    cls, name, body = m.groups()
    ext = {"Script": ".server.lua", "LocalScript": ".client.lua"}.get(cls, ".lua")
    (out / f"{name}{ext}").write_text(body)
    print(cls, name, body.count("\n"))
