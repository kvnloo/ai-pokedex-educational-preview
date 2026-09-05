"""Replace the independently confirmed crossing strip with a bounded face patch."""
import bpy
import bmesh
import json
import numpy as np
from pathlib import Path

out = Path(globals().get('strip_directory', '/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r02/r02e'))
assert not out.exists()
assert 'EDIT-charizard-tail-r02e' not in bpy.data.scenes
out.mkdir()
parent = bpy.data.scenes['EDIT-charizard-tail-r02d']
bpy.context.window.scene = parent
bpy.context.view_layer.update()
scene = bpy.data.scenes.new('EDIT-charizard-tail-r02e')
for obj in parent.objects:
    if obj.type == 'MESH':
        copy = obj.copy()
        copy.data = obj.data.copy()
        copy.parent = None
        copy.matrix_world = obj.matrix_world.copy()
        copy.name = 'GEO-charizard-body-tail-r02e' if len(copy.data.vertices) > 10000 else 'GEO-charizard-flame-reference-r02e'
        scene.collection.objects.link(copy)
bpy.context.window.scene = scene
obj = bpy.data.objects['GEO-charizard-body-tail-r02e']
before = np.asarray([v.co[:] for v in obj.data.vertices], dtype=np.float32)
bm = bmesh.new()
bm.from_mesh(obj.data)
bm.verts.ensure_lookup_table()
bm.faces.ensure_lookup_table()
vertex_ids = bm.verts.layers.int.new('r02d_vertex_id')
face_ids = bm.faces.layers.int.new('r02d_face_id')
for vertex in bm.verts:
    vertex[vertex_ids] = vertex.index
for face in bm.faces:
    face[face_ids] = face.index
lo, hi = np.asarray([-.511, .143, -.481]), np.asarray([-.478, .258, -.461])
mask = ((before > lo) & (before < hi)).all(axis=1)
details = json.loads(Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r02/audit-root-surface/r02d-intersection-details.json').read_text())
crossing_ids = {index for pair in details['pairs'] for triangle in pair['stableTrianglePair'] for index in triangle}
assert all(mask[index] for index in crossing_ids), 'The full diagnosed crossing must lie inside the patch'
selected = [vertex for vertex in bm.verts if mask[vertex.index]]
assert 18 <= len(selected) < 200
removed_face_ids = sorted({face.index for vertex in selected for face in vertex.link_faces})
bmesh.ops.delete(bm, geom=selected, context='VERTS')
boundary = [edge for edge in bm.edges if edge.is_boundary]
assert boundary and all(sum(edge.is_boundary for edge in vertex.link_edges) == 2 for edge in boundary for vertex in edge.verts)
fill = bmesh.ops.holes_fill(bm, edges=boundary, sides=0)['faces']
assert len(fill) == 1, 'The selected region must form one disk patch'
boundary_count = len(fill[0].verts)
for face in fill:
    face[face_ids] = -1
new_faces = bmesh.ops.triangulate(bm, faces=fill, quad_method='BEAUTY', ngon_method='BEAUTY')['faces']
for face in new_faces:
    face[face_ids] = -1
    face.smooth = True
bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
assert all(len(edge.link_faces) == 2 for edge in bm.edges)
bm.verts.index_update()
bm.faces.index_update()
parent_vertex_ids = np.asarray([vertex[vertex_ids] for vertex in bm.verts], dtype=np.int32)
parent_face_ids = np.asarray([face[face_ids] for face in bm.faces], dtype=np.int32)
after = np.asarray([vertex.co[:] for vertex in bm.verts], dtype=np.float32)
assert np.array_equal(after, before[parent_vertex_ids]), 'Repair changes connectivity only'
np.savez_compressed(out / 'topology-audit.npz', before=before, after=after, parent_vertex_ids=parent_vertex_ids, parent_face_ids=parent_face_ids, removed_parent_vertices=np.flatnonzero(mask), removed_parent_faces=np.asarray(removed_face_ids))
report = {'parent': 'charizard-tail-r02d', 'candidate': 'charizard-tail-r02e', 'method': 'Delete confirmed crossing strip; fill its unchanged boundary and triangulate with Beauty', 'bounds': [lo.tolist(), hi.tolist()], 'confirmedCrossingVerticesCovered': len(crossing_ids), 'removedVertices': int(mask.sum()), 'removedFaces': len(removed_face_ids), 'newTriangles': len(new_faces), 'boundaryVertices': boundary_count, 'remainingCoordinatesExact': True, 'vertices': len(bm.verts), 'polygons': len(bm.faces), 'status': 'awaiting independent export and visual checks'}
bm.to_mesh(obj.data)
bm.free()
obj.data.update()
(out / 'topology-receipt.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report))
