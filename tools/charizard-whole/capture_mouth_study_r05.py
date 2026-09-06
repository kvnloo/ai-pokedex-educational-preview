"""Render the same incised head with original and reduced jaw depth."""
import bpy
import json
from pathlib import Path
from mathutils import Vector

scene = bpy.context.scene
assert scene.name == 'EDIT-charizard-whole-r05' and bpy.context.mode == 'OBJECT'
root = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r05')
variants = [('original-jaw', 0), ('reduced-jaw', 1)]
view_names = ['front', 'near', 'far', 'threequarter']
report_path = root/'mouth-study-cameras.json'
assert not report_path.exists()
assert all(not (root/label/(name+'.png')).exists() for label, _ in variants for name in view_names)
head = bpy.data.objects['GEO-charizard-raw-head-r05']
jaw = head.data.shape_keys.key_blocks['Refine_JawDepth_r05']
camera = scene.camera
camera.data.type = 'ORTHO'
scene.render.engine = 'BLENDER_WORKBENCH'
scene.render.resolution_x = scene.render.resolution_y = 720
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.render.film_transparent = False
shade = scene.display.shading
shade.light = 'STUDIO'
shade.studio_light = 'paint.sl'
shade.color_type = 'SINGLE'
shade.single_color = (.63, .65, .68)
shade.show_shadows = False
shade.show_cavity = False
shade.background_type = 'WORLD'
scene.world.color = (.055, .055, .055)
origin = Vector((-.085, -.77, .49))
side = Vector((-.8660254, .5, 0))
forward = Vector((-.49446818, -.856444, .14834046))
up = Vector((.07417023, .12846661, .98893636))
views = {'front': forward, 'near': -side, 'far': side, 'threequarter': forward-side*.8+up*.3}
for label, value in variants:
    folder = root/label
    folder.mkdir(exist_ok=True)
    jaw.value = value
    bpy.context.view_layer.update()
    for name, direction in views.items():
        target = folder/(name+'.png')
        camera.location = origin+direction.normalized()*3
        camera.rotation_euler = (origin-camera.location).to_track_quat('-Z', 'Y').to_euler()
        camera.data.ortho_scale = .65
        camera.data.clip_start = 2.8 if name in {'near', 'far'} else .01
        camera.data.clip_end = 3.2 if name in {'near', 'far'} else 100
        scene.render.filepath = str(target)
        bpy.ops.render.render(write_still=True)
jaw.value = 1
report = {'comparison': 'Identical incised raw head, jaw refinement shape key 0 versus 1',
          'views': list(views), 'resolution': [720, 720], 'headOrthoScale': .65,
          'engine': 'BLENDER_WORKBENCH', 'light': 'paint.sl', 'shadows': False, 'cavity': False,
          'sideClipping': [2.8, 3.2], 'frontAndThreequarterClipping': [.01, 100],
          'note': 'Geometry study. Separate head/body and provisional eye fit remain visible limitations.'}
report_path.write_text(json.dumps(report, indent=2)+'\n')
print(json.dumps(report))
