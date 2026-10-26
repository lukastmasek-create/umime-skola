import bpy,bmesh,math,sys,random
from mathutils import Vector
OUT=sys.argv[sys.argv.index("--")+1]; N=int(sys.argv[sys.argv.index("--")+2]) if len(sys.argv)>sys.argv.index("--")+2 else 24
bpy.ops.wm.read_factory_settings(use_empty=True)
sc=bpy.context.scene
def mat(name,col,rough=0.35,emit=None,strength=0,metal=0):
    m=bpy.data.materials.new(name);m.use_nodes=True;b=m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value=col;b.inputs['Roughness'].default_value=rough;b.inputs['Metallic'].default_value=metal
    if emit:
        b.inputs['Emission Color'].default_value=emit;b.inputs['Emission Strength'].default_value=strength
    return m
WHITE=mat("w",(0.93,0.94,0.98,1),0.28);RED=mat("r",(0.8,0.08,0.04,1),0.4);BLUE=mat("b",(0.35,0.7,1,1),0.1,(0.3,0.65,1,1),0.6)
STEEL=mat("s",(0.7,0.75,0.8,1),0.2,metal=1);DARK=mat("d",(0.12,0.12,0.16,1),0.5)
FL1=mat("f1",(1,0.35,0.05,1),0.5,(1,0.4,0.05,1),3.2);FL2=mat("f2",(1,0.85,0.3,1),0.5,(1,0.8,0.25,1),5);FL3=mat("f3",(1,1,0.85,1),0.5,(1,1,0.8,1),8)
def lathe(pts,seg=64,m=None,name="l"):
    bm=bmesh.new();vs=[bm.verts.new((r,0,z)) for r,z in pts]
    for a,b in zip(vs,vs[1:]):bm.edges.new((a,b))
    bmesh.ops.spin(bm,geom=bm.verts[:]+bm.edges[:],cent=(0,0,0),axis=(0,0,1),angle=math.tau,steps=seg)
    bmesh.ops.remove_doubles(bm,verts=bm.verts,dist=1e-5)
    bmesh.ops.recalc_face_normals(bm,faces=bm.faces)
    me=bpy.data.meshes.new(name);bm.to_mesh(me);bm.free()
    o=bpy.data.objects.new(name,me);sc.collection.objects.link(o)
    for p in me.polygons:p.use_smooth=True
    if m:o.data.materials.append(m)
    return o
def prof(z):
    if z>0.15:
        t=(z-0.15)/0.95;return 0.46*max(0,1-t**1.8)**0.62
    t=(0.15-z)/0.9;return 0.46*max(0,1-t**3)**0.5
zs=[-0.85+i*(1.95/60) for i in range(61)]
body=lathe([(max(prof(z),0),z) for z in zs],name="body",m=WHITE)
body.data.materials.append(RED)
# nose cap red
for p in body.data.polygons:
    zc=sum(body.data.vertices[v].co.z for v in p.vertices)/len(p.vertices)
    p.material_index=1 if zc>0.78 else 0
# belt stripe
for p in body.data.polygons:
    zc=sum(body.data.vertices[v].co.z for v in p.vertices)/len(p.vertices)
    if -0.30<zc<-0.22:p.material_index=1
root=bpy.data.objects.new("root",None);sc.collection.objects.link(root)
body.parent=root
# nozzle
nz=lathe([(0.0,-0.9),(0.26,-0.9),(0.30,-1.0),(0.24,-1.12),(0.0,-1.12)],name="nz",m=DARK);nz.parent=root
ring=lathe([(0.27,-0.97),(0.31,-0.97),(0.31,-1.0),(0.27,-1.0)],name="ring",m=STEEL);ring.parent=root
# window
bpy.ops.mesh.primitive_torus_add(major_radius=0.17,minor_radius=0.04,major_segments=48,minor_segments=16)
tor=bpy.context.object;tor.rotation_euler=(math.pi/2,0,0);tor.location=(0,-0.455,0.3);tor.data.materials.append(STEEL);tor.parent=root
for p in tor.data.polygons:p.use_smooth=True
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.17,segments=32,ring_count=16);gl=bpy.context.object;gl.scale=(1,0.35,1);gl.location=(0,-0.435,0.3);gl.data.materials.append(BLUE);gl.parent=root
for p in gl.data.polygons:p.use_smooth=True
# fins
def fin(angle):
    pts=[(0.36,0.02),(0.82,-0.62),(0.82,-0.95),(0.38,-0.80)]
    me=bpy.data.meshes.new("fin");me.from_pydata([(x,0,z) for x,z in pts],[],[(0,1,2,3)]);me.update()
    o=bpy.data.objects.new("fin",me);sc.collection.objects.link(o)
    s=o.modifiers.new("s","SOLIDIFY");s.thickness=0.09;s.offset=0
    bv=o.modifiers.new("b","BEVEL");bv.width=0.025;bv.segments=3
    o.data.materials.append(RED);o.rotation_euler=(0,0,angle);o.parent=root
    for p in me.polygons:p.use_smooth=True
for a in (0,math.tau/3,2*math.tau/3):fin(a+math.pi/2)  # fin at +Y? set so one fin sits behind
# flame
def cone(r,h,m,name):
    o=lathe([(0.0,0.0),(r,0.0),(r*0.8,-h*0.25),(r*0.4,-h*0.65),(0.0,-h)],seg=32,name=name,m=m);o.parent=root;o.location=(0,0,-1.08);return o
f1=cone(0.26,1.15,FL1,"f1");f2=cone(0.17,0.85,FL2,"f2");f3=cone(0.09,0.5,FL3,"f3")
random.seed(4)
sparks=[]
for i in range(9):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.035,segments=12,ring_count=8);s=bpy.context.object;s.data.materials.append(FL2)
    sparks.append((s,random.uniform(-0.2,0.2),random.uniform(-0.2,0.2),i/9,random.uniform(0.7,1.3)))
# camera + lights
sc.render.engine='CYCLES';sc.cycles.device='CPU';sc.cycles.samples=48;sc.cycles.use_denoising=True
sc.render.film_transparent=True;sc.render.resolution_x=sc.render.resolution_y=400
sc.view_settings.view_transform='Standard'
w=bpy.data.worlds.new("w");w.use_nodes=True;w.node_tree.nodes['Background'].inputs[0].default_value=(0.75,0.78,0.95,1);w.node_tree.nodes['Background'].inputs[1].default_value=0.55;sc.world=w
def area(loc,e,sz,col=(1,1,1)):
    l=bpy.data.lights.new("a","AREA");l.energy=e;l.size=sz;l.color=col;o=bpy.data.objects.new("a",l);sc.collection.objects.link(o);o.location=loc
    o.rotation_euler=(Vector((0,0,0.0))-Vector(loc)).to_track_quat('-Z','Y').to_euler()
area((2.5,-3.5,3),500,3);area((-3,-2,0.5),160,3,(0.6,0.7,1));area((0,2.5,2),200,3,(1,0.8,0.7))
pl=bpy.data.lights.new("p","POINT");pl.energy=120;pl.color=(1,0.5,0.15);po=bpy.data.objects.new("p",pl);sc.collection.objects.link(po);po.location=(0,-0.6,-1.4)
cam=bpy.data.objects.new("c",bpy.data.cameras.new("c"));sc.collection.objects.link(cam);sc.camera=cam
cam.data.type='ORTHO';cam.data.ortho_scale=4.5;cam.location=(0,-8,-0.55);cam.rotation_euler=(math.pi/2,0,0)
TAU=math.tau
for f in range(N):
    t=f/N
    root.location=(0,0,0.02*math.sin(TAU*t))
    root.rotation_euler=(math.radians(-8+3*math.sin(TAU*t)),math.radians(0),math.radians(14*math.sin(TAU*t+1.0)))
    fl=1+0.13*math.sin(TAU*t*4)+0.07*math.sin(TAU*t*7+1)
    for c,k in ((f1,1),(f2,0.9),(f3,0.8)):c.scale=(1+0.05*math.sin(TAU*t*5+k),1+0.05*math.cos(TAU*t*5+k),fl*k+(1-k))
    po.data.energy=100+30*math.sin(TAU*t*4)
    M=root.matrix_world
    for s,dx,dy,ph,sp in sparks:
        u=(t+ph)%1.0
        loc=M@Vector((dx*(0.4+u*1.4),dy*(0.4+u*1.4),-1.25-u*1.15*sp))
        s.location=loc;k=max(0.0,1-u)**0.8*1.0;s.scale=(k,k,k)
    sc.render.filepath=f"{OUT}/f{f:03d}.png";bpy.ops.render.render(write_still=True)
