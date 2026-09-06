"""Render the native horn trial against its unchanged intake; no anatomy edits."""
import bpy
from pathlib import Path
from mathutils import Vector

root = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r09')
edit = bpy.data.scenes['EDIT-charizard-whole-home-r09']
body = edit.objects['GEO-charizard-home-whole-r09']
review = bpy.data.scenes['REVIEW-native-r09-fixed-views']
before = review.objects['REVIEW-candidate-r09']
assert body.data != before.data
after = bpy.data.objects.new('REVIEW-horn-isolated-r09', body.data.copy())
review.collection.objects.link(after)
bpy.context.window.scene = review
for obj in review.objects:
    if obj.type == 'MESH':
        obj.hide_render = True
for view in ['front', 'side', 'rear', 'threequarter']:
    whole = review.objects['CAM-r09-' + view]
    review.camera = whole
    after.hide_render = False
    review.render.filepath = str(root / ('horn-isolated-' + view + '.png'))
    bpy.ops.render.render(write_still=True)
    after.hide_render = True
    close = whole.copy()
    close.data = whole.data.copy()
    close.name = 'CAM-r09-head-' + view
    review.collection.objects.link(close)
    target = Vector((.09, -.65, .64))
    close.location = target + whole.rotation_euler.to_quaternion() @ Vector((0, 0, 4))
    close.data.ortho_scale = .85
    review.camera = close
    for label, visible, hidden in [('before', before, after), ('after', after, before)]:
        visible.hide_render = False
        hidden.hide_render = True
        review.render.filepath = str(root / ('horn-' + label + '-' + view + '.png'))
        bpy.ops.render.render(write_still=True)
    before.hide_render = after.hide_render = True
after.hide_render = False
bpy.context.window.scene = edit
bpy.ops.wm.save_as_mainfile(filepath=str(root / 'charizard-home-native-r09-horn-isolated.blend'))
