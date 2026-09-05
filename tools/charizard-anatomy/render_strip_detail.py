"""Matched magnified inspection of the inner collar before and after repair."""
import bpy
import json
from pathlib import Path
from mathutils import Vector

root = Path(globals().get('detail_root', '/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r02'))
target, direction = Vector((-.495, .20, -.472)), Vector((1, .15, .12)).normalized()
for suffix in ['r02d', 'r02e']:
    scene = bpy.data.scenes['EDIT-charizard-tail-' + suffix]
    bpy.context.window.scene = scene
    camera = scene.camera
    camera.data.type = 'ORTHO'
    camera.data.ortho_scale = .16
    camera.location = target + direction * .7
    camera.rotation_euler = (target - camera.location).to_track_quat('-Z', 'Y').to_euler()
    scene.render.resolution_x = scene.render.resolution_y = 1000
    scene.display.shading.show_shadows = False
    scene.display.shading.show_cavity = False
    scene.render.filepath = str(root / suffix / ('charizard-tail-' + suffix + '-root-inner.png'))
    bpy.ops.render.render(write_still=True)
    (root / suffix / 'inner-camera.json').write_text(json.dumps({'target': list(target), 'direction': list(direction), 'orthoScale': .16, 'distance': .7, 'resolution': [1000, 1000], 'shadows': False, 'cavity': False, 'engine': 'BLENDER_WORKBENCH', 'light': 'paint.sl'}, indent=2) + '\n')
