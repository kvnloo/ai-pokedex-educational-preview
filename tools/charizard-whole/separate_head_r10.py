"""Mechanical component split at an inspected neck ring. No anatomical displacement."""
import bpy
import bmesh
import json
from pathlib import Path

ROOT = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r10')
ROOT.mkdir(exist_ok=True)
assert not (ROOT / 'charizard-components-r10-intake.blend').exists(), 'Intake already exists'
assert 'EDIT-charizard-components-r10' not in bpy.data.scenes, 'Component scene already exists'
old = bpy.data.scenes['EDIT-charizard-whole-home-r09']
source = old.objects['GEO-charizard-home-whole-r09']
assert source.mode == 'OBJECT' and tuple(source.users_scene) == (old,)
assert len(source.data.vertices) == 345177
bm = bmesh.new()
bm.from_mesh(source.data)
part_layer = bm.faces.layers.int.new('construction_part')
region = {v for v in bm.verts if v.co.y < -.36}
geometry = list(region)
geometry += [e for e in bm.edges if all(v in region for v in e.verts)]
geometry += [f for f in bm.faces if all(v in region for v in f.verts)]
cut = bmesh.ops.bisect_plane(bm, geom=geometry, dist=1e-7,
    plane_co=(0, 0, .1), plane_no=(0, 0, 1))['geom_cut']
ring = {e for e in cut if isinstance(e, bmesh.types.BMEdge)}
assert len(ring) == 342, ('cut ring edge count', len(ring))
ring_vertices = {v for e in ring for v in e.verts}
assert all(sum(e in ring for e in v.link_edges) == 2 for v in ring_vertices)
seed = min((f for f in bm.faces if f.calc_center_median().z > .5),
           key=lambda f: f.calc_center_median().y)
head_faces = {seed}
todo = [seed]
while todo:
    face = todo.pop()
    for edge in face.edges:
        if edge in ring:
            continue
        for other in edge.link_faces:
            if other not in head_faces:
                head_faces.add(other)
                todo.append(other)
assert 1000 < len(head_faces) < 150000, ('head flood size', len(head_faces))
for face in head_faces:
    face[part_layer] = 1
scene = bpy.data.scenes.new('EDIT-charizard-components-r10')
parts = bpy.data.collections.new('CHARIZARD-construction-components-r10')
scene.collection.children.link(parts)
stats = []
objects = {}
for part, name in [(1, 'GEO-charizard-head-neck-r10'), (0, 'GEO-charizard-body-remainder-r10')]:
    piece = bm.copy()
    layer = piece.faces.layers.int['construction_part']
    bmesh.ops.delete(piece, geom=[f for f in piece.faces if f[layer] != part], context='FACES')
    boundaries = [e for e in piece.edges if e.is_boundary]
    assert len(boundaries) == 342
    assert all(abs(v.co.z - .1) < 1e-6 for e in boundaries for v in e.verts)
    assert all(e.is_manifold or e.is_boundary for e in piece.edges)
    mesh = bpy.data.meshes.new(name.replace('GEO-', 'MESH-'))
    piece.to_mesh(mesh)
    piece.free()
    mesh.calc_loop_triangles()
    obj = bpy.data.objects.new(name, mesh)
    parts.objects.link(obj)
    obj['energyBaked'] = False
    obj['assetStage'] = 'component-construction-unapproved'
    obj['joinContract'] = 'Matching open 342-edge neck ring at Z=.1; weld during final deformation topology'
    seam = obj.vertex_groups.new(name='LOCK-neck-join')
    seam.add([v.index for v in mesh.vertices if abs(v.co.z - .1) < 1e-6], 1.0, 'REPLACE')
    objects[part] = obj
    stats.append({'name': name, 'vertices': len(mesh.vertices), 'triangles': len(mesh.loop_triangles),
        'intentionalBoundaryEdges': len(boundaries), 'otherNonManifoldEdges': 0})
bm.free()
socket = old.objects['FlameSocket'].copy()
socket.name = 'FlameSocket-r10'
parts.objects.link(socket)
socket.parent = objects[0]
assert socket['energyBaked'] is False
socket['runtimeName'] = 'FlameSocket'
scene['operatingLaw'] = 'canonical/characters/charizard/OPERATING-LAW.md'
scene['nextComponents'] = 'Separate membranes from spars, wings from torso, tail, arms/legs, eyes and hard parts'
receipt = {'source': bpy.data.filepath, 'scene': scene.name, 'parts': stats,
    'anatomicalVertexDisplacement': 0, 'cutZ': .1, 'ringEdgesPerPart': 342,
    'constructionBoundariesIntentional': True, 'productionTopologyLocked': False,
    'shapeQualityAccepted': False, 'sourcePreserved': source.name,
    'remaining': scene['nextComponents']}
(ROOT / 'head-component-split.json').write_text(json.dumps(receipt, indent=2) + '\n')
bpy.context.window.scene = scene
bpy.context.view_layer.update()
# Save via wm.save_as_mainfile in a subsequent MCP call after the scene switch.
# libraries.write(scene) crashed this Blender build; the r09 source was unchanged.
print(json.dumps(receipt))
