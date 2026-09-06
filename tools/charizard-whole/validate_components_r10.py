"""Run after reopening the named compact source in a separate MCP call. No form edits."""
import bpy
import bmesh
import json
from pathlib import Path

root = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r10')
variant = globals().get('source_variant', 'intake')
assert variant in {'intake', 'jaw-smooth-trial'}
scene = bpy.context.scene
assert Path(bpy.data.filepath) == root / ('charizard-components-r10-' + variant + '.blend')
assert scene.name == 'EDIT-charizard-components-r10' and len(bpy.data.scenes) == 1
source = {o.name: o for o in scene.objects if o.type == 'MESH'}
assert len(source) == 2 and len(bpy.data.meshes) == 2
socket = scene.objects['FlameSocket']
assert socket.parent == source['GEO-charizard-body-remainder-r10']
for obj in scene.objects:
    obj.select_set(obj.type in {'MESH', 'EMPTY'})
glb = root / ('charizard-components-r10-' + variant + '.glb')
bpy.ops.export_scene.gltf(filepath=str(glb), export_format='GLB',
    use_selection=True, use_active_scene=True, export_extras=True, export_animations=False)
validation = bpy.data.scenes.new('VALIDATION-components-r10')
bpy.context.window.scene = validation
bpy.ops.import_scene.gltf(filepath=str(glb), merge_vertices=True)
meshes = [o for o in validation.objects if o.type == 'MESH']
assert len(meshes) == 2 and len(validation.objects) == 3
stats = []
for obj in meshes:
    original = next(v for k, v in source.items() if obj.name.startswith(k))
    original.data.calc_loop_triangles()
    assert len(obj.data.vertices) == len(original.data.vertices)
    assert len(obj.data.polygons) == len(original.data.loop_triangles)
    assert (obj.dimensions - original.dimensions).length < 1e-6
    assert obj.get('energyBaked') is False
    assert not obj.data.materials and not obj.data.uv_layers
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    boundary = [e for e in bm.edges if e.is_boundary]
    assert len(boundary) == 342
    assert all(abs(v.co.z - .1) < 1e-6 for e in boundary for v in e.verts)
    assert all(e.is_manifold or e.is_boundary for e in bm.edges)
    stats.append({'name': original.name, 'vertices': len(obj.data.vertices),
        'triangles': len(obj.data.polygons), 'intentionalBoundaryEdges': len(boundary),
        'otherNonManifoldEdges': 0})
    bm.free()
tip = next(o for o in validation.objects if o.type == 'EMPTY')
assert tip.name.startswith('FlameSocket')
assert tip.parent.name.startswith('GEO-charizard-body-remainder-r10')
assert tip.get('effect') == 'charizard-tail-flame' and tip.get('energyBaked') is False
assert (tip.matrix_world.translation - socket.matrix_world.translation).length < 1e-6
assert tip.matrix_local.to_quaternion().rotation_difference(socket.matrix_local.to_quaternion()).angle < 1e-6
report = {'sourceReopened': bpy.data.filepath, 'sourceBytes': Path(bpy.data.filepath).stat().st_size,
    'glbReopened': str(glb), 'parts': stats, 'meshCount': 2, 'socketVerified': True,
    'materialCount': 0, 'uvLayerCount': 0, 'animations': [],
    'topologyStatus': 'Intentional matching open neck rings; not final deformation topology',
    'visualAcceptance': False, 'publication': False}
(root / ('component-reopen.json' if variant == 'intake' else variant + '-reopen.json')).write_text(json.dumps(report, indent=2) + '\n')
bpy.context.window.scene = scene
for imported in list(validation.objects):
    mesh = imported.data if imported.type == 'MESH' else None
    bpy.data.objects.remove(imported, do_unlink=True)
    if mesh and mesh.users == 0:
        bpy.data.meshes.remove(mesh)
bpy.data.scenes.remove(validation)
for obj in scene.objects:
    obj.select_set(obj.name == 'GEO-charizard-head-neck-r10')
bpy.context.view_layer.objects.active = scene.objects['GEO-charizard-head-neck-r10']
print(json.dumps(report))
