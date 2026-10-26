import bpy,math,sys
from mathutils import Vector
OUT=sys.argv[sys.argv.index("--")+1];N=int(sys.argv[sys.argv.index("--")+2])
bpy.ops.wm.read_factory_settings(use_empty=True);sc=bpy.context.scene
TAU=math.tau
def nodes(m):
    m.use_nodes=True;nt=m.node_tree;nt.nodes.clear();return nt
# planet material: bands distorted by noise, rotating via mapping
pm=bpy.data.materials.new("p");nt=nodes(pm)
tc=nt.nodes.new("ShaderNodeTexCoord");mp=nt.nodes.new("ShaderNodeMapping");nz=nt.nodes.new("ShaderNodeTexNoise");sp=nt.nodes.new("ShaderNodeSeparateXYZ")
nz.inputs['Scale'].default_value=2.4;nz.inputs['Detail'].default_value=4;nz.inputs['Roughness'].default_value=0.55
nt.links.new(tc.outputs['Object'],mp.inputs['Vector']);nt.links.new(mp.outputs['Vector'],nz.inputs['Vector']);nt.links.new(mp.outputs['Vector'],sp.inputs['Vector'])
mathadd=nt.nodes.new("ShaderNodeMath");mathadd.operation='MULTIPLY_ADD'
nt.links.new(nz.outputs['Fac'],mathadd.inputs[0]);mathadd.inputs[1].default_value=0.55;nt.links.new(sp.outputs['Z'],mathadd.inputs[2])
wv=nt.nodes.new("ShaderNodeMath");wv.operation='MULTIPLY';wv.inputs[1].default_value=9.0
nt.links.new(mathadd.outputs[0],wv.inputs[0])
sn=nt.nodes.new("ShaderNodeMath");sn.operation='SINE';nt.links.new(wv.outputs[0],sn.inputs[0])
ra=nt.nodes.new("ShaderNodeMapRange");ra.inputs['From Min'].default_value=-1;ra.inputs['From Max'].default_value=1
nt.links.new(sn.outputs[0],ra.inputs['Value'])
cr=nt.nodes.new("ShaderNodeValToRGB")
cr.color_ramp.elements[0].position=0.25;cr.color_ramp.elements[0].color=(0.30,0.18,0.85,1)
cr.color_ramp.elements[1].position=0.75;cr.color_ramp.elements[1].color=(1.0,0.42,0.72,1)
e=cr.color_ramp.elements.new(0.5);e.color=(0.62,0.34,0.95,1)
nt.links.new(ra.outputs[0],cr.inputs['Fac'])
bs=nt.nodes.new("ShaderNodeBsdfPrincipled");bs.inputs['Roughness'].default_value=0.55
nt.links.new(cr.outputs[0],bs.inputs['Base Color'])
try:
    bs.inputs['Emission Color'].default_value=(0.4,0.2,0.9,1);bs.inputs['Emission Strength'].default_value=0.12
except:pass
out=nt.nodes.new("ShaderNodeOutputMaterial");nt.links.new(bs.outputs[0],out.inputs[0])
bpy.ops.mesh.primitive_uv_sphere_add(radius=1,segments=96,ring_count=48);pl=bpy.context.object
for p in pl.data.polygons:p.use_smooth=True
pl.data.materials.append(pm)
# axial tilt parent
tilt=bpy.data.objects.new("tilt",None);sc.collection.objects.link(tilt);tilt.rotation_euler=(math.radians(20),0,math.radians(-14))
pl.parent=tilt
# atmosphere glow shell
am=bpy.data.materials.new("a");nt2=nodes(am)
lw=nt2.nodes.new("ShaderNodeLayerWeight");lw.inputs['Blend'].default_value=0.3
em=nt2.nodes.new("ShaderNodeEmission");em.inputs['Color'].default_value=(0.75,0.55,1,1);em.inputs['Strength'].default_value=1.0
tr=nt2.nodes.new("ShaderNodeBsdfTransparent");mx=nt2.nodes.new("ShaderNodeMixShader");o2=nt2.nodes.new("ShaderNodeOutputMaterial")
mt=nt2.nodes.new("ShaderNodeMath");mt.operation='POWER';mt.inputs[1].default_value=4.0
nt2.links.new(lw.outputs['Fresnel'],mt.inputs[0]);nt2.links.new(mt.outputs[0],mx.inputs[0]);nt2.links.new(tr.outputs[0],mx.inputs[1]);nt2.links.new(em.outputs[0],mx.inputs[2]);nt2.links.new(mx.outputs[0],o2.inputs[0])
bpy.ops.mesh.primitive_uv_sphere_add(radius=1.045,segments=64,ring_count=32);at=bpy.context.object;at.data.materials.append(am);at.parent=tilt;at.visible_shadow=False
# ring: flat annulus with radial color ramp
rm=bpy.data.materials.new("r");nt3=nodes(rm)
tc3=nt3.nodes.new("ShaderNodeTexCoord");vm=nt3.nodes.new("ShaderNodeVectorMath");vm.operation='LENGTH';nt3.links.new(tc3.outputs['Object'],vm.inputs[0])
ra3=nt3.nodes.new("ShaderNodeMapRange");ra3.inputs['From Min'].default_value=1.45;ra3.inputs['From Max'].default_value=2.35;nt3.links.new(vm.outputs['Value'],ra3.inputs['Value'])
wv3=nt3.nodes.new("ShaderNodeMath");wv3.operation='MULTIPLY';wv3.inputs[1].default_value=52;nt3.links.new(ra3.outputs[0],wv3.inputs[0])
sn3=nt3.nodes.new("ShaderNodeMath");sn3.operation='SINE';nt3.links.new(wv3.outputs[0],sn3.inputs[0])
r3=nt3.nodes.new("ShaderNodeMapRange");r3.inputs['From Min'].default_value=-1;r3.inputs['From Max'].default_value=1;r3.inputs['To Min'].default_value=0.55;r3.inputs['To Max'].default_value=1;nt3.links.new(sn3.outputs[0],r3.inputs['Value'])
cr3=nt3.nodes.new("ShaderNodeValToRGB");cr3.color_ramp.elements[0].color=(0.95,0.68,0.22,1);cr3.color_ramp.elements[1].color=(1.0,0.9,0.5,1)
nt3.links.new(ra3.outputs[0],cr3.inputs['Fac'])
mul=nt3.nodes.new("ShaderNodeMix");mul.data_type='RGBA';mul.blend_type='MULTIPLY';mul.inputs[0].default_value=1
nt3.links.new(cr3.outputs[0],mul.inputs[6]);
gray=nt3.nodes.new("ShaderNodeCombineColor");
for k in ('Red','Green','Blue'):nt3.links.new(r3.outputs[0],gray.inputs[k])
nt3.links.new(gray.outputs[0],mul.inputs[7])
# alpha: fade at both edges, with a gap
al=nt3.nodes.new("ShaderNodeMapRange");al.inputs['From Min'].default_value=0;al.inputs['From Max'].default_value=1;nt3.links.new(ra3.outputs[0],al.inputs['Value'])
cr4=nt3.nodes.new("ShaderNodeValToRGB");cr4.color_ramp.elements[0].position=0.0;cr4.color_ramp.elements[0].color=(0,0,0,1);cr4.color_ramp.elements[1].position=0.08;cr4.color_ramp.elements[1].color=(1,1,1,1)
e2=cr4.color_ramp.elements.new(0.62);e2.color=(1,1,1,1);e3=cr4.color_ramp.elements.new(0.68);e3.color=(0.15,0.15,0.15,1);e4=cr4.color_ramp.elements.new(0.74);e4.color=(1,1,1,1);e5=cr4.color_ramp.elements.new(0.97);e5.color=(0,0,0,1)
nt3.links.new(ra3.outputs[0],cr4.inputs['Fac'])
bs3=nt3.nodes.new("ShaderNodeBsdfPrincipled");bs3.inputs['Roughness'].default_value=0.6;bs3.inputs['Emission Color'].default_value=(1,0.8,0.4,1);bs3.inputs['Emission Strength'].default_value=0.25
nt3.links.new(mul.outputs[2],bs3.inputs['Base Color']);
tr3=nt3.nodes.new("ShaderNodeBsdfTransparent");mx3=nt3.nodes.new("ShaderNodeMixShader");o3=nt3.nodes.new("ShaderNodeOutputMaterial")
nt3.links.new(cr4.outputs[0],mx3.inputs[0]);nt3.links.new(tr3.outputs[0],mx3.inputs[1]);nt3.links.new(bs3.outputs[0],mx3.inputs[2]);nt3.links.new(mx3.outputs[0],o3.inputs[0])
bpy.ops.mesh.primitive_circle_add(vertices=128,radius=2.35,fill_type='NGON');rg=bpy.context.object;rg.data.materials.append(rm);rg.parent=tilt;rg.visible_shadow=False
# moon on orbit
mm=bpy.data.materials.new("m");mb=mm.node_tree.nodes['Principled BSDF'] if mm.use_nodes else None
mm.use_nodes=True;mm.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value=(0.82,0.78,1,1);mm.node_tree.nodes['Principled BSDF'].inputs['Roughness'].default_value=0.5
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.22,segments=32,ring_count=16);moon=bpy.context.object;moon.data.materials.append(mm)
for p in moon.data.polygons:p.use_smooth=True
# camera, light
sc.render.engine='CYCLES';sc.cycles.device='CPU';sc.cycles.samples=40;sc.cycles.use_denoising=True
sc.render.film_transparent=True;sc.render.resolution_x=640;sc.render.resolution_y=420
sc.view_settings.view_transform='Standard'
w=bpy.data.worlds.new("w");w.use_nodes=True;w.node_tree.nodes['Background'].inputs[0].default_value=(0.5,0.45,0.8,1);w.node_tree.nodes['Background'].inputs[1].default_value=0.3;sc.world=w
sun=bpy.data.lights.new("s","SUN");sun.energy=2.6;so=bpy.data.objects.new("s",sun);sc.collection.objects.link(so);so.rotation_euler=(math.radians(55),0,math.radians(35))
cam=bpy.data.objects.new("c",bpy.data.cameras.new("c"));sc.collection.objects.link(cam);sc.camera=cam
cam.data.type='ORTHO';cam.data.ortho_scale=6.9;cam.location=(0,-10,0);cam.rotation_euler=(math.pi/2,0,0)
for f in range(N):
    t=f/N
    pl.rotation_euler=(0,0,TAU*t)
    a=TAU*t
    moon.location=tilt.matrix_world@Vector((3.0*math.cos(a),3.0*math.sin(a),0))
    sc.render.filepath=f"{OUT}/f{f:03d}.png";bpy.ops.render.render(write_still=True)
