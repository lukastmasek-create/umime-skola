"""Kostra, váhy a animace panenek: spojení sítí podle slotů, armatura z geometrie těla, ruční váhy podle vzdálenosti a smyčky/gesta.

Animace (NLA stopy → glTF animace): idle (smyčka), happy (tanec podle panenky), sad, pose_hair/outfit/shoes/makeup/accessory/topper.
"""
import math
import re

from mathutils import Matrix, Quaternion, Vector

from panenky_hair import *  # noqa: F401,F403

BONES = {}  # jméno -> (rodič, hlava, ocas, poloměr vlivu)


def define_bones():
    B = {}
    B["root"] = (None, (0, 0.01, 0.0), (0, 0.01, 0.12), 0.0)
    B["hips"] = ("root", (0, 0.008, 0.98), (0, 0.008, 1.14), 0.17)
    B["spine"] = ("hips", (0, 0.0, 1.14), (0, 0.0, 1.31), 0.15)
    B["chest"] = ("spine", (0, 0.0, 1.31), (0, 0.0, 1.50), 0.16)
    B["neck"] = ("chest", (0, 0.008, 1.50), (0, 0.01, 1.70), 0.05)
    B["head"] = ("neck", (0, 0.01, 1.70), (0, 0.01, 2.12), 0.30)
    for s, sd in ((1, "L"), (-1, "R")):
        B["clavicle." + sd] = ("chest", (s * 0.03, 0.0, 1.52), (s * 0.165, 0.0, 1.505), 0.06)
        sh, el, wr = arm_geo(s)[0][0], arm_geo(s)[0][5], arm_geo(s)[0][-1]
        B["upperarm." + sd] = ("clavicle." + sd, tuple(sh), tuple(el), 0.055)
        B["forearm." + sd] = ("upperarm." + sd, tuple(el), tuple(wr), 0.045)
        d = np.array([-s * 0.10, 0.0, -1.0])
        d /= np.linalg.norm(d)
        B["hand." + sd] = ("forearm." + sd, tuple(wr), tuple(wr + d * 0.12), 0.045)
        lp = leg_geo(s)[0]
        B["thigh." + sd] = ("hips", (s * 0.083, 0.004, 1.05), tuple(lp[7]), 0.10)
        B["shin." + sd] = ("thigh." + sd, tuple(lp[7]), tuple(lp[-1]), 0.06)
        B["foot." + sd] = ("shin." + sd, tuple(lp[-1]), (s * 0.076, -0.19, 0.03), 0.05)
    return B


def make_armature():
    bpy.ops.object.select_all(action="DESELECT")
    arm = bpy.data.armatures.new("Armature")
    obj = bpy.data.objects.new("Armature", arm)
    bpy.context.scene.collection.objects.link(obj)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.mode_set(mode="EDIT")
    eb = {}
    for name, (parent, h, t, r) in BONES.items():
        b = arm.edit_bones.new(name)
        b.head, b.tail = Vector(h), Vector(t)
        b.roll = 0.0
        eb[name] = b
    for name, (parent, h, t, r) in BONES.items():
        if parent:
            eb[name].parent = eb[parent]
    bpy.ops.object.mode_set(mode="OBJECT")
    return obj


# ---------------------------------------------------------------- spojení sítí a váhy
HEAD_ONLY = ("head",)
BODY_ALL = ("hips", "spine", "chest", "neck", "head", "clavicle.L", "clavicle.R", "upperarm.L", "upperarm.R", "forearm.L", "forearm.R", "hand.L", "hand.R", "thigh.L", "thigh.R", "shin.L", "shin.R", "foot.L", "foot.R")
TORSO_SET = ("hips", "spine", "chest", "neck", "head", "clavicle.L", "clavicle.R", "thigh.L", "thigh.R")
ARM_SET = ("chest", "clavicle.L", "clavicle.R", "upperarm.L", "upperarm.R", "forearm.L", "forearm.R", "hand.L", "hand.R")
LEG_SET = ("hips", "thigh.L", "thigh.R", "shin.L", "shin.R", "foot.L", "foot.R")
GARMENT_SET = ("hips", "spine", "chest", "neck", "head", "clavicle.L", "clavicle.R", "upperarm.L", "upperarm.R", "thigh.L", "thigh.R")
LOWER_SET = ("hips", "spine", "thigh.L", "thigh.R")
HAIR_SET = ("head", "neck", "chest", "spine", "clavicle.L", "clavicle.R")
FOOT_SET = ("foot.L", "foot.R", "shin.L", "shin.R")
CHEST_SET = ("chest", "neck", "spine", "head")
HAND_R = ("hand.L", "forearm.L", "upperarm.L")  # strana x > 0 (kde je hůlka a vařečka)
HAND_NEG = ("hand.R", "forearm.R", "upperarm.R")  # strana x < 0 (kabelka)


def bone_set_for(group, name):
    group = re.sub(r"_v\d+$", "", group)
    n = name.lower()
    if group in ("face_parts", "slot_makeup"):
        return HEAD_ONLY
    if group == "head":
        return HEAD_ONLY
    if group == "slot_hair":
        return HAIR_SET
    if group == "slot_shoes":
        return FOOT_SET if "shaft" not in n else FOOT_SET + ("thigh.L", "thigh.R")
    if group == "slot_topper":
        if any(k in n for k in ("jacket", "lapel", "collar", "front_edge", "cuff", "hem_band", "zip", "stud")):
            return BODY_ALL
        return HEAD_ONLY
    if group == "slot_accessory":
        if any(k in n for k in ("lens", "frame", "temple", "bridge")):
            return HEAD_ONLY
        if any(k in n for k in ("wand", "ladle", "twist", "star")):
            return HAND_R
        if "bag" in n:
            return HAND_NEG
        return CHEST_SET
    return BODY_ALL


def group_of(obj):
    p = obj.parent
    while p is not None and not (p.name.startswith("slot_") or p.name in ("underwear", "body", "head", "face_parts")):
        p = p.parent
    return p.name if p is not None else "doll"


def seg_dist(P, a, b):
    ab = b - a
    t = np.clip(((P - a) @ ab) / (ab @ ab + 1e-12), 0, 1)
    return np.linalg.norm(P - (a + t[:, None] * ab), axis=1)


def compute_weights(P, allowed, power=3.0, arm_min_z=None):
    names = [n for n in allowed if n in BONES]
    D = np.zeros((len(P), len(names)))
    for k, n in enumerate(names):
        _, h, t, r = BONES[n]
        D[:, k] = seg_dist(P, np.array(h), np.array(t)) - r * 0.35
        if arm_min_z is not None and n.split('.')[0] in ('upperarm', 'forearm', 'hand'):
            D[P[:, 2] < arm_min_z, k] = 9.0
    W = 1.0 / (np.maximum(D, 0.004) ** power)
    # nejvýše 4 vlivy
    idx = np.argsort(-W, axis=1)[:, :4]
    out = np.zeros_like(W)
    rows = np.arange(len(P))[:, None]
    out[rows, idx] = W[rows, idx]
    out /= out.sum(axis=1, keepdims=True)
    return names, out


def join_and_skin(arm_obj):
    meshes = [o for o in bpy.data.objects if o.type == "MESH"]
    groups = {}
    for o in meshes:
        if o.data.shape_keys is not None:
            continue
        mat = o.data.materials[0].name if o.data.materials else "none"
        key = (group_of(o), mat)
        sets = bone_set_for(key[0], o.name)
        n_ = o.name.lower()
        legwear = any(k in n_ for k in ("trouser", "sock", "leg", "ankle", "boot", "knee", "shaft", "fishnet", "glove", "ribbon", "strap", "sleeve", "cuff", "joint", "ring"))
        g0 = re.sub(r"_v\d+$", "", key[0])
        if g0 in ("slot_outfit", "underwear", "slot_topper") and not legwear and sets == BODY_ALL:
            zmean = float(np.mean([v.co.z for v in o.data.vertices])) if len(o.data.vertices) else 1.0
            if zmean < 1.05:
                sets = LOWER_SET
            else:
                sets = GARMENT_SET
        if g0 == "body":
            if any(k in n_ for k in ("arm", "palm", "finger", "thumb", "deltoid")):
                sets = ARM_SET
            elif any(k in n_ for k in ("leg", "foot")):
                sets = LEG_SET
            elif "neck" in n_:
                sets = ("neck", "head", "chest")
            else:
                sets = TORSO_SET
        if g0 in ("slot_outfit", "underwear", "slot_topper") and any(k in n_ for k in ("sleeve", "cuff", "joint", "puff", "shoulder", "deltoid", "tee_", "glove")):
            sets = BODY_ALL
        groups.setdefault((key, sets), []).append(o)
    joined = []
    for ((grp, mat), sets), objs in groups.items():
        bpy.ops.object.select_all(action="DESELECT")
        for o in objs:
            o.select_set(True)
        bpy.context.view_layer.objects.active = objs[0]
        if len(objs) > 1:
            bpy.ops.object.join()
        o = bpy.context.view_layer.objects.active
        o.name = f"{grp}__{mat}"
        o.data.name = o.name
        o["bones"] = list(sets)
        joined.append((o, sets, grp))
    # skinned: spojené sítě i hlava s morph targety
    skinned = list(joined)
    for o in [o for o in bpy.data.objects if o.type == "MESH" and o.data.shape_keys is not None]:
        grp = group_of(o)
        skinned.append((o, HEAD_ONLY, grp))
    for o, sets, grp in skinned:
        P = np.array([tuple(v.co) for v in o.data.vertices])
        names, W = compute_weights(P, sets, arm_min_z=1.40 if sets == GARMENT_SET else None)
        for k, n in enumerate(names):
            col = W[:, k]
            nz = np.nonzero(col > 0.002)[0]
            if len(nz) == 0:
                continue
            vg = o.vertex_groups.get(n) or o.vertex_groups.new(name=n)
            for i in nz:
                vg.add([int(i)], float(col[i]), "REPLACE")
        mod = o.modifiers.new("Armature", "ARMATURE")
        mod.object = arm_obj
    return [o for o, _, _ in skinned]


# ---------------------------------------------------------------- animace
FPS = 24


class Poser:
    def __init__(self, arm_obj):
        self.arm = arm_obj
        bpy.context.view_layer.objects.active = arm_obj
        bpy.ops.object.mode_set(mode="POSE")
        self.rest = {}
        for pb in arm_obj.pose.bones:
            pb.rotation_mode = "QUATERNION"
            self.rest[pb.name] = pb.bone.matrix_local.to_3x3()

    def reset(self):
        for pb in self.arm.pose.bones:
            pb.rotation_quaternion = Quaternion((1, 0, 0, 0))
            pb.location = Vector((0, 0, 0))

    def set(self, name, rx=0.0, ry=0.0, rz=0.0):
        """Otočení bone kolem světových os (Z·Y·X) vyjádřené v jeho lokálním rámu."""
        pb = self.arm.pose.bones[name]
        R = self.rest[name]
        Rw = Matrix.Rotation(rz, 3, "Z") @ Matrix.Rotation(ry, 3, "Y") @ Matrix.Rotation(rx, 3, "X")
        loc = R.inverted() @ Rw @ R
        pb.rotation_quaternion = loc.to_quaternion()

    def move(self, name, x=0.0, y=0.0, z=0.0):
        pb = self.arm.pose.bones[name]
        pb.location = self.rest[name].inverted() @ Vector((x, y, z))

    def key(self, frame):
        for pb in self.arm.pose.bones:
            pb.keyframe_insert("rotation_quaternion", frame=frame)
            pb.keyframe_insert("location", frame=frame)


def ease(t):
    return t * t * (3 - 2 * t)


def arm_pose(P, s, up=0.0, fwd=0.0, elbow=0.0, twist=0.0):
    """Paže: up = do strany nahoru, fwd = dopředu, elbow = pokrčení lokte (kladné = dopředu)."""
    sd = "L" if s > 0 else "R"
    P.set("upperarm." + sd, rx=-fwd, ry=-s * up, rz=0.0)
    P.set("forearm." + sd, rx=-elbow, ry=0.0, rz=s * twist)


def leg_pose(P, s, fwd=0.0, knee=0.0, side=0.0):
    sd = "L" if s > 0 else "R"
    P.set("thigh." + sd, rx=-fwd, ry=-s * side)
    P.set("shin." + sd, rx=knee)
    P.set("foot." + sd, rx=-(knee - fwd) * 0.4)


def idle(P, t):
    a = 2 * math.pi * t
    P.set("chest", rx=0.02 * math.sin(a))
    P.set("spine", rx=0.012 * math.sin(a + 0.4))
    P.set("neck", rx=-0.015 * math.sin(a + 0.8))
    P.set("head", rx=0.025 * math.sin(a + 1.0), rz=0.12 * math.sin(a * 1.0 + 0.5), ry=0.03 * math.sin(a * 2))
    P.set("hips", ry=0.02 * math.sin(a), rz=0.03 * math.sin(a + 1.2))
    P.move("hips", z=0.004 * math.sin(a * 2))
    for s in (1, -1):
        arm_pose(P, s, up=0.08 + 0.025 * math.sin(a + s), fwd=0.03 * math.sin(a + 0.6 * s), elbow=0.14 + 0.05 * math.sin(a + 0.4))
        leg_pose(P, s, fwd=0.01 * math.sin(a + s), knee=0.0, side=0.015)
        P.set("clavicle." + ("L" if s > 0 else "R"), ry=s * 0.02 * math.sin(a))


def happy(P, t, style):
    """Tanec po správné odpovědi (t 0..1), každá panenka vlastní styl."""
    e = math.sin(math.pi * t)
    crouch = math.exp(-((t - 0.12) / 0.07) ** 2) + math.exp(-((t - 0.88) / 0.07) ** 2)
    air = max(0.0, math.sin(math.pi * min(max((t - 0.18) / 0.62, 0), 1)))
    P.move("root", z=0.22 * air)
    P.move("hips", z=-0.07 * crouch)
    for s in (1, -1):
        leg_pose(P, s, fwd=0.35 * crouch * 0 - 0.1 * air, knee=0.7 * crouch + 0.35 * air, side=0.06)
    if style == "twirl":
        P.set("root", rz=ease(min(t / 0.8, 1)) * 2 * math.pi)
        for s in (1, -1):
            arm_pose(P, s, up=1.1 * e + 0.1, fwd=0.2, elbow=0.4 * e)
        P.set("head", ry=0.18 * math.sin(t * 8))
    elif style == "pump":
        for s in (1, -1):
            arm_pose(P, s, up=0.4 + 2.3 * air if s > 0 else 0.3, fwd=0.2, elbow=0.9 * (1 - air) + 0.2)
        arm_pose(P, -1, up=0.3 + 0.2 * e, fwd=0.4 * e, elbow=1.2 + 1.4 * math.sin(t * 22) * 0.2)
        P.set("chest", rx=-0.2 * air)
        P.set("head", rx=-0.25 * air)
    elif style == "rock":
        for s in (1, -1):
            arm_pose(P, s, up=1.9 * e + 0.2, fwd=0.1, elbow=0.8 * e)
        P.set("head", rx=0.45 * math.sin(t * 34))
        P.set("chest", rx=0.15 * math.sin(t * 34 + 0.5))
    elif style == "flutter":
        for s in (1, -1):
            arm_pose(P, s, up=0.7 + 0.8 * math.sin(t * 40 + (0 if s > 0 else 0.6)) * e + 0.3, fwd=0.1, elbow=0.2)
        P.set("hips", ry=0.12 * math.sin(t * 12))
        P.set("head", ry=0.2 * math.sin(t * 10))
    elif style == "chef":
        P.set("root", rz=ease(min(t / 0.7, 1)) * math.pi * 2)
        arm_pose(P, 1, up=0.5 + 1.0 * e, fwd=0.5 * e, elbow=1.0 * (1 - e) + 0.2)
        arm_pose(P, -1, up=0.5, fwd=0.4 * e, elbow=1.3)
        P.set("spine", rx=-0.15 * e)
    else:  # astro: pomalý měsíční skok s rozpaženýma rukama
        P.move("root", z=0.34 * air - 0.22 * air)
        P.move("root", z=0.34 * air)
        for s in (1, -1):
            arm_pose(P, s, up=1.2 * e + 0.1, fwd=0.1, elbow=0.3)
        P.set("spine", rx=-0.12 * e)
        P.set("head", rx=-0.2 * e, ry=0.1 * math.sin(t * 6))


def sad(P, t):
    e = ease(min(t / 0.25, 1)) * (1 - ease(max((t - 0.85) / 0.15, 0)))
    sob = math.sin(t * 28) * 0.5 + 0.5
    P.set("head", rx=0.45 * e + 0.05 * sob * e, ry=0.06 * math.sin(t * 9) * e)
    P.set("neck", rx=0.15 * e)
    P.set("chest", rx=0.22 * e + 0.03 * sob * e)
    P.set("spine", rx=0.12 * e)
    P.move("hips", z=-0.03 * e)
    for s in (1, -1):
        P.set("clavicle." + ("L" if s > 0 else "R"), ry=s * 0.14 * e)
        leg_pose(P, s, fwd=0.04 * e, knee=0.12 * e, side=0.03)
    arm_pose(P, 1, up=0.10, fwd=0.25 * e, elbow=0.4 * e)
    # pravá ruka si utírá oči
    arm_pose(P, -1, up=0.1 * (1 - e), fwd=1.2 * e, elbow=2.0 * e)
    P.set("hand.R", rz=0.0)


def pose_gesture(P, t, kind):
    e = math.sin(math.pi * t)
    if kind == "hair":
        P.set("head", rz=0.35 * math.sin(t * 12) * e, ry=0.12 * e)
        arm_pose(P, -1, up=0.5 * e, fwd=2.0 * e, elbow=1.7 * e)
        arm_pose(P, 1, up=0.15, elbow=0.2)
    elif kind == "outfit":
        P.set("root", rz=ease(t) * 2 * math.pi)
        for s in (1, -1):
            arm_pose(P, s, up=0.9 * e + 0.1, fwd=0.1, elbow=0.2 * e)
    elif kind == "shoes":
        P.set("hips", ry=-0.06 * e)
        leg_pose(P, -1, fwd=0.55 * e, knee=1.4 * e, side=0.0)
        for s in (1, -1):
            arm_pose(P, s, up=0.9 * e + 0.1, elbow=0.2)
        P.set("foot.R", rx=0.4 * e)
    elif kind == "makeup":
        P.set("head", ry=0.22 * e, rx=-0.1 * e)
        arm_pose(P, -1, up=0.2 * e, fwd=1.5 * e * (1 - ease(max((t - 0.55) / 0.45, 0)) * 0.5), elbow=2.1 * e * (1 - ease(max((t - 0.55) / 0.45, 0)) * 0.6))
        arm_pose(P, 1, up=0.15, elbow=0.2)
    elif kind == "accessory":
        P.set("hips", ry=0.1 * e)
        P.set("head", ry=-0.15 * e)
        arm_pose(P, 1, up=0.55 * e + 0.1, fwd=-0.1, elbow=1.9 * e)
        arm_pose(P, -1, up=0.5 * e + 0.1, fwd=0.2 * e, elbow=0.6 * e)
    else:  # topper: úklon
        P.set("spine", rx=0.45 * e)
        P.set("head", rx=0.35 * e)
        P.move("hips", z=-0.04 * e)
        for s in (1, -1):
            arm_pose(P, s, up=0.2, fwd=0.4 * e, elbow=0.5 * e)
            leg_pose(P, s, knee=0.25 * e, fwd=-0.05 * e)


def build_actions(arm_obj, style):
    P = Poser(arm_obj)
    clips = {
        "idle": (72, lambda t: idle(P, t), True),
        "happy": (44, lambda t: happy(P, t, style), False),
        "sad": (58, lambda t: sad(P, t), False),
    }
    for kind in ("hair", "outfit", "shoes", "makeup", "accessory", "topper"):
        clips["pose_" + kind] = (28, (lambda k: lambda t: pose_gesture(P, t, k))(kind), False)
    ad = arm_obj.animation_data_create()
    tracks = []
    for name, (frames, fn, loop) in clips.items():
        act = bpy.data.actions.new(name)
        ad.action = act
        P.reset()
        n = frames if not loop else frames
        for f in range(n + 1):
            t = f / n if not loop else (f % n) / n
            P.reset()
            fn(min(t, 1.0))
            P.key(f + 1)
        tr = ad.nla_tracks.new()
        tr.name = name
        st = tr.strips.new(name, 1, act)
        st.name = name
        tracks.append(tr)
    ad.action = None
    bpy.ops.object.mode_set(mode="OBJECT")
    return tracks


def rig_scene(style):
    global BONES
    BONES = define_bones()
    arm = make_armature()
    skinned = join_and_skin(arm)
    build_actions(arm, style)
    return arm, skinned
