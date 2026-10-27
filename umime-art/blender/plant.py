"""Rostliny pro animace: liána, která roste po křivce (list po listu), a květ, který rozkvétá."""
import math
import random

import bpy
from mathutils import Vector
from mathutils.geometry import interpolate_bezier

from common import *


def ease_out_cubic(x):
    x = min(1.0, max(0.0, x))
    return 1 - (1 - x) ** 3


def ease_in_out(x):
    x = min(1.0, max(0.0, x))
    return x * x * (3 - 2 * x)


def ease_out_back(x, s=1.9):
    x = min(1.0, max(0.0, x))
    return 1 + (s + 1) * (x - 1) ** 3 + s * (x - 1) ** 2


GREEN = "#3fcf73"
GREEN_DARK = "#1f9a52"
STEM = "#2aa85c"


def leaf_mesh(name, mat):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1, segments=20, ring_count=12)
    o = bpy.context.object
    o.name = name
    o.scale = (0.5, 0.11, 1.0)
    bpy.ops.object.transform_apply(scale=True)
    for p in o.data.polygons:
        p.use_smooth = True
    o.data.materials.append(mat)
    return o


class Vine:
    def __init__(self, points, radius=0.032, tip_scale=0.35, leaf_every=0.07, leaf_size=0.15, seed=1, flowers=(), name="vine"):
        rnd = random.Random(seed)
        self.stem_mat = material(name + "_stem", STEM, roughness=0.5)
        self.leaf_mat = material(name + "_leaf", GREEN, roughness=0.42)
        self.leaf_mat2 = material(name + "_leaf2", GREEN_DARK, roughness=0.42)
        cu = bpy.data.curves.new(name, "CURVE")
        cu.dimensions = "3D"
        cu.bevel_depth = radius
        cu.bevel_resolution = 5
        cu.use_fill_caps = True
        cu.bevel_factor_mapping_end = "SPLINE"
        cu.bevel_factor_start = 0.0
        cu.bevel_factor_end = 0.0
        sp = cu.splines.new("BEZIER")
        sp.bezier_points.add(len(points) - 1)
        for i, p in enumerate(points):
            bp = sp.bezier_points[i]
            bp.co = Vector(p)
            bp.handle_left_type = bp.handle_right_type = "AUTO"
            bp.radius = 1.0 - (1.0 - tip_scale) * (i / (len(points) - 1))
        self.obj = bpy.data.objects.new(name, cu)
        bpy.context.scene.collection.objects.link(self.obj)
        self.obj.data.materials.append(self.stem_mat)
        bpy.context.view_layer.update()

        # vzorky křivky pro pozice listů (podle délky oblouku)
        samples = []
        for i in range(len(points) - 1):
            a, b = sp.bezier_points[i], sp.bezier_points[i + 1]
            seg = interpolate_bezier(a.co, a.handle_right, b.handle_left, b.co, 24)
            samples.extend(seg if i == 0 else seg[1:])
        lengths = [0.0]
        for i in range(1, len(samples)):
            lengths.append(lengths[-1] + (samples[i] - samples[i - 1]).length)
        total = lengths[-1]
        self.samples, self.lengths, self.total = samples, lengths, total

        self.items = []  # (objekt, u, cílová velikost, doba růstu)
        u, side = 0.1, 1
        while u < 0.97:
            idx = min(range(len(lengths)), key=lambda k: abs(lengths[k] / total - u))
            pos = samples[idx]
            tan = (samples[min(idx + 1, len(samples) - 1)] - samples[max(idx - 1, 0)]).normalized()
            perp = Vector((-tan.z, 0, tan.x)) * side
            direction = (tan * 0.45 + perp * 0.9 + Vector((0, -0.25 * side, 0))).normalized()
            size = leaf_size * (1.0 - 0.45 * u) * rnd.uniform(0.85, 1.15)
            leaf = leaf_mesh(f"{name}_leaf{len(self.items)}", self.leaf_mat if rnd.random() < 0.6 else self.leaf_mat2)
            bpy.context.scene.collection.objects  # už přidáno operátorem
            leaf.rotation_mode = "QUATERNION"
            leaf.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(direction)
            leaf.location = pos + direction * size * 0.95
            leaf.scale = (0, 0, 0)
            self.items.append((leaf, u, size, 0.09))
            u += leaf_every * rnd.uniform(0.8, 1.2)
            side = -side

        # květy na zadaných pozicích (u)
        self.flowers = []
        for fu, scale in flowers:
            idx = min(range(len(lengths)), key=lambda k: abs(lengths[k] / total - fu))
            f = Flower(samples[idx] + Vector((0, -0.04, 0)), scale, seed=rnd.randint(0, 999), name=f"{name}_fl{len(self.flowers)}")
            self.flowers.append((f, fu))

    def update(self, g):
        """g = 0..1 podíl vyrostlé liány."""
        self.obj.data.bevel_factor_end = ease_in_out(g) if False else g
        for leaf, u, size, dur in self.items:
            k = ease_out_back((g - u) / dur) if g > u else 0.0
            leaf.scale = (size * k, size * k, size * k)
        for flower, fu in self.flowers:
            flower.update((g - fu) / 0.14)


class Flower:
    def __init__(self, pos, scale=0.16, petals=6, seed=3, colors=("#ff8fb7", "#ffd36b"), name="fl"):
        rnd = random.Random(seed)
        pet = material(name + "_p", colors[0], roughness=0.4)
        core = material(name + "_c", colors[1], roughness=0.35)
        self.scale = scale
        self.pivot = bpy.data.objects.new(name, None)
        bpy.context.scene.collection.objects.link(self.pivot)
        self.pivot.location = pos
        self.pivot.rotation_euler = (math.radians(rnd.uniform(-10, 10)), 0, math.radians(rnd.uniform(0, 60)))
        self.petals = []
        for i in range(petals):
            a = i / petals * math.tau
            bpy.ops.mesh.primitive_uv_sphere_add(radius=1, segments=20, ring_count=12)
            o = bpy.context.object
            o.scale = (0.38, 0.13, 0.7)
            bpy.ops.object.transform_apply(scale=True)
            for p in o.data.polygons: p.use_smooth = True
            o.data.materials.append(pet)
            o.parent = self.pivot
            self.petals.append((o, a))
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.34, segments=24, ring_count=16)
        self.core = bpy.context.object
        self.core.data.materials.append(core)
        for p in self.core.data.polygons: p.use_smooth = True
        self.core.parent = self.pivot
        self.update(0.0)

    def update(self, k):
        k = max(0.0, min(1.0, k))
        e = ease_out_back(k, 2.2)
        s = self.scale
        for o, a in self.petals:
            # okvětní lístek se rozevírá z pupenu: začíná složený nahoru a otevře se do kruhu
            open_ = ease_out_back(max(0.0, (k - 0.15) / 0.85), 1.6)
            r = 0.62 * open_
            o.location = (math.cos(a) * r * s, 0.0, math.sin(a) * r * s)
            o.rotation_euler = (0, -(a - math.pi / 2), 0)
            o.rotation_euler = (math.radians(0), 0, 0)
            o.rotation_mode = "XYZ"
            o.rotation_euler = (0, a - math.pi / 2, 0)
            o.rotation_euler = (math.radians(90 - 90), 0, 0)
            # směr lístku: osa Z lístku míří od středu ven
            from mathutils import Quaternion
            o.rotation_mode = "QUATERNION"
            o.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(Vector((math.cos(a), 0, math.sin(a))))
            o.scale = (s * e, s * e, s * e)
        self.core.scale = (s * e, s * e, s * e)
