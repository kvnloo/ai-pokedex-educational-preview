"""Display the proposed selection on a separate read-only mesh copy."""
import bpy
import numpy as np
from pathlib import Path
from mathutils import Vector

out = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r02/r02b')
weights = np.load(out / 'region.npz')['weights']
scene = bpy.data.scenes.new('REVIEW-root-region-r02b')
bpy.context.window.scene = scene
source = bpy.data.objects['GEO-charizard-body-tail-r02b']
obj = source.copy()
obj.data = source.data.copy()
obj.name = 'GEO-root-region-review-r02b'
scene.collection.objects.link(obj)
attribute = obj.data.color_attributes.new(name='Selection', type='FLOAT_COLOR', domain='POINT')
colors = np.tile([.5, .52, .55, 1.], (len(weights), 1))
colors[:, :3] += weights[:, None] * (np.asarray([1., .28, .035]) - colors[:, :3])
attribute.data.foreach_set('color', colors.ravel())
obj.data.color_attributes.active_color = attribute
camera = bpy.data.objects.new('CAM-root-region-r02b', bpy.data.cameras.new('CAM-root-region-r02b'))
scene.collection.objects.link(camera)
scene.camera = camera
camera.data.type = 'ORTHO'
camera.data.ortho_scale = 2.48
target = Vector((0, -.05, -.02))
scene.render.engine = 'BLENDER_WORKBENCH'
scene.render.resolution_x = scene.render.resolution_y = 900
scene.render.resolution_percentage = 100
shade = scene.display.shading
shade.color_type = 'VERTEX'
shade.light = 'STUDIO'
shade.studio_light = 'paint.sl'
shade.show_cavity = False
shade.show_shadows = False
for name, direction in {'side': (-1, 0, .05), 'rear': (-1, 1, .35)}.items():
    camera.location = target + Vector(direction).normalized() * 6
    camera.rotation_euler = (target - camera.location).to_track_quat('-Z', 'Y').to_euler()
    scene.render.filepath = str(out / ('region-' + name + '.png'))
    bpy.ops.render.render(write_still=True)
