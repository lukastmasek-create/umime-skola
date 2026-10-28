"""Velká Británie / angličtina: Big Ben. Ručičky hodin se točí, kolem věže jezdí červený double-decker."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from znacky_lib import *
from mathutils import Quaternion

sc = setup("znacka_anglictina", world=("#c4d0ee", 0.6), ortho=4.7, target_z=1.55)
plinth("#7fcf7a", "#ffffff")

stone = stone_material("stone", "#dcbf7e", scale=34, strength=0.2)
stone_d = stone_material("stone_d", "#bd9d5d", scale=34, strength=0.2)
roof = material("roof", "#5a6a5a", roughness=0.45, metallic=0.4)
gold = material("gold", "#ffc933", roughness=0.25, metallic=0.9)
white = material("white", "#fffdf2", roughness=0.4)
black = material("black", "#1a1730", roughness=0.5)
red = material("red", "#d7261e", roughness=0.35)
glass = material("glass", "#9fd2ff", roughness=0.1)
lamp = glow("lamp", "#ffe9a8", 5.0)
road = material("road", "#4a4a5a", roughness=0.9)

# silnice kolem věže
cyl((0, 0, 0.045), 1.18, 0.02, road, verts=64)
cyl((0, 0, 0.056), 0.82, 0.02, material("grass2", "#7fcf7a", roughness=0.8), verts=64)

# věž
box((0, 0, 0.9), (0.62, 0.62, 1.8), stone)
for sx in (-1, 1):
    for sy in (-1, 1):
        box((sx * 0.31, sy * 0.31, 0.9), (0.08, 0.08, 1.8), stone_d)
# gotická okénka na dříku
for z in (0.45, 0.85, 1.2):
    for ang in (0, 90, 180, 270):
        a = math.radians(ang)
        box((0.315 * math.sin(a) * (1 if ang in (90, 270) else 0), -0.315 * math.cos(a) * (1 if ang in (0, 180) else 0), z), (0.1, 0.1, 0.2), black, rot=(0, 0, 0))
# hodinová část
box((0, 0, 2.05), (0.74, 0.74, 0.7), stone)
box((0, 0, 1.78), (0.8, 0.8, 0.08), stone_d)
box((0, 0, 2.43), (0.8, 0.8, 0.08), stone_d)
# čtyři ciferníky (vidět dva z kamery)
hands = []
for k, a in enumerate((0, 90, 180, 270)):
    ar = math.radians(a)
    nx, ny = math.sin(ar), -math.cos(ar)  # směr ven z plochy
    c = (nx * 0.375, ny * 0.375, 2.05)
    rot = (math.radians(90), 0, ar)
    cyl(c, 0.27, 0.03, gold, verts=40, rot=rot)
    cyl((nx * 0.392, ny * 0.392, 2.05), 0.24, 0.02, white, verts=40, rot=rot)
    for h in range(12):
        ha = h * math.tau / 12
        px = nx * 0.405 + (math.cos(ar) * math.sin(ha)) * 0.2
        py = ny * 0.405 + (math.sin(ar) * math.sin(ha)) * 0.2
        box((px, py, 2.05 + 0.2 * math.cos(ha)), (0.025, 0.012, 0.025), black, rot=(0, 0, ar), bevel=0)
    # ručičky: dlouhá (minuty) a krátká (hodiny); otáčí se kolem osy ciferníku
    for length, wid, name in ((0.2, 0.022, "min"), (0.13, 0.03, "hod")):
        piv = bpy.data.objects.new("piv", None)
        bpy.context.scene.collection.objects.link(piv)
        piv.location = (nx * 0.41, ny * 0.41, 2.05)
        hand = box((0, 0, 0), (wid, 0.01, length), black, bevel=0)
        hand.parent = piv
        hand.location = (0, 0, length / 2)
        hands.append((piv, name, ar))
# zvonice
box((0, 0, 2.78), (0.62, 0.62, 0.5), stone)
for sx in (-1, 1):
    for sy in (-1, 1):
        box((sx * 0.3, sy * 0.3, 2.78), (0.07, 0.07, 0.52), stone_d)
for ang in (0, 90):
    a = math.radians(ang)
    box((0.311 * math.sin(a), -0.311 * math.cos(a), 2.78), (0.2 if ang == 0 else 0.02, 0.02 if ang == 0 else 0.2, 0.3), black, bevel=0)
# střecha a hrot
cone((0, 0, 3.17), 0.5, 0.06, 0.34, roof, verts=4, rot=(0, 0, math.radians(45)))
cone((0, 0, 3.52), 0.06, 0.0, 0.4, gold, verts=12)
sphere((0, 0, 3.74), 0.03, gold, seg=10, rings=8)
for sx in (-1, 1):
    for sy in (-1, 1):
        cone((sx * 0.32, sy * 0.32, 3.0), 0.045, 0.0, 0.26, gold, verts=6)

# budova parlamentu vedle věže
box((-0.62, 0.55, 0.28), (1.5, 0.52, 0.56), stone)
for i in range(7):
    box((-1.28 + i * 0.22, 0.285, 0.3), (0.08, 0.02, 0.26), glass)
cone((-0.9, 0.5, 0.78), 0.12, 0.0, 0.42, roof, verts=8)
cone((-0.35, 0.5, 0.74), 0.1, 0.0, 0.36, roof, verts=8)
box((-0.62, 0.55, 0.6), (1.52, 0.56, 0.06), stone_d)

# autobus: červený double-decker, jezdí po kruhu
bus = bpy.data.objects.new("bus", None)
bpy.context.scene.collection.objects.link(bus)
parts = [
    box((0, 0, 0.17), (0.5, 0.2, 0.34), red),
    box((0.0, 0, 0.375), (0.48, 0.19, 0.1), glass),
    box((0.0, 0, 0.45), (0.5, 0.2, 0.05), red),
]
for sx in (-0.15, 0.15):
    for sy in (-1, 1):
        parts.append(cyl((sx, sy * 0.1, 0.04), 0.05, 0.03, black, verts=14, rot=(math.radians(90), 0, 0)))
for o in parts:
    loc = o.location.copy()
    o.parent = bus
    o.location = loc

lamps = [sphere((0.0, 0, 0), 0.03, lamp, seg=8, rings=6) for _ in range(1)]
flag_pole = (0, 0, 3.74)


def update(t):
    ph = t * math.tau
    a = -ph + math.radians(-60)  # po směru hodinových ručiček
    R = 1.0
    bus.location = (R * math.cos(a), R * math.sin(a), 0.05)
    bus.rotation_euler = (0, 0, a - math.pi / 2)
    for piv, name, ar in hands:
        # minutová ručička udělá za smyčku jeden okruh, hodinová dvanáctinu
        ang = ph if name == "min" else ph / 12 + 0.9
        # otáčení kolem normály ciferníku po směru hodinových ručiček
        n = Vector((math.sin(ar), -math.cos(ar), 0))
        piv.rotation_mode = "QUATERNION"
        base = Quaternion(n, -ang)
        face = Euler((0, 0, ar)).to_quaternion()
        piv.rotation_quaternion = base @ face


run(update, "znacka_anglictina")
