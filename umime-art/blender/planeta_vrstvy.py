"""Vrstvy realistické planety pro živé vykreslení ve WebGL (60 a víc snímků za vteřinu).

Vykreslí do umime-art/out/pv_*/f_0001.png:
  pv_albedo   rovnoúhlá textura povrchu 2048x1024 (u = délka, v = šířka, vzorec je v equirect_vector)
  pv_stin     osvětlení bílé koule včetně stínu prstence (násobí se barvou povrchu)
  pv_halo     atmosférická záře (přidává se přes screen)
  pv_prsten_zadni / pv_prsten_predni   prstenec za a před planetou
  pv_mesic1 / pv_mesic2                  měsíce (kreslí se na webu po oběžné dráze)
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from planeta_lib import *
from mathutils import Vector

PFX = PAL["prefix"]

W, H = 720, 478
ORTHO = 5.5
RING_TILT = (math.radians(21), math.radians(-17), 0)
SUN_DIR = Vector((0.92, 0.5, -0.38))


def lights(energy, fill):
    sun = add_sun((0, 0, 0), energy=energy, color="#fff1de", angle=0.1)
    sun.rotation_euler = SUN_DIR.to_track_quat("-Z", "Y").to_euler()
    add_sun((math.radians(110), math.radians(10), math.radians(130)), energy=fill, color="#7fa5ff", angle=0.7)


def hidden(o, camera=False):
    o.visible_camera = camera
    o.visible_shadow = True


def add_ring(side, cam_visible=True):
    bpy.ops.mesh.primitive_cylinder_add(vertices=384, radius=2.45, depth=0.01)
    ring = bpy.context.object; ring.data.materials.append(ring_material(side))
    pivot = bpy.data.objects.new("pivot", None); bpy.context.scene.collection.objects.link(pivot)
    pivot.rotation_euler = RING_TILT
    ring.parent = pivot
    if not cam_visible:
        hidden(ring)
    return ring


def add_sphere(radius=1.0, mat=None):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=radius, segments=192, ring_count=128)
    o = bpy.context.object
    if mat: o.data.materials.append(mat)
    for p in o.data.polygons: p.use_smooth = True
    return o


def job_albedo():
    sc = reset(2048, 1024, 1, samples=8, name=PFX + "albedo", world=("#000000", 0.0), view="Standard")
    sc.render.film_transparent = False
    sc.cycles.use_denoising = False
    bpy.ops.mesh.primitive_plane_add(size=2)
    pl = bpy.context.object; pl.scale = (2, 1, 1)
    pl.data.materials.append(planet_albedo_material())
    add_camera((0, 0, 6), (0, 0, 0), ortho_scale=4.0)
    render(lambda t: None)


def job_shade():
    sc = reset(W, H, 1, samples=64, name=PFX + "stin", world=("#0a0f30", 0.0), view="Standard")
    white = material("bila", "#ffffff", roughness=0.7)
    add_sphere(1.0, white)
    add_ring("front", cam_visible=False)  # jen vrhá stín na planetu
    lights(3.14, 0.35)
    add_camera((0, -10, 0), (0, 0, 0), ortho_scale=ORTHO)
    render(lambda t: None)


def job_halo():
    sc = reset(W, H, 1, samples=48, name=PFX + "halo", world=("#000000", 0.0), view="Standard")
    # okrajová záře na kotouči planety
    m = bpy.data.materials.new("rim"); nt = nodes(m)
    o = N(nt, "ShaderNodeOutputMaterial"); lw = N(nt, "ShaderNodeLayerWeight", Blend=0.4)
    inv = math_(nt, "SUBTRACT", 1.0, lw.outputs["Facing"]); pw = math_(nt, "POWER", inv.outputs[0], 3.0); rs = math_(nt, "MULTIPLY", pw.outputs[0], 0.5)
    em = N(nt, "ShaderNodeEmission", Strength=1.2); em.inputs["Color"].default_value = hex_rgba(PAL["rim"])
    tr = N(nt, "ShaderNodeBsdfTransparent"); mx = N(nt, "ShaderNodeMixShader")
    L(nt, rs.outputs[0], mx.inputs[0]); L(nt, tr.outputs[0], mx.inputs[1]); L(nt, em.outputs[0], mx.inputs[2]); L(nt, mx.outputs[0], o.inputs[0])
    add_sphere(1.0, m)
    # vnější halo
    am = bpy.data.materials.new("atm"); nt = nodes(am)
    ao = N(nt, "ShaderNodeOutputMaterial"); alw = N(nt, "ShaderNodeLayerWeight", Blend=0.5)
    asc = math_(nt, "MULTIPLY", math_(nt, "POWER", alw.outputs["Facing"], 5.0).outputs[0], 0.55)
    aem = N(nt, "ShaderNodeEmission", Strength=1.1); aem.inputs["Color"].default_value = hex_rgba(PAL["atm"])
    atr = N(nt, "ShaderNodeBsdfTransparent"); amix = N(nt, "ShaderNodeMixShader")
    L(nt, asc.outputs[0], amix.inputs[0]); L(nt, atr.outputs[0], amix.inputs[1]); L(nt, aem.outputs[0], amix.inputs[2]); L(nt, amix.outputs[0], ao.inputs[0])
    add_sphere(1.045, am)
    add_camera((0, -10, 0), (0, 0, 0), ortho_scale=ORTHO)
    render(lambda t: None)


def job_ring(side):
    sc = reset(W, H, 1, samples=96, name=PFX + "prsten_" + ("zadni" if side == "back" else "predni"), world=("#0a0f30", 0.15), view="AgX", look="AgX - Punchy")
    add_ring(side)
    planet = add_sphere(1.0, material("stinitel", "#888888"))
    hidden(planet)  # planeta jen vrhá stín na prstenec
    lights(9.0, 0.9)
    add_camera((0, -10, 0), (0, 0, 0), ortho_scale=ORTHO)
    render(lambda t: None)


def job_moon(name, radius, a, b):
    sc = reset(256, 256, 1, samples=96, name=name, world=("#0a0f30", 0.15), view="AgX", look="AgX - Punchy")
    bpy.ops.mesh.primitive_uv_sphere_add(radius=radius, segments=128, ring_count=96)
    m = bpy.context.object; m.data.materials.append(moon_material(name, a, b))
    for p in m.data.polygons: p.use_smooth = True
    lights(9.0, 0.9)
    add_camera((0, -10, 0), (0, 0, 0), ortho_scale=radius * 2 * 1.06)
    render(lambda t: None)


if __name__ == "__main__":
    only = args()
    jobs = {
        "albedo": job_albedo, "stin": job_shade, "halo": job_halo,
        "zadni": lambda: job_ring("back"), "predni": lambda: job_ring("front"),
        "mesic1": lambda: job_moon(PFX + "mesic1", 0.24, *PAL["moon1"]),
        "mesic2": lambda: job_moon(PFX + "mesic2", 0.11, *PAL["moon2"]),
    }
    for name, fn in jobs.items():
        if not only or name in only:
            fn()
