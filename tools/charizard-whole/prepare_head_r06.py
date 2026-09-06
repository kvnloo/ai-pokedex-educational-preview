"""Copy live r05 session state into an exclusive scene and freeze the r06 intake."""
import bpy
import json
from pathlib import Path

source = bpy.context.scene
assert source.name == 'EDIT-charizard-whole-r05' and bpy.context.mode == 'OBJECT'
name = 'EDIT-charizard-whole-r06'
root = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r06')
assert name not in bpy.data.scenes and not root.exists()
root.mkdir()
scene = bpy.data.scenes.new(name)
bpy.context.window.scene = scene
mapping = {}
for original in source.objects:
    copy = original.copy()
    if original.data:
        copy.data = original.data.copy()
    copy.name = original.name.replace('r05', 'r06')
    scene.collection.objects.link(copy)
    copy.hide_set(original.hide_get(view_layer=source.view_layers[0]))
    mapping[original] = copy
for original, copy in mapping.items():
    if original.parent:
        copy.parent = mapping.get(original.parent, original.parent)
scene.camera = mapping[source.camera]
scene.world = source.world.copy()
head = bpy.data.objects['GEO-charizard-raw-head-r06']
assert head.data.users == 1
assert head.data.shape_keys != bpy.data.objects['GEO-charizard-raw-head-r05'].data.shape_keys
jaw = head.data.shape_keys.key_blocks['Refine_JawDepth_r05']
assert jaw.value == 1
muzzle = head.shape_key_add(name='Refine_MuzzleLength_r06', from_mix=True)
jaw.value = 0
muzzle.value = 1
head.active_shape_key_index = len(head.data.shape_keys.key_blocks)-1
for obj in scene.objects:
    obj.select_set(obj == head)
bpy.context.view_layer.objects.active = head
bpy.context.view_layer.update()
scene.render.engine = 'BLENDER_WORKBENCH'
scene.render.resolution_x = scene.render.resolution_y = 720
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
shade = scene.display.shading
shade.light = 'STUDIO'
shade.studio_light = 'paint.sl'
shade.color_type = 'SINGLE'
shade.single_color = (.63, .65, .68)
shade.show_shadows = shade.show_cavity = False
shade.background_type = 'WORLD'
bpy.data.libraries.write(str(root/'charizard-whole-r06-start.blend'), {scene}, fake_user=True, compress=True)
print(json.dumps({'scene': scene.name, 'exclusiveHead': head.data.users == 1, 'activeKey': muzzle.name, 'root': str(root)}))
