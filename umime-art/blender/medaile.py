"""Medaile předmětů pro profil (public/rewards/medaile_<stupen>.webp): kovový disk s vavřínem a stuhou.
Střed disku zůstává hladký, ikonu předmětu na něj klade web. Jeden snímek 512 × 512, průhledné pozadí.
Spuštění: python medaile.py -- bronz | stribro | zlato
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from znacky_lib import *

TIERS = {
    "bronz": ("#c9803f", "#8f5427", "#e9a766", "#d6362b"),
    "stribro": ("#d3dae6", "#8e98aa", "#f4f8ff", "#3b7be0"),
    "zlato": ("#ffc933", "#c98a0c", "#ffe58a", "#8a3ffc"),
}
tier = (sys.argv[sys.argv.index("--") + 1] if "--" in sys.argv else "zlato")
main, dark, light, ribbon_c = TIERS[tier]

sc = setup("medaile_" + tier, size=512, frames=1, samples=96, az=0, el=6, ortho=3.1, target_z=0.2, world=("#f3ecff", 0.7))
metal = material("metal", main, roughness=0.22, metallic=1.0)
metal_d = material("metal_d", dark, roughness=0.3, metallic=1.0)
metal_l = material("metal_l", light, roughness=0.18, metallic=1.0)
face = material("face", light, roughness=0.35, metallic=0.9)
rib = material("rib", ribbon_c, roughness=0.55)
rib2 = material("rib2", "#ffffff", roughness=0.55)

X = (math.pi / 2, 0, 0)  # osa válce podél -y: disk je přivrácený ke kameře

# stuha: dva šikmé pruhy
for sx in (-1, 1):
    b = box((sx * 0.38, 0.0, 1.55), (0.42, 0.04, 1.35), rib, rot=(0, sx * 0.34, 0), bevel=0.01)
    box((sx * 0.38, -0.025, 1.55), (0.12, 0.01, 1.35), rib2, rot=(0, sx * 0.34, 0), bevel=0)
# očko
torus((0, 0, 1.0), 0.17, 0.045, metal_d, rot=X)

# disk: okraj, vnitřní prsten, hladká plocha pro ikonu
cyl((0, 0.0, 0.0), 1.0, 0.16, metal, verts=96, rot=X)
cyl((0, -0.09, 0.0), 0.88, 0.04, metal_l, verts=96, rot=X)
cyl((0, -0.11, 0.0), 0.7, 0.04, face, verts=96, rot=X)
torus((0, -0.11, 0.0), 0.74, 0.03, metal_d, rot=X)
torus((0, -0.09, 0.0), 0.92, 0.035, metal_d, rot=X)

# vavřínový věnec: dvě větve lístků od spodku disku nahoru kolem plochy
for side in (-1, 1):
    for k in range(9):
        ang = math.radians(25 + k * 17)  # úhel od spodu
        px, pz = side * 0.82 * math.sin(ang), -0.82 * math.cos(ang)
        leaf = sphere((px, -0.135, pz), 0.075, metal_l if k % 2 else metal, scale=(0.5, 0.25, 1.0), seg=12, rings=8)
        leaf.rotation_euler = (0, -side * ang, 0)


def update(t):
    pass


run(update, "medaile_" + tier)
