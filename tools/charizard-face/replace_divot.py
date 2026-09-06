"""Replace the inspected high-valence skull patch while keeping its boundary fixed."""
import bpy
import bmesh
import json
import numpy as np
from pathlib import Path

root=Path(globals().get('face_root','/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r04'))
revision=globals().get('divot_revision','r14')
simple_interpolation=bool(globals().get('grid_simple',True))
out=root/('head-'+revision)
assert not out.exists()
source=bpy.data.objects['GEO-charizard-body-head-r07']
data=np.load(root/'divot-selection-r01/selection.npz')
before=np.asarray([vertex.co[:] for vertex in source.data.vertices],dtype=np.float32)
assert np.array_equal(before,data['before'])
bm=bmesh.new();bm.from_mesh(source.data)
bm.verts.ensure_lookup_table();bm.faces.ensure_lookup_table()
zero_vertex=bm.verts[0]
vertex_ids=bm.verts.layers.int.new('head_r07_vertex_id')
face_ids=bm.faces.layers.int.new('head_r07_face_id')
for vertex in bm.verts: vertex[vertex_ids]=vertex.index
for face in bm.faces: face[face_ids]=face.index
r06_ids=np.load(root/'head-r07/sliver-audit.npz')['parent_vertex_ids']
patch_triangles={tuple(sorted(map(int,row))) for row in np.load(root/'divot-selection-r01/r06-patch-triangles.npy')}
patch_faces=[face for face in bm.faces if len(face.verts)==3 and tuple(sorted(int(r06_ids[vertex[vertex_ids]]) for vertex in face.verts)) in patch_triangles]
assert len(patch_faces)==2704
removed_faces=sorted(face[face_ids] for face in patch_faces)
bmesh.ops.delete(bm,geom=patch_faces,context='FACES_ONLY')
wire_edges=[edge for edge in bm.edges if not edge.link_faces]
if wire_edges: bmesh.ops.delete(bm,geom=wire_edges,context='EDGES')
loose_vertices=[vertex for vertex in bm.verts if not vertex.link_edges]
if loose_vertices: bmesh.ops.delete(bm,geom=loose_vertices,context='VERTS')
assert set(range(len(before)))-{vertex[vertex_ids] for vertex in bm.verts}==set(data['interior'])
edges=[edge for edge in bm.edges if edge.is_boundary]
assert len(edges)==72
assert {vertex[vertex_ids] for edge in edges for vertex in edge.verts}==set(data['boundary'])
scene=bpy.data.scenes.new('EDIT-charizard-head-'+revision)
for original in bpy.data.scenes['EDIT-charizard-head-r07'].objects:
    if original.type=='MESH':
        obj=original.copy();obj.data=original.data.copy();obj.parent=None;obj.matrix_world=original.matrix_world.copy();obj.name=original.name.replace('r07',revision);scene.collection.objects.link(obj)
body=bpy.data.objects['GEO-charizard-body-head-'+revision]
bm.to_mesh(body.data);bm.free();body.data.update();bpy.context.window.scene=scene
for obj in scene.objects: obj.select_set(obj==body)
bpy.context.view_layer.objects.active=body
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.select_all(action='DESELECT')
bm=bmesh.from_edit_mesh(body.data)
for edge in bm.edges: edge.select_set(edge.is_boundary)
bmesh.update_edit_mesh(body.data)
old_vertices=set(bm.verts);old_faces=set(bm.faces)
assert len(old_vertices)==len(before)-len(data['interior'])
bpy.ops.mesh.fill_grid(span=18,offset=0,use_interp_simple=simple_interpolation)
bm=bmesh.from_edit_mesh(body.data)
assert len(old_vertices.intersection(bm.verts))==len(old_vertices)
assert len(old_faces.intersection(bm.faces))==len(old_faces)
new_vertices=set(bm.verts)-old_vertices
faces=set(bm.faces)-old_faces
assert len(new_vertices)==289 and len(faces)==324
for vertex in new_vertices:
    for name,layer in bm.verts.layers.int.items():
        if name.endswith('_vertex_id'): vertex[layer]=-1
for face in faces:
    face.smooth=True
    for name,layer in bm.faces.layers.int.items():
        if name.endswith('_face_id'): face[layer]=-1
assert all(len(edge.link_faces)==2 for edge in bm.edges)
patch_face_count=len(faces);new_vertex_count=len(new_vertices)
bmesh.update_edit_mesh(body.data)
bpy.ops.object.mode_set(mode='OBJECT')
after=np.asarray([vertex.co[:] for vertex in body.data.vertices],dtype=np.float32)
ids=np.asarray([row.value for row in body.data.attributes['head_r07_vertex_id'].data])
retained=ids>=0
assert np.array_equal(after[retained],before[ids[retained]])
protected=np.zeros(len(after),dtype=bool);protected[retained]=data['protected'][ids[retained]]
assert protected.sum()==113062
out.mkdir(parents=True)
np.savez_compressed(out/'divot-audit.npz',before=before,after=after,parent_vertex_ids=ids,protected=protected,removed_parent_vertices=data['interior'],removed_parent_faces=removed_faces,boundary_parent_vertices=data['boundary'])
(out/'divot-receipt.json').write_text(json.dumps({'parent':'charizard-head-r07','candidate':'charizard-head-'+revision,'method':'Blender grid fill of the visually inspected 72-edge skull patch boundary','simpleInterpolation':simple_interpolation,'removedVertices':len(data['interior']),'newVertices':new_vertex_count,'newNativeFaces':patch_face_count,'boundaryVertices':72,'retainedVerticesExact':int(retained.sum()),'protectedVerticesExact':int(protected.sum()),'status':'awaiting rendered/exported validation'},indent=2)+'\n')
print(json.dumps({'candidate':'charizard-head-'+revision,'newFaces':patch_face_count,'newVertices':new_vertex_count,'bodyVertices':len(after)}))
