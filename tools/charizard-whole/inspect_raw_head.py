"""Inspect the unedited official-input baseline at the existing head review cameras."""
import bpy
from pathlib import Path
from mathutils import Vector

root = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r04')
working = bpy.context.scene
assert working.name == 'EDIT-charizard-whole-r04'
checkpoint = root / 'charizard-whole-r04-cages-a.blend'
assert not checkpoint.exists()
bpy.data.libraries.write(str(checkpoint), {working}, fake_user=True, compress=True)
assert 'REFERENCE-raw-official-head-r04' not in bpy.data.scenes
reference = bpy.data.scenes.new('REFERENCE-raw-official-head-r04')
bpy.context.window.scene = reference
bpy.ops.import_scene.gltf(filepath='/mnt/zer0models/workspace/zer0/experiments/pokemon/assets/experiments/charizard-official-raw/charizard-official-raw-61062-o256.glb')
for obj in reference.objects:
    if obj.type == 'MESH':
        obj.name = 'REF-raw-official-charizard-r04'
        for polygon in obj.data.polygons:
            polygon.use_smooth = True
camera = bpy.data.objects.new('CAM-raw-head-r04', bpy.data.cameras.new('CAM-raw-head-r04'))
reference.collection.objects.link(camera)
reference.camera = camera
reference.render.engine = 'BLENDER_WORKBENCH'
reference.render.resolution_x = reference.render.resolution_y = 720
reference.render.resolution_percentage = 100
reference.render.image_settings.file_format = 'PNG'
shading = reference.display.shading
shading.light = 'STUDIO'
shading.studio_light = 'paint.sl'
shading.color_type = 'SINGLE'
shading.single_color = (.63, .65, .68)
shading.show_shadows = shading.show_cavity = False
shading.background_type = 'WORLD'
reference.world = bpy.data.worlds.new('WORLD-raw-head-r04')
reference.world.color = (.055, .055, .055)
head = Vector((-.085, -.77, .49))
side = Vector((-.8660254, .5, 0))
forward = Vector((-.49446818, -.856444, .14834046))
for name, direction in [('front', forward), ('side', -side)]:
    camera.location = head + direction * 3
    camera.rotation_euler = (head - camera.location).to_track_quat('-Z', 'Y').to_euler()
    camera.data.type = 'ORTHO'
    camera.data.ortho_scale = .65
    camera.data.clip_start = 2.8 if name == 'side' else .01
    camera.data.clip_end = 3.2 if name == 'side' else 100
    reference.render.filepath = str(root / ('raw-baseline-head-' + name + '.png'))
    bpy.ops.render.render(write_still=True)
bpy.context.window.scene = working
print('Raw baseline head captured; cage prototype saved separately')
