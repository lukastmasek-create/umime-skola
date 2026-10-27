"""Materiály realistické planety, sdílené skripty planeta_vrstvy.py (vrstvy pro živé vykreslení ve WebGL)."""
import math
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from common import *

STORM = (0.34, -0.9, -0.28)


def nodes(mat):
    mat.use_nodes = True
    mat.node_tree.nodes.clear()
    return mat.node_tree


def N(nt, kind, **inputs):
    n = nt.nodes.new(kind)
    for k, v in inputs.items():
        n.inputs[k].default_value = v
    return n


def L(nt, a, b):
    nt.links.new(a, b)


def math_(nt, op, a=None, b=None, *, clamp=False):
    n = nt.nodes.new("ShaderNodeMath"); n.operation = op; n.use_clamp = clamp
    if a is not None:
        nt.links.new(a, n.inputs[0]) if not isinstance(a, (int, float)) else setattr(n.inputs[0], "default_value", a)
    if b is not None:
        nt.links.new(b, n.inputs[1]) if not isinstance(b, (int, float)) else setattr(n.inputs[1], "default_value", b)
    return n


def equirect_vector(nt):
    """Bod na jednotkové kouli z UV (u = délka, v = šířka). Stejný vzorec je v shaderu na webu."""
    uv = N(nt, "ShaderNodeUVMap")
    sep = N(nt, "ShaderNodeSeparateXYZ"); L(nt, uv.outputs["UV"], sep.inputs[0])
    lon = math_(nt, "MULTIPLY", math_(nt, "SUBTRACT", sep.outputs["X"], 0.5).outputs[0], math.tau)
    lat = math_(nt, "MULTIPLY", math_(nt, "SUBTRACT", sep.outputs["Y"], 0.5).outputs[0], math.pi)
    cl = math_(nt, "COSINE", lat.outputs[0])
    x = math_(nt, "MULTIPLY", cl.outputs[0], math_(nt, "COSINE", lon.outputs[0]).outputs[0])
    y = math_(nt, "MULTIPLY", cl.outputs[0], math_(nt, "SINE", lon.outputs[0]).outputs[0])
    z = math_(nt, "SINE", lat.outputs[0])
    comb = N(nt, "ShaderNodeCombineXYZ")
    L(nt, x.outputs[0], comb.inputs["X"]); L(nt, y.outputs[0], comb.inputs["Y"]); L(nt, z.outputs[0], comb.inputs["Z"])
    return comb.outputs["Vector"]


def planet_albedo_material():
    """Barva povrchu plynného obra (bez osvětlení); vykresluje se na plochu jako rovnoúhlá textura."""
    pm = bpy.data.materials.new("plynny_obr_albedo"); nt = nodes(pm)
    out = N(nt, "ShaderNodeOutputMaterial")
    pos = equirect_vector(nt)

    dist = N(nt, "ShaderNodeVectorMath"); dist.operation = "DISTANCE"; dist.inputs[1].default_value = STORM
    L(nt, pos, dist.inputs[0])
    s1 = math_(nt, "DIVIDE", dist.outputs["Value"], 0.62)
    s2 = math_(nt, "SUBTRACT", 1.0, s1.outputs[0], clamp=True)
    s3 = math_(nt, "POWER", s2.outputs[0], 2.2)
    ang = math_(nt, "MULTIPLY", s3.outputs[0], 4.2)
    rot = N(nt, "ShaderNodeVectorRotate"); rot.rotation_type = "AXIS_ANGLE"
    rot.inputs["Axis"].default_value = STORM; rot.inputs["Center"].default_value = (0, 0, 0)
    L(nt, pos, rot.inputs["Vector"]); L(nt, ang.outputs[0], rot.inputs["Angle"])
    q = rot.outputs["Vector"]
    sep = N(nt, "ShaderNodeSeparateXYZ"); L(nt, q, sep.inputs[0])

    n1 = N(nt, "ShaderNodeTexNoise", Scale=2.0, Detail=12.0, Roughness=0.62, Distortion=0.9); L(nt, q, n1.inputs["Vector"])
    st = N(nt, "ShaderNodeMapping"); st.inputs["Scale"].default_value = (1.1, 1.1, 8.0); L(nt, q, st.inputs["Vector"])
    n2 = N(nt, "ShaderNodeTexNoise", Scale=4.5, Detail=14.0, Roughness=0.7, Distortion=0.4); L(nt, st.outputs["Vector"], n2.inputs["Vector"])
    st2 = N(nt, "ShaderNodeMapping"); st2.inputs["Scale"].default_value = (2.2, 2.2, 22.0); L(nt, q, st2.inputs["Vector"])
    n3 = N(nt, "ShaderNodeTexNoise", Scale=9.0, Detail=10.0, Roughness=0.65); L(nt, st2.outputs["Vector"], n3.inputs["Vector"])

    a2 = math_(nt, "MULTIPLY", math_(nt, "SUBTRACT", n1.outputs["Fac"], 0.5).outputs[0], 0.16)
    b2 = math_(nt, "MULTIPLY", math_(nt, "SUBTRACT", n2.outputs["Fac"], 0.5).outputs[0], 0.08)
    lat = math_(nt, "ADD", sep.outputs["Z"], a2.outputs[0]); lat2 = math_(nt, "ADD", lat.outputs[0], b2.outputs[0])
    sn1w = math_(nt, "MULTIPLY", math_(nt, "SINE", math_(nt, "MULTIPLY", lat2.outputs[0], 15.0).outputs[0]).outputs[0], 0.62)
    m2b = math_(nt, "ADD", math_(nt, "MULTIPLY", lat2.outputs[0], 39.0).outputs[0], 1.3)
    sn2w = math_(nt, "MULTIPLY", math_(nt, "SINE", m2b.outputs[0]).outputs[0], 0.28)
    sn3w = math_(nt, "MULTIPLY", math_(nt, "SINE", math_(nt, "MULTIPLY", lat2.outputs[0], 83.0).outputs[0]).outputs[0], 0.10)
    sum2 = math_(nt, "ADD", math_(nt, "ADD", sn1w.outputs[0], sn2w.outputs[0]).outputs[0], sn3w.outputs[0])
    band = math_(nt, "MULTIPLY_ADD", sum2.outputs[0], 0.5); band.inputs[2].default_value = 0.5; band.use_clamp = True

    ramp = N(nt, "ShaderNodeValToRGB")
    stops = [(0.0, "#5e220e"), (0.15, "#a24a1f"), (0.3, "#d9873f"), (0.44, "#f2cf96"), (0.52, "#e6b06a"), (0.58, "#a9c29a"), (0.62, "#4f8f7c"), (0.67, "#c98a4a"), (0.78, "#d48a45"), (0.9, "#8a3a18"), (1.0, "#4a1a0c")]
    ramp.color_ramp.elements[0].position = stops[0][0]; ramp.color_ramp.elements[0].color = hex_rgba(stops[0][1])
    ramp.color_ramp.elements[1].position = stops[-1][0]; ramp.color_ramp.elements[1].color = hex_rgba(stops[-1][1])
    for p_, c in stops[1:-1]:
        e = ramp.color_ramp.elements.new(p_); e.color = hex_rgba(c)
    L(nt, band.outputs[0], ramp.inputs[0])

    det = math_(nt, "MULTIPLY_ADD", n3.outputs["Fac"], 0.55); det.inputs[2].default_value = 0.72
    mixdet = N(nt, "ShaderNodeMix"); mixdet.data_type = "RGBA"; mixdet.blend_type = "MULTIPLY"; mixdet.inputs[0].default_value = 1.0
    L(nt, ramp.outputs[0], mixdet.inputs[6])
    detc = N(nt, "ShaderNodeCombineColor")
    for i in range(3): L(nt, det.outputs[0], detc.inputs[i])
    L(nt, detc.outputs[0], mixdet.inputs[7])

    sx2 = math_(nt, "POWER", math_(nt, "MULTIPLY", dist.outputs["Value"], 3.2).outputs[0], 2.0)
    smask = math_(nt, "EXPONENT", math_(nt, "MULTIPLY", sx2.outputs[0], -1.0).outputs[0])
    storm_col = N(nt, "ShaderNodeValToRGB")
    storm_col.color_ramp.elements[0].color = hex_rgba("#c8482a"); storm_col.color_ramp.elements[1].color = hex_rgba("#ffe6c4")
    L(nt, n1.outputs["Fac"], storm_col.inputs[0])
    smask2 = math_(nt, "MULTIPLY", smask.outputs[0], 0.85)
    mixstorm = N(nt, "ShaderNodeMix"); mixstorm.data_type = "RGBA"
    L(nt, smask2.outputs[0], mixstorm.inputs[0]); L(nt, mixdet.outputs[2], mixstorm.inputs[6]); L(nt, storm_col.outputs[0], mixstorm.inputs[7])
    em = N(nt, "ShaderNodeEmission", Strength=1.0); L(nt, mixstorm.outputs[2], em.inputs["Color"]); L(nt, em.outputs[0], out.inputs[0])
    return pm


def ring_material(side):
    """Prstenec s mezerami; side = 'back' (za planetou, svět y > 0) nebo 'front' (před planetou, y < 0)."""
    rm = bpy.data.materials.new("prstenec_" + side); nt = nodes(rm)
    ro = N(nt, "ShaderNodeOutputMaterial"); rb = N(nt, "ShaderNodeBsdfPrincipled", Roughness=0.75)
    rtc = N(nt, "ShaderNodeTexCoord"); rl = N(nt, "ShaderNodeVectorMath"); rl.operation = "LENGTH"; L(nt, rtc.outputs["Object"], rl.inputs[0])
    rn = math_(nt, "MULTIPLY", rl.outputs["Value"], 1 / 2.45)
    prof = N(nt, "ShaderNodeValToRGB"); prof.color_ramp.interpolation = "LINEAR"
    pts = [(0.0, 0.0), (0.52, 0.0), (0.545, 0.22), (0.58, 0.45), (0.63, 0.62), (0.68, 0.78), (0.70, 0.95), (0.78, 0.98), (0.80, 0.08), (0.815, 0.06), (0.83, 0.86), (0.90, 0.9), (0.93, 0.55), (0.955, 0.78), (0.98, 0.3), (1.0, 0.0)]
    prof.color_ramp.elements[0].position = pts[0][0]; prof.color_ramp.elements[0].color = (pts[0][1],) * 3 + (1,)
    prof.color_ramp.elements[1].position = pts[1][0]; prof.color_ramp.elements[1].color = (pts[1][1],) * 3 + (1,)
    for p_, v in pts[2:]:
        e = prof.color_ramp.elements.new(p_); e.color = (v, v, v, 1)
    L(nt, rn.outputs[0], prof.inputs[0])
    fine = N(nt, "ShaderNodeTexNoise", Scale=140.0, Detail=4.0, Roughness=0.6); fine.noise_dimensions = "1D"; L(nt, rn.outputs[0], fine.inputs["W"])
    fine2 = N(nt, "ShaderNodeTexNoise", Scale=38.0, Detail=3.0, Roughness=0.5); fine2.noise_dimensions = "1D"; L(nt, rn.outputs[0], fine2.inputs["W"])
    fmul = math_(nt, "MULTIPLY_ADD", fine.outputs["Fac"], 0.9); fmul.inputs[2].default_value = 0.35
    fmul2 = math_(nt, "MULTIPLY_ADD", fine2.outputs["Fac"], 0.8); fmul2.inputs[2].default_value = 0.4
    alpha = math_(nt, "MULTIPLY", math_(nt, "MULTIPLY", prof.outputs[0], fmul.outputs[0]).outputs[0], fmul2.outputs[0])
    alpha3 = math_(nt, "MULTIPLY", alpha.outputs[0], 1.25, clamp=True)
    # polovina před / za planetou podle světové souřadnice y
    geo = N(nt, "ShaderNodeNewGeometry"); gsep = N(nt, "ShaderNodeSeparateXYZ"); L(nt, geo.outputs["Position"], gsep.inputs[0])
    half = math_(nt, "GREATER_THAN" if side == "back" else "LESS_THAN", gsep.outputs["Y"], 0.0)
    alpha4 = math_(nt, "MULTIPLY", alpha3.outputs[0], half.outputs[0])
    cr = N(nt, "ShaderNodeValToRGB")
    cr.color_ramp.elements[0].color = hex_rgba("#3d5a68"); cr.color_ramp.elements[1].color = hex_rgba("#98b8c4")
    e = cr.color_ramp.elements.new(0.5); e.color = hex_rgba("#6b8f9e")
    L(nt, fine2.outputs["Fac"], cr.inputs[0]); L(nt, cr.outputs[0], rb.inputs["Base Color"])
    invr = math_(nt, "SUBTRACT", 1.0, alpha4.outputs[0])
    rt = N(nt, "ShaderNodeBsdfTransparent"); rmix = N(nt, "ShaderNodeMixShader")
    L(nt, invr.outputs[0], rmix.inputs[0]); L(nt, rb.outputs[0], rmix.inputs[1]); L(nt, rt.outputs[0], rmix.inputs[2]); L(nt, rmix.outputs[0], ro.inputs[0])
    return rm


def moon_material(name, base_a, base_b):
    m = bpy.data.materials.new(name); nt = nodes(m)
    o = N(nt, "ShaderNodeOutputMaterial"); b = N(nt, "ShaderNodeBsdfPrincipled", Roughness=0.9)
    t = N(nt, "ShaderNodeTexCoord")
    v = N(nt, "ShaderNodeTexVoronoi", Scale=6.0); v.feature = "F1"; L(nt, t.outputs["Object"], v.inputs["Vector"])
    v2 = N(nt, "ShaderNodeTexVoronoi", Scale=16.0); L(nt, t.outputs["Object"], v2.inputs["Vector"])
    nz = N(nt, "ShaderNodeTexNoise", Scale=7.0, Detail=12.0); L(nt, t.outputs["Object"], nz.inputs["Vector"])
    cp = math_(nt, "POWER", math_(nt, "SUBTRACT", 1.0, v.outputs["Distance"], clamp=True).outputs[0], 2.0)
    c2p = math_(nt, "MULTIPLY", math_(nt, "SUBTRACT", 1.0, v2.outputs["Distance"], clamp=True).outputs[0], 0.4)
    h2 = math_(nt, "SUBTRACT", math_(nt, "SUBTRACT", nz.outputs["Fac"], cp.outputs[0]).outputs[0], c2p.outputs[0])
    bu = N(nt, "ShaderNodeBump", Strength=1.2, Distance=0.04); L(nt, h2.outputs[0], bu.inputs["Height"]); L(nt, bu.outputs["Normal"], b.inputs["Normal"])
    r = N(nt, "ShaderNodeValToRGB"); r.color_ramp.elements[0].color = hex_rgba(base_a); r.color_ramp.elements[1].color = hex_rgba(base_b)
    L(nt, nz.outputs["Fac"], r.inputs[0]); L(nt, r.outputs[0], b.inputs["Base Color"]); L(nt, b.outputs[0], o.inputs[0])
    return m
