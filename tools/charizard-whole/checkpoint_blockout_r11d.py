"""Executed r11d correction and compact review checkpoint; no detail or textures."""
import bpy
from pathlib import Path
from mathutils import Vector

p=Path(__file__).with_name('blockout_r11.py')
ns={}; exec(compile(p.read_text(),str(p),'exec'),ns)
scene=bpy.context.scene
assert scene.name==ns['SCENE'] and Path(bpy.data.filepath).name=='charizard-blockout-r11c.blend'
old=scene.objects['GEO-r11-neck']; data=old.data
bpy.data.objects.remove(old,do_unlink=True); bpy.data.meshes.remove(data)
neck=ns['tube']('neck',[(0,.01,.79),(0,.025,.96),(0,.03,1.10),(0,.005,1.29),(-.01,-.085,1.46),(-.028,-.18,1.56)],[.19,.15,.125,.118,.125,.132],'head-neck',16)
modifier=neck.modifiers.new('Coarse neck continuity','SUBSURF')
modifier.levels=1; modifier.render_levels=1
for obj in bpy.data.collections['R11-wing-membranes'].objects:
    for face in obj.data.polygons:face.use_smooth=True
owned=set(scene.objects)
for other in list(bpy.data.scenes):
    if other!=scene:bpy.data.scenes.remove(other)
for obj in list(bpy.data.objects):
    if obj not in owned:bpy.data.objects.remove(obj,do_unlink=True)
for blocks in (bpy.data.meshes,bpy.data.cameras,bpy.data.collections):
    for block in list(blocks):
        if block.users==0:blocks.remove(block)
socket=next(obj for obj in scene.objects if obj.get('effect')=='charizard-tail-flame')
socket.name='FlameSocket'
socket.empty_display_size=.035
for obj in scene.objects:obj.select_set(obj.type=='MESH')
bpy.context.view_layer.objects.active=scene.objects['GEO-r11-body-pear']
ns['capture']('d')
for obj in scene.objects:
    if obj.type=='MESH':
        for uv in list(obj.data.uv_layers):obj.data.uv_layers.remove(uv)
socket.rotation_euler=Vector((.05,-.21,.25)).to_track_quat('Z','Y').to_euler()
bpy.ops.wm.save_as_mainfile(filepath=str(ns['ROOT']/'charizard-blockout-r11d-review.blend'))
