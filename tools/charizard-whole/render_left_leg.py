"""Inspect the edited left leg from its exposed side; restore camera state."""
from pathlib import Path
import bpy
from mathutils import Vector

output = Path(render_path)
assert not output.exists()
scene = bpy.context.scene
previous_camera, previous_path = scene.camera, scene.render.filepath
camera_data = bpy.data.cameras.new('TEMP-left-leg-review')
camera = bpy.data.objects.new('TEMP-left-leg-review', camera_data)
scene.collection.objects.link(camera)
camera_data.type = 'ORTHO'
camera_data.ortho_scale = 1.15
target = Vector((-.35, -.1, .28))
camera.location = target + Vector((-5, 0, 0))
camera.rotation_euler = (target - camera.location).to_track_quat('-Z', 'Y').to_euler()
try:
    scene.camera = camera
    scene.render.filepath = str(output)
    bpy.ops.render.render(write_still=True)
finally:
    scene.camera, scene.render.filepath = previous_camera, previous_path
    bpy.data.objects.remove(camera, do_unlink=True)
    bpy.data.cameras.remove(camera_data)
print('Exposed left leg rendered:', str(output))
