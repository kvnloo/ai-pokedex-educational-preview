"""Render the actual left hand with a temporary camera; preserve scene state."""
from pathlib import Path
import bpy
from mathutils import Vector

output = Path(render_path)
assert not output.exists()
scene = bpy.context.scene
previous_camera, previous_path = scene.camera, scene.render.filepath
data = bpy.data.cameras.new('TEMP-left-hand')
camera = bpy.data.objects.new('TEMP-left-hand', data)
scene.collection.objects.link(camera)
target = Vector((-.44, -.12, .80))
camera.location = target + Vector((-5, 0, 0))
camera.rotation_euler = (target - camera.location).to_track_quat('-Z', 'Y').to_euler()
data.type = 'ORTHO'
data.ortho_scale = .6
try:
    scene.camera = camera
    scene.render.filepath = str(output)
    bpy.ops.render.render(write_still=True)
finally:
    scene.camera = previous_camera
    scene.render.filepath = previous_path
    bpy.data.objects.remove(camera, do_unlink=True)
    bpy.data.cameras.remove(data)
