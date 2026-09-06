"""Extract a copied HOME head and normalize its pitch for a separate sculpt study."""
import bpy
import bmesh
import json
from pathlib import Path
from mathutils import Matrix, Vector

root = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r07')
reference = bpy.context.scene
name = 'EDIT-charizard-head-home-r07'
assert reference.name == 'REFERENCE-charizard-head-baselines-r07' and bpy.context.mode == 'OBJECT'
assert name not in bpy.data.scenes and not (root/'home-head-intake.blend').exists()
source = next(obj for obj in reference.objects if obj.type == 'MESH' and obj.get('baseline') == 'home')
bm = bmesh.new()
bm.from_mesh(source.data)
bmesh.ops.bisect_plane(bm,geom=list(bm.verts)+list(bm.edges)+list(bm.faces),dist=1e-7,plane_co=(0,0,.3),plane_no=(0,0,1),clear_inner=True,clear_outer=False)
seed = min(bm.verts,key=lambda vertex:vertex.co.y)
keep, pending = set(), [seed]
while pending:
    vertex = pending.pop()
    if vertex in keep:
        continue
    keep.add(vertex)
    pending.extend(edge.other_vert(vertex) for edge in vertex.link_edges)
bmesh.ops.delete(bm,geom=[vertex for vertex in bm.verts if vertex not in keep],context='VERTS')
boundary = [edge for edge in bm.edges if edge.is_boundary]
assert boundary and all(abs(v.co.z-.3)<1e-5 for edge in boundary for v in edge.verts)
bmesh.ops.holes_fill(bm,edges=boundary,sides=0)
assert all(edge.is_manifold for edge in bm.edges)
side = Vector((-.8660254,.5,0)).normalized()
forward = Vector((-.5,-.8660254,.45)).normalized()
up = side.cross(forward).normalized()
original = Matrix((side,forward,up)).transposed().to_4x4()
original.translation = Vector((-.06,-.62,.53))
bmesh.ops.transform(bm,matrix=original.inverted(),verts=list(bm.verts))
mesh = bpy.data.meshes.new('GEO-charizard-home-head-r07')
bm.to_mesh(mesh)
bm.free()
scene = bpy.data.scenes.new(name)
obj = bpy.data.objects.new('GEO-charizard-home-head-r07',mesh)
scene.collection.objects.link(obj)
target_forward = Vector((-.49446818,-.856444,.14834046)).normalized()
target_up = side.cross(target_forward).normalized()
target = Matrix((side,target_forward,target_up)).transposed().to_4x4()
target.translation = Vector((-.085,-.77,.49))
obj.matrix_world = target
for polygon in mesh.polygons:
    polygon.use_smooth = True
obj.shape_key_add(name='Basis')
key = obj.shape_key_add(name='Refine_Jaw_r07')
key.value = 1
obj.active_shape_key_index = 1
camera = reference.camera.copy()
camera.data = reference.camera.data.copy()
camera.name = 'CAM-home-head-r07'
scene.collection.objects.link(camera)
scene.camera = camera
scene.world = reference.world.copy()
scene.render.engine = 'BLENDER_WORKBENCH'
scene.render.resolution_x = scene.render.resolution_y = 800
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
shade = scene.display.shading
shade.light = 'STUDIO'
shade.studio_light = 'paint.sl'
shade.color_type = 'SINGLE'
shade.single_color = (.63,.65,.68)
shade.show_shadows = shade.show_cavity = False
shade.background_type = 'WORLD'
bpy.context.window.scene = scene
obj.select_set(True)
bpy.context.view_layer.objects.active = obj
bpy.context.view_layer.update()
bpy.data.libraries.write(str(root/'home-head-intake.blend'),{scene},fake_user=True,compress=True)
report = {'scene':scene.name,'object':obj.name,'source':source.name,'vertices':len(mesh.vertices),'polygons':len(mesh.polygons),'neckCutWorldZ':.3,'neckBoundaryEdgesCapped':len(boundary),'sourceFrame':[list(row) for row in original],'reviewFrame':[list(row) for row in target],'normalizedUpwardPitch':True,'headFrameMethod':'Artist-selected yaw and pitch estimate; no ground-truth orthographic registration','geometryChanges':'Neck cut and cap on a copy. Head surface coordinates preserved through rigid frame conversion.','status':'isolated head study, not joined to body or game-ready'}
(root/'home-head-intake.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report))
