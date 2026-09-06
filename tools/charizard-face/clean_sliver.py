"""Collapse the measured interior sliver cluster in a distinct Blender scene."""
import bpy
import bmesh
import hashlib
import json
import numpy as np
from pathlib import Path

root = Path(globals().get('face_root', '/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r04'))
out = root / 'head-r07'
assert not out.exists()
parent_path = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r03/head-r06/charizard-head-r06.blend')
assert hashlib.sha256(parent_path.read_bytes()).hexdigest() == 'c13a6d73a602d760804a5bb311ed6450c6bb069a7031788cfaa9b5465fe79dc8'
source = bpy.data.objects['GEO-charizard-body-head-r06']
before = np.asarray([v.co[:] for v in source.data.vertices], dtype=np.float32)
audit = np.load(parent_path.parent / 'horn-audit.npz')
assert np.array_equal(before, audit['after'])
selected = [62088, 62094, 62898]
assert not audit['protected'][selected].any()
assert np.linalg.norm(before[selected] - before[selected[0]], axis=1).max() < .000004
bm = bmesh.new()
bm.from_mesh(source.data)
bm.verts.ensure_lookup_table()
bm.faces.ensure_lookup_table()
vertex_ids = bm.verts.layers.int.new('head_r06_vertex_id')
face_ids = bm.faces.layers.int.new('head_r06_face_id')
for v in bm.verts:
    v[vertex_ids] = v.index
for f in bm.faces:
    f[face_ids] = f.index
destination = bm.verts[selected[0]]
bmesh.ops.weld_verts(bm, targetmap={bm.verts[index]: destination for index in selected[1:]})
assert all(len(edge.link_faces) == 2 for edge in bm.edges)
scene = bpy.data.scenes.new('EDIT-charizard-head-r07')
for original in bpy.data.scenes['EDIT-charizard-head-r06'].objects:
    if original.type == 'MESH':
        obj = original.copy()
        obj.data = original.data.copy()
        obj.parent = None
        obj.matrix_world = original.matrix_world.copy()
        obj.name = original.name.replace('r06', 'r07')
        scene.collection.objects.link(obj)
body = bpy.data.objects['GEO-charizard-body-head-r07']
bm.to_mesh(body.data)
bm.free()
body.data.update()
bpy.context.window.scene = scene
after = np.asarray([v.co[:] for v in body.data.vertices], dtype=np.float32)
ids = np.asarray([v.value for v in body.data.attributes['head_r06_vertex_id'].data])
assert len(after) == len(before) - 2
assert np.array_equal(after, before[ids])
protected = audit['protected'][ids]
assert protected.sum() == 113062
out.mkdir(parents=True)
np.savez_compressed(out / 'sliver-audit.npz', before=before, after=after, parent_vertex_ids=ids, protected=protected, removed_parent_vertices=np.asarray(selected[1:]))
(out / 'sliver-receipt.json').write_text(json.dumps({'parent': 'charizard-head-r06', 'candidate': 'charizard-head-r07', 'method': 'Weld two interior near-coincident vertices onto existing row62088; all retained coordinates unchanged', 'selectedParentRows': selected, 'destinationParentRow': selected[0], 'removedVertices': 2, 'retainedVerticesExact': len(after), 'protectedVerticesExact': int(protected.sum()), 'status': 'awaiting export and independent validation'}, indent=2) + '\n')
print(json.dumps({'candidate': 'charizard-head-r07', 'vertices': len(after), 'allRetainedCoordinatesExact': True}))
