"""Render the frozen parent head without editing any source geometry."""
import bpy
import hashlib
import json
from pathlib import Path
from mathutils import Vector

root = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r03')
out = root / 'baseline'
assert not out.exists()
out.mkdir(parents=True)
source = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r02/r02e/charizard-tail-r02e.blend')
parent = bpy.data.scenes['EDIT-charizard-tail-r02e']
assert 'REVIEW-charizard-head-baseline' not in bpy.data.scenes
scene = bpy.data.scenes.new('REVIEW-charizard-head-baseline')
for obj in parent.objects:
    if obj.type == 'MESH':
        scene.collection.objects.link(obj)
bpy.context.window.scene = scene
camera = bpy.data.objects.new('CAM-charizard-head-baseline', bpy.data.cameras.new('CAM-charizard-head-baseline'))
scene.collection.objects.link(camera)
scene.camera = camera
camera.data.type = 'ORTHO'
camera.data.ortho_scale = .85
scene.render.engine = 'BLENDER_WORKBENCH'
scene.render.resolution_x = scene.render.resolution_y = 900
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
shade = scene.display.shading
shade.light = 'STUDIO'
shade.studio_light = 'paint.sl'
shade.color_type = 'SINGLE'
shade.single_color = (.63, .65, .68)
shade.show_shadows = False
shade.show_cavity = False
shade.background_type = 'WORLD'
scene.world = bpy.data.worlds.new('WORLD-charizard-head-baseline')
scene.world.color = (.075, .075, .075)
target = Vector((-.065, -.70, .44))
directions = {'head-front': (0,-1,0), 'head-right': (1,0,0), 'head-left': (-1,0,0), 'head-rear': (0,1,0), 'head-top': (0,0,1), 'head-threequarter': (1,-1,.35)}
for view, direction in directions.items():
    camera.location = target + Vector(direction).normalized() * 3
    camera.rotation_euler = (target-camera.location).to_track_quat('-Z','Y').to_euler()
    scene.render.filepath = str(out / (view+'.png'))
    bpy.ops.render.render(write_still=True)
receipt = {'parent':'charizard-tail-r02e','sourceBlend':str(source),'sourceSHA256':hashlib.sha256(source.read_bytes()).hexdigest(),'engine':'BLENDER_WORKBENCH','light':'paint.sl','shadows':False,'cavity':False,'target':list(target),'orthoScale':.85,'resolution':[900,900],'directions':directions,'geometryEdited':False}
(out/'cameras.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps(receipt))
