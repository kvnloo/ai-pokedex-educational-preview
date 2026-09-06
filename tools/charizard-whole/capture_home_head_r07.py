"""Capture four fixed views of the normalized HOME head sculpt study."""
import bpy
import json
from pathlib import Path
from mathutils import Vector

scene = bpy.context.scene
assert scene.name == 'EDIT-charizard-head-home-r07' and bpy.context.mode == 'OBJECT'
root = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r07')/globals()['capture_label']
assert not root.exists()
root.mkdir()
camera = scene.camera
obj = bpy.data.objects['GEO-charizard-home-head-r07']
origin = obj.matrix_world.translation
side = obj.matrix_world.col[0].to_3d()
forward = obj.matrix_world.col[1].to_3d()
up = obj.matrix_world.col[2].to_3d()
views = {'front':forward,'near':-side,'far':side,'threequarter':forward-side*.8+up*.3}
cameras = {}
for name,direction in views.items():
    camera.location = origin+direction.normalized()*3
    camera.rotation_euler = (origin-camera.location).to_track_quat('-Z','Y').to_euler()
    camera.data.type = 'ORTHO'
    camera.data.ortho_scale = .7
    camera.data.clip_start = .01
    camera.data.clip_end = 100
    scene.render.filepath = str(root/(name+'.png'))
    bpy.ops.render.render(write_still=True)
    cameras[name] = {'location':list(camera.location),'rotation':list(camera.rotation_euler),'orthoScale':.7}
def visible_meshes(collection):
    if collection.hide_render:
        return []
    objects = [item for item in collection.objects if item.type == 'MESH' and not item.hide_render]
    return objects + [item for child in collection.children for item in visible_meshes(child)]

rendered = [{'name': item.name, 'vertices': len(item.data.vertices),
             'shapeKeys': {key.name: key.value for key in item.data.shape_keys.key_blocks} if item.data.shape_keys else {},
             'matrix': [list(row) for row in item.matrix_world]}
            for item in visible_meshes(scene.collection)]
(root/'capture.json').write_text(json.dumps({'cameras':cameras,'resolution':[scene.render.resolution_x,scene.render.resolution_y],
    'renderedMeshes':rendered,'engine':scene.render.engine,'colorMode':scene.display.shading.color_type,
    'scope':'Fixed cameras for isolated HOME-head comparison; no body integration or visual acceptance.'},indent=2)+'\n')
print(str(root))
