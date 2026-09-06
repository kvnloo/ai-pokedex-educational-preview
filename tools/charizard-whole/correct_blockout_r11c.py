"""Replace stacked face ovals with a coarse broad head volume after r11b critique."""
import bpy
import bmesh
import json
import math
from pathlib import Path
from mathutils import Vector, Matrix

root=Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r11')
scene=bpy.context.scene
assert scene.name=='EDIT-charizard-coarse-r11'
assert Path(bpy.data.filepath).name=='charizard-blockout-r11b.blend'
audit={
    'revision':'r11b','gatePassed':False,
    'silhouette':'Better squat lower-body masses; head still reads as a different cartoon creature.',
    'torsoToHead':'Broader head and abdomen retained; stacked mouth volumes prevent reliable likeness judgment.',
    'wingSpan':'Large span retained. Arched trailing edge is closer to HOME than r11a zigzags; membrane depth and root still need work.',
    'legMass':'Broader, less vertical thighs retained; feet and short shin transitions remain crude.',
    'armLength':'Shorter reach and inward roots retained; exposed coarse joins remain.',
    'headProfile':'FAIL: separate oval nose and lower oval jaw read as a muzzle design not present in official art. Replace with one coarse broad wedge.',
    'neckThickness':'FAIL: collar-like chest join and angular profile; smooth only coarse neck continuity.',
    'tailAttachment':'Twist removed by transporting the ring frame; broad pelvic insertion retained. Attachment volume still needs refinement.',
}
(root/'critique-r11b.json').write_text(json.dumps(audit,indent=2)+'\n')
for name in ('skull','muzzle','jaw'):
    obj=scene.objects['GEO-r11-'+name]; mesh=obj.data
    bpy.data.objects.remove(obj,do_unlink=True); bpy.data.meshes.remove(mesh)
# Eight-sided rounded rectangular sections form a short, broad block. No face detail.
profile=[(1,.45),(.65,1),(-.65,1),(-1,.45),(-1,-.45),(-.65,-1),(.65,-1),(1,-.45)]
sections=[(.00,.125,1.545,.102),(-.14,.20,1.55,.135),(-.29,.195,1.56,.118),(-.445,.185,1.58,.087),(-.50,.135,1.585,.07)]
vertices=[(x*width,y,z+height*t) for y,width,z,height in sections for x,t in profile]
faces=[]
for ring in range(len(sections)-1):
    for side in range(8):
        a=ring*8+side; b=ring*8+(side+1)%8
        faces.append((a,b,b+8,a+8))
faces += [tuple(reversed(range(8))),tuple(32+i for i in range(8))]
mesh=bpy.data.meshes.new('MESH-r11-coarse-head')
mesh.from_pydata(vertices,[],faces); mesh.update()
bm=bmesh.new(); bm.from_mesh(mesh)
bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces)); bm.to_mesh(mesh); bm.free()
head=bpy.data.objects.new('GEO-r11-head-block',mesh)
bpy.data.collections['R11-head-neck'].objects.link(head)
head['component']='head-neck'; head['stage']='coarse-blockout-unapproved'; head['energyBaked']=False
for polygon in mesh.polygons:polygon.use_smooth=True
smooth=head.modifiers.new('Coarse block rounding','SUBSURF'); smooth.levels=1; smooth.render_levels=1
rotation=Matrix.Rotation(math.radians(-18),4,'Z') @ Matrix.Rotation(math.radians(-10),4,'X')
pivot=Vector((0,-.14,1.52))
transform=Matrix.Translation(pivot) @ rotation @ Matrix.Translation(-pivot)
for obj in [head]+[scene.objects['GEO-r11-horn-'+side] for side in ('L','R')]+[scene.objects['GEO-r11-eye-'+side] for side in ('L','R')]:
    obj.matrix_world=transform @ obj.matrix_world
for side in ('L','R'):
    eye=scene.objects['GEO-r11-eye-'+side]
    eye.hide_render=True
    eye['reason']='Placement placeholder; expression is deferred until silhouette gate'
neck=scene.objects['GEO-r11-neck']
mod=neck.modifiers.new('Coarse neck continuity','SUBSURF'); mod.levels=1; mod.render_levels=1
print('r11c head block ready for four-view critique')
