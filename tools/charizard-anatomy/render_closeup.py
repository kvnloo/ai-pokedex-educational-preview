"""Matched root views; linked geometry is read-only in owned review scenes."""
import bpy
import json
from pathlib import Path
from mathutils import Vector

out = Path(globals().get('output_directory', '/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r02/r02a'))
target = Vector((-.65, .23, -.46))
views = {'root-side': (-1, 0, .12), 'root-rear': (-1, .75, .28)}
for revision in ['r01', 'r02a']:
    scene = bpy.data.scenes.new('REVIEW-tail-closeup-' + revision)
    bpy.context.window.scene = scene
    parent = bpy.data.scenes['EDIT-charizard-tail-' + revision]
    for obj in parent.objects:
        if obj.type == 'MESH':
            copy = obj.copy()
            copy.parent = None
            copy.matrix_world = obj.matrix_world.copy()
            scene.collection.objects.link(copy)
    camera = bpy.data.objects.new('CAM-root-' + revision, bpy.data.cameras.new('CAM-root-' + revision))
    scene.collection.objects.link(camera)
    scene.camera = camera
    camera.data.type = 'ORTHO'
    camera.data.ortho_scale = .70
    scene.render.engine = 'BLENDER_WORKBENCH'
    scene.render.resolution_x = scene.render.resolution_y = 1000
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'PNG'
    shade = scene.display.shading
    shade.light = 'STUDIO'
    shade.studio_light = 'paint.sl'
    shade.color_type = 'SINGLE'
    shade.single_color = (.63, .65, .68)
    shade.show_shadows = False
    shade.show_cavity = False
    shade.background_type = 'WORLD'
    scene.world = bpy.data.worlds.new('WORLD-root-' + revision)
    scene.world.color = (.075, .075, .075)
    for name, direction in views.items():
        camera.location = target + Vector(direction).normalized() * 4
        camera.rotation_euler = (target - camera.location).to_track_quat('-Z', 'Y').to_euler()
        scene.render.filepath = str(out / f'charizard-tail-{revision}-{name}.png')
        bpy.ops.render.render(write_still=True)
    for area in bpy.context.screen.areas:
        if area.type == 'VIEW_3D':
            area.spaces.active.region_3d.view_perspective = 'CAMERA'
            area.spaces.active.overlay.show_overlays = False
            area.spaces.active.shading.type = 'SOLID'
            area.spaces.active.shading.show_shadows = False
            area.spaces.active.shading.show_cavity = False
(out / 'closeup-camera.json').write_text(json.dumps({'target': list(target), 'directions': views, 'orthoScale': .70, 'resolution': [1000, 1000], 'engine': 'BLENDER_WORKBENCH', 'light': 'paint.sl', 'shadows': False, 'cavity': False}, indent=2) + '\n')
