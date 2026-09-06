"""Preserve r04 control cages and prepare evaluated copies for GUI union/remesh."""
import bpy
import json
from pathlib import Path

scene = bpy.context.scene
assert scene.name == 'EDIT-charizard-whole-r04' and bpy.context.mode == 'OBJECT'
root = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r04')
checkpoint = root / 'charizard-whole-r04-cages-c.blend'
assert not checkpoint.exists()
bpy.data.libraries.write(str(checkpoint), {scene}, fake_user=True, compress=True)
parts = ['upper-muzzle', 'skull', 'horn--1', 'horn-1']
copies = []
for obj in scene.objects:
    obj.select_set(False)
for part in parts:
    source = bpy.data.objects[f'GEO-charizard-{part}-cage-r04']
    copy = source.copy()
    copy.data = source.data.copy()
    scene.collection.objects.link(copy)
    copy.name = f'GEO-charizard-{part}-assembly-r04'
    copy.hide_set(False)
    copy.select_set(True)
    bpy.context.view_layer.objects.active = copy
    bpy.ops.object.convert(target='MESH')
    copy = bpy.context.object
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    copy.select_set(False)
    copies.append(copy)
    source.hide_set(True)
    source.hide_render = True
for copy in copies:
    copy.select_set(True)
active = copies[1]
active.name = 'GEO-charizard-upper-head-remesh-r04'
active.data.remesh_voxel_size = .0025
active.data.use_remesh_preserve_volume = True
bpy.context.view_layer.objects.active = active
scene.tool_settings.transform_pivot_point = 'MEDIAN_POINT'
print(json.dumps({'checkpoint': str(checkpoint), 'selected': [o.name for o in copies], 'voxelSize': .0025}))
