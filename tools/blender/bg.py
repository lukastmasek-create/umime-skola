import bpy,math,sys,random
from mathutils import Vector
OUT=sys.argv[sys.argv.index("--")+1];N=int(sys.argv[sys.argv.index("--")+2]);START=int(sys.argv[sys.argv.index("--")+3]) if len(sys.argv)>sys.argv.index("--")+3 else 0
END=int(sys.argv[sys.argv.index("--")+4]) if len(sys.argv)>sys.argv.index("--")+4 else N
bpy.ops.wm.read_factory_settings(use_empty=True);sc=bpy.context.scene
TAU=math.tau;W,H=16.0,9.0
random.seed(11)
def emat(name,col,s):
    m=bpy.data.materials.new(name);m.use_nodes=True;nt=m.node_tree;nt.nodes.clear()
    e=nt.nodes.new("ShaderNodeEmission");e.inputs['Color'].default_value=col;e.inputs['Strength'].default_value=s
    o=nt.nodes.new("ShaderNodeOutputMaterial");nt.links.new(e.outputs[0],o.inputs[0]);return m
COLS=[(1,1,1,1),(0.75,0.85,1,1),(1,0.85,0.95,1),(1,0.95,0.7,1),(0.8,0.75,1,1)]
STAR=[emat(f"s{i}",c,6) for i,c in enumerate(COLS)]
# ---- stars: 3 layers (far,mid,near) as groups that move up k tiles over the loop ----
layers=[]
specs=[(1,260,0.018,0.9),(2,120,0.03,1.3),(3,45,0.05,2.2)]  # (k tiles/loop, count, radius, depth scale)
_ico={}
def base_ico(m):
    if m.name not in _ico:
        bpy.ops.mesh.primitive_ico_sphere_add(radius=1,subdivisions=2);b=bpy.context.object;me=b.data;me.materials.append(m);bpy.data.objects.remove(b);_ico[m.name]=me
    return _ico[m.name]
_pl={}
def base_plane(m):
    if m.name not in _pl:
        bpy.ops.mesh.primitive_plane_add(size=1);b=bpy.context.object;me=b.data;me.materials.append(m);bpy.data.objects.remove(b);_pl[m.name]=me
    return _pl[m.name]
def newobj(me,loc,scale):
    o=bpy.data.objects.new("o",me);sc.collection.objects.link(o);o.location=loc;o.scale=(scale,scale,scale);return o
def sphere(r,m,loc):
    return newobj(base_ico(m),loc,r)
stars=[]
for li,(k,cnt,r,_) in enumerate(specs):
    base=[]
    for i in range(cnt):
        x=random.uniform(-W/2*1.05,W/2*1.05);y=random.uniform(0,H);rr=r*random.uniform(0.6,1.5)
        base.append((x,y,rr,random.randrange(5),random.randrange(1,4),random.uniform(0,TAU)))
    objs=[]
    for (x,y,rr,c,n,ph) in base:
        for shift in (-1,0,1):
            o=sphere(rr,STAR[c],(x,2-li*0.5,y+shift*H));objs.append((o,x,y,shift,rr,n,ph))
    stars.append((k,objs))
# ---- dust: big soft glow discs ----
def glowmat(col,s):
    m=bpy.data.materials.new("g");m.use_nodes=True;nt=m.node_tree;nt.nodes.clear()
    tc=nt.nodes.new("ShaderNodeTexCoord");gr=nt.nodes.new("ShaderNodeTexGradient");gr.gradient_type='SPHERICAL'
    mp=nt.nodes.new("ShaderNodeMapping");mp.inputs['Location'].default_value=(-0.5,-0.5,0)
    nt.links.new(tc.outputs['UV'],mp.inputs['Vector']);nt.links.new(mp.outputs[0],gr.inputs[0])
    ma=nt.nodes.new("ShaderNodeMath");ma.operation='SUBTRACT';ma.inputs[0].default_value=1.0;ma.use_clamp=True;nt.links.new(gr.outputs['Fac'],ma.inputs[1])
    # radius 0.5 -> fac 0..1 spherical reaches 1 at r=1? use multiply by 2
    mu=nt.nodes.new("ShaderNodeMath");mu.operation='MULTIPLY';mu.inputs[1].default_value=2.0;nt.links.new(gr.outputs['Fac'],mu.inputs[0])
    ma2=nt.nodes.new("ShaderNodeMath");ma2.operation='SUBTRACT';ma2.inputs[1].default_value=1.0;ma2.use_clamp=True;nt.links.new(mu.outputs[0],ma2.inputs[0])
    po=nt.nodes.new("ShaderNodeMath");po.operation='POWER';po.inputs[1].default_value=1.7;nt.links.new(ma2.outputs[0],po.inputs[0])
    e=nt.nodes.new("ShaderNodeEmission");e.inputs['Color'].default_value=col;e.inputs['Strength'].default_value=s
    tr=nt.nodes.new("ShaderNodeBsdfTransparent");mx=nt.nodes.new("ShaderNodeMixShader");o=nt.nodes.new("ShaderNodeOutputMaterial")
    nt.links.new(po.outputs[0],mx.inputs[0]);nt.links.new(tr.outputs[0],mx.inputs[1]);nt.links.new(e.outputs[0],mx.inputs[2]);nt.links.new(mx.outputs[0],o.inputs[0]);return m
dust=[]
DC=[(0.45,0.3,1,1),(1,0.35,0.7,1),(0.2,0.7,1,1),(0.6,0.3,1,1)]
for i in range(8):
    col=DC[i%4];sz=random.uniform(6,10);gm=glowmat(col,0.22)
    for shift in (-1,0,1):
        pl=newobj(base_plane(gm),(0,3,0),sz);pl.name=f'dust{i}_{shift}';pl.rotation_euler=(math.pi/2,0,0);dust.append((pl,i*H/8,shift,random.Random(i).uniform(-6,6),3+0.07*(i*3+shift+1)))
# ---- bokeh orbs: bigger soft glows floating ----
orbs=[]
for i in range(14):
    r=random.uniform(0.15,0.45);x=random.uniform(-7.5,7.5);y=random.uniform(0,H)
    m=glowmat(random.choice(DC[:3]+[(1,0.9,0.6,1)]),0.8);nn=random.randrange(1,3);pp=random.uniform(0,TAU)
    for shift in (-1,0,1):
        o=newobj(base_plane(m),(x,1.2,y+shift*H),r*2);o.rotation_euler=(math.pi/2,0,0);oi=len(orbs);o.location.y=1.2+0.05*oi;orbs.append((o,x,y,shift,nn,pp,1.2+0.05*oi))
# ---- shooting stars ----
SH=emat("sh",(1,0.95,0.9,1),14)
shoots=[]
for t0,x0,y0 in ((0.18,6.5,6.5),(0.62,-3.0,7.2),(0.86,8.0,2.5)):
    o=newobj(base_ico(SH),(0,0.5,0),0.035)
    shoots.append((o,t0,x0,y0))
sc.render.engine='CYCLES';sc.cycles.device='CPU';sc.cycles.samples=12;sc.cycles.transparent_max_bounces=60;sc.cycles.max_bounces=60;sc.cycles.use_denoising=False
sc.render.resolution_x=960;sc.render.resolution_y=540;sc.render.film_transparent=False
sc.view_settings.view_transform='Standard'
w=bpy.data.worlds.new("w");w.use_nodes=True;w.node_tree.nodes['Background'].inputs[0].default_value=(0,0,0,1);w.node_tree.nodes['Background'].inputs[1].default_value=0;sc.world=w
cam=bpy.data.objects.new("c",bpy.data.cameras.new("c"));sc.collection.objects.link(cam);sc.camera=cam
cam.data.type='ORTHO';cam.data.ortho_scale=W;cam.location=(0,-10,H/2);cam.rotation_euler=(math.pi/2,0,0)
for f in range(START,END):
    t=f/N
    for k,objs in stars:
        for (o,x,y,shift,rr,n,ph) in objs:
            yy=(y+shift*H-k*H*t)
            o.location.z=yy;o.location.x=x
            s=rr*(0.75+0.35*math.sin(TAU*n*t+ph));o.scale=(s,s,s)
    for pl,y,shift,x,dy in dust:
        pl.location=(x+0.4*math.sin(TAU*t+y),dy,y+shift*H-H*t)
    for o,x,y,shift,n,ph,dy in orbs:
        o.location=(x+0.3*math.sin(TAU*n*t+ph),dy,y+shift*H-H*t*1)
    for o,t0,x0,y0 in shoots:
        u=(t-t0)/0.06
        if 0<=u<=1:
            L=3.2*u;o.location=(x0-L*0.8,0.5,y0-L*0.6);a=math.sin(math.pi*u)
            o.scale=(0.035*a*9,0.035*a*1.2,0.035*a*1.2);o.rotation_euler=(0,math.atan2(0.6,0.8)*-1,0)
            o.hide_render=False
        else:o.hide_render=True
    sc.render.filepath=f"{OUT}/f{f:04d}.png";bpy.ops.render.render(write_still=True)
