"""Render a named owned candidate with the frozen whole-body and root cameras."""
import bpy
import json
from pathlib import Path
from mathutils import Vector

identifier = globals()['candidate_id']
out = Path(globals()['candidate_directory'])
scene = bpy.data.scenes['EDIT-' + identifier]
bpy.context.window.scene = scene
assert not (out / (identifier + '.blend')).exists(), 'Preserve exported candidates'
camera = bpy.data.objects.new('CAM-' + identifier, bpy.data.cameras.new('CAM-' + identifier))
scene.collection.objects.link(camera)
scene.camera = camera
camera.data.type = 'ORTHO'
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
scene.world = bpy.data.worlds.new('WORLD-' + identifier)
scene.world.color = (.075, .075, .075)
frames = Path('/mnt/zer0models/workspace/zer0/experiments/pokemon/assets/blender/charizard-fair-review/charizard-official-61062-o256.json')
bounds = json.loads(frames.read_text())['bounds']
lo, hi = [Vector(point) for point in bounds]
center, extent = (lo + hi) / 2, max(hi - lo)
directions = {'minusY': (0, -1, 0), 'plusX': (1, 0, 0), 'plusY': (0, 1, 0), 'minusX': (-1, 0, 0), 'threequarter': (1, -1, .4)}
camera.data.ortho_scale = extent * 1.25
for view, direction in directions.items():
    camera.location = center + Vector(direction).normalized() * extent * 3
    camera.rotation_euler = (center - camera.location).to_track_quat('-Z', 'Y').to_euler()
    scene.render.filepath = str(out / (identifier + '-' + view + '.png'))
    bpy.ops.render.render(write_still=True)
for obj in scene.objects:
    obj.select_set(obj.type == 'MESH')
bpy.context.view_layer.objects.active = max((o for o in scene.objects if o.type == 'MESH'), key=lambda o: len(o.data.vertices))
bpy.ops.export_scene.gltf(filepath=str(out / (identifier + '.glb')), export_format='GLB', use_selection=True, use_active_scene=True, export_animations=False)
bpy.data.libraries.write(str(out / (identifier + '.blend')), {scene}, fake_user=True)

closeup = {'target': [-.65, .23, -.46], 'directions': {'root-side': [-1, 0, .12], 'root-rear': [-1, .75, .28]}, 'orthoScale': .70, 'resolution': [1000, 1000], 'shadows': False}
scene.render.resolution_x = scene.render.resolution_y = 1000
shade.show_shadows = False
camera.data.ortho_scale = closeup['orthoScale']
target = Vector(closeup['target'])
for view, direction in closeup['directions'].items():
    camera.location = target + Vector(direction).normalized() * 4
    camera.rotation_euler = (target - camera.location).to_track_quat('-Z', 'Y').to_euler()
    scene.render.filepath = str(out / (identifier + '-' + view + '.png'))
    bpy.ops.render.render(write_still=True)
for area in bpy.context.screen.areas:
    if area.type == 'VIEW_3D':
        area.spaces.active.region_3d.view_perspective = 'CAMERA'
        area.spaces.active.overlay.show_overlays = False
        area.spaces.active.shading.type = 'SOLID'
        area.spaces.active.shading.show_shadows = False
        area.spaces.active.shading.show_cavity = False
(out / 'camera-receipt.json').write_text(json.dumps({'engine': 'BLENDER_WORKBENCH', 'light': 'paint.sl', 'cavity': False, 'wholeBody': {'bounds': bounds, 'directions': directions, 'orthoScale': extent * 1.25, 'resolution': [800, 800], 'shadows': True}, 'closeup': closeup}, indent=2) + '\n')
print(json.dumps({'candidate': identifier, 'output': str(out), 'renderedViews': list(directions) + list(closeup['directions'])}))
