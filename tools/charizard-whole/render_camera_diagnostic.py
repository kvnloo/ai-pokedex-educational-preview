"""Render camera-only elevation comparisons; restore the live scene afterward."""
import bpy
import math
from pathlib import Path
from mathutils import Vector

root = Path(artifact_root)
scene = bpy.context.scene
previous_camera, previous_path = scene.camera, scene.render.filepath
outputs = [root / f'camera-front-elevation-{angle:+d}.png' for angle in (-10, 10)]
assert not any(p.exists() for p in outputs)
data = bpy.data.cameras.new('TEMP-camera-diagnostic')
camera = bpy.data.objects.new('TEMP-camera-diagnostic', data)
scene.collection.objects.link(camera)
data.type = 'ORTHO'
data.ortho_scale = 2.85
target = Vector((0, 0, .84))
try:
    for angle, output in zip((-10, 10), outputs):
        radians = math.radians(angle)
        camera.location = target + Vector((0, -5 * math.cos(radians), 5 * math.sin(radians)))
        camera.rotation_euler = (target - camera.location).to_track_quat('-Z', 'Y').to_euler()
        scene.camera = camera
        scene.render.filepath = str(output)
        bpy.context.view_layer.update()
        bpy.ops.render.render(write_still=True)
finally:
    scene.camera, scene.render.filepath = previous_camera, previous_path
    bpy.data.objects.remove(camera, do_unlink=True)
    bpy.data.cameras.remove(data)
print('Camera-only diagnostic complete; scene restored.')
