"""Render the replacement skull patch using the inspected close-up cameras."""
import bpy
import json
from pathlib import Path
from mathutils import Vector

root=Path(globals().get('face_root','/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r04'))
revision=globals().get('divot_revision','r13')
scene=bpy.data.scenes['EDIT-charizard-head-'+revision]
bpy.context.window.scene=scene
settings=json.loads((root/'divot-baseline/cameras.json').read_text())
camera=scene.camera;camera.data.ortho_scale=settings['orthoScale']
scene.render.resolution_x,scene.render.resolution_y=settings['resolution']
shade=scene.display.shading;shade.color_type='SINGLE';shade.single_color=(.63,.65,.68);shade.show_shadows=False;shade.show_cavity=False
shade.background_type='THEME'
scene.render.film_transparent=True
target=Vector(settings['target'])
for name,direction in settings['directions'].items():
    camera.location=target+Vector(direction).normalized()*3
    camera.rotation_euler=(target-camera.location).to_track_quat('-Z','Y').to_euler()
    scene.render.filepath=str(root/('head-'+revision)/('divot-'+name+'.png'))
    bpy.ops.render.render(write_still=True)
print('Rendered skull patch close-ups for '+revision)
