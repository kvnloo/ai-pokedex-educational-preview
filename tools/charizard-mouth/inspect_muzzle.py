"""Inspect the source muzzle envelope without changing the accepted parent mesh."""
import bpy
import hashlib
import json
import numpy as np
from pathlib import Path
from mathutils import Vector

root = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05')
out = root / 'muzzle-selection-r01'
assert not out.exists()
out.mkdir(parents=True)
parent = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r04/head-r18')
blend = parent / 'charizard-head-r18.blend'
assert hashlib.sha256(blend.read_bytes()).hexdigest() == 'f28844e1311a399d548f7aed0993f7201ac95c0c5a240b5e590f0700de121b38'
source = bpy.data.objects['GEO-charizard-body-head-r18']
audit = np.load(parent / 'eye-audit.npz')
before = np.asarray([vertex.co[:] for vertex in source.data.vertices], dtype=np.float32)
assert np.array_equal(before, audit['after'])
landmarks = json.loads((parent / 'face-cameras.json').read_text())
origin, frame = np.asarray(landmarks['origin']), np.asarray(landmarks['frame'])
local = (before-origin) @ frame.T
head = ~audit['protected']
region = head & (local[:,1] > -.035) & (local[:,2] < .025)
colors = np.tile(np.asarray([.63,.65,.68,1], dtype=np.float32), (len(before),1))
colors[region] = [.05,.8,.16,1]
scene = bpy.data.scenes.new('REVIEW-charizard-muzzle-selection-r01')
for original in bpy.data.scenes['EDIT-charizard-head-r18'].objects:
    if original.type != 'MESH':
        continue
    obj = original.copy(); obj.data = original.data.copy(); obj.parent = None
    obj.matrix_world = original.matrix_world.copy()
    obj.name = original.name.replace('r18', 'muzzle-selection-r01')
    scene.collection.objects.link(obj)
    if original == source:
        attribute = obj.data.color_attributes.new(name='muzzle-selection', type='FLOAT_COLOR', domain='POINT')
        attribute.data.foreach_set('color', colors.ravel())
        obj.data.color_attributes.active_color = attribute
bpy.context.window.scene = scene
camera = bpy.data.objects.new('CAM-charizard-muzzle-selection-r01', bpy.data.cameras.new('CAM-charizard-muzzle-selection-r01'))
scene.collection.objects.link(camera); scene.camera = camera; camera.data.type = 'ORTHO'
camera.data.ortho_scale = .64
scene.render.engine = 'BLENDER_WORKBENCH'
scene.render.resolution_x = scene.render.resolution_y = 1000
scene.render.resolution_percentage = 100
scene.world = bpy.data.worlds.new('WORLD-charizard-muzzle-selection-r01'); scene.world.color = (.075,.075,.075)
shade = scene.display.shading; shade.light = 'STUDIO'; shade.studio_light = 'paint.sl'
shade.color_type = 'VERTEX'; shade.show_shadows = False; shade.show_cavity = False; shade.background_type = 'WORLD'
side, forward, up = [Vector(row) for row in frame]
target = Vector(origin)
directions = {'front':forward, 'reference':Vector((0,-1,0)), 'negative-side':-side, 'positive-side':side, 'top':up}
for name, direction in directions.items():
    camera.location = target+direction*3
    camera.rotation_euler = (target-camera.location).to_track_quat('-Z','Y').to_euler()
    camera.data.clip_start = 2.80 if 'side' in name else .01
    camera.data.clip_end = 3.20 if 'side' in name else 1000
    scene.render.filepath = str(out/(name+'.png')); bpy.ops.render.render(write_still=True)
source.data.calc_loop_triangles()
triangles = np.asarray([triangle.vertices[:] for triangle in source.data.loop_triangles], dtype=np.int64)
edges = np.asarray([edge.vertices[:] for edge in source.data.edges], dtype=np.int64)
np.savez_compressed(out/'source.npz', before=before, local=local, triangles=triangles, edges=edges,
                    protected=audit['protected'], region=region)
(out/'selection.json').write_text(json.dumps({'parent':str(blend), 'origin':origin.tolist(), 'frame':frame.tolist(),
    'region':'unprotected source with forward>-.035 and up<.025', 'selectedVertices':int(region.sum()),
    'headBoundsLocal':[local[head].min(0).tolist(),local[head].max(0).tolist()],
    'geometryEdited':False, 'sideClippingPurpose':'Exclude foreground wings only for inspection'}, indent=2)+'\n')
print(json.dumps({'selectedVertices':int(region.sum()),'headBoundsLocal':[local[head].min(0).tolist(),local[head].max(0).tolist()]}))
