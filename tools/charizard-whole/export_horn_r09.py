"""Open the named source in a prior MCP call, then run this export/reopen audit."""
import bpy
import bmesh
import json
from pathlib import Path

root = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r09')
source = root / 'charizard-home-native-r09-horn-isolated.blend'
assert Path(bpy.data.filepath) == source
edit = bpy.context.scene
assert edit.name == 'EDIT-charizard-whole-home-r09'
body = edit.objects['GEO-charizard-home-whole-r09']
socket = edit.objects['FlameSocket']
assert body.mode == 'OBJECT' and body.data.users == 1
assert tuple(body.users_scene) == (edit,)
assert not any(v.hide for v in body.data.vertices)
body.data.calc_loop_triangles()
for obj in bpy.context.view_layer.objects:
    obj.select_set(False)
body.select_set(True)
socket.select_set(True)
bpy.context.view_layer.objects.active = body
glb = root / 'charizard-home-native-r09-horn-isolated.glb'
bpy.ops.export_scene.gltf(filepath=str(glb), export_format='GLB',
    use_selection=True, use_active_scene=True, export_extras=True, export_animations=False)
reopen = bpy.data.scenes.new('VALIDATION-horn-isolated-r09')
bpy.context.window.scene = reopen
bpy.ops.import_scene.gltf(filepath=str(glb), merge_vertices=True)
meshes = [o for o in reopen.objects if o.type == 'MESH']
assert len(meshes) == 1 and len(reopen.objects) == 2
mesh = meshes[0]
tip = next(o for o in reopen.objects if o.type == 'EMPTY')
assert len(mesh.data.vertices) == len(body.data.vertices)
assert len(mesh.data.polygons) == len(body.data.loop_triangles)
assert (mesh.dimensions - body.dimensions).length < 1e-6
assert tip.parent == mesh and tip['effect'] == 'charizard-tail-flame'
assert tip['energyBaked'] is False and mesh['energyBaked'] is False
assert (tip.location - socket.location).length < 1e-6
assert (tip.matrix_world.translation - socket.matrix_world.translation).length < 1e-6
assert tip.matrix_local.to_quaternion().rotation_difference(socket.matrix_local.to_quaternion()).angle < 1e-6
bm = bmesh.new()
bm.from_mesh(mesh.data)
nonmanifold = sum(not e.is_manifold for e in bm.edges)
bm.free()
assert nonmanifold == 0
assert not mesh.data.materials and not mesh.data.uv_layers
receipt = {'sourceReopened': str(source), 'glbReopened': str(glb),
    'vertices': len(mesh.data.vertices), 'triangles': len(mesh.data.polygons),
    'meshes': 1, 'objects': 2, 'nonManifoldEdges': nonmanifold,
    'materialCount': 0, 'uvLayerCount': 0, 'animations': [],
    'dimensions': list(mesh.dimensions), 'energyBaked': False,
    'socket': {'parentVerified': True, 'effect': tip['effect'],
        'position': list(tip.location), 'rotation': list(tip.rotation_euler)},
    'stage': 'retained local form study; likeness and runtime readiness unapproved'}
(root / 'horn-isolated-reopen.json').write_text(json.dumps(receipt, indent=2) + '\n')
bpy.context.window.scene = edit
print(json.dumps(receipt))
