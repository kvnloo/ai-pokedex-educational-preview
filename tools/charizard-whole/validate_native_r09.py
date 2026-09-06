"""Audit the existing export/socket and refresh mechanical review cameras, without sculpting."""
import bpy
import json
from pathlib import Path

ROOT = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r09')
edit = bpy.data.scenes['EDIT-charizard-whole-home-r09']
body = edit.objects['GEO-charizard-home-whole-r09']
socket = edit.objects['FlameSocket']
assert tuple(body.users_scene) == (edit,)
review = bpy.data.scenes['REVIEW-native-r09-fixed-views']
candidate = review.objects['REVIEW-candidate-r09']
if candidate.data == body.data:
    candidate.data = body.data.copy()
assert body.data.users == 1
reopen = bpy.data.scenes['VALIDATION-native-r09-GLB.001']
imported = next(o for o in reopen.objects if o.type == 'MESH')
tip = next(o for o in reopen.objects if o.type == 'EMPTY')
assert len(reopen.objects) == 2 and tip.parent == imported
assert tip.get('effect') == 'charizard-tail-flame' and tip.get('energyBaked') is False
assert (tip.location - socket.location).length < 1e-6
assert (tip.matrix_world.translation - socket.matrix_world.translation).length < 1e-6
assert tip.matrix_local.to_quaternion().rotation_difference(socket.matrix_local.to_quaternion()).angle < 1e-6
assert len(imported.data.materials) == len(body.data.materials) == 0
assert len(imported.data.uv_layers) == len(body.data.uv_layers) == 0
body.data.calc_loop_triangles()
receipt_path = ROOT / 'flame-separation.json'
receipt = json.loads(receipt_path.read_text())
receipt['after']['triangles'] = len(body.data.loop_triangles)
receipt.update(materialCount=0, uvLayerCount=0, socket_rotation_euler=list(socket.rotation_euler))
receipt_path.write_text(json.dumps(receipt, indent=2) + '\n')
validation_path = ROOT / 'glb-reopen.json'
validation = json.loads(validation_path.read_text())
validation.update(materialCount=0, uvLayerCount=0, socket={
    'parentVerified': True, 'effect': tip['effect'], 'energyBaked': tip['energyBaked'],
    'local': list(tip.location), 'world': list(tip.matrix_world.translation),
    'rotation_euler': list(tip.rotation_euler), 'transformTolerance': 1e-6})
validation_path.write_text(json.dumps(validation, indent=2) + '\n')
bpy.context.window.scene = review
review.display.shading.show_shadows = False
review.display.shading.show_cavity = False
review.display.shading.studio_light = 'paint.sl'
review.display.shading.single_color = (.72, .72, .72)
baseline = review.objects['REVIEW-raw-HOME-61061']
for view in ['front', 'side', 'rear', 'threequarter']:
    review.camera = review.objects['CAM-r09-' + view]
    for label, visible, hidden in [('baseline', baseline, candidate), ('candidate', candidate, baseline)]:
        visible.hide_render = False
        hidden.hide_render = True
        review.render.filepath = str(ROOT / (label + '-' + view + '-neutral.png'))
        bpy.ops.render.render(write_still=True)
bpy.context.window.scene = edit
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT / 'charizard-home-native-r09.blend'))
print(json.dumps(validation))
