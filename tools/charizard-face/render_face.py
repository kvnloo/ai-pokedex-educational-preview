"""Render supplementary facial views with the provisional eye palette."""
import bpy
import json
from pathlib import Path
from mathutils import Vector

root = Path(globals().get('face_root','/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r04'))
revision = globals().get('face_revision','r09')
out = root/('head-'+revision)
scene = bpy.data.scenes['EDIT-charizard-head-'+revision]
bpy.context.window.scene = scene
data = json.loads((root/'landmarks-r02/landmarks.json').read_text())
origin = Vector(data['origin'])
side,forward,up = [Vector(row) for row in data['frame']]
camera = scene.camera
camera.data.ortho_scale = .65
scene.render.resolution_x = scene.render.resolution_y = 1000
scene.display.shading.color_type = 'VERTEX'
scene.display.shading.show_shadows = False
directions = {'face-front':forward,'face-negative-side':-side,'face-positive-side':side,'face-top':up,'face-reference':Vector((0,-1,0))}
for name,direction in directions.items():
    camera.location = origin+direction*3
    camera.rotation_euler = (origin-camera.location).to_track_quat('-Z','Y').to_euler()
    camera.data.clip_start = 2.80 if 'side' in name else .01
    camera.data.clip_end = 3.20 if 'side' in name else 1000
    scene.render.filepath = str(out/(name+'.png'))
    bpy.ops.render.render(write_still=True)
camera.data.clip_start=.01
camera.data.clip_end=1000
(out/'face-cameras.json').write_text(json.dumps({'origin':list(origin),'frame':data['frame'],'orthoScale':.65,'resolution':[1000,1000],'sideClipping':[2.80,3.20],'sideClippingPurpose':'Exclude foreground wings only in supplementary face inspections; unclipped standard head/whole-body views remain available','palette':'Provisional vertex colors, not PBR textures'},indent=2)+'\n')
print('Rendered supplementary face views for '+revision)
