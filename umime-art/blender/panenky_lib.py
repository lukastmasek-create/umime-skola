"""Nástroje pro realistické panenky: profilové lofty, hlava s morph targety, textury z numpy/PIL, materiály pro glTF.

Souřadnice: panenka stojí na z = 0, hledí do -Y, vysoká asi 2 jednotky (7,5 hlavy). x doprava (z pohledu diváka).
"""
import math
import os
import sys

import bpy
import numpy as np
from mathutils import Vector
from mathutils.bvhtree import BVHTree
from PIL import Image, ImageDraw, ImageFilter

TEXDIR = "/tmp/claude-0/doll_tex"
os.makedirs(TEXDIR, exist_ok=True)


# ---------------------------------------------------------------- matematika
def smooth(a, b, x):
    t = np.clip((np.asarray(x, dtype=float) - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


def gauss(x, s=1.0):
    return np.exp(-((np.asarray(x, dtype=float) / s) ** 2))


def hex_rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i : i + 2], 16) / 255 for i in (0, 2, 4))


def lin(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def hex_lin(h, a=1.0):
    r, g, b = hex_rgb(h)
    return (lin(r), lin(g), lin(b), a)


def catmull(pts, n):
    """Catmull-Rom spline přes řídicí body (k, d) → n bodů (hladká křivka v prostoru)."""
    P = np.asarray(pts, dtype=float)
    P = np.vstack([P[0] * 2 - P[1], P, P[-1] * 2 - P[-2]])
    out = []
    segs = len(P) - 3
    for i in range(n):
        u = i / (n - 1) * segs
        s = min(int(u), segs - 1)
        t = u - s
        p0, p1, p2, p3 = P[s], P[s + 1], P[s + 2], P[s + 3]
        out.append(0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t ** 3))
    return np.array(out)


def interp_prof(nodes, zs):
    """nodes: [(z, v1, v2, ...)] → hodnoty ve výškách zs (Catmull-Rom po výšce)."""
    N = np.asarray(nodes, dtype=float)
    dense = catmull(N, 400)
    order = np.argsort(dense[:, 0])
    dz = dense[order]
    return np.stack([np.interp(zs, dz[:, 0], dz[:, k]) for k in range(1, N.shape[1])], axis=1)


# ---------------------------------------------------------------- síť
_scene_root = None


def node(name, parent=None):
    o = bpy.data.objects.new(name, None)
    bpy.context.scene.collection.objects.link(o)
    if parent:
        o.parent = parent
    return o


def make_mesh(name, V, faces, mat=None, uvs=None, parent=None, shade=True):
    """V: (N,3), faces: seznam n-tic indexů, uvs: seznam (u, v) pro každý loop (v pořadí faces)."""
    me = bpy.data.meshes.new(name)
    me.from_pydata(np.asarray(V).tolist(), [], faces)
    me.update()
    if uvs is not None:
        layer = me.uv_layers.new(name="UVMap")
        flat = np.asarray(uvs, dtype=float).reshape(-1)
        layer.data.foreach_set("uv", flat)
    if shade:
        me.polygons.foreach_set("use_smooth", [True] * len(me.polygons))
    o = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(o)
    if mat is not None:
        me.materials.append(mat)
    if parent:
        o.parent = parent
    return o


def ring_grid(R, closed=True, cap0=None, cap1=None, uscale=1.0, vscale=1.0):
    """R: (rings, n, 3) → (V, faces, uvs). Obruč se spojí, kryty jsou trojúhelníkové vějíře do bodu cap0/cap1."""
    R = np.asarray(R, dtype=float)
    m, n, _ = R.shape
    V = [R.reshape(-1, 3)]
    extra = 0
    c0 = c1 = None
    if cap0 is not None:
        V.append(np.asarray(cap0, dtype=float).reshape(1, 3))
        c0 = m * n + extra
        extra += 1
    if cap1 is not None:
        V.append(np.asarray(cap1, dtype=float).reshape(1, 3))
        c1 = m * n + extra
        extra += 1
    faces, uvs = [], []
    nn = n if closed else n - 1
    for j in range(m - 1):
        for i in range(nn):
            i2 = (i + 1) % n
            faces.append((j * n + i, j * n + i2, (j + 1) * n + i2, (j + 1) * n + i))
            u0, u1 = i / nn * uscale, (i + 1) / nn * uscale
            v0, v1 = j / (m - 1) * vscale, (j + 1) / (m - 1) * vscale
            uvs += [(u0, v0), (u1, v0), (u1, v1), (u0, v1)]
    if c0 is not None:
        for i in range(nn):
            i2 = (i + 1) % n
            faces.append((c0, i2, i))
            uvs += [((i + 0.5) / nn * uscale, 0), ((i + 1) / nn * uscale, 0), (i / nn * uscale, 0)]
    if c1 is not None:
        base = (m - 1) * n
        for i in range(nn):
            i2 = (i + 1) % n
            faces.append((c1, base + i, base + i2))
            uvs += [((i + 0.5) / nn * uscale, vscale), (i / nn * uscale, vscale), ((i + 1) / nn * uscale, vscale)]
    return np.vstack(V), faces, uvs


def elliptic_ring(cx, cy, z, rx, ry, n=36, power=2.0, start=math.pi / 2):
    """Superelipsa v rovině z. Index 0 = zadní střed (+Y), takže šev leží vzadu; obíhá proti směru hodin shora."""
    t = start + np.arange(n) * 2 * math.pi / n
    c, s = np.cos(t), np.sin(t)
    e = 2.0 / power
    x = cx + rx * np.sign(c) * np.abs(c) ** e
    y = cy + ry * np.sign(s) * np.abs(s) ** e
    return np.stack([x, y, np.full(n, z)], axis=1)


def frames(path, n0=None):
    """Kolmé osy podél lomené čáry (paralelní transport)."""
    P = np.asarray(path, dtype=float)
    T = np.gradient(P, axis=0)
    T /= np.linalg.norm(T, axis=1, keepdims=True) + 1e-9
    ref = np.array([0, 1.0, 0]) if abs(T[0, 1]) < 0.9 else np.array([1.0, 0, 0])
    N = np.cross(T[0], ref) if n0 is None else np.asarray(n0, dtype=float)
    N = N - T[0] * np.dot(N, T[0])
    N /= np.linalg.norm(N) + 1e-9
    Ns, Bs = [], []
    for k in range(len(P)):
        if k > 0:
            ax = np.cross(T[k - 1], T[k])
            sn = np.linalg.norm(ax)
            if sn > 1e-8:
                ax /= sn
                ang = math.atan2(sn, float(np.dot(T[k - 1], T[k])))
                N = N * math.cos(ang) + np.cross(ax, N) * math.sin(ang) + ax * np.dot(ax, N) * (1 - math.cos(ang))
        N = N - T[k] * np.dot(N, T[k])
        N /= np.linalg.norm(N) + 1e-9
        Ns.append(N.copy())
        Bs.append(np.cross(T[k], N))
    return T, np.array(Ns), np.array(Bs)


def tube(path, wid, thk, n=10, mat=None, name="tube", parent=None, cap=True, uscale=1.0, vlen=None, power=2.0, twist=None, shade=True, n0=None):
    """Trubice podél cesty s eliptickým průřezem (šířka wid, tloušťka thk po bodech). Vrací objekt."""
    P = np.asarray(path, dtype=float)
    k = len(P)
    wid = np.broadcast_to(np.asarray(wid, dtype=float), (k,))
    thk = np.broadcast_to(np.asarray(thk, dtype=float), (k,))
    T, N, B = frames(P, n0)
    t = np.arange(n) * 2 * math.pi / n
    rings = []
    for i in range(k):
        tw = 0.0 if twist is None else twist[i]
        c, s = np.cos(t + tw), np.sin(t + tw)
        e = 2.0 / power
        a = np.sign(c) * np.abs(c) ** e
        b = np.sign(s) * np.abs(s) ** e
        rings.append(P[i] + N[i] * (wid[i] * a)[:, None] + B[i] * (thk[i] * b)[:, None])
    V, F, UV = ring_grid(np.array(rings), True, cap0=P[0] if cap else None, cap1=P[-1] if cap else None, uscale=uscale, vscale=vlen or 1.0)
    return make_mesh(name, V, F, mat, UV, parent, shade)


def loft_profile(zs, rx, ry, cx=None, cy=None, n=40, power=2.0, mat=None, name="loft", parent=None, bump=None, cap_bottom=True, cap_top=True, uscale=1.0):
    """Svislý loft po výšce: půdorys superelipsa (rx, ry) s posuvem (cx, cy). bump(x,y,z)->(dx,dy,dz) může tvar upravit."""
    m = len(zs)
    cx = np.zeros(m) if cx is None else cx
    cy = np.zeros(m) if cy is None else cy
    R = np.array([elliptic_ring(cx[j], cy[j], zs[j], rx[j], ry[j], n, power) for j in range(m)])
    if bump is not None:
        d = bump(R[..., 0], R[..., 1], R[..., 2])
        R = R + np.stack(d, axis=-1)
    c0 = R[0].mean(axis=0) if cap_bottom else None
    c1 = R[-1].mean(axis=0) if cap_top else None
    V, F, UV = ring_grid(R, True, cap0=c0, cap1=c1, uscale=uscale)
    return make_mesh(name, V, F, mat, UV, parent), R


# ---------------------------------------------------------------- materiály
def tex_node_image(mat, img_path, color_space="sRGB"):
    img = bpy.data.images.load(img_path, check_existing=True)
    img.colorspace_settings.name = color_space
    n = mat.node_tree.nodes.new("ShaderNodeTexImage")
    n.image = img
    return n


def make_mat(name, color="#ffffff", rough=0.6, metal=0.0, tex=None, normal=None, alpha=None, coat=0.0, coat_rough=0.1, sheen=0.0, sheen_rough=0.5,
             emission=None, emission_strength=0.0, transmission=0.0, ior=1.45, spec=0.5, vcol=False, double=True, tint_tex=True):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = hex_lin(color) if isinstance(color, str) else color
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    b.inputs["IOR"].default_value = ior
    for k, v in (("Coat Weight", coat), ("Coat Roughness", coat_rough), ("Sheen Weight", sheen), ("Sheen Roughness", sheen_rough), ("Transmission Weight", transmission),
                 ("Specular IOR Level", spec)):
        if k in b.inputs:
            b.inputs[k].default_value = v
    if emission:
        b.inputs["Emission Color"].default_value = hex_lin(emission)
        b.inputs["Emission Strength"].default_value = emission_strength
    if alpha is not None:
        b.inputs["Alpha"].default_value = alpha
        try:
            m.surface_render_method = "BLENDED"
        except Exception:
            pass
    if tex:
        t = tex_node_image(m, tex)
        if color not in (None, "#ffffff") and tint_tex:
            # textura × barva materiálu (web pak mění odstín přes materiálovou barvu)
            mix = nt.nodes.new("ShaderNodeMix")
            mix.data_type = "RGBA"
            mix.blend_type = "MULTIPLY"
            mix.inputs[0].default_value = 1.0
            mix.inputs[7].default_value = hex_lin(color)
            nt.links.new(t.outputs["Color"], mix.inputs[6])
            nt.links.new(mix.outputs[2], b.inputs["Base Color"])
        else:
            nt.links.new(t.outputs["Color"], b.inputs["Base Color"])
        if alpha is not None and tex.endswith(".png"):
            nt.links.new(t.outputs["Alpha"], b.inputs["Alpha"])
    if normal:
        t = tex_node_image(m, normal, "Non-Color")
        nm = nt.nodes.new("ShaderNodeNormalMap")
        nm.inputs["Strength"].default_value = 1.0
        nt.links.new(t.outputs["Color"], nm.inputs["Color"])
        nt.links.new(nm.outputs["Normal"], b.inputs["Normal"])
    m.use_backface_culling = not double
    return m


# ---------------------------------------------------------------- BVH, ambient occlusion
def bvh_of(objs, depsgraph=None):
    verts, tris = [], []
    off = 0
    for o in objs:
        me = o.data
        mw = o.matrix_world
        vs = [mw @ v.co for v in me.vertices]
        verts += vs
        for p in me.polygons:
            idx = list(p.vertices)
            for k in range(1, len(idx) - 1):
                tris.append((off + idx[0], off + idx[k], off + idx[k + 1]))
        off += len(vs)
    return BVHTree.FromPolygons(verts, tris)


def bake_ao(obj, tree, rays=14, dist=0.12, strength=0.85, seed=1):
    """Ambient occlusion na vrcholech (vertex color) — hloubka ve švech, pod oděvem, mezi prsty."""
    rng = np.random.default_rng(seed)
    me = obj.data
    mw = obj.matrix_world
    nrm = np.zeros((len(me.vertices), 3))
    me.calc_normals_split() if hasattr(me, "calc_normals_split") else None
    for i, v in enumerate(me.vertices):
        nrm[i] = (mw.to_3x3() @ v.normal).normalized()
    dirs = rng.normal(size=(rays, 3))
    dirs /= np.linalg.norm(dirs, axis=1, keepdims=True)
    ao = np.ones(len(me.vertices))
    for i, v in enumerate(me.vertices):
        p = mw @ v.co
        n = Vector(nrm[i])
        hit = 0.0
        for d in dirs:
            dv = Vector(d)
            if dv.dot(n) < 0:
                dv = -dv
            dv = (dv + n * 0.6).normalized()
            res = tree.ray_cast(p + n * 0.0015, dv, dist)
            if res[0] is not None:
                hit += 1.0 - res[3] / dist * 0.55
        ao[i] = 1.0 - strength * hit / rays
    col = me.color_attributes.new("AO", "FLOAT_COLOR", "POINT")
    vals = np.repeat(ao[:, None], 4, axis=1)
    vals[:, 3] = 1.0
    col.data.foreach_set("color", vals.reshape(-1).tolist())
    me.color_attributes.active_color = col
    return ao


# ---------------------------------------------------------------- textury
def noise_field(size, scale, seed=0):
    rng = np.random.default_rng(seed)
    small = rng.random((max(2, size // scale), max(2, size // scale))).astype(np.float32)
    im = Image.fromarray((small * 255).astype(np.uint8)).resize((size, size), Image.BICUBIC)
    return np.asarray(im, dtype=np.float32) / 255.0


def save_png(arr, name):
    path = os.path.join(TEXDIR, name)
    Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8)).save(path)
    return path


def normal_from_height(h, strength=2.0):
    gy, gx = np.gradient(h.astype(np.float32))
    nx, ny, nz = -gx * strength, gy * strength, np.ones_like(h)
    ln = np.sqrt(nx * nx + ny * ny + nz * nz)
    return np.stack([(nx / ln * 0.5 + 0.5) * 255, (ny / ln * 0.5 + 0.5) * 255, (nz / ln * 0.5 + 0.5) * 255], axis=-1)


# ---------------------------------------------------------------- oděvy: sítě s ořezem a fyzickým UV
def ring_mesh(R, closed=True, keep=None, tile=(0.25, 0.25), name="cloth", mat=None, parent=None, flip=False):
    """R: (m, n, 3). UV podle skutečné délky (textura se opakuje po `tile` jednotkách). keep(center)->bool ořízne plochy."""
    R = np.asarray(R, dtype=float)
    m, n, _ = R.shape
    nn = n if closed else n - 1
    nxt = np.roll(R, -1, axis=1) if closed else np.concatenate([R[:, 1:], R[:, -1:]], axis=1)
    seg = np.linalg.norm(nxt - R, axis=2)
    U = np.concatenate([np.zeros((m, 1)), np.cumsum(seg[:, :nn], axis=1)], axis=1)  # (m, nn+1)
    col = np.linalg.norm(R[1:] - R[:-1], axis=2)
    Vd = np.concatenate([np.zeros((1, n)), np.cumsum(col, axis=0)], axis=0)
    faces, uvs = [], []
    for j in range(m - 1):
        for i in range(nn):
            i2 = (i + 1) % n
            a, b, c, d = j * n + i, j * n + i2, (j + 1) * n + i2, (j + 1) * n + i
            if keep is not None:
                ctr = (R[j, i] + R[j, i2] + R[j + 1, i2] + R[j + 1, i]) / 4
                if not keep(ctr):
                    continue
            quad = (a, b, c, d) if not flip else (a, d, c, b)
            faces.append(quad)
            uv = [(U[j, i] / tile[0], Vd[j, i] / tile[1]), (U[j, i + 1] / tile[0], Vd[j, i2] / tile[1]), (U[j + 1, i + 1] / tile[0], Vd[j + 1, i2] / tile[1]), (U[j + 1, i] / tile[0], Vd[j + 1, i] / tile[1])]
            if flip:
                uv = [uv[0], uv[3], uv[2], uv[1]]
            uvs += uv
    # nepoužité vrcholy se odstraní až při exportu; pro čistotu je přemapujeme
    used = sorted({v for f in faces for v in f})
    remap = {v: k for k, v in enumerate(used)}
    V = R.reshape(-1, 3)[used]
    faces = [tuple(remap[v] for v in f) for f in faces]
    return make_mesh(name, V, faces, mat, uvs, parent)


def ring_path(center, rx, ry, z, n=96, start=math.pi / 2, wobble=None):
    t = start + np.arange(n) * 2 * math.pi / n
    r = np.stack([center[0] + rx * np.cos(t), center[1] + ry * np.sin(t), np.full(n, z)], axis=1)
    if wobble is not None:
        r[:, 2] += wobble(t)
    return r
