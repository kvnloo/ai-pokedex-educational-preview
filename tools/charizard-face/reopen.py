"""Reopen the exported GLB in an owned inspection scene without changing its source."""
import bpy
import hashlib
import json
from pathlib import Path
from mathutils import Vector

root = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r04')
out = root / 'head-r18'
asset = out / 'charizard-head-r18.glb'
name = 'REVIEW-charizard-head-r18-glb'
assert bpy.data.scenes.get(name) is None
scene = bpy.data.scenes.new(name)
bpy.context.window.scene = scene
bpy.ops.import_scene.gltf(filepath=str(asset))
records = []
for obj in scene.objects:
    if obj.type != 'MESH':
        continue
    records.append({
        'name': obj.name, 'vertices': len(obj.data.vertices), 'polygons': len(obj.data.polygons),
        'worldTransform': [list(row) for row in obj.matrix_world],
        'worldBounds': [list(obj.matrix_world @ Vector(corner)) for corner in obj.bound_box],
        'uvLayers': len(obj.data.uv_layers), 'colorAttributes': [a.name for a in obj.data.color_attributes],
        'materials': [material.name for material in obj.data.materials],
        'hasAnimation': bool(obj.animation_data),
    })
assert len(records) == 4
source = bpy.data.scenes['EDIT-charizard-head-r18']
camera = source.camera.copy()
camera.data = source.camera.data.copy()
camera.name = 'CAM-charizard-head-r18-reopened'
scene.collection.objects.link(camera)
scene.camera = camera
origin = Vector(json.loads((root / 'landmarks-r02/landmarks.json').read_text())['origin'])
camera.location = origin + Vector((0, -3, 0))
camera.rotation_euler = (origin-camera.location).to_track_quat('-Z', 'Y').to_euler()
camera.data.ortho_scale = .65
camera.data.clip_start = .01
camera.data.clip_end = 1000
scene.render.engine = 'BLENDER_WORKBENCH'
scene.render.resolution_x = scene.render.resolution_y = 1000
scene.render.resolution_percentage = 100
scene.world = source.world.copy()
shade = scene.display.shading
shade.light = 'STUDIO'
shade.studio_light = 'paint.sl'
shade.color_type = 'VERTEX'
shade.show_shadows = False
shade.show_cavity = False
shade.background_type = 'WORLD'
scene.render.filepath = str(out / 'reopened-face.png')
bpy.ops.render.render(write_still=True)
for area in bpy.context.screen.areas:
    if area.type == 'VIEW_3D':
        space = area.spaces.active
        space.region_3d.view_perspective = 'CAMERA'
        space.region_3d.view_camera_zoom = 8
        space.overlay.show_overlays = False
        space.shading.type = 'SOLID'
        space.shading.light = 'STUDIO'
        space.shading.studio_light = 'paint.sl'
        space.shading.color_type = 'VERTEX'
        space.shading.show_shadows = False
        space.shading.show_cavity = False
        area.tag_redraw()
(out / 'reopen-receipt.json').write_text(json.dumps({
    'file': str(asset), 'sha256': hashlib.sha256(asset.read_bytes()).hexdigest(),
    'scene': name, 'meshes': records, 'status': 'reopened and rendered; inspect actual image/UI separately',
}, indent=2) + '\n')
print(json.dumps({'scene': name, 'meshCount': len(records), 'vertices': sum(row['vertices'] for row in records)}))
