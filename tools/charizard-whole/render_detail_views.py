"""Render a fixed detail framing without changing source geometry or cameras."""
import bpy
from pathlib import Path
from mathutils import Vector

prefix = Path(render_prefix)
target = Vector(detail_target)
views = ('front', 'side', 'rear', 'threequarter')
outputs = [Path(str(prefix) + '-' + view + '.png') for view in views]
assert not any(path.exists() for path in outputs)
scene = bpy.context.scene
previous_camera = scene.camera
previous_path = scene.render.filepath
data = bpy.data.cameras.new('TEMP-detail-camera')
camera = bpy.data.objects.new('TEMP-detail-camera', data)
scene.collection.objects.link(camera)
data.type = 'ORTHO'
data.ortho_scale = detail_scale
try:
    for view, output in zip(views, outputs):
        rotation = bpy.data.objects['CAM-r11-' + view].matrix_world.to_quaternion()
        camera.rotation_mode = 'QUATERNION'
        camera.rotation_quaternion = rotation
        camera.location = target + rotation @ Vector((0, 0, 4))
        scene.camera = camera
        scene.render.filepath = str(output)
        bpy.context.view_layer.update()
        bpy.ops.render.render(write_still=True)
finally:
    scene.camera = previous_camera
    scene.render.filepath = previous_path
    bpy.data.objects.remove(camera, do_unlink=True)
    bpy.data.cameras.remove(data)
print('Four detail views rendered; source camera state restored.')
