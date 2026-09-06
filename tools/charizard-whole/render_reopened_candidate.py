"""Render a physical GLB with the source cameras, then restore the source scene.

Run in the owned Blender with explicit glb_path and render_prefix globals.
This helper performs file I/O and inspection only; it does not author anatomy.
"""
import contextlib
import io
from pathlib import Path

import bpy

scene = bpy.context.scene
path = Path(glb_path)
prefix = Path(render_prefix)
assert path.is_file() and bpy.context.mode == 'OBJECT'
views = ('front', 'side', 'rear', 'threequarter')
outputs = [Path(str(prefix) + '-' + view + '.png') for view in views]
assert not any(output.exists() for output in outputs)
original = set(bpy.data.objects)
visibility = {obj: obj.hide_render for obj in scene.objects}
source_meshes = sum(obj.type == 'MESH' and not obj.hide_render for obj in scene.objects)
existing_meshes = set(bpy.data.meshes)
camera, filepath = scene.camera, scene.render.filepath
try:
    for obj in scene.objects:
        if obj.type == 'MESH':
            obj.hide_render = True
    with contextlib.redirect_stdout(io.StringIO()):
        bpy.ops.import_scene.gltf(filepath=str(path), merge_vertices=True)
    imported = set(bpy.data.objects) - original
    assert sum(obj.type == 'MESH' for obj in imported) == source_meshes
    for view, output in zip(views, outputs):
        scene.camera = scene.objects['CAM-r11-' + view]
        scene.render.filepath = str(output)
        bpy.ops.render.render(write_still=True)
finally:
    for obj in list(set(bpy.data.objects) - original):
        bpy.data.objects.remove(obj, do_unlink=True)
    for mesh in list(set(bpy.data.meshes) - existing_meshes):
        if mesh.users == 0:
            bpy.data.meshes.remove(mesh)
    for obj, hidden in visibility.items():
        obj.hide_render = hidden
    scene.camera, scene.render.filepath = camera, filepath
    assert set(bpy.data.objects) == original
print('Reopened GLB rendered; source restored:', str(path))
