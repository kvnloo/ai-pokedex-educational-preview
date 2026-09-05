import bpy
import json
from pathlib import Path
from mathutils import Vector

ROOT = Path('/mnt/zer0models/workspace/zer0/experiments/pokemon')
OUT = Path(globals().get('output_directory', '/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r02/r02a'))
scene = bpy.data.scenes['EDIT-charizard-tail-r02a']
bpy.context.window.scene = scene
frame = json.loads((ROOT / 'assets/blender/charizard-fair-review/charizard-official-61062-o256.json').read_text())
lo, hi = [Vector(point) for point in frame['bounds']]
center, extent = (lo + hi) / 2, max(hi - lo)
if scene.camera is None:
    data = bpy.data.cameras.new('CAM-charizard-tail-r02a')
    scene.camera = bpy.data.objects.new(data.name, data)
    scene.collection.objects.link(scene.camera)
camera = scene.camera
camera.data.type = 'ORTHO'
camera.data.ortho_scale = extent * 1.25
scene.render.engine = 'BLENDER_WORKBENCH'
scene.render.resolution_x = scene.render.resolution_y = 800
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
shade = scene.display.shading
shade.light = 'STUDIO'
shade.studio_light = 'paint.sl'
shade.color_type = 'SINGLE'
shade.single_color = (.63, .65, .68)
shade.show_shadows = True
shade.show_cavity = False
shade.background_type = 'WORLD'
if scene.world is None:
    scene.world = bpy.data.worlds.new('WORLD-charizard-tail-r02a')
scene.world.color = (.075, .075, .075)
directions = {'minusY': (0, -1, 0), 'plusX': (1, 0, 0), 'plusY': (0, 1, 0), 'minusX': (-1, 0, 0), 'threequarter': (1, -1, .4)}
for view in globals().get('review_views', list(directions)):
    camera.location = center + Vector(directions[view]).normalized() * extent * 3
    camera.rotation_euler = (center - camera.location).to_track_quat('-Z', 'Y').to_euler()
    scene.render.filepath = str(OUT / f'charizard-tail-r02a-{view}.png')
    bpy.ops.render.render(write_still=True)
    print('Rendered ' + scene.render.filepath)

for obj in scene.objects:
    obj.select_set(obj.type == 'MESH')
bpy.context.view_layer.objects.active = bpy.data.objects['GEO-charizard-body-tail-r02a']
bpy.ops.export_scene.gltf(filepath=str(OUT / 'charizard-tail-r02a.glb'), export_format='GLB', use_selection=True, use_active_scene=True, export_animations=False)
bpy.data.libraries.write(str(OUT / 'charizard-tail-r02a.blend'), {scene}, fake_user=True)
(OUT / 'camera-receipt.json').write_text(json.dumps({'framingParent': str(ROOT / 'assets/blender/charizard-fair-review/charizard-official-61062-o256.json'), 'bounds': frame['bounds'], 'orthoScale': camera.data.ortho_scale, 'directions': directions, 'engine': 'BLENDER_WORKBENCH', 'light': 'paint.sl', 'cavity': False, 'resolution': [800, 800]}, indent=2) + '\n')
