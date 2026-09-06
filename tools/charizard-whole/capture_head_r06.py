"""Capture a named r06 head study with fixed cameras and lighting."""
import bpy
import json
from pathlib import Path
from mathutils import Vector

scene = bpy.context.scene
assert scene.name == globals().get('capture_scene', 'EDIT-charizard-whole-r06') and bpy.context.mode == 'OBJECT'
label = globals()['capture_label']
root = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r06')/label
assert not root.exists()
root.mkdir()
head = next(obj for obj in scene.objects if obj.name.startswith('GEO-charizard-raw-head-r06'))
camera = scene.camera
scene.render.engine = 'BLENDER_WORKBENCH'
scene.render.resolution_x = scene.render.resolution_y = 720
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.render.film_transparent = False
shade = scene.display.shading
shade.light = 'STUDIO'
shade.studio_light = 'paint.sl'
shade.color_type = globals().get('capture_color', 'SINGLE')
shade.single_color = (.63, .65, .68)
shade.show_shadows = shade.show_cavity = False
shade.background_type = 'WORLD'
scene.world.color = (.055, .055, .055)
origin = Vector((-.085, -.77, .49))
side = Vector((-.8660254, .5, 0))
forward = Vector((-.49446818, -.856444, .14834046))
up = Vector((.07417023, .12846661, .98893636))
views = {'front': forward, 'near': -side, 'far': side, 'threequarter': forward-side*.8+up*.3}
cameras = {}
for name, direction in views.items():
    camera.location = origin+direction.normalized()*3
    camera.rotation_euler = (origin-camera.location).to_track_quat('-Z', 'Y').to_euler()
    camera.data.type = 'ORTHO'
    camera.data.ortho_scale = .65
    camera.data.clip_start = 2.8 if name in {'near','far'} else .01
    camera.data.clip_end = 3.2 if name in {'near','far'} else 100
    scene.render.filepath = str(root/(name+'.png'))
    bpy.ops.render.render(write_still=True)
    cameras[name] = {'location':list(camera.location),'rotation':list(camera.rotation_euler),'clip':[camera.data.clip_start,camera.data.clip_end],'orthoScale':camera.data.ortho_scale}
report = {'scene':scene.name,'label':label,'resolution':[720,720], 'engine':scene.render.engine,'light':'paint.sl','colorMode':shade.color_type, 'cameras':cameras,'shapeKeys':{key.name:key.value for key in head.data.shape_keys.key_blocks},'scope':'Fixed-camera geometry study; no runtime or visual acceptance implied.'}
(root/'capture.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({'root':str(root),'views':list(views)}))
