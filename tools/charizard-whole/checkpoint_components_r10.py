"""Verify component separation, capture matched views, and save a recovery checkpoint."""
import bpy
import json
from pathlib import Path

root = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r10')
scene = bpy.data.scenes['EDIT-charizard-components-r10']
before = bpy.data.scenes['EDIT-charizard-whole-home-r09'].objects['GEO-charizard-home-whole-r09']
pieces = [o for o in scene.objects if o.type == 'MESH']
assert len(pieces) == 2
original = {tuple(v.co) for v in before.data.vertices}
separated = {tuple(v.co) for o in pieces for v in o.data.vertices}
added = separated - original
assert not (original - separated)
assert len(added) == 342 and all(abs(p[2] - .1) < 1e-6 for p in added)
rings = [{tuple(v.co) for v in o.data.vertices if abs(v.co.z - .1) < 1e-6} for o in pieces]
assert rings[0] == rings[1] and len(rings[0]) == 342
report = {'originalPointsMissing': 0, 'insertedCutPoints': len(added),
    'matchingRingVertices': len(rings[0]), 'anatomicalDisplacement': 0,
    'visualAcceptance': False, 'productionTopologyLocked': False}
(root / 'separation-validation.json').write_text(json.dumps(report, indent=2) + '\n')
review = bpy.data.scenes['REVIEW-native-r09-fixed-views']
intact = review.objects['REVIEW-horn-isolated-r09']
for obj in review.objects:
    if obj.type == 'MESH':
        obj.hide_render = obj != intact
scene.render.engine = 'BLENDER_WORKBENCH'
scene.render.resolution_x = scene.render.resolution_y = 1000
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
shading = scene.display.shading
shading.light = 'STUDIO'
shading.studio_light = 'paint.sl'
shading.studiolight_rotate_z = .35
shading.color_type = 'SINGLE'
shading.single_color = (.72, .72, .72)
shading.show_shadows = shading.show_cavity = False
shading.background_type = 'WORLD'
scene.world = bpy.data.worlds.new('WORLD-charizard-components-r10')
scene.world.color = (.08, .08, .08)
scene.view_settings.view_transform = 'Standard'
for view in ['front', 'side', 'rear', 'threequarter']:
    camera = review.objects['CAM-r09-' + view]
    bpy.context.window.scene = review
    review.camera = camera
    review.render.filepath = str(root / ('before-' + view + '.png'))
    bpy.ops.render.render(write_still=True)
    copied = camera.copy()
    copied.data = camera.data.copy()
    copied.name = 'CAM-r10-' + view
    scene.collection.objects.link(copied)
    bpy.context.window.scene = scene
    scene.camera = copied
    scene.render.filepath = str(root / ('components-' + view + '.png'))
    bpy.ops.render.render(write_still=True)
bpy.ops.wm.save_as_mainfile(filepath=str(root / 'charizard-components-r10-recovery-full.blend'))
print(json.dumps(report))
