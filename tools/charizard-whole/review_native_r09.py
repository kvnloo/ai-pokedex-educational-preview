"""Mechanical cameras, draft export and same-process GLB reopen; no anatomy edits."""
import bpy
import bmesh
import json
from pathlib import Path
from mathutils import Vector

ROOT = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r09')
edit_scene = bpy.context.scene
assert edit_scene.name == 'EDIT-charizard-whole-home-r09'
body = edit_scene.objects['GEO-charizard-home-whole-r09']
socket = edit_scene.objects['FlameSocket']
body.data.calc_loop_triangles()
for obj in bpy.context.view_layer.objects:
    obj.select_set(False)
body.select_set(True)
socket.select_set(True)
bpy.context.view_layer.objects.active = body
glb = ROOT / 'charizard-home-native-r09-physical-study.glb'
bpy.ops.export_scene.gltf(filepath=str(glb), export_format='GLB',
    use_selection=True, use_active_scene=True,
    export_extras=True, export_animations=False)

reopen = bpy.data.scenes.new('VALIDATION-native-r09-GLB')
bpy.context.window.scene = reopen
bpy.ops.import_scene.gltf(filepath=str(glb), merge_vertices=True)
objects = list(reopen.objects)
meshes = [o for o in objects if o.type == 'MESH']
assert len(meshes) == 1
assert len(meshes[0].data.polygons) == len(body.data.loop_triangles)
reopened_socket = next(o for o in objects if o.name.startswith('FlameSocket') and o.type == 'EMPTY')
assert reopened_socket.parent == meshes[0]
assert reopened_socket.get('effect') == 'charizard-tail-flame'
assert reopened_socket.get('energyBaked') is False
assert (reopened_socket.location - socket.location).length < 1e-6
assert (reopened_socket.matrix_world.translation - socket.matrix_world.translation).length < 1e-6
assert reopened_socket.rotation_quaternion.rotation_difference(socket.rotation_euler.to_quaternion()).angle < 1e-6
assert meshes[0].get('energyBaked') is False
bm = bmesh.new()
bm.from_mesh(meshes[0].data)
assert sum(not e.is_manifold for e in bm.edges) == 0
bm.free()
validation = {'file': str(glb), 'meshes': len(meshes),
    'vertices': len(meshes[0].data.vertices), 'triangles': len(meshes[0].data.polygons),
    'nonmanifold_edges': 0, 'energyBaked': meshes[0]['energyBaked'],
    'objects': [o.name for o in objects], 'animations': [],
    'materialCount': len(meshes[0].data.materials), 'uvLayerCount': len(meshes[0].data.uv_layers),
    'socket': {'parentVerified': True, 'effect': reopened_socket['effect'],
               'energyBaked': reopened_socket['energyBaked'], 'local': list(reopened_socket.location),
               'world': list(reopened_socket.matrix_world.translation),
               'rotation_euler': list(reopened_socket.rotation_euler)},
    'stage': 'unapproved high-density form study; no UVs, textures, rig or clips'}
(ROOT / 'glb-reopen.json').write_text(json.dumps(validation, indent=2) + '\n')

review = bpy.data.scenes.new('REVIEW-native-r09-fixed-views')
bpy.context.window.scene = review
candidate = bpy.data.objects.new('REVIEW-candidate-r09', body.data.copy())
review.collection.objects.link(candidate)
baseline = bpy.data.objects.new('REVIEW-raw-HOME-61061', bpy.data.objects['REF-home-charizard-r07-1'].data)
review.collection.objects.link(baseline)
review.render.engine = 'BLENDER_WORKBENCH'
review.render.resolution_x = 1000
review.render.resolution_y = 1000
review.render.resolution_percentage = 100
review.render.image_settings.file_format = 'PNG'
shading = review.display.shading
shading.light = 'STUDIO'
shading.studiolight_rotate_z = .35
shading.color_type = 'SINGLE'
shading.single_color = (.64, .64, .64)
shading.show_shadows = False
shading.show_cavity = False
shading.background_type = 'WORLD'
review.world = bpy.data.worlds.new('WORLD-native-r09-neutral')
review.world.color = (.08, .08, .08)
review.view_settings.view_transform = 'Standard'
target = Vector((0, 0, -.015))
views = {'front': (0, -4, -.015), 'side': (4, 0, -.015),
         'rear': (0, 4, -.015), 'threequarter': (2.9, -4, 1.8)}
for name, location in views.items():
    data = bpy.data.cameras.new('CAM-r09-' + name)
    camera = bpy.data.objects.new(data.name, data)
    review.collection.objects.link(camera)
    camera.location = location
    camera.rotation_euler = (target - camera.location).to_track_quat('-Z', 'Y').to_euler()
    data.type = 'ORTHO'
    data.ortho_scale = 2.35
    review.camera = camera
    for label, visible, hidden in [('baseline', baseline, candidate), ('candidate', candidate, baseline)]:
        visible.hide_render = False
        hidden.hide_render = True
        review.render.filepath = str(ROOT / (label + '-' + name + '.png'))
        bpy.ops.render.render(write_still=True)
bpy.context.window.scene = edit_scene
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT / 'charizard-home-native-r09.blend'))
print(json.dumps(validation))
