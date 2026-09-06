"""Show proposed facial landmarks on an unchanged copy of the current head."""
import bpy
import json
import numpy as np
from pathlib import Path
from mathutils import Vector

root = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r04')
out = root / 'landmarks-r01'
assert not out.exists()
out.mkdir(parents=True)
source = bpy.data.objects['GEO-charizard-body-head-r06']
scene = bpy.data.scenes.new('REVIEW-charizard-face-landmarks-r01')
body = source.copy()
body.data = source.data.copy()
body.name = 'GEO-charizard-face-landmarks-r01'
scene.collection.objects.link(body)
bpy.context.window.scene = scene
bpy.context.view_layer.update()

origin = Vector((-.085, -.77, .49))
forward = Vector((-.5, -.8660254, .15)).normalized()
side = forward.cross(Vector((0, 0, 1))).normalized()
up = side.cross(forward).normalized()
xyz = np.asarray([vertex.co[:] for vertex in body.data.vertices])
frame = np.asarray([side[:], forward[:], up[:]])
local = (xyz - np.asarray(origin)) @ frame.T
landmarks = []
for sign, name in [(-1, 'negative-side'), (1, 'positive-side')]:
    for label, t, h in [('eye-center', .03, .05), ('eye-front', .095, .04), ('eye-upper', -.005, .073), ('eye-rear', -.032, .051), ('eye-lower', .030, .015)]:
        start = origin + forward * t + up * h + side * sign * .4
        hit, point, normal, index = body.ray_cast(start, -sign * side)
        assert hit
        landmarks.append({'side': name, 'label': label, 't': t, 'h': h, 'point': list(point), 'normal': list(normal), 'face': index})

attribute = body.data.color_attributes.new(name='face-landmarks', type='FLOAT_COLOR', domain='POINT')
colors = np.tile(np.asarray([.63, .65, .68, 1], dtype=np.float32), (len(xyz), 1))
palette = {'eye-center': [1,.04,.03,1], 'eye-front': [1,.8,.03,1], 'eye-upper': [.1,.3,1,1], 'eye-rear': [.8,.05,1,1], 'eye-lower': [.04,1,.1,1]}
for landmark in landmarks:
    mask = np.linalg.norm(xyz - np.asarray(landmark['point']), axis=1) < .013
    colors[mask] = palette[landmark['label']]
attribute.data.foreach_set('color', colors.ravel())
body.data.color_attributes.active_color = attribute
camera = bpy.data.objects.new('CAM-charizard-face-landmarks-r01', bpy.data.cameras.new('CAM-charizard-face-landmarks-r01'))
scene.collection.objects.link(camera)
scene.camera = camera
camera.data.type = 'ORTHO'
camera.data.ortho_scale = .65
scene.render.engine = 'BLENDER_WORKBENCH'
scene.render.resolution_x = scene.render.resolution_y = 1000
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
shade = scene.display.shading
shade.light = 'STUDIO'
shade.studio_light = 'paint.sl'
shade.color_type = 'VERTEX'
shade.show_shadows = False
shade.show_cavity = False
shade.background_type = 'WORLD'
scene.world = bpy.data.worlds.new('WORLD-charizard-face-landmarks-r01')
scene.world.color = (.075, .075, .075)
directions = {'face-front': forward, 'face-negative-side': -side, 'face-positive-side': side, 'face-top': up, 'head-front': Vector((0,-1,0))}
for name, direction in directions.items():
    camera.location = origin + direction * 3
    camera.rotation_euler = (origin - camera.location).to_track_quat('-Z', 'Y').to_euler()
    scene.render.filepath = str(out / (name + '.png'))
    bpy.ops.render.render(write_still=True)
(out / 'landmarks.json').write_text(json.dumps({'source': 'charizard-head-r06', 'origin': list(origin), 'frame': frame.tolist(), 'landmarks': landmarks, 'palette': palette, 'geometryEdited': False}, indent=2) + '\n')
np.savez_compressed(out / 'surface.npz', positions=xyz, local=local)
print(json.dumps({'landmarks': landmarks, 'output': str(out), 'geometryEdited': False}))
